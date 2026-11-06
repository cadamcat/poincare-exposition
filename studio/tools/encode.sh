#!/bin/sh
# encode.sh <framesDir> <audio.wav> <out.mp4> [fps]
# H.264 yuv420p CRF 18, AAC 192k, trimmed to the audio length.
set -eu
frames=$1
audio=$2
out=$3
fps=${4:-30}
dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$audio")
mkdir -p "$(dirname "$out")"
ffmpeg -y -loglevel error \
  -framerate "$fps" -start_number 0 -i "$frames/f%05d.png" \
  -i "$audio" \
  -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -pix_fmt yuv420p -crf 18 \
  -c:a aac -b:a 192k \
  -t "$dur" \
  -movflags +faststart \
  "$out"
echo "encoded $out ($dur s)"
