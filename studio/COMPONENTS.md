# Scene components

Canvas 1920×1080, 30 fps. A scene is a pure function of `t`. The renderer calls `window.setTime(t)`. The scene sets `window.sceneDuration` (seconds) and `window.sceneEvents` (`[{t, beat, what}]`). No wall clock, no timer, no unseeded randomness.

Colour, font family and font size are written only in `lib/tokens.css`, `lib/tokens.js` and `lib/fonts.css`. Everything else uses the tokens.

## Chapter directory

```
scene.html    page
scene.js      picture as a function of t
beats.json    narration, or a symlink to it
```

Nothing else. `scene.html` links the stylesheets and scripts below. Paths assume the scene sits one directory below a folder that has `lib/` and `node_modules/` (the studio itself, as for `demo/`, or a project folder with symlinks `lib`, `node_modules` and `tools` to the studio). Run the tools from that folder.

## Beats

```json
{
  "chapter": "c1",
  "voice": "am_michael",
  "audio": "c1.wav",
  "duration": 61.4,
  "beats": [{
    "id": "c1b1",
    "status": "context",
    "hold": "normal",
    "start": 0.0,
    "end": 7.4,
    "holdEnd": 10.4,
    "text": "Each site carries energy.",
    "words": [{ "word": "Each", "start": 0.12, "end": 0.31 }]
  }]
}
```

