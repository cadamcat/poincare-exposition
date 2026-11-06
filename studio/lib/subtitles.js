/* On-screen subtitles: the whole cue (the same phrases as the SRT file), shown from its start to its end. */
(function (root) {
  function mountSubtitles(parent, data) {
    const cues = root.buildCues(data);
    const el = document.createElement("div");
    el.className = "subtitle t-subtitle";
    el.dataset.box = "subtitle";
    el.dataset.band = "subtitle";
    el.dataset.chrome = "1";
    parent.appendChild(el);

    function setTime(t) {
      let text = "";
      for (let i = 0; i < cues.length; i++) {
        const cue = cues[i];
        if (t + 1e-4 < cue.start || t >= cue.end) continue;
        text = cue.lines.join("\n");
        break;
      }
      el.textContent = text;
    }

    return { el: el, cues: cues, setTime: setTime };
  }

  root.mountSubtitles = mountSubtitles;
})(typeof globalThis !== "undefined" ? globalThis : this);
