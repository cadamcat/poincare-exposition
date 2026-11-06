/* Chapter 8. Picture is a function of t. On-screen words follow the script.
   Lean lines are slices of window.LEAN_TARGET, LEAN_SUBMISSION and LEAN_AXIOMS. */
installBeats(window.__BEATS__);

const KATEX_OPTS = { throwOnError: false, trust: true, strict: false, displayMode: false, output: "html" };
const PAIR = {
  "\u2243\u2095": "\\simeq_{h}",
  "\u2243\u209c": "\\simeq_{t}",
  "\u{1D54A}\u207F": "\\mathbb{S}^{n}",
};

function mathSym(tex) {
  const sym = document.createElement("span");
  sym.className = "lean-sym";
  katex.render(tex, sym, KATEX_OPTS);
  return sym;
}

function isPlain(ch) {
  if (ch === "<" || ch === ">" || ch === "\u00b7") return false;
  const c = ch.codePointAt(0);
  if (c >= 32 && c <= 126) return true;
  if (c >= 160 && c <= 255) return true;
  return false;
}

function renderSourceLine(text) {
  const line = document.createElement("div");
  line.className = "lean-line t-code";
  const chars = Array.from(text);
  let mono = "";
  function flush() {
    if (!mono) return;
    const span = document.createElement("span");
    span.textContent = mono;
    line.appendChild(span);
    mono = "";
  }
  for (let i = 0; i < chars.length; i++) {
    const two = chars[i] + (i + 1 < chars.length ? chars[i + 1] : "");
    if (PAIR[two]) {
      flush();
      line.appendChild(mathSym(PAIR[two]));
      i += 1;
      continue;
    }
    if (chars[i] === "\u{1D54A}") {
      flush();
      line.appendChild(mathSym("\\mathbb{S}"));
      continue;
    }
    if (isPlain(chars[i])) {
      mono += chars[i];
      continue;
    }
    flush();
    const tmp = renderLeanLine(chars[i]);
    while (tmp.firstChild) line.appendChild(tmp.firstChild);
  }
  flush();
  return line;
}

function svgEl(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}

function labelBox(parent, text, x, y, token) {
  const el = document.createElement("div");
  el.className = "t-label";
  el.style.position = "absolute";
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.style.color = token ? "var(" + token + ")" : "var(--ink)";
  el.style.whiteSpace = "nowrap";
  el.textContent = text;
  parent.appendChild(el);
  return el;
}

const events = [];
function mark(t, beat, what) {
  events.push({ t: Math.round(t * 1000) / 1000, beat: beat, what: what });
}

const OPEN = need("c8b1", "lead", 1.2, "chapter title settles");
const Dfan = need("c8b1", "formalized", 1.1, "paper stack slides in and fans");
const Dzoom = need("c8b1", "Lean", 1.0, "page comes forward and zooms on the title");
const Dkern = need("c8b1", "kernel", 0.5, "label: the kernel checks every step");
need("c8b1", "Qin", 0.4, "author card");
const Dmap = need("c8b2", "The", 0.8, "pages fade, proof map returns");
const Dnodes = need("c8b2", "Ricci", 2.25, "nodes turn lean with the seal, one by one");
const Dseal = need("c8b2", "seal", 0.6, "legend: proved in Lean");
const Dside = need("c8b3", "stated", 0.7, "proof map leaves, statement side by side");
need("c8b3", "every", 0.4, "clause: topology");
need("c8b4", "charts", 0.4, "clause: charts");
need("c8b5", "homotopy", 0.4, "clause: homotopy");
const Dpic = need("c8b5", "composites", 0.7, "picture: maps both ways");
need("c8b6", "homeomorphic", 0.4, "clause: homeomorphic");
const Dcode = need("c8b7", "Compactness", 1.0, "statement slides away, proof scrolls in");
const Dder = need("c8b7", "derives", 0.4, "highlight compactness");
const Dsim = need("c8b7", "simple", 0.4, "highlight simple connectivity");
const Dapp = need("c8b7", "applies", 0.4, "highlight the theorem");
const Dlog = need("c8b8", "axioms", 0.6, "axiom line");
const Dprop = need("c8b8", "propositional", 0.4, "underline propositional extensionality");
const Dchoice = need("c8b8", "choice", 0.4, "underline the axiom of choice");
const Dquot = need("c8b8", "quotients", 0.4, "underline quotients");
need("c8b8", "unfinished", 0.4, "card: no sorry, no added axioms");
const DfadeL = need("c8b9", "What", 0.6, "Lean panels fade");
need("c8b9", "Perelman's", 0.4, "card: Perelman's papers");
need("c8b10", "definitions", 0.4, "card: internal definitions");
const Dind = need("c8b10", "independent", 0.4, "line: no independent review");
const Dlift = need("c8b11", "trust", 0.8, "limit cards leave, title");
const Di1 = need("c8b11", "kernel", 0.4, "trust item: the kernel");
const Di2 = need("c8b11", "words", 0.4, "trust item: the words");
const Di3 = need("c8b11", "Poincaré's", 0.4, "trust item: the question");
const Dlist = need("c8b12", "short", 0.5, "list fades");
need("c8b12", "mathematicians", 0.4, "card: Perelman's proof");
need("c8b12", "formal", 0.4, "card: the formal statement");
const OUT = need("c8b12", "tail", 0.8, "picture fades out");

