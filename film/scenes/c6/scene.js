/* Chapter 6. Finite extinction. The picture is a function of t. Loaded as an ES module. */
import { stage3d, surface, curve, circlePts, disc, THREE } from "../three3d/stage3d.js";
import { revolve, roundR, arcTubeGeometry, setArcTube } from "../three3d/shapes3d.js";

installBeats(window.__BEATS__);

const events = [];
function mark(t, beat, what) {
  events.push({ t: Math.round(t * 1000) / 1000, beat: beat, what: what });
}

const D = {
  intro: need("c6b1", "lead", 1.2, "chapter title settles"),
  stop: need("c6b1", "stop", 0.6, "finite extinction becomes active"),
  vanish: need("c6b1", "nothing", 2.4, "map yields to the strip; three profiles vanish before finite time"),
  extinct: need("c6b1", "extinction", 0.4, "finite extinction is done"),
  enter: need("c6b2", "Perelman", 0.6, "manifold replaces the extinction axis"),
  width: need("c6b2", "W", 0.5, "label: W is the smallest possible largest disc area"),
  loops: need("c6b2", "loops", 1.6, "loops appear, then highlight in sequence"),
  discs: need("c6b2", "disc", 0.6, "each loop gets a disc"),
  largest: need("c6b2", "largest", 0.6, "the largest disc is outlined"),
  flow: need("c6b3", "flow", 0.5, "dW/dt appears"),
  twoPi: need("c6b3", "two", 0.5, "term at most minus two pi"),
  half: need("c6b3", "half", 0.5, "term minus one half R min W"),
  rmin: need("c6b3", "smallest", 0.5, "label: R min is the smallest scalar curvature"),
  least: need("c6b4", "least", 0.6, "lower bound for R min"),
  constant: need("c6b4", "constant", 0.5, "label: c is fixed by the starting metric"),
  rise: need("c6b5", "two", 0.8, "equations shrink to a reference line"),
  draw: need("c6b5", "integrate", 1.2, "the width bound draws to the axis"),
  zero: need("c6b5", "zero", 0.5, "tick T star where the bound reaches zero"),
  neg: need("c6b5", "negative", 0.6, "hatch: a width is never negative"),
  tree: need("c6b6", "This", 1.2, "plot shrinks to the right; the surgery tree enters"),
  trace: need("c6b6", "Trace", 1.2, "one leaf's path back to the root"),
  w0: need("c6b6", "W", 0.5, "the root is labelled W zero"),
  raises: need("c6b6", "raises", 0.6, "surgery on the path does not raise the width"),
  covers: need("c6b6", "covers", 0.7, "every leaf against the deadline"),
  cards: need("c6b7", "Colding", 0.6, "two route cards"),
  own: need("c6b7", "own", 0.5, "label: two routes, two sets of constants"),
  pieces: need("c6b8", "backwards", 0.8, "three pieces replace the cards"),
  sum: need("c6b8", "connected", 0.6, "the pieces join as a connected sum"),
  cross: need("c6b9", "simply", 0.8, "cross the pieces that are not simply connected"),
  qualify: need("c6b9", "qualifies", 0.8, "the three-sphere remains"),
  smooth: need("c6b9", "smooth", 0.5, "label: M is S3, smoothly"),
  back: need("c6b10", "If", 0.8, "proof map returns full frame"),
  moise: need("c6b10", "Moise's", 0.8, "Moise smoothing active, then done"),
  top: need("c6b10", "conjecture", 0.6, "the conjecture is done; the statement card"),
  tail: need("c6b10", "tail", 0.8, "picture fades out"),
};

const T = {
  stop: cue("c6b1", "stop"),
  nothing: cue("c6b1", "nothing"),
  extinction: cue("c6b1", "extinction"),
  perelman: cue("c6b2", "Perelman"),
  w: cue("c6b2", "W"),
  loops: cue("c6b2", "loops"),
  disc: cue("c6b2", "disc"),
  largest: cue("c6b2", "largest"),
  flow: cue("c6b3", "flow"),
  two: cue("c6b3", "two"),
  half: cue("c6b3", "half"),
  smallest: cue("c6b3", "smallest"),
  least: cue("c6b4", "least"),
  constant: cue("c6b4", "constant"),
  two5: cue("c6b5", "two"),
  integrate: cue("c6b5", "integrate"),
  zero: cue("c6b5", "zero"),
  negative: cue("c6b5", "negative"),
  tree: cue("c6b6", "This"),
  trace: cue("c6b6", "Trace"),
  w0: cue("c6b6", "W"),
  raises: cue("c6b6", "raises"),
  covers: cue("c6b6", "covers"),
  colding: cue("c6b7", "Colding"),
  own: cue("c6b7", "own"),
  backwards: cue("c6b8", "backwards"),
  connected: cue("c6b8", "connected"),
  simply: cue("c6b9", "simply"),
  qualifies: cue("c6b9", "qualifies"),
  smooth: cue("c6b9", "smooth"),
  back: cue("c6b10", "If"),
  moise: cue("c6b10", "Moise's"),
  conjecture: cue("c6b10", "conjecture"),
  tail: beatEnd("c6b10"),
};

const KX = { throwOnError: false, trust: true, strict: false, displayMode: false, output: "html" };

function ns(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}

function layer() {
  const g = document.createElement("div");
  g.className = "stage-abs";
  g.style.left = "0px";
  g.style.top = "0px";
  g.style.width = "1920px";
  g.style.height = "1080px";
  document.body.appendChild(g);
  return g;
}

function host(name, x, y, w, h) {
  const d = document.createElement("div");
  d.className = "stage-abs";
  d.dataset.box = name;
  d.dataset.words = "per-text";
  d.style.left = x + "px";
  d.style.top = y + "px";
  d.style.width = w + "px";
  d.style.height = h + "px";
  d.style.opacity = "0";
  document.body.appendChild(d);
  return d;
}

