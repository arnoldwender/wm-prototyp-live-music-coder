/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Starter code templates — pre-built snippets organized by category.
 * Used on landing page, template selector, and help panel. */

import type { EngineType } from '../types/engine';

export interface StarterTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  engine: EngineType;
  code: string;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  /* ── Drums ── */
  {
    id: 'drums-808',
    name: 'TR-808 Beat',
    category: 'Drums',
    description: 'Classic 808 drum machine pattern',
    engine: 'strudel',
    code: `s("bd sd [~ bd] sd")
.speed("<1 1.5 1 0.5>")
.sometimes(x => x.delay(.5))`,
  },
  {
    id: 'drums-breakbeat',
    name: 'Breakbeat',
    category: 'Drums',
    description: 'Syncopated breakbeat with hi-hats',
    engine: 'strudel',
    code: `stack(
  s("bd ~ [bd ~] ~").gain(1.2),
  s("~ sd ~ sd"),
  s("hh*8").gain(.4).pan(sine.range(.3,.7))
)`,
  },
  {
    id: 'drums-euclidean',
    name: 'Euclidean Rhythms',
    category: 'Drums',
    description: 'Algorithmic rhythms using Euclidean patterns',
    engine: 'strudel',
    code: `stack(
  s("bd(3,8)").gain(1.2),
  s("sd(2,8)"),
  s("hh(5,8)").gain(.5),
  s("oh(1,8)").gain(.3)
)`,
  },

  /* ── Bass ── */
  {
    id: 'bass-sub',
    name: 'Sub Bass',
    category: 'Bass',
    description: 'Deep sub bass with filter movement',
    engine: 'strudel',
    code: `note("<c1 c1 eb1 f1>(3,8)")
.s("sine")
.gain(.8)
.lpf(200)
.sustain(.3)`,
  },
  {
    id: 'bass-acid',
    name: 'Acid Bass',
    category: 'Bass',
    description: 'TB-303 style acid bassline',
    engine: 'strudel',
    code: `note("c2 [c2 c3] eb2 [~ f2]")
.s("sawtooth")
.lpf(sine.range(200, 3000).slow(4))
.resonance(15)
.decay(.1)
.sustain(0)`,
  },

  /* ── Synth ── */
  {
    id: 'synth-pad',
    name: 'Synth Pad',
    category: 'Synth',
    description: 'Warm pad with reverb and slow filter',
    engine: 'strudel',
    code: `note("<[c3,e3,g3] [a2,c3,e3] [f2,a2,c3] [g2,b2,d3]>")
.s("sawtooth")
.lpf(sine.range(400, 2000).slow(8))
.gain(.3)
.room(.7)
.delay(.3)`,
  },
  {
    id: 'synth-arp',
    name: 'Arpeggiator',
    category: 'Synth',
    description: 'Fast arpeggiated synth pattern',
    engine: 'strudel',
    code: `note("c4 e4 g4 b4 c5 b4 g4 e4")
.s("triangle")
.lpf(1200)
.gain(.5)
.delay(.25)
.delaytime(.125)
.room(.3)`,
  },

  /* ── Melodic ── */
  {
    id: 'melodic-simple',
    name: 'Simple Melody',
    category: 'Melodic',
    description: 'Easy melody to get started — no samples needed',
    engine: 'strudel',
    code: `note("<c3 e3 g3 b3>(3,8)")
.s("sawtooth")
.lpf(800)
.delay(.25)
.room(.5)`,
  },
  {
    id: 'melodic-piano',
    name: 'Piano Chords',
    category: 'Melodic',
    description: 'Gentle piano chord progression',
    engine: 'strudel',
    code: `note("<[c3,e3,g3] [f3,a3,c4] [a2,c3,e3] [g2,b2,d3]>")
.s("piano")
.gain(.6)
.room(.5)
.delay(.2)`,
  },

  /* ── Ambient ── */
  {
    id: 'ambient-drone',
    name: 'Ambient Drone',
    category: 'Ambient',
    description: 'Slow evolving drone with reverb',
    engine: 'strudel',
    code: `note("<c2 [c2,g2] [c2,e2] [c2,g2,c3]>")
.s("sine")
.gain(.2)
.lpf(sine.range(200, 800).slow(16))
.room(.9)
.delay(.5)
.slow(4)`,
  },
  {
    id: 'ambient-texture',
    name: 'Ambient Texture',
    category: 'Ambient',
    description: 'Shimmering texture with randomized notes',
    engine: 'strudel',
    code: `note("c4 e4 g4 a4 c5 e5".shuffle())
.s("triangle")
.gain(.15)
.lpf(sine.range(300, 1500).slow(12))
.room(.8)
.delay(.4)
.delaytime(.333)
.slow(2)`,
  },

  /* ── Patterns ── */
  {
    id: 'pattern-polyrhythm',
    name: 'Polyrhythm',
    category: 'Patterns',
    description: 'Layered patterns with different time signatures',
    engine: 'strudel',
    code: `stack(
  note("c3 e3 g3").s("sine").slow(3),
  note("a3 d4 f4 a4").s("triangle").slow(4),
  s("hh(3,8)").gain(.3)
).room(.4)`,
  },
  {
    id: 'pattern-generative',
    name: 'Generative',
    category: 'Patterns',
    description: 'Self-evolving pattern using randomization',
    engine: 'strudel',
    code: `note("c3 e3 g3 a3 c4".shuffle())
.s("<sawtooth triangle>")
.lpf(rand.range(300, 2000))
.gain(rand.range(.2, .6))
.delay(rand.range(0, .5))
.room(.4)`,
  },

  /* ── Vocal ── */
  {
    id: 'vocal-chop',
    name: 'Vocal Chop',
    category: 'Vocal',
    description: 'Chopped vocal-like synth pattern',
    engine: 'strudel',
    code: `note("c4 ~ e4 ~ g4 ~ a4 ~")
.s("square")
.lpf(sine.range(500, 4000).fast(2))
.gain(.3)
.delay(.25)
.room(.5)
.fast(2)`,
  },

  /* ── Cinematic ── */
  {
    id: 'cinematic-synthwave',
    name: 'Synth Wave',
    category: 'Cinematic',
    description: 'Retro 80s synthwave with pulsing bass and bright arps',
    engine: 'strudel',
    code: `stack(
  note("c2 c2 f1 g1").s("sawtooth")
    .lpf(sine.range(200, 800).slow(8))
    .gain(.6).sustain(.4),
  note("c4 e4 g4 c5 g4 e4").s("square")
    .lpf(2000).gain(.25)
    .delay(.3).delaytime(.166).fast(2),
  s("bd ~ bd ~, ~ cp ~ cp, hh*8")
    .gain(.5)
).slow(2)`,
  },
  {
    id: 'cinematic-spy',
    name: 'Spy Theme',
    category: 'Cinematic',
    description: 'Suspenseful spy jazz with walking bass and muted stabs',
    engine: 'strudel',
    code: `stack(
  note("c2 ~ eb2 ~ f2 ~ g2 ~").s("triangle")
    .gain(.7).lpf(400).sustain(.2),
  note("<[eb4,gb4] ~ [f4,ab4] ~>")
    .s("square").lpf(1200).gain(.2)
    .delay(.25).delaytime(.333),
  s("hh*4").gain(.2).pan(sine.range(.3,.7)),
  s("~ rim ~ rim").gain(.35)
)`,
  },
  {
    id: 'cinematic-horror',
    name: 'Horror Drone',
    category: 'Cinematic',
    description: 'Dark ambient tension with low drones and dissonant intervals',
    engine: 'strudel',
    code: `stack(
  note("<c1 [c1,db1]>").s("sine")
    .gain(.3).lpf(150).room(.9).slow(8),
  note("<gb3 f3 e3 eb3>").s("sawtooth")
    .gain(.08).lpf(sine.range(100, 600).slow(16))
    .room(.8).delay(.6).slow(4),
  note("c5 ~ ~ db5 ~ ~ ~ ~").s("triangle")
    .gain(.05).delay(.7).delaytime(.5)
    .room(.9).slow(3)
)`,
  },
  {
    id: 'cinematic-epic',
    name: 'Epic Strings',
    category: 'Cinematic',
    description: 'Cinematic orchestral feel with wide chords and slow movement',
    engine: 'strudel',
    code: `stack(
  note("<[c3,e3,g3,c4] [f3,a3,c4,f4] [ab3,c4,eb4,ab4] [g3,b3,d4,g4]>")
    .s("sawtooth").lpf(sine.range(600, 1800).slow(16))
    .gain(.25).room(.8).slow(4),
  note("<c2 f2 ab2 g2>").s("sawtooth")
    .gain(.35).lpf(300).sustain(.8).slow(4),
  note("g4 ~ c5 ~ e5 ~ g5 ~").s("sine")
    .gain(.1).delay(.4).room(.7).slow(8)
)`,
  },
  {
    id: 'cinematic-retrogame',
    name: 'Retro Game',
    category: 'Cinematic',
    description: '8-bit chiptune style with square wave and fast arpeggios',
    engine: 'strudel',
    code: `stack(
  note("c5 e5 g5 c6 g5 e5 c5 g4").s("square")
    .lpf(3000).gain(.3).fast(2),
  note("c3 g3 c3 e3").s("square")
    .lpf(800).gain(.4).sustain(.15),
  s("bd ~ bd ~, ~ sd ~ sd, hh*8")
    .gain(.4).speed(1.5)
).delay(.1).delaytime(.08)`,
  },

  /* ── Tone.js ── */
  {
    id: 'tonejs-synth',
    name: 'Tone.js Chords',
    category: 'Synth',
    description: 'Polyphonic synth with reverb via Tone.js',
    engine: 'tonejs',
    code: `const synth = new Tone.PolySynth(Tone.Synth)
const reverb = new Tone.Reverb(2)
synth.chain(reverb, Tone.getDestination())

const loop = new Tone.Loop((time) => {
  synth.triggerAttackRelease(["C4", "E4", "G4"], "8n", time)
}, "4n")
loop.start(0)`,
  },

  /* ══════════════════════════════════════
     Tone.js Templates
     ══════════════════════════════════════ */

  {
    id: 'tone-trance-arp',
    name: 'Trance Arpeggio',
    category: 'Tone.js',
    description: 'Classic trance arp with filter sweep and reverb',
    engine: 'tonejs',
    code: `const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "fatsawtooth", count: 3, spread: 30 },
  envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.8 }
}).toDestination();
const reverb = new Tone.Reverb(2).toDestination();
synth.connect(reverb);

const notes = [["E4","G4","B4"],["D4","F#4","A4"],["C4","E4","G4"],["B3","D4","F#4"]];
new Tone.Sequence((time, chord) => {
  synth.triggerAttackRelease(chord, "8n", time);
}, notes, "4n").start(0);

const kick = new Tone.MembraneSynth().toDestination();
new Tone.Loop(time => kick.triggerAttackRelease("C1","8n",time), "4n").start(0);
Tone.getTransport().bpm.value = 138;
Tone.getTransport().start();`,
  },
  {
    id: 'tone-ambient-pad',
    name: 'Ambient Pad',
    category: 'Tone.js',
    description: 'Lush FM pads with reverb and delay',
    engine: 'tonejs',
    code: `const synth = new Tone.PolySynth(Tone.FMSynth, {
  harmonicity: 3, modulationIndex: 10,
  envelope: { attack: 2, decay: 1, sustain: 0.8, release: 4 }
}).toDestination();
const reverb = new Tone.Reverb(5).toDestination();
const delay = new Tone.FeedbackDelay("8n", 0.4).toDestination();
synth.connect(reverb); synth.connect(delay);

const chords = [["C3","E3","G3","B3"],["A2","C3","E3","G3"],["F2","A2","C3","E3"]];
let i = 0;
new Tone.Loop(time => {
  synth.triggerAttackRelease(chords[i % chords.length], "2n", time);
  i++;
}, "1m").start(0);
Tone.getTransport().bpm.value = 72;
Tone.getTransport().start();`,
  },
  {
    id: 'tone-drum-machine',
    name: 'Drum Machine',
    category: 'Tone.js',
    description: '16-step drum machine with kick, snare, hats',
    engine: 'tonejs',
    code: `const kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 6 }).toDestination();
const snare = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { decay: 0.15 } }).toDestination();
const hat = new Tone.MetalSynth({ frequency: 400, envelope: { decay: 0.05 }, harmonicity: 5.1 }).toDestination();
hat.volume.value = -10;

new Tone.Sequence((t,v) => { if(v) kick.triggerAttackRelease("C1","8n",t) },
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], "16n").start(0);
new Tone.Sequence((t,v) => { if(v) snare.triggerAttackRelease("8n",t) },
  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], "16n").start(0);
new Tone.Sequence((t,v) => { if(v) hat.triggerAttackRelease("32n",t) },
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], "16n").start(0);
Tone.getTransport().bpm.value = 126;
Tone.getTransport().start();`,
  },
  {
    id: 'tone-bass-acid',
    name: 'Acid Bass',
    category: 'Tone.js',
    description: 'Squelchy acid bass with filter envelope',
    engine: 'tonejs',
    code: `const bass = new Tone.MonoSynth({
  oscillator: { type: "square" },
  filter: { Q: 6, type: "lowpass", rolloff: -24 },
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3 },
  filterEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.5, baseFrequency: 200, octaves: 2 }
}).toDestination();
const dist = new Tone.Distortion(0.4).toDestination();
bass.connect(dist);

const notes = ["C2","C2","Eb2","F2","F2","Ab2","Bb2","G2"];
new Tone.Sequence((time, note) => {
  bass.triggerAttackRelease(note, "8n", time);
}, notes, "8n").start(0);
Tone.getTransport().bpm.value = 140;
Tone.getTransport().start();`,
  },
  {
    id: 'tone-chiptune',
    name: 'Chiptune',
    category: 'Tone.js',
    description: '8-bit retro melody with pulse wave',
    engine: 'tonejs',
    code: `const synth = new Tone.Synth({
  oscillator: { type: "pulse", width: 0.3 },
  envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.1 }
}).toDestination();
const melody = ["E5","D5","C5","D5","E5","E5","E5","D5","D5","D5","E5","G5","G5"];
new Tone.Sequence((time, note) => {
  synth.triggerAttackRelease(note, "8n", time);
}, melody, "4n").start(0);
Tone.getTransport().bpm.value = 160;
Tone.getTransport().start();`,
  },
  {
    id: 'tone-jazz',
    name: 'Jazz Piano',
    category: 'Tone.js',
    description: 'Smooth jazz chords with reverb',
    engine: 'tonejs',
    code: `const piano = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.02, decay: 0.5, sustain: 0.3, release: 1.5 }
}).toDestination();
const reverb = new Tone.Reverb(3).toDestination();
piano.connect(reverb);

const chords = [["D3","F3","A3","C4"],["G2","B2","D3","F3"],["C3","E3","G3","B3"],["A2","C3","E3","G3"]];
let i = 0;
new Tone.Loop(time => {
  piano.triggerAttackRelease(chords[i % chords.length], "2n", time, 0.5);
  i++;
}, "2n").start(0);
Tone.getTransport().bpm.value = 100;
Tone.getTransport().start();`,
  },

  /* ══════════════════════════════════════
     WebAudio Templates
     ══════════════════════════════════════ */

  {
    id: 'web-sine-melody',
    name: 'Sine Scale',
    category: 'WebAudio',
    description: 'C major scale with sine oscillators',
    engine: 'webaudio',
    code: `const notes = [261.63,293.66,329.63,349.23,392.00,440.00,493.88,523.25];
notes.forEach((freq, i) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.3 + 0.25);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + i * 0.3);
  osc.stop(ctx.currentTime + i * 0.3 + 0.3);
});`,
  },
  {
    id: 'web-fm-synth',
    name: 'FM Synthesis',
    category: 'WebAudio',
    description: 'FM synthesis with modulator + carrier',
    engine: 'webaudio',
    code: `const carrier = ctx.createOscillator();
const modulator = ctx.createOscillator();
const modGain = ctx.createGain();
const masterGain = ctx.createGain();
carrier.frequency.value = 440;
modulator.frequency.value = 880;
modGain.gain.value = 200;
masterGain.gain.value = 0.3;
modulator.connect(modGain).connect(carrier.frequency);
carrier.connect(masterGain).connect(ctx.destination);
modulator.start(); carrier.start();
modGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);`,
  },
  {
    id: 'web-drum-synth',
    name: 'Synth Drums',
    category: 'WebAudio',
    description: 'Kick and noise hat pattern from scratch',
    engine: 'webaudio',
    code: `function kick(time) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
  gain.gain.setValueAtTime(1, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start(time); osc.stop(time + 0.5);
}
function hat(time) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  src.buffer = buf;
  g.gain.setValueAtTime(0.3, time);
  g.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
  src.connect(g).connect(ctx.destination);
  src.start(time);
}
for (let i = 0; i < 16; i++) {
  const t = ctx.currentTime + i * 0.25;
  if (i % 4 === 0) kick(t);
  hat(t);
}`,
  },
  {
    id: 'web-ambient-drone',
    name: 'Ambient Drone',
    category: 'WebAudio',
    description: 'Layered sine drones with slow detune',
    engine: 'webaudio',
    code: `[110, 165, 220, 330].forEach((freq, i) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 3);
  osc.detune.linearRampToValueAtTime(i * 5, ctx.currentTime + 6);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
});`,
  },
  {
    id: 'web-glitch',
    name: 'Glitch Beat',
    category: 'WebAudio',
    description: 'Randomized micro-sounds in rapid sequence',
    engine: 'webaudio',
    code: `const types = ["sine","square","sawtooth","triangle"];
for (let i = 0; i < 32; i++) {
  const t = ctx.currentTime + i * 0.125;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = types[Math.floor(Math.random()*4)];
  osc.frequency.value = 100 + Math.random() * 800;
  gain.gain.setValueAtTime(Math.random() * 0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05 + Math.random() * 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t); osc.stop(t + 0.15);
}`,
  },
  {
    id: 'web-chord',
    name: 'Major Chord',
    category: 'WebAudio',
    description: 'C major chord with envelope',
    engine: 'webaudio',
    code: `[261.63, 329.63, 392.00, 523.25].forEach((freq) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 2);
});`,
  },
];

/** Get unique categories from templates */
export function getCategories(): string[] {
  return [...new Set(STARTER_TEMPLATES.map(t => t.category))];
}

/** Get templates filtered by category */
export function getTemplatesByCategory(category: string): StarterTemplate[] {
  return STARTER_TEMPLATES.filter(t => t.category === category);
}
