#!/bin/sh
# concat.sh <out.mp4> <chapter.mp4> ...
set -eu
out=$1
shift
if [ "$#" -eq 0 ]; then
  echo "usage: tools/concat.sh <out.mp4> <a.mp4> [b.mp4 ...]" >&2
  exit 2
fi
if [ "$#" -eq 1 ]; then
  cp "$1" "$out"
  exit 0
fi
list=$(mktemp)
trap 'rm -f "$list"' EXIT
for f in "$@"; do
  dir=$(cd "$(dirname "$f")" && pwd)
  printf "file '%s'\n" "$dir/$(basename "$f")" >> "$list"
done
mkdir -p "$(dirname "$out")"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$list" -c copy "$out"
echo "joined $out"
