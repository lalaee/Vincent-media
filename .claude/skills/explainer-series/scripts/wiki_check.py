#!/usr/bin/env python3
"""Fact-check an episode against its Fandom wiki BEFORE storyboarding: spellings, character designs, claims.

Usage: wiki_check.py <wiki host> <outdir> [--images N] <term> [<term> ...]
  e.g. wiki_check.py avatar.fandom.com factcheck Pavi Nisha Jae Geet Elora "Seven Havens"
For every term (as spelled in our script/labels) it searches the wiki and writes to outdir/report.md:
  - the wiki's page title -> SPELLING flag when it differs from ours (caught too late last time: Elora vs Ellora)
  - the infobox (eyes, hair, nation, residence, age, affiliation...) -> use it for the character's bible traits
  - the infobox image saved as outdir/<Term>.<ext> -> LOOK at it: hair colour/shape, eyes, outfit, accessories
  - with --images N (default 4): up to N more pictures from the page and its "<Title>/Gallery" subpage into
    outdir/<Term>/ -> references for places (skyline, landmarks, colours), creatures, objects and scenes/events
Terms are ANYTHING the episode will draw: characters, places, creatures, vehicles, objects, events/scenes.
Then read report.md + the images, check every claim in the script against the pages, and tell the user what differs.
"""
import json, os, re, sys, urllib.parse, urllib.request
host, out, rest = sys.argv[1], sys.argv[2], sys.argv[3:]
N = 4
if rest[:1] == ['--images']: N, rest = int(rest[1]), rest[2:]
terms = rest
os.makedirs(out, exist_ok=True)
def api(**q):
    url = f"https://{host}/api.php?" + urllib.parse.urlencode({**q, 'format': 'json'})
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'wiki-check/1.0'})))
rep = [f"# Wiki fact-check ({host})\n"]
for term in terms:
    hits = api(action='query', list='search', srsearch=term, srlimit=5)['query']['search']
    if not hits: rep.append(f"## {term}\nNOT FOUND on the wiki: check the spelling or whether it exists in canon.\n"); continue
    title = hits[0]['title']
    flag = '' if title.lower() == term.lower() else f"  **SPELLING?** we wrote '{term}', wiki page is '{title}' (other hits: {', '.join(h['title'] for h in hits[1:4])})"
    text = api(action='parse', page=title, prop='wikitext', redirects=1)['parse']['wikitext']['*']
    m = re.search(r'\{\{[^{}|]*infobox.*?\n\}\}', text, re.S | re.I)
    info = re.sub(r'<ref[^>]*/>|<ref[^>]*>.*?</ref>', '', m.group(0) if m else '', flags=re.S)
    info = '\n'.join(l for l in info.splitlines() if re.match(r'\s*\|\s*\w+\s*=\s*\S', l))
    lead = re.sub(r'\{\{.*?\}\}|<ref.*?(/>|</ref>)|\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', lambda k: k.group(2) or '', text[m.end() if m else 0:], flags=re.S).strip()[:500]
    img = re.search(r'\|\s*image\s*=\s*(?:\[\[File:)?([^|\]\n]+)', info or '', re.I)
    saved = ''
    if img:
        pages = api(action='query', titles='File:' + img.group(1).strip(), prop='imageinfo', iiprop='url')['query']['pages']
        url = next(iter(pages.values())).get('imageinfo', [{}])[0].get('url')
        if url:
            saved = os.path.join(out, re.sub(r'\W', '_', term) + os.path.splitext(img.group(1).strip())[1])
            urllib.request.urlretrieve(url, saved)
    extra = []
    if N:
        names = []
        for pg in (title, title + '/Gallery'):
            try: names += api(action='parse', page=pg, prop='images', redirects=1)['parse']['images']
            except Exception: pass
        skip = re.compile(r'emblem|icon|logo|symbol|flag|seal|signature|\.svg$|\.gif$', re.I)
        names = [n for n in dict.fromkeys(names) if not skip.search(n) and (not img or n.replace(' ', '_') != img.group(1).strip().replace(' ', '_'))][:N]
        if names: os.makedirs(os.path.join(out, re.sub(r'\W', '_', term)), exist_ok=True)
        for n in names:
            pages = api(action='query', titles='File:' + n, prop='imageinfo', iiprop='url')['query']['pages']
            url = next(iter(pages.values())).get('imageinfo', [{}])[0].get('url')
            if url:
                dst = os.path.join(out, re.sub(r'\W', '_', term), re.sub(r'[^\w.-]', '_', n)); urllib.request.urlretrieve(url, dst); extra.append(dst)
    saved += ('\nmore refs: ' + ', '.join(os.path.basename(e) for e in extra)) if extra else ''
    rep.append(f"## {term} -> {title}{flag}\n{('image: ' + saved) if saved else 'no infobox image'}\n```\n{info or '(no infobox)'}\n```\n{lead}\n")
open(os.path.join(out, 'report.md'), 'w').write('\n'.join(rep)); print('\n'.join(rep))
