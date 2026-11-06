#!/usr/bin/env python3
"""Generate the article's SVG figures in the house palette (deterministic; no dependencies).

Colours mirror the studio tokens: paper ground, ink, status colours, object colours. For this film the
object colours mean: scalar curvature R (--obj-potential), the width W and its loops and disks
(--obj-wave), time and the flow (--obj-energy), surgery caps and cuts (--obj-damping).
Text: "Source Sans 3"; variables: "KaTeX_Math" (italic); code: "JetBrains Mono". Fonts are loaded by
tools/fig2pdf.js when the PDF is made.
"""
import math
from pathlib import Path

C = dict(paper="#F7F4EC", raised="#FBF8F1", ink="#1C1B19", muted="#5E5B55", rule="#D8D2C4",
         proved="#2F6B4F", claimed="#B7791F", heuristic="#8A8780", lean="#2B5C9E",
         metric="#4F5D8A", curv="#A34F3A", time="#7A4A6E", width="#2E7D86", surgery="#8E8458")
SANS = "'Source Sans 3', KaTeX_MainFB, sans-serif"
MATH = "KaTeX_Math, KaTeX_MainFB, serif"
MONO = "'JetBrains Mono', monospace"
OUT = Path(__file__).resolve().parent


def svg(w, h, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">\n'
            f'<rect width="{w}" height="{h}" fill="{C["paper"]}"/>\n{body}\n</svg>\n')


def text(x, y, s, size=22, fill=None, anchor="start", weight=400, family=SANS):
    return (f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}"'
            f' fill="{fill or C["ink"]}" text-anchor="{anchor}">{s}</text>')


def m(s):
    return f'<tspan font-family="{MATH}" font-style="italic">{s}</tspan>'


def seal(x, y, s=12):
    return f'<rect x="{x}" y="{y}" width="{s}" height="{s}" fill="{C["lean"]}"/>'


def badge(x, y):
    return (f'<rect x="{x}" y="{y}" width="250" height="34" rx="4" fill="none" stroke="{C["heuristic"]}" '
            f'stroke-width="1.6" stroke-dasharray="6 4"/>' + text(x + 125, y + 23, "illustration, proves nothing", 18,
                                                                 C["heuristic"], "middle"))


def path(pts, col, w=3.0, dash=None, close=False, fill="none"):
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + (" Z" if close else "")
    da = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="{d}" fill="{fill}" stroke="{col}" stroke-width="{w}"{da} stroke-linejoin="round"/>'


# ---------- 1. loops on surfaces (two-dimensional analogy) ----------

def half_ellipse(cx, cy, rx, ry, stroke, sw, op=1.0, vertical=False):
    """An ellipse drawn as a visible solid half and a dashed hidden half (lower/upper, or left/right if vertical)."""
    dash = f'{2.5 * sw:g} {2.5 * sw:g}'
    if vertical:
        a = f'M{cx},{cy - ry} A{rx},{ry} 0 0 0 {cx},{cy + ry}'
        h = f'M{cx},{cy - ry} A{rx},{ry} 0 0 1 {cx},{cy + ry}'
    else:
        a = f'M{cx - rx},{cy} A{rx},{ry} 0 0 0 {cx + rx},{cy}'
        h = f'M{cx - rx},{cy} A{rx},{ry} 0 0 1 {cx + rx},{cy}'
    common = f'fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" opacity="{op}"'
    return f'<path d="{a}" {common}/>\n<path d="{h}" {common} stroke-dasharray="{dash}"/>'

def render3d(name, x, y, w, h):
    """The 3D picture 3d/<name>.png (rendered by render3d.js from fig3d.js at 2x), embedded at (x, y), w x h."""
    import base64
    data = base64.b64encode((OUT / "3d" / f"{name}.png").read_bytes()).decode()
    return f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="data:image/png;base64,{data}"/>'


def loops():
    # 3D (fig3d.js "loops"): sphere with the band around its middle, the same band near the top and the point it
    # shrinks to; torus lying flat with a band around the tube (a meridian circle) at the back right, whose inner
    # arc runs down through the hole; parts hidden by the surface are dashed. One camera, 32 degrees above.
    W, H = 1200, 470
    b = [render3d("loops", 0, 20, 1200, 380)]
    b.append(text(280, 425, "sphere: every loop shrinks to a point", 22, anchor="middle"))
    b.append(text(860, 425, "torus: this loop cannot shrink", 22, anchor="middle"))
    b.append(text(W / 2, 458, "Surfaces, two-dimensional analogy. The conjecture concerns three-dimensional manifolds.", 19,
                  C["muted"], "middle"))
    b.append(badge(W - 270, 14))
    return svg(W, H, "\n".join(b))


