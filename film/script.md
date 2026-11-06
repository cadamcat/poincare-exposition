# Script: The Poincaré conjecture

Narration written for the ear: short sentences, one idea per sentence, formulas said the way a lecturer says them at the board. Each beat is one line: `- **id** `status` text`. Status is one of `definition`, `context`, `proved`, `heuristic`, `lean` and sets the status strip (`proved` = proved in the literature; for Perelman's work, proved in his preprints as verified by the 2006 expositions). The subtitles use exactly these words.

The voice reads one passage per chapter (long chapters in two halves); a line `<!-- passage -->` starts a passage. Beats on consecutive lines form one paragraph; a blank line starts a new paragraph. Every pause in the film is the voice's own. Picture time comes from build-ups under the narration. Where a scene declares that a motion needs more time than the voice gives (`need("beat", "word", seconds, "reason")` in its `scene.js`), `tools/narrate.py` lengthens the natural pause at that point by exactly the missing time.

Notation, each symbol defined once, with its own letter: `M` the manifold; `S³` the three-sphere; `g` the metric; `t` time; `R` the scalar curvature (`R min` its minimum at a time); `Ric` the Ricci curvature; `κ` (kappa) the noncollapsing constant; `W` the width (`W zero` at the start); `c` the constant in the curvature bound; `T*` (T star) the extinction deadline. No other letters are used on screen. Lengths in the round-sphere example are written as the word "radius".

Article sections (A) behind each chapter: c1 A 1.1; c2 A 1.1–1.3; c3 A 2; c4 A 3–4; c5 A 5; c6 A 6–7; c7 A 7.1; c8 A 8; c9 A 1.3.

End card (not spoken; silent, about 6.5 s, music swelling): references for every work the film names, the formalization as a reference line, "Full list with locators: the accompanying article.", then the one AI line: "Prepared by Yao Xu with AI assistance; the narration voice is synthesized with an OpenAI speech model."

## c1 · Cold open

<!-- passage -->
- **c1b1** `heuristic` Stretch a rubber band around an apple. You can slide it over the surface and shrink it to a point, without tearing it.
- **c1b2** `heuristic` Around a doughnut, a band through the hole cannot shrink. These are surfaces, so this picture lives in two dimensions.

- **c1b3** `context` In nineteen oh four, Henri Poincaré asked the same question one dimension up. Nearly a century passed before it was answered.
- **c1b4** `context` This film explains that answer: the proof by Ricci flow, and what a computer proof checker has now verified.

## c2 · The question

<!-- passage -->
- **c2b1** `definition` A three-dimensional manifold is a space that looks, near every point, like ordinary space. We call it M. Closed means that M is compact, with no edge.
- **c2b2** `definition` The simplest example is the three-sphere. It is the set of points at distance one from the origin, in four-dimensional space.
- **c2b3** `definition` We cannot draw it whole. But near each point it looks like a piece of ordinary space, just as a small patch of the earth looks flat.

<!-- passage -->
- **c2b4** `definition` M is simply connected if it is connected and every loop in M can be shrunk to a point, without leaving M.
- **c2b5** `context` Poincaré's question, in modern words: is every closed, simply connected three-manifold homeomorphic to the three-sphere? Homeomorphic means matched point for point, continuously in both directions.
- **c2b6** `proved` The loop test is essential. Poincaré himself found a space with the same homology as the sphere, yet with a loop that cannot shrink. So it is not a sphere.

- **c2b7** `proved` In dimensions above three, the question was settled first. Smale proved it for smooth manifolds from dimension five up, in nineteen sixty-one. Freedman proved dimension four, in nineteen eighty-two.
- **c2b8** `context` Dimension three was the last case left.

## c3 · Ricci flow

<!-- passage -->
- **c3b1** `definition` Richard Hamilton's idea was to give M a shape, and let the shape improve itself. A metric, called g, measures lengths on M. From it one computes curvature. R, the scalar curvature, is one number at every point.
- **c3b2** `definition` In nineteen eighty-two, Hamilton introduced the Ricci flow. The metric changes with time, t. Its rate of change is minus two times the Ricci curvature, a curvature that depends on direction.
- **c3b3** `heuristic` Like heat spreading through a metal plate, the flow tends to even out the curvature.

<!-- passage -->
- **c3b4** `proved` A round sphere stays round and shrinks. Its radius squared drops by four in every unit of time, until the sphere vanishes.
- **c3b5** `proved` Hamilton proved that if the Ricci curvature is positive everywhere, the rescaled flow makes M round in the limit. Then M is the three-sphere, or a quotient of it by a finite group of rotations.

- **c3b6** `heuristic` In general, the flow can run into singularities. Here a thin neck pinches, while the ends are still large. Each circle around this shape stands for a whole two-sphere, so the picture shows a three-dimensional space.
- **c3b7** `context` Hamilton's plan was surgery: cut the neck, cap the ends, and continue the flow. To make it work, one had to know every shape a singularity can take.

## c4 · Perelman's tools

<!-- passage -->
- **c4b1** `context` Here is the plan of the proof, as a map. Five steps lead to a statement about the flow. Four more turn it into topology. The first box, Ricci flow, we have just seen.
- **c4b2** `proved` In two thousand two and two thousand three, Grisha Perelman posted three papers. The first gives a kind of entropy, a quantity that never decreases along the flow. For this, a companion function must evolve backwards in time, by a heat equation.
- **c4b3** `proved` From it, Perelman proved no local collapsing. Where the curvature is controlled at some scale, a ball of that size keeps a definite share of its volume. That share is called kappa.

<!-- passage -->
- **c4b4** `proved` Near a singularity, one can zoom in and get a limit. The limits exist for all past time, and Perelman calls them kappa solutions. For a fixed kappa, after rescaling, they form a compact family.
- **c4b5** `proved` Every point of a kappa solution sits in one of a few shapes. A neck, almost a round cylinder. A cap, closing off a neck: a ball, or projective space with a ball removed. Or a whole closed piece of positive curvature, often close to round.
- **c4b6** `proved` This is the canonical neighbourhood theorem. Wherever the curvature is large, the flow looks like one of these shapes.

## c5 · Surgery

<!-- passage -->
- **c5b1** `proved` Now surgery can be done in a standard way. Find a thin neck, cut it along its middle sphere, and glue a standard cap onto each side. Pieces that are almost round are set aside. Then the flow restarts.
- **c5b2** `proved` Each surgery removes a definite amount of volume. So surgeries cannot pile up in a finite time.
- **c5b3** `proved` Perelman proved that the canonical neighbourhoods survive every surgery. So the flow with surgery runs for all time, from any starting shape.

- **c5b4** `proved` Topologically, cutting a neck undoes a connected sum. If the neck separates M, then M falls into two simpler pieces.
- **c5b5** `proved` But a neck need not separate. Picture a tube bent into a ring. Each circle stands for a two-sphere, so this is the product of a two-sphere and a circle. Cutting one neck leaves a single piece, a three-sphere.

## c6 · Finite extinction

<!-- passage -->
- **c6b1** `proved` One question remains: does the flow with surgery ever stop? For a simply connected M, it does. After a finite time, nothing is left. This is finite extinction.
- **c6b2** `definition` Perelman measures M by a width, called W. Take a family of loops that sweeps across M. Fill each loop with a disc of least area. W is the smallest possible value of the largest disc area.
- **c6b3** `proved` Under the flow, d W by d t is at most minus two pi, minus one half of R min times W. Here R min is the smallest scalar curvature at that time.
- **c6b4** `proved` And the scalar curvature cannot become very negative. R min is at least minus three halves, over t plus c, where c is a constant fixed by the starting metric.

- **c6b5** `proved` Put the two together and integrate. The width is held below a curve that reaches zero at a finite time, T star. A width cannot be negative, so by T star nothing is left.

<!-- passage -->
- **c6b6** `proved` This deadline holds for every piece at once. Trace any surviving piece back through the surgeries. Its ancestors lead to M at the start, so its width starts at the same value, W zero. Surgery never raises the width. One deadline covers them all.
- **c6b7** `proved` Colding and Minicozzi gave a second proof, sweeping with spheres instead of loops. Their width falls with four pi in place of two pi. Each route keeps its own constants.

- **c6b8** `proved` Now read the history backwards. Every piece that vanished was built from the three-sphere, its quotients, and the product of a two-sphere and a circle. So M is a connected sum of such pieces.
- **c6b9** `proved` M is simply connected, so every piece must be simply connected too. Only the three-sphere qualifies. So M is the three-sphere, as a smooth manifold.
- **c6b10** `proved` If M comes without a smooth structure, Moise's theorem supplies one. So the conjecture holds, exactly as Poincaré asked it.

## c7 · The verdict

<!-- passage -->
- **c7b1** `context` Perelman never published his papers in a journal. Instead, teams of mathematicians checked them in full. By two thousand six, Kleiner and Lott, Morgan and Tian, and Cao and Zhu had posted complete accounts.
- **c7b2** `proved` The proof is accepted. In two thousand ten, the Clay Mathematics Institute awarded Perelman its Millennium Prize, crediting these accounts and years of scrutiny.
- **c7b3** `context` That is a judgement made by people. What follows is different: a machine check of a formal proof.

## c8 · What Lean checked

<!-- passage -->
- **c8b1** `lean` In twenty twenty-six, Ziyang Qin, Yuan Liao, Ayush Khaitan and Bennett Chow formalized the proof in Lean, a proof assistant. Lean's kernel checks every step of a proof against the rules of its logic.
- **c8b2** `lean` The formal proof follows Hamilton and Perelman, through Ricci flow, surgery and finite extinction, and it includes Moise's theorem. So every box of the plan has a formal counterpart, proved in Lean. A blue seal marks a box proved in Lean.

- **c8b3** `lean` On MathDB, the conjecture is stated in Lean. Here it is, clause by clause. For every space M, with a topology, in which two points can always be kept apart,
- **c8b4** `lean` with charts that make M look like three-dimensional space near every point,
- **c8b5** `lean` if M is homotopy equivalent to the three-sphere, that is, there are maps both ways whose composites can be deformed to the identity,
- **c8b6** `lean` then M is homeomorphic to the three-sphere.
- **c8b7** `lean` Compactness is not assumed. The proof derives it, and simple connectivity, from the homotopy equivalence. Then it applies the theorem we have followed.

<!-- passage -->
- **c8b8** `lean` The check uses only Lean's three standard axioms: propositional extensionality, the axiom of choice, and the soundness of quotients. No step is left unfinished.

- **c8b9** `context` What does the check not certify? First, Perelman's papers. The kernel checks the formal proof, not any written text.
- **c8b10** `context` Second, the library's own definitions, of Ricci flow, surgery and width. Its authors state that they checked them by hand. We know of no independent review.
- **c8b11** `context` So to trust this result, you trust three things. The Lean kernel and its tools. That the words of the final statement mean what we said. And that this statement is Poincaré's question.

- **c8b12** `context` In short: mathematicians accept Perelman's proof, and the formal statement now has a complete, machine-checked proof.

## c9 · What remains

<!-- passage -->
- **c9b1** `context` One relative of the question is still open. In dimension four, is every smooth homotopy four-sphere the standard sphere, as a smooth manifold? Nobody knows.
