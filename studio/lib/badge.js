/* Heuristic badge. The words are fixed. */
(function (root) {
  const TEXT = "illustration, proves nothing";

  function heuristicBadge(opts) {
    const parent = opts.parent || document.body;
    const el = document.createElement("div");
    el.className = "badge t-label";
    el.dataset.box = opts.box || "badge";
    el.style.left = opts.x + "px";
    el.style.top = opts.y + "px";
    el.textContent = TEXT;
    parent.appendChild(el);

    function setVisible(on) {
      el.style.opacity = on ? "1" : "0";
    }

    setVisible(opts.visible !== false);
    return { el: el, setVisible: setVisible, text: TEXT };
  }

  root.heuristicBadge = heuristicBadge;
})(typeof globalThis !== "undefined" ? globalThis : this);
