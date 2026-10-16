#!/usr/bin/env python3
"""Cheap review of a rendered narrated video, in two levels.

Level 1 (numbers only, no images to look at):
  specs + loudness, empty-screen stretches, long stretches where nothing new appears,
  cue words never spoken in their scene (explainer-series cues.json + scenes.js),
  on-screen words that look like names but are never spoken (catches YI vs "Jae").
Level 3: one tile per beat (~1 per 2 s), stamped the same way; before publishing.
Level 2 (contact sheets): 2 frames per scene, each stamped with its time, scene id and
  the words being spoken, so "does the picture match the voice?" is a glance per tile.

Usage: review.py video.mp4 transcript.json outdir [--cues cues.json] [--scenes scenes.js|index.html]
                 [--font label.ttf] [--level 1|2|3] [--per 2] [--empty 1.5] [--stale 8]
Then LOOK at outdir/sheet-*.jpg (16 tiles each). Zoom with --stills on anything doubtful.
"""
import argparse, json, re, subprocess, sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument('video'); ap.add_argument('transcript'); ap.add_argument('out')
ap.add_argument('--cues'); ap.add_argument('--scenes'); ap.add_argument('--font')
ap.add_argument('--level', type=int, default=2); ap.add_argument('--per', type=int, default=2)
ap.add_argument('--step', type=float, default=2.0, help='level 3 sampling step (s)')
ap.add_argument('--empty', type=float, default=1.5, help='flag empty screens longer than this (s)')
ap.add_argument('--stale', type=float, default=8, help='flag stretches with nothing new longer than this (s)')
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
report = []
def say(s=''): print(s); report.append(s)
mmss = lambda t: f"{int(t // 60)}:{t % 60:04.1f}"

# ---------- words
tr = json.load(open(a.transcript))
words = [(w['s'], w['w']) for sg in tr['segments'] for w in sg['words']]
def spoken(t0, t1): return ' '.join(w for s, w in words if t0 <= s < t1)
spoken_set = {re.sub(r"[^\w]", '', w).lower() for _, w in words}

# ---------- specs + loudness
pr = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate',
                                '-of', 'json', a.video], capture_output=True, text=True).stdout)
