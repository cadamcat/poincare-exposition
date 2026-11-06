/* Chapter 4. Picture is a function of t. Cue motions use need(). Loaded as an ES module. */
import { stage3d, curve, circlePts, THREE } from "../three3d/stage3d.js";
import { revolve, slice, dumbbellR, bumpyR, roundR, curvatureTint } from "../three3d/shapes3d.js";

installBeats(window.__BEATS__);

const INTRO = need("c4b1", "lead", 1.2, "chapter title settles");
const MAP_IN = need("c4b1", "map", 0.8, "proof map fades in");
const ROW0 = need("c4b1", "Five", 0.6, "top row brightens");
const ROW1 = need("c4b1", "Four", 0.6, "bottom row brightens");
const FLOW_DONE = need("c4b1", "first", 0.5, "Ricci flow turns done");
const SHRINK = need("c4b2", "In", 0.9, "map shrinks to a strip");
const CARDS_IN = need("c4b2", "papers", 0.4, "title cards enter");
const SLIDE = need("c4b2", "entropy", 0.8, "cards slide left and the entropy plot appears");
const COMPANION_D = need("c4b2", "companion", 0.6, "companion label appears");
const LEAVE = need("c4b3", "collapsing", 0.6, "plot leaves and the two balls appear");
const SCALE_D = need("c4b3", "controlled", 0.5, "right ball flattens; same curvature scale");
const VOLUME_D = need("c4b3", "volume", 0.6, "volume labels and the ruled-out cross");
const KAPPA_D = need("c4b3", "kappa", 0.45, "kappa formula");
const DUMB_D = need("c4b4", "Near", 0.7, "dumbbell appears");
const ZOOM = need("c4b4", "zoom", 1.0, "camera dollies to the neck; cylinder limit fades in");
const PAST_D = need("c4b4", "past", 0.5, "time arrow for all past time");
const KSOL_D = need("c4b4", "kappa", 0.5, "kappa solution label");
const FAMILY_D = need("c4b4", "compact", 0.5, "compact family label");
const PANELS_D = need("c4b5", "neck", 0.8, "three shapes replace the zoom");
const CAP_D = need("c4b5", "cap", 0.5, "cap label");
const CLOSED_D = need("c4b5", "closed", 0.5, "closed piece label");
const CARD_D = need("c4b6", "canonical", 0.6, "canonical neighbourhood card");
const OUT = need("c4b6", "tail", 0.8, "picture fades out");

const T = {
  map: cue("c4b1", "map"),
  five: cue("c4b1", "Five"),
  four: cue("c4b1", "Four"),
  first: cue("c4b1", "first"),
  shrink: cue("c4b2", "In"),
  papers: cue("c4b2", "papers"),
  entropy: cue("c4b2", "entropy"),
  companion: cue("c4b2", "companion"),
  collapsing: cue("c4b3", "collapsing"),
  controlled: cue("c4b3", "controlled"),
  volume: cue("c4b3", "volume"),
  kappa3: cue("c4b3", "kappa"),
  so: cue("c4b4", "Near"),
  zoom: cue("c4b4", "zoom"),
  past: cue("c4b4", "past"),
  kappa4: cue("c4b4", "kappa"),
  compact: cue("c4b4", "compact"),
  neck: cue("c4b5", "neck"),
  cap: cue("c4b5", "cap"),
  closed: cue("c4b5", "closed"),
  canonical: cue("c4b6", "canonical"),
};

const BALLS_LINE = "illustration: balls of the same curvature scale";
const CIRCLE_LINE = "illustration: each circle stands for a 2-sphere";

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
  ["flow", "noncol"],
  ["noncol", "canon"],
  ["canon", "surg"],
  ["surg", "ext"],
  ["ext", "sums"],
  ["sums", "smooth"],
  ["smooth", "moise"],
  ["moise", "top"],
];

function mapState(t) {
  const st = {
    flow: "dim", noncol: "dim", canon: "dim", surg: "dim", ext: "dim",
    sums: "dim", smooth: "dim", moise: "dim", top: "dim",
  };
  if (t >= T.five) {
    st.flow = "active";
    st.noncol = "active";
    st.canon = "active";
    st.surg = "active";
    st.ext = "active";
  }
  if (t >= T.four) {
    st.sums = "active";
    st.smooth = "active";
    st.moise = "active";
    st.top = "active";
  }
  if (t >= T.first) st.flow = "done";
  if (t >= T.shrink) {
    st.flow = "done";
    st.noncol = "active";
    st.canon = "dim";
    st.surg = "dim";
    st.ext = "dim";
    st.sums = "dim";
    st.smooth = "dim";
    st.moise = "dim";
    st.top = "dim";
  }
  if (t >= T.kappa3) st.noncol = "done";
  if (t >= beatStart("c4b4")) st.canon = "active";
  if (t >= T.canonical) st.canon = "done";
  return st;
}

