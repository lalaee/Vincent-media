// Worked example: "Why it sucks to be the Avatar in Seven Havens" (series video 1).
// Custom scenes are drawn with the engine vocabulary; recurring explainer beats use patterns.js (one line each).
import * as PT from './patterns.js';

export default (E) => {
  const { x, P, W, H, TAU, D2R, on, pop, prog, wt, ink, shape, circ, rectP, hand, label, scaled, person, card, burst, cross, star, ground, wisp, ringWall, lerp, eo, clamp, hash } = E;
  // series glyphs: the four elements (this series' recurring icon set)
  function element(type, cx, cy, r, id = 1) {
    if (type === 'air') { shape(circ(cx, cy, r), id, P.air); for (let k = 0; k < 3; k++) { const Pt = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * 4.4 + k * 2.1, rr = r * 0.75 * (1 - i / 14); Pt.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } ink(Pt, id + 10 + k, { w: 4, color: P.light }); } }
    if (type === 'water') { shape(circ(cx, cy, r), id, P.water); for (let k = -1; k <= 1; k++) ink([[cx - r * 0.6, cy + k * r * 0.35], [cx - r * 0.3, cy + k * r * 0.35 - 12], [cx, cy + k * r * 0.35], [cx + r * 0.3, cy + k * r * 0.35 - 12], [cx + r * 0.6, cy + k * r * 0.35]], id + 20 + k, { w: 5, color: P.light }); }
    if (type === 'earth') { shape(circ(cx, cy, r), id, P.earth); shape(rectP(cx - r * 0.45, cy - r * 0.45, r * 0.9, r * 0.9), id + 30, '#7FB069', { line: 4, smooth: false }); }
    if (type === 'fire') { shape(circ(cx, cy, r), id, P.fire); shape([[cx, cy - r * 0.7], [cx + r * 0.4, cy], [cx + r * 0.25, cy + r * 0.5], [cx - r * 0.25, cy + r * 0.5], [cx - r * 0.4, cy]], id + 40, P.air, { line: 4 }); }
  }
  const ORBIT = ['air', 'water', 'earth', 'fire'];
  const glyph = (type) => (cx, cy, r, id) => element(type, cx, cy, r, id);

  return {
    power() {
    ground(P.paper); const k = pop(E.S0 + 0.1);
    for (let i = 0; i < 4; i++) { const t0 = E.S0 + 0.6 + i * 0.35; if (!on(t0)) continue; const a = E.T * 0.6 + i * TAU / 4; scaled(960 + Math.cos(a) * 360, 560 + Math.sin(a) * 200, pop(t0), () => element(ORBIT[i], 960 + Math.cos(a) * 360, 560 + Math.sin(a) * 200, 70, 100 + i * 50)); }
    scaled(960, 820, k, () => person(960, 820, 1.3, { arms: on(wt('powerful')) ? 'up' : 'down', face: on(wt('four')) ? 'glow' : 'calm', id: 10 }));
    if (on(wt('four'))) burst(960, 520, 300, 300, 18, P.air);
    },
    bridge() {
    ground(P.paper); x.fillStyle = P.night; x.fillRect(960, 0, 960, H);
    label('OUR WORLD', 480, 160, 56, P.ink); label('SPIRIT WORLD', 1440, 160, 56, P.spirit);
    for (let i = 0; i < 6; i++) wisp(1250 + (i % 3) * 230, 380 + Math.floor(i / 3) * 300 + Math.sin(E.T * 2 + i) * 12, 46, 400 + i * 10, i % 2 ? P.spirit : P.spirit2);
    const pr = prog(wt('bridge') - 0.3, 0.8); ink([[300, 900], [960, 520], [1620, 900]], 450, { w: 30, color: P.air, len: pr });
    person(960, 540, 0.9, { arms: 'up', face: 'glow', id: 460 });
    },
    prison() {
    ground(P.paper); person(960, 900, 1.4, { face: 'scared', arms: 'cross', id: 500 });
    const sl = on(wt('prison')) ? 1 : prog(E.S0 + 1.5, 0.3) * 0.2; for (let i = 0; i < 7; i++) ink([[560 + i * 133, -40], [560 + i * 133, lerp(-40, 1020, on(wt('prison')) ? eo(clamp((E.T - wt('prison')) / 0.12)) : 0)]], 510 + i, { w: 26 });
    if (on(wt('prison')) && E.T < wt('prison') + 0.35) burst(960, 990, 320, 530, 10);
    if (on(wt('worse'))) hand('or worse...', 960, 120, 90, P.red);
    },
    history() {
    ground('#E9DDC2'); card(960, 560, 1100, 760, P.light, 600, -2);
    label('HISTORY  ·  GRADE 6', 960, 230, 40, P.grey); person(700, 820, 0.95, { face: 'calm', arms: 'up', id: 610 });
    if (on(wt('hero'))) { x.save(); x.translate(1180, 470); x.rotate(-8 * D2R); hand('HERO', 0, 0, 150, P.earth); x.restore(); }
    if (on(wt('villain'))) { ink([[1000, 520], [1380, 400]], 620, { w: 14, color: P.red }); x.save(); x.translate(1190, 700); x.rotate(6 * D2R); scaled(0, 0, pop(wt('villain')), () => hand('VILLAIN', 0, 0, 160, P.red)); x.restore(); ink([[640, 610], [760, 560]], 630, { w: 10 }); ink([[640, 560], [760, 610]], 631, { w: 10 }); }
    },
    broken() {
    ground(P.paper); const k = pop(E.S0 + 0.1);
    scaled(960, 540, k, () => { shape(circ(960, 540, 330), 700, P.water); shape([[760, 420], [880, 330], [1020, 380], [980, 520], [840, 560]], 701, P.earth); shape([[1050, 600], [1180, 520], [1240, 660], [1120, 760]], 702, P.earth); });
    if (on(wt('broken'))) { const cr = prog(wt('broken'), 0.4); ink([[960, 210], [920, 380], [1010, 520], [930, 700], [990, 870]], 710, { w: 12, len: cr }); ink([[1010, 520], [1180, 470], [1290, 540]], 711, { w: 9, len: cr }); }
    if (on(wt('200'))) hand('200 YEARS', 960, 960, 100, P.red);
    if (on(wt('broke'))) { person(1540, 900, 0.9, { face: 'scared', id: 720 }); ink([[1300, 380], [1460, 600]], 730, { w: 12, color: P.red }); hand('"the one who broke it"', 1500, 300, 60, P.red); }
    },
    nations() {
    ground(P.paper); [['fire', 'FIRE NATION', 360], ['earth', 'EARTH KINGDOM', 760], ['water', 'WATER TRIBES', 1160]].forEach(([e, n, px], i) => {
      const t0 = wt(n.split(' ')[0].toLowerCase(), E.S0) - 0.1; scaled(px, 380, pop(t0), () => { element(e, px, 380, 120, 1100 + i * 60); label(n, px, 560, 40); }); if (on(t0 + 0.45)) cross(px, 380, 110, 1180 + i * 2); });
    if (on(wt('cities'))) { const k = pop(wt('cities')); scaled(1560, 700, k, () => { [[1430, 380, 90, 360], [1530, 280, 110, 460], [1650, 430, 80, 310]].forEach(([bx, by, bw, bh], i) => shape(rectP(bx, by, bw, bh), 1200 + i, ['#9AA5B1', '#7C8794', '#B3BCC6'][i], { smooth: false })); }); label('KORRA ERA', 1560, 820, 40, P.grey);
      if (on(wt('radios'))) hand('radios · cars · skyscrapers', 1560, 900, 54, P.ink); if (on(wt('radios') + 1.0)) cross(1560, 560, 170, 1220); }
    },
    cataclysm() {
    ground(P.ink); const k = prog(wt('cataclysm') - 0.2, 0.6);
    scaled(960, 540, 1 + k * 0.1, () => { shape(circ(960, 540, 300), 1300, '#2C3E50'); burst(960, 540, 300 + 500 * k, 1310, 22, P.fire); burst(960, 540, 200 + 300 * k, 1340, 16, P.air); });
    if (on(wt('cataclysm'))) hand('THE CATACLYSM', 960, 540, 170, P.light);
    if (on(wt('lost'))) for (let i = 0; i < 6; i++) { const u = clamp((E.T - wt('lost')) / 1.5); card(400 + i * 220, 880 + u * 240 + i * 10, 140, 180, P.light, 1360 + i, (i - 3) * 9 + u * 40); }
    },
    walls() {
    ground(P.sand); shape(rectP(0, 620, 1920, 460), 2000, '#C9A86A', { smooth: false }); for (let i = 0; i < 12; i++) shape(rectP(i * 170 - 20, 540, 150, 120), 2010 + i, '#B98F52', { smooth: false });
    const threats = [['bandits', 300], ['disasters', 960], ['spirit', 1620]];
    threats.forEach(([wd, px], i) => { const t0 = wt(wd); if (!on(t0)) return; const bob = Math.sin((E.T - t0) * 9) * 6;
      if (i === 0) person(px, 420 + bob, 0.7, { top: '#5A4A3A', hair: 'bob', face: 'angry', arms: 'point', id: 2100 });
      if (i === 1) { for (let k = 0; k < 6; k++) ink([[px - 120 + k * 20, 140 + k * 50], [px + 120 - k * 20, 160 + k * 50]], 2110 + k, { w: 12, color: P.grey }); }
      if (i === 2) wisp(px, 330 + bob, 90, 2130, P.spirit2);
      label(['BANDITS', 'DISASTERS', 'SPIRITS'][i], px, 520, 44, P.ink, { weight: 700 }); });
    person(960, 1000, 0.8, { face: 'scared', id: 2150 }); person(1180, 1000, 0.7, { face: 'scared', top: P.earth, hair: 'bob', id: 2160 });
    },
    pastlives() {
    ground(P.night); const ppl = [['white', P.fire, P.skinA, 'ROKU', wt('roku')], ['bald', P.air, P.skinA, 'AANG', wt('aang')], ['tail', P.water, P.skinK, 'KORRA', wt('korra')]];
    ppl.forEach(([hr, c, sk, n, t0], i) => {                       // dim "statues" from the start, full colour when named
      const px = 420 + i * 540, lit = on(t0 - 0.2);
      scaled(px, 760, lit ? 1 + 0.12 * Math.sin(Math.PI * E.prog(t0 - 0.2, 0.45)) : pop(E.S0 + 0.3 + i * 0.25), () => {
        x.save(); if (!lit) x.globalAlpha = 0.3; person(px, 760, 1.0, { hair: hr, top: c, skin: sk, arrow: hr === 'bald', id: 2300 + i * 40 }); x.restore();
        if (lit) label(n, px, 860, 52, P.light, { weight: 700 }); }); });
    if (!on(wt('statues'))) { if (on(E.S0 + 0.3)) hand('YOUR PAST LIVES', 960, 140, 96, P.spirit); if (on(wt('asset'))) hand('= your greatest asset', 960, 250, 64, P.light); }
    if (on(wt('aang'))) ink([[450, 385], [540, 300], [840, 300], [930, 385]], 2420, { w: 10, color: P.spirit, len: prog(wt('aang'), 0.5) });     // Aang <-> Roku
    if (on(wt('korra'))) ink([[990, 385], [1080, 300], [1380, 300], [1470, 385]], 2430, { w: 10, color: P.spirit, len: prog(wt('korra'), 0.5) }); // Korra <-> Aang
    if (on(wt('statues'))) hand('legends · statues · temples', 960, 140, 76, P.air);
    },
    blamed() {
    ground('#E9DDC2'); card(960, 540, 1200, 820, P.light, 2500, 1);
    person(720, 860, 1.0, { hair: 'tail', top: P.water, skin: P.skinK, id: 2510, face: 'calm' }); label('AVATAR KORRA', 720, 940, 44);
    if (on(wt('blames'))) { x.save(); x.translate(1200, 420); x.rotate(-6 * D2R); hand('CAUSED THE', 0, 0, 80, P.red); hand('CATACLYSM', 0, 90, 110, P.red); x.restore(); }
    if (on(wt('holes'))) for (let i = 0; i < 5; i++) shape(circ(1050 + (i % 3) * 170, 640 + Math.floor(i / 3) * 170, 55 + 15 * hash(i), 50, 9, hash(i)), 2550 + i * 3, '#E9DDC2', { line: 4 });
    if (on(wt('shaky'))) hand('history: shaky at best', 960, 1010, 60, P.ink);
    },
    cursing() {
    ground(P.paper); for (let i = 0; i < 4; i++) person(300 + i * 270, 900, 0.75, { top: [P.grey, '#6E7F5E', '#8A6E5A', '#5E6E8A'][i], hair: i % 2 ? 'bob' : 'bun', face: 'angry', arms: 'point', id: 2600 + i * 30 });
    for (let i = 0; i < 4; i++) if (on(wt('cursing') + i * 0.15)) { card(300 + i * 270, 380, 200, 110, P.light, 2720 + i, (i - 1.5) * 6); hand(['#@%!', 'AVATAR!', 'MONSTER', '#!*'][i], 300 + i * 270, 380, 50, P.red); }
    person(1600, 900, 0.95, { face: 'scared', top: P.water, id: 2750, flip: -1 }); if (on(wt('you', wt('stranger')))) hand('YOU.', 1600, 360, 130, P.red);
    },
    boogey() {
    ground(P.night); x.fillStyle = 'rgba(0,0,0,0.5)'; x.beginPath(); x.ellipse(1150, 520, 420 + 20 * Math.sin(E.T * 3), 480, 0, 0, TAU); x.fill();
    shape([[900, 1000], [880, 520], [960, 230], [1150, 120], [1340, 230], [1420, 520], [1400, 1000]], 2800, '#0E1322', { line: 5 });
    x.fillStyle = P.fire; x.beginPath(); x.arc(1080, 360, 22, 0, TAU); x.arc(1220, 360, 22, 0, TAU); x.fill();
    person(420, 960, 0.7, { face: 'scared', top: P.air, hair: 'bob', id: 2850 }); person(600, 960, 0.6, { face: 'scared', top: P.earth, id: 2880 });
    if (on(wt('boogeyman'))) hand('THE BOOGEYMAN', 960, 120, 110, P.light);
    },
    triumph() {
    ground(P.paper); x.fillStyle = '#D8EAF5'; x.fillRect(0, 0, 960, H); x.fillStyle = P.night; x.fillRect(960, 0, 960, H);
    label('AANG · NORTH POLE', 480, 120, 44); person(480, 900, 1.0, { hair: 'bald', mark: P.water, top: P.air, skin: P.skinA, arms: 'up', id: 3100 });
    ink([[300, 520], [400, 420], [560, 430], [660, 520]], 3150, { w: 20, color: P.water }); if (on(wt('triumphs'))) { hand('TRIUMPH', 480, 260, 110, P.water); for (let i = 0; i < 5; i++) star(200 + i * 140, 330 + (i % 2) * 40, 26, 3160 + i * 3); }
    label('YOU · IN SECRET', 1440, 120, 44, P.light);
    if (on(wt('second', E.S0 + 10))) { x.fillStyle = 'rgba(255,240,180,0.22)'; x.beginPath(); x.moveTo(1440, 230); x.lineTo(1200, 900); x.lineTo(1680, 900); x.closePath(); x.fill(); }
    person(1440, 900, 1.0, { face: 'scared', top: P.water, id: 3200 }); if (on(wt('secret'))) hand('shhh...', 1650, 520, 80, P.spirit);
    if (on(wt('killed'))) hand('...can get you killed', 1440, 1010, 64, P.red);
    },
    agree() {
    ground(P.paper); person(700, 900, 1.0, { top: P.fire, arms: 'point', id: 3300, face: 'angry' }); person(1220, 900, 1.0, { top: P.grey, hair: 'bob', arms: 'point', flip: -1, id: 3340, face: 'angry' });
    label('BENDERS', 700, 980, 44); label('NON-BENDERS', 1220, 980, 44);
    if (on(wt('agree'))) { shape(circ(960, 600, 60), 3380, P.skinP); hand('they finally agree:', 960, 200, 80, P.ink); }
    if (on(wt('finding'))) hand('FIND THE AVATAR', 960, 330, 110, P.red);
    },
    draft() {
    ground(P.paper); ink([[120, 820], [1800, 820]], 3400, { w: 10 }); const k = (E.T - E.S0) * 160 % 340;
    for (let i = 0; i < 6; i++) { const px = (i * 340 + k) % 2040 - 120; const soldier = px > 960; person(px, 800, 0.62, { top: soldier ? '#3A3F4A' : [P.air, P.water, P.earth][i % 3], hair: soldier ? 'helmet' : 'bob', id: 3420 + i * 30 }); }
    card(960, 600, 260, 300, P.light, 3600); label('REGISTER', 960, 520, 40, P.red, { weight: 700 }); ink([[880, 600], [1040, 600]], 3610, { w: 6 }); ink([[880, 650], [1040, 650]], 3611, { w: 6 });
    if (on(wt('drafted'))) hand('DRAFTED', 960, 230, 130, P.red); if (on(wt('middle'))) hand('as early as middle school', 960, 980, 70, P.ink);
    },
    karthik() {
    ground(P.night); x.fillStyle = 'rgba(255,240,200,0.18)'; x.beginPath(); x.moveTo(960, 0); x.lineTo(660, 1000); x.lineTo(1260, 1000); x.closePath(); x.fill();
    scaled(960, 960, pop(wt('karthik') - 0.2), () => person(960, 960, 1.4, { top: '#3A3F4A', hair: 'helmet', face: 'angry', arms: 'point', id: 3700 }));
    if (on(wt('karthik'))) { card(960, 150, 620, 110, P.red, 3780); label('COMMANDER KARTHIK', 960, 152, 52, P.light, { weight: 700 }); }
    },
    twins() {
    ground(P.paper); person(640, 900, 1.15, { top: P.water, id: 3800, face: 'scared' }); person(1280, 900, 1.15, { top: P.fire, id: 3850, face: 'calm', flip: -1 });
    label('PAVI', 640, 990, 52, P.ink, { weight: 700 }); if (on(wt('nisha'))) label('NISHA', 1280, 990, 52, P.ink, { weight: 700 });
    if (on(wt('identical'))) hand('IDENTICAL TWINS', 960, 160, 100, P.ink);
    if (on(wt('finds'))) { person(1760, 900, 0.9, { top: '#3A3F4A', hair: 'helmet', face: 'angry', arms: 'point', flip: -1, id: 3900 }); hand('"THE AVATAR!"', 1500, 330, 80, P.red); ink([[1640, 650], [1420, 560]], 3950, { w: 10, color: P.red }); }
    if (on(wt('sister'))) { hand('your sister', 960, 470, 70, P.red); ink([[1080, 500], [1180, 560]], 3960, { w: 8, color: P.red, len: prog(wt('sister'), 0.3) }); }
    },
    split() {
    ground(P.night); const sp = on(wt('two', E.S0 + 10)) ? prog(wt('two', E.S0 + 10), 0.8) : 0;
    x.save(); x.shadowColor = P.spirit; x.shadowBlur = 50; shape(circ(960 - sp * 260, 520, 170 - sp * 30, 210 - sp * 40), 4100, '#E8FFF9', { line: 5 }); if (sp > 0) shape(circ(960 + sp * 260, 520, 140, 170), 4110, '#E8FFF9', { line: 5 }); x.restore();
    if (on(wt('raava'))) hand('RAAVA', 960, 860, 110, P.spirit);
    if (on(wt('one', E.S0 + 6))) label('1 SPIRIT · 1 HUMAN · 1 AVATAR AT A TIME', 960, 140, 48, P.light, { weight: 700 });
    if (sp > 0.5) hand('TWO AVATARS?', 960, 980, 90, P.red);
    },
    support() {
    ground(P.paper); label('YOUR SUPPORT SYSTEM', 960, 120, 56, P.ink, { weight: 700 });
    scaled(400, 560, pop(wt('white') - 0.1), () => { shape(circ(400, 500, 160), 4700, P.light); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; shape(circ(400 + Math.cos(a) * 80, 500 + Math.sin(a) * 80, 50), 4710 + i * 3, '#F7F3EA', { line: 3 }); } label('WHITE LOTUS', 400, 740, 44); hand('(hiding)', 400, 810, 50, P.grey); });
    if (on(wt('hoverboard'))) scaled(960, 700, pop(wt('hoverboard') - 0.2), () => { person(960, 640 + Math.sin(E.T * 4) * 10, 0.8, { top: '#3A3F4A', hair: 'bob', arms: 'wave', id: 4800 }); shape([[820, 680], [1100, 680], [1080, 720], [840, 720]], 4840, P.air); label('JAE', 960, 800, 44); });
    if (on(wt('geet'))) scaled(1520, 700, pop(wt('geet') - 0.2), () => { shape(circ(1520, 620, 150, 120), 4900, '#C98C4A'); shape([[1420, 520], [1440, 440], [1480, 510]], 4910, '#C98C4A', { line: 4 }); shape([[1620, 520], [1600, 440], [1560, 510]], 4920, '#C98C4A', { line: 4 }); x.fillStyle = P.ink; x.beginPath(); x.arc(1480, 600, 12, 0, TAU); x.arc(1560, 600, 12, 0, TAU); x.fill(); label('GEET', 1520, 800, 44); });
    },
    portal() {
    ground(P.night); for (let i = 0; i < 9; i++) shape(rectP(120 + i * 200, 1080 - 200 - (i * 97 % 300), 150, 220 + (i * 97 % 300)), 5000 + i, '#2E3B55', { smooth: false });
    const g = x.createLinearGradient(960, 0, 960, 1080); g.addColorStop(0, 'rgba(63,193,176,0.1)'); g.addColorStop(1, 'rgba(63,193,176,0.9)'); x.fillStyle = g; x.fillRect(900, 0, 120, 1000);
    shape(circ(960, 960, 220, 60), 5050, P.spirit, { line: 5 }); for (let i = 0; i < 5; i++) { const u = ((E.T - E.S0) * 0.25 + i / 5) % 1; wisp(960 + Math.sin(i * 2 + E.T) * 200 * u, 900 - u * 520, 40, 5060 + i * 10, i % 2 ? P.spirit : P.spirit2); }
    if (on(wt('portal'))) hand('REPUBLIC CITY SPIRIT PORTAL', 960, 120, 70, P.light);
    if (on(wt('hope'))) hand('an act of hope', 960, 280, 80, P.air);
    },
    cycle() {
    ground(P.night); const n = 8; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i / n * TAU + E.T * 0.1; shape(circ(960 + Math.cos(a) * 330, 540 + Math.sin(a) * 330, 46), 5300 + i * 5, [P.air, P.water, P.earth, P.fire][i % 4], { line: 4 }); }
    ink(circ(960, 540, 330, 330, 30), 5350, { w: 6, color: P.spirit, closed: true }); label('THE AVATAR CYCLE', 960, 540, 54, P.light, { weight: 700 });
    if (on(wt('broken'))) { x.fillStyle = P.night; x.fillRect(1200, 640, 120, 160); ink([[1230, 650], [1290, 790]], 5360, { w: 10, color: P.red }); hand('nearly broken', 960, 980, 80, P.red); }
    },
    lightning() {
    ground(P.night); person(1300, 900, 1.2, { hair: 'bald', mark: P.water, top: P.air, skin: P.skinA, face: 'glow', arms: 'up', id: 5400 });
    person(400, 900, 1.0, { top: P.fire, hair: 'bun', face: 'angry', arms: 'point', id: 5450 }); label('AZULA', 400, 990, 44, P.light, { weight: 700 });
    if (on(wt('lightning'))) { const Pt = [[560, 560]]; for (let i = 1; i <= 8; i++) Pt.push([560 + i * 85, 560 - 60 + hash(i + E.B * 3) * 120]); ink(Pt, 5500, { w: 14, color: '#9FD8FF', amp: 6 }); if (E.T < wt('lightning') + 0.25) { x.fillStyle = 'rgba(200,230,255,0.5)'; x.fillRect(0, 0, W, H); } }
    if (on(wt('forever'))) hand('the cycle ends forever', 960, 140, 80, P.red);
    },
    vaatu() {
    const tL = wt('lotus'), tR = wt('ripped', tL), tT = wt('two', tR), tU = wt('uncertain', tT);
    if (!on(tL - 0.3)) {
    ground('#14101E'); x.save(); x.shadowColor = P.spirit; x.shadowBlur = 40; shape(circ(800, 520, 150, 190), 5600, '#E8FFF9'); x.restore(); label('RAAVA', 800, 780, 48, P.light, { weight: 700 });
    shape([[1500, 300], [1340, 420], [1300, 640], [1420, 820], [1640, 760], [1700, 520]], 5650, '#2A0E2E'); x.fillStyle = P.red; x.beginPath(); x.arc(1450, 500, 18, 0, TAU); x.arc(1560, 500, 18, 0, TAU); x.fill(); label('VAATU', 1500, 900, 48, P.light, { weight: 700 });
    if (on(wt('tore'))) for (let i = 0; i < 6; i++) ink([[950, 400 + i * 40], [1300, 420 + i * 45]], 5700 + i, { w: 8, color: P.spirit2, len: prog(wt('tore'), 0.4) });
    if (on(wt('gone'))) { ['AANG', 'ROKU', 'KYOSHI'].forEach((n, i) => { card(500 + i * 460, 160, 300, 90, P.light, 5800 + i); label(n, 500 + i * 460, 162, 44, P.ink, { weight: 700 }); ink([[380 + i * 460, 160], [620 + i * 460, 160]], 5810 + i, { w: 8, color: P.red }); }); }
      if (on(wt('reborn'))) hand('reborn', 800, 300, 70, P.spirit);
      return; }
    if (!on(tR - 0.3)) {                                   // the Red Lotus attacks Korra in the Avatar State
      ground('#1E1420'); label('THE RED LOTUS', 960, 120, 56, P.red, { weight: 700 });
      x.save(); x.shadowColor = P.spirit; x.shadowBlur = 50; person(960, 900, 1.25, { char: 'korra', face: 'glow', arms: 'up', id: 5900 }); x.restore();
      [[380, 1], [640, 1], [1300, -1], [1560, -1]].forEach(([px, f], i) => scaled(px, 900, pop(tL + 0.15 * i), () => person(px, 900, 0.85, { top: P.red, hair: 'bald', mask: true, face: 'angry', arms: 'point', flip: f, id: 5950 + i * 30 })));
      if (on(wt('killing', tL))) hand('tried to end the cycle', 960, 250, 80, P.light);
      if (on(wt('state', tL))) label('AVATAR STATE', 960, 990, 40, P.spirit, { weight: 700 });
      return; }
    if (!on(tT - 0.3)) {                                   // ripped out, rebuilt, nearly destroyed
      ground('#14101E'); const steps = [['ripped', 'ripped out'], ['rebuilt', 'rebuilt'], ['destroyed', 'nearly destroyed']];
      steps.forEach(([w, txt], i) => { const t0 = wt(w, tR - 0.1); if (!on(t0)) return; const cx = 400 + i * 560;
        scaled(cx, 480, pop(t0), () => { x.save(); x.shadowColor = P.spirit; x.shadowBlur = 40; shape(circ(cx, 480, 110 - i * 15, 140 - i * 20), 6050 + i * 5, i === 2 ? '#9FBFB8' : '#E8FFF9'); x.restore();
          if (i === 0) for (let k = 0; k < 4; k++) ink([[cx + 120, 440 + k * 30], [cx + 230, 450 + k * 34]], 6070 + k, { w: 7, color: P.spirit2 });
          if (i === 2) { ink([[cx - 20, 360], [cx + 15, 450], [cx - 25, 520], [cx + 10, 600]], 6080, { w: 7, color: P.ink }); } });
        hand(txt, cx, 760, 76, i === 2 ? P.red : P.light); });
      if (on(wt('inheriting', tR - 6))) label('YOUR SPIRIT', 960, 140, 50, P.spirit, { weight: 700 });
      return; }
    ground(P.night);                                       // now there may be two of you
    [['pavi', 760, 1], ['nisha', 1160, -1]].forEach(([c, px, f], i) => scaled(px, 880, pop(tT + 0.25 * i), () => { x.save(); x.shadowColor = P.spirit; x.shadowBlur = 40; person(px, 880, 1.1, { char: c, face: 'glow', flip: f, id: 6100 + i * 40 }); x.restore(); }));
    scaled(960, 300, pop(tT + 0.4), () => hand('two of you?', 960, 300, 110, P.highlight || P.light));
    if (on(tU)) hand('the most uncertain Avatar ever', 960, 1010, 70, P.red);
    },
    title: PT.titleCard(E, { kicker: 'Why it sucks to be', title: 'THE AVATAR', sub: 'IN SEVEN HAVENS', subWord: 'seven', titleWord: 'avatar', icons: ORBIT, drawIcon: element }),
    warning: PT.warning(E, { text: 'SPOILERS: EPISODES 1-3 ONLY', word: 'premise' }),
    timeline: PT.timeline(E, { eras: [{ name: 'AANG', color: P.air }, { name: 'KORRA', color: P.water }, { name: 'NOW', color: P.red, word: '225' }],
      gap: { word: '225', text: '+225 YEARS' }, caption: { word: 'gone', text: 'the world you remember is gone' } }),
    smaller: PT.bars(E, { title: 'vs. every era before', bars: [{ label: 'SMALLER', color: P.water, word: 'smaller' }, { label: 'POORER', color: P.earth, word: 'poorer' }, { label: 'MORE FRIGHTENED', color: P.fire, word: 'frightened' }], end: { word: 'hide', text: 'They hide.' } }),
    havens: PT.walledMap(E, { sites: [[380, 330], [820, 250], [1350, 300], [1650, 600], [1180, 760], [600, 760], [250, 690]], title: '7 HAVENS', titleWord: 'havens', highlight: { index: 5, word: 'elora', name: 'ELORA' } }),
    rule: PT.rule(E, { left: { label: '1 ELEMENT', draw: glyph('water') }, right: { label: '2+ ELEMENTS', word: 'more', draw: (cx, cy, r, id) => { element('water', cx - 80, cy, r, id); element('fire', cx + 80, cy, r, id + 40); } }, verdict: { word: 'imprisoned', text: 'PRISON' } }),
    halves: PT.versus(E, { left: { bg: P.air, who: { char: 'pavi', top: P.air, face: 'calm', arms: 'wave' }, word: 'playfulness', text: "AANG'S PLAYFULNESS" }, right: { bg: P.fire, who: { char: 'nisha', face: 'angry', arms: 'up' }, word: 'fight', text: "KORRA'S FIGHT & FIRE" }, footer: { word: 'split', text: 'THE AVATAR, SPLIT IN TWO?' } }),
    doors: PT.twoDoors(E, { a: { text: 'STAY HIDDEN', color: P.water, word: 'stay' }, b: { text: 'REVEAL YOURSELF', color: P.fire, word: 'reveal' } }),
    teachers: PT.roster(E, { leftTitle: "AANG'S TEACHERS", rightTitle: 'YOUR TEACHERS', goneWord: 'gone', caption: { word: 'criminal', text: 'teaching you = helping a criminal' },
      items: [{ name: 'KATARA', word: 'katara', draw: glyph('water') }, { name: 'TOPH', word: 'toph', draw: glyph('earth') }, { name: 'ZUKO', word: 'zuko', draw: glyph('fire') }, { name: 'MONKS', word: 'monks', draw: glyph('air') }] }),
    posters: PT.posterPair(E, { left: { title: 'NEEDED', note: 'to keep peace with the spirits', who: { char: 'pavi', arms: 'up' } }, right: { title: 'WANTED', note: 'bending 2+ elements', word: 'illegal', titleAt: 0.6, who: { char: 'pavi', face: 'scared' } } }),
    recap: ((f) => () => { f(); if (!on(wt('broken', E.S0))) scaled(960, 560, pop(E.S0 + 0.3), () => { hand('7 reasons it sucks', 960, 520, 150, P.red); }); })(PT.checklist(E, { lines: [['broken', 'a broken world'], ['blamed', 'your last life is blamed'], ['imprisoned', '2 elements = prison'], ['army', 'friends drafted to hunt you'], ['place', 'your twin hunted in your place'], ['teachers', 'no teachers'], ['walls', 'spirits at the walls'], ['falling', 'the cycle may be falling apart']] })),
    next: PT.nextTease(E, { cast: ['korra', 'aang', 'roku', 'kid', 'kid2', 'pavi'], fadeWord: 'died', buttonWord: 'next', lines: [['harder', 'never a harder time'], ['died', 'how every Avatar died', P.red]] }),
    sec1: E.sectionCard(1), sec2: E.sectionCard(2), sec3: E.sectionCard(3), sec4: E.sectionCard(4), sec5: E.sectionCard(5), sec6: E.sectionCard(6), sec7: E.sectionCard(7),
  };
};
