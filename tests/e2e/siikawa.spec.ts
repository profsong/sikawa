import { expect, test, type Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type {
  Deck,
  Session,
  Attempt,
  ReviewState,
  Reward,
  Purchase,
} from '../../src/siikawa/model';

const bank: Deck[] = readdirSync(resolve('content/decks'))
  .filter((file) => file.endsWith('.deck.json'))
  .map((file) => JSON.parse(readFileSync(resolve('content/decks', file), 'utf8')) as Deck);
const principles = bank.flatMap((deck) => deck.principles);
const questions = bank.flatMap((deck) => [
  ...deck.principles.flatMap((principle) => principle.variants),
  ...deck.missions.map((mission) => mission.question),
]);
const mathDeck = bank.find((deck) => deck.principles[0].subject === '수학')!;
const avatarAssets = [
  { id: 'lumi', name: '시이카와', path: '/avatars/siikawa-avatar.png' },
  { id: 'momo', name: '시이카로', path: '/avatars/siikaro-avatar.png' },
  { id: 'nova', name: '시이쿠마', path: '/avatars/siikuma-avatar.png' },
].map((asset) => ({
  ...asset,
  mime: 'image/png',
  bytes: readFileSync(resolve(`public${asset.path}`)).byteLength,
}));

async function navigate(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).filter({ visible: true }).first().click();
  await expect(page.locator('.page-heading h1')).toBeVisible();
}
async function records(page: Page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('siikawa-local-v1');
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const result: Record<string, unknown[]> = {};
    for (const store of ['sessions', 'attempts', 'reviews', 'rewards', 'purchases']) {
      const request = db.transaction(store).objectStore(store).getAll();
      result[store] = await new Promise<unknown[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    db.close();
    return result as {
      sessions: Session[];
      attempts: Attempt[];
      reviews: ReviewState[];
      rewards: Reward[];
      purchases: Purchase[];
    };
  });
}
async function answerVisibleQuestion(page: Page, deliberatelyWrong = false) {
  await expect(page.locator('.question-panel')).toBeVisible();
  const prompt = (await page.locator('.question-prompt').innerText()).trim();
  if (await page.locator('.rubric-list').isVisible()) {
    const checks = page.locator('.rubric-list input');
    for (let index = 0; index < 3; index++) await checks.nth(index).check();
  } else if (await page.locator('#concept-answer').isVisible()) {
    const principle = principles.find((item) => prompt.includes(item.summary));
    expect(principle, `개념어 문제의 실제 원리 매칭: ${prompt}`).toBeDefined();
    await expect(page.locator('.question-principle')).not.toContainText(principle!.name);
    await page.locator('#concept-answer').fill(principle!.conceptAnswers[0]);
  } else {
    const question = questions.find((item) => item.prompt.trim() === prompt);
    expect(question, `실제 원리장 JSON에서 문제 매칭: ${prompt}`).toBeDefined();
    const index = deliberatelyWrong ? (question!.correctIndex + 1) % 4 : question!.correctIndex;
    await page.locator('.choices .choice').nth(index).click();
  }
  await page.locator('.question-actions button').click();
  await expect(page.locator('.feedback')).toBeVisible();
  if (await page.locator('.passage').isVisible())
    await expect(page.locator('.passage mark')).toBeVisible();
}
async function advance(page: Page) {
  const before = await page.locator('.quest-top').innerText();
  await page.locator('.question-actions button').click();
  await expect
    .poll(async () =>
      (await page.locator('.quest-top').count())
        ? await page.locator('.quest-top').innerText()
        : 'completed',
    )
    .not.toBe(before);
}
async function finishVisibleSession(page: Page, wrongOnce = false) {
  await expect(page.locator('.question-panel')).toBeVisible();
  let wrongUsed = false,
    retests = 0,
    answered = 0;
  while (await page.locator('.question-panel').count()) {
    const phase = await page.locator('.question-meta .label-pill').innerText();
    const wrong = wrongOnce && !wrongUsed && phase === '원리 탐험';
    if (wrong) wrongUsed = true;
    if (phase === '오답 다시 도전') retests++;
    if (!(await page.locator('.feedback').count())) await answerVisibleQuestion(page, wrong);
    await advance(page);
    answered++;
    expect(answered).toBeLessThanOrEqual(32);
  }
  await expect(page.getByRole('heading', { name: '탐험을 마쳤어요!', exact: true })).toBeVisible();
  return { retests, answered };
}

