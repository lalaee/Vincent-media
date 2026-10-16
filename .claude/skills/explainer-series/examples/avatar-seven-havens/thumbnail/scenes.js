// YouTube thumbnails (1280x720) for "Why It Sucks To Be the Avatar in Seven Havens": three variants for Test & Compare.
// Rules: one big face, 2-4 words max, strong contrast, readable at 168x94; keep the bottom-right corner clear (timestamp).
import { paviPortrait } from './portrait.js';
export default (E) => {
  const { x, P, W, H, TAU, ink, shape, circ, rectP, hand, label, scaled, person, card, burst, cross, ground } = E;
  function element(type, cx, cy, r, id = 1) {
    if (type === 'water') { shape(circ(cx, cy, r), id, P.water); for (let k = -1; k <= 1; k++) ink([[cx - r * 0.6, cy + k * r * 0.35], [cx - r * 0.3, cy + k * r * 0.35 - r * 0.15], [cx, cy + k * r * 0.35], [cx + r * 0.3, cy + k * r * 0.35 - r * 0.15], [cx + r * 0.6, cy + k * r * 0.35]], id + 20 + k, { w: 7, color: P.light }); }
    if (type === 'fire') { shape(circ(cx, cy, r), id, P.fire); shape([[cx, cy - r * 0.7], [cx + r * 0.4, cy], [cx + r * 0.25, cy + r * 0.5], [cx - r * 0.25, cy + r * 0.5], [cx - r * 0.4, cy]], id + 40, P.air, { line: 5 }); }
  }
  const glow = (c, b, fn) => { x.save(); x.shadowColor = c; x.shadowBlur = b; fn(); x.restore(); };
  // big text with a thick dark outline so it reads on any background and at phone size
  function big(text, cx, cy, size, fill, { rot = 0, outline = '#14101A', align = 'center' } = {}) {
    x.save(); x.translate(cx, cy); x.rotate(rot * Math.PI / 180); x.font = `${size}px Brush, sans-serif`; x.textAlign = align; x.textBaseline = 'middle';
    x.lineJoin = 'round'; x.lineWidth = size * 0.16; x.strokeStyle = outline; x.strokeText(text, 0, 0); x.fillStyle = fill; x.fillText(text, 0, 0); x.restore();
  }
  function paper(cx, cy, w, h, fill, rot, id) {         // straight-edged paper with a soft drop shadow
    x.save(); x.translate(cx, cy); x.rotate(rot * Math.PI / 180); x.fillStyle = 'rgba(0,0,0,0.28)'; x.fillRect(-w / 2 + 12, -h / 2 + 14, w, h);
    shape(rectP(-w / 2, -h / 2, w, h), id, fill, { smooth: false, line: 0 }); const r = rectP(-w / 2, -h / 2, w, h); r.forEach((p, i) => ink([p, r[(i + 1) % 4]], id * 10 + i, { w: 6, amp: 0.6 })); x.restore();
  }
  function radial(c0, c1, cx, cy) { const g = x.createRadialGradient(cx, cy, 40, cx, cy, 900); g.addColorStop(0, c0); g.addColorStop(1, c1); x.fillStyle = g; x.fillRect(0, 0, W, H); }

  return {
    a() {                                                  // A: the Avatar is WANTED
      radial('#3A2340', '#120E1A', 380, 330);
      glow(P.water, 50, () => element('water', 130, 250, 78, 10)); glow(P.fire, 50, () => element('fire', 600, 200, 78, 60));
      person(370, 900, 1.75, { char: 'pavi', face: 'scared', arms: 'up', id: 100 });
      paper(965, 340, 460, 560, '#F4E6C4', 4, 200);
      big('WANTED', 965, 135, 118, P.red, { rot: 4, outline: '#3A1410' });
      person(965, 510, 0.62, { char: 'pavi', face: 'scared', id: 220 });
      label('FOR BEING THE AVATAR', 958, 575, 30, '#3A1410', { weight: 700 });
    },
    b() {                                                  // B: HERO crossed out -> VILLAIN
      radial('#F4EAD5', '#C9A86A', 900, 300);
      paper(900, 350, 640, 500, P.light, -3, 300); label('HISTORY · GRADE 6', 900, 150, 26, P.grey, { weight: 700 });
      big('HERO', 900, 260, 140, P.ok, { rot: -3, outline: '#1D3A14' }); ink([[690, 285], [1110, 240]], 310, { w: 26, color: P.red });
      big('VILLAIN', 905, 440, 170, P.red, { rot: -3, outline: '#3A1410' });
      person(300, 900, 1.8, { char: 'pavi', face: 'scared', id: 320 });
    },
    c() {                                                  // C: two elements = prison
      radial('#2A3350', '#0E1018', 380, 360);
      glow(P.water, 50, () => element('water', 140, 230, 80, 10)); glow(P.fire, 50, () => element('fire', 560, 210, 80, 60));
      person(370, 900, 1.75, { char: 'pavi', face: 'scared', arms: 'up', id: 400 });
      for (let i = 0; i < 6; i++) ink([[90 + i * 116, -20], [90 + i * 116, 740]], 450 + i, { w: 26, color: '#9AA0AA' });
      big('2 ELEMENTS', 1000, 230, 112, P.light);
      big('= PRISON', 1000, 390, 140, P.red, { rot: -4, outline: '#3A1410' });
    },
    d() {                                                  // D: detailed portrait, white background, two-word caption + arrow
      x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, W, H);
      paviPortrait(x, 410, 398, 1.12);
      x.save(); x.fillStyle = '#14101A'; x.textBaseline = 'middle'; x.textAlign = 'left';
      x.font = '400 104px Fredoka, sans-serif'; x.fillText('worst', 800, 290);
      x.font = '700 132px Fredoka, sans-serif'; x.fillText('job ever', 770, 410); x.restore();
      x.save(); x.strokeStyle = '#14101A'; x.lineWidth = 6; x.lineCap = 'round'; x.lineJoin = 'round';
      x.beginPath(); x.moveTo(840, 510); x.quadraticCurveTo(790, 580, 660, 545); x.stroke();
      x.beginPath(); x.moveTo(684, 527); x.lineTo(658, 545); x.lineTo(686, 561); x.stroke(); x.restore();
    },
  };
};
