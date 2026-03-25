/* ──────────────────────────────────────────────────────────
   Species definitions — 6 audio-reactive creature types,
   each with unique spawn conditions and movement styles.
   ────────────────────────────────────────────────────────── */

import type { Species } from '../../types/beatling';

/** Audio features extracted per frame for spawn checks and brain stimulation */
export interface AudioFeatures {
  rms: number;
  peak: number;
  hasBeat: boolean;
  dominantFreq: number;
  complexity: number;
  isTyping: boolean;
}

/** Full species definition including visual traits and spawn logic */
export interface SpeciesDefinition {
  name: Species;
  role: string;
  color: string;
  dimColor: string;
  spawnCheck: (features: AudioFeatures) => boolean;
  movementStyle: 'bounce' | 'orbit' | 'flow' | 'glitch' | 'wave' | 'swarm';
}

/** All 6 species with their audio-based spawn triggers */
export const SPECIES: Record<Species, SpeciesDefinition> = {
  beatling: {
    name: 'beatling',
    role: 'Rhythm/percussion',
    color: '#f97316',
    dimColor: '#ea580c',
    spawnCheck: (f) => f.hasBeat && f.rms > 0.2,
    movementStyle: 'bounce',
  },
  looplet: {
    name: 'looplet',
    role: 'Pattern loops',
    color: '#a855f7',
    dimColor: '#9333ea',
    spawnCheck: (f) => f.complexity > 0.4 && f.rms > 0.1,
    movementStyle: 'orbit',
  },
  synthling: {
    name: 'synthling',
    role: 'Melodic synths',
    color: '#3b82f6',
    dimColor: '#2563eb',
    spawnCheck: (f) => f.dominantFreq > 300 && f.rms > 0.15,
    movementStyle: 'flow',
  },
  glitchbit: {
    name: 'glitchbit',
    role: 'Noise/distortion',
    color: '#ef4444',
    dimColor: '#dc2626',
    spawnCheck: (f) => f.peak > 0.7 && f.rms > 0.3,
    movementStyle: 'glitch',
  },
  wavelet: {
    name: 'wavelet',
    role: 'Bass/sub frequencies',
    color: '#22c55e',
    dimColor: '#16a34a',
    spawnCheck: (f) => f.dominantFreq < 200 && f.rms > 0.15,
    movementStyle: 'wave',
  },
  codefly: {
    name: 'codefly',
    role: 'Code activity',
    color: '#fbbf24',
    dimColor: '#f59e0b',
    spawnCheck: (f) => f.isTyping,
    movementStyle: 'swarm',
  },
};

/** Check if a species should spawn given the current audio features */
export function shouldSpawn(species: Species, features: AudioFeatures): boolean {
  return SPECIES[species].spawnCheck(features);
}
