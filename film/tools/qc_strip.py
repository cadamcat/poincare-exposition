#!/usr/bin/env python3
"""Check the status strip of the joined film against every beat's status.

Usage (from the film directory, after tools/assemble.py): python3 tools/qc_strip.py
For each beat it grabs the frame at the middle of the spoken part from out/film.mp4, reads the strip
colour at (1800, 1050) and compares it with the beat's status colour from the studio tokens.
"""
import json, re, subprocess, sys
from pathlib import Path

FILM = Path(__file__).resolve().parents[1]
TOKENS = (FILM / 'scenes' / 'lib' / 'tokens.css').read_text()
CHAPTERS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9']
FPS, SR = 30, 24000


def hexrgb(name):
    h = re.search(rf'--{name}:\s*#([0-9A-Fa-f]{{6}})', TOKENS).group(1)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


COLOURS = {'proved': hexrgb('status-proved'), 'claimed': hexrgb('status-claimed'),
           'heuristic': hexrgb('status-heuristic'), 'lean': hexrgb('status-lean'),
           'definition': hexrgb('rule'), 'context': hexrgb('rule')}


def pixel(t, x=1800, y=1050):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', str(FILM / 'out' / 'film-1080p.mp4'),
                          '-frames:v', '1', '-vf', f'scale=1920:1080,format=rgb24,crop=2:2:{x}:{y}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         capture_output=True, check=True).stdout
    return tuple(raw[:3])


def main():
    offset, bad, n = 0.0, 0, 0
    for ch in CHAPTERS:
        beats = json.loads((FILM / 'audio' / f'{ch}.beats.json').read_text())
        for b in beats['beats']:
            t = offset + (b['start'] + b['end']) / 2
            got = pixel(t)
            want = COLOURS[b['status']]
            nearest = min(COLOURS, key=lambda k: sum((a - c) ** 2 for a, c in zip(COLOURS[k], got)))
            ok = sum(abs(a - c) for a, c in zip(want, got)) <= 24
            n += 1
            bad += not ok
            print(('PASS' if ok else 'FAIL'), b['id'], f'{t:.2f}s', b['status'], got, 'nearest', nearest)
        wav = FILM / 'out' / ch / f'{ch}.wav'
        dur = int(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=duration_ts', '-of', 'csv=p=0', str(wav)],
                                 text=True, capture_output=True, check=True).stdout.strip())
        offset += dur / SR
    print(f'{n - bad}/{n} beats: strip matches status')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
