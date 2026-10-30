# نقشه اتمیک پیاده‌سازی موتور بازی‌ساز آموزشی پیکسلی (Pixel Code Dungeon)
**ویژه اجرا در محیط‌های ایجنتیک (Antigravity / AI Coding Agents)**

این سند یک مشخصات فنی کاملاً اتمیک، بدون ابهام و گام‌به‌گام برای ساخت وب‌اپلیکیشن **Pixel Code Dungeon** است. معماری این برنامه به گونه‌ای طراحی شده که در فاز اول به صورت یک **وب‌اپلیکیشن فوق‌سبک، بدون نیاز به سرور (Client-Side Web App)** اجرا شود و به دلیل جداسازی کامل لایه داده (`StorageAdapter`) و منطق بازی (`GameEngine`)، در آینده بدون بازنویسی هسته اصلی قابل انتقال به **PWA، دسکتاپ (Tauri / Electron)، موبایل (Capacitor) یا بک‌اند C# + SQLite** باشد.

## ۱. مشخصات کلیدی و اصول معماری (Core Constraints)

| ویژگی | مشخصات الزامی پیاده‌سازی |
| :--- | :--- |
| **پلتفرم هدف (فاز ۱)** | وب‌اپلیکیشن ریسپانسیو (Desktop & Mobile Web) با قابلیت اجرا در مرورگر بدون وابستگی به بک‌اند |
| **قابلیت پورت به پلتفرم‌های بعدی** | معماری مبتنی بر الگوی `StorageAdapter` (در حال حاضر `localStorage` + فایل `JSON`؛ آماده اتصال به `SQLite` یا REST API) |
| **جهت رابط کاربری و تایپوگرافی** | رابط کاربری فارسی (`dir="rtl"`) با فونت `Vazirmatn`؛ باکس‌های کد و عبارات فنی چپ‌به‌راست (`dir="ltr"`) با فونت `JetBrains Mono` |
| **سبک بصری و گرافیک** | رترو پیکسلی (8-Bit / 16-Bit Dungeon) با رندر ماتریسی اسپرایت‌ها روی `<canvas>` بدون نیاز به فایل‌های تصویری خارجی |
| **موتور صوتی** | سینت‌سایزر صوتی ۸ بیتی با استفاده از `Web Audio API` (بدون نیاز به فایل‌های MP3/WAV خارجی) |
| **معماری محتوا** | کاملاً داده‌محور (Data-Driven): موتور بازی هیچ وابستگی هاردکد شده‌ای به موضوع درسی ندارد و هر موضوعی (C#, Redis, SQL Server) را از JSON می‌خواند |

## ۲. ساختار پوشه‌ها و ماژول‌ها (Project Structure)

ایجنت کدنویس باید پروژه را به صورت ماژولار (ES Modules استاندارد بدون نیاز به باندلر پیچیده، یا قابل تجمیع در یک باندل واحد) با ساختار زیر ایجاد کند:

```text
pixel-code-dungeon/
├── index.html                  # اسکلت اصلی رابط کاربری، هدر وضعیت (HUD) و کانتینر نماها
├── css/
│   └── retro-pixel.css         # متغیرهای تم، استایل باکس‌های پیکسلی، دکمه‌های سه‌بعدی و انیمیشن‌ها
├── js/
│   ├── main.js                 # نقطه ورود، مقداردهی اولیه و مدیریت رویدادهای سراسری
│   ├── core/
│   │   ├── state-manager.js    # مدیریت وضعیت بازیکن (PlayerState)، محاسبه لول، XP و استریک
│   │   ├── storage-adapter.js  # لایه انتزاعی ذخیره‌سازی (LocalStorage + Export/Import JSON)
│   │   └── game-engine.js      # ماشین وضعیت اتاق‌ها، تایمر، پاداش، جریمه و منطق ۶ مینی‌گیم
│   ├── render/
│   │   ├── sprite-canvas.js    # رندرر ۲ بعدی پیکسلی برای قهرمان، دشمنان (NPCs)، مشعل‌ها و افکت‌ها
│   │   ├── audio-synth.js      # تولیدکننده افکت‌های صوتی ۸ بیتی با Web Audio API
│   │   └── ui-views.js         # رندرکننده DOM برای سیاه‌چال، تالار انتقام، استودیو مرحله‌ساز و وضعیت
│   └── data/
│       └── default-packs.js    # بسته‌های آموزشی پیش‌فرض (C#، Redis، SQL Server)
└── schema/
    ├── stage.schema.json       # قرارداد اعتبارسنجی ساختار مراحل و چالش‌ها
    └── sqlite-migration.sql    # اسکریپت ساخت جداول SQLite برای پورت دسکتاپ/بک‌اند آینده
```

## ۳. قراردادهای داده و اسکیماهای دقیق (Data Contracts)

### الف) ساختار وضعیت بازیکن (`PlayerState`)
این آبجکت باید پس از هر کنش کاربر (پاسخ صحیح، پاسخ غلط، خرید از فروشگاه، تغییر اتاق یا باز کردن سرنخ) بلافاصله توسط `StorageAdapter` ذخیره شود:

```json
{
  "version": 1,
  "playerName": "شوالیه دیباگر",
  "title": "کارآموز سی‌شارپ",
  "level": 1,
  "xp": 0,
  "hp": 3,
  "maxHp": 3,
  "coins": 100,
  "streak": 0,
  "bestStreak": 0,
  "activeWorldId": "csharp_core",
  "activeStageId": "cs_ep04_memory",
  "activeNodeIndex": 0,
  "completedNodes": {
    "cs_e4_n1": {
      "completedAt": "2026-10-28T14:00:00.000Z",
      "xpEarned": 25,
      "attempts": 1
    }
  },
  "mistakeBank": {
    "cs_e4_n3": {
      "worldId": "csharp_core",
      "stageId": "cs_ep04_memory",
      "nodeId": "cs_e4_n3",
      "nodeTitle": "شکارچی باگ: معمای شفا نگرفتن قهرمان!",
      "stageTitle": "قسمت ۴: نبرد Stack و Heap در حافظه",
      "failCount": 2,
      "lastFailedAt": "2026-10-28T14:02:00.000Z"
    }
  },
  "unlockedClues": {
    "cs_e4_n2": 2
  },
  "unlockedHints": {
    "cs_e4_n3": true
  },
  "lastSavedAt": "2026-10-28T14:02:00.000Z"
}
```

### ب) ساختار سلسله‌مراتبی محتوا (`World -> Stage -> Node`)
هر قلمرو (`World`) شامل لیستی از مراحل (`Stages`) است و هر مرحله (معادل یک قسمت ۲۰ دقیقه‌ای آموزش) به چندین اتاق کوتاه ۲ تا ۳ دقیقه‌ای (`Nodes`) تقسیم می‌شود:

```json
{
  "world_id": "csharp_core",
  "world_title": "قلمرو سی‌شارپ (C#)",
  "icon": "⚔️",
  "color": "cyan",
  "stages": [
    {
      "stage_id": "cs_ep04_memory",
      "stage_number": 4,
      "stage_title": "قسمت ۴: نبرد Stack و Heap در حافظه",
      "boss_name": "غول Garbage Collector",
      "nodes": []
    }
  ]
}
```

### ج) مشخصات دقیق ۶ الگوی چالش (`Node.type` & `Node.payload`)

موتور بازی باید از ۶ نوع اتاق (`type`) زیر به صورت پلی‌مورفیک پشتیبانی کند:

#### ۱. الگوی `dialogue_lore` (کتیبه داستانی و میکرو-درس)
* **هدف:** شکستن متن طولانی درس به ۲ الی ۴ دیالوگ کوتاه و یک نکته کلیدی (`key_takeaway`).
* **ساختار داده:**
```json
{
  "node_id": "cs_e4_n1",
  "type": "dialogue_lore",
  "title": "کتیبه اول: دو تالار حافظه",
  "npc_name": "حکیم کامپایلر",
  "npc_sprite": "wizard",
  "xp_reward": 25,
  "dialogues": [
    "دیالوگ اول...",
    "دیالوگ دوم..."
  ],
  "key_takeaway": "خلاصه تک‌جمله‌ای برای تثبیت در حافظه."
}
```
* **رفتار UI:** نمایش خط‌به‌خط دیالوگ‌ها با کلیک روی دکمه «ادامه دیالوگ» یا فشردن کلید `Space`. پس از رسیدن به آخرین خط، دکمه به «دریافت XP کتیبه» تغییر می‌کند و با کلیک روی آن، اتاق فتح می‌شود.

#### ۲. الگوی `who_am_i` (کارآگاه مفاهیم / ۲۰ سوالی)
* **هدف:** حدس زدن نام مفهوم، دستور یا ساختار داده با کمترین سرنخ ممکن.
* **ساختار داده:**
```json
{
  "node_id": "cs_e4_n2",
  "type": "who_am_i",
  "title": "چالش کارآگاه: من کی‌ام؟",
  "npc_name": "معماگوی سایه‌ها",
  "npc_sprite": "riddler",
  "xp_reward": 60,
  "payload": {
    "clues": ["سرنخ ۱...", "سرنخ ۲...", "سرنخ ۳..."],
    "options": ["Class", "Struct", "Interface", "Record"],
    "correct_answer": "Struct"
  },
  "hint": "متن راهنمایی در صورت خرید با سکه",
  "explanation": "توضیح علمی پس از پاسخ صحیح"
}
```
* **رفتار UI:** در ابتدا فقط سرنخ اول نمایش داده می‌شود. بازیکن می‌تواند با دکمه «باز کردن سرنخ بعدی» سرنخ‌های بیشتر را ببیند (تعداد سرنخ بازشده در `unlockedClues[node_id]` ذخیره می‌شود). اگر با همان سرنخ اول پاسخ درست بدهد، ضریب پاداش ۲ برابر (`bonusMultiplier = 2`) می‌گیرد.

#### ۳. الگوی `bug_sniper` (شکارچی باگ با کلیک دو مرحله‌ای)
* **هدف:** پیدا کردن خط دارای باگ در کد و سپس انتخاب روش صحیح رفع باگ.
* **ساختار داده:**
```json
{
  "node_id": "cs_e4_n3",
  "type": "bug_sniper",
  "title": "شکارچی باگ: معمای شفا نگرفتن قهرمان!",
  "npc_name": "گابلین باگ‌ساز",
  "npc_sprite": "goblin",
  "xp_reward": 85,
  "payload": {
    "prompt": "توضیح سناریوی باگ...",
    "code_lines": [
      "public struct HeroStats { public int Hp; }",
      "public void Heal(HeroStats stats) {",
      "    stats.Hp += 50;",
      "}"
    ],
    "buggy_line_index": 1,
    "fix_options": [
      "اضافه کردن کلمه کلیدی ref به امضای متد",
      "تغییر int به double",
      "افزودن return در انتهای متد"
    ],
    "correct_fix_index": 0
  },
  "hint": "متن راهنمایی...",
  "explanation": "توضیح دلیل باگ و راه‌حل..."
}
```
* **رفتار UI:** ابتدا خطوط کد شمارهگذاری‌شده قابل کلیک هستند. با کلیک روی هر خط، آن خط هایلایت قرمز می‌شود و لیست `fix_options` ظاهر می‌گردد. تنها در صورتی که هم `selectedLine === buggy_line_index` و هم `selectedFix === correct_fix_index` باشد بازیکن برنده می‌شود؛ در غیر این صورت پیام خطای دقیق (خط اشتباه یا راه‌حل اشتباه) نمایش داده می‌شود.

#### ۴. الگوی `bomb_defusal` (خنثی‌سازی بمب زمانی با جایگذاری توکن)
* **هدف:** تکمیل جاهای خالی کد (`__1__`, `__2__`, ...) از بانک توکن‌ها قبل از اتمام تایمر.
* **ساختار داده:**
```json
{
  "node_id": "cs_e4_n4",
  "type": "bomb_defusal",
  "title": "خنثی‌سازی بمب: جلوگیری از Boxing!",
  "npc_name": "ربات تخریب‌گر",
  "npc_sprite": "bomb",
  "xp_reward": 90,
  "time_limit_sec": 40,
  "payload": {
    "prompt": "شرح چالش...",
    "code_template": "List<__1__> scores = new __2__();\nscores.Add(__3__);",
    "blanks": ["int", "List<int>", "100"],
    "token_bank": ["object", "int", "ArrayList", "List<int>", "\"100\"", "100"]
  },
  "hint": "متن راهنمایی...",
  "explanation": "توضیح علمی..."
}
```
* **رفتار UI:** تایمر معکوس به محض ورود به اتاق شروع می‌شود. کلیک روی هر دکمه در `token_bank` اولین جای خالی (`null`) در آرایه `tempFilledBlanks` را پر می‌کند. کلیک روی توکنِ قرارگرفته داخل کد، آن را پاک می‌کند تا کاربر بتواند اصلاحش کند. دکمه «بریدن سیم و تست کد» آرایه `tempFilledBlanks` را با `blanks` مقایسه می‌کند.

#### ۵. الگوی `compiler_judge` (قضاوت کامپایلر به سبک Papers, Please)
* **هدف:** بررسی یک قطعه کد و خروجی ادعایی ربات، و صدور حکم تایید (مهر سبز) یا رد به همراه دلیل (مهر قرمز).
* **ساختار داده:**
```json
{
  "node_id": "cs_e4_n5",
  "type": "compiler_judge",
  "title": "باس‌فایت: قضاوت کامپایلر",
  "npc_name": "غول Garbage Collector",
  "npc_sprite": "boss",
  "xp_reward": 120,
  "payload": {
    "prompt": "شرح پرونده...",
    "code_snippet": "کد چندخطی...",
    "claimed_output": "خروجی ادعایی: 99",
    "verdict_options": [
      "✅ مهر سبز: ادعا کاملاً درسته چون...",
      "❌ مهر قرمز: غلطه! خروجی 10 می‌شه چون...",
      "❌ مهر قرمز: کد خطای کامپایل می‌ده."
    ],
    "correct_verdict_index": 0
  },
  "hint": "متن راهنمایی...",
  "explanation": "توضیح علمی..."
}
```

#### ۶. الگوی `code_puzzle` (پازل جراحی کد / Parson's Problem با خط تله)
* **هدف:** مرتب‌سازی خطوط به‌هم‌ریخته کد و نادیده گرفتن خطوط تله (Distractors).
* **ساختار داده:**
```json
{
  "node_id": "cs_e12_n2",
  "type": "code_puzzle",
  "title": "پازل جراحی کد: متد Async استاندارد",
  "npc_name": "مهندس نخ‌ها",
  "npc_sprite": "riddler",
  "xp_reward": 90,
  "payload": {
    "prompt": "خطوط زیر را به ترتیب درست بچین (مراقب خط تله باش):",
    "scrambled_lines": [
      "return data.Length;",
      "public async Task<int> GetPageSizeAsync(string url) {",
      "string data = await _httpClient.GetStringAsync(url);",
      "public void GetPageSize(string url) { // خط تله!",
      "}"
    ],
    "correct_order_indices": [1, 2, 0, 4]
  },
  "hint": "متن راهنمایی...",
  "explanation": "توضیح علمی..."
}
```

## ۴. قوانین دقیق ریاضی و منطق گیمیفیکیشن (Game Rules & Formulas)

ایجنت کدنویس باید فرمول‌های زیر را دقیقاً در `state-manager.js` و `game-engine.js` پیاده کند:

1. **فرمول محاسبه سطح (Level) و عنوان (Title):**
   * `level = Math.floor(xp / 200) + 1`
   * درصد نوار پیشرفت سطح فعلی: `Math.round(((xp % 200) / 200) * 100)`
   * آرایه عناوین بر اساس سطح:
     * سطح ۱: `کارآموز سی‌شارپ`
     * سطح ۲: `شکارچی باگ‌های Stack`
     * سطح ۳: `شوالیه حافظه و ردیس`
     * سطح ۴: `جراح کوئری و Async`
     * سطح ۵: `فرمانده معماری نرم‌افزار`
     * سطح ۶ به بالا: `افسانه دیباگینگ`

2. **فرمول پاداش پیروزی (`rewardWin`):**
   * افزایش استریک: `streak += 1` و بروزرسانی `bestStreak = Math.max(bestStreak, streak)`.
   * پاداش پایه: `baseXp = node.xp_reward || 50`.
   * پاداش استریک: `streakBonus = Math.min(50, (streak - 1) * 10)`.
   * اگر اتاق قبلاً فتح شده باشد (`completedNodes[node_id]` موجود باشد)، برای جلوگیری از فارم کردن بی‌رویه امتیاز:
     * `earnedXp = Math.round(baseXp * 0.25)`
     * `earnedCoins = 5`
   * اگر بار اول است که اتاق فتح می‌شود:
     * `earnedXp = (baseXp + streakBonus) * bonusMultiplier`
     * `earnedCoins = (15 + streak * 3) * bonusMultiplier`
   * حذف از بانک اشتباهات: در صورت پیروزی، اگر `mistakeBank[node_id]` وجود داشت، باید حذف شود (`delete playerState.mistakeBank[node.node_id]`).

3. **فرمول جریمه خطا و بانک اشتباهات (`penalizeMistake`):**
   * صفر شدن استریک: `streak = 0`.
   * کاهش جان: `hp = Math.max(1, hp - 1)` (جان روی ۱ متوقف می‌شود تا بازیکن قفل نشود، اما افکت لرزش صفحه `animate-shake` و فلش قرمز اجرا می‌شود).
   * ثبت خودکار در `mistakeBank[node.node_id]` با افزایش شمارنده `failCount` و ذخیره `worldId`, `stageId`, `nodeTitle`, `lastFailedAt`.

4. **اقتصاد کمپ استراحت (Shop):**
   * **خرید معجون جان (`+1 HP`):** هزینه `30 سکه`؛ فقط زمانی فعال است که `hp < maxHp` و `coins >= 30`.
   * **خرید راهنمایی (`Hint`):** هزینه `20 سکه`؛ فقط زمانی فعال است که اتاق دارای فیلد `hint` باشد، قبلاً برای این اتاق خریداری نشده باشد (`!unlockedHints[node_id]`) و `coins >= 20`.

## ۵. مشخصات موتور بصری (`<canvas>`) و صوتی (`Web Audio API`)

1. **رندر ماتریسی اسپرایت‌های پیکسلی (`sprite-canvas.js`):**
   * استفاده از یک تابع عمومی `drawPixelMatrix(ctx, matrix, palette, startX, startY, scale)` که آرایه‌ای از رشته‌های ۱۲×۱۱ کاراکتری را می‌خواند و هر کاراکتر غیر از نقطه (`.`) را با کد رنگ هگز متناظر در `palette` به صورت مربع‌های `scale × scale` پیکسل رسم می‌کند.
   * رسم پس‌زمینه آجری سیاه‌چال، دو مشعل سوسوزن با تابع سینوسی `Math.sin(animFrame * 0.15)`، قهرمان در سمت راست و کاراکتر NPC (`wizard`, `riddler`, `goblin`, `bomb`, `boss`) در سمت چپ با حرکت تنفسی نرم (`Math.sin(animFrame * 0.08) * 3`).

2. **موتور صوتی بدون فایل خارجی (`audio-synth.js`):**
   * استفاده از `AudioContext` و `OscillatorNode`:
     * صدای `click`: موج `square`، فرکانس `520Hz`، مدت `0.05s`.
     * صدای `win`: آرپژ چهار نتی موج `square` با فرکانس‌های `[440, 554, 659, 880]` هرتز.
     * صدای `fail`: موج `sawtooth` نزولی با فرکانس‌های `[240, 170]` هرتز.
     * صدای `coin`: موج `square` با فرکانس‌های `[987, 1318]` هرتز.
     * صدای `levelUp`: موج `triangle` با فرکانس‌های `[523, 659, 783, 1046]` هرتز.

## ۶. مراحل اتمیک اجرا برای ایجنت کدنویس (Step-by-Step Execution Plan)

ایجنت باید پیاده‌سازی را دقیقاً به ترتیب این ۸ گام اتمیک انجام دهد:

* **گام ۱ (اسکلت و استایل پیکسلی):** ایجاد فایل‌های پایه، بارگذاری فونت‌های `Vazirmatn`، `JetBrains Mono` و `Press Start 2P`، و تعریف کلاس‌های `.pixel-box`، `.pixel-btn` و افکت `.scanlines`.
* **گام ۲ (لایه ذخیره‌سازی و وضعیت):** پیاده‌سازی `storage-adapter.js` و `state-manager.js` با پشتیبانی از بارگذاری ایمن (`try/catch`) از `localStorage`، محاسبه خودکار لول و عنوان، و قابلیت Export/Import فایل JSON وضعیت بازیکن.
* **گام ۳ (داده‌های پیش‌فرض):** ایجاد `default-packs.js` شامل ۳ قلمرو (`csharp_core`, `redis_dungeon`, `sql_fortress`) به همراه مراحل نمونه که تمام ۶ نوع چالش را پوشش می‌دهند.
* **گام ۴ (موتور صوتی و صحنه پیکسلی):** پیاده‌سازی `audio-synth.js` و `sprite-canvas.js` با حلقه انیمیشن `requestAnimationFrame` و آواتار مینیاتوری هدر.
* **گام ۵ (رندر ۶ مینی‌گیم در Arena):** پیاده‌سازی توابع رندر تعاملی برای هر ۶ نوع اتاق (`dialogue_lore`, `who_am_i`, `bug_sniper`, `bomb_defusal`, `compiler_judge`, `code_puzzle`) به همراه تایمر معکوس و بنر بازخورد پیروزی/شکست.
* **گام ۶ (نوار وضعیت HUD، سایدبار نقشه و کمپ خرید):** اتصال کامل دکمه‌های تغییر قلمرو، تغییر مرحله، نقشه اتاق‌ها، خرید معجون جان و خرید راهنمایی به وضعیت بازیکن.
* **گام ۷ (تالار انتقام و استودیو مرحله‌ساز AI):** پیاده‌سازی نمای `Revenge Mode` (خواندن از `mistakeBank` و پرش مستقیم به اتاق خطادار) و نمای `Stage Studio` (تولید خودکار پرامپت AI برای تبدیل متن درس‌های ۵۰ قسمتی به JSON و تزریق زنده مرحله جدید به بازی).
* **گام ۸ (تست و ممیزی نهایی):** بررسی کارکرد کلید میانبر `Space` در دیالوگ‌ها، بررسی عدم وجود خطای کنسول، و اطمینان از ذخیره شدن لحظه‌ای وضعیت پس از هر کلیک.

## ۷. مسیر توسعه به پلتفرم‌های بعدی (Cross-Platform Roadmap)

برای انتقال این وب‌اپلیکیشن به پلتفرم‌های دیگر در فازهای بعدی، تنها اقدامات زیر کافی است:

1. **نسخه دسکتاپ ویندوز/مک/لینوکس (Tauri یا Electron):** قرار دادن پوشه وب‌اپلیکیشن در قالب فرانت‌اند Tauri و جایگزینی متدهای `localStorage` در فایل `storage-adapter.js` با پلاگین رسمی `tauri-plugin-sql` (متصل به فایل محلی `sqlite.db` با استفاده از اسکیمای ۳ جدولی `Player_Profile`, `Player_Node_Progress`, `Course_Stages`).
2. **نسخه موبایل اندروید و iOS (PWA یا Capacitor):** افزودن فایل `manifest.json` و یک `Service Worker` ساده برای کش کردن فایل‌های HTML/CSS/JS جهت اجرای ۱۰۰٪ آفلاین روی موبایل.
3. **نسخه بک‌اند ASP.NET Core Web API:** ارسال آبجکت `playerState` به یک اندپوینت ساده `POST /api/player/sync` در سی‌شارپ و ذخیره آن در SQL Server یا SQLite با استفاده از Entity Framework Core یا Dapper.
