/* Chapter label, the optional chapter opening (the title large at the centre, settling into the label),
   and an optional two-second break between chapters. */
(function (root) {
  const BREAK = 2;

  function chapterLabel(opts) {
    const parent = opts.parent || document.body;
    const el = document.createElement("div");
    el.className = "chapter t-chapter";
    el.dataset.box = "chapter";
    el.dataset.band = "chapter";
    el.dataset.chrome = "1";
    const text = opts.text != null ? opts.text : (opts.n + " · " + opts.title);
    el.textContent = text;
    parent.appendChild(el);
    // opts.intro = seconds: from t = 0 the title fades in at the centre at title size (first 35 %),
    // stays (next 25 %) and moves into its place as the label (last 40 %).
    const dur = opts.intro || 0;
    function setTime(t) {
      if (!(dur > 0) || t >= dur) {
        el.style.transform = "none";
        el.style.opacity = "1";
        return;
      }
      const css = getComputedStyle(document.documentElement);
      const k = parseFloat(css.getPropertyValue("--size-title")) / parseFloat(css.getPropertyValue("--size-chapter"));
      const r = el.getBoundingClientRect();
      const x0 = el.offsetLeft, y0 = el.offsetTop;
      const cx = 960 - x0 - r.width * k / 2, cy = 480 - y0 - r.height * k / 2;
      const m = root.ease(root.clamp((t / dur - 0.6) / 0.4, 0, 1));
      const s = root.lerp(k, 1, m);
      el.style.transformOrigin = "0 0";
      el.style.transform = "translate(" + root.lerp(cx, 0, m).toFixed(2) + "px," + root.lerp(cy, 0, m).toFixed(2) + "px) scale(" + s.toFixed(4) + ")";
      el.style.opacity = String(root.ease(root.clamp(t / dur / 0.35, 0, 1)));
    }
    if (dur > 0) setTime(0);
    return { el: el, text: text, setTime: setTime, intro: dur };
  }

  function chapterBreak(t, t0, dur) {
    const d = dur == null ? BREAK : dur;
    return t >= t0 && t < t0 + d;
  }

  root.chapterLabel = chapterLabel;
  root.chapterBreak = chapterBreak;
  root.CHAPTER_BREAK = BREAK;
})(typeof globalThis !== "undefined" ? globalThis : this);
