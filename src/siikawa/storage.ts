import Dexie, { type EntityTable } from 'dexie';
import { z } from 'zod';
import { APP_NAME } from '../core/branding';
import { defaultRoom, freeRoomItemIds, getRoomItem, roomSlot } from '../core/room-catalog';
import { decks, getDeck } from './decks';
import { answerXp, buildLesson, buildPractice, buildReview, gradeStep, lessonCount, lessonPotentialXp, localDay, retestSteps, scheduleReview } from './engine';
import type { Attempt, Purchase, ReviewState, Reward, Session, Settings, Snapshot, Step } from './model';

export class SiikawaDatabase extends Dexie {
  sessions!: EntityTable<Session, 'id'>;
  attempts!: EntityTable<Attempt, 'id'>;
  reviews!: EntityTable<ReviewState, 'principleId'>;
  rewards!: EntityTable<Reward, 'id'>;
  purchases!: EntityTable<Purchase, 'id'>;
  settings!: EntityTable<Settings, 'id'>;
  constructor(name = 'siikawa-local-v1') {
    super(name);
    this.version(1).stores({ sessions: 'id,deckId,status,kind', attempts: 'id,sessionId,principleId,variantId', reviews: 'principleId,dueDay', rewards: 'id,sessionId', purchases: 'id,&itemId', settings: 'id' });
  }
}
export const database = new SiikawaDatabase();
function defaults(): Settings {
  return { id: 'preferences', deckId: decks.find((deck) => deck.principles[0]?.subject === '수학')?.id ?? decks[0]?.id ?? '', theme: 'forest', avatarId: 'lumi', room: { ...defaultRoom } };
}
export async function loadSnapshot(db = database): Promise<Snapshot> {
  return db.transaction('r', db.tables, async () => {
    const [sessions, attempts, reviews, rewards, purchases, settings] = await Promise.all([db.sessions.toArray(), db.attempts.toArray(), db.reviews.toArray(), db.rewards.toArray(), db.purchases.toArray(), db.settings.get('preferences')]);
    const earnedXp = rewards.reduce((sum, item) => sum + item.xp, 0);
    return { sessions, attempts, reviews, rewards, purchases, settings: settings ?? defaults(), earnedXp, balance: earnedXp - purchases.reduce((sum, item) => sum + item.price, 0), ownedItemIds: [...freeRoomItemIds, ...purchases.map((item) => item.itemId)] };
  });
}
export async function startLesson(deckId: string, lessonIndex?: number, db = database): Promise<Session> {
  const deck = getDeck(deckId);
  return db.transaction('rw', db.sessions, db.attempts, db.reviews, async () => {
    const sessions = await db.sessions.toArray();
    const active = sessions.find((item) => item.deckId === deckId && item.kind === 'lesson' && item.status === 'in_progress');
    if (active) {
      // Earlier builds mixed other decks into memory and short-lesson fillers.
      // Replace only pending foreign questions; graded steps and receipts stay intact.
      const ownIds = new Set(deck.principles.map((principle) => principle.id));
      const foreignIds = new Set(active.steps.filter((step, index) =>
        index >= active.index && index < active.baseCount &&
        (step.phase === 'memory' || step.phase === 'explore') &&
        step.principleIds.some((id) => !ownIds.has(id)),
      ).map((step) => step.id));
      if (!foreignIds.size) return active;
      const [attempts, reviews] = await Promise.all([db.attempts.toArray(), db.reviews.toArray()]);
      const answeredIds = new Set(attempts.filter((attempt) => attempt.sessionId === active.id).map((attempt) => attempt.stepId));
      for (const id of answeredIds) foreignIds.delete(id);
      if (!foreignIds.size) return active;
      const replacements = buildLesson(deck, active.lessonIndex, decks, attempts, reviews);
      const resumed = {
        ...active,
        steps: active.steps.map((step, index) => foreignIds.has(step.id) ? replacements[index] : step),
        updatedAt: new Date().toISOString(),
      };
      await db.sessions.put(resumed);
      return resumed;
    }
    const completed = new Set(sessions.filter((item) => item.deckId === deckId && item.kind === 'lesson' && item.status === 'completed').map((item) => item.lessonIndex));
    const index = lessonIndex ?? Array.from({ length: lessonCount(deck) }, (_, index) => index).find((index) => !completed.has(index));
    if (index === undefined) throw new Error('이 원리장의 모든 회차를 완주했어요. 복습함에서 계속 연습할 수 있어요.');
    const previous = sessions.find((item) => item.deckId === deckId && item.kind === 'lesson' && item.lessonIndex === index);
    if (previous) return previous;
    if (index > 0 && !completed.has(index - 1)) throw new Error('앞 회차부터 차례로 탐험해 주세요.');
    const [attempts, reviews] = await Promise.all([db.attempts.toArray(), db.reviews.toArray()]);
    const now = new Date().toISOString();
    const session: Session = { id: `lesson:${deckId}:${index}`, deckId, deckVersion: deck.version, kind: 'lesson', lessonIndex: index, steps: buildLesson(deck, index, decks, attempts, reviews), index: 0, baseCount: 20, status: 'in_progress', retestFrozen: false, xp: 0, createdAt: now, updatedAt: now };
    await db.sessions.add(session);
    return session;
  });
}
export async function startReview(deckId: string, db = database): Promise<Session> {
  const deck = getDeck(deckId);
  return db.transaction('rw', db.sessions, db.attempts, db.reviews, async () => {
    const sessions = await db.sessions.toArray();
    const active = sessions.find((item) => item.kind === 'review' && item.status === 'in_progress');
    if (active) return active;
    const [attempts, reviews] = await Promise.all([db.attempts.toArray(), db.reviews.toArray()]);
    const todayLessons = sessions.filter((item) => item.kind === 'lesson' && item.deckId === deckId && localDay(new Date(item.completedAt ?? item.createdAt)) === localDay()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const basis = todayLessons[0]?.steps ?? buildLesson(deck, 0, decks, attempts, reviews);
    const now = new Date().toISOString();
    const session: Session = { id: `review:${crypto.randomUUID()}`, deckId, deckVersion: deck.version, kind: 'review', lessonIndex: 0, steps: buildReview(deckId, decks, attempts, reviews), index: 0, baseCount: 10, status: 'in_progress', retestFrozen: true, xp: 0, reviewMaxXp: Math.floor(lessonPotentialXp(basis) * 0.3), createdAt: now, updatedAt: now };
    await db.sessions.add(session);
    return session;
  });
}
/** Explicitly chosen explanation + application practice; it never pays XP. */
export async function startPractice(principleId: string, db = database): Promise<Session> {
  const deck = decks.find((item) => item.principles.some((principle) => principle.id === principleId));
  const principle = deck?.principles.find((item) => item.id === principleId && !item.retired);
  if (!deck || !principle) throw new Error('연습할 원리를 찾을 수 없어요.');
  return db.transaction('rw', db.sessions, db.attempts, async () => {
    const sessions = await db.sessions.toArray();
    const active = sessions.find((item) => item.kind === 'practice' && item.status === 'in_progress' && item.steps[0]?.principleId === principleId);
    if (active) return active;
    const now = new Date().toISOString();
    const session: Session = { id: `practice:${crypto.randomUUID()}`, deckId: deck.id, deckVersion: deck.version, kind: 'practice', lessonIndex: 0, steps: buildPractice(principle, deck, await db.attempts.toArray()), index: 0, baseCount: 2, status: 'in_progress', retestFrozen: true, xp: 0, createdAt: now, updatedAt: now };
    await db.sessions.add(session);
    return session;
  });
}
export async function submitAnswer(sessionId: string, answer: string | number[], usedHint = false, db = database): Promise<Attempt> {
  return db.transaction('rw', db.sessions, db.attempts, db.reviews, db.rewards, async () => {
    const session = await db.sessions.get(sessionId);
    if (!session || session.status !== 'in_progress') throw new Error('진행 중인 학습을 먼저 열어 주세요.');
    const step = session.steps[session.index];
    const attemptId = `${session.id}:${step.id}`;
    const existing = await db.attempts.get(attemptId);
    if (existing) return existing;
    if (step.mode === 'explain') {
      if (!Array.isArray(answer) || answer.some((index) => !Number.isInteger(index) || index < 0 || index >= 4) || new Set(answer).size !== answer.length) throw new Error('설명한 요소를 다시 확인해 주세요.');
    } else if (typeof answer !== 'string' || !answer.trim() || answer.length > 500 || (step.mode !== 'recall' && !/^[0-3]$/.test(answer))) throw new Error('답을 고르거나 개념어를 입력해 주세요.');
    const previousStates = await Promise.all(step.principleIds.map((principleId) => db.reviews.get(principleId)));
    // Distinct answers can land in the same millisecond. Give each principle a
    // strictly ordered event time so later explanation/mission evidence is not lost.
    const now = new Date(Math.max(Date.now(), ...previousStates.map((state) => state?.lastAttemptAt ? Date.parse(state.lastAttemptAt) + 1 : 0))).toISOString();
    const attempt: Attempt = { id: attemptId, sessionId: session.id, stepId: step.id, principleId: step.principleId, principleIds: [...step.principleIds], variantId: step.variantId, mode: step.mode, phase: step.phase, answer: Array.isArray(answer) ? JSON.stringify(answer) : answer, ...(Array.isArray(answer) ? { checkedIndices: [...answer] } : {}), correct: gradeStep(step, answer), usedHint: usedHint || !!step.alwaysHinted, firstTry: step.phase !== 'retest', createdAt: now, localDay: localDay() };
    await db.attempts.add(attempt);
    for (const [index, principleId] of step.principleIds.entries()) {
      await db.reviews.put(scheduleReview(previousStates[index], attempt, principleId));
    }
    const xp = session.kind === 'lesson' ? answerXp(step, attempt.correct) : 0;
    if (xp) {
      await db.rewards.add({ id: attempt.id, sessionId, stepId: step.id, xp, kind: 'answer', createdAt: now });
      session.xp += xp;
    }
    session.updatedAt = now;
    await db.sessions.put(session);
    return attempt;
  });
}
export async function advanceSession(sessionId: string, db = database): Promise<Session> {
  return db.transaction('rw', db.sessions, db.attempts, db.rewards, async () => {
    const session = await db.sessions.get(sessionId);
    if (!session) throw new Error('학습 기록을 찾을 수 없어요.');
    if (session.status === 'completed') return session;
    const step = session.steps[session.index];
    if (!await db.attempts.get(`${session.id}:${step.id}`)) return session;
    const attempts = await db.attempts.where('sessionId').equals(session.id).toArray();
    session.index += 1;
    const now = new Date().toISOString();
    if (session.kind === 'lesson' && session.index === session.baseCount && !session.retestFrozen) {
      session.steps.push(...retestSteps(session, attempts, decks));
      session.retestFrozen = true;
    }
    if (session.index >= session.steps.length) {
      session.status = 'completed'; session.completedAt = now;
      const xp = session.kind === 'practice' ? 0 : session.kind === 'review' ? Math.floor((session.reviewMaxXp ?? 0) * attempts.filter((item) => item.correct && item.firstTry).length / 10) : 30;
      if (xp) { await db.rewards.put({ id: `${session.id}:complete`, sessionId: session.id, xp, kind: session.kind === 'review' ? 'review' : 'completion', createdAt: now }); session.xp += xp; }
    }
    session.updatedAt = now;
    await db.sessions.put(session);
    return session;
  });
}
const roomSchema = z.strictObject({ backgroundId: z.string().min(1), outfitId: z.string().min(1), accessoryId: z.string().min(1) });
const settingsSchema = z.strictObject({ id: z.literal('preferences'), deckId: z.string().min(1), theme: z.enum(['forest', 'night']), avatarId: z.enum(['lumi', 'momo', 'nova']), room: roomSchema });
export async function saveSettings(patch: Partial<Settings>, db = database): Promise<Settings> {
  return db.transaction('rw', db.settings, db.purchases, async () => {
    const next = settingsSchema.parse({ ...(await db.settings.get('preferences') ?? defaults()), ...patch, id: 'preferences' });
    getDeck(next.deckId);
    const owned = new Set([...freeRoomItemIds, ...(await db.purchases.toArray()).map((item) => item.itemId)]);
    for (const [slot, id] of Object.entries(next.room)) {
      const item = getRoomItem(id);
      if (!item || roomSlot(item.category) !== slot || !owned.has(id)) throw new Error('보유한 꾸미기만 장착할 수 있어요.');
    }
    await db.settings.put(next);
    return next;
  });
}
export async function purchaseRoomItem(id: string, db = database): Promise<Purchase | undefined> {
  const item = getRoomItem(id);
  if (!item) throw new Error('꾸미기를 찾을 수 없어요.');
  return db.transaction('rw', db.rewards, db.purchases, db.settings, async () => {
    let purchase = await db.purchases.get(id);
    if (!purchase && item.price > 0) {
      const earned = (await db.rewards.toArray()).reduce((sum, reward) => sum + reward.xp, 0);
      const spent = (await db.purchases.toArray()).reduce((sum, receipt) => sum + receipt.price, 0);
      if (earned - spent < item.price) throw new Error('아직 XP가 모자라요. 원리를 탐험하고 다시 만나세요.');
      purchase = { id, itemId: id, price: item.price, createdAt: new Date().toISOString() };
      await db.purchases.add(purchase);
    }
    const settings = await db.settings.get('preferences') ?? defaults();
    settings.room = { ...settings.room, [roomSlot(item.category)]: id };
    await db.settings.put(settings);
    return purchase;
  });
}

const instant = z.iso.datetime();
const day = z.iso.date();
const positiveId = z.string().min(1).max(300);
const mode = z.enum(['choice', 'recall', 'explain', 'mission']);
const phase = z.enum(['memory', 'explore', 'explain', 'mission', 'retest', 'review']);
const stepSchema = z.strictObject({ id: positiveId, principleId: positiveId, principleIds: z.array(positiveId).min(1).max(20), variantId: positiveId.optional(), phase, mode, name: z.string().min(1), subject: z.string().min(1), prompt: z.string().min(1), choices: z.array(z.string()).length(4).optional(), correctIndex: z.number().int().min(0).max(3).optional(), explanation: z.string().min(1), acceptedAnswers: z.array(z.string()).min(1).optional(), hint: z.string().optional(), alwaysHinted: z.boolean().optional(), rubric: z.array(z.string()).length(4).optional(), passCount: z.number().int().min(1).max(4).optional(), followUp: z.string().optional(), passage: z.string().optional(), evidenceQuote: z.string().optional(), source: z.string().min(1), retestOf: positiveId.optional() });
const sessionSchema = z.strictObject({ id: positiveId, deckId: positiveId, deckVersion: z.string().min(1), kind: z.enum(['lesson', 'review', 'practice']), lessonIndex: z.number().int().min(0), steps: z.array(stepSchema).min(2).max(32), index: z.number().int().min(0).max(32), baseCount: z.union([z.literal(2), z.literal(10), z.literal(20)]), status: z.enum(['in_progress', 'completed']), retestFrozen: z.boolean(), xp: z.number().int().min(0).max(1000), createdAt: instant, updatedAt: instant, completedAt: instant.optional(), reviewMaxXp: z.number().int().min(0).max(78).optional() });
const attemptSchema = z.strictObject({ id: positiveId, sessionId: positiveId, stepId: positiveId, principleId: positiveId, principleIds: z.array(positiveId).min(1).max(20), variantId: positiveId.optional(), mode, phase, answer: z.string().max(500), checkedIndices: z.array(z.number().int().min(0).max(3)).max(4).optional(), correct: z.boolean(), usedHint: z.boolean(), firstTry: z.boolean(), createdAt: instant, localDay: day });
const reviewSchema = z.strictObject({ principleId: positiveId, stage: z.number().int().min(0).max(5), dueDay: day, correctDays: z.array(day), activeDays: z.array(day), missionDays: z.array(day), firstLearnedDay: day, lastSuccessDay: day.optional(), lastAttemptAt: instant.optional(), delayedSuccess: z.boolean(), mastered: z.boolean(), wrongCount: z.number().int().min(0) });
const rewardSchema = z.strictObject({ id: positiveId, sessionId: positiveId, stepId: positiveId.optional(), xp: z.number().int().min(1).max(78), kind: z.enum(['answer', 'completion', 'review']), createdAt: instant });
const purchaseSchema = z.strictObject({ id: positiveId, itemId: positiveId, price: z.number().int().positive(), createdAt: instant });
// All schema-1 app names pass the same backup validation.
const backupSchema = z.strictObject({ app: z.enum([APP_NAME, '시이싸이', 'Siikawa']), schemaVersion: z.literal(1), exportedAt: instant, settings: settingsSchema, sessions: z.array(sessionSchema).max(100000), attempts: z.array(attemptSchema).max(1000000), reviews: z.array(reviewSchema).max(100000), rewards: z.array(rewardSchema).max(1000000), purchases: z.array(purchaseSchema).max(10000) });
export async function exportBackup(db = database): Promise<string> {
  const { settings, sessions, attempts, reviews, rewards, purchases } = await loadSnapshot(db);
  return JSON.stringify({ app: APP_NAME, schemaVersion: 1, exportedAt: new Date().toISOString(), settings, sessions, attempts, reviews, rewards, purchases }, null, 2);
}
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
  return value;
}
const same = (a: unknown, b: unknown) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
function verifyStep(step: Step, kind: Session['kind']): void {
  const principle = decks.flatMap((deck) => deck.principles).find((item) => item.id === step.principleId);
  if (!principle) throw new Error('백업에 알 수 없는 원리가 있어요.');
  if (step.mode === 'choice' || step.mode === 'mission') {
    const mission = decks.flatMap((deck) => deck.missions).find((item) => item.question.id === step.variantId);
    const practiceVariant = kind === 'practice' && step.mode === 'mission' && !mission ? principle.variants.find((item) => item.id === step.variantId) : undefined;
    const variant = step.mode === 'mission' ? mission?.question ?? practiceVariant : principle.variants.find((item) => item.id === step.variantId);
    if (!variant || variant.correctIndex !== step.correctIndex || !same(variant.choices, step.choices)) throw new Error('백업 문항의 정답 정보가 맞지 않아요.');
    if (step.mode === 'mission') {
      const expectedIds = mission?.principleIds ?? [principle.id];
      const expectedPassage = mission?.passage ?? `탐구 노트\n${principle.summary}`;
      const expectedEvidence = mission?.question.evidenceQuote ?? principle.summary;
      if (!same(expectedIds, step.principleIds) || step.passage !== expectedPassage || step.evidenceQuote !== expectedEvidence || !step.passage.includes(step.evidenceQuote)) throw new Error('백업 미션의 원리와 근거가 맞지 않아요.');
    }
  } else if (step.mode === 'recall') {
    if (!same(step.acceptedAnswers, principle.conceptAnswers) || step.alwaysHinted !== (step.phase === 'review') || step.hint !== principle.hint) throw new Error('백업 개념어 정보가 맞지 않아요.');
  } else if (!same(step.rubric, principle.explain.rubric) || step.passCount !== principle.explain.passCount) throw new Error('백업 설명 채점 정보가 맞지 않아요.');
  if (step.mode !== 'mission' && !same(step.principleIds, [principle.id])) throw new Error('백업의 원리 연결이 맞지 않아요.');
}
/** Fully validate before opening a write transaction: an invalid file cannot erase local work. */
export function validateBackup(json: string) {
  if (json.length > 30 * 1024 * 1024) throw new Error('백업 파일이 너무 커요.');
  const backup = backupSchema.parse(JSON.parse(json));
  getDeck(backup.settings.deckId);
  const unique = (items: { id: string }[]) => { if (new Set(items.map((item) => item.id)).size !== items.length) throw new Error('백업에 중복된 기록이 있어요.'); };
  [backup.sessions, backup.attempts, backup.rewards, backup.purchases].forEach(unique);
  if (new Set(backup.reviews.map((item) => item.principleId)).size !== backup.reviews.length) throw new Error('백업에 중복된 복습 기록이 있어요.');
  const lessonKeys = backup.sessions.filter((item) => item.kind === 'lesson').map((item) => `${item.deckId}:${item.lessonIndex}`);
  if (new Set(lessonKeys).size !== lessonKeys.length) throw new Error('같은 회차가 중복되어 있어요.');
  for (const session of backup.sessions) {
    const deck = getDeck(session.deckId);
    if (session.kind === 'lesson' && session.lessonIndex >= lessonCount(deck)) throw new Error('백업 회차를 확인해 주세요.');
    if (session.baseCount !== (session.kind === 'lesson' ? 20 : session.kind === 'review' ? 10 : 2) || session.index > session.steps.length || (session.status === 'completed' ? session.index !== session.steps.length || !session.completedAt : session.index >= session.steps.length || !!session.completedAt)) throw new Error('백업의 학습 진행 정보가 맞지 않아요.');
    if (session.steps.length < session.baseCount || new Set(session.steps.map((step) => step.id)).size !== session.steps.length || (session.steps.length > session.baseCount && !session.retestFrozen)) throw new Error('백업의 문제 구성이 맞지 않아요.');
    if (session.kind === 'review' && (session.steps.length !== 10 || session.steps.filter((step) => step.mode === 'choice').length !== 5 || session.steps.filter((step) => step.mode === 'recall').length !== 5 || session.reviewMaxXp === undefined || !session.retestFrozen)) throw new Error('복습 테스트 구성이 맞지 않아요.');
    if (session.kind === 'lesson') {
      if (session.id !== `lesson:${session.deckId}:${session.lessonIndex}` || session.reviewMaxXp !== undefined || session.steps.slice(0, 4).some((step, index) => step.id !== `memory-${index}` || step.phase !== 'memory' || !['choice', 'recall'].includes(step.mode)) || session.steps.slice(4, 16).some((step, index) => step.id !== `explore-${index}` || step.phase !== 'explore' || step.mode !== 'choice') || session.steps.slice(16, 18).some((step, index) => step.id !== `explain-${index}` || step.phase !== 'explain' || step.mode !== 'explain') || session.steps.slice(18, 20).some((step, index) => !((step.id === `mission-${index}` && step.phase === 'mission' && step.mode === 'mission') || (step.id === `mission-fallback-${index}` && step.phase === 'explain' && step.mode === 'explain')))) throw new Error('회차의 단계 구성이 맞지 않아요.');
    } else if (session.kind === 'review') {
      if (session.steps.some((step, index) => step.id !== `review-${index}` || step.phase !== 'review' || step.mode !== (index < 5 ? 'choice' : 'recall'))) throw new Error('복습의 단계 구성이 맞지 않아요.');
    } else if (session.steps.length !== 2 || session.steps[0].id !== 'practice-explain' || session.steps[0].phase !== 'explain' || session.steps[0].mode !== 'explain' || session.steps[1].id !== 'practice-mission' || session.steps[1].phase !== 'mission' || session.steps[1].mode !== 'mission' || !same(session.steps[0].principleIds, session.steps[1].principleIds) || session.steps[0].principleIds.length !== 1 || !deck.principles.some((principle) => principle.id === session.steps[0].principleId) || !session.retestFrozen || session.reviewMaxXp !== undefined || session.xp !== 0) throw new Error('심화 연습 구성이 맞지 않아요.');
    session.steps.forEach((step) => verifyStep(step, session.kind));
    const answers = backup.attempts.filter((attempt) => attempt.sessionId === session.id);
    for (let index = 0; index < session.steps.length; index++) {
      const step = session.steps[index];
      const attempt = answers.find((attempt) => attempt.stepId === step.id);
      if ((index < session.index && !attempt) || (index > session.index && attempt)) throw new Error('백업의 답변 순서가 맞지 않아요.');
      if (index >= session.baseCount) {
        const original = session.steps.find((original) => original.id === step.retestOf && original.phase === 'explore');
        const initial = answers.find((answer) => answer.stepId === step.retestOf);
        if (!original || !initial || initial.correct || step.phase !== 'retest' || step.principleId !== original.principleId || step.variantId === original.variantId) throw new Error('오답 재도전 구성이 맞지 않아요.');
      }
    }
    const expectedXp = backup.rewards.filter((reward) => reward.sessionId === session.id).reduce((sum, reward) => sum + reward.xp, 0);
    if (expectedXp !== session.xp) throw new Error('백업의 XP 합계가 맞지 않아요.');
    if (session.kind === 'lesson' && session.retestFrozen) {
      const wrongIds = session.steps.slice(4, 16).filter((step) => answers.some((attempt) => attempt.stepId === step.id && !attempt.correct)).map((step) => step.id);
      if (!same(wrongIds, session.steps.slice(20).map((step) => step.retestOf))) throw new Error('오답 목록과 재도전 문항이 일치하지 않아요.');
    }
  }
  for (const attempt of backup.attempts) {
    const session = backup.sessions.find((item) => item.id === attempt.sessionId);
    const step = session?.steps.find((item) => item.id === attempt.stepId);
    const answer = step?.mode === 'explain' ? attempt.checkedIndices ?? [] : attempt.answer;
    if (!session || !step || attempt.id !== `${session.id}:${step.id}` || attempt.principleId !== step.principleId || !same(attempt.principleIds, step.principleIds) || attempt.variantId !== step.variantId || attempt.mode !== step.mode || attempt.phase !== step.phase || attempt.firstTry !== (step.phase !== 'retest') || (!!step.alwaysHinted && !attempt.usedHint) || gradeStep(step, answer) !== attempt.correct || (step.mode === 'explain' && (!Array.isArray(answer) || !same(answer, [...new Set(answer)]) || JSON.stringify(answer) !== attempt.answer))) throw new Error('백업의 답변 기록을 확인해 주세요.');
  }
  for (const reward of backup.rewards) {
    const session = backup.sessions.find((item) => item.id === reward.sessionId);
    if (!session || session.kind === 'practice') throw new Error('XP에 연결된 학습이 없거나 보상 없는 심화 연습이에요.');
    if (reward.kind === 'answer') {
      const step = session.steps.find((item) => item.id === reward.stepId);
      const attempt = backup.attempts.find((item) => item.id === reward.id);
      if (session.kind !== 'lesson' || !step || !attempt || attempt.stepId !== step.id || attempt.sessionId !== session.id || reward.xp !== answerXp(step, attempt.correct)) throw new Error('문항 XP 기록이 맞지 않아요.');
    } else {
      const expected = session.kind === 'review' ? Math.floor((session.reviewMaxXp ?? 0) * backup.attempts.filter((item) => item.sessionId === session.id && item.correct && item.firstTry).length / 10) : 30;
      if (session.status !== 'completed' || reward.id !== `${session.id}:complete` || reward.xp !== expected || reward.kind !== (session.kind === 'review' ? 'review' : 'completion')) throw new Error('완주 XP 기록이 맞지 않아요.');
    }
  }
  for (const session of backup.sessions) {
    if (session.kind === 'lesson') for (const step of session.steps) {
      const attempt = backup.attempts.find((item) => item.sessionId === session.id && item.stepId === step.id);
      if (attempt && answerXp(step, attempt.correct) > 0 && !backup.rewards.some((item) => item.id === attempt.id)) throw new Error('문항 보상 기록이 빠져 있어요.');
    }
    if (session.status === 'completed') {
      const completionXp = session.kind === 'practice' ? 0 : session.kind === 'review' ? Math.floor((session.reviewMaxXp ?? 0) * backup.attempts.filter((item) => item.sessionId === session.id && item.correct && item.firstTry).length / 10) : 30;
      if (completionXp > 0 && !backup.rewards.some((item) => item.id === `${session.id}:complete`)) throw new Error('완주 보상 기록이 빠져 있어요.');
    }
  }
  const reconstructed = new Map<string, ReviewState>();
  for (const attempt of [...backup.attempts].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) for (const principleId of attempt.principleIds) reconstructed.set(principleId, scheduleReview(reconstructed.get(principleId), attempt, principleId));
  if (backup.reviews.length !== reconstructed.size || backup.reviews.some((review) => !same(review, reconstructed.get(review.principleId)))) throw new Error('복습 기록과 답변 기록이 일치하지 않아요.');
  const owned = new Set(freeRoomItemIds);
  for (const purchase of backup.purchases) {
    const item = getRoomItem(purchase.itemId);
    if (!item || purchase.id !== item.id || purchase.price !== item.price || owned.has(item.id)) throw new Error('백업의 구매 기록이 맞지 않아요.');
    owned.add(item.id);
  }
  if (backup.purchases.reduce((sum, item) => sum + item.price, 0) > backup.rewards.reduce((sum, item) => sum + item.xp, 0)) throw new Error('백업의 XP 잔액이 맞지 않아요.');
  for (const [slot, itemId] of Object.entries(backup.settings.room)) {
    const item = getRoomItem(itemId);
    if (!item || roomSlot(item.category) !== slot || !owned.has(itemId)) throw new Error('백업의 장착 정보가 맞지 않아요.');
  }
  return backup;
}
export async function importBackup(json: string, db = database): Promise<void> {
  const backup = validateBackup(json);
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
    await db.sessions.bulkAdd(backup.sessions); await db.attempts.bulkAdd(backup.attempts);
    await db.reviews.bulkAdd(backup.reviews); await db.rewards.bulkAdd(backup.rewards);
    await db.purchases.bulkAdd(backup.purchases); await db.settings.put(backup.settings);
  });
}
export async function resetDatabase(db = database): Promise<void> {
  await db.transaction('rw', db.tables, async () => { await Promise.all(db.tables.map((table) => table.clear())); });
}
