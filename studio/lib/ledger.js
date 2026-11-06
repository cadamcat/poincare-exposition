/* Ledger card. Enters with a 0.4s fade and a 12px rise. Leaves by fade. */
(function (root) {
  function ledgerCard(opts) {
    const parent = opts.parent || document.body;
    const el = document.createElement("div");
    el.className = "ledger st-" + (opts.status || "context");
    el.dataset.box = opts.box || "ledger";
    el.style.left = opts.x + "px";
    el.style.top = opts.y + "px";
    el.style.width = opts.w + "px";

    const bar = document.createElement("div");
    bar.className = "ledger-bar";
    el.appendChild(bar);

    const body = document.createElement("div");
    body.className = "ledger-body";
    if (opts.status === "lean") {
      const seal = document.createElement("div");
      seal.className = "ledger-seal";
      body.style.display = "flex";
      body.appendChild(seal);
    }
    const text = document.createElement("div");
    const title = document.createElement("div");
    title.className = "t-label strong";
    title.textContent = opts.title || "";
    text.appendChild(title);
    const lines = (opts.lines || []).slice(0, 2);
    for (let i = 0; i < lines.length; i++) {
      const line = document.createElement("div");
      line.className = "t-label ledger-line";
      line.textContent = lines[i];
      text.appendChild(line);
    }
    body.appendChild(text);
    el.appendChild(body);
    parent.appendChild(el);

    const tIn = opts.tIn;
    const tOut = opts.tOut;
    const enter = 0.4;

    function setTime(t) {
      let o = 0;
      let rise = 12;
      if (t < tIn) {
        o = 0;
        rise = 12;
      } else if (t < tIn + enter) {
        const u = root.fade(t, tIn, enter);
        o = u;
        rise = 12 * (1 - u);
      } else if (tOut == null || t < tOut) {
        o = 1;
        rise = 0;
      } else if (t < tOut + enter) {
        o = 1 - root.fade(t, tOut, enter);
        rise = 0;
      } else {
        o = 0;
        rise = 0;
      }
      el.style.opacity = String(o);
      el.style.transform = rise ? "translateY(" + rise.toFixed(3) + "px)" : "none";
    }

    setTime(-1);
    return { el: el, setTime: setTime };
  }

  root.ledgerCard = ledgerCard;
})(typeof globalThis !== "undefined" ? globalThis : this);
