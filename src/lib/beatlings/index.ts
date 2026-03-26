/* ──────────────────────────────────────────────────────────
   BeatlingWorld — manages the creature ecosystem including
   spawning, XP accumulation, GoL simulation, achievement
   tracking, and rendering. Audio drives everything.
   ────────────────────────────────────────────────────────── */

import { GolBrain } from './gol-brain';
import { AudioBridge } from './audio-bridge';
import { shouldSpawn, type AudioFeatures } from './species';
import { addXp, getStage, type BeatlingXp } from './evolution';
import { ACHIEVEMENTS, checkAchievement, isUnlocked } from './collection';
import { drawBeatlingWorld } from './renderer';
import { AudioAnalyzer } from '../audio/analyzer';
import { NeuralNetwork } from './brain/neural-network';
import { ConsciousnessEngine } from './brain/consciousness';
import { DreamEngine } from './brain/dreams';
import type { Species, Stage, Achievement } from '../../types/beatling';

/* Barrel exports — all beatling modules available from single import */
export { GolBrain } from './gol-brain';
export { SPECIES, shouldSpawn } from './species';
export { addXp, getStage, XP_THRESHOLDS } from './evolution';
export { ACHIEVEMENTS, checkAchievement, isUnlocked } from './collection';
export { AudioBridge } from './audio-bridge';
export { drawBeatlingWorld } from './renderer';

/** Internal creature state tracked by the world manager */
interface Creature {
  id: string;
  species: Species;
  stage: Stage;
  xp: BeatlingXp;
  x: number;
  y: number;
  energy: number;
  born: number;
  /* Phase 2: Neural brain — each creature has its own neural network,
   * consciousness engine, and dream engine for emergent behavior */
  brain: NeuralNetwork;
  consciousness: ConsciousnessEngine;
  dreams: DreamEngine;
  isSleeping: boolean;
  phi: number; /* Consciousness level (0-1) — affects glow in renderer */
}

/** Manages the Beatling ecosystem — spawning, updating, rendering */
export class BeatlingWorld {
  private creatures: Creature[] = [];
  private gol: GolBrain;
  private bridge: AudioBridge | null = null;
  private achievements: Achievement[] = [...ACHIEVEMENTS];
  private golTickCounter = 0;
  private spawnCooldowns: Map<Species, number> = new Map();

  /* Web Worker for offloading GoL computation from the main thread */
  private worker: Worker | null = null;
  private workerBusy = false;

  constructor(golWidth = 64, golHeight = 64) {
    this.gol = new GolBrain(golWidth, golHeight);

    /* Try to initialize Web Worker for GoL steps — falls back to
     * synchronous computation if Workers are not available */
    try {
      this.worker = new Worker(
        new URL('../../workers/beatling-worker.ts', import.meta.url),
        { type: 'module' },
      );
      this.worker.onmessage = (e) => {
        if (e.data.type === 'gol-result') {
          /* Copy worker result back into the GoL brain grid */
          const newGrid = new Uint8Array(e.data.data.grid);
          const grid = this.gol.getGrid();
          for (let i = 0; i < newGrid.length; i++) {
            grid[i] = newGrid[i];
          }
          this.workerBusy = false;
        }
      };
      this.worker.onerror = () => {
        /* Worker failed — disable and fall back to sync */
        this.worker = null;
        this.workerBusy = false;
      };
    } catch {
      /* Worker not available in this environment, use sync fallback */
    }
  }

  /** Connect the audio analyser to drive brain stimulation and spawn logic */
  setAudioBridge(analyzer: AudioAnalyzer, sampleRate: number): void {
    this.bridge = new AudioBridge(analyzer, sampleRate);
  }