# ---------- profiles of rotationally symmetric metrics on S^3 ----------

def dumbbell(x, s):
    """Radius of the 2-sphere at position x in (-1, 1) for a rotationally symmetric metric on S^3 at
    neck parameter s (s = 1 fat neck, s -> 0 pinching). Schematic."""
    bulb = lambda u: math.sqrt(max(0.0, 1 - u * u))
    left, right = bulb((x + 0.5) / 0.5) if x < 0 else 0, bulb((x - 0.5) / 0.5) if x > 0 else 0
    neck = s * 0.32 + (1 - s) * 0.03
    blend = math.exp(-(x / 0.18) ** 2)
    base = max(left, right)
    return max(base * (1 - blend) + neck * blend, 0.0) if abs(x) < 1 else 0.0


def profile(x0, y0, L, A, f, col, n=240, w=2.5):
    up = [(x0 + L * (k / n), y0 - A * f(-1 + 2 * k / n)) for k in range(n + 1)]
    dn = [(x0 + L * (k / n), y0 + A * f(-1 + 2 * k / n)) for k in range(n + 1)]
    return path(up, col, w) + path(dn, col, w)


def ricci_flow():
    # 3D (fig3d.js "ricci-flow"): r(s) = dumbbellR(1.8, 1.25, w), w = 0.30, 0.13, 0.02 (shapes3d.js), surfaces of
    # revolution about the horizontal axis, shaded by the scalar curvature R of the illustrated metric.
    W, H = 1500, 470
    b = [render3d("ricci-flow", 0, 30, 1500, 360)]
    for k, lab in enumerate(["earlier", "later", "neck pinches"]):
        b.append(text(260 + 490 * k, 400, lab, 22, C["time"], "middle"))
    b.append(text(W / 2, 432, "Illustration of a rotationally symmetric metric on the 3-sphere: each circle across the surface stands", 19, C["muted"], "middle"))
    b.append(text(W / 2, 457, "for a 2-sphere of that radius; shading shows the scalar curvature (darker red = larger). The neck pinches where it is largest.", 19, C["muted"], "middle"))
    b.append(badge(W - 270, 14))
    return svg(W, H, "\n".join(b))


def surgery():
    # 3D (fig3d.js "surgery"): r(s) = dumbbellR(1.9, 1.3, 0.2); left: cut circle at s = 0 (the neck's middle
    # 2-sphere); right: the pieces on [-1.9, 0] and [0, 1.9] moved apart, each capped on its cut end.
    W, H = 1500, 450
    b = [render3d("surgery", 0, 20, 1500, 330)]
    b.append(f'<path d="M650,185 L790,185" stroke="{C["ink"]}" stroke-width="2.5"/><path d="M778,175 L792,185 L778,195" fill="none" stroke="{C["ink"]}" stroke-width="2.5"/>')
    b.append(text(330, 375, "cut the neck along its middle 2-sphere", 22, anchor="middle"))
    b.append(text(1110, 375, "glue a standard cap (a 3-ball) onto each side", 22, anchor="middle"))
    b.append(text(W / 2, 425, "Illustration as in the previous figure. Here the neck separates the manifold: it splits into two pieces, which undoes a connected sum.", 19, C["muted"], "middle"))
    b.append(badge(W - 270, 14))
    return svg(W, H, "\n".join(b))


def neighbourhoods():
    # 3D (fig3d.js "neighbourhoods"): open cylinder r = 0.62; cylinder closed by a hemisphere of radius 0.62;
    # closed piece bumpyR(1.0, 0.85). Open ends drawn with their rims.
    W, H = 1500, 430
    b = [render3d("neighbourhoods", 0, 20, 1500, 300)]
    b.append(text(250, 350, "ε-neck: nearly a round", 22, anchor="middle"))
    b.append(text(250, 376, f'cylinder {m("S")}² × interval', 22, anchor="middle"))
    b.append(text(750, 350, "ε-cap: a 3-ball (or a punctured", 22, anchor="middle"))
    b.append(text(750, 376, f'{m("RP")}³) ending in a neck', 22, anchor="middle"))
    b.append(text(1250, 350, "closed component of positive", 22, anchor="middle"))
    b.append(text(1250, 376, "curvature, or nearly round", 22, anchor="middle"))
    b.append(text(W / 2, 414, "Illustrations: each circle stands for a 2-sphere. Where the scalar curvature is large, every point has one of these neighbourhoods, after rescaling (Perelman II, 1.5; I, 12.1).", 17, C["muted"], "middle"))
    b.append(badge(W - 270, 14))
    return svg(W, H, "\n".join(b))


