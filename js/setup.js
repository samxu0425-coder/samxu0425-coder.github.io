// Shared setup: smooth scroll, one easing, and small helpers every section uses.
// gsap, ScrollTrigger and Lenis are loaded as plain scripts in index.html.
export const gsap = window.gsap;
export const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

export const EASE = 'expo.out';   // the one shared easing
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Phones get their own drawing layouts. They are built once at load, so if the
// window crosses the breakpoint (rotating, resizing) the page reloads to rebuild.
const phoneQuery = matchMedia('(max-width: 700px)');
export const mobile = phoneQuery.matches;
phoneQuery.addEventListener('change', () => location.reload());

export let lenis = null;
if (!reduce && window.Lenis) {
  lenis = new window.Lenis({ anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

const NS = 'http://www.w3.org/2000/svg';
// Create an SVG element with attributes, append it to a parent, return it.
export const el = (name, attrs, parent, text) => {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text) e.textContent = text;
  parent.appendChild(e);
  return e;
};

// One scroll-scrubbed timeline per section.
export const timeline = trigger => gsap.timeline({
  defaults: { ease: EASE },
  scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: reduce ? true : 0.5 }
});
