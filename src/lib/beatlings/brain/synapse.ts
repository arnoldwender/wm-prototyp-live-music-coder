/* ============================================
   SYNAPSE — Connection between neurons
   Strengthens with use (Hebbian learning),
   weakens with disuse (pruning).
   Copied from wm-lifegame with import path fixes.
   ============================================ */

let nextSynapseId = 0;

export class Synapse {
  id: number;
  fromId: number;
  toId: number;
  weight: number;
  strength: number;
  age: number;
  lastUsed: number;
  signalProgress: number;
  active: boolean;

  constructor(fromId: number, toId: number, weight: number | null = null) {
    this.id = nextSynapseId++;
    this.fromId = fromId;
    this.toId = toId;

    /* Weight determines signal strength (-1 to 1) */
    /* Negative = inhibitory, Positive = excitatory */
    this.weight = weight ?? (Math.random() * 0.6 - 0.1);

    /* Strength grows with co-firing (Hebbian: "fire together, wire together") */
    this.strength = 0.1 + Math.random() * 0.3;

    /* Age of this connection */
    this.age = 0;

    /* How recently this synapse transmitted a signal */
    this.lastUsed = 0;

    /* Signal currently traveling through (for visual pulse) */
    this.signalProgress = -1;

    /* Whether this synapse is currently transmitting */
    this.active = false;
  }

  /* Transmit signal from source neuron to target */
  transmit(sourceActivation: number): number {
    this.active = true;
    this.signalProgress = 0;
    this.lastUsed = 0;

    /* Signal = source activation * weight * strength */
    return sourceActivation * this.weight * this.strength;
  }

  /* Hebbian learning: strengthen when both neurons fire together */
  strengthen(amount: number = 0.01): void {
    this.strength = Math.min(1, this.strength + amount);
    /* Also slightly increase weight magnitude */
    const sign = this.weight >= 0 ? 1 : -1;
    this.weight = sign * Math.min(1, Math.abs(this.weight) + amount * 0.5);
  }

  /* Weaken from disuse */
  weaken(amount: number = 0.002): void {
    this.strength = Math.max(0, this.strength - amount);
  }

  /* Update visual and age */
  update(): void {
    this.age++;
    this.lastUsed++;

    /* Animate signal pulse traveling along synapse */
    if (this.signalProgress >= 0) {
      this.signalProgress += 0.15;
      if (this.signalProgress > 1) {
        this.signalProgress = -1;
        this.active = false;
      }
    }

    /* Weaken unused synapses — pruning mechanism */
    if (this.lastUsed > 200) {
      this.weaken(0.001);
    }
  }

  /* Is this synapse too weak to survive? */
  isDead(): boolean {
    return this.strength <= 0.01 && this.age > 100;
  }

  serialize() {
    return {
      id: this.id,
      fromId: this.fromId,
      toId: this.toId,
      weight: this.weight,
      strength: this.strength,
      age: this.age,
    };
  }

  static deserialize(data: any): Synapse {
    const s = new Synapse(data.fromId, data.toId, data.weight);
    s.id = data.id;
    s.strength = data.strength;
    s.age = data.age;
    nextSynapseId = Math.max(nextSynapseId, s.id + 1);
    return s;
  }
}