# ---------- extinction bound ----------

def extinction():
    W, H = 1300, 560
    c, W0 = 0.25, 6.0
    Tstar = (c ** 0.25 + W0 / (8 * math.pi * c ** 0.75)) ** 4 - c
    bound = lambda t: (t + c) ** 0.75 * (W0 / c ** 0.75 - 8 * math.pi * ((t + c) ** 0.25 - c ** 0.25))
    tmax = Tstar * 1.12
    vmax = max(bound(t * Tstar / 400) for t in range(401)) * 1.1
    x0, y0, xw, yh = 120, 450, 1050, 360
    X = lambda t: x0 + xw * t / tmax
    Y = lambda v: y0 - yh * v / vmax
    b = [f'<line x1="{x0}" y1="{y0}" x2="{x0+xw+20}" y2="{y0}" stroke="{C["ink"]}" stroke-width="2"/>',
         f'<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y0-yh-20}" stroke="{C["ink"]}" stroke-width="2"/>']
    pts = [(X(t), Y(bound(t))) for t in [Tstar * k / 400 for k in range(401)]]
    b.append(path(pts, C["width"], 3.5))
    b.append(f'<circle cx="{X(Tstar):.1f}" cy="{y0}" r="6" fill="{C["width"]}"/>')
    b.append(f'<line x1="{X(Tstar):.1f}" y1="{y0}" x2="{X(Tstar):.1f}" y2="{y0+18}" stroke="{C["ink"]}" stroke-width="2"/>')
    b.append(text(f"{X(Tstar):.1f}", y0 + 44, m("T") + "<tspan font-size='16' dy='6'>∗</tspan>", 24, anchor="middle"))
    b.append(text(x0 + xw + 20, y0 + 44, m("t"), 24, C["time"], "end"))
    b.append(text(x0 - 12, Y(W0) + 8, m("W") + "<tspan font-size='16' dy='6'>0</tspan>", 24, C["width"], "end"))
    b.append(text(X(Tstar * 0.62) + 14, Y(bound(Tstar * 0.62)) - 14, "upper bound for the width", 22, C["width"]))
    b.append(text(x0 + 20, 70, f"c = 1/4, W₀ = 6: the width is at most this curve, which reaches 0 at T* ≈ {Tstar:.2f}", 20, C["muted"]))
    b.append(text(x0 + 20, 96, "No component can survive past T*: a width cannot be negative.", 20, C["muted"]))
    b.append(badge(W - 270, 14))
    return svg(W, H, "\n".join(b)), Tstar


# ---------- proof map ----------

def node(x, y, w, h, title, sub, border, seal_on=False):
    s = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{C["raised"]}" stroke="{border}" stroke-width="3"/>',
         text(x + w / 2, y + 38, title, 22, anchor="middle", weight=600)]
    for i, line in enumerate(sub):
        s.append(text(x + w / 2, y + 66 + 24 * i, line, 18, C["muted"], "middle"))
    if seal_on:
        s.append(seal(x + w - 22, y + 8, 13))
    return "\n".join(s)


def arrow(x1, y1, x2, y2):
    a = math.atan2(y2 - y1, x2 - x1)
    hx, hy = x2 - 12 * math.cos(a), y2 - 12 * math.sin(a)
    p1 = (hx + 6 * math.sin(a), hy - 6 * math.cos(a))
    p2 = (hx - 6 * math.sin(a), hy + 6 * math.cos(a))
    return (f'<line x1="{x1}" y1="{y1}" x2="{hx:.1f}" y2="{hy:.1f}" stroke="{C["ink"]}" stroke-width="2"/>'
            f'<path d="M{p1[0]:.1f},{p1[1]:.1f} L{x2},{y2} L{p2[0]:.1f},{p2[1]:.1f} Z" fill="{C["ink"]}"/>')


