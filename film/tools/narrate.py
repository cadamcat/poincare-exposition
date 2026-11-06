#!/usr/bin/env python3
"""Narrate the film script one passage per chapter (or half-chapter) with OpenAI speech, time the
words with Whisper, and write per-chapter audio and beat timings.

Usage (from the film directory, with the studio's Python environment):
    narrate.py [--chapters c1,c2] [--passages c4.1,c4.2] [--offline] [--take N]

Reads script.md (beats, paragraphs, passages), audio/instructions.txt (delivery), audio/takes.json
(optional take number per passage: {"c4.1": 1}) and the scenes' need("beat", "word", seconds, "reason") calls.
Writes audio/cN.wav (24 kHz mono), audio/cN.beats.json and audio/narration-report.json.

Speech: POST /v1/audio/speech, model gpt-4o-mini-tts, voice marin, WAV. One call per passage; the
passage text keeps the script's paragraphs as blank lines. Timing: POST /v1/audio/transcriptions,
whisper-1, verbose_json with word timestamps; Whisper's words are mapped onto the script words by
sequence (difflib on normalized words). Every result is cached in audio/cache/ under a hash of
(model, voice, instructions, text, take); --offline fails instead of calling.

The API key is read at run time from the macOS keychain (service openai-api-key) and is only
ever placed in the Authorization header of these two requests. Each call is logged to
audio/openai-usage.log with an estimate at list prices; the run stops before a call that
would take the total past 5 USD.

Pauses. Every pause is the voice's own; the passage audio is used whole, including its own
leading and trailing silence. Beats are cut apart in the middle of the voice's pause between
them, read from the audio (pause_between); the quietest 10 ms of the gap is the fallback. A scene may declare that a motion needs time: need(beat, word, s) means the
motion starting at that word lasts s seconds and must finish before the next beat starts;
need(beat, "tail", s) counts from the beat's last word; need(beat, "lead", s) asks for s seconds
before the beat's first word (chapter openings); the first beat starts when the lead time is
over, so the status strip stays neutral under the chapter title. Where the voice gives less, exactly the missing
time is inserted as silence at that cut (or at the chapter's start or end). Where a chapter is
read in two passages, the join gets the voice's own edge silences, lengthened if needed to the
median of the paragraph pauses the voice made in that chapter. Nothing else is added."""
import argparse, datetime, difflib, hashlib, json, re, subprocess, sys, unicodedata, urllib.error, urllib.request, uuid
from pathlib import Path

import numpy as np
import soundfile as sf

FILM = Path(__file__).resolve().parents[1]
AUDIO = FILM / 'audio'
CACHE = AUDIO / 'cache'
USAGE = AUDIO / 'openai-usage.log'
SR = 24000
TTS_MODEL, VOICE, STT_MODEL = 'gpt-4o-mini-tts', 'marin', 'whisper-1'
BUDGET_USD = 5.0
PRIOR_USD = 0.05          # spent on the same account outside this tool, estimated
# List prices: gpt-4o-mini-tts $0.60 per 1M text tokens in, about $0.015 per minute of audio out;
# whisper-1 $0.006 per minute.
TTS_PER_TOKEN, TTS_PER_SEC, STT_PER_SEC = 0.60e-6, 0.015 / 60, 0.006 / 60
NEED_RE = re.compile(r'need\("(c\d+b\d+)", "([^"]+)", ([\d.]+)(?:, "([^"]*)")?\)')


# ---------- script ----------

