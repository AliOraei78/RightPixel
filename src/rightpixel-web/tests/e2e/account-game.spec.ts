import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { expandAbbreviations } from '../../src/ui/persian-copy';
const pack = JSON.parse(
  readFileSync(
    new URL('../../../../content/csharp/generated/csharp-mastery.json', import.meta.url),
    'utf8',
  ),
);
async function fixture(page: Page, authenticated = true, player: Record<string, unknown> = {}) {
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
    ...player,
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
  await expect(page.locator('#content')).toHaveAttribute('data-ready', 'true', { timeout: 15000 });
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
  const card = page.getByRole('button', { name: 'کد C#', exact: true });
  await card.focus();
  await card.press('Enter');
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

test('profile navigation uses an accessible icon on welcome and game pages', async ({
  page,
}, info) => {
  await fixture(page);
  for (const route of ['/', '/#/dungeon']) {
    await page.goto(route);
    const profile = page.getByRole('link', { name: 'پروفایل', exact: true });
    for (const width of [280, 390, 1366]) {
      await page.setViewportSize({ width, height: 844 });
      await expect(profile).toBeVisible();
      await expect(profile.locator('svg')).toBeVisible();
      await expect(profile).toHaveText('');
      const box = await profile.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
      if (info.project.name === 'chrome-desktop' && route === '/' && width === 1366)
        await page.screenshot({
          path: info.outputPath('welcome-profile-icon.png'),
          fullPage: true,
        });
    }
  }
  await page.getByRole('link', { name: 'پروفایل', exact: true }).click();
  await expect(page.locator('.profile form')).toBeVisible();
});

test('lesson text stays continuous and abbreviations expand without extra reading sections', async ({
  page,
}) => {
  await fixture(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const node = structuredClone(pack.stages[0].nodes[0]);
  node.payload.dialogues = [
    'پیش‌نیاز: یک مثال ساده',
    'CLI، CLR، IL، JIT، GC و API را در این متن مرور می‌کنیم. '.repeat(40) + 'پایان متن کامل.',
  ];
  await page.route('**/api/nodes/cs_s01_n0', (route) => route.fulfill({ json: node }));
  await openRoom(page, 'cs_s01', 'cs_s01_n0');
  const text = page.locator('.dialogue-bubble');
  await expect(text).toContainText('CLI (Common Language Infrastructure)');
  await expect(text.locator('bdi').first()).toHaveText('CLI (Common Language Infrastructure)');
  await expect(text).toContainText('CLR (Common Language Runtime)');
  await expect(text).toContainText('IL (Intermediate Language)');
  await expect(text).toContainText('پایان متن کامل.');
  await expect(page.locator('#challenge .learning-sources')).toHaveCount(0);
  await expect(page.locator('.npc-speech .reading-navigation')).toBeHidden();
  const body = page.locator('.npc-speech .continuous-reading');
  await expect(body).toHaveCSS('overflow-y', 'auto');
  expect(await body.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await body.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  expect(await body.evaluate((el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 2)).toBe(
    true,
  );
});

test('short question teaching opens without purchases, answers or clipped controls', async ({
  page,
}, info) => {
  await fixture(page);
  let answers = 0,
    purchases = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/answer')) answers++;
    if (request.url().includes('/purchase')) purchases++;
  });
  for (const id of [
    'cs_s01_n1',
    'cs_s01_n3',
    'cs_s01_n4',
    'cs_s01_n5',
    'cs_s01_n6',
    'cs_s01_pilot',
    'cs_s02_pilot',
    'cs_s04_pilot',
    'cs_s05_pilot',
  ]) {
    const node = pack.stages
      .flatMap((stage: any) => stage.nodes)
      .find((node: any) => node.id === id);
    await page.goto(`/#/play/${id}`);
    await expect(page.locator('#room-title')).toHaveAttribute(
      'title',
      expandAbbreviations(node.title.replace(/^S\d+\s*·\s*(?:درس:\s*)?/, '')),
    );
    for (const [width, height] of [
      [280, 653],
      [390, 844],
      [1366, 768],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      await page.getByRole('button', { name: 'آموزش کوتاه این سؤال', exact: true }).click();
      const help = page.getByRole('dialog', { name: 'آموزش کوتاه این سؤال', exact: true });
      await expect(help).toBeInViewport();
      await expect(help.locator('p')).toHaveCount(3);
      await expect(help.locator('pre')).toHaveCount(0);
      await expect(help.getByRole('button', { name: 'بستن', exact: true })).toBeInViewport();
      expect(await help.textContent()).not.toMatch(/پاسخ درست|گزینهٔ درست|جواب سؤال/);
      const box = await help.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
      expect(box!.y + box!.height).toBeLessThanOrEqual(height + 1);
      if (
        info.project.name === 'chrome-desktop' &&
        id === 'cs_s01_n1' &&
        [280, 1366].includes(width)
      )
        await page.screenshot({ path: info.outputPath(`short-teaching-${width}.png`) });
      await page.keyboard.press('Escape');
      await expect(help).not.toBeVisible();
    }
  }
  expect(answers).toBe(0);
  expect(purchases).toBe(0);
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
  await expect(page.locator('#feedback')).toHaveCSS('text-align', 'center');
  await expect(page.locator('#feedback')).toHaveCSS('direction', 'rtl');
  expect(await page.locator('#feedback').evaluate((el) => !!el.closest('.reading-pages'))).toBe(
    false,
  );
  await expect(page.locator('#feedback')).toBeInViewport();
  const before = saves;
  const reading = page.locator('.npc-speech .speech-content');
  await expect(reading).toHaveCSS('overflow-y', 'auto');
  await reading.evaluate((element) => {
    element.scrollTop = 500;
  });
  await page.waitForTimeout(250);
  expect(saves).toBe(before);
  await expect(page.locator('#feedback')).toContainText('درست!');
});

test('typing restores continuous reading position after the full text appears', async ({
  page,
}) => {
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
  await expect(page.locator('.npc-speech .reading-navigation')).toBeHidden();
  await expect
    .poll(() => page.locator('.npc-speech .speech-content').evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
});

test('dialogue reading width stays stable when Continue adds or removes text overflow', async ({
  page,
}) => {
  await fixture(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  const node = structuredClone(pack.stages[0].nodes[0]);
  node.payload.dialogues = [
    'متن کوتاه اول.',
    'متن بلند برای بررسی خواندن بدون پرش. '.repeat(80),
    'متن کوتاه بعدی.',
  ];
  await page.route('**/api/nodes/cs_s01_n0', (route) => route.fulfill({ json: node }));
  await openRoom(page, 'cs_s01', 'cs_s01_n0');
  const reading = page.locator('.npc-speech .speech-content');
  const width = await reading.evaluate((el) => el.clientWidth);
  const next = page
    .locator('.npc-speech .speech-actions')
    .getByRole('button', { name: 'ادامه', exact: true });
  await next.click();
  await expect(page.locator('.dialogue-bubble')).toContainText('بدون پرش');
  expect(await reading.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  expect(await reading.evaluate((el) => el.clientWidth)).toBe(width);
  await next.click();
  await expect(page.locator('.dialogue-bubble')).toHaveText('متن کوتاه بعدی.');
  expect(await reading.evaluate((el) => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
  expect(await reading.evaluate((el) => el.clientWidth)).toBe(width);
});

test('left click in the dialogue card completes typing without advancing', async ({ page }) => {
  await fixture(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const node = structuredClone(pack.stages[0].nodes[0]);
  const text = 'متن آزمایشی برای سنجش کلیک چپ. '.repeat(30) + 'پایان متن.';
  node.payload.dialogues = [text, 'متن بعدی.'];
  await page.route('**/api/nodes/cs_s01_n0', (route) => route.fulfill({ json: node }));
  let answers = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/answer')) answers++;
  });
  await openRoom(page, 'cs_s01', 'cs_s01_n0');
  const bubble = page.locator('.dialogue-bubble');
  await expect(bubble).toHaveAttribute('aria-busy', 'true');
  await page.locator('.npc-speech .speaker-heading').click({ button: 'left' });
  await expect(bubble).toHaveAttribute('aria-busy', 'false');
  await expect(bubble).toContainText('پایان متن.');
  await expect(bubble).toHaveAttribute('data-dialogue-index', '0');
  expect(answers).toBe(0);
  await page
    .locator('.npc-speech .speech-actions')
    .getByRole('button', { name: 'ادامه', exact: true })
    .click();
  await expect(bubble).toHaveAttribute('data-dialogue-index', '1');
});

test('review arrows browse completed text and rooms within a phase without changing the save', async ({
  page,
}) => {
  const completed = ['cs_s01_n0', 'cs_s01_n1', 'cs_s02_n0', 'cs_s06_n0'].map((nodeId) => ({
    nodeId,
    completedAt: new Date().toISOString(),
    attempts: 1,
    xpEarned: 25,
  }));
  await fixture(page, true, {
    activeNodeId: 'cs_s02_n3',
    xp: 1234,
    coins: 678,
    completedNodes: completed,
  });
  await page.route('**/api/nodes/cs_s01_n0/checkpoint', (route) =>
    route.fulfill({ json: { revision: 7, state: { dialogueIndex: 2, npcPage: 0 } } }),
  );
  const writes: string[] = [];
  page.on('request', (request) => {
    if (['POST', 'PATCH', 'DELETE'].includes(request.method()))
      writes.push(new URL(request.url()).pathname);
  });
  await openRoom(page, 'cs_s01', 'cs_s01_n0');
  await expect(page).toHaveURL(/review\/cs_s01_n0$/);
  await expect(page.locator('.dialogue-bubble')).toHaveAttribute('data-dialogue-index', '2');
  await page.getByRole('button', { name: /بخش قبلی/ }).click();
  await expect(page.locator('.dialogue-bubble')).toHaveAttribute('data-dialogue-index', '1');
  await expect(page.getByRole('button', { name: /بخش قبلی/ })).toBeDisabled();
  await page.getByRole('button', { name: /بخش بعدی/ }).click();
  await expect(page.locator('.dialogue-bubble')).toHaveAttribute('data-dialogue-index', '2');
  const navigation = page.getByRole('navigation', { name: 'مرور قسمت‌های تکمیل‌شدهٔ فاز' });
  for (const [width, height] of [
    [280, 653],
    [390, 844],
    [768, 1024],
    [1366, 768],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(navigation).toBeVisible();
    const navigationBox = await navigation.boundingBox();
    expect(navigationBox!.width).toBeLessThanOrEqual(Math.min(width, 680) + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    for (const button of await navigation.locator('button').all()) {
      const box = await button.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  }
  await expect(navigation.getByRole('button', { name: /قسمت قبلی/ })).toBeDisabled();
  await navigation.getByRole('button', { name: /قسمت بعدی/ }).click();
  await expect(page).toHaveURL(/review\/cs_s01_n1$/);
  await expect(page.locator('.player-choices button').first()).toBeDisabled();
  await navigation.getByRole('button', { name: /قسمت بعدی/ }).click();
  await expect(page).toHaveURL(/review\/cs_s02_n0$/);
  await expect(navigation.getByRole('button', { name: /قسمت بعدی/ })).toBeDisabled();
  await page.goto('/#/review/cs_s01_n2');
  await expect(page.getByRole('alert')).toContainText('این قسمت هنوز تکمیل نشده.');
  expect(writes).toEqual([]);
  const state = await page.evaluate(() => fetch('/api/player').then((response) => response.json()));
  expect(state.activeNodeId).toBe('cs_s02_n3');
  expect(state.xp).toBe(1234);
  expect(state.coins).toBe(678);
  expect(state.completedNodes).toEqual(completed);
});

test('review navigation keeps the painted scene through slow loading and failed requests', async ({
  page,
}) => {
  await fixture(page, true, {
    completedNodes: ['cs_s01_n0', 'cs_s01_n1'].map((nodeId) => ({
      nodeId,
      completedAt: new Date().toISOString(),
    })),
  });
  await page.goto('/#/review/cs_s01_n0');
  await expect(page.locator('.review-navigation')).toBeVisible();
  let releaseNode!: () => void, releaseCheckpoint!: () => void;
  const nodeGate = new Promise<void>((resolve) => {
    releaseNode = resolve;
  });
  const checkpointGate = new Promise<void>((resolve) => {
    releaseCheckpoint = resolve;
  });
  let nodeWaiting = false,
    checkpointWaiting = false;
  await page.route('**/api/nodes/cs_s01_n1', async (route) => {
    nodeWaiting = true;
    await nodeGate;
    await route.fallback();
  });
  await page.route('**/api/nodes/cs_s01_n1/checkpoint', async (route) => {
    checkpointWaiting = true;
    await checkpointGate;
    await route.fallback();
  });
  await page.evaluate(() => {
    const state = window as typeof window & {
      sceneGaps: string[];
      watchScene: boolean;
      oldCanvas: Element | null;
    };
    state.sceneGaps = [];
    state.watchScene = true;
    state.oldCanvas = document.querySelector('.dungeon-canvas');
    const sample = () => {
      const canvas = document.querySelector<HTMLCanvasElement>('.dungeon-canvas');
      if (!canvas?.checkVisibility() || !canvas.getContext('2d')?.getImageData(0, 0, 1, 1).data[3])
        state.sceneGaps.push('missing or unpainted scene');
      if (state.watchScene) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  const next = page.locator('.review-navigation').getByRole('button', { name: /قسمت بعدی/ });
  await next.click();
  await expect.poll(() => nodeWaiting).toBe(true);
  const oldSceneRemains = () =>
    page.evaluate(
      () =>
        (window as typeof window & { oldCanvas: Element }).oldCanvas ===
        document.querySelector('.dungeon-canvas'),
    );
  expect(await oldSceneRemains()).toBe(true);
  releaseNode();
  await expect.poll(() => checkpointWaiting).toBe(true);
  expect(await oldSceneRemains()).toBe(true);
  releaseCheckpoint();
  await expect(page).toHaveURL(/review\/cs_s01_n1$/);
  expect(await oldSceneRemains()).toBe(false);
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  const gaps = await page.evaluate(() => {
    const state = window as typeof window & { sceneGaps: string[]; watchScene: boolean };
    state.watchScene = false;
    return state.sceneGaps;
  });
  expect(gaps).toEqual([]);
  await page.route('**/api/nodes/cs_s01_n0', (route) =>
    route.fulfill({ status: 503, json: { title: 'خطای آزمایشی' } }),
  );
  await page
    .locator('.review-navigation')
    .getByRole('button', { name: /قسمت قبلی/ })
    .click();
  await expect(page.getByRole('alert')).toContainText('خطای آزمایشی');
  await expect(page.locator('.dungeon-canvas')).toBeVisible();
  await expect(page).toHaveURL(/review\/cs_s01_n1$/);
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
  const contrast = await preview.evaluate((element) => {
    const luminance = (color: string) =>
      color
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number)
        .map((value) => value / 255)
        .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
        .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const style = getComputedStyle(element);
    const text = luminance(style.color),
      background = luminance(style.backgroundColor);
    return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
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
  await expect(page.locator('#room-title')).toHaveAttribute(
    'title',
    expandAbbreviations(node.title.trim()),
  );
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

test('profile and map fit a maximum length player name at every breakpoint', async ({
  page,
}, info) => {
  await fixture(page);
  await page.goto('/#/profile');
  const name = 'قهرمان'.repeat(8) + 'اب';
  await page.getByLabel('نام بازیکن', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'ذخیرهٔ تغییرات', exact: true }).click();
  await expect(page.locator('.hud .identity strong')).toHaveText(name);
  for (const route of ['', 'profile', 'dungeon', 'play/cs_s01_n1']) {
    await page.goto(`/#/${route}`);
    await expect(
      page.locator(
        route === ''
          ? '#welcome-identity strong'
          : route === 'profile'
            ? '.profile form'
            : route === 'dungeon'
              ? '#map'
              : '#challenge',
      ),
    ).toBeVisible();
    for (const [width, height] of [
      [320, 568],
      [650, 800],
      [768, 1024],
      [1024, 768],
      [1366, 768],
      [2560, 1440],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
        .toBe(true);
      if (route.startsWith('play/')) {
        const choose = page.getByRole('button', { name: 'جواب من', exact: true });
        if (await choose.isVisible()) await choose.click();
        await expect
          .poll(() =>
            page
              .locator('.player-speech .speaker-heading')
              .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
          )
          .toBe(true);
        if (info.project.name === 'chrome-desktop' && width === 320)
          await page.screenshot({ path: info.outputPath('long-name-answers-mobile.png') });
        const question = page.getByRole('button', { name: 'سؤال رو دوباره ببین', exact: true });
        if (await question.isVisible()) await question.click();
      }
      if (info.project.name === 'chrome-desktop' && [320, 768, 1366].includes(width))
        await page.screenshot({
          path: info.outputPath(`${route.replace('/', '-')}-${width}.png`),
          fullPage: true,
        });
      if (route !== '') {
        await page.locator('.game-settings > summary').click();
        await expect(page.locator('.settings-close')).toBeInViewport();
        await page.locator('.settings-close').click();
      }
    }
  }
});

test('responsive audit keeps reading space and controls inside each room', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await fixture(page, true, { playerName: 'قهرمان'.repeat(8) + 'اب' });
  const issues: string[] = [];
  for (const id of [
    'cs_s01_n0',
    'cs_s01_n1',
    'cs_s01_n3',
    'cs_s01_n4',
    'cs_s01_n5',
    'cs_s01_n6',
    'cs_s01_pilot',
    'cs_s02_pilot',
    'cs_s04_pilot',
    'cs_s05_pilot',
  ]) {
    await page.goto(`/#/play/${id}`);
    const node = pack.stages
      .flatMap((stage: any) => stage.nodes)
      .find((node: any) => node.id === id);
    await expect(page.locator('#room-title')).toHaveAttribute(
      'title',
      expandAbbreviations(node.title.replace(/^S\d+\s*·\s*(?:درس:\s*)?/, '')),
    );
    await expect(page.locator('#challenge')).toBeVisible();
    for (const [width, height] of [
      [280, 653],
      [320, 480],
      [520, 740],
      [651, 800],
      [801, 900],
      [1024, 600],
      [320, 601],
      [800, 651],
      [801, 651],
      [1024, 651],
      [1280, 720],
      [1366, 700],
      [1366, 768],
      [1440, 900],
      [1536, 864],
      [1920, 1080],
      [2535, 1363],
      [2560, 1440],
      [568, 320],
      [844, 390],
      [480, 280],
    ]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => document.fonts.ready);
      const choose = page.getByRole('button', { name: 'جواب من', exact: true });
      for (const speaker of ['npc', 'player']) {
        if (speaker === 'player') {
          if (!(await choose.isVisible())) continue;
          await choose.click();
        }
        await page.evaluate(
          () =>
            new Promise((resolve) =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => requestAnimationFrame(resolve)),
              ),
            ),
        );
        const found = await page.evaluate(() => {
          const errors: string[] = [];
          if (document.documentElement.scrollWidth > innerWidth + 1)
            errors.push('horizontal overflow');
          const canvas = document.querySelector<HTMLCanvasElement>('.dungeon-canvas')!;
          const scene = canvas.getBoundingClientRect();
          const scale = canvas.width / scene.width;
          const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
          const palette = new Set([
            '155,181,204',
            '237,198,166',
            '23,34,48',
            '128,221,205',
            '237,247,249',
            '237,200,117',
            '175,145,225',
            '66,51,93',
            '236,139,146',
            '138,186,115',
            '51,64,76',
            '241,160,91',
          ]);
          const controls = document.querySelector('.scene-hotspots')!.getBoundingClientRect();
          for (const container of ['#arena', '.game-map']) {
            const box = document.querySelector(container)!.getBoundingClientRect();
            if (controls.bottom > box.bottom + 1)
              errors.push(`${container}: scene controls outside frame`);
          }
          for (const [name, left, right, colors] of [
            ['npc', 0.04, 0.4, palette],
            [
              'player',
              0.6,
              0.98,
              new Set(['218,125,147', '223,177,139', '172,83,116', '28,36,52', '53,64,85']),
            ],
          ] as const) {
            let top = Infinity,
              bottom = -Infinity;
            for (
              let y = Math.max(0, canvas.height - Math.ceil((controls.height + 220) * scale));
              y < canvas.height;
              y++
            )
              for (let x = Math.floor(canvas.width * left); x < canvas.width * right; x++) {
                const i = (y * canvas.width + x) * 4;
                if (colors.has(`${pixels.data[i]},${pixels.data[i + 1]},${pixels.data[i + 2]}`)) {
                  top = Math.min(top, scene.top + y / scale);
                  bottom = Math.max(bottom, scene.top + (y + 1) / scale);
                }
              }
            if (bottom - top < 55) errors.push(`${name}: missing or too small`);
            if (bottom > controls.top - 4) errors.push(`${name}: overlaps scene controls`);
            for (const panel of document.querySelectorAll<HTMLElement>('#arena .speech')) {
              if (!panel.checkVisibility()) continue;
              if (panel.getBoundingClientRect().bottom > top - 2)
                errors.push(
                  `${name}: covered by dialogue (${Math.round(panel.getBoundingClientRect().bottom - top)}px)`,
                );
            }
          }
          for (const panel of document.querySelectorAll<HTMLElement>('#arena .speech')) {
            if (!panel.checkVisibility()) continue;
            if (panel.getBoundingClientRect().height > 361)
              errors.push(`${panel.className}: oversized dialogue`);
            const body = panel.querySelector<HTMLElement>('.speech-content')!;
            if (body.clientHeight < 40)
              errors.push(`${panel.className}: reading height ${body.clientHeight}`);
            for (const el of panel.querySelectorAll<HTMLElement>(
              '.reading-navigation, .speech-actions',
            )) {
              if (!el.checkVisibility()) continue;
              const box = el.getBoundingClientRect();
              const parent = panel.getBoundingClientRect();
              if (box.bottom > parent.bottom + 1 || box.top < parent.top)
                errors.push(`${el.className}: outside panel`);
            }
          }
          return errors;
        });
        issues.push(...found.map((issue) => `${id} ${width}x${height} ${speaker}: ${issue}`));
        if (
          info.project.name === 'chrome-desktop' &&
          id === 'cs_s01_n5' &&
          [280, 568, 768, 844, 1366, 2535].includes(width)
        )
          await page.screenshot({
            path: info.outputPath(`audit-${width}-${speaker}.png`),
            fullPage: true,
          });
        if (speaker === 'player') {
          const back = page.getByRole('button', { name: 'سؤال رو دوباره ببین' });
          if (await back.isVisible()) await back.click();
        }
      }
    }
  }
  expect(issues).toEqual([]);
});

test('public pages fit narrow screens, validation messages and long email addresses', async ({
  page,
}, info) => {
  await fixture(page, false);
  await page.route('**/api/auth/pending', (r) =>
    r.fulfill({
      json: {
        email: 'long-verification-destination-for-responsive-check@example.com',
        remainingSeconds: 120,
      },
    }),
  );
  for (const route of [
    '',
    'login',
    'register',
    'forgot-password',
    'verify-email',
    'set-password',
  ]) {
    await page.goto(`/#/${route}`);
    await expect(page.locator(route ? '.auth-card form' : '.welcome-actions')).toBeVisible();
    if (route === 'verify-email')
      await expect(page.getByLabel('کد تأیید', { exact: true })).toBeVisible();
    if (['login', 'register', 'forgot-password', 'set-password'].includes(route))
      await page.locator('button[type=submit]').click();
    for (const [width, height] of [
      [280, 653],
      [320, 480],
      [390, 844],
      [520, 740],
      [521, 740],
      [650, 800],
      [651, 800],
      [800, 900],
      [801, 900],
      [1280, 720],
      [1920, 1080],
      [2560, 1440],
      [568, 320],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
        .toBe(true);
      const bounds = await page.locator(route ? '.auth-card' : '.welcome').boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
      if (route === 'register') {
        await expect
          .poll(() =>
            page.locator('.avatar-grid canvas').evaluateAll((canvases) =>
              canvases.every((canvas) => {
                const box = canvas.getBoundingClientRect();
                return Math.abs(box.width - box.height) <= 1;
              }),
            ),
          )
          .toBe(true);
      }
      if (info.project.name === 'chrome-desktop' && [280, 521, 1280].includes(width))
        await page.screenshot({
          path: info.outputPath(`${route || 'welcome'}-${width}.png`),
          fullPage: true,
        });
    }
  }
});

test('player statistics, settings, inventory and code dialogs stay usable at boundary sizes', async ({
  page,
}, info) => {
  await fixture(page, true, { xp: 123456, coins: 123456, level: 618, streak: 1234 });
  const issues: string[] = [];
  for (const route of ['profile', 'dungeon', 'play/cs_s01_n3', 'play/cs_s01_n6']) {
    await page.goto(`/#/${route}`);
    await expect(
      page.locator(
        route.startsWith('play') ? '#challenge' : route === 'profile' ? '.profile form' : '#map',
      ),
    ).toBeVisible();
    for (const [width, height] of [
      [280, 653],
      [320, 480],
      [650, 800],
      [651, 800],
      [1024, 768],
      [568, 320],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      if (!route.startsWith('play')) {
        const overflowing = await page
          .locator('.hud > div:not(.identity)')
          .evaluateAll((cells) =>
            cells
              .filter((cell) => cell.scrollWidth > cell.clientWidth + 1)
              .map((cell) => cell.textContent),
          );
        issues.push(
          ...overflowing.map((text) => `${route} ${width}: overflowing statistic ${text}`),
        );
        if (info.project.name === 'chrome-desktop' && width === 320)
          await page.screenshot({
            path: info.outputPath(`${route}-stats-mobile.png`),
            fullPage: true,
          });
      }
      await page.locator('.game-settings > summary').click();
      await expect(page.locator('.settings-close')).toBeInViewport();
      const settings = page.locator('.game-settings > div');
      const box = await settings.boundingBox();
      if (box!.y + box!.height > height + 1 || box!.x < 0 || box!.x + box!.width > width + 1)
        issues.push(`${route} ${width}x${height}: settings outside viewport`);
      await page
        .getByRole('button', { name: 'خروج از حساب', exact: true })
        .scrollIntoViewIfNeeded();
      await expect(
        page.getByRole('button', { name: 'خروج از حساب', exact: true }),
      ).toBeInViewport();
      await page.locator('.game-settings > summary').click();
      if (route.startsWith('play')) {
        await page.locator('.scene-inventory > summary').click();
        await expect(page.locator('#shop')).toBeVisible();
        const inventory = await page.locator('#shop').boundingBox();
        if (inventory!.x < 0 || inventory!.x + inventory!.width > width + 1)
          issues.push(`${width}: inventory outside viewport`);
        await page.keyboard.press('Escape');
        const workshop = route.endsWith('n6');
        const choose = page.getByRole('button', { name: 'جواب من', exact: true });
        if (workshop && (await choose.isVisible())) await choose.click();
        const preview = page.getByRole('button', {
          name: workshop ? 'باز کردن کارگاه کد' : 'نمایش کامل کد',
          exact: true,
        });
        await preview.focus();
        await expect(preview).toBeInViewport();
        await preview.press('Enter');
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeInViewport();
        await expect(dialog.getByRole('button', { name: 'بستن', exact: true })).toBeInViewport();
        if (workshop) {
          if ((await dialog.locator('.workshop').getAttribute('open')) === null)
            await dialog.locator('.workshop > summary').click();
          const editor = dialog.getByRole('textbox', { name: 'پیش‌نویس کد C#', exact: true });
          await expect(editor).toBeVisible();
          await editor.fill(`// saved UI draft at ${width}px`);
          await expect(dialog.locator('#shop-status')).toHaveText('ذخیره شد');
          const savedBox = await dialog.locator('#shop-status').boundingBox();
          const headerBox = await dialog.locator('header').boundingBox();
          expect(savedBox!.y).toBeGreaterThanOrEqual(headerBox!.y);
          expect(savedBox!.y + savedBox!.height).toBeLessThanOrEqual(
            headerBox!.y + headerBox!.height + 1,
          );
          await editor.scrollIntoViewIfNeeded();
          await expect(editor).toBeInViewport();
          if (info.project.name === 'chrome-desktop' && width === 320)
            await page.screenshot({ path: info.outputPath('workshop-mobile.png') });
        }
        await page.keyboard.press('Escape');
        await expect(page.locator('.room-toolbar #shop-status')).toBeAttached();
      }
    }
  }
  expect(issues).toEqual([]);
});
