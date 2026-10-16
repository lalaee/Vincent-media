// Seven Havens promo short (1080x1920, 9:16), voiced separately. Every scene gets big word-by-word captions in the
// lower third (captions.js, generated from transcript.json): current word gold, the rest white.
import CAPS from './captions.js';

export default (E) => {
  const { x, P, W, H, TAU, on, pop, prog, wt, ink, shape, circ, rectP, hand, label, scaled, person, card, burst, cross, star, ground, wisp } = E;
  const CX = W / 2;
  function element(type, cx, cy, r, id = 1) {
    if (type === 'water') { shape(circ(cx, cy, r), id, P.water); for (let k = -1; k <= 1; k++) ink([[cx - r * 0.6, cy + k * r * 0.35], [cx - r * 0.3, cy + k * r * 0.35 - r * 0.15], [cx, cy + k * r * 0.35], [cx + r * 0.3, cy + k * r * 0.35 - r * 0.15], [cx + r * 0.6, cy + k * r * 0.35]], id + 20 + k, { w: 6, color: P.light }); }
    if (type === 'fire') { shape(circ(cx, cy, r), id, P.fire); shape([[cx, cy - r * 0.7], [cx + r * 0.4, cy], [cx + r * 0.25, cy + r * 0.5], [cx - r * 0.25, cy + r * 0.5], [cx - r * 0.4, cy]], id + 40, P.air, { line: 4 }); }
    if (type === 'earth') { shape(circ(cx, cy, r), id, P.earth); shape(rectP(cx - r * 0.45, cy - r * 0.45, r * 0.9, r * 0.9), id + 30, '#7FB069', { line: 4, smooth: false }); }
    if (type === 'air') { shape(circ(cx, cy, r), id, P.air); for (let k = 0; k < 3; k++) { const Pt = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * 4.4 + k * 2.1, rr = r * 0.75 * (1 - i / 14); Pt.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } ink(Pt, id + 10 + k, { w: 4, color: P.light }); } }
  }
  function poly(pts, id, fill, w = 4) { shape(pts, id, fill, { smooth: false, line: 0 }); if (w) pts.forEach((p, i) => ink([p, pts[(i + 1) % pts.length]], id * 10 + i, { w, amp: 0.8 })); }
  function glow(c, b, fn) { x.save(); x.shadowColor = c; x.shadowBlur = b; fn(); x.restore(); }
  function stars(n) { for (let i = 0; i < n; i++) { const tw = 0.5 + 0.5 * Math.sin(E.T * 3 + i); x.fillStyle = `rgba(232,224,255,${0.25 + 0.5 * tw * E.hash(i)})`; x.fillRect(E.hash(i * 3.1) * W, E.hash(i * 7.7) * H * 0.7, 3, 3); } }
  const lerp = (a, b, t) => a + (b - a) * t;
  const soldier = (cx, cy, s, f, id) => person(cx, cy, s, { top: '#3A3F4A', hair: 'helmet', face: 'angry', arms: 'point', flip: f, id });

  // ---- captions: the chunk being spoken, current word in gold, on a dark rounded box (lower third, clear of app UI)
  function captions() {
    const T = E.T; let ci = -1;
    for (let i = 0; i < CAPS.length; i++) { const c = CAPS[i], next = CAPS[i + 1]; const end = next ? Math.min(next[0].s - 0.02, c[c.length - 1].e + 0.6) : c[c.length - 1].e + 0.6; if (T >= c[0].s - 0.05 && T < end) ci = i; }
    if (ci < 0) return; const c = CAPS[ci], SZ = 72, Y = 1450;
    x.save(); x.font = `700 ${SZ}px Fredoka, sans-serif`; x.textBaseline = 'middle'; x.textAlign = 'left';
    const up = (w) => w.w.toUpperCase(), sp = x.measureText(' ').width, tot = c.reduce((a, w) => a + x.measureText(up(w)).width, 0) + sp * (c.length - 1);
    const lines = tot > 900 ? [c.slice(0, Math.ceil(c.length / 2)), c.slice(Math.ceil(c.length / 2))] : [c];
    const bh = lines.length * (SZ + 18) + 30; x.fillStyle = 'rgba(15,13,20,0.72)'; x.beginPath(); x.roundRect(60, Y - bh / 2, W - 120, bh, 28); x.fill();
    lines.forEach((ln, li) => { const lw = ln.reduce((a, w) => a + x.measureText(up(w)).width, 0) + sp * (ln.length - 1); let px = CX - lw / 2; const py = Y - (lines.length - 1) * (SZ + 18) / 2 + li * (SZ + 18);
      ln.forEach((w) => { const cur = T >= w.s - 0.03 && T < (w.e + 0.15); x.fillStyle = cur ? P.highlight : P.light; x.fillText(up(w), px, py); px += x.measureText(up(w)).width + sp; }); });
    x.restore();
  }
  const S = (fn) => () => { fn(); captions(); };

  return {
    bend: S(() => {
      ground(P.night); stars(60); const tb = wt('two'), tk = wt('taken');
      if (on(tb)) [['water', 290], ['fire', 790]].forEach(([e, ex], i) => scaled(ex, 640, pop(tb + i * 0.15), () => glow(e === 'water' ? P.water : P.fire, 40, () => element(e, ex, 640 + Math.sin(E.T * 2 + i) * 14, 95, 100 + i * 50))));
      if (on(tb) && !on(tk)) hand('2 ELEMENTS', CX, 300, 110, P.highlight);
      if (on(wt('elements')) && !on(tk)) burst(CX, 640, 330, 200, 16, P.highlight);
      person(CX, 1230, 1.3, { char: 'pavi', arms: on(wt('bend')) && !on(tk) ? 'up' : 'down', face: on(tk) ? 'scared' : 'glow', id: 300 });
      if (on(tk)) { const k = prog(tk - 0.1, 0.4); soldier(lerp(-200, 200, k), 1250, 1.1, 1, 400); soldier(lerp(1280, 880, k), 1250, 1.1, -1, 440); if (k >= 1) hand('TAKEN AWAY', CX, 300, 100, P.red); }
    }),
    worse: S(() => {
      ground(P.ink); person(CX, 1230, 1.3, { char: 'pavi', face: 'scared', id: 500 });
      const k = prog(E.S0 + 0.1, 0.35); for (let i = 0; i < 7; i++) ink([[150 + i * 130, -40], [150 + i * 130, -40 + 1340 * k]], 510 + i, { w: 24, color: '#9AA0AA' });
      if (on(wt('worse'))) scaled(CX, 300, pop(wt('worse')), () => hand('or worse.', CX, 300, 130, P.red));
    }),
    monster: S(() => {
      const tm = wt('monster');
      if (!on(tm)) { ground('#E9DDC2'); card(CX, 760, 820, 900, P.light, 600, -2); label('HISTORY · GRADE 6', CX, 400, 34, P.grey, { weight: 700 });
        label('THE AVATAR =', CX, 520, 52, P.ink, { weight: 700 }); scaled(CX, 700, pop(E.S0 + 0.3), () => hand('HERO', CX, 700, 200, P.ok));
        if (on(wt('isnt'))) ink([[300, 720], [780, 680]], 610, { w: 22, color: P.red, len: prog(wt('isnt'), 0.3) });
        person(CX, 1170, 0.8, { char: 'pavi', arms: 'up', face: 'calm', id: 620 }); return; }
      ground(P.night); x.fillStyle = 'rgba(0,0,0,0.5)'; x.beginPath(); x.ellipse(CX, 760, 380 + 20 * Math.sin(E.T * 3), 520, 0, 0, TAU); x.fill();
      scaled(CX, 1100, pop(tm, 0.6), () => { shape([[300, 1150], [280, 650], [380, 360], [540, 260], [700, 360], [800, 650], [780, 1150]], 640, '#0E1322', { line: 5 });
        x.fillStyle = P.red; x.beginPath(); x.arc(470, 520, 26, 0, TAU); x.arc(610, 520, 26, 0, TAU); x.fill(); });
      hand('THE MONSTER', CX, 180, 110, P.red);
      if (on(wt('parents'))) { person(250, 1290, 0.75, { char: 'kid', face: 'scared', id: 660 }); person(830, 1290, 0.65, { char: 'kid2', face: 'scared', flip: -1, id: 700 }); }
    }),
    police: S(() => {
      ground('#1B1A24'); const tr = wt('rewrites'), tmem = wt('memories');
      if (on(wt('police'))) hand('SECRET POLICE', CX, 220, 100, P.light);
      ['family', 'water', 'home'].forEach((kd, i) => { const bx = 230 + i * 310, by = 560; scaled(bx, by, pop(E.S0 + 0.3 + i * 0.2), () => {
        shape(circ(bx, by, 120), 800 + i * 20, P.light, { line: 5 }); const gone = on(tr + i * 0.35);
        if (!gone) { if (kd === 'water') element('water', bx, by, 60, 810 + i * 20); if (kd === 'home') { poly([[bx - 55, by + 50], [bx + 55, by + 50], [bx + 55, by - 5], [bx - 55, by - 5]], 812, P.air, 3); poly([[bx - 70, by - 5], [bx + 70, by - 5], [bx, by - 65]], 813, P.fire, 3); }
          if (kd === 'family') { person(bx - 30, by + 75, 0.3, { char: 'kid', id: 820 }); person(bx + 30, by + 75, 0.3, { char: 'nisha', id: 840 }); } }
        else { const k = prog(tr + i * 0.35, 0.35); for (let j = 0; j < 5; j++) ink([[bx - 80, by - 60 + j * 30], [bx - 80 + 160 * k, by - 50 + j * 30]], 850 + i * 10 + j, { w: 12, color: '#B9B2A4' }); if (on(tmem)) label('?', bx, by, 90, P.grey, { weight: 700 }); } });
        ink([[bx, by + 125], [CX + (bx - CX) * 0.2, 900]], 870 + i, { w: 4, color: P.light }); });
      person(CX, 1250, 1.05, { char: 'pavi', face: on(tr) ? 'scared' : 'calm', id: 880 });
      if (on(wt('secret'))) { person(170, 1290, 1.0, { top: '#23232D', hair: 'helmet', mask: '#111', arms: 'point', id: 900 }); person(910, 1290, 1.0, { top: '#23232D', hair: 'helmet', mask: '#111', arms: 'point', flip: -1, id: 940 }); }
    }),
    comet: S(() => {
      const tc = wt('comet'), tw = wt('wiped'), hit = on(tw);
      ground(hit ? '#2A1414' : '#120E1A'); stars(90);
      [[150, 1.0], [330, 0.9], [540, 1.1], [750, 0.9], [930, 1.0]].forEach(([hx, s], i) => { const by = 1260, hw = 75 * s, hh = 110 * s;
        poly(rectP(hx - hw, by - hh, hw * 2, hh), 1000 + i * 5, hit ? '#3A2A2A' : '#E8D8B8', 3); poly([[hx - hw * 1.15, by - hh], [hx + hw * 1.15, by - hh], [hx, by - hh * 1.7]], 1001 + i * 5, hit ? '#2A1C1C' : '#6B3A2A', 3); });
      if (on(tc) && !hit) { const k = prog(tc, tw - tc); const hx = 980 - 440 * k, hy = 120 + 900 * k; ink([[hx + 240, hy - 420], [hx, hy]], 1050, { w: 26, color: 'rgba(255,190,110,0.8)' }); glow('#FFB25A', 50, () => shape(circ(hx, hy, 46), 1051, '#FFE0A0', { line: 0 })); }
      if (!on(tc)) hand('a comet...', CX, 260, 100, P.light);
      if (hit) { if (E.T < tw + 0.25) { x.fillStyle = 'rgba(255,220,180,0.6)'; x.fillRect(0, 0, W, H); } burst(CX, 1100, 380, 1060, 20, '#FFB25A');
        for (let i = 0; i < 4; i++) { const u = ((E.T - tw) * 0.4 + i / 4) % 1; shape(circ(CX + Math.sin(i * 2) * 120, 1050 - u * 600, 80 + u * 120), 1070 + i, `rgba(60,50,50,${0.8 - u * 0.6})`, { line: 0 }); }
        hand('WIPED OUT', CX, 260, 120, P.highlight); }
      if (on(wt('people'))) [150, 330, 540, 750, 930].forEach((hx, i) => { if (on(wt('people') + i * 0.08)) cross(hx, 1180, 55, 1080 + i * 2); });
    }),
    korra: S(() => {
      ground('#E9DDC2'); card(CX, 830, 860, 860, P.light, 1100, 2); label('HISTORY · GRADE 6', CX, 450, 34, P.grey, { weight: 700 });
      person(CX, 1180, 1.05, { char: 'korra', face: 'calm', id: 1110 }); label('AVATAR KORRA', CX, 1215, 40, P.ink, { weight: 700 });
      if (on(wt('everyone'))) [[90, 600], [990, 640], [100, 980], [980, 1000]].forEach(([fx, fy], i) => { if (on(wt('everyone') + i * 0.1)) ink([[fx, fy], [fx + (CX - fx) * 0.35, fy + (760 - fy) * 0.35]], 1130 + i, { w: 16, color: P.ink }); });
      if (on(wt('blames'))) scaled(CX, 640, pop(wt('blames')), () => { x.save(); x.translate(CX, 640); x.rotate(-6 * Math.PI / 180); hand('CAUSED THE', 0, -55, 80, P.red); hand('CATACLYSM', 0, 40, 100, P.red); x.restore(); });
      if (on(wt('world'))) hand('the end of the world', CX, 210, 70, P.ink);
    }),
    channel: S(() => {
      ground('#221E2C'); x.fillStyle = '#16131D'; x.fillRect(0, 1300, W, H - 1300); ink([[0, 1300], [W, 1300]], 1200, { w: 6 });
      const tl = wt('live');
      [['water', 200], ['dark', CX], ['fire', 880]].forEach(([kd, dx], i) => { const w = 230, h = 400, by = 1300;
        if (kd === 'dark') { glow(P.spirit2, 50, () => poly(rectP(dx - w / 2 - 14, by - h - 14, w + 28, h + 14), 1210, '#0C0B11', 0)); poly(rectP(dx - w / 2, by - h, w, h), 1211, '#05040A', 6); poly([[dx + w / 2, by - h], [dx + w / 2 + 60, by - h + 26], [dx + w / 2 + 60, by + 16], [dx + w / 2, by]], 1212, P.highlight, 4); }
        else { poly(rectP(dx - w / 2 - 14, by - h - 14, w + 28, h + 14), 1220 + i * 5, '#0C0B11', 0); poly(rectP(dx - w / 2, by - h, w, h), 1221 + i * 5, kd === 'water' ? '#1F4E73' : '#7A2A1C', 6); element(kd, dx, by - h / 2, 70, 1230 + i * 40); } });
      if (on(wt('ladeeda'))) scaled(CX, 260, pop(wt('ladeeda')), () => hand('LADEEDA WORLDS', CX, 260, 120, P.highlight));
      if (on(wt('lore')) && !on(tl)) hand('learn the lore?', CX, 420, 70, P.light);
      if (!on(tl)) person(CX, 1330, 0.85, { char: 'pavi', face: 'calm', id: 1300 });
      else if (!on(tl + 0.9)) { const k = prog(tl, 0.9); x.save(); x.globalAlpha = 1 - k; person(CX, 1330 - 120 * k, 0.85 * (1 - 0.55 * k), { char: 'pavi', face: 'scared', id: 1300 }); x.restore(); }
      if (on(tl)) hand('LIVE IT.', CX, 420, 110, P.red);
      if (on(wt('survive'))) hand('how long would you survive?', CX, 560, 62, P.light);
    }),
    end: S(() => {
      ground(P.ink); hand('LADEEDA WORLDS', CX, 260, 130, P.highlight); label('WATCH THE FULL STORY ON YOUTUBE', CX, 380, 40, P.light, { weight: 700 });
      scaled(CX, 760, pop(E.S0 + 0.2), () => { poly(rectP(110, 520, 860, 484), 1400, '#1D1A17', 0); ['air', 'water', 'earth', 'fire'].forEach((e, i) => element(e, 230 + i * 205, 610, 42, 1410 + i * 50));
        hand('Why it sucks to be', CX, 730, 64, P.light); hand('THE AVATAR', CX, 830, 104, P.highlight); label('IN SEVEN HAVENS', CX, 930, 34, P.accent2, { weight: 700 });
        const r = rectP(110, 520, 860, 484); r.forEach((p, i) => ink([p, r[(i + 1) % 4]], 1420 + i, { w: 8, color: P.light, amp: 0.8 })); });
      scaled(CX, 1180, pop(E.S0 + 0.6), () => { shape(circ(CX, 1180, 105), 1450, P.red, { line: 5 }); label('SUBSCRIBE', CX, 1184, 38, P.light, { weight: 700 }); });
    }),
  };
};
