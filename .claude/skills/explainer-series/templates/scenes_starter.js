// scenes.js: one entry per scene id in plan.json. Mix pattern scenes (one line each) with custom scenes drawn with
// the engine vocabulary. Beats key off words: E.on(E.wt('word')), E.pop(E.wt('word')), E.prog(E.wt('word'), 0.6).
// Keep something changing every 3-4 s; scenes over ~12 s need several word-keyed beats.
import * as PT from './patterns.js';

export default (E) => {
  const { x, P, W, H, TAU, on, pop, prog, wt, ink, shape, circ, rectP, hand, label, scaled, person, card, burst, cross, star, ground, wisp, ringWall } = E;
  return {
    // cold open: a custom scene
    open() {
      ground(P.paper);
      scaled(960, 820, pop(E.S0 + 0.1), () => person(960, 820, 1.3, { char: 'hero', arms: on(wt('imagine')) ? 'up' : 'down', id: 10 }));
      if (on(wt('imagine'))) burst(960, 520, 300, 300, 18, P.highlight);
    },
    title: PT.titleCard(E, { kicker: 'Why it matters:', title: 'THE TOPIC', sub: 'SERIES NAME', titleWord: 'topic' }),
    sec1: E.sectionCard(1),
    recap: PT.checklist(E, { lines: [['first', 'the first point'], ['second', 'the second point']] }),
    next: PT.nextTease(E, { cast: ['hero', 'hero'], fadeWord: 'next', buttonWord: 'next', lines: [['next', 'next time...']] }),
  };
};
