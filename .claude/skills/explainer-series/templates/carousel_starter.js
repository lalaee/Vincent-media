// Carousel starter: one static slide per scene (s1..sN), rendered ~0.9 s into each scene.
// Works at 1080x1350 (Instagram 4:5) and 1080x1920 (TikTok 9:16): the illustration zone grows a little with the height.
// Every claim on a slide must be backed by the episode script. Full worked example: examples/avatar-seven-havens/carousel.js
export default (E) => {
  const { x, P, W, H, TAU, ink, shape, circ, rectP, hand, label, scaled, person, card, burst, cross, star, ground } = E;
  const N = 3, CX = W / 2, CHANNEL = 'LADEEDA WORLDS', SECTION = (E.series?.section?.label) || 'REASON';
  const TOP = 440, BOT = H - 300, CY = (TOP + BOT) / 2, K = Math.min(1.15, Math.max(1, (BOT - TOP) / 610));   // illustration zone; keep art within ~860 px wide
  const SEC = (E.series?.section?.colors) || ['#F2A33A', '#2F7FC1', '#4F8A3C', '#D8432E', '#3FC1B0', '#7B5CD6', '#C7362B'];
  function footer(n, dark) { const c = dark ? P.light : P.ink; label(CHANNEL, 60, H - 70, 30, c, { align: 'left', weight: 700 }); label(`${n}/${N}`, W - 60, H - 70, 30, c, { align: 'right', weight: 700 }); if (n < N) hand('swipe >', CX, H - 70, 46, dark ? P.highlight : P.red); }
  function header(n, lines) { const c = SEC[(n - 1) % SEC.length];                    // numbered section header (badge, label, 2-line title)
    shape(circ(CX, 130, 62), 10, c, { line: 5 }); label(String(n), CX, 136, 76, P.light, { weight: 700 });
    label(`${SECTION} ${n}`, CX, 228, 34, c, { weight: 700 }); lines.forEach((l, i) => hand(l, CX, 300 + i * 76, 76, P.ink)); }
  function caption(lines, c = P.ink) { lines.forEach((l, i) => label(l, CX, H - 240 + i * 50, 38, c, { weight: 600 })); }   // 2 lines, <= ~42 chars each
  const zone = (fn) => scaled(CX, CY, K, fn);
  const slide = (bg, fn) => () => { ground(bg); fn(); };
  return {
    s1: slide(P.ink, () => {                                        // cover: series opener + subject + one strong image
      hand('Why it sucks to be', CX, 190, 92, P.light); hand('THE SUBJECT', CX, 330, 150, P.highlight);
      zone(() => person(CX, CY + 250, 0.9, { char: 'you', arms: 'up', id: 300 }));
      label('N reasons you would not want this', CX, H - 200, 38, P.light, { weight: 600 }); footer(1, true);
    }),
    s2: slide(P.paper, () => {                                      // one slide per numbered section
      header(1, ['Section title', 'in two lines']);
      zone(() => person(CX, CY + 230, 0.95, { char: 'you', face: 'scared', id: 400 }));
      caption(['One sentence the script supports,', 'split over two lines.']); footer(2);
    }),
    s3: slide(P.ink, () => {                                        // call to action: the episode's dilemma + where to watch
      hand('So, would you...?', CX, 220, 90, P.light);
      label('Full video on YouTube', CX, H - 250, 42, P.light, { weight: 700 }); hand('Ladeeda Worlds', CX, H - 180, 70, P.highlight); footer(3, true);
    }),
  };
};
