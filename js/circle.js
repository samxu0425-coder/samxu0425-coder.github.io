import { gsap, el, timeline, reduce, mobile } from './setup.js?v=1795248026';
import { WORK } from './content.js?v=1795248026';

const root = document.getElementById('circle');
const q = gsap.utils.selector(root);
const svg = root.querySelector('svg');
const C = 300, R = 250;
// Phones hide the outside labels, so the ring can fill the drawing.
if (mobile) svg.setAttribute('viewBox', '-25 -25 650 650');

// What comes after the ring: a much bigger arc, with this ring as its first dot
const DONE = { x: C - 250, y: 1700 - Math.sqrt(1400 * 1400 - 250 * 250) };
const nextstage = el('g', { id: 'nextstage' }, svg);
const arc = el('circle', { class: 's d', cx: C, cy: 1700, r: 1400 }, nextstage);
const NR = mobile ? 17 : 12;
const done = el('circle', { class: 'f', cx: DONE.x, cy: DONE.y, r: NR }, nextstage);
el('circle', { class: 's bgfill empty', cx: C, cy: 300, r: NR }, nextstage);
el('circle', { class: 's bgfill empty', cx: C + 250, cy: DONE.y, r: NR }, nextstage);
const capStyle = mobile ? 'font-size:20px' : '';
el('text', { class: 'cap nlabel', x: DONE.x, y: DONE.y + (mobile ? 52 : 36), 'text-anchor': 'middle', style: capStyle }, nextstage, 'so far');
el('text', { class: 'cap nlabel', x: C, y: mobile ? 352 : 336, 'text-anchor': 'middle', style: capStyle }, nextstage, 'next');

// Everything on the ring lives in one group so it can shrink as a whole
const world = el('g', {}, svg);
const ringLine = el('circle', { class: 's d', cx: C, cy: C, r: R }, world);

// Small beads that gather onto the ring
const beads = el('g', {}, world);
let seed = 5;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const scatter = [];
for (let i = 0; i < 36; i++) {
  const a = i * 10 * Math.PI / 180;
  el('circle', { class: 'f bead', cx: C + R * Math.cos(a), cy: C + R * Math.sin(a), r: mobile ? 3.5 : 2.5 }, beads);
  scatter.push({ x: (rnd() - 0.5) * 900 - R * Math.cos(a) * 0.6, y: (rnd() - 0.5) * 640 - R * Math.sin(a) * 0.6 });
}

// One dot per piece of work
const dots = WORK.map((w, i) => {
  const a = (-90 + i * 60) * Math.PI / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  const x = C + R * cos, y = C + R * sin;
  const g = el('g', { class: 'dot', tabindex: 0, role: 'button', 'aria-label': w.name }, world);
  el('circle', { class: 'hitarea', cx: x, cy: y, r: mobile ? 44 : 30 }, g);
  el('circle', { class: 'core', cx: x, cy: y, r: (w.big ? 11 : 7) * (mobile ? 1.5 : 1) }, g);
  const anchor = cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle';
  el('text', { x: C + (R + 34) * cos, y: C + (R + 34) * sin + (Math.abs(sin) > 0.9 ? (sin > 0 ? 14 : -2) : 5), 'text-anchor': anchor }, g, w.name);
  const pick = () => select(i);
  g.addEventListener('mouseenter', pick);
  g.addEventListener('click', pick);
  g.addEventListener('focus', pick);
  return g;
});

// Words in the middle
const center = root.querySelector('.center');
const title = root.querySelector('.c-title'), desc = root.querySelector('.c-desc'), link = root.querySelector('.c-link');
let current = -1;
function select(i) {
  if (i === current) return;
  current = i;
  dots.forEach((d, n) => d.classList.toggle('on', n === i));
  const w = WORK[i];
  title.textContent = w.name;
  desc.textContent = w.text;
  link.style.display = w.link ? '' : 'none';
  if (w.link) link.href = w.link;
  if (!reduce) gsap.fromTo(center.children, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'expo.out', overwrite: true });
}

// Keep the words sized and centred to the ring as the window changes
function place() {
  if (mobile) return;   // on phones the words sit under the ring, placed by CSS
  const r = ringLine.getBoundingClientRect(), wrap = svg.parentElement.getBoundingClientRect();
  center.style.left = (r.left + r.width / 2 - wrap.left) + 'px';
  center.style.top = (r.top + r.height / 2 - wrap.top) + 'px';
  center.style.width = (r.width * 0.64) + 'px';
}
addEventListener('resize', place);
place();

// Idle: the beads turn slowly
if (!reduce) gsap.to(beads, { rotation: 360, svgOrigin: `${C} ${C}`, duration: 140, ease: 'none', repeat: -1 });

// Scroll: beads gather, the dots land, each piece of work takes its turn, then the ring becomes one dot
select(0);
timeline(root)
  .from(q('.bead'), { x: i => scatter[i].x, y: i => scatter[i].y, opacity: 0, duration: 1.8, stagger: 0.01, ease: 'power3.out' }, 0)
  .from(ringLine, { opacity: 0, scale: 0.85, svgOrigin: `${C} ${C}`, duration: 1.2 }, 0.6)
  .from(dots, { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.08 }, 1.4)
  .from(center, { opacity: 0, duration: 0.6 }, 1.9)
  .to({}, {
    duration: 6, ease: 'none',
    onUpdate() { select(Math.min(WORK.length - 1, Math.floor(this.progress() * WORK.length))); }
  }, 2.2)
  // next stage: the whole ring shrinks into one dot on a bigger arc
  .to(center, { autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 8.5)
  .to(q('.dot text'), { opacity: 0, duration: 0.4 }, 8.5)
  .to(world, { scale: 0.05, x: DONE.x - C, y: DONE.y - C, svgOrigin: `${C} ${C}`, duration: 1.6, ease: 'power3.inOut' }, 8.8)
  .from(arc, { opacity: 0, duration: 1 }, 9.5)
  .from(done, { scale: 0, transformOrigin: '50% 50%', duration: 0.5 }, 10.1)
  .to(world, { opacity: 0, duration: 0.3 }, 10.2)
  .from(q('.empty'), { scale: 0, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.15 }, 10.4)
  .from(q('.nlabel'), { opacity: 0, duration: 0.4, stagger: 0.1 }, 10.6)
  .from(q('.next'), { autoAlpha: 0, duration: 0.1 }, 10.6)
  .from(q('.next > *'), { opacity: 0, y: 20, duration: 0.7, stagger: 0.08 }, 10.6)
  .to({}, { duration: 1.2 });
