// TODO: Wire into BeatlingWorld for Phase 2 neural-driven behavior
/* eslint-disable @typescript-eslint/no-explicit-any */
/* ============================================
   DREAMS — Memory consolidation during sleep
   Stripped-down version for Beatlings: keeps only
   sleep pressure, shouldSleep, and basic
   slow-wave consolidation. No REM creativity,
   no golden-ratio modulation, no dream images.
   ============================================ */

export class DreamEngine {
  isDreaming: boolean;
  dreamPhase: number;
  dreamDepth: number;
  dreamCycle: number;
  memoriesConsolidated: number;
  synapsesPruned: number;
  sleepPressure: number;
  sleepDebt: number;

  constructor() {
    /* Dream state */
    this.isDreaming = false;
    this.dreamPhase = 0;
    this.dreamDepth = 0;
    this.dreamCycle = 0;

    /* Consolidation metrics */
    this.memoriesConsolidated = 0;
    this.synapsesPruned = 0;

    /* Sleep pressure — builds while awake */
    this.sleepPressure = 0;
    this.sleepDebt = 0;
  }

  /* Build sleep pressure while awake */
  accumulatePressure(brainActivity: number, emotionalIntensity: number): void {
    this.sleepPressure += 0.0001 * (1 + brainActivity * 2 + emotionalIntensity);
    this.sleepPressure = Math.min(1, this.sleepPressure);
  }

  /* Should the creature fall asleep? */
  shouldSleep(energy: number, sleepPressure: number): boolean {
    return energy < 0.2 || this.sleepPressure > 0.7 || sleepPressure > 0.8;
  }

  /* === MAIN DREAM CYCLE ===
     Called each tick while creature is sleeping.
     Returns modifications to apply to the brain. */
  processDream(brain: any) {
    if (!this.isDreaming) {
      this._enterDream();
    }

    this.dreamPhase += 0.005;

    /* Simple sinusoidal depth without golden-ratio complexity */
    this.dreamDepth = Math.sin(this.dreamPhase * Math.PI * 2) * 0.3 + 0.4;

    const modifications = {
      strengthened: [] as number[],
      weakened: [] as number[],
      pruned: [] as number[],
      growthBonus: 0,
    };

    /* Slow-wave consolidation: replay and strengthen important patterns */
    this._slowWaveConsolidation(brain, modifications);

    /* Synaptic homeostasis: global downscaling to prevent saturation */
    if (this.dreamDepth >= 0.35) {
      this._synapticHomeostasis(brain, modifications);
    }

    /* Check if dream cycle is complete */
    if (this.dreamPhase >= 1) {
      this.dreamPhase = 0;
      this.dreamCycle++;

      /* After enough cycles, the creature wakes */
      if (this.dreamCycle >= 3 || this.sleepPressure < 0.1) {
        this._exitDream();
      }
    }

    return modifications;
  }

  /* Enter dream state */
  private _enterDream(): void {
    this.isDreaming = true;
    this.dreamPhase = 0;
    this.dreamCycle = 0;
  }

  /* Slow wave consolidation: strengthen recently-used meaningful synapses */
  private _slowWaveConsolidation(brain: any, mods: any): void {
    for (const synapse of brain.synapses.values()) {
      if (synapse.lastUsed < 100 && synapse.strength > 0.2) {
        const boost = 0.003 * (1 - synapse.lastUsed / 100);
        synapse.strengthen(boost);
        mods.strengthened.push(synapse.id);
        this.memoriesConsolidated++;
      }
    }

    /* Gently replay: stimulate neurons that fired recently */
    for (const neuron of brain.neurons.values()) {
      if (neuron.fireCount > 0 && neuron.age < 500) {
        neuron.stimulate(0.05 * this.dreamDepth);
      }
    }
  }

  /* Synaptic homeostasis: global downscaling to prevent saturation */
  private _synapticHomeostasis(brain: any, mods: any): void {
    for (const synapse of brain.synapses.values()) {
      synapse.weaken(0.001);

      /* Very weak synapses get pruned */
      if (synapse.strength < 0.05 && synapse.age > 200) {
        mods.pruned.push(synapse.id);
        this.synapsesPruned++;
      }

      /* Slightly strengthen the strongest (Matthew effect) */
      if (synapse.strength > 0.6) {
        synapse.strengthen(0.001);
      }
    }
  }

  /* Exit dream state */
  private _exitDream(): void {
    this.isDreaming = false;
    this.sleepPressure = 0;
    this.dreamDepth = 0;
  }

  serialize() {
    return {
      sleepPressure: this.sleepPressure,
      sleepDebt: this.sleepDebt,
      memoriesConsolidated: this.memoriesConsolidated,
    };
  }

  static deserialize(data: any): DreamEngine {
    const d = new DreamEngine();
    d.sleepPressure = data.sleepPressure || 0;
    d.sleepDebt = data.sleepDebt || 0;
    d.memoriesConsolidated = data.memoriesConsolidated || 0;
    return d;
  }
}
