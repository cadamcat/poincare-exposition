/* Chapter 1. Cold open. The picture is a function of t. Loaded as an ES module (three.js). */
import { stage3d, surface, latheGeometry, setLathe, torusGeometry, curve, circlePts, THREE } from "../three3d/stage3d.js";

installBeats(window.__BEATS__);

const events = [];
function mark(t, beat, what) {
  events.push({ t: Math.round(t * 1000) / 1000, beat: beat, what: what });
}

const D = {
  band: need("c1b1", "rubber", 0.9, "rubber band is drawn around the apple"),
  slide: need("c1b1", "slide", 1.6, "band slides up and shrinks to a point"),
  lab1: need("c1b1", "point", 0.45, "label every loop shrinks"),
  torus: need("c1b2", "doughnut", 0.8, "doughnut turns in"),
  hole: need("c1b2", "band", 0.6, "band is drawn around the tube, through the hole"),
  spring: need("c1b2", "cannot", 1.2, "band is pulled, catches on the tube and snaps back"),
  lab2: need("c1b2", "cannot", 0.45, "label this loop cannot shrink"),
  surf: need("c1b2", "surfaces", 0.5, "surfaces two dimensions"),
  dim: need("c1b3", "In", 0.6, "surfaces dim and the badge fades"),
  year: need("c1b3", "nineteen", 0.5, "1904 appears"),
  up: need("c1b3", "dimension", 0.5, "one dimension up"),
  century: need("c1b3", "century", 1.1, "1904 slides and the time line grows to 2003"),
  clear: need("c1b4", "This", 1.0, "time line fades"),
  title: need("c1b4", "answer", 0.55, "title The Poincaré conjecture"),
  ricci: need("c1b4", "Ricci", 0.5, "its proof by Ricci flow"),
  checker: need("c1b4", "checker", 0.5, "and what the Lean proof checker verified"),
  tail: need("c1b4", "tail", 0.8, "picture fades out"),
};

const T = {
  start: beatStart("c1b1"),
  rubber: cue("c1b1", "rubber"),
  slide: cue("c1b1", "slide"),
  point: cue("c1b1", "point"),
  doughnut: cue("c1b2", "doughnut"),
  hole: cue("c1b2", "band"),
  cannot: cue("c1b2", "cannot"),
  surfaces: cue("c1b2", "surfaces"),
  dim: cue("c1b3", "In"),
  nineteen: cue("c1b3", "nineteen"),
  dimension: cue("c1b3", "dimension"),
  century: cue("c1b3", "century"),
  clear: cue("c1b4", "This"),
  answer: cue("c1b4", "answer"),
  ricci: cue("c1b4", "Ricci"),
  checker: cue("c1b4", "checker"),
  tail: beatEnd("c1b4"),
};

mark(T.start, "c1b1", "sphere and badge");
mark(T.rubber, "c1b1", "band appears");
mark(T.slide, "c1b1", "band slides to a point");
mark(T.point, "c1b1", "label every loop shrinks");
mark(T.doughnut, "c1b2", "torus turns in");
mark(T.hole, "c1b2", "band around the tube, through the hole");
mark(T.cannot, "c1b2", "band pulled, snaps back");
mark(T.surfaces, "c1b2", "surfaces two dimensions");
mark(T.dim, "c1b3", "surfaces dim");
mark(T.nineteen, "c1b3", "1904");
mark(T.dimension, "c1b3", "one dimension up");
mark(T.century, "c1b3", "time line to 2003");
mark(T.clear, "c1b4", "time line fades");
mark(T.answer, "c1b4", "title");
mark(T.ricci, "c1b4", "Ricci flow");
mark(T.checker, "c1b4", "Lean proof checker");
mark(T.tail, "c1b4", "picture fades out");

// ---------- 3D: one camera for both surfaces, so they share perspective and light ----------
// World: y up. Sphere of radius RS at SC. Torus lying flat (axis y) at TC: major radius R, tube radius A.
const RS = 1.55, SC = [-3.05, 0.05, 0];
const R = 1.45, A = 0.52, TC = [2.95, -0.05, 0];
const OFF = 0.08;             // loops sit just outside the surface
const LOOP_R = 0.04;
const st = stage3d({ fov: 26 });
const sphereGeo = latheGeometry(120, 120);
setLathe(sphereGeo, function (s) { return Math.sqrt(Math.max(0, RS * RS - s * s)); }, -RS, RS);
const sphere = surface(st, sphereGeo, { token: "--obj-hopping", k: 0.6 });
// the lathe axis is x; turn it so the sphere's poles are on the y axis (latitude circles are horizontal)
sphere.group.rotation.z = Math.PI / 2;
sphere.group.position.set(SC[0], SC[1], SC[2]);