const C = {
  qin: cue("c8b1", "Qin"),
  formalized: cue("c8b1", "formalized"),
  lean: cue("c8b1", "Lean"),
  kernel: cue("c8b1", "kernel"),
  the: cue("c8b2", "The"),
  ricci: cue("c8b2", "Ricci"),
  seal: cue("c8b2", "seal"),
  stated: cue("c8b3", "stated"),
  every: cue("c8b3", "every"),
  charts: cue("c8b4", "charts"),
  homotopy: cue("c8b5", "homotopy"),
  composites: cue("c8b5", "composites"),
  homeomorphic: cue("c8b6", "homeomorphic"),
  compact: cue("c8b7", "Compactness"),
  derives: cue("c8b7", "derives"),
  simple: cue("c8b7", "simple"),
  applies: cue("c8b7", "applies"),
  axioms: cue("c8b8", "axioms"),
  propositional: cue("c8b8", "propositional"),
  choice: cue("c8b8", "choice"),
  quotients: cue("c8b8", "quotients"),
  unfinished: cue("c8b8", "unfinished"),
  what: cue("c8b9", "What"),
  perelman: cue("c8b9", "Perelman's"),
  definitions: cue("c8b10", "definitions"),
  independent: cue("c8b10", "independent"),
  trust: cue("c8b11", "trust"),
  kernel11: cue("c8b11", "kernel"),
  words: cue("c8b11", "words"),
  question: cue("c8b11", "Poincaré's"),
  short: cue("c8b12", "short"),
  mathematicians: cue("c8b12", "mathematicians"),
  formal: cue("c8b12", "formal"),
  end: beatEnd("c8b12"),
};

const LINE = window.LEAN_TARGET[1];
const PARTS = [
  "\u2200 (M : Type) [TopologicalSpace M] [T2Space M]",
  "[ChartedSpace (\u211d^n) M],",
  "M \u2243\u2095 \u{1D54A}\u207F \u2192",
  "Nonempty (M \u2243\u209c \u{1D54A}\u207F)",
];
if (("  " + PARTS.join(" ")) !== LINE) throw new Error("clause split drifted");

const label = chapterLabel({ n: 8, title: "What Lean checked", intro: OPEN });
const strip = mountStrip(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);

function beatNow(t) {
  const b = beatAt(t);
  return b ? b.id : "";
}

let OUTK = 1;
function vis(el, u) {
  const o = (u < 0 ? 0 : u) * OUTK;
  el.style.opacity = String(o);
  el.style.visibility = o > 0.02 ? "visible" : "hidden";
}

function runCard(card, t, active) {
  card.setTime(active ? t : -1);
  const o = (active ? parseFloat(card.el.style.opacity) : 0) * OUTK;
  card.el.style.opacity = String(o);
  card.el.style.visibility = o > 0.02 ? "visible" : "hidden";
}

