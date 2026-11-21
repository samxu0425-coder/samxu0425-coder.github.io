import { gsap, el, timeline, mobile } from './setup.js?v=1795248026';

// Colours come from the page theme, so the canvas follows light and dark mode.
let FG, DIM, BG, TINT, FRAME, LIGHT, KEYW, KEYB;
function palette() {
  const css = getComputedStyle(document.documentElement);
  FG = css.getPropertyValue('--fg').trim(); DIM = css.getPropertyValue('--dim').trim(); BG = css.getPropertyValue('--bg').trim();
  TINT = css.getPropertyValue('--tint').trim(); FRAME = css.getPropertyValue('--frame').trim();
  // Piano keys keep their real colours in both modes.
  LIGHT = document.documentElement.dataset.theme === 'light';
  KEYW = LIGHT ? BG : FG; KEYB = LIGHT ? FG : BG;
}
palette();
const root = document.getElementById('pianofi');
const q = gsap.utils.selector(root);

/* ---------- Pipeline drawing: song -> queues -> workers -> sheet music ---------- */
const rest = root.querySelector('#rest');
const amt = root.querySelector('#amt');

// Desktop draws left to right; phones stack it top to bottom in a taller drawing.
root.querySelector('#pipe').setAttribute('viewBox', mobile ? '0 0 400 440' : '0 0 1000 400');
const L = mobile
  ? { wave: { x0: 95, cy: 52, k: 0.27 }, song: [200, 116], sheet: [200, 394],
      staff: { x1: 30, x2: 370, y0: 290, gap: 16, nx: 62, stem: 36, rx: 7, ry: 5 },
      amtMove: { x: 130, y: -160 }, text: 'font-size:15px', cap: 'font-size:12px' }
  : { wave: { x0: 22, cy: 200, k: 0.5 }, song: [127, 318], sheet: [800, 318],
      staff: { x1: 620, x2: 980, y0: 160, gap: 20, nx: 656, stem: 44, rx: 8, ry: 6 },
      amtMove: { x: 69, y: -82 }, text: '', cap: '' };

// Song: a waveform
const wave = el('g', {}, rest);
for (let i = 0; i < 36; i++) {
  const h = 18 + 150 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37));
  const x = L.wave.x0 + i * 6;
  el('line', { class: 's bar', x1: x, x2: x, y1: L.wave.cy - h * L.wave.k, y2: L.wave.cy + h * L.wave.k }, wave);
}
el('text', { class: 'cap lbl-song', x: L.song[0], y: L.song[1], 'text-anchor': 'middle', style: L.cap }, rest, 'song');

// Three workers, each behind its own queue
['AMT-APC', 'PiCoGen', 'PTI'].forEach((name, i) => {
  const side = i === 0 ? amt : rest;
  if (mobile) {
    const cx = [70, 200, 330][i];
    el('path', { class: 's conn-in', d: `M200 124 C 200 142, ${cx} 130, ${cx} 148` }, rest);
    for (let k = 0; k < 3; k++) el('rect', { class: 's q', x: cx - 16 + k * 12, y: 150, width: 8, height: 8 }, rest);
    el('rect', { class: 's box', x: cx - 58, y: 166, width: 116, height: 48, rx: 4 }, side);
    el('text', { class: 'box', x: cx, y: 195, 'text-anchor': 'middle', style: L.text }, side, name);
    el('path', { class: 's conn-out', d: `M${cx} 214 C ${cx} 240, 200 238, 200 264` }, rest);
  } else {
    const y = [110, 200, 290][i];
    el('path', { class: 's conn-in', d: `M248 200 C 270 200, 268 ${y}, 290 ${y}` }, rest);
    for (let k = 0; k < 3; k++) el('rect', { class: 's q', x: 296 + k * 12, y: y - 4, width: 8, height: 8 }, rest);
    el('rect', { class: 's box', x: 336, y: y - 28, width: 190, height: 56, rx: 4 }, side);
    el('text', { class: 'box', x: 431, y: y + 5, 'text-anchor': 'middle' }, side, name);
    el('path', { class: 's conn-out', d: `M526 ${y} C 566 ${y}, 566 200, 606 200` }, rest);
  }
});