const torusGroup = new THREE.Group();
st.scene.add(torusGroup);
const torus = surface(st, torusGeometry(R, A, 220, 110), { token: "--obj-hopping", k: 0.6 });
st.scene.remove(torus.group);
torusGroup.add(torus.group);
torusGroup.position.set(TC[0], TC[1], TC[2]);

// apple band: a latitude circle at latitude phi (0 = equator), world coordinates
const NB = 160;
function bandPts(phi) {
  const r = (RS + OFF) * Math.cos(phi);
  const y = (RS + OFF) * Math.sin(phi);
  // start the draw-on at the front (+z), going to the right
  return circlePts([SC[0], SC[1] + y, SC[2]], [0, 0, 1], [1, 0, 0], Math.max(r, 1e-4), NB);
}
const band = curve(st, bandPts(0), { radius: LOOP_R });
const dot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), band.material);
dot.position.set(SC[0], SC[1] + RS + OFF, SC[2]);
dot.renderOrder = 2;
st.scene.add(dot);

// doughnut band: a meridian circle of the tube at angle THETA around the axis (in the torus frame).
// It goes over the top of the tube, down through the hole, under the tube and back up the outside.
// pull (world units) drags the outer side of the band outward; the band stays around the tube.
const THETA = 0;   // in the torus frame; the doughnut turns, carrying the band from front-right to back-right
const NM = 160;
function meridianPts(theta, pull) {
  const er = [Math.cos(theta), 0, Math.sin(theta)];
  const out = [];
  for (let i = 0; i < NM; i++) {
    // start on top of the tube and go toward the hole first, so the draw-on visibly enters the hole
    const phi = Math.PI / 2 + 2 * Math.PI * i / NM;
    const c = Math.cos(phi), s = Math.sin(phi);
    let rad = R + (A + OFF) * c;
    let y = (A + OFF) * s;
    const w = Math.max(0, c);        // outer side of the tube only
    rad += pull * w * w;
    y *= 1 - 0.35 * (pull / 0.6) * w * w;   // the pulled band narrows as it is stretched
    out.push([rad * er[0], y, rad * er[2]]);
  }
  return out;
}
const mband = curve(st, meridianPts(THETA, 0), { radius: LOOP_R });
st.scene.remove(mband.group);
torusGroup.add(mband.group);

// camera: slow drift (a function of t), the same for the whole chapter
function cameraAt(t) {
  const u = (t - T.start) / 30;
  st.orbit([0, -0.15, 0], -2 + 4 * u, 34 + 3 * u, 19.5 - 0.6 * u);
}

// ---------- 2D layer: labels and the time line ----------
function ns(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}

function put(el, o) {
  const v = o <= 0.001 ? 0 : o >= 0.999 ? 1 : o;
  el.style.opacity = v === 0 ? "0" : v === 1 ? "1" : v.toFixed(4);
}

function attrOp(el, o) {
  const v = o <= 0.001 ? 0 : o >= 0.999 ? 1 : o;
  el.setAttribute("opacity", v === 0 ? "0" : v === 1 ? "1" : v.toFixed(4));
}

function textLine(name, text, x, y, w, kind, color) {
  const d = document.createElement("div");
  d.className = (kind || "t-label") + " stage-abs";
  d.dataset.box = name;
  d.style.left = x + "px";
  d.style.top = y + "px";
  d.style.width = w + "px";
  d.style.textAlign = "center";
  d.style.whiteSpace = "nowrap";
  d.style.opacity = "0";
  if (color) d.style.color = color;
  d.textContent = text;
  document.body.appendChild(d);
  return d;
}

function lineEl(parent, x1, y1, x2, y2, stroke, sw) {
  const e = ns("line");
  e.setAttribute("x1", String(x1));
  e.setAttribute("y1", String(y1));
  e.setAttribute("x2", String(x2));
  e.setAttribute("y2", String(y2));
  e.setAttribute("stroke", stroke);
  e.setAttribute("stroke-width", String(sw));
  e.setAttribute("stroke-linecap", "round");
  parent.appendChild(e);
  return e;
}

const YEAR_W = 240;
const YEAR_X0 = 840;
const YEAR_X1 = 180;
const LINE_Y = 608;
const TICK_X = 1520;

const timeWrap = document.createElement("div");
timeWrap.className = "stage-abs";
timeWrap.style.left = "0px";
timeWrap.style.top = "0px";
timeWrap.style.width = "1920px";
timeWrap.style.height = "1080px";
document.body.appendChild(timeWrap);
const timeSvg = ns("svg");
timeSvg.setAttribute("width", "1920");
timeSvg.setAttribute("height", "1080");
timeSvg.setAttribute("viewBox", "0 0 1920 1080");
timeWrap.appendChild(timeSvg);
const axis = lineEl(timeSvg, YEAR_X0, LINE_Y, YEAR_X0, LINE_Y, "var(--obj-energy)", 3);
const tick = lineEl(timeSvg, TICK_X, LINE_Y - 16, TICK_X, LINE_Y + 16, "var(--obj-energy)", 3);

