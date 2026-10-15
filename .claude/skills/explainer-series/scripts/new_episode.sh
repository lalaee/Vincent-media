#!/bin/bash
# Scaffold an episode folder inside the mg-styles-15 toolkit: engine, patterns, page, bed, series bible and fonts.
# Usage: new_episode.sh <mg dir> <slug> <series.json> [fonts dir]   -> <mg>/demos/<slug>/
set -e
MG=$1; SLUG=$2; SERIES=$3; FONTS=${4:-$(dirname "$SERIES")/fonts}; K=$(cd "$(dirname "$0")/.." && pwd)
D="$MG/demos/$SLUG"; mkdir -p "$D/fonts" "$D/out"
cp "$K/templates/engine.js" "$K/templates/patterns.js" "$K/templates/episode.html" "$K/templates/episode_bed.py" "$D/"
mv "$D/episode.html" "$D/index.html"; cp "$SERIES" "$D/series.json"
[ -d "$FONTS" ] && cp "$FONTS"/* "$D/fonts/" || echo "note: no fonts dir at $FONTS; download the series fonts into $D/fonts/"
[ -f "$D/scenes.js" ] || cp "$K/templates/scenes_starter.js" "$D/scenes.js"
echo "episode -> $D  (next: narration.mp3, transcript, plan.json -> cues.json, scenes.js)"
