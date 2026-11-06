// Shapes for the Poincaré film, built on stage3d.js. Each shape states its geometry exactly, so the
// pictures can be checked against the words.
//
// Surfaces of revolution: the axis is the world x axis; r(s) is the radius at x = s. Drawn in 3D, such a
// surface is a 2-sphere; in the film it illustrates a three-manifold whose cross-sections are 2-spheres,
// so each circle across the surface stands for a 2-sphere (the scenes say so on screen).
import { THREE, surface, latheGeometry, setLathe, curve, circlePts, tokenColor, tint } from "./stage3d.js";

// ---------- radius functions ----------

// Round sphere of radius rho centred at s = c.
export function roundR(rho, c) {
  const c0 = c || 0;
  return function (s) { const x = s - c0; return Math.sqrt(Math.max(0, rho * rho - x * x)); };
}

// Dumbbell on [-L, L]: r(s) = H * sqrt(1 - x^4) * (w + (1 - w) * (1 - exp(-(|x|/0.42)^3))), x = s / L.
// Two blunt bulbs (largest radius about 0.9 H near |x| = 0.65) joined by a nearly cylindrical neck of
// radius H*w at s = 0 (r'' -> 0 there). The neck is the thinnest place, so its 2-spheres have the largest
// curvature (R about 2 / (H w)^2, see curvatureTint); as w -> 0 it pinches there.
export function dumbbellR(L, H, w) {
  return function (s) {
    const x = s / L;
    if (Math.abs(x) >= 1) return 0;
    const y = Math.abs(x) / 0.42;
    const g = 1 - Math.exp(-y * y * y);
    return H * Math.sqrt(1 - x * x * x * x) * (w + (1 - w) * g);
  };
}

// A bumpy closed shape on [-L, L] that relaxes to the round sphere of radius L as k -> 1.
export function bumpyR(L, k) {
  return function (s) {
    const x = s / L;
    if (Math.abs(x) >= 1) return 0;
    const bump = 0.08 * Math.sin(2.2 * Math.PI * (x + 0.2)) * Math.exp(-1.5 * x * x) + 0.035 * Math.cos(3 * Math.PI * x) * (1 - x * x);
    return L * Math.sqrt(1 - x * x) * (1 + (1 - k) * bump);
  };
}

// ---------- surfaces of revolution with slices ----------

// A surface of revolution about the x axis, rebuilt each frame by set(rfn, s0, s1).
// opts: token, k (tint), outline, nS, nA, open (true for a surface with open ends: drawn two-sided, no shell)
export function revolve(st, opts) {
  const o = Object.assign({ token: "--obj-hopping", k: 0.6, outline: 0.018, nS: 180, nA: 96, open: false }, opts || {});
  const geo = latheGeometry(o.nS, o.nA);
  const surf = surface(st, geo, { token: o.token, k: o.k, outline: o.open ? 0 : o.outline, side: o.open ? THREE.DoubleSide : THREE.FrontSide });
  if (o.open) surf.shell.visible = false;
  const api = {
    group: surf.group, surf,
    rfn: null, s0: 0, s1: 0,
    set(rfn, s0, s1) { api.rfn = rfn; api.s0 = s0; api.s1 = s1; setLathe(geo, rfn, s0, s1); },
    setOpacity(k) { surf.setOpacity(k); if (o.open) surf.shell.visible = false; },
  };
  if (o.parent) { st.scene.remove(surf.group); o.parent.add(surf.group); }
  return api;
}

// A circle across a surface of revolution at x = s (a slice), radius r(s) + off. Hidden half dashed.
export function slice(st, opts) {
  const o = Object.assign({ token: "--ink-muted", radius: 0.016, off: 0.02, n: 120, halo: 1.4 }, opts || {});
  const c = curve(st, circlePts([0, 0, 0], [0, 1, 0], [0, 0, 1], 1, o.n), { token: o.token, radius: o.radius, hiddenOpacity: 1, dash: 18, halo: o.halo });
  if (o.parent) { st.scene.remove(c.group); o.parent.add(c.group); }
  return Object.assign({}, c, {
    at(s, r) { c.set(circlePts([s, 0, 0], [0, 1, 0], [0, 0, 1], Math.max(1e-4, r + o.off), o.n)); },
  });
}

