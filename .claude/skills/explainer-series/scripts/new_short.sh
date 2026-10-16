#!/bin/bash
# Scaffold a vertical (1080x1920) promo short: an episode folder with the canvas turned 9:16 and the caption renderer.
# Usage: new_short.sh <mg dir> <slug> <series.json> [fonts dir]   (then: narration.mp3, transcript, make_captions.py, plan.json, scenes.js)
set -e
K=$(cd "$(dirname "$0")/.." && pwd); bash "$K/scripts/new_episode.sh" "$@" >/dev/null; D="$1/demos/$2"
sed -i 's/width="1920" height="1080"/width="1080" height="1920"/' "$D/index.html"; cp "$K/templates/short_captions.js" "$D/"
echo "short -> $D (1080x1920; scenes.js: wrap each scene with drawCaptions, see examples/avatar-seven-havens/promo-short/)"
