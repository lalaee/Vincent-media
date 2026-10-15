"""Print every word with its start time (to pick the words visuals should hit). Low-confidence words (p<0.8) are flagged.
Usage: words.py transcript.json [filter-substring...]"""
import json, sys
d = json.load(open(sys.argv[1])); f = [a.lower() for a in sys.argv[2:]]
for s in d['segments']:
    for w in s['words']:
        if not f or any(x in w['w'].lower() for x in f):
            print(f"{w['s']:7.2f}  {w['w']:<18}{'  <- check' if w['p'] < 0.8 else ''}")
