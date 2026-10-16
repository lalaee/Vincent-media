#!/bin/bash
# Scaffold a carousel project next to the episode: engine, patterns, series, fonts, two page sizes, one scene per slide.
# Usage: new_carousel.sh <mg dir> <slug> <series.json> <fonts dir> <slides>   -> <mg>/demos/<slug>/ (scenes.js = starter)
set -e
MG=$1; SLUG=$2; SERIES=$3; FONTS=$4; N=${5:-10}; K=$(cd "$(dirname "$0")/.." && pwd); D="$MG/demos/$SLUG"
mkdir -p "$D/fonts" "$D/out"; cp "$K/templates/engine.js" "$K/templates/patterns.js" "$D/"; cp "$SERIES" "$D/series.json"; cp "$FONTS"/* "$D/fonts/"
for p in "c45:1080:1350" "c916:1080:1920"; do IFS=: read n w h <<< "$p"; sed "s/width=\"1920\" height=\"1080\"/width=\"$w\" height=\"$h\"/" "$K/templates/episode.html" > "$D/$n.html"; done
python3 -c "import json,sys; n=int(sys.argv[2]); json.dump({'fps':30,'duration':float(n),'scenes':[{'id':'s%d'%(i+1),'t':float(i)} for i in range(n)],'sections':{},'sfx':[],'chapters':[0,n],'words':{}},open(sys.argv[1],'w'))" "$D/cues.json" "$N"
[ -f "$D/scenes.js" ] || cp "$K/templates/carousel_starter.js" "$D/scenes.js"
echo "carousel -> $D ($N slides; edit scenes.js: s1..s$N, set N=$N)"
