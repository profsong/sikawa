import { validateDeck, type Deck } from './model';

const bundled = import.meta.glob('../../content/decks/*.deck.json', { eager: true, import: 'default' });
export const decks: Deck[] = Object.keys(bundled).sort().map((path) => validateDeck(bundled[path]));
const ids = decks.flatMap((deck) => [deck.id, ...deck.principles.flatMap((principle) => [principle.id, ...principle.variants.map((variant) => variant.id)]), ...deck.missions.flatMap((mission) => [mission.id, mission.question.id])]);
if (new Set(ids).size !== ids.length) throw new Error('원리장 사이에 중복된 ID가 있습니다.');
export const allPrinciples = decks.flatMap((deck) => deck.principles);
export function getDeck(id: string): Deck {
  const deck = decks.find((item) => item.id === id);
  if (!deck) throw new Error('원리장을 찾을 수 없습니다.');
  return deck;
}