def proof_map():
    W, H = 1500, 560
    w, h, gx = 260, 118, 300
    row1 = [("Ricci flow", ["Hamilton 1982"]), ("Noncollapsing", ["Perelman I, §§4, 7–8"]),
            ("Canonical", ["neighbourhoods", "I §12, II §1"]), ("Surgery", ["II §§2–5"]),
            ("Finite extinction", ["III; Colding–", "Minicozzi"])]
    row2 = [("Topology", ["connected sums,", "van Kampen"]), ("Smooth Poincaré", ["diffeomorphic to S³"]),
            ("Moise smoothing", ["Moise 1952"]), ("Topological", ["Poincaré conjecture"])]
    b = []
    for i, (t, sub) in enumerate(row1):
        b.append(node(40 + i * gx, 60, w, h, t, sub, C["proved"], True))
        if i:
            b.append(arrow(40 + (i - 1) * gx + w, 60 + h / 2, 40 + i * gx, 60 + h / 2))
    for i, (t, sub) in enumerate(row2):
        x = 40 + (i + 1) * gx
        b.append(node(x, 300, w, h, t, sub, C["proved"], True))
        if i:
            b.append(arrow(x - gx + w, 300 + h / 2, x, 300 + h / 2))
    # elbow from extinction (row1 last) down to topology (row2 first)
    xe = 40 + 4 * gx + w / 2
    xt = 40 + 1 * gx + w / 2
    b.append(f'<path d="M{xe},{60+h} L{xe},{240} L{xt},{240}" fill="none" stroke="{C["ink"]}" stroke-width="2"/>')
    b.append(arrow(xt, 240, xt, 300))
    ly = 480
    b.append(f'<rect x="40" y="{ly-16}" width="22" height="16" fill="none" stroke="{C["proved"]}" stroke-width="3"/>')
    b.append(text(72, ly, "proved in the literature (Perelman 2002–03, verified in the 2006 expositions)", 19))
    b.append(seal(40, ly + 18, 14))
    b.append(text(72, ly + 31, "also formalized in Lean in the library behind the verified MathDB submission (Section 8)", 19))
    return svg(W, H, "\n".join(b))


# ---------- Lean declaration chain ----------

def lean_chain():
    W, H = 1500, 520
    b = []
    boxes = [
        (40, 40, 620, "Problem.Target  (= ConjectureFor 3)", "frozen MathDB statement: homotopy 3-sphere ⇒ homeomorphic"),
        (40, 170, 620, "Submission.solution", "compactness and simple connectivity from ≃ₕ"),
        (40, 300, 620, "Topology.poincare_conjecture", "compact, simply connected, Hausdorff, ℝ³-charted"),
        (760, 300, 700, "PiecewiseLinear.exists_isManifold_three", "Moise: a compatible smooth atlas exists"),
        (760, 170, 700, "smoothPoincareConjecture_holds", "smooth case: diffeomorphic to S³"),
        (760, 40, 700, "exists_poincare_controlled_extinction", "Ricci flow with surgery becomes extinct"),
    ]
    for x, y, w, t, sub in boxes:
        b.append(f'<rect x="{x}" y="{y}" width="{w}" height="96" rx="6" fill="{C["raised"]}" stroke="{C["lean"]}" stroke-width="3"/>')
        b.append(seal(x + w - 24, y + 10, 13))
        b.append(text(x + 20, y + 40, t, 21, family=MONO))
        b.append(text(x + 20, y + 74, sub, 19, C["muted"]))
    b.append(arrow(350, 170, 350, 136))
    b.append(arrow(350, 300, 350, 266))
    b.append(arrow(760, 368, 660, 368))
    b.append(arrow(1110, 136, 1110, 170))
    b.append(f'<path d="M760,218 L710,218 L710,326 L672,326" fill="none" stroke="{C["ink"]}" stroke-width="2"/>')
    b.append(arrow(672, 326, 660, 326))
    b.append(text(40, 450, "An arrow points from a theorem to the theorem that uses it. All six report the axioms", 19, C["muted"]))
    b.append(text(40, 476, "propext, Classical.choice, Quot.sound only (the fork's audit and the formalization paper, §3).", 19, C["muted"]))
    return svg(W, H, "\n".join(b))


def main():
    figs = dict(loops=loops(), **{"ricci-flow": ricci_flow()}, surgery=surgery(), neighbourhoods=neighbourhoods(),
                **{"proof-map": proof_map(), "lean-chain": lean_chain()})
    ext, Tstar = extinction()
    figs["extinction"] = ext
    for name, s in figs.items():
        (OUT / f"{name}.svg").write_text(s)
    print(f"wrote {len(figs)} figures; T* = {Tstar:.4f}")


if __name__ == "__main__":
    main()
