// Convert SVG figures to PDF (for the LaTeX build) and PNG (for viewing) with headless Chromium.
// Usage: node fig2pdf.js <node_modules dir> <out dir> <figure.svg>...
const path = require('path'), fs = require('fs');
const [nm, outDir, ...svgs] = process.argv.slice(2);
const { chromium } = require(path.join(nm, 'playwright'));
const f = (p) => JSON.stringify('file://' + encodeURI(path.join(nm, p)));
const css = `
@font-face{font-family:"Source Sans 3";font-weight:400;src:url(${f('@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff2')})}
@font-face{font-family:"Source Sans 3";font-weight:400;src:url(${f('@fontsource/source-sans-3/files/source-sans-3-latin-ext-400-normal.woff2')});unicode-range:U+0100-02AF,U+1E00-1EFF,U+2000-206F}
@font-face{font-family:"Source Sans 3";font-weight:400;src:url(${f('@fontsource/source-sans-3/files/source-sans-3-greek-400-normal.woff2')});unicode-range:U+0370-03FF}
@font-face{font-family:"Source Sans 3";font-weight:600;src:url(${f('@fontsource/source-sans-3/files/source-sans-3-latin-600-normal.woff2')})}
@font-face{font-family:"Source Sans 3";font-weight:600;src:url(${f('@fontsource/source-sans-3/files/source-sans-3-greek-600-normal.woff2')});unicode-range:U+0370-03FF}
@font-face{font-family:"KaTeX_Math";font-style:italic;src:url(${f('katex/dist/fonts/KaTeX_Math-Italic.woff2')})}
@font-face{font-family:"KaTeX_Math";font-style:normal;src:url(${f('katex/dist/fonts/KaTeX_Main-Regular.woff2')})}
@font-face{font-family:"KaTeX_MainFB";font-style:normal;src:url(${f('katex/dist/fonts/KaTeX_Main-Regular.woff2')})}
@font-face{font-family:"KaTeX_MainFB";font-style:italic;src:url(${f('katex/dist/fonts/KaTeX_Main-Regular.woff2')})}
@font-face{font-family:"JetBrains Mono";src:url(${f('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2')})}
@font-face{font-family:"JetBrains Mono";src:url(${f('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-ext-400-normal.woff2')});unicode-range:U+0100-02AF,U+1D00-1DBF,U+2000-206F}
html,body{margin:0;padding:0}svg{display:block}`;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const s of svgs) {
    const src = fs.readFileSync(s, 'utf8');
    const w = +src.match(/width="(\d+)"/)[1], h = +src.match(/height="(\d+)"/)[1];
    await page.setViewportSize({ width: w, height: h });
    const base = path.join(outDir, path.basename(s, '.svg'));
    fs.writeFileSync(base + '.html', `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${src}</body></html>`);
    await page.goto('file://' + path.resolve(base + '.html'));
    await page.evaluate(() => document.fonts.ready);
    const missing = await page.evaluate(() => [...document.fonts].filter(f => f.status !== 'loaded' && f.status !== 'unloaded').map(f => f.family));
    if (missing.length) throw new Error('fonts failed: ' + missing.join(', '));
    await page.pdf({ path: base + '.pdf', width: w + 'px', height: h + 'px', printBackground: true, pageRanges: '1' });
    await page.screenshot({ path: base + '.png' });
    console.log('figure', path.basename(s));
  }
  await browser.close();
})();
