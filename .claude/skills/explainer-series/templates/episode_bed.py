"""Explainer-series sound bed: the series' music recipe (series.json -> music) under word-keyed SFX (cues.json -> sfx),
plus automatic SFX for scene wipes and numbered section cards. Fully data-driven: an episode needs no Python edits.
Renders one chapter per call (memory stays bounded); run all chapters with narrated-motion-video's bed_chapters.sh:
  bed_chapters.sh <venv python> episode_bed.py out/bed.wav <duration> <chapters...>
Single call for short pieces: python episode_bed.py  (no args -> whole duration, out/bed.wav)

series.json music: {"recipe":"guofeng","level":-23,"args":{"bpm":84,"key":"D","mode":"yu","flavor":"classical"},
                    "wipe":"swish", "card":["impact:soft","chime"]}
cues.json sfx item: {"word":"prison","after":8,"kind":"impact:metal","gain":-6,"pan":0}
kinds: impact:<cinematic|punch|soft|metal|glitch|thud|trailer>, stamp, boom, magic, magic_down, whoosh, whoosh_air, swish,
       pop, pop_bubble, pop_soft, chime, sparkle, tape_rip, rip_down, paper:<rustle|flip|crumple|slide>, click, tick,
       hud_alert, hud_beep, glitch, typewriter, ding, cork_pop, riser:<seconds>"""
import sys, json, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib', 'audio'))
from mgaudio import recipes, sfx, samples

# Only count an instrument as available when every sample the index lists exists (the repo ships partial sets).
_avail, _ok = samples.available, {}
def _complete(key):
    if key not in _ok:
        idx = samples._index().get(key, [])
        _ok[key] = bool(idx) and all(os.path.exists(os.path.join(samples.ROOT, e['file'])) for e in idx)
    return _ok[key]
samples.available = lambda key=None: _avail(key) if key is None else (_avail(key) and _complete(key))

HERE = os.path.dirname(os.path.abspath(__file__))
C = json.load(open(os.path.join(HERE, 'cues.json'))); SER = json.load(open(os.path.join(HERE, 'series.json')))
D = C['duration']; MU = SER.get('music', {}); KEY = MU.get('args', {}).get('key', 'D')
T0, T1, OUT = (float(sys.argv[1]), float(sys.argv[2]), sys.argv[3]) if len(sys.argv) > 3 else (0.0, D, None)
XF = 0.6 if OUT else 0.0
def rel(t): return None if t is None or not (T0 - 0.3 <= t < T1 + XF) else t - T0
def wt(word, after=0.0): return next((t for t in C['words'].get(word.lower(), []) if t >= after - 0.05), None)

# the series' music for this chapter. Section-card chapters get a fresh "drop" at their start; the episode's title card
# (scene id 'title' if present) is the first drop; the last scene is the outro.
S = {s['id']: s['t'] for s in C['scenes']}
first, last = T0 < 1, T1 > D - 1
drop = rel(S.get('title')) if first and 'title' in S else (None if first else 0.5)
m = getattr(recipes, MU.get('recipe', 'ambient'))(duration=T1 - T0 + XF, music_level=MU.get('level', -23), drop=drop,
        outro=rel(C['scenes'][-1]['t']) if last else None, **MU.get('args', {}))
_sfx = m.sfx
def place(snd, at, gain=-12, pan=0.0):
    if os.environ.get('MUSIC_ONLY'): return              # MUSIC_ONLY=1: a clean music bed (social posts), no SFX
    r = rel(at)
    if r is not None and snd is not None: _sfx(snd, at=max(0.0, r), gain=gain, pan=pan)

def make(kind, seed=0):
    name, _, arg = kind.partition(':')
    return {
        'impact': lambda: sfx.impact(arg or 'punch', size=0.8), 'stamp': lambda: sfx.stamp('rubber', seed=seed), 'boom': lambda: sfx.boom(1.8),
        'magic': lambda: sfx.magic(0.8, key=KEY, up=True, seed=seed), 'magic_down': lambda: sfx.magic(0.8, key=KEY, up=False, seed=seed),
        'whoosh': lambda: sfx.whoosh(0.7, kind='swoosh', direction=1, seed=seed), 'whoosh_air': lambda: sfx.whoosh(0.8, kind='air', direction=1, seed=seed),
        'swish': lambda: sfx.swish(0.22, direction=1, seed=seed), 'pop': lambda: sfx.pop('mouth', pitch=1.1), 'pop_bubble': lambda: sfx.pop('bubble', pitch=1.0),
        'pop_soft': lambda: sfx.pop('soft', pitch=1.0), 'chime': lambda: sfx.chime(('D5', 'F5', 'A5', 'D6'), step=0.05, kind='celesta'),
        'sparkle': lambda: sfx.sparkle(0.9, key=KEY, seed=seed), 'tape_rip': lambda: sfx.tape_rip(0.35, up=True, seed=seed), 'rip_down': lambda: sfx.tape_rip(0.35, up=False, seed=seed),
        'paper': lambda: sfx.paper(arg or 'rustle', dur=0.6, seed=seed), 'click': lambda: sfx.click('soft'), 'tick': lambda: sfx.tick('wood'),
        'hud_alert': lambda: sfx.hud_alert(cycles=1), 'hud_beep': lambda: sfx.hud_beep('A5', dur=0.12), 'glitch': lambda: sfx.glitch(0.15, 'digital', seed=seed),
        'typewriter': lambda: sfx.typewriter(seed=seed), 'ding': lambda: sfx.ding('A6', 'bell', dur=0.6), 'cork_pop': lambda: sfx.cork_pop(),
        'riser': lambda: sfx.riser(float(arg or 1.5), note='A3', end='cut', seed=seed),
    }.get(name, lambda: None)()

# automatic: a swish on every scene wipe, a hit + chime on every numbered section card
for i, s in enumerate(C['scenes'][1:]):
    if T0 - 1 <= s['t'] < T1 + 1:
        place(make(MU.get('wipe', 'swish'), 100 + i), s['t'] - 0.08, -17)
        if s['id'] in ('sec' + k for k in C.get('sections', {})) or (s['id'].startswith('r') and s['id'][1:].isdigit()):
            card = MU.get('card', ['impact:soft', 'chime']); place(make(card[0]), s['t'] + 0.05, -11)
            if len(card) > 1: place(make(card[1]), s['t'] + 0.4, -17)
# the episode's word-keyed SFX
for i, e in enumerate(C.get('sfx', [])):
    t = wt(e['word'], e.get('after', 0)) if 'word' in e else e.get('t')
    if t is not None: place(make(e['kind'], seed=200 + i), t + e.get('offset', 0.0), e.get('gain', -12), e.get('pan', 0.0))

os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
res = m.export(OUT or os.path.join(HERE, 'out', 'bed.wav'), lufs=-20, tp=-3)
print({k: res[k] for k in ('duration', 'lufs', 'true_peak') if k in res})
