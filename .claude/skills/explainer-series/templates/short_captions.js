// Burned-in captions for vertical shorts: the chunk being spoken in big capitals on a dark rounded box, the current word
// in gold. Default position is the lower third (y 1450 of 1920), clear of the TikTok/Shorts description and side buttons.
// Usage in scenes.js:  import CAPS from './captions.js'; import { drawCaptions } from './short_captions.js';
//                      const S = (fn) => () => { fn(); drawCaptions(E, CAPS); };   // wrap every scene
export function drawCaptions(E, CAPS, { y = 1450, size = 72, font = 'Fredoka', maxWidth = 900 } = {}) {
  const { x, P, W } = E, T = E.T, CX = W / 2; let ci = -1;
  for (let i = 0; i < CAPS.length; i++) { const c = CAPS[i], next = CAPS[i + 1]; const end = next ? Math.min(next[0].s - 0.02, c[c.length - 1].e + 0.6) : c[c.length - 1].e + 0.6; if (T >= c[0].s - 0.05 && T < end) ci = i; }
  if (ci < 0) return; const c = CAPS[ci];
  x.save(); x.font = `700 ${size}px ${font}, sans-serif`; x.textBaseline = 'middle'; x.textAlign = 'left';
  const up = (w) => w.w.toUpperCase(), sp = x.measureText(' ').width, width = (ln) => ln.reduce((a, w) => a + x.measureText(up(w)).width, 0) + sp * (ln.length - 1);
  const lines = width(c) > maxWidth ? [c.slice(0, Math.ceil(c.length / 2)), c.slice(Math.ceil(c.length / 2))] : [c];
  const lh = size + 18, bh = lines.length * lh + 30; x.fillStyle = 'rgba(15,13,20,0.72)'; x.beginPath(); x.roundRect(60, y - bh / 2, W - 120, bh, 28); x.fill();
  lines.forEach((ln, li) => { let px = CX - width(ln) / 2; const py = y - (lines.length - 1) * lh / 2 + li * lh;
    ln.forEach((w) => { const cur = T >= w.s - 0.03 && T < w.e + 0.15; x.fillStyle = cur ? (P.highlight || '#F2C14E') : (P.light || '#FFF'); x.fillText(up(w), px, py); px += x.measureText(up(w)).width + sp; }); });
  x.restore();
}
