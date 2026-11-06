#!/usr/bin/env python3
"""A quiet music bed, composed in code, under the whole film.

Usage (from the film directory, studio Python environment):
    music_bed.py film        bed for the joined narration out/film.wav, written to out/film-bed.wav
                             (tools/assemble.py runs this when it joins the film)

The bed is deterministic synthesis (numpy, fixed seed 1036): slow pad chords (sine partials, gentle
detune, slow swells) on a four-chord loop in D, and a few sustained high tones. Each partial is scaled by
the magnitude of a 12 dB/octave low-pass at 2.4 kHz, which for sums of slowly varying sines is the
same as filtering the signal. Its level is set 22 LU under the narration (integrated loudness, EBU R128),
and it ducks a further 8 dB while a word is spoken (0.25 s attack, 0.9 s release), so under speech it sits
about 30 dB down and overall about 27 LU under. Between chapters (from a chapter's last word to the next
chapter's first) and under the end card it swells by 3 dB; it fades in over 1.5 s at the start and out
over the last 4 s of the film."""
import argparse, json, re, subprocess
from pathlib import Path

import numpy as np
import soundfile as sf

FILM = Path(__file__).resolve().parents[1]
SR = 48000
BED_UNDER, DUCK_DB, TARGET = 22.0, 8.0, -16.0
SWELL_DB, SWELL_RAMP, FADE_IN, FADE_OUT = 3.0, 0.8, 1.5, 4.0
CUTOFF = 2400.0
CHORDS = [  # MIDI notes, 8 s each: Dmaj9, Bm7(add11), Gmaj7, Asus2
    [50, 57, 62, 66, 69, 76], [47, 54, 62, 66, 69, 76], [43, 50, 59, 62, 66, 74], [45, 52, 59, 64, 69, 71]]
CHORD_LEN = 8.0


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(f):
    """Magnitude of the bed's low-pass (two one-pole stages at CUTOFF) at frequency f."""
    return 1.0 / (1.0 + (f / CUTOFF) ** 2)


def pad(dur, rng):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    k = 0
    while k * CHORD_LEN < dur + CHORD_LEN:
        notes = CHORDS[k % len(CHORDS)]
        t0 = k * CHORD_LEN - 2.0                     # 2 s crossfade into the next chord
        span = CHORD_LEN + 4.0
        a, z = max(0, int(t0 * SR)), min(n, int((t0 + span) * SR))
        if a < z:
            tt = t[a:z] - t0
            env = np.sin(np.pi * np.clip(tt / span, 0, 1)) ** 2   # slow swell in and out
            for i, m in enumerate(notes):
                f = hz(m)
                vol = 0.5 if m < 52 else 0.32 if m < 70 else 0.16
                for side, det in ((0, -0.0025), (1, 0.0025)):
                    ph = rng.uniform(0, 2 * np.pi)
                    tone = lp(f) * np.sin(2 * np.pi * f * (1 + det) * tt + ph) + 0.18 * lp(2 * f) * np.sin(4 * np.pi * f * tt + ph)
                    out[a:z, side] += vol * env * tone
        k += 1
    trem = 1 + 0.08 * np.sin(2 * np.pi * t / 11.0)               # very slow breathing
    return out * trem[:, None]


def bells(dur, rng):
    n = int(dur * SR)
    out = np.zeros((n, 2))
    t = 3.0
    while t < dur - 1:
        m = int(rng.choice([74, 76, 78, 81, 83, 86]))
        a = int(t * SR)
        tt = np.arange(min(n - a, int(7 * SR))) / SR
        tone = lp(hz(m)) * np.sin(2 * np.pi * hz(m) * tt) * np.exp(-tt / 2.2) * (1 - np.exp(-tt / 0.08))
        pan = rng.uniform(0.3, 0.7)
        out[a:a + len(tt), 0] += 0.22 * (1 - pan) * tone
        out[a:a + len(tt), 1] += 0.22 * pan * tone
        t += rng.uniform(5.5, 9.0)
    return out


def lufs(x):
    p = FILM / 'out' / '_lufs.wav'
    sf.write(p, x, SR, subtype='FLOAT')
    err = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(p), '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    p.unlink()
    i = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', err)[-1])
    tp = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', err)[-1])
    return i, tp


def speech_spans(beats, offset=0.0):
    return [(w['start'] + offset, w['end'] + offset) for b in beats['beats'] for w in b['words']]


