#!/usr/bin/env python3
"""Word-by-word captions for a vertical short: transcript.json -> captions.js (chunks of <= N words).
A chunk breaks after punctuation, after a pause > 0.35 s, or at N words. 'avatar' style words can be re-cased with --case.
Usage: make_captions.py transcript.json captions.js [--words 4] [--case avatar=Avatar ...]"""
import json, re, sys
a = sys.argv[1:]; src, out = a[0], a[1]; N = 4; cases = {}
if '--words' in a: N = int(a[a.index('--words') + 1])
if '--case' in a:
    for kv in a[a.index('--case') + 1:]:
        if kv.startswith('--'): break
        k, v = kv.split('='); cases[k] = v
t = json.load(open(src)); W = [w for s in t['segments'] for w in s['words']]
def fix(s):
    for k, v in cases.items(): s = re.sub(r'\b%s\b' % re.escape(k), v, s)
    return s
chunks, cur = [], []
for i, w in enumerate(W):
    cur.append({'w': fix(w['w'].strip()), 's': round(w['s'], 2), 'e': round(w['e'], 2)})
    nxt = W[i + 1]['s'] if i + 1 < len(W) else 1e9
    if len(cur) >= N or w['w'].strip()[-1:] in '.,?!' or nxt - w['e'] > 0.35: chunks.append(cur); cur = []
if cur: chunks.append(cur)
open(out, 'w').write('// word-by-word captions, generated from %s by make_captions.py\nexport default %s;\n' % (src, json.dumps(chunks)))
print(f"{len(chunks)} chunks -> {out}"); print(' | '.join(' '.join(w['w'] for w in c) for c in chunks))
