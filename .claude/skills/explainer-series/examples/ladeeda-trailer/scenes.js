// Ladeeda Worlds channel trailer: the Backrooms, a deadly planet, the worst year in history, then the channel pitch,
// the four kinds of world, the three formats, and "pick a door".
import * as PT from './patterns.js';

export default (E) => {
  const { x, P, W, H, TAU, on, pop, prog, wt, ink, shape, circ, rectP, hand, label, scaled, person, card, burst, cross, star, ground, wisp, hash } = E;
  const you = (cx, cy, s, o = {}) => person(cx, cy, s, { char: 'you', ...o });
  const lerp = (a, b, t) => a + (b - a) * t;
  function poly(pts, id, fill, w = 4) { shape(pts, id, fill, { smooth: false, line: 0 }); if (w) pts.forEach((p, i) => ink([p, pts[(i + 1) % pts.length]], id * 10 + i, { w, amp: 0.8 })); }

  // ---- world glyphs, reused in tiles, title icons and doors
  function backroomsTile(cx, cy, w, h, id) {          // a yellow corridor in perspective
    const x0 = cx - w / 2, y0 = cy - h / 2, fx = w * 0.22, fy = h * 0.3;
    poly(rectP(x0, y0, w, h), id, P.wall, 0);
    poly([[x0, y0 + h], [x0 + w, y0 + h], [cx + fx, cy + fy], [cx - fx, cy + fy]], id + 1, P.carpet, 3);
    poly([[x0, y0], [x0 + w, y0], [cx + fx, cy - fy], [cx - fx, cy - fy]], id + 2, P.ceiling, 3);
    poly(rectP(cx - fx, cy - fy, fx * 2, fy * 2), id + 3, P.far, 3);
  }
  function planetTile(cx, cy, w, h, id) {
    x.save(); x.beginPath(); x.rect(cx - w / 2, cy - h / 2, w, h); x.clip();
    poly(rectP(cx - w / 2, cy - h / 2, w, h), id, P.sky, 0);
    for (let i = 0; i < 14; i++) { x.fillStyle = '#E8E0FF'; x.fillRect(cx - w / 2 + hash(id + i) * w, cy - h / 2 + hash(id + i * 7) * h * 0.55, 3, 3); }
    shape(circ(cx, cy + h * 0.95, w * 0.85, h * 0.7, 30), id + 1, P.mars, { line: 3 });
    shape(circ(cx + w * 0.28, cy - h * 0.22, w * 0.09), id + 2, '#E9D8A6', { line: 3 });
    x.restore();
  }
  function historyTile(cx, cy, w, h, id, year = '536 AD') {
    poly(rectP(cx - w / 2, cy - h / 2, w, h), id, P.sepia, 0);
    card(cx, cy, w * 0.55, h * 0.62, P.light, id + 1, -3); label(year, cx, cy + 6, Math.round(h * 0.13), P.ink, { weight: 700 });
    x.fillStyle = P.red; x.fillRect(cx - w * 0.27, cy - h * 0.31, w * 0.54, h * 0.1);
  }
  function frame(cx, cy, w, h, id) { const r = rectP(cx - w / 2, cy - h / 2, w, h); r.forEach((p, i) => ink([p, r[(i + 1) % 4]], id * 10 + i, { w: 8, amp: 0.8 })); }
  function door(cx, cy, w, h, fill, id, open = 0) {      // a door in a dark frame; open 0..1 swings it
    poly(rectP(cx - w / 2 - 14, cy - h - 14, w + 28, h + 14), id, '#0C0B11', 4);
    const ww = w * (1 - 0.85 * open); poly(rectP(cx - w / 2, cy - h, ww, h), id + 1, fill, 4);
    x.fillStyle = P.highlight; x.beginPath(); x.arc(cx - w / 2 + ww - 22, cy - h / 2, 9, 0, TAU); x.fill();
  }

  // ---- the Backrooms (scenes 1-2 share it)
  function backrooms(closeHall, flicker) {
    const vx = 960, L = 700, R = 1220, Tp = 300, Bt = 690;
    ground(P.wall);
    poly([[0, 0], [1920, 0], [R, Tp], [L, Tp]], 100, P.ceiling);
    poly([[0, 1080], [1920, 1080], [R, Bt], [L, Bt]], 101, P.carpet);
    poly([[0, 0], [L, Tp], [L, Bt], [0, 1080]], 102, P.wall);
    poly([[1920, 0], [R, Tp], [R, Bt], [1920, 1080]], 103, P.wallDark);
    poly(rectP(L, Tp, R - L, Bt - Tp), 104, P.far);
    if (closeHall > 0) { const k = closeHall; poly(rectP(L, Tp, (R - L) * k, Bt - Tp), 105, P.wall, k < 1 ? 4 : 0); }
    for (let k = 0; k < 3; k++) {                       // ceiling light panels
      const f = 0.18 + k * 0.27, y = lerp(0, Tp, f) + 10, hw = lerp(380, (R - L) / 2 - 40, f), hh = lerp(40, 14, f);
      const lit = !flicker || hash(E.B * 3 + k) > 0.22;
      poly([[vx - hw, y], [vx + hw, y], [vx + hw * 0.92, y + hh], [vx - hw * 0.92, y + hh]], 110 + k, lit ? '#FFFBE0' : '#BDB27A', 3);
      if (lit && flicker) { x.fillStyle = 'rgba(255,250,210,0.10)'; x.fillRect(0, 0, W, H); }
    }
  }

  return {
    backrooms() {
      const closing = on(wt('isnt')) ? prog(wt('isnt'), 1.6) : 0;
      backrooms(closing, on(wt('buzzing')) && !on(wt('walls')));
      if (on(wt('wet'))) for (let i = 0; i < 4; i++) scaled(500 + i * 300, 960 - (i % 2) * 70, pop(wt('wet') + i * 0.12), () => shape(circ(500 + i * 300, 960 - (i % 2) * 70, 120 - i * 10, 26), 130 + i, '#7E7036', { line: 0 }));
      if (on(wt('buzzing'))) for (let k = 0; k < 3; k++) ink([[820 + k * 120, 90], [840 + k * 120, 60], [860 + k * 120, 90], [880 + k * 120, 60]], 140 + k, { w: 5, color: P.ink });
      if (on(wt('direction'))) [[220, 0.9], [480, 0.6], [1440, 0.6], [1700, 0.9]].forEach(([dx, s], i) => scaled(dx, 760, pop(wt('direction') + i * 0.1), () => poly(rectP(dx - 70 * s, 760 - 330 * s, 140 * s, 330 * s), 150 + i, P.far)));
      const look = on(wt('hallway'));
      you(960, 1010, 1.1, { face: on(wt('lights')) ? 'scared' : 'calm', flip: look ? -1 : 1, id: 200 });
      if (on(wt('yellow')) && closing <= 0) hand('every direction.', 960, 500, 64, P.light);
      if (closing >= 1) scaled(960, 500, pop(wt('anymore')), () => hand('?', 960, 500, 220, P.ink));
    },
    badnews() {
      backrooms(1, false); x.fillStyle = 'rgba(20,18,29,0.35)'; x.fillRect(0, 0, W, H);
      you(960, 1010, 1.1, { face: 'scared', id: 200 });
      scaled(960, 300, pop(wt('bad')), () => { card(960, 300, 760, 210, P.light, 300, -4); hand('BAD NEWS.', 960, 310, 150, P.red); });
      if (on(wt('rooms'))) scaled(960, 495, pop(wt('rooms')), () => { card(960, 495, 640, 100, '#111', 310, 2); label('THE BACKROOMS', 960, 497, 58, P.highlight, { weight: 700 }); });
      if (on(wt('somewhere'))) { const g = prog(wt('somewhere'), 0.4); x.fillStyle = `rgba(123,92,214,${0.35 * g})`; for (let i = 0; i < 6; i++) x.fillRect(0, hash(i + E.B) * H, W, 14 + 30 * hash(i * 3 + E.B)); hand('...or somewhere else', 960, 130, 80, P.light); }
    },
    planet() {
      ground(P.sky); for (let i = 0; i < 120; i++) { const tw = 0.5 + 0.5 * Math.sin(E.T * 3 + i); x.fillStyle = `rgba(232,224,255,${0.25 + 0.5 * tw * hash(i)})`; x.fillRect(hash(i * 3.1) * W, hash(i * 7.7) * H * 0.6, 3, 3); }
      shape(circ(960, 1500, 1500, 640, 40), 400, P.mars, { line: 5 });
      for (let i = 0; i < 4; i++) shape(circ(380 + i * 400, 960 + (i % 2) * 40, 70, 20), 410 + i, P.marsDark, { line: 3 });
      you(960, 940, 0.55, { face: 'scared', id: 420 });
      hand('alone.', 960, 220, 100, P.light);
      if (on(wt('wants'))) for (let i = 0; i < 4; i++) { const ex = [220, 520, 1400, 1700][i], ey = [700, 640, 650, 720][i]; x.fillStyle = P.red; x.beginPath(); x.arc(ex - 16, ey, 9, 0, TAU); x.arc(ex + 16, ey, 9, 0, TAU); x.fill(); }
      if (on(wt('dead'))) { const k = prog(wt('dead') - 0.5, 0.5); ink([[1700, 80], [lerp(1700, 1250, k), lerp(80, 760, k)]], 430, { w: 14, color: '#FFB25A' }); if (k >= 1) burst(1250, 790, 220, 440, 16, '#FFB25A'); }
    },
    history() {
      ground(P.sepia); for (let i = 0; i < 7; i++) shape(rectP(160 + i * 240, 120, 200, 840), 500 + i, i % 2 ? '#C29E6C' : '#CFAE7E', { smooth: false, line: 0 });
      const tw = wt('worst'), years = ['1347', '1918', '1816', '79 AD', '1520', '1943', '536 AD'];
      const yi = on(tw) ? years.length - 1 : Math.floor((E.T - E.S0) * 6) % (years.length - 1);
      card(960, 470, 560, 470, P.light, 520, -2); x.fillStyle = P.red; x.fillRect(680, 240, 560, 80); label('YEAR', 960, 282, 44, P.light, { weight: 700 });
      label(years[yi], 960, 500, 130, P.ink, { weight: 700 });
      if (on(tw)) scaled(960, 790, pop(wt('history', tw - 1)), () => { card(960, 790, 900, 120, P.red, 530, 3); label('WORST YEAR IN HISTORY', 960, 792, 58, P.light, { weight: 700 }); });
      if (on(wt('born', tw))) { you(1660, 1030, 0.7, { face: 'scared', id: 540 }); hand('to be born at all.', 1660, 640, 72, P.ink); }
    },
    worlds() {
      ground(P.night);
      const tiles = [[backroomsTile, 380], [planetTile, 960], [historyTile, 1540]];
      tiles.forEach(([fn, cx], i) => scaled(cx, 500, pop(E.S0 + 0.2 + i * 0.25), () => { fn(cx, 500, 500, 380, 600 + i * 20); frame(cx, 500, 500, 380, 690 + i); }));
      if (on(wt('different'))) hand('different worlds.', 960, 140, 90, P.light);
      if (on(wt('same'))) tiles.forEach(([, cx], i) => scaled(cx, 640, pop(wt('same') + i * 0.12), () => you(cx, 640, 0.42, { face: 'scared', id: 700 + i * 30 })));
      if (on(wt('same'))) hand('same problem.', 960, 830, 80, P.highlight);
      if (on(wt('survive'))) { tiles.forEach(([, cx], i) => { if (on(wt('survive') + i * 0.15)) cross(cx, 520, 120, 760 + i * 2); }); hand("you probably wouldn't survive.", 960, 960, 80, P.red); }
    },
    title: PT.titleCard(E, { kicker: 'This is', title: 'LADEEDA WORLDS', titleWord: 'ladeeda', sub: 'HOW BADLY WOULD IT GO FOR YOU?', subWord: 'worlds',
      icons: ['backrooms', 'planet', 'history', 'void'], drawIcon: (ic, cx, cy, r, id) => {
        x.save(); x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.clip();
        if (ic === 'backrooms') backroomsTile(cx, cy, r * 2.2, r * 2.2, id); else if (ic === 'planet') planetTile(cx, cy, r * 2.2, r * 2.2, id); else if (ic === 'history') historyTile(cx, cy, r * 2.2, r * 2.2, id, '536');
        else { shape(circ(cx, cy, r * 1.2), id, P.purple, { line: 0 }); star(cx, cy, r * 0.5, id + 1, P.light); }
        x.restore(); ink(circ(cx, cy, r, r, 24), id + 5, { w: 6, color: P.light, closed: true }); } }),
    drop() {
      ground(P.night); const k = prog(wt('drops'), 1.0);
      x.save(); x.shadowColor = P.purple; x.shadowBlur = 50; shape(circ(960, 900, 420, 90, 30), 800, '#2B1F4A', { line: 6 }); x.restore();
      for (let i = 0; i < 3; i++) ink(circ(960, 900, 340 - i * 100, 70 - i * 20, 24, E.T * (1 + i)), 810 + i, { w: 6, color: P.purple, closed: true });
      if (!on(wt('drops'))) you(960, 520, 1.0, { face: 'calm', id: 830 });
      else if (k < 1) scaled(960, lerp(520, 900, k), 1 - 0.85 * k, () => you(960, lerp(520, 900, k), 1.0, { face: 'scared', arms: 'up', id: 830 }));
      hand('every video:', 960, 140, 80, P.light);
      if (on(wt('different'))) hand('a different place.', 960, 260, 90, P.highlight);
    },
    places() {
      ground(P.night); hand('a new world, every time', 960, 120, 70, P.light);
      const items = [['game', 'A VIDEO GAME', P.purple], ['story', 'A STORY', P.mars], ['universe', 'THE UNIVERSE', '#2A3A6A'], ['moment', 'HISTORY', P.sepiaDark]];
      items.forEach(([w, txt, col], i) => { const t0 = wt(w, E.S0), cx = 300 + i * 440; if (!on(t0)) return;
        scaled(cx, 560, pop(t0), () => { card(cx, 560, 380, 460, col, 900 + i * 20, (i - 1.5) * 3); label(txt, cx, 760, 40, P.light, { weight: 700 });
          if (i === 0) { shape(circ(cx, 520, 130, 70, 20), 905, '#2A2340', { line: 5 }); shape(circ(cx - 60, 520, 18), 906, P.light); shape(circ(cx + 50, 505, 14), 907, P.highlight); shape(circ(cx + 80, 535, 14), 908, P.red); }
          if (i === 1) { shape([[cx - 140, 460], [cx, 490], [cx, 620], [cx - 140, 590]], 925, P.light, { smooth: false }); shape([[cx + 140, 460], [cx, 490], [cx, 620], [cx + 140, 590]], 926, P.light, { smooth: false }); for (let k = 0; k < 3; k++) { ink([[cx - 115, 510 + k * 30], [cx - 25, 528 + k * 30]], 927 + k, { w: 4 }); ink([[cx + 25, 528 + k * 30], [cx + 115, 510 + k * 30]], 930 + k, { w: 4 }); } }
          if (i === 2) { for (let k = 0; k < 40; k++) { const a = k * 0.5 + E.T * 0.4, rr = k * 3.2; x.fillStyle = k % 3 ? '#E8E0FF' : P.highlight; x.beginPath(); x.arc(cx + Math.cos(a) * rr, 520 + Math.sin(a) * rr * 0.6, 4, 0, TAU); x.fill(); } }
          if (i === 3) { shape([[cx - 70, 420], [cx + 70, 420], [cx, 520]], 965, P.light, { smooth: false }); shape([[cx - 70, 620], [cx + 70, 620], [cx, 520]], 966, P.light, { smooth: false }); const f = (E.T * 0.3) % 1; shape([[cx - 50 * (1 - f), 620], [cx + 50 * (1 - f), 620], [cx, 620 - 90 * (1 - f)]], 967, P.highlight, { smooth: false, line: 0 }); ink([[cx - 90, 420], [cx + 90, 420]], 968, { w: 10 }); ink([[cx - 90, 620], [cx + 90, 620]], 969, { w: 10 }); }
        }); });
    },
    badly() {
      ground(P.night); label('HOW BADLY IT GOES FOR YOU', 960, 150, 56, P.light, { weight: 700 });
      const cx = 960, cy = 820, R = 460, segs = [['#4F8A3C', 'fine'], [P.highlight, 'bad'], [P.mars, 'very bad'], ['#5A0F1A', 'you']];
      segs.forEach(([col, txt], i) => { const a0 = Math.PI + i * Math.PI / 4, a1 = a0 + Math.PI / 4, pts = [[cx, cy]]; for (let k = 0; k <= 8; k++) { const a = lerp(a0, a1, k / 8); pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); } shape(pts, 1000 + i, col, { smooth: false, line: 5 });
        const am = (a0 + a1) / 2; label(txt.toUpperCase(), cx + Math.cos(am) * R * 0.68, cy + Math.sin(am) * R * 0.68, 34, P.light, { weight: 700 }); });
      const k = on(wt('exactly')) ? prog(wt('exactly'), wt('you', wt('exactly')) - wt('exactly') + 0.2) : 0, a = Math.PI + (0.1 + 0.86 * k) * Math.PI + Math.sin(E.T * 30) * 0.02 * k;
      ink([[cx, cy], [cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92]], 1010, { w: 16, color: P.light }); shape(circ(cx, cy, 34), 1011, P.light);
      if (on(wt('you', wt('badly')))) burst(cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92, 140, 1020, 12, P.highlight);
    },
    formats() {
      ground(P.night);
      const f = [['sucks', 'WHY IT SUCKS', 'TO BE…', P.highlight], ['die', 'HOW YOU', 'WOULD DIE IN…', P.mars], ['entire', 'THE FULL', 'STORY', P.purple]];
      f.forEach(([w, a, b, col], i) => { const t0 = wt(w, E.S0); if (!on(t0)) return; const cy = 230 + i * 300;
        scaled(960, cy, pop(t0), () => { card(960, cy, 1240, 230, '#1D1A17', 1100 + i * 10, (i - 1) * 1.5); shape(circ(500, cy, 80), 1101 + i * 10, col); label(String(i + 1), 500, cy + 4, 90, P.ink, { weight: 700 }); hand(a, 640, cy - 40, 80, P.light, { align: 'left' }); hand(b, 640, cy + 45, 80, col, { align: 'left' }); }); });
      if (!on(wt('sucks', E.S0))) hand('three ways in', 960, 540, 110, P.light);
    },
    doors() {
      ground(P.night); x.fillStyle = '#100E16'; x.fillRect(0, 860, W, 220);
      if (on(wt('minutes'))) scaled(960, 150, pop(wt('minutes')), () => { card(960, 150, 460, 120, P.light, 1200); label('~10 MINUTES', 960, 152, 58, P.ink, { weight: 700 }); });
      else hand('all of it, in about', 960, 150, 70, P.light);
      const tD = wt('door', E.S0), cols = [P.wall, P.mars, P.purple, P.sepia, '#3FC1B0'], go = wt('expect', E.S0), slam = wt('back', go);
      cols.forEach((c, i) => { if (!on(tD + i * 0.12)) return; const cx = 280 + i * 340, wob = on(wt('any', tD)) && !on(go) ? Math.sin(E.T * 9 + i) * 4 : 0;
        x.save(); x.translate(cx, 860); x.rotate(wob * Math.PI / 180); x.translate(-cx, -860);
        const open = i === 2 ? (on(go) ? (on(slam) ? Math.max(0, 1 - prog(slam, 0.25)) : prog(go, 0.4)) : 0) : 0;
        scaled(cx, 860, pop(tD + i * 0.12), () => door(cx, 860, 200, 420, c, 1300 + i * 10, open)); x.restore(); });
      if (on(tD)) hand('pick a door.', 960, 330, 90, P.highlight);
      if (on(go) && !on(slam)) { const k = prog(go, 1.0); you(lerp(960, 960, k), 860, lerp(0.75, 0.55, k), { face: 'scared', id: 1400 }); }
      else if (!on(go)) you(960, 1060, 0.55, { face: 'calm', id: 1400 });
      if (on(slam)) { burst(960, 650, 240, 1450, 14, P.highlight); if (on(slam + 0.8)) { x.fillStyle = `rgba(13,12,18,${Math.min(0.85, prog(slam + 0.8, 0.6) * 0.85)})`; x.fillRect(0, 0, W, H);
        scaled(960, 500, pop(slam + 1.2), () => { hand('LADEEDA WORLDS', 960, 470, 170, P.highlight); label('A NEW WORLD EVERY WEEK  ·  SUBSCRIBE', 960, 620, 44, P.light, { weight: 700 }); }); } }
    },
  };
};
