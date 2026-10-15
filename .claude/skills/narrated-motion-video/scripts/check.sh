#!/bin/bash
# Verify a render: specs, loudness, stop-motion stepping, and frames either side of key word times.
# Usage: check.sh <video.mp4> <out_sheet.jpg> <t1> [t2 ...]   (times in seconds, e.g. the words that trigger hits)
V=$1; SHEET=$2; shift 2
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,nb_frames -of compact "$V"
ffmpeg -nostats -i "$V" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)"
FPS=$(ffprobe -v error -select_streams v -show_entries stream=r_frame_rate -of csv=p=0 "$V" | python3 -c "import sys; a,b=sys.stdin.read().split('/'); print(round(int(a)/int(b)))")
SEL=""; for t in "$@"; do f=$(python3 -c "print(int(round($t*$FPS)))"); SEL="$SEL+eq(n\,$((f-2)))+eq(n\,$((f+3)))"; done
W=$(ffprobe -v error -select_streams v -show_entries stream=width -of csv=p=0 "$V"); TW=$(( W > 1500 ? 480 : 270 ))
ffmpeg -v error -y -i "$V" -vf "select='${SEL#+}',scale=$TW:-1,tile=$(( $# * 2 ))x1" -frames:v 1 "$SHEET" && echo "sync sheet (before/after each time) -> $SHEET"
F0=$(python3 -c "print(max(0,int(round($1*$FPS))-4))")
ffmpeg -v error -i "$V" -vf "select='between(n\,$F0\,$((F0+11)))',scale=320:-1" -vsync 0 -f rawvideo -pix_fmt gray - | python3 -c "
import sys; d=sys.stdin.buffer.read(); n=len(d)//12; f=[d[i*n:(i+1)*n] for i in range(12)]
print('pixels changed frame-to-frame around the first time (zeros = held drawings):', [sum(abs(a-b)>10 for a,b in zip(f[i],f[i+1])) for i in range(11)])"
