/* Chapter 5. Surgery. The picture is a function of t. Spatial pictures are a 3D stage. */
import { stage3d, surface, THREE } from "../three3d/stage3d.js";
import {
  revolve, slice, dumbbellR, bumpyR, curvatureTint, capMesh,
  arcTubeGeometry, setArcTube, arcSlicePts, arcFrame, curve,
} from "../three3d/shapes3d.js";

installBeats(window.__BEATS__);

const events = [];
function mark(t, beat, what) {
  events.push({ t: Math.round(t * 1000) / 1000, beat: beat, what: what });
}

const SHOW = need("c5b1", "Now", 0.6, "dumbbell appears");
const INTRO = need("c5b1", "lead", 1.2, "chapter title settles");
const NECK = need("c5b1", "neck", 0.6, "neck is outlined");
const CUT = need("c5b1", "cut", 0.6, "middle slice becomes the cut");
const CAP = need("c5b1", "cap", 1.0, "halves separate and caps close");
const ROUND = need("c5b1", "round", 1.0, "round piece slides aside");
const RESTART = need("c5b1", "restarts", 0.7, "flow restarts");
const LIFT = need("c5b2", "Each", 0.8, "picture makes room for the chart");
const VOL = need("c5b2", "volume", 1.2, "volume steps down three times");
const PILE = need("c5b2", "pile", 0.6, "finiteness label");
const SHRINK = need("c5b3", "Perelman", 0.8, "pictures shrink away");
const MAPIN = need("c5b3", "that", 0.7, "proof map returns");
const SURV = need("c5b3", "survive", 0.6, "surgery node lights");
const ALLTIME = need("c5b3", "time", 0.6, "surgery runs for all time");
const MAPOUT = need("c5b4", "Topologically", 0.6, "map fades");
const BELL = need("c5b4", "cutting", 0.7, "dumbbell returns");
const CONN = need("c5b4", "connected", 0.5, "connected sum label");
const SEP = need("c5b4", "separates", 1.0, "two pieces move apart");
const PIECES = need("c5b5", "ring", 0.6, "two pieces fade");
const RING = need("c5b5", "ring", 0.8, "ring appears");
const SLICE = need("c5b5", "two-sphere", 0.5, "slice label");
const OPEN = need("c5b5", "Cutting", 1.2, "ring opens into a tube");
const SPHERE = need("c5b5", "three-sphere", 0.5, "three-sphere label");
const OUT = need("c5b5", "tail", 0.8, "picture fades out");

const T = {
  now: cue("c5b1", "Now"),
  neck: cue("c5b1", "neck"),
  cut: cue("c5b1", "cut"),
  cap: cue("c5b1", "cap"),
  round: cue("c5b1", "round"),
  restarts: cue("c5b1", "restarts"),
  each: cue("c5b2", "Each"),
  volume: cue("c5b2", "volume"),
  pile: cue("c5b2", "pile"),
  perelman: cue("c5b3", "Perelman"),
  that: cue("c5b3", "that"),
  survive: cue("c5b3", "survive"),
  time: cue("c5b3", "time"),
  topo: cue("c5b4", "Topologically"),
  cutting: cue("c5b4", "cutting"),
  connected: cue("c5b4", "connected"),
  separates: cue("c5b4", "separates"),
  ring: cue("c5b5", "ring"),
  twoSphere: cue("c5b5", "two-sphere"),
  opening: cue("c5b5", "Cutting"),
  threeSphere: cue("c5b5", "three-sphere"),
  tail: beatEnd("c5b5"),
};

mark(T.now, "c5b1", "dumbbell");
mark(T.neck, "c5b1", "neck outlined");
mark(T.cut, "c5b1", "cut circle");
mark(T.cap, "c5b1", "caps close");
mark(T.round, "c5b1", "round piece set aside");
mark(T.restarts, "c5b1", "flow restarts");
mark(T.each, "c5b2", "volume chart");
mark(T.volume, "c5b2", "volume steps down");
mark(T.pile, "c5b2", "finitely many surgeries");
mark(T.perelman, "c5b3", "pictures shrink");
mark(T.that, "c5b3", "proof map");
mark(T.survive, "c5b3", "surgery active");
mark(T.time, "c5b3", "flow for all time");
mark(T.topo, "c5b4", "map fades");
mark(T.cutting, "c5b4", "dumbbell");
mark(T.connected, "c5b4", "connected sum");
mark(T.separates, "c5b4", "two pieces");
mark(T.ring, "c5b5", "ring");
mark(T.twoSphere, "c5b5", "slice label");
mark(T.opening, "c5b5", "ring opens");
mark(T.threeSphere, "c5b5", "three-sphere");