const chapter = chapterLabel({
  n: 4,
  title: "Perelman's tools",
  intro: INTRO,
});
const strip = mountStrip(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);

const stage = document.createElement("div");
stage.className = "stage-abs";
stage.style.left = "0px";
stage.style.top = "0px";
stage.style.width = "1920px";
stage.style.height = "1080px";
document.body.appendChild(stage);

// Full-frame stages, back to front: balls, dumbbell, cylinder. One camera each.
const stBall = stage3d({ fov: 26, parent: stage });
const stDumb = stage3d({ fov: 26, parent: stage });
const stCyl = stage3d({ fov: 26, parent: stage });
stBall.setOpacity(0);
stDumb.setOpacity(0);
stCyl.setOpacity(0);

function endRim(st, parent, s, r) {
  const c = curve(st, circlePts([s, 0, 0], [0, 1, 0], [0, 0, 1], r + 0.02, 96), {
    token: "--obj-hopping",
    radius: 0.016,
    hidden: "dash",
  });
  st.scene.remove(c.group);
  parent.add(c.group);
  return c;
}

function addSlices(st, parent, rfn, ss) {
  const out = [];
  for (let i = 0; i < ss.length; i++) {
    const sl = slice(st, { parent: parent });
    sl.at(ss[i], rfn(ss[i]));
    out.push(sl);
  }
  return out;
}

const leftBall = revolve(stBall);
leftBall.set(roundR(1.3), -1.3, 1.3);
leftBall.group.position.set(-2.5, 0, 0);
const rightBall = revolve(stBall);
rightBall.set(roundR(1.3), -1.3, 1.3);
rightBall.group.position.set(2.5, 0, 0);

const dumbR = dumbbellR(3.2, 1.9, 0.12);
const dumb = revolve(stDumb);
dumb.set(dumbR, -3.2, 3.2);
curvatureTint(dumb, 3, 25, 1);
addSlices(stDumb, dumb.group, dumbR, [-1.9, 0, 1.9]);

function constR(r) {
  return function () { return r; };
}
const cylR = constR(1);
const cyl = revolve(stCyl, { open: true });
cyl.set(cylR, -4.5, 4.5);
addSlices(stCyl, cyl.group, cylR, [-3, -1.5, 0, 1.5, 3]);
endRim(stCyl, cyl.group, -4.5, 1);
endRim(stCyl, cyl.group, 4.5, 1);

function capProfile(s) {
  if (s <= -1.2) {
    const u = (s + 1.2) / 0.8;
    return 0.8 * Math.sqrt(Math.max(0, 1 - u * u));
  }
  return 0.8;
}

const PANEL_Y = 308;
const PANEL_H = 448;
const PANEL_W = 500;
const PANEL_X = [120, 660, 1200];
const SHIFT = 120;

function makePanel(name, x) {
  const el = document.createElement("div");
  el.className = "stage-abs";
  el.dataset.box = name;
  el.dataset.words = "per-text";
  el.style.left = x + "px";
  el.style.top = PANEL_Y + "px";
  el.style.width = PANEL_W + "px";
  el.style.height = PANEL_H + "px";
  el.style.opacity = "0";
  stage.appendChild(el);
  const st = stage3d({ parent: el, left: 0, top: 0, width: PANEL_W, height: 320, fov: 26 });
  const group = new THREE.Group();
  st.scene.add(group);
  return { el: el, st: st, group: group };
}

const neckPanel = makePanel("neck", PANEL_X[0]);
const capPanel = makePanel("cap", PANEL_X[1]);
const closedPanel = makePanel("closed", PANEL_X[2]);

const neckR = constR(0.8);
const neckRev = revolve(neckPanel.st, { open: true, parent: neckPanel.group });
neckRev.set(neckR, -2, 2);
addSlices(neckPanel.st, neckPanel.group, neckR, [-1.2, 0, 1.2]);
endRim(neckPanel.st, neckPanel.group, -2, 0.8);
endRim(neckPanel.st, neckPanel.group, 2, 0.8);