test('20문제 탐험·오답 재도전·새로고침 재개·10문제 복습·백업 복원', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: mathDeck.title, exact: true })).toBeVisible();
  await page.getByRole('button', { name: '1회차 탐험 시작', exact: true }).click();
  await answerVisibleQuestion(page);
  await page.reload();
  await page.getByRole('button', { name: '1회차 이어 하기', exact: true }).click();
  await expect(page.locator('.feedback')).toBeVisible();
  await expect(page.locator('.quest-top')).toContainText('10 XP');
  await advance(page);
  const finished = await finishVisibleSession(page, true);
  expect(finished.retests).toBe(1);
  const afterLesson = await records(page);
  expect(afterLesson.sessions[0].status).toBe('completed');
  expect(afterLesson.sessions[0].steps).toHaveLength(21);
  expect(afterLesson.attempts).toHaveLength(21);
  expect(afterLesson.rewards.filter((reward) => reward.kind === 'completion')).toHaveLength(1);
  await page.reload();
  await navigate(page, '복습함');
  await page.getByRole('button', { name: '원리 테스트 시작', exact: true }).click();
  const review = await finishVisibleSession(page);
  expect(review.answered).toBe(10);
  const afterReview = await records(page);
  const testSession = afterReview.sessions.find((session) => session.kind === 'review')!;
  expect(testSession.status).toBe('completed');
  expect(testSession.steps.filter((step) => step.mode === 'choice')).toHaveLength(5);
  expect(testSession.steps.filter((step) => step.mode === 'recall')).toHaveLength(5);
  expect(
    afterReview.attempts
      .filter((attempt) => attempt.sessionId === testSession.id && attempt.mode === 'recall')
      .every((attempt) => attempt.usedHint),
  ).toBe(true);
  expect(testSession.xp).toBe(testSession.reviewMaxXp);
  await navigate(page, '설정');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '백업 파일 저장', exact: true }).click();
  const saved = await download;
  expect(saved.suggestedFilename()).toMatch(/^시이카와-\d{4}-\d{2}-\d{2}\.json$/);
  const backup = readFileSync((await saved.path())!, 'utf8');
  const json = JSON.parse(backup);
  expect(json.app).toBe('시이카와');
  expect(json.schemaVersion).toBe(1);
  await page.getByRole('button', { name: '초기화 옵션 열기', exact: true }).click();
  await page.getByRole('button', { name: '백업을 확인했고 초기화할게요', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('초기화');
  expect((await records(page)).attempts).toHaveLength(0);
  await page.locator('input[type=file]').setInputFiles({
    name: '시이카와-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(backup),
  });
  await expect(page.getByRole('status')).toContainText('복원');
  expect((await records(page)).attempts).toHaveLength(31);
  expect((await records(page)).rewards).toEqual(afterReview.rewards);
  await page.getByRole('button', { name: '밤', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  expect(errors).toEqual([]);
});

test('과목을 바꾸면 첫 기억 문제와 이어가기·새로고침 모두 선택한 원리장을 따른다', async ({
  page,
}) => {
  const physics = bank.find((deck) => deck.principles[0].subject === '물리')!;
  const chemistry = bank.find((deck) => deck.principles[0].subject === '화학')!;
  const expectedSessions = new Map<string, string>();
  async function selectDeck(deck: Deck) {
    const selector = page
      .locator('.deck-picker button')
      .filter({ hasText: deck.principles[0].subject });
    await selector.click();
    await expect(selector).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { name: deck.title, exact: true })).toBeVisible();
  }
  async function checkQuestionDeck(deck: Deck, index: number) {
    await expect(page.locator('.question-panel')).toBeVisible();
    await expect(page.locator('.question-meta .subject-tag')).toContainText(
      deck.principles[0].subject,
    );
    const snapshot = await records(page);
    const session = snapshot.sessions.find(
      (item) => item.deckId === deck.id && item.kind === 'lesson',
    )!;
    expect(session.index).toBe(index);
    const ownIds = new Set(deck.principles.map((principle) => principle.id));
    expect(session.steps.every((step) => step.principleIds.every((id) => ownIds.has(id)))).toBe(
      true,
    );
    if (expectedSessions.has(deck.id)) expect(session.id).toBe(expectedSessions.get(deck.id));
    else expectedSessions.set(deck.id, session.id);
  }
  async function leaveQuestion() {
    await page.getByRole('button', { name: '저장하고 나가기', exact: true }).click();
    await expect(page.locator('.page-heading h1')).toBeVisible();
  }
  await page.goto('/');
  for (const deck of [mathDeck, physics, chemistry]) {
    await selectDeck(deck);
    await page.getByRole('button', { name: '1회차 탐험 시작', exact: true }).click();
    await checkQuestionDeck(deck, 0);
    await answerVisibleQuestion(page);
    await advance(page);
    await leaveQuestion();
  }
  for (const deck of [mathDeck, physics]) {
    await selectDeck(deck);
    await page.getByRole('button', { name: '1회차 이어 하기', exact: true }).click();
    await checkQuestionDeck(deck, 1);
    await leaveQuestion();
  }
  await page.reload();
  await expect(page.getByRole('heading', { name: physics.title, exact: true })).toBeVisible();
  await page.getByRole('button', { name: '1회차 이어 하기', exact: true }).click();
  await checkQuestionDeck(physics, 1);
  const snapshot = await records(page);
  expect(snapshot.sessions).toHaveLength(3);
  expect(new Set(expectedSessions.values()).size).toBe(3);
  expect(snapshot.attempts).toHaveLength(3);
  expect(snapshot.rewards.reduce((sum, reward) => sum + reward.xp, 0)).toBe(30);
});

