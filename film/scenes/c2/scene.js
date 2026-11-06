/* Chapter 2. The question. The picture is a function of t. Tokens only. ES module (three.js for the 3D pictures). */
import { stage3d, surface, latheGeometry, setLathe, curve, circlePts, tint, tokenColor, THREE } from "../three3d/stage3d.js";
installBeats(window.__BEATS__);

const INTRO = need("c2b1", "lead", 1.2, "chapter title settles");
const GRID = need("c2b1", "space", 1.0, "grid of ordinary space draws in");
const ORD = need("c2b1", "ordinary", 0.5, "ordinary space label");
const LETTER = need("c2b1", "M", 0.5, "the manifold is named M");
const CLOSED = need("c2b1", "Closed", 0.4, "closed card enters");
const CARDGONE = need("c2b2", "simplest", 0.4, "closed card leaves");
const SHRINK = need("c2b2", "simplest", 0.8, "cube shrinks to the left third");
const ROWS = need("c2b2", "simplest", 0.8, "circle and sphere rows appear");
const ROW3 = need("c2b2", "four-dimensional", 0.8, "three-sphere row appears");
const CANNOT = need("c2b3", "cannot", 0.6, "cannot be drawn whole");
const NEAR = need("c2b3", "near", 0.8, "cube joins the three-sphere");
const EARTH_D = need("c2b3", "patch", 1.4, "earth appears, a flat square rises from its patch");
const GROW = need("c2b4", "M", 1.0, "cube grows to a region of M");
const LOOP = need("c2b4", "loop", 0.6, "loop appears inside the cube");
const SHRINKLOOP = need("c2b4", "shrunk", 1.2, "loop contracts to a point");
const LEAVE = need("c2b4", "leaving", 0.5, "simply connected label");
const ASK = need("c2b5", "question", 0.6, "question card enters");
const HOME = need("c2b5", "Homeomorphic", 0.8, "two blobs joined by arrows");
const EX = need("c2b6", "Poincaré", 0.8, "example card slides in");
const LOOPLINE = need("c2b6", "loop", 0.5, "loop that cannot shrink");
const NOTS = need("c2b6", "not", 0.5, "not a sphere");
const TABLE = need("c2b7", "dimensions", 0.8, "cards leave and the table opens");
const SMALE = need("c2b7", "Smale", 0.6, "Smale row");
const FREED = need("c2b7", "Freedman", 0.6, "Freedman row");
const DIM3 = need("c2b8", "three", 0.6, "dimension three row");
const OUT = need("c2b8", "tail", 0.8, "picture fades out");

const T = {
  space: cue("c2b1", "space"),
  ordinary: cue("c2b1", "ordinary"),
  m1: cue("c2b1", "M"),
  closed: cue("c2b1", "Closed"),
  simplest: cue("c2b2", "simplest"),
  four: cue("c2b2", "four-dimensional"),
  cannot: cue("c2b3", "cannot"),
  near: cue("c2b3", "near"),
  earth: cue("c2b3", "patch"),
  m4: cue("c2b4", "M"),
  loop: cue("c2b4", "loop"),
  shrunk: cue("c2b4", "shrunk"),
  leaving: cue("c2b4", "leaving"),
  question: cue("c2b5", "question"),
  home: cue("c2b5", "Homeomorphic"),
  poincare: cue("c2b6", "Poincaré"),
  loop6: cue("c2b6", "loop"),
  not: cue("c2b6", "not"),
  dimensions: cue("c2b7", "dimensions"),
  smale: cue("c2b7", "Smale"),
  freedman: cue("c2b7", "Freedman"),
  three: cue("c2b8", "three"),
  tail: beatEnd("c2b8"),
};

const NS = "http://www.w3.org/2000/svg";
const CELLS = 4;
const CELL = 100;

const POSE = {
  big: { x: 520, y: 490, s: 1.16 },
  left: { x: 400, y: 430, s: 0.74 },
  beside: { x: 500, y: 584, s: 0.38 },
  centre: { x: 960, y: 470, s: 1.16 },
};

const ROW_Y = [110, 322, 534];
const SHAPE_X = 900;
const FORM_X = 1080;
const FORM_W = 680;
const FORM_H = 120;
const LABEL_DY = 128;

const chapter = chapterLabel({ n: 2, title: "The question", intro: INTRO });
const strip = mountStrip(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);

