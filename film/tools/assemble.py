#!/usr/bin/env python3
"""Render, check and join the film.

Usage (from the film directory, with the studio Python environment, which has numpy and soundfile):
    python tools/assemble.py [--chapters c1,c2,...] [--join-only] [--runner "CMD"]

For each chapter cN this reads scenes/cN/{scene.html,beats.json} and audio/cN.wav and writes to out/cN/:
  cN.wav (narration padded with silence to a whole number of frames), frames/ (rendered at 4K:
  the 1920x1080 layout at device scale 2), checks.log, cN-4k.mp4 (3840x2160), cN.mp4 (1920x1080,
  downscaled from the same frames), cN.srt, cN-contact*.png.
The frames/ directory is left for the caller to delete once the chapter is checked.
Then it joins all nine chapters into out/film-4k.mp4 and out/film-1080p.mp4 (video copied, the
same audio encoded once from the joined narration with the music bed of tools/music_bed.py, normalised
to -16 LUFS) and writes subtitles.srt and narration.txt.

Every chapter is a whole number of frames long, so chapter offsets in the subtitles are exact.
--runner prefixes the heavy commands (render, encode), e.g. a local job limiter.
"""
import argparse, json, math, re, shlex, subprocess, sys
from pathlib import Path

FILM = Path(__file__).resolve().parents[1]
SCENES = FILM / 'scenes'
OUT = FILM / 'out'
FPS = 30
SR = 24000
CHAPTERS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9']


def run(cmd, cwd=SCENES, log=None, runner=None):
    full = (shlex.split(runner) if runner else []) + cmd
    print('$', ' '.join(shlex.quote(c) for c in full), flush=True)
    res = subprocess.run(full, cwd=cwd, text=True, capture_output=True)
    if log:
        Path(log).write_text(res.stdout + res.stderr)
    else:
        sys.stdout.write(res.stdout[-2000:])
    if res.returncode != 0:
        sys.stderr.write(res.stderr[-4000:])
        raise SystemExit(f'failed ({res.returncode}): {cmd[0]} {cmd[1] if len(cmd) > 1 else ""}')
    return res.stdout


def probe_samples(wav):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a:0', '-count_packets',
                          '-show_entries', 'stream=sample_rate,duration_ts', '-of', 'json', str(wav)],
                         text=True, capture_output=True, check=True).stdout
    s = json.loads(out)['streams'][0]
    assert int(s['sample_rate']) == SR, s
    return int(s['duration_ts'])


def frames_for(wav):
    return math.ceil(probe_samples(wav) * FPS / SR)


def chapter(ch, runner):
    out = OUT / ch
    out.mkdir(parents=True, exist_ok=True)
    beats = SCENES / ch / 'beats.json'
    if beats.read_text() != (FILM / 'audio' / f'{ch}.beats.json').read_text():
        raise SystemExit(f'{ch}: scenes/{ch}/beats.json differs from audio/{ch}.beats.json')
    n = frames_for(FILM / 'audio' / f'{ch}.wav')
    padded = out / f'{ch}.wav'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(FILM / 'audio' / f'{ch}.wav'),
                    '-af', f'apad=whole_len={n * SR // FPS}', '-c:a', 'pcm_s16le', str(padded)], check=True)
    assert probe_samples(padded) == n * SR // FPS
    rel = f'../out/{ch}'
    run(['node', 'tools/render.js', f'{ch}/scene.html', f'{ch}/beats.json', f'{rel}/frames', '--scale', '2'], runner=runner)
    run(['node', 'tools/check.js', 'all', f'{ch}/scene.html', f'{ch}/beats.json'], log=out / 'checks.log')
    run(['tools/encode.sh', f'{rel}/frames', f'{rel}/{ch}.wav', f'{rel}/{ch}-4k.mp4'], runner=runner)
    run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-start_number', '0', '-i', f'{rel}/frames/f%05d.png',
         '-i', f'{rel}/{ch}.wav', '-map', '0:v:0', '-map', '1:a:0', '-vf', 'scale=1920:1080:flags=lanczos',
         '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-c:a', 'aac', '-b:a', '192k',
         '-t', f'{n / FPS:.6f}', '-movflags', '+faststart', f'{rel}/{ch}.mp4'], runner=runner)
    for name, size in [(f'{ch}-4k.mp4', '3840,2160'), (f'{ch}.mp4', '1920,1080')]:
        got = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_frames',
                              '-show_entries', 'stream=width,height,nb_read_frames', '-of', 'csv=p=0', str(out / name)],
                             text=True, capture_output=True, check=True).stdout.strip()
        if got != f'{size},{n}':
            raise SystemExit(f'{ch}: {name} is {got}, expected {size},{n}')
    run(['node', 'tools/srt.js', f'{ch}/beats.json', f'{rel}/{ch}.srt'], log=out / 'srt.log')
    run(['node', 'tools/contact.js', f'{rel}/frames', f'{ch}/beats.json', f'{rel}/{ch}-contact.png'])
    print(f'{ch}: {n} frames, {n / FPS:.3f} s', flush=True)


