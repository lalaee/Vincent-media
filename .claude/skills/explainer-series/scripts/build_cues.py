"""Merge an episode plan with the transcript into cues.json (what the page and the sound bed both read).
plan.json: {"fps":30, "tail":1.0, "scenes":[["id", t_or_"word@after"], ...], "sections":{"1":"TITLE", ...},
            "sfx":[{"word":"prison","after":8,"kind":"impact:metal","gain":-6,"pan":0}, ...], "chapters":[0, 41.6, ...]}
A scene start can be a time in seconds or "word@after" (first time `word` is spoken after `after` s, minus 0.3 s lead).
Every word's start times go into cues.words[word] (lower-case, punctuation stripped), so scenes can look words up.
Usage: build_cues.py transcript.json plan.json cues.json"""
import json, re, sys
d = json.load(open(sys.argv[1])); plan = json.load(open(sys.argv[2]))
words = {}
for s in d['segments']:
    for w in s['words']:
        k = re.sub(r'[^a-z0-9]', '', w['w'].lower())
        if k: words.setdefault(k, []).append(round(w['s'], 3))
# spelled-out numbers ("two hundred and twenty five") are also indexed as digits ("225") at their first word,
# so plans and scenes can key on numbers however the narrator reads them
UNITS = {w: i for i, w in enumerate('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split())}
TENS = {w: 10 * (i + 2) for i, w in enumerate('twenty thirty forty fifty sixty seventy eighty ninety'.split())}
flat = [(re.sub(r'[^a-z0-9]', '', w['w'].lower()), w['s']) for s in d['segments'] for w in s['words']]
i = 0
while i < len(flat):
    j, total, cur, seen = i, 0, 0, False
    while j < len(flat):
        w = flat[j][0]
        if w in UNITS: cur += UNITS[w]
        elif w in TENS: cur += TENS[w]
        elif w == 'hundred' and seen: cur *= 100
        elif w == 'thousand' and seen: total += cur * 1000; cur = 0
        elif w == 'and' and seen and j + 1 < len(flat) and (flat[j + 1][0] in UNITS or flat[j + 1][0] in TENS): pass
        else: break
        seen = True; j += 1
    if j - i >= 2:
        words.setdefault(str(total + cur), []).append(round(flat[i][1], 3)); words[str(total + cur)].sort(); i = j
    else: i += 1

def resolve(v):
    if isinstance(v, (int, float)): return float(v)
    wd, after = v.split('@'); t = next((t for t in words.get(wd.lower(), []) if t >= float(after)), None)
    if t is None: sys.exit(f'scene start "{v}": word not found')
    return round(t - 0.3, 3)
scenes = [dict(id=i, t=resolve(t)) for i, t in plan['scenes']]
bad = [(a['id'], b['id']) for a, b in zip(scenes, scenes[1:]) if b['t'] <= a['t']]
if bad: sys.exit(f'scene starts out of order: {bad}')
dur = round(d['duration'] + plan.get('tail', 1.0), 2)
C = dict(fps=plan.get('fps', 30), duration=dur, scenes=scenes, sections=plan.get('sections', {}), sfx=plan.get('sfx', []),
         chapters=plan.get('chapters') or [0, dur], words=words)
json.dump(C, open(sys.argv[3], 'w')); print(f"{len(scenes)} scenes, {len(words)} words, {dur} s -> {sys.argv[3]}")
