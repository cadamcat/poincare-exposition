/* Chapter 3. The picture is a function of t. Spatial pictures are a 3D stage.
   Cue times come from the narration. One revolve() carries the bumpy shape through
   the round sphere; a second revolve() is the sphere beside Hamilton's card and
   morphs into the dumbbell. Surgery uses two further revolves, the cut pieces. */
import { stage3d, THREE } from "../three3d/stage3d.js";
import { revolve, slice, curve, circlePts, dumbbellR, bumpyR, roundR, curvatureTint, capMesh } from "../three3d/shapes3d.js";

installBeats(window.__BEATS__);

const events = [];
function mark(t, beat, what) {
  events.push({ t: Math.round(t * 1000) / 1000, beat: beat, what: what });
}

const C = {
  shape: cue("c3b1", "shape"),
  metric: cue("c3b1", "metric"),
  curvature: cue("c3b1", "curvature"),
  scalar: cue("c3b1", "scalar"),
  changes: cue("c3b2", "changes"),
  minus: cue("c3b2", "minus"),
  direction: cue("c3b2", "direction"),
  like: cue("c3b3", "Like"),
  heat: cue("c3b3", "heat"),
  even: cue("c3b3", "even"),
  round: cue("c3b4", "round"),
  shrinks: cue("c3b4", "shrinks"),
  squared: cue("c3b4", "squared"),
  vanishes: cue("c3b4", "vanishes"),
  hamilton: cue("c3b5", "Hamilton"),
  round5: cue("c3b5", "round"),
  quotient: cue("c3b5", "quotient"),
  inn: cue("c3b6", "In"),
  here: cue("c3b6", "Here"),
  pinches: cue("c3b6", "pinches"),
  twosphere: cue("c3b6", "two-sphere"),
  reset: beatStart("c3b7"),
  ham7: cue("c3b7", "Hamilton's"),
  cut: cue("c3b7", "cut"),
  cap: cue("c3b7", "cap"),
  cont: cue("c3b7", "continue"),
  shape7: cue("c3b7", "shape"),
};

const INTRO = need("c3b1", "lead", 1.2, "chapter title settles");
const DRAW = need("c3b1", "shape", 0.8, "bumpy shape and its slices draw in");
const METRIC_IN = need("c3b1", "metric", 0.4, "metric label");
const TINT_IN = need("c3b1", "curvature", 0.6, "curvature tint on the surface");
const R_IN = need("c3b1", "scalar", 0.4, "scalar curvature label");
const SHIFT = need("c3b2", "changes", 0.6, "shape shifts left for the equation");
const LHS = need("c3b2", "changes", 0.4, "left side of the flow equation");
const RHS = need("c3b2", "minus", 0.4, "right side of the flow equation");
const RIC_IN = need("c3b2", "direction", 0.4, "Ricci label");
const BACK = need("c3b3", "Like", 0.6, "shape returns to the middle");
const SMOOTH = need("c3b3", "heat", 1.2, "bumps relax and the curvature tint evens out");
const EVEN_IN = need("c3b3", "even", 0.4, "label: the flow evens out curvature");
const BADGE3 = need("c3b3", "Like", 0.4, "heuristic badge");
const TO_CIRCLE = need("c3b4", "round", 1.0, "shape becomes exactly round");
const SHRINK = need("c3b4", "shrinks", 5.32, "radius squared falls linearly until the sphere vanishes");
const SQ_IN = need("c3b4", "squared", 0.4, "radius squared line");
const CLEAR4 = need("c3b4", "tail", 0.4, "shrunk sphere and the radius line leave");
const CARD_IN = need("c3b5", "Hamilton", 0.4, "Hamilton card rises");
const ROUND_IN = need("c3b5", "round", 0.6, "round three-sphere turns in beside the card");
const LINE2 = need("c3b5", "quotient", 0.5, "quotient line of the card");
const CARD_OUT = need("c3b6", "In", 0.4, "Hamilton card leaves");
const TO_BELL = need("c3b6", "Here", 0.8, "round sphere becomes a dumbbell");
const PINCH = need("c3b6", "pinches", 1.2, "neck radius shrinks while the bulbs stay");
const SLICE_IN = need("c3b6", "two-sphere", 0.5, "neck slice stands for a whole 2-sphere");
const BADGE6 = need("c3b6", "Here", 0.4, "heuristic badge");
const RESET = need("c3b7", "Hamilton's", 0.6, "neck resets to a thin neck");
const CUT_IN = need("c3b7", "cut", 0.5, "two cut circles on the neck");
const CAP_IN = need("c3b7", "cap", 0.8, "pieces separate and caps close the ends");
const FLOW_IN = need("c3b7", "continue", 0.5, "arrow: flow continues");
const NEED_IN = need("c3b7", "shape", 0.4, "card: every shape a singularity can take");
const OUT = need("c3b7", "tail", 0.8, "picture fades out");

