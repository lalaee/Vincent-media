// Explainer-series engine: flat-vector shapes (smooth, elastic) + frame-by-frame line boil (ink outlines and cel FX
// redrawn every ~2.5 frames). Every frame is a pure function of t. Configured by series.json (look of the show) and
// cues.json (this episode's timing). Scenes live in scenes.js and receive this engine as `E`.
//
//   const E = await createEngine(canvas, series, cues);   E.render(t, SCENES)
//
// Timing helpers read the current frame: E.T (seconds), E.S0 (current scene start), E.wt(word) = first time `word`
// is spoken at/after the scene start, E.on(t0), E.pop(t0, d) (elastic 0->1), E.prog(t0, d) (eased 0->1).

export async function createEngine(canvas, series, cues) {
  const W = canvas.width, H = canvas.height, TAU = Math.PI * 2, D2R = Math.PI / 180;
  const x = canvas.getContext('2d');
  const P = series.palette;
  for (const f of series.fonts) { const ff = new FontFace(f.family, `url(${f.file})`, { weight: f.weight || '400' }); await ff.load(); document.fonts.add(ff); }
  const PAPERTEX = series.paper ? await new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = series.paper; }) : null;
  const HAND = series.type?.hand || 'serif', LABEL = series.type?.label || 'sans-serif';

  const clamp = (v) => Math.max(0, Math.min(1, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const eo = (p) => 1 - Math.pow(1 - p, 3);
  const back = (p) => { const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  const E = { x, W, H, TAU, D2R, P, cues, series, T: 0, B: 0, S0: 0, clamp, lerp, eo, back, hash };
  E.wt = (word, after = E.S0) => { const a = cues.words[word.toLowerCase()] || []; return a.find((t) => t >= after - 0.05) ?? after; };
  E.on = (t0) => E.T >= t0;
  E.pop = (t0, d = 0.45) => E.T < t0 ? 0 : back(clamp((E.T - t0) / d));
  E.prog = (t0, d) => eo(clamp((E.T - t0) / d));

  // ---------- ink brush: centreline + pressure -> outline polygon, wobbled per boil drawing
  function spline(Pt, closed, seg = 8) {
    const out = [], n = Pt.length, m = closed ? n : n - 1, g = (i) => closed ? Pt[(i + n) % n] : Pt[Math.max(0, Math.min(n - 1, i))];
    for (let i = 0; i < m; i++) { const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      for (let s = 0; s < seg; s++) { const u = s / seg, u2 = u * u, u3 = u2 * u; out.push([0, 1].map((k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3))); } }
    if (!closed) out.push(Pt[n - 1].slice()); return out;
  }
  function wobble(pts, id, amp) {
    const B = E.B, s1 = hash(id * 13 + B * 7.1) * TAU, s2 = hash(id * 29 + B * 3.3) * TAU; let L = 0; const acc = [0];
    for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); acc.push(L); }
    return pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const nl = Math.hypot(nx, ny) || 1;
      const o = amp * (0.6 * Math.sin(acc[i] / 60 + s1) + 0.4 * Math.sin(acc[i] / 23 + s2)); return [p[0] + nx / nl * o, p[1] + ny / nl * o]; });
  }
  E.ink = function ink(Pt, id, { w = 6, color = P.ink, amp = 1.4, closed = false, len = 1, taper = 0.15 } = {}) {
    let d = wobble(spline(Pt, closed), id, amp); if (closed) d.push(d[0], d[1]);
    d = d.slice(0, Math.max(2, Math.ceil(d.length * len))); const Lf = [], Rt = [];
    for (let i = 0; i < d.length; i++) { const q0 = d[Math.max(0, i - 1)], q1 = d[Math.min(d.length - 1, i + 1)]; let nx = -(q1[1] - q0[1]), ny = q1[0] - q0[0]; const nl = Math.hypot(nx, ny) || 1;
      const u = i / (d.length - 1), pr = closed ? 1 : Math.max(0.25, Math.min(1, u / taper, (1 - u) / taper) ** 0.6), ww = w * pr * (1 + 0.15 * Math.sin(i * 0.4 + id + E.B)) / 2;
      Lf.push([d[i][0] + nx / nl * ww, d[i][1] + ny / nl * ww]); Rt.push([d[i][0] - nx / nl * ww, d[i][1] - ny / nl * ww]); }
    x.fillStyle = color; x.beginPath(); x.moveTo(...Lf[0]); for (const p of Lf) x.lineTo(...p); for (let i = Rt.length - 1; i >= 0; i--) x.lineTo(...Rt[i]); x.closePath(); x.fill();
  };
  // flat fill (smooth) + boiling ink outline: the core of the hybrid look
  E.shape = function shape(Pt, id, fill, { line = 5, closed = true, smooth = true } = {}) {
    const pts = smooth ? spline(Pt, closed) : Pt;
    if (fill) { x.fillStyle = fill; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(...p) : x.moveTo(...p)); x.closePath(); x.fill(); }
    if (line) E.ink(Pt, id, { w: line, closed, amp: 1.1 });
  };
  E.circ = (cx, cy, r, ry = r, n = 14, rot = 0) => Array.from({ length: n }, (_, i) => { const a = rot + i / n * TAU; return [cx + Math.cos(a) * r, cy + Math.sin(a) * ry]; });
  E.rectP = (x0, y0, w, h) => [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]];
  E.hand = function hand(text, cx, cy, size, color = P.ink, { align = 'center', rot = 0 } = {}) {   // hand-lettered, boils with the ink
    x.save(); x.translate(cx + (hash(E.B * 3.1) - 0.5) * 3, cy + (hash(E.B * 5.7) - 0.5) * 3); x.rotate(rot * D2R + (hash(E.B) - 0.5) * 0.01);
    x.font = `${size}px ${HAND}`; x.fillStyle = color; x.textAlign = align; x.textBaseline = 'middle'; x.fillText(text, 0, 0); x.restore();
  };
  E.label = function label(text, cx, cy, size, color = P.ink, { align = 'center', weight = 600 } = {}) {   // clean explainer label
    x.font = `${weight} ${size}px ${LABEL}`; x.fillStyle = color; x.textAlign = align; x.textBaseline = 'middle'; x.fillText(text, cx, cy);
  };
  E.scaled = function scaled(cx, cy, s, fn) { if (s <= 0.001) return; x.save(); x.translate(cx, cy); x.scale(s, s); x.translate(-cx, -cy); fn(); x.restore(); };
  E.ground = (color) => { x.fillStyle = color; x.fillRect(0, 0, W, H); };

  // ---------- vocabulary
  // Flat geometric person. Defaults come from series.characters[o.char]; any option can be overridden per call.
  // hair: bun|bob|bald|tail|white|helmet; arms: down|up|point|cross|wave; face: calm|scared|angry|glow; mark: forehead stripe colour;
  // mask: domino-mask colour (eyes become white slits); hairC: hair colour
  E.person = function person(cx, cy, s, o = {}) {
    const base = (o.char && series.characters?.[o.char]) || {};
    const { skin = P.skin || '#B97A4E', top = P.accent || '#2F7FC1', hair = 'bun', hairC = P.ink, arms = 'down', id = 1, face = 'calm', mark = null, mask = null, flip = 1 } = { ...base, ...o };
    s *= series.personScale || 1.35; x.save(); x.translate(cx, cy); x.scale(s * flip, s);
    const armP = { down: [[-40, -150], [-62, -60]], up: [[-40, -150], [-80, -280]], point: [[40, -150], [150, -180]], cross: [[-40, -150], [20, -120]], wave: [[40, -150], [90, -250]] }[arms];
    const arm2 = arms === 'up' ? [[40, -150], [80, -280]] : arms === 'cross' ? [[40, -150], [-20, -110]] : [[40, -150], [62, -60]];
    E.ink([armP[0], armP[1]], id + 1, { w: 18, color: top === P.ink ? '#333' : top }); E.ink([arm2[0], arm2[1]], id + 2, { w: 18, color: top === P.ink ? '#333' : top });
    E.shape([[-55, 0], [-48, -120], [-30, -165], [30, -165], [48, -120], [55, 0]], id + 3, top, { line: 5 });
    E.shape(E.circ(0, -215, 50, 54), id + 4, skin, { line: 5 });
    if (hair === 'bun') { E.shape([[-52, -220], [-48, -262], [0, -275], [48, -262], [52, -222], [30, -250], [-30, -250]], id + 5, hairC, { line: 0 }); E.shape(E.circ(0, -284, 22), id + 6, hairC, { line: 3 }); }
    if (hair === 'bob') E.shape([[-56, -180], [-54, -250], [0, -276], [54, -250], [56, -180], [40, -230], [-40, -230]], id + 5, hairC, { line: 0 });
    if (hair === 'tail') { E.shape([[-52, -222], [-48, -262], [0, -276], [48, -262], [52, -222], [30, -248], [-30, -248]], id + 5, hairC, { line: 0 }); E.shape([[44, -250], [78, -232], [70, -190], [52, -206]], id + 6, hairC, { line: 3 }); }
    if (hair === 'white') { E.shape([[-52, -222], [-48, -262], [0, -276], [48, -262], [52, -222], [30, -248], [-30, -248]], id + 5, '#EDEDED', { line: 3 }); E.shape([[-30, -195], [30, -195], [18, -140], [0, -128], [-18, -140]], id + 6, '#EDEDED', { line: 3 }); }
    if (hair === 'helmet') E.shape([[-58, -205], [-54, -262], [0, -285], [54, -262], [58, -205], [70, -200], [-70, -200]], id + 5, '#3A3F4A', { line: 4 });
    if (mark) E.ink([[0, -192], [0, -270]], id + 7, { w: 12, color: mark });
    if (mask) { E.shape([[-50, -236], [-20, -246], [0, -232], [20, -246], [50, -236], [44, -206], [16, -204], [0, -214], [-16, -204], [-44, -206]], id + 11, mask, { line: 3 });
      x.fillStyle = '#FFFFFF'; x.beginPath(); x.ellipse(-22, -220, 11, 6, 0.2, 0, TAU); x.ellipse(22, -220, 11, 6, -0.2, 0, TAU); x.fill(); E.ink([[-12, -192], [0, -188], [12, -192]], id + 8, { w: 3 }); x.restore(); return; }
    x.fillStyle = P.ink;
    if (face === 'calm') { x.beginPath(); x.arc(-18, -215, 5, 0, TAU); x.arc(18, -215, 5, 0, TAU); x.fill(); E.ink([[-12, -192], [0, -188], [12, -192]], id + 8, { w: 3 }); }
    if (face === 'scared') { x.beginPath(); x.arc(-18, -218, 7, 0, TAU); x.arc(18, -218, 7, 0, TAU); x.fill(); E.shape(E.circ(0, -188, 8, 10), id + 8, P.ink, { line: 0 }); }
    if (face === 'angry') { x.beginPath(); x.arc(-18, -212, 5, 0, TAU); x.arc(18, -212, 5, 0, TAU); x.fill(); E.ink([[-30, -232], [-8, -224]], id + 8, { w: 4 }); E.ink([[30, -232], [8, -224]], id + 9, { w: 4 }); E.ink([[-12, -188], [0, -194], [12, -188]], id + 10, { w: 3 }); }
    if (face === 'glow') { x.fillStyle = '#FFFFFF'; x.shadowColor = P.glow || '#3FC1B0'; x.shadowBlur = 20; x.fillRect(-30, -222, 22, 9); x.fillRect(8, -222, 22, 9); x.shadowBlur = 0; }
    x.restore();
  };
  E.wisp = function wisp(cx, cy, r, id, color = P.glow || '#3FC1B0') {      // ghost / spirit / creature blob with eyes
    E.shape([[cx - r, cy + r * 0.6], [cx - r * 0.9, cy - r * 0.4], [cx, cy - r], [cx + r * 0.9, cy - r * 0.4], [cx + r, cy + r * 0.6], [cx + r * 0.5, cy + r * 0.3], [cx, cy + r * 0.9], [cx - r * 0.5, cy + r * 0.3]], id, color, { line: 4 });
    x.fillStyle = P.light; x.beginPath(); x.arc(cx - r * 0.3, cy - r * 0.15, r * 0.14, 0, TAU); x.arc(cx + r * 0.3, cy - r * 0.15, r * 0.14, 0, TAU); x.fill();
  };
  E.ringWall = function ringWall(cx, cy, r, id, fill = P.sand || '#E3C48A') {   // walled settlement seen from above
    E.shape(E.circ(cx, cy, r, r * 0.55, 20), id, fill, { line: 6 });
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; E.ink([[cx + Math.cos(a) * r * 0.86, cy + Math.sin(a) * r * 0.47], [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.55]], id + 50 + i, { w: 4 }); }
  };
  E.card = function card(cx, cy, w, h, fill, id, rot = 0) { x.save(); x.translate(cx, cy); x.rotate(rot * D2R); x.shadowColor = 'rgba(0,0,0,0.18)'; x.shadowBlur = 0; x.shadowOffsetX = 10; x.shadowOffsetY = 10; E.shape(E.rectP(-w / 2, -h / 2, w, h), id, fill, { line: 5, smooth: false }); x.restore(); };
  E.burst = function burst(cx, cy, r, id, n = 14, color = P.ink) { for (let i = 0; i < n; i++) { const a = i / n * TAU + hash(id), r0 = r * 0.55, r1 = r * (0.9 + 0.3 * hash(i + id)); E.ink([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], id + i, { w: 9, color }); } };
  E.cross = function cross(cx, cy, r, id) { E.ink([[cx - r, cy - r], [cx + r, cy + r]], id, { w: 16, color: P.red }); E.ink([[cx + r, cy - r], [cx - r, cy + r]], id + 1, { w: 16, color: P.red }); };
  E.star = function star(cx, cy, r, id, color = P.highlight || '#F2A33A') { const Pt = []; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, rr = i % 2 ? r * 0.3 : r; Pt.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } E.shape(Pt, id, color, { line: 3, smooth: false }); };

  // ---------- numbered section card ("REASON 3", "RULE 3", "PART 3"...): look from series.section, title from cues.sections
  E.sectionCard = (n) => () => {
    const sec = series.section || {}, colors = sec.colors || [P.accent], c = colors[(n - 1) % colors.length];
    E.ground(sec.bg || P.ink);
    E.scaled(960, 540, E.pop(E.S0 + 0.05, 0.5), () => { E.shape(E.circ(560, 540, 190), 900 + n, c, { line: 7 }); E.hand(String(n), 560, 560, 300, P.light); });
    x.save(); x.globalAlpha = E.prog(E.S0 + 0.25, 0.4); E.label(`${sec.label || 'PART'} ${n}`, 830, 430, 46, c, { align: 'left', weight: 700 }); x.restore();
    const title = (cues.sections || {})[String(n)] || '', words = title.split(' '), k = Math.ceil(words.length / 2);
    if (E.on(E.S0 + 0.35)) E.hand(words.slice(0, k).join(' '), 830, 540, 110, P.light, { align: 'left' });
    if (E.on(E.S0 + 0.55)) E.hand(words.slice(k).join(' '), 830, 660, 110, P.light, { align: 'left' });
  };

  // ---------- one frame: clocks, scene dispatch, colour-block wipe into each new scene, paper grain
  E.render = (t, SCENES) => {
    const f = Math.round(t * cues.fps); E.B = Math.floor(f / (series.boilEvery || 2.5)) % 4; E.T = t;
    let si = 0; cues.scenes.forEach((s, i) => { if (t >= s.t) si = i; }); E.S0 = cues.scenes[si].t;
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.shadowColor = 'transparent';
    const fn = SCENES[cues.scenes[si].id]; if (fn) fn(); else { E.ground(P.paper); E.label(`[missing scene: ${cues.scenes[si].id}]`, W / 2, H / 2, 48, P.red); }
    const wipe = series.wipe || [], wp = (t - E.S0) / 0.25;
    if (si > 0 && wipe.length && wp < 1) { x.fillStyle = wipe[si % wipe.length]; x.fillRect(W * eo(wp), 0, W, H); }
    if (PAPERTEX) { x.globalCompositeOperation = 'multiply'; x.globalAlpha = series.paperAlpha ?? 0.12; x.drawImage(PAPERTEX, 0, 0, W, H); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; }
  };
  return E;
}
