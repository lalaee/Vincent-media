"""SRT captions from a transcript: one cue per sentence segment, wrapped to 42 chars x 2 lines, no overlaps.
Usage: make_srt.py transcript.json out.srt [video_duration]  (fix misheard words in the JSON first)"""
import json, sys, textwrap
d = json.load(open(sys.argv[1])); end_all = float(sys.argv[3]) if len(sys.argv) > 3 else d['duration']
merged = []
for s in d['segments']:   # re-join a sentence Whisper split across segments
    if merged and not merged[-1]['text'].rstrip().endswith(('.', '?', '!')) and s['start'] - merged[-1]['end'] < 0.3:
        merged[-1] = dict(start=merged[-1]['start'], end=s['end'], text=merged[-1]['text'] + ' ' + s['text'])
    else: merged.append(dict(s))
ts = lambda t: f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round((t % 1) * 1000)):03d}"
out = []
for n, s in enumerate(merged, 1):
    nxt = merged[n]['start'] if n < len(merged) else end_all
    out.append(f"{n}\n{ts(s['start'])} --> {ts(min(s['end'] + 0.3, nxt - 0.05))}\n" + '\n'.join(textwrap.wrap(s['text'], 42)) + '\n')
open(sys.argv[2], 'w').write('\n'.join(out)); print(len(merged), 'cues ->', sys.argv[2])
