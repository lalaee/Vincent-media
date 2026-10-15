"""Fetch the main image of wiki pages (any MediaWiki/Fandom wiki) or search Wikimedia Commons for free-licensed photos.
Writes images plus meta.json (source URL, page, size, licence when known) for credits.

  fetch_images.py wiki <api_url> <out_dir> key="Page Title" [key="Page Title" ...]
      e.g. fetch_images.py wiki https://dc.fandom.com/api.php hd joker="Joker (Prime Earth)"
      Fandom wikis serve full-res originals (often 1000-2300 px textless covers). Prefer them over Wikipedia.
  fetch_images.py wikipedia <out_dir> key="Article" ...
      en.wikipedia.org/w/api.php is often rate-limited (429) from cloud IPs; this uses api.wikimedia.org to read the
      infobox image name and the upload.wikimedia.org md5 path to download it. These are small fair-use thumbnails.
  fetch_images.py commons <out_dir> "search terms" [limit]
      Free-licensed photos (CC0/CC BY/CC BY-SA) with author + licence recorded for attribution.
"""
import hashlib, json, os, re, sys, time, urllib.parse, urllib.request
UA = {'User-Agent': 'NarratedMotionVideo/1.0 (personal project)'}
def get(url, tries=6):
    for a in range(tries):
        try: return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90).read()
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503) or a == tries - 1: raise
            time.sleep(10 * (a + 1))
def save_meta(out, add):
    p = os.path.join(out, 'meta.json'); m = json.load(open(p)) if os.path.exists(p) else {}; m.update(add); json.dump(m, open(p, 'w'), indent=1)
mode = sys.argv[1]
if mode == 'wiki':
    api, out, pairs = sys.argv[2], sys.argv[3], dict(a.split('=', 1) for a in sys.argv[4:]); os.makedirs(out, exist_ok=True)
    q = dict(action='query', titles='|'.join(pairs.values()), prop='pageimages', piprop='original', redirects=1, format='json')
    d = json.loads(get(api + '?' + urllib.parse.urlencode(q)))['query']
    alias = {r['from']: r['to'] for r in d.get('normalized', []) + d.get('redirects', [])}
    pages = {p['title']: p for p in d['pages'].values()}; meta = {}
    for k, t in pairs.items():
        tt = alias.get(alias.get(t, t), alias.get(t, t)); o = pages.get(tt, {}).get('original')
        if not o: print(k, 'NO IMAGE for', tt); continue
        ext = o['source'].split('/revision')[0].rsplit('.', 1)[-1].lower(); f = os.path.join(out, f'{k}.{ext}')
        open(f, 'wb').write(get(o['source'])); meta[k] = dict(file=f, src=o['source'], w=o['width'], h=o['height'], page=tt)
        print(f"{k:12} {o['width']}x{o['height']}  {tt}"); time.sleep(0.5)
    save_meta(out, meta)
elif mode == 'wikipedia':
    out, pairs = sys.argv[2], dict(a.split('=', 1) for a in sys.argv[3:]); os.makedirs(out, exist_ok=True); meta = {}
    for k, t in pairs.items():
        d = json.loads(get('https://api.wikimedia.org/core/v1/wikipedia/en/page/' + urllib.parse.quote(t.replace(' ', '_'))))
        m = re.search(r'\|\s*image\s*=\s*(?:\[\[)?(?:File:|Image:)?([^|\]\n]+\.(?:jpe?g|png|webp|gif))', d.get('source', ''), re.I)
        if not m: print(k, 'no infobox image'); continue
        name = m.group(1).strip().replace(' ', '_'); h = hashlib.md5(name.encode()).hexdigest()
        for base in ('en', 'commons'):
            url = f'https://upload.wikimedia.org/wikipedia/{base}/{h[0]}/{h[:2]}/{urllib.parse.quote(name)}'
            try: data = get(url, 2); break
            except Exception: data = None
        if not data: print(k, 'download failed', name); continue
        f = os.path.join(out, f"{k}.{name.rsplit('.', 1)[-1].lower()}"); open(f, 'wb').write(data)
        meta[k] = dict(file=f, src=url, page='https://en.wikipedia.org/wiki/' + d['key']); print(k, name); time.sleep(3)
    save_meta(out, meta)
elif mode == 'commons':
    out, term, lim = sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else '8'; os.makedirs(out, exist_ok=True)
    q = dict(action='query', generator='search', gsrsearch=term + ' filetype:bitmap', gsrnamespace='6', gsrlimit=lim, prop='imageinfo',
             iiprop='url|size|extmetadata', iiextmetadatafilter='LicenseShortName|Artist', iiurlwidth='1200', format='json')
    pages = (json.loads(get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(q))).get('query', {}) or {}).get('pages', {})
    meta = {}
    for i, p in enumerate(pages.values()):
        ii = p['imageinfo'][0]; m = ii.get('extmetadata', {}); key = re.sub(r'\W+', '_', term)[:20] + f'_{i}'
        f = os.path.join(out, key + '.jpg'); open(f, 'wb').write(get(ii['thumburl'])); time.sleep(1)
        meta[key] = dict(file=f, title=p['title'], page=ii['descriptionurl'], licence=m.get('LicenseShortName', {}).get('value', '?'),
                         author=re.sub('<[^>]+>', '', m.get('Artist', {}).get('value', ''))[:80])
        print(f"{key:24} {meta[key]['licence']:12} {p['title'][5:70]}")
    save_meta(out, meta)
