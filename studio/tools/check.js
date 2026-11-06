/* Layout, palette and timing checks.
   Palette source rules are built without writing the forbidden spellings,
   so this file can be scanned by the same lint. */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const tokens = require("../lib/tokens");
const { buildCues } = require("../lib/cues");
const { launch, openScene, seek, shot } = require("./browser");

function word(codes) {
  return String.fromCharCode.apply(null, codes);
}

const FONT_SIZE = word([102, 111, 110, 116, 45, 115, 105, 122, 101]);
const FONT_SIZE_JS = word([102, 111, 110, 116, 83, 105, 122, 101]);
const FONT_FAMILY = word([102, 111, 110, 116, 45, 102, 97, 109, 105, 108, 121]);
const FONT_FAMILY_JS = word([102, 111, 110, 116, 70, 97, 109, 105, 108, 121]);
const MATH_RANDOM = word([77, 97, 116, 104, 46, 114, 97, 110, 100, 111, 109]);
const SET_TIMEOUT = word([115, 101, 116, 84, 105, 109, 101, 111, 117, 116]);
const SET_INTERVAL = word([115, 101, 116, 73, 110, 116, 101, 114, 118, 97, 108]);
const RAF = word([114, 101, 113, 117, 101, 115, 116, 65, 110, 105, 109, 97, 116, 105, 111, 110, 70, 114, 97, 109, 101]);
const PERF_NOW = word([112, 101, 114, 102, 111, 114, 109, 97, 110, 99, 101, 46, 110, 111, 119]);
const DATE_WORD = word([68, 97, 116, 101]);
const ANIM = word([97, 110, 105, 109, 97, 116, 105, 111, 110]);
const TRANS = word([116, 114, 97, 110, 115, 105, 116, 105, 111, 110]);
const KEYFRAMES = word([64, 107, 101, 121, 102, 114, 97, 109, 101, 115]);
const RGB = word([114, 103, 98, 40]);
const RGBA = word([114, 103, 98, 97, 40]);
const HSL = word([104, 115, 108, 40]);
const HSLA = word([104, 115, 108, 97, 40]);
const FONT_WORD = word([102, 111, 110, 116]);

const HEX_RE = /#(?:[0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{3})(?![0-9A-Fa-f])/g;
const FONT_SHORTHAND = new RegExp("(^|[^A-Za-z0-9_-])" + FONT_WORD + "\\s*:");

let failed = false;

function report(ok, kind, item, detail) {
  const line = (ok ? "PASS " : "FAIL ") + kind + " " + item + (detail ? " " + detail : "");
  console.log(line);
  if (!ok) failed = true;
}

function hasBare(text, token) {
  const re = new RegExp("(^|[^A-Za-z0-9_-])" + token + "(?![A-Za-z0-9_-])", "i");
  return re.test(text);
}

