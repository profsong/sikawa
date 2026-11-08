import { z } from 'zod';
import type { RoomSelection } from '../core/room-catalog';

const text = z.string().trim().min(1).max(10000);
const id = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,180}$/);
const status = z.enum(['draft', 'validated', 'approved']);
export const variantSchema = z.object({
  id, prompt: text, choices: z.array(text).length(4),
  correctIndex: z.number().int().min(0).max(3), explanation: text,
});
export const principleSchema = z.object({
  id, order: z.number().int().positive(), subject: text, name: text, summary: text,
  conceptAnswers: z.array(text).min(1), hint: text, curriculum: text,
  variants: z.array(variantSchema).min(4),
  explain: z.object({ prompt: text, rubric: z.array(text).length(4), passCount: z.number().int().min(1).max(4) }),
  followUps: z.array(text).min(1), source: text, reviewStatus: status, retired: z.boolean().optional(),
});
export const missionSchema = z.object({
  id, title: text, principleIds: z.array(id).min(1), passage: text,
  question: variantSchema.extend({ evidenceQuote: text }),
  followUp: text, source: text, reviewStatus: status,
});
export const deckSchema = z.object({
  schemaVersion: z.literal(1), id, title: text, description: text, version: text,
  language: z.literal('ko'), reviewStatus: status,
  principles: z.array(principleSchema).min(1), missions: z.array(missionSchema),
});
export type Deck = z.infer<typeof deckSchema>;
export type Principle = z.infer<typeof principleSchema>;
export type Variant = z.infer<typeof variantSchema>;
export type Mission = z.infer<typeof missionSchema>;
export type StepMode = 'choice' | 'recall' | 'explain' | 'mission';
export type Phase = 'memory' | 'explore' | 'explain' | 'mission' | 'retest' | 'review';
export interface Step {
  id: string; principleId: string; principleIds: string[]; variantId?: string;
  phase: Phase; mode: StepMode; name: string; subject: string; prompt: string;
  choices?: string[]; correctIndex?: number; explanation: string;
  acceptedAnswers?: string[]; hint?: string; alwaysHinted?: boolean;
  rubric?: string[]; passCount?: number; followUp?: string;
  passage?: string; evidenceQuote?: string; source: string; retestOf?: string;
}
export interface Session {
  id: string; deckId: string; deckVersion: string; kind: 'lesson' | 'review' | 'practice';
  lessonIndex: number; steps: Step[]; index: number; baseCount: number;
  status: 'in_progress' | 'completed'; retestFrozen: boolean; xp: number;
  createdAt: string; updatedAt: string; completedAt?: string; reviewMaxXp?: number;
}
export interface Attempt {
  id: string; sessionId: string; stepId: string; principleId: string; principleIds: string[];
  variantId?: string; mode: StepMode; phase: Phase; answer: string;
  checkedIndices?: number[]; correct: boolean; usedHint: boolean; firstTry: boolean;
  createdAt: string; localDay: string;
}
export interface ReviewState {
  principleId: string; stage: number; dueDay: string; correctDays: string[];
  activeDays: string[]; missionDays: string[]; firstLearnedDay: string;
  lastSuccessDay?: string; lastAttemptAt?: string; delayedSuccess: boolean;
  mastered: boolean; wrongCount: number;
}
export interface Reward { id: string; sessionId: string; stepId?: string; xp: number; kind: 'answer' | 'completion' | 'review'; createdAt: string }
export interface Purchase { id: string; itemId: string; price: number; createdAt: string }
export interface Settings {
  id: 'preferences'; deckId: string; theme: 'forest' | 'night';
  avatarId: 'lumi' | 'momo' | 'nova'; room: RoomSelection;
}
export interface Snapshot {
  sessions: Session[]; attempts: Attempt[]; reviews: ReviewState[]; rewards: Reward[];
  purchases: Purchase[]; settings: Settings; earnedXp: number; balance: number; ownedItemIds: string[];
}

export function normalizeAnswer(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, '').toLocaleLowerCase('ko');
}

/** Structural and editorial invariants run both in the browser and during builds. */
export function validateDeck(value: unknown): Deck {
  const deck = deckSchema.parse(value);
  const ids = new Set<string>();
  const orders = new Set<number>();
  const register = (value: string) => {
    if (ids.has(value)) throw new Error(`중복 ID: ${value}`);
    ids.add(value);
  };
  const checkChoices = (variant: Variant) => {
    register(variant.id);
    if (new Set(variant.choices.map(normalizeAnswer)).size !== 4)
      throw new Error(`서로 다른 보기 4개가 필요합니다: ${variant.id}`);
  };
  for (const principle of deck.principles) {
    register(principle.id);
    if (orders.has(principle.order)) throw new Error(`중복 순서: ${principle.order}`);
    orders.add(principle.order);
    if (!normalizeAnswer(principle.conceptAnswers[0]).startsWith(normalizeAnswer(principle.hint)))
      throw new Error(`첫 글자 힌트를 확인하세요: ${principle.id}`);
    if ([...normalizeAnswer(principle.hint)].length !== 1)
      throw new Error(`첫 글자 하나만 힌트로 사용하세요: ${principle.id}`);
    principle.variants.forEach(checkChoices);
    if (new Set(principle.explain.rubric.map(normalizeAnswer)).size !== 4)
      throw new Error(`서로 다른 설명 채점 요소가 필요합니다: ${principle.id}`);
  }
  const principleIds = new Set(deck.principles.map((item) => item.id));
  for (const mission of deck.missions) {
    register(mission.id);
    checkChoices(mission.question);
    if (new Set(mission.principleIds).size !== mission.principleIds.length || mission.principleIds.some((item) => !principleIds.has(item)))
      throw new Error(`미션 원리 참조를 확인하세요: ${mission.id}`);
    if (!mission.passage.includes(mission.question.evidenceQuote))
      throw new Error(`근거 문장이 지문에 없습니다: ${mission.id}`);
  }
  return deck;
}