// Sheet music: a staff with notes
const S = L.staff;
const staff = el('g', {}, rest);
for (let i = 0; i < 5; i++) el('line', { class: 's staffline', x1: S.x1, x2: S.x2, y1: S.y0 + i * S.gap, y2: S.y0 + i * S.gap }, staff);
el('line', { class: 's staffline', x1: S.x1, x2: S.x1, y1: S.y0, y2: S.y0 + 4 * S.gap }, staff);
[3.5, 2.5, 3, 1.5, 2, 0.5, 1, 2, 0].forEach((step, i) => {
  const x = S.nx + i * 36, y = S.y0 + step * S.gap;
  const g = el('g', { class: 'note' }, staff);
  el('ellipse', { class: 'f', cx: x, cy: y, rx: S.rx, ry: S.ry, transform: `rotate(-20 ${x} ${y})` }, g);
  el('line', { class: 's', x1: x + S.rx - 1, x2: x + S.rx - 1, y1: y - 2, y2: y - 2 - S.stem }, g);
});
el('text', { class: 'cap lbl-sheet', x: L.sheet[0], y: L.sheet[1], 'text-anchor': 'middle', style: L.cap }, rest, 'sheet music');

/* ---------- Piano roll ---------- */
// Placeholder notes: opening bars of Bach's Prelude in C major (public domain).
// Swap for a real PianoFi Live MIDI export later.
const STEP = 0.2, PATTERN = [0, 1, 2, 3, 4, 2, 3, 4];
const BARS = [
  [60, 64, 67, 72, 76], [60, 62, 69, 74, 77], [59, 62, 67, 74, 77], [60, 64, 67, 72, 76],
  [60, 64, 69, 76, 81], [60, 62, 66, 69, 74], [59, 62, 67, 74, 79], [59, 60, 64, 67, 72]
];
const NOTES = [];
BARS.forEach((bar, b) => {
  for (let half = 0; half < 2; half++) {
    PATTERN.forEach((idx, k) => {
      const start = (b * 16 + half * 8 + k) * STEP;
      const dur = k === 0 ? 8 * STEP : k === 1 ? 7 * STEP : STEP;
      NOTES.push({ pitch: bar[idx], start, dur: dur - 0.03 });
    });
  }
});
const TOTAL = BARS.length * 16 * STEP;
const LAG = 1.0;                       // seconds the roll runs behind the audio
const LO = 57, HI = 83;
const isBlack = n => [1, 3, 6, 8, 10].includes(n % 12);

const cv = root.querySelector('#roll');
const ctx = cv.getContext('2d');
const state = { p: 0 };

