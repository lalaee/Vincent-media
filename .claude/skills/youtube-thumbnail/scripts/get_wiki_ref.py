#!/usr/bin/env python3
"""Fetch a character's real design from a Fandom (MediaWiki) wiki: infobox facts + the images on the page.

Usage: get_wiki_ref.py <wiki host> <page title> <outdir> [--max 6]
  e.g. get_wiki_ref.py avatar.fandom.com Pavi ref-pavi
Writes outdir/infobox.txt (the {{Infobox ...}} block: eyes, hair, age, nationality...) and downloads up to --max
images (the infobox image first). Then LOOK at them before drawing: the portrait must match these, not memory.
"""
import argparse, json, os, re, urllib.parse, urllib.request
ap = argparse.ArgumentParser(); ap.add_argument('host'); ap.add_argument('page'); ap.add_argument('out'); ap.add_argument('--max', type=int, default=6)
a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
api = lambda **q: json.load(urllib.request.urlopen(urllib.request.Request(f"https://{a.host}/api.php?" + urllib.parse.urlencode({**q, 'format': 'json'}), headers={'User-Agent': 'thumb-ref/1.0'})))
wt = api(action='parse', page=a.page, prop='wikitext|images')['parse']
text = wt['wikitext']['*']
m = re.search(r'\{\{[^{}|]*infobox.*?\n\}\}', text, re.S | re.I)          # {{Infobox ..}} or {{Character infobox ..}}
info = m.group(0) if m else text[:3000]
open(os.path.join(a.out, 'infobox.txt'), 'w').write(info + '\n'); print(info)
first = re.findall(r'\|\s*image\s*=\s*(?:\[\[File:)?([^|\]\n]+)', info, re.I)
files = [f.strip() for f in first] + [f for f in wt['images'] if f not in first]
files = [f for f in files if re.search(r'\.(png|jpe?g|webp)$', f, re.I) and not re.search(r'emblem|icon|logo|symbol|flag', f, re.I)][:a.max]
for f in files:
    pages = api(action='query', titles='File:' + f, prop='imageinfo', iiprop='url')['query']['pages']
    url = next(iter(pages.values())).get('imageinfo', [{}])[0].get('url')
    if not url: continue
    dst = os.path.join(a.out, re.sub(r'[^\w.-]', '_', f))
    urllib.request.urlretrieve(url, dst); print('saved', dst)
