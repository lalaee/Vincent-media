#!/bin/bash
# Render a long music/SFX bed in chapters (one process each, so memory stays bounded), then crossfade them together.
# Long beds in one process run out of memory: mgaudio holds every track and bus as a full-length buffer (~14 GB at 9 min).
# The bed script must accept "<t0> <t1> <out.wav>", size its recipe to (t1 - t0 + 0.6 s), and only place SFX inside
# its window (templates/bed.py does this). Chapter boundaries should sit on scene/section changes.
# Usage: bed_chapters.sh <venv_python> <bed.py> <out.wav> <duration> <b0> <b1> ... <bn>   (b0=0, bn=duration)
set -e
PY=$1; BED=$2; OUT=$3; DUR=$4; shift 4; B=("$@"); XF=0.6
TMP=$(mktemp -d); N=$(( ${#B[@]} - 1 ))
for ((i = 0; i < N; i++)); do
  echo "chapter $((i + 1))/$N: ${B[$i]} - ${B[$((i + 1))]} s"
  "$PY" "$BED" "${B[$i]}" "${B[$((i + 1))]}" "$TMP/c$i.wav" > "$TMP/c$i.log" 2>&1 || { tail -5 "$TMP/c$i.log"; exit 1; }
done
# chain acrossfades: each chapter carries an XF tail, so every join lands exactly on its boundary
IN=""; FC=""; for ((i = 0; i < N; i++)); do IN="$IN -i $TMP/c$i.wav"; done
if (( N == 1 )); then FC="[0:a]atrim=0:$DUR[o]"; else
  prev="[0:a]"; for ((i = 1; i < N; i++)); do FC="$FC${prev}[$i:a]acrossfade=d=$XF:c1=tri:c2=tri[x$i];"; prev="[x$i]"; done
  FC="${FC}${prev}atrim=0:$DUR[o]"; fi
ffmpeg -v error -y $IN -filter_complex "$FC" -map "[o]" -ar 48000 "$OUT"
rm -rf "$TMP"; echo "bed -> $OUT ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT") s)"