def srt_time(t):
    ms = round(t * 1000)
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'


def parse_time(s):
    h, m, rest = s.split(':')
    sec, ms = rest.split(',')
    return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000


def join():
    offsets, t = {}, 0.0
    for ch in CHAPTERS:
        offsets[ch] = t
        t += probe_samples(OUT / ch / f'{ch}.wav') / SR
    total = t
    lists = OUT / 'join'
    lists.mkdir(exist_ok=True)
    for tag, suffix in [('1080p', ''), ('4k', '-4k')]:
        (lists / f'video-{tag}.txt').write_text(''.join(f"file '{(OUT / ch / f'{ch}{suffix}.mp4').as_posix()}'\n" for ch in CHAPTERS))
    (lists / 'audio.txt').write_text(''.join(f"file '{(OUT / ch / f'{ch}.wav').as_posix()}'\n" for ch in CHAPTERS))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(lists / 'audio.txt'),
                    '-c:a', 'pcm_s16le', str(OUT / 'film.wav')], check=True)
    (lists / 'offsets.json').write_text(json.dumps(dict(offsets=offsets, total=total), indent=1))
    # Music bed under the whole film (tools/music_bed.py, deterministic), then narration + bed at 48 kHz stereo.
    bed = subprocess.run([sys.executable, str(FILM / 'tools' / 'music_bed.py'), 'film'], text=True, capture_output=True)
    if bed.returncode != 0:
        sys.stderr.write(bed.stderr[-4000:])
        raise SystemExit('music bed failed')
    (lists / 'music.json').write_text(bed.stdout)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(OUT / 'film.wav'), '-i', str(OUT / 'film-bed.wav'),
                    '-filter_complex', '[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0[v];[v][1:a]amix=inputs=2:normalize=0:duration=first',
                    '-c:a', 'pcm_f32le', str(OUT / 'film-sum.wav')], check=True)
    # Loudness: two-pass EBU R128 normalisation of the mix to -16 LUFS, true peak -1.5 dB.
    # Chapter files keep the raw narration.
    target = 'I=-16:TP=-1.5:LRA=11'
    meas = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(OUT / 'film-sum.wav'), '-af',
                           f'loudnorm={target}:print_format=json', '-f', 'null', '-'],
                          text=True, capture_output=True, check=True).stderr
    m = json.loads(meas[meas.rindex('{'):meas.rindex('}') + 1])
    norm = (f"loudnorm={target}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
            f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(OUT / 'film-sum.wav'), '-af', norm, '-ar', '48000', '-ac', '2',
                    '-c:a', 'pcm_s16le', str(OUT / 'film-mix.wav')], check=True)
    for tag in ['1080p', '4k']:
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(lists / f'video-{tag}.txt'),
                        '-i', str(OUT / 'film-mix.wav'), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
                        '-c:a', 'aac', '-b:a', '192k', '-t', f'{total:.6f}', '-movflags', '+faststart',
                        str(OUT / f'film-{tag}.mp4')], check=True)
    # Subtitles: chapter cues shifted by the chapter offsets, renumbered.
    cues = []
    for ch in CHAPTERS:
        blocks = (OUT / ch / f'{ch}.srt').read_text().strip().split('\n\n')
        for b in blocks:
            lines = b.split('\n')
            a, z = [parse_time(x.strip()) for x in lines[1].split('-->')]
            cues.append((a + offsets[ch], z + offsets[ch], lines[2:]))
    srt = ''.join(f'{i}\n{srt_time(a)} --> {srt_time(z)}\n' + '\n'.join(text) + '\n\n'
                  for i, (a, z, text) in enumerate(cues, 1))
    (FILM / 'subtitles.srt').write_text(srt)
    # Narration text: the spoken words of every beat, one paragraph per chapter.
    script = (FILM / 'script.md').read_text()
    paras = []
    for ch in CHAPTERS:
        title = re.search(rf'^## {ch} · (.+)$', script, re.M).group(1).strip()
        words = re.findall(rf'^- \*\*{ch}b\d+\*\* `\w+`(?: \([^)]*\))* (.+)$', script, re.M)
        paras.append(f'{title}\n\n' + ' '.join(w.strip() for w in words))
    (FILM / 'narration.txt').write_text('\n\n'.join(paras) + '\n')
    print(f'film: {total:.3f} s ({total / 60:.2f} min), {len(cues)} subtitle cues')
    print('offsets: ' + ', '.join(f'{ch} {offsets[ch]:.3f}' for ch in CHAPTERS))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--chapters', default=','.join(CHAPTERS))
    ap.add_argument('--join-only', action='store_true')
    ap.add_argument('--runner', default=None)
    a = ap.parse_args()
    if not a.join_only:
        for ch in a.chapters.split(','):
            chapter(ch, a.runner)
    if a.join_only or a.chapters == ','.join(CHAPTERS):
        join()


if __name__ == '__main__':
    main()