// ---------- tubes bent along an arc (the ring S^2 x S^1, opened by one cut) ----------

// Surface of a tube of radius a around a centre line that is an arc of total angle `ang` and length len,
// lying in the x-y plane, symmetric about the y axis (the arc's midpoint at the bottom, (0, -Rc)).
// ang = 2*pi closes the ring (a torus with major radius len / (2 pi)); ang -> 0 straightens it into a
// cylinder along x. The two ends are at u = -1 and u = +1; cap(u) in [0, 1] rounds each end into a
// hemisphere of radius a (capL, capR: 0 = open end, 1 = full cap).
export function arcTubeGeometry(nU, nV) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array((nU + 1) * (nV + 1) * 3);
  const idx = [];
  for (let i = 0; i < nU; i++) for (let j = 0; j < nV; j++) {
    const a = i * (nV + 1) + j, b = a + nV + 1;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  g.setIndex(idx);
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(pos.length), 3));
  g.userData = { nU, nV };
  return g;
}

// centre line point and frame at parameter u in [-1, 1]
export function arcFrame(u, ang, len) {
  if (ang < 1e-4) return { p: [u * len / 2, 0, 0], T: [1, 0, 0], N: [0, 1, 0] };
  const Rc = len / ang;
  const th = u * ang / 2;                      // angle from the bottom point
  // centre of the arc at (0, Rc - Rc) shifted so the bottom point is at the origin
  return { p: [Rc * Math.sin(th), Rc - Rc * Math.cos(th), 0], T: [Math.cos(th), Math.sin(th), 0], N: [-Math.sin(th), Math.cos(th), 0] };
}

export function setArcTube(g, ang, len, a, capL, capR, gap) {
  const { nU, nV } = g.userData;
  const pos = g.attributes.position.array;
  // gap: the length removed at the cut (between the two ends), as a share of len
  const gp = gap || 0;
  const capLen = a;
  for (let i = 0; i <= nU; i++) {
    // parameter along the tube body plus the two caps: q in [-1 - cL, 1 + cR] (in units of half-length)
    const q0 = -1 - capL * capLen / (len / 2), q1 = 1 + capR * capLen / (len / 2);
    const q = q0 + (q1 - q0) * i / nU;
    let u = Math.max(-1, Math.min(1, q)) * (1 - gp);
    let rad = a, ext = 0;
    if (q < -1) { const d = (-1 - q) * len / 2; const cl = capL * capLen; rad = cl > 1e-6 ? a * Math.sqrt(Math.max(0, 1 - (d / cl) * (d / cl))) : a; ext = -d; }
    if (q > 1) { const d = (q - 1) * len / 2; const cl = capR * capLen; rad = cl > 1e-6 ? a * Math.sqrt(Math.max(0, 1 - (d / cl) * (d / cl))) : a; ext = d; }
    const f = arcFrame(u, ang, len);
    const B = [0, 0, 1];
    const p = [f.p[0] + ext * f.T[0], f.p[1] + ext * f.T[1], 0];
    for (let j = 0; j <= nV; j++) {
      const v = 2 * Math.PI * j / nV;
      const cn = Math.cos(v), sn = Math.sin(v);
      const nx = cn * f.N[0] + sn * B[0], ny = cn * f.N[1] + sn * B[1], nz = cn * f.N[2] + sn * B[2];
      const k = 3 * (i * (nV + 1) + j);
      pos[k] = p[0] + rad * nx; pos[k + 1] = p[1] + rad * ny; pos[k + 2] = p[2] + rad * nz;
    }
  }
  g.attributes.position.needsUpdate = true;
  g.computeVertexNormals();
  g.computeBoundingSphere();
}

// A circle around the arc tube at parameter u (a slice: in the film it stands for a 2-sphere).
export function arcSlicePts(u, ang, len, a, n) {
  const f = arcFrame(u, ang, len);
  return circlePts(f.p, f.N, [0, 0, 1], a, n || 120);
}