const content = document.createElement("div");
content.style.position = "absolute";
content.style.left = "0";
content.style.top = "0";
content.style.width = "1920px";
content.style.height = "1080px";
document.body.appendChild(content);

function el(name) {
  return document.createElementNS(NS, name);
}

function setOp(node, o) {
  const v = o < 0.02 ? 0 : o;
  node.style.opacity = String(v);
  node.style.visibility = v === 0 ? "hidden" : "visible";
}

function mixPose(a, b, k) {
  return {
    x: lerp(a.x, b.x, k),
    y: lerp(a.y, b.y, k),
    s: lerp(a.s, b.s, k),
  };
}

function rawAt(i, j, k) {
  return [(i + 0.5 * k) * CELL, (-j + 0.32 * k) * CELL];
}

let minX = 1e9;
let maxX = -1e9;
let minY = 1e9;
let maxY = -1e9;
for (let i = 0; i <= CELLS; i++) {
  for (let j = 0; j <= CELLS; j++) {
    for (let k = 0; k <= CELLS; k++) {
      const p = rawAt(i, j, k);
      if (p[0] < minX) minX = p[0];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[1] > maxY) maxY = p[1];
    }
  }
}
const midX = (minX + maxX) / 2;
const midY = (minY + maxY) / 2;

function pt(i, j, k) {
  const p = rawAt(i, j, k);
  return [p[0] - midX, p[1] - midY];
}

const svg = el("svg");
svg.setAttribute("viewBox", "0 0 1920 1080");
svg.style.position = "absolute";
svg.style.left = "0";
svg.style.top = "0";
svg.style.width = "1920px";
svg.style.height = "1080px";
svg.setAttribute("fill", "none");
content.appendChild(svg);

function strokeLine(parent, token, width, dash) {
  const ln = el("line");
  ln.setAttribute("stroke", "var(" + token + ")");
  ln.setAttribute("stroke-width", String(width));
  ln.setAttribute("stroke-linecap", "round");
  ln.setAttribute("vector-effect", "non-scaling-stroke");
  if (dash) ln.setAttribute("stroke-dasharray", dash);
  parent.appendChild(ln);
  return ln;
}

function poly(parent, token, width, dash) {
  const p = el("path");
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "var(" + token + ")");
  p.setAttribute("stroke-width", String(width));
  p.setAttribute("stroke-linejoin", "round");
  p.setAttribute("stroke-linecap", "round");
  if (dash) p.setAttribute("stroke-dasharray", dash);
  parent.appendChild(p);
  return p;
}

function shapeCircle(parent) {
  const g = el("g");
  const c = el("circle");
  c.setAttribute("r", "62");
  c.setAttribute("fill", "none");
  c.setAttribute("stroke", "var(--obj-hopping)");
  c.setAttribute("stroke-width", "4");
  g.appendChild(c);
  parent.appendChild(g);
  return g;
}

function shapeSphere(parent) {
  const g = el("g");   // drawn in 3D (sphere3d)
  parent.appendChild(g);
  return g;
}

function shapeBox(parent) {
  const g = el("g");
  const r = el("rect");
  r.setAttribute("x", "-66");
  r.setAttribute("y", "-58");
  r.setAttribute("width", "132");
  r.setAttribute("height", "116");
  r.setAttribute("fill", "none");
  r.setAttribute("stroke", "var(--ink-muted)");
  r.setAttribute("stroke-width", "3");
  r.setAttribute("stroke-dasharray", "10 8");
  g.appendChild(r);
  parent.appendChild(g);
  return g;
}


// ---------- 3D pictures: the grid of ordinary space (a cube), the loop inside it, the 2-sphere, the earth ----------
// One camera, looking along -z at the origin; screen pixel (x, y) on the plane z = 0 is world (x - 960, 540 - y) * PX.
const CAM_D = 20;
const st = stage3d({ fov: 26 });
st.look([0, 0, CAM_D], [0, 0, 0]);
const HALF_FOV_SLOPE = 0.2308681911;   // the slope of half the 26-degree field of view
const PX = 2 * CAM_D * HALF_FOV_SLOPE / 1080;
function wx(x) { return (x - 960) * PX; }
function wy(y) { return (540 - y) * PX; }

