installBeats(window.__BEATS__);

const events = [];
function mark(t, beat, what) {
  events.push({ t: Math.round(t * 1000) / 1000, beat: beat, what: what });
}

// Motions started on narrated words, with their lengths (read by the narration tool).
const D = {
  intro: need("c7b1", "lead", 1.2, "chapter title settles"),
  journal: need("c7b1", "journal", 0.4, "card: preprints, not submitted to a journal"),
  kleiner: need("c7b1", "Kleiner", 0.4, "card: Kleiner, Lott"),
  morgan: need("c7b1", "Morgan", 0.4, "card: Morgan, Tian"),
  cao: need("c7b1", "Cao", 0.4, "card: Cao, Zhu"),
  accepted: need("c7b2", "accepted", 0.8, "account cards move up; verdict card enters"),
  clay: need("c7b2", "Clay", 0.6, "line: Clay Millennium Prize"),
  scrutiny: need("c7b2", "scrutiny", 0.6, "line: basis of the verdict"),
  judgement: need("c7b3", "judgement", 0.6, "label: a human judgement"),
  machine: need("c7b3", "machine", 0.8, "cards dim; the next line appears"),
  out: need("c7b3", "tail", 0.8, "picture fades out"),
};
const label = chapterLabel({ n: 7, title: "The verdict", intro: D.intro });
const strip = mountStrip(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);

const T = {
  journal: cue("c7b1", "journal"),
  kleiner: cue("c7b1", "Kleiner"),
  morgan: cue("c7b1", "Morgan"),
  cao: cue("c7b1", "Cao"),
  accepted: cue("c7b2", "accepted"),
  clay: cue("c7b2", "Clay"),
  scrutiny: cue("c7b2", "scrutiny"),
  judgement: cue("c7b3", "judgement"),
  machine: cue("c7b3", "machine"),
  out: beatEnd("c7b3"),
};

// A group whose opacity and vertical offset the scene sets; children are placed inside it.
function group(name) {
  const g = document.createElement("div");
  g.className = "stage-abs";
  g.style.left = "0px";
  g.style.top = "0px";
  g.style.width = "1920px";
  g.style.height = "1080px";
  document.body.appendChild(g);
  return g;
}

const prepr = group("preprints");
const w4 = span(2, 8);
const preCard = ledgerCard({
  parent: prepr, status: "context", box: "card-preprints", x: w4.x, y: 150, w: w4.w,
  title: "Perelman's preprints, 2002–2003",
  lines: ["not submitted to a journal"],
  tIn: T.journal,
});

const accounts = group("accounts");
const A = [
  ["card-kl", 0, "Kleiner, Lott", "Notes on Perelman's papers · 2006", T.kleiner],
  ["card-mt", 4, "Morgan, Tian", "Ricci Flow and the Poincaré Conjecture · 2006", T.morgan],
  ["card-cz", 8, "Cao, Zhu", "A complete proof… · 2006", T.cao],
];
const accountCards = A.map(function (a) {
  const b = span(a[1], 4);
  return ledgerCard({
    parent: accounts, status: "proved", box: a[0], x: b.x, y: 420, w: b.w,
    title: a[2], lines: [a[3]], tIn: a[4],
  });
});

const verdictBox = span(2, 8);
const verdict = group("verdict");
const vCard = ledgerCard({
  parent: verdict, status: "proved", box: "card-verdict", x: verdictBox.x, y: 470, w: verdictBox.w,
  title: "Accepted",
  lines: ["Clay Millennium Prize, 2010", "basis: these accounts and years of scrutiny"],
  tIn: T.accepted + D.accepted * 0.5,
});
// The two detail lines arrive on their own words: a cover over each line fades away at its cue.
const vLines = vCard.el.querySelectorAll(".ledger-line");

function mountText(name, text, x, y, w, cls, muted) {
  const el = document.createElement("div");
  el.className = (cls || "t-label") + " stage-abs";
  el.dataset.box = name;
  el.textContent = text;
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.style.width = w + "px";
  el.style.textAlign = "center";
  if (muted) el.style.color = "var(--ink-muted)";
  el.style.opacity = "0";
  document.body.appendChild(el);
  return el;
}
const human = mountText("label-human", "a human judgement", verdictBox.x, 700, verdictBox.w, "t-label", true);
const next = mountText("label-next", "next: a machine check of a formal proof", verdictBox.x, 790, verdictBox.w, "t-label");

function set(el, o, dy) {
  el.style.opacity = o <= 0 ? "0" : o >= 1 ? "1" : o.toFixed(4);
  el.style.transform = dy && Math.abs(dy) > 0.01 ? "translateY(" + dy.toFixed(2) + "px)" : "none";
}

mark(T.journal, "c7b1", "card: preprints not submitted to a journal");
mark(T.kleiner, "c7b1", "card: Kleiner, Lott");
mark(T.morgan, "c7b1", "card: Morgan, Tian");
mark(T.cao, "c7b1", "card: Cao, Zhu");
mark(T.accepted, "c7b2", "account cards move up; verdict card");
mark(T.clay, "c7b2", "line: Clay Millennium Prize, 2010");
mark(T.scrutiny, "c7b2", "line: basis");
mark(T.judgement, "c7b3", "label: a human judgement");
mark(T.machine, "c7b3", "cards dim; next: a machine check");
mark(T.out, "c7b3", "picture fades out");

window.sceneEvents = events;
window.sceneDuration = window.__BEATS__.duration;

window.setTime = function (t) {
  const out = 1 - fade(t, T.out, D.out);
  const up = ease(clamp((t - T.accepted) / D.accepted, 0, 1));
  const dim = 1 - 0.6 * ease(clamp((t - T.machine) / D.machine, 0, 1));
  preCard.setTime(t);
  accountCards.forEach(function (c) { c.setTime(t); });
  vCard.setTime(t);
  // the preprint card leaves upward, the account cards move into its place
  set(prepr, (1 - up) * out, -40 * up);
  set(accounts, dim * out, -270 * up);
  set(verdict, dim * out, 0);
  vLines[0].style.opacity = String(fade(t, T.clay, D.clay));
  vLines[1].style.opacity = String(fade(t, T.scrutiny, D.scrutiny));
  set(human, fade(t, T.judgement, D.judgement) * dim * out, 0);
  set(next, fade(t, T.machine, D.machine) * out, 0);
  label.setTime(t);
  strip.setTime(t);
  subs.setTime(t);
};
