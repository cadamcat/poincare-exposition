/* KaTeX build-up. Both states are rendered at load; setTime only changes opacity. */
(function (root) {
  const KATEX = { throwOnError: false, trust: true, strict: false, displayMode: true, output: "html" };

  function tokenName(token) {
    let s = String(token).trim();
    if (s.indexOf("var(") === 0) s = s.slice(4, -1).trim();
    if (s.charAt(0) !== "-") s = "--" + s;
    return s;
  }

  function termName(node) {
    const classes = node.classList ? Array.prototype.slice.call(node.classList) : [];
    for (let i = 0; i < classes.length; i++) {
      if (classes[i].indexOf("term-") === 0) return classes[i].slice(5);
    }
    return "";
  }

  function mountEquation(opts) {
    const parent = opts.parent || document.body;
    const el = document.createElement("div");
    el.className = "equation t-formula";
    el.dataset.box = opts.box || "equation";
    el.style.left = opts.x + "px";
    el.style.top = opts.y + "px";
    el.style.width = opts.w + "px";
    el.style.height = opts.h + "px";
    const layerA = document.createElement("div");
    layerA.className = "eq-layer";
    katex.render(opts.tex, layerA, KATEX);
    el.appendChild(layerA);
    parent.appendChild(el);

    const schedule = opts.schedule || {};
    const colors = {};
    let move = null;

    function paintColors(layer) {
      const nodes = layer.querySelectorAll("[class*='term-']");
      for (let i = 0; i < nodes.length; i++) {
        const name = termName(nodes[i]);
        if (colors[name]) nodes[i].style.color = "var(" + colors[name] + ")";
      }
    }

    function opacities(t) {
      const out = {};
      for (const name in schedule) out[name] = root.fade(t, schedule[name], 0.4);
      return out;
    }

    function apply(layer, which, t) {
      const base = opacities(t);
      const nodes = layer.querySelectorAll("[class*='term-']");
      for (let i = 0; i < nodes.length; i++) {
        const name = termName(nodes[i]);
        let o = base[name] != null ? base[name] : 1;
        if (move) {
          const dur = Math.max(0.001, move.t1 - move.t0);
          const u = root.fade(t, move.t0, dur);
          if (t < move.t0) {
            if (which === "to") o = 0;
          } else if (t >= move.t1) {
            if (which === "from") o = 0;
          } else if (name === move.name) {
            o = which === "from" ? o * (1 - u) : o * u;
          } else if (which === "to") {
            o = 0;
          }
        }
        nodes[i].style.opacity = String(o);
      }
    }

    const api = {
      el: el,
      colorTerm: function (name, token) {
        colors[name] = tokenName(token);
        paintColors(layerA);
        if (move) paintColors(move.layer);
      },
      setTime: function (t) {
        apply(layerA, "from", t);
        if (move) apply(move.layer, "to", t);
      },
      _attachMove: function (spec) {
        move = spec;
        paintColors(spec.layer);
      },
    };
    return api;
  }

  function colorTerm(eq, name, token) {
    eq.colorTerm(name, token);
    return eq;
  }

  function moveTerm(eq, opts) {
    const layer = document.createElement("div");
    layer.className = "eq-layer eq-to";
    katex.render(opts.tex, layer, KATEX);
    eq.el.appendChild(layer);
    const spec = { layer: layer, name: opts.name, t0: opts.t0, t1: opts.t1 };
    eq._attachMove(spec);
    const prev = root.sceneReady;
    root.sceneReady = async function () {
      if (typeof prev === "function") await prev();
      const fromBase = eq.el.querySelector(".eq-layer:not(.eq-to) .base");
      const toBase = layer.querySelector(".base");
      if (fromBase && toBase) {
        const dy = fromBase.getBoundingClientRect().top - toBase.getBoundingClientRect().top;
        layer.style.transform = "translate(0px, " + dy.toFixed(3) + "px)";
      }
    };
    return spec;
  }

  root.mountEquation = mountEquation;
  root.colorTerm = colorTerm;
  root.moveTerm = moveTerm;
})(typeof globalThis !== "undefined" ? globalThis : this);
