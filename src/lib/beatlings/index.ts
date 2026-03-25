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
}

/** Manages the Beatling ecosystem — spawning, updating, rendering */
export class BeatlingWorld {
  private creatures: Creature[] = [];
  private gol: GolBrain;
  private bridge: AudioBridge | null = null;
  private achievements: Achievement[] = [...ACHIEVEMENTS];
  private golTickCounter = 0;
  private spawnCooldowns: Map<Species, number> = new Map();

  constructor(golWidth = 64, golHeight = 64) {
    this.gol = new GolBrain(golWidth, golHeight);
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
      this.gol.step();
    }

    /* Try spawn new creatures based on audio features */
    this.trySpawn(features);

    /* Update existing creatures — energy and XP accumulation */
    for (const creature of this.creatures) {
      creature.energy = features.rms;
      if (features.rms > 0.1) {
        creature.xp = addXp(creature.xp, 'audio', features.rms * 0.1);
      }
      if (features.complexity > 0.3) {
        creature.xp = addXp(creature.xp, 'complexity', features.complexity * 0.05);
      }
      creature.stage = getStage(creature.xp);
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
    }));
    drawBeatlingWorld(ctx, width, height, this.gol, renderData, time);
  }

  getCreatures(): Creature[] { return this.creatures; }
  getAchievements(): Achievement[] { return this.achievements; }
  getGol(): GolBrain { return this.gol; }

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
        this.creatures.push({
          id: `${species}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          species,
          stage: 'egg',
          xp: { audio: 0, complexity: 0, interaction: 0 },
          x: 50 + Math.random() * 300,
          y: 50 + Math.random() * 150,
          energy: features.rms,
          born: Date.now(),
        });
        this.spawnCooldowns.set(species, 120); /* ~2 second cooldown at 60fps */
      }
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
