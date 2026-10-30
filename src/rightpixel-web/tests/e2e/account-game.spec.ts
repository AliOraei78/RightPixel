import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
const pack = JSON.parse(
  readFileSync(
    new URL('../../../../content/csharp/generated/csharp-mastery.json', import.meta.url),
    'utf8',
  ),
);
async function fixture(page: Page, authenticated = true) {
  let user: any = {
    version: 2,
    id: 'test-player',
    playerName: 'قهرمان آزمایشی',
    avatarId: 'avatar-12',
    xp: 0,
    level: 1,
    title: 'کارآموز',
    hp: 3,
    maxHp: 3,
    coins: 100,
    streak: 0,
    bestStreak: 0,
    activeNodeId: null,
    lastSavedAt: new Date().toISOString(),
    completedNodes: [],
    unlocks: [],
  };
  const checkpoints = new Map(),
    rounds = new Map();
  const clean = (v: any): any =>
    Array.isArray(v)
      ? v.map(clean)
      : v && typeof v === 'object'
        ? Object.fromEntries(
            Object.entries(v)
              .filter(
                ([k]) =>
                  !k.startsWith('correct') && !['buggyLineIndex', 'solutionCode'].includes(k),
              )
              .map(([k, v]) => [k, clean(v)]),
          )
        : v;
  await page.route('**/api/**', async (route) => {
    const r = route.request(),
      path = new URL(r.url()).pathname,
      method = r.method(),
      body = r.postData() ? r.postDataJSON() : null;
    let value: any = {};
    if (path === '/api/auth/session') value = { authenticated };
    else if (path === '/api/auth/pending') value = { email: null, remainingSeconds: 0 };
    else if (path === '/api/auth/csrf') value = { token: 'test-csrf' };
    else if (['/api/auth/register', '/api/auth/code', '/api/auth/resend'].includes(path))
      value = { remainingSeconds: 120 };
    else if (path === '/api/auth/verify') {
      value = { authenticated: false, requiresPasswordSetup: true };
    } else if (path === '/api/auth/password' || path === '/api/auth/login') {
      authenticated = true;
      value = { authenticated: true };
    } else if (path === '/api/auth/logout') {
      authenticated = false;
      value = { authenticated: false };
    } else if (path === '/api/player') value = user;
    else if (path === '/api/player/profile') {
      user = { ...user, ...body };
      value = user;
    } else if (path === '/api/worlds') value = [pack.world];
    else if (path.endsWith('/stages')) value = pack.stages.map(({ nodes, ...s }: any) => s);
    else if (path.startsWith('/api/stages/'))
      value = pack.stages
        .find((s: any) => s.id === path.split('/')[3])
        .nodes.map((n: any) => ({
          ...n,
          payload: {},
          isLocked: false,
          hint: null,
          explanation: null,
        }));
    else if (path.includes('/nodes/')) {
      const id = path.split('/')[3],
        node = pack.stages.flatMap((s: any) => s.nodes).find((n: any) => n.id === id);
      if (path.endsWith('/checkpoint')) {
        if (method === 'PATCH')
          checkpoints.set(id, { revision: body.revision + 1, state: body.state });
        value = checkpoints.get(id) ?? { revision: 0, state: {} };
      } else if (path.endsWith('/start')) {
        user.activeNodeId = id;
        value = {
          attemptId: '11111111-2222-3333-4444-555555555555',
          deadline: new Date(Date.now() + 600000).toISOString(),
          roundIndex: rounds.get(id) ?? 0,
          state: user,
        };
      } else if (path.endsWith('/answer')) {
        const current = rounds.get(id) ?? 0,
          done = node.type !== 'boss_fight' || current === 2;
        if (!done) {
          rounds.set(id, current + 1);
          checkpoints.set(id, { revision: 0, state: {} });
        } else
          user.completedNodes.push({
            nodeId: id,
            completedAt: new Date().toISOString(),
            attempts: 1,
            xpEarned: node.xpReward,
          });
        value = {
          correct: true,
          nodeCompleted: done,
          nextNodeId: null,
          earnedXp: done ? node.xpReward : 0,
          earnedCoins: 15,
          state: user,
          explanation: 'آزمایش موفق بود.',
        };
      } else value = clean(node);
    }
    await route.fulfill({ json: value });
  });
}
async function openRoom(page: Page, stage: string, node: string) {
  await page.goto('/#/dungeon');
  await expect(page.locator('#content')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#map')).toBeVisible();
  const d = page.locator(`details[data-stage-id="${stage}"]`);
  if ((await d.getAttribute('open')) === null) await d.locator('summary').click();
  await d.locator(`button[data-node-id="${node}"]`).click();
  await expect(page.locator('#challenge')).toBeVisible();
}
test('registration and profile have 48 avatars', async ({ page }) => {
  await fixture(page, false);
  await page.goto('/');
  await page.getByRole('button', { name: 'شروع سفر', exact: true }).click();
  await expect(page.locator('.avatar-grid button')).toHaveCount(
    (page.viewportSize()?.width ?? 1366) <= 520 ? 6 : 12,
  );
  await page.getByLabel('ایمیل', { exact: true }).fill('learner@example.com');
  await page.getByLabel('نام بازیکن', { exact: true }).fill('قهرمان');
  for (let i = 0; i < ((page.viewportSize()?.width ?? 1366) <= 520 ? 7 : 3); i++)
    await page.getByRole('button', { name: 'بعدی', exact: true }).click();
  await page.getByRole('button', { name: 'قهرمان 48', exact: true }).click();
  await page.getByRole('button', { name: 'دریافت کد', exact: true }).click();
  await expect(page.locator('#resend')).toBeDisabled();
  await page.getByLabel('کد تأیید', { exact: true }).fill('12');
  await page.getByRole('button', { name: 'تأیید ایمیل', exact: true }).click();
  await expect(page.locator('.field-error:visible')).toContainText('کد باید دقیقاً');
  await page.getByLabel('کد تأیید', { exact: true }).fill('۱۲۳۴۵۶');
  await expect(page.getByLabel('کد تأیید', { exact: true })).toHaveValue('123456');
  await page.getByRole('button', { name: 'تأیید ایمیل', exact: true }).click();
  await page.getByLabel('رمز جدید', { exact: true }).fill('UiCheck1!');
  await page.getByLabel('تکرار رمز', { exact: true }).fill('UiCheck1!');
  await page.getByRole('button', { name: 'ذخیرهٔ رمز', exact: true }).click();
  await page.getByRole('link', { name: /پروفایل/ }).click();
  await expect(page.locator('#content .profile input')).toHaveCount(1);
  await expect(page.locator('.avatar-grid button')).toHaveCount(
    (page.viewportSize()?.width ?? 1366) <= 520 ? 6 : 12,
  );
  await expect(page.getByText('تالار انتقام', { exact: true })).toHaveCount(0);
});
test('dialogue checkpoint and responsive scene', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await fixture(page);
  await openRoom(page, 'cs_s01', 'cs_s01_n0');
  const bubble = page.locator('.dialogue-bubble');
  await bubble.click();
  await bubble.click();
  await expect(page.getByText('ذخیره شد', { exact: true })).toBeVisible();
  await page.reload();
  await expect(bubble).toBeAttached();
  await page
    .locator('.npc-speech .speech-actions')
    .getByRole('button', { name: 'ادامه', exact: true })
    .click();
  const sizes =
    info.project.name === 'chrome-desktop'
      ? [
          [320, 568],
          [360, 667],
          [390, 844],
          [768, 1024],
          [1024, 768],
          [1366, 768],
          [1920, 1080],
          [2560, 1440],
          [844, 390],
        ]
      : [[390, 844]];
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      .toBeTruthy();
    if ([320, 1366, 2560].includes(width))
      await page.screenshot({ path: info.outputPath(`scene-${width}.png`), fullPage: true });
  }
  expect(errors).toEqual([]);
});
test('pilot selection and boss round resume', async ({ page }) => {
  await fixture(page);
  await openRoom(page, 'cs_s01', 'cs_s01_pilot');
  if (await page.getByRole('button', { name: 'جواب من', exact: true }).isVisible())
    await page.getByRole('button', { name: 'جواب من', exact: true }).click();
  await page.getByRole('button', { name: 'کد C#', exact: true }).click();
  await expect(page.locator('.pilot-board button')).toHaveCount(1);
  await expect(page.getByText('ذخیره شد', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('.pilot-board button')).toHaveCount(1);
  await page.goto('/#/profile');
  await openRoom(page, 'cs_s05', 'cs_s05_pilot');
  await expect(page.locator('#challenge')).toContainText('دور 1 از ۳');
  if (await page.getByRole('button', { name: 'جواب من', exact: true }).isVisible())
    await page.getByRole('button', { name: 'جواب من', exact: true }).click();
  await page.getByRole('button', { name: 'اجرای آزمایش', exact: true }).click();
  await page.getByRole('button', { name: 'دور بعد نبرد', exact: true }).click();
  await expect(page.locator('#challenge')).toContainText('دور 2 از ۳');
  await page.reload();
  await expect(page.locator('#challenge')).toContainText('دور 2 از ۳');
});

test('welcome never starts a room and handles a failed session check', async ({ page }) => {
  await fixture(page, true);
  let starts = 0;
  page.on('request', (r) => {
    if (r.url().endsWith('/start')) starts++;
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'ادامهٔ سفر', exact: true })).toBeVisible();
  expect(starts).toBe(0);
  await page.getByRole('button', { name: 'ادامهٔ سفر', exact: true }).click();
  await expect(page).toHaveURL(/#\/dungeon/);
});
test('public introduction remains visible when API fails', async ({ page }) => {
  await page.route('**/api/**', (r) => r.abort());
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'C# رو با حل معما و شکست نگهبان‌ها یاد بگیر' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'تلاش دوباره' })).toBeVisible();
  await expect(page.locator('form')).toHaveCount(0);
});

