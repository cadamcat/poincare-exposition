// Renders the 3D pictures of the article figures to figures/3d/<name>.png (2x device pixels).
// Usage (from article/): node figures/render3d.js <node_modules dir>   (needs WebGL in headless Chromium)
// make_figures.py embeds these PNGs in the SVG figures and draws the labels.
const path = require("path");
const nm = process.argv[2];
const { chromium } = require(path.join(nm, "playwright"));
const FIGS = { loops: [1200, 380], "ricci-flow": [1500, 360], surgery: [1500, 330], neighbourhoods: [1500, 300] };
(async () => {
  const browser = await chromium.launch({ args: ["--allow-file-access-from-files", "--font-render-hinting=none"] });
  for (const [name, [w, h]] of Object.entries(FIGS)) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e)));
    await page.goto("file://" + path.resolve(__dirname, "fig3d.html") + "?fig=" + name + "&w=" + w + "&h=" + h);
    await page.waitForFunction(() => window.figDone === true, null, { timeout: 20000 });
    if (errs.length) throw new Error(errs.join("\n"));
    await page.screenshot({ path: path.join(__dirname, "3d", name + ".png"), omitBackground: false, scale: "device" });
    console.log("3d figure", name);
    await page.close();
  }
  await browser.close();
})();
