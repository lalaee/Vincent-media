"""Music + SFX bed for a narrated film, built with mg-styles-15's mgaudio. Every SFX is placed at a word time from cues.json.
Exports out/bed.wav at about -20 LUFS: quiet on purpose, because scripts/mix.sh puts the narration on top and
ducks this bed under the voice. Copy into <mg>/demos/<slug>/ and run with the venv python.

Recipes (mgaudio.recipes): techno, acid, pop, future_bass, trap, glitch_hop, darksynth, synthwave, vaporwave, chiptune,
lofi, ambient, variety, explainer, guofeng. Each prompt's "Sound:" line names the genre; pick the closest recipe.
Useful SFX (mgaudio.sfx): sticker_slap, paper('rustle'|'flip'|'crumple'|'slide'), tape_rip, scissors, stamp('rubber'),
shutter, typewriter, typing, pop, cork_pop, whoosh, swish, impact('punch'|'thud'|'soft'|'metal'), riser, boom, sparkle,
magic, chime, ding, tick, click, blip, hud_beep, hud_scan, lock_on, glitch, splash, bubble, ..."""
import sys, json, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib', 'audio'))
from mgaudio import recipes, sfx, synth, samples

# The repo ships only the instrument samples its own 15 films use: some sets in samples/index.json are missing or
# partial on disk (piano, kalimba, harp, dantranh...) and raise "LibsndfileError ... System error" mid-render.
# Treat an instrument as available only if every file the index lists exists, so recipes use their synth fallbacks.
_avail, _ok = samples.available, {}
def _complete(key):
    if key not in _ok:
        idx = samples._index().get(key, [])
        _ok[key] = bool(idx) and all(os.path.exists(os.path.join(samples.ROOT, e['file'])) for e in idx)
    return _ok[key]
samples.available = lambda key=None: _avail(key) if key is None else (_avail(key) and _complete(key))

HERE = os.path.dirname(os.path.abspath(__file__))
C = json.load(open(os.path.join(HERE, 'cues.json'))); D = C['duration']
S = {s['id']: s['t'] for s in C['scenes']}
WORDS = C.get('words') or {k: [v] for k, v in C.get('w', {}).items()}       # words: {word: [t, ...]} (or legacy w: {word: t})
def wt(word, after=0.0):
    return next((t for t in WORDS.get(word.lower(), []) if t >= after - 0.05), None)

# Chaptered rendering for long beds (see scripts/bed_chapters.sh): bed.py <t0> <t1> <out.wav>. Short films: no args.
T0, T1, OUT = (float(sys.argv[1]), float(sys.argv[2]), sys.argv[3]) if len(sys.argv) > 3 else (0.0, D, None)
XF = 0.6 if OUT else 0.0
def rel(t): return None if t is None or not (T0 - 0.3 <= t < T1 + XF) else t - T0

# keys='rhodes' (not 'piano') for lofi; music_level low because the voice carries the piece.
# build/drop/outro are chapter-relative: pass rel(absolute_time) for the chapter that contains them, else None.
m = recipes.lofi(duration=T1 - T0 + XF, bpm=84, key='D', mode='minor', keys='rhodes', vinyl=True, music_level=-22)
_sfx = m.sfx
def _clip(snd, at, **kw):                       # place SFX by ABSOLUTE time; drops anything outside this chapter
    r = rel(at)
    if r is not None: _sfx(snd, at=max(0.0, r), **kw)
m.sfx = _clip
def at(word, after, fn, gain, pan=0.0):         # SFX on the first time `word` is spoken after `after`
    t = wt(word, after)
    if t is not None: m.sfx(fn(), at=t, gain=gain, pan=pan)

# for i, s in enumerate(C['scenes'][1:]): m.sfx(sfx.swish(0.22, seed=100 + i), at=s['t'] - 0.08, gain=-17)   # scene changes
# at('broken', S['mirror'], lambda: sfx.impact('thud', size=0.8), -8)                                          # a hit on a word

os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
res = m.export(OUT or os.path.join(HERE, 'out', 'bed.wav'), lufs=-20, tp=-3)
print({k: res[k] for k in ('duration', 'lufs', 'true_peak') if k in res})