test('SMTP error stays visible on verification screen', async ({ page }) => {
  await fixture(page, false);
  await page.route('**/api/auth/code', (r) =>
    r.fulfill({ status: 503, json: { title: 'ارسال ایمیل تأیید نشد.' } }),
  );
  await page.goto('/#/forgot-password');
  await page.getByLabel('ایمیل', { exact: true }).fill('a@example.com');
  await page.getByRole('button', { name: 'دریافت کد', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('ارسال ایمیل تأیید نشد.');
  await expect(page).toHaveURL(/verify-email/);
});

test('technical names stay LTR inside friendly Persian', async ({ page }) => {
  await fixture(page, false);
  await page.goto('/');
  await expect(page.locator('.welcome h1 bdi')).toHaveText('C#');
  await expect(page.locator('.welcome h1 bdi')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('.welcome-features')).toContainText('یه قدم');
  await page.evaluate(() => {
    const p = document.createElement('p');
    p.id = 'mixed-example';
    p.textContent = 'با C# و .NET کار می‌کند.';
    document.querySelector('#app')!.append(p);
  });
  await expect(page.locator('#mixed-example bdi')).toHaveText(['C#', '.NET']);
  await expect(page.locator('#mixed-example')).toContainText('می‌کنه');
});

test('auth cards fit the viewport and show custom Persian validation', async ({ page }, info) => {
  await fixture(page, false);
  let sends = 0;
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.url().endsWith('/auth/login')) sends++;
  });
  await page.goto('/#/login');
  const email = page.getByLabel('ایمیل', { exact: true });
  await expect(email).toBeVisible();
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [1366, 768],
    [2560, 1440],
  ]) {
    await page.setViewportSize({ width, height });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      .toBeTruthy();
    if (info.project.name === 'chrome-desktop' && width === 1366)
      await page.screenshot({ path: info.outputPath('login-layout.png') });
  }
  await page.getByRole('button', { name: 'ورود', exact: true }).click();
  await expect(page.locator('.field-error:visible').first()).toContainText('ایمیلت رو وارد کن');
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  expect(await page.locator('form').evaluate((form: HTMLFormElement) => form.noValidate)).toBe(
    true,
  );
  await email.fill('invalid-email');
  await page.getByRole('button', { name: 'ورود', exact: true }).click();
  await expect(page.locator('.field-error:visible').first()).toContainText('این ایمیل درست');
  expect(sends).toBe(0);
});
test('welcome actions share dimensions', async ({ page }) => {
  await fixture(page, false);
  await page.goto('/');
  const primary = page.locator('#begin'),
    secondary = page.locator('.welcome-actions>.button-link');
  await expect(primary).toBeEnabled();
  const a = await primary.boundingBox(),
    b = await secondary.boundingBox();
  expect(Math.abs(a!.width - b!.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(a!.height - b!.height)).toBeLessThanOrEqual(1);
});

test('tablet answers stay reachable and desktop panels match characters', async ({ page }) => {
  await fixture(page);
  await page.setViewportSize({ width: 768, height: 1024 });
  await openRoom(page, 'cs_s01', 'cs_s01_n1');
  const choose = page.getByRole('button', { name: 'جواب من', exact: true });
  await expect(choose).toBeVisible();
  await choose.click();
  await expect(page.locator('.player-choices button').first()).toBeVisible();
  await page.getByRole('button', { name: 'سؤال رو دوباره ببین' }).click();
  await expect(choose).toBeVisible();
  await page.setViewportSize({ width: 1366, height: 768 });
  const npc = await page.locator('.npc-speech').boundingBox(),
    player = await page.locator('.player-speech').boundingBox();
  expect(npc!.x).toBeLessThan(player!.x);
  expect(
    await page
      .locator('.player-choices')
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length),
  ).toBe(2);
});

