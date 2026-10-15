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
