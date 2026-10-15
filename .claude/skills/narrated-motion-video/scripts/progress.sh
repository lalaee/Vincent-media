#!/bin/bash
# Frames written so far by each running render (the r.sh log is buffered until the job ends).
for f in $(ls -t /tmp/render-*/seg00.mkv 2>/dev/null); do
  n=$(ffprobe -v error -count_packets -select_streams v -show_entries stream=nb_read_packets -of csv=p=0 "$f" 2>/dev/null)
  echo "$f  frames=$n"; done
pgrep -fa "harness/render.mjs" | cut -c1-140
