"""Four authored pilot rooms. No arbitrary code execution."""
FORGE = dict(prompt='در سناریوی JIT، کارت‌ها را از کد C# تا کد ماشین مرتب کن.', cards=['JIT', 'کد ماشین', 'کد C#', 'Assembly: IL + metadata', 'کامپایلر C#', 'بارگذار CLR'], correctOrder=[2,4,3,5,0,1])
MEMORY = dict(prompt='عددها کپی می‌شوند؛ دو متغیر شیء به یک Box اشاره می‌کنند. پس از تغییر دوم، مقدارهای نهایی را انتخاب کن.', code='int a = 3; int b = a; b = 8;\nvar x = new Box { Value = 3 }; var y = x; y.Value = 8;\n// a, b, x.Value, y.Value ?', labels=['a','b','x.Value','y.Value'], values=[3,8], correctValues=[3,8,8,8])
GATES = dict(prompt='مسیر اجرای این حلقه را با انتخاب دروازه‌ها دنبال کن.', code='for (int i = 0; i < 3; i++) {\n  if (i == 1) continue;\n  Open(i);\n}', gates=['Open(0)','Open(1)','Open(2)','پایان'], correctPath=[0,2,3])
METHOD = dict(prompt='این ضربه فقط با تشخیص خروجی ref درست می‌شود.',codeSnippet='int value = 3;\nvoid Add(ref int n) { n += 2; }\nAdd(ref value);\nConsole.WriteLine(value);',claimedOutput='5',verdictOptions=['ادعا درست است','ادعا نادرست است'],correctVerdictIndex=0)
def add_pilot(pack, manifest):
    entries=[(1,'runtime_forge','کورهٔ اجرای .NET',FORGE),(2,'memory_mirror','آینهٔ حافظه',MEMORY),(4,'branch_gates','دروازه‌های شرطی',GATES),(5,'boss_fight','نگهبان فاز اول',dict(rounds=[dict(type='runtime_forge',payload=FORGE),dict(type='memory_mirror',payload=MEMORY),dict(type='compiler_judge',payload=METHOD)]))]
    for number,kind,title,payload in entries:
        stage=pack['stages'][number-1]
        stage['nodes'].append(dict(id=f'cs_s{number:02d}_pilot',stageId=stage['id'],sortOrder=7,type=kind,title=title,npcName='نگهبان دانش',npcSprite='boss' if kind=='boss_fight' else 'wizard',xpReward=200 if kind=='boss_fight' else 100,timeLimitSec=None,hint='هر تغییر را یک گام دنبال کن؛ ظاهر نام‌ها نتیجه را تعیین نمی‌کند.',explanation='مسیر اجرا و اثر تغییرها را درست دنبال کردی.',payload=payload))
        manifest['sessions'][number-1]['nodes']=8
