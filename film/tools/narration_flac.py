#!/usr/bin/env python3
"""Keep the narration as one FLAC file, and restore the chapter WAVs from it.

    narration_flac.py pack OUT.flac      audio/c1..c9.wav -> OUT.flac, and audio/narration.json
    narration_flac.py unpack IN.flac     IN.flac -> audio/c1..c9.wav, checked against audio/narration.json

The FLAC holds the nine chapter narrations one after another (24 kHz, mono, 16 bit, lossless).
audio/narration.json records each chapter's length in samples and the SHA-256 of its PCM data,
so unpacking reproduces exactly the files the beat timings were made from. Needs ffmpeg; Python
standard library only.
"""
import hashlib, json, subprocess, sys, wave
from pathlib import Path

FILM = Path(__file__).resolve().parents[1]
AUDIO = FILM / 'audio'
CHAPTERS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9']
SR = 24000


def pack(out):
    pcm, chapters = b'', []
    for ch in CHAPTERS:
        with wave.open(str(AUDIO / f'{ch}.wav')) as w:
            assert (w.getframerate(), w.getnchannels(), w.getsampwidth()) == (SR, 1, 2), ch
            data = w.readframes(w.getnframes())
        chapters.append(dict(chapter=ch, samples=len(data) // 2, sha256=hashlib.sha256(data).hexdigest()))
        pcm += data
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-',
                    '-c:a', 'flac', '-compression_level', '8', str(out)], input=pcm, check=True)
    (AUDIO / 'narration.json').write_text(json.dumps(dict(sample_rate=SR, channels=1, bits=16, chapters=chapters), indent=1) + '\n')
    print(f'packed {len(pcm) // 2 / SR:.3f} s into {out}')


def unpack(src):
    meta = json.loads((AUDIO / 'narration.json').read_text())
    pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', str(src), '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    total = sum(c['samples'] for c in meta['chapters'])
    if len(pcm) // 2 != total:
        raise SystemExit(f'{src}: {len(pcm) // 2} samples, expected {total}')
    off = 0
    for c in meta['chapters']:
        data = pcm[off: off + 2 * c['samples']]
        off += 2 * c['samples']
        if hashlib.sha256(data).hexdigest() != c['sha256']:
            raise SystemExit(f"{c['chapter']}: audio differs from the recorded narration")
        with wave.open(str(AUDIO / f"{c['chapter']}.wav"), 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes(data)
        print(f"{c['chapter']}: {c['samples'] / SR:.3f} s, checksum ok")


if __name__ == '__main__':
    if len(sys.argv) != 3 or sys.argv[1] not in ('pack', 'unpack'):
        raise SystemExit(__doc__)
    (pack if sys.argv[1] == 'pack' else unpack)(Path(sys.argv[2]).resolve())
