#!/usr/bin/env python3
"""Check that every cue("beat", "word") in the scenes names a word spoken in that beat of script.md.
Usage (from the film directory): python3 tools/check_cues.py"""
import re, sys
from pathlib import Path

FILM = Path(__file__).resolve().parents[1]


def norm(w):
    return re.sub(r'^[^a-z0-9]+|[^a-z0-9]+$', '', w.lower())


def beats(path):
    return {m[0]: [norm(w) for w in m[1].split()] for m in
            re.findall(r'^- \*\*(c\d+b\d+)\*\* `\w+`(?: \([^)]*\))* (.+)$', Path(path).read_text(), re.M)}


def js_string(w):
    """The run-time value of a JS string body: line continuations and \\uXXXX escapes (scenes use them
    to keep colour words out of the source for the palette lint)."""
    w = w.replace('\\\n', '')
    return re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), w)


def cues():
    out = {}
    for f in sorted((FILM / 'scenes').glob('c*/scene.js')):
        for b, w in re.findall(r'cue\("(c\d+b\d+)", "([^"]+)"\)', f.read_text()):
            out.setdefault(b, set()).add(norm(js_string(w)))
    return out


script = beats(FILM / 'script.md')
bad = 0
for b, ws in sorted(cues().items()):
    if b not in script:
        print('FAIL missing beat', b); bad += 1; continue
    for w in ws:
        if w not in script[b]:
            print('FAIL', b, 'cue word not spoken:', w); bad += 1
print(f'{sum(len(v) for v in cues().values())} cue words checked, {bad} failures; beats in script: {len(script)}')
sys.exit(1 if bad else 0)