def duck_curve(spans, n):
    """Gain (linear) of the ducking: an attack/release follower of 'a word is sounding', run at a 1 kHz
    control rate and interpolated to the audio rate."""
    m = int(np.ceil(n / SR * 1000)) + 1
    speech = np.zeros(m)
    for a, z in spans:
        speech[int(a * 1000): int(z * 1000)] = 1
    att, rel = np.exp(-1 / (0.25 * 1000)), np.exp(-1 / (0.9 * 1000))
    g = np.empty(m)
    acc = 0.0
    for i in range(m):
        c = att if speech[i] > acc else rel
        acc = c * acc + (1 - c) * speech[i]
        g[i] = acc
    g = np.interp(np.arange(n) / SR * 1000, np.arange(m), g)
    return 10 ** (-DUCK_DB * g / 20)


def ramp_window(t, a, z, r):
    """0 outside [a, z], 1 inside with linear ramps of r seconds at both ends (shorter if the span is short)."""
    r = max(1e-3, min(r, (z - a) / 2))
    return np.clip(np.minimum((t - a) / r, (z - t) / r), 0, 1)


def build(voice48, chapters, total, swell_spans, end_card):
    """The ducked bed under a 48 kHz stereo narration. chapters: list of (offset, beats json).
    swell_spans: [(a, z)] in seconds; end_card: time the end card appears. Returns (bed, report)."""
    n, dur = len(voice48), len(voice48) / SR
    rng = np.random.default_rng(1036)
    bed = pad(dur, rng)[:n] + bells(dur, rng)[:n]
    vi, _ = lufs(voice48)
    bi, _ = lufs(bed)
    bed *= 10 ** ((vi - BED_UNDER - bi) / 20)
    spans = [s for off, beats in chapters for s in speech_spans(beats, off)]
    duck = duck_curve(spans, n)
    t = np.arange(n) / SR
    swell = np.zeros(n)
    for a, z in list(swell_spans) + [(end_card, dur + SWELL_RAMP)]:
        swell = np.maximum(swell, ramp_window(t, a, z, SWELL_RAMP))
    edge = np.minimum(1, np.minimum(t / FADE_IN, np.maximum(0, dur - t) / FADE_OUT))
    gain = duck * 10 ** (SWELL_DB * swell / 20) * edge
    bed = bed * gain[:, None]
    bdi, _ = lufs(bed)
    sp = duck < 10 ** (-DUCK_DB / 2 / 20)
    def rms_db(x):
        return 10 * np.log10(np.mean(x ** 2) + 1e-20)
    rep = dict(narration_lufs=round(vi, 2), bed_lufs=round(bdi, 2), bed_under_lu=round(vi - bdi, 2),
               under_speech_db=round(rms_db(voice48[sp]) - rms_db(bed[sp]), 2),
               swells=[(round(a, 3), round(z, 3)) for a, z in swell_spans], end_card=round(end_card, 3),
               fade_out=(round(dur - FADE_OUT, 3), round(dur, 3)))
    return bed.astype(np.float32), rep


def to48(v, sr):
    x = np.interp(np.arange(int(len(v) * SR / sr)) * sr / SR, np.arange(len(v)), v)
    return np.stack([x, x], axis=1)


def film():
    """Bed for the joined film: reads out/film.wav and out/join/offsets.json (written by assemble.py)."""
    v, sr = sf.read(FILM / 'out' / 'film.wav')
    voice = to48(v, sr)
    info = json.loads((FILM / 'out' / 'join' / 'offsets.json').read_text())
    chapters = [(off, json.loads((FILM / 'audio' / f'{ch}.beats.json').read_text())) for ch, off in info['offsets'].items()]
    swell_spans, end_card = break_spans(chapters)
    bed, rep = build(voice, chapters, len(voice) / SR, swell_spans, end_card)
    sf.write(FILM / 'out' / 'film-bed.wav', bed, SR, subtype='FLOAT')
    print(json.dumps(rep))


def break_spans(chapters):
    """Chapter breaks: from each chapter's last word to the next chapter's first word; and the end card
    (the last word of the film)."""
    firsts = [off + beats['beats'][0]['words'][0]['start'] for off, beats in chapters]
    lasts = [off + beats['beats'][-1]['words'][-1]['end'] for off, beats in chapters]
    return list(zip(lasts[:-1], firsts[1:])), lasts[-1]


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('mode', choices=['film'])
    ap.parse_args()
    film()