function svgOf(parent, w, h) {
  const s = ns("svg");
  s.setAttribute("width", String(w));
  s.setAttribute("height", String(h));
  s.setAttribute("viewBox", "0 0 " + w + " " + h);
  parent.appendChild(s);
  return s;
}

function put(el, o) {
  const v = o <= 0.001 ? 0 : o >= 0.999 ? 1 : o;
  el.style.opacity = v === 0 ? "0" : v === 1 ? "1" : v.toFixed(4);
}

function textLine(parent, text, x, y, w, color) {
  const d = document.createElement("div");
  d.className = "t-label stage-abs";
  d.style.left = x + "px";
  d.style.top = y + "px";
  d.style.width = w + "px";
  d.style.textAlign = "center";
  d.style.whiteSpace = "nowrap";
  d.style.color = color || "var(--ink)";
  d.textContent = text;
  parent.appendChild(d);
  return d;
}

function mathSpan(parent, tex, color) {
  const s = document.createElement("span");
  s.style.color = color || "var(--ink)";
  katex.render(tex, s, KX);
  parent.appendChild(s);
  return s;
}

function mixedLine(parent, parts, x, y, w) {
  const d = document.createElement("div");
  d.className = "t-label stage-abs";
  d.style.left = x + "px";
  d.style.top = y + "px";
  d.style.width = w + "px";
  d.style.textAlign = "center";
  d.style.whiteSpace = "nowrap";
  d.style.opacity = "0";
  parts.forEach(function (p) {
    if (p.tex) mathSpan(d, p.tex, p.color);
    else d.appendChild(document.createTextNode(p.text));
  });
  parent.appendChild(d);
  return d;
}

function ellipse(parent, cx, cy, rx, ry, stroke, sw, fill) {
  const e = ns("ellipse");
  e.setAttribute("cx", String(cx));
  e.setAttribute("cy", String(cy));
  e.setAttribute("rx", String(rx));
  e.setAttribute("ry", String(ry));
  e.setAttribute("fill", fill || "none");
  e.setAttribute("stroke", stroke);
  e.setAttribute("stroke-width", String(sw));
  parent.appendChild(e);
  return e;
}

function line(parent, x1, y1, x2, y2, stroke, sw) {
  const e = ns("line");
  e.setAttribute("x1", String(x1));
  e.setAttribute("y1", String(y1));
  e.setAttribute("x2", String(x2));
  e.setAttribute("y2", String(y2));
  e.setAttribute("stroke", stroke);
  e.setAttribute("stroke-width", String(sw));
  parent.appendChild(e);
  return e;
}

function lin(t, t0, dur) {
  if (!(dur > 0)) return t >= t0 ? 1 : 0;
  return clamp((t - t0) / dur, 0, 1);
}

function vNorm(v) {
  const L = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / L, v[1] / L, v[2] / L];
}

function vCross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function vScale(v, s) {
  return [v[0] * s, v[1] * s, v[2] * s];
}

function adopt(node, parent) {
  if (node.parent) node.parent.remove(node);
  parent.add(node);
}

/* One stage for the chapter, behind the text. Each picture has its own camera path. */
const st = stage3d({ fov: 28 });

function frameFocus(focus, azDeg, elDeg, dist, ndcX, ndcY) {
  const az = azDeg * Math.PI / 180;
  const el = elDeg * Math.PI / 180;
  const eye = [
    focus[0] + dist * Math.cos(el) * Math.sin(az),
    focus[1] + dist * Math.sin(el),
    focus[2] + dist * Math.cos(el) * Math.cos(az),
  ];
  st.look(eye, focus);
  const q = st.camera.quaternion;
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
  const fov = st.camera.fov * Math.PI / 180;
  const halfH = Math.sin(fov / 2) / Math.cos(fov / 2) * dist;
  const halfW = halfH * (st.width / st.height);
  const look = new THREE.Vector3(focus[0], focus[1], focus[2]);
  look.addScaledVector(right, -ndcX * halfW);
  look.addScaledVector(up, -ndcY * halfH);
  st.look(eye, [look.x, look.y, look.z]);
}

const rig1 = new THREE.Group();
const rig2 = new THREE.Group();
const rigP = new THREE.Group();
st.scene.add(rig1);
st.scene.add(rig2);
st.scene.add(rigP);

/* c6b1: three round spheres along the time axis. radius^2 falls linearly as each vanishes. */
const RHO0 = 0.46;
const SPHERE_X = [-1.85, 0, 1.85];
const pieces3 = SPHERE_X.map(function (x) {
  const g = new THREE.Group();
  g.position.set(x, 0, 0);
  rig1.add(g);
  const rev = revolve(st, { parent: g, outline: 0.012, nS: 72, nA: 56 });
  rev.set(roundR(RHO0), -RHO0, RHO0);
  rev.anchor = g;
  return rev;
});

/* c6b2: a region of M, loops in tilted parallel planes, flat discs. */
const BALL_R = 2.2;
const ball = revolve(st, { parent: rig2, outline: 0.03, nS: 140, nA: 80 });
ball.surf.prepass = false;   // a see-through ball: the loops inside must stay visible
ball.set(roundR(BALL_R), -BALL_R, BALL_R);
ball.surf.setColor("--obj-hopping", 1);
ball.surf.mesh.renderOrder = 1;
ball.surf.material.depthWrite = false;
/* The back-face shell fills the whole silhouette, so a translucent ball would look solid.
   The rim is a camera-facing circle instead, and the shell stays hidden. */
ball.surf.shell.visible = false;
const rimPts = circlePts([0, 0, 0], [1, 0, 0], [0, 1, 0], BALL_R, 160);
const rim = curve(st, rimPts, { token: "--obj-hopping", radius: 0.02, hidden: "none" });
adopt(rim.group, rig2);
rim.mesh.renderOrder = 6;
rim.mesh.material.depthTest = false;

