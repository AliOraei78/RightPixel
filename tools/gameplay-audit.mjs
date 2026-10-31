import {
  chromium,
  firefox,
  webkit,
  expect,
} from "../src/rightpixel-web/node_modules/@playwright/test/index.mjs";
import { randomBytes, randomUUID, pbkdf2Sync } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const output = new URL("./.course-checks/gameplay-audit/", import.meta.url);
const baseURL = process.env.RIGHTPIXEL_AUDIT_URL ?? "http://127.0.0.1:8085";
assert(
  ["127.0.0.1", "localhost"].includes(new URL(baseURL).hostname),
  "Use a local installation only",
);
await mkdir(output, { recursive: true });
const credentialsPath = new URL(
  "../src/rightpixel-web/.e2e-data/audit-player.json",
  import.meta.url,
);
await mkdir(new URL("./", credentialsPath), { recursive: true });
let credentials;
try {
  credentials = JSON.parse(await readFile(credentialsPath, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  credentials = {
    id: randomUUID(),
    email: `ui-audit-${Date.now()}@example.invalid`,
    password: `Ui-${randomBytes(20).toString("hex")}!`,
  };
  const salt = randomBytes(16),
    header = Buffer.alloc(13);
  header[0] = 1;
  header.writeUInt32BE(2, 1);
  header.writeUInt32BE(220000, 5);
  header.writeUInt32BE(16, 9);
  const hash = Buffer.concat([
    header,
    salt,
    pbkdf2Sync(credentials.password, salt, 220000, 32, "sha512"),
  ]).toString("base64");
  // A separate confirmed local account avoids sending test mail or changing existing players.
  const sql = `INSERT INTO "PlayerProfiles" ("Id","Email","NormalizedEmail","EmailConfirmed","AvatarId","PlayerName","Xp","Hp","MaxHp","Coins","Streak","BestStreak","UpdatedAt","PasswordHash") VALUES ('${credentials.id}','${credentials.email}','${credentials.email}',true,'avatar-12','بازیکن آزمایش رابط',0,3,3,100,0,0,now(),'${hash}');`;
  execFileSync(
    "docker",
    [
      "compose",
      "exec",
      "-T",
      "db",
      "psql",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "rightpixel_migrator",
      "-d",
      "rightpixel",
    ],
    { cwd: root, input: sql, stdio: ["pipe", "pipe", "pipe"] },
  );
  await writeFile(credentialsPath, JSON.stringify(credentials, null, 2));
}
const engine = process.env.RIGHTPIXEL_AUDIT_BROWSER ?? "chrome";
const browser = await { chrome: chromium, firefox, webkit }[engine].launch(
  engine === "chrome" ? { channel: "chrome" } : {},
);
const context = await browser.newContext({
  baseURL,
  viewport: { width: 1366, height: 768 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
page.setDefaultTimeout(8000);
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const pack = JSON.parse(
  await readFile(
    new URL("../content/csharp/generated/csharp-mastery.json", import.meta.url),
    "utf8",
  ),
);
const sizes = [
  [280, 653],
  [320, 568],
  [390, 844],
  [520, 740],
  [521, 740],
  [650, 800],
  [651, 800],
  [768, 1024],
  [800, 651],
  [801, 900],
  [1024, 768],
  [1280, 720],
  [1366, 768],
  [1920, 1080],
  [2560, 1440],
  [480, 280],
  [844, 390],
];
const issues = [],
  checks = [],
  seen = new Set();
const filePath = (name) =>
  new URL(name, output).pathname.replace(/^\/([A-Za-z]:)/, "$1");
async function inspectControls(label, width, height) {
  const found = await page.evaluate(() => {
    const issues = [];
    const luminance = (color) =>
      color
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number)
        .map((v) => v / 255)
        .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
        .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
    for (const el of document.querySelectorAll(
      "#challenge button,dialog[open] button",
    )) {
      if (!el.checkVisibility()) continue;
      const box = el.getBoundingClientRect(),
        body = el.closest(".speech-content"),
        clip = body?.getBoundingClientRect();
      if (
        clip &&
        (box.right <= clip.left + 1 ||
          box.left >= clip.right - 1 ||
          box.bottom <= clip.top + 1 ||
          box.top >= clip.bottom - 1)
      )
        continue;
      const name = el.textContent.trim().slice(0, 50);
      if (
        clip &&
        getComputedStyle(body).overflowY !== "auto" &&
        (box.left < clip.left - 1 ||
          box.right > clip.right + 1 ||
          box.top < clip.top - 1 ||
          box.bottom > clip.bottom + 1)
      )
        issues.push(`clipped control: ${name}`);
      const style = getComputedStyle(el);
      if (box.height < 43) issues.push(`small target ${box.height}px: ${name}`);
      if (parseFloat(style.fontSize) < 16)
        issues.push(`small font ${style.fontSize}: ${name}`);
      if (!el.disabled && style.backgroundColor !== "rgba(0, 0, 0, 0)") {
        const a = luminance(style.color),
          b = luminance(style.backgroundColor),
          ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        if (ratio < 4.5)
          issues.push(`text contrast ${ratio.toFixed(2)}: ${name}`);
      }
    }
    return issues;
  });
  issues.push(...found.map((issue) => `${label} ${width}x${height}: ${issue}`));
}
async function audit(label) {
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    if (!(await page.locator("dialog[open]").count())) {
      if (/question|dialogue\d|result/.test(label)) {
        const back = page.getByRole("button", { name: "سؤال رو دوباره ببین" });
        if (await back.isVisible()) await back.click();
      } else await choosePlayer();
    }
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    const found = await page.evaluate(() => {
      const issues = [];
      if (document.documentElement.scrollWidth > innerWidth + 1)
        issues.push("page horizontal overflow");
      const visible = (el) => el.checkVisibility() && !el.closest("[hidden]");
      const controls = document
        .querySelector(".scene-hotspots")
        .getBoundingClientRect();
      const toolbar = document
        .querySelector(".room-toolbar")
        .getBoundingClientRect();
      const panels = [
        ...document.querySelectorAll("#challenge > .speech"),
      ].filter(visible);
      for (const panel of panels) {
        const box = panel.getBoundingClientRect();
        if (box.left < 0 || box.right > innerWidth + 1)
          issues.push("panel outside viewport");
        if (box.top < toolbar.bottom - 1) issues.push("panel overlaps toolbar");
        if (box.bottom > controls.top - 100)
          issues.push("panel crowds scene characters");
        const body = panel.querySelector(".speech-content");
        if (body.clientHeight < 40) issues.push("reading area below 40px");
        for (const el of panel.querySelectorAll(
          ".speech-actions,.reading-navigation",
        )) {
          if (!visible(el)) continue;
          const child = el.getBoundingClientRect();
          if (child.bottom > box.bottom + 1 || child.top < box.top - 1)
            issues.push("footer outside panel");
        }
      }
      const dialog = document.querySelector("dialog[open]");
      if (dialog) {
        const box = dialog.getBoundingClientRect();
        if (
          box.left < 0 ||
          box.right > innerWidth + 1 ||
          box.top < 0 ||
          box.bottom > innerHeight + 1
        )
          issues.push("dialog outside viewport");
        const header = dialog.querySelector("header");
        if (header)
          for (const notice of header.querySelectorAll("#shop-status,#timer")) {
            if (!notice.textContent.trim()) continue;
            const bounds = notice.getBoundingClientRect(),
              parent = header.getBoundingClientRect();
            if (
              bounds.top < parent.top - 1 ||
              bounds.bottom > parent.bottom + 1
            )
              issues.push("dialog notice outside header");
          }
      }
      return issues;
    });
    issues.push(
      ...found.map((issue) => `${label} ${width}x${height}: ${issue}`),
    );
    checks.push({ label, width, height });
    await inspectControls(label, width, height);
    const previous = page
      .locator(".player-speech .reading-navigation button")
      .first();
    const next = page
      .locator(".player-speech .reading-navigation button")
      .last();
    if (
      !(await page.locator("dialog[open]").count()) &&
      (await previous.isVisible())
    ) {
      while (!(await previous.isDisabled())) await previous.click();
      for (let column = 0; column < 40; column++) {
        await inspectControls(`${label}-page${column + 1}`, width, height);
        if (await next.isDisabled()) break;
        await next.click();
      }
    }
    if ([320, 768, 1366, 2560].includes(width))
      await page.screenshot({
        path: filePath(`${engine}-${label}-${width}.png`),
        fullPage: true,
      });
  }
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}
async function reachable(locator) {
  const previous = page
    .locator(".player-speech .reading-navigation button")
    .first();
  while ((await previous.isVisible()) && !(await previous.isDisabled())) {
    await previous.click();
    await page.waitForTimeout(30);
  }
  for (let i = 0; i < 40; i++) {
    const fits = await locator.evaluate((el) => {
      if (!el.checkVisibility()) return false;
      const parent = el.closest(".speech-content");
      if (!parent) return true;
      const box = el.getBoundingClientRect(),
        clip = parent.getBoundingClientRect();
      return (
        box.left >= clip.left - 1 &&
        box.right <= clip.right + 1 &&
        box.top >= clip.top - 1 &&
        box.bottom <= clip.bottom + 1
      );
    });
    if (fits) return;
    const next = page
      .locator(".player-speech .reading-navigation button")
      .last();
    if (!(await next.isVisible()) || (await next.isDisabled()))
      throw new Error(
        `Unreachable control: ${await locator.textContent()} ${JSON.stringify(await locator.evaluate((el) => ({ visible: el.checkVisibility(), box: el.getBoundingClientRect().toJSON(), parent: el.closest(".speech-content")?.getBoundingClientRect().toJSON() })))}`,
      );
    await next.click();
    await page.waitForTimeout(30);
  }
  throw new Error("Pagination did not reveal control");
}
async function click(locator) {
  await reachable(locator);
  await locator.click();
}
async function choosePlayer() {
  const choose = page.getByRole("button", { name: "جواب من", exact: true });
  if (await choose.isVisible()) await choose.click();
}
async function resume(node, expected) {
  await expect
    .poll(async () => {
      const response = await context.request.get(
        `/api/nodes/${node.id}/checkpoint`,
      );
      assert.equal(response.status(), 200);
      const saved = (await response.json()).state;
      return Object.fromEntries(
        Object.keys(expected).map((key) => [key, saved[key]]),
      );
    })
    .toEqual(expected);
  await page.reload();
  await expect(page.locator("#challenge")).toBeVisible();
  await choosePlayer();
}
async function play(node, audited, initialRound = 0) {
  const rounds = node.type === "boss_fight" ? node.payload.rounds : [node];
  for (let round = initialRound; round < rounds.length; round++) {
    const { type, payload } = rounds[round],
      label = `${node.id}-r${round + 1}`;
    await choosePlayer();
    if (type === "code_puzzle")
      while (await page.locator(".chosen-lines .code-preview").count()) {
        await click(page.locator(".chosen-lines .code-preview").first());
        await page.locator(".code-view .code-line").click();
      }
    if (type === "runtime_forge" || type === "branch_gates")
      await click(
        page.getByRole("button", { name: "پاک کردن مسیر", exact: true }),
      );
    if (type === "bomb_defusal")
      for (let i = 0; i < payload.blanks.length; i++)
        await click(page.locator(".token-code button").nth(i));
    if (audited && type === "code_puzzle" && payload.workshop) {
      await click(
        page.getByRole("button", { name: "باز کردن کارگاه کد", exact: true }),
      );
      await page.locator(".code-view .workshop > summary").click();
      const draft = payload.workshop.starterCode + "\n// UI audit draft";
      await page.locator(".code-view textarea").fill(draft);
      await expect(page.locator(".code-view #shop-status")).toHaveText(
        "ذخیره شد",
      );
      await audit(`${label}-workshop`);
      await page.keyboard.press("Escape");
      await resume(node, { draft });
      await click(
        page.getByRole("button", { name: "باز کردن کارگاه کد", exact: true }),
      );
      await page.locator(".code-view .workshop > summary").click();
      await expect(page.locator(".code-view textarea")).toHaveValue(draft);
      await page.keyboard.press("Escape");
    }
    if (audited) {
      await audit(`${label}-question`);
      if (type !== "dialogue_lore") {
        await choosePlayer();
        await audit(`${label}-choices`);
      }
    }
    await choosePlayer();
    const choices = page.locator(".player-choices");
    const progress = async (suffix) => {
      if (audited) await audit(`${label}-${suffix}`);
    };
    const answerResponse = page.waitForResponse(
      (r) =>
        r.url().endsWith(`/nodes/${node.id}/answer`) &&
        r.request().method() === "POST",
      { timeout: 120000 },
    );
    answerResponse.catch(() => {});
    // Interact with the rendered controls; the server independently grades each answer.
    if (type === "dialogue_lore") {
      const bubble = page.locator(".dialogue-bubble");
      const start = Number(await bubble.getAttribute("data-dialogue-index"));
      for (let i = start; i < payload.dialogues.length; i++) {
        if (audited) await audit(`${label}-dialogue${i}`);
        await page
          .locator(".npc-speech .speech-actions")
          .getByRole("button", { name: "ادامه", exact: true })
          .click();
      }
    } else if (type === "who_am_i") {
      await click(
        choices
          .locator(":scope > button")
          .nth(payload.options.indexOf(payload.correctAnswer)),
      );
    } else if (type === "compiler_judge") {
      const code = page.locator(".npc-speech .code-preview");
      if (audited) {
        const back = page.getByRole("button", { name: "سؤال رو دوباره ببین" });
        if (await back.isVisible()) await back.click();
        await code.click();
        await audit(`${label}-code`);
        await page.keyboard.press("Escape");
        await choosePlayer();
      }
      await click(
        choices.locator(":scope > button").nth(payload.correctVerdictIndex),
      );
    } else if (type === "bug_sniper") {
      const preview = choices
        .locator(".code-preview")
        .nth(payload.buggyLineIndex);
      await click(preview);
      if (audited) await audit(`${label}-line-code`);
      await page.locator(".code-view .code-line").click();
      if (audited) {
        await resume(node, { line: payload.buggyLineIndex });
        await expect(
          choices.locator('.code-preview[aria-pressed="true"]'),
        ).toHaveCount(1);
      }
      await progress("line-selected");
      await click(
        page
          .locator(
            ".player-speech .reading-pages > div:not(.player-choices) button",
          )
          .nth(payload.correctFixIndex),
      );
    } else if (type === "bomb_defusal") {
      for (let i = 0; i < payload.blanks.length; i++) {
        await click(
          choices
            .locator(":scope > button")
            .nth(payload.tokenBank.indexOf(payload.blanks[i])),
        );
        if (audited && i === 0) {
          await resume(node, {
            filled: payload.blanks.map((value, index) =>
              index === 0 ? value : null,
            ),
          });
          await expect(page.locator(".token-code button").first()).toHaveText(
            payload.blanks[0],
          );
        }
        await progress(`token${i + 1}`);
      }
      await page
        .getByRole("button", { name: "بریدن سیم و تست کد", exact: true })
        .click();
    } else if (type === "code_puzzle") {
      for (let i = 0; i < payload.correctOrderIndices.length; i++) {
        await click(
          choices.locator(".code-preview").nth(payload.correctOrderIndices[i]),
        );
        await page.locator(".code-view .code-line").click();
        if (audited && i === 0) {
          await resume(node, { indices: [payload.correctOrderIndices[0]] });
          await expect(page.locator(".chosen-lines .code-preview")).toHaveCount(
            1,
          );
        }
        await progress(`line${i + 1}`);
      }
      await page
        .getByRole("button", { name: "بررسی ترتیب", exact: true })
        .click();
    } else if (type === "memory_mirror") {
      for (let i = 0; i < payload.correctValues.length; i++) {
        await click(
          page
            .locator(".pilot-board > div")
            .nth(i)
            .locator("button")
            .nth(payload.values.indexOf(payload.correctValues[i])),
        );
        if (audited && i === 0) {
          const saved = (
            await page
              .locator('.pilot-board button[aria-pressed="true"]')
              .allTextContents()
          ).map(Number);
          await resume(node, { selection: saved });
          await expect(
            page
              .locator(".pilot-board > div")
              .first()
              .locator('button[aria-pressed="true"]'),
          ).toHaveText(String(payload.correctValues[0]));
        }
        await progress(`value${i + 1}`);
      }
      await page
        .getByRole("button", { name: "اجرای آزمایش", exact: true })
        .click();
    } else {
      const order = payload.correctOrder ?? payload.correctPath;
      for (let i = 0; i < order.length; i++) {
        await click(choices.locator(":scope > button").nth(order[i]));
        if (audited && i === 0) {
          await resume(node, { selection: [order[0]] });
          await expect(page.locator(".pilot-board button")).toHaveCount(1);
        }
        await progress(`card${i + 1}`);
      }
      await page
        .getByRole("button", { name: "اجرای آزمایش", exact: true })
        .click();
    }
    const response = await answerResponse;
    assert.equal(response.status(), 200, await response.text());
    const result = await response.json();
    assert.equal(result.correct, true, `${label}: ${JSON.stringify(result)}`);
    assert.equal(result.nodeCompleted, round === rounds.length - 1);
    await expect(page.locator("#arena")).toHaveAttribute("data-result", "win");
    if (audited) await audit(`${label}-result`);
    if (round < rounds.length - 1) {
      await page
        .getByRole("button", { name: "دور بعد نبرد", exact: true })
        .click();
      await expect(page.locator("#arena")).not.toHaveAttribute("data-result");
      await page.reload();
      await expect(page.locator("#challenge")).toContainText(
        `دور ${round + 2} از ۳`,
      );
    }
  }
}
try {
  await page.goto("/#/login");
  await page.getByLabel("ایمیل", { exact: true }).fill(credentials.email);
  await page.getByLabel("رمز", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "ورود", exact: true }).click();
  await expect(page.locator("#map")).toBeVisible();
  const state = await (await context.request.get("/api/player")).json();
  assert.equal(state.id, credentials.id);
  console.log(
    JSON.stringify({
      account: credentials.email,
      completed: state.completedNodes.filter((n) => n.completedAt).length,
    }),
  );
  for (const stage of pack.stages.slice(0, 5))
    for (const node of stage.nodes) {
      const audited = !seen.has(node.type);
      const started = page.waitForResponse((r) =>
        r.url().endsWith(`/nodes/${node.id}/start`),
      );
      await page.goto(`/#/play/${node.id}`);
      await expect(page.locator("#challenge")).toBeVisible();
      await play(node, audited, (await (await started).json()).roundIndex);
      seen.add(node.type);
      console.log(
        `PASS ${node.id} ${node.type}${audited ? " responsive audit" : ""}`,
      );
    }
  const final = await (await context.request.get("/api/player")).json();
  assert(
    pack.stages
      .slice(0, 5)
      .flatMap((s) => s.nodes)
      .every((n) =>
        final.completedNodes.some((p) => p.nodeId === n.id && p.completedAt),
      ),
  );
  assert.equal(seen.size, 10);
  await writeFile(
    new URL(`${engine}-report.json`, output),
    JSON.stringify(
      {
        account: credentials.email,
        completed: 39,
        families: [...seen],
        checks,
        issues,
        errors,
      },
      null,
      2,
    ),
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(issues, []);
} catch (error) {
  await page.screenshot({
    path: filePath(`${engine}-failure.png`),
    fullPage: true,
  });
  await writeFile(
    new URL(`${engine}-report.json`, output),
    JSON.stringify(
      {
        account: credentials.email,
        families: [...seen],
        checks,
        issues,
        errors,
        failure: error.message,
      },
      null,
      2,
    ),
  );
  throw error;
} finally {
  await browser.close();
}
