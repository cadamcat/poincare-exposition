/* Time helpers and the beat timeline. Nothing here reads a clock. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function ease(x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return x * x * (3 - 2 * x);
  }

  function clamp(x, a, b) {
    if (a > b) {
      const s = a;
      a = b;
      b = s;
    }
    return Math.max(a, Math.min(b, x));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function fade(t, t0, dur) {
    if (!(dur > 0)) return t >= t0 ? 1 : 0;
    return ease(clamp((t - t0) / dur, 0, 1));
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 1831565813) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), a | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function normWord(w) {
    return String(w).toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
  }

  function timeline(data) {
    const list = data && data.beats ? data.beats : (data || []);
    const byId = {};
    for (let i = 0; i < list.length; i++) byId[list[i].id] = list[i];
    // A beat owns its hold: it lasts until holdEnd, or the next beat's start, or its own end.
    const spanEnd = {};
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      spanEnd[b.id] = b.holdEnd != null ? b.holdEnd : (i + 1 < list.length ? list[i + 1].start : b.end);
    }

    function need(id) {
      const b = byId[id];
      if (!b) throw new Error("unknown beat " + id);
      return b;
    }

    const api = {
      list: list,
      byId: byId,
      data: data,
      beatStart: function (id) { return need(id).start; },
      beatEnd: function (id) { return need(id).end; },
      beatHoldEnd: function (id) { need(id); return spanEnd[id]; },
      word: function (id, k) { return need(id).words[k].start; },
      cue: function (id, word) {
        const b = need(id);
        const key = normWord(word);
        for (let i = 0; i < b.words.length; i++) {
          if (normWord(b.words[i].word) === key) return b.words[i].start;
        }
        throw new Error("word not in beat " + id + ": " + word);
      },
      beatAt: function (t) {
        for (let i = 0; i < list.length; i++) {
          const b = list[i];
          const last = i === list.length - 1;
          if (t >= b.start && (t < spanEnd[b.id] || last)) return b;
          if (i === 0 && t < b.start) return null;   // before the first beat: no status (chapter opening)
        }
        return list[list.length - 1] || null;
      },
    };
    return api;
  }

  function installBeats(data) {
    const tl = timeline(data);
    const g = typeof globalThis !== "undefined" ? globalThis : {};
    g.beatStart = tl.beatStart;
    g.beatEnd = tl.beatEnd;
    g.word = tl.word;
    g.cue = tl.cue;
    g.beatAt = tl.beatAt;
    g.beatHoldEnd = tl.beatHoldEnd;
    g.BEATS = tl;
    // need(beat, word, seconds, reason): a motion that starts at cue(beat, word) (or at the beat's last
    // word for "tail", or before its first word for "lead") lasts `seconds`. The narration tool reads these
    // calls from the scene source and lengthens a natural pause when the voice gives less time.
    g.sceneNeeds = g.sceneNeeds || [];
    g.need = function (id, word, seconds, reason) {
      tl.beatStart(id);
      if (word !== "lead" && word !== "tail") tl.cue(id, word);
      g.sceneNeeds.push({ beat: id, word: word, seconds: seconds, reason: reason || "" });
      return seconds;
    };
    return tl;
  }

  return {
    ease: ease,
    clamp: clamp,
    lerp: lerp,
    fade: fade,
    mulberry32: mulberry32,
    normWord: normWord,
    timeline: timeline,
    installBeats: installBeats,
  };
});