const capRev = revolve(capPanel.st, { open: true, parent: capPanel.group });
capRev.set(capProfile, -2, 2);
addSlices(capPanel.st, capPanel.group, capProfile, [0, 1.2]);
endRim(capPanel.st, capPanel.group, 2, 0.8);

const closedR = bumpyR(1.2, 0.85);
const closedRev = revolve(closedPanel.st, { parent: closedPanel.group });
closedRev.set(closedR, -1.2, 1.2);
addSlices(closedPanel.st, closedPanel.group, closedR, [-0.55, 0, 0.55]);

function svgEl(name, attrs) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  if (attrs) {
    for (const key in attrs) node.setAttribute(key, attrs[key]);
  }
  return node;
}

function makeSvg(parent, w, h) {
  const svg = svgEl("svg", {
    width: String(w),
    height: String(h),
    viewBox: "0 0 " + w + " " + h,
  });
  parent.appendChild(svg);
  return svg;
}

function labelBox(name, text, x, y, w, h) {
  const el = document.createElement("div");
  el.className = "t-label stage-abs";
  el.dataset.box = name;
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.style.width = w + "px";
  el.style.height = h + "px";
  el.style.textAlign = "center";
  el.style.opacity = "0";
  el.textContent = text;
  stage.appendChild(el);
  return el;
}

function panelLabel(panel, text) {
  const el = document.createElement("div");
  el.className = "t-label";
  el.style.position = "absolute";
  el.style.left = "16px";
  el.style.top = "332px";
  el.style.width = "468px";
  el.style.textAlign = "center";
  el.style.opacity = "0";
  el.textContent = text;
  panel.el.appendChild(el);
  return el;
}

const fullMap = proofMap({
  parent: stage,
  x: 120,
  y: 200,
  w: 1680,
  h: 500,
  box: "map-full",
  nodes: NODES,
  edges: EDGES,
  stateAt: mapState,
  zoomAt: function () { return null; },
});
fullMap.el.dataset.group = "pmap";

const stripMap = proofMap({
  parent: stage,
  x: 120,
  y: 100,
  w: 1680,
  h: 120,
  box: "map-strip",
  nodes: NODES,
  edges: EDGES,
  stateAt: mapState,
  zoomAt: function () { return null; },
});
stripMap.el.dataset.group = "pmap";

const slideHost = document.createElement("div");
slideHost.className = "stage-abs";
slideHost.style.left = "0px";
slideHost.style.top = "0px";
slideHost.style.width = "1920px";
slideHost.style.height = "1080px";
stage.appendChild(slideHost);

const CARD_X = 120;
const CARD_W = 1000;
const SLIDE_PX = 340;
const cardSpecs = [
  ["Perelman 2002 · The entropy formula for the Ricci flow…", 250],
  ["Perelman 2003 · Ricci flow with surgery on three-manifolds", 430],
  ["Perelman 2003 · Finite extinction time…", 610],
];
const cards = [];
for (let i = 0; i < cardSpecs.length; i++) {
  const card = ledgerCard({
    parent: slideHost,
    status: "context",
    title: cardSpecs[i][0],
    lines: [],
    x: CARD_X,
    y: cardSpecs[i][1],
    w: CARD_W,
    tIn: T.papers,
    tOut: T.collapsing,
  });
  cards.push(card);
}
void CARDS_IN;

