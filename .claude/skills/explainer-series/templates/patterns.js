// Reusable explainer scene patterns. Each returns a scene function for scenes.js:  myScene: titleCard(E, {...}).
// Triggers are WORDS from the narration (looked up after the scene start with E.wt) so every beat lands on the voice.
// They cover the recurring beats of a list-style explainer: title, warning, timeline, crossed-out list, bar chart,
// walled map, rule infographic, versus split, two doors, roster vs empty roster, poster pair, recap checklist, next tease.

const ch = (E, c) => (typeof c === 'string' ? { char: c } : c || {});     // character ref: 'pavi' or {char:'pavi', face:'scared'}

export function titleCard(E, { kicker, title, sub, subWord, icons = [], drawIcon, titleWord }) {
  return () => { const { P } = E; E.ground(P.ink);
    icons.forEach((ic, i) => E.scaled(380 + i * 380, 230, E.pop(E.S0 + i * 0.12), () => drawIcon ? drawIcon(ic, 380 + i * 380, 230, 70, 800 + i * 50) : E.shape(E.circ(380 + i * 380, 230, 70), 800 + i * 50, ic)));
    if (kicker && E.on(E.S0 + 0.5)) E.hand(kicker, 960, 470, 120, P.light);
    E.scaled(960, 650, E.pop(titleWord ? E.wt(titleWord) : E.S0 + 0.8), () => E.hand(title, 960, 650, 220, P.highlight || P.light));
    if (sub && E.on(subWord ? E.wt(subWord) : E.S0 + 1.2)) { E.card(960, 890, Math.max(520, sub.length * 30), 110, P.accent2 || P.accent, 860, -2); E.label(sub, 960, 892, 60, P.ink, { weight: 700 }); }
  };
}
export function warning(E, { text, word }) {
  return () => { const { P } = E; E.ground(P.paper);
    E.scaled(960, 470, E.pop(E.S0 + 0.1), () => { E.shape([[960, 180], [1240, 680], [680, 680]], 900, '#F2C94C', { line: 8, smooth: false }); E.hand('!', 960, 520, 300, P.ink); });
    if (E.on(word ? E.wt(word) : E.S0 + 0.8)) { E.card(960, 820, Math.max(600, text.length * 26), 120, P.light, 910); E.label(text, 960, 822, 52, P.ink, { weight: 700 }); }
  };
}
// eras: [{name, color, word?}] in order; the last one can be 'NOW'. gap: {word, text} draws a red span before the last era
export function timeline(E, { eras, gap, caption }) {
  return () => { const { P } = E; E.ground(P.paper); E.ink([[160, 560], [1760, 560]], 1000, { w: 10, len: E.prog(E.S0, 0.8) });
    const n = eras.length, xs = eras.map((_, i) => n === 1 ? 960 : 300 + i * (1320 / (n - 1)));
    eras.forEach((e, i) => { const t0 = e.word ? E.wt(e.word) : E.S0 + 0.4 + i * 0.4; E.scaled(xs[i], 560, E.pop(t0), () => { E.shape(E.circ(xs[i], 560, i === n - 1 ? 60 : 46), 1010 + i, e.color || P.accent, { line: 5 }); E.label(e.name, xs[i], 470, 52, i === n - 1 ? P.red : P.ink, { weight: 700 }); }); });
    if (gap && E.on(E.wt(gap.word))) { const pr = E.prog(E.wt(gap.word), 0.9), a = xs[n - 2] + 60, b = xs[n - 1] - 60; E.ink([[a, 640], [E.lerp(a, b, pr), 640]], 1020, { w: 8, color: P.red }); E.hand(gap.text, (a + b) / 2, 720, 90, P.red); }
    if (caption && E.on(E.wt(caption.word))) E.hand(caption.text, 960, 900, 76, P.ink);
  };
}
// items: [{label, draw(cx,cy,r,id) | color, word}] each pops on its word, then gets a red X
export function crossedOut(E, { items, caption }) {
  return () => { const { P } = E; E.ground(P.paper); const n = items.length;
    items.forEach((it, i) => { const px = 960 + (i - (n - 1) / 2) * Math.min(400, 1500 / n), t0 = E.wt(it.word) - 0.1;
      E.scaled(px, 400, E.pop(t0), () => { it.draw ? it.draw(px, 400, 120, 1100 + i * 60) : E.shape(E.circ(px, 400, 120), 1100 + i * 60, it.color || P.accent); E.label(it.label, px, 580, 40); });
      if (E.on(t0 + 0.45)) E.cross(px, 400, 110, 1180 + i * 2); });
    if (caption && E.on(E.wt(caption.word))) E.hand(caption.text, 960, 880, 72, P.ink);
  };
}
// bars: [{label, color, word}] each bar shrinks (or grows: grow:true) on its word
export function bars(E, { bars: B, title, grow = false, end }) {
  return () => { const { P } = E; E.ground(P.paper); if (title) E.hand(title, 960, 130, 80, P.grey);
    B.forEach((b, i) => { const k = E.prog(E.wt(b.word), 0.6), h = grow ? E.lerp(220, 620, k) : E.lerp(620, 220, k), px = 960 + (i - (B.length - 1) / 2) * 440;
      E.shape(E.rectP(px - 160, 860 - h, 320, h), 2200 + i, b.color || P.accent, { smooth: false }); E.label(b.label, px, 930, 52); });
    if (end && E.on(E.wt(end.word))) { E.ground('rgba(29,26,23,0.82)'); E.hand(end.text, 960, 540, 200, P.light); }
  };
}
// sites: [[x,y],...] walled places; highlight: {index, word, name}
export function walledMap(E, { sites, title, titleWord, highlight, bg }) {
  return () => { const { P } = E; E.ground(bg || P.sand || P.paper); const t0 = E.wt(titleWord);
    sites.forEach(([sx, sy], i) => E.scaled(sx, sy, E.pop(t0 + i * 0.1), () => E.ringWall(sx, sy, 110, 1400 + i * 80, highlight && i === highlight.index && E.on(E.wt(highlight.word)) ? P.highlight : '#EBD6A6')));
    if (E.on(t0)) E.hand(title, 960, 520, 120, P.ink);
    if (highlight && E.on(E.wt(highlight.word))) { const [hx, hy] = sites[highlight.index]; E.card(hx, hy + 200, 340, 90, P.light, 1990); E.label(highlight.name, hx, hy + 202, 54, P.ink, { weight: 700 }); }
  };
}
// a rule: left = allowed, right = forbidden. left/right: {label, draw(cx,cy,r,id)[] }, verdict: {word, text}
export function rule(E, { title = 'THE RULE', left, right, verdict }) {
  return () => { const { P } = E; E.ground(P.paper); E.label(title, 960, 140, 64, P.ink, { weight: 700 });
    E.scaled(540, 480, E.pop(E.S0 + 0.3), () => { left.draw(540, 480, 110, 2900); E.label(left.label, 540, 660, 52); E.hand(left.ok || 'OK', 540, 760, 100, P.ok || '#4F8A3C'); });
    if (E.on(E.wt(right.word))) E.scaled(1380, 480, E.pop(E.wt(right.word)), () => { right.draw(1380, 480, 100, 2950); E.label(right.label, 1380, 660, 52); });
    if (E.on(E.wt(verdict.word))) { E.scaled(1380, 790, E.pop(E.wt(verdict.word)), () => { E.card(1380, 790, 380, 110, P.red, 3050); E.label(verdict.text, 1380, 792, 64, P.light, { weight: 700 }); }); for (let i = 0; i < 5; i++) E.ink([[1210 + i * 85, 340], [1210 + i * 85, 620]], 3060 + i, { w: 14 }); }
  };
}
// split screen: two halves with a character each and a caption on a word each
export function versus(E, { left, right, footer }) {
  return () => { const { P, x } = E; x.fillStyle = left.bg; x.fillRect(0, 0, 960, 1080); x.fillStyle = right.bg; x.fillRect(960, 0, 960, 1080); E.ink([[960, 0], [940, 300], [980, 600], [950, 1080]], 4200, { w: 14 });
    E.person(560, 900, 1.15, { ...ch(E, left.who), id: 4210 }); E.person(1360, 900, 1.15, { ...ch(E, right.who), id: 4250, flip: -1 });
    if (E.on(E.wt(left.word))) E.hand(left.text, 560, 230, 80, left.ink || P.ink); if (E.on(E.wt(right.word))) E.hand(right.text, 1360, 230, 80, right.ink || P.light);
    if (footer && E.on(E.wt(footer.word))) { E.card(960, 1000, 760, 100, P.ink, 4290); E.label(footer.text, 960, 1002, 48, P.light, { weight: 700 }); }
  };
}
export function twoDoors(E, { a, b, bg }) {
  return () => { const { P } = E; E.ground(bg || P.night || P.ink);
    [a, b].forEach((d, i) => { const px = i ? 1300 : 620; E.scaled(px, 560, E.pop(E.wt(d.word) - 0.1), () => { E.shape(E.rectP(px - 190, 260, 380, 600), 4000 + i * 10, d.color, { smooth: false }); E.shape(E.circ(px + 130, 580, 18), 4005 + i * 10, P.highlight || P.light, { line: 3 }); E.label(d.text, px, 920, 48, P.light, { weight: 700 }); }); });
    E.hand('?', 960, 560, 260, P.light);
  };
}
// mentors: [{name, draw|color, word}] vs an empty roster that gets crossed on goneWord
export function roster(E, { leftTitle, rightTitle, items, goneWord, caption }) {
  return () => { const { P } = E; E.ground(P.paper); E.label(leftTitle, 480, 160, 48, P.ink, { weight: 700 }); E.label(rightTitle, 1440, 160, 48, P.ink, { weight: 700 });
    items.slice(0, 4).forEach((it, i) => { const cx = 320 + (i % 2) * 320, cy = 360 + Math.floor(i / 2) * 330; E.scaled(cx, cy + 20, E.pop(it.word ? E.wt(it.word) : E.S0 + 1 + i * 0.3), () => { it.draw ? it.draw(cx, cy, 90, 4300 + i * 50) : E.shape(E.circ(cx, cy, 90), 4300 + i * 50, it.color || P.accent); E.label(it.name, cx, cy + 120, 40); }); });
    for (let i = 0; i < 4; i++) { const cx = 1280 + (i % 2) * 320, cy = 360 + Math.floor(i / 2) * 330; E.shape(E.circ(cx, cy, 90), 4600 + i * 5, '#E2D7C1', { line: 4 }); if (E.on(E.wt(goneWord))) E.cross(cx, cy, 70, 4650 + i * 2); }
    if (caption && E.on(E.wt(caption.word))) E.hand(caption.text, 960, 1000, 64, P.red);
  };
}
export function posterPair(E, { left, right, bg }) {
  return () => { const { P } = E; E.ground(bg || '#C9A86A'); E.card(600, 540, 560, 760, P.light, 5200, -3); E.card(1320, 540, 560, 760, P.light, 5210, 3);
    E.hand(left.title, 600, 250, 110, left.color || '#4F8A3C'); E.person(600, 780, 0.9, { ...ch(E, left.who), id: 5220 }); E.label(left.note, 600, 860, 30, P.ink);
    if (E.on(E.wt(right.word))) { E.hand(right.title, 1320, 250, 110, right.color || P.red); E.person(1320, 780, 0.9, { ...ch(E, right.who), id: 5260 }); E.label(right.note, 1320, 860, 30, P.ink); }
  };
}
// lines: [[word, text], ...] each ticks on its word
export function checklist(E, { title = "LET'S ADD IT UP", lines }) {
  return () => { const { P } = E; E.ground(P.paper); E.label(title, 960, 90, 54, P.ink, { weight: 700 }); const gap = Math.min(108, 860 / lines.length);
    lines.forEach(([wd, txt], i) => { const t0 = E.wt(wd); if (!E.on(t0)) return; const yy = 180 + i * gap;
      E.scaled(260, yy, E.pop(t0, 0.35), () => { E.shape(E.rectP(225, yy - 35, 70, 70), 6000 + i * 5, P.light, { smooth: false }); E.ink([[238, yy], [258, yy + 22], [290, yy - 28]], 6003 + i * 5, { w: 10, color: P.red }); });
      E.hand(txt, 340, yy, 72, P.ink, { align: 'left' }); });
  };
}
// a row of characters that fade out one by one on fadeWord; then the next-episode button
export function nextTease(E, { cast, lines = [], fadeWord, buttonWord, button = 'NEXT VIDEO >' }) {
  return () => { const { P, x } = E; E.ground(P.night || P.ink);
    cast.forEach((c, i) => { const lit = !E.on(E.wt(fadeWord) + i * 0.12); x.save(); x.globalAlpha = lit ? 1 : 0.25; E.person(260 + i * (1400 / Math.max(1, cast.length - 1)), 860, 0.75, { ...ch(E, c), id: 6100 + i * 40 }); x.restore(); });
    lines.forEach(([wd, txt, col], i) => { if (E.on(E.wt(wd))) E.hand(txt, 960, 200 + i * 130, 90, col || P.light); });
    if (E.on(E.wt(buttonWord))) { E.card(960, 1000, 520, 100, P.highlight || P.accent, 6400); E.label(button, 960, 1002, 54, P.ink, { weight: 700 }); }
  };
}
