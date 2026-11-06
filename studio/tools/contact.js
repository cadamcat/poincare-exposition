const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { launch, shot } = require("./browser");

function args(argv) {
  const positional = [];
  const opt = { step: 1.5, fps: 30, cols: 6, count: 0, rows: 5 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--step") opt.step = Number(argv[++i]);
    else if (a === "--fps") opt.fps = Number(argv[++i]);
    else if (a === "--cols") opt.cols = Number(argv[++i]);
    else if (a === "--count") opt.count = Number(argv[++i]);
    else if (a === "--rows") opt.rows = Number(argv[++i]);
    else positional.push(a);
  }
  return { positional, opt };
}

function beatId(t, beats) {
  const list = beats.beats || [];
  let id = list.length ? list[0].id : "";
  for (let i = 0; i < list.length; i++) if (t >= list[i].start) id = list[i].id;   // a beat owns its hold
  return id;
}

function sheetName(file, index) {
  if (index === 0) return file;
  const ext = path.extname(file);
  return file.slice(0, -ext.length) + "-" + (index + 1) + ext;
}

async function main() {
  const { positional, opt } = args(process.argv.slice(2));
  if (positional.length < 3) {
    console.error("usage: node tools/contact.js <framesDir> <beats.json> <out.png> [--step 1.5 --fps 30 --count N]");
    process.exit(2);
  }
  const framesDir = positional[0];
  const beats = JSON.parse(fs.readFileSync(positional[1], "utf8"));
  const outFile = positional[2];
  const files = fs.readdirSync(framesDir).filter(function (name) { return /^f\d+\.png$/.test(name); }).sort();
  if (!files.length) throw new Error("no frames in " + framesDir);
  const maxI = files.reduce(function (m, name) { return Math.max(m, Number(name.slice(1, 6))); }, 0);
  const times = [];
  if (opt.count > 0) {
    const n = opt.count;
    for (let i = 0; i < n; i++) {
      const idx = n === 1 ? 0 : Math.round(i * maxI / (n - 1));
      times.push(idx / opt.fps);
    }
  } else {
    const end = maxI / opt.fps;
    for (let t = 0; t <= end + 1e-6; t += opt.step) times.push(Math.round(t * opt.fps) / opt.fps);
  }

  const tiles = times.map(function (t) {
    const idx = Math.round(t * opt.fps);
    const file = "f" + String(idx).padStart(5, "0") + ".png";
    const abs = path.join(framesDir, file);
    if (!fs.existsSync(abs)) throw new Error("missing frame " + abs);
    return { t: t, beat: beatId(t, beats), file: file };
  });

  const per = Math.max(1, opt.cols * opt.rows);
  const studio = path.resolve(__dirname, "..");
  const tokensHref = pathToFileURL(path.join(studio, "lib", "tokens.css")).href;
  const fontsHref = pathToFileURL(path.join(studio, "lib", "fonts.css")).href;
  const browser = await launch();
  try {
    const sheets = Math.ceil(tiles.length / per);
    for (let s = 0; s < sheets; s++) {
      const slice = tiles.slice(s * per, (s + 1) * per);
      const cols = Math.min(opt.cols, slice.length);
      const rows = Math.ceil(slice.length / opt.cols);
      const cellH = 270 + 56;
      const width = cols * 480;
      const height = rows * cellH;
      let cells = "";
      for (let i = 0; i < slice.length; i++) {
        const tile = slice[i];
        cells += "<div class=\"cell\"><img src=\"" + tile.file + "\"><div class=\"cap t-strip\">" +
          tile.t.toFixed(2) + "s  " + tile.beat + "</div></div>";
      }
      const html = "<!doctype html><html><head><meta charset=\"utf-8\">" +
        "<link rel=\"stylesheet\" href=\"" + tokensHref + "\">" +
        "<link rel=\"stylesheet\" href=\"" + fontsHref + "\">" +
        "<style>html,body{margin:0;width:" + width + "px;height:" + height + "px;overflow:visible;background:var(--paper)}.row{display:flex;flex-wrap:wrap;width:" + width +
        "px}.cell{width:480px}img{width:480px;height:270px;display:block;object-fit:fill}.cap{padding:8px 10px 18px;color:var(--ink)}</style>" +
        "</head><body><div class=\"row\">" + cells + "</div></body></html>";
      const htmlPath = path.join(path.resolve(framesDir), ".contact-" + s + ".html");
      fs.writeFileSync(htmlPath, html);
      const page = await browser.newPage({ viewport: { width: width, height: height }, deviceScaleFactor: 1 });
      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
      await page.evaluate(function () {
        const pending = [];
        document.fonts.forEach(function (face) { pending.push(face.load().catch(function () { return null; })); });
        const images = Array.prototype.slice.call(document.images);
        images.forEach(function (img) {
          if (!img.complete) pending.push(new Promise(function (resolve) { img.onload = img.onerror = resolve; }));
        });
        return Promise.all(pending);
      });
      const dest = sheetName(outFile, s);
      fs.mkdirSync(path.dirname(path.resolve(dest)), { recursive: true });
      await page.screenshot(Object.assign({ path: dest }, shot));
      await page.close();
      console.log("sheet " + dest + " (" + slice.length + " tiles)");
    }
  } finally {
    await browser.close();
  }
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