// cube: a 4 x 4 x 4 grid of ordinary space, side 1 in its own frame (centred), scaled by the pose
const cube = new THREE.Group();
st.scene.add(cube);
const gridCurves = [];
for (let a = 0; a <= CELLS; a++) {
  for (let b = 0; b <= CELLS; b++) {
    const u = a / CELLS - 0.5, v = b / CELLS - 0.5;
    const segs = [[[-0.5, u, v], [0.5, u, v]], [[u, -0.5, v], [u, 0.5, v]], [[u, v, -0.5], [u, v, 0.5]]];
    for (const sgm of segs) {
      const pts = [];
      for (let i = 0; i <= 8; i++) { const k = i / 8; pts.push([lerp(sgm[0][0], sgm[1][0], k), lerp(sgm[0][1], sgm[1][1], k), lerp(sgm[0][2], sgm[1][2], k)]); }
      const edge = (Math.abs(u) === 0.5 && Math.abs(v) === 0.5);
      const c = curve(st, pts, { closed: false, token: "--ink-muted", radius: edge ? 0.0055 : 0.003, hidden: "none", sides: 6 });
      c.weight = edge ? 1 : 0.42;
      st.scene.remove(c.group); cube.add(c.group); gridCurves.push(c);
    }
  }
}
const faceMat = new THREE.MeshBasicMaterial({ color: tint("--obj-hopping", 0.9), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
const faceBox = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), faceMat);
faceBox.renderOrder = 0;
cube.add(faceBox);
// the loop inside the cube: a wavy closed curve around the centre, tilted, well inside the cube (|coords| < 0.36)
const NL = 140;
function loopPts(k) {
  const out = [];
  for (let i = 0; i < NL; i++) {
    const th = 2 * Math.PI * i / NL;
    const r = 0.3 * (1 + 0.12 * Math.sin(3 * th));
    const p = [r * Math.cos(th), 0.09 * Math.sin(2 * th) + 0.12 * Math.cos(th) * 0.5, r * Math.sin(th) * 0.8];
    out.push([p[0] * k, p[1] * k, p[2] * k]);
  }
  return out;
}
const loop3 = curve(st, loopPts(1), { token: "--obj-wave", radius: 0.012, hidden: "none" });
st.scene.remove(loop3.group); cube.add(loop3.group);
const loopDot3 = new THREE.Mesh(new THREE.SphereGeometry(0.024, 20, 12), new THREE.MeshBasicMaterial({ color: tokenColor("--obj-wave") }));
cube.add(loopDot3);

// the 2-sphere of row 2: radius 62 px, equator (back half dashed)
const sphereGroup = new THREE.Group();
st.scene.add(sphereGroup);
const unitSphere = latheGeometry(90, 90);
setLathe(unitSphere, function (s) { return Math.sqrt(Math.max(0, 1 - s * s)); }, -1, 1);
const sph = surface(st, unitSphere, { token: "--obj-hopping", k: 0.6, outline: 0.03 });
sph.group.rotation.z = Math.PI / 2;
st.scene.remove(sph.group); sphereGroup.add(sph.group);
const eq3 = curve(st, circlePts([0, 0, 0], [1, 0, 0], [0, 0, 1], 1.03, 120), { token: "--ink-muted", radius: 0.025 });
st.scene.remove(eq3.group); sphereGroup.add(eq3.group);
sphereGroup.position.set(wx(SHAPE_X), wy(ROW_Y[1] + 50), 0);
sphereGroup.scale.setScalar(62 * PX);
sphereGroup.rotation.x = 0.38;