// ---------------------------------------------------------------- c8b1 paper
const TITLE = { x0: 0.1454, y0: 0.1401, x1: 0.8546, y1: 0.2339 };
function pad3(n) { return String(n).padStart(3, "0"); }
const paper = paperStack({
  parent: document.body,
  box: "paper",
  x: 120,
  y: 96,
  w: 960,
  h: 680,
  count: 6,
  aspect: 792 / 612,
  thumb: function (n) { return "../paper/thumbs/p" + pad3(n) + ".png"; },
  closeup: { 1: "../paper/p001.svg" },
});
const cardAuthors = ledgerCard({
  parent: document.body,
  box: "authors",
  status: "lean",
  title: "Qin, Liao, Khaitan, Chow 2026",
  lines: ["Lean formalization of the Hamilton\u2013Perelman proof"],
  x: 1120,
  y: 200,
  w: 660,
  tIn: C.qin,
  tOut: C.the,
});
const labKernel = labelBox(document.body, "the kernel checks every step", 1120, 460, "--ink-muted");
labKernel.dataset.box = "kernel-label";
const labPages = labelBox(document.body, "pages: arXiv:2609.33842, CC BY 4.0", 120, 796, "--ink-muted");
labPages.dataset.box = "pages-credit";

// ---------------------------------------------------------------- c8b2 proof map
const ORDER = ["flow", "noncol", "canon", "surg", "ext", "sums", "smooth", "moise", "top"];
const map = proofMap({
  parent: document.body,
  box: "proofmap",
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
    { id: "smooth", label: "Smooth Poincar\u00e9", col: 2, row: 1, status: "proved" },
    { id: "moise", label: "Moise smoothing", col: 3, row: 1, status: "proved" },
    { id: "top", label: "Poincar\u00e9 conjecture", col: 4, row: 1, status: "proved" },
  ],
  edges: [
    ["flow", "noncol"], ["noncol", "canon"], ["canon", "surg"], ["surg", "ext"],
    ["ext", "sums"], ["sums", "smooth"], ["smooth", "moise"], ["moise", "top"],
  ],
  stateAt: function (t) { return mapStates(t); },
});
function mapStates(t) {
  const step = Dnodes / ORDER.length;
  const st = {};
  for (let i = 0; i < ORDER.length; i++) {
    const on = t >= C.ricci + i * step;
    st[ORDER[i]] = { state: "done", status: on ? "lean" : "proved", seal: on };
  }
  return st;
}
// The long node name does not fit the column on one line. Two tspans, same words.
(function splitLongNode() {
  const nodes = map.el.querySelectorAll("text");
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].textContent !== "Canonical neighbourhoods") continue;
    const text = nodes[i];
    const x = text.getAttribute("x");
    text.textContent = "";
    const top = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    top.setAttribute("x", x);
    top.setAttribute("dy", "-0.55em");
    top.textContent = "Canonical";
    const bottom = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    bottom.setAttribute("x", x);
    bottom.setAttribute("dy", "1.2em");
    bottom.textContent = "neighbourhoods";
    text.appendChild(top);
    text.appendChild(bottom);
  }
})();
const legend = document.createElement("div");
legend.className = "t-label";
legend.dataset.box = "seal-legend";
legend.style.position = "absolute";
legend.style.left = "120px";
legend.style.top = "724px";
legend.style.display = "flex";
legend.style.alignItems = "center";
legend.style.color = "var(--ink)";
const legendSeal = document.createElement("div");
legendSeal.className = "ledger-seal";
legendSeal.style.marginRight = "12px";
legend.appendChild(legendSeal);
const legendText = document.createElement("span");
legendText.textContent = "proved in Lean";
legend.appendChild(legendText);
document.body.appendChild(legend);

// ---------------------------------------------------------------- c8b3–c8b6 side by side
const COL_W = (1680 - 48) / 2;
const sideWrap = document.createElement("div");
sideWrap.style.position = "absolute";
sideWrap.style.left = "120px";
sideWrap.style.top = "84px";
sideWrap.style.width = "1680px";
sideWrap.style.transformOrigin = "0 0";
document.body.appendChild(sideWrap);

