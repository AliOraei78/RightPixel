"""Deterministic packaging of the authored catalog, checked against the original roadmap.
Run from anywhere: python content/csharp/build_course.py [--check]
"""
import io
import json
import random
import re
import sys
import zipfile
from pathlib import Path
from catalog import SESSIONS

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
CHECK = '--check' in sys.argv
CHANGES = []


def write(path, data):
    if isinstance(data, str):
        data = data.encode('utf-8')
    if not path.exists() or path.read_bytes() != data:
        CHANGES.append(str(path.relative_to(ROOT)))
        if not CHECK:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)


def archive(files):
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as z:
        for name, content in sorted(files.items()):
            info = zipfile.ZipInfo(name, (2026, 10, 29, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, content.encode('utf-8'))
    return output.getvalue()


roadmap = (ROOT / 'csharp-mastery-roadmap.md').read_text(encoding='utf-8')
rows = re.findall(r'^\| \*\*([^*]+)\*\* \| \*\*(S\d+)\*\* \| \*\*([^*]+)\*\* \| ([^|]+) \| ([^|]+) \|', roadmap, re.M)
assert len(rows) == 44, 'Roadmap must contain S01..S44'
assert [s['number'] for s in SESSIONS] == list(range(1, 45)), 'Missing or duplicate authored session'
world = dict(id='csharp_core', title='مستری C# و .NET · از مبانی تا معماری', icon='C#', color='#a68bf5', sortOrder=0)
pack = dict(version=1, world=world, stages=[])
manifest = dict(version=1, id='csharp-mastery-v1', worldId=world['id'], title=world['title'], sessions=[])
# Use a raw C# string literal so the generated source has no escaping ambiguity.
generator = '''using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Text;
using System.Text;
namespace CourseGenerator;
[Generator]
public sealed class BuildStampGenerator : IIncrementalGenerator
{
    public void Initialize(IncrementalGeneratorInitializationContext context)
    {
        context.RegisterPostInitializationOutput(output => output.AddSource("BuildStamp.g.cs",
            SourceText.From("""namespace CourseGenerated { public static class BuildStamp { public const string Value = "course-v1"; } }""", Encoding.UTF8)));
    }
}
'''
generator_project = '''<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><TargetFramework>net10.0</TargetFramework><LangVersion>13</LangVersion><IsRoslynComponent>true</IsRoslynComponent><ImplicitUsings>enable</ImplicitUsings></PropertyGroup>
  <ItemGroup>
    <Reference Include="Microsoft.CodeAnalysis" HintPath="$(MSBuildSDKsPath)/../Roslyn/bincore/Microsoft.CodeAnalysis.dll" Private="false" />
    <Reference Include="Microsoft.CodeAnalysis.CSharp" HintPath="$(MSBuildSDKsPath)/../Roslyn/bincore/Microsoft.CodeAnalysis.CSharp.dll" Private="false" />
  </ItemGroup>
</Project>
'''
write(HERE / 'workshops/Generator/Generator.csproj', generator_project)
write(HERE / 'workshops/Generator/BuildStampGenerator.cs', generator)

for authored, row in zip(SESSIONS, rows):
    phase, sid, title, prerequisite, topics = row
    number = authored['number']
    stage_id = f'cs_s{number:02d}'
    nodes = []
    rng = random.Random(number)

    def node(kind, order, name, payload, explanation, hint, xp=60, time=None):
        sprite = dict(dialogue_lore='wizard', who_am_i='riddler', compiler_judge='boss', bug_sniper='goblin', bomb_defusal='bomb', code_puzzle='boss')[kind]
        value = dict(id=f'{stage_id}_n{order}', stageId=stage_id, sortOrder=order, type=kind, title=name,
                     npcName=dict(wizard='راهنمای CLR', riddler='مصاحبه‌گر', boss='معمار سیاه‌چال', goblin='شکارچی باگ', bomb='مهندس رفع خطر')[sprite],
                     npcSprite=sprite, xpReward=xp, timeLimitSec=time, hint=hint, explanation=explanation, payload=payload)
        nodes.append(value)
        return value

    intro = [f'{sid} · فاز {phase} · پیش‌نیاز: {prerequisite.strip()} · {title.strip()}'] + authored['lesson']
    node('dialogue_lore', 0, f'{sid} · درس: {title.strip()}', dict(dialogues=intro, keyTakeaway=authored['lesson'][-1],
         topics=topics.strip(), sources=authored['sources']), 'پنج چالش مصاحبه را حل کن و سپس وارد کارگاه عملی شو.', None, 25)
    for order, key in [(1, 'q1'), (2, 'q2')]:
        question, answer, wrong1, wrong2, explanation = authored[key]
        options = [answer, wrong1, wrong2]
        rng.shuffle(options)
        node('who_am_i', order, f'{sid} · مصاحبه {order}: تحلیل مفهوم', dict(clues=[question, explanation.split('؛')[0]], options=options, correctAnswer=answer),
             explanation, 'نوع قرارداد و رفتار زمان اجرا را از نام یا ظاهر دستور جدا کن.')
    code, claim, valid, explanation = authored['judge']
    node('compiler_judge', 3, f'{sid} · مصاحبه ۳: داور کامپایلر', dict(prompt='با فرض C# 13، .NET 10 و usingهای لازم، ادعای زیر را بررسی کن.',
         codeSnippet=code, claimedOutput=claim, verdictOptions=['ادعا درست است', 'ادعا نادرست است'], correctVerdictIndex=0 if valid else 1), explanation,
         'ابتدا خطای کامپایل، سپس رفتار runtime و در آخر مقدار خروجی را بررسی کن.', 85)
    prompt, lines, index, fix, wrong, explanation = authored['bug']
    fixes = [fix, wrong]
    rng.shuffle(fixes)
    node('bug_sniper', 4, f'{sid} · مصاحبه ۴: شکار باگ', dict(prompt=prompt, codeLines=lines, buggyLineIndex=index, fixOptions=fixes, correctFixIndex=fixes.index(fix)),
         explanation, 'متن مسئله قرارداد مطلوب را مشخص می‌کند؛ اصلاح باید همان قرارداد را برقرار کند.', 85)
    prompt, template, blanks, distractors, explanation = authored['bomb']
    bank = list(dict.fromkeys(blanks + distractors))
    rng.shuffle(bank)
    node('bomb_defusal', 5, f'{sid} · مصاحبه ۵: تکمیل کد', dict(prompt=prompt, codeTemplate=template, blanks=blanks, tokenBank=bank),
         explanation, 'هر جای خالی را با توجه به نوع عبارت و قرارداد عملیات پر کن.', 90, 240)
    task, blocks, expected, rubric = authored['workshop']
    solution = '\n\n'.join(blocks) + '\n'
    starter = f'// {sid}: {title.strip()}\n// {task}\n// Target: .NET 10 / C# 13\n// TODO: implement the task. See README.md for acceptance criteria.\nthrow new NotImplementedException("{sid}");\n'
    permutation = list(range(len(blocks)))
    rng.shuffle(permutation)
    if permutation == list(range(len(blocks))):
        permutation = permutation[1:] + permutation[:1]
    scrambled = [blocks[i] for i in permutation]
    order = [permutation.index(i) for i in range(len(blocks))]
    node('code_puzzle', 6, f'{sid} · کارگاه Live Coding', dict(prompt=task, scrambledLines=scrambled, correctOrderIndices=order,
         workshop=dict(sessionId=sid, task=task, starterCode=starter, solutionCode=solution, expectedOutput=expected, rubric=rubric, sources=authored['sources'])),
         'بلوک‌ها به ترتیبِ معتبر کنار هم قرار گرفتند. برای تمرین مستقل، پروژه را دریافت کن، TODO را پیاده کن و خروجی را با معیارهای کارگاه بسنج.',
         'usingها پیش از دستورات اصلی‌اند؛ نوع‌های کمکی پس از top-level statements قرار می‌گیرند.', 150)
    stage = dict(id=stage_id, worldId=world['id'], title=f'{sid} · فاز {phase} · {title.strip()}', stageNumber=number,
                 bossName='معمار ' + sid, nodes=nodes)
    pack['stages'].append(stage)
    manifest['sessions'].append(dict(id=sid, stageId=stage_id, phase=int(phase.translate(str.maketrans('۰۱۲۳۴۵۶۷۸۹','0123456789'))),
         title=title.strip(), prerequisite=prerequisite.strip(), topics=topics.strip(), nodes=7, sources=authored['sources'], expectedOutput=expected))
    analyzer = '<ProjectReference Include="Generator/Generator.csproj" OutputItemType="Analyzer" ReferenceOutputAssembly="false" />' if number == 37 else ''
    project = f'''<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework><LangVersion>13</LangVersion><Nullable>enable</Nullable><ImplicitUsings>enable</ImplicitUsings><AllowUnsafeBlocks>true</AllowUnsafeBlocks><EnableDefaultCompileItems>false</EnableDefaultCompileItems></PropertyGroup>
  <ItemGroup><Compile Include="Program.cs" /><FrameworkReference Include="Microsoft.AspNetCore.App" />{analyzer}</ItemGroup>
</Project>
'''
    readme = f'''# {sid} · {title.strip()}

{task}

پیش‌نیاز: .NET SDK 10. پروژه با C# 13 تنظیم شده است.
Program.cs کد شروع است. آن را کامل کن و اجرا کن:

```powershell
dotnet run --project Workshop.csproj
```

خروجی مورد انتظار:
```text
{expected}
```

معیارهای review:
''' + '\n'.join('- ' + item for item in rubric) + '\n\nکد دلخواه در سرور بازی اجرا نمی‌شود؛ اجرای پروژه روی دستگاه خودت است. راه‌حل در Reference.cs.txt برای مقایسه است و در compile وارد نمی‌شود.\n'
    files = {'Program.cs': starter, 'Reference.cs.txt': solution, 'Workshop.csproj': project, 'README.md': readme, 'expected.txt': expected + '\n'}
    if number == 37:
        files.update({'Generator/Generator.csproj': generator_project, 'Generator/BuildStampGenerator.cs': generator})
    write(HERE / f'generated/Workshops/{sid}.zip', archive(files))
    write(HERE / f'workshops/{sid}.cs', solution)
    write(HERE / f'starters/{sid}.cs', starter)

from pilot import add_pilot
add_pilot(pack, manifest)

packed = json.dumps(pack, ensure_ascii=False, indent=2) + '\n'
write(HERE / 'generated/csharp-mastery.json', packed)
write(HERE / 'manifest.json', json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
write(HERE / 'workshops/WorkshopRunner.csproj', '''<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework><LangVersion>13</LangVersion>
    <Nullable>enable</Nullable><ImplicitUsings>enable</ImplicitUsings><AllowUnsafeBlocks>true</AllowUnsafeBlocks>
    <EnableDefaultCompileItems>false</EnableDefaultCompileItems><Session Condition="'$(Session)' == ''">S01</Session>
  </PropertyGroup>
  <ItemGroup><Compile Include="$(Session).cs" /><FrameworkReference Include="Microsoft.AspNetCore.App" /></ItemGroup>
  <ItemGroup Condition="'$(Session)' == 'S37'"><ProjectReference Include="Generator/Generator.csproj" OutputItemType="Analyzer" ReferenceOutputAssembly="false" /></ItemGroup>
</Project>
''')
index = '# محتوای C#\n\n۴۴ جلسه مطابق سند اصلی؛ هر جلسه ۱ درس + ۵ مصاحبه + ۱ کارگاه.\n\n| جلسه | فاز | عنوان | پیش‌نیاز |\n|---|---|---|---|\n'
for s in manifest['sessions']:
    index += f"| {s['id']} | {s['phase']} | {s['title']} | {s['prerequisite']} |\n"
index += '\nمتن‌های آموزشی و پاسخ‌ها تألیفی‌اند؛ پیوند منابع رسمی در manifest و خود اتاق درس/کارگاه آمده است. کد مرجع هر ۴۴ کارگاه با .NET 10 و C# 13 قابل اجراست. جلسهٔ S37 analyzer واقعی همراه دارد.\n\n'
index += 'بستهٔ بازی در content/csharp/generated/csharp-mastery.json و نسخه‌های قابل دریافت کارگاه در Content/Workshops قرار دارند. کد مرجع و starter جدا هستند.\n\nساخت بسته: `python content/csharp/build_course.py`؛ بررسی همسانی خروجی: `python content/csharp/build_course.py --check`؛ اجرای همهٔ کارگاه‌ها: `python content/csharp/check_workshops.py`.\n\n'
index += 'اجرای یک پاسخ مرجع: `dotnet run --project content/csharp/workshops/WorkshopRunner.csproj -p:Session=S01`. برای تمرین، ZIP همان جلسه را از بازی بگیر و Program.cs را کامل کن. مقایسهٔ خروجی، صحت همهٔ ورودی‌ها یا کیفیت طراحی را ثابت نمی‌کند؛ rubric را هم بررسی کن.\n'
write(HERE / 'README.md', index)
assert len(pack['stages']) == 44 and sum(len(s['nodes']) for s in pack['stages']) == 312
assert len(packed.encode('utf-8')) < 2_000_000
if CHECK and CHANGES:
    raise SystemExit('Generated files differ:\n' + '\n'.join(CHANGES))
print(f'44 sessions, 220 interviews, 44 workshops, 312 rooms; {len(packed.encode("utf-8")):,} bytes. Changed files: {len(CHANGES)}')