function studioRootOf(start) {
  let dir = path.resolve(start);
  if (fs.existsSync(dir) && fs.statSync(dir).isFile()) dir = path.dirname(dir);
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, "package.json")) && fs.existsSync(path.join(dir, "lib"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

function relPosix(root, file) {
  return path.relative(root, file).split(path.sep).join("/");
}

const SKIP_DIR = { node_modules: 1, ".venv": 1, out: 1, ".git": 1, smoke: 1 };
const EXEMPT = { "lib/tokens.css": 1, "lib/tokens.js": 1, "lib/fonts.css": 1 };
const SOURCE_EXT = { ".html": 1, ".css": 1, ".js": 1, ".mjs": 1 };

function collectSources(scanRoot, studioRoot) {
  const scanRel = relPosix(studioRoot, scanRoot);
  const files = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (let i = 0; i < entries.length; i++) {
      const ent = entries[i];
      if (SKIP_DIR[ent.name]) continue;
      const abs = path.join(dir, ent.name);
      const rel = relPosix(studioRoot, abs);
      if (rel.startsWith("test/controls") && scanRel.indexOf("test/controls") !== 0) continue;
      if (ent.isDirectory()) walk(abs);
      else if (SOURCE_EXT[path.extname(ent.name)]) files.push(abs);
    }
  }
  const stat = fs.statSync(scanRoot);
  if (stat.isFile()) files.push(path.resolve(scanRoot));
  else walk(scanRoot);
  return files;
}

function lintSources(scanRoot) {
  const studioRoot = studioRootOf(scanRoot);
  const files = collectSources(path.resolve(scanRoot), studioRoot);
  files.forEach(function (file) {
    const rel = relPosix(studioRoot, file);
    if (EXEMPT[rel]) {
      report(true, "palette", rel, "exempt");
      return;
    }
    const text = fs.readFileSync(file, "utf8");
    const problems = [];
    HEX_RE.lastIndex = 0;
    if (HEX_RE.test(text)) problems.push("colour literal");
    if (text.includes(RGB) || text.includes(RGBA) || text.includes(HSL) || text.includes(HSLA)) problems.push("colour function");
    for (let i = 0; i < tokens.NAMED.length; i++) {
      if (hasBare(text, tokens.NAMED[i])) {
        problems.push("named colour " + tokens.NAMED[i]);
        break;
      }
    }
    if (text.includes(FONT_SIZE) || text.includes(FONT_SIZE_JS) || text.includes(FONT_FAMILY) || text.includes(FONT_FAMILY_JS) || FONT_SHORTHAND.test(text)) {
      problems.push("font literal");
    }
    if (text.includes(MATH_RANDOM)) problems.push(MATH_RANDOM);
    if (text.includes(SET_TIMEOUT)) problems.push(SET_TIMEOUT);
    if (text.includes(SET_INTERVAL)) problems.push(SET_INTERVAL);
    if (text.includes(RAF)) problems.push(RAF);
    if (text.includes(PERF_NOW)) problems.push(PERF_NOW);
    if (hasBare(text, DATE_WORD)) problems.push(DATE_WORD);
    if (hasBare(text, ANIM) || hasBare(text, TRANS) || text.includes(KEYFRAMES)) problems.push("motion");
    report(problems.length === 0, "palette", rel, problems.join(", "));
  });
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePNG(buf) {
  if (buf[0] !== 137) throw new Error("not a png");
  let p = 8;
  let width = 0;
  let height = 0;
  let colorType = 6;
  let interlace = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    p += 4;
    const type = buf.toString("ascii", p, p + 4);
    p += 4;
    const data = buf.subarray(p, p + len);
    p += len + 4;
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
  }
  if (interlace) throw new Error("interlaced png");
  const bpp = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const out = new Uint8Array(width * height * 4);
  let s = 0;
  let prev = new Uint8Array(width * bpp);
  for (let y = 0; y < height; y++) {
    const filter = raw[s++];
    const row = raw.subarray(s, s + width * bpp);
    s += width * bpp;
    const cur = new Uint8Array(width * bpp);
    for (let i = 0; i < cur.length; i++) {
      const left = i >= bpp ? cur[i - bpp] : 0;
      const up = prev[i];
      const ul = i >= bpp ? prev[i - bpp] : 0;
      const x = row[i];
      let v = x;
      if (filter === 1) v = x + left;
      else if (filter === 2) v = x + up;
      else if (filter === 3) v = x + ((left + up) >> 1);
      else if (filter === 4) v = x + paeth(left, up, ul);
      cur[i] = v & 255;
    }
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const i = x * bpp;
      out[o] = cur[i];
      out[o + 1] = cur[i + 1];
      out[o + 2] = cur[i + 2];
      out[o + 3] = bpp === 4 ? cur[i + 3] : 255;
    }
    prev = cur;
  }
  return { width: width, height: height, data: out };
}

