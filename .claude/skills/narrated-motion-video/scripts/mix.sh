#!/bin/bash
# Narration over a music/SFX bed: light voice cleanup, sidechain ducking of the bed under the voice,
# two-pass loudnorm to -14 LUFS, then a 4x-oversampled limiter so true peak stays under -1 dBTP (loudnorm falls back
# to dynamic mode when a linear gain would clip, and can let peaks through). Bed should be ~-20 LUFS.
# Usage: mix.sh <narration> <bed.wav> <out.wav> <duration_s>
set -e
VOICE=$1; BED=$2; OUT=$3; DUR=$4; TMP=$(mktemp --suffix .wav)
FC="[0:a]aresample=48000,aformat=channel_layouts=stereo,highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=3dB,apad=whole_dur=$DUR,asplit=2[v][sc];\
[1:a]aresample=48000,aformat=channel_layouts=stereo[bed];[bed][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400:makeup=1[d];\
[v][d]amix=inputs=2:duration=longest:normalize=0,atrim=0:$DUR"
ffmpeg -v error -y -i "$VOICE" -i "$BED" -filter_complex "$FC" -ar 48000 "$TMP"
M=$(ffmpeg -nostats -i "$TMP" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
g(){ echo "$M" | python3 -c "import sys,json; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$TMP" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=192000,alimiter=limit=0.82:attack=1:release=50:level=false,aresample=48000" -ar 48000 "$OUT"
rm -f "$TMP"; ffmpeg -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)"
