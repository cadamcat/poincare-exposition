// 3D pictures for the article figures (rendered once by render3d.js; labels are added by make_figures.py).
// World unit = 100 px at the target plane. One camera per figure, so perspective and light are consistent.
import { stage3d, surface, latheGeometry, setLathe, torusGeometry, curve, circlePts, THREE } from "../../film/scenes/three3d/stage3d.js";
import { revolve, slice, dumbbellR, bumpyR, roundR, curvatureTint, capMesh } from "../../film/scenes/three3d/shapes3d.js";

const q = new URLSearchParams(location.search);
const FIG = q.get("fig"), W = +q.get("w"), H = +q.get("h");
document.body.style.width = W + "px";
document.body.style.height = H + "px";
document.body.style.background = "var(--paper)";
const FOV = 20;
const st = stage3d({ width: W, height: H, fov: FOV });
const D = (H / 100) / (2 * 0.17632698);   // tan(10 deg)
function cam(el) {
  const e = el * Math.PI / 180;
  st.look([0, D * Math.sin(e), D * Math.cos(e)], [0, 0, 0]);
}
const X = (px) => (px - W / 2) / 100;   // horizontal pixel centre -> world x

function sphereAt(x, r, k) {
  const g = latheGeometry(120, 120);
  setLathe(g, (s) => Math.sqrt(Math.max(0, r * r - s * s)), -r, r);
  const s = surface(st, g, { k: k || 0.6, outline: 0.02 });
  s.group.rotation.z = Math.PI / 2;   // poles on the y axis
  s.group.position.x = x;
  return s;
}

function latitude(x, r, phi, opts) {
  const off = 0.045;
  const c = curve(st, circlePts([x, (r + off) * Math.sin(phi), 0], [1, 0, 0], [0, 0, 1], (r + off) * Math.cos(phi), 160), Object.assign({ radius: 0.03 }, opts || {}));
  return c;
}

if (FIG === "loops") {
  cam(32);
  // sphere: the band at three moments of its slide to the top (later ones fainter), and the point it shrinks to
  const sx = X(280), r = 1.35;
  sphereAt(sx, r);
  latitude(sx, r, 0.0).setOpacity(1);
  // (two moments are drawn: the band around the middle and the band near the top)
  latitude(sx, r, 1.12);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue("--obj-wave").trim()) }));
  dot.position.set(sx, r + 0.05, 0);
  st.scene.add(dot);
  // torus lying flat; the band is a meridian circle around the tube at the back right: its inner arc runs down
  // through the hole (seen through the hole), its outer arc behind the tube is hidden (dashed)
  const tx = X(860), R = 1.5, a = 0.55;
  const tor = surface(st, torusGeometry(R, a, 220, 110), { k: 0.6, outline: 0.02 });
  tor.group.position.x = tx;
  const th = -58 * Math.PI / 180;
  const er = [Math.cos(th), 0, Math.sin(th)];
  const pts = [];
  for (let i = 0; i < 160; i++) {
    const p = 2 * Math.PI * i / 160;
    const rad = R + (a + 0.05) * Math.cos(p);
    pts.push([tx + rad * er[0], (a + 0.05) * Math.sin(p), rad * er[2]]);
  }
  curve(st, pts, { radius: 0.03 });
}

if (FIG === "ricci-flow") {
  cam(14);
  // three moments of a neck pinch: r(s) = dumbbellR(1.8, 1.25, w), w = 0.3, 0.13, 0.02; slices at -1.05, 0, 1.05;
  // shaded by the scalar curvature R of the illustrated metric (the neck is hottest)
  [0.3, 0.13, 0.02].forEach(function (w, i) {
    const g = new THREE.Group();
    g.position.x = X(260 + 490 * i);
    st.scene.add(g);
    const rf = dumbbellR(1.8, 1.25, w);
    const rev = revolve(st, { parent: g });
    rev.set(rf, -1.8, 1.8);
    curvatureTint(rev, 4, 30, 1);
    [-1.05, 0, 1.05].forEach(function (s) { const sl = slice(st, { parent: g }); sl.at(s, rf(s)); });
  });
}

if (FIG === "surgery") {
  cam(14);
  // left: a neck r(s) = dumbbellR(1.9, 1.3, 0.2), the cut along its middle 2-sphere (s = 0);
  // right: the two pieces moved apart, each with a cap on its cut end
  const L = 1.9, Hh = 1.3, w = 0.2;
  const rf = dumbbellR(L, Hh, w);
  const g0 = new THREE.Group(); g0.position.x = X(330); st.scene.add(g0);
  const whole = revolve(st, { parent: g0 }); whole.set(rf, -L, L);
  [-1.1, 1.1].forEach(function (s) { const sl = slice(st, { parent: g0, }); sl.at(s, rf(s)); });
  const cut = slice(st, { parent: g0, token: "--obj-damping", radius: 0.028, off: 0.03 }); cut.at(0, rf(0));
  const g1 = new THREE.Group(); g1.position.x = X(1110); st.scene.add(g1);
  const gap = 0.45, rho = rf(0);
  const left = revolve(st, { parent: g1 }); left.set(rf, -L, 0); left.group.position.x = -gap;
  const right = revolve(st, { parent: g1 }); right.set(rf, 0, L); right.group.position.x = gap;
  capMesh(st, { parent: g1 }).place([-gap, 0, 0], [1, 0, 0], rho, 1);
  capMesh(st, { parent: g1 }).place([gap, 0, 0], [-1, 0, 0], rho, 1);
}

if (FIG === "neighbourhoods") {
  cam(16);
  // neck: open round cylinder r = 0.62 on [-1.7, 1.7]; cap: hemisphere of radius 0.62 closing a cylinder;
  // closed piece: bumpyR(1.0, 0.85) (positive curvature, close to round)
  const hop = getComputedStyle(document.documentElement).getPropertyValue("--obj-hopping").trim();
  function rim(g, s, r) {
    const c = curve(st, circlePts([s, 0, 0], [0, 1, 0], [0, 0, 1], r, 120), { token: "--obj-hopping", radius: 0.016 });
    st.scene.remove(c.group); g.add(c.group);
  }
  const a = 0.62;
  const g0 = new THREE.Group(); g0.position.x = X(250); st.scene.add(g0);
  const neck = revolve(st, { parent: g0, open: true }); neck.set(() => a, -1.7, 1.7);
  rim(g0, -1.7, a); rim(g0, 1.7, a);
  [-1.0, 0, 1.0].forEach(function (s) { const sl = slice(st, { parent: g0, }); sl.at(s, a); });
  const g1 = new THREE.Group(); g1.position.x = X(750); st.scene.add(g1);
  const capR = (s) => (s < -1.1 ? a * Math.sqrt(Math.max(0, 1 - ((s + 1.1) / a) * ((s + 1.1) / a))) : a);
  const cap = revolve(st, { parent: g1, open: true }); cap.set(capR, -1.1 - a, 1.7);
  rim(g1, 1.7, a);
  [-0.3, 0.8].forEach(function (s) { const sl = slice(st, { parent: g1, }); sl.at(s, a); });
  const g2 = new THREE.Group(); g2.position.x = X(1250); st.scene.add(g2);
  const cl = revolve(st, { parent: g2 }); const rf = bumpyR(1.0, 0.85); cl.set(rf, -1.0, 1.0);
  [-0.5, 0.5].forEach(function (s) { const sl = slice(st, { parent: g2, }); sl.at(s, rf(s)); });
}

st.render();
window.figDone = true;
