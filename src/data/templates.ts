/* Starter code templates — pre-built snippets organized by category.
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
.bank("RolandTR808")
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
  s("~ sd ~ sd").bank("RolandTR909"),
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
  s("sd(2,8)").bank("RolandTR808"),
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

  /* ── Web Audio ── */
  {
    id: 'webaudio-osc',
    name: 'Raw Oscillator',
    category: 'Synth',
    description: 'Sawtooth oscillator via raw Web Audio API',
    engine: 'webaudio',
    code: `const osc = ctx.createOscillator()
const gain = ctx.createGain()
osc.type = 'sawtooth'
osc.frequency.value = 220
gain.gain.value = 0.3
osc.connect(gain)
gain.connect(masterGain)
osc.start()`,
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
