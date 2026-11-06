/* Proof map. stateAt(t) gives each node "dim", "active", "done" or "hidden", or an object
   {state, status, seal} that also overrides the node's status colour and seal at that time.
   Up to 10 nodes on a grid of at least 4 by 3 (5 columns or more rows when the data asks) inside the given box.
   A node with seal: true carries the small Lean seal. An edge between rows is drawn as an elbow.
   Zoom is an SVG transform of the inner group, so the data-box stays put. */
(function (root) {

  function ns(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }

  function borderPoint(node, tx, ty) {
    const cx = node.x + node.w / 2;
    const cy = node.y + node.h / 2;
    const dx = tx - cx;
    const dy = ty - cy;
    if (dx === 0 && dy === 0) return [cx, cy];
    const sx = Math.abs(dx) > 1e-6 ? (node.w / 2) / Math.abs(dx) : 1e9;
    const sy = Math.abs(dy) > 1e-6 ? (node.h / 2) / Math.abs(dy) : 1e9;
    const s = Math.min(sx, sy);
    return [cx + dx * s, cy + dy * s];
  }

  function proofMap(opts) {
    const parent = opts.parent || document.body;
    const x = opts.x;
    const y = opts.y;
    const w = opts.w;
    const h = opts.h;
    const nodes = opts.nodes || [];
    const edges = opts.edges || [];
    const COLS = Math.max(4, 1 + Math.max.apply(null, nodes.map(function (n) { return n.col; }).concat([0])));
    const ROWS = 1 + Math.max.apply(null, nodes.map(function (n) { return n.row; }).concat([0]));
    const gapX = 24;
    const gapY = ROWS > 1 ? Math.min(80, Math.max(28, (h - ROWS * 96) / (ROWS - 1))) : 0;
    const nodeW = (w - gapX * (COLS - 1)) / COLS;
    const nodeH = Math.min(112, (h - gapY * (ROWS - 1)) / ROWS);

    const placed = nodes.map(function (n) {
      return {
        id: n.id,
        label: n.label,
        status: n.status || "definition",
        seal: !!n.seal,
        row: n.row,
        x: n.col * (nodeW + gapX),
        y: n.row * (nodeH + gapY),
        w: nodeW,
        h: nodeH,
      };
    });
    const byId = {};
    placed.forEach(function (n) { byId[n.id] = n; });

    const host = document.createElement("div");
    host.className = "pmap";
    host.dataset.box = opts.box || "proofmap";
    host.dataset.words = "per-text";
    host.style.left = x + "px";
    host.style.top = y + "px";
    host.style.width = w + "px";
    host.style.height = h + "px";

    const svg = ns("svg");
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);

    const defs = ns("defs");
    function marker(id, token) {
      const m = ns("marker");
      m.setAttribute("id", id);
      m.setAttribute("markerWidth", "10");
      m.setAttribute("markerHeight", "10");
      m.setAttribute("refX", "8");
      m.setAttribute("refY", "5");
      m.setAttribute("orient", "auto");
      const p = ns("path");
      p.setAttribute("d", "M0,0 L10,5 L0,10 Z");
      p.setAttribute("fill", "var(" + token + ")");
      m.appendChild(p);
      defs.appendChild(m);
    }
    marker("zRule", "--rule");
    marker("zInk", "--ink");
    svg.appendChild(defs);

    const world = ns("g");
    const edgeLayer = ns("g");
    const nodeLayer = ns("g");
    world.appendChild(edgeLayer);
    world.appendChild(nodeLayer);
    svg.appendChild(world);
    host.appendChild(svg);
    parent.appendChild(host);

    const edgeEls = edges.map(function (e) {
      const path = ns("path");
      path.setAttribute("class", "edge");
      edgeLayer.appendChild(path);
      return { from: e[0], to: e[1], el: path };
    });

    const nodeEls = {};
    placed.forEach(function (n) {
      const g = ns("g");
      const rect = ns("rect");
      rect.setAttribute("x", String(n.x));
      rect.setAttribute("y", String(n.y));
      rect.setAttribute("width", String(n.w));
      rect.setAttribute("height", String(n.h));
      rect.setAttribute("rx", "6");
      rect.setAttribute("class", "node node-dim st-" + n.status);
      const text = ns("text");
      text.setAttribute("class", "t-label dim");
      text.setAttribute("x", String(n.x + n.w / 2));
      text.setAttribute("y", String(n.y + n.h / 2));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.textContent = n.label;
      g.appendChild(rect);
      g.appendChild(text);
      const s = ns("rect");
      s.setAttribute("x", String(n.x + n.w - 26));
      s.setAttribute("y", String(n.y + 8));
      s.setAttribute("width", "16");
      s.setAttribute("height", "16");
      s.setAttribute("class", "node-seal");
      s.style.display = n.seal ? "inline" : "none";
      g.appendChild(s);
      nodeLayer.appendChild(g);
      nodeEls[n.id] = { g: g, rect: rect, text: text, seal: s, node: n };
    });

    function stateOf(states, id) {
      const v = states[id];
      if (v && typeof v === "object") return v.state || "dim";
      return v || "dim";
    }

    function paint(states) {
      edgeEls.forEach(function (e) {
        const a = byId[e.from];
        const b = byId[e.to];
        if (!a || !b) return;
        const aState = stateOf(states, e.from);
        const bState = stateOf(states, e.to);
        e.el.style.display = aState === "hidden" || bState === "hidden" ? "none" : "inline";
        const on = (aState === "active" || aState === "done") && (bState === "active" || bState === "done");
        if (a.row !== b.row) {
          // Elbow: down from a, across in the gap between the rows, down into b.
          const ax = a.x + a.w / 2, ay = a.y + a.h, bx = b.x + b.w / 2, by = b.y;
          const my = (ay + by) / 2;
          e.el.setAttribute("d", "M" + ax.toFixed(2) + "," + ay.toFixed(2) + " L" + ax.toFixed(2) + "," + my.toFixed(2) +
            " L" + bx.toFixed(2) + "," + my.toFixed(2) + " L" + bx.toFixed(2) + "," + (by - 8).toFixed(2));
          e.el.setAttribute("class", on ? "edge on" : "edge");
          e.el.setAttribute("marker-end", on ? "url(#zInk)" : "url(#zRule)");
          return;
        }
        const p1 = borderPoint(a, b.x + b.w / 2, b.y + b.h / 2);
        const p2 = borderPoint(b, a.x + a.w / 2, a.y + a.h / 2);
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const len = Math.hypot(dx, dy) || 1;
        const trim = 8;
        const x2 = p2[0] - dx / len * trim;
        const y2 = p2[1] - dy / len * trim;
        e.el.setAttribute("d", "M" + p1[0].toFixed(2) + "," + p1[1].toFixed(2) + " L" + x2.toFixed(2) + "," + y2.toFixed(2));
        e.el.setAttribute("class", on ? "edge on" : "edge");
        e.el.setAttribute("marker-end", on ? "url(#zInk)" : "url(#zRule)");
      });
      placed.forEach(function (n) {
        const v = states[n.id];
        const state = stateOf(states, n.id);
        const status = v && typeof v === "object" && v.status ? v.status : n.status;
        const seal = v && typeof v === "object" && v.seal != null ? !!v.seal : n.seal;
        const els = nodeEls[n.id];
        els.g.style.display = state === "hidden" ? "none" : "inline";
        els.rect.setAttribute("class", "node node-" + (state === "hidden" ? "dim" : state) + " st-" + status);
        els.text.setAttribute("class", "t-label " + (state === "dim" ? "dim" : "on"));
        els.seal.style.display = seal && state !== "hidden" ? "inline" : "none";
      });
    }

    function applyZoom(focus) {
      if (!focus || !focus.id || !(focus.k > 0) || !byId[focus.id]) {
        world.setAttribute("transform", "translate(0 0) scale(1)");
        return;
      }
      const n = byId[focus.id];
      const scale = root.lerp(1, 2, focus.k);
      const cx = n.x + n.w / 2;
      const cy = n.y + n.h / 2;
      const tx = root.lerp(0, w / 2 - scale * cx, focus.k);
      const ty = root.lerp(0, h / 2 - scale * cy, focus.k);
      world.setAttribute("transform", "translate(" + tx.toFixed(3) + " " + ty.toFixed(3) + ") scale(" + scale.toFixed(4) + ")");
    }

    function setTime(t) {
      const states = opts.stateAt ? opts.stateAt(t) : {};
      paint(states);
      applyZoom(opts.zoomAt ? opts.zoomAt(t) : null);
    }

    setTime(0);
    return { el: host, setTime: setTime, nodes: placed };
  }

  root.proofMap = proofMap;
})(typeof globalThis !== "undefined" ? globalThis : this);
