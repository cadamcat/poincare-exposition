/* A paper as an object: a stack of page images that fans out, and one page brought forward,
   zoomed on a region and highlighted. Pages are alpha masks (SVG <mask>) coloured with the tokens:
   ink in --ink-muted on --paper-raised. Close-up pages should be vector (SVG) masks so that a
   device-scale render stays sharp.

   paperStack({parent, box, x, y, w, h, count, thumb(n), closeup: {n: url}, aspect})
     x, y, w, h   the clip box (data-box), inside the content area
     count        number of pages; thumb(n) gives the URL of page n's small mask (n from 1)
     closeup      URLs of the vector masks of the pages that come forward
     aspect       page height / width
   .show(state) with state = {
     enter: 0..1        the closed stack slides in from below
     fan: 0..1          pages leave the stack one after another into an arc across the box
     forward: {page, k} page comes from its place in the fan to the centre, large (k 0..1); others dim
     zoom: {region, k}  region {x0, y0, x1, y1} (fractions of the page) grows to fill the box
     highlight: {region, k, status}  an outline in a status colour around a region of the forward page
     fade: 0..1         the whole object fades out
   }. Pure function of the state; no clock. */
(function (root) {
  function paperStack(opts) {
    const parent = opts.parent || document.body;
    const W = opts.w, H = opts.h, N = opts.count, A = opts.aspect || 1.414;
    const host = document.createElement("div");
    host.className = "paper";
    host.dataset.box = opts.box || "paper";
    host.dataset.words = "skip";
    host.style.left = opts.x + "px";
    host.style.top = opts.y + "px";
    host.style.width = W + "px";
    host.style.height = H + "px";
    parent.appendChild(host);
    // the pages live in an inner clip box, so the measured box itself never reports overflow
    const clip = document.createElement("div");
    clip.className = "paper-clip";
    host.appendChild(clip);

    // A page's ink: an inline SVG whose rect is masked by the page image (alpha). CSS mask-image
    // would need CORS, which file:// pages do not have; an SVG <mask> with an <image> does not.
    let maskN = 0;
    const SVGNS = "http://www.w3.org/2000/svg";
    function ink(url) {
      const id = (opts.box || "paper") + "-m" + (maskN++);
      const vw = 100, vh = 100 * A;
      const svg = document.createElementNS(SVGNS, "svg");
      svg.setAttribute("class", "paper-ink");
      svg.setAttribute("viewBox", "0 0 " + vw + " " + vh.toFixed(3));
      svg.setAttribute("preserveAspectRatio", "none");
      const mask = document.createElementNS(SVGNS, "mask");
      mask.setAttribute("id", id);
      mask.setAttribute("maskUnits", "userSpaceOnUse");
      mask.setAttribute("x", "0"); mask.setAttribute("y", "0");
      mask.setAttribute("width", String(vw)); mask.setAttribute("height", vh.toFixed(3));
      mask.style.maskType = "alpha";
      const img = document.createElementNS(SVGNS, "image");
      img.setAttribute("href", url);
      img.setAttribute("width", String(vw)); img.setAttribute("height", vh.toFixed(3));
      img.setAttribute("preserveAspectRatio", "none");
      mask.appendChild(img);
      const defs = document.createElementNS(SVGNS, "defs");
      defs.appendChild(mask);
      svg.appendChild(defs);
      const rect = document.createElementNS(SVGNS, "rect");
      rect.setAttribute("width", String(vw)); rect.setAttribute("height", vh.toFixed(3));
      rect.setAttribute("mask", "url(#" + id + ")");
      svg.appendChild(rect);
      return svg;
    }

    const stackH = Math.min(H * 0.6, 420), stackW = stackH / A;
    const fanH = Math.min(H * 0.42, 300), fanW = fanH / A;
    const bigH = H * 0.96, bigW = bigH / A;
    const cx = W / 2, cy = H / 2;
    const R = W * 0.62;                          // fan radius; pivot below the box
    const spread = 1.25;                         // half-angle of the fan, radians

    const thumbs = [];
    for (let n = 1; n <= N; n++) {
      const el = document.createElement("div");
      el.className = "paper-thumb";
      el.style.width = fanW + "px";
      el.style.height = fanH + "px";
      el.appendChild(ink(opts.thumb(n)));
      clip.appendChild(el);
      thumbs.push(el);
    }
    const big = document.createElement("div");
    big.className = "paper-page";
    big.style.width = bigW + "px";
    big.style.height = bigH + "px";
    big.style.left = (cx - bigW / 2) + "px";
    big.style.top = (cy - bigH / 2) + "px";
    const zoomer = document.createElement("div");
    zoomer.className = "paper-zoom";
    big.appendChild(zoomer);
    const bigInk = {};
    Object.keys(opts.closeup || {}).forEach(function (n) {
      const d = ink(opts.closeup[n]);
      d.style.display = "none";
      zoomer.appendChild(d);
      bigInk[n] = d;
    });
    const hl = document.createElement("div");
    hl.className = "paper-hl st-claimed";
    zoomer.appendChild(hl);
    clip.appendChild(big);

    function stackPose(i) {
      return { x: cx + i * 0.35 - N * 0.175, y: cy + i * 0.25 - N * 0.125, r: 0, s: stackH / fanH };
    }
    function fanPose(i) {
      const a = -spread + 2 * spread * i / Math.max(1, N - 1);
      const px = cx, py = cy + R * 0.98;
      return { x: px + R * Math.sin(a), y: py - R * Math.cos(a), r: a, s: 1 };
    }
    function pose(el, p, op) {
      el.style.transform = "translate(" + (p.x - fanW / 2).toFixed(2) + "px," + (p.y - fanH / 2).toFixed(2) + "px) rotate(" +
        p.r.toFixed(4) + "rad) scale(" + p.s.toFixed(4) + ")";
      el.style.opacity = op.toFixed(3);
    }
    function mix(a, b, k) {
      return { x: root.lerp(a.x, b.x, k), y: root.lerp(a.y, b.y, k), r: root.lerp(a.r, b.r, k), s: root.lerp(a.s, b.s, k) };
    }

    function show(st) {
      st = st || {};
      const enter = st.enter == null ? 1 : st.enter;
      const fan = st.fan || 0;
      const fw = st.forward || null;
      const fwk = fw ? root.ease(root.clamp(fw.k, 0, 1)) : 0;
      const fade = 1 - root.ease(root.clamp(st.fade || 0, 0, 1));
      const drop = (1 - root.ease(enter)) * H * 0.8;
      const Wd = 0.3;
      for (let i = 0; i < N; i++) {
        const delay = i / Math.max(1, N - 1) * (1 - Wd);
        const f = root.ease(root.clamp((fan - delay) / Wd, 0, 1));
        let p = mix(stackPose(i), fanPose(i), f);
        p.y += drop;
        let op = enter > 0 ? fade : 0;
        if (fw) op *= root.lerp(1, i + 1 === fw.page ? 0 : 0.35, fwk);
        pose(thumbs[i], p, op);
      }
      // the forward page: from its place (fan or stack) to the centre, large
      if (fw && fwk > 0) {
        const i = fw.page - 1;
        const fp = fan > 0.5 ? fanPose(i) : stackPose(i);
        const sx = fanW * fp.s / bigW;
        const tx = fp.x - cx, ty = fp.y + drop - cy;
        const s = root.lerp(sx, 1, fwk);
        big.style.transform = "translate(" + root.lerp(tx, 0, fwk).toFixed(2) + "px," + root.lerp(ty, 0, fwk).toFixed(2) +
          "px) rotate(" + root.lerp(fp.r, 0, fwk).toFixed(4) + "rad) scale(" + s.toFixed(4) + ")";
        big.style.opacity = fade.toFixed(3);
        big.style.visibility = "visible";
        Object.keys(bigInk).forEach(function (n) { bigInk[n].style.display = String(fw.page) === n ? "block" : "none"; });
      } else {
        big.style.visibility = "hidden";
      }
      // zoom on a region of the forward page
      const z = st.zoom;
      if (z && z.k > 0) {
        const r = z.region;
        const rw = (r.x1 - r.x0) * bigW, rh = (r.y1 - r.y0) * bigH;
        const Z = Math.min(W * 0.94 / rw, H * 0.9 / rh);
        const k = root.ease(root.clamp(z.k, 0, 1));
        const s = root.lerp(1, Z, k);
        const rcx = (r.x0 + r.x1) / 2 * bigW, rcy = (r.y0 + r.y1) / 2 * bigH;
        const tx = root.lerp(rcx, bigW / 2, k) - s * rcx, ty = root.lerp(rcy, bigH / 2, k) - s * rcy;
        zoomer.style.transform = "translate(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px) scale(" + s.toFixed(4) + ")";
      } else {
        zoomer.style.transform = "none";
      }
      const h = st.highlight;
      if (h && h.k > 0) {
        const r = h.region;
        hl.className = "paper-hl st-" + (h.status || "claimed");
        hl.style.left = (r.x0 * 100) + "%";
        hl.style.top = (r.y0 * 100) + "%";
        hl.style.width = ((r.x1 - r.x0) * 100) + "%";
        hl.style.height = ((r.y1 - r.y0) * 100) + "%";
        hl.style.opacity = root.ease(root.clamp(h.k, 0, 1)).toFixed(3);
        hl.style.visibility = "visible";
      } else {
        hl.style.visibility = "hidden";
      }
    }

    show({ enter: 0 });
    return { el: host, show: show, page: { w: bigW, h: bigH } };
  }

  root.paperStack = paperStack;
})(typeof globalThis !== "undefined" ? globalThis : this);
