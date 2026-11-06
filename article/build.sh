#!/usr/bin/env bash
# Build the article PDF: figures (SVG -> PDF via headless Chromium), then pandoc with XeLaTeX.
# Requires: python3, node with Playwright and the fonts (NODE_MODULES, default ../studio/node_modules), pandoc, xelatex.
set -euo pipefail
cd "$(dirname "$0")"
NM="${NODE_MODULES:-$(cd .. && pwd)/studio/node_modules}"
mkdir -p build
# 3D pictures: figures/3d/*.png are committed; to re-render them: node figures/render3d.js "$NM" (WebGL)
python3 figures/make_figures.py
node tools/fig2pdf.js "$NM" build figures/*.svg
pandoc exposition.md -o build/exposition.pdf --pdf-engine=xelatex --citeproc --bibliography=refs.bib \
  --lua-filter=tools/svg-to-pdf.lua --metadata-file=tools/pdf-meta.yaml \
  -V geometry:margin=27mm -V fontsize=11pt -V colorlinks=true -V linkcolor=black -V urlcolor=black
echo "built build/exposition.pdf"
