import { gsap, EASE, reduce } from './setup.js?v=1795284557';

const root = document.getElementById('hero');
const q = gsap.utils.selector(root);

// Split the headline into masked words and letters, and the line under it into words.
const h1 = root.querySelector('h1');
h1.innerHTML = h1.textContent.trim().split(' ').map(word =>
  `<span class="word" aria-hidden="true">${[...word].map(c => `<span class="char">${c}</span>`).join('')}</span>`
).join(' ');
const sub = root.querySelector('.sub');
sub.innerHTML = sub.textContent.trim().split(' ').map(w => `<span class="w">${w}</span>`).join(' ');

const chars = q('.char'), words = q('.sub .w'), glyphs = q('.glyph');
const hint = root.querySelector('.hint');
const topNav = document.querySelectorAll('.top');

gsap.set([chars, words, glyphs, hint, topNav], { visibility: 'visible' });

if (!reduce) {
  // Landing: black, then the line, then the sentence, then the symbols.
  gsap.timeline({ defaults: { ease: EASE }, delay: 0.35 })
    .from(chars, { yPercent: 115, duration: 1.3, stagger: 0.055 })
    .from(words, { opacity: 0, y: 14, duration: 0.9, stagger: 0.035 }, '-=0.75')
    .from(glyphs.map(g => g.querySelector('svg')), { clipPath: 'inset(0 100% 0 0)', duration: 1.2, stagger: 0.14 }, '-=0.5')
    .from(glyphs.map(g => g.querySelector('figcaption')), { opacity: 0, duration: 0.8, stagger: 0.14 }, '<0.35')
    .from(hint.firstElementChild, { opacity: 0, duration: 0.8 }, '-=0.6')
    .from(topNav, { opacity: 0, y: -10, duration: 0.8 }, '<');

  // Slow idle drift so the symbols are never completely still.
  glyphs.forEach((g, i) => {
    gsap.to(g.querySelector('.float'), { y: i % 2 ? 9 : -9, duration: 3.2 + i * 0.45, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });

  // Scroll: the line pulls back and the symbols fly outward past the edges.
  const out = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
  out.to(hint, { opacity: 0, duration: 0.1, ease: 'none' }, 0)
     .to(q('.hero-text'), { scale: 0.82, opacity: 0, duration: 1, ease: 'power2.in' }, 0);
  glyphs.forEach(g => {
    out.to(g, {
      x: () => +g.dataset.dx * innerWidth * 0.45,
      y: () => +g.dataset.dy * innerHeight * 0.55,
      scale: 1.8, opacity: 0, duration: 1, ease: 'power2.in'
    }, 0);
  });
}