// Dumbbell on the x axis. Neck radius r(0) = 0.4. Bulbs peak near |s| = 2.1.
const L = 3.4;
const Rf = dumbbellR(L, 2.0, 0.2);
const R0 = Rf(0);
const BELL_X = -0.85;
const SEP_X = 0.9;
const ROUND_X0 = 5.15;
const ROUND_X1 = 6.15;
const ROUND_Y1 = 0.15;
const CAM_DIST = 16.2;
const LEN = 2 * Math.PI * 1.7;
const TUBE = 0.55;
const SLICE_U = [-0.6, -0.3, 0, 0.3, 0.6];

const st = stage3d({ fov: 26 });
const world = new THREE.Group();
st.scene.add(world);

const bell = new THREE.Group();
bell.position.x = BELL_X;
world.add(bell);

const whole = revolve(st, { parent: bell, nS: 160, nA: 80, k: 0.62 });
const leftG = new THREE.Group();
const rightG = new THREE.Group();
bell.add(leftG);
bell.add(rightG);
const leftP = revolve(st, { parent: leftG, open: true, nS: 110, nA: 80, k: 0.62 });
const rightP = revolve(st, { parent: rightG, open: true, nS: 110, nA: 80, k: 0.62 });
const capL = capMesh(st, { parent: leftG });
const capR = capMesh(st, { parent: rightG });

const sliceL = slice(st, { parent: leftG, token: "--ink-muted", radius: 0.016 });
const sliceR = slice(st, { parent: rightG, token: "--ink-muted", radius: 0.016 });
const neckC = slice(st, { parent: bell, token: "--obj-hopping", radius: 0.04 });
const cutC = slice(st, { parent: bell, token: "--obj-damping", radius: 0.026 });
const cutEndL = slice(st, { parent: leftG, token: "--obj-damping", radius: 0.026 });
const cutEndR = slice(st, { parent: rightG, token: "--obj-damping", radius: 0.026 });

const roundG = new THREE.Group();
bell.add(roundG);
const roundP = revolve(st, { parent: roundG, nS: 72, nA: 56, k: 0.62 });
const bump = bumpyR(0.7, 0.9);
roundP.set(bump, -0.7, 0.7);
const roundA = slice(st, { parent: roundG, token: "--ink-muted", radius: 0.014 });
const roundB = slice(st, { parent: roundG, token: "--ink-muted", radius: 0.014 });
roundA.at(-0.28, bump(-0.28));
roundB.at(0.28, bump(0.28));

// Ring S^2 x circle. Pivot at the hole centre; the arc's bottom is local y = 0, so shift by -1.7.
const ringPivot = new THREE.Group();
ringPivot.rotation.x = -0.9;
world.add(ringPivot);
const ringGroup = new THREE.Group();
ringGroup.position.y = -1.7;
ringPivot.add(ringGroup);
const ringGeo = arcTubeGeometry(220, 64);
const ringSurf = surface(st, ringGeo, { token: "--obj-hopping", k: 0.6, outline: 0.016 });
st.scene.remove(ringSurf.group);
ringGroup.add(ringSurf.group);

const ringSlices = SLICE_U.map(function () {
  const c = curve(st, arcSlicePts(0, Math.PI * 2, LEN, TUBE + 0.02, 96), {
    token: "--ink-muted", radius: 0.018, hidden: "dash",
  });
  st.scene.remove(c.group);
  ringGroup.add(c.group);
  return c;
});
const ringCut = curve(st, arcSlicePts(1, Math.PI * 2, LEN, TUBE + 0.02, 96), {
  token: "--obj-damping", radius: 0.03, hidden: "dash",
});
st.scene.remove(ringCut.group);
ringGroup.add(ringCut.group);
const ringCapL = capMesh(st, { parent: ringGroup });
const ringCapR = capMesh(st, { parent: ringGroup });