function clauseRow(y, h, left, right) {
  return sideBySide({
    parent: sideWrap,
    x: 0,
    y: y,
    colW: COL_W,
    rowH: h,
    gap: 0,
    left: [left],
    right: [right],
    pairs: [[left.id, right.id]],
    schedule: {},
  });
}

const rowSpec = [
  { key: "h", y: 0, h: 80, left: { id: "hL", lines: [""] }, right: { id: "hR", lines: [window.LEAN_TARGET[0]] } },
  { key: "p1", y: 88, h: 116, left: { id: "p1L", lines: ["for every space M, with a topology, Hausdorff"] }, right: { id: "p1R", lines: [PARTS[0]] } },
  { key: "p2", y: 212, h: 116, left: { id: "p2L", lines: ["charted on three-dimensional space"] }, right: { id: "p2R", lines: [PARTS[1]] } },
  { key: "p3", y: 336, h: 116, left: { id: "p3L", lines: ["homotopy equivalent to S\u00b3"] }, right: { id: "p3R", lines: [PARTS[2]] } },
  { key: "p4", y: 460, h: 116, left: { id: "p4L", lines: ["then homeomorphic to S\u00b3"] }, right: { id: "p4R", lines: [PARTS[3]] } },
  { key: "f", y: 584, h: 120, left: { id: "fL", lines: [""] }, right: { id: "fR", lines: [window.LEAN_TARGET[3], window.LEAN_TARGET[4]] } },
];
const rows = {};
rowSpec.forEach(function (spec) {
  rows[spec.key] = clauseRow(spec.y, spec.h, spec.left, spec.right);
  const right = rows[spec.key].el.querySelector('[data-box="clause-' + spec.right.id + '"]');
  const old = right.querySelectorAll(".lean-line");
  for (let i = 0; i < old.length; i++) old[i].replaceWith(renderSourceLine(spec.right.lines[i]));
  const clauses = rows[spec.key].el.querySelectorAll(".clause");
  for (let i = 0; i < clauses.length; i++) {
    clauses[i].style.display = "flex";
    clauses[i].style.flexDirection = "column";
    clauses[i].style.justifyContent = "center";
  }
  const lean = right.querySelectorAll(".lean-line");
  for (let i = 0; i < lean.length; i++) lean[i].style.whiteSpace = "pre-wrap";
});

const labStatement = labelBox(document.body, "n = 3: Target := ConjectureFor 3 \u00b7 source: mathdb-lean/problems, Apache-2.0", 120, 804, "--ink-muted");
labStatement.dataset.box = "statement-credit";

const pic = document.createElement("div");
pic.dataset.box = "maps";
pic.dataset.words = "per-text";
pic.style.position = "absolute";
pic.style.left = "1504px";
pic.style.top = "200px";
pic.style.width = "276px";
pic.style.height = "240px";
pic.style.display = "flex";
pic.style.flexDirection = "column";
pic.style.alignItems = "center";
pic.style.justifyContent = "center";
document.body.appendChild(pic);
const picRow = document.createElement("div");
picRow.style.display = "flex";
picRow.style.alignItems = "center";
picRow.style.justifyContent = "space-between";
picRow.style.width = "260px";
pic.appendChild(picRow);
function picName(text) {
  const el = document.createElement("div");
  el.className = "t-label";
  el.style.color = "var(--obj-hopping)";
  el.textContent = text;
  return el;
}
picRow.appendChild(picName("M"));
const arrow = svgEl("svg");
arrow.setAttribute("width", "112");
arrow.setAttribute("height", "44");
arrow.setAttribute("viewBox", "0 0 112 44");
const shaft = svgEl("line");
shaft.setAttribute("x1", "18");
shaft.setAttribute("x2", "94");
shaft.setAttribute("y1", "22");
shaft.setAttribute("y2", "22");
shaft.setAttribute("stroke", "var(--ink)");
shaft.setAttribute("stroke-width", "3");
arrow.appendChild(shaft);
function head(points) {
  const p = svgEl("polygon");
  p.setAttribute("points", points);
  p.setAttribute("fill", "var(--ink)");
  arrow.appendChild(p);
}
head("2,22 20,10 20,34");
head("110,22 92,10 92,34");
picRow.appendChild(arrow);
picRow.appendChild(picName("S\u00b3"));
const picCap = document.createElement("div");
picCap.className = "t-label";
picCap.style.color = "var(--ink)";
picCap.style.marginTop = "18px";
picCap.textContent = "maps both ways";
pic.appendChild(picCap);

