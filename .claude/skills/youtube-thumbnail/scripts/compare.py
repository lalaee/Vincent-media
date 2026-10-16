#!/usr/bin/env python3
"""Check a thumbnail: side by side with the reference, plus the phone-size view, plus size/format.

Usage: compare.py thumb.png out.jpg [--ref ref.jpg] [--zoom x0,y0,x1,y1] [--format youtube|tiktok|instagram]
  --format tiktok     1080x1920: draws the safe zones (red = 3:4 profile-grid crop y 240-1680, blue = bottom 320 px
                      caption/UI and right 150 px buttons) and adds the grid crop next to it; face + caption must sit inside
  --format instagram  1080x1350 (4:5 feed post; the profile grid shows the centre 3:4 = 1012x1350)
  --ref   puts the real character image next to the thumbnail (same height) for a likeness check
  --zoom  also writes out-zoom.png: that region of the thumbnail at 2x (tears, eyes, arrow joints)
Always pastes the 168x94 phone view into the bottom-right of the sheet. Prints size and fails if not 1280x720 / >2 MB.
"""
import argparse, os, sys
from PIL import Image
ap = argparse.ArgumentParser(); ap.add_argument('thumb'); ap.add_argument('out'); ap.add_argument('--ref'); ap.add_argument('--zoom'); ap.add_argument('--format', default='youtube', choices=['youtube', 'tiktok', 'instagram'])
a = ap.parse_args()
t = Image.open(a.thumb).convert('RGB'); kb = os.path.getsize(a.thumb) / 1024
want = {'youtube': (1280, 720), 'tiktok': (1080, 1920), 'instagram': (1080, 1350)}[a.format]
ok = t.size == want and kb < (2048 if a.format == 'youtube' else 8192)
print(f"{a.thumb}: {t.width}x{t.height}, {kb:.0f} KB -> {'OK' if ok else f'FIX (needs {want[0]}x{want[1]}' + (', under 2 MB)' if a.format == 'youtube' else ')')}")
if a.format != 'youtube':
    from PIL import ImageDraw
    o = t.copy(); d = ImageDraw.Draw(o)
    if a.format == 'tiktok':
        grid = (0, 240, 1080, 1680); d.rectangle([0, 240, 1079, 1680], outline='red', width=6)
        d.rectangle([0, 1600, 1079, 1919], outline='blue', width=6); d.rectangle([930, 0, 1079, 1919], outline='blue', width=6)
    else:
        grid = (34, 0, 1046, 1350); d.rectangle([34, 0, 1046, 1349], outline='red', width=6)
    g = t.crop(grid); g = g.resize((int(g.width * t.height / g.height), t.height))
    sheet = Image.new('RGB', (o.width + g.width + 40, t.height), '#888'); sheet.paste(o, (0, 0)); sheet.paste(g, (o.width + 40, 0))
    sheet.paste(t.resize((t.width // 6, t.height // 6)), (o.width + 60, t.height - t.height // 6 - 20))
    sheet.save(a.out, quality=88); print('sheet', a.out, '(red = grid crop, blue = app UI; small copy = phone feed size)'); sys.exit(0 if ok else 1)
sheet = t.copy()
if a.ref:
    r = Image.open(a.ref).convert('RGB'); r = r.resize((int(r.width * t.height / r.height), t.height))
    sheet = Image.new('RGB', (t.width + r.width, t.height), 'white'); sheet.paste(t, (0, 0)); sheet.paste(r, (t.width, 0))
small = t.resize((168, 94)); sheet.paste(small, (t.width - 180, t.height - 106))
sheet.save(a.out, quality=88); print('sheet', a.out)
if a.zoom:
    x0, y0, x1, y1 = map(int, a.zoom.split(','))
    z = os.path.splitext(a.out)[0] + '-zoom.png'; t.crop((x0, y0, x1, y1)).resize(((x1 - x0) * 2, (y1 - y0) * 2)).save(z); print('zoom', z)
sys.exit(0 if ok else 1)