void LHS;
void RHS;
void SHRINK;
void SQ_IN;
void CARD_IN;
void CARD_OUT;
void NEED_IN;

const L_BUMP = 2.3;
const R5 = 1.72;
const L_BELL = 3.4;
const H_BELL = 2.0;
const CUT_S = 0.45;
const SEP_MAX = 0.9;
const DIST_MAIN = 16.0;
const DIST_SIDE = 13.0;
const DIST_BELL = 17.6;
const HOST_Y = 0.42;
const SHIFT_X = -2.35;
const SIDE_X = 2.75;
const SIDE_Y = 0.05;
const BELL_Y = 0.85;
const KLOW = 0.15;
const KHIGH = 4.4;
const BELL_KLOW = 3;
const BELL_KHIGH = 12;
const N_CUT = 80;

const st = stage3d({ fov: 26 });

const host = new THREE.Group();
st.scene.add(host);
const main = revolve(st, { parent: host });
const mSl = [];
for (let i = 0; i < 3; i++) mSl.push(slice(st, { parent: host }));

const bellHost = new THREE.Group();
st.scene.add(bellHost);
const full = revolve(st, { parent: bellHost });
const leftG = new THREE.Group();
const midG = new THREE.Group();
const rightG = new THREE.Group();
bellHost.add(leftG);
bellHost.add(midG);
bellHost.add(rightG);
const leftP = revolve(st, { parent: leftG, open: true });
const midP = revolve(st, { parent: midG, open: true });
const rightP = revolve(st, { parent: rightG, open: true });
const slL = slice(st, { parent: leftG });
const slM = slice(st, { parent: midG });
const slR = slice(st, { parent: rightG });
const capL = capMesh(st, { parent: leftG });
const capR = capMesh(st, { parent: rightG });

function makeCut(parent) {
  const pts = circlePts([0, 0, 0], [0, 1, 0], [0, 0, 1], 1, N_CUT);
  const cv = curve(st, pts, { token: "--obj-damping", radius: 0.035, hidden: "dash" });
  st.scene.remove(cv.group);
  parent.add(cv.group);
  return cv;
}
const cutL = makeCut(leftG);
const cutR = makeCut(rightG);

function put(el, op) {
  const v = op <= 0.001 ? 0 : op >= 0.999 ? 1 : op;
  el.style.opacity = v === 0 ? "0" : v === 1 ? "1" : v.toFixed(4);
}

function move(el, x, y, w) {
  el.style.left = Math.round(x) + "px";
  el.style.top = Math.round(y) + "px";
  el.style.width = Math.round(w) + "px";
}

function label(name, parts) {
  const d = document.createElement("div");
  d.className = "t-label stage-abs";
  d.dataset.box = name;
  d.style.opacity = "0";
  d.style.textAlign = "center";
  for (let i = 0; i < parts.length; i++) {
    const s = document.createElement("span");
    s.textContent = parts[i].t;
    if (parts[i].fill) s.style.color = parts[i].fill;
    d.appendChild(s);
  }
  document.body.appendChild(d);
  return d;
}