const plot = document.createElement("div");
plot.className = "stage-abs";
plot.dataset.box = "plot";
plot.dataset.words = "per-text";
plot.style.left = "1160px";
plot.style.top = "250px";
plot.style.width = "600px";
plot.style.height = "540px";
plot.style.opacity = "0";
stage.appendChild(plot);
const plotTitle = document.createElement("div");
plotTitle.className = "t-label";
plotTitle.style.position = "absolute";
plotTitle.style.left = "20px";
plotTitle.style.top = "16px";
plotTitle.style.width = "560px";
plotTitle.style.height = "48px";
plotTitle.style.textAlign = "center";
plotTitle.textContent = "entropy never decreases";
plot.appendChild(plotTitle);
const plotSvg = makeSvg(plot, 600, 540);
const plotCurve = svgEl("path", {
  fill: "none",
  stroke: "var(--ink)",
  "stroke-width": "4",
  "stroke-linejoin": "round",
  "stroke-linecap": "round",
});
let curveD = "";
for (let i = 0; i <= 36; i++) {
  const u = i / 36;
  const rise = 1 - Math.pow(1 - u, 1.55);
  const x = 48 + 500 * u;
  const y = 250 - rise * 160;
  curveD += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
}
plotCurve.setAttribute("d", curveD);
plotSvg.appendChild(plotCurve);
plotSvg.appendChild(svgEl("line", {
  x1: "40", y1: "268", x2: "548", y2: "268",
  stroke: "var(--obj-energy)", "stroke-width": "3",
}));
plotSvg.appendChild(svgEl("polygon", {
  points: "560,268 542,260 542,276",
  fill: "var(--obj-energy)",
}));
const companion = document.createElement("div");
companion.className = "t-label";
companion.style.position = "absolute";
companion.style.left = "20px";
companion.style.top = "360px";
companion.style.width = "560px";
companion.style.height = "150px";
companion.style.textAlign = "center";
companion.style.opacity = "0";
companion.textContent = "a companion function runs backwards, by a heat equation";
plot.appendChild(companion);

const header = labelBox("illustration", BALLS_LINE, 210, 228, 1500, 48);
header.style.color = "var(--ink-muted)";

const keepLabel = labelBox("keeps", "keeps a share of its volume", 360, 708, 560, 52);
const ruledLabel = labelBox("ruled", "ruled out", 1120, 708, 420, 52);

const cross = document.createElement("div");
cross.className = "stage-abs";
cross.style.width = "220px";
cross.style.height = "120px";
cross.style.opacity = "0";
cross.style.pointerEvents = "none";
const crossSvg = makeSvg(cross, 220, 120);
const crossG = svgEl("g", { stroke: "var(--ink)", "stroke-width": "4", "stroke-linecap": "round" });
crossG.appendChild(svgEl("line", { x1: "24", y1: "18", x2: "196", y2: "102" }));
crossG.appendChild(svgEl("line", { x1: "196", y1: "18", x2: "24", y2: "102" }));
crossSvg.appendChild(crossG);
stage.appendChild(cross);

const TEX = "\\htmlClass{term-vol}{\\text{volume}} \\ge \\htmlClass{term-k}{\\kappa} \\cdot \\htmlClass{term-rad}{\\text{radius}^{3}}";
const eq = mountEquation({
  parent: stage,
  x: 280,
  y: 768,
  w: 980,
  h: 100,
  tex: TEX,
});
colorTerm(eq, "vol", "--obj-hopping");
colorTerm(eq, "rad", "--obj-hopping");

const past = labelBox("past", "", 140, 792, 620, 56);
past.style.textAlign = "left";
const pastSvg = makeSvg(past, 150, 56);
pastSvg.style.position = "absolute";
pastSvg.style.left = "0px";
pastSvg.style.top = "0px";
pastSvg.appendChild(svgEl("line", {
  x1: "132", y1: "28", x2: "28", y2: "28",
  stroke: "var(--obj-energy)", "stroke-width": "3",
}));
pastSvg.appendChild(svgEl("polygon", {
  points: "16,28 36,16 36,40",
  fill: "var(--obj-energy)",
}));
const pastText = document.createElement("div");
pastText.className = "t-label";
pastText.style.position = "absolute";
pastText.style.left = "148px";
pastText.style.top = "8px";
pastText.style.width = "460px";
pastText.textContent = "exists for all past time";
past.appendChild(pastText);

const ksol = document.createElement("div");
ksol.className = "t-label stage-abs";
ksol.dataset.box = "ksol";
ksol.dataset.words = "per-text";
ksol.style.left = "800px";
ksol.style.top = "792px";
ksol.style.width = "400px";
ksol.style.height = "56px";
ksol.style.textAlign = "center";
ksol.style.opacity = "0";
const kGlyph = document.createElement("span");
ksol.appendChild(kGlyph);
katex.render("\\kappa", kGlyph, {
  throwOnError: false,
  trust: true,
  strict: false,
  displayMode: false,
  output: "html",
});
ksol.appendChild(document.createTextNode("-solution"));
stage.appendChild(ksol);

const family = labelBox("family", "compact (fixed κ, rescaled)", 1240, 792, 500, 56);

const neckWords = panelLabel(neckPanel, "neck: almost a round cylinder");
const capWords = panelLabel(capPanel, "cap: a ball, or projective space minus a ball");
const closedWords = panelLabel(closedPanel, "closed piece, positive curvature, often close to round");
neckWords.style.opacity = "1";