// the earth: a sphere with a small curved patch; at [earth] a flat square rises from the patch, tangent to it
const EARTH = { x: 1180, y: 822, r: 74 };
const earthGroup = new THREE.Group();
st.scene.add(earthGroup);
const earth = surface(st, unitSphere, { token: "--obj-hopping", k: 0.6, outline: 0.03 });
earth.group.rotation.z = Math.PI / 2;
st.scene.remove(earth.group); earthGroup.add(earth.group);
earthGroup.position.set(wx(EARTH.x), wy(EARTH.y), 0);
earthGroup.scale.setScalar(EARTH.r * PX);
// patch centre: direction n on the sphere, facing the camera, up and to the right
const PN = new THREE.Vector3(0.42, 0.45, 0.79).normalize();
const PU = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), PN).normalize();
const PV = new THREE.Vector3().crossVectors(PN, PU).normalize();
const PATCH = 0.36;  // half side (radians, about 17 degrees)
function patchPts(flat, lift) {
  const out = [];
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (let c = 0; c < 4; c++) {
    const a = corners[c], b = corners[(c + 1) % 4];
    for (let i = 0; i < 20; i++) {
      const k = i / 20;
      const x = lerp(a[0], b[0], k) * PATCH, y = lerp(a[1], b[1], k) * PATCH;
      // curved patch: on the sphere (radius 1.02); flat patch: in the tangent plane at PN, lifted by `lift`
      const q = new THREE.Vector3().copy(PN).addScaledVector(PU, x).addScaledVector(PV, y);
      if (!flat) q.normalize().multiplyScalar(1.02);
      else q.addScaledVector(PN, lift);
      out.push([q.x, q.y, q.z]);
    }
  }
  return out;
}
const patchCurved = curve(st, patchPts(false, 0), { token: "--ink", radius: 0.022 });
st.scene.remove(patchCurved.group); earthGroup.add(patchCurved.group);
const patchFlat = curve(st, patchPts(true, 0.02), { token: "--ink", radius: 0.022 });
st.scene.remove(patchFlat.group); earthGroup.add(patchFlat.group);
const patchFill = new THREE.Mesh(new THREE.PlaneGeometry(2 * PATCH, 2 * PATCH), new THREE.MeshBasicMaterial({ color: tokenColor("--paper-raised"), transparent: true, opacity: 0, side: THREE.DoubleSide }));
patchFill.renderOrder = 1;
earthGroup.add(patchFill);
patchFill.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(PU, PV, PN));

function cubeAt(t, pose, op, kGrow, loopIn, shrinkK) {
  cube.position.set(wx(pose.x), wy(pose.y), 0);
  cube.scale.setScalar(360 * pose.s * PX);
  // the cube turns slowly about its vertical axis (a few degrees over the chapter), seen a little from above
  cube.rotation.set(0.42, -0.62 + 0.012 * (t - T.space), 0);
  cube.visible = op > 0.01;
  for (const c of gridCurves) c.setOpacity(op * c.weight);
  faceMat.opacity = 0.16 * kGrow * op;
  loop3.set(loopPts(lerp(1, 0.001, shrinkK)));
  loop3.setOpacity(loopIn * (1 - fade(shrinkK, 0.85, 0.15)) * op);
  loop3.setDraw(loopIn);
  loopDot3.visible = loopIn * shrinkK > 0.9 && op > 0.01;
}

const rowG = [shapeCircle(svg), shapeSphere(svg), shapeBox(svg)];

const joinG = el("g");
svg.appendChild(joinG);
const joinLine = strokeLine(joinG, "--ink", 3);
joinLine.removeAttribute("vector-effect");
const joinHead = el("path");
joinHead.setAttribute("fill", "var(--ink)");
joinHead.setAttribute("stroke", "none");
joinG.appendChild(joinHead);

function setArrow(line, head, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const ah = 18;
  const aw = 7;
  const bx = x2 - ux * ah;
  const by = y2 - uy * ah;
  line.setAttribute("x1", x1.toFixed(1));
  line.setAttribute("y1", y1.toFixed(1));
  line.setAttribute("x2", bx.toFixed(1));
  line.setAttribute("y2", by.toFixed(1));
  const px = -uy;
  const py = ux;
  const d = "M" + x2.toFixed(1) + "," + y2.toFixed(1) +
    " L" + (bx + px * aw).toFixed(1) + "," + (by + py * aw).toFixed(1) +
    " L" + (bx - px * aw).toFixed(1) + "," + (by - py * aw).toFixed(1) + " Z";
  head.setAttribute("d", d);
}

function blobD(cx, cy, rx, ry, phase) {
  let d = "";
  const n = 56;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w = 1 + 0.09 * Math.sin(3 * a + phase) + 0.05 * Math.cos(2 * a + phase * 0.5);
    const x = cx + Math.cos(a) * rx * w;
    const y = cy + Math.sin(a) * ry * w;
    d += (i ? " L" : "M") + x.toFixed(1) + "," + y.toFixed(1);
  }
  return d + " Z";
}

