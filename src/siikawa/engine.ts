import { normalizeAnswer, type Attempt, type Deck, type Principle, type ReviewState, type Session, type Step, type Variant } from './model';

export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function addDays(day: string, amount: number): string {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, date + amount)).toISOString().slice(0, 10);
}
export const activePrinciples = (deck: Deck) => deck.principles.filter((item) => !item.retired).sort((a, b) => a.order - b.order);
export const lessonCount = (deck: Deck) => Math.ceil(activePrinciples(deck).length / 6);
export const lessonPrinciples = (deck: Deck, index: number) => activePrinciples(deck).slice(index * 6, index * 6 + 6);

/** Least recently encountered variant, reserving examples already used in this session. */
export function selectVariant(principle: Principle, attempts: Attempt[], used = new Set<string>(), offset = 0): Variant {
  const lastSeen = (id: string) => attempts.filter((item) => item.variantId === id).map((item) => item.createdAt).sort().at(-1) ?? '';
  const variants = principle.variants.map((variant, index) => ({ variant, index: (index - offset + principle.variants.length) % principle.variants.length }));
  variants.sort((a, b) => Number(used.has(a.variant.id)) - Number(used.has(b.variant.id)) || lastSeen(a.variant.id).localeCompare(lastSeen(b.variant.id)) || a.index - b.index);
  used.add(variants[0].variant.id);
  return variants[0].variant;
}
function choice(principle: Principle, variant: Variant, phase: Step['phase'], id: string): Step {
  return { id, principleId: principle.id, principleIds: [principle.id], variantId: variant.id, phase, mode: 'choice', name: principle.name, subject: principle.subject, prompt: variant.prompt, choices: [...variant.choices], correctIndex: variant.correctIndex, explanation: variant.explanation, source: principle.source };
}
function recall(principle: Principle, phase: Step['phase'], id: string): Step {
  return { id, principleId: principle.id, principleIds: [principle.id], phase, mode: 'recall', name: principle.name, subject: principle.subject, prompt: `다음 설명에 해당하는 개념어를 써 보세요.\n${principle.summary}`, acceptedAnswers: [...principle.conceptAnswers], hint: principle.hint, alwaysHinted: phase === 'review', explanation: `${principle.conceptAnswers[0]}: ${principle.summary}`, source: principle.source };
}
function explain(principle: Principle, id: string): Step {
  return { id, principleId: principle.id, principleIds: [principle.id], phase: 'explain', mode: 'explain', name: principle.name, subject: principle.subject, prompt: principle.explain.prompt, rubric: [...principle.explain.rubric], passCount: principle.explain.passCount, followUp: principle.followUps[0], explanation: principle.summary, source: principle.source };
}
function learnedPool(allDecks: Deck[], reviews: ReviewState[]): Principle[] {
  const ids = new Set(reviews.map((item) => item.principleId));
  return allDecks.flatMap(activePrinciples).filter((item) => ids.has(item.id));
}
function priorityPool(principles: Principle[], reviews: ReviewState[], day: string): Principle[] {
  const state = new Map(reviews.map((item) => [item.principleId, item]));
  return [...principles].sort((a, b) => {
    const aState = state.get(a.id), bState = state.get(b.id);
    return Number((bState?.dueDay ?? '9999') <= day) - Number((aState?.dueDay ?? '9999') <= day) || (bState?.wrongCount ?? 0) - (aState?.wrongCount ?? 0) || (aState?.dueDay ?? '').localeCompare(bState?.dueDay ?? '') || a.id.localeCompare(b.id);
  });
}
export function buildLesson(deck: Deck, index: number, allDecks: Deck[], attempts: Attempt[] = [], reviews: ReviewState[] = []): Step[] {
  void allDecks;
  const fresh = lessonPrinciples(deck, index);
  if (!Number.isInteger(index) || index < 0 || !fresh.length) throw new Error('회차를 확인해 주세요.');
  // Daily lessons, including memory and short-lesson fillers, follow the chosen deck.
  const learned = priorityPool(learnedPool([deck], reviews).filter((item) => !fresh.some((p) => p.id === item.id)), reviews, localDay());
  const used = new Set<string>();
  const steps: Step[] = [];
  for (let slot = 0; slot < 4; slot++) {
    const principle = learned.length ? learned[slot % learned.length] : fresh[slot % fresh.length];
    steps.push(learned.length && slot % 2 === 1 ? recall(principle, 'memory', `memory-${slot}`) : choice(principle, selectVariant(principle, attempts, used, learned.length ? 0 : 2), 'memory', `memory-${slot}`));
  }
  // Two passes interleave new principles; a short final lesson uses earlier material.
  const explorePool = [...fresh];
  for (const principle of learned) {
    if (explorePool.length >= 6) break;
    explorePool.push(principle);
  }
  for (let slot = 0; slot < 12; slot++) {
    const principle = explorePool[slot % explorePool.length];
    steps.push(choice(principle, selectVariant(principle, attempts, used), 'explore', `explore-${slot}`));
  }
  for (let slot = 0; slot < 2; slot++) steps.push(explain(fresh[slot % fresh.length], `explain-${slot}`));
  const eligibleIds = new Set([...fresh, ...learned].map((item) => item.id));
  const eligibleMissions = deck.missions.filter((mission) => mission.principleIds.every((id) => eligibleIds.has(id)) && mission.principleIds.every((id) => !deck.principles.find((p) => p.id === id)?.retired));
  eligibleMissions.sort((a, b) => {
    const seen = (id: string) => attempts.filter((attempt) => attempt.variantId === id).map((attempt) => attempt.createdAt).sort().at(-1) ?? '';
    return seen(a.question.id).localeCompare(seen(b.question.id));
  });
  for (let slot = 0; slot < 2; slot++) {
    const mission = eligibleMissions[slot];
    if (!mission) { steps.push(explain(fresh[(slot + 2) % fresh.length], `mission-fallback-${slot}`)); continue; }
    const principle = deck.principles.find((item) => item.id === mission.principleIds[0])!;
    steps.push({ ...choice(principle, mission.question, 'mission', `mission-${slot}`), mode: 'mission', name: mission.title, principleIds: [...mission.principleIds], passage: mission.passage, evidenceQuote: mission.question.evidenceQuote, followUp: mission.followUp, source: mission.source });
  }
  return steps;
}
/** Weighted sampling without replacement until the learned pool is exhausted. */
export function buildReview(_deckId: string, allDecks: Deck[], attempts: Attempt[], reviews: ReviewState[], random = Math.random): Step[] {
  void _deckId;
  const learned = learnedPool(allDecks, reviews);
  if (!learned.length) throw new Error('먼저 원리를 탐험하면 복습을 시작할 수 있어요.');
  const states = new Map(reviews.map((item) => [item.principleId, item]));
  const used = new Set<string>();
  const steps: Step[] = [];
  let candidates: Principle[] = [];
  for (let slot = 0; slot < 10; slot++) {
    if (!candidates.length) candidates = [...learned];
    const weight = (principle: Principle) => 1 + Math.min(8, states.get(principle.id)?.wrongCount ?? 0) * 2 + Number((states.get(principle.id)?.dueDay ?? '9999') <= localDay()) * 2;
    const total = candidates.reduce((sum, item) => sum + weight(item), 0);
    let draw = Math.max(0, Math.min(0.9999999, random())) * total;
    let selectedIndex = candidates.length - 1;
    for (let cursor = 0; cursor < candidates.length; cursor++) { draw -= weight(candidates[cursor]); if (draw < 0) { selectedIndex = cursor; break; } }
    const [principle] = candidates.splice(selectedIndex, 1);
    steps.push(slot < 5 ? choice(principle, selectVariant(principle, attempts, used), 'review', `review-${slot}`) : recall(principle, 'review', `review-${slot}`));
  }
  return steps;
}
export function gradeStep(step: Step, answer: string | number[]): boolean {
  if (step.mode === 'explain') return Array.isArray(answer) && new Set(answer.filter((value) => Number.isInteger(value) && value >= 0 && value < (step.rubric?.length ?? 0))).size >= (step.passCount ?? 3);
  if (Array.isArray(answer)) return false;
  if (step.mode === 'recall') return !!step.acceptedAnswers?.some((candidate) => normalizeAnswer(candidate) === normalizeAnswer(answer));
  return /^[0-3]$/.test(answer) && Number(answer) === step.correctIndex;
}
export function answerXp(step: Step, correct: boolean): number {
  if (step.phase === 'retest') return 0;
  if (step.mode === 'explain') return 15;
  return correct ? step.mode === 'mission' ? 20 : 10 : 0;
}
export const lessonPotentialXp = (steps: Step[]) => steps.slice(0, 20).reduce((sum, step) => sum + answerXp(step, true), 30);
export function buildPractice(principle: Principle, deck: Deck, attempts: Attempt[]): Step[] {
  const mission = deck.missions.find((item) => item.principleIds.length === 1 && item.principleIds[0] === principle.id);
  const application: Step = mission
    ? { ...choice(principle, mission.question, 'mission', 'practice-mission'), mode: 'mission', name: mission.title, passage: mission.passage, evidenceQuote: mission.question.evidenceQuote, followUp: mission.followUp, source: mission.source }
    : { ...choice(principle, selectVariant(principle, attempts), 'mission', 'practice-mission'), mode: 'mission', passage: `탐구 노트\n${principle.summary}`, evidenceQuote: principle.summary, followUp: principle.followUps[0], source: `원리장 내용을 활용한 자체 심화 연습. 참고: ${principle.source}` };
  return [explain(principle, 'practice-explain'), application];
}
export function retestSteps(session: Session, attempts: Attempt[], allDecks: Deck[]): Step[] {
  const wrong = attempts.filter((attempt) => attempt.sessionId === session.id && attempt.phase === 'explore' && !attempt.correct && attempt.firstTry);
  const principles = allDecks.flatMap((deck) => deck.principles);
  const used = new Set(session.steps.flatMap((step) => step.variantId ? [step.variantId] : []));
  return session.steps.filter((step) => wrong.some((attempt) => attempt.stepId === step.id)).slice(0, 12).map((original) => {
    const principle = principles.find((item) => item.id === original.principleId);
    if (!principle) return { ...original, id: `${original.id}:retest`, phase: 'retest' as const, retestOf: original.id };
    const variant = selectVariant(principle, attempts, used);
    // In tiny decks all examples may have been seen: the retest still differs from this question.
    const alternate = variant.id === original.variantId ? principle.variants.find((item) => item.id !== original.variantId)! : variant;
    return { ...choice(principle, alternate, 'retest', `${original.id}:retest`), retestOf: original.id };
  });
}
export function scheduleReview(previous: ReviewState | undefined, attempt: Attempt, principleId = attempt.principleId): ReviewState {
  const state: ReviewState = previous ? structuredClone(previous) : { principleId, stage: 0, dueDay: attempt.localDay, correctDays: [], activeDays: [], missionDays: [], firstLearnedDay: attempt.localDay, delayedSuccess: false, mastered: false, wrongCount: 0 };
  if (state.lastAttemptAt && attempt.createdAt <= state.lastAttemptAt) return state;
  if (!attempt.firstTry) { state.lastAttemptAt = attempt.createdAt; return state; }
  const success = attempt.correct && !attempt.usedHint;
  const active = attempt.mode === 'recall' || attempt.mode === 'explain';
  const add = (values: string[]) => [...new Set([...values, attempt.localDay])].sort();
  if (!success) {
    if (!attempt.correct) {
      state.stage = Math.max(0, state.stage - 1); state.wrongCount += 1;
      state.mastered = false; state.delayedSuccess = false;
    }
    state.dueDay = addDays(attempt.localDay, 1);
  } else {
    const newDay = !state.correctDays.includes(attempt.localDay);
    if (newDay) state.stage = state.stage === 0 ? 1 : active ? Math.min(5, state.stage + 1) : state.stage;
    state.correctDays = add(state.correctDays);
    if (active) {
      state.activeDays = add(state.activeDays);
      if (attempt.localDay >= addDays(state.firstLearnedDay, 7)) state.delayedSuccess = true;
    }
    if (attempt.mode === 'mission') state.missionDays = add(state.missionDays);
    state.dueDay = [state.dueDay, addDays(attempt.localDay, [1, 1, 3, 7, 14, 30][state.stage])].sort().at(-1)!;
    state.lastSuccessDay = attempt.localDay;
    state.mastered = state.correctDays.length >= 3 && state.activeDays.length >= 2 && state.missionDays.length >= 1 && state.delayedSuccess;
  }
  state.lastAttemptAt = attempt.createdAt;
  return state;
}
