import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../src/siikawa/decks', async () => {
  const raw = (await import('../../motivation/sample-interview-basics.deck.json')).default;
  const { validateDeck } = await import('../../src/siikawa/model');
  const deck = validateDeck(raw);
  const scoped = validateDeck({
    ...raw,
    id: 'physics-scope',
    title: '물리 범위 테스트',
    principles: raw.principles.map((principle) => ({
      ...principle,
      id: `scope.${principle.id}`,
      subject: '물리',
      variants: principle.variants.map((variant) => ({ ...variant, id: `scope.${variant.id}` })),
    })),
    missions: raw.missions.map((mission) => ({
      ...mission,
      id: `scope.${mission.id}`,
      principleIds: mission.principleIds.map((id) => `scope.${id}`),
      question: { ...mission.question, id: `scope.${mission.question.id}` },
    })),
  });
  const decks = [deck, scoped];
  return {
    decks,
    allPrinciples: decks.flatMap((item) => item.principles),
    getDeck: (id: string) => {
      const selected = decks.find((item) => item.id === id);
      if (!selected) throw new Error('알 수 없는 원리장');
      return selected;
    },
  };
});
import { getDeck } from '../../src/siikawa/decks';
import {
  advanceSession,
  exportBackup,
  importBackup,
  loadSnapshot,
  purchaseRoomItem,
  resetDatabase,
  saveSettings,
  SiikawaDatabase,
  startLesson,
  startPractice,
  startReview,
  submitAnswer,
  validateBackup,
} from '../../src/siikawa/storage';
import { roomItems } from '../../src/core/room-catalog';
import type { Session, Step } from '../../src/siikawa/model';