const theorem = ledgerCard({
  parent: stage,
  status: "proved",
  title: "Canonical neighbourhood theorem",
  lines: ["large curvature: a neck, a cap, or a closed piece"],
  x: 140,
  y: 242,
  w: 1320,
  tIn: T.canonical,
});
theorem.el.dataset.words = "per-text";

function fitProofLabels() {
  const hosts = [fullMap.el, stripMap.el];
  for (let h = 0; h < hosts.length; h++) {
    const texts = hosts[h].querySelectorAll("text");
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const rect = text.parentNode.querySelector("rect");
      if (!rect) continue;
      const nw = parseFloat(rect.getAttribute("width"));
      const nh = parseFloat(rect.getAttribute("height"));
      if (text.textContent === "Canonical neighbourhoods" && nh > 70) {
        const x = text.getAttribute("x");
        text.textContent = "";
        const top = svgEl("tspan", { x: x, dy: "-0.58em" });
        top.textContent = "Canonical";
        const bot = svgEl("tspan", { x: x, dy: "1.16em" });
        bot.textContent = "neighbourhoods";
        text.appendChild(top);
        text.appendChild(bot);
        continue;
      }
      const box = text.getBBox();
      const max = nw - 18;
      if (box.width > max && box.width > 0) {
        const s = max / box.width;
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        text.setAttribute("transform", "translate(" + cx.toFixed(2) + " " + cy.toFixed(2) + ") scale(" + s.toFixed(4) + ") translate(" + (-cx).toFixed(2) + " " + (-cy).toFixed(2) + ")");
      }
    }
  }
}

window.sceneReady = function () {
  fitProofLabels();
};

function show(el, v) {
  el.style.opacity = String(v);
}

function drift(t, t0, t1, a, b) {
  const u = t1 <= t0 ? 1 : Math.max(0, Math.min(1, (t - t0) / (t1 - t0)));
  return a + (b - a) * u;
}

function paint(st, k) {
  st.setOpacity(k);
  if (k > 0.001) st.render();
}

function camBall(t) {
  stBall.orbit(
    [0, -0.32, 0],
    drift(t, T.collapsing, T.so, -2, 2),
    drift(t, T.collapsing, T.so, 17, 19),
    18.2
  );
}

function camZoom(st, t) {
  const z = fade(t, T.zoom, ZOOM);
  st.orbit(
    [0, 0.28, 0],
    drift(t, T.so, T.neck, -2, 3),
    18,
    lerp(22, 14.5, z)
  );
}

function camPanel(st, t) {
  st.orbit(
    [0, 0, 0],
    drift(t, T.neck, beatHoldEnd("c4b6"), -2, 3),
    18,
    7.15
  );
}

window.sceneDuration = window.__BEATS__.duration;