const tmp = new THREE.Vector3();
function worldOf(obj, x, y, z) {
  tmp.set(x, y, z);
  obj.localToWorld(tmp);
  return [tmp.x, tmp.y, tmp.z];
}

function paintBell(split) {
  whole.set(Rf, -L, L);
  // no curvature tint here (shaded red-blue mixes fail the palette check)
  leftP.set(Rf, -L, 0);
  // no curvature tint here (shaded red-blue mixes fail the palette check)
  rightP.set(Rf, 0, L);
  // no curvature tint here (shaded red-blue mixes fail the palette check)
  leftG.position.x = -SEP_X * split;
  rightG.position.x = SEP_X * split;
  sliceL.at(-2, Rf(-2));
  sliceR.at(2, Rf(2));
  neckC.at(0, R0);
  cutC.at(0, R0);
  cutEndL.at(0, R0);
  cutEndR.at(0, R0);
  const lam = Math.max(split, 0.02);
  capL.place([0, 0, 0], [1, 0, 0], R0, lam);
  capR.place([0, 0, 0], [-1, 0, 0], R0, lam);
}

function paintRing(ang, lam) {
  setArcTube(ringGeo, ang, LEN, TUBE, 0, 0);
  for (let i = 0; i < SLICE_U.length; i++) {
    ringSlices[i].set(arcSlicePts(SLICE_U[i], ang, LEN, TUBE + 0.02, 96));
  }
  const safe = Math.max(ang, 1e-4);
  ringCut.set(arcSlicePts(1, safe, LEN, TUBE + 0.02, 96));
  const fL = arcFrame(-1, ang, LEN);
  const fR = arcFrame(1, ang, LEN);
  ringCapL.place(fL.p, [-fL.T[0], -fL.T[1], -fL.T[2]], TUBE, Math.max(lam, 0.02));
  ringCapR.place(fR.p, [fR.T[0], fR.T[1], fR.T[2]], TUBE, Math.max(lam, 0.02));
}

// ---------- 2D layer: chart, shelf, arrow, labels. Text sits above the stage. ----------
const NS = "http://www.w3.org/2000/svg";
function ns(name) { return document.createElementNS(NS, name); }

function put(el, o) {
  const v = o <= 0.001 ? 0 : o >= 0.999 ? 1 : o;
  el.style.opacity = v === 0 ? "0" : v === 1 ? "1" : v.toFixed(4);
}

function textLine(name, text, color) {
  const d = document.createElement("div");
  d.className = "t-label stage-abs";
  d.dataset.box = name;
  d.style.whiteSpace = "nowrap";
  d.style.opacity = "0";
  if (color) d.style.color = color;
  d.textContent = text;
  document.body.appendChild(d);
  return d;
}

function park(el, x, y, o) {
  const w = el.offsetWidth || 0;
  const h = el.offsetHeight || 0;
  let left = x;
  let top = y;
  if (left < 120) left = 120;
  if (top < 88) top = 88;
  if (w > 1 && left + w > 1800) left = 1800 - w;
  if (h > 1 && top + h > 872) top = 872 - h;
  el.style.left = left.toFixed(1) + "px";
  el.style.top = top.toFixed(1) + "px";
  put(el, o);
}

const overlay = document.createElement("div");
overlay.className = "stage-abs";
overlay.style.left = "0px";
overlay.style.top = "0px";
overlay.style.width = "1920px";
overlay.style.height = "1080px";
overlay.style.pointerEvents = "none";
document.body.appendChild(overlay);
const svg = ns("svg");
svg.setAttribute("width", "1920");
svg.setAttribute("height", "1080");
svg.setAttribute("viewBox", "0 0 1920 1080");
overlay.appendChild(svg);

function stroke(parent, token, width, dash) {
  const p = ns("path");
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "var(" + token + ")");
  p.setAttribute("stroke-width", String(width));
  p.setAttribute("stroke-linejoin", "round");
  p.setAttribute("stroke-linecap", "round");
  if (dash) p.setAttribute("stroke-dasharray", dash);
  parent.appendChild(p);
  return p;
}