function lin(c) {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function rgbToLab(r, g, b) {
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);
  let x = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  let y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  let z = R * 0.0193339 + G * 0.119192 + B * 0.9503041;
  x /= 0.95047;
  y /= 1;
  z /= 1.08883;
  const f = function (t) { return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; };
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE(a, b) {
  const kL = 1;
  const kC = 1;
  const kH = 1;
  const C1 = Math.hypot(a[1], a[2]);
  const C2 = Math.hypot(b[1], b[2]);
  const Cbar = (C1 + C2) / 2;
  const C7 = Math.pow(Cbar, 7);
  const G = 0.5 * (1 - Math.sqrt(C7 / (C7 + Math.pow(25, 7))));
  const a1 = (1 + G) * a[1];
  const a2 = (1 + G) * b[1];
  const C1p = Math.hypot(a1, a[2]);
  const C2p = Math.hypot(a2, b[2]);
  const hue = function (aa, bb) {
    if (aa === 0 && bb === 0) return 0;
    let h = Math.atan2(bb, aa) * 180 / Math.PI;
    if (h < 0) h += 360;
    return h;
  };
  const h1 = hue(a1, a[2]);
  const h2 = hue(a2, b[2]);
  const dL = b[0] - a[0];
  const dC = C2p - C1p;
  let dh = h2 - h1;
  if (C1p * C2p === 0) dh = 0;
  else if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh * Math.PI / 180) / 2);
  const Lp = (a[0] + b[0]) / 2;
  const Cp = (C1p + C2p) / 2;
  let Hp = (h1 + h2) / 2;
  if (C1p * C2p !== 0 && Math.abs(h1 - h2) > 180) {
    Hp = h1 + h2 < 360 ? (h1 + h2 + 360) / 2 : (h1 + h2 - 360) / 2;
  }
  const rad = Math.PI / 180;
  const T = 1 - 0.17 * Math.cos((Hp - 30) * rad) + 0.24 * Math.cos(2 * Hp * rad) + 0.32 * Math.cos((3 * Hp + 6) * rad) - 0.2 * Math.cos((4 * Hp - 63) * rad);
  const dRo = 30 * Math.exp(-Math.pow((Hp - 275) / 25, 2));
  const Rc = 2 * Math.sqrt(Math.pow(Cp, 7) / (Math.pow(Cp, 7) + Math.pow(25, 7)));
  const Sl = 1 + (0.015 * Math.pow(Lp - 50, 2)) / Math.sqrt(20 + Math.pow(Lp - 50, 2));
  const Sc = 1 + 0.045 * Cp;
  const Sh = 1 + 0.015 * Cp * T;
  const Rt = -Math.sin(2 * dRo * rad) * Rc;
  return Math.sqrt(
    Math.pow(dL / (kL * Sl), 2) +
    Math.pow(dC / (kC * Sc), 2) +
    Math.pow(dH / (kH * Sh), 2) +
    Rt * (dC / (kC * Sc)) * (dH / (kH * Sh))
  );
}

function tokenRGBs() {
  return Object.keys(tokens.color).map(function (key) {
    const hex = tokens.color[key];
    const n = parseInt(hex.slice(1), 16);
    return { name: key, hex: hex, rgb: [(n >> 16) & 255, (n >> 8) & 255, n & 255] };
  });
}

function buildPalette() {
  const list = tokenRGBs();
  const labs = list.map(function (item) { return rgbToLab(item.rgb[0], item.rgb[1], item.rgb[2]); });
  const cache = new Map();
  function nearest(r, g, b) {
    for (let i = 0; i < list.length; i++) {
      const t = list[i].rgb;
      if (Math.abs(r - t[0]) <= 2 && Math.abs(g - t[1]) <= 2 && Math.abs(b - t[2]) <= 2) return 0;
    }
    const lab = rgbToLab(r, g, b);
    let best = 1e9;
    for (let i = 0; i < labs.length; i++) {
      const de = deltaE(lab, labs[i]);
      if (de < best) best = de;
      if (best <= 8) return best;
    }
    for (let i = 0; i < list.length; i++) {
      for (let j = i; j < list.length; j++) {
        const A = list[i].rgb;
        const B = list[j].rgb;
        const dx = B[0] - A[0];
        const dy = B[1] - A[1];
        const dz = B[2] - A[2];
        const denom = dx * dx + dy * dy + dz * dz;
        let t = 0;
        if (denom > 0) {
          t = ((r - A[0]) * dx + (g - A[1]) * dy + (b - A[2]) * dz) / denom;
          if (t < 0) t = 0;
          else if (t > 1) t = 1;
        }
        const mr = A[0] + t * dx;
        const mg = A[1] + t * dy;
        const mb = A[2] + t * dz;
        const err = (r - mr) * (r - mr) + (g - mg) * (g - mg) + (b - mb) * (b - mb);
        if (err > 2500) continue;
        best = Math.min(best, deltaE(lab, rgbToLab(mr, mg, mb)));
        if (best <= 8) return best;
      }
    }
    return best;
  }
  return function (r, g, b) {
    const key = (r << 16) | (g << 8) | b;
    if (cache.has(key)) return cache.get(key);
    const de = nearest(r, g, b);
    cache.set(key, de);
    return de;
  };
}

