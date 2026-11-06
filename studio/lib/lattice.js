/* Square lattice, the stand-in picture for Z^d. Site values come from mulberry32. */
(function (root) {
  function ns(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }

  function latticeSize(opts) {
    const n = opts.n || 6;
    const spacing = opts.spacing || 46;
    const bar = 26;
    const pad = 18 + bar;
    const w = (n - 1) * spacing + pad * 2;
    const h = (n - 1) * spacing + pad * 2;
    return { n: n, spacing: spacing, bar: bar, pad: pad, w: w, h: h };
  }

  function lattice(opts) {
    const parent = opts.parent || document.body;
    const geom = latticeSize(opts);
    const origin = opts.origin || { x: 0, y: 0 };
    const marks = opts.marks || {};
    const rng = root.mulberry32(opts.seed >>> 0);
    const values = [];
    for (let k = 0; k < geom.n * geom.n; k++) values.push(rng());

    const host = document.createElement("div");
    host.className = "lattice";
    host.dataset.box = opts.box || "lattice";
    host.style.left = opts.x + "px";
    host.style.top = opts.y + "px";
    host.style.width = geom.w + "px";
    host.style.height = geom.h + "px";

    const svg = ns("svg");
    svg.setAttribute("width", String(geom.w));
    svg.setAttribute("height", String(geom.h));
    svg.setAttribute("viewBox", "0 0 " + geom.w + " " + geom.h);

    function px(i) { return geom.pad + i * geom.spacing; }

    for (let j = 0; j < geom.n; j++) {
      for (let i = 0; i < geom.n; i++) {
        if (i + 1 < geom.n) {
          const line = ns("line");
          line.setAttribute("x1", String(px(i)));
          line.setAttribute("y1", String(px(j)));
          line.setAttribute("x2", String(px(i + 1)));
          line.setAttribute("y2", String(px(j)));
          line.setAttribute("stroke", "var(--obj-hopping)");
          line.setAttribute("stroke-width", "2");
          svg.appendChild(line);
        }
        if (j + 1 < geom.n) {
          const line = ns("line");
          line.setAttribute("x1", String(px(i)));
          line.setAttribute("y1", String(px(j)));
          line.setAttribute("x2", String(px(i)));
          line.setAttribute("y2", String(px(j + 1)));
          line.setAttribute("stroke", "var(--obj-hopping)");
          line.setAttribute("stroke-width", "2");
          svg.appendChild(line);
        }
      }
    }

    const bars = [];
    const waves = [];
    const sites = [];
    for (let j = 0; j < geom.n; j++) {
      for (let i = 0; i < geom.n; i++) {
        const v = values[j * geom.n + i];
        const bar = ns("rect");
        const bh = 4 + v * geom.bar;
        bar.setAttribute("x", String(px(i) - 2));
        bar.setAttribute("y", String(px(j) - bh));
        bar.setAttribute("width", "4");
        bar.setAttribute("height", String(bh));
        bar.setAttribute("fill", "var(--obj-potential)");
        svg.appendChild(bar);
        bars.push(bar);

        const wave = ns("circle");
        wave.setAttribute("cx", String(px(i)));
        wave.setAttribute("cy", String(px(j)));
        wave.setAttribute("r", "0");
        wave.setAttribute("fill", "var(--obj-wave)");
        svg.appendChild(wave);
        waves.push(wave);

        const lx = origin.x + i;
        const ly = origin.y + j;
        const kind = marks[lx + "," + ly] || marks[i + "," + j] || "plain";
        const g = ns("g");
        g.setAttribute("class", "site " + kind);
        if (kind === "terminal") {
          const dot = ns("circle");
          dot.setAttribute("cx", String(px(i)));
          dot.setAttribute("cy", String(px(j)));
          dot.setAttribute("r", "6");
          dot.setAttribute("fill", "var(--ink)");
          g.appendChild(dot);
        } else {
          const dot = ns("circle");
          dot.setAttribute("cx", String(px(i)));
          dot.setAttribute("cy", String(px(j)));
          dot.setAttribute("r", "5");
          dot.setAttribute("fill", "var(--paper)");
          dot.setAttribute("stroke", "var(--ink)");
          dot.setAttribute("stroke-width", "2");
          g.appendChild(dot);
        }
        if (kind === "active") {
          const ring = ns("circle");
          ring.setAttribute("cx", String(px(i)));
          ring.setAttribute("cy", String(px(j)));
          ring.setAttribute("r", "11");
          ring.setAttribute("fill", "none");
          ring.setAttribute("stroke", "var(--obj-damping)");
          ring.setAttribute("stroke-width", "2");
          g.appendChild(ring);
        }
        if (kind === "pending") {
          const a = ns("line");
          const b = ns("line");
          const s = 6;
          a.setAttribute("x1", String(px(i) - s));
          a.setAttribute("y1", String(px(j) - s));
          a.setAttribute("x2", String(px(i) + s));
          a.setAttribute("y2", String(px(j) + s));
          b.setAttribute("x1", String(px(i) - s));
          b.setAttribute("y1", String(px(j) + s));
          b.setAttribute("x2", String(px(i) + s));
          b.setAttribute("y2", String(px(j) - s));
          a.setAttribute("stroke", "var(--ink)");
          b.setAttribute("stroke", "var(--ink)");
          a.setAttribute("stroke-width", "2");
          b.setAttribute("stroke-width", "2");
          g.appendChild(a);
          g.appendChild(b);
        }
        svg.appendChild(g);
        sites.push(g);
      }
    }

    host.appendChild(svg);
    parent.appendChild(host);

    function setTime(t) {
      const amp = opts.amp || function () { return 0; };
      let p = 0;
      for (let j = 0; j < geom.n; j++) {
        for (let i = 0; i < geom.n; i++) {
          const a = amp(origin.x + i, origin.y + j, t) || 0;
          const r = a > 0.02 ? 4 + Math.max(0, Math.min(1, a)) * 14 : 0;
          waves[p].setAttribute("r", r.toFixed(2));
          p++;
        }
      }
    }

    return { el: host, setTime: setTime, w: geom.w, h: geom.h, values: values };
  }

  root.lattice = lattice;
  root.latticeSize = latticeSize;
})(typeof globalThis !== "undefined" ? globalThis : this);
