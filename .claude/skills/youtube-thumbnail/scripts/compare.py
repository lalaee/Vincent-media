#!/usr/bin/env python3
"""Check a thumbnail: side by side with the reference, plus the phone-size view, plus size/format.

Usage: compare.py thumb.png out.jpg [--ref ref.jpg] [--zoom x0,y0,x1,y1]
  --ref   puts the real character image next to the thumbnail (same height) for a likeness check
  --zoom  also writes out-zoom.png: that region of the thumbnail at 2x (tears, eyes, arrow joints)
Always pastes the 168x94 phone view into the bottom-right of the sheet. Prints size and fails if not 1280x720 / >2 MB.
"""
import argparse, os, sys
from PIL import Image
ap = argparse.ArgumentParser(); ap.add_argument('thumb'); ap.add_argument('out'); ap.add_argument('--ref'); ap.add_argument('--zoom')
a = ap.parse_args()
t = Image.open(a.thumb).convert('RGB'); kb = os.path.getsize(a.thumb) / 1024
ok = t.size == (1280, 720) and kb < 2048
print(f"{a.thumb}: {t.width}x{t.height}, {kb:.0f} KB -> {'OK' if ok else 'FIX (needs 1280x720, under 2 MB)'}")
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