window.setTime = function (t) {
  const shrinkK = t >= T.shrink ? fade(t, T.shrink, SHRINK) : 0;
  let fullOp = t >= T.map ? fade(t, T.map, MAP_IN) : 0;
  let stripOp = 0;
  if (t >= T.shrink) {
    fullOp = 1 - shrinkK;
    stripOp = shrinkK;
  }
  show(fullMap.el, fullOp);
  show(stripMap.el, stripOp);
  fullMap.el.style.transformOrigin = "50% 0%";
  if (shrinkK > 0 && shrinkK < 1) {
    const lift = lerp(0, -90, shrinkK);
    const sc = lerp(1, 0.86, shrinkK);
    fullMap.el.style.transform = "translateY(" + lift.toFixed(1) + "px) scale(" + sc.toFixed(3) + ")";
  } else {
    fullMap.el.style.transform = "none";
  }

  const slideU = fade(t, T.entropy, SLIDE * 0.6);
  slideHost.style.transform = "translateX(" + lerp(SLIDE_PX, 0, slideU).toFixed(1) + "px)";

  const plotIn = fade(t, T.entropy + SLIDE * 0.35, SLIDE * 0.5);
  const plotOp = plotIn * (1 - fade(t, T.collapsing, LEAVE));
  show(plot, plotOp);
  show(companion, fade(t, T.companion, COMPANION_D));

  const ballsOp = fade(t, T.collapsing, LEAVE) * (1 - fade(t, T.so, DUMB_D));
  const zoomK = fade(t, T.zoom, ZOOM);
  const panelsIn = fade(t, T.neck, PANELS_D);
  const zoomOp = fade(t, T.so, DUMB_D) * (1 - panelsIn);
  const flat = fade(t, T.controlled, SCALE_D);
  const turn = fade(t, T.neck, 8);

  camBall(t);
  rightBall.group.scale.y = lerp(1, 0.12, flat);
  camZoom(stDumb, t);
  camZoom(stCyl, t);

  const panels = [neckPanel, capPanel, closedPanel];
  const spins = [7, -8, 6];
  for (let i = 0; i < panels.length; i++) {
    camPanel(panels[i].st, t);
    panels[i].group.rotation.y = turn * spins[i] * Math.PI / 180;
  }

  const p = stBall.project([2.5, 0, 0]);
  cross.style.left = (p.x - 110) + "px";
  cross.style.top = (p.y - 60) + "px";

  paint(stBall, ballsOp);
  paint(stDumb, zoomOp * (1 - zoomK));
  paint(stCyl, zoomOp * zoomK);
  const dy = SHIFT * fade(t, T.canonical, CARD_D);
  for (let i = 0; i < panels.length; i++) {
    show(panels[i].el, panelsIn);
    panels[i].el.style.transform = dy ? "translateY(" + dy.toFixed(1) + "px)" : "none";
    if (panelsIn > 0.001) panels[i].st.render();
  }

  const swap = T.so + DUMB_D * 0.5;
  let headerOp = 0;
  if (t < swap) headerOp = fade(t, T.controlled, SCALE_D) * ballsOp;
  else if (t < T.canonical) headerOp = Math.max(zoomOp, panelsIn);
  header.textContent = t < swap ? BALLS_LINE : CIRCLE_LINE;
  show(header, headerOp);

  const vol = fade(t, T.volume, VOLUME_D);
  show(keepLabel, vol * ballsOp);
  show(ruledLabel, vol * ballsOp);
  show(cross, vol * ballsOp);
  show(eq.el, ballsOp * fade(t, T.kappa3, KAPPA_D));

  show(past, fade(t, T.past, PAST_D) * zoomOp);
  show(ksol, fade(t, T.kappa4, KSOL_D) * zoomOp);
  show(family, fade(t, T.compact, FAMILY_D) * zoomOp);

  show(capWords, fade(t, T.cap, CAP_D));
  show(closedWords, fade(t, T.closed, CLOSED_D));

  const tail = fade(t, beatEnd("c4b6"), OUT);
  stage.style.opacity = String(1 - tail);

  chapter.setTime(t);
  strip.setTime(t);
  subs.setTime(t);
  fullMap.setTime(t);
  stripMap.setTime(t);
  for (let i = 0; i < cards.length; i++) cards[i].setTime(t);
  eq.setTime(t);
  theorem.setTime(t);

  void ROW0;
  void ROW1;
  void FLOW_DONE;
  void plotTitle;
  void neckWords;
};

const events = [];
function mark(t, beat, what) {
  events.push({ t: Math.round(t * 1000) / 1000, beat: beat, what: what });
}
mark(T.map, "c4b1", "proof map fades in");
mark(T.five, "c4b1", "top row brightens");
mark(T.four, "c4b1", "bottom row brightens");
mark(T.first, "c4b1", "Ricci flow done");
mark(T.shrink, "c4b2", "map shrinks to a strip");
mark(T.papers, "c4b2", "title cards");
mark(T.entropy, "c4b2", "entropy plot");
mark(T.companion, "c4b2", "companion label");
mark(T.collapsing, "c4b3", "two balls");
mark(T.controlled, "c4b3", "right ball flattens");
mark(T.volume, "c4b3", "volume share");
mark(T.kappa3, "c4b3", "kappa formula");
mark(T.so, "c4b4", "dumbbell");
mark(T.zoom, "c4b4", "dolly to the neck");
mark(T.past, "c4b4", "past time");
mark(T.kappa4, "c4b4", "kappa solution");
mark(T.compact, "c4b4", "compact family");
mark(T.neck, "c4b5", "three shapes");
mark(T.cap, "c4b5", "cap");
mark(T.closed, "c4b5", "closed piece");
mark(T.canonical, "c4b6", "neighbourhood theorem");
mark(beatEnd("c4b6"), "c4b6", "picture fades out");
window.sceneEvents = events;

window.setTime(0);
