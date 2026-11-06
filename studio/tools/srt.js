const fs = require("fs");
const cuesApi = require("../lib/cues");

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) {
  console.error("usage: node tools/srt.js <beats.json> <out.srt>");
  process.exit(2);
}

const beats = JSON.parse(fs.readFileSync(input, "utf8"));
const cues = cuesApi.buildCues(beats);
let failed = false;
cues.forEach(function (cue, i) {
  const dur = cue.end - cue.start;
  const linesOk = cue.lines.length <= 2 && cue.lines.every(function (line) { return line.length <= 42; });
  const durOk = dur <= 6.001 && dur >= 0.999;
  const label = "cue " + (i + 1) + " " + cue.beat;
  if (!linesOk || !durOk) {
    console.log("FAIL srt " + label + " lines=" + cue.lines.length + " dur=" + dur.toFixed(3));
    failed = true;
  } else {
    console.log("PASS srt " + label);
  }
});
fs.mkdirSync(require("path").dirname(output), { recursive: true });
fs.writeFileSync(output, cuesApi.toSrt(cues));
console.log("wrote " + output + " (" + cues.length + " cues)");
if (failed) process.exit(1);
