// Pavi bust matched to the show's design (Avatar Wiki reference): dark-purple wavy hair with side-swept bangs, a cowlick and
// a long low ponytail over her shoulder, yellow headband, big green eyes, brown skin, yellow-green shawl with a white leaf
// brooch and green gem, salmon top. Drawn as clean cel-shaded line art; expression: crying, bruised, bandaged.
// TEMPLATE: a detailed cel-shaded bust (this one is Pavi; recolour and reshape for your character, keep the structure).
// Local drawing space: head centre at (430, 330), cowlick tip ~y 72, chin ~y 528, shoulders ~y 575, body runs to y 900
// (off-frame). portrait(x, cx, cy, s) maps local (430, 330) to screen (cx, cy) at scale s.
// Layer order matters: back hair -> top/neck -> shawl/clothes -> brooch -> ponytail -> ears -> face + cel shadow ->
// bangs -> headband (ON TOP of the bangs, so it shows) -> side locks/cowlick -> bandage -> brows -> eyes -> tears -> nose, mouth.
// Rules that came out of review: spiky flaring hair silhouette (a smooth outline reads as a helmet); tears are thin tapered
// trails + a separate pointed-top drop (thick tubes with arrow-shaped ends look wrong); keep accessories inside the crop.
export function portrait(x, cx = 430, cy = 330, s = 1) {
  const INK = '#1A1222', SKIN = '#A5643C', SKIN_D = '#844A2A', SKIN_L = '#BC7A4F',
    HAIR = '#3B2B63', HAIR_D = '#281D47', HAIR_L = '#5C4A94', BAND = '#E9C64A', BAND_D = '#C49E2A',
    SHAWL = '#D8D45A', SHAWL_D = '#ABA736', SHAWL_L = '#ECE98C', TOP = '#E59A88', TOP_D = '#C27866',
    IRIS = '#3FB25A', IRIS_D = '#1E7A35', TEAR = '#86D6FF', TEAR_D = '#2D86C4', BRUISE = '#6E4FB8';
  const P = (px, py) => [cx + (px - 430) * s, cy + (py - 330) * s];
  const path = (cmds) => { x.beginPath(); for (const c of cmds) { const [op, ...a] = c; const pts = []; for (let i = 0; i < a.length; i += 2) pts.push(...P(a[i], a[i + 1]));
      if (op === 'M') x.moveTo(...pts); else if (op === 'L') x.lineTo(...pts); else if (op === 'Q') x.quadraticCurveTo(...pts); else if (op === 'C') x.bezierCurveTo(...pts); else if (op === 'Z') x.closePath(); } };
  const fill = (cmds, color, line = 7) => { path(cmds); x.fillStyle = color; x.fill(); if (line) { x.lineWidth = line * s; x.strokeStyle = INK; x.lineJoin = 'round'; x.lineCap = 'round'; x.stroke(); } };
  const stroke = (cmds, w = 6, color = INK) => { path(cmds); x.lineWidth = w * s; x.strokeStyle = color; x.lineJoin = 'round'; x.lineCap = 'round'; x.stroke(); };
  const clipTo = (cmds, fn) => { x.save(); path(cmds); x.clip(); fn(); x.restore(); };
  const dot = (px, py, r, color) => { const [a, b] = P(px, py); x.fillStyle = color; x.beginPath(); x.arc(a, b, r * s, 0, Math.PI * 2); x.fill(); };
  x.save();

  // ---- back hair mass (wavy, voluminous) behind the head
  fill([['M', 280, 480], ['Q', 240, 470, 205, 452], ['Q', 238, 430, 246, 408], ['Q', 205, 390, 185, 352], ['Q', 228, 345, 240, 322],
    ['Q', 205, 290, 208, 252], ['Q', 240, 258, 252, 240], ['C', 250, 160, 330, 100, 430, 95], ['C', 540, 95, 610, 150, 620, 230],
    ['Q', 655, 238, 690, 268], ['Q', 650, 288, 636, 300], ['Q', 680, 330, 700, 372], ['Q', 655, 376, 632, 372], ['Q', 668, 410, 672, 450],
    ['Q', 635, 440, 615, 430], ['Q', 628, 465, 612, 500], ['Q', 590, 480, 575, 470], ['Z']], HAIR, 7);
  stroke([['M', 230, 300], ['Q', 250, 340, 236, 380]], 4, HAIR_L); stroke([['M', 640, 290], ['Q', 640, 330, 660, 360]], 4, HAIR_D);
  // ---- salmon top + shawl over the shoulders
  fill([['M', 40, 900], ['C', 70, 660, 200, 600, 340, 588], ['L', 520, 588], ['C', 660, 600, 790, 660, 820, 900], ['Z']], TOP, 8);
  fill([['M', 372, 500], ['L', 376, 600], ['Q', 430, 630, 490, 600], ['L', 492, 500], ['Z']], SKIN, 7);          // neck
  fill([['M', 376, 575], ['Q', 430, 615, 490, 575], ['L', 490, 615], ['Q', 430, 650, 376, 615], ['Z']], SKIN_D, 0);
  const SHAWL_P = [['M', 20, 900], ['C', 40, 680, 170, 590, 330, 575], ['Q', 380, 615, 432, 622], ['Q', 486, 615, 534, 575], ['C', 690, 590, 820, 680, 840, 900], ['Z']];
  fill(SHAWL_P, SHAWL, 8);
  clipTo(SHAWL_P, () => { fill([['M', 560, 585], ['C', 700, 620, 800, 700, 840, 900], ['L', 600, 900], ['C', 600, 720, 580, 650, 560, 610], ['Z']], SHAWL_D, 0);
    fill([['M', 70, 740], ['C', 110, 680, 200, 645, 300, 630], ['L', 290, 650], ['C', 200, 670, 130, 700, 95, 760], ['Z']], SHAWL_L, 0);
    stroke([['M', 200, 700], ['Q', 260, 690, 300, 740]], 4, SHAWL_D); stroke([['M', 640, 700], ['Q', 600, 700, 580, 750]], 4, SHAWL_D); });
  // leaf brooch with a green gem (on her right side, viewer's left)
  { x.save(); const [ox, oy] = P(330, 682), [nx, ny] = P(345, 628); x.translate(nx, ny); x.scale(0.7, 0.7); x.translate(-ox, -oy);   // brooch: smaller, higher so the crop keeps it
  fill([['M', 300, 700], ['C', 270, 670, 290, 640, 318, 652], ['C', 330, 625, 368, 632, 362, 664], ['C', 392, 666, 392, 706, 360, 708], ['C', 352, 735, 312, 732, 314, 708], ['Z']], '#F4F1E6', 5);
  fill([['M', 322, 682], ['C', 322, 668, 344, 668, 344, 682], ['C', 344, 696, 322, 696, 322, 682], ['Z']], '#3FB25A', 4); dot(330, 677, 3, '#FFFFFF');
    x.restore(); }

  // ---- ponytail: long, wavy, falling over her right shoulder (viewer's left), yellow tie
  fill([['M', 285, 440], ['C', 230, 470, 190, 520, 205, 580], ['C', 215, 620, 175, 650, 150, 700], ['C', 200, 690, 240, 660, 255, 620],
    ['C', 262, 660, 245, 700, 225, 735], ['C', 280, 715, 300, 660, 290, 610], ['C', 300, 560, 320, 520, 315, 470], ['Z']], HAIR, 7);
  stroke([['M', 260, 500], ['Q', 225, 560, 240, 620]], 4, HAIR_L);
  fill([['M', 262, 470], ['Q', 290, 455, 318, 470], ['L', 314, 492], ['Q', 288, 478, 262, 492], ['Z']], BAND, 5);

  // ---- ears
  fill([['M', 282, 340], ['C', 252, 330, 248, 395, 286, 404], ['Z']], SKIN, 6);
  fill([['M', 580, 340], ['C', 610, 330, 614, 395, 576, 404], ['Z']], SKIN, 6);

  // ---- face (youthful, slightly pointed chin) with cel shadow
  const FACE = [['M', 430, 165], ['C', 345, 165, 284, 225, 284, 315], ['C', 284, 410, 345, 500, 432, 528], ['C', 520, 500, 578, 410, 578, 315], ['C', 578, 225, 518, 165, 430, 165], ['Z']];
  fill(FACE, SKIN, 0);
  clipTo(FACE, () => {
    fill([['M', 505, 165], ['C', 585, 230, 600, 420, 500, 548], ['L', 640, 548], ['L', 640, 165], ['Z']], SKIN_D, 0);
    fill([['M', 315, 420], ['C', 335, 490, 390, 535, 432, 542], ['C', 390, 520, 345, 470, 326, 412], ['Z']], SKIN_D, 0);
    x.globalAlpha = 0.35; fill([['M', 312, 380], ['C', 312, 356, 354, 356, 354, 380], ['C', 354, 400, 312, 400, 312, 380], ['Z']], '#D9806A', 0); x.globalAlpha = 1;
    x.globalAlpha = 0.5; fill([['M', 452, 360], ['C', 470, 346, 548, 348, 560, 370], ['C', 546, 398, 470, 398, 452, 378], ['Z']], BRUISE, 0); x.globalAlpha = 1;
  });
  path(FACE); x.lineWidth = 8 * s; x.strokeStyle = INK; x.stroke();

  // ---- front hair: side-swept bangs in pointed clumps (sweeping to viewer's right), side locks, cowlick
  fill([['M', 290, 270], ['C', 300, 170, 420, 130, 520, 160], ['C', 580, 180, 600, 230, 590, 300],
    ['L', 570, 262], ['L', 560, 330], ['L', 535, 255], ['L', 505, 300], ['L', 492, 235], ['L', 455, 275], ['L', 440, 222], ['L', 400, 262], ['L', 392, 220], ['L', 350, 268], ['L', 345, 230], ['L', 306, 300], ['Z']], HAIR, 7);
  clipTo([['M', 290, 270], ['C', 300, 170, 420, 130, 520, 160], ['C', 580, 180, 600, 230, 590, 300], ['L', 306, 300], ['Z']], () => {
    stroke([['M', 330, 200], ['Q', 380, 170, 440, 168]], 5, HAIR_L); stroke([['M', 470, 170], ['Q', 530, 175, 565, 210]], 5, HAIR_L);
    fill([['M', 520, 160], ['C', 580, 180, 600, 230, 590, 300], ['L', 560, 330], ['L', 535, 255], ['Z']], HAIR_D, 0); });
  fill([['M', 290, 270], ['C', 278, 340, 282, 420, 300, 470], ['L', 312, 400], ['L', 296, 320], ['Z']], HAIR, 6);   // side lock (her right)
  fill([['M', 588, 280], ['C', 606, 350, 600, 430, 578, 476], ['L', 570, 400], ['L', 580, 320], ['Z']], HAIR, 6);   // side lock (her left)
  fill([['M', 430, 140], ['C', 420, 100, 450, 70, 485, 72], ['C', 462, 85, 450, 105, 452, 140], ['Z']], HAIR, 5);   // cowlick

  // ---- yellow headband over the crown, bangs falling out below it
  fill([['M', 286, 232], ['C', 318, 150, 542, 144, 578, 232], ['L', 566, 252], ['C', 530, 176, 330, 182, 298, 252], ['Z']], BAND, 6);
  stroke([['M', 300, 234], ['C', 340, 172, 520, 168, 562, 234]], 3, BAND_D);
  // ---- small bandage on her cheek (her right)
  x.save(); const [bx, by] = P(330, 432); x.translate(bx, by); x.rotate(-0.35); x.scale(s, s);
  x.fillStyle = '#E8C39A'; x.strokeStyle = INK; x.lineWidth = 5; x.beginPath(); x.roundRect(-46, -14, 92, 28, 10); x.fill(); x.stroke();
  x.fillStyle = '#D9A877'; x.fillRect(-14, -11, 28, 22); x.restore();

  // ---- eyebrows (dark purple), inner ends raised
  fill([['M', 316, 286], ['C', 340, 270, 372, 262, 408, 254], ['L', 412, 266], ['C', 378, 278, 346, 290, 320, 300], ['Z']], HAIR_D, 4);
  fill([['M', 546, 286], ['C', 522, 270, 490, 262, 454, 254], ['L', 450, 266], ['C', 484, 278, 516, 290, 542, 300], ['Z']], HAIR_D, 4);

  // ---- big green eyes with lashes, highlights and welling tears
  [[368, -1], [494, 1]].forEach(([ex, side]) => {
    const EYE = [['M', ex - 46, 330], ['C', ex - 32, 292, ex + 32, 290, ex + 46, 326], ['C', ex + 30, 358, ex - 30, 360, ex - 46, 330], ['Z']];
    fill(EYE, '#FFFFFF', 0);
    clipTo(EYE, () => {
      fill([['M', ex - 26, 324], ['C', ex - 26, 292, ex + 26, 292, ex + 26, 324], ['C', ex + 26, 356, ex - 26, 356, ex - 26, 324], ['Z']], IRIS, 3);
      fill([['M', ex - 26, 324], ['C', ex - 26, 292, ex + 26, 292, ex + 26, 324], ['L', ex - 26, 324], ['Z']], IRIS_D, 0);
      fill([['M', ex - 11, 324], ['C', ex - 11, 310, ex + 11, 310, ex + 11, 324], ['C', ex + 11, 338, ex - 11, 338, ex - 11, 324], ['Z']], INK, 0);
      dot(ex - 10, 310, 7, '#FFFFFF'); dot(ex + 10, 334, 3.5, '#FFFFFF');
      x.globalAlpha = 0.8; fill([['M', ex - 46, 340], ['C', ex - 20, 354, ex + 20, 354, ex + 46, 338], ['L', ex + 46, 362], ['L', ex - 46, 362], ['Z']], TEAR, 0); x.globalAlpha = 1; });
    stroke([['M', ex - 52, 334], ['C', ex - 34, 290, ex + 34, 288, ex + 52, 328]], 9);                               // upper lid
    stroke([['M', ex + side * 50, 328], ['L', ex + side * 64, 318]], 5); stroke([['M', ex + side * 44, 316], ['L', ex + side * 56, 304]], 4);   // lashes
    stroke([['M', ex - 38, 348], ['C', ex - 14, 360, ex + 14, 360, ex + 38, 346]], 4);
  });

  // ---- tears: a tapered wet trail down each cheek ending in a round bead, plus one falling drop
  [[352, 1], [512, -1]].forEach(([tx, lean]) => {
    const T = [['M', tx - 4, 352], ['C', tx - 6, 380, tx - 9 + lean * 2, 410, tx - 9 + lean * 4, 436],
      ['C', tx - 10 + lean * 4, 452, tx + 10 + lean * 4, 452, tx + 9 + lean * 4, 436], ['C', tx + 7 + lean * 2, 410, tx + 4, 380, tx + 4, 352], ['Z']];
    x.globalAlpha = 0.9; fill(T, TEAR, 3); x.globalAlpha = 1;
    stroke([['M', tx - 1, 362], ['Q', tx - 3, 395, tx - 3 + lean * 3, 430]], 2.5, '#FFFFFF');
    const dx = tx + lean * 6, dy = 478;                                                     // falling drop (pointed top, round bottom)
    fill([['M', dx, dy - 18], ['C', dx + 4, dy - 8, dx + 10, dy - 2, dx + 10, dy + 5], ['C', dx + 10, dy + 16, dx - 10, dy + 16, dx - 10, dy + 5],
      ['C', dx - 10, dy - 2, dx - 4, dy - 8, dx, dy - 18], ['Z']], TEAR, 3);
    dot(dx - 3, dy + 3, 2.5, '#FFFFFF');
  });

  // ---- small nose, trembling open frown
  stroke([['M', 436, 360], ['C', 432, 385, 424, 400, 426, 410], ['Q', 436, 416, 446, 408]], 5);
  fill([['M', 392, 452], ['C', 405, 438, 418, 460, 432, 454], ['C', 446, 446, 459, 438, 472, 452], ['C', 458, 474, 406, 474, 392, 452], ['Z']], '#5A1A1E', 6);
  fill([['M', 412, 460], ['C', 424, 454, 440, 454, 452, 460], ['C', 442, 470, 422, 470, 412, 460], ['Z']], '#C4545E', 0);
  stroke([['M', 416, 444], ['L', 448, 444]], 3, '#FFFFFF');
  x.restore();
}