test('result stays outside reading pages and completed attempts never save pages', async ({
  page,
}) => {
  await fixture(page);
  await page.setViewportSize({ width: 768, height: 1024 });
  const node = structuredClone(pack.stages[0].nodes.find((n: any) => n.id === 'cs_s01_n1'));
  node.payload.clues = ['متن بلند سؤال برای بررسی صفحه بندی. '.repeat(300)];
  await page.route('**/api/nodes/cs_s01_n1', (r) => r.fulfill({ json: node }));
  let saves = 0;
  page.on('request', (r) => {
    if (r.method() === 'PATCH' && r.url().endsWith('/checkpoint')) saves++;
  });
  await openRoom(page, 'cs_s01', 'cs_s01_n1');
  await page.getByRole('button', { name: 'جواب من', exact: true }).click();
  await page.locator('.player-choices button').first().click();
  await expect(page.locator('#feedback')).toContainText('درست!');
  expect(await page.locator('#feedback').evaluate((el) => !!el.closest('.reading-pages'))).toBe(
    false,
  );
  await expect(page.locator('#feedback')).toBeInViewport();
  const before = saves;
  await page
    .locator('.npc-speech .reading-navigation')
    .getByRole('button', { name: 'بعدی', exact: true })
    .click();
  await page.waitForTimeout(250);
  expect(saves).toBe(before);
  await expect(page.locator('#feedback')).toContainText('درست!');
});

