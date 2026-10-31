"""Authored Persian curriculum. build_course.py only packages these lessons; no AI API."""
SESSIONS = []


def add(number, lesson, q1, q2, judge, bug, bomb, workshop, sources):
    SESSIONS.append(dict(number=number, lesson=lesson, q1=q1, q2=q2, judge=judge,
                         bug=bug, bomb=bomb, workshop=workshop, sources=sources))


# Question tuples contain their own explanations; no repeated generic feedback.
add(1, [
    'برنامه مجموعه\u200cای از دستورهاست. رایانه این دستورها را اجرا می\u200cکند تا کاری مثل حساب\u200cکردن یا نمایش یک پیام انجام شود.',
    'C# زبان نوشتن این دستورهاست. .NET ابزار ساخت برنامه و محیط اجرای آن را در اختیار ما می\u200cگذارد.',
    'مثال: Console.WriteLine(2 + 3) عدد 5 را نمایش می\u200cدهد. WriteLine یعنی نتیجه را در یک خط بنویس.',
    'نوع داده می\u200cگوید یک مقدار چیست. int برای عدد صحیح است؛ نام کامل همین نوع در .NET برابر System.Int32 است.',
    'کامپایلر کد نوشته\u200cشده را ترجمه می\u200cکند. کامپایلر C# بخشی از پروژهٔ Roslyn است.',
    'خروجی ساخت برنامه معمولاً یک اسمبلی است؛ فایلی که کد میانی IL و اطلاعات لازم دربارهٔ برنامه را نگه می\u200cدارد.',
    'CLR محیط اجرای برنامه است. کارهایی مثل مدیریت حافظه و رسیدگی به خطاهای هنگام اجرا را پشتیبانی می\u200cکند.',
    'پردازنده به دستور ماشین نیاز دارد. در اجرای معمول، JIT کد میانی یک متد را هنگام نیاز به دستور ماشین تبدیل می\u200cکند.',
    'CLI نام مجموعهٔ قواعد مشترک این زیرساخت است؛ آن را با نام کامپایلر C# اشتباه نگیر.',
    'CTS قواعد نوع\u200cهای داده را توضیح می\u200cدهد. CLS قواعدی است که کمک می\u200cکند کتابخانهٔ ما از زبان\u200cهای مختلف قابل استفاده باشد.',
    'BCL کتابخانهٔ ابزارهای پایه است. مثلاً لازم نیست نگهداری متن یا ساخت یک فهرست را از صفر بنویسیم.',
    'در Native AOT، تبدیل به کد بومی پیش از اجرا و هنگام انتشار انجام می\u200cشود. فرمان publish با PublishAot=true این حالت را درخواست می\u200cکند.',
    'برای شروع، مسیر اصلی را به خاطر بسپار: کد C#، کامپایلر، اسمبلی، محیط اجرا و دستورهای قابل اجرای پردازنده.',
], ('در زمان اجرا، کدام بخش کد IL را به دستورهای قابل اجرای پردازنده تبدیل می\u200cکند؟', 'JIT', 'CLS', 'NuGet', 'JIT بخشی از مسیر اجرای CLR است؛ NuGet بسته مدیریت می‌کند و CLS قواعد سازگاری زبان‌هاست.'),
('می\u200cخواهیم یک کتابخانه از چند زبان قابل استفاده باشد. کدام مفهوم، قواعد مشترک بخش عمومی آن را مشخص می\u200cکند؟', 'CLS', 'فقط پسوند cs', 'تنظیم رنگ ترمینال', 'CLS قواعد مشترک API زبان‌هاست؛ CTS مجموعهٔ وسیع‌تر انواع را توصیف می‌کند.'),
('Console.WriteLine(typeof(int).FullName);', 'System.Int32 چاپ می‌شود.', True, 'int نام مستعار System.Int32 در سیستم نوع .NET است؛ خروجی به نام مستعار C# تبدیل نمی‌شود.'),
('فرمان انتشار خروجی بومی را پیدا و اصلاح کن.', ['dotnet restore', 'dotnet publish -c Release -p:PublishAot=false'], 1, 'dotnet publish -c Release -p:PublishAot=true', 'dotnet build --no-restore', 'PublishAot باید true باشد؛ build به‌تنهایی خروجی Native AOT قابل استقرار تولید نمی‌کند.'),
('نام نوع CLR را کامل کن.', 'Console.WriteLine(typeof(__1__).FullName);', ['int'], ['Int128x', 'integer'], 'int به System.Int32 نگاشت می‌شود؛ integer کلیدواژهٔ C# نیست.'),
('ابزار تشخیص اسمبلی بساز: نام نوع، نام اسمبلی و نتیجهٔ یک محاسبهٔ ساده را چاپ کن.', ['Console.WriteLine(typeof(int).FullName);', 'Console.WriteLine(typeof(Program).Assembly.GetName().Name is not null);', 'Console.WriteLine(6 * 7);'], 'System.Int32\nTrue\n42', ['تفاوت فایل منبع، IL و اسمبلی را توضیح بده.', 'خروجی سه خط و بدون وابستگی شبکه باشد.']),
['https://learn.microsoft.com/en-us/dotnet/standard/managed-execution-process', 'https://learn.microsoft.com/en-us/dotnet/standard/common-type-system'])