def parse_script():
    """{chapter: [passage]}; a passage is {id, paragraphs: [[beat]]}."""
    text = (FILM / 'script.md').read_text()
    chapters, ch, passage, para_open = {}, None, None, False
    for line in text.splitlines():
        m = re.match(r'^## (c\d+) · (.+)$', line)
        if m:
            ch = m[1]; chapters[ch] = []; passage = None
            continue
        if ch is None:
            continue
        if line.strip() == '<!-- passage -->':
            passage = dict(id=f'{ch}.{len(chapters[ch]) + 1}', paragraphs=[]); chapters[ch].append(passage)
            para_open = False
            continue
        if not line.strip():
            para_open = False
            continue
        m = re.match(r'^- \*\*(c\d+b\d+)\*\* `(\w+)` (.+)$', line)
        if m:
            if not para_open:
                passage['paragraphs'].append([]); para_open = True
            passage['paragraphs'][-1].append(dict(id=m[1], status=m[2], text=m[3].strip()))
    return chapters


def passage_text(p):
    return '\n\n'.join(' '.join(b['text'] for b in para) for para in p['paragraphs'])


def scene_needs():
    needs = {}
    for f in sorted((FILM / 'scenes').glob('c*/scene.js')):
        for b, w, s, why in NEED_RE.findall(f.read_text()):
            needs.setdefault(b, []).append(dict(word=w, seconds=float(s), reason=why))
    return needs


def norm(w):
    w = unicodedata.normalize('NFKD', w)
    return re.sub(r'[^a-z0-9]', '', w.lower())


# ---------- OpenAI calls (cached) ----------

_key = None


def key():
    global _key
    if _key is None:
        r = subprocess.run(['security', 'find-generic-password', '-s', 'openai-api-key', '-w'],
                           capture_output=True, text=True)
        if r.returncode != 0 or not r.stdout.strip():
            raise SystemExit('no OpenAI key in the keychain (service openai-api-key)')
        _key = r.stdout.strip()
    return _key


def spent():
    total = PRIOR_USD
    if USAGE.exists():
        for line in USAGE.read_text().splitlines():
            m = re.search(r'usd=([\d.]+)', line)
            if m:
                total += float(m[1])
    return total


def log_call(endpoint, model, voice, chars, seconds, usd, h):
    USAGE.parent.mkdir(parents=True, exist_ok=True)
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    with USAGE.open('a') as f:
        f.write(f'{stamp} {endpoint} {model} {voice} chars={chars} seconds={seconds:.1f} usd={usd:.4f} cache={h[:12]}\n')


def post(url, body, content_type):
    req = urllib.request.Request(url, data=body, method='POST',
                                 headers={'Authorization': 'Bearer ' + key(), 'Content-Type': content_type})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        try:
            err = json.loads(e.read()).get('error', {})
            what = f"{err.get('type')} {err.get('code')}"
        except Exception:
            what = ''
        raise SystemExit(f'OpenAI {url.rsplit("/", 1)[-1]}: HTTP {e.code} {what}')  # never the body: it can echo the key


def check_budget(est):
    if spent() + est > BUDGET_USD:
        raise SystemExit(f'budget: {spent():.2f} USD spent, next call ~{est:.2f} USD would pass {BUDGET_USD} USD')