test('typing restores saved reading page after the full text appears', async ({ page }) => {
  await fixture(page);
  await page.setViewportSize({ width: 768, height: 1024 });
  const node = structuredClone(pack.stages[0].nodes.find((n: any) => n.id === 'cs_s01_n0'));
  node.payload.dialogues = ['متن بلند برای بررسی بازیابی صفحه خواندن. '.repeat(200)];
  await page.route('**/api/nodes/cs_s01_n0', (r) => r.fulfill({ json: node }));
  await page.route('**/api/nodes/cs_s01_n0/checkpoint', (r) =>
    r.fulfill({ json: { revision: 0, state: { npcPage: 2, dialogueIndex: 0 } } }),
  );
  await openRoom(page, 'cs_s01', 'cs_s01_n0');
  await expect(page.locator('.dialogue-bubble')).toHaveAttribute('aria-busy', 'true');
  await page
    .locator('.npc-speech .speech-actions')
    .getByRole('button', { name: 'ادامه', exact: true })
    .click();
  await expect(page.locator('.npc-speech .reading-navigation span')).toHaveText(/^3 \/ /);
});

test('code previews mirror selection and disabled state; code keeps the timer visible', async ({
  page,
}) => {
  await fixture(page);
  await page.setViewportSize({ width: 1366, height: 900 });
  await openRoom(page, 'cs_s01', 'cs_s01_n4');
  const preview = page.locator('.code-preview').first();
  await preview.click();
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-label', 'کد کامل');
  await page.locator('.code-view .code-line').click();
  await expect(preview).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/#/profile');
  await openRoom(page, 'cs_s01', 'cs_s01_n6');
  await page.locator('.player-choices .code-preview').first().click();
  await page.locator('.code-view .code-line').click();
  await expect(page.locator('.player-choices .code-preview').first()).toBeDisabled();
  await page.goto('/#/profile');

  await openRoom(page, 'cs_s01', 'cs_s01_n3');
  await page.getByRole('button', { name: 'نمایش کامل کد', exact: true }).click();
  await expect(page.locator('.code-view #timer')).toBeVisible();
  const before = await page.locator('.code-view #timer').textContent();
  await expect.poll(() => page.locator('.code-view #timer').textContent()).not.toBe(before);
  await page.keyboard.press('Escape');
  await expect(page.locator('.room-toolbar #timer')).toBeVisible();
});

