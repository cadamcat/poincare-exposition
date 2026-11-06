# Claims of the article: sources and status

Each mathematical or factual claim of the article, its source, and its status:

- **proved**: proved in the published literature, or in Perelman's preprints as verified by the 2006 expositions;
- **Lean**: checked by the Lean kernel in the stated form (as recorded by the formalization's authors, the fork's audit and MathDB's verification; we did not rebuild);
- **heuristic**: explanation, analogy or picture only;
- **record**: a fact about documents, software, dates or awards, verified from the record named;
- **ours**: a step of exposition we supply (an elementary computation or a reading of a definition), checked by us.

Locators are those in `SOURCES.md`. "P-I", "P-II", "P-III" are Perelman2002, Perelman2003surgery, Perelman2003extinction; "KL" Kleiner–Lott; "MT" Morgan–Tian (arXiv v2 numbering); "QLKC" Qin–Liao–Khaitan–Chow; "fork" the MathDB submission fork at `9f65eaf9`.

| # | Article | Claim | Source | Status |
|---|---|---|---|---|
| 1 | Summary, 1.2 | Poincaré asked the question in 1904 | Poincare1904; Milnor2004 §1 | record |
| 2 | Summary, 7.1 | Perelman's three preprints, 2002–2003, never submitted to a journal | arXiv records; Clay2010 pp. 6–7 (preprints, verification by others) | record |
| 3 | Summary, 7.1 | 2006 expositions by Kleiner–Lott, Morgan–Tian, Cao–Zhu; dates of posting and publication | Clay2010 p. 7; Crossref for the journal data | record |
| 4 | Summary, 7.1 | Clay Millennium Prize awarded 2010; basis of verification (quotation) | Clay2010 pp. 1, 7 | record |
| 5 | 7.1 | Fields Medal 2006, citation, declined | IMU2006 | record |
| 6 | Summary, 8 | Lean formalization on Mathlib; MathDB target proved with the three standard axioms | QLKC abstract, §3; fork `verification/native-target-axioms.log` | Lean |
| 7 | Summary, 9.2 | Our contribution is the exposition and the clause-by-clause reading; not peer reviewed; AI note | — | record |
| 8 | 1.1 | Definitions of 3-manifold, closed, $S^3$, simply connected | Milnor2004 §1; standard | definition |
| 9 | 1.1 | The 2-sphere is the only simply connected closed surface | classification of surfaces, Milnor2004 §1 | proved |
| 10 | 1.2 | Milnor's phrasing of the question (quotation) | Milnor2004 §1 | record |
| 11 | 1.2 | Poincaré's 1900 false claim; 1904 counterexample with $\pi_1$ perfect of order 120 | Milnor2004 §2 and footnote 3 | proved |
| 12 | 1.2 | Closed simply connected 3-manifold ≃ $S^3$ (Poincaré duality, Hurewicz, Whitehead); converse | Hatcher2002 §4.2 Ex. 15; converse: $\pi_1$ is a homotopy invariant | proved |
| 13 | 1.3 | Smale (dim ≥ 5, smooth, 1961); Freedman (dim 4, topological, 1982); reason (discs in general position) | Smale1961; Freedman1982; Milnor2004 §3 | proved |
| 14 | 1.3 | TOP = PL = DIFF in dimension 3: smooth structures exist and are unique; homeomorphic ⇒ diffeomorphic (triangulation: Moise; triangulations to smooth structures: Whitehead, Munkres) | Moise1952; Moise1977; Milnor2004 §3; MT Introduction footnote 1 | proved |
| 15 | 1.4 | Thurston's geometrization (eight geometries); Poincaré is a case of elliptization | Thurston1982; Milnor2004 §4 | record (conjecture statement) |
| 16 | 1.4 | Perelman's work proves geometrization | Clay2010 p. 1–2, 6 | proved |
| 17 | 1.4 | The Poincaré route avoids the long-time analysis | KL §1; P-III Remark 1.4 | proved |
| 18 | 2.1 | Ricci flow equation $\partial_tg=-2\mathrm{Ric}$; shrinks in positively curved directions | Milnor2004 §5; P-I | definition |
| 19 | 2.1 | Heat-equation analogy | Milnor2004 §5 | heuristic |
| 20 | 2.1 | Round $S^3$: $\mathrm{Ric}=2g/r^2$; $r(t)^2=r(0)^2-4t$, extinct at $r(0)^2/4$ | Milnor2004 §5 (Ricci tensor); the ODE is ours | proved (elementary, ours) |
| 21 | 2.2 | Hamilton 1982: positive Ricci ⇒ constant positive curvature metric ⇒ quotient of $S^3$; the volume-normalized flow converges to it as $t\to\infty$ | Hamilton1982; as stated in Milnor2004 §5, Clay2010; formalized per fork README | proved |
| 22 | 2.2 | Neck pinch picture; finite-time singularities can occur but need not (flat $T^3$ is static) | Figure 2; $\mathrm{Ric}=0$ on a flat torus (elementary) | heuristic / proved (elementary) |
| 23 | 2.2 | Hamilton's surgery programme; 4-manifolds with positive isotropic curvature and no essential incompressible space form; gaps filled later | Hamilton1997 Theorem 1.1; ChenZhu2006; P-II Introduction; QLKC §2 | proved |
| 24 | 2.2 | Hamilton–Ivey pinching; compactness theorem; Harnack inequality; non-singular solutions | Hamilton1995sing, Ivey1993; Hamilton1995compact; Hamilton1993Harnack; Hamilton1999 | proved |
| 25 | 2.2 | The two obstacles (collapsing / injectivity radius; singularity classification and accumulation of surgery times) | P-I introduction; Clay2010 pp. 6–7 | record |
| 26 | 3.1 | Ricci flow is a gradient flow modulo diffeomorphisms | P-I §1.1 | proved |
| 27 | 3.1 | Formula for $\mathcal W$ and its constraint | P-I (3.1), (3.2) | definition |
| 28 | 3.1 | Monotonicity formula $d\mathcal W/dt=\int2\tau|\dots|^2\ge0$; $\mu$ monotone; equality only on shrinking solitons | P-I (3.3), (3.4), §3; KL §§11–12 | proved |
| 29 | 3.2 | Definition of κ-noncollapsed on scale ρ | P-I Definition 4.2 (Definition 8.1 is a parabolic variant) | definition |
| 30 | 3.2 | No local collapsing theorem; κ depends on initial metric, time interval, scale | P-I Theorems 4.1, 8.2; KL §§13, 26 | proved |
| 31 | 3.2 | Idea of proof via very negative $\mathcal W$ | P-I proof of 4.1 | heuristic (sketch) |
| 32 | 3.2 | $\mathcal L$-length, reduced length, reduced volume nonincreasing | P-I §7.1 and the monotonicity after (7.12) | proved |
| 33 | 3.2 | The reduced-volume version extends through surgery | KL §§78–79 | proved |
| 34 | 4.1 | Blow-up limits are ancient, nonnegatively curved, noncollapsed | P-I proof of 12.1 | heuristic (sketch) |
| 35 | 4.1 | Definition of ancient κ-solution | P-II §1.1; P-I §11.1 | definition |
| 36 | 4.1 | Compactness of noncompact ancient κ-solutions modulo scaling | P-I Theorem 11.7; P-II §1.1 | proved |
| 37 | 4.1 | Four neighbourhood types (strong ε-neck, ε-cap, closed $S^3$/$\mathbb{RP}^3$, constant positive curvature); ε-cap is a ball or punctured $\mathbb{RP}^3$ | P-II §1.5; KL §58; MT Theorem 9.93 | proved |
| 38 | 4.2 | Canonical neighbourhood theorem | P-I Theorem 12.1 | proved |
| 39 | 4.2 | Figure 3 | — | heuristic |
| 40 | 5.1 | Smooth limit away from the high-curvature region at the first singular time; horns | P-II §3; KL §67 | proved |
| 41 | 5.1 | Ricci flow with δ-cutoff: cut δ-necks of radius $h$ in ε-horns, glue standard caps, discard components | P-II §4.4 | proved |
| 42 | 5.1 | Standard solution: fixed rotationally symmetric metric, asymptotic cylinder of scalar curvature one, exists on $[0,1)$, unique, canonical neighbourhoods | P-II §2, Claims 1–5; KL §§60–66 | proved |
| 43 | 5.1 | Figure 4; cutting along a sphere and capping undoes a connected sum | standard topology | heuristic (picture); the topological fact is proved |
| 44 | 5.2 | Each surgery removes volume ≥ $h^3$; surgery times discrete; with time-dependent parameters bounded away from zero on finite intervals, finitely many surgeries on each finite interval | P-II §4.4 (quotations), §5.1 | proved |
| 45 | 5.2 | Volume grows at a bounded rate between surgeries ($d\mathrm{Vol}/dt=-\int R$, $R$ bounded below) | elementary, with Section 6.3 | ours |
| 46 | 5.2 | A priori assumptions persist; parameters $r(t)$, $\bar\delta(t)$ | P-II §§4–5, 6.1; KL §§68–80; MT Theorem 15.9 | proved |
| 47 | 5.2 | Topology change at surgery (connected-sum decomposition plus removal of listed components) | MT Theorem 0.3 | proved |
| 48 | 5.2 | Ricci flow with surgery exists for all time, every initial metric (normalized by scaling) | P-II §6.1; MT Theorem 0.3 | proved |
| 49 | 6.1 | Finite extinction for no aspherical factors, in particular simply connected | P-III Theorem 1.1; ColdingMinicozzi2005 Corollary 1.2 and §4; MT Theorem 18.1 | proved |
| 50 | 6.2 | Width via least-area discs of contractible loops; existence of a nontrivial class (Serre); $\pi_3\cong\mathbb Z$ for homotopy spheres; nonnegativity (positivity: P-III §3.1) | P-III §§1.1, 3.1; MT Claim 18.16, Definition 18.17 (construction), Claim 18.19 (nontrivial $\pi_3$) | proved |
| 51 | 6.3 | $\tfrac{d}{dt}W\le-2\pi-\tfrac12R_{\min}W$ (lim sup of forward difference quotients) | P-III Lemma 1.2; MT Proposition 18.18 | proved |
| 52 | 6.3 | Gauss–Bonnet explanation of Lemma 1.2 | P-III §1.2 (Perelman's own "idea") | heuristic |
| 53 | 6.3 | The inequality survives surgery (Lipschitz maps; homotopy sphere tracking the class) | P-III §§1.3–1.4; MT Proposition 18.18 | proved |
| 54 | 6.3 | $\partial_tR=\Delta R+2|\mathrm{Ric}|^2\ge\Delta R+\tfrac23R^2$ | P-III §1.3 | proved |
| 55 | 6.3 | $R_{\min}(t)\ge-3/(2(t+c))$ if $R\ge-3/(2c)$ at time 0; preserved by surgery; $c=\tfrac14$ for normalized metrics | maximum principle (ODE check ours); KL Lemma 79.11; QLKC §2 | proved |
| 56 | 6.4 | $W'\le-2\pi+\tfrac{3}{4(t+c)}W$; integrating factor; bound; $T_*=(c^{1/4}+W_0/(8\pi c^{3/4}))^4-c$ | QLKC §2 (same formulas); re-derived by us; fork `extinctionThreshold` has the same expression | proved (our check of QLKC's computation) |
| 57 | 6.4 | Perelman's $\hat A$ argument | P-III §1.3 (we checked $\hat A'\le-2\pi/(t+\mathrm{const})$ using $A\ge0$) | proved |
| 58 | 6.4 | Figure 5: $c=\tfrac14$, $W_0=6$, $T_*\approx3.40$ | `figures/make_figures.py` | heuristic (numerical illustration) |
| 59 | 6.5 | Colding–Minicozzi inequality with $-4\pi$ and $\tfrac{3}{4(t+C)}$; 2-sphere sweep-outs by energy | ColdingMinicozzi2005 Theorem 1.1 and §1; ColdingMinicozzi2008 Theorem 1.7, Corollary 1.11 | proved |
| 60 | 6.5 | $-4\pi$ vs $-2\pi$ reflects Gauss–Bonnet for sphere vs disc | ours (explanation) | heuristic |
| 61 | 6.5 | MT: $R_{\min}\ge-6/(1+4t)$, $w'=-2\pi+3w/(1+4t)$; 2015 correction, Bahri and Tao, no effect on the application | MT §18.3; MorganTian2015 p. 1 | proved / record |
| 62 | 6.5 | KL do not cover finite extinction | KL §1 | record |
| 63 | 7 | Extinction ⇒ $M$ is a connected sum of space forms and $S^2$-bundles over $S^1$ | MT Corollary 15.4 (1); proof of Theorem 0.1 in Ch. 18 | proved |
| 64 | 7 | van Kampen: $\pi_1$ of a connected sum is the free product; simply connected ⇒ all factors $S^3$ | MT proof of Theorem 0.1; standard topology | proved |
| 65 | 7 | Smooth Poincaré ⇒ topological via Moise | Moise1952; QLKC §1 | proved |
| 66 | 7 | Elliptization by the same argument | P-III Remark 1.4; MT Theorem 0.1 | proved |
| 67 | 7, Figure 6 | Proof map: every box proved in the literature, with a formal counterpart in the Lean library as its authors describe it | literature as above; fork README list of formalized theorems | proved / Lean (as recorded) |
| 68 | 8.1 | QLKC: what is formalized; release v0.1.3 `7a48598d`; Lean/Mathlib v4.33.1; Apache-2.0; NOTICE | QLKC abstract, §3; fork LICENSE, NOTICE | record |
| 69 | 8.1 | Fork contents and the 2026-10-26 edits | fork `MATHDB_SUBMISSION.md` | record |
| 70 | 8.1 | `9f65eaf9` is the revision MathDB verified | MathDB problem record as relayed to us (not opened) | record |
| 71 | 8.1 | Frozen target file, commit, SHA-256, header fields | MathDBTarget; checksum computed by us | record |
| 72 | 8.2 | Text of `ConjectureFor`, `Target`, `𝕊` macro; `ℝ^n` notation | MathDBTarget; `MathDBMathlib/Geometry/Euclidean.lean` | record |
| 73 | 8.2 | Clause meanings: `Type`, `TopologicalSpace`, `T2Space`, `ChartedSpace` (atlas of open partial homeomorphisms covering $M$, no transition condition, no boundary), `≃ₕ`, `𝕊³`, `≃ₜ`, `Nonempty` | Mathlib files at `0df444a3`; MathDBTarget doc comment (Hausdorff needed) | ours (reading of the definitions) |
| 74 | 8.2 | Target = homotopy-sphere form; no compactness assumed; equals Mathlib's `proof_wanted` for $n=3$ | MathDBTarget; Mathlib `PoincareConjecture.lean` | ours (reading) |
| 75 | 8.3 | Text of `Submission.solution` and `poincare_conjecture` | fork | record |
| 76 | 8.3 | Compactness from ≃ₕ via singular homology; $H_n=0$ for connected non-compact $n$-manifolds | fork `Noncompact.lean`; Hatcher2002 Prop. 3.29 | Lean; proved |
| 77 | 8.3 | $S^3$ simply connected; transfer along ≃ₕ | fork `SphereSimplyConnected.lean`; Mathlib | Lean |
| 78 | 8.3 | `SimplyConnectedSpace` = fundamental groupoid ≌ one point = path connected + unique path classes | Mathlib `SimplyConnected.lean` | definition |
| 79 | 8.3 | `exists_isManifold_three` (Moise smoothing), `smoothPoincareConjecture_holds`, `exists_poincare_controlled_extinction` and their roles | fork source; QLKC §1 Theorems 1–3, §2 | Lean |
| 80 | 8.3 | The conclusion concerns the original topology | QLKC §1; `f.toHomeomorph` with a compatible atlas | Lean |
| 81 | 8.4 | Formal route's choices (loop width, `positiveFreeContractibleClass`, `extinctionThreshold`, $c$) | QLKC §2; fork `ScalarThreshold.lean`, `FreeLoopClass.lean` | record |
| 82 | 8.4 | List of other formalized theorems | fork README | record (as claimed by the authors; each is a library theorem, not part of the MathDB target) |
| 83 | 8.4 | "a fuller account … will appear elsewhere"; we did not compare intermediate statements | QLKC §2 | record |
| 84 | 8.5 | Axiom output for `Submission.solution` | fork `verification/native-target-axioms.log` | Lean (as recorded) |
| 85 | 8.5 | Same axiom set for four endpoints at v0.1.3 | QLKC §3 | Lean (as recorded) |
| 86 | 8.5 | No `axiom` declaration and no `sorry` outside comments in the fork | our `grep` of the fork at `9f65eaf9` | record |
| 87 | 8.6 | What is certified: the formal statements and their axiom closure; the identification of the formal route with Hamilton–Perelman is the authors' account | rows 72–86; QLKC §3 | Lean / record |
| 88 | 8.6 | What is not certified (papers; meaning of definitions; other statements; trusted base; cached-import caveat) | QLKC §3 quotation; fork `MATHDB_SUBMISSION.md` | record / ours |
| 89 | 9.1 | Table of who proved what | rows above | record |
| 90 | 2.2 | Hamilton's theorem yields spherical space forms $S^3/\Gamma$, not only $S^3$ | Hamilton1982; Milnor2004 §§4–5 | proved |
| 91 | 3.1 | Monotonicity requires the coupled evolution ($d\tau/dt=-1$, conjugate heat equation for $u$, normalization kept) | P-I (3.3) and the text after it | proved |
| 92 | 5.1 | Non-separating necks (e.g. $S^2\times\{pt\}\subset S^2\times S^1$); separating sphere ⇒ connected sum, non-separating ⇒ summand $S^2\times S^1$ (orientable $M$; otherwise possibly the non-orientable sphere bundle) | standard 3-manifold topology; MT Theorem 0.3 | proved |
| 93 | 6.3 | Ancestor chains: one component back to $M$; degree-one comparison maps keep the class; $W(s)\le\liminf_{t\uparrow s}W(t)$; common $W_0$ ⇒ one deadline for all components | QLKC §2; MT Proposition 18.18 and the text before it, §18.3 | proved |
| 94 | 6.5 | CM width = min-max energy of 2-sphere sweep-outs; with $-4\pi$ the integration gives $16\pi$ and $t\le(C^{1/4}+W(0)/(16\pi C^{3/4}))^4-C$ | ColdingMinicozzi2005 (1.2), Theorem 1.1; integration ours | proved (our integration) |
| 95 | 8.6 | Trust statement (kernel and toolchain; meaning of the statement's definitions; the statement is the conjecture) | ours, from rows 72–88 | ours |
| 96 | 8.6 | Internal definitions: authors state "all definitions and core theorem statements were human-verified"; AI assisted; no independent review known to us; we did not audit them | fork `README.md` (AI disclaimer); QLKC §3 | record |
| 97 | 8.6 | 17,592 Lean files under `DifferentialGeometry/` at `9f65eaf9` | our count | record |
| 98 | 1.3 | The smooth Poincaré conjecture in dimension 4 is open | Milnor2004 §3 ("It is not known whether every smooth homotopy 4-sphere is diffeomorphic to $S^4$"); Mathlib `PoincareConjecture.lean` doc comment at `0df444a3` ("open for n = 4") | record |