def read_wav(data_or_path):
    raw = Path(data_or_path).read_bytes() if isinstance(data_or_path, Path) else data_or_path
    i = raw.index(b'data') + 8          # OpenAI streams WAV with unknown (0xFFFFFFFF) sizes
    fmt = raw[raw.index(b'fmt ') + 8:]
    ch, sr, bits = int.from_bytes(fmt[2:4], 'little'), int.from_bytes(fmt[4:8], 'little'), int.from_bytes(fmt[14:16], 'little')
    assert (ch, sr, bits) == (1, SR, 16), (ch, sr, bits)
    pcm = raw[i:]
    pcm = pcm[: len(pcm) // 2 * 2]
    return np.frombuffer(pcm, dtype='<i2').astype(np.float32) / 32768.0


def speech(text, instructions, take, offline):
    h = hashlib.sha256(json.dumps([TTS_MODEL, VOICE, instructions, text, take]).encode()).hexdigest()
    path = CACHE / f'{h}.wav'
    if not path.exists():
        if offline:
            raise SystemExit(f'offline: speech not cached for {text[:40]!r}')
        est = (len(text) + len(instructions)) / 4 * TTS_PER_TOKEN + len(text.split()) / 2.4 * TTS_PER_SEC
        check_budget(est)
        body = json.dumps(dict(model=TTS_MODEL, voice=VOICE, input=text, instructions=instructions,
                               response_format='wav')).encode()
        data = post('https://api.openai.com/v1/audio/speech', body, 'application/json')
        CACHE.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        secs = len(read_wav(data)) / SR
        usd = (len(text) + len(instructions)) / 4 * TTS_PER_TOKEN + secs * TTS_PER_SEC
        log_call('speech', TTS_MODEL, VOICE, len(text), secs, usd, h)
    return h, read_wav(path)


def transcribe(h, offline):
    path = CACHE / f'{h}.whisper.json'
    if not path.exists():
        if offline:
            raise SystemExit('offline: transcript not cached')
        wav = (CACHE / f'{h}.wav').read_bytes()
        secs = len(read_wav(wav)) / SR
        check_budget(secs * STT_PER_SEC)
        b = uuid.uuid4().hex
        parts = []
        for name, value in [('model', STT_MODEL), ('response_format', 'verbose_json'),
                            ('timestamp_granularities[]', 'word'), ('language', 'en')]:
            parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())
        parts.append(f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="passage.wav"\r\n'
                     f'Content-Type: audio/wav\r\n\r\n'.encode() + wav + b'\r\n')
        parts.append(f'--{b}--\r\n'.encode())
        data = post('https://api.openai.com/v1/audio/transcriptions', b''.join(parts), f'multipart/form-data; boundary={b}')
        json.loads(data)
        path.write_bytes(data)
        log_call('transcribe', STT_MODEL, '-', 0, secs, secs * STT_PER_SEC, h)
    return json.loads(path.read_text())


# ---------- alignment ----------

def align(script_words, heard):
    """Times for every script word from Whisper's words, matched by sequence."""
    a = [norm(w) for w in script_words]
    b = [norm(w['word']) for w in heard]
    times = [None] * len(a)
    flags, matched = [], 0
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'equal':
            for k in range(i2 - i1):
                times[i1 + k] = (heard[j1 + k]['start'], heard[j1 + k]['end'])
            matched += i2 - i1
            continue
        if i2 == i1:   # Whisper heard words the script does not have
            flags.append(('extra', ' '.join(w['word'] for w in heard[j1:j2])))
            continue
        if j2 > j1:
            t0, t1 = heard[j1]['start'], heard[j2 - 1]['end']
        else:
            t0 = heard[j1 - 1]['end'] if j1 > 0 else 0.0
            t1 = heard[j1]['start'] if j1 < len(heard) else t0 + 0.3 * (i2 - i1)
            if i2 - i1 >= 2:
                flags.append(('unheard', ' '.join(script_words[i1:i2])))
        weights = [len(x) + 1 for x in a[i1:i2]]
        tot, acc = sum(weights), 0.0
        for k, wgt in enumerate(weights):
            s = t0 + (t1 - t0) * acc / tot
            acc += wgt
            times[i1 + k] = (s, t0 + (t1 - t0) * acc / tot)
        if j2 > j1 and op == 'replace':
            flags.append(('heard', ' '.join(script_words[i1:i2]) + ' -> ' + ' '.join(w['word'] for w in heard[j1:j2])))
    return times, matched / max(1, len(a)), flags


# ---------- audio helpers ----------

def rms_db(x, win):
    n = len(x) // win
    if n == 0:
        return np.array([-120.0])
    w = x[: n * win].reshape(n, win)
    return 20 * np.log10(np.sqrt((w ** 2).mean(axis=1)) + 1e-9)