const Nloop = vNorm([0.25, 1, 0.15]);
const Uloop = vNorm(vCross([1, 0, 0], Nloop));
const Vloop = vNorm(vCross(Nloop, Uloop));
const HS = [-1.65, -1.1, -0.55, 0, 0.55, 1.1, 1.65];
const BIG = 3;
const LOOP_STEP = 0.15;
const LOOP_DRAW = D.loops - (HS.length - 1) * LOOP_STEP;
const TUBE = 0.032;
const TUBE_BIG = 0.064;
const families = HS.map(function (h) {
  const c = vScale(Nloop, h);
  const r = 0.9 * Math.sqrt(Math.max(0, BALL_R * BALL_R - h * h));
  const pts = circlePts(c, Uloop, Vloop, r, 128);
  const loop = curve(st, pts, { token: "--obj-wave", radius: TUBE, hidden: "none" });
  loop.mesh.renderOrder = 4;
  loop.meshH.renderOrder = 4;
  adopt(loop.group, rig2);
  const plate = disc(st, pts, { token: "--obj-wave", opacity: 1 });
  plate.mesh.renderOrder = 3;
  plate.mesh.material.depthTest = false;
  adopt(plate.mesh, rig2);
  plate.set(pts, c);
  return { h: h, c: c, r: r, pts: pts, loop: loop, plate: plate };
});

/* c6b8–c6b9: three icons, one camera. The ring is a closed tube, ang = 2 pi. */
const ICON_X = [-3.05, 0, 3.05];
const ICON_R = 0.78;
const RING_R = 0.56;
const RING_A = 0.22;
const iconRoot = ICON_X.map(function (x) {
  const g = new THREE.Group();
  g.position.set(x, 0, 0);
  rigP.add(g);
  return g;
});
const iconS = revolve(st, { parent: iconRoot[0], outline: 0.016, nS: 72, nA: 56 });
iconS.set(roundR(ICON_R), -ICON_R, ICON_R);
const iconQ = revolve(st, { parent: iconRoot[1], outline: 0.016, nS: 72, nA: 56 });
iconQ.set(roundR(ICON_R), -ICON_R, ICON_R);
const ringGeo = arcTubeGeometry(140, 56);
setArcTube(ringGeo, Math.PI * 2, Math.PI * 2 * RING_R, RING_A, 0, 0, 0);
const iconRing = surface(st, ringGeo, { token: "--obj-hopping", k: 0.6, outline: 0.014 });
adopt(iconRing.group, iconRoot[2]);
iconRing.group.position.y = -RING_R;
iconRing.group.rotation.y = 0.55;

const label = chapterLabel({ n: 6, title: "Finite extinction", intro: D.intro });
const strip = mountStrip(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);

const NODES = [
  { id: "flow", label: "Ricci flow", col: 0, row: 0, status: "proved" },
  { id: "noncol", label: "Noncollapsing", col: 1, row: 0, status: "proved" },
  { id: "canon", label: "Canonical neighbourhoods", col: 2, row: 0, status: "proved" },
  { id: "surg", label: "Surgery", col: 3, row: 0, status: "proved" },
  { id: "ext", label: "Finite extinction", col: 4, row: 0, status: "proved" },
  { id: "sums", label: "Connected sums", col: 1, row: 1, status: "proved" },
  { id: "smooth", label: "Smooth Poincaré", col: 2, row: 1, status: "proved" },
  { id: "moise", label: "Moise smoothing", col: 3, row: 1, status: "proved" },
  { id: "top", label: "Poincaré conjecture", col: 4, row: 1, status: "proved" },
];
const EDGES = [
  ["flow", "noncol"], ["noncol", "canon"], ["canon", "surg"], ["surg", "ext"],
  ["ext", "sums"], ["sums", "smooth"], ["smooth", "moise"], ["moise", "top"],
];

function mapState(t) {
  const state = {
    flow: "done", noncol: "done", canon: "done", surg: "done",
    ext: "dim", sums: "dim", smooth: "dim", moise: "dim", top: "dim",
  };
  if (t >= T.extinction) state.ext = "done";
  else if (t >= T.stop) state.ext = "active";
  if (t >= T.connected) state.sums = "done";
  if (t >= T.smooth) state.smooth = "done";
  if (t >= T.moise) state.moise = (t < T.moise + D.moise * 0.5) ? "active" : "done";
  if (t >= T.conjecture) state.top = "done";
  return state;
}

const mapFull = proofMap({
  parent: document.body, box: "map-full", x: 120, y: 200, w: 1680, h: 500,
  nodes: NODES, edges: EDGES, stateAt: mapState,
});
const mapStrip = proofMap({
  parent: document.body, box: "map-strip", x: 120, y: 100, w: 1680, h: 120,
  nodes: NODES, edges: EDGES, stateAt: mapState,
});
mapFull.el.style.opacity = "0";
mapStrip.el.style.opacity = "0";

/* c6b1 axis under the spheres. The spheres themselves are in rig1. */
const AXIS = { x: 120, y: 228, w: 1680, h: 520 };
const axisHost = host("axis", AXIS.x, AXIS.y, AXIS.w, AXIS.h);
const axisSvg = svgOf(axisHost, AXIS.w, AXIS.h);
const axisLine = line(axisSvg, 80, 300, 1500, 300, "var(--obj-energy)", 3);
const axisTick = line(axisSvg, 1460, 274, 1460, 326, "var(--ink)", 3);
axisTick.style.opacity = "0";
const finiteLabel = textLine(axisHost, "finite time", 1180, 340, 400);
finiteLabel.style.opacity = "0";
const axisCaption = textLine(axisHost, "illustration: pieces of M, each vanishing", 360, 8, 960, "var(--ink-muted)");
axisCaption.style.opacity = "1";

