#!/bin/bash
# Render every slide at both sizes: out/instagram-4x5/01.png.., out/tiktok-9x16/01.png.., plus a contact sheet per size.
# Usage: render_carousel.sh <repo root with r.sh> <slug>    (look at both sheets before publishing)
set -e
ROOT=$(cd "$1" && pwd); SLUG=$2; D="$ROOT/mg/demos/$SLUG"; N=$(python3 -c "import json;print(len(json.load(open('$D/cues.json'))['scenes']))")
T=$(python3 -c "print(','.join('%.1f'%(i+0.9) for i in range($N)))")
for pair in "c45:instagram-4x5" "c916:tiktok-9x16"; do IFS=: read page dir <<< "$pair"
  (cd "$ROOT" && ./r.sh "demos/$SLUG" --page "$page.html" --stills "$T" | grep -i error || true)
  mkdir -p "$D/out/$dir"; rm -f "$D/out/$dir"/*.png
  for i in $(seq 0 $((N - 1))); do mv "$D/out/stills/t$(printf %02d $i).90.png" "$D/out/$dir/$(printf %02d $((i + 1))).png"; done
  ins=""; for f in "$D/out/$dir"/*.png; do ins="$ins -i $f"; done; cols=$(( N < 5 ? N : 5 ))
  ffmpeg -v error -y $ins -filter_complex "xstack=inputs=$N:grid=${cols}x$(( (N + cols - 1) / cols )):fill=white,scale=2000:-1" "$D/out/sheet-$dir.jpg" 2>/dev/null \
    || ffmpeg -v error -y $ins -filter_complex "hstack=inputs=$N,scale=4000:-1" "$D/out/sheet-$dir.jpg"
done
echo "slides -> $D/out/instagram-4x5, $D/out/tiktok-9x16; sheets -> $D/out/sheet-*.jpg"
