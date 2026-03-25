/* ──────────────────────────────────────────────────────────
   Starter code templates — pre-built snippets for each
   audio engine, used on landing page and template selector.
   ────────────────────────────────────────────────────────── */

import type { EngineType } from '../types/engine';

export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  engine: EngineType;
  code: string;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'strudel-drums',
    name: 'Strudel Drum Pattern',
    description: 'A classic drum pattern with kick, snare, and hi-hats',
    engine: 'strudel',
    code: `s("bd sd [~ bd] sd").bank("RolandTR808")
.speed("<1 1.5 1 0.5>")
.sometimes(x => x.delay(.5))`,
  },
  {
    id: 'strudel-melody',
    name: 'Strudel Melody',
    description: 'A melodic pattern with sawtooth synth',
    engine: 'strudel',
    code: `note("<c3 e3 g3 b3>(3,8)")
.s("sawtooth")
.lpf(800)
.delay(.25)
.room(.5)`,
  },
  {
    id: 'tonejs-synth',
    name: 'Tone.js Synth',
    description: 'A simple synth with reverb',
    engine: 'tonejs',
    code: `const synth = new Tone.PolySynth(Tone.Synth)
const reverb = new Tone.Reverb(2)
synth.chain(reverb, Tone.getDestination())

const loop = new Tone.Loop((time) => {
  synth.triggerAttackRelease(["C4", "E4", "G4"], "8n", time)
}, "4n")
loop.start(0)`,
  },
  {
    id: 'webaudio-osc',
    name: 'Web Audio Oscillator',
    description: 'Raw oscillator with gain control',
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
