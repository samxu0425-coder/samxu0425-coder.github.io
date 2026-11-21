import { gsap, el, timeline, mobile } from './setup.js?v=1795284557';

const root = document.getElementById('trivai');
const q = gsap.utils.selector(root);
const art = root.querySelector('svg');

// Desktop: notes on the left, cards and room on the right.
// Phones: notes on top, cards in a row under them, room at the bottom.
art.setAttribute('viewBox', mobile ? '0 0 400 440' : '0 0 1000 400');
const L = mobile
  ? { page: { x: 140, y: 8, w: 120, h: 150, pad: 14, gap: 14, k: 0.52 }, pageCap: [274, 86, 'start'],
      card: { x: i => 13 + i * 96, y: 180, w: 86, h: 124, pad: 9 },
      room: { x: i => 22 + i * 39.5, y: 372, r: 7, k: 0.62, cap: [200, 412] },
      text: 'font-size:14px', cap: 'font-size:12px' }
  : { page: { x: 80, y: 60, w: 220, h: 280, pad: 24, gap: 27, k: 1 }, pageCap: [190, 372, 'middle'],
      card: { x: i => 370 + i * 156, y: 50, w: 140, h: 190, pad: 14 },
      room: { x: i => 385 + i * 64, y: 340, r: 9, k: 1, cap: [673, 385] },
      text: '', cap: '' };
const P = L.page, K = L.card, M = L.room;

// The notes you upload
const page = el('g', {}, art);
el('rect', { class: 's', x: P.x, y: P.y, width: P.w, height: P.h, rx: 4 }, page);
[150, 172, 120, 168, 140, 90, 160, 130, 60].forEach((w, i) => {
  const y = P.y + P.pad + 12 + i * P.gap;
  el('line', { class: 's pl', x1: P.x + P.pad, x2: P.x + P.pad + w * P.k, y1: y, y2: y }, page);
});
el('text', { class: 'cap', x: L.pageCap[0], y: L.pageCap[1], 'text-anchor': L.pageCap[2], style: L.cap }, page, 'your notes');

// The quiz it writes: four question cards
for (let i = 0; i < 4; i++) {
  const x = K.x(i), y = K.y, inner = K.w - 2 * K.pad;
  const g = el('g', { class: 'card' }, art);
  el('rect', { class: 's bgfill', x, y, width: K.w, height: K.h, rx: 6 }, g);
  el('text', { x: x + K.pad, y: y + K.pad + 14, style: L.text }, g, 'Q' + (i + 1));
  [1, 0.86, 0.62].forEach((f, k) => {
    const ly = y + K.h * 0.3 + k * K.h * 0.085;
    el('line', { class: 's d', x1: x + K.pad, x2: x + K.pad + inner * f, y1: ly, y2: ly }, g);
  });
  // the typed answer, and how it was graded
  const ay = y + K.h * 0.82, mx = x + K.w - K.pad - 18;
  el('line', { class: 's ans', x1: x + K.pad, x2: mx - 6, y1: ay, y2: ay }, g);
  const mark = el('g', { class: 'mark' }, g);
  el('path', { class: 's', d: i === 2
    ? `M${mx + 2} ${ay - 8} l14 14 M${mx + 16} ${ay - 8} l-14 14`
    : `M${mx} ${ay - 1} l6 6 l12 -14` }, mark);
}

// The live room: one host and the players
const RISE = [18, 44, 8, 30, 50, 12, 36, 22, 46, 5];
const room = el('g', {}, art);
RISE.forEach((_, i) => el('circle', { class: (i === 0 ? 'f' : 's') + ' player', cx: M.x(i), cy: M.y, r: M.r }, room));
el('text', { class: 'cap lbl-room', x: M.cap[0], y: M.cap[1], 'text-anchor': 'middle', style: L.cap }, room, 'live room');

const pageCx = P.x + P.w / 2, pageCy = P.y + P.h / 2;
timeline(root)
  .from(q('.copy'), { opacity: 0, y: 30, duration: 0.6 }, 0)
  .from(page, { opacity: 0, y: 24, duration: 0.6 }, 0.1)
  .from(q('.pl'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.4, stagger: 0.05 }, 0.4)
  // the page turns into question cards
  .from(q('.card'), {
    x: i => pageCx - (K.x(i) + K.w / 2), y: pageCy - (K.y + K.h / 2),
    scale: 0.4, rotation: i => (i - 1.5) * 9, opacity: 0, transformOrigin: '50% 50%',
    duration: 1, stagger: 0.18
  }, 1.6)
  .to(page, { opacity: 0.3, duration: 0.8 }, 1.8)
  // friends join
  .from(q('.player'), { scale: 0, transformOrigin: '50% 50%', duration: 0.4, stagger: 0.07 }, 3.2)
  .from(q('.lbl-room'), { opacity: 0, duration: 0.3 }, 3.9)
  // answers get typed and graded
  .from(q('.ans'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.5, stagger: 0.2 }, 4.4)
  .from(q('.mark'), { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.35, stagger: 0.2 }, 4.8)
  // the scoreboard moves
  .to(q('.player'), { y: i => -RISE[i] * M.k, duration: 0.9, stagger: 0.04, ease: 'power2.out' }, 5.8)
  // leave
  .to(q('.stage'), { opacity: 0, duration: 0.5, ease: 'power2.in' }, 7.2);
