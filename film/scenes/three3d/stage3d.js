// 3D stage for the Poincaré film (three.js 0.186.1, pinned in the studio's node_modules).
// Every picture is a pure function of t: nothing here reads a clock or uses requestAnimationFrame.
// A scene imports this module after its classic scene.js and draws inside window.setTime(t).
//
// Conventions used by every chapter (so lighting and hidden lines agree across the film):
// - one light rig: key light from the upper left, in front of the picture; a soft sky/ground fill;
// - surfaces: matte, a light tint of their object colour, with an ink-like outline in the full
//   object colour (an inflated back-face shell, so silhouettes and inner rims are drawn);
// - curves on surfaces (loops, slices): solid where visible; where a surface hides them they are
//   drawn dashed and faint (depth test "greater"), never simply omitted.
import * as THREE from "three";

export { THREE };

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function tokenColor(name) {
  return new THREE.Color(cssVar(name));
}

// a tint of a token toward the paper colour (k = share of the token)
export function tint(name, k) {
  const c = tokenColor("--paper");
  return c.lerp(tokenColor(name), k);
}

export function stage3d(opt) {
  const o = Object.assign({ left: 0, top: 0, width: 1920, height: 1080, fov: 28, parent: document.body }, opt || {});
  const canvas = document.createElement("canvas");
  canvas.className = "stage-abs";
  canvas.dataset.stage3d = "1";
  canvas.style.position = "absolute";
  canvas.style.left = o.left + "px";
  canvas.style.top = o.top + "px";
  canvas.style.width = o.width + "px";
  canvas.style.height = o.height + "px";
  canvas.style.pointerEvents = "none";
  if (o.before) o.parent.insertBefore(canvas, o.before);
  else o.parent.insertBefore(canvas, o.parent.firstChild);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(o.width, o.height, false);
  renderer.setClearColor(tokenColor("--paper"), 0);
  renderer.sortObjects = true;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(o.fov, o.width / o.height, 0.1, 200);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x8a8478, 1.55);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(-4, 6, 7);
  scene.add(key);
  // the key light follows the camera, so the light stays "upper left, in front" when the camera moves
  function syncLight() {
    const off = new THREE.Vector3(-4, 6, 7);
    off.applyQuaternion(camera.quaternion);
    key.position.copy(camera.position).add(off);
    key.target.position.set(0, 0, 0);
    key.target.updateMatrixWorld();
  }
  const st = {
    THREE, scene, camera, renderer, canvas, width: o.width, height: o.height,
    look(pos, target) {
      camera.position.set(pos[0], pos[1], pos[2]);
      camera.lookAt(target[0], target[1], target[2]);
      camera.updateMatrixWorld();
    },
    // camera on a sphere around target: azimuth (deg, 0 = +z), elevation (deg), distance
    orbit(target, az, el, dist) {
      const a = az * Math.PI / 180, e = el * Math.PI / 180;
      camera.position.set(target[0] + dist * Math.cos(e) * Math.sin(a), target[1] + dist * Math.sin(e), target[2] + dist * Math.cos(e) * Math.cos(a));
      camera.lookAt(target[0], target[1], target[2]);
      camera.updateMatrixWorld();
    },
    render() {
      syncLight();
      renderer.render(scene, camera);
    },
    // CSS pixel position (page coordinates) of a world point
    project(v) {
      const p = new THREE.Vector3(v[0], v[1], v[2]).project(camera);
      return { x: o.left + (p.x + 1) / 2 * o.width, y: o.top + (1 - p.y) / 2 * o.height };
    },
    setOpacity(k) {
      const v = k <= 0.001 ? 0 : k >= 0.999 ? 1 : k;
      canvas.style.opacity = String(v);
    },
  };
  return st;
}

// ---------- materials ----------

const OUTLINE_VS = `
uniform float uWidth;
void main() {
  vec3 p = position + normalize(normal) * uWidth;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const OUTLINE_FS = `
