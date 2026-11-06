# Third-party material

## Pages of the formalization paper

`film/scenes/paper/` holds images of the six pages of Z. Qin, Y. Liao, A. Khaitan and B. Chow, *A Lean Formalization of the Hamilton–Perelman Proof of the Three-Dimensional Poincaré Conjecture*, arXiv:2609.33842v1 (27 September 2026), which arXiv distributes under the Creative Commons Attribution 4.0 licence (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/).

- `thumbs/p001.png` … `thumbs/p006.png`: every page, rasterised at 40 dpi and reduced to an ink mask (alpha channel only).
- `p001.svg`: the title page as a vector drawing.
- `pages.json`: the page count and the region of the title and authors, found in the text layer.

Changes: the pages were converted from the PDF by `film/tools/paper_pages.py` (poppler `pdftoppm`, `pdftocairo`, `pdftotext`) and are drawn as masks in the house colours, so the text appears pale on the paper ground; the content is not altered. The film shows them as an object (the stack of six pages and the title page); it does not reproduce the paper for reading. Credit is given on screen and on the end card.

No page of any other paper is shown. The titles and authors of Perelman's preprints and of the 2006 expositions are typeset by us.

## Lean source and verification output

`film/scenes/c8/leantext.js`, written by `film/tools/lean_text.py`, quotes verbatim:

- the definitions `ConjectureFor` and `Target` from `problems/millennium-poincare/YPoincare_poincare_conjecture.lean` of [mathdb-lean/problems](https://github.com/mathdb-lean/problems) at commit `26876961225fa83db241aa0d8b96f920cbc1c780` (© The Formal Conjectures Authors and the mathdb-lean Authors, Apache License 2.0);
- the theorem `Submission.solution` from `Submission.lean`, and one line of `verification/native-target-axioms.log`, of [differential-geometry-mathdb](https://github.com/liao9yuan/differential-geometry-mathdb) at commit `9f65eaf95b9ff5f1b39cfb2d2d24e51aed891568` (the DifferentialGeometry contributors, Apache License 2.0; its own `NOTICE` credits the sources it vendors).

The article quotes the same definitions and theorems, and `DifferentialGeometry.Topology.poincare_conjecture` from the same fork, with the same credit. A copy of the Apache License 2.0 is in [LICENSE-APACHE-2.0.txt](LICENSE-APACHE-2.0.txt).

## Installed, not copied

three.js 0.186.1 (MIT License, © 2010–2026 three.js authors, https://threejs.org) is pinned in `studio/package.json` and `studio/package-lock.json`. It renders the 3D pictures of the film (`film/scenes/three3d/`) and of article figures 1–4 (`article/figures/fig3d.js`; the rendered pictures are kept in `article/figures/3d/`).

KaTeX (MIT), Playwright (Apache-2.0), Source Sans 3 and JetBrains Mono (SIL Open Font License 1.1) are installed by the commands in `README.md`.
