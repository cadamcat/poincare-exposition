/* Subtitle cues shared by the on-screen renderer and tools/srt.js.
   At most two lines, 42 characters each, break at punctuation first,
   each cue between 1.0 and 6.0 seconds when the speech allows it. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const MAX = 42;

  function textOf(w) {
    return typeof w === "string" ? w : w.word;
  }

  function joinWords(words) {
    let s = "";
    for (let i = 0; i < words.length; i++) {
      const t = textOf(words[i]);
      if (!s) s = t;
      else if (/^[,.;:!?%)\]}]/.test(t)) s += t;
      else s += " " + t;
    }
    return s;
  }

  function endsPunct(word) {
    return /[.!?;:,]$/.test(textOf(word));
  }

  function layoutLines(words) {
    if (!words.length) return [""];
    const all = joinWords(words);
    if (all.length <= MAX) return [all];
    let best = null;
    let bestScore = -1e9;
    for (let i = 1; i < words.length; i++) {
      const a = joinWords(words.slice(0, i));
      const b = joinWords(words.slice(i));
      if (!a || !b || a.length > MAX || b.length > MAX) continue;
      const score = (endsPunct(words[i - 1]) ? 100 : 0) - Math.abs(a.length - b.length);
      if (score > bestScore) {
        bestScore = score;
        best = [a, b];
      }
    }
    if (best) return best;
    if (words.length === 1) return [all];
    return null;
  }

  function buildCues(data) {
    const list = data && data.beats ? data.beats : (data || []);
    const cues = [];
    for (let bi = 0; bi < list.length; bi++) {
      const beat = list[bi];
      const words = beat.words || [];
      let i = 0;
      while (i < words.length) {
        let best = i;
        let punctAt = -1;
        for (let j = i; j < words.length; j++) {
          const chunk = words.slice(i, j + 1);
          const lines = layoutLines(chunk);
          if (!lines || lines.length > 2) break;
          const dur = chunk[chunk.length - 1].end - chunk[0].start;
          if (j > i && dur > 6) break;
          best = j;
          if (endsPunct(chunk[chunk.length - 1]) && dur >= 1 && dur <= 6) punctAt = j;
        }
        let end = best;
        if (punctAt >= i) {
          const pdur = words[punctAt].end - words[i].start;
          if (pdur >= 1 && pdur <= 6) end = punctAt;
        }
        const chunk = words.slice(i, end + 1);
        const lines = layoutLines(chunk) || [joinWords(chunk)];
        const start = chunk[0].start;
        let stop = chunk[chunk.length - 1].end;
        if (stop - start < 1) stop = start + 1;
        if (stop - start > 6) stop = start + 6;
        const next = words[end + 1];
        if (next && stop > next.start) stop = next.start;
        if (stop < start) stop = start;
        cues.push({
          beat: beat.id,
          start: start,
          end: stop,
          lines: lines,
          words: chunk,
        });
        i = end + 1;
      }
    }
    return cues;
  }

  function stamp(t) {
    if (t < 0) t = 0;
    const ms = Math.round(t * 1000);
    const pad = function (n, w) { return String(n).padStart(w || 2, "0"); };
    const h = Math.floor(ms / 3600000);
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return pad(h) + ":" + pad(m) + ":" + pad(s) + "," + pad(ms % 1000, 3);
  }

  function toSrt(cues) {
    const blocks = [];
    for (let i = 0; i < cues.length; i++) {
      const c = cues[i];
      blocks.push(String(i + 1) + "\n" + stamp(c.start) + " --> " + stamp(c.end) + "\n" + c.lines.join("\n") + "\n");
    }
    return blocks.join("\n");
  }

  return {
    joinWords: joinWords,
    layoutLines: layoutLines,
    buildCues: buildCues,
    toSrt: toSrt,
  };
});
