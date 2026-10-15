#!/bin/bash
# Re-render only some time ranges of a finished video and splice them in; audio is copied untouched.
# Usage: patch.sh <mg_dir> <demo_rel> <video.mp4> <range> [range ...]
#   range = "3:40-3:52" or "220-232.5" (mm:ss or seconds). Batch every fix into one call: one splice, one encode.
#   Edit scenes.js / plan.json (+ build_cues.py) first and check a still at the bad time:
#     ./r.sh demos/<slug> --stills <t>
#   The previous master is kept as <video>.prev.mp4.
# Env: PAD=0.5 extra seconds each side (default 0), CRF=14, PRESET=slow, KEEP=1 keep patch mkvs.
set -euo pipefail
[ $# -ge 4 ] || { sed -n 2,9p "$0"; exit 1; }
MG=$(cd "$1" && pwd); DEMO=$2; VIDEO=$(realpath "$3"); shift 3
PAD=${PAD:-0}; CRF=${CRF:-14}; PRESET=${PRESET:-slow}
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$VIDEO" | python3 -c "import sys;a,b=sys.stdin.read().strip().split('/');print(round(int(a)/int(b)))")
TOTAL=$(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 "$VIDEO")

# ranges -> sorted, merged frame ranges "f0 f1" (f1 exclusive)
RANGES=$(python3 - "$FPS" "$TOTAL" "$PAD" "$@" <<'PY'
import sys
fps, total, pad = int(sys.argv[1]), int(sys.argv[2]), float(sys.argv[3])
def sec(s):
    p = s.split(':'); v = 0.0
    for x in p: v = v * 60 + float(x)
    return v
rs = []
for r in sys.argv[4:]:
    a, b = r.split('-')
    f0, f1 = max(0, round((sec(a) - pad) * fps)), min(total, round((sec(b) + pad) * fps))
    if f1 <= f0: sys.exit(f'bad range {r}')
    rs.append([f0, f1])
rs.sort(); m = []
for r in rs:
    if m and r[0] <= m[-1][1]: m[-1][1] = max(m[-1][1], r[1])
    else: m.append(r)
for f0, f1 in m: print(f0, f1)
PY
)
echo "video: $TOTAL frames @${FPS}fps; patching frames:"; echo "$RANGES"

TMP=$(mktemp -d /tmp/patch-XXXX); i=0; INPUTS=()
export MG_GPU_ARGS="${MG_GPU_ARGS:---no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader}"
export MG_CHROME="${MG_CHROME:-$(ls -d /opt/pw-browsers/chromium-*/chrome-linux*/chrome 2>/dev/null | head -1)}"
while read -r f0 f1; do
  from=$(python3 -c "print($f0/$FPS)"); to=$(python3 -c "print($f1/$FPS)")
  echo "render $f0-$f1 ($from s - $to s)"
  (cd "$MG" && node harness/render.mjs "$DEMO" --from "$from" --to "$to" --mkv "$TMP/p$i.mkv" --noaudio 2>&1 | grep -E "^render|done|rror" || true)
  n=$(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 "$TMP/p$i.mkv")
  [ "$n" -eq $((f1 - f0)) ] || { echo "patch $i has $n frames, expected $((f1 - f0))"; exit 1; }
  INPUTS+=(-i "$TMP/p$i.mkv"); i=$((i + 1))
done <<< "$RANGES"

# filter: original split into the kept stretches, interleaved with the patches
FILTER=$(python3 - "$TOTAL" "$RANGES" <<'PY'
import sys
total = int(sys.argv[1]); rs = [tuple(map(int, l.split())) for l in sys.argv[2].strip().splitlines()]
keep, prev = [], 0
for f0, f1 in rs: keep.append((prev, f0)); prev = f1
keep.append((prev, total))
keep = [(a, b) for a, b in keep]
parts, segs = [], []
ks = [k for k in keep if k[1] > k[0]]
parts.append(f"[0:v]split={len(ks)}" + ''.join(f"[s{j}]" for j in range(len(ks))))
j = 0
for idx, (a, b) in enumerate(keep):
    if b > a:
        parts.append(f"[s{j}]trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS[k{idx}]"); segs.append(f"[k{idx}]"); j += 1
    if idx < len(rs):
        parts.append(f"[{idx + 1}:v]setpts=PTS-STARTPTS,format=yuv420p[p{idx}]"); segs.append(f"[p{idx}]")
parts.append(''.join(segs) + f"concat=n={len(segs)}:v=1:a=0,format=yuv420p[v]")
print(';'.join(parts))
PY
)

OUT="${VIDEO%.mp4}.patched.mp4"
echo "splice + encode -> $OUT"
ffmpeg -y -v error -stats -i "$VIDEO" "${INPUTS[@]}" -filter_complex "$FILTER" -map "[v]" -map 0:a? \
  -c:v libx264 -preset "$PRESET" -crf "$CRF" -profile:v high -r "$FPS" -c:a copy -movflags +faststart "$OUT"
n=$(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 "$OUT")
[ "$n" -eq "$TOTAL" ] || { echo "patched video has $n frames, expected $TOTAL; original left untouched"; exit 1; }
mv "$VIDEO" "${VIDEO%.mp4}.prev.mp4"; mv "$OUT" "$VIDEO"
[ "${KEEP:-0}" = 1 ] || rm -rf "$TMP"
echo "done: $VIDEO ($n frames); previous master: ${VIDEO%.mp4}.prev.mp4"
