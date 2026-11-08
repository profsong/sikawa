import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateDeck } from '../src/siikawa/model';

const directory = resolve('content/decks');
const files = readdirSync(directory).filter((file) => file.endsWith('.deck.json')).sort();
if (!files.length) throw new Error('원리장이 없습니다.');
const ids = new Set<string>();
let principles = 0, variants = 0, missions = 0;
for (const file of files) {
  const deck = validateDeck(JSON.parse(readFileSync(resolve(directory, file), 'utf8').replace(/^\uFEFF/, '')));
  const register = (id: string) => { if (ids.has(id)) throw new Error(`원리장 간 중복 ID: ${id}`); ids.add(id); };
  register(deck.id);
  for (const principle of deck.principles) { register(principle.id); principle.variants.forEach((variant) => register(variant.id)); }
  for (const mission of deck.missions) { register(mission.id); register(mission.question.id); }
  principles += deck.principles.length;
  variants += deck.principles.reduce((sum, principle) => sum + principle.variants.length, 0);
  missions += deck.missions.length;
  console.log(`${deck.title}: ${deck.principles.length}원리 / ${deck.principles.reduce((sum, principle) => sum + principle.variants.length, 0)}예문 / ${deck.missions.length}미션 [${deck.reviewStatus}]`);
}
console.log(`검사 통과: ${files.length}원리장, ${principles}원리, ${variants}객관식 예문, ${missions}면접 미션. 내용 검수 상태는 원자료의 표시를 유지합니다.`);
