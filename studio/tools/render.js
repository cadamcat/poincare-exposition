const fs = require("fs");
const path = require("path");
const { launch, openScene, seek, shotAt } = require("./browser");

function args(argv) {
  const positional = [];
  const opt = { fps: 30, every: 1, workers: 3, scale: 1 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--from") opt.from = Number(argv[++i]);
    else if (a === "--to") opt.to = Number(argv[++i]);
    else if (a === "--fps") opt.fps = Number(argv[++i]);
    else if (a === "--every") opt.every = Number(argv[++i]);
    else if (a === "--scale") opt.scale = Number(argv[++i]);
    else if (a === "--workers") opt.workers = Math.max(1, Math.min(3, Number(argv[++i])));
    else positional.push(a);
  }
  return { positional, opt };
}

function frameList(from, to, fps, every) {
  const i0 = Math.round(from * fps);
  const i1 = Math.round(to * fps);
  const out = [];
  for (let i = i0; i <= i1; i++) {
    if (every > 1 && i % every !== 0) continue;
    out.push(i);
  }
  return out;
}

function pad(i) {
  return String(i).padStart(5, "0");
}

async function renderGroup(page, frames, fps, outDir, shot) {
  for (let k = 0; k < frames.length; k++) {
    const i = frames[k];
    await seek(page, i / fps);
    await page.screenshot(Object.assign({ path: path.join(outDir, "f" + pad(i) + ".png") }, shot));
  }
}

async function main() {
  const { positional, opt } = args(process.argv.slice(2));
  if (positional.length < 3) {
    console.error("usage: node tools/render.js <scene.html> <beats.json> <outDir> [--from s --to s --fps 30 --every n --scale 1|2]");
    process.exit(2);
  }
  const scene = positional[0];
  const beats = JSON.parse(fs.readFileSync(positional[1], "utf8"));
  const outDir = positional[2];
  fs.mkdirSync(outDir, { recursive: true });

  const t0 = process.hrtime.bigint();
  const browser = await launch(opt.scale);
  try {
    const probe = await openScene(browser, scene, beats);
    const sceneDuration = await probe.evaluate(function () { return window.sceneDuration; });
    await probe.close();
    const from = opt.from == null ? 0 : opt.from;
    const to = opt.to == null ? Number(sceneDuration) : opt.to;
    const frames = frameList(from, to, opt.fps, opt.every);
    const workers = Math.min(opt.workers, Math.max(1, frames.length));
    const groups = [];
    for (let w = 0; w < workers; w++) groups.push([]);
    frames.forEach(function (frame, i) { groups[i % workers].push(frame); });
    const pages = [];
    for (let w = 0; w < workers; w++) pages.push(await openScene(browser, scene, beats, opt.scale));
    await Promise.all(pages.map(function (page, w) {
      return renderGroup(page, groups[w], opt.fps, outDir, shotAt(opt.scale));
    }));
    const sec = Number(process.hrtime.bigint() - t0) / 1e9;
    const rate = frames.length / Math.max(sec, 1e-6);
    console.log(frames.length + " frames in " + sec.toFixed(2) + "s (" + rate.toFixed(2) + " fps)");
  } finally {
    await browser.close();
  }
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