function hexOf(r, g, b) {
  const h = function (n) { return n.toString(16).padStart(2, "0"); };
  return "#" + h(r) + h(g) + h(b);
}

function samplePixels(png, step) {
  const bad = [];
  const distance = buildPalette();
  const { width, height, data } = png;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const o = (y * width + x) * 4;
      if (data[o + 3] < 250) continue;
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      const de = distance(r, g, b);
      if (de > 8) {
        bad.push({ x: x, y: y, hex: hexOf(r, g, b), de: de });
        if (bad.length >= 8) return bad;
      }
    }
  }
  return bad;
}

async function measure(page) {
  return page.evaluate(function () {
    const sizeProp = ["font", "size"].join("-");
    function shown(el) {
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
        const s = getComputedStyle(e);
        if (s.display === "none" || s.visibility === "hidden") return false;
        if (parseFloat(s.opacity) < 0.02) return false;
      }
      const r = el.getBoundingClientRect();
      return r.width >= 1 && r.height >= 1;
    }
    function bandOf(el) {
      return el.dataset.band || "";
    }
    const boxes = [];
    const nodes = document.querySelectorAll("[data-box]");
    nodes.forEach(function (el) {
      if (!shown(el)) return;
      const r = el.getBoundingClientRect();
      // data-words="skip": code, not prose; data-words="per-text": a diagram whose labels are counted one by one.
      let text = "";
      let maxPiece = 0;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        const p = n.parentElement;
        if (!p || !shown(p)) continue;
        const owner = p.closest("[data-box]");
        if (owner && owner !== el) continue;
        text += " " + n.nodeValue;
        maxPiece = Math.max(maxPiece, n.nodeValue.trim().split(/\s+/).filter(Boolean).length);
      }
      let words = text.trim().split(/\s+/).filter(Boolean);
      if (el.dataset.words === "skip") words = [];
      else if (el.dataset.words === "per-text") words = words.slice(0, maxPiece);
      boxes.push({
        name: el.dataset.box || el.id || el.className || "box",
        band: bandOf(el),
        group: el.dataset.group || "",
        left: r.left,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
        words: words.length,
        sample: words.slice(0, 8).join(" "),
        overflow: el.scrollWidth > el.clientWidth + 1,
      });
    });
    const sizes = {};
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue || !node.nodeValue.trim()) continue;
      const el = node.parentElement;
      if (!el || !shown(el)) continue;
      const bandHost = el.closest("[data-band]");
      if (bandHost) continue;
      if (el.closest(".katex")) continue;
      sizes[getComputedStyle(el).getPropertyValue(sizeProp)] = 1;
    }
    document.querySelectorAll(".katex").forEach(function (el) {
      if (!shown(el)) return;
      if (el.closest("[data-band]")) return;
      if (el.closest(".lean-sym")) return;
      const host = el.closest(".t-formula") || el.parentElement;
      sizes[getComputedStyle(host).getPropertyValue(sizeProp)] = 1;
    });
    let subtitle = "";
    const sub = document.querySelector("[data-band='subtitle']");
    if (sub && shown(sub)) subtitle = sub.innerText || "";
    return { boxes: boxes, sizes: Object.keys(sizes), subtitle: subtitle };
  });
}

function overlapArea(a, b) {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  if (w <= 2 || h <= 2) return 0;
  return w * h;
}

function inside(box, band) {
  const eps = 1.5;
  return box.left >= band.x0 - eps && box.right <= band.x1 + eps && box.top >= band.y0 - eps && box.bottom <= band.y1 + eps;
}

