#!/usr/bin/env python3
"""Checks that every motion a scene declares with need() finishes before the picture moves on.

Usage: check_needs.py [FILM_DIR]
Reads scenes/cN/scene.js (the need() calls, as tools/narrate.py reads them) and scenes/cN/beats.json (the
timings the scene is rendered with), and checks for each need:
  lead   the beat's first word starts at least `seconds` after the chapter start;
  tail   the beat's last word + `seconds` <= the end of the beat's hold (the chapter end for the last beat);
  word   the first time the word is spoken in the beat + `seconds` <= the end of the beat's hold.
Also checks that each scene's beats.json is the narration's audio/cN.beats.json. Prints one line per
failure (FAIL <beat> <word> ...) and a summary; exit status 1 on any failure."""
import json, re, sys, unicodedata
from pathlib import Path

NEED_RE = re.compile(r'need\("(c\d+b\d+)", "([^"]+)", ([\d.]+)(?:, "([^"]*)")?\)')
EPS = 1e-3


def norm(w):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', w).lower())


def main():
    film = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]
    fails, n = [], 0
    for js in sorted((film / 'scenes').glob('c*/scene.js')):
        ch = js.parent.name
        beats_file = js.parent / 'beats.json'
        meta = json.loads(beats_file.read_text())
        audio = film / 'audio' / f'{ch}.beats.json'
        if audio.exists() and json.loads(audio.read_text()) != meta:
            fails.append(f'FAIL {ch} beats.json differs from audio/{ch}.beats.json')
        beats = {b['id']: b for b in meta['beats']}
        for b_id, word, sec, why in NEED_RE.findall(js.read_text()):
            n += 1
            sec = float(sec)
            b = beats.get(b_id)
            if b is None:
                fails.append(f'FAIL {b_id} {word}: beat not in {ch}/beats.json')
                continue
            hold_end = b['holdEnd'] if b.get('holdEnd') is not None else meta['duration']
            if word == 'lead':
                have = b['words'][0]['start']
                ok, what = have + EPS >= sec, f"first word at {have:.3f} s, needs {sec}"
            else:
                if word == 'tail':
                    t0 = b['words'][-1]['end']
                else:
                    hits = [w['start'] for w in b['words'] if norm(w['word']) == norm(word)]
                    if not hits:
                        fails.append(f'FAIL {b_id} {word}: word not spoken in the beat')
                        continue
                    t0 = hits[0]
                ok, what = t0 + sec <= hold_end + EPS, f"{t0:.3f} + {sec} > hold end {hold_end:.3f}"
            if not ok:
                fails.append(f'FAIL {b_id} {word} ({why}): {what}')
    for f in fails:
        print(f)
    print(f'needs checked: {n}; failures: {len(fails)}')
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
