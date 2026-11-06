# The Poincaré conjecture: an exposition

An article (21 pages) and a narrated film (10 minutes 3 seconds, in 4K, with subtitles in the picture and a quiet music bed) on the three-dimensional Poincaré conjecture, on the Hamilton–Perelman proof by Ricci flow with surgery, and on what the Lean formalization verified on MathDB (problem 316224) certifies.

Prepared by Yao Xu with AI assistance; the narration voice is synthesized with an OpenAI speech model.

## What the exposition covers

1. The problem and its history: three-manifolds, simple connectivity, Poincaré's question and his homology-sphere example, the higher-dimensional cases (Smale, Freedman), Moise's theorem.
2. Ricci flow and Hamilton's programme.
3. Perelman's entropy and no local collapsing.
4. Singularities, κ-solutions and canonical neighbourhoods.
5. Surgery, including necks that do not separate.
6. Finite extinction for simply connected manifolds: the width, its inequality, the curvature bound, the explicit deadline, why one deadline holds for every component, and the Colding–Minicozzi route with its own constants.
7. The topological conclusion.
8. The Lean formalization: the frozen MathDB statement clause by clause, how the submission proves it, its axioms, and what the check does and does not certify.
9. Sources, and who did what.

## Status of each part

- **The Poincaré conjecture is proved.** Perelman's three preprints (arXiv, 2002–2003) were checked in full by Kleiner–Lott, Morgan–Tian and Cao–Zhu, whose accounts appeared in 2006; the Clay Mathematics Institute awarded Perelman its Millennium Prize in 2010, citing these expositions and the community's scrutiny. This acceptance is a judgement of the mathematical community about published mathematics.
- **Checked in Lean:** the frozen MathDB statement `Problem.Target` (every Hausdorff space charted on ℝ³ and homotopy equivalent to S³ is homeomorphic to S³) is proved by `Submission.solution` in [differential-geometry-mathdb](https://github.com/liao9yuan/differential-geometry-mathdb) at commit `9f65eaf9`, a submission fork of [DifferentialGeometry](https://github.com/qinz1yang/differential-geometry) v0.1.3 by Ziyang Qin, Yuan Liao, Ayush Khaitan and Bennett Chow (arXiv:2609.33842), with only the axioms `propext`, `Classical.choice`, `Quot.sound`. We read the Lean source at the pinned revisions; we did not rebuild it.
- **Not certified by that check:** the text of Perelman's papers; the meaning of the library's internal definitions (stated by its authors to be checked by hand; we know of no independent review); the trusted base (kernel and toolchain). Section 8.6 of the article says exactly what is and is not certified.
- **This exposition** is our own work and has not been peer reviewed. Our contribution is the exposition and the clause-by-clause reading of the formal statement; the mathematics is due to the authors cited. Every claim is traced in `article/CLAIMS.md`.

## Contents

| Path | What it is |
|---|---|
| `article/exposition.md` | the article (Markdown with LaTeX math; the PDF is built from it) |
| `article/CLAIMS.md` | every claim of the article with its source and status (proved, Lean, heuristic, record, ours) |
| `article/SOURCES.md` | every citation with its locator and how it was verified |
| `article/figures/` | the figures as SVG and their generator; figures 1–4 embed 3D pictures (`3d/*.png`) rendered with three.js by `render3d.js` from `fig3d.js` |
| `film/script.md` | the narration, beat by beat, with the claim status of each beat |
| `film/narration.txt`, `film/subtitles.srt` | the spoken text and the subtitles of the whole film |
| `film/audio/*.beats.json` | word timings of the narration, which set the timing of every scene |
| `film/audio/narration.json`, `film/audio/instructions.txt`, `film/audio/takes.json` | length and checksum of each chapter's narration; the delivery text the voice was given; the takes used |
| `film/scenes/` | the scenes: HTML/SVG pages whose picture is a function of time; `film/scenes/paper/` holds the pages of the formalization paper, `film/scenes/c8/leantext.js` the quoted Lean source (see [THIRD_PARTY.md](THIRD_PARTY.md)); `film/scenes/three3d/` the 3D stage and shapes (three.js through WebGL; every 3D picture of a manifold is an illustration and says so on screen) |
| `film/tools/` | narration, assembly, music and check scripts |
| `studio/` | the scene components, render and check tools, pinned |

Attached to the release, not stored in Git:

| File | What it is |
|---|---|
| `poincare-exposition-film-4k.mp4` | the film, 3840×2160 (the 1920×1080 layout rendered at twice the pixel density), with the subtitles in the picture; their text is `film/subtitles.srt` |
| `poincare-exposition-narration.flac` | the narration (voice only), lossless, all nine chapters in order; the film is rebuilt from it, and the build adds the music bed |
| `poincare-exposition-article.pdf` | the article |

The narration was synthesized once, passage by passage, with the settings in `film/tools/narrate.py` and `film/audio/instructions.txt`; word timings come from automatic transcription of that audio, mapped onto the script. The music bed is composed in code (`film/tools/music_bed.py`, fixed seed) and mixed under the narration when the film is joined. The build reuses the saved narration and does not call the speech service.

## Rebuild

Requirements: Node.js 20 or later, Python 3.12 with the packages in `studio/requirements.txt` (`python3 -m pip install -r studio/requirements.txt`; `PYTHON=...` selects another interpreter for `build.sh`), ffmpeg, pandoc 3 with XeLaTeX (TeX Live with the Libertinus and GNU FreeFont fonts).

```sh
cd studio && npm ci && npx playwright install chromium     # pinned versions from package-lock.json
cd ..
./build.sh article                                          # article/build/exposition.pdf
./build.sh narration poincare-exposition-narration.flac     # film/audio/c1..c9.wav, checked against narration.json
./build.sh film             # renders every chapter at 4K, runs the checks, joins film/out/film-4k.mp4 (and film-1080p.mp4, a downscaled copy for qc_strip.py)
```

Every scene is deterministic: a frame depends only on its time. `./build.sh narration` restores the chapter audio from the FLAC file and refuses audio that differs from the recorded checksums. `./build.sh film` also runs every scene check; `python3 film/tools/qc_strip.py` (from `film/`) checks the status strip of the finished film against the script.

## Licences

- Article, film, script, narration text, subtitles and figures: [CC BY 4.0](LICENSE-CC-BY-4.0.txt).
- Code (studio components, scenes, build scripts): [Apache-2.0](LICENSE-APACHE-2.0.txt).
- Third-party material shown in the film (pages of the formalization paper, CC BY 4.0; quoted Lean source, Apache-2.0) keeps its licence and credit; see [THIRD_PARTY.md](THIRD_PARTY.md).
- Installed, not copied: KaTeX (MIT), Playwright (Apache-2.0), Source Sans 3 and JetBrains Mono (SIL Open Font License 1.1).