test('모든 원리장 필터와 검색은 진도·XP를 바꾸지 않는다', async ({ page }) => {
  await page.goto('/');
  await navigate(page, '나의 원리장');
  await expect(page.locator('.principle-card')).toHaveCount(
    principles.filter((principle) => !principle.retired).length,
  );
  for (const deck of bank) {
    await page.getByLabel('과목 필터').selectOption(deck.id);
    await expect(page.locator('.principle-card')).toHaveCount(
      deck.principles.filter((principle) => !principle.retired).length,
    );
  }
  await page.getByLabel('과목 필터').selectOption(mathDeck.id);
  await page.getByLabel('원리 검색').fill(mathDeck.principles[0].name);
  await expect(page.locator('.principle-card')).toHaveCount(1);
  await page.locator('.principle-card > summary').click();
  await expect(page.locator('.principle-content')).toBeVisible();
  await expect(page.locator('.example-list details')).toHaveCount(
    mathDeck.principles[0].variants.length,
  );
  await page.getByLabel('원리 검색').fill('찾을수없는원리12345');
  await expect(
    page.getByText('찾는 원리가 없어요. 다른 개념어로 검색해 보세요.', { exact: true }),
  ).toBeVisible();
  const snapshot = await records(page);
  expect(snapshot.attempts).toHaveLength(0);
  expect(snapshot.rewards).toHaveLength(0);
  await expect(page.locator('body')).not.toContainText(/영어 단어|수능 2,000/);
});