function checkFrame(sample, label) {
  sample.boxes.forEach(function (box) {
    const band = tokens.bands[box.band] || tokens.bands.content;
    const where = box.band || "content";
    report(inside(box, band), "layout", "bounds " + label + " " + box.name, where + " " + Math.round(box.left) + "," + Math.round(box.top));
    if (box.band === "subtitle" || box.band === "strip") return;
    report(box.words <= 12, "layout", "words " + label + " " + box.name, String(box.words) + " " + box.sample);
    report(!box.overflow, "layout", "overflow " + label + " " + box.name, "");
  });
  for (let i = 0; i < sample.boxes.length; i++) {
    for (let j = i + 1; j < sample.boxes.length; j++) {
      const a = sample.boxes[i];
      const b = sample.boxes[j];
      if (a.group && a.group === b.group) continue;
      if (overlapArea(a, b) <= 0) continue;
      report(false, "layout", "overlap " + label, a.name + " x " + b.name);
    }
  }
  const sizeOk = sample.sizes.length <= 2;
  report(sizeOk, "layout", "sizes " + label, sample.sizes.join(" "));
}

function normWord(w) {
  return String(w).toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
}

// The burned-in subtitle must be exactly the cue that is active at t (the same cues as the SRT file),
// and empty when no cue is active: no phrase before its first word is spoken, none after its end.
const cueCache = new WeakMap();
function checkSubtitles(beats, text, t, label) {
  if (!cueCache.has(beats)) cueCache.set(beats, buildCues(beats));
  const cues = cueCache.get(beats);
  let expected = "";
  for (let i = 0; i < cues.length; i++) {
    if (t + 1e-4 >= cues[i].start && t < cues[i].end) { expected = cues[i].lines.join(" "); break; }
  }
  const norm = function (x) { return String(x || "").replace(/\s+/g, " ").trim(); };
  const ok = norm(text) === norm(expected);
  report(ok, "timing", "subtitle " + label, ok ? "" : JSON.stringify(norm(text)) + " != " + JSON.stringify(norm(expected)));
}

function spanEndOf(list, i) {
  const b = list[i];
  return b.holdEnd != null ? b.holdEnd : (i + 1 < list.length ? list[i + 1].start : b.end);
}

function checkTimingData(beats, sceneDuration, events) {
  const list = beats.beats || [];
  const last = list[list.length - 1];
  let speechEnd = 0;
  list.forEach(function (beat, i) {
    const words = beat.words || [];
    const wordEnd = words.length ? words[words.length - 1].end : beat.start;
    if (wordEnd > speechEnd) speechEnd = wordEnd;
    const need = beat.hold === "short" ? 0 : 3;
    const hold = spanEndOf(list, i) - wordEnd;
    report(hold + 1e-3 >= need, "timing", "hold " + beat.id, hold.toFixed(3) + "s");
  });
  const finalHold = last && last.hold === "short" ? 0 : 3;
  report(sceneDuration + 1e-2 >= speechEnd + finalHold, "timing", "duration", String(sceneDuration) + " >= " + (speechEnd + finalHold).toFixed(3));
  if (last) report(sceneDuration + 1e-2 >= spanEndOf(list, list.length - 1), "timing", "covers beats", String(sceneDuration));
  if (!Array.isArray(events)) {
    report(false, "timing", "events", "missing");
    return;
  }
  events.forEach(function (ev) {
    const bi = list.findIndex(function (b) { return b.id === ev.beat; });
    const beat = list[bi];
    const insideBeat = !!beat && ev.t >= beat.start - 1e-3 && ev.t <= spanEndOf(list, bi) + 1e-3;
    report(insideBeat, "timing", "event " + (ev.what || ""), (ev.beat || "?") + " t=" + ev.t);
  });
}