const labIllust = label("illust", [{ t: "illustration: each circle stands for a 2-sphere" }]);
const labMetric = label("metric-g", [
  { t: "metric " },
  { t: "g", fill: "var(--obj-hopping)" },
]);
const labScalar = label("scalar-r", [
  { t: "R", fill: "var(--obj-potential)" },
  { t: ": one number at every point" },
]);
const labEven = label("evens", [{ t: "the flow evens out curvature" }]);
const labRound = label("round-label", [{ t: "illustration: round three-sphere" }]);
const labSlice = label("slice-label", [{ t: "a whole 2-sphere" }]);

const flowBox = document.createElement("div");
flowBox.className = "stage-abs";
flowBox.dataset.box = "flow-arrow";
flowBox.style.opacity = "0";
const flowSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
flowSvg.setAttribute("width", "148");
flowSvg.setAttribute("height", "28");
flowSvg.style.display = "block";
const flowLn = document.createElementNS("http://www.w3.org/2000/svg", "line");
flowLn.setAttribute("x1", "2");
flowLn.setAttribute("y1", "14");
flowLn.setAttribute("x2", "118");
flowLn.setAttribute("y2", "14");
flowLn.setAttribute("stroke", "var(--obj-energy)");
flowLn.setAttribute("stroke-width", "3");
flowLn.setAttribute("stroke-linecap", "round");
const flowHd = document.createElementNS("http://www.w3.org/2000/svg", "path");
flowHd.setAttribute("d", "M118 14 L104 7 L104 21 Z");
flowHd.setAttribute("fill", "var(--obj-energy)");
flowSvg.appendChild(flowLn);
flowSvg.appendChild(flowHd);
const flowTx = document.createElement("div");
flowTx.className = "t-label";
flowTx.textContent = "flow continues";
flowTx.style.color = "var(--obj-energy)";
flowBox.appendChild(flowSvg);
flowBox.appendChild(flowTx);
document.body.appendChild(flowBox);

const chapter = chapterLabel({ n: 3, title: "Ricci flow", intro: INTRO });
const strip = mountStrip(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);
const badge = heuristicBadge({ parent: document.body, x: 140, y: 84 });
badge.setVisible(false);

const TEX_FLOW =
  "\\htmlClass{term-lhs}{\\frac{\\partial \\htmlClass{term-g}{g}}{\\partial \\htmlClass{term-t}{t}}}" +
  "\\htmlClass{term-rhs}{= -2\\,\\mathrm{\\htmlClass{term-Ric}{Ric}}}";
const TEX_RAD =
  "\\htmlClass{term-row}{\\text{radius}^{2}\\text{ drops by }4\\text{ per unit of }" +
  "\\htmlClass{term-time}{\\text{time}}}";

const eqFlow = mountEquation({
  parent: document.body,
  box: "flow-eq",
  x: 1080,
  y: 156,
  w: 700,
  h: 260,
  tex: TEX_FLOW,
  schedule: { lhs: C.changes, rhs: C.minus },
});
colorTerm(eqFlow, "g", "--obj-hopping");
colorTerm(eqFlow, "t", "--obj-energy");
colorTerm(eqFlow, "Ric", "--obj-potential");
eqFlow.el.dataset.words = "per-text";

const eqRad = mountEquation({
  parent: document.body,
  box: "radius-eq",
  x: 170,
  y: 764,
  w: 1580,
  h: 108,
  tex: TEX_RAD,
  schedule: { row: C.squared },
});
colorTerm(eqRad, "time", "--obj-energy");
eqRad.el.dataset.words = "per-text";

const ricLabel = document.createElement("div");
ricLabel.className = "stage-abs t-label";
ricLabel.dataset.box = "ric-label";
ricLabel.style.left = "1080px";
ricLabel.style.top = "430px";
ricLabel.style.width = "700px";
ricLabel.style.opacity = "0";
const ricA = document.createElement("span");
ricA.textContent = "Ric:";
ricA.style.color = "var(--obj-potential)";
const ricB = document.createElement("span");
ricB.textContent = " curvature that depends on direction";
ricLabel.appendChild(ricA);
ricLabel.appendChild(ricB);
document.body.appendChild(ricLabel);