  /** Update the ecosystem one frame */
  update(isTyping: boolean): void {
    const features = this.bridge?.getFeatures(isTyping) ?? {
      rms: 0, peak: 0, hasBeat: false, dominantFreq: 0, complexity: 0, isTyping,
    };

    /* Update GoL every 3 frames for performance */
    this.golTickCounter++;
    if (this.golTickCounter % 3 === 0) {
      this.injectAudioIntoGol(features);

      /* Offload GoL step to Web Worker when available, otherwise sync */
      if (this.worker && !this.workerBusy) {
        const grid = this.gol.getGrid();
        const copy = new Uint8Array(grid);
        this.workerBusy = true;
        this.worker.postMessage(
          { type: 'gol-step', data: { grid: copy, width: this.gol.width, height: this.gol.height } },
          [copy.buffer],
        );
      } else if (!this.worker) {
        /* Sync fallback — no worker available */
        this.gol.step();
      }
    }

    /* Try spawn new creatures based on audio features */
    this.trySpawn(features);

    /* Update existing creatures — neural brain + energy + XP */
    for (const creature of this.creatures) {
      creature.energy = features.rms;

      /* XP accumulation from audio features */
      if (features.rms > 0.1) {
        creature.xp = addXp(creature.xp, 'audio', features.rms * 0.1);
      }
      if (features.complexity > 0.3) {
        creature.xp = addXp(creature.xp, 'complexity', features.complexity * 0.05);
      }
      creature.stage = getStage(creature.xp);

      /* Phase 2: Neural brain update — runs every 3 frames for performance */
      if (this.golTickCounter % 3 === 0) {
        this.updateCreatureBrain(creature, features);
      }
    }

    /* Check achievements after state updates */
    this.checkAchievements();

    /* Despawn egg creatures after 10s of silence */
    if (features.rms < 0.01 && !features.isTyping) {
      this.creatures = this.creatures.filter((c) => {
        const alive = Date.now() - c.born < 10000 || c.stage !== 'egg';
        return alive;
      });
    }
  }

  /** Render the world to a canvas context */
  draw(ctx: CanvasRenderingContext2D, width: number, height: number, time: number): void {
    const renderData = this.creatures.map((c) => ({
      species: c.species,
      stage: c.stage,
      x: c.x,
      y: c.y,
      energy: c.energy,
      phi: c.phi,
      isSleeping: c.isSleeping,
    }));
    drawBeatlingWorld(ctx, width, height, this.gol, renderData, time);
  }

  getCreatures(): Creature[] { return this.creatures; }
  getAchievements(): Achievement[] { return this.achievements; }
  getGol(): GolBrain { return this.gol; }