const lab1 = textLine("loop-shrinks", "every loop shrinks", 210, 812, 560);
const lab2 = textLine("loop-stays", "this loop cannot shrink", 1090, 812, 620);
const surf = textLine("surfaces", "surfaces: two dimensions", 680, 100, 560);
const year = textLine("year", "1904", YEAR_X0, 574, YEAR_W, "t-title", "var(--obj-energy)");
const up = textLine("dimension-up", "Poincaré: the same question, one dimension up", 420, 680, 1080);
const y2003 = textLine("year-2003", "2003", 1544, 588, 150, "t-label", "var(--obj-energy)");
const title = textLine("title", "The Poincaré conjecture", 360, 360, 1200, "t-title");
const ricci = textLine("ricci", "its proof by Ricci flow", 460, 460, 1000);
const checker = textLine("checker", "and what the Lean proof checker verified", 360, 530, 1200);

const badge = heuristicBadge({ parent: document.body, x: 1288, y: 96 });
const strip = mountStrip(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);

function hump(u) {
  if (u <= 0 || u >= 1) return 0;
  return u < 0.45 ? ease(u / 0.45) : 1 - ease((u - 0.45) / 0.55);
}

window.sceneEvents = events;
window.sceneDuration = window.__BEATS__.duration;

window.setTime = function (t) {
  const dimK = fade(t, T.dim, D.dim);
  const clearK = fade(t, T.clear, D.clear);
  const outK = fade(t, T.tail, D.tail);
  const stay = (1 - outK);
  const surfOp = lerp(lerp(1, 0.15, dimK), 0, clearK) * stay;
  const leave = (1 - dimK) * stay;

  cameraAt(t);
  st.setOpacity(surfOp);

  // apple: the band is drawn around the middle, then slides up over the surface to the top point
  const slideK = fade(t, T.slide, D.slide);
  band.set(bandPts(slideK * Math.PI / 2 * 0.985));
  band.setDraw(fade(t, T.rubber, D.band));
  const bandIn = t >= T.rubber ? 1 : 0;
  const bandGone = fade(t, T.slide + D.slide * 0.82, D.slide * 0.18);
  band.setOpacity(bandIn * (1 - bandGone));
  dot.visible = slideK > 0.8;
  sphere.group.rotation.y = 0;

  // doughnut: turns in, slowly turning about its own axis for the rest of the chapter
  const torK = fade(t, T.doughnut, D.torus);
  torus.setOpacity(torK);
  // the band's world angle is -rotation: +55 deg (front-right, its outer side faces us) at [band],
  // turning toward the back-right, where its inner side, inside the hole, faces us
  torusGroup.rotation.y = (-55 + 17 * (t - T.hole)) * Math.PI / 180;
  torusGroup.visible = torK > 0.001;
  const pull = 0.45 * hump((t - T.cannot) / D.spring);
  mband.set(meridianPts(THETA, pull));
  mband.setDraw(fade(t, T.hole, D.hole));
  mband.setOpacity(t >= T.hole ? 1 : 0);

  st.render();

  put(lab1, fade(t, T.point, D.lab1) * leave);
  put(lab2, fade(t, T.cannot, D.lab2) * leave);
  put(surf, fade(t, T.surfaces, D.surf) * leave);
  put(badge.el, leave);

  const centuryK = fade(t, T.century, D.century);
  const yearX = lerp(YEAR_X0, YEAR_X1, centuryK);
  year.style.left = yearX + "px";
  const card = (1 - clearK) * stay;
  put(year, fade(t, T.nineteen, D.year) * card);
  put(up, fade(t, T.dimension, D.up) * card);

  const x1 = yearX + YEAR_W + 16;
  const x2 = lerp(x1, TICK_X, centuryK);
  axis.setAttribute("x1", String(x1));
  axis.setAttribute("x2", String(x2));
  const timeOp = (centuryK > 0.001 ? 1 : 0) * card;
  attrOp(axis, timeOp);
  const tickIn = fade(t, T.century + D.century * 0.62, D.century * 0.38);
  attrOp(tick, tickIn * card);
  put(y2003, tickIn * card);

  put(title, fade(t, T.answer, D.title) * stay);
  put(ricci, fade(t, T.ricci, D.ricci) * stay);
  put(checker, fade(t, T.checker, D.checker) * stay);

  strip.setTime(t);
  subs.setTime(t);
};
