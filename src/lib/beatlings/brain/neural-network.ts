/* ============================================
   NEURAL NETWORK — The growing brain
   Adapted from wm-lifegame: capped at 40 neurons
   for Beatling performance. Hebbian learning and
   neurogenesis preserved, growth bounded.
   ============================================ */

import { Neuron, NeuronType } from './neuron';
import { Synapse } from './synapse';

/* Maximum neurons per Beatling brain — capped for performance */
const MAX_NEURONS = 40;

/* Brain regions layout (normalized 0-1 coordinates for visualization) */
const REGION_CENTERS: Record<string, { x: number; y: number }> = {
  [NeuronType.SENSORY]:   { x: 0.5, y: 0.1 },
  [NeuronType.COGNITIVE]:  { x: 0.5, y: 0.4 },
  [NeuronType.EMOTIONAL]:  { x: 0.2, y: 0.6 },
  [NeuronType.SOCIAL]:     { x: 0.8, y: 0.6 },
  [NeuronType.MOTOR]:      { x: 0.5, y: 0.9 },
};

export class NeuralNetwork {
  neurons: Map<number, Neuron>;
  synapses: Map<number, Synapse>;
  outgoing: Map<number, number[]>;
  incoming: Map<number, number[]>;
  totalFirings: number;
  growthEnergy: number;
  intelligence: number;
  memoryStrength: number;
  tick: number;
  recentFirings: number[][];

  constructor() {
    this.neurons = new Map();
    this.synapses = new Map();

    /* Index for fast lookup: neuronId -> outgoing synapse ids */
    this.outgoing = new Map();
    /* Index: neuronId -> incoming synapse ids */
    this.incoming = new Map();

    /* Growth metrics */
    this.totalFirings = 0;
    this.growthEnergy = 0;
    this.intelligence = 0;
    this.memoryStrength = 0;

    /* Tick counter */
    this.tick = 0;

    /* Recent firing history for Hebbian learning */
    this.recentFirings = [];
  }

  /* Initialize with starter neurons (basic instincts) */
  initialize() {
    /* Sensory neurons — perceive the world */
    this._addNeuron(NeuronType.SENSORY, 'hunger_sense');
    this._addNeuron(NeuronType.SENSORY, 'touch_sense');
    this._addNeuron(NeuronType.SENSORY, 'proximity_sense');
    this._addNeuron(NeuronType.SENSORY, 'food_sense');

    /* Motor neurons — drive actions */
    this._addNeuron(NeuronType.MOTOR, 'move_toward');
    this._addNeuron(NeuronType.MOTOR, 'move_away');
    this._addNeuron(NeuronType.MOTOR, 'eat_action');

    /* One emotional seed neuron */
    this._addNeuron(NeuronType.EMOTIONAL, 'base_emotion');

    /* Connect sensory -> motor (basic reflexes) */
    this._connectByLabel('hunger_sense', 'move_toward', 0.4);
    this._connectByLabel('hunger_sense', 'eat_action', 0.5);
    this._connectByLabel('food_sense', 'move_toward', 0.6);
    this._connectByLabel('food_sense', 'eat_action', 0.3);
    this._connectByLabel('touch_sense', 'base_emotion', 0.3);
    this._connectByLabel('proximity_sense', 'base_emotion', 0.2);
    this._connectByLabel('base_emotion', 'move_toward', 0.2);
  }

  /* Add a neuron with a label for easy reference */
  _addNeuron(type: string, label: string | null = null): Neuron {
    const center = REGION_CENTERS[type] || { x: 0.5, y: 0.5 };
    const spread = 0.15;
    const x = center.x + (Math.random() - 0.5) * spread;
    const y = center.y + (Math.random() - 0.5) * spread;

    const neuron = new Neuron(type, x, y);
    neuron.label = label;
    this.neurons.set(neuron.id, neuron);
    this.outgoing.set(neuron.id, []);
    this.incoming.set(neuron.id, []);
    return neuron;
  }

  /* Connect two neurons by label */
  _connectByLabel(fromLabel: string, toLabel: string, weight: number): void {
    const from = this._findByLabel(fromLabel);
    const to = this._findByLabel(toLabel);
    if (from && to) this.addSynapse(from.id, to.id, weight);
  }

  _findByLabel(label: string): Neuron | null {
    for (const n of this.neurons.values()) {
      if (n.label === label) return n;
    }
    return null;
  }

  /* Add a synapse between two neurons */
  addSynapse(fromId: number, toId: number, weight: number | null = null): Synapse {
    /* Prevent duplicate connections */
    const existing = this.outgoing.get(fromId) || [];
    for (const sid of existing) {
      const s = this.synapses.get(sid);
      if (s && s.toId === toId) return s;
    }

    const synapse = new Synapse(fromId, toId, weight);
    this.synapses.set(synapse.id, synapse);

    if (!this.outgoing.has(fromId)) this.outgoing.set(fromId, []);
    this.outgoing.get(fromId)!.push(synapse.id);

    if (!this.incoming.has(toId)) this.incoming.set(toId, []);
    this.incoming.get(toId)!.push(synapse.id);

    return synapse;
  }

