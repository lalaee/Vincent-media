// Detailed cel-shaded bust of Pavi for thumbnails: clean line art, flat colour + one shadow tone, crying, bruised, bandaged.
// Original design (our Pavi: blue tunic, top bun); drawn with raw canvas paths. Head centre ~ (cx, cy), scale s.
export function paviPortrait(x, cx = 430, cy = 330, s = 1) {
  const INK = '#15111A', SKIN = '#B97A4E', SKIN_D = '#985E39', SKIN_L = '#CC8E60', HAIR = '#1B1620', HAIR_L = '#3A3242',
    BLUE = '#2F7FC1', BLUE_D = '#1F5E94', BLUE_L = '#5FA3DC', TEAR = '#7FD3FF', TEAR_D = '#2D86C4', BRUISE = '#6E4FB8';
  const P = (px, py) => [cx + (px - 430) * s, cy + (py - 330) * s];
  const path = (cmds) => { x.beginPath(); for (const c of cmds) { const [op, ...a] = c; const pts = []; for (let i = 0; i < a.length; i += 2) pts.push(...P(a[i], a[i + 1]));
      if (op === 'M') x.moveTo(...pts); else if (op === 'L') x.lineTo(...pts); else if (op === 'Q') x.quadraticCurveTo(...pts); else if (op === 'C') x.bezierCurveTo(...pts); else if (op === 'Z') x.closePath(); } };
  const fill = (cmds, color, line = 7) => { path(cmds); x.fillStyle = color; x.fill(); if (line) { x.lineWidth = line * s; x.strokeStyle = INK; x.lineJoin = 'round'; x.lineCap = 'round'; x.stroke(); } };
  const stroke = (cmds, w = 6, color = INK) => { path(cmds); x.lineWidth = w * s; x.strokeStyle = color; x.lineJoin = 'round'; x.lineCap = 'round'; x.stroke(); };
  const clipTo = (cmds, fn) => { x.save(); path(cmds); x.clip(); fn(); x.restore(); };
  x.save();

  // ---- body: tunic with collar and shading
  const BODY = [['M', 60, 760], ['C', 90, 650, 200, 620, 330, 600], ['L', 530, 600], ['C', 660, 620, 770, 650, 800, 760], ['Z']];
  fill(BODY, BLUE, 8);
  clipTo(BODY, () => { fill([['M', 560, 600], ['C', 680, 630, 770, 670, 800, 760], ['L', 560, 760], ['Z']], BLUE_D, 0); fill([['M', 90, 700], ['C', 150, 650, 220, 630, 300, 615], ['L', 280, 640], ['C', 200, 660, 140, 690, 110, 740], ['Z']], BLUE_L, 0); });
  // neck
  fill([['M', 368, 500], ['L', 372, 612], ['Q', 430, 650, 492, 612], ['L', 494, 500], ['Z']], SKIN, 7);
  fill([['M', 372, 560], ['Q', 430, 600, 492, 560], ['L', 492, 600], ['Q', 430, 640, 372, 600], ['Z']], SKIN_D, 0);
  // collar (wrap-over, light trim) and a water pin
  fill([['M', 330, 600], ['Q', 380, 640, 430, 700], ['Q', 470, 650, 530, 600], ['L', 552, 618], ['Q', 480, 690, 430, 760], ['Q', 370, 680, 308, 618], ['Z']], '#E9F2FA', 6);
  fill([['M', 600, 680], ['C', 600, 650, 650, 650, 650, 680], ['C', 650, 710, 600, 710, 600, 680], ['Z']], BLUE_L, 5);
  for (let k = -1; k <= 1; k++) stroke([['M', 608, 680 + k * 10], ['Q', 625, 672 + k * 10, 642, 680 + k * 10]], 3, '#FFFFFF');

  // ---- hair behind head + top bun with gold tie
  fill([['M', 250, 330], ['C', 230, 150, 330, 70, 430, 70], ['C', 530, 70, 630, 150, 610, 330], ['C', 615, 420, 590, 470, 560, 500], ['L', 300, 500], ['C', 270, 470, 245, 420, 250, 330], ['Z']], HAIR, 7);
  fill([['M', 365, 60], ['C', 360, -10, 500, -10, 495, 60], ['C', 495, 100, 365, 100, 365, 60], ['Z']], HAIR, 7);
  stroke([['M', 395, 30], ['Q', 430, 10, 470, 35]], 5, HAIR_L);
  fill([['M', 380, 86], ['Q', 430, 104, 480, 86], ['L', 482, 104], ['Q', 430, 122, 378, 104], ['Z']], '#F2C14E', 5);

  // ---- ears
  fill([['M', 262, 330], ['C', 230, 320, 225, 390, 268, 400], ['Z']], SKIN, 6);
  fill([['M', 598, 330], ['C', 630, 320, 635, 390, 592, 400], ['Z']], SKIN, 6);

  // ---- face with cel shadow on its right side
  const FACE = [['M', 430, 150], ['C', 330, 150, 268, 220, 266, 320], ['C', 264, 430, 330, 540, 430, 560], ['C', 530, 540, 596, 430, 594, 320], ['C', 592, 220, 530, 150, 430, 150], ['Z']];
  fill(FACE, SKIN, 0);
  clipTo(FACE, () => {
    fill([['M', 520, 150], ['C', 600, 220, 610, 420, 520, 560], ['L', 640, 560], ['L', 640, 150], ['Z']], SKIN_D, 0);
    fill([['M', 300, 420], ['C', 320, 500, 380, 545, 430, 552], ['C', 380, 530, 330, 480, 312, 410], ['Z']], SKIN_D, 0);
    x.globalAlpha = 0.5; fill([['M', 300, 360], ['C', 300, 330, 345, 330, 345, 360], ['C', 345, 385, 300, 385, 300, 360], ['Z']], SKIN_L, 0); x.globalAlpha = 1;
    x.globalAlpha = 0.55; fill([['M', 450, 352], ['C', 470, 338, 560, 340, 572, 362], ['C', 556, 392, 470, 392, 450, 372], ['Z']], BRUISE, 0); x.globalAlpha = 1;   // bruise under her left eye
  });
  path(FACE); x.lineWidth = 8 * s; x.strokeStyle = INK; x.stroke();

  // ---- front hair: fringe and side locks
  fill([['M', 262, 300], ['C', 255, 170, 340, 120, 430, 122], ['C', 520, 120, 605, 170, 598, 300], ['L', 585, 260], ['L', 560, 215], ['L', 548, 262], ['L', 505, 200], ['L', 488, 245], ['L', 440, 195], ['L', 420, 240], ['L', 380, 198], ['L', 362, 250], ['L', 325, 212], ['L', 300, 268], ['Z']], HAIR, 7);
  stroke([['M', 340, 150], ['Q', 380, 135, 420, 140]], 4, HAIR_L); stroke([['M', 470, 140], ['Q', 520, 140, 556, 160]], 4, HAIR_L);
  fill([['M', 262, 300], ['C', 255, 360, 262, 430, 280, 470], ['L', 292, 410], ['L', 280, 330], ['Z']], HAIR, 6);
  fill([['M', 598, 300], ['C', 605, 360, 598, 430, 580, 470], ['L', 568, 410], ['L', 580, 330], ['Z']], HAIR, 6);

  // ---- bandage on her forehead (right of the parting)
  x.save(); const [bx, by] = P(345, 252); x.translate(bx, by); x.rotate(-0.28); x.scale(s, s);
  x.fillStyle = '#E8C39A'; x.strokeStyle = INK; x.lineWidth = 5; x.beginPath(); x.roundRect(-62, -17, 124, 34, 12); x.fill(); x.stroke();
  x.fillStyle = '#D9A877'; x.fillRect(-20, -14, 40, 28); x.fillStyle = '#B98858'; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { x.beginPath(); x.arc(-12 + i * 12, -6 + j * 12, 2, 0, Math.PI * 2); x.fill(); } x.restore();

  // ---- eyebrows: thick, inner ends raised (distress)
  fill([['M', 300, 288], ['C', 330, 270, 370, 262, 410, 248], ['L', 414, 262], ['C', 376, 278, 336, 290, 304, 302], ['Z']], HAIR, 4);
  fill([['M', 560, 288], ['C', 530, 270, 490, 262, 450, 248], ['L', 446, 262], ['C', 484, 278, 524, 290, 556, 302], ['Z']], HAIR, 4);

  // ---- eyes: whites, brown irises looking up, highlights, heavy upper lids, welling tears
  [[362, -1], [498, 1]].forEach(([ex, side]) => {
    const EYE = [['M', ex - 48, 330], ['C', ex - 30, 300, ex + 30, 300, ex + 48, 328], ['C', ex + 30, 352, ex - 30, 352, ex - 48, 330], ['Z']];
    fill(EYE, '#FFFFFF', 0);
    clipTo(EYE, () => { fill([['M', ex - 22 + side * 2, 318], ['C', ex - 22, 290, ex + 22, 290, ex + 22, 318], ['C', ex + 22, 346, ex - 22, 346, ex - 22, 318], ['Z']], '#5A3420', 3);
      fill([['M', ex - 10, 318], ['C', ex - 10, 305, ex + 10, 305, ex + 10, 318], ['C', ex + 10, 331, ex - 10, 331, ex - 10, 318], ['Z']], INK, 0);
      x.fillStyle = '#FFFFFF'; const [hx, hy] = P(ex - 8, 308); x.beginPath(); x.arc(hx, hy, 6 * s, 0, Math.PI * 2); x.fill(); const [h2x, h2y] = P(ex + 9, 326); x.beginPath(); x.arc(h2x, h2y, 3 * s, 0, Math.PI * 2); x.fill();
      x.globalAlpha = 0.85; fill([['M', ex - 48, 338], ['C', ex - 20, 350, ex + 20, 350, ex + 48, 336], ['L', ex + 48, 356], ['L', ex - 48, 356], ['Z']], TEAR, 0); x.globalAlpha = 1; });
    stroke([['M', ex - 54, 334], ['C', ex - 34, 296, ex + 34, 294, ex + 54, 330]], 8);                  // upper lid
    stroke([['M', ex - 40, 344], ['C', ex - 14, 356, ex + 14, 356, ex + 40, 342]], 4);                  // lower lid
    stroke([['M', ex + side * 50, 330], ['L', ex + side * 62, 322]], 5);                              // lash flick
  });

  // ---- tears: smooth streams (dark edge, light fill, white glint) down both cheeks
  [[[340, 350], [334, 420], [344, 470], [332, 540]], [[520, 350], [528, 420], [518, 472], [530, 545]]].forEach((p) => {
    const tr = [['M', ...p[0]], ['C', ...p[1], ...p[2], ...p[3]]];
    stroke(tr, 22, TEAR_D); stroke(tr, 14, TEAR); stroke([['M', p[0][0] - 3, p[0][1] + 10], ['C', p[1][0] - 3, p[1][1], p[2][0] - 3, p[2][1], p[3][0] - 3, p[3][1] - 20]], 3, '#FFFFFF');
    fill([['M', p[3][0] - 11, p[3][1] - 4], ['Q', p[3][0], p[3][1] + 30, p[3][0] + 11, p[3][1] - 4], ['Z']], TEAR, 4);          // drop at the end
  });
  // ---- nose and trembling, open frown
  stroke([['M', 432, 340], ['C', 428, 375, 418, 395, 420, 408], ['Q', 432, 416, 446, 406]], 5);
  fill([['M', 380, 478], ['C', 395, 462, 410, 470, 430, 462], ['C', 450, 470, 465, 462, 482, 478], ['C', 466, 500, 396, 500, 380, 478], ['Z']], '#5A1A1E', 6);
  fill([['M', 404, 486], ['C', 418, 480, 444, 480, 458, 486], ['C', 446, 496, 416, 496, 404, 486], ['Z']], '#C4545E', 0);
  stroke([['M', 410, 466], ['L', 452, 466]], 3, '#FFFFFF');
  stroke([['M', 470, 430], ['L', 492, 452]], 4, '#7A3A2A');                                           // scratch on her cheek
  x.restore();
}
