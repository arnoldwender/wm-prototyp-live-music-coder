/* Wired into BeatlingWorld — neurons fire in response to audio-driven stimulation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* ============================================
   NEURON — The fundamental unit of consciousness
   Each neuron can fire, connect, and specialize.
   Copied from wm-lifegame with import path fixes.
   ============================================ */

let nextNeuronId = 0;

/* Neuron types determine behavior and visualization */
export const NeuronType = {
  SENSORY: 'sensory',       /* Receives external stimuli */
  MOTOR: 'motor',           /* Drives actions/movement */
  EMOTIONAL: 'emotional',   /* Processes feelings */
  COGNITIVE: 'cognitive',   /* Pattern recognition, memory */
  SOCIAL: 'social',         /* Recognizes other creatures */
};

/* Map neuron types to base colors for rendering */
export const NeuronColors = {
  [NeuronType.SENSORY]: '#44ddff',
  [NeuronType.MOTOR]: '#44ff88',
  [NeuronType.EMOTIONAL]: '#ff88dd',
  [NeuronType.COGNITIVE]: '#ffdd44',
  [NeuronType.SOCIAL]: '#ff6b9d',
};

export class Neuron {
  id: number;
  type: string;
  x: number;
  y: number;
  activation: number;
  threshold: number;
  inputSum: number;
  fireCount: number;
  age: number;
  decayRate: number;
  refractoryTimer: number;
  refractoryPeriod: number;
  glowIntensity: number;
  justFired: boolean;
  label: string | null;

  constructor(type: string, x: number, y: number) {
    this.id = nextNeuronId++;
    this.type = type;

    /* Position in brain-space for visualization */
    this.x = x;
    this.y = y;

    /* Activation level (0 to 1) — how "lit up" this neuron is */
    this.activation = 0;

    /* Threshold needed to fire — lower = more sensitive */
    this.threshold = 0.3 + Math.random() * 0.4;

    /* Accumulated input from synapses this tick */
    this.inputSum = 0;

    /* How many times this neuron has fired — experience shapes it */
    this.fireCount = 0;

    /* Age in ticks — older neurons are more stable */
    this.age = 0;

    /* Decay rate — activation fades over time */
    this.decayRate = 0.92 + Math.random() * 0.05;

    /* Refractory period — can't fire again immediately */
    this.refractoryTimer = 0;
    this.refractoryPeriod = 3 + Math.floor(Math.random() * 4);

    /* Visual: glow intensity for rendering */
    this.glowIntensity = 0;

    /* Whether this neuron just fired this tick */
    this.justFired = false;

    /* Label for named neurons — set externally */
    this.label = null;
  }

  /* Receive input from a synapse */
  receiveInput(value: number): void {
    this.inputSum += value;
  }

  /* Process one tick of neural activity */
  update(): boolean {
    this.age++;
    this.justFired = false;

    /* Refractory cooldown — neuron can't fire while recovering */
    if (this.refractoryTimer > 0) {
      this.refractoryTimer--;
      this.activation *= 0.8;
      this.inputSum = 0;
      this.glowIntensity *= 0.85;
      return false;
    }

    /* Add accumulated input to activation */
    this.activation += this.inputSum;
    this.inputSum = 0;

    /* Check if neuron fires */
    const fired = this.activation >= this.threshold;

    if (fired) {
      this.fireCount++;
      this.justFired = true;
      this.glowIntensity = 1;
      this.refractoryTimer = this.refractoryPeriod;

      /* Neurons that fire often become slightly more sensitive */
      if (this.fireCount % 50 === 0 && this.threshold > 0.15) {
        this.threshold -= 0.01;
      }
    }

    /* Natural decay — activation fades */
    this.activation *= this.decayRate;
    this.activation = Math.max(0, Math.min(1, this.activation));

    /* Glow fades smoothly */
    this.glowIntensity *= 0.9;

    return fired;
  }

  /* Stimulate this neuron directly (external input) */
  stimulate(intensity: number): void {
    this.activation = Math.min(1, this.activation + intensity);
  }

  /* Serialize for persistence */
  serialize() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      threshold: this.threshold,
      fireCount: this.fireCount,
      age: this.age,
      decayRate: this.decayRate,
    };
  }

  /* Restore from saved data */
  static deserialize(data: any): Neuron {
    const n = new Neuron(data.type, data.x, data.y);
    n.id = data.id;
    n.threshold = data.threshold;
    n.fireCount = data.fireCount;
    n.age = data.age;
    n.decayRate = data.decayRate;
    nextNeuronId = Math.max(nextNeuronId, n.id + 1);
    return n;
  }
}