// ---------------------------------------------------------------- c8b7 proof panel
const code = document.createElement("div");
code.className = "clause";
code.dataset.box = "submission";
code.dataset.words = "skip";
code.style.left = "120px";
code.style.top = "120px";
code.style.width = "1680px";
code.style.height = "640px";
code.style.overflow = "hidden";
code.style.color = "var(--ink)";
code.style.padding = "20px 28px";
document.body.appendChild(code);
const codeClip = document.createElement("div");
codeClip.style.position = "absolute";
codeClip.style.left = "28px";
codeClip.style.top = "20px";
codeClip.style.right = "28px";
codeClip.style.bottom = "20px";
codeClip.style.overflow = "hidden";
code.appendChild(codeClip);
const codeRoll = document.createElement("div");
codeClip.appendChild(codeRoll);
const HI_TEXT = {
  derives: "compactSpace_of_homotopyEquiv_sphere",
  simple: "h.simplyConnectedSpace",
  applies: "poincare_conjecture M",
};
const hiLine = {};
window.LEAN_SUBMISSION.forEach(function (src) {
  const line = renderSourceLine(src);
  line.style.whiteSpace = "pre-wrap";
  line.style.padding = "4px 8px 4px 14px";
  line.style.background = "var(--paper)";
  line.style.boxShadow = "none";
  codeRoll.appendChild(line);
  Object.keys(HI_TEXT).forEach(function (key) {
    if (src.indexOf(HI_TEXT[key]) >= 0) hiLine[key] = line;
  });
});
if (!hiLine.derives || !hiLine.simple || !hiLine.applies) throw new Error("highlight line missing");
const labSubmission = labelBox(document.body, "Submission.lean \u00b7 differential-geometry-mathdb 9f65eaf9 \u00b7 Apache-2.0", 120, 780, "--ink-muted");
labSubmission.dataset.box = "submission-credit";

// ---------------------------------------------------------------- c8b8 axiom line
const AX_NAMES = ["propext", "Classical.choice", "Quot.sound"];
function buildAxiom(text) {
  const line = document.createElement("div");
  line.className = "lean-line t-code";
  line.style.color = "var(--ink)";
  const marks = {};
  const found = AX_NAMES.map(function (n) { return { n: n, i: text.indexOf(n) }; })
    .filter(function (f) { return f.i >= 0; })
    .sort(function (a, b) { return a.i - b.i; });
  if (found.length !== AX_NAMES.length) throw new Error("axiom names missing");
  let at = 0;
  found.forEach(function (f) {
    if (f.i > at) line.appendChild(document.createTextNode(text.slice(at, f.i)));
    const mark = document.createElement("span");
    mark.textContent = text.slice(f.i, f.i + f.n.length);
    mark.style.borderBottomWidth = "3px";
    mark.style.borderBottomStyle = "solid";
    mark.style.borderBottomColor = "var(--paper)";
    marks[f.n] = mark;
    line.appendChild(mark);
    at = f.i + f.n.length;
  });
  if (at < text.length) line.appendChild(document.createTextNode(text.slice(at)));
  return { line: line, marks: marks };
}
const logPanel = document.createElement("div");
logPanel.className = "clause";
logPanel.dataset.box = "axiom-log";
logPanel.dataset.words = "skip";
logPanel.style.left = "120px";
logPanel.style.top = "220px";
logPanel.style.width = "1680px";
logPanel.style.height = "200px";
logPanel.style.display = "flex";
logPanel.style.alignItems = "center";
logPanel.style.color = "var(--ink)";
logPanel.style.padding = "24px 32px";
document.body.appendChild(logPanel);
const axiom = buildAxiom(window.LEAN_AXIOMS[0]);
logPanel.appendChild(axiom.line);
const cardAxioms = ledgerCard({
  parent: document.body,
  box: "no-sorry",
  status: "lean",
  title: "no sorry, no added axioms",
  lines: [],
  x: 120,
  y: 480,
  w: 760,
  tIn: C.unfinished,
});