function setPath(node, pts) {
  if (!pts || pts.length < 2) {
    node.setAttribute("d", "");
    return;
  }
  let d = "M" + pts[0].x.toFixed(1) + "," + pts[0].y.toFixed(1);
  for (let i = 1; i < pts.length; i++) d += " L" + pts[i].x.toFixed(1) + "," + pts[i].y.toFixed(1);
  node.setAttribute("d", d);
}

function setOp(node, o) {
  const v = o < 0.02 ? 0 : o;
  node.setAttribute("opacity", v === 0 ? "0" : v >= 0.999 ? "1" : v.toFixed(4));
}

const gChart = ns("g");
const gCue = ns("g");
svg.appendChild(gChart);
svg.appendChild(gCue);
const shelf = stroke(gCue, "--ink", 3);
const arrowLine = stroke(gCue, "--obj-energy", 5);
const arrowHead = ns("path");
arrowHead.setAttribute("fill", "var(--obj-energy)");
arrowHead.setAttribute("stroke", "none");
gCue.appendChild(arrowHead);
const axis = stroke(gChart, "--obj-energy", 4);
const axisHead = ns("path");
axisHead.setAttribute("fill", "var(--obj-energy)");
axisHead.setAttribute("stroke", "none");
gChart.appendChild(axisHead);
const bars = [];
const ticks = [];
for (let i = 0; i < 4; i++) bars.push(stroke(gChart, "--obj-hopping", 6));
for (let i = 0; i < 3; i++) ticks.push(stroke(gChart, "--obj-damping", 5));

const CHART = { axisX: 220, axisY: 748, axisW: 1380, full: 200, drop: 54, barW: 148, gap: 40, barX: 300 };

const illustLab = textLine("illustration", "illustration: each circle stands for a 2-sphere", "var(--ink-muted)");
const asideLab = textLine("set-aside", "set aside");
const flowLab = textLine("flow-restarts", "flow restarts", "var(--obj-energy)");
const amountLab = textLine("fixed-amount", "");
amountLab.style.display = "flex";
amountLab.style.alignItems = "center";
const geq = ns("svg");
geq.setAttribute("width", "36");
geq.setAttribute("height", "32");
geq.setAttribute("viewBox", "0 0 36 32");
geq.setAttribute("aria-hidden", "true");
const geqPath = ns("path");
geqPath.setAttribute("d", "M6 7 L28 15 L6 23 M6 27 H28");
geqPath.setAttribute("fill", "none");
geqPath.setAttribute("stroke", "currentColor");
geqPath.setAttribute("stroke-width", "2.4");
geqPath.setAttribute("stroke-linecap", "round");
geqPath.setAttribute("stroke-linejoin", "round");
geq.appendChild(geqPath);
const amountWords = document.createElement("span");
amountWords.textContent = "a fixed amount";
amountWords.style.marginLeft = "8px";
amountLab.appendChild(geq);
amountLab.appendChild(amountWords);
const finiteLab = textLine("finite-surgeries", "only finitely many surgeries in finite time");
const sumLab = textLine("connected-sum", "cutting a neck undoes a connected sum");
const piecesLab = textLine("simpler-pieces", "two simpler pieces");
const sliceLab = textLine("ring-slices", "illustration: each circle stands for a 2-sphere: S² × circle", "var(--ink-muted)");
const sphereLab = textLine("one-piece", "one piece: S³");

const label = chapterLabel({ n: 5, title: "Surgery", intro: INTRO });

