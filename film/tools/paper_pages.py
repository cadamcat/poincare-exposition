#!/usr/bin/env python3
"""Page images of the formalization paper for the film: Qin, Liao, Khaitan, Chow, arXiv:2609.33842v1 (CC BY 4.0).

Usage: paper_pages.py PAPER.pdf
Writes scenes/paper/:
  thumbs/pNNN.png   every page at 40 dpi, as an ink mask (black, alpha = ink coverage), for the page stack;
  pNNN.svg          page 1 as vector (pdftocairo -svg), used as the mask for the close-up;
  pages.json        page count, page size, and the region the film zooms to (title and authors on page 1),
                    as fractions of the page, found in the text layer.
The scenes colour the masks with the studio tokens, so the pages are drawn in the house palette.
Needs poppler (pdftoppm, pdftocairo, pdftotext) and numpy."""
import json, re, struct, subprocess, sys, tempfile, zlib
from pathlib import Path

import numpy as np

OUT = Path(__file__).resolve().parents[1] / 'scenes' / 'paper'
CLOSEUPS = [1]
REGIONS = {  # name: (page, first line starts with, last line contains)
    'title': (1, 'A Lean Formalization', 'Bennett Chow'),
}


def png_la(path, alpha):
    h, w = alpha.shape
    raw = b''.join(b'\x00' + np.stack([np.zeros_like(row), row], axis=1).tobytes() for row in alpha)
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 4, 0, 0, 0))
                     + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))


def read_pgm(path):
    data = path.read_bytes()
    m = re.match(rb'P5\s+(\d+)\s+(\d+)\s+(\d+)\s', data)
    w, h = int(m[1]), int(m[2])
    return np.frombuffer(data[m.end():m.end() + w * h], dtype=np.uint8).reshape(h, w)


def lines(pdf, page):
    html = subprocess.run(['pdftotext', '-bbox-layout', '-f', str(page), '-l', str(page), str(pdf), '-'],
                          capture_output=True, text=True, check=True).stdout
    out = []
    for m in re.finditer(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>', html, re.S):
        out.append((float(m[1]), float(m[2]), float(m[3]), float(m[4]), ' '.join(re.findall(r'>([^<]*)</word>', m[5]))))
    return out


def main():
    pdf = Path(sys.argv[1]).resolve()
    info = subprocess.run(['pdfinfo', str(pdf)], capture_output=True, text=True, check=True).stdout
    count = int(re.search(r'Pages:\s+(\d+)', info)[1])
    pw, ph = map(float, re.search(r'Page size:\s+([\d.]+) x ([\d.]+)', info).groups())
    (OUT / 'thumbs').mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(['pdftoppm', '-r', '40', '-gray', str(pdf), str(Path(tmp) / 'p')], check=True)
        for f in sorted(Path(tmp).glob('p-*.pgm')):
            n = int(f.stem.split('-')[1])
            png_la(OUT / 'thumbs' / f'p{n:03d}.png', 255 - read_pgm(f))
    for n in CLOSEUPS:
        subprocess.run(['pdftocairo', '-svg', '-f', str(n), '-l', str(n), str(pdf), str(OUT / f'p{n:03d}.svg')], check=True)
    regions = {}
    for name, (page, first, last) in REGIONS.items():
        ls = lines(pdf, page)
        i = next(k for k, l in enumerate(ls) if l[4].startswith(first))
        j = next(k for k, l in enumerate(ls) if k >= i and last in l[4])
        box = ls[i:j + 1]
        x0, y0 = min(l[0] for l in box) - 4, min(l[1] for l in box) - 4
        x1, y1 = max(l[2] for l in box) + 4, max(l[3] for l in box) + 4
        regions[name] = dict(page=page, x0=round(x0 / pw, 4), y0=round(y0 / ph, 4), x1=round(x1 / pw, 4), y1=round(y1 / ph, 4))
    meta = dict(source='Z. Qin, Y. Liao, A. Khaitan, B. Chow, "A Lean Formalization of the Hamilton-Perelman Proof of the '
                       'Three-Dimensional Poincare Conjecture", arXiv:2609.33842v1, CC BY 4.0',
                count=count, width_pt=pw, height_pt=ph, closeups=CLOSEUPS, regions=regions)
    (OUT / 'pages.json').write_text(json.dumps(meta, indent=1) + '\n')
    print(f'{count} pages; close-ups {CLOSEUPS}; regions {regions}')


if __name__ == '__main__':
    main()