uniform vec3 uColor;
uniform float uOpacity;
void main() {
  gl_FragColor = vec4(uColor, uOpacity);
  #include <colorspace_fragment>
}`;

function outlineMaterial(color, width) {
  return new THREE.ShaderMaterial({
    uniforms: { uWidth: { value: width }, uColor: { value: color.clone() }, uOpacity: { value: 1 } },
    vertexShader: OUTLINE_VS,
    fragmentShader: OUTLINE_FS,
    side: THREE.BackSide,
    transparent: true,
  });
}

// A shaded surface with an outline. geometry must have normals pointing outward.
// opts: token (object colour), k (tint share, default 0.38), outline (world width, default 0.018)
export function surface(st, geometry, opts) {
  const o = Object.assign({ token: "--obj-hopping", k: 0.38, outline: 0.018, side: THREE.FrontSide }, opts || {});
  const group = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: tint(o.token, o.k), side: o.side, transparent: true, opacity: 1 });
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.renderOrder = 0;
  const omat = outlineMaterial(tokenColor(o.token), o.outline);
  const shell = new THREE.Mesh(geometry, omat);
  shell.renderOrder = 0;
  // depth prepass: while the surface fades (0 < opacity < 1) it still hides its own outline shell, so the
  // shell shows only as the silhouette, never as a solid disc behind a faint surface
  const pmat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true, side: o.side });
  const pre = new THREE.Mesh(geometry, pmat);
  pre.renderOrder = -1;
  pre.visible = false;
  group.add(pre);
  group.add(shell);
  group.add(mesh);
  st.scene.add(group);
  const api = {
    group, mesh, shell, material: mat, prepass: true,
    setOpacity(k) {
      const v = Math.max(0, Math.min(1, k));
      mat.opacity = v;
      omat.uniforms.uOpacity.value = v;
      mat.depthWrite = v > 0.98;
      pre.visible = api.prepass && v > 0.001 && v <= 0.98;
      group.visible = v > 0.001;
    },
    setColor(token, k) {
      mat.color.copy(tint(token, k == null ? o.k : k));
      omat.uniforms.uColor.value.copy(tokenColor(token));
    },
  };
  return api;
}

// ---------- geometry ----------

// Surface of revolution about the x axis: radius r(s) for s in [s0, s1], r(s0) = r(s1) = 0 for a
// closed surface. update(r, s0, s1) rewrites the vertices in place (same counts).
export function latheGeometry(nS, nA) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array((nS + 1) * (nA + 1) * 3);
  const idx = [];
  for (let i = 0; i < nS; i++) {
    for (let j = 0; j < nA; j++) {
      const a = i * (nA + 1) + j, b = a + nA + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  g.setIndex(idx);
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(pos.length), 3));
  g.userData = { nS, nA };
  return g;
}

// rfn(s) -> radius >= 0. Samples are denser near the ends (cosine spacing) so the caps are round.
export function setLathe(g, rfn, s0, s1) {
  const { nS, nA } = g.userData;
  const pos = g.attributes.position.array;
  const nor = g.attributes.normal.array;
  const h = (s1 - s0) * 1e-4;
  for (let i = 0; i <= nS; i++) {
    const u = (1 - Math.cos(Math.PI * i / nS)) / 2;
    const s = s0 + (s1 - s0) * u;
    const r = Math.max(0, rfn(s));
    // profile normal: (-r'(s), 1) in the (x, radial) plane
    let dr;
    if (i === 0 && r < 1e-6) dr = Infinity; else if (i === nS && r < 1e-6) dr = -Infinity;
    else {
      const sa = i === 0 ? s : s - h, sb = i === nS ? s : s + h;
      dr = (Math.max(0, rfn(sb)) - Math.max(0, rfn(sa))) / (sb - sa);
    }
    let nx, nr;
    if (dr === Infinity) { nx = -1; nr = 0; } else if (dr === -Infinity) { nx = 1; nr = 0; }
    else { const L = Math.hypot(dr, 1); nx = -dr / L; nr = 1 / L; }
    for (let j = 0; j <= nA; j++) {
      const a = 2 * Math.PI * j / nA;
      const k = 3 * (i * (nA + 1) + j);
      pos[k] = s; pos[k + 1] = r * Math.cos(a); pos[k + 2] = r * Math.sin(a);
      nor[k] = nx; nor[k + 1] = nr * Math.cos(a); nor[k + 2] = nr * Math.sin(a);
    }
  }
  g.attributes.position.needsUpdate = true;
  g.attributes.normal.needsUpdate = true;
  g.computeBoundingSphere();
}

// Torus in the x-z plane (axis = y): major radius R, tube radius a.
export function torusGeometry(R, a, n1, n2) {
  const g = new THREE.TorusGeometry(R, a, n2 || 96, n1 || 192);
  g.rotateX(Math.PI / 2);
  return g;
}

// ---------- curves ----------

// Tube along a polyline. pts: array of [x,y,z]; closed: whether the last point joins the first.
// The tube is rebuilt in place by set(pts) (the point count must not change).
// hidden: "dash" draws hidden parts dashed and faint; "none" hides them.
export function curve(st, pts, opts) {
  // halo: a slightly wider tube in the paper colour drawn under the curve (classic haloed line), so the curve's
  // edges blend with the paper, not with the shaded surface behind it. halo = width factor (0 = none).
  const o = Object.assign({ token: "--obj-wave", radius: 0.025, closed: true, hidden: "dash", dash: 14, hiddenOpacity: 1, sides: 10, halo: 2.0 }, opts || {});
  const n = pts.length;
  const segs = o.closed ? n : n - 1;
  const K = o.sides;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * K * 3);
  const nor = new Float32Array(n * K * 3);
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  const posHalo = new Float32Array(n * K * 3);
  const geoHalo = new THREE.BufferGeometry();
  geoHalo.setAttribute("position", new THREE.BufferAttribute(posHalo, 3));
  const geoHaloH = new THREE.BufferGeometry();
  geoHaloH.setAttribute("position", geoHalo.attributes.position);
  const full = [], dashed = [];
  for (let i = 0; i < segs; i++) {
    const i2 = (i + 1) % n;
    const on = Math.floor(i * o.dash / segs * 2) % 2 === 0;
    for (let j = 0; j < K; j++) {
      const j2 = (j + 1) % K;
      const q = [i * K + j, i * K + j2, i2 * K + j, i2 * K + j, i * K + j2, i2 * K + j2];
      full.push(...q);
      if (on) dashed.push(...q);
    }
  }
  const geoH = new THREE.BufferGeometry();
  geoH.setAttribute("position", geo.attributes.position);
  geoH.setAttribute("normal", geo.attributes.normal);
  geo.setIndex(full);
  geoH.setIndex(dashed);
  geoHalo.setIndex(full);
  geoHaloH.setIndex(full);   // the hidden halo is continuous, so the ends of the dashes meet paper, not the surface
  const color = tokenColor(o.token);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
  const matH = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: o.hiddenOpacity, depthWrite: false, depthFunc: THREE.GreaterDepth });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 2;
  const meshH = new THREE.Mesh(geoH, matH);
  meshH.renderOrder = 1;
  meshH.visible = o.hidden === "dash";
  const paper = tokenColor("--paper");
  const matHalo = new THREE.MeshBasicMaterial({ color: paper, transparent: true, opacity: 1, depthWrite: false });
  const matHaloH = new THREE.MeshBasicMaterial({ color: paper, transparent: true, opacity: 1, depthWrite: false, depthFunc: THREE.GreaterDepth });
  const meshHalo = new THREE.Mesh(geoHalo, matHalo);
  meshHalo.renderOrder = 1.6;
  const meshHaloH = new THREE.Mesh(geoHaloH, matHaloH);
  meshHaloH.renderOrder = 0.6;
  meshHalo.visible = o.halo > 0;
  meshHaloH.visible = o.halo > 0 && o.hidden === "dash";
  const group = new THREE.Group();
  group.add(meshHaloH);
  group.add(meshH);
  group.add(meshHalo);
  group.add(mesh);
  st.scene.add(group);
  const dashIdx = dashed.length, fullIdx = full.length;
  // index position, in the dashed list, where segment i starts
  const dashStart = [];
  { let c = 0; for (let i = 0; i <= segs; i++) { dashStart.push(c); if (i < segs && Math.floor(i * o.dash / segs * 2) % 2 === 0) c += 6 * K; } }
  const T = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(), P = new THREE.Vector3();
  function set(p) {
    let prevN = null;
    for (let i = 0; i < n; i++) {
      const a = p[o.closed ? (i - 1 + n) % n : Math.max(0, i - 1)];
      const b = p[o.closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
      T.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      if (T.lengthSq() < 1e-14) T.set(1, 0, 0);
      T.normalize();
      if (prevN) { N.copy(prevN).addScaledVector(T, -prevN.dot(T)); }
      if (!prevN || N.lengthSq() < 1e-8) {
        N.set(0, 1, 0); if (Math.abs(T.y) > 0.9) N.set(1, 0, 0);
        N.addScaledVector(T, -N.dot(T));
      }
      N.normalize();
      B.crossVectors(T, N);
      prevN = N.clone();
      for (let j = 0; j < K; j++) {
        const ang = 2 * Math.PI * j / K;
        const c = Math.cos(ang), s = Math.sin(ang);
        P.set(N.x * c + B.x * s, N.y * c + B.y * s, N.z * c + B.z * s);
        const k = 3 * (i * K + j);
        pos[k] = p[i][0] + o.radius * P.x; pos[k + 1] = p[i][1] + o.radius * P.y; pos[k + 2] = p[i][2] + o.radius * P.z;
        const hr = o.radius * o.halo;
        posHalo[k] = p[i][0] + hr * P.x; posHalo[k + 1] = p[i][1] + hr * P.y; posHalo[k + 2] = p[i][2] + hr * P.z;
        nor[k] = P.x; nor[k + 1] = P.y; nor[k + 2] = P.z;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.normal.needsUpdate = true;
    geo.computeBoundingSphere();
    geoH.boundingSphere = geo.boundingSphere;
    geoHalo.attributes.position.needsUpdate = true;
    geoHalo.computeBoundingSphere();
    geoHaloH.boundingSphere = geoHalo.boundingSphere;
  }
  set(pts);
  return {
    group, mesh, meshH, material: mat, set,
    // draw-on: fraction f in [0,1] of the curve, from its first point
    setDraw(f) {
      const k = Math.max(0, Math.min(segs, Math.round(f * segs)));
      geo.setDrawRange(0, k * 6 * K);
      geoH.setDrawRange(0, dashStart[k]);
      geoHalo.setDrawRange(0, k * 6 * K);
      geoHaloH.setDrawRange(0, k * 6 * K);
    },
    setOpacity(k) {
      const v = Math.max(0, Math.min(1, k));
      mat.opacity = v;
      matH.opacity = v * o.hiddenOpacity;
      matHalo.opacity = v;
      matHaloH.opacity = v;
      group.visible = v > 0.001;
    },
    setColor(token) { mat.color.copy(tokenColor(token)); matH.color.copy(tokenColor(token)); },
    setRadius(r) { o.radius = r; },
  };
}

// Points of a circle: centre c, unit vectors u, v spanning its plane, radius r, n points.
export function circlePts(c, u, v, r, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = 2 * Math.PI * i / n;
    out.push([c[0] + r * (Math.cos(a) * u[0] + Math.sin(a) * v[0]), c[1] + r * (Math.cos(a) * u[1] + Math.sin(a) * v[1]), c[2] + r * (Math.cos(a) * u[2] + Math.sin(a) * v[2])]);
  }
  return out;
}

// A disc spanning a closed loop: a fan from the loop's centroid (optionally moved by `lift`).
// Rebuilt by set(pts). Drawn translucent in the loop's colour.
export function disc(st, pts, opts) {
  const o = Object.assign({ token: "--obj-wave", opacity: 0.28 }, opts || {});
  const n = pts.length;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array((n + 1) * 3);
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const idx = [];
  for (let i = 0; i < n; i++) idx.push(n, i, (i + 1) % n);
  geo.setIndex(idx);
  const mat = new THREE.MeshBasicMaterial({ color: tokenColor(o.token), transparent: true, opacity: o.opacity, side: THREE.DoubleSide, depthWrite: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 1;
  st.scene.add(mesh);
  function set(p, centre) {
    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < n; i++) { pos[3 * i] = p[i][0]; pos[3 * i + 1] = p[i][1]; pos[3 * i + 2] = p[i][2]; cx += p[i][0]; cy += p[i][1]; cz += p[i][2]; }
    const c = centre || [cx / n, cy / n, cz / n];
    pos[3 * n] = c[0]; pos[3 * n + 1] = c[1]; pos[3 * n + 2] = c[2];
    geo.attributes.position.needsUpdate = true;
    geo.computeBoundingSphere();
  }
  set(pts);
  return {
    mesh, set,
    setOpacity(k) { mat.opacity = Math.max(0, Math.min(1, k)) * o.opacity; mesh.visible = k > 0.001; },
    setStrength(s) { mat.opacity = s; mesh.visible = s > 0.001; },
  };
}