/* c6b2 labels. The ball, loops and discs are in rig2. */
const mHost = host("label-m", 760, 236, 72, 44);
textLine(mHost, "M", 0, 2, 72, "var(--obj-hopping)").style.opacity = "1";
const sweepHost = host("sweep-labels", 900, 786, 880, 90);
const regionLabel = textLine(sweepHost, "a region of M, drawn in perspective", 0, 0, 880);
regionLabel.style.opacity = "1";
const wLabel = mixedLine(sweepHost, [
  { tex: "W", color: "var(--obj-wave)" },
  { text: ": smallest possible largest disc area" },
], 0, 46, 640);
const illustShort = textLine(sweepHost, "illustration", 680, 46, 190, "var(--ink-muted)");
illustShort.style.opacity = "1";

/* equations */
const EQ1 = { x: 900, y: 250, w: 880, h: 190 };
const EQ2 = { x: 900, y: 520, w: 880, h: 180 };
const TEX1 = "\\htmlClass{term-dw}{\\dfrac{d\\htmlClass{term-W}{W}}{d\\htmlClass{term-t}{t}}}"
  + "\\htmlClass{term-le}{\\le -2\\pi}"
  + "\\htmlClass{term-rest}{-\\tfrac{1}{2}\\htmlClass{term-R}{R_{\\min}}\\,\\htmlClass{term-W2}{W}}";
const TEX2 = "\\htmlClass{term-all}{\\htmlClass{term-R}{R_{\\min}}\\ge -\\dfrac{3}{2\\,(\\htmlClass{term-t}{t}+\\htmlClass{term-c}{c})}}";
const eq1 = mountEquation({
  parent: document.body, box: "eq-width", x: EQ1.x, y: EQ1.y, w: EQ1.w, h: EQ1.h,
  tex: TEX1,
  schedule: { dw: T.flow, le: T.two, rest: T.half },
});
const eq2 = mountEquation({
  parent: document.body, box: "eq-curv", x: EQ2.x, y: EQ2.y, w: EQ2.w, h: EQ2.h,
  tex: TEX2,
  schedule: { all: T.least },
});
eq1.el.dataset.words = "per-text";
eq2.el.dataset.words = "per-text";
eq1.el.style.opacity = "0";
eq2.el.style.opacity = "0";
eq1.el.style.transformOrigin = "0 0";
eq2.el.style.transformOrigin = "0 0";
colorTerm(eq1, "W", "--obj-wave");
colorTerm(eq1, "W2", "--obj-wave");
colorTerm(eq1, "t", "--obj-energy");
colorTerm(eq1, "R", "--obj-potential");
colorTerm(eq2, "R", "--obj-potential");
colorTerm(eq2, "t", "--obj-energy");
colorTerm(eq2, "c", "--obj-energy");

const rminLabel = host("label-rmin", 900, 448, 880, 56);
mixedLine(rminLabel, [
  { tex: "R_{\\min}", color: "var(--obj-potential)" },
  { text: ": smallest scalar curvature at time " },
  { tex: "t", color: "var(--obj-energy)" },
], 0, 8, 880).style.opacity = "1";
const cLabel = host("label-c", 900, 716, 880, 52);
mixedLine(cLabel, [
  { tex: "c", color: "var(--obj-energy)" },
  { text: ": fixed by the starting metric" },
], 0, 4, 880).style.opacity = "1";

/* c6b5 plot. The host scales toward its top-right corner in c6b6. */
const PLOT = { x: 120, y: 460, w: 1680, h: 400 };
const plot = host("plot", PLOT.x, PLOT.y, PLOT.w, PLOT.h);
plot.style.transformOrigin = "100% 0%";
const plotSvg = svgOf(plot, PLOT.w, PLOT.h);
const PY = 240;
const PX0 = 200;
const PX1 = 1380;
line(plotSvg, 120, 36, 120, PY + 20, "var(--obj-wave)", 3);
line(plotSvg, 120, PY, 1560, PY, "var(--obj-energy)", 3);
function boundV(u) {
  return 0.55 * (1 - u) + 0.38 * Math.sin(Math.PI * u) * (1 - u);
}
let curveD = "";
const CURVE_N = 72;
for (let i = 0; i <= CURVE_N; i++) {
  const u = i / CURVE_N;
  const x = PX0 + (PX1 - PX0) * u;
  const y = PY - boundV(u) * 160;
  curveD += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
}
const boundCurve = ns("path");
boundCurve.setAttribute("d", curveD);
boundCurve.setAttribute("fill", "none");
boundCurve.setAttribute("stroke", "var(--obj-wave)");
boundCurve.setAttribute("stroke-width", "4");
boundCurve.setAttribute("stroke-linejoin", "round");
boundCurve.setAttribute("stroke-linecap", "round");
plotSvg.appendChild(boundCurve);
const curveLen = boundCurve.getTotalLength();
const w0Dot = ellipse(plotSvg, PX0, PY - boundV(0) * 160, 7, 7, "none", 0, "var(--obj-wave)");
w0Dot.style.opacity = "0";
const tDot = ellipse(plotSvg, PX1, PY, 7, 7, "none", 0, "var(--obj-energy)");
tDot.style.opacity = "0";
const tTick = line(plotSvg, PX1, PY - 16, PX1, PY + 22, "var(--ink)", 3);
tTick.style.opacity = "0";
const hatch = ns("g");
for (let i = 0; i < 22; i++) {
  const x = 160 + i * 58;
  line(hatch, x, PY + 12, x + 28, PY + 56, "var(--rule)", 2);
}
plotSvg.appendChild(hatch);
hatch.style.opacity = "0";
const w0Label = mixedLine(plot, [{ tex: "W_{0}", color: "var(--obj-wave)" }], 70, PY - boundV(0) * 160 - 44, 110);
w0Label.style.textAlign = "end";
const tStarLabel = mixedLine(plot, [{ tex: "T^{*}", color: "var(--obj-energy)" }], PX1 - 40, PY + 28, 80);
const negLabel = textLine(plot, "a width is never negative", 360, 330, 900);
negLabel.style.opacity = "0";