`status` is `proved`, `claimed`, `heuristic`, `lean`, `definition` or `context`. `end` is the end of the last spoken word; `holdEnd` is the end of the silent hold that follows (the next beat starts there). A beat owns its hold: `beatAt(t)`, the strip, the contact sheet and the checks treat `[start, holdEnd)` as the beat (without `holdEnd`, up to the next beat's start). `hold: "short"` waives the 3 second hold after the last word. The renderer injects this object as `window.__BEATS__` before any scene script runs.

## Minimal scene

```html
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../lib/tokens.css">
<link rel="stylesheet" href="../lib/fonts.css">
<link rel="stylesheet" href="../lib/components.css">
<link rel="stylesheet" href="../node_modules/katex/dist/katex.min.css">
</head>
<body>
<script src="../lib/tokens.js"></script>
<script src="../lib/kit.js"></script>
<script src="../lib/cues.js"></script>
<script src="../node_modules/katex/dist/katex.min.js"></script>
<script src="../lib/strip.js"></script>
<script src="../lib/subtitles.js"></script>
<script src="scene.js"></script>
</body>
</html>
```

```js
installBeats(window.__BEATS__);
chapterLabel({ n: 3, title: "Why it is hard" });
const strip = mountStrip(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);
window.sceneEvents = [];
window.sceneDuration = beatEnd("c1b1");
window.setTime = function (t) {
  strip.setTime(t);
  subs.setTime(t);
};
```

Load only the scripts the scene uses. `katex.min.js` is required by equations and Lean code.

## Grid

Content area x 120–1800, y 80–880. Twelve columns, 118 px wide, 24 px gutters.

- `col(i)` left edge of column `i` (0-based).
- `span(i, n)` returns `{x, w}` covering `n` columns from `i`.
- CSS: `.col-0` … `.col-11` set `left`, `.span-1` … `.span-12` set `width`.

Subtitle band y 900–1020, max width 1500, centred. Status strip y 1040–1080. Chapter label sits in the top margin.

## Tokens and type

`lib/tokens.css` defines the colour, type and column tokens. `lib/tokens.js` mirrors the colours and exports `col` / `span`. `lib/fonts.css` loads Source Sans 3 (400, 600) and JetBrains Mono (400). Its one base path is `../node_modules`, relative to `lib/fonts.css`.

Type classes: `.t-title`, `.t-body`, `.t-label`, `.t-formula`, `.t-code`. Chrome, not counted in the two-sizes rule: `.t-subtitle`, `.t-strip`, `.t-chapter`. `.strong` sets weight 600.

Put `data-box="name"` on every box the layout check should measure. `data-band="subtitle|strip|chapter"` places a box in that band instead of the content area. `data-group` allows overlap between boxes that share a value. A box inside another box may overlap its ancestor.

## Kit (`lib/kit.js`)

- `ease(x)` smoothstep, `clamp(x, a, b)`, `lerp(a, b, t)`, `fade(t, t0, dur)`.
- `mulberry32(seed)` returns a deterministic function of numbers in `[0, 1)`.
- `installBeats(data)` reads a beats object and defines `beatStart(id)`, `beatEnd(id)` (last word), `beatHoldEnd(id)` (end of the hold), `word(id, k)` (zero-based), `cue(id, word)` (first match of a whole word, ignoring case and surrounding punctuation), `beatAt(t)` (null before the first beat starts, e.g. during a chapter opening), and `need(id, word, seconds, reason)`.
- `need(id, word, seconds, reason)` declares that a motion starting at `cue(id, word)` lasts `seconds` and must finish before the next beat; `word` may be `"tail"` (from the beat's last word) or `"lead"` (before the beat's first word). It returns `seconds`, so a scene writes `const D = need(...)` and animates with `D`; the film's narration tool reads these calls (literal numbers) and lengthens a natural pause only where the voice gives less time. Calls are recorded in `window.sceneNeeds`.

## Components

Each `setTime(t)` only changes opacity, transform or visibility. Builds happen at load.

- `mountStrip(parent)` — status strip from `beatAt(t).status` (neutral, without a label, when there is no beat), with the labels "Proved in the literature", "Claimed: manuscript, not independently reviewed", "Heuristic: illustration, proves nothing", "Checked by the Lean kernel", "Definition", "Context". Heuristic draws a dashed top edge. Lean draws a 16 px square seal before the label. Definition and context use the rule colour with ink text.
- `ledgerCard({parent, status, title, lines, x, y, w, tIn, tOut})` — at most two detail lines. Enters over 0.4 s (fade, rise 12 px) and leaves by a fade.
- `heuristicBadge({parent, x, y})` — the fixed label "illustration, proves nothing". `setVisible(on)`.
- `chapterLabel({parent, n, title, intro})` or `{text}`. With `intro: seconds` the label is a chapter opening: from t = 0 it fades in large (title size) at the centre, then moves into its place; call its `setTime(t)`. `chapterBreak(t, t0, dur)` is true for `dur` seconds (default 2) from `t0`.
- `mountSubtitles(parent, beats)` — cues from the word timings; each cue (a whole phrase, the same cues as `tools/srt.js` writes) is shown from its first word to its end.
- `mountEquation({parent, x, y, w, h, tex, schedule})` — KaTeX (`trust`, `strict: false`, HTML only). Mark terms with `\htmlClass{term-<name>}{...}`. `schedule` maps a name to the time it fades in. `colorTerm(eq, name, "--obj-hopping")` colours a term. `moveTerm(eq, {tex, name, t0, t1})` cross-fades that term between two pre-rendered states, aligned on one baseline and the left edge.
- `lattice({parent, x, y, n, spacing, origin, seed, marks, amp})` — square patch. `marks` is `{"i,j": "active"|"terminal"|"pending"|"plain"}`. `amp(x, y, t)` in `[0, 1]` sets the wave-disc radius. Site values come from `seed`.
- `proofMap({parent, x, y, w, h, nodes, edges, stateAt, zoomAt})` — `nodes` are `{id, label, col, row, status, seal}` on a grid of at least four columns (five when a node has `col: 4`), as many rows as the data uses; `seal: true` draws the small Lean seal. An edge between rows is drawn as an elbow through the gap between the rows. Labels are counted one by one by the word check. `edges` are `[[from, to]]`. `stateAt(t)` returns `{id: "dim"|"active"|"done"|"hidden"}`, or per node an object `{state, status, seal}` that also overrides the node's status colour and seal at that time; edges to a hidden node are hidden. `zoomAt(t)` returns `{id, k}` with `k` in `[0, 1]`, or null.
- `sideBySide({parent, x, y, colW, rowH, gap, left, right, pairs, schedule})` — `left` and `right` are `[{id, lines}]`. The left column is plain words in the sans face (`.t-label`; a clause may set `code: true`); the right column is Lean code (not counted by the word check). A lit pair gets ink text, a light Lean-blue underlay and a 6 px Lean bar; unlit clauses are muted. Symbols outside Latin-1, and the math signs in the table `MAP` of `leancode.js` (such as ±), are KaTeX glyphs on the code baseline. `pairs` is `[[leftId, rightId]]`. `schedule` maps a left id to the time that pair lights.

- `paperStack({parent, box, x, y, w, h, count, thumb, closeup, aspect})` — a paper as an object (`lib/paper.js`): `count` page masks `thumb(n)` (small images, ink as alpha) in a stack that fans out, and vector masks `closeup[n]` for pages brought forward. `show({enter, fan, forward: {page, k}, zoom: {region, k}, highlight: {region, k, status}, fade})`, every value in [0, 1]; `region` is `{x0, y0, x1, y1}` in fractions of the page. Pages are drawn in `--ink-muted` on `--paper-raised`. The clip box is measured by the layout check and not word-counted.

## Tools

```sh
node tools/render.js <scene.html> <beats.json> <outDir> [--from s --to s --fps 30 --every n]
tools/encode.sh <framesDir> <audio.wav> <out.mp4> [fps]
tools/concat.sh <out.mp4> <a.mp4> [b.mp4 ...]
node tools/contact.js <framesDir> <beats.json> <out.png> [--step 1.5 --fps 30 --count N --cols 6]
node tools/srt.js <beats.json> <out.srt>
node tools/check.js <layout|palette|timing|all> <scene.html|dir> [beats.json]
```

`render.js` stops with the error if the scene throws while loading or a file fails to load. It injects the beats, waits for `document.fonts.ready` and `window.sceneReady` if the scene defines it, and writes `f00000.png` onward. Up to three pages render at once. `encode.sh` writes H.264 yuv420p CRF 18 and AAC 192k, cut to the audio length. `contact.js` tiles 480×270 frames, six per row, with the time and beat id under each. `--count N` picks N frames from the first to the last.

`check.js palette <dir>` lints HTML, CSS and JS. It skips `node_modules`, `.venv`, `out`, `smoke` and, unless that directory is the target, `test/controls`. `palette <scene.html> <beats.json>` also samples pixels. `layout` and `timing` need the beats file. `all` runs every check. Exit status is non-zero if any item fails.

The subtitle check requires the burned-in subtitle to be exactly the cue active at that time (empty when none). The layout check samples each beat at its start, middle, last word and the end of its hold. A box with `data-words="skip"` (code) is not word-counted; `data-words="per-text"` (a diagram) counts each label separately.

`test/run.sh` checks the demo (must pass) and the six controls (each must fail its named check).