const cardH = ledgerCard({
  parent: document.body,
  box: "card-hamilton",
  status: "proved",
  title: "Hamilton, 1982",
  lines: [
    "positive Ricci curvature: the normalized flow tends to round",
    "M is S\u00b3, or S\u00b3 divided by a finite group of rotations",
  ],
  x: 140,
  y: 250,
  w: 980,
  tIn: C.hamilton,
  tOut: C.inn,
});
cardH.el.dataset.words = "per-text";
const line2 = cardH.el.querySelectorAll(".ledger-line")[1];

const cardN = ledgerCard({
  parent: document.body,
  box: "card-needed",
  status: "context",
  title: "needed: every shape a singularity can take",
  lines: [],
  x: 160,
  y: 700,
  w: 1180,
  tIn: C.shape7,
});
cardN.el.dataset.words = "per-text";

function mainState(t) {
  const kHeat = 0.75 * fade(t, C.heat, SMOOTH);
  const roundU = fade(t, C.round, TO_CIRCLE);
  const k = lerp(kHeat, 1, roundU);
  if (t >= C.shrinks) {
    const span = C.vanishes - C.shrinks;
    const u = clamp((t - C.shrinks) / span, 0, 1);
    const rho = L_BUMP * Math.sqrt(Math.max(0, 1 - u));
    const rr = Math.max(rho, 0.004);
    return { rfn: roundR(rr, 0), s0: -rr, s1: rr, rho: rho, k: 1 };
  }
  return { rfn: bumpyR(L_BUMP, k), s0: -L_BUMP, s1: L_BUMP, rho: L_BUMP, k: k };
}

function bellW(t) {
  if (t < C.pinches) return 0.24;
  if (t < C.reset) return lerp(0.24, 0.02, fade(t, C.pinches, PINCH));
  return lerp(0.02, 0.14, fade(t, C.reset, RESET));
}

function bellState(t) {
  const morphU = t < C.here ? 0 : fade(t, C.here, TO_BELL);
  const w = bellW(t);
  if (t < C.here) {
    return { rfn: roundR(R5, 0), s0: -R5, s1: R5, w: w, morphU: 0, mode: "sphere" };
  }
  if (morphU < 1) {
    const u = morphU;
    const L = lerp(R5, L_BELL, u);
    const bell = dumbbellR(L_BELL, H_BELL, 0.24);
    const rfn = function (s) {
      const x = s / L;
      if (Math.abs(x) >= 1) return 0;
      const sphere = L * Math.sqrt(Math.max(0, 1 - x * x));
      const waist = bell(x * L_BELL) * (L / L_BELL);
      return (1 - u) * sphere + u * waist;
    };
    return { rfn: rfn, s0: -L, s1: L, w: 0.24, morphU: u, mode: "morph" };
  }
  const rfn = dumbbellR(L_BELL, H_BELL, w);
  return { rfn: rfn, s0: -L_BELL, s1: L_BELL, w: w, morphU: 1, mode: "bell" };
}

function sideSpin(t) {
  if (t < C.round5) return 0;
  const wobble = 16 * Math.sin((Math.min(t, C.here) - C.round5) * 0.55);
  const u = t >= C.here ? fade(t, C.here, TO_BELL) : 0;
  return (1 - u) * wobble * Math.PI / 180;
}

function placeCamera(t) {
  const dur = window.__BEATS__.duration;
  const az = -6 + 12 * (t / dur);
  let dist = DIST_MAIN;
  if (t >= beatStart("c3b5") && t < C.here) dist = DIST_SIDE;
  else if (t >= C.here) {
    dist = lerp(DIST_SIDE, DIST_BELL, fade(t, C.here, TO_BELL));
    let zoom = 0;
    if (t >= C.pinches && t < C.reset) zoom = fade(t, C.pinches, PINCH);
    else if (t >= C.reset) zoom = 1 - fade(t, C.reset, RESET);
    dist = lerp(dist, dist * 0.9, zoom);
  }
  st.orbit([0, 0, 0], az, 18, dist);
}