/* c6b6 tree */
const TREE = { x: 120, y: 248, w: 940, h: 610 };
const tree = host("tree", TREE.x, TREE.y, TREE.w, TREE.h);
const treeSvg = svgOf(tree, TREE.w, TREE.h);
const rootP = { x: 80, y: 300 };
const surgP = [{ x: 250, y: 300 }, { x: 460, y: 300 }, { x: 660, y: 300 }];
const liveP = { x: 820, y: 300 };
const sideP = [{ x: 330, y: 490 }, { x: 560, y: 120 }, { x: 760, y: 500 }];
const tX = 880;
line(treeSvg, 40, 300, tX, 300, "var(--obj-energy)", 3);
const tDash = line(treeSvg, tX, 70, tX, 560, "var(--ink)", 2);
tDash.setAttribute("stroke-dasharray", "7 7");
line(treeSvg, surgP[0].x, surgP[0].y, sideP[0].x, sideP[0].y, "var(--obj-energy)", 3);
line(treeSvg, surgP[1].x, surgP[1].y, sideP[1].x, sideP[1].y, "var(--obj-energy)", 3);
line(treeSvg, surgP[2].x, surgP[2].y, sideP[2].x, sideP[2].y, "var(--obj-energy)", 3);
let traceD = "M" + rootP.x + "," + rootP.y;
surgP.forEach(function (p) { traceD += "L" + p.x + "," + p.y; });
traceD += "L" + liveP.x + "," + liveP.y;
const tracePath = ns("path");
tracePath.setAttribute("d", traceD);
tracePath.setAttribute("fill", "none");
tracePath.setAttribute("stroke", "var(--obj-wave)");
tracePath.setAttribute("stroke-width", "5");
tracePath.setAttribute("stroke-linecap", "round");
treeSvg.appendChild(tracePath);
const traceLen = tracePath.getTotalLength();
tracePath.style.opacity = "0";
function dot(parent, p, r, fill) {
  const c = ns("circle");
  c.setAttribute("cx", String(p.x));
  c.setAttribute("cy", String(p.y));
  c.setAttribute("r", String(r));
  c.setAttribute("fill", fill);
  parent.appendChild(c);
  return c;
}
const sideDots = sideP.map(function (p) { return dot(treeSvg, p, 8, "var(--obj-energy)"); });
const liveDot = dot(treeSvg, liveP, 9, "var(--obj-energy)");
surgP.forEach(function (p) { dot(treeSvg, p, 9, "var(--obj-damping)"); });
const leafRings = sideP.concat([liveP]).map(function (p) {
  const c = dot(treeSvg, p, 14, "none");
  c.setAttribute("stroke", "var(--obj-wave)");
  c.setAttribute("stroke-width", "4");
  c.style.opacity = "0";
  return c;
});
const rootLabel = mixedLine(tree, [
  { tex: "M", color: "var(--obj-hopping)" },
  { text: ", " },
  { tex: "t", color: "var(--obj-energy)" },
  { text: " = 0" },
], 16, 228, 200);
rootLabel.style.opacity = "1";
rootLabel.style.textAlign = "left";
const treeW = mixedLine(tree, [{ tex: "W_{0}", color: "var(--obj-wave)" }], 16, 330, 120);
treeW.style.textAlign = "left";
const treeT = mixedLine(tree, [{ tex: "T^{*}", color: "var(--obj-energy)" }], tX - 36, 36, 80);
treeT.style.opacity = "1";
const leqLabels = surgP.map(function (p) {
  const d = mixedLine(tree, [{ tex: "\\le" }], p.x - 48, p.y + 18, 36);
  d.style.textAlign = "left";
  d.style.opacity = "0";
  return d;
});

/* c6b7 cards */
const cardLayer = layer();
const leftSpan = span(0, 5);
const rightSpan = span(7, 5);
const cardL = ledgerCard({
  parent: cardLayer, status: "proved", box: "card-perelman",
  x: leftSpan.x, y: 380, w: leftSpan.w,
  title: "Perelman: loops and discs",
  lines: ["−2π, leads to 8π"],
  tIn: T.colding,
});
const cardR = ledgerCard({
  parent: cardLayer, status: "proved", box: "card-colding",
  x: rightSpan.x, y: 380, w: rightSpan.w,
  title: "Colding–Minicozzi: spheres",
  lines: ["−4π, leads to 16π"],
  tIn: T.colding + D.cards * 0.35,
});
cardL.el.dataset.words = "per-text";
cardR.el.dataset.words = "per-text";
function paintMathLine(card, tex) {
  const lineEl = card.el.querySelector(".ledger-line");
  lineEl.textContent = "";
  katex.render(tex, lineEl, KX);
}
paintMathLine(cardL, "-2\\pi,\\ \\text{leads to } 8\\pi");
paintMathLine(cardR, "-4\\pi,\\ \\text{leads to } 16\\pi");
const routeLabel = textLine(document.body, "two routes, two sets of constants", 360, 560, 1200);
routeLabel.dataset.box = "label-routes";
routeLabel.style.opacity = "0";

