import { describe, expect, it } from 'vitest';
import sample from '../../motivation/sample-interview-basics.deck.json';
import {
  activePrinciples,
  addDays,
  answerXp,
  buildLesson,
  buildReview,
  gradeStep,
  lessonCount,
  lessonPotentialXp,
  retestSteps,
  scheduleReview,
  selectVariant,
} from '../../src/siikawa/engine';
import { normalizeAnswer, validateDeck, type Attempt, type Session } from '../../src/siikawa/model';

const deck = validateDeck(sample);
function attempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: 'attempt-1',
    sessionId: 'session-1',
    stepId: 'question-1',
    principleId: deck.principles[0].id,
    principleIds: [deck.principles[0].id],
    mode: 'choice',
    phase: 'explore',
    answer: '0',
    correct: true,
    usedHint: false,
    firstTry: true,
    createdAt: '2026-11-01T01:00:00.000Z',
    localDay: '2026-11-01',
    ...overrides,
  };
}
function session(): Session {
  return {
    id: 'session-1',
    deckId: deck.id,
    deckVersion: deck.version,
    kind: 'lesson',
    lessonIndex: 0,
    steps: buildLesson(deck, 0, [deck]),
    index: 20,
    baseCount: 20,
    status: 'in_progress',
    retestFrozen: false,
    xp: 0,
    createdAt: '2026-11-01T01:00:00.000Z',
    updatedAt: '2026-11-01T01:00:00.000Z',
  };
}
describe('원리장 검증과 회차', () => {
  it('validates the independently stored sample and rejects duplicate or invalid editorial fields', () => {
    expect(deck.principles).toHaveLength(6);
    const duplicate = structuredClone(sample);
    duplicate.principles[1].id = duplicate.principles[0].id;
    expect(() => validateDeck(duplicate)).toThrow('중복');
    const badChoices = structuredClone(sample);
    badChoices.principles[0].variants[0].choices[1] =
      badChoices.principles[0].variants[0].choices[0];
    expect(() => validateDeck(badChoices)).toThrow('보기');
    const badHint = structuredClone(sample);
    badHint.principles[0].hint = '가';
    expect(() => validateDeck(badHint)).toThrow('힌트');
    const badEvidence = structuredClone(sample);
    badEvidence.missions[0].question.evidenceQuote = '지문에 없는 문장';
    expect(() => validateDeck(badEvidence)).toThrow('근거');
    const badReference = structuredClone(sample);
    badReference.missions[0].principleIds[0] = 'unknown';
    expect(() => validateDeck(badReference)).toThrow('참조');
  });
  it('builds exactly 4 + 12 + 2 + 2 base questions, interleaves and totals 260 XP', () => {
    const steps = buildLesson(deck, 0, [deck]);
    expect(steps).toHaveLength(20);
    expect(steps.map((step) => step.phase)).toEqual([
      ...Array(4).fill('memory'),
      ...Array(12).fill('explore'),
      ...Array(2).fill('explain'),
      ...Array(2).fill('mission'),
    ]);
    expect(steps.slice(4, 10).map((step) => step.principleId)).toEqual(
      steps.slice(10, 16).map((step) => step.principleId),
    );
    for (let index = 5; index < 16; index++)
      expect(steps[index].principleId).not.toBe(steps[index - 1].principleId);
    expect(lessonPotentialXp(steps)).toBe(260);
  });
  it('fills a one-principle lesson and absent missions without inventing new content', () => {
    const tiny = { ...deck, principles: [deck.principles[0]], missions: [] };
    const steps = buildLesson(tiny, 0, [tiny]);
    expect(steps).toHaveLength(20);
    expect(steps.slice(-4).every((step) => step.mode === 'explain')).toBe(true);
    expect(lessonCount(tiny)).toBe(1);
    const retired = {
      ...deck,
      principles: deck.principles.map((item, index) => ({ ...item, retired: index > 0 })),
    };
    expect(activePrinciples(retired)).toHaveLength(1);
    expect(() => buildLesson(tiny, 1, [tiny])).toThrow();
  });
  it('chooses the least recently seen example and reserves within-session alternatives', () => {
    const principle = deck.principles[0];
    const seen = [
      attempt({ variantId: principle.variants[0].id }),
      attempt({ variantId: principle.variants[1].id, createdAt: '2026-11-02T00:00:00.000Z' }),
    ];
    expect(selectVariant(principle, seen).id).toBe(principle.variants[2].id);
    const used = new Set([principle.variants[2].id]);
    expect(selectVariant(principle, seen, used).id).toBe(principle.variants[3].id);
  });
  it('only creates one alternate question per initially wrong exploration item', () => {
    const current = session();
    const wrong = current.steps.map((step, index) =>
      attempt({
        id: `a-${index}`,
        stepId: step.id,
        phase: step.phase,
        principleId: step.principleId,
        variantId: step.variantId,
        correct: false,
      }),
    );
    const tail = retestSteps(current, wrong, [deck]);
    expect(tail).toHaveLength(12);
    tail.forEach((step) => {
      const original = current.steps.find((item) => item.id === step.retestOf)!;
      expect(step.phase).toBe('retest');
      expect(step.variantId).not.toBe(original.variantId);
      expect(answerXp(step, true)).toBe(0);
    });
    expect(
      retestSteps(current, [attempt({ phase: 'retest', firstTry: false, correct: false })], [deck]),
    ).toHaveLength(0);
  });
});
describe('채점·간격 반복·복습', () => {
  it('normalizes spaces and full-width forms while requiring an actual four-choice index', () => {
    expect(normalizeAnswer(' Ａ ＢＣ ')).toBe('abc');
    const steps = buildLesson(deck, 0, [deck]);
    expect(gradeStep(steps[4], String(steps[4].correctIndex))).toBe(true);
    expect(gradeStep(steps[4], '')).toBe(false);
    const explain = steps[16];
    expect(gradeStep(explain, [0, 1, 2])).toBe(true);
    expect(gradeStep(explain, [0, 0, 0])).toBe(false);
    expect(gradeStep(explain, [0])).toBe(false);
    expect(answerXp(explain, false)).toBe(15);
  });
  it('does not turn recognition or first-letter-assisted recall into mastery', () => {
    const first = scheduleReview(undefined, attempt());
    const hinted = scheduleReview(
      first,
      attempt({
        mode: 'recall',
        usedHint: true,
        createdAt: '2026-11-02T01:00:00.000Z',
        localDay: '2026-11-02',
      }),
    );
    expect(hinted.activeDays).toHaveLength(0);
    expect(hinted.mastered).toBe(false);
    const retry = scheduleReview(
      first,
      attempt({
        firstTry: false,
        phase: 'retest',
        correct: true,
        createdAt: '2026-11-02T01:00:00.000Z',
        localDay: '2026-11-02',
      }),
    );
    expect(retry.correctDays).toHaveLength(1);
    expect(retry.stage).toBe(first.stage);
  });
  it('requires three days, two active days, a mission and delayed recall', () => {
    let state = scheduleReview(undefined, attempt({ mode: 'mission' }));
    state = scheduleReview(
      state,
      attempt({ mode: 'explain', localDay: '2026-11-02', createdAt: '2026-11-02T01:00:00.000Z' }),
    );
    expect(state.mastered).toBe(false);
    state = scheduleReview(
      state,
      attempt({ mode: 'explain', localDay: '2026-11-08', createdAt: '2026-11-08T01:00:00.000Z' }),
    );
    expect(state.mastered).toBe(true);
    expect(state.delayedSuccess).toBe(true);
    state = scheduleReview(
      state,
      attempt({ correct: false, localDay: '2026-11-09', createdAt: '2026-11-09T01:00:00.000Z' }),
    );
    expect(state.mastered).toBe(false);
    expect(state.dueDay).toBe('2026-11-10');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
  it('builds five recognition and five assisted concept questions from learned principles only', () => {
    const reviews = [scheduleReview(undefined, attempt())];
    const steps = buildReview(deck.id, [deck], [], reviews, () => 0.5);
    expect(steps).toHaveLength(10);
    expect(steps.slice(0, 5).every((step) => step.mode === 'choice')).toBe(true);
    expect(steps.slice(5).every((step) => step.mode === 'recall' && step.alwaysHinted)).toBe(true);
    expect(new Set(steps.map((step) => step.principleId))).toEqual(
      new Set([deck.principles[0].id]),
    );
    expect(() => buildReview(deck.id, [deck], [], [])).toThrow('먼저');
  });
  it('memory concept recall leaves its first-letter clue optional, making active recall reachable for every principle', () => {
    const learned = deck.principles.map((principle) =>
      scheduleReview(
        undefined,
        attempt({ principleId: principle.id, principleIds: [principle.id] }),
      ),
    );
    const added = {
      ...deck,
      id: 'extended-deck',
      principles: [
        ...deck.principles,
        ...deck.principles.map((principle) => ({
          ...principle,
          id: `new.${principle.id}`,
          order: principle.order + 6,
          variants: principle.variants.map((variant) => ({ ...variant, id: `new.${variant.id}` })),
        })),
      ],
      missions: [],
    };
    const steps = buildLesson(added, 1, [added], [], learned);
    expect(steps[1].mode).toBe('recall');
    expect(steps[1].alwaysHinted).toBe(false);
    expect(steps[3].mode).toBe('recall');
    expect(steps[3].alwaysHinted).toBe(false);
    expect(deck.principles.some((principle) => principle.id === steps[1].principleId)).toBe(true);
  });
  it('keeps all 20 daily questions and short-lesson fillers inside the selected deck despite other learned decks', () => {
    const learned = deck.principles.map((principle) =>
      scheduleReview(
        undefined,
        attempt({ principleId: principle.id, principleIds: [principle.id] }),
      ),
    );
    const selected = {
      ...deck,
      id: 'selected-deck',
      principles: deck.principles.map((principle) => ({
        ...principle,
        id: `selected.${principle.id}`,
        subject: '물리',
        variants: principle.variants.map((variant) => ({
          ...variant,
          id: `selected.${variant.id}`,
        })),
      })),
      missions: [],
    };
    for (const current of [
      selected,
      { ...selected, principles: selected.principles.slice(0, 2) },
    ]) {
      const ownIds = new Set(current.principles.map((principle) => principle.id));
      const steps = buildLesson(current, 0, [deck, current], [], learned);
      expect(steps).toHaveLength(20);
      expect(steps.every((step) => step.principleIds.every((id) => ownIds.has(id)))).toBe(true);
      expect(steps.every((step) => step.subject === '물리')).toBe(true);
      expect(steps.slice(0, 4).every((step) => step.mode === 'choice')).toBe(true);
      expect(steps.filter((step) => step.phase === 'explore')).toHaveLength(12);
    }
  });
});