def trim_bounds(x):
    """First and last sample of the speech, with short margins (energy, 10 ms windows)."""
    win = SR // 100
    db = rms_db(x, win)
    loud = np.where(db > np.percentile(db, 95) - 40)[0]
    a = max(0, loud[0] * win - int(0.08 * SR))
    z = min(len(x), (loud[-1] + 1) * win + int(0.12 * SR))
    return a, z


def fade(x, n=120):
    x = x.copy()
    n = min(n, len(x) // 2)
    if n:
        ramp = np.linspace(0, 1, n, dtype=np.float32)
        x[:n] *= ramp; x[-n:] *= ramp[::-1]
    return x


# ---------- audio helpers ----------

def rms_db(x, win):
    n = len(x) // win
    if n == 0:
        return np.array([-120.0])
    w = x[: n * win].reshape(n, win)
    return 20 * np.log10(np.sqrt((w ** 2).mean(axis=1)) + 1e-9)


def quietest(x, t0, t1):
    """Sample index of the quietest 10 ms window between t0 and t1 (seconds)."""
    win = SR // 100
    a, z = int(max(0, t0) * SR), int(max(t0 + 0.01, t1) * SR)
    seg = x[a:z]
    if len(seg) < win:
        return (a + z) // 2
    db = rms_db(seg, win)
    return a + int(np.argmin(db)) * win + win // 2


def pause_between(x, t0, t1, floor=-50.0):
    """The voice's pause between two words: the longest run of 10 ms windows below `floor` dB between
    t0 and t1 (seconds), as (start, end) in seconds, or None if no run reaches 50 ms. The transcription's
    word times can be off at a beat boundary (a zero-length last word, a first word stretched back into
    the pause), so the boundary is read from the audio itself."""
    win = SR // 100
    a, z = int(max(0, t0) * SR), int(max(t0 + 0.01, t1) * SR)
    db = rms_db(x[a:z], win)
    best = run = None
    for k, v in enumerate(db):
        if v < floor:
            run = (run[0], k + 1) if run else (k, k + 1)
            if best is None or run[1] - run[0] > best[1] - best[0]:
                best = run
        else:
            run = None
    if not best or best[1] - best[0] < 5:
        return None
    return (a + best[0] * win) / SR, (a + best[1] * win) / SR


def zeros(sec):
    return np.zeros(int(round(sec * SR)), dtype=np.float32)


def synth(p, instructions, takes, offline, report):
    text = passage_text(p)
    take = takes.get(p['id'], 0)
    h, x = speech(text, instructions, take, offline)
    tr = transcribe(h, offline)
    words = text.split()
    times, ratio, flags = align(words, tr.get('words', []))
    n_sp = times[-1][1] - times[0][0]
    report.append(dict(passage=p['id'], take=take, words=len(words), seconds=round(len(x) / SR, 2),
                       wpm=round(60 * len(words) / n_sp), matched=round(ratio, 3), flags=flags, cache=h[:12]))
    return x, times


def build_chapter(ch, passages, instructions, takes, needs, offline, report):
    # 1. one natural timeline: the passages' audio and word times, joined
    xs, wt, beats, para_of = [], [], [], []
    off = 0.0
    para_pauses_nat = []
    passage_cuts = []
    for pi, p in enumerate(passages):
        x, times = synth(p, instructions, takes, offline, report)
        k = 0
        for qi, para in enumerate(p['paragraphs']):
            for b in para:
                n = len(b['text'].split())
                beats.append(dict(b, passage=pi, para=(pi, qi), times=[(s, e) for s, e in times[k:k + n]]))
                k += n
        xs.append(x)
        # beat boundaries inside this passage, from the voice's own pauses
        idx = [i for i, b in enumerate(beats) if b['passage'] == pi]
        cuts = [0]
        for i in idx[1:]:
            prev, nxt = beats[i - 1]['times'], beats[i]['times']
            gap = pause_between(x, prev[-1][0], nxt[0][1])
            if gap:
                # the beat boundary is the middle of the voice's pause; the boundary words end and start there
                prev[-1] = (prev[-1][0], gap[0])
                nxt[0] = (gap[1], max(nxt[0][1], gap[1] + 0.05))
                cuts.append(int(round((gap[0] + gap[1]) / 2 * SR)))
            else:
                cuts.append(quietest(x, prev[-1][1] - 0.05, nxt[0][0] + 0.02))
        cuts.append(len(x))
        passage_cuts.append(cuts)
        # the passage's first and last words, from the audio's edge silences
        head = pause_between(x, 0.0, beats[idx[0]]['times'][0][1])
        if head and head[0] < 0.02:
            s0, e0 = beats[idx[0]]['times'][0]
            beats[idx[0]]['times'][0] = (head[1], max(e0, head[1] + 0.05))
        s1, e1 = beats[idx[-1]]['times'][-1]
        tailp = pause_between(x, s1, len(x) / SR)
        if tailp and tailp[1] > len(x) / SR - 0.02 and tailp[0] > s1:
            beats[idx[-1]]['times'][-1] = (s1, tailp[0])
    # the voice's own paragraph pauses inside each passage (for the join rule)
    for i in range(1, len(beats)):
        a, b = beats[i - 1], beats[i]
        if a['passage'] == b['passage'] and a['para'] != b['para']:
            para_pauses_nat.append(b['times'][0][0] - a['times'][-1][1])
    med_para = float(np.median(para_pauses_nat)) if para_pauses_nat else 0.0
    # 2. lay out: audio pieces, with silences only where a need or a join asks for them
    out, t, inserted = [], 0.0, []
    first = beats[0]
    lead = max([n['seconds'] for n in needs.get(first['id'], []) if n['word'] == 'lead'] or [0.0])
    if lead > first['times'][0][0]:
        add = lead - first['times'][0][0]
        out.append(zeros(add)); t += len(out[-1]) / SR
        inserted.append(dict(at=0.0, seconds=round(add, 3), where='chapter start', reason=[n['reason'] for n in needs[first['id']] if n['word'] == 'lead']))
    # walk beats; each beat's audio runs from its cut to the next cut in its passage
    pieces = []                    # (passage index, sample a, sample z, beat index)
    for pi in range(len(passages)):
        idx = [i for i, b in enumerate(beats) if b['passage'] == pi]
        x = xs[pi]
        cuts = passage_cuts[pi]
        for j, i in enumerate(idx):
            pieces.append((pi, cuts[j], cuts[j + 1], i))
    recs = []
    for n_piece, (pi, a, z, i) in enumerate(pieces):
        b = beats[i]
        x = xs[pi]
        if n_piece > 0 and pieces[n_piece - 1][0] != pi:
            # passage join: the voice's own edges (end of previous piece + start of this one) are already
            # in the audio; lengthen to the chapter's median paragraph pause if they fall short
            prev_end = recs[-1]['end']
            first_word = t + (b['times'][0][0] - a / SR)
            gap = first_word - prev_end
            if gap < med_para:
                out.append(zeros(med_para - gap)); t += len(out[-1]) / SR
                inserted.append(dict(at=round(t, 3), seconds=round(med_para - gap, 3), where='passage join',
                                     reason=['median paragraph pause of the voice in this chapter']))
        start = t
        seg = x[a:z].copy()
        base = t - a / SR
        words = [dict(word=w, start=round(base + s, 3), end=round(base + e, 3))
                 for w, (s, e) in zip(b['text'].split(), b['times'])]
        out.append(seg); t += len(seg) / SR
        rec = dict(id=b['id'], status=b['status'], hold='short', paragraph=f"{b['passage'] + 1}.{b['para'][1] + 1}",
                   start=round(max(start, lead) if n_piece == 0 else start, 3), end=words[-1]['end'], holdEnd=None,
                   text=b['text'], words=words)
        # needs of this beat: the latest time its motions finish
        req, why = 0.0, []
        for nd in needs.get(b['id'], []):
            if nd['word'] == 'lead':
                continue
            if nd['word'] == 'tail':
                t0 = rec['end']
            else:
                hits = [w['start'] for w in words if norm(w['word']) == norm(nd['word'])]
                if not hits:
                    raise SystemExit(f"{b['id']}: need() word not spoken: {nd['word']}")
                t0 = hits[0]
            if t0 + nd['seconds'] > req:
                req, why = t0 + nd['seconds'], [f"{nd['word']}+{nd['seconds']}: {nd['reason']}"]
        if req > t:
            # the next beat would start before this beat's motion is done: lengthen the pause here
            add = req - t
            out.append(zeros(add)); t += len(out[-1]) / SR
            inserted.append(dict(at=round(t - add, 3), seconds=round(add, 3), where=f"after {b['id']}", reason=why))
        recs.append(rec)
    for i in range(len(recs) - 1):
        recs[i]['holdEnd'] = recs[i + 1]['start']
    recs[-1]['holdEnd'] = round(t, 3)
    # an inserted silence is spliced at the end of a piece, which is the quietest point of the gap
    wav = np.concatenate(out)
    sf.write(AUDIO / f'{ch}.wav', wav, SR, subtype='PCM_16')
    meta = dict(chapter=ch, voice=VOICE, model=TTS_MODEL, speed=None, audio=f'{ch}.wav',
                duration=round(len(wav) / SR, 3), inserted=inserted, beats=recs)
    (AUDIO / f'{ch}.beats.json').write_text(json.dumps(meta, indent=1, ensure_ascii=False))
    nw = sum(len(b['words']) for b in recs)
    ins = sum(d['seconds'] for d in inserted)
    print(f'{ch}: {meta["duration"]:.1f} s, {len(recs)} beats, {nw} words, inserted {ins:.2f} s in {len(inserted)} places', flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--chapters', default='')
    ap.add_argument('--passages', default='', help='only synthesize and report these passages (no chapter files)')
    ap.add_argument('--offline', action='store_true')
    ap.add_argument('--take', type=int, default=None, help='with --passages: try this take instead of takes.json')
    a = ap.parse_args()
    instructions = (AUDIO / 'instructions.txt').read_text().strip()
    takes = json.loads((AUDIO / 'takes.json').read_text()) if (AUDIO / 'takes.json').exists() else {}
    chapters = parse_script()
    needs = scene_needs()
    report = []
    if a.passages:
        for ch, ps in chapters.items():
            for p in ps:
                if p['id'] in a.passages.split(','):
                    text = passage_text(p)
                    h, x = speech(text, instructions, a.take if a.take is not None else takes.get(p['id'], 0), a.offline)
                    tr = transcribe(h, a.offline)
                    times, ratio, flags = align(text.split(), tr.get('words', []))
                    n_sp = times[-1][1] - times[0][0]
                    print(f"{p['id']}: {len(text.split())} words, {len(x) / SR:.1f} s, "
                          f"{60 * len(text.split()) / n_sp:.0f} wpm, matched {ratio:.2f}, {flags}, cache {h[:12]}")
        print(f'spent so far ~{spent():.3f} USD')
        return
    want = a.chapters.split(',') if a.chapters else list(chapters)
    for ch in want:
        build_chapter(ch, chapters[ch], instructions, takes, needs, a.offline, report)
    (AUDIO / 'narration-report.json').write_text(json.dumps(report, indent=1, ensure_ascii=False))
    for r in report:
        print(f"  {r['passage']}: {r['words']} words, {r['seconds']} s, {r['wpm']} wpm, matched {r['matched']}"
              + ''.join(f'\n      {k}: {v}' for k, v in r['flags']))
    print(f'spent so far ~{spent():.3f} USD')


if __name__ == '__main__':
    main()
