"""Check authored beginner lessons and question reminders without running any player actions."""
import json
from pathlib import Path
from catalog import SESSIONS

pack = json.loads((Path(__file__).parent / 'generated/csharp-mastery.json').read_text(encoding='utf-8'))
assert len(SESSIONS) == 44
assert all(4 <= len(session['lesson']) <= 15 for session in SESSIONS)
assert all(0 < len(paragraph) <= 300 for session in SESSIONS for paragraph in session['lesson'])
questions = 0
for stage in pack['stages']:
    for node in stage['nodes']:
        if node['type'] == 'dialogue_lore':
            continue
        questions += 1
        payload = node['payload']
        notes = payload['learningNote']
        assert len(notes) == 3 and all(isinstance(text, str) and text for text in notes), node['id']
        text = ' '.join(notes)
        assert len(text.split()) <= 80, node['id']
        assert not any(marker in text for marker in ('گزینهٔ درست', 'پاسخ درست', 'جواب سؤال', '__1__')), node['id']
        if node['type'] == 'who_am_i':
            assert payload['correctAnswer'] not in text, node['id']
        if node['type'] == 'boss_fight':
            assert all(len(round['payload']['learningNote']) == 3 for round in payload['rounds'])
assert questions == 268
print('44 beginner lessons and 268 question reminders checked; no direct identity answers appear in reminders.')
