#!/bin/bash
# The episode's music with no voice and no SFX, for posts: full length + a short clip, mastered and limited (peaks < -1 dBTP).
# Usage: social_bed.sh <episode dir> <venv python> <out dir> [clip_start_s=title card] [clip_len_s=60]
set -e
EP=$(cd "$1" && pwd); PY=$2; OUT=$3; N=$(cd "$(dirname "$0")/../../narrated-motion-video/scripts" && pwd); mkdir -p "$OUT"
DUR=$(python3 -c "import json;print(json.load(open('$EP/cues.json'))['duration'])"); CH=$(python3 -c "import json;print(' '.join(str(c) for c in json.load(open('$EP/cues.json'))['chapters']))")
START=${4:-$(python3 -c "import json;c=json.load(open('$EP/cues.json'));print(next((s['t'] for s in c['scenes'] if s['id']=='title'),0))")}; LEN=${5:-60}
[ -d "$EP/../../lib/audio" ] && export PYTHONPATH="$(cd "$EP/../../lib/audio" && pwd):$PYTHONPATH"
(cd "$EP" && MUSIC_ONLY=1 bash "$N/bed_chapters.sh" "$PY" episode_bed.py out/music_only.wav "$DUR" $CH | tail -1)
LIM="loudnorm=I=-15:TP=-2:LRA=11,aresample=192000,alimiter=limit=0.70:attack=1:release=50:level=false,aresample=48000"
SLUG=$(basename "$EP")
ffmpeg -v error -y -i "$EP/out/music_only.wav" -af "$LIM" -c:a aac -b:a 256k "$OUT/$SLUG-music-full.m4a"
ffmpeg -v error -y -ss "$START" -t "$LEN" -i "$EP/out/music_only.wav" -af "afade=t=in:d=1,afade=t=out:st=$(python3 -c "print($LEN-3)"):d=3,$LIM" -c:a aac -b:a 256k "$OUT/$SLUG-music-${LEN}s.m4a"
for f in "$OUT/$SLUG-music-"*.m4a; do echo "$(basename "$f"): $(ffmpeg -nostats -i "$f" -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+(I:|Peak:)' | tr -s ' ' | tr '\n' ' ')"; done
