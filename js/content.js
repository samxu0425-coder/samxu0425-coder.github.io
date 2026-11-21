// EDIT: the dots on the circle, in order. `big: true` means it had its own section.
// Leave `link` out for anything that shouldn't have a "View the code" link.
// `demo` adds a "Try it" link; `note` is a short line shown under the links.
const GH = 'https://github.com/samxu0425-coder/';

export const WORK = [
  { name: 'PianoFi', big: true, link: GH + 'pianofi', demo: 'https://www.pianofi.ca/',
    text: 'A song goes in and piano sheet music comes out. I built the backend and trained the models.' },
  { name: 'PianoFi Live', big: true, link: GH + 'pianofi-live', demo: 'https://54-174-0-35.sslip.io/',
    text: 'The same transcription model running live, drawing notes about a second after you play them.' },
  { name: 'Triv.AI', big: true, link: GH + 'triv.ai', demo: 'https://project-b31c7095-e67e-4505-9ea.appspot.com/',
    text: 'A multiplayer trivia game that writes its quiz from your notes and grades answers as you type.' },
  { name: 'Finovax', big: true,
    text: 'My internship this past summer, building a research assistant for quant finance and the evaluation behind it.' },
  { name: 'EyeConnect', link: GH + 'EyeConnect',
    text: "Built in a day at HackNYU with a team. It puts blind and low-vision users on a video call with a sighted volunteer, and an AI describes the scene when nobody's free. I handled the backend." },
  { name: 'Unix systems',
    text: 'A semester of writing C close to the operating system, with forked processes, signals, and functions rebuilt to match compiled code.' }
];

export const EMAIL = 'sx2472@nyu.edu';

// EDIT: the access key from web3forms.com. It is meant to be public.
// While this is empty, Send opens the visitor's mail app instead.
export const FORM_KEY = 'fa0b62e9-35dd-4361-9b96-a5ed31326c21';