const homeG = el("g");
svg.appendChild(homeG);
const blobL = poly(homeG, "--obj-hopping", 5);
blobL.setAttribute("d", blobD(700, 590, 118, 84, 0.4));
const blobR = poly(homeG, "--obj-hopping", 5);
blobR.setAttribute("d", blobD(1240, 590, 118, 84, 1.7));
const homeLineA = strokeLine(homeG, "--ink", 3);
homeLineA.removeAttribute("vector-effect");
const homeHeadA = el("path");
homeHeadA.setAttribute("fill", "var(--ink)");
homeHeadA.setAttribute("stroke", "none");
homeG.appendChild(homeHeadA);
const homeLineB = strokeLine(homeG, "--ink", 3);
homeLineB.removeAttribute("vector-effect");
const homeHeadB = el("path");
homeHeadB.setAttribute("fill", "var(--ink)");
homeHeadB.setAttribute("stroke", "none");
homeG.appendChild(homeHeadB);
setArrow(homeLineA, homeHeadA, 860, 558, 1080, 558);
setArrow(homeLineB, homeHeadB, 1080, 624, 860, 624);

const tableG = el("g");
svg.appendChild(tableG);
const tableRule = el("line");
tableRule.setAttribute("x1", "380");
tableRule.setAttribute("x2", "1540");
tableRule.setAttribute("y1", "500");
tableRule.setAttribute("y2", "500");
tableRule.setAttribute("stroke", "var(--rule)");
tableRule.setAttribute("stroke-width", "2");
tableG.appendChild(tableRule);

function tickAt(y) {
  const p = el("path");
  const x = 430;
  const d = "M" + x + "," + (y + 16) + " L" + (x + 10) + "," + (y + 28) + " L" + (x + 28) + "," + y;
  p.setAttribute("d", d);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "var(--status-proved)");
  p.setAttribute("stroke-width", "4");
  p.setAttribute("stroke-linecap", "round");
  p.setAttribute("stroke-linejoin", "round");
  tableG.appendChild(p);
  return p;
}

const tickSmale = tickAt(520);
const tickFreed = tickAt(630);

function makeLabel(name, text, strong) {
  const d = document.createElement("div");
  d.className = strong ? "t-label strong" : "t-label";
  d.dataset.box = name;
  d.textContent = text;
  d.style.position = "absolute";
  d.style.whiteSpace = "nowrap";
  d.style.left = "120px";
  d.style.top = "80px";
  d.style.color = "var(--ink)";
  content.appendChild(d);
  setOp(d, 0);
  return d;
}

function place(node, x, y, o) {
  node.style.left = Math.round(x) + "px";
  node.style.top = Math.round(y) + "px";
  setOp(node, o);
}

const labOrdinary = makeLabel("ordinary", "near every point: like ordinary space");
const labCircle = makeLabel("circle-label", "circle, in the plane");
const labSphere = makeLabel("sphere-label", "2-sphere, in space");
const labThree = makeLabel("three-label", "three-sphere S³, in 4-dimensional space");
const labCannot = makeLabel("cannot-label", "cannot be drawn whole");
const labNear = makeLabel("near-label", "near each point: a piece of ordinary space");
const labEarth = makeLabel("earth-label", "a patch of the earth looks flat");
const labRegion = makeLabel("region-label", "a region of M (illustration)");
const labSimply = makeLabel("simply-label", "simply connected: connected, and every loop shrinks inside M");
const labWays = makeLabel("ways-label", "continuous both ways");
const labDim = makeLabel("dim-header", "dimension");
const labSmale = makeLabel("smale-row", "5 and up — Smale, 1961 (smooth)");
const labFreed = makeLabel("freedman-row", "4 — Freedman, 1982");
const labAsk = makeLabel("three-row", "3 — ?", true);
const rowLabs = [labCircle, labSphere, labThree];

const TEX = [
  "x^{2}+y^{2}=1",
  "x^{2}+y^{2}+z^{2}=1",
  "x^{2}+y^{2}+z^{2}+w^{2}=1",
];
const eqs = [];
for (let i = 0; i < TEX.length; i++) {
  const eq = mountEquation({
    parent: content,
    x: FORM_X,
    y: ROW_Y[i],
    w: FORM_W,
    h: FORM_H,
    box: "eq-" + i,
    tex: TEX[i],
  });
  eq.el.dataset.words = "per-text";
  eqs.push(eq);
}

const eqM = mountEquation({
  parent: content,
  x: 470,
  y: 96,
  w: 140,
  h: 90,
  box: "letter-m",
  tex: "\\htmlClass{term-M}{M}",
});
colorTerm(eqM, "M", "--obj-hopping");