// ---------------------------------------------------------------- c8b9–c8b11 limits, then the three trusts
const limitWrap = document.createElement("div");
limitWrap.style.position = "absolute";
limitWrap.style.left = "0";
limitWrap.style.top = "0";
limitWrap.style.width = "1920px";
limitWrap.style.height = "1080px";
document.body.appendChild(limitWrap);
const cardPapers = ledgerCard({
  parent: limitWrap,
  box: "perelman-papers",
  status: "context",
  title: "not checked: the text of Perelman's papers",
  lines: [],
  x: 300,
  y: 340,
  w: 1240,
  tIn: C.perelman,
});
const cardDefs = ledgerCard({
  parent: limitWrap,
  box: "definitions",
  status: "context",
  title: "internal definitions: checked by their authors",
  lines: [],
  x: 300,
  y: 520,
  w: 1240,
  tIn: C.definitions,
});
const labReview = labelBox(limitWrap, "no independent review known to us", 320, 660, "--ink-muted");
labReview.dataset.box = "review-line";

const labTrust = labelBox(document.body, "To trust the result, trust three things", 300, 300);
labTrust.classList.add("strong");
labTrust.dataset.box = "trust-title";
const ITEMS = [
  { el: labelBox(document.body, "1  the Lean kernel and its tools", 320, 420), cue: "kernel11", dur: Di1, box: "trust-1" },
  { el: labelBox(document.body, "2  the statement's words mean what they say", 320, 520), cue: "words", dur: Di2, box: "trust-2" },
  { el: labelBox(document.body, "3  the statement is Poincar\u00e9's question", 320, 620), cue: "question", dur: Di3, box: "trust-3" },
];
ITEMS.forEach(function (item) { item.el.dataset.box = item.box; });

const cardMath = ledgerCard({
  parent: document.body,
  box: "perelman-proof",
  status: "proved",
  title: "Perelman's proof",
  lines: ["accepted: 2006 accounts, Clay Prize 2010"],
  x: 140,
  y: 340,
  w: 780,
  tIn: C.mathematicians,
});
const cardFormal = ledgerCard({
  parent: document.body,
  box: "formal-statement",
  status: "lean",
  title: "MathDB's formal statement",
  lines: ["complete machine-checked proof"],
  x: 980,
  y: 340,
  w: 780,
  tIn: C.formal,
});

function paperK(t) {
  const id = beatNow(t);
  if (id === "c8b1") return t >= C.formalized ? 1 : 0;
  if (id === "c8b2") return 1 - fade(t, C.the, Dmap);
  return 0;
}
function mapK(t) {
  const id = beatNow(t);
  if (id === "c8b2") return fade(t, C.the, Dmap);
  if (id === "c8b3") return 1 - fade(t, C.stated, Dside);
  return 0;
}
function sideK(t) {
  const id = beatNow(t);
  if (id === "c8b3") return fade(t, C.stated, Dside);
  if (id === "c8b4" || id === "c8b5" || id === "c8b6") return 1;
  if (id === "c8b7") return 1 - fade(t, C.compact, Dcode);
  return 0;
}
function shrinkK(t) {
  const id = beatNow(t);
  if (id === "c8b5") return fade(t, C.composites, Dpic);
  if (id === "c8b6" || id === "c8b7") return 1;
  return 0;
}
function codeK(t) {
  const id = beatNow(t);
  if (id === "c8b7") return fade(t, C.compact, Dcode);
  if (id === "c8b8") return 1 - fade(t, C.axioms, Dlog);
  return 0;
}
function logK(t) {
  const id = beatNow(t);
  if (id === "c8b8") return fade(t, C.axioms, Dlog);
  if (id === "c8b9") return 1 - fade(t, C.what, DfadeL);
  return 0;
}
function limitK(t) {
  const id = beatNow(t);
  if (id === "c8b9" || id === "c8b10" || id === "c8b11") return 1;
  // the list stays through "In short" and leaves just before the first summary card
  if (id === "c8b12") return 1 - fade(t, Math.max(C.short, C.mathematicians - Dlist), Dlist);
  return 0;
}
function listK(t) {
  const id = beatNow(t);
  if (id === "c8b11") return 1;
  // the list stays through "In short" and leaves just before the first summary card
  if (id === "c8b12") return 1 - fade(t, Math.max(C.short, C.mathematicians - Dlist), Dlist);
  return 0;
}