test('기존 세 친구와 미구매 배경 미리보기 차단', async ({ page }) => {
  await page.goto('/');
  await navigate(page, '복습함');
  await expect(page.getByRole('button', { name: '원리 테스트 시작', exact: true })).toBeDisabled();
  for (const avatar of avatarAssets) {
    await page
      .locator('.companion-picker')
      .getByRole('button', { name: new RegExp(avatar.name) })
      .click();
    await expect(page.getByTestId('avatar-room')).toHaveAttribute('data-avatar-id', avatar.id);
    await expect(
      page.getByTestId('avatar-room').locator('.avatar-room-open .room-scene-character image'),
    ).toHaveAttribute('href', avatar.path);
    await expect(
      page.getByTestId('avatar-room').locator('.avatar-room-open .room-scene-character > svg'),
    ).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  }
  await page.getByRole('button', { name: '방 꾸미기', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '방 꾸미기', exact: true });
  await expect(dialog).toBeVisible();
  const unowned = dialog.locator('[data-testid=room-item][data-owned=false]');
  expect(await unowned.count()).toBeGreaterThan(0);
  expect(await unowned.locator('.room-item-picture,.room-item-preview,svg,img').count()).toBe(0);
  await expect(dialog.locator('[data-item-id="mint-room"] .room-item-picture')).toBeVisible();
  await expect(unowned.first().getByRole('button')).toBeDisabled();
  await dialog.getByRole('tab', { name: '옷', exact: true }).click();
  expect(await dialog.locator('.room-item-preview').count()).toBeGreaterThan(3);
  await expect(dialog.locator('.room-item-preview--outfit .photo-outfit')).toHaveCount(13);
  await dialog.getByRole('tab', { name: '액세서리', exact: true }).click();
  expect(await dialog.locator('.room-item-preview').count()).toBeGreaterThan(3);
  await dialog.getByRole('button', { name: '꾸미기 닫기', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.reload();
  await navigate(page, '복습함');
  await expect(page.getByTestId('avatar-room')).toHaveAttribute('data-avatar-id', 'nova');
});

test('원리장 깊이 연습은 설명·응용을 저장하고 반복해도 XP를 주지 않는다', async ({ page }) => {
  const principle = mathDeck.principles[0];
  async function openPractice() {
    await navigate(page, '나의 원리장');
    await page.getByLabel('원리 검색').fill(principle.name);
    await page.locator('.principle-card > summary').click();
    await page.getByRole('button', { name: '이 원리 깊이 연습', exact: true }).click();
    await expect(page.locator('.quest-top')).toContainText('원리 깊이 연습');
  }
  await page.goto('/');
  await openPractice();
  await answerVisibleQuestion(page);
  await page.reload();
  await openPractice();
  await expect(page.locator('.feedback')).toBeVisible();
  await advance(page);
  await finishVisibleSession(page);
  let snapshot = await records(page);
  expect(snapshot.sessions).toHaveLength(1);
  expect(snapshot.sessions[0].kind).toBe('practice');
  expect(snapshot.sessions[0].baseCount).toBe(2);
  expect(snapshot.sessions[0].xp).toBe(0);
  expect(snapshot.reviews[0].activeDays).toHaveLength(1);
  expect(snapshot.reviews[0].missionDays).toHaveLength(1);
  expect(snapshot.rewards).toHaveLength(0);
  await openPractice();
  await finishVisibleSession(page);
  snapshot = await records(page);
  expect(snapshot.sessions).toHaveLength(2);
  expect(snapshot.attempts).toHaveLength(4);
  expect(snapshot.rewards).toHaveLength(0);
});

test('설치 가능한 앱 셸과 전체 원리장은 오프라인에서도 열린다', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.locator('.page-heading h1')).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // A freshly installed worker controls the next navigation; verify that state before cutting the network.
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), { timeout: 20000 })
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.page-heading h1')).toBeVisible();
  const cachedPhotos = await page.evaluate(
    async (assets) =>
      Promise.all(
        assets.map(async (asset) => {
          const response = await fetch(asset.path);
          const data = await response.arrayBuffer();
          const url = URL.createObjectURL(new Blob([data], { type: 'image/png' }));
          try {
            const image = new Image();
            image.src = url;
            await image.decode();
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const drawing = canvas.getContext('2d')!;
            drawing.drawImage(image, 0, 0);
            const pixels = drawing.getImageData(0, 0, canvas.width, canvas.height).data;
            let transparentPixels = 0,
              opaquePixels = 0;
            for (let offset = 3; offset < pixels.length; offset += 4) {
              if (pixels[offset] === 0) transparentPixels++;
              if (pixels[offset] >= 240) opaquePixels++;
            }
            const cornerOffsets = [
              0,
              canvas.width - 1,
              (canvas.height - 1) * canvas.width,
              canvas.width * canvas.height - 1,
            ];
            return {
              path: asset.path,
              status: response.status,
              mime: response.headers.get('content-type')?.split(';')[0],
              bytes: data.byteLength,
              pixelCount: canvas.width * canvas.height,
              transparentPixels,
              opaquePixels,
              cornerAlpha: cornerOffsets.map((offset) => pixels[offset * 4 + 3]),
            };
          } finally {
            URL.revokeObjectURL(url);
          }
        }),
      ),
    avatarAssets,
  );
  for (const [index, photo] of cachedPhotos.entries()) {
    const expected = avatarAssets[index];
    expect(photo).toMatchObject({
      path: expected.path,
      status: 200,
      mime: 'image/png',
      bytes: expected.bytes,
    });
    expect(photo.transparentPixels).toBeGreaterThan(photo.pixelCount * 0.05);
    expect(photo.opaquePixels).toBeGreaterThan(photo.pixelCount * 0.1);
    expect(photo.cornerAlpha).toEqual([0, 0, 0, 0]);
  }
  await navigate(page, '나의 원리장');
  await expect(page.locator('.principle-card')).toHaveCount(
    principles.filter((principle) => !principle.retired).length,
  );
  await navigate(page, '오늘의 탐험');
  await page.getByRole('button', { name: '1회차 탐험 시작', exact: true }).click();
  await answerVisibleQuestion(page);
  expect((await records(page)).attempts).toHaveLength(1);
  await context.setOffline(false);
});