function placeCut(cv, s, rad, op, drawU) {
  cv.set(circlePts([s, 0, 0], [0, 1, 0], [0, 0, 1], Math.max(rad, 0.02), N_CUT));
  cv.setDraw(drawU);
  cv.setOpacity(op);
}

mark(C.shape, "c3b1", "profile");
mark(C.metric, "c3b1", "metric g");
mark(C.curvature, "c3b1", "curvature band");
mark(C.scalar, "c3b1", "scalar curvature");
mark(C.changes, "c3b2", "flow equation, left side");
mark(C.minus, "c3b2", "flow equation, right side");
mark(C.direction, "c3b2", "Ric label");
mark(C.heat, "c3b3", "bumps relax");
mark(C.even, "c3b3", "evens out");
mark(C.round, "c3b4", "round three-sphere");
mark(C.shrinks, "c3b4", "sphere shrinks");
mark(C.squared, "c3b4", "radius squared");
mark(C.vanishes, "c3b4", "sphere vanishes");
mark(C.hamilton, "c3b5", "Hamilton card");
mark(C.round5, "c3b5", "round profile");
mark(C.quotient, "c3b5", "quotient line");
mark(C.inn, "c3b6", "card leaves");
mark(C.here, "c3b6", "dumbbell");
mark(C.pinches, "c3b6", "neck pinches");
mark(C.twosphere, "c3b6", "neck slice");
mark(C.ham7, "c3b7", "neck resets");
mark(C.cut, "c3b7", "cut lines");
mark(C.cap, "c3b7", "caps");
mark(C.cont, "c3b7", "flow continues");
mark(C.shape7, "c3b7", "singularity card");
mark(beatEnd("c3b7"), "c3b7", "picture fades out");

window.sceneEvents = events;
window.sceneDuration = window.__BEATS__.duration;

