// Ladeeda Worlds channel trailer, v2 (scene direction from the user): flicker-on Backrooms hook, a red-star planet,
// a medieval street, then the figure walking past a wall of doorways into other worlds, stopping at one dark open door.
import * as PT from './patterns.js';

export default (E) => {
  const { x, P, W, H, TAU, on, pop, prog, wt, ink, shape, circ, rectP, hand, label, scaled, person, card, burst, cross, star, ground, wisp, hash } = E;
  const you = (cx, cy, s, o = {}) => person(cx, cy, s, { char: 'you', ...o });
  const lerp = (a, b, t) => a + (b - a) * t;
  function poly(pts, id, fill, w = 4) { shape(pts, id, fill, { smooth: false, line: 0 }); if (w) pts.forEach((p, i) => ink([p, pts[(i + 1) % pts.length]], id * 10 + i, { w, amp: 0.8 })); }
  function clip(x0, y0, w, h, fn) { x.save(); x.beginPath(); x.rect(x0, y0, w, h); x.clip(); fn(); x.restore(); }
  function stars(x0, y0, w, h, n, id) { for (let i = 0; i < n; i++) { const tw = 0.5 + 0.5 * Math.sin(E.T * 3 + i); x.fillStyle = `rgba(232,224,255,${0.3 + 0.5 * tw * hash(id + i)})`; x.fillRect(x0 + hash(id + i * 3.1) * w, y0 + hash(id + i * 7.7) * h, 3, 3); } }

  // ---- world painters: fill the box (x0, y0, w, h); used full-screen, in tiles and inside doorways
  const paint = {
    backrooms(x0, y0, w, h, id) {
      const cx = x0 + w / 2, cy = y0 + h / 2, fx = w * 0.22, fy = h * 0.3;
      poly(rectP(x0, y0, w, h), id, P.wall, 0);
      poly([[x0, y0 + h], [x0 + w, y0 + h], [cx + fx, cy + fy], [cx - fx, cy + fy]], id + 1, P.carpet, 3);
      poly([[x0, y0], [x0 + w, y0], [cx + fx, cy - fy], [cx - fx, cy - fy]], id + 2, P.ceiling, 3);
      poly(rectP(cx - fx, cy - fy, fx * 2, fy * 2), id + 3, P.far, 3);
    },
    redstar(x0, y0, w, h, id) {
      poly(rectP(x0, y0, w, h), id, '#120E1A', 0); stars(x0, y0, w, h * 0.6, Math.round(w * h / 9000), id);
      const sx = x0 + w * 0.68, sy = y0 + h * 0.36, r = Math.min(w, h) * 0.32;
      x.save(); x.shadowColor = '#FF4A2E'; x.shadowBlur = r * 0.6; shape(circ(sx, sy, r, r, 30), id + 1, '#D8432E', { line: 0 }); x.restore();
      shape(circ(sx, sy, r * 0.82, r * 0.82, 30), id + 2, '#E8603C', { line: 0 });
      shape(circ(x0 + w / 2, y0 + h * 1.25, w * 0.9, h * 0.5, 36), id + 3, '#2E2433', { line: 4 });
      for (let i = 0; i < 4; i++) shape(circ(x0 + w * (0.15 + i * 0.23), y0 + h * (0.84 + (i % 2) * 0.05), w * 0.05, h * 0.018, 10), id + 4 + i, '#1E1824', { line: 0 });
    },
    medieval(x0, y0, w, h, id) {
      const g = x.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#6E625A'); g.addColorStop(0.55, '#B98A5A'); g.addColorStop(1, '#6E5A44'); x.fillStyle = g; x.fillRect(x0, y0, w, h);
      for (let i = 0; i < 5; i++) { const u = ((E.T * 0.08 + i / 5) % 1); shape(circ(x0 + w * (0.42 + 0.06 * Math.sin(i * 2)), y0 + h * (0.5 - u * 0.4), w * (0.05 + u * 0.08)), id + 40 + i, `rgba(70,64,62,${0.75 - u * 0.5})`, { line: 0 }); }
      poly([[x0, y0 + h], [x0 + w, y0 + h], [x0 + w * 0.56, y0 + h * 0.55], [x0 + w * 0.44, y0 + h * 0.55]], id + 1, '#5B4630', 3);
      for (let i = 0; i < 3; i++) shape(circ(x0 + w * (0.4 + i * 0.1), y0 + h * (0.8 + (i % 2) * 0.08), w * 0.06, h * 0.02, 10), id + 2 + i, '#3E3122', { line: 0 });
      [[-1, 0], [1, 1]].forEach(([side, k]) => { for (let j = 0; j < 3; j++) {
        const f = 1 - j * 0.28, hw = w * 0.2 * f, hh = h * 0.36 * f, bx = side < 0 ? x0 + w * (0.02 + j * 0.13) : x0 + w * (0.98 - j * 0.13) - hw, by = y0 + h * (0.58 + 0.3 * f) - hh;
        poly(rectP(bx, by, hw, hh), id + 10 + k * 5 + j, '#E8D8B8', 3); poly([[bx - hw * 0.08, by], [bx + hw * 1.08, by], [bx + hw / 2, by - hh * 0.45]], id + 20 + k * 5 + j, '#6B3A2A', 3);
        ink([[bx, by + hh * 0.5], [bx + hw, by + hh * 0.5]], id + 30 + k * 5 + j, { w: 4, color: '#4A3020' }); ink([[bx + hw * 0.5, by], [bx + hw * 0.5, by + hh]], id + 35 + k * 5 + j, { w: 4, color: '#4A3020' }); } });
    },
    game(x0, y0, w, h, id) {
      poly(rectP(x0, y0, w, h), id, '#5DADEC', 0); const b = w / 8;
      for (let i = 0; i < 9; i++) { poly(rectP(x0 + i * b, y0 + h - b * 2, b, b * 2), id + 1 + i, i % 2 ? '#3E9A3A' : '#4FB548', 2); }
      poly(rectP(x0 + b * 2, y0 + h * 0.45, b * 3, b), id + 12, '#C8743A', 2); for (let i = 0; i < 3; i++) shape(circ(x0 + b * (2.5 + i), y0 + h * 0.45 - b * 0.8, b * 0.25), id + 14 + i, P.highlight, { line: 2 });
      poly(rectP(x0 + b * 5.6, y0 + h - b * 3.2, b * 0.9, b * 1.2), id + 18, '#D8432E', 2);
    },
    story(x0, y0, w, h, id) {
      poly(rectP(x0, y0, w, h), id, '#2B2550', 0); stars(x0, y0, w, h * 0.5, 12, id);
      const cx = x0 + w / 2, by = y0 + h * 0.85;
      poly(rectP(cx - w * 0.3, by - h * 0.32, w * 0.6, h * 0.32), id + 1, '#E7A6C0', 3);
      [-0.3, 0.3].forEach((dx, i) => { poly(rectP(cx + w * dx - w * 0.08, by - h * 0.5, w * 0.16, h * 0.5), id + 2 + i, '#D98AAE', 3); poly([[cx + w * dx - w * 0.1, by - h * 0.5], [cx + w * dx + w * 0.1, by - h * 0.5], [cx + w * dx, by - h * 0.66]], id + 4 + i, '#7B5CD6', 3); });
      poly(rectP(cx - w * 0.06, by - h * 0.14, w * 0.12, h * 0.14), id + 6, '#4A2E3E', 2); poly(rectP(x0, by, w, h - (by - y0)), id + 7, '#3B7A45', 0);
    },
    universe(x0, y0, w, h, id) {
      poly(rectP(x0, y0, w, h), id, '#141A33', 0); stars(x0, y0, w, h, 20, id); const cx = x0 + w / 2, cy = y0 + h / 2;
      for (let k = 0; k < 60; k++) { const a = k * 0.45 + E.T * 0.4, rr = k * Math.min(w, h) * 0.0075; x.fillStyle = k % 3 ? '#E8E0FF' : P.highlight; x.beginPath(); x.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.6, 3.5, 0, TAU); x.fill(); }
    },
    history(x0, y0, w, h, id) {
      poly(rectP(x0, y0, w, h), id, '#F0C987', 0); shape(circ(x0 + w * 0.75, y0 + h * 0.22, w * 0.08), id + 1, '#FFF1C2', { line: 2 });
      [[0.35, 0.34], [0.68, 0.22]].forEach(([fx, fs], i) => poly([[x0 + w * (fx - fs), y0 + h * 0.8], [x0 + w * (fx + fs), y0 + h * 0.8], [x0 + w * fx, y0 + h * (0.8 - fs * 1.3)]], id + 2 + i, '#C9A060', 3));
      poly(rectP(x0, y0 + h * 0.8, w, h * 0.2), id + 5, '#D8B474', 0);
    },
    danger(x0, y0, w, h, id) {
      poly(rectP(x0, y0, w, h * 0.45), id, '#3A4A5E', 0); poly(rectP(x0, y0 + h * 0.45, w, h * 0.55), id + 1, '#1F4E73', 0);
      for (let i = 0; i < 4; i++) ink([[x0, y0 + h * (0.55 + i * 0.1)], [x0 + w * 0.3, y0 + h * (0.53 + i * 0.1)], [x0 + w * 0.6, y0 + h * (0.57 + i * 0.1)], [x0 + w, y0 + h * (0.55 + i * 0.1)]], id + 2 + i, { w: 3, color: '#6FA3C8' });
      const fx = x0 + w * (0.3 + 0.4 * ((E.T * 0.15) % 1)); poly([[fx - w * 0.08, y0 + h * 0.62], [fx + w * 0.06, y0 + h * 0.62], [fx + w * 0.04, y0 + h * 0.48]], id + 8, '#4B5560', 3);
    },
    maze(x0, y0, w, h, id) {
      poly(rectP(x0, y0, w, h), id, '#0F1A14', 0); const n = 6, cw = w / n;
      for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) { if (hash(id + i * 13 + j) > 0.45) ink([[x0 + i * cw, y0 + j * (h / n)], [x0 + (i + 1) * cw, y0 + j * (h / n)]], id + 100 + i * 10 + j, { w: 10, color: '#2F6B3A' }); if (hash(id + i * 7 + j * 3) > 0.5) ink([[x0 + i * cw, y0 + j * (h / n)], [x0 + i * cw, y0 + (j + 1) * (h / n)]], id + 200 + i * 10 + j, { w: 10, color: '#2F6B3A' }); }
      x.fillStyle = '#D8432E'; x.beginPath(); x.arc(x0 + w * 0.62, y0 + h * 0.4, 5, 0, TAU); x.arc(x0 + w * 0.7, y0 + h * 0.4, 5, 0, TAU); x.fill();
    },
    volcano(x0, y0, w, h, id) {
      const g = x.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#3A1414'); g.addColorStop(1, '#B4472F'); x.fillStyle = g; x.fillRect(x0, y0, w, h);
      poly([[x0 + w * 0.05, y0 + h], [x0 + w * 0.95, y0 + h], [x0 + w * 0.6, y0 + h * 0.4], [x0 + w * 0.4, y0 + h * 0.4]], id + 1, '#2A1C1C', 3);
      ink([[x0 + w * 0.5, y0 + h * 0.42], [x0 + w * 0.46, y0 + h * 0.6], [x0 + w * 0.53, y0 + h * 0.75], [x0 + w * 0.48, y0 + h]], id + 2, { w: 10, color: '#FF8A3A' });
      for (let i = 0; i < 3; i++) { const u = (E.T * 0.3 + i / 3) % 1; shape(circ(x0 + w * 0.5, y0 + h * (0.38 - u * 0.3), w * (0.06 + u * 0.1)), id + 5 + i, `rgba(60,50,50,${0.8 - u * 0.6})`, { line: 0 }); }
    },
    empire(x0, y0, w, h, id) {
      poly(rectP(x0, y0, w, h), id, '#5A4A6A', 0); poly(rectP(x0, y0 + h * 0.8, w, h * 0.2), id + 1, '#3A3040', 0);
      for (let i = 0; i < 4; i++) { const hh = h * (0.5 - (i % 2) * 0.15); poly(rectP(x0 + w * (0.12 + i * 0.22), y0 + h * 0.8 - hh, w * 0.1, hh), id + 2 + i, '#CFC2B0', 3); }
      poly(rectP(x0 + w * 0.08, y0 + h * 0.28, w * 0.5, h * 0.04), id + 8, '#CFC2B0', 3);
    },
    ice(x0, y0, w, h, id) {
      poly(rectP(x0, y0, w, h), id, '#BFE0F2', 0);
      [[0.3, 0.45], [0.7, 0.35]].forEach(([fx, fs], i) => { poly([[x0 + w * (fx - fs), y0 + h * 0.85], [x0 + w * (fx + fs), y0 + h * 0.85], [x0 + w * fx, y0 + h * (0.85 - fs * 1.2)]], id + 1 + i, '#7FA9C9', 3); poly([[x0 + w * (fx - fs * 0.3), y0 + h * (0.85 - fs * 0.84)], [x0 + w * (fx + fs * 0.3), y0 + h * (0.85 - fs * 0.84)], [x0 + w * fx, y0 + h * (0.85 - fs * 1.2)]], id + 3 + i, '#FFFFFF', 0); });
      poly(rectP(x0, y0 + h * 0.85, w, h * 0.15), id + 6, '#EAF6FF', 0);
    },
    dark(x0, y0, w, h, id) { poly(rectP(x0, y0, w, h), id, '#05040A', 0); const g = x.createRadialGradient(x0 + w / 2, y0 + h * 0.55, 10, x0 + w / 2, y0 + h * 0.55, w); g.addColorStop(0, 'rgba(123,92,214,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(x0, y0, w, h); },
  };
  function frame(x0, y0, w, h, id, wd = 8) { const r = rectP(x0, y0, w, h); r.forEach((p, i) => ink([p, r[(i + 1) % 4]], id * 10 + i, { w: wd, amp: 0.8 })); }
  function doorway(kind, cx, by, w, h, id) {                    // a framed doorway on the wall, its world visible inside
    poly(rectP(cx - w / 2 - 16, by - h - 16, w + 32, h + 16), id, '#0C0B11', 0);
    clip(cx - w / 2, by - h, w, h, () => paint[kind](cx - w / 2, by - h, w, h, id + 1));
    frame(cx - w / 2, by - h, w, h, id + 900, 6);
  }


  // ---- channel art: an open, glowing doorway with the 'you' figure (profile picture); a wall of worlds (banner)
  function openDoor(cx, by, w, h, id, glow = 1) {
    const g = x.createRadialGradient(cx, by - h * 0.5, 10, cx, by - h * 0.5, h * 1.1); g.addColorStop(0, `rgba(123,92,214,${0.55 * glow})`); g.addColorStop(1, 'rgba(123,92,214,0)'); x.fillStyle = g; x.fillRect(cx - h * 1.2, by - h * 1.6, h * 2.4, h * 2.2);
    x.save(); x.shadowColor = P.purple; x.shadowBlur = 60; poly(rectP(cx - w / 2 - 18, by - h - 18, w + 36, h + 18), id, '#0C0B11', 0); x.restore();
    paint.dark(cx - w / 2, by - h, w, h, id + 1); frame(cx - w / 2, by - h, w, h, id + 2, 8);
    poly([[cx + w / 2, by - h], [cx + w / 2 + w * 0.32, by - h + h * 0.07], [cx + w / 2 + w * 0.32, by + h * 0.05], [cx + w / 2, by]], id + 3, P.highlight, 5);
    x.fillStyle = '#7A5A14'; x.beginPath(); x.arc(cx + w / 2 + w * 0.24, by - h * 0.48, w * 0.035, 0, TAU); x.fill();
    x.fillStyle = 'rgba(242,193,78,0.10)'; x.beginPath(); x.moveTo(cx - w / 2, by); x.lineTo(cx + w / 2, by); x.lineTo(cx + w * 1.1, by + h * 0.5); x.lineTo(cx - w * 1.1, by + h * 0.5); x.fill();
  }
  function room(floor) { ground('#221E2C'); x.fillStyle = '#16131D'; x.fillRect(0, floor, W, H - floor); ink([[0, floor], [W, floor]], 7000, { w: 6 }); }

  return {
    pfp() {
      const by = 640; room(by);
      openDoor(400, by, 280, 430, 7100);
      you(400, by + 20, 0.72, { face: 'scared', id: 7200 });
    },
    banner() {
      const FL = 905; room(FL);
      for (let i = 0; i < 12; i++) { x.fillStyle = 'rgba(242,193,78,0.06)'; x.beginPath(); x.ellipse(110 + i * 222, 300, 120, 50, 0, 0, TAU); x.fill(); }
      [['backrooms', 150], ['redstar', 400], ['maze', 2215], ['volcano', 2445]].forEach(([kd, cx], i) => doorway(kd, cx, FL, 190, 310, 7300 + i * 40));
      openDoor(1900, FL, 170, 300, 7500, 0.8);
      you(620, FL + 15, 0.58, { face: 'calm', id: 7600 });
      hand('LADEEDA WORLDS', 1215, 660, 170, P.highlight);
      label("PLACES YOU'D NEVER SURVIVE  ·  A NEW WORLD EVERY WEEK", 1215, 800, 38, P.light, { weight: 700 });
    },
  };
};
