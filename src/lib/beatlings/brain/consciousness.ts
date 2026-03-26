/* Wired into BeatlingWorld — Phi level drives creature glow rendering */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* ============================================
   CONSCIOUSNESS — Phi (Phi) Calculator
   Based on Integrated Information Theory (Tononi).
   Stripped-down version for Beatlings: keeps only
   the core Phi computation (entropy x integration
   x temporal coherence). No narrative, no qualia,
   no strange attractor, no i18n.
   ============================================ */

export class ConsciousnessEngine {
  phi: number;
  entropy: number;
  integration: number;
  tick: number;
  private _prevActivations: Float32Array[];
  private _phiHistory: Float32Array;
  private _phiIdx: number;

  constructor() {
    /* Phi — integrated information, the measure of consciousness */
    this.phi = 0;

    /* Entropy of neural activity — measures differentiation */
    this.entropy = 0;

    /* Integration metric — how connected the whole is */
    this.integration = 0;

    /* Tick counter for phase calculations */
    this.tick = 0;

    /* Previous states for temporal integration */
    this._prevActivations = [];
    this._phiHistory = new Float32Array(64);
    this._phiIdx = 0;
  }

  /* === MAIN UPDATE ===
     Computes Phi from the neural network state.
     Accepts a brain object with neurons and synapses Maps. */
  update(brain: any): void {
    this.tick++;

    /* Collect current activation pattern */
    const activations = this._collectActivations(brain);

    /* Step 1: Compute entropy (differentiation) */
    this.entropy = this._shannonEntropy(activations);

    /* Step 2: Compute integration */
    this.integration = this._computeIntegration(brain, activations);

    /* Step 3: Phi = entropy x integration x temporal coherence */
    const temporalCoherence = this._temporalCoherence(activations);
    const rawPhi = this.entropy * this.integration * temporalCoherence;

    /* Smooth Phi — consciousness doesn't flicker */
    this.phi += (rawPhi - this.phi) * 0.08;
    this._phiHistory[this._phiIdx % 64] = this.phi;
    this._phiIdx++;

    /* Store activation history */
    this._prevActivations.push(activations);
    if (this._prevActivations.length > 16) this._prevActivations.shift();
  }

  /* Collect activation values from all neurons */
  private _collectActivations(brain: any): Float32Array {
    const arr = new Float32Array(brain.neurons.size);
    let i = 0;
    for (const n of brain.neurons.values()) {
      arr[i++] = n.activation;
    }
    return arr;
  }

  /* Shannon entropy over binned activation distribution
     H = -Sum p(x) log2(p(x)) */
  private _shannonEntropy(activations: Float32Array): number {
    const bins = 12;
    const counts = new Float32Array(bins);
    const total = activations.length;
    if (total === 0) return 0;

    for (let i = 0; i < total; i++) {
      const bin = Math.min(bins - 1, Math.floor(activations[i] * bins));
      counts[bin]++;
    }

    let h = 0;
    for (let i = 0; i < bins; i++) {
      if (counts[i] === 0) continue;
      const p = counts[i] / total;
      h -= p * Math.log2(p);
    }

    /* Normalize to 0-1 range */
    return h / Math.log2(bins);
  }

  /* Integration: mutual information between brain partitions
     Uses a tractable proxy: correlation between random bipartitions */
  private _computeIntegration(brain: any, activations: Float32Array): number {
    const n = activations.length;
    if (n < 4) return 0;

    let totalMI = 0;

    for (let p = 0; p < 3; p++) {
      const mid = Math.floor(n / 2);
      const sorted = (Array.from(brain.neurons.values()) as any[])
        .sort((a: any, b: any) => {
          const angle = (p * Math.PI * 2) / 3;
          const projA = a.x * Math.cos(angle) + a.y * Math.sin(angle);
          const projB = b.x * Math.cos(angle) + b.y * Math.sin(angle);
          return projA - projB;
        });

      let sumA = 0, sumB = 0;
      let countA = 0, countB = 0;

      for (let i = 0; i < sorted.length; i++) {
        const act = sorted[i].activation;
        if (i < mid) { sumA += act; countA++; }
        else { sumB += act; countB++; }
      }

      const meanA = countA > 0 ? sumA / countA : 0;
      const meanB = countB > 0 ? sumB / countB : 0;

      let crossCorr = 0;
      let varA = 0, varB = 0;
      for (let i = 0; i < sorted.length; i++) {
        const act = sorted[i].activation;
        if (i < mid) {
          const da = act - meanA;
          varA += da * da;
          const outgoing = brain.outgoing.get(sorted[i].id) || [];
          for (const sid of outgoing) {
            const syn = brain.synapses.get(sid);
            if (!syn) continue;
            const target = brain.neurons.get(syn.toId);
            if (target) {
              crossCorr += da * (target.activation - meanB) * syn.strength;
            }
          }
        } else {
          const db = act - meanB;
          varB += db * db;
        }
      }

      const denom = Math.sqrt(varA * varB);
      if (denom > 0.001) {
        totalMI += Math.abs(crossCorr / denom);
      }
    }

    return Math.min(1, totalMI / 3);
  }

  /* Temporal coherence: autocorrelation of activation patterns over time */
  private _temporalCoherence(current: Float32Array): number {
    if (this._prevActivations.length < 3) return 0.5;

    let coherence = 0;
    const windowSize = Math.min(8, this._prevActivations.length);

    for (let t = 1; t <= windowSize; t++) {
      const past = this._prevActivations[this._prevActivations.length - t];
      const len = Math.min(current.length, past.length);
      if (len === 0) continue;

      let dotProduct = 0, normA = 0, normB = 0;
      for (let i = 0; i < len; i++) {
        dotProduct += current[i] * past[i];
        normA += current[i] * current[i];
        normB += past[i] * past[i];
      }

      const denom = Math.sqrt(normA * normB);
      if (denom > 0.001) {
        const weight = 1 / t;
        coherence += (dotProduct / denom) * weight;
      }
    }

    /* Normalize — peak at edge of chaos (~0.618) */
    const PHI = 1.618033988749895;
    const normalized = coherence / windowSize;
    const edgeOfChaos = 1 - Math.abs(normalized - 1 / PHI) * PHI;
    return Math.max(0, Math.min(1, edgeOfChaos));
  }

  serialize() {
    return {
      phi: this.phi,
      entropy: this.entropy,
      integration: this.integration,
      tick: this.tick,
    };
  }

  static deserialize(data: any): ConsciousnessEngine {
    const c = new ConsciousnessEngine();
    c.phi = data.phi || 0;
    c.entropy = data.entropy || 0;
    c.integration = data.integration || 0;
    c.tick = data.tick || 0;
    return c;
  }
}