  /* Stimulate a neuron by label (external input) */
  stimulate(label: string, intensity: number): void {
    const neuron = this._findByLabel(label);
    if (neuron) neuron.stimulate(intensity);
  }

  /* Stimulate all neurons of a type */
  stimulateType(type: string, intensity: number): void {
    for (const n of this.neurons.values()) {
      if (n.type === type) n.stimulate(intensity * (0.5 + Math.random() * 0.5));
    }
  }

  /* === MAIN UPDATE — one tick of brain activity === */
  update(): number[] {
    this.tick++;
    const firedThisTick: number[] = [];

    /* Phase 1: Process all neurons */
    for (const neuron of this.neurons.values()) {
      const fired = neuron.update();
      if (fired) {
        firedThisTick.push(neuron.id);
        this.totalFirings++;
        this.growthEnergy += 0.1;

        /* Propagate signal through outgoing synapses */
        const outIds = this.outgoing.get(neuron.id) || [];
        for (const sid of outIds) {
          const synapse = this.synapses.get(sid);
          if (!synapse) continue;
          const signal = synapse.transmit(neuron.activation > 0 ? 0.8 : neuron.activation);
          const target = this.neurons.get(synapse.toId);
          if (target) target.receiveInput(signal);
        }
      }
    }

    /* Phase 2: Update all synapses */
    const deadSynapses: number[] = [];
    for (const synapse of this.synapses.values()) {
      synapse.update();
      if (synapse.isDead()) deadSynapses.push(synapse.id);
    }

    /* Phase 3: Hebbian learning — strengthen co-firing connections */
    this._hebbianLearning(firedThisTick);

    /* Phase 4: Prune dead synapses */
    for (const sid of deadSynapses) {
      this._removeSynapse(sid);
    }

    /* Phase 5: Neurogenesis — grow new neurons (capped at MAX_NEURONS) */
    this._neurogenesis();

    /* Phase 6: Update intelligence metric */
    this._updateMetrics();

    /* Track recent firings for temporal patterns */
    this.recentFirings.push(firedThisTick);
    if (this.recentFirings.length > 20) this.recentFirings.shift();

    return firedThisTick;
  }

  /* Hebbian learning: neurons that fire together wire together */
  _hebbianLearning(firedIds: number[]): void {
    if (firedIds.length < 2) return;

    for (let i = 0; i < firedIds.length; i++) {
      for (let j = 0; j < firedIds.length; j++) {
        if (i === j) continue;
        const fromId = firedIds[i];
        const toId = firedIds[j];

        /* Check if synapse exists between them */
        const outIds = this.outgoing.get(fromId) || [];
        let found = false;
        for (const sid of outIds) {
          const s = this.synapses.get(sid);
          if (s && s.toId === toId) {
            /* Strengthen existing connection */
            s.strengthen(0.008);
            found = true;
            break;
          }
        }

        /* Small chance to form NEW connection if neurons fired together */
        if (!found && Math.random() < 0.03 && this.synapses.size < this.neurons.size * 4) {
          this.addSynapse(fromId, toId);
        }
      }
    }
  }

  /* Neurogenesis — grow new neurons based on activity, capped at MAX_NEURONS */
  _neurogenesis() {
    /* Need enough growth energy to spawn a new neuron */
    if (this.growthEnergy < 5) return;
    /* Hard cap at MAX_NEURONS to prevent runaway growth */
    if (this.neurons.size >= MAX_NEURONS) return;

    this.growthEnergy -= 5;

    /* Decide type based on what's most active */
    const type = this._chooseNewNeuronType();
    const newNeuron = this._addNeuron(type);

    /* Connect to nearby active neurons */
    const neighbors = this._findNearestNeurons(newNeuron, 5);
    for (const neighbor of neighbors) {
      /* Bidirectional connection with random weights */
      if (Math.random() < 0.6) {
        this.addSynapse(neighbor.id, newNeuron.id);
      }
      if (Math.random() < 0.4) {
        this.addSynapse(newNeuron.id, neighbor.id);
      }
    }
  }

  /* Choose what type of neuron to grow based on brain needs */
  _chooseNewNeuronType(): string {
    const counts: Record<string, number> = {};
    for (const type of Object.values(NeuronType)) counts[type] = 0;
    for (const n of this.neurons.values()) counts[n.type]++;

    /* Weighted random: grow more of underrepresented types */
    const total = this.neurons.size;
    const weights: Record<string, number> = {
      [NeuronType.COGNITIVE]: 0.35,   /* Brains grow mostly cognitive */
      [NeuronType.EMOTIONAL]: 0.25,
      [NeuronType.SOCIAL]: 0.15,
      [NeuronType.SENSORY]: 0.15,
      [NeuronType.MOTOR]: 0.10,
    };

    /* Boost underrepresented types */
    for (const type of Object.values(NeuronType)) {
      const ratio = counts[type] / Math.max(1, total);
      if (ratio < 0.1) weights[type] *= 2;
    }

    /* Weighted random selection */
    const sumW = Object.values(weights).reduce((a, b) => a + b, 0);
    let r = Math.random() * sumW;
    for (const [type, w] of Object.entries(weights)) {
      r -= w;
      if (r <= 0) return type;
    }
    return NeuronType.COGNITIVE;
  }