add(2, [
    'متغیر نامی برای نگهداری داده است. مثلاً int age = 12 یعنی عدد 12 را با نام age نگه دار.',
    'نوع داده مشخص می\u200cکند چه چیزی می\u200cتوان نگه داشت: int عدد صحیح، bool درست یا نادرست، و string متن است.',
    'وقتی یک عدد را به متغیر دیگری می\u200cدهی، مقدار آن کپی می\u200cشود. تغییر عدد دوم، عدد اول را عوض نمی\u200cکند.',
    'مثال: اگر x برابر 4 باشد و y را از x بگیریم، با تغییر y به 9، مقدار x همچنان 4 می\u200cماند.',
    'متغیر یک شیء معمولاً راه دسترسی به آن شیء را نگه می\u200cدارد. با کپی این راه دسترسی، ممکن است دو نام به یک شیء برسند.',
    'آرایه یک شیء است. اگر دو متغیر به یک آرایه اشاره کنند، تغییر یک خانه از هر دو مسیر دیده می\u200cشود.',
    'برای آرایهٔ مستقل می\u200cتوان از Clone استفاده کرد. اگر خانه\u200cها خودشان شیء باشند، این کپی لزوماً آن اشیا را جدا نمی\u200cکند.',
    'var یعنی کامپایلر نوع را از مقدار اولیه تشخیص دهد. محل ذخیرهٔ داده را فقط از روی نام نوع حدس نزن.',
], ('دو متغیر به یک کلاس مربوط\u200cاند. وقتی b = a می\u200cنویسیم، چه چیزی کپی می\u200cشود؟', 'ارجاع به شیء', 'همهٔ فیلدها در یک شیء تازه', 'فقط نام کلاس', 'انتساب مرجع clone نمی‌سازد؛ برای کپی مستقل باید عمق کپی را آگاهانه تعریف کرد.'),
('برای یک آرایهٔ عددی مثل int[]، کدام توضیح درست است؟', 'خود آرایه reference type است.', 'هر آرایه value type است.', 'انتساب آرایه عناصر را clone می‌کند.', 'عناصر int مقداری‌اند ولی شیء آرایه و انتساب متغیر آرایه مرجعی است.'),
('int a = 4;\nint b = a;\nb++;\nConsole.WriteLine(a);', 'خروجی 4 است.', True, 'b کپی مستقلی از مقدار a دارد؛ افزایش b روی a اثری ندارد.'),
('کپی مستقل آرایه لازم است؛ خط اشتباه را اصلاح کن.', ['int[] original = [1, 2];', 'int[] copy = original;', 'copy[0] = 9;'], 1, 'int[] copy = (int[])original.Clone();', 'int[] copy = original;', 'Clone آرایهٔ تازه می‌سازد؛ برای عناصر مرجعی هنوز shallow copy است.'),
('نوع عدد صحیح ۳۲بیتی و نوع استنتاجی را کامل کن.', '__1__ count = 3;\n__2__ label = "hp";', ['int', 'var'], ['dynamic', 'integer'], 'int نوع صریح است و var در اینجا در زمان کامپایل string است.'),
('تفاوت کپی int و اشتراک آرایه را با چاپ مقادیر نشان بده.', ['int value = 3;\nint copied = value;\ncopied = 8;', 'int[] first = [3];\nint[] alias = first;\nalias[0] = 8;', 'Console.WriteLine($"{value},{copied},{first[0]}");'], '3,8,8', ['انتساب آرایه نباید Clone شود.', 'دلیل تفاوت خروجی‌ها را از روی semantics توضیح بده.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/reference-types'])

add(3, [
    'گاهی لازم است داده را از یک نوع به نوع دیگر تبدیل کنیم؛ مثلاً یک عدد کوچک را در نوعی با ظرفیت بیشتر نگه داریم.',
    'بعضی تبدیل\u200cها خودکارند. بعضی دیگر به نوشتن نوع مقصد در پرانتز نیاز دارند و ممکن است ناموفق باشند.',
    'وقتی مقداری مثل int داخل object قرار می\u200cگیرد، یک جعبه برای آن ساخته می\u200cشود. به این کار boxing می\u200cگویند.',
    'برای بیرون\u200cآوردن مقدار جعبه، ابتدا همان نوع اصلی را بگیر. عدد int جعبه\u200cشده را مستقیم به long تبدیل نکن.',
    'مثال: object item = 7 یک int نگه می\u200cدارد. ابتدا (int)item را بگیر؛ بعد می\u200cتوانی آن عدد را به long بدهی.',
    'as برای بعضی تبدیل\u200cهای مرجعی است. اگر تبدیل ممکن نباشد، null می\u200cدهد؛ پیش از استفاده، نتیجه را بررسی کن.',
    'checked کمک می\u200cکند سرریز عددیِ تحت پوشش آن را با خطا تشخیص دهیم. unchecked می\u200cتواند اجازه دهد مقدار از محدوده بگذرد.',
    'در &&، اگر شرط اول نادرست باشد، شرط دوم اجرا نمی\u200cشود. این رفتار می\u200cتواند از اجرای یک دسترسی نامعتبر جلوگیری کند.',
], ('در object box = 5 یک int نگه داشته\u200cایم. کدام مسیر آن را به long تبدیل می\u200cکند؟', '(long)(int)box', '(long)box', 'box as long', 'شیء شامل int است؛ unbox مستقیم long با InvalidCastException شکست می‌خورد.'),
('اگر تبدیلِ مرجعی با as ممکن نباشد، نتیجه چه خواهد بود؟', 'null', 'همیشه InvalidCastException', 'صفر عددی', 'as در این نوع تبدیل null می‌دهد؛ باید پیش از dereference بررسی شود.'),
('byte b = 255;\nb = unchecked((byte)(b + 1));\nConsole.WriteLine(b);', 'خروجی 0 است.', True, 'جمع ابتدا int است؛ تبدیل unchecked به byte بیت‌های بالاتر را حذف می‌کند.'),
('unboxing اشتباه را اصلاح کن.', ['object boxed = 12;', 'long total = (long)boxed;', 'Console.WriteLine(total);'], 1, 'long total = (int)boxed;', 'long total = (short)boxed;', 'نوع داخل جعبه دقیقاً int است؛ بعد از unbox تبدیل implicit به long انجام می‌شود.'),
('برای گزارش سرریز به‌جای wrap شدن چه کلیدواژه‌ای لازم است؟', 'int x = int.MaxValue;\ntry { Console.WriteLine(__1__(x + 1)); }\ncatch (OverflowException) { Console.WriteLine("overflow"); }', ['checked'], ['unchecked', 'unsafe'], 'checked روی این جمعِ زمان اجرا OverflowException ایجاد می‌کند.'),
('جمع امن دو int را با خروجی overflow در حالت سرریز پیاده کن.', ['int a = int.MaxValue;\nint b = 1;', 'try\n{\n    Console.WriteLine(checked(a + b));\n}', 'catch (OverflowException)\n{\n    Console.WriteLine("overflow");\n}'], 'overflow', ['فقط OverflowException را بگیر.', 'checked باید دور خود عملیات جمع باشد.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/checked-and-unchecked'])

add(4, [
    'شرط به برنامه کمک می\u200cکند تصمیم بگیرد. مثلاً اگر امتیاز بیشتر از 10 بود، یک پیام نمایش بده.',
    'if یک شرط را بررسی می\u200cکند. switch برای انتخاب بین چند حالت مشخص مناسب است؛ حالت\u200cها به ترتیب بررسی می\u200cشوند.',
    'حلقه یک کار را تکرار می\u200cکند. پیش از اجرا بپرس: از کجا شروع می\u200cشود، چه وقت متوقف می\u200cشود و هر بار چه چیزی تغییر می\u200cکند؟',
    'خانه\u200cهای آرایه از صفر شماره می\u200cگیرند. آرایهٔ سه\u200cخانه\u200cای فقط خانه\u200cهای 0، 1 و 2 دارد.',
    'در یک حلقهٔ آرایه، شرط i < values.Length مانع رسیدن به شمارهٔ نامعتبر بعد از آخرین خانه می\u200cشود.',
    'break از حلقه بیرون می\u200cرود. continue فقط باقی کارِ همین تکرار را رد می\u200cکند. return اجرای متد را تمام می\u200cکند.',
    'برای حل تمرین، یک جدول کوچک از شمارهٔ تکرار و مقدار متغیر بساز؛ هر خط را فقط یک گام جلو ببر.',
], ('برای خواندن خانه\u200cهای یک آرایه، کدام شرطِ حلقه درست است؟', 'i < values.Length', 'i <= values.Length', 'i == values.Length + 1', 'شرط کمتر یا مساوی یک اندیس خارج از محدوده را هم اجرا می‌کند.'),
('کدام دستور از کل متد بیرون می\u200cرود، نه فقط از حلقه؟', 'return', 'continue', 'فقط break', 'return از متد خارج می‌شود؛ break و continue دامنهٔ کوچک‌تری دارند.'),
('int hp = 0;\nConsole.WriteLine(hp switch { <= 0 => "dead", < 3 => "weak", _ => "ready" });', 'dead چاپ می‌شود.', True, 'اولین الگوی منطبق انتخاب می‌شود و <=0 پیش از <3 قرار دارد.'),
('خطای مرزی حلقه را اصلاح کن.', ['int[] values = [2, 4];', 'for (int i = 0; i <= values.Length; i++)', '    Console.WriteLine(values[i]);'], 1, 'for (int i = 0; i < values.Length; i++)', 'for (int i = 0; i <= values.Length + 1; i++)', 'اندیس values.Length وجود ندارد؛ invariant می‌گوید 0 <= i < Length.'),
('الگوی بازهٔ معتبر را بساز.', 'int hp = 2;\nConsole.WriteLine(hp is > 0 __1__ <= 3);', ['and'], ['&&', '&'], 'درون pattern از and استفاده می‌شود؛ && عملگر ترکیب دو عبارت bool مستقل است.'),
('اعداد مثبت را جمع کن و مقدار صفر یا منفی را با guard داخل حلقه رد کن.', ['int[] values = [2, -1, 0, 5];\nint total = 0;', 'foreach (int value in values)\n{\n    if (value <= 0) continue;\n    total += value;\n}', 'Console.WriteLine(total);'], '7', ['هر عنصر یک بار دیده شود: O(n).', 'صفر و عدد منفی در جمع وارد نشوند.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/switch-expression', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/iteration-statements'])

add(5, [
    'متد چند دستور را زیر یک نام جمع می\u200cکند. ورودی می\u200cگیرد، کاری انجام می\u200cدهد و ممکن است نتیجه\u200cای برگرداند.',
    'مثلاً یک متد جمع می\u200cتواند دو عدد بگیرد و مجموع آن\u200cها را بدهد. نام ورودی\u200cها داخل متد، نقش همان داده\u200cها را توضیح می\u200cدهد.',
    'در حالت عادی، پارامتر عددی یک کپی از مقدار می\u200cگیرد. تغییر این کپی، عددِ بیرون متد را تغییر نمی\u200cدهد.',
    'ref اجازه می\u200cدهد متد خودِ متغیر بیرونی را تغییر دهد. آن متغیر باید از قبل مقدار داشته باشد.',
    'out برای تحویل نتیجه از راه پارامتر است. متد باید پیش از بازگشت عادی، برای این پارامتر مقدار تعیین کند.',
    'in پارامتر را از این مسیر فقط\u200cخواندنی می\u200cکند. این ویژگی به معنی حذف همهٔ کپی\u200cها در همهٔ حالت\u200cها نیست.',
    'چند متد هم\u200cنام باید ورودی\u200cهای قابل تشخیص داشته باشند. متفاوت\u200cبودن نوع نتیجه، به\u200cتنهایی کافی نیست.',
    'params گرفتن چند مقدار را آسان می\u200cکند. در تمرین\u200cها، کلمهٔ کنار پارامترِ تعریف متد را با کلمهٔ کنار آرگومانِ فراخوانی مقایسه کن.',
], ('کدام کلمه می\u200cگوید متد باید پیش از بازگشت عادی، برای این پارامتر مقدار تعیین کند؟', 'out', 'in', 'params', 'متغیر out در ورودی لازم نیست مقدار داشته باشد و متد مسئول مقداردهی خروجی است.'),
('آیا می\u200cتوان دو متد هم\u200cنام را فقط با متفاوت\u200cبودن نوع نتیجه از هم جدا کرد؟', 'خیر؛ امضای پارامترها باید متفاوت باشد.', 'بله، همیشه.', 'فقط اگر هر دو int باشند.', 'نوع بازگشت برای تمایز امضای overload کافی نیست.'),
('int x = 1;\nIncrement(ref x);\nConsole.WriteLine(x);\nstatic void Increment(ref int value) => value++;', 'خروجی 2 است.', True, 'ref همان متغیر فراخواننده را هدف می‌گیرد و مقدار اصلی تغییر می‌کند.'),
('modifier فراخوانی را با قرارداد خروجی هماهنگ کن.', ['int value;', 'Parse("42", ref value);', 'static void Parse(string text, out int result) => result = int.Parse(text);'], 1, 'Parse("42", out value);', 'Parse("42", in value);', 'modifier فراخوانی باید out باشد؛ ref علاوه بر ناسازگاری امضا به متغیر مقداردهی‌شده نیاز دارد.'),
('params collection در C# 13 را کامل کن.', 'static int Sum(__1__ ReadOnlySpan<int> values)\n{\n    int sum = 0;\n    foreach (int value in values) sum += value;\n    return sum;\n}', ['params'], ['out', 'async'], 'params ReadOnlySpan<int> یک params collection معتبر در C# 13 است.'),
('TryDivide بساز: تقسیم بر صفر را false و result=0 اعلام کن؛ در حالت معتبر خارج‌قسمت را بده.', ['bool ok = TryDivide(10, 2, out int result);\nConsole.WriteLine($"{ok},{result}");\nConsole.WriteLine(TryDivide(10, 0, out _));', 'static bool TryDivide(int a, int b, out int result)\n{\n    result = 0;\n    if (b == 0) return false;\n    result = a / b;\n    return true;\n}'], 'True,5\nFalse', ['out در همهٔ مسیرها مقدار داشته باشد.', 'مسیر تقسیم بر صفر نباید استثنا بدهد.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters', 'https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13'])

add(6, [
    'کلاس یک الگو برای ساخت شیء است. مثلاً از کلاس حساب می\u200cتوان حساب\u200cهای جداگانه با موجودی\u200cهای متفاوت ساخت.',
    'شیء هم داده دارد، هم کارهایی که می\u200cتواند انجام دهد. بهتر است تغییر داده از راه کارهای مشخص و قابل بررسی انجام شود.',
    'مثال: برای واریز پول، متد Deposit را صدا بزن؛ اجازه نده هر بخش برنامه موجودی را به عدد منفی دلخواه تغییر دهد.',
    'public یعنی عضو از بیرون قابل دسترسی است. private یعنی فقط داخل همان نوع می\u200cتوان از آن استفاده کرد.',
    'private set اجازه می\u200cدهد مقدار یک ویژگی از بیرون خوانده شود، اما تغییر مستقیم آن از بیرون بسته باشد.',
    'سازنده وضعیت اولیهٔ شیء را آماده می\u200cکند. درستی ورودی\u200cها را همان\u200cجا بررسی کن.',
    'پارامترِ سازندهٔ اصلی در یک کلاس عادی، خودبه\u200cخود یک ویژگی عمومی نمی\u200cسازد؛ ویژگی لازم را صریح بنویس.',
], ('در یک کلاس عادی، آیا پارامترِ سازندهٔ اصلی به\u200cتنهایی یک ویژگی عمومی ایجاد می\u200cکند؟', 'الزاماً هیچ property عمومی‌ای نمی‌سازد.', 'همیشه property با init می‌سازد.', 'همیشه فیلد public می‌سازد.', 'رفتار positional record را با primary constructor کلاس عادی اشتباه نگیر؛ property باید صریح تعریف شود.'),
('می\u200cخواهیم موجودی حساب هیچ\u200cوقت منفی نشود. کدام راهِ تغییر موجودی مناسب\u200cتر است؟', 'setter خصوصی و متدهای اعتبارسنجی‌شده', 'فیلد public بدون کنترل', 'صرفاً تغییر نام فیلد', 'تمام راه‌های تغییر وضعیت باید invariant را حفظ کنند؛ خصوصی‌کردن به‌تنهایی بدون اعتبارسنجی کافی نیست.'),
('var item = new Item(3);\nConsole.WriteLine(item.Count);\nclass Item(int initial) { public int Count { get; } = initial; }', 'خروجی 3 است.', True, 'property صریح Count از پارامتر initial مقدار می‌گیرد.'),
('سطح دسترسی setter را برای جلوگیری از تغییر بیرونی اصلاح کن.', ['class Wallet', '{', '    public int Coins { get; set; }', '}'], 2, '    public int Coins { get; private set; }', '    public int Coins;', 'private set تغییر مستقیم از بیرون را می‌بندد؛ متدهای کلاس می‌توانند تغییر معتبر را انجام دهند.'),
('متد واریز فقط مقدار مثبت را بپذیرد.', 'static int Deposit(int balance, int amount)\n{\n    if (amount <= 0) __1__ new ArgumentOutOfRangeException(nameof(amount));\n    return balance + amount;\n}', ['throw'], ['return', 'yield'], 'throw ورود نامعتبر را رد می‌کند؛ return یک exception جای int مجاز نیست.'),
('حسابی بساز که واریز مثبت می‌پذیرد و موجودی فقط از داخل تغییر می‌کند.', ['var account = new Account(10);\naccount.Deposit(5);\nConsole.WriteLine(account.Balance);', 'sealed class Account\n{\n    public int Balance { get; private set; }\n    public Account(int initial)\n    {\n        if (initial < 0) throw new ArgumentOutOfRangeException(nameof(initial));\n        Balance = initial;\n    }\n    public void Deposit(int amount)\n    {\n        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));\n        Balance += amount;\n    }\n}'], '15', ['ورودی منفی سازنده رد شود.', 'بیرون کلاس امکان Balance = -1 نداشته باشد.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/access-modifiers', 'https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/tutorials/primary-constructors'])

add(7, [
    'گاهی چند نوع، بخش مشترکی دارند؛ مثلاً چند شخصیت بازی همگی می\u200cتوانند حرکت کنند ولی حرکتشان یکسان نیست.',
    'وراثت اجازه می\u200cدهد نوع فرزند از نوع پایه استفاده کند. این رابطه باید از نظر معنی هم درست باشد.',
    'متد virtual به فرزند اجازهٔ تغییر رفتار می\u200cدهد. فرزند با override رفتار تازهٔ همان متد را می\u200cنویسد.',
    'اگر متد واقعاً مجازی باشد، رفتارِ نوع واقعی شیء اجرا می\u200cشود؛ حتی وقتی آن را با متغیرِ نوع پایه نگه داشته\u200cایم.',
    'new فقط عضو هم\u200cنام را پنهان می\u200cکند. آن را با override که رفتار مجازی را عوض می\u200cکند یکی ندان.',
    'sealed override جلوی تغییر دوبارهٔ همان متد در فرزندهای بعدی را می\u200cگیرد. لازم نیست کل کلاس بسته شود.',
    'برای دنبال\u200cکردن خروجی، نوع متغیر و نوع واقعی شیء را جدا بنویس؛ سپس بررسی کن متد virtual است یا نه.',
], ('فرزند می\u200cخواهد رفتارِ مجازیِ نوع پایه را عوض کند. کنار متد چه کلمه\u200cای لازم است؟', 'override', 'new همیشه معادل override است.', 'static', 'override همان slot مجازی را جایگزین می‌کند؛ new پنهان‌سازی عضو است.'),
('اگر یک متد sealed override باشد، فرزند بعدی چه محدودیتی دارد؟', 'override بیشتر در فرزند را ممنوع می‌کند.', 'کل کلاس را static می‌کند.', 'دسترسی متد را private می‌کند.', 'یک متد می‌تواند sealed override باشد در حالی که خود کلاس هنوز قابل ارث‌بری است.'),
('Base x = new Child();\nConsole.WriteLine(x.Name());\nclass Base { public virtual string Name() => "base"; }\nclass Child : Base { public override string Name() => "child"; }', 'child چاپ می‌شود.', True, 'متد مجازی با نوع واقعی Child dispatch می‌شود، حتی اگر مرجع Base باشد.'),
('رفتار باید از مرجع Base هم چندریخت باشد.', ['class Base { public virtual int Hit() => 1; }', 'class Child : Base { public new int Hit() => 2; }'], 1, 'class Child : Base { public override int Hit() => 2; }', 'class Child : Base { public static int Hit() => 2; }', 'new رفتار Base.Hit را برای مرجع Base تغییر نمی‌دهد؛ override لازم است.'),
('کلاس پایه با عضو بدون بدنه را کامل کن.', '__1__ class Enemy\n{\n    public abstract int Damage();\n}', ['abstract'], ['sealed', 'static'], 'کلاسی با عضو abstract باید خود abstract باشد.'),
('دو نوع دشمن را از یک پایه صدا بزن و مجموع آسیب را حساب کن.', ['Enemy[] enemies = [new Goblin(), new Dragon()];\nConsole.WriteLine(enemies.Sum(enemy => enemy.Damage()));', 'abstract class Enemy { public abstract int Damage(); }', 'sealed class Goblin : Enemy { public override int Damage() => 2; }', 'sealed class Dragon : Enemy { public override int Damage() => 8; }'], '10', ['در حلقه هیچ cast به Dragon یا Goblin نباشد.', 'افزودن دشمن تازه به تغییر حلقه نیاز نداشته باشد.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/polymorphism', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/override'])

add(8, [
    'اینترفیس یک قول مشخص دربارهٔ توانایی یک نوع است؛ مثلاً هر چاپگر باید بتواند فرمان چاپ را دریافت کند.',
    'مصرف\u200cکننده فقط باید به قابلیت\u200cهایی وابسته باشد که واقعاً لازم دارد. یک قرارداد کوچک، فهم و آزمون را آسان\u200cتر می\u200cکند.',
    'یک کلاس می\u200cتواند چند اینترفیس را پیاده کند. لازم نیست برای داشتن چند قابلیت، از چند کلاس ارث ببرد.',
    'در پیاده\u200cسازی صریح، عضو را از راه متغیری با نوع همان اینترفیس صدا می\u200cزنیم؛ نام آن عضو، عضو عمومی عادی کلاس نیست.',
    'رفتار پیش\u200cفرض اینترفیس هم معمولاً از راه همان قرارداد فراخوانی می\u200cشود. این رفتار خودبه\u200cخود عضو تازه\u200cای به کلاس اضافه نمی\u200cکند.',
    'اصل ISP پیشنهاد می\u200cکند به\u200cجای یک قرارداد خیلی بزرگ، قراردادهای متناسب با نیاز مصرف\u200cکننده داشته باشیم.',
], ('اگر یک عضو به\u200cصورت صریح برای اینترفیس پیاده شده باشد، از چه راهی آن را صدا می\u200cزنیم؟', 'از طریق مرجع interface', 'فقط با نام ساده روی کلاس', 'هرگز قابل فراخوانی نیست.', 'با cast یا انتساب به interface می‌توان به عضو صریح دسترسی داشت.'),
('کدام اصل پیشنهاد می\u200cکند اینترفیس\u200cها کوچک و متناسب با نیازِ استفاده\u200cکننده باشند؟', 'Interface Segregation', 'اجبار همهٔ کلاس‌ها به یک interface بزرگ', 'boxing', 'ISP مانع وابستگی کلاینت به عملیات غیرمرتبط می‌شود.'),
('IName x = new Item();\nConsole.WriteLine(x.Name);\ninterface IName { string Name { get; } }\nclass Item : IName { string IName.Name => "key"; }', 'key چاپ می‌شود.', True, 'عضو صریح از طریق IName قابل دسترسی است.'),
('برای عضو صریح، مسیر دسترسی را اصلاح کن.', ['var file = new FileItem();', 'Console.WriteLine(file.Name);', 'interface IName { string Name { get; } }', 'class FileItem : IName { string IName.Name => "save"; }'], 1, 'Console.WriteLine(((IName)file).Name);', 'Console.WriteLine(FileItem.Name);', 'FileItem عضو عمومی Name ندارد؛ قرارداد IName مسیر دسترسی عضو صریح است.'),
('قرارداد static abstract را برای نوع ژنریک کامل کن.', 'interface IFactory<T> where T : IFactory<T>\n{\n    static __1__ T Create();\n}', ['abstract'], ['override', 'const'], 'static abstract در interface یک عضو ایستای الزامی برای پیاده‌ساز تعریف می‌کند.'),
('یک قرارداد قابل چاپ با پیاده‌سازی صریح بساز و تنها از interface مصرف کن.', ['IPrintable report = new Report();\nConsole.WriteLine(report.Print());', 'interface IPrintable { string Print(); }', 'sealed class Report : IPrintable\n{\n    string IPrintable.Print() => "report";\n}'], 'report', ['مصرف‌کننده به Report وابسته نباشد.', 'عضو Print در کلاس صریح پیاده شود.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/interfaces/explicit-interface-implementation', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface'])

add(9, [
    'struct برای نمایش دادهٔ مقداری مناسب است؛ مثلاً مختصات یک نقطه. با انتساب معمولی، مقدار آن کپی می\u200cشود.',
    'اگر نقطهٔ دوم را از نقطهٔ اول بسازی و سپس نقطهٔ دوم را تغییر دهی، معمولاً نقطهٔ اول تغییر نمی\u200cکند.',
    'اما اگر داخل struct یک فهرست باشد، آن عضو هنوز راه دسترسی به یک شیء است؛ دو کپی می\u200cتوانند همان فهرست را ببینند.',
    'readonly struct جلوی تغییر فیلدهای نمونه را می\u200cگیرد. این ویژگی، اشیای قابل تغییرِ داخل آن را خودکار ثابت نمی\u200cکند.',
    'وقتی از یک مجموعه مقدار struct می\u200cگیری، ممکن است فقط یک کپی گرفته باشی. تغییر کپی لزوماً داخل مجموعه ذخیره نمی\u200cشود.',
    'ref می\u200cتواند امکان کار با خودِ متغیر را بدهد. پیش از حذف کپی\u200cها برای افزایش سرعت، ابتدا هزینهٔ واقعی را اندازه بگیر.',
], ('وقتی یک struct عادی را به متغیر دیگری می\u200cدهیم، برای مقدار آن چه اتفاقی می\u200cافتد؟', 'کپی مقدار', 'همیشه اشتراک یک شیء', 'همیشه boxing', 'کپی struct با boxing متفاوت است؛ boxing هنگام تبدیل به object یا interface در شرایط مربوط رخ می‌دهد.'),
('داخل یک readonly struct یک List<int> داریم. دقیقاً چه چیزی فقط\u200cخواندنی شده است؟', 'ارجاع فیلد عوض نمی‌شود؛ خود List می‌تواند تغییر کند.', 'List عمیقاً immutable می‌شود.', 'List به آرایه تبدیل می‌شود.', 'readonly محدودیت فیلد است و تضمین immutability عمیق گراف اشیا نیست.'),
('var a = new Point { X = 1 };\nvar b = a;\nb.X = 9;\nConsole.WriteLine(a.X);\nstruct Point { public int X; }', '1 چاپ می‌شود.', True, 'b یک کپی مقداری دارد و تغییر فیلدش a را عوض نمی‌کند.'),
('نسخهٔ تغییرکرده باید دوباره در List ذخیره شود.', ['var list = new List<Point> { new() { X = 1 } };', 'var point = list[0];', 'point.X = 2; // update list', 'struct Point { public int X; }'], 2, 'point.X = 2; list[0] = point;', 'point.X = 2; // no assignment needed', 'indexer لیست مقدار را برمی‌گرداند؛ پس از تغییر کپی باید آن را بازنویسی کرد.'),
('برای تغییر خود متغیر اصلی، پارامتر را کامل کن.', 'static void Move(__1__ int position) => position++;', ['ref'], ['in', 'params'], 'ref دسترسی نوشتنی به همان متغیر را می‌دهد؛ in نوشتن را مجاز نمی‌کند.'),
('Point را immutable طراحی کن و به جای تغییر، مقدار جابه‌جاشدهٔ تازه بساز.', ['var start = new Point(2, 3);\nvar moved = start.Move(5);\nConsole.WriteLine($"{start.X},{moved.X}");', 'readonly struct Point(int x, int y)\n{\n    public int X { get; } = x;\n    public int Y { get; } = y;\n    public Point Move(int dx) => new(X + dx, Y);\n}'], '2,7', ['نسخهٔ اولیه تغییر نکند.', 'هیچ boxing یا فیلد قابل تغییر لازم نیست.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct', 'https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/performance/'])

add(10, [
    'گاهی می\u200cخواهیم دو داده را با محتوایشان مقایسه کنیم؛ مثلاً دو نشانی با شهر و خیابان یکسان.',
    'record برای این مدل\u200cهای داده، رفتار برابری آماده می\u200cکند. record class مرجعی است؛ record struct مقداری است.',
    'with یک کپی با تغییر چند عضو انتخابی می\u200cسازد. نسخهٔ اولیه همچنان وجود دارد.',
    'این کپی سطحی است: اگر عضوی مثل List داشته باشیم، دو نسخه ممکن است همان فهرست را شریک باشند.',
    'init تغییر ویژگی را پس از زمان مقداردهی محدود می\u200cکند. به\u200cتنهایی همهٔ داده\u200cهای تو\u200cدر\u200cتو را تغییرناپذیر نمی\u200cکند.',
    'در تمرین\u200cها، مقایسهٔ محتوای داده را از مقایسهٔ اینکه دو نام به همان شیء اشاره می\u200cکنند جدا کن.',
], ('یک record دارای List است. کپی\u200cکردن آن با with چه نوع کپی\u200cای ایجاد می\u200cکند؟', 'کپی سطحی؛ List می‌تواند مشترک بماند.', 'همیشه deep clone', 'همیشه همان نمونه را تغییر می‌دهد.', 'اعضای مرجعی به‌صورت ارجاع کپی می‌شوند؛ برای استقلال کامل باید عمق کپی را تعریف کرد.'),
('کدام نوع، هم مقداری است و هم رفتار برابریِ record را دارد؟', 'record struct', 'record class', 'static class', 'record struct semantics مقداری struct را با اعضای تولیدشدهٔ رکورد ترکیب می‌کند.'),
('var a = new User("Ada");\nvar b = new User("Ada");\nConsole.WriteLine(a == b);\nrecord User(string Name);', 'True چاپ می‌شود.', True, 'دو رکورد از همان نوع با Name برابر، برابری مقداری دارند هرچند دو نمونه‌اند.'),
('changed باید نام Lin داشته باشد و original با نام Ada باقی بماند.', ['var original = new User("Ada");', 'var changed = original;', 'Console.WriteLine(changed.Name);', 'record User(string Name);'], 1, 'var changed = original with { Name = "Lin" };', 'original.Name = "Lin";', 'property positional رکورد class از نوع init است؛ with مقدار اولیه را حفظ می‌کند و کپی تازه می‌سازد.'),
('نوع رکورد مقداریِ فقط‌خواندنی را بساز.', '__1__ record struct Price(decimal Amount);', ['readonly'], ['abstract', 'volatile'], 'readonly record struct propertyهای positional را init-only می‌کند.'),
('سفارش immutable را با with تخفیف بده و برابری مقدارها را بررسی کن.', ['var original = new Order("book", 100m);\nvar discounted = original with { Total = 80m };', 'Console.WriteLine($"{original.Total},{discounted.Total}");\nConsole.WriteLine(discounted == new Order("book", 80m));', 'record Order(string Product, decimal Total);'], '100,80\nTrue', ['نسخهٔ اصلی باید 100 بماند.', 'برابری با نمونهٔ تازه باید True باشد.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/with-expression'])

add(11, [
    'ژنریک یعنی یک ساختار یا روش را برای چند نوع داده بنویسیم، بدون اینکه بررسی نوع\u200cها را کنار بگذاریم.',
    'مثلاً List<int> فهرست عددهاست و List<string> فهرست متن\u200cها. نوعِ داخل فهرست روشن است.',
    'حرف T جای نوع را می\u200cگیرد. وقتی از کد استفاده می\u200cکنی، نوع واقعی مثل int یا یک کلاس مشخص جای آن قرار می\u200cگیرد.',
    'where می\u200cگوید T باید چه توانایی\u200cای داشته باشد؛ مثلاً یک اینترفیس را پیاده کند.',
    'اگر داخل کد new T() می\u200cنویسی، معمولاً باید سازندهٔ عمومی بدون ورودی را با قید new() درخواست کنی.',
    'قید را بر اساس کاری انتخاب کن که می\u200cخواهی انجام دهی. نام قید به\u200cتنهایی جای بررسی ورودی هنگام اجرا را نمی\u200cگیرد.',
], ('برای یک فهرست مخصوص عددها، کدام طراحی نوع داده را روشن و قابل بررسی نگه می\u200cدارد؟', 'List<int>', 'List<object> همراه cast در همهٔ مصرف‌کننده‌ها', 'dynamic[]', 'List<int> قرارداد عنصر را در کامپایل بررسی می‌کند و تبدیل هر عنصر به object لازم نیست.'),
('در یک متد ژنریک می\u200cخواهیم new T() بنویسیم. معمولاً کدام قید لازم است؟', 'where T : new()', 'where T : sealed', 'where T : static', 'new() وجود سازندهٔ بدون پارامتر عمومی را برای نوع مجاز تضمین می‌کند.'),
('Console.WriteLine(Identity(7));\nstatic T Identity<T>(T value) => value;', '7 چاپ می‌شود.', True, 'کامپایلر T را int استنتاج می‌کند؛ متد مقدار را بدون تبدیل به object برمی‌گرداند.'),
('قابلیت CompareTo را در قرارداد نوع اعلام کن.', ['static T Max<T>(T a, T b)', '    => a.CompareTo(b) >= 0 ? a : b;'], 0, 'static T Max<T>(T a, T b) where T : IComparable<T>', 'static T Max<T>(T a, T b) where T : new()', 'new() قابلیت مقایسه نمی‌دهد؛ IComparable<T> عضو مورد استفاده را تعریف می‌کند.'),
('قید سازنده را کامل کن.', 'static T Create<T>() where T : __1__ => new T();', ['new()'], ['class()', 'object()'], 'new() syntax قید سازنده است و در فهرست قیود معمولاً آخر می‌آید.'),
('Max ژنریک بساز و بدون object یا dynamic برای int و string اجرا کن.', ['Console.WriteLine(Max(3, 8));\nConsole.WriteLine(Max("a", "b"));', 'static T Max<T>(T a, T b) where T : IComparable<T>\n    => a.CompareTo(b) >= 0 ? a : b;'], '8\nb', ['هر دو نوع با یک متد کار کنند.', 'قید فقط قابلیت لازم را بخواهد.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/generics', 'https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters'])

add(12, [
    'فرض کن هر گربه یک حیوان است. روشی که گربه تحویل می\u200cدهد، می\u200cتواند جایی استفاده شود که فقط انتظار دریافت حیوان داریم.',
    'اما گرفتن ورودی جهت متفاوتی دارد: روشی که هر حیوانی را می\u200cپذیرد، می\u200cتواند کارِ پذیرفتن گربه را هم انجام دهد.',
    'در قراردادهای تولیدکننده، out جهت خروج داده را مشخص می\u200cکند. IEnumerable یک نمونهٔ آشناست.',
    'در قراردادهای مصرف\u200cکننده، in جهت ورودی داده را مشخص می\u200cکند. Action نمونه\u200cای برای دریافت ورودی و انجام کار است.',
    'این تبدیل\u200cها برای نوع\u200cهای مرجعیِ مناسب\u200cاند. فهرست عددها خودکار به فهرست object تبدیل نمی\u200cشود.',
    'List<string> را نمی\u200cتوان List<object> دانست؛ وگرنه ممکن بود عددی وارد فهرست مخصوص متن کنیم.',
], ('نوع ورودی و خروجی قراردادها را بررسی کن. کدام تبدیلِ پیشنهادی مجاز است؟', 'IEnumerable<string> به IEnumerable<object>', 'List<string> به List<object>', 'IEnumerable<int> به IEnumerable<object> با واریانس', 'IEnumerable تولیدکننده و covariant است؛ این تبدیل واریانس برای انواع مرجعی اعمال می‌شود.'),
('کاری از نوع Action<object> داریم. آن را می\u200cتوان به کدام متغیر داد؟', 'Action<string>', 'Action<int> با واریانس مرجعی', 'List<object>', 'مصرف‌کنندهٔ object می‌تواند string را هم بپذیرد؛ contravariance جهت ظاهری رابطه را برعکس می‌کند.'),
('IEnumerable<string> names = new[] { "Ada" };\nIEnumerable<object> items = names;\nConsole.WriteLine(items.First());', 'Ada چاپ می‌شود.', True, 'IEnumerable<out T> روی reference typeها covariance دارد.'),
('بدون cast ناامن، قرارداد فقط‌خواندنی خروجی را انتخاب کن.', ['IEnumerable<string> names = new[] { "Ada" };', 'List<object> objects = names;'], 1, 'IEnumerable<object> objects = names;', 'List<object> objects = (List<object>)names;', 'تبدیل covariant برای IEnumerable مجاز است؛ فهرست invariant چنین تبدیلی ندارد.'),
('interface تولیدکننده را کامل کن.', 'interface ISource<__1__ T>\n{\n    T Read();\n}', ['out'], ['in', 'ref'], 'T فقط در خروجی ظاهر شده و out آن را covariant می‌کند.'),
('تولیدکنندهٔ string و مصرف‌کنندهٔ object را در یک pipeline با واریانس متصل کن.', ['IEnumerable<string> names = new[] { "Ada", "Lin" };\nIEnumerable<object> objects = names;', 'Action<object> print = item => Console.WriteLine(item);\nAction<string> printName = print;', 'foreach (string name in names) printName(name);\nConsole.WriteLine(objects.Count());'], 'Ada\nLin\n2', ['از Cast<object>() برای پنهان‌کردن واریانس استفاده نکن.', 'جهت تبدیل Action را توضیح بده.']),
['https://learn.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance', 'https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/'])

add(13, [
    'null یعنی در این متغیر هنوز شیئی نداریم. پیش از استفاده از چنین متغیری باید این احتمال را در نظر بگیریم.',
    'علامت ? کنار یک نوع مرجعی، احتمال نبودن مقدار را برای کامپایلر و خواننده روشن می\u200cکند.',
    'NRT کمک می\u200cکند کامپایلر دربارهٔ بعضی دسترسی\u200cهای خطرناک هشدار دهد؛ تضمین نمی\u200cکند هیچ خطای null رخ ندهد.',
    'علامت ! فقط هشدار را خاموش می\u200cکند. این علامت بررسی تازه\u200cای هنگام اجرای برنامه اضافه نمی\u200cکند.',
    '?. فقط وقتی مقدار وجود داشته باشد به عضو دسترسی می\u200cدهد. ?? برای حالت null مقدار جایگزین تعیین می\u200cکند.',
    'مثال: name ?? "مهمان" در صورت نبودن نام، متن مهمان را انتخاب می\u200cکند. دادهٔ ورودی شبکه را هم جدا بررسی کن.',
], ('وقتی کنار name علامت ! می\u200cگذاریم، واقعاً چه کاری انجام شده است؟', 'فقط هشدار تحلیل null را برای آن عبارت خاموش می‌کند.', 'اگر null باشد string.Empty می‌سازد.', 'در runtime استثنا را می‌گیرد.', '! نه guard است و نه مقدار جایگزین؛ استفادهٔ نادرست آن خطر runtime را باقی می‌گذارد.'),
('می\u200cخواهیم فقط در صورت null بودن، مقدار جایگزین انتخاب شود. کدام عملگر مناسب است؟', '??', '|| روی string', '++', '?? فقط null بودن سمت چپ را بررسی می‌کند؛ رشتهٔ خالی را null فرض نمی‌کند.'),
('string? name = null;\nConsole.WriteLine(name?.Length ?? 0);', '0 چاپ می‌شود.', True, '?. نتیجهٔ nullable می‌دهد و ?? در حالت null صفر را انتخاب می‌کند.'),
('دسترسی به نام اختیاری را امن کن.', ['string? name = null;', 'Console.WriteLine(name!.Length);'], 1, 'Console.WriteLine(name?.Length ?? 0);', 'Console.WriteLine(name!.Length + 0);', '! هیچ بررسی زمان اجرا ندارد؛ ?. و ?? مسیر null را پوشش می‌دهند.'),
('تنها در صورت null، مقدار پیش‌فرض ذخیره شود.', 'string? name = null;\nname __1__ "guest";\nConsole.WriteLine(name);', ['??='], ['==', '+='], '??= سمت راست را در صورت null بودن سمت چپ ارزیابی و انتساب می‌کند.'),
('نام ورودی اختیاری را trim کن و null یا whitespace را به guest تبدیل کن.', ['Console.WriteLine(Normalize(null));\nConsole.WriteLine(Normalize("  Ada  "));', 'static string Normalize(string? value)\n{\n    if (string.IsNullOrWhiteSpace(value)) return "guest";\n    return value.Trim();\n}'], 'guest\nAda', ['از ! برای دور زدن تحلیل استفاده نکن.', 'null، فاصله و نام معتبر را در review بررسی کن.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/nullable-references', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/null-coalescing-operator'])

add(14, [
    'الگوخوانی یعنی شکل داده را بررسی کنیم؛ مثلاً بپرسیم آیا یک متن وجود دارد و خالی نیست؟',
    'الگوی ویژگی می\u200cتواند مقدار عضوی مثل Length را بررسی کند. اگر خودِ شیء null باشد، این الگو منطبق نمی\u200cشود.',
    'با الگوی فهرست می\u200cتوان شکل خانه\u200cهای یک دنباله را بررسی کرد؛ لازم نیست هر بار یک حلقهٔ دستی بنویسیم.',
    '.. در الگوی فهرست می\u200cتواند بخش میانی با صفر یا چند خانه را بپذیرد. _ یعنی مقدار این قسمت برایمان مهم نیست.',
    'and، or و not در الگوها برای ترکیب شرط\u200cها هستند. آن\u200cها را با شکل نوشتن عبارت\u200cهای معمولی اشتباه نگیر.',
    'در switch، اولین حالت منطبق انتخاب می\u200cشود. حالت\u200cهای خاص\u200cتر را پیش از حالت\u200cهای کلی قرار بده.',
], ('در الگوی فهرست، کدام قسمت می\u200cتواند صفر یا چند خانهٔ میانی را بپذیرد؟', '..', '&&', '=>', 'slice pattern یعنی .. بخش با طول متغیر است؛ دو نقطه عملگر logical نیست.'),
('اگر متن null باشد، بررسی الگوی { Length: > 0 } چه نتیجه\u200cای دارد؟', 'false می‌شود.', 'همیشه NullReferenceException می‌دهد.', 'رشته را خالی می‌کند.', 'property pattern ابتدا نیاز به مقدار غیرnull دارد و null با آن منطبق نمی‌شود.'),
('int[] values = [1, 2, 9];\nConsole.WriteLine(values is [1, .., 9]);', 'True چاپ می‌شود.', True, 'ابتدا 1، انتها 9 و هر تعداد عنصر میانی با .. پذیرفته می‌شود.'),
('الگو باید بازهٔ بستهٔ 1 تا 10 را بپذیرد، نه همهٔ اعداد.', ['int value = 100;', 'bool valid = value is >= 1 or <= 10;'], 1, 'bool valid = value is >= 1 and <= 10;', 'bool valid = value is >= 1 or < 1000;', 'or اجتماع دو شرط را می‌سازد و تقریباً هر عدد را می‌پذیرد؛ بازه به and نیاز دارد.'),
('ابتدا و انتهای دنباله را با طول متغیر تطبیق بده.', 'int[] values = [1, 2, 3, 9];\nConsole.WriteLine(values is [1, __1__, 9]);', ['..'], ['_', 'and'], '_ دقیقاً یک عنصر را می‌گیرد؛ .. هر تعداد عنصر میانی را می‌پذیرد.'),
('قیمت سفارش مثبت و شناسهٔ معتبر را با property pattern ارزیابی کن.', ['var order = new Order("A1", 20m);\nConsole.WriteLine(IsValid(order));\nConsole.WriteLine(IsValid(null));', 'static bool IsValid(Order? order) => order is { Id.Length: > 0, Total: > 0 };', 'record Order(string Id, decimal Total);'], 'True\nFalse', ['null نباید exception ایجاد کند.', 'قانون اعتبار در یک predicate روشن باشد.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/pattern-matching'])

add(15, [
    'گاهی لازم است خودِ یک کار را به بخش دیگری بدهیم؛ مثلاً بگوییم برای هر نام، این روش نمایش را اجرا کن.',
    'delegate راهی با نوع مشخص برای اشاره به یک متد است. lambda شکل کوتاه نوشتن بعضی از این کارهاست.',
    'Func معمولاً نتیجه\u200cای برمی\u200cگرداند. Action کاری انجام می\u200cدهد ولی مقدار نتیجه ندارد. Predicate نتیجهٔ درست یا نادرست می\u200cدهد.',
    'یک lambda می\u200cتواند از متغیرِ بیرون خودش استفاده کند. این کار همیشه یک عکس ثابت از مقدار آن متغیر نیست.',
    'اگر همان متغیر بعداً تغییر کند، lambda ممکن است مقدار تازه را ببیند. در حل تمرین، زمانِ اجرای کار را مشخص کن.',
    'static lambda اجازهٔ گرفتن متغیرهای محلی بیرون را نمی\u200cدهد. این محدودیت کمک می\u200cکند وابستگی\u200cهای پنهان کمتر شوند.',
], ('می\u200cخواهیم یک کار را به متدی بدهیم، اما آن کار نتیجه\u200cای برنمی\u200cگرداند. کدام delegate آماده مناسب است؟', 'Action<T>', 'Func<T, int> همیشه', 'IEnumerable<T>', 'Action برای side effect و بدون خروجی است؛ Func آخرین type argument را برای خروجی دارد.'),
('اگر lambda را static بنویسیم، چه دسترسی\u200cای محدود می\u200cشود؟', 'نمی‌تواند متغیر محلی یا this بیرون را capture کند.', 'هیچ متدی را نمی‌تواند صدا بزند.', 'هرگز delegate نمی‌سازد.', 'static capture تصادفی را می‌بندد ولی مانع استفاده از عضوهای static یا پارامترهای خود lambda نیست.'),
('int factor = 2;\nFunc<int, int> multiply = x => x * factor;\nfactor = 3;\nConsole.WriteLine(multiply(4));', '12 چاپ می‌شود.', True, 'lambda متغیر factor را capture کرده است؛ مقدار فعلی آن 3 است.'),
('قرار است snapshot مقدار 2 ثبت شود.', ['int factor = 2;', 'Func<int, int> multiply = x => x * factor;', 'factor = 3;'], 1, 'int snapshot = factor; Func<int, int> multiply = x => x * snapshot;', 'Func<int, int> multiply = x => x * factor;', 'کپی مستقل snapshot بعداً تغییر نمی‌کند؛ lambda هنوز capture دارد ولی دیگر به factor متغیر وابسته نیست.'),
('نوع تابع یک int ورودی و یک bool خروجی را کامل کن.', '__1__<int, bool> isEven = static value => value % 2 == 0;', ['Func'], ['Action', 'List'], 'Func<int,bool> امضای لازم را دارد؛ Predicate<int> نیز با نحو دیگری گزینهٔ معتبری است.'),
('فیلتر و تبدیل را با delegateهای تزریق‌شده پیاده کن.', ['int[] numbers = [1, 2, 3, 4];\nFunc<int, bool> keep = static x => x % 2 == 0;\nFunc<int, int> transform = static x => x * 10;', 'var result = numbers.Where(keep).Select(transform).ToArray();\nConsole.WriteLine(string.Join(",", result));'], '20,40', ['lambdaها capture نداشته باشند.', 'ترتیب عناصر حفظ شود.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions', 'https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/'])

add(16, [
    'رویداد برای خبر دادن یک تغییر است؛ مثلاً وقتی دکمه\u200cای زده شد، چند بخش برنامه باخبر شوند.',
    'بخش فرستنده خبر را منتشر می\u200cکند. بخش\u200cهای دیگر با += مشترک می\u200cشوند و با -= اشتراک را پایان می\u200cدهند.',
    'مصرف\u200cکنندهٔ بیرونی معمولاً نمی\u200cتواند رویداد را خودش اجرا کند یا همهٔ مشترک\u200cها را یک\u200cجا جایگزین کند.',
    'برای لغو اشتراک یک lambda، همان نمونهٔ delegate را نگه دار. نوشتن دوبارهٔ متن مشابه، لزوماً همان نمونه نیست.',
    'اگر فرستنده مدت زیادی زنده بماند، نگه\u200cداشتن اشتراک می\u200cتواند عمر دریافت\u200cکننده را هم طولانی کند.',
    'در پایان کار، اشتراک\u200cهای لازم\u200cنبودنی را ببند. علامت ?. به\u200cتنهایی همهٔ مشکل\u200cهای هم\u200cزمانی را حل نمی\u200cکند.',
], ('یک بخش بیرون از کلاسِ فرستنده، دربارهٔ event چه کاری می\u200cتواند انجام دهد؟', 'اشتراک و لغو اشتراک با += و -=', 'Invoke مستقیم event در هر کلاس', 'پاک‌کردن تمام handlerها با = null', 'event حق انتشار را به ناشر محدود می‌کند؛ delegate عمومی چنین مرزی ندارد.'),
('برای پایان\u200cدادن به اشتراکِ یک lambda، چه چیزی را باید نگه داشته باشیم؟', 'همان نمونهٔ delegate ثبت‌شده را نگه داریم.', 'یک lambda تازه با متن مشابه بنویسیم.', 'فقط GC.Collect را صدا بزنیم.', 'متن مشابه هویت delegate ثبت‌شده را تضمین نمی‌کند؛ نگهداری handler امکان -= صحیح را می‌دهد.'),
('var source = new Source();\nsource.Changed += (_, _) => Console.WriteLine("changed");\nsource.Raise();\nclass Source { public event EventHandler? Changed; public void Raise() => Changed?.Invoke(this, EventArgs.Empty); }', 'changed چاپ می‌شود.', True, 'ناشر Raise رویداد را منتشر می‌کند و مشترک فراخوانی می‌شود.'),
('پس از اولین Raise اشتراک باید برداشته شود؛ خط cleanup را اصلاح کن.', ['var source = new Source();', 'EventHandler handler = (_, _) => Console.WriteLine("changed");', 'source.Changed += handler;', 'source.Raise();', 'source.Changed += handler; // cleanup', 'class Source { public event EventHandler? Changed; public void Raise() => Changed?.Invoke(this, EventArgs.Empty); }'], 4, 'source.Changed -= handler;', 'source.Changed += (_, _) => {};', 'افزودن handler تازه پاک‌سازی نیست؛ -= روی همان delegate لازم است.'),
('رویداد nullable را با فراخوانی امن منتشر کن.', 'class Source\n{\n    public event EventHandler? Changed;\n    public void Raise() => Changed__1__Invoke(this, EventArgs.Empty);\n}', ['?.'], ['!.', '.'], '?. اگر هیچ مشترکی نباشد فراخوانی را انجام نمی‌دهد؛ ! فقط هشدار را پنهان می‌کند.'),
('یک بار مشترک شو، رویداد را بگیر، لغو اشتراک کن و مطمئن شو بار دوم شمارنده زیاد نمی‌شود.', ['var source = new Source();\nint count = 0;\nEventHandler handler = (_, _) => count++;', 'source.Changed += handler;\nsource.Raise();\nsource.Changed -= handler;\nsource.Raise();\nConsole.WriteLine(count);', 'sealed class Source\n{\n    public event EventHandler? Changed;\n    public void Raise() => Changed?.Invoke(this, EventArgs.Empty);\n}'], '1', ['لغو اشتراک با همان handler انجام شود.', 'ناشر تنها محل Invoke باشد.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/events/', 'https://learn.microsoft.com/en-us/dotnet/desktop/wpf/events/weak-event-patterns'])

add(17, [
    'مجموعه برای نگهداری چند داده است. انتخاب نوع مجموعه به کاری بستگی دارد که بیشتر انجام می\u200cدهی.',
    'آرایه طول ثابت دارد. List برای فهرستی مناسب است که تعداد داده\u200cهایش تغییر می\u200cکند.',
    'Count تعداد داده\u200cهای فعلی است؛ Capacity جای آمادهٔ فهرست است. این دو عدد لزوماً برابر نیستند.',
    'افزودن به List بیشتر وقت\u200cها سبک است؛ اما گاهی برای بزرگ\u200cکردن فضای داخلی، داده\u200cها کپی می\u200cشوند.',
    'HashSet برای داده\u200cهای یکتا و بررسی وجود یک مقدار مناسب است. Dictionary هر کلید را به یک مقدار مربوط می\u200cکند.',
    'مثال: برای نام\u200cهای تکرارنشدنی از یک مجموعهٔ یکتا استفاده کن؛ برای یافتن امتیاز هر نام، نگاشت نام به امتیاز مناسب\u200cتر است.',
], ('تعداد زیادی شناسهٔ یکتا داریم و زیاد می\u200cپرسیم «این شناسه وجود دارد؟». کدام مجموعه مناسب\u200cتر است؟', 'HashSet<string>', 'List<string> و اسکن برای هر پرس‌وجو', 'string.Concat در هر بار', 'HashSet برای membership طراحی شده؛ comparer و الگوی داده بر عملکرد واقعی اثر دارند.'),
('هزینهٔ افزودن داده با List.Add را کدام توضیح دقیق\u200cتر بیان می\u200cکند؟', 'amortized O(1)؛ رشد ظرفیت می‌تواند O(n) شود.', 'هر فراخوانی بدون استثنا O(1) است.', 'همیشه O(n²) است.', 'افزایش ظرفیت به تخصیص و کپی عناصر نیاز دارد؛ هزینه روی دنباله‌ای از افزودن‌ها سرشکن می‌شود.'),
('var ids = new HashSet<int> { 1, 1, 2 };\nConsole.WriteLine(ids.Count);', '2 چاپ می‌شود.', True, 'HashSet مقدار تکراری را به عنوان عضو دوم ذخیره نمی‌کند.'),
('نباید نبودن کلید باعث استثنا شود.', ['var scores = new Dictionary<string, int>();', 'int value = scores["missing"];'], 1, 'int value = scores.TryGetValue("missing", out var found) ? found : 0;', 'int value = scores["missing"] ?? 0;', 'indexer برای کلید غایب KeyNotFoundException می‌دهد؛ TryGetValue مسیر نبودن را روشن می‌کند.'),
('برای جلوگیری از تکرار حروف بزرگ و کوچک comparer را کامل کن.', 'var names = new HashSet<string>(StringComparer.__1__);\nnames.Add("Ada"); names.Add("ADA");\nConsole.WriteLine(names.Count);', ['OrdinalIgnoreCase'], ['Ordinal', 'CurrentCulture'], 'OrdinalIgnoreCase هویت مستقل از فرهنگ و بدون حساسیت به حروف را برای این شناسه‌ها تعریف می‌کند.'),
('فراوانی کلمات را با Dictionary و TryGetValue حساب کن.', ['string[] words = ["a", "b", "a"];\nvar counts = new Dictionary<string, int>(StringComparer.Ordinal);', 'foreach (string word in words)\n{\n    counts.TryGetValue(word, out int count);\n    counts[word] = count + 1;\n}', 'Console.WriteLine($"{counts["a"]},{counts["b"]}");'], '2,1', ['کلید ناموجود بدون exception مدیریت شود.', 'یک پیمایش اصلی روی ورودی کافی است.']),
['https://learn.microsoft.com/en-us/dotnet/standard/collections/selecting-a-collection-class', 'https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.add'])

add(18, [
    'گاهی ترتیبِ خارج\u200cشدن داده\u200cها از مجموعه مهم است؛ مثلاً صف چاپ با تاریخچهٔ بازگرداندن کارها یکسان نیست.',
    'Queue شبیه صف نوبت است: داده\u200cای که زودتر آمده، زودتر خارج می\u200cشود. به این روش FIFO می\u200cگویند.',
    'Stack شبیه دستهٔ بشقاب است: آخرین داده زودتر برداشته می\u200cشود. این روش LIFO نام دارد و برای undo مناسب است.',
    'PriorityQueue بر اساس اولویت انتخاب می\u200cکند. در حالت پیش\u200cفرض .NET، عدد اولویت کوچک\u200cتر زودتر خارج می\u200cشود.',
    'برای اولویت\u200cهای برابر، ترتیب ثابت را بدون قرارداد اضافه فرض نکن. اگر ترتیب مهم است، آن را خودت در اولویت بیان کن.',
    'ساختارهای مرتب برای نگه\u200cداشتن ترتیب کلیدها مفیدند. ساختار مناسب را از روی نیاز انتخاب کن، نه فقط اسمش.',
], ('می\u200cخواهیم آخرین کارِ انجام\u200cشده را زودتر برگردانیم. کدام ساختار طبیعی\u200cتر است؟', 'Stack<T>', 'Queue<T>', 'HashSet<T> بدون ترتیب', 'undo معمولاً آخرین عملیات را اول برمی‌گرداند؛ رفتار LIFO پشته با آن سازگار است.'),
('در PriorityQueue پیش\u200cفرض، کدام عددِ اولویت زودتر انتخاب می\u200cشود؟', 'کمترین مقدار', 'بیشترین مقدار همیشه', 'ترتیب ورود بدون توجه به priority', 'صف اولویت پیش‌فرض min-heap semantics دارد؛ برای معکوس‌کردن باید comparer مناسب داد.'),
('var queue = new Queue<int>();\nqueue.Enqueue(1); queue.Enqueue(2);\nConsole.WriteLine(queue.Dequeue());', '1 چاپ می‌شود.', True, 'Queue ترتیب FIFO دارد و اولین عنصر ورودی را خارج می‌کند.'),
('کار urgent باید priority برابر 1 داشته باشد و پیش از later با priority برابر 10 اجرا شود.', ['var queue = new PriorityQueue<string, int>();', 'queue.Enqueue("urgent", 100);', 'queue.Enqueue("later", 10);'], 1, 'queue.Enqueue("urgent", 1);', 'queue.Enqueue("urgent", 100);', 'قرارداد مسئله priority=1 را مشخص کرده؛ در صف پیش‌فرض کمترین priority زودتر خارج می‌شود.'),
('نوع ساختار FIFO را انتخاب کن.', 'var jobs = new __1__<int>();\njobs.Enqueue(1);\nConsole.WriteLine(jobs.Dequeue());', ['Queue'], ['Stack', 'HashSet'], 'Queue متدهای Enqueue و Dequeue برای FIFO دارد.'),
('زمان‌بند min-priority بساز و کار فوری را پیش از کار عادی اجرا کن.', ['var jobs = new PriorityQueue<string, int>();\njobs.Enqueue("normal", 10);\njobs.Enqueue("urgent", 1);', 'while (jobs.TryDequeue(out string? job, out _))\n    Console.WriteLine(job);'], 'urgent\nnormal', ['از sort دستی کل فهرست در هر dequeue استفاده نکن.', 'رفتار priorityهای برابر را تضمین‌شده فرض نکن.']),
['https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.priorityqueue-2', 'https://learn.microsoft.com/en-us/dotnet/standard/collections/'])

add(19, [
    'فقط\u200cخواندنی یعنی از این راه اجازهٔ تغییر نداریم. این با اینکه هیچ\u200cکس نتواند داده را تغییر دهد فرق دارد.',
    'ممکن است یک بخش برنامه فهرست را فقط بخواند، ولی مالک اصلیِ همان فهرست هنوز آن را تغییر دهد.',
    'IReadOnlyCollection به\u200cتنهایی یک عکس ثابت از داده نمی\u200cسازد. AsReadOnly هم می\u200cتواند تغییرهای فهرست اصلی را نشان دهد.',
    'در مجموعهٔ تغییرناپذیر، عملیات تغییر نسخهٔ تازه می\u200cدهد. نسخهٔ قبلی همچنان معتبر و بدون تغییر می\u200cماند.',
    'مثال: نتیجهٔ ImmutableList.Add را باید نگه داری. صدا زدن Add به\u200cتنهایی نسخهٔ قبلی را عوض نمی\u200cکند.',
    'اگر اعضای مجموعه، شیء قابل تغییر باشند، ثابت\u200cبودن خود مجموعه لزوماً همهٔ آن اشیا را ثابت نمی\u200cکند.',
], ('آیا داشتنِ IReadOnlyCollection<T> یعنی داده\u200cها حتماً یک نسخهٔ ثابت و تغییرناپذیرند؟', 'خیر؛ شیء پشت رابط می‌تواند تغییر کند.', 'بله، همیشه deep copy می‌گیرد.', 'فقط اگر T عدد باشد.', 'رابط فقط مسیرهای قابل استفادهٔ مصرف‌کننده را محدود می‌کند.'),
('وقتی Add را روی ImmutableList صدا می\u200cزنیم، چه اتفاقی می\u200cافتد؟', 'نسخهٔ تازه را برمی‌گرداند.', 'نسخهٔ اصلی را درجا عوض می‌کند.', 'همیشه exception می‌دهد.', 'برای حفظ تغییر باید نتیجهٔ Add را ذخیره کرد؛ نسخهٔ قبلی دست‌نخورده می‌ماند.'),
('var values = new List<int> { 1 };\nIReadOnlyCollection<int> view = values;\nvalues.Add(2);\nConsole.WriteLine(view.Count);', '2 چاپ می‌شود.', True, 'view هنوز به همان List اشاره می‌کند؛ فقط API آن محدودتر است.'),
('خروجی immutable operation را فراموش نکن.', ['var values = System.Collections.Immutable.ImmutableList.Create(1);', 'values.Add(2);', 'Console.WriteLine(values.Count);'], 1, 'values = values.Add(2);', 'values.Append(2);', 'Add مقدار تازه می‌سازد؛ نادیده‌گرفتن خروجی تغییر را در متغیر نگه نمی‌دارد.'),
('برای ساخت snapshot مستقل از List، تبدیل مناسب را کامل کن.', 'var list = new List<int> { 1 };\nint[] snapshot = list.__1__();\nlist.Add(2);\nConsole.WriteLine(snapshot.Length);', ['ToArray'], ['AsReadOnly', 'Clear'], 'ToArray آرایهٔ تازه می‌سازد؛ AsReadOnly view زنده است. آرایهٔ snapshot همچنان خودش قابل تغییر است.'),
('یک نسخهٔ ImmutableArray بساز و نسخهٔ افزوده را کنار نسخهٔ اصلی نگه دار.', ['var first = System.Collections.Immutable.ImmutableArray.Create(1, 2);', 'var second = first.Add(3);\nConsole.WriteLine($"{first.Length},{second.Length}");'], '2,3', ['هر دو نسخه پس از Add معتبر باشند.', 'فرق collection immutable و عناصر immutable را توضیح بده.']),
['https://learn.microsoft.com/en-us/dotnet/standard/collections/immutable/', 'https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.ireadonlycollection-1'])

add(20, [
    'پرس\u200cوجو یعنی از میان داده\u200cها، چیزهای موردنیاز را انتخاب کنیم؛ مثلاً فقط عددهای مثبت یک فهرست را بگیریم.',
    'LINQ چند ابزار آماده برای چنین کارهایی می\u200cدهد. بیشتر این ابزارها را می\u200cتوان پشت سر هم نوشت.',
    'تعریف یک پرس\u200cوجو همیشه به معنی اجرای فوری آن نیست. بعضی کارها تازه هنگام پیمایش داده شروع می\u200cشوند.',
    'بدنهٔ متدی با yield معمولاً وقتی اجرا می\u200cشود که مصرف\u200cکننده خواندن داده\u200cها را شروع کند، نه صرفاً هنگام گرفتن دنباله.',
    'اگر یک پرس\u200cوجوی هزینه\u200cدار را دوباره بخوانی، ممکن است محاسباتش دوباره انجام شوند.',
    'ToList یا ToArray می\u200cتواند نتیجه را همان موقع در حافظه نگه دارد. این کار حافظه مصرف می\u200cکند؛ آن را بر اساس نیاز انتخاب کن.',
], ('بدنهٔ یک متدِ iterator با yield معمولاً از چه زمانی شروع به اجرا می\u200cکند؟', 'هنگام پیمایش و MoveNext', 'فقط هنگام تعریف متد', 'همیشه هنگام ساخت delegate', 'فراخوانی iterator شیء دنباله می‌سازد؛ اجرای بخش‌های بدنه با پیشروی enumerator رخ می‌دهد.'),
('قرار است نتیجهٔ یک پرس\u200cوجوی هزینه\u200cدار را چندبار بخوانیم. چطور می\u200cتوانیم از تکرار محاسبات جلوگیری کنیم؟', 'یک بار materialize کنیم، اگر اندازهٔ داده مناسب است.', 'همیشه Any و سپس Count و سپس foreach جدا بزنیم.', 'نام query را عوض کنیم.', 'ToArray نتیجه را یک بار می‌گیرد؛ تصمیم باید هزینهٔ حافظه و تازگی داده را در نظر بگیرد.'),
('var values = new List<int> { 1 };\nvar query = values.Where(x => x > 0);\nvalues.Add(2);\nConsole.WriteLine(query.Count());', '2 چاپ می‌شود.', True, 'Where deferred است و هنگام Count فهرست با هر دو عنصر دیده می‌شود.'),
('مصرف دوباره نباید iterator را دوباره اجرا کند.', ['IEnumerable<int> source = Enumerable.Range(1, 3);', 'var query = source.Select(x => x * 2);', 'Console.WriteLine(query.Count()); Console.WriteLine(query.Sum());'], 1, 'var query = source.Select(x => x * 2).ToArray();', 'var query = source.Select(x => x * 2).AsEnumerable();', 'AsEnumerable materialize نمی‌کند؛ ToArray نتیجه را ذخیره می‌کند.'),
('iterator را با تعلیق و ارائهٔ یک مقدار کامل کن.', 'static IEnumerable<int> Range()\n{\n    __1__ return 1;\n    yield return 2;\n}', ['yield'], ['async', 'foreach'], 'yield return مقدار فعلی را می‌دهد و وضعیت برای MoveNext بعدی حفظ می‌شود.'),
('iterator با شمارش side effect بساز و نشان بده materialize فقط یک بار بدنه را پیمایش می‌کند.', ['int visits = 0;\nvar snapshot = Values().ToArray();\nConsole.WriteLine(snapshot.Sum());\nConsole.WriteLine(snapshot.Count());\nConsole.WriteLine(visits);', 'IEnumerable<int> Values()\n{\n    for (int i = 1; i <= 3; i++)\n    {\n        visits++;\n        yield return i;\n    }\n}'], '6\n3\n3', ['Count و Sum نباید visits را دوباره افزایش دهند.', 'هزینهٔ snapshot را توضیح بده.']),
['https://learn.microsoft.com/en-us/dotnet/standard/linq/deferred-execution-lazy-evaluation', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/yield'])

add(21, [
    'بعضی داده\u200cها تو\u200cدر\u200cتو هستند؛ مثلاً یک فهرست از کلاس\u200cها که هر کلاس، فهرست دانش\u200cآموزان خودش را دارد.',
    'برای ساخت یک فهرست یک\u200cدست از همهٔ اعضای این گروه\u200cها، باید لایهٔ داخلی را باز کنیم؛ این کار را تخت\u200cکردن می\u200cگویند.',
    'SelectMany برای تخت\u200cکردن مناسب است. GroupBy داده\u200cها را گروه\u200cبندی می\u200cکند و Join داده\u200cهای مرتبط را به هم وصل می\u200cکند.',
    'IQueryable می\u200cتواند توصیف یک پرس\u200cوجو را به اجراکنندهٔ دیگری بدهد؛ مثلاً تا آن را برای پایگاه داده ترجمه کند.',
    'این توصیف با اجرای مستقیم کد C# یکی نیست. هر متدی که در C# داریم، لزوماً به زبان پایگاه داده ترجمه نمی\u200cشود.',
    'وقتی بخشی از پرس\u200cوجو را به حافظهٔ برنامه می\u200cآوری، اندازهٔ دادهٔ منتقل\u200cشده و زمان اجرا را در نظر بگیر.',
], ('یک List<List<int>> داریم و یک فهرست یک\u200cدست از عددها می\u200cخواهیم. کدام عملگر مناسب است؟', 'SelectMany', 'Select به‌تنهایی همیشه', 'OrderBy', 'SelectMany نتایج دنباله‌ای هر عنصر را در یک دنبالهٔ خروجی ترکیب می‌کند.'),
('اجراکنندهٔ IQueryable معمولاً چه توصیفی از پرس\u200cوجو دریافت می\u200cکند؟', 'Expression tree', 'فقط متن خروجی Console', 'الزاماً native machine code', 'درخت عبارت ساختار query را برای تحلیل و ترجمه در اختیار provider می‌گذارد.'),
('int[][] groups = [[1, 2], [3]];\nConsole.WriteLine(groups.SelectMany(x => x).Sum());', '6 چاپ می‌شود.', True, 'SelectMany سه عنصر را در یک دنباله تخت می‌کند و Sum آن‌ها را جمع می‌زند.'),
('به جای جمع طول گروه‌ها، مجموع خود عددها لازم است.', ['int[][] groups = [[1, 2], [3]];', 'int total = groups.Select(x => x.Length).Sum();'], 1, 'int total = groups.SelectMany(x => x).Sum();', 'int total = groups.Count();', 'طول‌ها تعداد عناصر را می‌دهند؛ برای جمع عددها ابتدا دنباله را تخت کن.'),
('نوع درخت عبارت را کامل کن.', 'System.Linq.Expressions.__1__<Func<int, bool>> rule = x => x > 0;', ['Expression'], ['Action', 'IQueryable'], 'Expression<Func<...>> دادهٔ ساختار lambda را نگه می‌دارد؛ خود Func delegate اجرایی است.'),
('اقلام گروه‌های سفارش را تخت کن، بر محصول گروه‌بندی کن و جمع تعداد را مرتب چاپ کن.', ['var orders = new[] { new[] { (Name: "a", Qty: 2), (Name: "b", Qty: 1) }, new[] { (Name: "a", Qty: 3) } };', 'var totals = orders.SelectMany(x => x)\n    .GroupBy(x => x.Name)\n    .Select(g => (Name: g.Key, Qty: g.Sum(x => x.Qty)))\n    .OrderBy(x => x.Name);', 'foreach (var item in totals) Console.WriteLine($"{item.Name}:{item.Qty}");'], 'a:5\nb:1', ['مرتب‌سازی خروجی صریح باشد.', 'فقط تعداد گروه‌ها را جمع نکن.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/', 'https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/'])

add(22, [
    'گاهی یک کار نمی\u200cتواند کامل شود؛ مثلاً فایل وجود ندارد. استثنا راهی برای گزارش چنین شکست\u200cهایی است.',
    'try بخشی است که ممکن است خطا بدهد. catch برای خطایی است که می\u200cتوانیم درباره\u200cاش کاری انجام دهیم.',
    'catch خالی، مشکل را پنهان می\u200cکند. یا خطا را درست جبران کن، یا اطلاعات کافی برای پیگیری آن نگه دار.',
    'وقتی همان خطا را دوباره می\u200cفرستی، throw; مسیر اصلی خطا را حفظ می\u200cکند. نوشتن throw ex; با آن یکسان نیست.',
    'when شرط انتخاب یک catch را تعیین می\u200cکند. finally برای کارهای پاک\u200cسازی در بیشتر مسیرهای خروج به کار می\u200cرود.',
    'برای ورودی\u200cهای معمولیِ قابل انتظار، روشی مثل TryParse می\u200cتواند از ساختن خطا برای کنترل عادی برنامه مناسب\u200cتر باشد.',
], ('در catch می\u200cخواهیم همان خطا را با حفظ مسیر شروع آن دوباره بفرستیم. چه می\u200cنویسیم؟', 'throw;', 'throw ex;', 'return null در تمام متدها', 'throw بدون عبارت همان exception در حال مدیریت را دوباره پرتاب می‌کند.'),
('شرطِ اینکه یک catch خطا را بگیرد، در کدام قسمت نوشته می\u200cشود؟', 'when در exception filter', 'با override روی catch', 'با checked روی catch', 'when فیلتر را پیش از اجرای بدنهٔ handler ارزیابی می‌کند.'),
('try { throw new InvalidOperationException("x"); }\ncatch (InvalidOperationException ex) when (ex.Message == "x") { Console.WriteLine("handled"); }', 'handled چاپ می‌شود.', True, 'نوع exception و شرط filter هر دو منطبق‌اند.'),
('stack اصلی باید هنگام گزارش به لایهٔ بالاتر حفظ شود.', ['try { throw new InvalidOperationException(); }', 'catch (Exception ex) { Console.WriteLine(ex.Message); throw ex; }'], 1, 'catch (Exception ex) { Console.WriteLine(ex.Message); throw; }', 'catch (Exception) { return; }', 'بازپرتاب با throw; stack اولیه را حفظ می‌کند؛ swallow کردن قرارداد شکست را عوض می‌کند.'),
('فیلتر استثنای پیام مشخص را کامل کن.', 'try { throw new IOException("retry"); }\ncatch (IOException ex) __1__ (ex.Message == "retry") { Console.WriteLine("retryable"); }', ['when'], ['where', 'if'], 'when syntax رسمی exception filter است.'),
('ورودی نامعتبر را با TryParse رد کن و finally را برای مشاهدهٔ پایان عملیات نشان بده.', ['try\n{\n    if (!int.TryParse("bad", out int value)) Console.WriteLine("invalid");\n    else Console.WriteLine(value);\n}', 'finally\n{\n    Console.WriteLine("finished");\n}'], 'invalid\nfinished', ['ورودی عادی نامعتبر نیاز به catch عمومی نداشته باشد.', 'مسیر finally را مستقل از موفقیت توضیح بده.']),
['https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements'])

add(23, [
    'گزارش رویدادها کمک می\u200cکند بفهمیم برنامه چه کرده و مشکل از کجا شروع شده است.',
    'گزارش مفید فقط یک جمله نیست؛ اطلاعاتی مثل شناسهٔ سفارش را هم با نام مشخص نگه می\u200cدارد تا قابل جست\u200cوجو باشد.',
    'در الگوی پیام، نامی مثل {OrderId} را نگه دار و مقدار آن را جدا بده. ساختن یک متن آماده می\u200cتواند این ساختار را از بین ببرد.',
    'رمز، توکن و اطلاعات حساس را در گزارش ننویس. مقدار بیشترِ گزارش همیشه به معنی گزارش بهتر نیست.',
    'وقتی یک درخواست از چند بخش می\u200cگذرد، شناسهٔ TraceId کمک می\u200cکند کارهای مربوط به همان درخواست را کنار هم پیدا کنیم.',
    'ردگیری، اندازه\u200cگیری و گزارش هرکدام بخشی از ماجرا را نشان می\u200cدهند. برای پیدا کردن مشکل، آن\u200cها را با هم بخوان.',
], ('می\u200cخواهیم OrderId در گزارش، یک ویژگیِ قابل جست\u200cوجو باقی بماند. کدام شکل نوشتن پیام مناسب است؟', 'LogInformation("Order {OrderId}", id)', 'LogInformation($"Order {id}")', 'Console.Clear()', 'message template نام property را جدا نگه می‌دارد؛ backend لاگ می‌تواند بر آن query بزند.'),
('برای کنار هم گذاشتن بخش\u200cهای مربوط به یک درخواست در ردگیریِ چندسرویسی، کدام شناسه مهم است؟', 'TraceId', 'شمارهٔ خط CSS', 'فقط نام فایل JSON', 'TraceId spanهای یک trace را مرتبط می‌کند؛ SpanId هر span را مشخص می‌کند.'),
('using var source = new System.Diagnostics.ActivitySource("course");\nusing var activity = source.StartActivity("work");\nConsole.WriteLine(activity is null);', 'بدون listener، True قابل انتظار است.', True, 'StartActivity در نبود listener علاقه‌مند می‌تواند null بدهد؛ کد ابزارگذاری باید این مسیر را پشتیبانی کند.'),
('نام ویژگی باید در logger حفظ شود.', ['using Microsoft.Extensions.Logging;', 'using var factory = LoggerFactory.Create(_ => {});', 'ILogger logger = factory.CreateLogger("course");', 'int id = 42;', 'logger.LogInformation($"Order {id}");'], 4, 'logger.LogInformation("Order {OrderId}", id);', 'logger.LogInformation("Order " + id);', 'template با placeholder ساختار semantic را حفظ می‌کند؛ concatenation و interpolation متن نهایی می‌سازند.'),
('نام ویژگی ساخت‌یافته را کامل کن.', '// ILogger logger; int id = 42;\nlogger.LogInformation("Order {__1__}", id);', ['OrderId'], ['0', '$id'], 'نام معنایی property برای query و dashboard قابل اتکاتر از placeholder عددی است.'),
('یک Activity با listener بساز، یک tag سفارش بده و ثابت کن span واقعاً ایجاد شده است.', ['using System.Diagnostics;', 'using var listener = new ActivityListener\n{\n    ShouldListenTo = source => source.Name == "course",\n    Sample = (ref ActivityCreationOptions<ActivityContext> _) => ActivitySamplingResult.AllData\n};\nActivitySource.AddActivityListener(listener);', 'using var source = new ActivitySource("course");\nusing var activity = source.StartActivity("order");\nactivity?.SetTag("order.id", 42);\nConsole.WriteLine(activity is not null);'], 'True', ['listener فقط به source همین تمرین گوش بدهد.', 'منابع listener و Activity آزاد شوند.']),
['https://learn.microsoft.com/en-us/dotnet/core/extensions/logging', 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing-instrumentation-walkthroughs'])

add(24, [
    'شیء فقط داده\u200cهای قابل دیدن ما نیست؛ محیط اجرا برای شناخت و مدیریت آن، اطلاعات داخلی هم نگه می\u200cدارد.',
    'ترتیب و فاصلهٔ دقیق این بخش\u200cهای داخلی را برای همهٔ رایانه\u200cها ثابت فرض نکن.',
    'GC بررسی می\u200cکند کدام شیء هنوز از مسیرهای زندهٔ برنامه قابل دسترسی است. چنین شیئی ممکن است هنوز لازم باشد.',
    'تمام\u200cشدن یک بلوک کد به\u200cتنهایی زمان دقیق پاک\u200cشدن شیء را تعیین نمی\u200cکند؛ محیط اجرا می\u200cتواند طول عمر را بهینه کند.',
    'یک نوع مقداری که داخل شیء قرار دارد، می\u200cتواند بخشی از همان شیء باشد. از روی int بودن، محل ذخیره را قطعی ندان.',
    'WeakReference جلوی پاک\u200cشدن شیء را مثل یک ارجاع قوی نمی\u200cگیرد. برای استفاده، همان لحظه وجود مقصد را بررسی کن.',
], ('آیا فاصلهٔ داخلی فیلدهای object در همهٔ محیط\u200cهای اجرای CLR یکسان و قابل اتکاست؟', 'خیر؛ به runtime و معماری وابسته است.', 'بله، همهٔ اشیا دقیقاً 16 بایت‌اند.', 'فقط نام کلاس اندازه را تعیین می‌کند.', 'layout داخلی را با قرارداد interop دارای StructLayout اشتباه نگیر.'),
('چه چیزی می\u200cتواند باعث شود یک شیء مدیریت\u200cشده هنوز زنده و موردنیاز در نظر گرفته شود؟', 'قابل دسترس بودن از GC root', 'فقط باقی‌ماندن نام متغیر در فایل منبع', 'بزرگ‌تر بودن نام نوع', 'GC گراف دسترسی را بررسی می‌کند؛ فقط scope متنی متغیر معیار کافی نیست.'),
('object box = 10;\nConsole.WriteLine(box.GetType() == typeof(int));', 'True چاپ می‌شود.', True, 'boxing هویت نوع مقدار int را حفظ می‌کند و شیئی با آن نوع runtime ساخته می‌شود.'),
('دسترسی به weak reference باید نبودن target را پوشش دهد.', ['var weak = new WeakReference<object>(new object());', 'Console.WriteLine(weak.GetType().Name); // print target only if alive'], 1, 'if (weak.TryGetTarget(out var target)) Console.WriteLine(target.GetType().Name);', 'Console.WriteLine(weak.Target.ToString());', 'WeakReference<T> با TryGetTarget دسترسی شرطی می‌دهد؛ نوع wrapper را با target اشتباه نگیر.'),
('برای حفظ زنده‌بودن مرجع تا این نقطهٔ خاص از API درست استفاده کن.', 'object value = new();\nConsole.WriteLine(value.GetType().Name);\nGC.__1__(value);', ['KeepAlive'], ['Collect', 'SuppressFinalize'], 'KeepAlive طول عمر مرجع را تا نقطهٔ فراخوانی حفظ می‌کند؛ Collect چنین قراردادی ندارد.'),
('کپی boxing را از مقدار اصلی جدا کن و نوع runtime جعبه را چاپ کن.', ['int value = 5;\nobject boxed = value;\nvalue = 9;', 'Console.WriteLine($"{value},{boxed}");\nConsole.WriteLine(boxed.GetType().Name);'], '9,5\nInt32', ['جعبه باید مقدار زمان boxing را نگه دارد.', 'برای آزمون به offset داخلی یا اندازهٔ ثابت وابسته نباش.']),
['https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals', 'https://learn.microsoft.com/en-us/dotnet/api/system.gc.keepalive'])

add(25, [
    'حافظه\u200cای که برنامه دیگر لازم ندارد باید دوباره قابل استفاده شود. GC بخشی از این کار را برای اشیای مدیریت\u200cشده انجام می\u200cدهد.',
    'برای حل کندی، ابتدا اندازه\u200cگیری کن: آیا برنامه بیش از حد شیء می\u200cسازد یا شیءهای لازم\u200cنبودنی را نگه می\u200cدارد؟',
    'GC اشیا را در نسل\u200cهای 0، 1 و 2 مدیریت می\u200cکند. اشیای کوچک تازه معمولاً از نسل صفر شروع می\u200cکنند.',
    'LOH برای اشیای بزرگ است. POH برای بعضی تخصیص\u200cهایی است که لازم است جای داده در حافظه ثابت بماند.',
    'ثابت\u200cنگه\u200cداشتن موقت یک شیء، لزوماً آن را به POH منتقل نمی\u200cکند. این تفاوت در تمرین\u200cها مهم است.',
    'فراخوانی مکرر GC.Collect درمان همیشگی کندی نیست. اول علت مصرف حافظه و اندازه\u200cگیری\u200cها را بررسی کن.',
], ('کدام توضیح دربارهٔ حافظهٔ POH دقیق\u200cتر است؟', 'برای تخصیص pinned است؛ هر pin موقت جابه‌جایی به POH نیست.', 'همهٔ objectها ابتدا به POH می‌روند.', 'GC هیچ وقت POH را جمع نمی‌کند.', 'بین pin کردن یک شیء موجود و تخصیص pinned تفاوت وجود دارد.'),
('برنامه کند شده و به حافظه مشکوکیم. ابتدا چه کاری بهتر است انجام دهیم؟', 'اندازه‌گیری نرخ تخصیص و نگهداری اشیا', 'GC.Collect در هر request', 'تبدیل همهٔ کلاس‌ها به struct بدون آزمون', 'جمع‌آوری اجباری ممکن است throughput و latency را بدتر کند؛ ابتدا شواهد بگیر.'),
('byte[] buffer = GC.AllocateArray<byte>(16, pinned: true);\nConsole.WriteLine(buffer.Length);', '16 چاپ می‌شود.', True, 'تخصیص pinned شکل دسترسی و طول آرایه را تغییر نمی‌دهد؛ جایگزین مدیریت مالکیت نیست.'),
('جمع‌آوری اجباری در مسیر داغ را حذف کن.', ['int[] values = [1, 2, 3];', 'foreach (int value in values) { GC.Collect(); Console.WriteLine(value); }'], 1, 'foreach (int value in values) { Console.WriteLine(value); }', 'foreach (int value in values) { GC.Collect(2); Console.WriteLine(value); }', 'runtime زمان مناسب جمع‌آوری را انتخاب می‌کند؛ Collect برای هر عنصر هزینهٔ غیرضروری تحمیل می‌کند.'),
('تخصیص صریح pinned را کامل کن.', 'byte[] buffer = GC.AllocateArray<byte>(16, pinned: __1__);', ['true'], ['null', '0'], 'پارامتر pinned از نوع bool است و true تخصیص pinned درخواست می‌کند.'),
('بافر pinned کوتاهی بساز و فقط ویژگی‌های قطعی طول و داده را بررسی کن؛ وابسته به زمان‌بندی GC نباش.', ['byte[] buffer = GC.AllocateArray<byte>(4, pinned: true);\nbuffer[0] = 7;', 'Console.WriteLine(buffer.Length);\nConsole.WriteLine(buffer[0]);\nGC.KeepAlive(buffer);'], '4\n7', ['تست نباید فرض کند شیء دقیقاً چه زمانی جمع می‌شود.', 'چرا pin زیاد fragmentation و هزینه دارد را توضیح بده.']),
['https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals', 'https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/large-object-heap'])

add(26, [
    'برنامه فقط حافظه مصرف نمی\u200cکند؛ ممکن است یک فایل یا ارتباط شبکه را هم باز نگه دارد.',
    'پس از پایان کار، این منابع باید به\u200cموقع بسته شوند. منتظر پاک\u200cشدن احتمالی شیء در حافظه ماندن کافی نیست.',
    'using کمک می\u200cکند در پایان محدوده، Dispose اجرا شود؛ حتی اگر در بسیاری از مسیرها خطایی رخ دهد.',
    'اگر خودِ پاک\u200cسازی نیازمند انتظار باشد، منبع می\u200cتواند IAsyncDisposable داشته باشد و با await using مصرف شود.',
    'کسی که مالک منبع است مسئول بستن آن است. منبعی را که فقط موقتاً قرض گرفته\u200cای، خودسرانه نبند.',
    'finalizer زمان اجرای قطعی ندارد و جای using را نمی\u200cگیرد. برای شروع، مالک و پایان عمر هر منبع را روشن کن.',
], ('فایلی باز کرده\u200cایم و می\u200cخواهیم پس از پایان کار به\u200cموقع بسته شود. کدام روش لازم است؟', 'using یا finally همراه Dispose', 'فقط صبرکردن برای GC', 'اضافه‌کردن finalizer به همهٔ کلاس‌ها', 'مدیریت حافظه با آزادسازی قطعی منبع سیستم‌عامل یک مسئله نیست.'),
('منبعی داریم که IAsyncDisposable را پیاده کرده است. معمولاً چطور آن را استفاده می\u200cکنیم؟', 'await using', 'lock using', 'فقط GC.SuppressFinalize', 'await using تکمیل DisposeAsync را await می‌کند.'),
('using (var stream = new MemoryStream()) { stream.WriteByte(1); }\nConsole.WriteLine("closed");', 'closed چاپ می‌شود.', True, 'using پیش از رسیدن به خط بعد، Dispose را روی stream اجرا می‌کند.'),
('منبع باید حتی در exception بسته شود.', ['var stream = new MemoryStream();', 'stream.WriteByte(1);', 'stream.Dispose();'], 0, 'using var stream = new MemoryStream();', 'var stream = new MemoryStream(1024);', 'ظرفیت بیشتر مشکل مالکیت را حل نمی‌کند؛ using پاک‌سازی در خروج استثنایی را پوشش می‌دهد.'),
('پاک‌سازی async را کامل کن.', 'static async Task UseAsync(Resource resource)\n{\n    __1__ using (resource) { await Task.Yield(); }\n}\nsealed class Resource : IAsyncDisposable\n{\n    public ValueTask DisposeAsync() => ValueTask.CompletedTask;\n}', ['await'], ['yield', 'ref'], 'await using باید در متدی باشد که امکان await دارد.'),
('منبع آزمایشی بساز و ثابت کن Dispose در مسیر exception دقیقاً یک بار اجرا می‌شود.', ['var resource = new Resource();\ntry\n{\n    using (resource) { throw new InvalidOperationException(); }\n}\ncatch (InvalidOperationException) { }\nConsole.WriteLine(resource.Disposals);', 'sealed class Resource : IDisposable\n{\n    public int Disposals { get; private set; }\n    public void Dispose() { Disposals++; }\n}'], '1', ['در catch فقط exception مورد انتظار را مدیریت کن.', 'در review مالک منبع را مشخص کن.']),
['https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose', 'https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-disposeasync'])

add(27, [
    'گاهی فقط می\u200cخواهیم بخشی از داده\u200cها را بخوانیم یا تغییر دهیم؛ لازم نیست همیشه یک کپی تازه از همهٔ آن بخش بسازیم.',
    'یک نما، راه دسترسی به بخشی از حافظه است. خودِ نما لزوماً مالک داده\u200cهای آن حافظه نیست.',
    'Span چنین نمایی روی داده\u200cهای پیوسته می\u200cدهد. Slice معمولاً بخش موردنظر را نشان می\u200cدهد و بافر را کپی نمی\u200cکند.',
    'ReadOnlySpan از این مسیر اجازهٔ نوشتن نمی\u200cدهد؛ اما مالک دیگری ممکن است دادهٔ اصلی را تغییر دهد.',
    'وقتی نما باید در یک شیء نگه داشته شود یا از مرز await بگذرد، Memory معمولاً گزینهٔ مناسب\u200cتری است.',
    'داده باید تا پایان استفاده از نما زنده بماند. حافظهٔ محلیِ تمام\u200cشده را به بیرون متد برنگردان.',
], ('وقتی روی Span از Slice استفاده می\u200cکنیم، معمولاً چه چیزی ساخته می\u200cشود؟', 'view روی همان بافر بدون کپی عناصر', 'آرایهٔ مستقل جدید همیشه', 'یک string جدید همیشه', 'slice محدوده و ارجاع view را عوض می‌کند؛ تغییر Span نوشتنی می‌تواند بافر اصلی را تغییر دهد.'),
('می\u200cخواهیم یک نما را داخل شیء نگه داریم و در کدِ دارای await استفاده کنیم. معمولاً کدام نوع مناسب\u200cتر است؟', 'Memory<T> با مالکیت معتبر', 'فیلد Span<T> در کلاس', 'بازگرداندن stackalloc از متد', 'Memory محدودیت ref struct را ندارد اما طول عمر حافظهٔ پشتیبان را باید رعایت کرد.'),
('int[] values = [1, 2, 3];\nSpan<int> slice = values.AsSpan(1);\nslice[0] = 9;\nConsole.WriteLine(values[1]);', '9 چاپ می‌شود.', True, 'Span view است و روی همان عنصر آرایه می‌نویسد.'),
('بافر stack نباید از متد فرار کند.', ['static Span<int> Create()', '{', '    return stackalloc int[3];', '}'], 2, '    return new int[3];', '    return stackalloc int[30];', 'آرایهٔ heap می‌تواند پشت Span برگشتی زنده بماند؛ stackalloc محلی پایان عمر کوتاه‌تری دارد.'),
('view فقط‌خواندنی روی متن را کامل کن.', '__1__<char> text = "123".AsSpan();\nConsole.WriteLine(int.Parse(text));', ['ReadOnlySpan'], ['List', 'Task'], 'AsSpan روی string یک ReadOnlySpan<char> می‌دهد و Parse overload مربوط را مصرف می‌کند.'),
('عدد بعد از = را بدون Substring و با Span parse کن.', ['ReadOnlySpan<char> line = "hp=42".AsSpan();\nint separator = line.IndexOf(\'=\');', 'if (separator < 0) throw new FormatException();\nint value = int.Parse(line[(separator + 1)..]);\nConsole.WriteLine(value);'], '42', ['زیررشتهٔ جدید نساز.', 'مسیر نبودن جداکننده مشخص باشد.']),
['https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/', 'https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/memory-t-usage-guidelines'])

add(28, [
    'ساختن پیاپی بافرهای بزرگ هزینه دارد. گاهی می\u200cتوان یک بافر آماده را قرض گرفت و پس از کار برگرداند.',
    'بافر قرضی ممکن است دادهٔ قبلی داشته باشد. فقط بخشی را بخوان که خودت برای این کار مقداردهی کرده\u200cای.',
    'ArrayPool.Rent حداقل طول خواسته\u200cشده را می\u200cدهد؛ ممکن است آرایهٔ بزرگ\u200cتری دریافت کنی.',
    'بافر را در پایان کار به همان مخزن برگردان. پس از Return دیگر حق استفاده از آن را برای خودت فرض نکن.',
    'MemoryPool مالکیت را با یک شیء قابل Dispose نشان می\u200cدهد. بستن آن شیء یعنی پایان استفادهٔ مالک.',
    'ref struct محدودیت طول عمر دارد. پیاده\u200cکردن اینترفیس در C# 13 به معنی مجازشدن تبدیل boxing آن نیست.',
], ('ArrayPool.Rent(100) دربارهٔ طول آرایه\u200cای که تحویل می\u200cدهد چه قولی دارد؟', 'طول حداقل 100 است.', 'طول دقیقاً 100 و همهٔ داده‌ها صفر است.', 'طول همیشه 1 است.', 'pool برای بازاستفاده bucket دارد و تضمین صفر بودن بافر بازگشتی نمی‌دهد.'),
('در C# 13، پیاده\u200cکردن اینترفیس توسط ref struct هنوز کدام کار را مجاز نمی\u200cکند؟', 'boxing آن به interface', 'تعریف متد روی آن', 'استفادهٔ همگام محلی', 'امکان پیاده‌سازی interface با امکان تبدیل به مرجع interface و heap escape متفاوت است.'),
('int[] buffer = System.Buffers.ArrayPool<int>.Shared.Rent(4);\ntry { Console.WriteLine(buffer.Length >= 4); }\nfinally { System.Buffers.ArrayPool<int>.Shared.Return(buffer); }', 'True چاپ می‌شود.', True, 'حداقل طول تضمین است؛ finally بازگشت بافر را پوشش می‌دهد.'),
('بافر باید در مسیر شکست هم به pool برگردد.', ['var pool = System.Buffers.ArrayPool<byte>.Shared;', 'byte[] buffer = pool.Rent(16);', 'buffer[0] = 7; pool.Return(buffer);'], 2, 'try { buffer[0] = 7; } finally { pool.Return(buffer); }', 'buffer[0] = 7; GC.Collect();', 'GC.Collect جای Return نیست؛ pool قرارداد مالکیت جداگانه دارد.'),
('مالک MemoryPool باید قطعی آزاد شود.', '__1__ var owner = System.Buffers.MemoryPool<byte>.Shared.Rent(16);\nowner.Memory.Span[0] = 1;', ['using'], ['lock', 'static'], 'using روی IMemoryOwner، Dispose و بازگشت بافر را در پایان scope اجرا می‌کند.'),
('بافر pool را برای جمع سه عدد مصرف و در finally بازگردان؛ بخش اضافهٔ بافر خوانده نشود.', ['var pool = System.Buffers.ArrayPool<int>.Shared;\nint[] buffer = pool.Rent(3);', 'try\n{\n    buffer[0] = 2; buffer[1] = 3; buffer[2] = 4;\n    int total = 0;\n    foreach (int value in buffer.AsSpan(0, 3)) total += value;\n    Console.WriteLine(total);\n}', 'finally\n{\n    pool.Return(buffer, clearArray: true);\n}'], '9', ['طول واقعی بافر را تعداد دادهٔ معتبر فرض نکن.', 'پس از Return به بافر دسترسی نداشته باش.']),
['https://learn.microsoft.com/en-us/dotnet/api/system.buffers.arraypool-1', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/ref-struct'])

add(29, [
    'معمولاً زبان و محیط اجرا جلوی بخشی از دسترسی\u200cهای نامعتبر به حافظه را می\u200cگیرند.',
    'در کد unsafe بخشی از این حفاظت\u200cها کمتر می\u200cشود؛ باید اندازه، طول عمر و مالکیت داده را دقیق\u200cتر کنترل کنیم.',
    'اشاره\u200cگر نشانی حافظه را نگه می\u200cدارد. اگر داده جابه\u200cجا یا آزاد شود، نشانی قبلی ممکن است دیگر معتبر نباشد.',
    'fixed برای یک محدودهٔ مشخص جلوی جابه\u200cجایی دادهٔ مدیریت\u200cشده را می\u200cگیرد. پس از پایان آن محدوده، اشاره\u200cگر را معتبر فرض نکن.',
    'حافظه\u200cای که با NativeMemory.Alloc گرفته\u200cای باید با NativeMemory.Free آزاد شود. دو بار آزادکردن یا فراموش\u200cکردن آن خطرناک است.',
    'برای ارتباط با کد بومی، نوع داده، روش فراخوانی و مسئول آزادکردن منبع باید روشن باشد؛ unsafe راه\u200cحل پیش\u200cفرض افزایش سرعت نیست.',
], ('به نشانیِ یک آرایه نیاز داریم. چطور در محدودهٔ استفاده، جلوی جابه\u200cجاییِ آن را می\u200cگیریم؟', 'fixed در محدودهٔ کوتاه', 'فقط readonly', 'GC.Collect قبل از هر read', 'fixed طول عمر pin را محدود می‌کند؛ collect تضمین ثابت‌ماندن آدرس نمی‌دهد.'),
('حافظه\u200cای را با NativeMemory.Alloc گرفته\u200cایم. چطور باید آن را آزاد کنیم؟', 'NativeMemory.Free در مسیر قطعی پاک‌سازی', 'با انتظار برای GC روی pointer', 'با List.Clear', 'pointer مالک مدیریت‌شدهٔ قابل جمع‌آوری نیست؛ باید آزادسازی جفت و دقیق داشته باشد.'),
('unsafe\n{\n    int value = 7;\n    int* pointer = &value;\n    Console.WriteLine(*pointer);\n}', 'با فعال بودن unsafe، 7 چاپ می‌شود.', True, 'pointer به متغیر محلی در همان scope معتبر است و dereference مقدار آن را می‌خواند.'),
('pointer آرایهٔ مدیریت‌شده باید در محدودهٔ pin مصرف شود.', ['int[] values = [1, 2];', 'unsafe { int* p = &values[0]; Console.WriteLine(*p); }'], 1, 'unsafe { fixed (int* p = values) { Console.WriteLine(*p); } }', 'unsafe { int* p = values; Console.WriteLine(*p); }', 'گرفتن آدرس عنصر آرایهٔ قابل جابه‌جایی به fixed نیاز دارد.'),
('دستور ثابت‌نگه‌داشتن مکان آرایه را کامل کن.', 'int[] values = [7];\nunsafe { __1__ (int* p = values) { Console.WriteLine(*p); } }', ['fixed'], ['using', 'checked'], 'fixed pin را تا پایان بدنهٔ خودش برقرار می‌کند.'),
('آرایه را فقط در یک fixed کوتاه بخوان و مجموع دو عنصر را چاپ کن.', ['int[] values = [3, 4];', 'unsafe\n{\n    fixed (int* pointer = values)\n    {\n        Console.WriteLine(pointer[0] + pointer[1]);\n    }\n}'], '7', ['pointer نباید از محدودهٔ fixed بیرون برود.', 'AllowUnsafeBlocks فقط در پروژهٔ کارگاه فعال باشد.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/unsafe-code', 'https://learn.microsoft.com/en-us/dotnet/standard/native-interop/best-practices'])

add(30, [
    'گاهی چند کار در یک بازهٔ زمانی پیش می\u200cروند. اگر به دادهٔ مشترک دست بزنند، ترتیب اجرای آن\u200cها مهم می\u200cشود.',
    'Task نمایندهٔ یک کار است؛ هر Task الزاماً یک ترد جداگانه و تازه ندارد.',
    'ThreadPool تردهای آماده را دوباره استفاده می\u200cکند. ایجاد یک کار با Task.Run همیشه ساختن یک ترد اختصاصی نیست.',
    'عملی مثل x++ چند گام دارد: خواندن، زیادکردن و نوشتن. دو اجراکننده می\u200cتوانند در این فاصله مزاحم هم شوند.',
    'SemaphoreSlim تعداد ورودهای هم\u200cزمان را محدود می\u200cکند و روش انتظارِ قابل استفاده با await دارد.',
    'برای هماهنگی درست، همهٔ راه\u200cهای خواندن و نوشتنِ مرتبط باید یک قرارداد مشترک را رعایت کنند.',
], ('می\u200cخواهیم تعداد کارهای async هم\u200cزمان را داخل برنامه محدود کنیم. کدام ابزار مناسب است؟', 'SemaphoreSlim.WaitAsync همراه Release در finally', 'Thread.Sleep داخل همهٔ requestها', 'lock با await در بدنه', 'WaitAsync thread را هنگام انتظار مسدود نمی‌کند؛ finally از گم‌شدن مجوز جلوگیری می‌کند.'),
('آیا هر بار Task.Run حتماً یک ترد اختصاصی و تازه می\u200cسازد؟', 'خیر؛ معمولاً کار را به ThreadPool می‌سپارد.', 'بله، برای هر Task یک thread تازه', 'Task اصلاً نمی‌تواند کد اجرا کند.', 'Task مدل عملیات است؛ زمان‌بندی آن را با ساخت مستقیم Thread یکی ندان.'),
('using var gate = new SemaphoreSlim(2);\nawait gate.WaitAsync();\ntry { Console.WriteLine("entered"); }\nfinally { gate.Release(); }', 'entered چاپ می‌شود.', True, 'ظرفیت اولیه اجازهٔ ورود می‌دهد و finally مجوز را برمی‌گرداند.'),
('هر ورود موفق باید حتی در exception مجوز را برگرداند.', ['using var gate = new SemaphoreSlim(1);', 'await gate.WaitAsync();', 'await Task.Yield(); gate.Release();'], 2, 'try { await Task.Yield(); } finally { gate.Release(); }', 'await Task.Yield(); gate.Wait();', 'اگر await شکست بخورد Release معمولی اجرا نمی‌شود؛ finally این مسیر را حفظ می‌کند.'),
('انتظار غیرمسدودکننده را کامل کن.', 'using var gate = new SemaphoreSlim(1);\nawait gate.__1__();\ntry { await Task.Yield(); } finally { gate.Release(); }', ['WaitAsync'], ['Wait', 'Join'], 'WaitAsync awaitable است؛ Wait مسدودکننده و خروجی آن برای این await مناسب نیست.'),
('شمارنده را در ده کار async با SemaphoreSlim محافظت کن و هیچ افزایش گم نشود.', ['using var gate = new SemaphoreSlim(1);\nint count = 0;', 'await Task.WhenAll(Enumerable.Range(0, 10).Select(async _ =>\n{\n    await gate.WaitAsync();\n    try\n    {\n        int before = count;\n        await Task.Yield();\n        count = before + 1;\n    }\n    finally { gate.Release(); }\n}));', 'Console.WriteLine(count);'], '10', ['await داخل lock قرار نگیرد.', 'همهٔ مسیرها مجوز را آزاد کنند.']),
['https://learn.microsoft.com/en-us/dotnet/standard/threading/the-managed-thread-pool', 'https://learn.microsoft.com/en-us/dotnet/api/system.threading.semaphoreslim'])

add(31, [
    'وقتی چند اجراکننده یک داده را تغییر می\u200cدهند، ممکن است لازم باشد هر بار فقط یکی وارد بخش حساس شود.',
    'قفل فقط وقتی کمک می\u200cکند که همهٔ بخش\u200cهای مرتبط همان قفل را رعایت کنند.',
    'lock محدودهٔ هماهنگ\u200cشده را مشخص می\u200cکند. برای آن، یک قفل خصوصی و مخصوص همین کار انتخاب کن.',
    'در C# 13 و .NET 9 به بعد، نوع System.Threading.Lock مسیر ویژهٔ کامپایلر را فعال می\u200cکند؛ نوع واقعیِ متغیر را حفظ کن.',
    'await داخل بدنهٔ lock مجاز نیست. برای انتظار غیرهمگام باید روش هماهنگی مناسب همان کار را انتخاب کنی.',
    'قفل\u200cکردن this یا یک متن مشترک می\u200cتواند بخش\u200cهای نامرتبط را به هم وابسته کند. ساده\u200cترین هماهنگیِ درست را انتخاب کن.',
], ('می\u200cخواهیم مسیر ویژهٔ System.Threading.Lock استفاده شود. بهتر است نوعِ متغیر قفل چه باشد؟', 'System.Threading.Lock', 'object برای پنهان‌کردن نوع جدید', 'string', 'نوع ایستای Lock انتخاب مسیر کامپایل جدید EnterScope را ممکن می‌کند.'),
('آیا می\u200cتوان داخل بدنهٔ lock از await استفاده کرد؟', 'در C# مجاز نیست.', 'همیشه thread را خودکار آزاد می‌کند.', 'فقط روی string مجاز است.', 'برای هماهنگی دارای await از primitive مناسب مثل SemaphoreSlim استفاده کن.'),
('var gate = new System.Threading.Lock();\nint count = 0;\nlock (gate) { count++; }\nConsole.WriteLine(count);', 'در C# 13 و .NET 9 به بعد، 1 چاپ می‌شود.', True, 'نوع ایستای gate برابر Lock است و کامپایلر مسیر ویژهٔ آن را استفاده می‌کند.'),
('قفل نباید در اختیار مصرف‌کنندهٔ بیرونی باشد.', ['class Counter', '{', '    public readonly object Gate = new();', '    public int Value;', '}'], 2, '    private readonly System.Threading.Lock Gate = new();', '    public const string Gate = "gate";', 'قفل خصوصی اختصاصی خطر تداخل با قفل‌گرفتن کد بیرونی را کم می‌کند.'),
('نوع قفل جدید را کامل کن.', 'var gate = new System.Threading.__1__();\nlock (gate) { Console.WriteLine("safe"); }', ['Lock'], ['Task', 'Volatile'], 'System.Threading.Lock یک شیء اختصاصی همگام‌سازی در .NET 9 به بعد است.'),
('شمارندهٔ همگام با Lock خصوصی بساز و با Parallel.For ده‌هزار افزایش بده.', ['var counter = new Counter();\nParallel.For(0, 10_000, _ => counter.Increment());\nConsole.WriteLine(counter.Read());', 'sealed class Counter\n{\n    private readonly System.Threading.Lock gate = new();\n    private int value;\n    public void Increment() { lock (gate) { value++; } }\n    public int Read() { lock (gate) { return value; } }\n}'], '10000', ['خواندن هم قرارداد قفل را رعایت کند.', 'قفل this یا string نباشد.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/lock', 'https://learn.microsoft.com/en-us/dotnet/api/system.threading.readerwriterlockslim'])

add(32, [
    'حتی زیادکردن یک شمارنده می\u200cتواند از چند گام تشکیل شود. اگر چند کار هم\u200cزمان آن را تغییر دهند، نتیجه ممکن است اشتباه شود.',
    'عملیات اتمیک یعنی آن عملیات از دید تغییرهای رقیب، یک کارِ تقسیم\u200cنشدنی است؛ این ویژگی را برای کل برنامه فرض نکن.',
    'Interlocked ابزارهایی مثل Increment و CompareExchange برای بعضی تغییرهای اتمیک آماده دارد.',
    'CompareExchange فقط وقتی مقدار فعلی با مقدار مورد انتظار برابر باشد، مقدار تازه را می\u200cنویسد. به این الگو CAS می\u200cگویند.',
    'volatile به\u200cتنهایی عمل چندمرحله\u200cایِ ++ را اتمیک نمی\u200cکند. روش هماهنگی را متناسب با خودِ عملیات انتخاب کن.',
    'حذف lock به\u200cتنهایی یک الگوریتم درستِ بدون قفل نمی\u200cسازد. تغییر چند دادهٔ مرتبط هنوز به طراحی و آزمون نیاز دارد.',
], ('چند کار یک شمارندهٔ int را زیاد می\u200cکنند. کدام ابزار برای افزایشِ تقسیم\u200cنشدنی مناسب است؟', 'Interlocked.Increment(ref count)', 'volatile int و سپس count++ بدون هماهنگی', 'خواندن و نوشتن جدا بدون قرارداد', 'Increment عملیات read-modify-write را اتمیک می‌کند؛ volatile به‌تنهایی کافی نیست.'),
('CompareExchange مقدار را در چه شرایطی عوض می\u200cکند؟', 'فقط اگر مقدار فعلی با comparand برابر باشد جایگزین می‌کند.', 'همیشه دو متغیر را swap می‌کند.', 'همیشه thread را می‌خواباند.', 'CAS مقدار قبلی را برمی‌گرداند و ابزار ساخت حلقهٔ به‌روزرسانی شرطی است.'),
('int value = 1;\nint old = Interlocked.CompareExchange(ref value, 5, 1);\nConsole.WriteLine($"{old},{value}");', '1,5 چاپ می‌شود.', True, 'comparand برابر مقدار فعلی است؛ مقدار 5 ذخیره و مقدار قبلی 1 برگردانده می‌شود.'),
('افزایش در کارهای موازی نباید گم شود.', ['int count = 0;', 'Parallel.For(0, 10000, _ => count++);'], 1, 'Parallel.For(0, 10000, _ => Interlocked.Increment(ref count));', 'Parallel.For(0, 10000, _ => Volatile.Write(ref count, count + 1));', 'خواندن count و سپس Write دو عملیات جداست؛ Increment مجموعه را اتمیک می‌کند.'),
('تعویض اتمیک مشروط را کامل کن.', 'int state = 0;\nConsole.WriteLine(Interlocked.__1__(ref state, 1, 0));', ['CompareExchange'], ['Increment', 'Read'], 'CompareExchange سه آرگومان ref location، value و comparand می‌گیرد.'),
('پرچم شروع را با CAS پیاده کن؛ فقط اولین تلاش باید برنده شود.', ['int started = 0;\nint winners = 0;', 'Parallel.For(0, 100, _ =>\n{\n    if (Interlocked.CompareExchange(ref started, 1, 0) == 0)\n        Interlocked.Increment(ref winners);\n});', 'Console.WriteLine(winners);'], '1', ['آزمون و تغییر در دو دستور مستقل نباشند.', 'فقط یک برنده بدون lock به دست آید.']),
['https://learn.microsoft.com/en-us/dotnet/api/system.threading.interlocked', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/volatile'])

add(33, [
    'وقتی منتظر فایل یا شبکه هستیم، همیشه لازم نیست یک ترد را بی\u200cکار و مسدود نگه داریم.',
    'async و await نوشتن چنین انتظارهایی را خواناتر می\u200cکنند. خودِ async تضمین ساختن ترد جدید نیست.',
    'یک متد معمولاً تا نخستین await ناتمام پیش می\u200cرود؛ پس از آماده\u200cشدن نتیجه، ادامهٔ کار انجام می\u200cشود.',
    'Task می\u200cتواند وضعیت پایان، نتیجه یا خطای کار را نشان دهد. Task.WhenAll برای انتظار پایان چند کار مستقل است.',
    'WhenAll تعداد کارهای هم\u200cزمان را خودکار محدود نمی\u200cکند. برای تعداد زیاد کارها، محدودیت مناسب جدا لازم است.',
    'درخواست لغو را با CancellationToken به کارهای زیرین برسان. ValueTask را هم بدون شناخت قواعدش چندبار await نکن.',
], ('فقط نوشتن async کنار یک متد، کدام اتفاق را تضمین نمی\u200cکند؟', 'اجرای آن روی thread تازه', 'امکان استفاده از await', 'امکان بازگشت Task', 'async تبدیل کامپایلر را فعال می‌کند؛ ساخت thread یا offload خودکار نیست.'),
('چند Task مستقل داریم و پایان همه را می\u200cخواهیم. کدام ابزار مناسب است؟', 'await Task.WhenAll(tasks)', 'tasks.ForEach(t => t.Wait()) در request', 'فقط await اولین Task و رهاکردن بقیه', 'WhenAll تکمیل همه را دنبال می‌کند؛ برای سقف هم‌زمانی primitive دیگری لازم است.'),
('Console.WriteLine(await GetAsync());\nstatic async Task<int> GetAsync() { await Task.Yield(); return 7; }', '7 چاپ می‌شود.', True, 'Task<int> نتیجه را نگه می‌دارد و await آن را دریافت می‌کند.'),
('نتیجهٔ async را بدون مسدودکردن دریافت کن.', ['static async Task<int> RunAsync()', '{', '    return GetAsync().Result;', '}', 'static Task<int> GetAsync() => Task.FromResult(7);'], 2, '    return await GetAsync();', '    return GetAsync().GetAwaiter().GetResult();', 'Result و GetResult هر دو می‌توانند مسدود کنند؛ await مسیر غیرمسدودکننده را حفظ می‌کند.'),
('توکن لغو باید به Delay منتقل شود.', 'static Task PauseAsync(CancellationToken token) => Task.Delay(100, __1__);', ['token'], ['CancellationToken.None', 'default'], 'استفاده از None یا default درخواست لغو فراخواننده را در این عملیات نادیده می‌گیرد.'),
('دو عملیات مستقل async را آغاز کن و مجموع نتیجه‌ها را پس از WhenAll چاپ کن.', ['Task<int> first = GetAsync(2);\nTask<int> second = GetAsync(3);', 'int[] values = await Task.WhenAll(first, second);\nConsole.WriteLine(values.Sum());', 'static async Task<int> GetAsync(int value)\n{\n    await Task.Yield();\n    return value;\n}'], '5', ['Result یا Wait استفاده نشود.', 'هر دو عملیات پیش از انتظار مجموعه شروع شوند.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/', 'https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.valuetask'])

add(34, [
    'پس از یک انتظار غیرهمگام، برنامه باید بداند ادامهٔ کار چگونه اجرا شود. این موضوع در رابط کاربری اهمیت ویژه دارد.',
    'بعضی محیط\u200cها قواعدی برای بازگشت به محیط قبلی دارند. این قواعد با انتقال اطلاعات همراهِ کار یک چیز نیستند.',
    'SynchronizationContext به روش اجرای ادامهٔ کار مربوط است. ExecutionContext اطلاعات محیطی مثل AsyncLocal را همراه می\u200cبرد.',
    'ConfigureAwait(false) الزام بازگشت به محیط گرفته\u200cشده را برمی\u200cدارد؛ تضمین نمی\u200cکند ترد حتماً عوض شود.',
    'این تنظیم به\u200cتنهایی جریان AsyncLocal را قطع نمی\u200cکند. این دو مفهوم را در تمرین جدا بررسی کن.',
    'خواندن Result می\u200cتواند ترد رابط کاربری را مسدود کند. تا جای ممکن زنجیرهٔ انتظار را با await ادامه بده.',
], ('ConfigureAwait(false) کدام اتفاق را تضمین نمی\u200cکند؟', 'تغییر قطعی thread', 'عدم الزام بازگشت به context گرفته‌شده', 'امکان await کردن Task', 'اگر Task قبلاً تکمیل شده باشد ادامه ممکن است همگام روی همان thread اجرا شود.'),
('اطلاعات AsyncLocal معمولاً از راه کدام context همراه کار منتقل می\u200cشود؟', 'ExecutionContext', 'فقط SynchronizationContext', 'فایل csproj', 'ExecutionContext و SynchronizationContext دو نقش متفاوت دارند؛ ConfigureAwait(false) معادل SuppressFlow نیست.'),
('var local = new AsyncLocal<string>();\nlocal.Value = "trace";\nawait Task.Delay(1).ConfigureAwait(false);\nConsole.WriteLine(local.Value);', 'در جریان عادی ExecutionContext، trace چاپ می‌شود.', True, 'ConfigureAwait(false) به‌تنهایی AsyncLocal را پاک نمی‌کند.'),
('کتابخانهٔ async نباید thread فراخواننده را برای انتظار مسدود کند.', ['static async Task<int> ReadAsync()', '{', '    return FetchAsync().Result;', '}', 'static Task<int> FetchAsync() => Task.FromResult(7);'], 2, '    return await FetchAsync().ConfigureAwait(false);', '    return Task.Run(FetchAsync).Result;', 'await از انتظار مسدودکننده پرهیز می‌کند؛ Task.Run با Result الگوی کتابخانه را اصلاح نمی‌کند.'),
('برای عدم الزام برگشت به context چه آرگومانی لازم است؟', 'await Task.Delay(1).ConfigureAwait(__1__);', ['false'], ['true', 'null'], 'false الزام capture مربوط به continuation را حذف می‌کند؛ تضمین thread خاصی نمی‌دهد.'),
('شناسهٔ هم‌بستگی AsyncLocal را از یک await با ConfigureAwait(false) عبور بده.', ['var correlation = new AsyncLocal<string?>();\ncorrelation.Value = "order-42";', 'await Task.Delay(1).ConfigureAwait(false);\nConsole.WriteLine(correlation.Value);'], 'order-42', ['آزمون به شمارهٔ thread وابسته نباشد.', 'تفاوت دو context را در review بیان کن.']),
['https://devblogs.microsoft.com/dotnet/configureawait-faq/', 'https://learn.microsoft.com/en-us/dotnet/api/system.threading.executioncontext'])

add(35, [
    'در الگوی تولیدکننده و مصرف\u200cکننده، یک بخش داده می\u200cسازد و بخش دیگری آن را پردازش می\u200cکند.',
    'اگر داده سریع\u200cتر از پردازش تولید شود، صف می\u200cتواند بیش از حد بزرگ شود؛ باید برای ظرفیت و پرشدن آن تصمیم بگیریم.',
    'Channel راه ارتباط این دو بخش است. یک کانال با ظرفیت محدود می\u200cتواند هنگام پرشدن، تولیدکننده را منتظر نگه دارد.',
    'FullMode.Wait برای انتظار مناسب است. بعضی حالت\u200cهای دیگر داده را حذف می\u200cکنند؛ حذف\u200cشدن داده باید انتخابی آگاهانه باشد.',
    'همهٔ کانال\u200cها در همهٔ تنظیمات بدون قفل نیستند. SingleReader و SingleWriter باید با رفتار واقعی برنامه هماهنگ باشند.',
    'برای کارهای هم\u200cزمان، محدودیت متناسب با توان سرویس بگذار. اجرای موازیِ بیشتر همیشه به معنی سرعت بیشتر نیست.',
], ('صفِ یک Channel محدود پر شده است. اگر می\u200cخواهیم تولیدکننده منتظر بماند، کدام سیاست مناسب است؟', 'BoundedChannelFullMode.Wait', 'DropOldest بدون پذیرش ازدست‌رفتن داده', 'حذف محدودیت ظرفیت', 'Wait وقتی ظرفیت پر است نویسنده را async منتظر می‌گذارد؛ drop semantics دیگری دارد.'),
('آیا Channel در همهٔ حالت\u200cها و تنظیمات، حتماً بدون قفل پیاده شده است؟', 'خیر؛ به پیاده‌سازی و تنظیمات بستگی دارد.', 'بله، قرارداد عمومی همین است.', 'Channel فقط یک List است و همگام‌سازی ندارد.', 'کتابخانه هماهنگی را مدیریت می‌کند؛ نباید به جزئیات lock-free غیرتضمین‌شده وابسته شد.'),
('var channel = System.Threading.Channels.Channel.CreateUnbounded<int>();\nawait channel.Writer.WriteAsync(7);\nchannel.Writer.Complete();\nConsole.WriteLine(await channel.Reader.ReadAsync());', '7 چاپ می‌شود.', True, 'Complete مانع خواندن دادهٔ از قبل bufferشده نمی‌شود.'),
('پس از پایان producer باید consumer بتواند تمام شود.', ['var channel = System.Threading.Channels.Channel.CreateUnbounded<int>();', 'await channel.Writer.WriteAsync(1);', '// producer finished'], 2, 'channel.Writer.Complete();', 'await channel.Writer.WriteAsync(0);', 'صفر یک دادهٔ عادی است؛ completion قرارداد صریح پایان جریان را اعلام می‌کند.'),
('بافر با ظرفیت محدود بساز.', 'var channel = System.Threading.Channels.Channel.__1__<int>(2);', ['CreateBounded'], ['CreateUnbounded', 'ReadAsync'], 'CreateBounded ظرفیت و سیاست پرشدن را فراهم می‌کند.'),
('producer/consumer با ظرفیت 2 بساز؛ 1 تا 5 را بدون drop جمع کن و completion را اعلام کن.', ['using System.Threading.Channels;', 'var channel = Channel.CreateBounded<int>(2);\nTask producer = Task.Run(async () =>\n{\n    for (int i = 1; i <= 5; i++) await channel.Writer.WriteAsync(i);\n    channel.Writer.Complete();\n});', 'int total = 0;\nawait foreach (int value in channel.Reader.ReadAllAsync()) total += value;\nawait producer;\nConsole.WriteLine(total);'], '15', ['producer و consumer باید امکان پیشروی هم‌زمان داشته باشند.', 'جریان با Complete پایان یابد.']),
['https://learn.microsoft.com/en-us/dotnet/core/extensions/channels', 'https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.parallel.foreachasync'])

add(36, [
    'گاهی می\u200cخواهیم کنار یک نوع یا عضو، اطلاعات توضیحی برای ابزارها نگه داریم؛ مثلاً یک نشانه برای روش پردازش آن.',
    'attribute چنین اطلاعاتی را به برنامه اضافه می\u200cکند. فقط نوشتن این نشانه، به\u200cتنهایی رفتار دلخواه را اجرا نمی\u200cکند.',
    'بخشی از برنامه یا یک ابزار باید این اطلاعات را بخواند و تصمیم بگیرد با آن چه کند.',
    'Reflection راهی برای بررسی نوع\u200cها، اعضا و بعضی اطلاعات آن\u200cها هنگام اجراست.',
    'جست\u200cوجوی تکراری با Reflection هزینه دارد. اگر نتیجهٔ جست\u200cوجو ثابت است، نگه\u200cداشتن همان نتیجه می\u200cتواند مفید باشد.',
    'در برنامه\u200cهای دارای trimming یا AOT، اطلاعات لازم باید قابل تشخیص باشد. هشدارها را بدون بررسی علت پنهان نکن.',
], ('آیا فقط اضافه\u200cکردن یک attribute، به\u200cتنهایی رفتارِ مربوط به آن را اجرا می\u200cکند؟', 'خیر؛ مصرف‌کننده باید متادیتا را بخواند یا ابزار مربوط پردازش کند.', 'بله، هر attribute یک thread می‌سازد.', 'بله، همیشه از برنامه محافظت امنیتی می‌کند.', 'attribute توضیح ساخت‌یافته است؛ رفتار به compiler، framework یا کدی وابسته است که آن را مصرف می‌کند.'),
('در یک مسیر پرتکرار، چطور می\u200cتوان هزینهٔ جست\u200cوجوی دوبارهٔ Reflection را کمتر کرد؟', 'cache نتیجهٔ کشف member، پس از اندازه‌گیری', 'GetMethods در تک‌تک iterationها بدون نیاز', 'حذف تمام type checkها', 'cache هزینهٔ discovery را کم می‌کند؛ invocation و سازگاری AOT همچنان باید بررسی شوند.'),
('Console.WriteLine(typeof(string).GetProperty("Length") is not null);', 'True چاپ می‌شود.', True, 'Length یک property عمومی string است و GetProperty با جست‌وجوی پیش‌فرض آن را پیدا می‌کند.'),
('ویژگی نمونهٔ عمومی باید با flags مناسب جست‌وجو شود.', ['using System.Reflection;', 'var member = typeof(string).GetProperty("Length", BindingFlags.Static | BindingFlags.Public);'], 1, 'var member = typeof(string).GetProperty("Length", BindingFlags.Instance | BindingFlags.Public);', 'var member = typeof(string).GetProperty("Length", BindingFlags.NonPublic);', 'Length عضو instance عمومی است؛ Static مجموعهٔ دیگری را انتخاب می‌کند.'),
('برای خواندن attribute تعریف‌شده روی نوع، API را کامل کن.', 'using System.Reflection;\nvar attribute = typeof(Item).GetCustomAttribute<__1__>();\n[Obsolete("demo")] class Item { }', ['ObsoleteAttribute'], ['AttributeUsageAttribute', 'String'], 'ObsoleteAttribute همان نوع attribute استفاده‌شده است؛ suffix در هنگام annotation می‌تواند حذف شود.'),
('attribute برچسب بساز، روی نوع بگذار و مقدار آن را با Reflection بخوان.', ['using System.Reflection;', 'var tag = typeof(Report).GetCustomAttribute<TagAttribute>();\nConsole.WriteLine(tag?.Name);', '[AttributeUsage(AttributeTargets.Class)]\nsealed class TagAttribute(string name) : Attribute\n{\n    public string Name { get; } = name;\n}', '[Tag("audit")]\nsealed class Report { }'], 'audit', ['AttributeUsage فقط Class را مجاز کند.', 'نبودن attribute مسیر null معتبر داشته باشد.']),
['https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/reflection-and-attributes/', 'https://learn.microsoft.com/en-us/dotnet/standard/reflection-and-emit/'])

add(37, [
    'ابزار ساخت می\u200cتواند بعضی کدهای تکراری را برای ما تولید کند. هدف، کم\u200cکردن کار تکراری و خطای نوشتن دستی است.',
    'تولید کد هنگام ساخت با تولید کد هنگام اجرای برنامه فرق دارد. زمان انجام کار را در سؤال مشخص کن.',
    'source generator معمولی در زمان build فایل کد اضافه می\u200cکند؛ کار اصلی آن بازنویسی مستقیم فایل\u200cهای قبلی نیست.',
    'تولیدکننده باید برای ورودی یکسان، خروجی قابل پیش\u200cبینی بدهد. وابسته\u200cکردن نتیجه به ساعت جاری می\u200cتواند این ویژگی را خراب کند.',
    'Native AOT هنگام publish کد بومی تولید می\u200cکند. به همین دلیل بعضی روش\u200cهای ساخت پویای کد هنگام اجرا محدود می\u200cشوند.',
    'تولید کد از قبل می\u200cتواند به کاهش این نیاز کمک کند؛ اما سازگاری همهٔ وابستگی\u200cها با AOT را خودکار تضمین نمی\u200cکند.',
], ('یک source generator معمولی، در زمان ساخت برنامه چه کاری انجام می\u200cدهد؟', 'افزودن source هنگام کامپایل', 'بازنویسی دلخواه فایل‌های اصلی کاربر در runtime', 'اجرای SQL روی سرور بدون تنظیم', 'generator خروجی کامپایلر را با فایل‌های تولیدی گسترش می‌دهد؛ ابزار rewrite فایل پروژه نیست.'),
('در انتشار Native AOT، باید به کدام محدودیت توجه کنیم؟', 'تولید کد پویا مثل Reflection.Emit', 'استفاده از int', 'فراخوانی متد معمولی', 'کد باید هنگام publish قابل تولید باشد؛ emit کد جدید برای JIT runtime در دسترس نیست.'),
('Console.WriteLine(typeof(int).Name);', 'هر استفاده از typeof الزاماً با Native AOT ناسازگار است.', False, 'Reflection قابل تحلیل روی انواع شناخته‌شده ممکن است پشتیبانی شود؛ مشکل همهٔ Reflection نیست.'),
('برای تولید قابل تکرار، خروجی نباید به ساعت build وابسته باشد.', ['// inside a source generator', 'var text = DateTime.UtcNow.ToString();'], 1, 'var text = "course-v1";', 'var text = Guid.NewGuid().ToString();', 'ورودی یکسان باید خروجی یکسان بسازد؛ timestamp و Guid تصادفی cache و reproducibility را تضعیف می‌کنند.'),
('قرارداد generator افزایشی را انتخاب کن.', '// Roslyn generator project\nclass Generator : __1__\n{\n    public void Initialize(IncrementalGeneratorInitializationContext context) { }\n}', ['IIncrementalGenerator'], ['IDisposable', 'IEnumerable<int>'], 'IIncrementalGenerator نقطهٔ Initialize برای ساخت pipeline افزایشی دارد.'),
('generator همراه پروژهٔ کارگاه یک کلاس ثابت تولید می‌کند؛ مصرف‌کننده را بساز و خروجی deterministic را بررسی کن. پروژهٔ Generator کنار کارگاه قرار دارد.', ['Console.WriteLine(CourseGenerated.BuildStamp.Value);', 'Console.WriteLine(CourseGenerated.BuildStamp.Value == "course-v1");'], 'course-v1\nTrue', ['کلاس BuildStamp را در مصرف‌کننده دستی تعریف نکن.', 'خروجی build دوباره باید یکسان بماند؛ تحلیلگر از ProjectReference متصل شده است.']),
['https://github.com/dotnet/roslyn/blob/main/docs/features/incremental-generators.cookbook.md', 'https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/'])

add(38, [
    'فایل و شبکه معمولاً داده را به صورت بایت جابه\u200cجا می\u200cکنند. Stream یک روش مشترک برای خواندن و نوشتن این داده\u200cهاست.',
    'یک بار خواندن، لزوماً همهٔ دادهٔ درخواستی را نمی\u200cدهد. فقط تعداد بایت اعلام\u200cشدهٔ همان خواندن را معتبر بدان.',
    'در خواندن معمول، صفر یعنی به پایان داده رسیده\u200cایم. به این وضعیت EOF می\u200cگویند.',
    'اگر تعداد بایت دقیق و مشخصی لازم داری، ReadExactly کم\u200cخوانی\u200cها را مدیریت می\u200cکند و پایان زودهنگام را خطا می\u200cداند.',
    'Pipelines خواندن و پردازش تکه\u200cهای داده را هماهنگ می\u200cکند؛ مصرف\u200cکننده باید بگوید تا کجا را مصرف یا بررسی کرده است.',
    'پس از پردازش بافر PipeReader، با AdvanceTo وضعیت مصرف را اعلام کن. فراموش\u200cکردن این کار می\u200cتواند باعث نگه\u200cداشتن داده یا تکرار بیهوده شود.',
], ('یک بار Read روی Stream دربارهٔ تعداد بایتِ خوانده\u200cشده چه تضمینی می\u200cدهد؟', 'ممکن است کمتر از طول بافر برگرداند.', 'همیشه بافر را کامل پر می‌کند.', 'همیشه متن کامل یک پیام را می‌خواند.', 'Stream مرز پیام را تضمین نمی‌کند؛ طول بازگشتی و framing باید پردازش شوند.'),
('یک بخش از بافر PipeReader را پردازش کرده\u200cایم. بعد باید چه چیزی را به خواننده اعلام کنیم؟', 'AdvanceTo با consumed و examined درست', 'نگهداری همیشگی همهٔ بافرها بدون اعلام مصرف', 'بستن GC', 'AdvanceTo به pipeline می‌گوید چه داده‌ای آزاد یا دوباره عرضه شود.'),
('using var stream = new MemoryStream(new byte[] { 1, 2 });\nbyte[] buffer = new byte[4];\nConsole.WriteLine(stream.Read(buffer));', '2 چاپ می‌شود.', True, 'تنها دو بایت در منبع وجود دارد؛ اندازهٔ بافر تضمین تعداد بایت خوانده‌شده نیست.'),
('فقط بخش واقعاً خوانده‌شده معتبر است.', ['using var stream = new MemoryStream(new byte[] { 7 });', 'byte[] buffer = new byte[8]; int read = stream.Read(buffer);', 'Console.WriteLine(buffer.Sum(x => (int)x)); // process bytes'], 2, 'Console.WriteLine(buffer.AsSpan(0, read).ToArray().Sum(x => (int)x));', 'Console.WriteLine(buffer.Length);', 'در این مثال ToArray صرفاً برای Sum است؛ مسیر داغ بهتر است روی Span حلقه بزند و کپی نکند. طول read مرز دادهٔ معتبر است.'),
('برای خواندن دقیق سه بایت با خطا در EOF زودهنگام، API را انتخاب کن.', 'using var stream = new MemoryStream(new byte[] { 1, 2, 3 });\nbyte[] buffer = new byte[3];\nstream.__1__(buffer);', ['ReadExactly'], ['ReadByte', 'Flush'], 'ReadExactly تا پرشدن buffer می‌خواند یا EndOfStreamException می‌دهد.'),
('سه بایت معلوم را با ReadExactly بخوان، جمع بزن و مالکیت stream را رعایت کن.', ['using var stream = new MemoryStream(new byte[] { 2, 3, 4 });\nbyte[] buffer = new byte[3];', 'await stream.ReadExactlyAsync(buffer);\nint total = 0;\nforeach (byte value in buffer) total += value;\nConsole.WriteLine(total);'], '9', ['کم‌خوانی با read دقیق مدیریت شود.', 'فرق stream و پیام framed را در review توضیح بده.']),
['https://learn.microsoft.com/en-us/dotnet/standard/io/', 'https://learn.microsoft.com/en-us/dotnet/standard/io/pipelines'])

add(39, [
    'برای فرستادن داده به یک برنامهٔ دیگر، باید روی شکل داده توافق کنیم؛ مثلاً نام و نوع فیلدهای یک سفارش.',
    'JSON یکی از قالب\u200cهای متنیِ جابه\u200cجایی داده است. تبدیل شیء به این متن و بازسازی آن دو کار متفاوت\u200cاند.',
    'DTO دادهٔ موردنیاز برای انتقال را مشخص می\u200cکند. نام فیلدها، احتمال null و بررسی ورودی بخشی از این قراردادند.',
    'JsonSerializerContext می\u200cتواند اطلاعات لازم تبدیل را هنگام ساخت تولید کند. این روش برای بعضی برنامه\u200cهای AOT مفید است.',
    'پیش از خواندن پاسخ به عنوان نتیجهٔ موفق، وضعیت پاسخ HTTP را بررسی کن. پاسخ خطا را نتیجهٔ عادی فرض نکن.',
    'تکرار یک درخواست همیشه بی\u200cخطر نیست. مثلاً ثبت دوبارهٔ سفارش می\u200cتواند دو سفارش بسازد؛ تعداد تلاش و روش جلوگیری از تکرار اثر مهم است.',
], ('در چه حالتی تکرار خودکار یک درخواست POST می\u200cتواند همان کار را دوباره انجام دهد؟', 'وقتی عملیات اثر دارد و کلید idempotency ندارد.', 'فقط وقتی پاسخ 200 است.', 'هرگز؛ شبکه دقیقاً یک‌بار تحویل می‌دهد.', 'ممکن است سرور commit کند ولی پاسخ گم شود؛ idempotency و نتیجهٔ ذخیره‌شده برای این شکاف لازم‌اند.'),
('برای تبدیل داده به JSON در برنامهٔ سازگارتر با AOT، کدام ابزار از قبل اطلاعات لازم را تولید می\u200cکند؟', 'JsonSerializerContext تولیدشده از source', 'اجرای Reflection.Emit در هر درخواست', 'تبدیل همهٔ DTOها به dynamic', 'context تولیدی متادیتای انواع شناخته‌شده را بدون discovery عمومی runtime ارائه می‌کند.'),
('string json = System.Text.Json.JsonSerializer.Serialize(new { Count = 3 });\nConsole.WriteLine(json.Contains("3"));', 'True چاپ می‌شود.', True, 'anonymous object در اجرای معمول به property عددی JSON تبدیل می‌شود؛ قرارداد نام‌ها نیازمند تنظیم آگاهانه است.'),
('پاسخ ناموفق را به عنوان DTO موفقیت مصرف نکن.', ['using var response = new HttpResponseMessage(System.Net.HttpStatusCode.BadRequest);', 'string body = await response.Content.ReadAsStringAsync();'], 1, 'response.EnsureSuccessStatusCode(); string body = await response.Content.ReadAsStringAsync();', 'string body = response.ToString();', 'EnsureSuccessStatusCode شکست HTTP را آشکار می‌کند؛ ToString قرارداد محتوای موفق را نمی‌خواند.'),
('attribute تولید متادیتای JSON را کامل کن.', '[System.Text.Json.Serialization.__1__(typeof(Item))]\npartial class Context : System.Text.Json.Serialization.JsonSerializerContext { }\nrecord Item(int Count);', ['JsonSerializable'], ['Obsolete', 'Serializable'], 'JsonSerializable روی context جزئی، generator را برای نوع Item پیکربندی می‌کند.'),
('DTO سفارش را با JsonSerializerContext رفت‌وبرگشت بده؛ به شبکهٔ واقعی وابسته نباش.', ['using System.Text.Json;\nusing System.Text.Json.Serialization;', 'string json = JsonSerializer.Serialize(new Order(42), CourseJsonContext.Default.Order);\nvar order = JsonSerializer.Deserialize(json, CourseJsonContext.Default.Order);\nConsole.WriteLine(order?.Id);', 'record Order(int Id);', '[JsonSerializable(typeof(Order))]\npartial class CourseJsonContext : JsonSerializerContext { }'], '42', ['از overload دارای context استفاده شود.', 'اعتبارسنجی کسب‌وکار را با deserialization یکسان فرض نکن.']),
['https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/source-generation', 'https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory'])

add(40, [
    'طراحی خوب یعنی تغییر برنامه را قابل فهم و قابل کنترل کنیم. زیادکردن تعداد کلاس\u200cها به\u200cتنهایی طراحی را بهتر نمی\u200cکند.',
    'قبل از جداکردن بخش\u200cها بپرس هر بخش چه مسئولیتی دارد و به چه دلیل ممکن است تغییر کند.',
    'SRP بر مسئولیتِ مرتبط تمرکز دارد. OCP می\u200cگوید بعضی رفتارهای تازه را از راه گسترش مناسب اضافه کنیم.',
    'LSP می\u200cگوید یک نوع فرزند باید بتواند بدون شکستن انتظار معتبر مصرف\u200cکننده، جای نوع پایه استفاده شود.',
    'ISP قراردادها را با نیاز مصرف\u200cکننده متناسب نگه می\u200cدارد. DIP منطق اصلی را به قرارداد وابسته می\u200cکند، نه جزئیات خاص ابزار.',
    'این اصول با نام SOLID شناخته می\u200cشوند. آن\u200cها راه فکرکردن\u200cاند؛ برای نیاز نامشخص، لایه و قرارداد اضافی نساز.',
], ('کدام اصل می\u200cگوید نوع فرزند باید بدون شکستن انتظارِ استفاده\u200cکننده جای نوع پایه بنشیند؟', 'Liskov Substitution', 'Dependency Injection فقط', 'هرچه کلاس بیشتر بهتر', 'LSP رفتار قابل انتظار مصرف‌کننده را حفظ می‌کند، نه صرفاً سازگاری امضای متد را.'),
('منطق اصلی قیمت\u200cگذاری بهتر است به قرارداد وابسته باشد یا به جزئیات یک ابزار مشخص؟', 'قرارداد سیاست تخفیف', 'ساخت مستقیم همهٔ درایورهای ذخیره‌سازی در متد', 'متغیر global قابل تغییر', 'وابستگی به قرارداد امکان آزمایش و تغییر implementation را بدون درهم‌تنیدگی فراهم می‌کند.'),
('IDiscount policy = new HalfPrice();\nConsole.WriteLine(policy.Apply(100m));\ninterface IDiscount { decimal Apply(decimal value); }\nclass HalfPrice : IDiscount { public decimal Apply(decimal value) => value / 2; }', '50 چاپ می‌شود.', True, 'مصرف‌کننده با قرارداد سیاست کار می‌کند و رفتار خاص در implementation است.'),
('سرویس باید وابستگی را دریافت کند، نه implementation را بسازد.', ['interface IClock { DateTime UtcNow { get; } }', 'class Service { public DateTime Now() => DateTime.UtcNow; }'], 1, 'class Service(IClock clock) { public DateTime Now() => clock.UtcNow; }', 'class Service { public DateTime Now() => new DateTime(); }', 'دریافت IClock زمان را برای تست قابل کنترل می‌کند؛ مقدار پیش‌فرض DateTime جای طراحی وابستگی نیست.'),
('اصل وابستگی به abstraction را با پارامتر قرارداد کامل کن.', 'interface IDiscount { decimal Apply(decimal value); }\nclass Checkout(__1__ discount) { public decimal Total(decimal value) => discount.Apply(value); }', ['IDiscount'], ['object', 'string'], 'نوع پارامتر باید عملیات لازم را در قرارداد اعلام کند؛ object یا string این عضو را ندارند.'),
('Checkout را از سیاست تخفیف جدا کن و دو سیاست بدون تغییر Checkout مصرف کن.', ['Console.WriteLine(new Checkout(new NoDiscount()).Total(100m));\nConsole.WriteLine(new Checkout(new HalfPrice()).Total(100m));', 'interface IDiscount { decimal Apply(decimal price); }', 'sealed class NoDiscount : IDiscount { public decimal Apply(decimal price) => price; }\nsealed class HalfPrice : IDiscount { public decimal Apply(decimal price) => price / 2; }', 'sealed class Checkout(IDiscount discount)\n{\n    public decimal Total(decimal price) => discount.Apply(price);\n}'], '100\n50', ['Checkout switch بر نوع implementation نداشته باشد.', 'تعویض سیاست از بیرون انجام شود.']),
['https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles', 'https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/overview'])

add(41, [
    'الگوی طراحی نامی برای یک راه\u200cحل تکرارشونده است. اول مسئله را بشناس؛ بعد بررسی کن کدام الگو به آن کمک می\u200cکند.',
    'مثلاً ساختن یک شیء با ورودی\u200cهای زیاد، با هماهنگ\u200cکردن یک ابزار قدیمی با قرارداد تازه مسئلهٔ یکسانی نیست.',
    'Factory ساخت شیء را در جای مناسبی جمع می\u200cکند. Builder می\u200cتواند ساخت مرحله\u200cبه\u200cمرحلهٔ یک شیء پیچیده را روشن\u200cتر کند.',
    'Adapter قرارداد موجود را به شکل موردنیاز تبدیل می\u200cکند. شبیه مبدلی است که دو اتصال متفاوت را به هم سازگار می\u200cکند.',
    'Decorator همان قرارداد را نگه می\u200cدارد و رفتار تازه\u200cای دور آن اضافه می\u200cکند؛ مثلاً ثبت گزارش پیش از انجام کار.',
    'Singleton به تعداد یا عمر نمونه مربوط است. استفاده از آن به\u200cتنهایی دادهٔ مشترک را برای کار هم\u200cزمان امن نمی\u200cکند.',
], ('می\u200cخواهیم بدون عوض\u200cکردن قرارداد، رفتاری دورِ کار قبلی اضافه کنیم. کدام الگو مناسب است؟', 'Decorator', 'Adapter الزاماً در همهٔ موارد', 'تغییر دستی همهٔ کلاینت‌ها', 'Decorator نمونهٔ هم‌قرارداد را می‌پیچد و رفتار قبل/بعد را گسترش می‌دهد.'),
('یک ابزار قدیمی داریم و می\u200cخواهیم آن را با قرارداد تازه هماهنگ کنیم. کدام الگو مناسب است؟', 'Adapter', 'Singleton', 'فقط inheritance چندگانهٔ کلاس', 'Adapter تفاوت قرارداد دو سیستم را در مرز متمرکز می‌کند.'),
('IText text = new Upper(new Plain());\nConsole.WriteLine(text.Read());\ninterface IText { string Read(); }\nclass Plain : IText { public string Read() => "hi"; }\nclass Upper(IText inner) : IText { public string Read() => inner.Read().ToUpperInvariant(); }', 'HI چاپ می‌شود.', True, 'Upper قرارداد IText را حفظ و خروجی inner را تزئین می‌کند.'),
('Decorator نباید implementation درونی دریافت‌شده را نادیده بگیرد.', ['interface IText { string Read(); }', 'class Upper(IText inner) : IText { public string Read() => "FIXED"; }'], 1, 'class Upper(IText inner) : IText { public string Read() => inner.Read().ToUpperInvariant(); }', 'class Upper(IText inner) : IText { public string Read() => new Upper(inner).Read(); }', 'هدف wrapping گسترش رفتار inner است؛ ساخت recursive decorator موجب بازگشت بی‌پایان می‌شود.'),
('وابستگی decorator باید همان قرارداد خروجی را بپذیرد.', 'interface IText { string Read(); }\nclass Upper(__1__ inner) : IText { public string Read() => inner.Read().ToUpperInvariant(); }', ['IText'], ['int', 'Action'], 'قرارداد مشترک باعث ترکیب چند decorator بدون شناخت نوع concrete می‌شود.'),
('خروجی متن را با decorator داخل کروشه بگذار و سپس uppercase کن؛ ترتیب ترکیب را روشن نگه دار.', ['IText text = new Upper(new Brackets(new Plain()));\nConsole.WriteLine(text.Read());', 'interface IText { string Read(); }\nsealed class Plain : IText { public string Read() => "hello"; }', 'sealed class Brackets(IText inner) : IText { public string Read() => "[" + inner.Read() + "]"; }', 'sealed class Upper(IText inner) : IText { public string Read() => inner.Read().ToUpperInvariant(); }'], '[HELLO]', ['decoratorها قرارداد یکسان داشته باشند.', 'مصرف‌کننده نوع concrete درونی را بررسی نکند.']),
['https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures', 'https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/develop-asp-net-core-mvc-apps'])

add(42, [
    'بعضی مسئله\u200cها دربارهٔ همکاریِ بخش\u200cها هستند؛ مثلاً انتخاب یک روش پرداخت یا دنبال\u200cکردن تاریخچهٔ کارها.',
    'الگوی مناسب باید جریان واقعی کار را روشن\u200cتر کند. استفاده از نام یک الگو به\u200cتنهایی مسئله را حل نمی\u200cکند.',
    'Strategy روش انجام کار را قابل تعویض می\u200cکند. Observer خبر تغییر را به مشترک\u200cها می\u200cرساند.',
    'Command درخواست انجام کار را به شکل یک شیء نگه می\u200cدارد. این کار می\u200cتواند ساخت صف یا تاریخچه را آسان کند.',
    'برای undo باید روش معکوس\u200cکردن اثر یا بازگرداندن وضعیت قبلی را هم طراحی کنی؛ هر کاری به\u200cسادگی برگشت\u200cپذیر نیست.',
    'در Chain of Responsibility باید روشن باشد هر بخش چه وقت درخواست را ادامه می\u200cدهد و چه وقت آن را متوقف می\u200cکند.',
], ('می\u200cخواهیم درخواست را مثل یک شیء نگه داریم تا بعداً تاریخچه یا undo داشته باشیم. کدام الگو مناسب است؟', 'Command', 'صرفاً نام‌گذاری متد با Async', 'Singleton', 'Command داده و رفتار درخواست را بسته‌بندی می‌کند؛ سیاست undo باید صریح طراحی شود.'),
('در زنجیرهٔ Chain of Responsibility، کدام تصمیم باید برای هر بخش روشن باشد؟', 'شرایط ادامه یا توقف زنجیره', 'اجبار همهٔ handlerها به singleton', 'حذف همهٔ خطاها', 'اگر تکلیف next و stop مشخص نباشد درخواست ممکن است دوباره یا اصلاً پردازش نشود.'),
('var state = new Counter();\nvar command = new Add(state, 3);\ncommand.Execute(); command.Undo();\nConsole.WriteLine(state.Value);\nclass Counter { public int Value; }\nclass Add(Counter target, int amount) { public void Execute() => target.Value += amount; public void Undo() => target.Value -= amount; }', '0 چاپ می‌شود.', True, 'در این مدل ساده و بدون تغییر هم‌زمان، عملیات معکوس افزایش را خنثی می‌کند.'),
('Undo باید اثر افزایش همین command را خنثی کند.', ['class Counter { public int Value; }', 'class Add(Counter target, int amount) { public void Execute() => target.Value += amount; public void Undo() => target.Value = 0; }'], 1, 'class Add(Counter target, int amount) { public void Execute() => target.Value += amount; public void Undo() => target.Value -= amount; }', 'class Add(Counter target, int amount) { public void Execute() => target.Value += amount; public void Undo() => target.Value += amount; }', 'صفرکردن وضعیت قبلی را هم پاک می‌کند؛ معکوس این فرمان باید amount را کم کند. قرارداد فقط برای مدل سادهٔ همین سؤال است.'),
('استراتژی قابل تزریق را کامل کن.', 'interface IPrice { decimal Calculate(decimal value); }\nclass Service(__1__ strategy) { public decimal Total(decimal value) => strategy.Calculate(value); }', ['IPrice'], ['object', 'Task'], 'قرارداد الگوریتم قابل تعویض، وابستگی رفتار Service را روشن می‌کند.'),
('Command افزایش و undo بساز؛ شمارنده از 10 شروع شود و پس از undo به 10 برگردد.', ['var target = new Counter { Value = 10 };\nICommand command = new Add(target, 5);\ncommand.Execute();\nConsole.WriteLine(target.Value);\ncommand.Undo();\nConsole.WriteLine(target.Value);', 'interface ICommand { void Execute(); void Undo(); }\nsealed class Counter { public int Value; }', 'sealed class Add(Counter target, int amount) : ICommand\n{\n    public void Execute() => target.Value += amount;\n    public void Undo() => target.Value -= amount;\n}'], '15\n10', ['تاریخچه یا هم‌زمانی خارج از این مدل فرض نشود.', 'Undo نباید تمام وضعیت را صفر کند.']),
['https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-application-layer-implementation-web-api', 'https://learn.microsoft.com/en-us/dotnet/standard/events/observer-design-pattern'])

add(43, [
    'یک بخش برنامه ممکن است برای کارش به بخش دیگری نیاز داشته باشد؛ مثلاً گزارش\u200cساز به روش ذخیرهٔ گزارش نیاز دارد.',
    'در تزریق وابستگی، این نیاز را از بیرون به بخش می\u200cدهیم. لازم نیست خودِ آن بخش همهٔ ابزارهایش را بسازد.',
    'Transient معمولاً برای هر درخواستِ ساخت یک نمونه می\u200cدهد. Scoped در هر محدوده یک نمونهٔ مشترک می\u200cدهد.',
    'Singleton معمولاً برای عمر همان نگهدارندهٔ سرویس\u200cها یک نمونه نگه می\u200cدارد. دادهٔ مشترک آن هنوز به هماهنگی درست نیاز دارد.',
    'سرویس کوتاه\u200cعمر را داخل سرویس بلندعمر نگه ندار؛ ممکن است بیشتر از عمر مجازش استفاده شود، مثل نگه\u200cداشتن DbContext در singleton.',
    'معمولاً نگهدارندهٔ سرویس\u200cها منابعی را که خودش ساخته مدیریت می\u200cکند. سرویسِ قرض\u200cگرفته یا تزریق\u200cشده را خودسرانه نبند.',
], ('در یک scope، یک سرویس scoped را دوبار می\u200cگیریم. معمولاً چه نمونه\u200cای دریافت می\u200cکنیم؟', 'همان نمونه', 'دو نمونهٔ تازه همیشه', 'نمونهٔ کل process حتی با container متفاوت', 'Scoped در محدودهٔ همان scope نمونه را بازاستفاده می‌کند؛ scope بعدی مستقل است.'),
('اگر یک singleton، سرویس DbContext از نوع scoped را داخل خودش نگه دارد، چه مشکلی پیش می\u200cآید؟', 'Captive dependency و طول عمر نامعتبر', 'خودکار همهٔ queryها را سریع‌تر می‌کند.', 'هیچ؛ scoped همیشه thread-safe است.', 'عمر و هم‌زمانی context با singleton سازگار نیست؛ scope درست یا factory لازم است.'),
('using var provider = new Microsoft.Extensions.DependencyInjection.ServiceCollection()\n    .BuildServiceProvider();\nConsole.WriteLine(provider is not null);', 'با using مربوط به extensionهای DI، True چاپ می‌شود.', True, 'BuildServiceProvider container می‌سازد؛ در برنامهٔ واقعی host معمولاً مالک container است.'),
('سرویس request نباید مستقیم از root provider حل شود.', ['// services.AddScoped<Session>();', 'using var provider = services.BuildServiceProvider(validateScopes: true);', 'var session = provider.GetRequiredService<Session>();'], 2, 'using var scope = provider.CreateScope(); var session = scope.ServiceProvider.GetRequiredService<Session>();', 'var session = provider.GetService<Session>();', 'GetService هم scope ایجاد نمی‌کند؛ برای scoped باید scope معتبر مصرف شود.'),
('lifetime درون scope را انتخاب کن.', '// IServiceCollection services\nservices.__1__<Session>();\nclass Session { }', ['AddScoped'], ['AddSingleton', 'AddTransient'], 'AddScoped نمونه را در همان scope مشترک و بین scopeها جدا نگه می‌دارد.'),
('DI scoped را در یک scope دوبار و سپس scope تازه resolve کن و هویت‌ها را مقایسه کن.', ['using Microsoft.Extensions.DependencyInjection;', 'var services = new ServiceCollection();\nservices.AddScoped<Session>();\nusing var provider = services.BuildServiceProvider(validateScopes: true);', 'using var first = provider.CreateScope();\nvar a = first.ServiceProvider.GetRequiredService<Session>();\nvar b = first.ServiceProvider.GetRequiredService<Session>();\nusing var second = provider.CreateScope();\nvar c = second.ServiceProvider.GetRequiredService<Session>();\nConsole.WriteLine(ReferenceEquals(a, b));\nConsole.WriteLine(ReferenceEquals(a, c));', 'sealed class Session { }'], 'True\nFalse', ['تمام scopeها آزاد شوند.', 'از root سرویس scoped resolve نکن.']),
['https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/overview', 'https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines'])

add(44, [
    'قواعد اصلی برنامه را از ابزارهایی مثل وب و پایگاه داده جدا کن؛ مثلاً قانونِ معتبر بودن سفارش، خودِ روش ارسال HTTP نیست.',
    'این جداسازی کمک می\u200cکند ابزار را عوض کنیم و همچنان بتوانیم قانون اصلی را بفهمیم و آزمایش کنیم.',
    'در Clean Architecture، منطق اصلی نباید برای شناختن قواعدش به ابزارهایی مثل EF یا کنترل\u200cکنندهٔ وب وابسته باشد.',
    'CQRS مسیرِ تغییر داده و مسیرِ خواندن داده را جدا می\u200cکند. این جداسازی الزاماً دو پایگاه داده یا چند سرویس مستقل نمی\u200cخواهد.',
    'قبل از افزودن یک لایهٔ عمومی تازه، بررسی کن ابزار فعلی همان کار را انجام می\u200cدهد یا نه؛ مثلاً DbContext خودش چند قابلیت مدیریت تغییر دارد.',
    'در یک برنامهٔ واقعی، ذخیرهٔ پایدار، مرز تراکنش و جلوگیری از اثر دوبارهٔ درخواست را جدا طراحی کن. مثال حافظه\u200cایِ آموزشی، این تضمین\u200cها را خودکار ندارد.',
], ('استفاده از CQRS الزاماً ما را مجبور به کدام کار نمی\u200cکند؟', 'دو دیتابیس مجزا', 'تفکیک معنایی command و query', 'قرارداد مشخص عملیات', 'تفکیک خواندن و نوشتن می‌تواند در یک process و روی یک دیتابیس انجام شود.'),
('در Clean Architecture، کدام جهت وابستگی برای منطق اصلی نامناسب است؟', 'Domain به HttpContext وابسته باشد.', 'Endpoint قرارداد Application را مصرف کند.', 'Infrastructure قرارداد ذخیره‌سازی را پیاده کند.', 'قواعد دامنه نباید برای اجرای خود به لایهٔ ورودی HTTP وابسته باشند.'),
('var store = new Dictionary<int, string>();\nstore[1] = "Ada";\nConsole.WriteLine(store.TryGetValue(1, out var name) ? name : "missing");', 'وجود این دو عملیات به‌تنهایی معماری CQRS تولیدی کامل را ثابت می‌کند.', False, 'تفکیک عملیاتی صرفاً یک جزء است؛ invariants، مرزها، خطا و persistence هم باید طراحی شوند.'),
('نامعتبر بودن فرمان باید پیش از تغییر state بررسی شود.', ['static void Create(Dictionary<int, string> users, int id, string name)', '{', '    users[id] = name;', '}'], 2, '    if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException(nameof(name)); users.Add(id, name.Trim());', '    users[id] = name; if (name is null) throw new ArgumentException();', 'اعتبارسنجی پس از تغییر دیر است؛ Add تکرار شناسه را هم در این مدل رد می‌کند.'),
('لایهٔ دامنه نباید برای نام کاربر به جزئیات HTTP نیاز داشته باشد.', 'record CreateUser(int Id, __1__ Name);', ['string'], ['HttpContext', 'HttpResponseMessage'], 'command دادهٔ لازم کسب‌وکار را حمل می‌کند؛ adapter HTTP باید داده را استخراج کند.'),
('یک slice ایجاد و خواندن کاربر بساز: command نام را اعتبارسنجی کند و query فقط بخواند؛ مدل عمداً تک‌نخی و in-memory است.', ['var store = new UserStore();\nvar handler = new CreateUserHandler(store);\nhandler.Handle(new CreateUser(1, "  Ada  "));\nConsole.WriteLine(store.Find(1));', 'record CreateUser(int Id, string Name);\ninterface IUserStore { void Add(int id, string name); string? Find(int id); }', 'sealed class UserStore : IUserStore\n{\n    private readonly Dictionary<int, string> users = new();\n    public void Add(int id, string name) => users.Add(id, name);\n    public string? Find(int id) => users.GetValueOrDefault(id);\n}', 'sealed class CreateUserHandler(IUserStore store)\n{\n    public void Handle(CreateUser command)\n    {\n        if (string.IsNullOrWhiteSpace(command.Name)) throw new ArgumentException(nameof(command));\n        store.Add(command.Id, command.Name.Trim());\n    }\n}'], 'Ada', ['Domain به HTTP یا EF وابسته نباشد.', 'نام خالی و شناسهٔ تکراری پیشرفت ناقص نسازند.', 'برای تولید، تراکنش، persistence و concurrency را طراحی کن.']),
['https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs'])
