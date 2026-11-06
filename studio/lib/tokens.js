/* Token mirror for SVG and JS. Colour literals live only in this file,
   tokens.css and fonts.css. NAMED is the CSS colour-keyword list the
   palette lint reads, so the lint source itself stays free of those words. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else {
    root.TOKENS = api;
    root.col = api.col;
    root.span = api.span;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const color = {
    paper: "#F7F4EC",
    paperRaised: "#FBF8F1",
    ink: "#1C1B19",
    inkMuted: "#5E5B55",
    rule: "#D8D2C4",
    statusProved: "#2F6B4F",
    statusClaimed: "#B7791F",
    statusHeuristic: "#8A8780",
    statusLean: "#2B5C9E",
    objHopping: "#4F5D8A",
    objPotential: "#A34F3A",
    objEnergy: "#7A4A6E",
    objWave: "#2E7D86",
    objDamping: "#8E8458",
  };

  const cssVar = {
    paper: "--paper",
    paperRaised: "--paper-raised",
    ink: "--ink",
    inkMuted: "--ink-muted",
    rule: "--rule",
    proved: "--status-proved",
    claimed: "--status-claimed",
    heuristic: "--status-heuristic",
    lean: "--status-lean",
    definition: "--rule",
    context: "--rule",
    hopping: "--obj-hopping",
    potential: "--obj-potential",
    energy: "--obj-energy",
    wave: "--obj-wave",
    damping: "--obj-damping",
  };

  const NAMED = (
    "aliceblue,antiquewhite,aqua,aquamarine,azure,beige,bisque,black,blanchedalmond," +
    "blue,blueviolet,brown,burlywood,cadetblue,chartreuse,chocolate,coral,cornflowerblue," +
    "cornsilk,crimson,cyan,darkblue,darkcyan,darkgoldenrod,darkgray,darkgreen,darkgrey," +
    "darkkhaki,darkmagenta,darkolivegreen,darkorange,darkorchid,darkred,darksalmon," +
    "darkseagreen,darkslateblue,darkslategray,darkslategrey,darkturquoise,darkviolet," +
    "deeppink,deepskyblue,dimgray,dimgrey,dodgerblue,firebrick,floralwhite,forestgreen," +
    "fuchsia,gainsboro,ghostwhite,gold,goldenrod,gray,green,greenyellow,grey,honeydew," +
    "hotpink,indianred,indigo,ivory,khaki,lavender,lavenderblush,lawngreen,lemonchiffon," +
    "lightblue,lightcoral,lightcyan,lightgoldenrodyellow,lightgray,lightgreen,lightgrey," +
    "lightpink,lightsalmon,lightseagreen,lightskyblue,lightslategray,lightslategrey," +
    "lightsteelblue,lightyellow,lime,limegreen,linen,magenta,maroon,mediumaquamarine," +
    "mediumblue,mediumorchid,mediumpurple,mediumseagreen,mediumslateblue,mediumspringgreen," +
    "mediumturquoise,mediumvioletred,midnightblue,mintcream,mistyrose,moccasin,navajowhite," +
    "navy,oldlace,olive,olivedrab,orange,orangered,orchid,palegoldenrod,palegreen," +
    "paleturquoise,palevioletred,papayawhip,peachpuff,peru,pink,plum,powderblue,purple," +
    "rebeccapurple,red,rosybrown,royalblue,saddlebrown,salmon,sandybrown,seagreen,seashell," +
    "sienna,silver,skyblue,slateblue,slategray,slategrey,snow,springgreen,steelblue,tan," +
    "teal,thistle,tomato,turquoise,violet,wheat,white,whitesmoke,yellow,yellowgreen"
  ).split(",");

  const COL_W = 118;
  const GUTTER = 24;
  const MARGIN_X = 120;
  const MARGIN_TOP = 80;
  const CONTENT_RIGHT = 1800;
  const CONTENT_BOTTOM = 880;
  const STEP = COL_W + GUTTER;

  function col(i) {
    return MARGIN_X + i * STEP;
  }

  function span(i, n) {
    return { x: col(i), w: n * COL_W + (n - 1) * GUTTER };
  }

  const bands = {
    content: { x0: 120, y0: 80, x1: 1800, y1: 880 },
    subtitle: { x0: 210, y0: 900, x1: 1710, y1: 1020 },
    strip: { x0: 0, y0: 1040, x1: 1920, y1: 1080 },
    chapter: { x0: 120, y0: 8, x1: 1800, y1: 76 },
  };

  return {
    color: color,
    cssVar: cssVar,
    NAMED: NAMED,
    COL_W: COL_W,
    GUTTER: GUTTER,
    MARGIN_X: MARGIN_X,
    MARGIN_TOP: MARGIN_TOP,
    CONTENT_RIGHT: CONTENT_RIGHT,
    CONTENT_BOTTOM: CONTENT_BOTTOM,
    bands: bands,
    col: col,
    span: span,
  };
});