const eqNeq = mountEquation({
  parent: content,
  x: 1220,
  y: 360,
  w: 460,
  h: 140,
  box: "not-sphere",
  tex: "\\htmlClass{term-ne}{\\neq}\\ \\htmlClass{term-S}{S^{3}}",
});
colorTerm(eqNeq, "S", "--obj-hopping");

const closedCard = ledgerCard({
  parent: content,
  status: "context",
  title: "closed: compact, no edge",
  lines: [],
  x: 1120,
  y: 340,
  w: 540,
  box: "closed-card",
  tIn: T.closed,
});

const qCard = ledgerCard({
  parent: content,
  status: "context",
  title: "Poincaré's question (1904)",
  lines: [
    "closed, simply connected three-manifold M",
    "is M homeomorphic to S³?",
  ],
  x: 460,
  y: 150,
  w: 1000,
  box: "question-card",
  tIn: T.question,
});
qCard.el.dataset.words = "per-text";

const exCard = ledgerCard({
  parent: content,
  status: "proved",
  title: "Poincaré's own example",
  lines: [
    "same homology as S³",
    "a loop that cannot shrink",
  ],
  x: 1200,
  y: 150,
  w: 560,
  box: "example-card",
  tIn: T.poincare,
});
const exLines = exCard.el.querySelectorAll(".ledger-line");

function showEq(eq, o) {
  setOp(eq.el, o);
  eq.setTime(T.tail);
}

const events = [];
function mark(t, beat, what) {
  events.push({ t: Math.round(t * 1000) / 1000, beat: beat, what: what });
}

mark(T.space, "c2b1", "ordinary-space grid");
mark(T.ordinary, "c2b1", "ordinary space label");
mark(T.m1, "c2b1", "letter M");
mark(T.closed, "c2b1", "closed card");
mark(T.simplest, "c2b2", "cube shrinks, circle and sphere");
mark(T.four, "c2b2", "three-sphere row");
mark(T.cannot, "c2b3", "cannot be drawn whole");
mark(T.near, "c2b3", "cube joins the three-sphere");
mark(T.earth, "c2b3", "earth patch");
mark(T.m4, "c2b4", "region of M");
mark(T.loop, "c2b4", "loop");
mark(T.shrunk, "c2b4", "loop contracts");
mark(T.leaving, "c2b4", "simply connected");
mark(T.question, "c2b5", "question card");
mark(T.home, "c2b5", "continuous both ways");
mark(T.poincare, "c2b6", "example card");
mark(T.loop6, "c2b6", "loop line");
mark(T.not, "c2b6", "not a sphere");
mark(T.dimensions, "c2b7", "cards leave, dimension header");
mark(T.smale, "c2b7", "Smale row");
mark(T.freedman, "c2b7", "Freedman row");
mark(T.three, "c2b8", "dimension three");
mark(T.tail, "c2b8", "picture fades out");

window.sceneEvents = events;
window.sceneDuration = window.__BEATS__.duration;

