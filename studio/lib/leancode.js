/* Lean source in JetBrains Mono. Symbols the face does not cover are KaTeX glyphs. */
(function (root) {
  const KATEX = { throwOnError: false, trust: true, strict: false, displayMode: false, output: "html" };

  const MAP = {
    "ℤ": "\\mathbb{Z}",
    "ℝ": "\\mathbb{R}",
    "ℂ": "\\mathbb{C}",
    "ℕ": "\\mathbb{N}",
    "ℚ": "\\mathbb{Q}",
    "∀": "\\forall",
    "∃": "\\exists",
    "∑": "\\sum",
    "∈": "\\in",
    "∉": "\\notin",
    "≤": "\\le",
    "≥": "\\ge",
    "<": "\\lt",
    ">": "\\gt",
    "≪": "\\ll",
    "≫": "\\gg",
    "→": "\\to",
    "←": "\\leftarrow",
    "⟪": "\\langle\\!\\langle",
    "⟫": "\\rangle\\!\\rangle",
    "ᵐ": "^{m}",
    "∂": "\\partial",
    "⊆": "\\subseteq",
    "⊂": "\\subset",
    "≠": "\\neq",
    "‖": "\\Vert",
    "∞": "\\infty",
    "∧": "\\land",
    "∨": "\\lor",
    "¬": "\\lnot",
    "⊢": "\\vdash",
    "⊨": "\\vDash",
    "⟨": "\\langle",
    "⟩": "\\rangle",
    "×": "\\times",
    "·": "\\cdot",
    "⊕": "\\oplus",
    "⊗": "\\otimes",
    "α": "\\alpha",
    "β": "\\beta",
    "γ": "\\gamma",
    "λ": "\\lambda",
    "ω": "\\omega",
    "Δ": "\\Delta",
    "ℓ": "\\ell",
    "≈": "\\approx",
    "≡": "\\equiv",
    "∼": "\\sim",
    "∩": "\\cap",
    "∪": "\\cup",
    "∅": "\\emptyset",
    "⊤": "\\top",
    "⊥": "\\perp",
    "↦": "\\mapsto",
    "±": "\\pm",
  };

  function texFor(ch) {
    if (MAP[ch]) return MAP[ch];
    return "\\text{" + ch + "}";
  }

  function keepMono(ch) {
    if (MAP[ch]) return false;
    const c = ch.codePointAt(0);
    if (c >= 32 && c <= 126) return true;
    if (c >= 160 && c <= 255) return true;
    return false;
  }

  function renderLeanLine(text) {
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
      const ch = chars[i];
      if (keepMono(ch)) {
        mono += ch;
        continue;
      }
      flush();
      const sym = document.createElement("span");
      sym.className = "lean-sym";
      katex.render(texFor(ch), sym, KATEX);
      line.appendChild(sym);
    }
    flush();
    return line;
  }

  function textLine(text) {
    const line = document.createElement("div");
    line.className = "plain-line t-label";
    line.textContent = text;
    return line;
  }

  function clauseBox(clause, x, y, w, h, plain) {
    const el = document.createElement("div");
    el.className = "clause";
    el.dataset.box = "clause-" + clause.id;
    el.dataset.group = "lean-" + clause.id;
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.width = w + "px";
    el.style.height = h + "px";
    const lines = clause.lines || [clause.text || ""];
    for (let i = 0; i < lines.length; i++) el.appendChild(plain ? textLine(lines[i]) : renderLeanLine(lines[i]));
    if (!plain) el.dataset.words = "skip";
    return el;
  }

  function sideBySide(opts) {
    const parent = opts.parent || document.body;
    const left = opts.left || [];
    const right = opts.right || [];
    const pairs = opts.pairs || [];
    const schedule = opts.schedule || {};
    const x = opts.x;
    const y = opts.y;
    const colW = opts.colW || Math.floor(((opts.w || 1560) - 48) / 2);
    const rowH = opts.rowH || 96;
    const gap = opts.gap || 20;
    const host = document.createElement("div");
    host.style.position = "absolute";
    host.style.left = x + "px";
    host.style.top = y + "px";
    host.style.width = (colW * 2 + 48) + "px";
    const rows = Math.max(left.length, right.length);
    host.style.height = (rows * rowH + Math.max(0, rows - 1) * gap) + "px";

    const byId = {};
    // Left column: plain words in the sans face (a clause may set code: true); right column: Lean code.
    function place(list, ox, plainDefault) {
      for (let i = 0; i < list.length; i++) {
        const plain = list[i].code ? false : plainDefault;
        const el = clauseBox(list[i], ox, i * (rowH + gap), colW, rowH, plain);
        host.appendChild(el);
        byId[list[i].id] = el;
      }
    }
    place(left, 0, true);
    place(right, colW + 48, false);
    parent.appendChild(host);

    function setTime(t) {
      const on = {};
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        const when = schedule[pair[0]];
        if (when == null || t < when) continue;
        for (let k = 0; k < pair.length; k++) on[pair[k]] = true;
      }
      for (const id in byId) {
        byId[id].className = on[id] ? "clause on" : "clause";
      }
    }

    return { el: host, setTime: setTime };
  }

  root.renderLeanLine = renderLeanLine;
  root.sideBySide = sideBySide;
})(typeof globalThis !== "undefined" ? globalThis : this);
