import { gsap, el, timeline, mobile } from './setup.js?v=1795248026';

const root = document.getElementById('finovax');
const q = gsap.utils.selector(root);
const art = root.querySelector('svg');

// Desktop: sources on the left, answer and evaluation on the right.
// Phones: sources on top, answer and evaluation side by side under them.
art.setAttribute('viewBox', mobile ? '0 0 400 440' : '0 0 1000 400');
const L = mobile
  ? { field: { x: 20, y: 58, w: 360, h: 176, n: 46, r: 4.5, min: 20 }, query: [200, 146, 9], srcCap: [20, 46],
      ans: { x: 20, capY: 268, y: i => 292 + i * 22, widths: [140, 122, 148, 104, 70] },
      grid: { x: 222, capY: 268, y: 284, cols: 8, size: 13, pitch: 20 },
      cap: 'font-size:12px' }
  : { field: { x: 70, y: 96, w: 470, h: 268, n: 70, r: 4, min: 17 }, query: [300, 225, 8], srcCap: [70, 82],
      ans: { x: 640, capY: 82, y: i => 112 + i * 24, widths: [300, 262, 312, 224, 150] },
      grid: { x: 640, capY: 262, y: 278, cols: 16, size: 12, pitch: 20 },
      cap: '' };
const F = L.field, [QX, QY, QR] = L.query, A = L.ans, G = L.grid;

// The question, split into letters so it can type itself
const question = root.querySelector('.question');
question.innerHTML = [...question.textContent].map(c => `<span class="qc">${c}</span>`).join('');

// The sources: a field of dots, placed the same way every time
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pts = [];
while (pts.length < F.n) {
  const x = F.x + rnd() * F.w, y = F.y + rnd() * F.h;
  if (Math.hypot(x - QX, y - QY) < 30) continue;
  if (pts.some(p => Math.hypot(p.x - x, p.y - y) < F.min)) continue;
  pts.push({ x, y, d: Math.hypot(x - QX, y - QY) });
}
const hits = [...pts].sort((a, b) => a.d - b.d).slice(0, 5);

const lblSrc = el('text', { class: 'cap', x: L.srcCap[0], y: L.srcCap[1], style: L.cap }, art, 'sources');
const misses = el('g', {}, art);
pts.filter(p => !hits.includes(p)).forEach(p => el('circle', { class: 's', cx: p.x, cy: p.y, r: F.r }, misses));
const outlines = el('g', {}, art);
hits.forEach(p => el('circle', { class: 's', cx: p.x, cy: p.y, r: F.r }, outlines));
hits.forEach(p => el('line', { class: 's link', x1: QX, y1: QY, x2: p.x, y2: p.y }, art));
hits.forEach(p => el('circle', { class: 'f hit', cx: p.x, cy: p.y, r: F.r + 1 }, art));
const query = el('circle', { class: 'f', cx: QX, cy: QY, r: QR }, art);

// The answer, written from the sources it found
const lblAns = el('text', { class: 'cap', x: A.x, y: A.capY, style: L.cap }, art, 'answer');
A.widths.forEach((w, i) => el('line', { class: 's al', x1: A.x + 14, x2: A.x + 14 + w, y1: A.y(i), y2: A.y(i) }, art));

// The evaluation: a grid of test questions
const lblEval = el('text', { class: 'cap', x: G.x, y: G.capY, style: L.cap }, art, 'evaluation');
const WRONG = [5, 12, 19, 27, 33, 41, 50, 58];
for (let i = 0; i < 64; i++) {
  const x = G.x + (i % G.cols) * G.pitch, y = G.y + Math.floor(i / G.cols) * G.pitch;
  el('rect', { class: 's d sq', x, y, width: G.size, height: G.size }, art);
  el('rect', { class: 'f ' + (WRONG.includes(i) ? 'sqfix' : 'sqf'), x, y, width: G.size, height: G.size }, art);
}

const vbW = mobile ? 400 : 1000;
timeline(root)
  .from(q('.copy'), { opacity: 0, y: 30, duration: 0.6 }, 0)
  // someone asks a question
  .from(q('.qc'), { opacity: 0, duration: 0.04, stagger: 0.03, ease: 'none' }, 0.2)
  .from([misses, outlines, lblSrc], { opacity: 0, duration: 0.8 }, 0.7)
  // it becomes a point among the sources
  .to(question, { opacity: 0, y: 20, duration: 0.4, ease: 'power2.in' }, 1.9)
  .from(query, { x: vbW / 2 - QX, y: 10 - QY, scale: 0, transformOrigin: '50% 50%', duration: 0.9, ease: 'power2.inOut' }, 2.1)
  // the closest sources light up
  .from(q('.link'), { opacity: 0, duration: 0.3, stagger: 0.08 }, 3.0)
  .from(q('.hit'), { scale: 0, transformOrigin: '50% 50%', duration: 0.3, stagger: 0.08 }, 3.1)
  .to(misses, { opacity: 0.3, duration: 0.5 }, 3.3)
  // and get pulled out to write the answer
  .to(q('.link'), { opacity: 0, duration: 0.4 }, 4.1)
  .to(q('.hit'), { x: i => A.x - hits[i].x, y: i => A.y(i) - hits[i].y, duration: 0.9, stagger: 0.1, ease: 'power2.inOut' }, 4.1)
  .from(lblAns, { opacity: 0, duration: 0.3 }, 4.6)
  .from(q('.al'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.6, stagger: 0.1 }, 4.8)
  // the evaluation runs, shows the misses, and they get fixed
  .from(lblEval, { opacity: 0, duration: 0.3 }, 5.9)
  .from(q('.sq'), { opacity: 0, duration: 0.2, stagger: 0.012 }, 5.9)
  .from(q('.sqf'), { scale: 0, transformOrigin: '50% 50%', duration: 0.2, stagger: 0.015 }, 6.7)
  .from(q('.sqfix'), { scale: 0, transformOrigin: '50% 50%', duration: 0.3, stagger: 0.1 }, 8.0)
  // leave
  .to(q('.stage'), { opacity: 0, duration: 0.5, ease: 'power2.in' }, 9.6);