  /* Find N nearest neurons to a given neuron */
  _findNearestNeurons(target: Neuron, count: number): Neuron[] {
    const distances: { neuron: Neuron; dist: number }[] = [];
    for (const n of this.neurons.values()) {
      if (n.id === target.id) continue;
      const dx = n.x - target.x;
      const dy = n.y - target.y;
      distances.push({ neuron: n, dist: Math.sqrt(dx * dx + dy * dy) });
    }
    distances.sort((a, b) => a.dist - b.dist);
    return distances.slice(0, count).map(d => d.neuron);
  }

  /* Remove a synapse and clean up indices */
  _removeSynapse(synapseId: number): void {
    const synapse = this.synapses.get(synapseId);
    if (!synapse) return;

    const outList = this.outgoing.get(synapse.fromId);
    if (outList) {
      const idx = outList.indexOf(synapseId);
      if (idx !== -1) outList.splice(idx, 1);
    }

    const inList = this.incoming.get(synapse.toId);
    if (inList) {
      const idx = inList.indexOf(synapseId);
      if (idx !== -1) inList.splice(idx, 1);
    }

    this.synapses.delete(synapseId);
  }

  /* Calculate intelligence and memory metrics */
  _updateMetrics() {
    const neuronCount = this.neurons.size;
    const synapseCount = this.synapses.size;
    const avgConnectivity = neuronCount > 0 ? synapseCount / neuronCount : 0;

    /* Average synapse strength = memory */
    let totalStrength = 0;
    for (const s of this.synapses.values()) totalStrength += s.strength;
    this.memoryStrength = synapseCount > 0 ? totalStrength / synapseCount : 0;

    /* Intelligence grows slowly, based on brain complexity */
    const targetIntelligence = (
      Math.log2(neuronCount + 1) * 10 +
      avgConnectivity * 15 +
      this.memoryStrength * 20
    );
    /* Smooth towards target */
    this.intelligence += (targetIntelligence - this.intelligence) * 0.01;
  }

  /* Get emotional state from emotional neuron activity */
  getEmotionalState() {
    let emotionalActivation = 0;
    let emotionalCount = 0;

    for (const n of this.neurons.values()) {
      if (n.type === NeuronType.EMOTIONAL) {
        emotionalActivation += n.activation;
        emotionalCount++;
      }
    }

    return emotionalCount > 0 ? emotionalActivation / emotionalCount : 0;
  }

  /* Get motor output as directional intent */
  getMotorOutput() {
    let towardStrength = 0;
    let awayStrength = 0;
    let eatStrength = 0;

    for (const n of this.neurons.values()) {
      if (n.type !== NeuronType.MOTOR) continue;
      if (n.label === 'move_toward') towardStrength = n.activation;
      else if (n.label === 'move_away') awayStrength = n.activation;
      else if (n.label === 'eat_action') eatStrength = n.activation;
      else {
        /* Unlabeled motor neurons contribute to general movement */
        towardStrength += n.activation * 0.3;
      }
    }

    return { toward: towardStrength, away: awayStrength, eat: eatStrength };
  }

  /* Serialize entire brain for persistence */
  serialize() {
    return {
      neurons: Array.from(this.neurons.values()).map(n => n.serialize()),
      synapses: Array.from(this.synapses.values()).map(s => s.serialize()),
      totalFirings: this.totalFirings,
      growthEnergy: this.growthEnergy,
      intelligence: this.intelligence,
      tick: this.tick,
    };
  }

  static deserialize(data: any): NeuralNetwork {
    const nn = new NeuralNetwork();
    for (const nd of data.neurons) {
      const neuron = Neuron.deserialize(nd);
      nn.neurons.set(neuron.id, neuron);
      nn.outgoing.set(neuron.id, []);
      nn.incoming.set(neuron.id, []);
    }
    for (const sd of data.synapses) {
      const synapse = Synapse.deserialize(sd);
      nn.synapses.set(synapse.id, synapse);
      if (!nn.outgoing.has(synapse.fromId)) nn.outgoing.set(synapse.fromId, []);
      nn.outgoing.get(synapse.fromId)!.push(synapse.id);
      if (!nn.incoming.has(synapse.toId)) nn.incoming.set(synapse.toId, []);
      nn.incoming.get(synapse.toId)!.push(synapse.id);
    }
    nn.totalFirings = data.totalFirings || 0;
    nn.growthEnergy = data.growthEnergy || 0;
    nn.intelligence = data.intelligence || 0;
    nn.tick = data.tick || 0;
    return nn;
  }
}
