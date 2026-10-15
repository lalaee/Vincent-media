#!/bin/bash
# Two-pass H.264 copy under the 30 MB chat limit (for previews; upload the master to YouTube).
# Usage: share_copy.sh <in.mp4> <out.mp4> [target_MB=26]
IN=$1; OUT=$2; MB=${3:-26}
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
VK=$(python3 -c "print(int(($MB*8*1024)/$DUR - 170))")
ffmpeg -v error -y -i "$IN" -c:v libx264 -preset slow -b:v ${VK}k -pass 1 -an -f null /dev/null
ffmpeg -v error -y -i "$IN" -c:v libx264 -preset slow -b:v ${VK}k -pass 2 -c:a aac -b:a 160k -movflags +faststart "$OUT"
rm -f ffmpeg2pass-0.log*; ls -la "$OUT"
