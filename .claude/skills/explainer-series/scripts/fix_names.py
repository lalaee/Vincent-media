"""Apply a series' spelling fixes to a transcript (Whisper mishears franchise names). Edits text and per-word entries.
fixes.json: {"Aung": "Aang", "Cora": "Korra", "A Zula": "Azula", ...}  (whole-word, case-sensitive; multi-word keys
fix segment text only). Keep one fixes.json per series and grow it every episode.
Usage: fix_names.py transcript.json fixes.json"""
import json, re, sys
d = json.load(open(sys.argv[1])); fx = json.load(open(sys.argv[2])); n = 0
for s in d['segments']:
    for a, b in fx.items():
        s['text'], k = re.subn(r'\b' + re.escape(a) + r'\b', b, s['text']); n += k
    for w in s['words']:
        for a, b in fx.items():
            if ' ' not in a: w['w'] = re.sub(r'\b' + re.escape(a) + r'\b', b, w['w'])
json.dump(d, open(sys.argv[1], 'w'), indent=1); print(n, 'fixes applied')
txt = ' '.join(s['text'] for s in d['segments']); left = [a for a in fx if re.search(r'\b' + re.escape(a) + r'\b', txt)]
if left: print('still present:', left)
