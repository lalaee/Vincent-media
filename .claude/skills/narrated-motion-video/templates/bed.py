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

# The repo ships only the instrument samples its own 15 films use. Sets like piano, kalimba and harp are incomplete
# and raise "LibsndfileError ... System error". Report them as unavailable so the recipes use their synth fallbacks.
_avail = samples.available
samples.available = lambda key=None: False if key in ('piano', 'kalimba', 'harp') else _avail(key)

HERE = os.path.dirname(os.path.abspath(__file__))
C = json.load(open(os.path.join(HERE, 'cues.json'))); w = C['w']; D = C['duration']
S = {s['id']: s['t'] for s in C['scenes']}

# keys='rhodes' (not 'piano') for lofi; music_level low because the voice carries the piece
m = recipes.lofi(duration=D, bpm=84, key='D', mode='minor', keys='rhodes', vinyl=True, music_level=-22)

# for i, s in enumerate(C['scenes'][1:]): m.sfx(sfx.paper('flip', dur=0.35, seed=100 + i), at=s['t'] - 0.05, gain=-12)   # scene changes
# m.sfx(sfx.sticker_slap(seed=1), at=w['someword'], gain=-8)                                                           # a hit on a word

os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
res = m.export(os.path.join(HERE, 'out', 'bed.wav'), lufs=-20, tp=-3)
print({k: res[k] for k in ('duration', 'lufs', 'true_peak') if k in res})