  /** Terminate the Web Worker to prevent resource leaks */
  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
  }

  /** Try spawning creatures — max 2 per species, 120-frame cooldown */
  private trySpawn(features: AudioFeatures): void {
    const allSpecies: Species[] = ['beatling', 'looplet', 'synthling', 'glitchbit', 'wavelet', 'codefly'];
    for (const species of allSpecies) {
      const cooldown = this.spawnCooldowns.get(species) ?? 0;
      if (cooldown > 0) {
        this.spawnCooldowns.set(species, cooldown - 1);
        continue;
      }
      /* Max 2 of each species alive at once */
      const count = this.creatures.filter((c) => c.species === species).length;
      if (count >= 2) continue;

      if (shouldSpawn(species, features)) {
        /* Initialize neural brain for the new creature */
        const brain = new NeuralNetwork();
        brain.initialize();
        const consciousness = new ConsciousnessEngine();
        const dreams = new DreamEngine();

        this.creatures.push({
          id: `${species}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          species,
          stage: 'egg',
          xp: { audio: 0, complexity: 0, interaction: 0 },
          /* Position as 0-1 fractions — renderer scales to canvas size */
          x: 0.1 + Math.random() * 0.8,
          y: 0.1 + Math.random() * 0.8,
          energy: features.rms,
          born: Date.now(),
          brain,
          consciousness,
          dreams,
          isSleeping: false,
          phi: 0,
        });
        this.spawnCooldowns.set(species, 120); /* ~2 second cooldown at 60fps */
      }
    }
  }

  /** Update a creature's neural brain with audio-derived stimulation.
   * Audio features map to sensory neurons; motor output nudges position;
   * consciousness Phi drives glow; dreams consolidate during silence. */
  private updateCreatureBrain(creature: Creature, features: AudioFeatures): void {
    const { brain, consciousness, dreams } = creature;

    /* Check if creature should sleep (low energy, high sleep pressure) */
    if (!creature.isSleeping && dreams.shouldSleep(creature.energy, dreams.sleepPressure)) {
      creature.isSleeping = true;
    }

    if (creature.isSleeping) {
      /* Dreaming — consolidate memories, prune weak synapses */
      dreams.processDream(brain);

      /* Wake up when audio returns or dream cycle completes */
      if (features.rms > 0.2 || dreams.dreamPhase > Math.PI * 4) {
        creature.isSleeping = false;
        dreams.isDreaming = false;
        dreams.dreamPhase = 0;
        dreams.sleepPressure = 0;
      }
      return;
    }

    /* Awake — stimulate sensory neurons with audio features */
    brain.stimulate('hunger_sense', features.rms);
    brain.stimulate('food_sense', features.dominantFreq / 1000);
    brain.stimulate('touch_sense', features.hasBeat ? 0.8 : 0);
    brain.stimulate('proximity_sense', features.complexity);

    /* Run one brain tick — propagates signals, Hebbian learning, neurogenesis */
    brain.update();

    /* Consciousness: compute Phi from neural activity */
    consciousness.update(brain);
    creature.phi = Math.min(1, consciousness.phi);

    /* Motor output: neural network drives subtle position drift */
    const motor = brain.getMotorOutput();
    const drift = 0.002; /* Small per-frame position change */
    creature.x = Math.max(0.05, Math.min(0.95, creature.x + (motor.toward - motor.away) * drift));
    creature.y = Math.max(0.05, Math.min(0.95, creature.y + motor.eat * drift * 0.5));

    /* Accumulate sleep pressure while awake */
    dreams.accumulatePressure(
      brain.totalFirings > 0 ? 0.5 : 0,
      Math.abs(brain.getEmotionalState()),
    );

    /* Neural activity contributes to interaction XP */
    if (brain.intelligence > 5) {
      creature.xp = addXp(creature.xp, 'interaction', brain.intelligence * 0.001);
    }
  }

  /** Translate audio features into GoL cell injections */
  private injectAudioIntoGol(features: AudioFeatures): void {
    const cx = Math.floor(this.gol.width / 2);
    const cy = Math.floor(this.gol.height / 2);

    /* Beats → pulse pattern near center */
    if (features.hasBeat) {
      this.gol.injectPulse(cx + (Math.random() - 0.5) * 20, cy + (Math.random() - 0.5) * 20, 3);
    }
    /* Low frequency → gliders moving across the grid */
    if (features.dominantFreq < 200 && features.rms > 0.15) {
      this.gol.injectGlider(Math.random() * this.gol.width, Math.random() * this.gol.height);
    }
    /* High frequency → oscillators (blinkers) */
    if (features.dominantFreq > 500 && features.rms > 0.15) {
      this.gol.injectOscillator(Math.random() * this.gol.width, Math.random() * this.gol.height);
    }
    /* Volume drives general cell injection */
    if (features.rms > 0.3) {
      const count = Math.floor(features.rms * 5);
      for (let i = 0; i < count; i++) {
        this.gol.setCell(
          Math.floor(Math.random() * this.gol.width),
          Math.floor(Math.random() * this.gol.height),
          true,
        );
      }
    }
  }

  /** Check and unlock achievements based on current creature state */
  private checkAchievements(): void {
    const speciesPresent = new Set(this.creatures.map((c) => c.species));

    /* First-species achievements */
    for (const species of speciesPresent) {
      const achievementId = `first_${species}`;
      if (!isUnlocked(this.achievements, achievementId)) {
        this.achievements = checkAchievement(this.achievements, achievementId);
      }
    }

    /* Full ecosystem — all 6 species active at once */
    if (speciesPresent.size === 6 && !isUnlocked(this.achievements, 'full_ecosystem')) {
      this.achievements = checkAchievement(this.achievements, 'full_ecosystem');
    }

    /* Ascended — any creature reached final stage */
    if (this.creatures.some((c) => c.stage === 'ascended') && !isUnlocked(this.achievements, 'ascended_one')) {
      this.achievements = checkAchievement(this.achievements, 'ascended_one');
    }
  }
}