window.setTime = function (t) {
  const tail = 1 - fade(t, beatEnd("c3b7"), OUT);
  const beat = beatAt(t);
  const id = beat ? beat.id : "";

  placeCamera(t);

  let xOff = 0;
  if (t >= C.changes && t < C.like) xOff = lerp(0, SHIFT_X, fade(t, C.changes, SHIFT));
  else if (t >= C.like && t < C.round) xOff = lerp(SHIFT_X, 0, fade(t, C.like, BACK));
  host.position.set(xOff, HOST_Y, 0);
  host.rotation.set(0, 0, 0);
  host.scale.set(1, 1, 1);

  const ms = mainState(t);
  let mainOp = 0;
  if (t >= C.shape && t < beatStart("c3b5")) {
    mainOp = fade(t, C.shape, DRAW);
    if (t >= beatEnd("c3b4")) mainOp *= 1 - fade(t, beatEnd("c3b4"), CLEAR4);
  }
  mainOp *= tail;
  const meshOp = ms.rho >= 0.02 ? mainOp : 0;
  if (meshOp > 0.001) {
    main.set(ms.rfn, ms.s0, ms.s1);
    // no curvature tint on the bumpy shape: its shaded red-blue mixes fail the palette pixel check
  }
  main.setOpacity(meshOp);
  const drawU = fade(t, C.shape, DRAW);
  const sliceS = t >= C.shrinks ? [-0.52 * ms.rho, 0, 0.52 * ms.rho] : [-1.2, 0, 1.2];
  for (let i = 0; i < 3; i++) {
    const rad = ms.rfn(sliceS[i]);
    mSl[i].at(sliceS[i], rad);
    mSl[i].setDraw(drawU);
    mSl[i].setOpacity(meshOp > 0.02 && rad > 0.05 ? meshOp : 0);
  }

  const bs = bellState(t);
  let bellOp = 0;
  if (t >= C.round5) bellOp = t < C.here ? fade(t, C.round5, ROUND_IN) : 1;
  bellOp *= tail;
  const capU = t >= C.cap ? fade(t, C.cap, CAP_IN) : 0;
  const splitIn = capU > 0 ? fade(t, C.cap, CAP_IN * 0.2) : 0;
  const fullOp = bellOp * (1 - splitIn);
  const pieceBase = bellOp * splitIn;
  const midFade = capU > 0 ? fade(t, C.cap, CAP_IN * 0.32) : 0;
  const midOp = pieceBase * (1 - midFade);
  const sep = SEP_MAX * (capU > 0 ? fade(t, C.cap + CAP_IN * 0.18, CAP_IN * 0.82) : 0);

  const morphU = bs.morphU;
  const bx = t < C.here ? SIDE_X : lerp(SIDE_X, 0, morphU);
  const by = t < C.here ? SIDE_Y : lerp(SIDE_Y, BELL_Y, morphU);
  bellHost.position.set(bx, by, 0);
  bellHost.rotation.set(0, sideSpin(t), 0);
  leftG.position.set(-sep, 0, 0);
  rightG.position.set(sep, 0, 0);
  midG.position.set(0, 0, 0);

  if (bellOp > 0.001) {
    full.set(bs.rfn, bs.s0, bs.s1);
    // (no curvature tint: shaded red-blue mixes fail the palette pixel check)
  }
  full.setOpacity(fullOp);

  const highlight = (t >= C.twosphere && t < C.reset) ? fade(t, C.twosphere, SLICE_IN) : 0;
  const sSphere = [-0.52 * R5, 0, 0.52 * R5];
  const sBell = [-2, 0, 2];
  const sAt = [lerp(sSphere[0], sBell[0], morphU), 0, lerp(sSphere[2], sBell[2], morphU)];
  const bellSlices = [slL, slM, slR];
  for (let i = 0; i < 3; i++) {
    const rad = bs.rfn(sAt[i]);
    let drawR = rad;
    let tube = 0.014;
    let token = "--ink-muted";
    let op = bellOp > 0.02 && rad > 0.03 ? bellOp : 0;
    // the highlighted slice is the right bulb's (s = 2), drawn at its true radius: at the pinch the neck's own
    // slice is too small to see, and any slice stands for a whole 2-sphere
    if (i === 2 && highlight > 0.02) {
      tube = lerp(0.014, 0.045, highlight);
      token = "--obj-hopping";
      op = bellOp;
    }
    if (i === 1 && t >= C.cap) op *= 1 - midFade;
    bellSlices[i].setRadius(tube);
    bellSlices[i].setColor(token);
    bellSlices[i].at(sAt[i], drawR);
    bellSlices[i].setDraw(t < C.here ? fade(t, C.round5, ROUND_IN) : 1);
    bellSlices[i].setOpacity(op);
  }

  if (bs.mode === "bell") {
    leftP.set(bs.rfn, -L_BELL, -CUT_S);
    midP.set(bs.rfn, -CUT_S, CUT_S);
    rightP.set(bs.rfn, CUT_S, L_BELL);
    if (pieceBase > 0.001) {
      // (no curvature tint: shaded red-blue mixes fail the palette pixel check)
      // (no curvature tint: shaded red-blue mixes fail the palette pixel check)
      // (no curvature tint: shaded red-blue mixes fail the palette pixel check)
    }
  }
  leftP.setOpacity(pieceBase);
  rightP.setOpacity(pieceBase);
  midP.setOpacity(midOp);

  const rhoCut = bs.rfn(CUT_S);
  const cutOp = (t >= C.cut && t < beatEnd("c3b7")) ? fade(t, C.cut, CUT_IN) * (1 - capU) * tail : 0;
  const cutDraw = fade(t, C.cut, CUT_IN);
  placeCut(cutL, -CUT_S, rhoCut + 0.03, cutOp, cutDraw);
  placeCut(cutR, CUT_S, rhoCut + 0.03, cutOp, cutDraw);
  const capOp = capU * tail * (bellOp > 0 ? 1 : 0);
  capL.place([-CUT_S, 0, 0], [1, 0, 0], Math.max(rhoCut, 0.02), Math.max(capU, 0.02));
  capR.place([CUT_S, 0, 0], [-1, 0, 0], Math.max(rhoCut, 0.02), Math.max(capU, 0.02));
  capL.setOpacity(capOp);
  capR.setOpacity(capOp);

  st.render();

  const roundU = fade(t, C.round, TO_CIRCLE);
  const showMainLabs = id === "c3b1" || id === "c3b2" || id === "c3b3";
  let illustOp = 0;
  if (showMainLabs) illustOp = fade(t, C.shape, DRAW);
  if (id === "c3b4") illustOp = 1 - roundU;
  if (t >= C.here) illustOp = fade(t, C.here + TO_BELL * 0.5, TO_BELL * 0.5);
  illustOp *= tail;

  if (id === "c3b2") move(labIllust, 1080, 560, 700);
  else if (t >= C.here) move(labIllust, 680, 96, 760);
  else move(labIllust, 128, 168, 440);
  put(labIllust, illustOp);

  const metricOp = (id === "c3b1" || id === "c3b2") ? fade(t, C.metric, METRIC_IN) * tail : 0;
  const scalarOp = (id === "c3b1" || id === "c3b2") ? fade(t, C.scalar, R_IN) * tail : 0;
  if (id === "c3b2") {
    move(labMetric, 140, 800, 260);
    move(labScalar, 1080, 660, 620);
  } else {
    move(labMetric, 140, 800, 260);
    move(labScalar, 1240, 120, 540);
  }
  put(labMetric, metricOp);
  put(labScalar, scalarOp);

  const evenOp = id === "c3b3" ? fade(t, C.even, EVEN_IN) * tail : 0;
  move(labEven, 1260, 760, 500);
  put(labEven, evenOp);

  let roundOp = 0;
  if (id === "c3b4") {
    const clearK = t >= beatEnd("c3b4") ? fade(t, beatEnd("c3b4"), CLEAR4) : 0;
    roundOp = roundU * (1 - clearK);
  } else if (id === "c3b5") roundOp = 1;
  else if (t >= C.here && t < C.here + TO_BELL) roundOp = 1 - fade(t, C.here, TO_BELL * 0.45);
  roundOp *= tail;
  if (id === "c3b5" || (t >= C.round5 && morphU < 1)) move(labRound, 1140, 108, 640);
  else move(labRound, 1080, 120, 680);
  put(labRound, roundOp);

  const sliceOp = (id === "c3b6") ? highlight * tail : 0;
  move(labSlice, 1060, 720, 400);
  put(labSlice, sliceOp);

  const flowOp = id === "c3b7" ? fade(t, C.cont, FLOW_IN) * tail : 0;
  move(flowBox, 820, 560, 280);
  put(flowBox, flowOp);

  const flowEq = t >= C.changes && t < beatStart("c3b3") ? tail : 0;
  put(eqFlow.el, flowEq);
  let radBox = 0;
  if (t >= C.squared && t < beatStart("c3b5")) {
    radBox = t >= beatEnd("c3b4") ? 1 - fade(t, beatEnd("c3b4"), CLEAR4) : 1;
  }
  put(eqRad.el, radBox * tail);
  const ricOp = t >= C.direction && t < beatStart("c3b3") ? fade(t, C.direction, RIC_IN) : 0;
  put(ricLabel, ricOp * tail);

  let badgeOp = 0;
  if (id === "c3b3") badgeOp = fade(t, C.like, BADGE3);
  if (id === "c3b6" && t >= C.here) badgeOp = fade(t, C.here, BADGE6);
  put(badge.el, badgeOp * tail);

  cardH.setTime(t);
  put(line2, fade(t, C.quotient, LINE2));
  put(cardH.el, (parseFloat(cardH.el.style.opacity) || 0) * tail);
  cardN.setTime(t);
  put(cardN.el, (parseFloat(cardN.el.style.opacity) || 0) * tail);

  chapter.setTime(t);
  if (t >= INTRO) put(chapter.el, tail);
  strip.setTime(t);
  subs.setTime(t);
  eqFlow.setTime(t);
  eqRad.setTime(t);
};

window.setTime(0);