test('all challenge types fit small, tablet, desktop and landscape screens', async ({
  page,
}, info) => {
  await fixture(page);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const id of [
    'cs_s01_n1',
    'cs_s01_n3',
    'cs_s01_n4',
    'cs_s01_n5',
    'cs_s01_n6',
    'cs_s01_pilot',
  ]) {
    await page.goto('/#/profile');
    await openRoom(page, 'cs_s01', id);
    for (const [width, height] of [
      [320, 568],
      [768, 1024],
      [1366, 768],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
        .toBe(true);
      await expect(page.locator('.npc-speech')).toBeInViewport();
      if (width === 768) {
        await page.getByRole('button', { name: 'جواب من', exact: true }).click();
        await expect(page.locator('.player-speech')).toBeInViewport();
        if (info.project.name === 'chrome-desktop')
          await page.screenshot({ path: info.outputPath(`${id}-tablet.png`) });
        await page.getByRole('button', { name: 'سؤال رو دوباره ببین' }).click();
      }
      if (width === 1366 && info.project.name === 'chrome-desktop')
        await page.screenshot({ path: info.outputPath(`${id}-desktop.png`) });
    }
  }
  expect(errors).toEqual([]);
});

test('answer errors and incorrect results stay visible with recovery controls', async ({
  page,
}) => {
  await fixture(page);
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.route('**/api/nodes/cs_s01_n1/answer', (r) =>
    r.fulfill({ status: 503, json: { title: 'خطای آزمایشی پاسخ' } }),
  );
  await openRoom(page, 'cs_s01', 'cs_s01_n1');
  await page.getByRole('button', { name: 'جواب من', exact: true }).click();
  await page.locator('.player-choices button').first().click();
  await expect(page.locator('#feedback')).toContainText('خطای آزمایشی پاسخ');
  await expect(page.locator('#feedback')).toBeInViewport();
  await expect(
    page.getByRole('button', { name: 'ارسال دوبارهٔ پاسخ', exact: true }),
  ).toBeInViewport();
  await page.route('**/api/nodes/cs_s01_n1/answer', async (r) => {
    const state = await page.evaluate(async () => (await fetch('/api/player')).json());
    await r.fulfill({
      json: {
        correct: false,
        nodeCompleted: false,
        failureReason: 'incorrect_answer',
        nextNodeId: null,
        earnedXp: 0,
        earnedCoins: 0,
        explanation: 'پاسخ را بررسی کن.',
        state,
      },
    });
  });
  await page.getByRole('button', { name: 'ارسال دوبارهٔ پاسخ', exact: true }).click();
  await expect(page.locator('#feedback')).toContainText('دوباره تلاش کن');
  await expect(page.getByRole('button', { name: 'تلاش دوباره', exact: true })).toBeInViewport();
});

test('long titles remain readable and code timeout reveals the result', async ({ page }) => {
  await fixture(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const node = structuredClone(pack.stages[0].nodes.find((n: any) => n.id === 'cs_s01_n3'));
  node.title = 'عنوان بلند برای بررسی دسترسی به متن کامل '.repeat(20).trim();
  await page.route('**/api/nodes/cs_s01_n3', (r) => r.fulfill({ json: node }));
  await openRoom(page, 'cs_s01', 'cs_s01_n3');
  await expect(page.locator('#room-title')).toHaveAttribute('title', node.title.trim());
  expect(await page.locator('#room-title').evaluate((el) => getComputedStyle(el).overflowY)).toBe(
    'auto',
  );
  await page.getByRole('button', { name: 'نمایش کامل کد', exact: true }).click();
  await page.clock.install();
  await page.clock.fastForward(601000);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#feedback')).toContainText('درست!');
  await expect(page.locator('#feedback')).toBeInViewport();
});