const map = proofMap({
  parent: document.body,
  x: 120,
  y: 200,
  w: 1680,
  h: 500,
  nodes: [
    { id: "flow", label: "Ricci flow", col: 0, row: 0, status: "proved" },
    { id: "noncol", label: "Noncollapsing", col: 1, row: 0, status: "proved" },
    { id: "canon", label: "Canonical neighbourhoods", col: 2, row: 0, status: "proved" },
    { id: "surg", label: "Surgery", col: 3, row: 0, status: "proved" },
    { id: "ext", label: "Finite extinction", col: 4, row: 0, status: "proved" },
    { id: "sums", label: "Connected sums", col: 1, row: 1, status: "proved" },
    { id: "smooth", label: "Smooth Poincaré", col: 2, row: 1, status: "proved" },
    { id: "moise", label: "Moise smoothing", col: 3, row: 1, status: "proved" },
    { id: "top", label: "Poincaré conjecture", col: 4, row: 1, status: "proved" },
  ],
  edges: [
    ["flow", "noncol"], ["noncol", "canon"], ["canon", "surg"], ["surg", "ext"],
    ["ext", "sums"], ["sums", "smooth"], ["smooth", "moise"], ["moise", "top"],
  ],
  stateAt: function (t) {
    const dim = "dim";
    const states = {
      flow: dim, noncol: dim, canon: dim, surg: dim, ext: dim,
      sums: dim, smooth: dim, moise: dim, top: dim,
    };
    const lit = fade(t, T.survive, SURV);
    if (lit > 0) {
      states.flow = "done";
      states.noncol = "done";
      states.canon = "done";
      states.surg = fade(t, T.time, ALLTIME) > 0 ? "done" : "active";
    }
    return states;
  },
  zoomAt: function () { return null; },
});

(function wrapCanon() {
  const texts = map.el.querySelectorAll("text");
  for (let i = 0; i < texts.length; i++) {
    if (texts[i].textContent !== "Canonical neighbourhoods") continue;
    const text = texts[i];
    const x = text.getAttribute("x");
    const y = parseFloat(text.getAttribute("y"));
    text.textContent = "";
    ["Canonical", "neighbourhoods"].forEach(function (line, k) {
      const span = document.createElementNS(NS, "tspan");
      span.setAttribute("x", x);
      span.setAttribute("y", String(y + (k - 0.5) * 36));
      span.textContent = line;
      text.appendChild(span);
    });
  }
})();

const card = ledgerCard({
  parent: document.body,
  status: "proved",
  title: "flow with surgery: for all time, any start",
  lines: [],
  x: 120,
  y: 728,
  w: 1100,
  tIn: T.time,
  tOut: beatStart("c5b4"),
});

const strip = mountStrip(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);

window.sceneEvents = events;
window.sceneDuration = window.__BEATS__.duration;
if (beatEnd("c5b5") > window.sceneDuration) window.sceneDuration = beatEnd("c5b5");

function barRect(node, x, y, w, h) {
  if (h < 1) {
    setPath(node, []);
    return;
  }
  setPath(node, [
    { x: x, y: y },
    { x: x + w, y: y },
    { x: x + w, y: y + h },
    { x: x, y: y + h },
    { x: x, y: y },
  ]);
}

function headPath(x, y, dir) {
  const s = 14;
  return [
    { x: x, y: y },
    { x: x - dir * s, y: y - s * 0.55 },
    { x: x - dir * s, y: y + s * 0.55 },
  ];
}

function cameraAt(t, ringMix) {
  const span = beatHoldEnd("c5b5") - T.now;
  const u = clamp((t - T.now) / span, 0, 1);
  // Azimuth keeps each slice an ellipse. Elevation stays in 16–19 degrees; the drift is a few degrees.
  const az = 24 + 4 * u;
  const el = 16.2 + 3 * u;
  const target = [lerp(0.15, -0.2, ringMix), lerp(-0.15, 0.15, ringMix), 0];
  st.orbit(target, az, el, CAM_DIST);
}

