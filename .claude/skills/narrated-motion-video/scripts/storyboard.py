"""Captioned storyboard sheet from rendered stills.
panels.tsv lines:  <still.png> <TAB> <title e.g. "3 · 7.58 s on 'code'"> <TAB> <narration line> <TAB> <visual note>
Usage: storyboard.py panels.tsv out.png [cols=3] [font.ttf]   (works for 16:9 and 9:16 stills)"""
import sys
from PIL import Image, ImageDraw, ImageFont
rows = [l.rstrip('\n').split('\t') for l in open(sys.argv[1]) if l.strip()]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
font = lambda s: ImageFont.truetype(sys.argv[4], s) if len(sys.argv) > 4 else ImageFont.load_default(s)
first = Image.open(rows[0][0]); pw = 600 if first.width >= first.height else 340
ph = round(first.height * pw / first.width); cap = 120; gap = 10
sheet = Image.new('RGB', (cols * (pw + gap) + gap, ((len(rows) + cols - 1) // cols) * (ph + cap + gap) + gap), (20, 18, 16))
for i, r in enumerate(rows):
    im = Image.open(r[0]).convert('RGB').resize((pw, ph)); x = gap + (i % cols) * (pw + gap); y = gap + (i // cols) * (ph + cap + gap)
    sheet.paste(im, (x, y)); d = ImageDraw.Draw(sheet); d.rectangle([x, y + ph, x + pw, y + ph + cap], fill=(231, 223, 202))
    for j, (txt, size, col) in enumerate([(r[1], 22, (215, 38, 30)), (r[2] if len(r) > 2 else '', 17, (20, 18, 16)), (r[3] if len(r) > 3 else '', 16, (90, 82, 67))]):
        d.text((x + 10, y + ph + 8 + j * 36), txt[:70], font=font(size), fill=col)
sheet.save(sys.argv[2]); print(len(rows), 'panels ->', sys.argv[2])
