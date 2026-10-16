#!/usr/bin/env bash
# Start a thumbnail project: a 1280x720 page in the mg harness that renders one still (scene "d" at t=0.5).
# Usage: new_thumb.sh <mg dir> <slug> <episode dir (has engine.js, patterns.js, series.json, fonts/)>
# Then: write portrait.js (from templates/portrait_template.js) and render with  r.sh demos/<slug> --stills 0.5
set -euo pipefail
MG=$1; SLUG=$2; EP=$3; K=$(cd "$(dirname "$0")/.." && pwd); D=$MG/demos/$SLUG
mkdir -p "$D"; cp "$EP"/engine.js "$EP"/patterns.js "$EP"/series.json "$D"/; cp -r "$EP"/fonts "$D"/
cp "$EP"/index.html "$D"/index.html 2>/dev/null || cp "$K"/templates/index.html "$D"/index.html
sed -i 's/width="[0-9]*" height="[0-9]*"/width="1280" height="720"/' "$D"/index.html
echo '{"fps": 30, "duration": 1.0, "scenes": [{"id": "d", "t": 0.0}], "sections": {}, "sfx": [], "chapters": [0], "words": {}}' > "$D"/cues.json
cp "$K"/templates/scenes_template.js "$D"/scenes.js; cp "$K"/templates/portrait_template.js "$D"/portrait.js
echo "made $D  (edit portrait.js + the caption in scenes.js, then: r.sh demos/$SLUG --stills 0.5 -> out/stills/t00.50.png)"
# Vertical covers (TikTok 9:16, Instagram 4:5) from the same portrait: pages tt.html / ig.html -> scenes_social.js
cp "$K"/templates/scenes_social_template.js "$D"/scenes_social.js
for f in tt:1080:1920 ig:1080:1350; do IFS=: read n w h <<<"$f"
  sed "s/width=\"1280\" height=\"720\"/width=\"$w\" height=\"$h\"/; s#./scenes.js#./scenes_social.js#" "$D"/index.html > "$D"/$n.html; done
echo "covers: r.sh demos/$SLUG --page tt.html --stills 0.5   and   --page ig.html --stills 0.5"