function familyAllowed(name) {
  const n = String(name || "").replace(/"/g, "");
  if (n.indexOf("Source Sans 3") >= 0) return true;
  if (n.indexOf("JetBrains Mono") >= 0) return true;
  if (n.indexOf("KaTeX") >= 0) return true;
  return false;
}

async function glyphCheck(page, label) {
  await page.screenshot(Object.assign({ path: "/dev/null" }, shot)).catch(function () {
    return page.screenshot(shot);
  });
  const client = await page.context().newCDPSession(page);
  await client.send("DOM.enable");
  await client.send("CSS.enable");
  const doc = await client.send("DOM.getDocument", { depth: 0 });
  const found = await client.send("DOM.querySelector", { nodeId: doc.root.nodeId, selector: "body" });
  const used = await client.send("CSS.getPlatformFontsForNode", { nodeId: found.nodeId });
  const bad = [];
  (used.fonts || []).forEach(function (font) {
    if (!font.glyphCount) return;
    if (!familyAllowed(font.familyName)) bad.push(font.familyName + ":" + font.glyphCount);
  });
  const faces = await page.evaluate(function () {
    const out = [];
    document.fonts.forEach(function (face) { out.push(face.family + "|" + face.status); });
    return out;
  });
  faces.forEach(function (row) {
    const bits = row.split("|");
    if (bits[1] === "loaded" && !familyAllowed(bits[0])) bad.push(bits[0]);
  });
  report(bad.length === 0, "timing", "glyph " + label, bad.join(", "));
  await client.detach().catch(function () {});
}

async function runScene(scenePath, beatsPath, flags) {
  const beats = JSON.parse(fs.readFileSync(beatsPath, "utf8"));
  const sceneDir = fs.statSync(scenePath).isDirectory() ? scenePath : path.dirname(scenePath);
  if (flags.palette) lintSources(sceneDir);
  if (!flags.layout && !flags.timing && !flags.pixels) return;

  const list = beats.beats || [];
  const times = [];
  list.forEach(function (beat, i) {
    const mid = (beat.start + beat.end) / 2;
    times.push({ t: beat.start, label: beat.id + " start" });
    times.push({ t: mid, label: beat.id + " mid" });
    times.push({ t: Math.max(beat.start, beat.end - 0.02), label: beat.id + " end" });
    const se = spanEndOf(list, i);
    if (se - beat.end > 0.1) times.push({ t: se - 0.02, label: beat.id + " hold" });
  });

  const browser = await launch();
  try {
    const page = await openScene(browser, scenePath, beats);
    const sceneDuration = await page.evaluate(function () { return window.sceneDuration; });
    const events = await page.evaluate(function () { return window.sceneEvents; });
    if (flags.timing) checkTimingData(beats, Number(sceneDuration), events);

    for (let i = 0; i < times.length; i++) {
      await seek(page, times[i].t);
      const sample = await measure(page);
      if (flags.layout) checkFrame(sample, times[i].label);
      if (flags.timing) checkSubtitles(beats, sample.subtitle, times[i].t, times[i].label);
      if (flags.pixels) {
        const buf = await page.screenshot(shot);
        const png = decodePNG(buf);
        const bad = samplePixels(png, 2);
        if (bad.length) {
          const detail = bad.slice(0, 4).map(function (p) {
            return p.hex + "@" + p.x + "," + p.y + " dE" + p.de.toFixed(1);
          }).join(" ");
          report(false, "palette", "pixels " + times[i].label, detail);
        } else {
          report(true, "palette", "pixels " + times[i].label, "");
        }
      }
    }

    if (flags.timing) {
      const extra = [];
      list.forEach(function (beat) {
        (beat.words || []).forEach(function (w) {
          if (w.start > 0.05) extra.push({ t: Math.max(0, w.start - 0.05), label: beat.id + " before " + w.word });
        });
      });
      for (let i = 0; i < extra.length; i++) {
        await seek(page, extra[i].t);
        const sample = await measure(page);
        checkSubtitles(beats, sample.subtitle, extra[i].t, extra[i].label);
      }
      await seek(page, times.length ? times[Math.floor(times.length / 2)].t : 0);
      await glyphCheck(page, "body");
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  const cmd = process.argv[2];
  const target = process.argv[3];
  const beatsPath = process.argv[4];
  if (!cmd || !target) {
    console.error("usage: node tools/check.js <layout|palette|timing|all> <scene.html|dir> [beats.json]");
    process.exit(2);
  }
  const flags = {
    layout: cmd === "layout" || cmd === "all",
    palette: cmd === "palette" || cmd === "all",
    timing: cmd === "timing" || cmd === "all",
    pixels: cmd === "palette" || cmd === "all",
  };
  if (cmd === "palette" && !beatsPath) {
    lintSources(target);
  } else if (cmd === "palette") {
    await runScene(target, beatsPath, { layout: false, palette: true, timing: false, pixels: true });
  } else {
    if (!beatsPath) {
      console.error("beats.json required");
      process.exit(2);
    }
    await runScene(target, beatsPath, flags);
  }
  if (failed) process.exit(1);
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