export { tokenColor, tint, curve, circlePts };

// ---------- caps (surgery) ----------

// A cap: a half ellipsoid in the cap colour that closes a tube end. place(p, T, a, lam): base circle centred
// at p, radius a, normal T pointing out of the piece (away from the body); lam in [0, 1] is the cap's
// height as a share of a (0 = flat disc, 1 = hemisphere). The cap sits on the end it closes, nothing else.
export function capMesh(st, opts) {
  const o = Object.assign({ token: "--obj-damping", k: 0.75, outline: 0.012 }, opts || {});
  const geo = new THREE.SphereGeometry(1, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2);   // dome around +y
  const s = surface(st, geo, { token: o.token, k: o.k, outline: o.outline, side: THREE.DoubleSide });
  if (o.parent) { st.scene.remove(s.group); o.parent.add(s.group); }
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  return Object.assign({}, s, {
    place(p, T, a, lam) {
      s.group.position.set(p[0], p[1], p[2]);
      q.setFromUnitVectors(up, new THREE.Vector3(T[0], T[1], T[2]).normalize());
      s.group.quaternion.copy(q);
      s.group.scale.set(a * 1.004, Math.max(0.02, lam) * a, a * 1.004);
    },
  });
}

// ---------- curvature tint (illustration of R) ----------

// Colours a revolve() surface by the scalar curvature R of the three-manifold it illustrates: the
// rotationally symmetric metric d(sigma)^2 + r^2 g(S^2), sigma = arc length along the drawn profile, has
// R = 2 (1 - r_sigma^2) / r^2 - 4 r_sigma_sigma / r  (6 / rho^2 on a round sphere of radius rho; about 2 / r^2
// on a thin neck, so a neck is hottest where it is thinnest).
// Colour = tint of `base` where R <= kLow, blending to `hot` (default --obj-potential) at R >= kHigh.
// strength in [0, 1] scales the blend (0 = plain surface). Call after every set().
export function curvatureTint(rev, kLow, kHigh, strength, hot, base) {
  const geo = rev.surf.mesh.geometry;
  const { nS, nA } = geo.userData;
  if (!geo.attributes.color) {
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array((nS + 1) * (nA + 1) * 3), 3));
    rev.surf.material.vertexColors = true;
    rev.surf.material.color.set(0xffffff);
    rev.surf.material.needsUpdate = true;
  }
  const col = geo.attributes.color.array;
  const cBase = tint(base || "--obj-hopping", 0.6), cHot = tint(hot || "--obj-potential", 0.85);
  const r = rev.rfn, s0 = rev.s0, s1 = rev.s1, h = (s1 - s0) * 2e-3;
  const tmp = new THREE.Color();
  for (let i = 0; i <= nS; i++) {
    const u = (1 - Math.cos(Math.PI * i / nS)) / 2;
    // near a pole (r -> 0) the formula is 0/0: use the value a little way in
    const ue = Math.min(Math.max(u, 0.04), 0.96);
    let s = s0 + (s1 - s0) * ((r(s0) < 1e-6 || r(s1) < 1e-6) ? ue : u);
    s = Math.min(s1 - 2 * h, Math.max(s0 + 2 * h, s));
    const r0 = Math.max(1e-4, r(s)), rp = (r(s + h) - r(s - h)) / (2 * h), rpp = (r(s + h) - 2 * r0 + r(s - h)) / (h * h);
    const q = 1 + rp * rp;
    const rs = rp / Math.sqrt(q), rss = rpp / (q * q);
    const K = 2 * (1 - rs * rs) / (r0 * r0) - 4 * rss / r0;
    const m = Math.max(0, Math.min(1, (K - kLow) / (kHigh - kLow))) * strength;
    tmp.copy(cBase).lerp(cHot, m);
    for (let j = 0; j <= nA; j++) {
      const k = 3 * (i * (nA + 1) + j);
      col[k] = tmp.r; col[k + 1] = tmp.g; col[k + 2] = tmp.b;
    }
  }
  geo.attributes.color.needsUpdate = true;
}