function size() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function draw() {
  const w = cv.clientWidth, h = cv.clientHeight;
  if (!w || !h) return;
  ctx.clearRect(0, 0, w, h);
  const top = 24, rows = HI - LO + 1, rh = (h - top) / rows;
  const keyW = Math.max(22, Math.min(44, w * 0.06));
  // You play at the right edge. About a second later the notes appear at the
  // dashed line, then slide left to the keyboard.
  const nowX = w - 8, pps = (nowX - keyW) / 6.5, lagX = nowX - LAG * pps;
  const t = state.p * (TOTAL + 2.5);
  const heard = t - LAG;               // the roll only knows the audio up to here
  // A key goes down while its note is touching the keyboard, so the two line up.
  const atKeys = heard - (lagX - keyW) / pps;
  const rowY = n => top + (HI - n) * rh;

  // Rows and keys
  ctx.font = `${Math.min(9, Math.max(7, rh))}px "IBM Plex Mono", monospace`; ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
  for (let n = LO; n <= HI; n++) {
    const y = rowY(n), black = isBlack(n);
    if (black) { ctx.fillStyle = TINT; ctx.fillRect(keyW, y, nowX - keyW, rh); }
    const on = NOTES.some(o => o.pitch === n && o.start <= atKeys && o.start + o.dur > atKeys);
    ctx.fillStyle = on ? DIM : black ? KEYB : KEYW;
    ctx.fillRect(0, y + 0.5, black ? keyW * 0.62 : keyW, rh - 1);
    if (LIGHT && !black) { ctx.strokeStyle = FRAME; ctx.lineWidth = 1; ctx.strokeRect(0.5, y + 0.5, keyW - 1, rh - 1); }
    // Name the C keys for reference
    if (n % 12 === 0) { ctx.fillStyle = KEYB; ctx.fillText('C' + (n / 12 - 1), keyW - 3, y + rh / 2 + 0.5); }
  }
  ctx.strokeStyle = FRAME; ctx.lineWidth = 1;
  ctx.strokeRect(0.5, top + 0.5, nowX - 0.5, h - top - 1);

  // Audio that has been played but not transcribed yet
  ctx.strokeStyle = DIM; ctx.beginPath();
  for (let x = lagX + 4; x < nowX - 2; x += 5) {
    const time = t - (nowX - x) / pps;
    if (time < 0 || time > TOTAL) continue;
    const a = (0.25 + 0.75 * Math.abs(Math.sin(time * 9.1) * Math.cos(time * 3.3))) * (h - top) * 0.22;
    const mid = top + (h - top) / 2;
    ctx.moveTo(x + 0.5, mid - a); ctx.lineTo(x + 0.5, mid + a);
  }
  ctx.stroke();

  // Notes, only up to what the engine has heard
  ctx.fillStyle = FG;
  for (const o of NOTES) {
    if (o.start > heard) continue;
    const end = Math.min(o.start + o.dur, heard);
    const x1 = Math.max(keyW + 1, lagX - (heard - o.start) * pps), x2 = lagX - (heard - end) * pps;
    if (x2 <= keyW + 1) continue;
    ctx.fillRect(x1, rowY(o.pitch) + 1, Math.max(1.5, x2 - x1), Math.max(2, rh - 2));
  }

  // The two lines: where you are, and where the notes are
  ctx.strokeStyle = FG; ctx.beginPath(); ctx.moveTo(nowX - 0.5, top); ctx.lineTo(nowX - 0.5, h); ctx.stroke();
  ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(lagX + 0.5, top); ctx.lineTo(lagX + 0.5, h); ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = '10px "IBM Plex Mono", monospace'; ctx.fillStyle = DIM; ctx.textBaseline = 'middle';
  ctx.textAlign = 'right'; ctx.fillText('YOU PLAY', nowX, 9);
  ctx.fillText('NOTES APPEAR', lagX - 6, 9);
  ctx.textAlign = 'center';
  if (nowX - lagX > 70) ctx.fillText('~1 S', (nowX + lagX) / 2 - 28, 9);
}

addEventListener('resize', size);
addEventListener('themechange', () => { palette(); draw(); });
size();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);

/* ---------- Scroll timeline ---------- */
timeline(root)
  .from(q('.copy-a'), { opacity: 0, y: 30, duration: 0.6 }, 0)
  // a song comes in
  .from(q('.bar'), { scaleY: 0, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.015 }, 0.1)
  .from(q('.lbl-song'), { opacity: 0, duration: 0.3 }, 0.7)
  // it waits in a queue for each model
  .from(q('.conn-in'), { opacity: 0, duration: 0.4, stagger: 0.1 }, 1.1)
  .from(q('.q'), { opacity: 0, duration: 0.2, stagger: 0.04 }, 1.3)
  .from(q('.box'), { opacity: 0, x: -18, duration: 0.5, stagger: 0.08 }, 1.6)
  .from(q('.conn-out'), { opacity: 0, duration: 0.4, stagger: 0.1 }, 2.2)
  // sheet music comes out
  .from(q('.staffline'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.6, stagger: 0.04 }, 2.5)
  .from(q('.note'), { scale: 0, transformOrigin: '50% 50%', duration: 0.3, stagger: 0.09 }, 2.9)
  .from(q('.lbl-sheet'), { opacity: 0, duration: 0.3 }, 3.6)
  // bridge: everything leaves except the transcription model
  .to(q('.copy-a'), { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in' }, 4.5)
  .to(rest, { opacity: 0, duration: 0.6, ease: 'power2.in' }, 4.5)
  .to(amt, { ...L.amtMove, duration: 0.9, ease: 'power2.inOut' }, 4.7)
  // the same model, now live
  .from(cv, { opacity: 0, duration: 0.6 }, 5.4)
  .from(q('.copy-b'), { opacity: 0, y: 30, duration: 0.6 }, 5.4)
  .to(state, { p: 1, duration: 6, ease: 'none', onUpdate: draw }, 5.8)
  // leave
  .to(q('.stage'), { opacity: 0, duration: 0.5, ease: 'power2.in' }, 11.9);
