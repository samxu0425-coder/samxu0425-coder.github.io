// Entry point: load each section in scroll order.
import { ScrollTrigger, lenis } from './setup.js';
import { EMAIL, FORM_KEY } from './content.js';
import './hero.js';
import './pianofi.js';
import './trivai.js';
import './finovax.js';
import './circle.js';

// "Work" skips the project sections and lands on the ring once it has formed,
// where every project is listed with its link.
document.getElementById('jump-work').addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  const ring = document.getElementById('circle');
  const y = ring.offsetTop + (ring.offsetHeight - innerHeight) * 0.21;
  if (lenis) lenis.scrollTo(y, { duration: 1.6 });
  else scrollTo(0, y);
});

// Contact form: Web3Forms forwards the message to Sam's inbox, so nothing pops up.
// Until a key is set in content.js, it falls back to opening the visitor's mail app.
const form = document.getElementById('msg');
const note = form.querySelector('.note');
const button = form.querySelector('button');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const f = form.elements;
  const subject = 'Hello from ' + f.name.value.trim();
  if (!FORM_KEY) {
    location.href = `mailto:${EMAIL}?subject=` + encodeURIComponent(subject) + '&body=' + encodeURIComponent(f.message.value);
    return;
  }
  if (f.botcheck.checked) return;   // only bots tick the hidden box
  button.disabled = true;
  note.textContent = 'Sending...';
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: FORM_KEY, subject, from_name: f.name.value.trim(),
        name: f.name.value.trim(), email: f.email.value.trim(), message: f.message.value })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    form.reset();
    note.textContent = "Sent. Thanks, I'll get back to you.";
  } catch {
    note.textContent = `That didn't send. Try again, or email ${EMAIL} directly.`;
  }
  button.disabled = false;
});

// Fonts change text sizes, so re-measure once they have loaded.
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