function paintPairs(t) {
  const id = beatNow(t);
  const on = { h: false, p1: false, p2: false, p3: false, p4: false, f: false };
  if (id === "c8b3" && t >= C.every) on.p1 = true;
  if (id === "c8b4") on[t >= C.charts ? "p2" : "p1"] = true;
  if (id === "c8b5") on[t >= C.homotopy ? "p3" : "p2"] = true;
  if (id === "c8b6") on[t >= C.homeomorphic ? "p4" : "p3"] = true;
  if (id === "c8b7") on.p4 = true;
  Object.keys(on).forEach(function (key) {
    const clauses = rows[key].el.querySelectorAll(".clause");
    for (let i = 0; i < clauses.length; i++) clauses[i].className = on[key] ? "clause on" : "clause";
  });
}

function paintHi(line, k) {
  if (k <= 0) {
    line.style.background = "var(--paper)";
    line.style.boxShadow = "none";
    return;
  }
  const pct = Math.round(clamp(k, 0, 1) * 9);
  line.style.background = "color-mix(in srgb, var(--status-lean) " + pct + "%, var(--paper-raised))";
  line.style.boxShadow = k >= 1 ? "inset 6px 0 0 var(--status-lean)" : "none";
}
function underline(mark, k) {
  const pct = Math.round(clamp(k, 0, 1) * 100);
  mark.style.borderBottomColor = "color-mix(in srgb, var(--ink) " + pct + "%, var(--paper))";
}

window.sceneEvents = events;
window.sceneDuration = window.__BEATS__.duration;

window.setTime = function (t) {
  OUTK = 1 - fade(t, C.end, OUT);
  const id = beatNow(t);
  label.setTime(t);

  const pk = paperK(t);
  vis(paper.el, pk);
  paper.show({
    enter: fade(t, C.formalized, Dfan * 0.45),
    fan: fade(t, C.formalized, Dfan),
    forward: { page: 1, k: fade(t, C.lean, Dzoom) },
    zoom: { region: TITLE, k: fade(t, C.lean, Dzoom) },
  });
  runCard(cardAuthors, t, id === "c8b1" || id === "c8b2");
  const leavePaper = id === "c8b2" ? 1 - fade(t, C.the, Dmap) : (id === "c8b1" ? 1 : 0);
  vis(labKernel, leavePaper * fade(t, C.kernel, Dkern));
  vis(labPages, (id === "c8b1" ? fade(t, C.formalized, Dfan) : leavePaper));

  const mk = mapK(t);
  vis(map.el, mk);
  map.setTime(t);
  vis(legend, mk * fade(t, C.seal, Dseal));

  const sk = sideK(t);
  const sh = shrinkK(t);
  const leave = id === "c8b7" ? fade(t, C.compact, Dcode) : 0;
  const scale = lerp(1, 0.8, sh);
  sideWrap.style.transform = "translate(" + (-leave * 280).toFixed(1) + "px,0) scale(" + scale.toFixed(4) + ")";
  vis(sideWrap, sk);
  paintPairs(t);
  vis(labStatement, sk);
  vis(pic, sk * sh);

  const ck = codeK(t);
  vis(code, ck);
  const rollH = codeRoll.offsetHeight || 0;
  const scroll = fade(t, C.compact, Dcode);
  codeRoll.style.transform = "translateY(" + ((1 - scroll) * rollH).toFixed(2) + "px)";
  paintHi(hiLine.derives, fade(t, C.derives, Dder));
  paintHi(hiLine.simple, fade(t, C.simple, Dsim));
  paintHi(hiLine.applies, fade(t, C.applies, Dapp));
  vis(labSubmission, ck);

  const lk = logK(t);
  vis(logPanel, lk);
  underline(axiom.marks.propext, fade(t, C.propositional, Dprop));
  underline(axiom.marks["Classical.choice"], fade(t, C.choice, Dchoice));
  underline(axiom.marks["Quot.sound"], fade(t, C.quotients, Dquot));
  runCard(cardAxioms, t, id === "c8b8" && t >= C.unfinished);

  const lim = limitK(t);
  const liftOn = id === "c8b11" || id === "c8b12";
  const lift = liftOn ? fade(t, C.trust, Dlift) : 0;
  // the two limit cards leave when the trust list begins, so the list is not read as them
  vis(limitWrap, lim * (1 - lift));
  limitWrap.style.transform = "none";
  runCard(cardPapers, t, (id === "c8b9" || id === "c8b10" || id === "c8b11" || id === "c8b12") && t >= C.perelman);
  runCard(cardDefs, t, (id === "c8b10" || id === "c8b11" || id === "c8b12") && t >= C.definitions);
  const review = (id === "c8b10" || id === "c8b11" || id === "c8b12") ? fade(t, C.independent, Dind) : 0;
  labReview.style.opacity = String(review);
  labReview.style.visibility = review > 0.02 ? "visible" : "hidden";

  const lkList = listK(t);
  vis(labTrust, lkList * (id === "c8b11" || id === "c8b12" ? fade(t, C.trust, Dlift) : 0));
  ITEMS.forEach(function (item) {
    const u = (id === "c8b11" || id === "c8b12") ? fade(t, C[item.cue], item.dur) : 0;
    vis(item.el, lkList * u);
  });

  runCard(cardMath, t, id === "c8b12" && t >= C.mathematicians);
  runCard(cardFormal, t, id === "c8b12" && t >= C.formal);

  strip.setTime(t);
  subs.setTime(t);
};

