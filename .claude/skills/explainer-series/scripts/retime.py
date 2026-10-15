"""Re-time an episode plan to a new recording of the same script (a re-voice, a new take, a different narrator).
Aligns the old and new transcripts word by word and maps every absolute time in plan.json to the new voice:
numeric scene starts, chapter boundaries and sfx "after"/"t" values. ("word@after" scene starts get their "after" mapped.)
Words are what scenes key on, so the visuals follow automatically once cues.json is rebuilt from the new transcript.
Usage: retime.py old_transcript.json new_transcript.json plan.json new_plan.json"""
import bisect, difflib, json, re, sys
norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
ow = [w for s in json.load(open(sys.argv[1]))['segments'] for w in s['words']]
nd = json.load(open(sys.argv[2])); nw = [w for s in nd['segments'] for w in s['words']]
sm = difflib.SequenceMatcher(None, [norm(w['w']) for w in ow], [norm(w['w']) for w in nw], autojunk=False)
pairs = [(ow[a + k]['s'], nw[b + k]['s']) for a, b, n in sm.get_matching_blocks() for k in range(n)]
OT = [p[0] for p in pairs]
print(f'aligned {len(pairs)} of {len(ow)} words (ratio {sm.ratio():.2f})')
def m(t):                       # piecewise-linear old->new time through the matched words
    t = float(t); i = bisect.bisect_left(OT, t)
    if i == 0: return round(max(0.0, pairs[0][1] - (pairs[0][0] - t)), 3)
    if i >= len(pairs): return round(pairs[-1][1] + (t - pairs[-1][0]), 3)
    (o0, n0), (o1, n1) = pairs[i - 1], pairs[i]
    return round(n0 + (t - o0) * ((n1 - n0) / (o1 - o0) if o1 > o0 else 1), 3)
plan = json.load(open(sys.argv[3]))
plan['scenes'] = [[sid, m(t) if isinstance(t, (int, float)) else f"{t.split('@')[0]}@{m(float(t.split('@')[1]))}"] for sid, t in plan['scenes']]
if plan.get('chapters'):
    ch = plan['chapters']; plan['chapters'] = [0] + [m(c) for c in ch[1:-1]] + [round(nd['duration'] + plan.get('tail', 1.0), 2)]
for e in plan.get('sfx', []):
    for k in ('after', 't'):
        if k in e: e[k] = m(e[k])
json.dump(plan, open(sys.argv[4], 'w'), indent=1)
print('scenes', [f"{s}:{t}" for s, t in plan['scenes'][:6]], '...')
print('chapters', plan.get('chapters'))
