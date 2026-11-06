#!/usr/bin/env bash
# Rebuild the article PDF, restore the narration, or rebuild the film. See README.md for the requirements.
set -euo pipefail
cd "$(dirname "$0")"
case "${1:-}" in
  article)
    NODE_MODULES="$PWD/studio/node_modules" article/build.sh ;;
  narration)
    # the narration as released: poincare-exposition-narration.flac from the release assets
    "${PYTHON:-python3}" film/tools/narration_flac.py unpack "${2:-poincare-exposition-narration.flac}" ;;
  film)
    (cd film && "${PYTHON:-python3}" tools/assemble.py) ;;
  *)
    echo "usage: ./build.sh article | narration [FLAC] | film" >&2
    exit 2 ;;
esac