dur = float(pr['format']['duration']); v = next(s for s in pr['streams'] if s['codec_type'] == 'video')
lo = subprocess.run(['ffmpeg', '-nostats', '-i', a.video, '-map', '0:a:0?', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = re.findall(r'I:\s+(-?[\d.]+) LUFS', lo); P = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', lo)
say(f"LEVEL 1  {os.path.basename(a.video)}: {v['width']}x{v['height']} {v['r_frame_rate']} fps, {mmss(dur)}, "
    f"{I[-1] + ' LUFS' if I else 'no audio'}, true peak {P[-1] + ' dBTP' if P else '?'}")
issues = 0

# ---------- empty / stale stretches (4 samples/s at 160x90)
FPS_S, w, h = 4, 160, 90
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.video, '-vf', f'fps={FPS_S},scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                     capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3).astype(np.int16)
content, change = [], [0.0]
for i, f in enumerate(fr):
    q = (f // 16).reshape(-1, 3); vals, cnt = np.unique(q, axis=0, return_counts=True)
    bg = vals[cnt.argmax()] * 16 + 8
    content.append(float((np.abs(f - bg).sum(-1) > 60).mean()))
    if i: change.append(float((np.abs(f - fr[i - 1]).sum(-1) > 90).mean()))
def runs(mask, min_len):
    out, s = [], None
    for i, m in enumerate(list(mask) + [False]):
        if m and s is None: s = i
        if not m and s is not None:
            if (i - s) / FPS_S >= min_len: out.append((s / FPS_S, i / FPS_S))
            s = None
    return out
empty = runs([c < 0.012 for c in content], a.empty)
stale = runs([c < 0.004 for c in change], a.stale)
for t0, t1 in empty:
    issues += 1; say(f"  EMPTY   {mmss(t0)}-{mmss(t1)} ({t1 - t0:.1f}s) almost nothing on screen | voice: {spoken(t0, t1)[:90]}")
for t0, t1 in stale:
    say(f"  STATIC  {mmss(t0)}-{mmss(t1)} ({t1 - t0:.1f}s) nothing new appears (pacing; fine for a held beat)")

# ---------- cue words never spoken in their scene
scenes, cues = None, None
if a.cues:
    cues = json.load(open(a.cues)); scenes = cues.get('scenes')
src = open(a.scenes).read() if a.scenes else ''
if cues and src and isinstance(scenes, list):
    W = cues['words']; st = {s['id']: s['t'] for s in scenes}
    en = {scenes[i]['id']: (scenes[i + 1]['t'] if i + 1 < len(scenes) else dur) for i in range(len(scenes))}
    pos = [(m.start(), m.group(1)) for m in re.finditer(r'\n\s*(\w+)(?:\(\)\s*\{|:\s)', src) if m.group(1) in st]
    for k, (p, sid) in enumerate(pos):
        blk = src[p:pos[k + 1][0] if k + 1 < len(pos) else len(src)]
        for wd in sorted(set(re.findall(r"(?:wt\(|[wW]ord:\s*)['\"]([\w']+)['\"]", blk))):
            if not any(st[sid] - 0.5 <= t < en[sid] for t in W.get(wd.lower(), [])):
                issues += 1; say(f"  NO-CUE  {sid} {mmss(st[sid])}: waits for '{wd}', never spoken there -> beat never appears (fix the name in fixes.json)")

# ---------- on-screen name-like words that are never spoken
if src:
    texts = set(re.findall(r"""(?:hand|label)\(\s*['"`]([^'"`]{1,60})['"`]|(?:text|name|title|kicker):\s*['"`]([^'"`]{1,60})['"`]""", src))
    texts = {x for t in texts for x in t if x and '${' not in x}
    odd = sorted({tok for t in texts for tok in re.findall(r"[A-Za-z][A-Za-z']+", t)
                  if (tok.isupper() or tok[0].isupper()) and len(tok) >= 2
                  and re.sub(r"[^\w]", '', tok).lower().removesuffix("'s") not in spoken_set
                  and re.sub(r"[^\w]", '', tok).lower() not in spoken_set})
    if odd: say(f"  CHECK   on-screen words never spoken (spelling? intended?): {', '.join(odd)}")
say(f"  {issues} issue(s), {len(stale)} static stretch(es)")

def make_sheets(picks, prefix):
    from io import BytesIO
    vert = int(v['height']) > int(v['width'])                       # 9:16 videos get tall tiles, not squashed 16:9 ones
    TW, TH, CAP, COLS, ROWS = (300, 533, 64, 6, 3) if vert else (480, 270, 64, 4, 4)
    try: font = ImageFont.truetype(a.font, 19) if a.font else ImageFont.load_default(size=19)
    except Exception: font = ImageFont.load_default()
    sheets = []
    for n in range(0, len(picks), COLS * ROWS):
        page = picks[n:n + COLS * ROWS]
        S = Image.new('RGB', (COLS * TW, ROWS * (TH + CAP)), 'white'); d = ImageDraw.Draw(S)
        for k, (sid, t) in enumerate(page):
            png = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.2f}', '-i', a.video, '-frames:v', '1', '-vf', f'scale={TW}:{TH}',
                                  '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
            x0, y0 = (k % COLS) * TW, (k // COLS) * (TH + CAP)
            if png: S.paste(Image.open(BytesIO(png)).convert('RGB'), (x0, y0))
            d.rectangle([x0, y0 + TH, x0 + TW - 1, y0 + TH + CAP - 1], fill='#111')
            d.text((x0 + 6, y0 + TH + 4), f"{mmss(t)}  {sid}", font=font, fill='#FFD54A')
            d.text((x0 + 6, y0 + TH + 32), '"' + spoken(t - 2.0, t + 1.0)[-46:] + '"', font=font, fill='white')
        p = os.path.join(a.out, f'{prefix}-{n // (COLS * ROWS) + 1:02d}.jpg'); S.save(p, quality=82); sheets.append(p)
    return sheets

# ---------- level 2: contact sheets
sc = None
if a.level >= 2:
    if isinstance(scenes, list): sc = [(s['id'], s['t'], (scenes[i + 1]['t'] if i + 1 < len(scenes) else dur)) for i, s in enumerate(scenes)]
    else:   # no cues: split on big picture changes
        cuts = [0.0] + [i / FPS_S for i, c in enumerate(change) if c > 0.35] + [dur]
        cuts = [c for i, c in enumerate(cuts) if i == 0 or c - cuts[i - 1] > 2.0]
        sc = [(f's{i + 1}', cuts[i], cuts[i + 1]) for i in range(len(cuts) - 1)]
    picks = []
    for sid, t0, t1 in sc:
        L = t1 - t0
        ts = [t0 + L * 0.35, t1 - min(0.5, L * 0.1)] if a.per >= 2 and L > 2.5 else [t0 + L * 0.6]
        picks += [(sid, t) for t in ts]
    sheets = make_sheets(picks, 'sheet')
    say(f"LEVEL 2  {len(picks)} frames from {len(sc)} scenes -> {len(sheets)} sheets in {a.out} (look at every one)")
# ---------- level 3: a frame every --step s, skipping frames that look the same as the last one kept
if a.level >= 3:
    beats, last = [], None
    for i in range(0, len(fr), max(1, int(a.step * FPS_S))):
        if last is None or (np.abs(fr[i] - fr[last]).sum(-1) > 90).mean() > 0.004: beats.append(i / FPS_S); last = i
    sid_at = lambda t: next((sid for sid, t0, t1 in reversed(sc) if t >= t0), '') if sc else ''
    sheets3 = make_sheets([(sid_at(t), t) for t in beats], 'beat')
    say(f"LEVEL 3  {len(beats)} distinct frames (every {a.step:g}s, repeats skipped) -> {len(sheets3)} sheets in {a.out} (beat-*.jpg; look at every one)")
open(os.path.join(a.out, 'review.txt'), 'w').write('\n'.join(report) + '\n')
sys.exit(1 if issues else 0)