mark(C.qin, "c8b1", "author card");
mark(C.formalized, "c8b1", "paper stack enters and fans");
mark(C.lean, "c8b1", "page 1 forward, zoom on the title");
mark(C.kernel, "c8b1", "kernel label");
mark(C.the, "c8b2", "pages fade, proof map returns");
for (let i = 0; i < ORDER.length; i++) {
  mark(C.ricci + i * (Dnodes / ORDER.length), "c8b2", "node " + ORDER[i] + " turns lean");
}
mark(C.seal, "c8b2", "legend proved in Lean");
mark(C.stated, "c8b3", "statement side by side");
mark(C.every, "c8b3", "clause topology");
mark(C.charts, "c8b4", "clause charts");
mark(C.homotopy, "c8b5", "clause homotopy");
mark(C.composites, "c8b5", "maps both ways");
mark(C.homeomorphic, "c8b6", "clause homeomorphic");
mark(C.compact, "c8b7", "proof scrolls in");
mark(C.derives, "c8b7", "highlight compactness");
mark(C.simple, "c8b7", "highlight simple connectivity");
mark(C.applies, "c8b7", "highlight the theorem");
mark(C.axioms, "c8b8", "axiom line");
mark(C.propositional, "c8b8", "underline propext");
mark(C.choice, "c8b8", "underline choice");
mark(C.quotients, "c8b8", "underline quotients");
mark(C.unfinished, "c8b8", "no sorry card");
mark(C.what, "c8b9", "lean panels fade");
mark(C.perelman, "c8b9", "Perelman papers card");
mark(C.definitions, "c8b10", "definitions card");
mark(C.independent, "c8b10", "no independent review");
mark(C.trust, "c8b11", "cards move up, title");
mark(C.kernel11, "c8b11", "trust item kernel");
mark(C.words, "c8b11", "trust item words");
mark(C.question, "c8b11", "trust item question");
mark(C.short, "c8b12", "list fades");
mark(C.mathematicians, "c8b12", "Perelman proof card");
mark(C.formal, "c8b12", "formal statement card");
mark(C.end, "c8b12", "picture fades out");

window.sceneReady = function () {
  const nodes = document.querySelectorAll("image");
  const jobs = [];
  nodes.forEach(function (node) {
    const href = node.getAttribute("href");
    if (!href) return;
    jobs.push(new Promise(function (res) {
      const img = new Image();
      img.onload = function () { res(); };
      img.onerror = function () { res(); };
      img.src = href;
    }));
  });
  return Promise.all(jobs);
};

window.setTime(0);
