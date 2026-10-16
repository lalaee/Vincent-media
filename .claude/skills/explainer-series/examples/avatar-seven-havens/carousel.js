// Carousel: "Why it sucks to be the Avatar in Seven Havens", 10 slides. Each scene is one static slide (rendered ~0.9 s in).
// Works at 1080x1350 (Instagram 4:5) and 1080x1920 (TikTok 9:16): the illustration zone grows with the height.
export default (E) => {
  const { x, P, W, H, TAU, ink, shape, circ, rectP, hand, label, scaled, person, card, burst, cross, star, ground, wisp, ringWall } = E;
  const N = 10, CX = W / 2;
  const TOP = 440, BOT = H - 300, CY = (TOP + BOT) / 2, K = Math.min(1.15, Math.max(1, (BOT - TOP) / 610));
  const SEC = (E.series?.section?.colors) || ['#F2A33A', '#2F7FC1', '#4F8A3C', '#D8432E', '#3FC1B0', '#7B5CD6', '#C7362B'];
  function element(type, cx, cy, r, id = 1) {
    if (type === 'air') { shape(circ(cx, cy, r), id, P.air); for (let k = 0; k < 3; k++) { const Pt = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * 4.4 + k * 2.1, rr = r * 0.75 * (1 - i / 14); Pt.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } ink(Pt, id + 10 + k, { w: 4, color: P.light }); } }
    if (type === 'water') { shape(circ(cx, cy, r), id, P.water); for (let k = -1; k <= 1; k++) ink([[cx - r * 0.6, cy + k * r * 0.35], [cx - r * 0.3, cy + k * r * 0.35 - r * 0.15], [cx, cy + k * r * 0.35], [cx + r * 0.3, cy + k * r * 0.35 - r * 0.15], [cx + r * 0.6, cy + k * r * 0.35]], id + 20 + k, { w: 5, color: P.light }); }
    if (type === 'earth') { shape(circ(cx, cy, r), id, P.earth); shape(rectP(cx - r * 0.45, cy - r * 0.45, r * 0.9, r * 0.9), id + 30, '#7FB069', { line: 4, smooth: false }); }
    if (type === 'fire') { shape(circ(cx, cy, r), id, P.fire); shape([[cx, cy - r * 0.7], [cx + r * 0.4, cy], [cx + r * 0.25, cy + r * 0.5], [cx - r * 0.25, cy + r * 0.5], [cx - r * 0.4, cy]], id + 40, P.air, { line: 4 }); }
  }
  function poly(pts, id, fill, w = 4) { shape(pts, id, fill, { smooth: false, line: 0 }); if (w) pts.forEach((p, i) => ink([p, pts[(i + 1) % pts.length]], id * 10 + i, { w, amp: 0.8 })); }
  function footer(n, dark) { const c = dark ? P.light : P.ink; label('LADEEDA WORLDS', 60, H - 70, 30, c, { align: 'left', weight: 700 }); label(`${n}/${N}`, W - 60, H - 70, 30, c, { align: 'right', weight: 700 }); if (n < N) hand('swipe >', CX, H - 70, 46, dark ? P.highlight : P.red); }
  function header(n, lines) {                          // numbered reason header
    const c = SEC[(n - 1) % SEC.length];
    shape(circ(CX, 130, 62), 10, c, { line: 5 }); label(String(n), CX, 136, 76, P.light, { weight: 700 });
    label(`REASON ${n}`, CX, 228, 34, c, { weight: 700 });
    lines.forEach((l, i) => hand(l, CX, 300 + i * 76, 76, P.ink));
  }
  function caption(lines) { lines.forEach((l, i) => label(l, CX, H - 240 + i * 50, 38, P.ink, { weight: 600 })); }
  const zone = (fn) => scaled(CX, CY, K, fn);
  const slide = (bg, fn) => () => { ground(bg); fn(); };

  return {
    s1: slide(P.ink, () => {                             // cover
      hand('Why it sucks to be', CX, 190, 92, P.light);
      hand('THE AVATAR', CX, 330, 170, P.highlight);
      card(CX, 450, 520, 90, P.accent2, 20, -2); label('IN SEVEN HAVENS', CX, 452, 46, P.ink, { weight: 700 });
      zone(() => { const cy = CY + 110; burst(CX, cy - 150, 220, 30, 16, P.highlight);
        ['air', 'water', 'earth', 'fire'].forEach((t, i) => { const a = -Math.PI / 2 + i * TAU / 4 + 0.6; element(t, CX + Math.cos(a) * 260, cy - 110 + Math.sin(a) * 110, 50, 40 + i * 60); });
        person(CX, cy + 190, 0.9, { char: 'pavi', arms: 'up', face: 'glow', id: 300 }); });
      label('7 reasons you would not want this job', CX, H - 200, 38, P.light, { weight: 600 });
      footer(1, true);
    }),
    s2: slide(P.paper, () => {                           // the setting
      label('THE SETTING', CX, 130, 34, P.red, { weight: 700 });
      hand('The world you', CX, 220, 82, P.ink); hand('remember is gone', CX, 300, 82, P.ink);
      zone(() => { const ty = CY - 200;
        ink([[150, ty], [930, ty]], 50, { w: 8 }); [['AANG', 200, P.air], ['KORRA', 420, P.water], ['NOW', 880, P.red]].forEach(([n, px, c], i) => { shape(circ(px, ty, 28), 60 + i, c, { line: 5 }); label(n, px, ty - 58, 32, n === 'NOW' ? P.red : P.ink, { weight: 700 }); });
        ink([[450, ty + 50], [850, ty + 50]], 70, { w: 6, color: P.red }); hand('+225 YEARS', 650, ty + 100, 60, P.red);
        [[260, 0], [470, -40], [700, 10], [880, -30], [360, 150], [600, 170], [830, 160]].forEach(([sx, dy], i) => ringWall(sx, CY + 90 + dy, 62, 80 + i * 20, i === 5 ? P.highlight : '#EBD6A6'));
        card(600, CY + 270, 200, 64, P.light, 79); label('ELORA', 600, CY + 272, 34, P.ink, { weight: 700 }); });
      caption(['The nations are gone. Survivors hide', 'behind the walls of seven havens.']);
      footer(2);
    }),
    s3: slide('#E9DDC2', () => {
      header(1, ['Your last life', 'is the villain']);
      zone(() => { card(CX, CY + 30, 760, 470, P.light, 100, 1); label('HISTORY · GRADE 6', CX, CY - 160, 30, P.grey, { weight: 700 });
        person(CX - 190, CY + 170, 0.8, { char: 'korra', face: 'calm', id: 110 }); label('AVATAR KORRA', CX - 190, CY + 205, 28, P.ink, { weight: 700 });
        x.save(); x.translate(CX + 150, CY + 10); x.rotate(-6 * Math.PI / 180); hand('CAUSED THE', 0, -50, 66, P.red); hand('CATACLYSM', 0, 30, 82, P.red); x.restore(); });
      caption(['Every kid learns that Avatar Korra', 'broke the world. That was you.']);
      footer(3);
    }),
    s4: slide(P.paper, () => {
      header(2, ['Two elements', '= a crime']);
      zone(() => { element('water', CX - 220, CY - 60, 90, 200); label('1 ELEMENT', CX - 220, CY + 70, 34, P.ink, { weight: 700 }); hand('OK', CX - 220, CY + 140, 70, P.ok);
        element('water', CX + 160, CY - 60, 90, 220); element('fire', CX + 290, CY - 60, 90, 260);
        for (let i = 0; i < 6; i++) ink([[CX + 90 + i * 50, CY - 170], [CX + 90 + i * 50, CY + 50]], 300 + i, { w: 10 });
        label('2+ ELEMENTS', CX + 225, CY + 100, 34, P.ink, { weight: 700 }); card(CX + 225, CY + 175, 260, 80, P.red, 320, -3); label('PRISON', CX + 225, CY + 177, 44, P.light, { weight: 700 }); });
      caption(['Bend a second element in public and', 'you go to prison. Or worse.']);
      footer(4);
    }),
    s5: slide(P.paper, () => {
      header(3, ['Everyone is', 'hunting you']);
      zone(() => { hand('FIND THE AVATAR', CX, CY - 220, 72, P.red);
        person(CX - 230, CY + 230, 0.95, { top: P.fire, arms: 'point', face: 'angry', id: 400 }); person(CX + 230, CY + 230, 0.95, { top: P.grey, arms: 'point', face: 'angry', flip: -1, id: 440 });
        shape(circ(CX, CY - 40, 50), 480, P.highlight, { line: 5 }); label('?', CX, CY - 34, 60, P.ink, { weight: 700 });
        label('BENDERS', CX - 230, CY + 280, 30, P.ink, { weight: 700 }); label('NON-BENDERS', CX + 230, CY + 280, 30, P.ink, { weight: 700 }); });
      caption(['Benders and non-benders finally agree', 'on one thing: find the Avatar.']);
      footer(5);
    }),
    s6: slide(P.paper, () => {
      header(4, ['Your twin', 'takes the fall']);
      zone(() => { person(CX - 300, CY + 230, 0.95, { char: 'pavi', face: 'scared', id: 500 }); label('YOU', CX - 300, CY + 280, 32, P.ink, { weight: 700 });
        person(CX, CY + 230, 0.95, { char: 'nisha', face: 'calm', id: 540 }); label('YOUR SISTER', CX, CY + 280, 32, P.ink, { weight: 700 });
        person(CX + 300, CY + 230, 0.85, { char: 'karthik', arms: 'point', flip: -1, id: 580 }); label('KARTHIK', CX + 300, CY + 280, 32, P.ink, { weight: 700 });
        hand('"THE AVATAR!"', CX + 150, CY - 230, 70, P.red); ink([[CX + 230, CY - 120], [CX + 70, CY - 60]], 620, { w: 8, color: P.red }); });
      caption(['The army thinks your twin is the Avatar.', 'Stay hidden, or save her?']);
      footer(6);
    }),
    s7: slide(P.paper, () => {
      header(5, ['No teachers', 'left']);
      zone(() => { label("AANG'S TEACHERS", CX - 230, CY - 230, 30, P.ink, { weight: 700 }); label('YOUR TEACHERS', CX + 230, CY - 230, 30, P.ink, { weight: 700 });
        [['water', 'KATARA'], ['earth', 'TOPH'], ['fire', 'ZUKO'], ['air', 'MONKS']].forEach(([t, n], i) => { const gx = CX - 320 + (i % 2) * 180, gy = CY - 90 + Math.floor(i / 2) * 210; element(t, gx, gy, 62, 700 + i * 60); label(n, gx, gy + 92, 26, P.ink, { weight: 700 });
          const ex = CX + 140 + (i % 2) * 180; shape(circ(ex, gy, 62), 960 + i, '#DDD2BE'); cross(ex, gy, 40, 980 + i * 2); });
        ink([[CX, CY - 200], [CX, CY + 240]], 990, { w: 4, color: P.grey }); });
      caption(['Aang had the best teachers alive. You have', 'a secret society hiding in the shadows.']);
      footer(7);
    }),
    s8: slide('#C9A86A', () => {
      header(6, ['The job is', 'forbidden']);
      zone(() => { [[CX - 230, 'NEEDED', '#4F8A3C', 'calm', 'up', 'to keep peace with the spirits', -3], [CX + 230, 'WANTED', P.red, 'scared', 'down', 'bending 2+ elements', 3]].forEach(([px, t, c, f, a, note, r], i) => {
          card(px, CY + 30, 400, 470, P.light, 1000 + i * 10, r); hand(t, px, CY - 165, 78, c); person(px, CY + 160, 0.55, { char: 'pavi', face: f, arms: a, id: 1020 + i * 40 }); label(note, px, CY + 200, 22, P.ink, { weight: 600 }); }); });
      caption(['The world needs an Avatar to keep the peace.', 'It also made being one illegal.']);
      footer(8);
    }),
    s9: slide(P.night, () => {
      const c = SEC[6]; shape(circ(CX, 130, 62), 10, c, { line: 5 }); label('7', CX, 136, 76, P.light, { weight: 700 });
      label('REASON 7', CX, 228, 34, c, { weight: 700 }); hand('The cycle', CX, 300, 76, P.light); hand('is breaking', CX, 376, 76, P.light);
      zone(() => { for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i / 8 * TAU; shape(circ(CX + Math.cos(a) * 270, CY + Math.sin(a) * 250, 30), 1100 + i, [P.air, P.water, P.earth, P.fire][i % 4], { line: 4 }); }
        ink(circ(CX, CY, 270, 250, 30), 1120, { w: 6, color: P.spirit, closed: true }); x.fillStyle = P.night; x.fillRect(CX + 200, CY + 60, 90, 120); ink([[CX + 225, CY + 70], [CX + 265, CY + 170]], 1130, { w: 9, color: P.red });
        [['pavi', CX - 80, 1], ['nisha', CX + 80, -1]].forEach(([ch, px, f], i) => { x.save(); x.shadowColor = P.spirit; x.shadowBlur = 30; person(px, CY + 170, 0.55, { char: ch, face: 'glow', flip: f, id: 1140 + i * 40 }); x.restore(); });
        hand('two of you?', CX, CY - 140, 60, P.highlight); });
      lines(['Ripped out, rebuilt, nearly destroyed.', 'And now there may be two Avatars.']);
      footer(9, true);
      function lines(ls) { ls.forEach((l, i) => label(l, CX, H - 240 + i * 50, 38, P.light, { weight: 600 })); }
    }),
    s10: slide(P.ink, () => {                            // call to action
      hand('So, would you', CX, 200, 90, P.light); hand('hide, or reveal yourself?', CX, 290, 80, P.highlight);
      zone(() => { [[CX - 180, P.water, 'STAY HIDDEN'], [CX + 180, P.fire, 'REVEAL YOURSELF']].forEach(([px, c, t], i) => { poly(rectP(px - 110, CY - 220, 220, 380), 1200 + i * 5, c, 5); x.fillStyle = P.highlight; x.beginPath(); x.arc(px + 75, CY - 30, 12, 0, TAU); x.fill(); label(t, px, CY + 210, 30, P.light, { weight: 700 }); });
        hand('?', CX, CY - 40, 120, P.light); });
      label('Full video on YouTube', CX, H - 250, 42, P.light, { weight: 700 }); hand('Ladeeda Worlds', CX, H - 180, 70, P.highlight);
      footer(10, true);
    }),
  };
};
