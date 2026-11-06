/* Status strip. State is the beat that contains t. */
(function (root) {
  const ORDER = ["proved", "claimed", "heuristic", "lean", "definition", "context"];
  const LABEL = {
    proved: "Proved in the literature",
    claimed: "Claimed: manuscript, not independently reviewed",
    heuristic: "Heuristic: illustration, proves nothing",
    lean: "Checked by the Lean kernel",
    definition: "Definition",
    context: "Context",
  };

  function mountStrip(parent) {
    const el = document.createElement("div");
    el.className = "strip t-strip st-context";
    el.dataset.box = "strip";
    el.dataset.band = "strip";
    el.dataset.chrome = "1";
    const seal = document.createElement("div");
    seal.className = "seal";
    seal.style.display = "none";
    const label = document.createElement("div");
    label.className = "strip-label";
    el.appendChild(seal);
    el.appendChild(label);
    parent.appendChild(el);

    function setTime(t) {
      const beat = root.beatAt ? root.beatAt(t) : null;
      if (!beat) {                 // chapter opening, before the first beat: neutral, no label
        el.className = "strip t-strip st-context";
        label.textContent = "";
        seal.style.display = "none";
        return;
      }
      const status = ORDER.indexOf(beat.status) >= 0 ? beat.status : "context";
      el.className = "strip t-strip st-" + status;
      label.textContent = LABEL[status];
      seal.style.display = status === "lean" ? "block" : "none";
    }

    return { el: el, setTime: setTime };
  }

  root.mountStrip = mountStrip;
})(typeof globalThis !== "undefined" ? globalThis : this);