window.setTime = function (t) {
  const b = beatAt(t);
  const id = b ? b.id : "";
  const early = id === "c5b1" || id === "c5b2" || id === "c5b3";
  const split = early ? fade(t, T.cap, CAP) : (id === "c5b4" || id === "c5b5" ? fade(t, T.separates, SEP) : 0);
  const showK = fade(t, T.now, SHOW);
  const shrinkK = fade(t, T.perelman, SHRINK);
  const outK = id === "c5b5" ? fade(t, T.tail, OUT) : 0;

  let bellOp = 0;
  if (id === "c5b1") bellOp = showK;
  else if (id === "c5b2") bellOp = 1;
  else if (id === "c5b3") bellOp = 1 - shrinkK;
  else if (id === "c5b4") bellOp = fade(t, T.cutting, BELL);
  else if (id === "c5b5") bellOp = (1 - fade(t, T.ring, PIECES)) * (1 - outK);

  const ringOp = id === "c5b5" ? fade(t, T.ring, RING) * (1 - outK) : 0;
  const roundK = early ? fade(t, T.round, ROUND) : 0;
  const roundOp = early ? fade(t, T.round, ROUND * 0.35) * bellOp : 0;
  const flowK = early ? fade(t, T.restarts, RESTART) * bellOp : 0;
  const neckOp = id === "c5b1" ? bellOp * (t >= T.neck ? 1 : 0) * (1 - fade(t, T.cut, CUT)) : 0;
  const centerCut = id === "c5b1" ? bellOp * fade(t, T.cut, CUT) * (1 - clamp(split * 5, 0, 1)) : 0;
  const endCut = bellOp * clamp(split * 10, 0, 1) * (1 - clamp((split - 0.06) / 0.22, 0, 1));

  const liftK = id === "c5b2" || id === "c5b3" ? fade(t, T.each, LIFT) : 0;
  bell.scale.setScalar(lerp(1, 0.52, liftK));
  bell.position.set(lerp(BELL_X, BELL_X - 0.15, liftK), lerp(0, 1.35, liftK), 0);
  roundG.position.set(lerp(ROUND_X0, ROUND_X1, roundK), lerp(0, ROUND_Y1, roundK), 0);

  paintBell(split);
  const partOp = bellOp * (split > 0.001 ? 1 : 0);
  const wholeOp = bellOp * (split > 0.001 ? 0 : 1);
  whole.setOpacity(wholeOp);
  leftP.setOpacity(partOp);
  rightP.setOpacity(partOp);
  capL.setOpacity(partOp * (split > 0.02 ? 1 : 0));
  capR.setOpacity(partOp * (split > 0.02 ? 1 : 0));
  sliceL.setOpacity(bellOp);
  sliceR.setOpacity(bellOp);
  neckC.setDraw(fade(t, T.neck, NECK));
  neckC.setOpacity(neckOp);
  cutC.setOpacity(centerCut);
  cutEndL.setOpacity(endCut);
  cutEndR.setOpacity(endCut);
  roundP.setOpacity(roundOp);
  roundA.setOpacity(roundOp);
  roundB.setOpacity(roundOp);

  // The cut is drawn on the closed ring, then the same tube straightens and the caps grow.
  const openU = id === "c5b5" ? clamp((t - T.opening) / OPEN, 0, 1) : 0;
  const morph = ease(clamp((openU - 0.22) / 0.78, 0, 1));
  const ang = Math.PI * 2 * (1 - morph);
  // As the ring straightens, lift it so the tube stays above the subtitle band.
  ringPivot.position.set(lerp(0, -0.15, morph), lerp(0.2, 1.7, morph), 0);
  paintRing(ang, morph);
  ringSurf.setOpacity(ringOp);
  for (let i = 0; i < ringSlices.length; i++) ringSlices[i].setOpacity(ringOp);
  ringCut.setDraw(ease(clamp(openU / 0.2, 0, 1)));
  ringCut.setOpacity(ringOp * (t >= T.opening ? 1 - morph : 0));
  ringCapL.setOpacity(ringOp * (morph > 0.02 ? 1 : 0));
  ringCapR.setOpacity(ringOp * (morph > 0.02 ? 1 : 0));

  cameraAt(t, ringOp);
  st.render();

  // shelf under the place the small piece slides to; arrow under the left bulb
  const shelfL = st.project(worldOf(bell, ROUND_X1 - 0.95, ROUND_Y1 - 0.82, 0));
  const shelfR = st.project(worldOf(bell, ROUND_X1 + 0.95, ROUND_Y1 - 0.82, 0));
  const shelfY = Math.min(830, Math.max(shelfL.y, shelfR.y));
  const shelfX0 = Math.max(140, Math.min(shelfL.x, shelfR.x));
  const shelfX1 = Math.min(1760, Math.max(shelfL.x, shelfR.x));
  setPath(shelf, [{ x: shelfX0, y: shelfY }, { x: shelfX1, y: shelfY }]);
  setOp(shelf, roundK * (early ? 1 : 0) * (id === "c5b3" ? 1 - shrinkK : 1));

  const foot = st.project(worldOf(leftG, -2.05, -Rf(-2.05) - 0.08, 0));
  const ax = foot.x;
  const ay = foot.y + 36;
  setPath(arrowLine, [{ x: ax, y: ay }, { x: ax + 78, y: ay }]);
  setPath(arrowHead, headPath(ax + 78, ay, 1));
  setOp(arrowLine, flowK);
  setOp(arrowHead, flowK);

  const chartOn = (id === "c5b2" || id === "c5b3") ? fade(t, T.each, LIFT) * (id === "c5b3" ? 1 - shrinkK : 1) : 0;
  const k1 = fade(t, T.volume, VOL / 3);
  const k2 = fade(t, T.volume + VOL / 3, VOL / 3);
  const k3 = fade(t, T.volume + (2 * VOL) / 3, VOL / 3);
  const heights = [CHART.full, CHART.full - CHART.drop * k1, CHART.full - 2 * CHART.drop * k2, CHART.full - 3 * CHART.drop * k3];
  setPath(axis, [
    { x: CHART.axisX, y: CHART.axisY },
    { x: CHART.axisX + CHART.axisW, y: CHART.axisY },
  ]);
  setPath(axisHead, headPath(CHART.axisX + CHART.axisW, CHART.axisY, 1));
  for (let i = 0; i < 4; i++) {
    const x = CHART.barX + i * (CHART.barW + CHART.gap);
    barRect(bars[i], x, CHART.axisY - heights[i], CHART.barW, heights[i]);
  }
  for (let i = 0; i < 3; i++) {
    const x = CHART.barX + (i + 1) * (CHART.barW + CHART.gap) - CHART.gap / 2;
    setPath(ticks[i], [{ x: x, y: CHART.axisY - 16 }, { x: x, y: CHART.axisY + 18 }]);
  }
  setOp(gChart, chartOn);

  const illustOp = (id === "c5b1" || id === "c5b2" || id === "c5b4") ? bellOp : (id === "c5b3" ? bellOp : 0);
  park(illustLab, 140, 96, illustOp);
  const topR = st.project(worldOf(roundG, 0, 0.78, 0));
  park(asideLab, topR.x - 70, topR.y - 78, roundOp);
  park(flowLab, ax + 96, ay - 28, flowK);
  park(amountLab, CHART.barX + CHART.barW + 8, CHART.axisY - CHART.full - 52, chartOn * fade(t, T.volume + VOL / 3, VOL / 4));
  park(finiteLab, 300, CHART.axisY + 36, chartOn * fade(t, T.pile, PILE));

  const sumOp = (id === "c5b4" ? bellOp : (id === "c5b5" ? bellOp : 0)) * fade(t, T.connected, CONN);
  const piecesOp = (id === "c5b4" || id === "c5b5" ? bellOp : 0) * fade(t, T.separates, Math.min(SEP, 0.45));
  park(sumLab, 1040, 96, sumOp);
  park(piecesLab, 700, 808, piecesOp);

  const hand = id === "c5b5" ? clamp((t - T.threeSphere) / SPHERE, 0, 1) : 0;
  const sliceOp = id === "c5b5" ? fade(t, T.twoSphere, SLICE) * (1 - ease(clamp(hand / 0.42, 0, 1))) * (1 - outK) : 0;
  const sphereOp = id === "c5b5" ? ease(clamp((hand - 0.52) / 0.48, 0, 1)) * (1 - outK) : 0;
  park(sliceLab, 140, 96, sliceOp);
  park(sphereLab, 140, 96, sphereOp);

  let mapK = 0;
  if (id === "c5b3") mapK = fade(t, T.that, MAPIN);
  else if (id === "c5b4") mapK = 1 - fade(t, T.topo, MAPOUT);
  map.el.style.opacity = String(mapK < 0.02 ? 0 : mapK);

  label.setTime(t);
  strip.setTime(t);
  subs.setTime(t);
  card.setTime(t);
  map.setTime(t);
  if (t >= T.time && t < T.time + ALLTIME) {
    const gate = fade(t, T.time, ALLTIME);
    const current = parseFloat(card.el.style.opacity || "0");
    card.el.style.opacity = String(current * gate);
  }
};

window.setTime(0);