/* c6b8–b9 labels and ink crosses. The icons are in rigP. */
const PIECE = { x: 120, y: 228, w: 1680, h: 648 };
const pieces = host("pieces", PIECE.x, PIECE.y, PIECE.w, PIECE.h);
const pieceSvg = svgOf(pieces, PIECE.w, PIECE.h);
const pieceCaptions = ["S³", "S³ / finite group", "S² × circle"];
const pieceCaps = pieceCaptions.map(function (text) {
  const cap = textLine(pieces, text, 0, 480, 340);
  cap.style.opacity = "1";
  return cap;
});
const crosses = [1, 2].map(function () {
  const g = ns("g");
  const a = line(g, 0, 0, 0, 0, "var(--ink)", 8);
  const b = line(g, 0, 0, 0, 0, "var(--ink)", 8);
  a.setAttribute("stroke-linecap", "round");
  b.setAttribute("stroke-linecap", "round");
  g.style.opacity = "0";
  pieceSvg.appendChild(g);
  return { g: g, a: a, b: b };
});
const hashL = textLine(pieces, "#", 0, 240, 80);
const hashR = textLine(pieces, "#", 0, 240, 80);
hashL.style.opacity = "0";
hashR.style.opacity = "0";
const sumLabel = textLine(pieces, "M = connected sum", 340, 560, 1000);
sumLabel.style.opacity = "0";
const notLabel = textLine(pieces, "not simply connected", 340, 508, 1000);
notLabel.style.opacity = "0";
const smoothLabel = mixedLine(pieces, [
  { tex: "M", color: "var(--obj-hopping)" },
  { text: " = " },
  { tex: "S^{3}", color: "var(--obj-hopping)" },
  { text: ", smoothly" },
], 340, 560, 1000);
const pieceIllust = textLine(pieces, "illustration: the pieces, drawn as surfaces", 360, 4, 960, "var(--ink-muted)");
pieceIllust.style.opacity = "1";

/* c6b10 card */
const endLayer = layer();
const endSpan = span(2, 8);
const endCard = ledgerCard({
  parent: endLayer, status: "proved", box: "card-conjecture",
  x: endSpan.x, y: 730, w: endSpan.w,
  title: "every closed, simply connected three-manifold is S³",
  lines: [],
  tIn: T.conjecture,
});

const REF_S = 0.46;
const REF_X1 = 150;
const REF_X2 = 150 + Math.round(EQ1.w * REF_S) + 28;
const REF_Y = 248;

function slide(u, dx, dy, s) {
  if (u <= 0.001) return "none";
  const k = 1 + (s - 1) * u;
  return "translate(" + (dx * u).toFixed(2) + "px, " + (dy * u).toFixed(2) + "px) scale(" + k.toFixed(4) + ")";
}

function pageOf(world) {
  return st.project(world);
}

function pxRadius(center, worldR) {
  const c = pageOf(center);
  const e = pageOf([center[0] + worldR, center[1], center[2]]);
  return Math.hypot(e.x - c.x, e.y - c.y);
}

mark(D.intro, "c6b1", "proof map full frame");
mark(T.stop, "c6b1", "extinction node active");
mark(T.nothing, "c6b1", "map yields to the strip; profiles vanish");
mark(T.extinction, "c6b1", "extinction done");
mark(T.perelman, "c6b2", "manifold");
mark(T.w, "c6b2", "label W");
mark(T.loops, "c6b2", "family of loops");
mark(T.disc, "c6b2", "discs");
mark(T.largest, "c6b2", "largest disc outlined");
mark(T.flow, "c6b3", "dW/dt");
mark(T.two, "c6b3", "at most minus two pi");
mark(T.half, "c6b3", "half R min W");
mark(T.smallest, "c6b3", "label R min");
mark(T.least, "c6b4", "lower bound for R min");
mark(T.constant, "c6b4", "label c");
mark(T.two5, "c6b5", "equations rise to a reference line");
mark(T.integrate, "c6b5", "width curve");
mark(T.zero, "c6b5", "tick T star");
mark(T.negative, "c6b5", "hatch below the axis");
mark(T.tree, "c6b6", "plot shrinks; surgery tree");
mark(T.trace, "c6b6", "path back to the root");
mark(T.w0, "c6b6", "root labelled W zero");
mark(T.raises, "c6b6", "surgery marks");
mark(T.covers, "c6b6", "every leaf against T star");
mark(T.colding, "c6b7", "two route cards");
mark(T.own, "c6b7", "two routes, two sets of constants");
mark(T.backwards, "c6b8", "three pieces");
mark(T.connected, "c6b8", "connected sum");
mark(T.simply, "c6b9", "cross pieces that are not simply connected");
mark(T.qualifies, "c6b9", "three-sphere remains");
mark(T.smooth, "c6b9", "M is S3, smoothly");
mark(T.back, "c6b10", "proof map full frame");
mark(T.moise, "c6b10", "Moise smoothing");
mark(T.conjecture, "c6b10", "conjecture card");
mark(T.tail, "c6b10", "picture fades out");

window.sceneReady = function () {
  [mapFull, mapStrip].forEach(function (map) {
    const texts = map.el.querySelectorAll("text");
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const box = text.parentNode.querySelector("rect");
      if (!box || !text.getComputedTextLength) continue;
      const room = parseFloat(box.getAttribute("width")) - 20;
      if (text.getComputedTextLength() > room) {
        text.setAttribute("textLength", room.toFixed(1));
        text.setAttribute("lengthAdjust", "spacingAndGlyphs");
      }
    }
  });
};

window.sceneEvents = events;
window.sceneDuration = window.__BEATS__.duration;

