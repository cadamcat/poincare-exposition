installBeats(window.__BEATS__);

const events = [];
function mark(t, beat, what) {
  events.push({ t: Math.round(t * 1000) / 1000, beat: beat, what: what });
}

// Motions started on narrated words, with their lengths (read by the narration tool).
const D = {
  intro: need("c9b1", "lead", 1.2, "chapter title settles"),
  open: need("c9b1", "open", 0.6, "card: still open"),
  nobody: need("c9b1", "Nobody", 0.6, "the question line"),
  end: need("c9b1", "tail", 7.9, "card held 0.6 s and leaves in 0.8 s; the end card is shown for 6.5 s; the music swells and fades out under it"),
};
const label = chapterLabel({ n: 9, title: "What remains", intro: D.intro });
const strip = mountStrip(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);

const FADE = D.nobody;
const RISE = 12;
const LEAVE = 0.8;
const T = {
  open: cue("c9b1", "open"),
  nobody: cue("c9b1", "Nobody"),
  leave: beatEnd("c9b1") + 0.6,
};
T.endCard = T.leave + LEAVE;

const box = span(3, 6);
const open = ledgerCard({
  status: "context", box: "open-card", x: box.x, y: 330, w: box.w,
  title: "Still open",
  lines: ["smooth Poincaré conjecture in dimension four"],
  tIn: T.open, tOut: T.leave,
});

function mountLine(name, text, y, muted, cls) {
  const b = span(1, 10);
  const el = document.createElement("div");
  el.className = (cls || "t-label") + " stage-abs";
  el.dataset.box = name;
  el.textContent = text;
  el.style.left = b.x + "px";
  el.style.top = y + "px";
  el.style.width = b.w + "px";
  el.style.textAlign = "center";
  el.style.whiteSpace = "nowrap";
  if (muted) el.style.color = "var(--ink-muted)";
  el.style.opacity = "0";
  document.body.appendChild(el);
  return el;
}
const question = mountLine("open-question", "Is every smooth homotopy 4-sphere the standard sphere?", 520, true);

// End card, not spoken: the works the film names, the formalization, the pointer to the article, then
// the one AI note. One line per box (at most twelve words each); the references are one left-aligned
// block centred on the frame (layoutRefs); a wrapped entry hangs by INDENT. The AI sentence is centred.
const REFS = [
  ["ref-1", "H. Poincaré 1904 · S. Smale 1961 · M. Freedman 1982"],
  ["ref-2", "R. Hamilton 1982 · E. Moise 1952"],
  ["ref-3", "G. Perelman 2002, 2003a, 2003b"],
  ["ref-4", "B. Kleiner, J. Lott 2008 · J. Morgan, G. Tian 2007"],
  ["ref-5", "H.-D. Cao, X.-P. Zhu 2006 · T. Colding, W. Minicozzi 2005, 2008"],
  ["ref-6", "Clay Mathematics Institute, press release, 2010"],
  ["ref-7", "Z. Qin, Y. Liao, A. Khaitan, B. Chow 2026, arXiv:2609.33842", 12],
  ["ref-8", "(pages shown under CC BY 4.0)", 0, true, true],
  ["ref-9", "DifferentialGeometry v0.1.3 and its MathDB fork 9f65eaf9", 0],
  ["ref-10", "(Lean source shown under Apache-2.0)", 0, true, true],
  ["ref-11", "mathdb-lean/problems (statement, Apache-2.0) · Mathlib", 0],
  ["ref-full", "Full list with locators: the accompanying article.", 12, true],
];
const INDENT = 32;
const heading = mountLine("end-heading", "References", 96, false, "t-label strong");
const card = [heading];
const block = [{ el: heading, indent: 0 }];
let y = 160;
REFS.forEach(function (r) {
  y += r[2] || 0;
  const el = mountLine(r[0], r[1], y, r[3]);
  card.push(el);
  block.push({ el: el, indent: r[4] ? INDENT : 0 });
  y += 44;
});
block.forEach(function (b) {
  b.el.style.width = "auto";
  b.el.style.textAlign = "left";
});
function layoutRefs() {
  let w = 0;
  block.forEach(function (b) { w = Math.max(w, b.indent + b.el.offsetWidth); });
  const left = Math.round((1920 - w) / 2);
  block.forEach(function (b) { b.el.style.left = left + b.indent + "px"; });
}
card.push(mountLine("end-ai-1", "Prepared by Yao Xu with AI assistance;", 776));
card.push(mountLine("end-ai-2", "the narration voice is synthesized with an OpenAI speech model.", 820));

function paintLine(el, t, tIn, tOut, outDur) {
  const inn = fade(t, tIn, FADE);
  const out = tOut == null ? 0 : fade(t, tOut, outDur);
  const v = inn * (1 - out);
  el.style.opacity = v <= 0 ? "0" : v >= 1 ? "1" : v.toFixed(4);
  if (tOut != null && t >= tOut) {
    el.style.transform = "none";
    return;
  }
  const dy = (1 - inn) * RISE;
  el.style.transform = dy <= 0.01 ? "none" : "translateY(" + dy.toFixed(2) + "px)";
}

mark(T.open, "c9b1", "card: still open, smooth Poincaré in dimension four");
mark(T.nobody, "c9b1", "question line");
mark(T.leave, "c9b1", "card and question leave");
mark(T.endCard, "c9b1", "end card: references and the AI note");

window.sceneEvents = events;
window.sceneDuration = window.__BEATS__.duration;

window.setTime = function (t) {
  open.setTime(t);
  paintLine(question, t, T.nobody, T.leave, LEAVE);
  layoutRefs();
  card.forEach(function (el) {
    paintLine(el, t, T.endCard, null, 0);
  });
  label.setTime(t);
  strip.setTime(t);
  subs.setTime(t);
};
