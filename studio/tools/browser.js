const { chromium } = require("playwright");
const path = require("path");
const { pathToFileURL } = require("url");

const shot = {
  type: "png",
  animations: "disabled",
  caret: "hide",
  scale: "css",
};

// scale: device pixels per CSS pixel. The layout is always 1920x1080 CSS pixels;
// scale 2 renders the same page at 3840x2160 (take screenshots with shotAt(scale)).
async function launch(scale) {
  const s = scale || 1;
  return chromium.launch({
    args: [
      "--font-render-hinting=none",
      "--disable-lcd-text",
      "--force-device-scale-factor=" + s,
      // ES modules (three.js) load from file:// only with this flag; WebGL renders in headless Chromium
      "--allow-file-access-from-files",
      // Without these, headless WebGL runs on SwiftShader (CPU). On Apple silicon, Metal renders
      // the same frames (SSIM 0.99994 vs SwiftShader) about twice as fast at a sixth of the CPU.
      "--use-angle=metal",
      "--enable-gpu",
      "--ignore-gpu-blocklist",
    ],
  });
}

function shotAt(scale) {
  return Object.assign({}, shot, { scale: (scale || 1) > 1 ? "device" : "css" });
}

async function openScene(browser, scenePath, beats, scale) {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: scale || 1,
  });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.addInitScript(function (payload) {
    window.__BEATS__ = payload;
  }, beats);
  const errors = [];
  page.on("pageerror", function (err) { errors.push(String(err && err.stack || err)); });
  page.on("requestfailed", function (req) { errors.push("request failed: " + req.url()); });
  await page.goto(pathToFileURL(path.resolve(scenePath)).href);
  await page.evaluate(async function () {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const pending = [];
    document.fonts.forEach(function (face) {
      if (face.status !== "loaded") pending.push(face.load().catch(function () { return null; }));
    });
    if (pending.length) await Promise.all(pending);
    if (typeof window.sceneReady === "function") await window.sceneReady();
  });
  // A scene that threw while loading, or could not load a file, must not render silently.
  if (errors.length) throw new Error("scene failed to load: " + scenePath + "\n" + errors.join("\n"));
  return page;
}

async function seek(page, t) {
  await page.evaluate(function (time) {
    window.setTime(time);
    return document.body.getBoundingClientRect().width;
  }, t);
}

module.exports = { launch, openScene, seek, shot, shotAt };
