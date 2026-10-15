"""Preview crop boxes before building assets. boxes.json: {"name": ["source_key", x0, y0, x1, y1]} as 0-1 fractions.
Usage: crops.py <img_dir> <boxes.json> <sheet.jpg>   (look at the sheet, adjust fractions, repeat)
Also: crops.py --grid <image> <out.jpg>  overlays a 10x10 grid to estimate fractions."""
import glob, json, os, sys
from PIL import Image, ImageDraw
if sys.argv[1] == '--grid':
    im = Image.open(sys.argv[2]).convert('RGB'); d = ImageDraw.Draw(im)
    for i in range(1, 10):
        d.line([(im.width * i / 10, 0), (im.width * i / 10, im.height)], fill=(255, 0, 0), width=2)
        d.line([(0, im.height * i / 10), (im.width, im.height * i / 10)], fill=(255, 0, 0), width=2)
    im.thumbnail((900, 900)); im.save(sys.argv[3]); sys.exit()
src, boxes = sys.argv[1], json.load(open(sys.argv[2])); tiles = []
for name, (key, a, b, c, d) in boxes.items():
    im = Image.open(glob.glob(os.path.join(src, key + '.*'))[0]).convert('RGB'); W, H = im.size
    t = im.crop((int(a * W), int(b * H), int(c * W), int(d * H))); t.thumbnail((300, 300))
    tile = Image.new('RGB', (310, 330), 'white'); tile.paste(t, (5, 5)); ImageDraw.Draw(tile).text((6, 312), name, fill='black'); tiles.append(tile)
cols = 6; sheet = Image.new('RGB', (310 * cols, 330 * ((len(tiles) + cols - 1) // cols)), 'white')
for i, t in enumerate(tiles): sheet.paste(t, ((i % cols) * 310, (i // cols) * 330))
sheet.save(sys.argv[3], quality=85); print(len(tiles), 'crops ->', sys.argv[3])
