#!/usr/bin/env python3
"""List every cue word a scene waits for that is never spoken during that scene.
Such a beat silently never fires (a character, highlight or label never appears).
Usage: check_cues.py cues.json scenes.js        -> fix with fixes.json (misheard name) or a different word.
Run it after build_cues.py, and always after re-voicing."""
import json, re, sys
c = json.load(open(sys.argv[1])); src = open(sys.argv[2]).read()
W, S = c['words'], c['scenes']
start = {s['id']: s['t'] for s in S}
end = {S[i]['id']: (S[i + 1]['t'] if i + 1 < len(S) else c['duration']) for i in range(len(S))}
pos = [(m.start(), m.group(1)) for m in re.finditer(r'\n\s*(\w+)(?:\(\)\s*\{|:\s)', src) if m.group(1) in start]
bad = 0
for k, (p, sid) in enumerate(pos):
    blk = src[p:pos[k + 1][0] if k + 1 < len(pos) else len(src)]
    for w in sorted(set(re.findall(r"(?:wt\(|[wW]ord:\s*)['\"]([\w']+)['\"]", blk))):
        ts = W.get(w.lower(), [])
        if not any(start[sid] - 0.5 <= t < end[sid] for t in ts):
            bad += 1
            print(f"{sid} [{start[sid]:.1f}-{end[sid]:.1f}s] waits for '{w}' -> never spoken there (spoken at {ts[:3] or 'never'})")
print(f"{bad} missing cue word(s)" if bad else "all cue words are spoken in their scenes")
sys.exit(1 if bad else 0)