window.setTime = function (t) {
  const kShrink = fade(t, T.simplest, SHRINK);
  const kNear = fade(t, T.near, NEAR);
  const kGrow = fade(t, T.m4, GROW);
  let pose = POSE.big;
  if (kGrow > 0) pose = mixPose(POSE.beside, POSE.centre, kGrow);
  else if (kNear > 0) pose = mixPose(POSE.left, POSE.beside, kNear);
  else if (kShrink > 0) pose = mixPose(POSE.big, POSE.left, kShrink);

  const oCube = fade(t, T.space, GRID) * (1 - fade(t, T.question, ASK));
  const rowsOut = 1 - fade(t, T.m4, GROW);
  const oRows = fade(t, T.simplest, ROWS) * rowsOut;
  const oRow3 = fade(t, T.four, ROW3) * rowsOut;
  const oCannot = fade(t, T.cannot, CANNOT) * rowsOut;
  const oNear = fade(t, T.near, NEAR) * rowsOut;
  const oEarth = fade(t, T.earth, EARTH_D * 0.4) * rowsOut;
  const oOrdinary = fade(t, T.ordinary, ORD) * (1 - fade(t, T.simplest, SHRINK));
  const oLetter = fade(t, T.m1, LETTER) * (1 - fade(t, T.simplest, SHRINK));
  const oRegion = fade(t, T.m4, GROW) * (1 - fade(t, T.question, ASK));
  const oSimply = fade(t, T.leaving, LEAVE) * (1 - fade(t, T.question, ASK));
  const oHome = fade(t, T.home, HOME) * (1 - fade(t, T.poincare, EX));
  const oHead = fade(t, T.dimensions, TABLE);
  const oSmale = fade(t, T.smale, SMALE);
  const oFreed = fade(t, T.freedman, FREED);
  const oThree = fade(t, T.three, DIM3);
  const oNeq = fade(t, T.not, NOTS) * (1 - oHead);
  const leaveCards = fade(t, T.dimensions, TABLE);
  const loopIn = fade(t, T.loop, LOOP);
  const shrinkK = fade(t, T.shrunk, SHRINKLOOP);

  cubeAt(t, pose, oCube, kGrow, loopIn, shrinkK);
  sph.setOpacity(oRows); eq3.setOpacity(oRows); sphereGroup.visible = oRows > 0.01;
  sphereGroup.rotation.y = 0.2 * (t - T.simplest);
  earth.setOpacity(oEarth); earthGroup.visible = oEarth > 0.01;
  earthGroup.rotation.y = 0;
  patchCurved.setOpacity(oEarth);
  const rise = fade(t, T.earth + EARTH_D * 0.5, EARTH_D * 0.8);
  patchFlat.set(patchPts(true, 0.02 + 0.5 * rise));
  patchFlat.setOpacity(oEarth * rise);
  patchFill.position.copy(PN).multiplyScalar(1 + 0.02 + 0.5 * rise);
  patchFill.material.opacity = 0.85 * oEarth * rise;

  for (let i = 0; i < 3; i++) {
    const y = ROW_Y[i] + 50;
    rowG[i].setAttribute("transform", "translate(" + SHAPE_X + "," + y + ")");
    const o = i < 2 ? oRows : oRow3;
    setOp(rowG[i], o);
    showEq(eqs[i], o);
    place(rowLabs[i], FORM_X, ROW_Y[i] + LABEL_DY, o);
  }

  const boxLeft = SHAPE_X - 66;
  const boxY = ROW_Y[2] + 50;
  const cubeRight = pose.x + (maxX - midX) * pose.s;
  setArrow(joinLine, joinHead, cubeRight + 8, pose.y, boxLeft - 8, boxY);
  setOp(joinG, oNear);

  place(labOrdinary, 200, 820, oOrdinary);
  place(labCannot, 720, 648, oCannot);
  place(labNear, 180, 708, oNear);
  place(labEarth, 1290, 800, oEarth);
  place(labRegion, 820, 100, oRegion);
  place(labSimply, 470, 812, oSimply);
  place(labWays, 820, 710, oHome);
  setOp(homeG, oHome);

  showEq(eqM, oLetter);
  showEq(eqNeq, oNeq);

  place(labDim, 500, 430, oHead);
  place(labSmale, 500, 530, oSmale);
  place(labFreed, 500, 640, oFreed);
  place(labAsk, 500, 770, oThree);
  setOp(tableG, oHead);
  setOp(tickSmale, oSmale);
  setOp(tickFreed, oFreed);

  const arrive = fade(t, T.poincare, EX);
  const qX = lerp(460, 140, arrive) - 420 * leaveCards;
  qCard.el.style.left = qX.toFixed(1) + "px";
  qCard.setTime(t);
  qCard.el.style.opacity = String(parseFloat(qCard.el.style.opacity) * (1 - leaveCards));

  const exX = lerp(1240, 1200, arrive) - 420 * leaveCards;
  exCard.el.style.left = exX.toFixed(1) + "px";
  exCard.setTime(t);
  exCard.el.style.opacity = String(parseFloat(exCard.el.style.opacity) * (1 - leaveCards));
  exLines[0].style.opacity = "1";
  exLines[1].style.opacity = String(fade(t, T.loop6, LOOPLINE));

  closedCard.setTime(t);
  const closedLeave = 1 - fade(t, T.simplest, CARDGONE);
  closedCard.el.style.opacity = String(parseFloat(closedCard.el.style.opacity) * closedLeave);

  const outK = 1 - fade(t, T.tail, OUT);
  content.style.opacity = String(outK);
  st.setOpacity(outK);
  st.render();
  chapter.setTime(t);
  strip.setTime(t);
  subs.setTime(t);
};

window.setTime(0);
