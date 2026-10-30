"""Compile and run every authored reference; compare exact deterministic stdout."""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sessions = json.loads((HERE / 'manifest.json').read_text(encoding='utf-8'))['sessions']
failures = []
for session in sessions:
    sid = session['id']
    build = subprocess.run(['dotnet', 'build', str(HERE / 'workshops/WorkshopRunner.csproj'),
        '-m:1', f'-p:Session={sid}', '-p:UseSharedCompilation=false', '-v:q'], capture_output=True, text=True, encoding='utf-8', errors='replace')
    if build.returncode:
        failures.append(sid)
        print(f'FAIL {sid}: build\n{build.stdout}\n{build.stderr}', flush=True)
        continue
    run = subprocess.run(['dotnet', str(HERE / 'workshops/bin/Debug/net10.0/WorkshopRunner.dll')],
        capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=30)
    actual = run.stdout.replace('\r\n', '\n').strip()
    if run.returncode or actual != session['expectedOutput'].strip():
        failures.append(sid)
        print(f'FAIL {sid}: expected {session["expectedOutput"]!r}, got {actual!r}\n{run.stderr}', flush=True)
    else:
        print(f'PASS {sid}', flush=True)
if failures:
    sys.exit('Failed: ' + ', '.join(failures))
print('44/44 workshop reference builds and outputs passed.')