let db: SiikawaDatabase;
const deckId = 'sample-interview-basics';
beforeEach(() => {
  db = new SiikawaDatabase(`siikawa-test-${crypto.randomUUID()}`);
});
afterEach(async () => {
  await db.delete();
});
function correctAnswer(step: Step): string | number[] {
  return step.mode === 'explain'
    ? [0, 1, 2]
    : step.mode === 'recall'
      ? step.acceptedAnswers![0]
      : String(step.correctIndex);
}
async function complete(session: Session, wrongExplore = false): Promise<Session> {
  let current = session;
  while (current.status === 'in_progress') {
    const step = current.steps[current.index];
    const answer =
      wrongExplore && step.phase === 'explore'
        ? String((step.correctIndex! + 1) % 4)
        : correctAnswer(step);
    await submitAnswer(current.id, answer, false, db);
    current = await advanceSession(current.id, db);
  }
  return current;
}
describe('학습 저장소의 원자성과 백업', () => {
  it('repairs only unanswered foreign questions in a legacy in-progress lesson and preserves earned XP and purchases', async () => {
    const completed = await complete(await startLesson(deckId, 0, db));
    const item = roomItems.find(
      (candidate) => candidate.category === 'accessory' && candidate.price > 0,
    )!;
    while ((await loadSnapshot(db)).balance < item.price)
      await complete(await startReview(deckId, db));
    await purchaseRoomItem(item.id, db);
    const selected = getDeck('physics-scope');
    let legacy = await startLesson(selected.id, 0, db);
    const foreign = completed.steps[0];
    // This fixture recreates stored questions from the former cross-deck builder.
    // Writes target a newly named fake-indexeddb test database, never a learner database.
    for (const index of [0, 1, 2, 4]) {
      const existing = legacy.steps[index];
      legacy.steps[index] = { ...foreign, id: existing.id, phase: existing.phase };
    }
    await db.sessions.put(legacy);
    await submitAnswer(legacy.id, correctAnswer(legacy.steps[0]), false, db);
    legacy = await advanceSession(legacy.id, db);
    await submitAnswer(legacy.id, correctAnswer(legacy.steps[1]), false, db);
    const before = await loadSnapshot(db);
    const oldSession = before.sessions.find((session) => session.id === legacy.id)!;
    const resumed = await startLesson(selected.id, undefined, db);
    expect(resumed.id).toBe(oldSession.id);
    expect(resumed.index).toBe(1);
    expect(resumed.xp).toBe(20);
    expect(resumed.steps[0]).toEqual(oldSession.steps[0]);
    expect(resumed.steps[1]).toEqual(oldSession.steps[1]);
    expect(resumed.steps[2].id).toBe(oldSession.steps[2].id);
    expect(resumed.steps[4].id).toBe(oldSession.steps[4].id);
    const ownIds = new Set(selected.principles.map((principle) => principle.id));
    expect(
      resumed.steps.slice(2).every((step) => step.principleIds.every((id) => ownIds.has(id))),
    ).toBe(true);
    expect((await startLesson(selected.id, undefined, db)).steps).toEqual(resumed.steps);
    const after = await loadSnapshot(db);
    for (const key of [
      'attempts',
      'reviews',
      'rewards',
      'purchases',
      'settings',
      'earnedXp',
      'balance',
      'ownedItemIds',
    ] as const)
      expect(after[key]).toEqual(before[key]);
    expect(after.sessions.find((session) => session.id === completed.id)).toEqual(
      before.sessions.find((session) => session.id === completed.id),
    );
    const backup = await exportBackup(db);
    expect(() => validateBackup(backup)).not.toThrow();
    await importBackup(backup, db);
    expect(await loadSnapshot(db)).toEqual(after);
  });
  it('resumes the same lesson and rejects duplicate answer rewards, refresh skips and completion rewards', async () => {
    const [one, two] = await Promise.all([startLesson(deckId, 0, db), startLesson(deckId, 0, db)]);
    expect(one.id).toBe(two.id);
    const first = one.steps[0];
    const answers = await Promise.all([
      submitAnswer(one.id, correctAnswer(first), false, db),
      submitAnswer(one.id, correctAnswer(first), false, db),
    ]);
    expect(answers[0].id).toBe(answers[1].id);
    let snapshot = await loadSnapshot(db);
    expect(snapshot.attempts).toHaveLength(1);
    expect(snapshot.earnedXp).toBe(10);
    const advanced = await advanceSession(one.id, db);
    expect((await advanceSession(one.id, db)).index).toBe(advanced.index);
    expect((await startLesson(deckId, undefined, db)).index).toBe(1);
    const done = await complete(advanced);
    expect(done.xp).toBe(260);
    await advanceSession(done.id, db);
    snapshot = await loadSnapshot(db);
    expect(snapshot.rewards.filter((item) => item.kind === 'completion')).toHaveLength(1);
    expect(snapshot.earnedXp).toBe(260);
    expect((await startLesson(deckId, 0, db)).status).toBe('completed');
  });
  it('freezes one 12-question alternate retest tail and never repeats its mistakes', async () => {
    const started = await startLesson(deckId, 0, db);
    const done = await complete(started, true);
    expect(done.steps).toHaveLength(32);
    expect(done.retestFrozen).toBe(true);
    expect(done.xp).toBe(140);
    const snapshot = await loadSnapshot(db);
    expect(snapshot.attempts.filter((item) => !item.firstTry)).toHaveLength(12);
    expect(snapshot.rewards.filter((item) => item.stepId?.includes('retest'))).toHaveLength(0);
  });
  it('pays a review only at completion and assisted recall creates no active-recall days', async () => {
    await complete(await startLesson(deckId, 0, db));
    let review = await startReview(deckId, db);
    const first = review.steps[0];
    await submitAnswer(review.id, correctAnswer(first), false, db);
    expect((await loadSnapshot(db)).earnedXp).toBe(260);
    review = await advanceSession(review.id, db);
    const completed = await complete(review);
    expect(completed.xp).toBe(78);
    await advanceSession(review.id, db);
    expect((await loadSnapshot(db)).earnedXp).toBe(338);
    const attempts = (await loadSnapshot(db)).attempts.filter(
      (item) => item.sessionId === review.id && item.mode === 'recall',
    );
    expect(attempts.every((attempt) => attempt.usedHint)).toBe(true);
  });
  it('rejects insufficient purchases atomically and never charges a repeated owned tap', async () => {
    const item = roomItems.find((item) => item.category === 'accessory' && item.price > 0)!;
    await expect(purchaseRoomItem(item.id, db)).rejects.toThrow('XP');
    expect((await loadSnapshot(db)).purchases).toHaveLength(0);
    // Earn legitimate, complete review rounds until the first cosmetic is affordable.
    await complete(await startLesson(deckId, 0, db));
    while ((await loadSnapshot(db)).balance < item.price)
      await complete(await startReview(deckId, db));
    const before = (await loadSnapshot(db)).balance;
    await Promise.all([purchaseRoomItem(item.id, db), purchaseRoomItem(item.id, db)]);
    const snapshot = await loadSnapshot(db);
    expect(snapshot.purchases).toHaveLength(1);
    expect(snapshot.balance).toBe(before - item.price);
    expect(snapshot.settings.room.accessoryId).toBe(item.id);
    await purchaseRoomItem(item.id, db);
    expect((await loadSnapshot(db)).balance).toBe(snapshot.balance);
  });
  it('round-trips partial, completed, retest and review records and rejects a corrupted file without writes', async () => {
    const current = await startLesson(deckId, 0, db);
    await submitAnswer(current.id, correctAnswer(current.steps[0]), false, db);
    await saveSettings({ theme: 'night', avatarId: 'nova' }, db);
    const partial = await exportBackup(db);
    expect(() => validateBackup(partial)).not.toThrow();
    await complete(current, true);
    await complete(await startReview(deckId, db));
    const exported = await exportBackup(db);
    expect(() => validateBackup(exported)).not.toThrow();
    const before = await loadSnapshot(db);
    const tampered = JSON.parse(exported);
    tampered.rewards[0].xp += 1;
    await expect(importBackup(JSON.stringify(tampered), db)).rejects.toThrow();
    expect((await loadSnapshot(db)).earnedXp).toBe(before.earnedXp);
    await importBackup(partial, db);
    const restored = await loadSnapshot(db);
    expect(restored.attempts).toHaveLength(1);
    expect(restored.settings.theme).toBe('night');
    expect(restored.sessions[0].index).toBe(0);
    await importBackup(exported, db);
    expect((await loadSnapshot(db)).earnedXp).toBe(before.earnedXp);
    const unknown = JSON.parse(exported);
    unknown.settings.deckId = 'missing-deck';
    await expect(importBackup(JSON.stringify(unknown), db)).rejects.toThrow();
    expect((await loadSnapshot(db)).earnedXp).toBe(before.earnedXp);
    const missing = JSON.parse(exported);
    delete missing.sessions[0].steps[0].source;
    await expect(importBackup(JSON.stringify(missing), db)).rejects.toThrow();
    const forgedReview = JSON.parse(exported);
    forgedReview.reviews[0].mastered = true;
    await expect(importBackup(JSON.stringify(forgedReview), db)).rejects.toThrow();
  });
  it('does not change progress just by opening content and prevents unowned equipment', async () => {
    getDeck(deckId).principles.forEach((item) => expect(item.summary.length).toBeGreaterThan(0));
    expect((await loadSnapshot(db)).attempts).toHaveLength(0);
    const paid = roomItems.find((item) => item.category === 'background' && item.price > 0)!;
    await expect(
      saveSettings(
        { room: { backgroundId: paid.id, outfitId: 'original', accessoryId: 'none' } },
        db,
      ),
    ).rejects.toThrow('보유');
    expect((await loadSnapshot(db)).settings.room.backgroundId).toBe('mint-room');
  });
  it.each(['시이싸이', 'Siikawa'])('restores a schema-1 backup named %s and exports it as 시이카와', async (app) => {
    await complete(await startLesson(deckId, 0, db));
    const item = roomItems.find((item) => item.category === 'accessory' && item.price > 0)!;
    while ((await loadSnapshot(db)).balance < item.price)
      await complete(await startReview(deckId, db));
    await purchaseRoomItem(item.id, db);
    const before = await loadSnapshot(db);
    const current = JSON.parse(await exportBackup(db));
    expect(current.app).toBe('시이카와');
    expect(current.schemaVersion).toBe(1);
    const legacy = { ...current, app };
    const legacyJson = JSON.stringify(legacy);
    expect(validateBackup(legacyJson).app).toBe(app);
    await resetDatabase(db);
    expect((await loadSnapshot(db)).sessions).toHaveLength(0);
    await importBackup(legacyJson, db);
    expect(await loadSnapshot(db)).toEqual(before);
    const reexported = JSON.parse(await exportBackup(db));
    expect(reexported.app).toBe('시이카와');
    for (const key of ['sessions', 'attempts', 'reviews', 'rewards', 'purchases', 'settings']) {
      expect(reexported[key]).toEqual(current[key]);
    }
    const corruptLegacy = structuredClone(legacy);
    corruptLegacy.purchases[0].price += 1;
    await expect(importBackup(JSON.stringify(corruptLegacy), db)).rejects.toThrow('구매');
    expect(await loadSnapshot(db)).toEqual(before);
    expect(() => validateBackup(JSON.stringify({ ...current, app: 'unrelated-app' }))).toThrow();
  });
  it('makes mastery reachable through explicit no-XP practice and validates its complete backup', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      const principle = getDeck(deckId).principles[1];
      for (const day of ['2026-11-01', '2026-11-02', '2026-11-08']) {
        const now = new Date(`${day}T01:00:00.000Z`);
        vi.setSystemTime(now);
        let session = await startPractice(principle.id, db);
        expect((await startPractice(principle.id, db)).id).toBe(session.id);
        expect(session.baseCount).toBe(2);
        const explanation = await submitAnswer(session.id, [0, 1, 2], false, db);
        expect((await submitAnswer(session.id, [], false, db)).id).toBe(explanation.id);
        const partial = await exportBackup(db);
        expect(() => validateBackup(partial)).not.toThrow();
        session = await advanceSession(session.id, db);
        expect(session.steps[1].passage).toBe(`탐구 노트\n${principle.summary}`);
        await submitAnswer(session.id, correctAnswer(session.steps[1]), false, db);
        session = await advanceSession(session.id, db);
        expect(session.status).toBe('completed');
        expect(session.xp).toBe(0);
        await advanceSession(session.id, db);
      }
      const snapshot = await loadSnapshot(db);
      expect(snapshot.sessions).toHaveLength(3);
      expect(snapshot.attempts).toHaveLength(6);
      expect(snapshot.rewards).toHaveLength(0);
      expect(snapshot.earnedXp).toBe(0);
      expect(snapshot.reviews[0].mastered).toBe(true);
      expect(snapshot.reviews[0].activeDays).toHaveLength(3);
      expect(snapshot.reviews[0].missionDays).toHaveLength(3);
      const backup = await exportBackup(db);
      await importBackup(backup, db);
      expect((await loadSnapshot(db)).reviews[0].mastered).toBe(true);
      const corrupt = JSON.parse(backup);
      corrupt.sessions[0].steps[1].passage = '기출이라고 잘못 주장한 새 지문';
      await expect(importBackup(JSON.stringify(corrupt), db)).rejects.toThrow('근거');
      expect((await loadSnapshot(db)).attempts).toHaveLength(6);
    } finally {
      vi.useRealTimers();
    }
  });
});
