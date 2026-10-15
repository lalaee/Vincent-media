// Green Lantern sample: cast line-up, a construct forming, the oath, a section card, willpower vs fear.
import * as PT from './patterns.js';

export default (E) => {
  const { x, P, W, H, TAU, on, pop, prog, wt, ink, shape, circ, rectP, hand, label, scaled, person, burst, ground, hash } = E;
  const glow = (color, blur, fn) => { x.save(); x.shadowColor = color; x.shadowBlur = blur; fn(); x.restore(); };
  const space = () => { ground(P.night); for (let i = 0; i < 120; i++) { const tw = 0.5 + 0.5 * Math.sin(E.T * 3 + i); x.fillStyle = `rgba(230,255,240,${0.25 + 0.5 * tw * hash(i)})`; x.fillRect(hash(i * 3.1) * W, hash(i * 7.7) * H, 2.5, 2.5); } };
  const ring = (cx, cy, r, id) => glow(P.glow, 30, () => { ink(circ(cx, cy, r, r * 0.7), id, { w: 10, color: P.lantern, closed: true }); x.fillStyle = P.highlight; x.beginPath(); x.arc(cx, cy - r * 0.7, r * 0.45, 0, TAU); x.fill(); });
  function lantern(cx, cy, s, id) {                    // a power battery: a generic glowing lantern, not the logo
    x.save(); x.translate(cx, cy); x.scale(s, s); x.translate(-cx, -cy);
    ink([[cx - 70, cy - 170], [cx - 70, cy - 230], [cx, cy - 270], [cx + 70, cy - 230], [cx + 70, cy - 170]], id, { w: 10 });          // handle
    shape([[cx - 110, cy - 170], [cx + 110, cy - 170], [cx + 90, cy - 130], [cx - 90, cy - 130]], id + 1, P.lanternDark, { smooth: false });
    glow(P.glow, 60, () => shape(rectP(cx - 90, cy - 130, 180, 230), id + 2, 'rgba(92,255,138,0.85)', { smooth: false, line: 6 }));
    for (const dx of [-45, 0, 45]) ink([[cx + dx, cy - 130], [cx + dx, cy + 100]], id + 10 + dx, { w: 6, color: P.lanternDark });
    shape([[cx - 120, cy + 100], [cx + 120, cy + 100], [cx + 100, cy + 150], [cx - 100, cy + 150]], id + 3, P.lanternDark, { smooth: false });
    x.restore();
  }

  return {
    cast() {
      space();
      hand('THE GREEN LANTERN CORPS', 960, 150, 110, P.highlight);
      const crew = [['hal', 'HAL JORDAN'], ['john', 'JOHN STEWART'], ['guy', 'GUY GARDNER'], ['kyle', 'KYLE RAYNER'], ['jessica', 'JESSICA CRUZ']];
      crew.forEach(([c, n], i) => { const px = 230 + i * 330, t0 = E.S0 + 0.3 + i * 0.35;
        E.scaled(px, 880, pop(t0), () => { const g = x.createRadialGradient(px, 700, 20, px, 700, 230); g.addColorStop(0, 'rgba(92,255,138,0.35)'); g.addColorStop(1, 'rgba(92,255,138,0)'); x.fillStyle = g; x.fillRect(px - 240, 450, 480, 500); person(px, 880, 0.95, { char: c, arms: i === 0 ? 'up' : 'down', id: 100 + i * 40 }); label(n, px, 950, 34, P.light, { weight: 700 }); }); });
      if (on(E.S0 + 2.2)) { const bob = Math.sin(E.T * 2) * 10; shape(circ(1780, 620 + bob, 90, 26), 400, '#2A3A55'); person(1780, 610 + bob, 0.45, { char: 'guardian', id: 420 }); label('GUARDIANS', 1780, 700 + bob, 28, P.light, { weight: 700 }); }
    },
    construct() {
      space();
      person(470, 980, 1.25, { char: 'hal', arms: 'point', id: 500 });
      const rx = 470 + 150 * 1.25 * 1.35, ry = 980 - 180 * 1.25 * 1.35; ring(rx, ry, 26, 540);
      const t0 = wt('willpower'), pr = prog(t0, 1.1);
      if (on(t0)) glow(P.glow, 40, () => ink([[rx + 30, ry], [900, ry - 20], [1010, 540]], 550, { w: 14, color: P.highlight, len: pr }));
      const HEAD = [[1080, 300], [1680, 300], [1680, 600], [1080, 600]], HANDLE = [[1340, 600], [1420, 600], [1420, 930], [1340, 930]];
      if (on(t0)) {
        const fill = prog(t0 + 0.9, 0.5);
        if (on(wt('constructs'))) burst(1380, 450, 380, 600, 14, 'rgba(92,255,138,0.55)');
        if (fill > 0) { x.fillStyle = `rgba(43,209,88,${0.3 * fill})`; for (const R of [HEAD, HANDLE]) { x.beginPath(); R.forEach((p, i) => i ? x.lineTo(...p) : x.moveTo(...p)); x.closePath(); x.fill(); } }
        glow(P.glow, 45, () => { ink(HEAD, 560, { w: 16, color: P.highlight, closed: true, len: pr }); ink(HANDLE, 561, { w: 14, color: P.highlight, closed: true, len: Math.max(0, pr * 1.4 - 0.4) });
          if (fill > 0) for (let k = 0; k < 3; k++) ink([[1160 + k * 220, 330], [1160 + k * 220, 570]], 570 + k, { w: 8, color: P.highlight, len: fill }); });
      }
      if (on(wt('constructs'))) hand('WILLPOWER > CONSTRUCTS', 1380, 1010, 80, P.highlight);
      if (on(t0)) hand('WILLPOWER', 470, 200, 90, P.light);
    },
    oath() {
      space();
      glow(P.glow, 30, () => lantern(560, 600, 1.5, 700));
      const lines = [['brightest', 'In brightest day,'], ['blackest', 'in blackest night...']];
      lines.forEach(([w, txt], i) => { if (on(wt(w))) E.scaled(1300, 440 + i * 170, pop(wt(w)), () => glow(P.glow, 20, () => hand(txt, 1300, 440 + i * 170, 120, P.highlight))); });
      label('THE OATH', 1300, 250, 48, P.light, { weight: 700 });
    },
    sec1: E.sectionCard(1),
    versus: PT.versus(E, {
      left: { bg: P.lanternDark, who: { char: 'hal', arms: 'up' }, word: 'willpower', text: 'WILLPOWER', ink: P.light },
      right: { bg: P.fear, who: { char: 'sinestro', arms: 'point', top: '#1A1A1A' }, word: 'fear', text: 'FEAR', ink: P.ink },
      footer: { word: 'fear', text: 'GREEN vs YELLOW' } }),
  };
};