window.setTime = function (t) {
  const out = 1 - fade(t, T.tail, D.tail);
  const fullEarly = fade(t, D.intro, 0.45) * (1 - fade(t, T.nothing, D.vanish * 0.24));
  const stripIn = fade(t, T.nothing + D.vanish * 0.26, D.vanish * 0.16);
  const stripStay = 1 - fade(t, T.back, D.back * 0.4);
  const fullBack = fade(t, T.back + D.back * 0.4, D.back * 0.6);
  put(mapFull.el, Math.max(fullEarly, fullBack) * out);
  put(mapStrip.el, stripIn * stripStay * out);
  mapFull.setTime(t);
  mapStrip.setTime(t);

  const axisIn = fade(t, T.nothing + D.vanish * 0.4, D.vanish * 0.12);
  const axisGone = fade(t, T.perelman, D.enter * 0.45);
  const show1 = axisIn * (1 - axisGone) * out;
  const sweepIn = fade(t, T.perelman + D.enter * 0.5, D.enter * 0.5);
  const sweepOut = 1 - fade(t, T.two5, D.rise * 0.45);
  const show2 = sweepIn * sweepOut * out;
  const piecesIn = fade(t, T.backwards + D.pieces * 0.4, D.pieces * 0.6);
  const piecesLeave = 1 - fade(t, T.back, D.back * 0.4);
  const showP = piecesIn * piecesLeave * out;

  const az1 = -8 + 5 * lin(t, T.nothing, T.perelman - T.nothing);
  pieces3.forEach(function (rev, i) {
    const u = lin(t, T.nothing + D.vanish * (0.54 + i * 0.12), D.vanish * 0.11);
    const rho = RHO0 * Math.sqrt(Math.max(0, 1 - u));
    const alive = rho > 0.025 && show1 > 0.001;
    rev.anchor.visible = alive;
    if (!alive) return;
    rev.set(roundR(rho), -rho, rho);
    rev.setOpacity(1);
    rev.surf.shell.material.uniforms.uWidth.value = 0.012 * (rho / RHO0);
  });
  rig1.visible = show1 > 0.001;

  const az2 = -24 + 0.14 * (t - T.perelman);
  const glass = show2 > 0.001;
  rig2.visible = glass;
  if (glass) {
    ball.setOpacity(0.22);
    ball.surf.shell.visible = false;
    ball.surf.material.depthWrite = false;
    rim.setDraw(1);
    rim.setOpacity(1);
    const emph = fade(t, T.largest, D.largest);
    const discDraw = D.discs * 0.5;
    const discStep = (D.discs - discDraw) / (HS.length - 1);
    families.forEach(function (fam, i) {
      const drawn = fade(t, T.loops + i * LOOP_STEP, LOOP_DRAW);
      const filled = fade(t, T.disc + i * discStep, discDraw);
      const big = i === BIG;
      const dim = big ? 1 : (1 - 0.62 * emph);
      const tube = big ? lerp(TUBE, TUBE_BIG, emph) : TUBE;
      fam.loop.setRadius(tube);
      fam.loop.set(fam.pts);
      fam.loop.setDraw(drawn);
      fam.loop.setOpacity(drawn > 0.001 ? dim : 0);
      const fill = big ? lerp(0.34, 0.72, emph) : lerp(0.34, 0.14, emph);
      fam.plate.setStrength(fill * filled * dim);
    });
  }
  put(axisHost, show1);
  const tickIn = fade(t, T.nothing + D.vanish * 0.93, D.vanish * 0.07);
  put(axisTick, tickIn);
  put(finiteLabel, tickIn);
  put(mHost, show2);
  put(sweepHost, show2);
  put(wLabel, fade(t, T.w, D.width));

  const showPieces = showP > 0.001;
  const merge = fade(t, T.qualifies, D.qualify);
  const othersOut = fade(t, T.qualifies, D.qualify * 0.45);
  iconRoot[0].position.x = lerp(ICON_X[0], 0, merge);
  iconRoot[1].position.x = ICON_X[1];
  iconRoot[2].position.x = ICON_X[2];
  const azP = 16 + 0.22 * (t - T.backwards);
  frameFocus([0, 0, 0], azP, 18, 10.4, 0, 0.05);
  rigP.visible = showPieces;
  if (showPieces) {
    iconS.setOpacity(1);
    iconQ.setOpacity(1 - othersOut);
    iconRing.setOpacity(1 - othersOut);
  }
  const which = show2 >= show1 && show2 >= showP ? 2 : (showP >= show1 ? 3 : 1);
  if (which === 1) frameFocus([0, 0, 0], az1, 18, 11, 0, 0.1);
  else if (which === 2) frameFocus([0, 0, 0], az2, 20, 15.7, -0.44, 0.0);
  else frameFocus([0, 0, 0], azP, 18, 10.4, 0, 0.05);
  if (glass && which === 2) {
    const cam2 = st.camera.position;
    const dir2 = vNorm([cam2.x, cam2.y, cam2.z]);
    const hint2 = Math.abs(dir2[1]) < 0.85 ? [0, 1, 0] : [1, 0, 0];
    const uu2 = vNorm(vCross(hint2, dir2));
    const vv2 = vNorm(vCross(dir2, uu2));
    rim.set(circlePts([0, 0, 0], uu2, vv2, BALL_R * 1.012, 160));
  }
  if (show1 > 0.001 && which === 1) {
    const left = pageOf([SPHERE_X[0], 0, 0]);
    const right = pageOf([SPHERE_X[2], 0, 0]);
    const mid = pageOf([0, 0, 0]);
    const rad = pxRadius([0, 0, 0], RHO0);
    const yLine = mid.y + rad + 58 - AXIS.y;
    const x0 = left.x - rad - 70 - AXIS.x;
    const x1 = right.x + rad + 150 - AXIS.x;
    axisLine.setAttribute("x1", x0.toFixed(1));
    axisLine.setAttribute("x2", x1.toFixed(1));
    axisLine.setAttribute("y1", yLine.toFixed(1));
    axisLine.setAttribute("y2", yLine.toFixed(1));
    const tickX = x1 - 8;
    axisTick.setAttribute("x1", tickX.toFixed(1));
    axisTick.setAttribute("x2", tickX.toFixed(1));
    axisTick.setAttribute("y1", (yLine - 26).toFixed(1));
    axisTick.setAttribute("y2", (yLine + 26).toFixed(1));
    finiteLabel.style.left = (tickX - 200) + "px";
    finiteLabel.style.top = (yLine + 36) + "px";
  }
  st.setOpacity(Math.max(show1, show2, showP));
  st.render();

  if (showPieces) {
    const centers = iconRoot.map(function (g) {
      return pageOf([g.position.x, 0, 0]);
    });
    const radP = pxRadius([iconRoot[0].position.x, 0, 0], ICON_R);
    pieceCaps.forEach(function (cap, i) {
      const fadeOut = i === 0 ? 1 : (1 - othersOut);
      put(cap, fadeOut);
      cap.style.left = (centers[i].x - PIECE.x - 170) + "px";
      cap.style.top = (centers[i].y + radP + 36 - PIECE.y) + "px";
    });
    function pinHash(el, a, b) {
      el.style.left = ((a.x + b.x) / 2 - PIECE.x - 40) + "px";
      el.style.top = ((a.y + b.y) / 2 - PIECE.y - 22) + "px";
    }
    pinHash(hashL, centers[0], centers[1]);
    pinHash(hashR, centers[1], centers[2]);
    crosses.forEach(function (cross, k) {
      const c = centers[k + 1];
      const s = radP * 0.72;
      const x = c.x - PIECE.x;
      const y = c.y - PIECE.y;
      cross.a.setAttribute("x1", (x - s).toFixed(1));
      cross.a.setAttribute("y1", (y - s).toFixed(1));
      cross.a.setAttribute("x2", (x + s).toFixed(1));
      cross.a.setAttribute("y2", (y + s).toFixed(1));
      cross.b.setAttribute("x1", (x + s).toFixed(1));
      cross.b.setAttribute("y1", (y - s).toFixed(1));
      cross.b.setAttribute("x2", (x - s).toFixed(1));
      cross.b.setAttribute("y2", (y + s).toFixed(1));
    });
  }
  const joined = fade(t, T.connected, D.sum);
  const cross0 = fade(t, T.simply, D.cross * 0.5);
  const cross1 = fade(t, T.simply + D.cross * 0.5, D.cross * 0.5);
  put(crosses[0].g, cross0 * (1 - othersOut));
  put(crosses[1].g, cross1 * (1 - othersOut));
  put(hashL, joined * (1 - othersOut));
  put(hashR, joined * (1 - othersOut));
  put(notLabel, fade(t, T.simply, 0.4) * (1 - othersOut));
  put(sumLabel, joined * (1 - merge));
  put(smoothLabel, fade(t, T.smooth, D.smooth));
  put(pieces, showP);

  const eqMove = fade(t, T.two5, D.rise);
  const eqHide = 1 - fade(t, T.tree, D.tree * 0.25);
  const eqShow1 = t >= T.flow ? 1 : 0;
  const eqShow2 = t >= T.least ? 1 : 0;
  put(eq1.el, eqShow1 * eqHide * out);
  put(eq2.el, eqShow2 * eqHide * out);
  eq1.el.style.transform = slide(eqMove, REF_X1 - EQ1.x, REF_Y - EQ1.y, REF_S);
  eq2.el.style.transform = slide(eqMove, REF_X2 - EQ2.x, REF_Y - EQ2.y, REF_S);
  eq1.setTime(t);
  eq2.setTime(t);
  const labelLeave = fade(t, T.two5, D.rise * 0.4);
  put(rminLabel, fade(t, T.smallest, D.rmin) * (1 - labelLeave) * eqHide * out);
  put(cLabel, fade(t, T.constant, D.constant) * (1 - labelLeave) * eqHide * out);

  const plotIn = fade(t, T.two5 + D.rise * 0.62, D.rise * 0.38);
  const plotLeave = 1 - fade(t, T.colding, D.cards * 0.45);
  put(plot, plotIn * plotLeave * out);
  const shrink = fade(t, T.tree, D.tree * (2 / 3));
  const sc = 1 + (0.42 - 1) * shrink;
  const yMove = -190 * shrink;
  plot.style.transform = shrink <= 0.001
    ? "none"
    : "translate(0px, " + yMove.toFixed(2) + "px) scale(" + sc.toFixed(4) + ")";
  const drawn = fade(t, T.integrate, D.draw);
  boundCurve.style.strokeDasharray = curveLen.toFixed(2);
  boundCurve.style.strokeDashoffset = ((1 - drawn) * curveLen).toFixed(2);
  put(w0Dot, fade(t, T.integrate, 0.4));
  put(w0Label, fade(t, T.integrate, 0.4));
  const zeroIn = fade(t, T.zero, D.zero);
  put(tDot, zeroIn);
  put(tTick, zeroIn);
  put(tStarLabel, zeroIn);
  const negIn = fade(t, T.negative, D.neg);
  put(hatch, negIn);
  put(negLabel, negIn);

  const treeIn = fade(t, T.tree + D.tree * (2 / 3), D.tree * (1 / 3));
  const treeLeave = 1 - fade(t, T.colding, D.cards * 0.45);
  put(tree, treeIn * treeLeave * out);
  const traced = fade(t, T.trace, D.trace);
  tracePath.style.strokeDasharray = traceLen.toFixed(2);
  tracePath.style.strokeDashoffset = ((1 - traced) * traceLen).toFixed(2);
  put(tracePath, traced > 0.001 ? 1 : 0);
  const covered = fade(t, T.covers, D.covers);
  leafRings.forEach(function (ring, i) {
    const onPath = i === leafRings.length - 1;
    put(ring, Math.max(onPath ? traced : 0, covered));
  });
  put(treeW, fade(t, T.w0, D.w0));
  const raised = fade(t, T.raises, D.raises);
  leqLabels.forEach(function (el) { put(el, raised); });

  const cardLeave = 1 - fade(t, T.backwards, D.pieces * 0.45);
  put(cardLayer, cardLeave * out);
  cardL.setTime(t);
  cardR.setTime(t);
  put(routeLabel, fade(t, T.own, D.own) * cardLeave * out);

  put(endLayer, out);
  endCard.setTime(t);

  label.setTime(t);
  strip.setTime(t);
  subs.setTime(t);
};
