/* ──────────────────────────────────────────────────────────
   Collection system — 9 achievements tied to creature
   milestones. Tracks unlock state with timestamps.
   ────────────────────────────────────────────────────────── */

import type { Achievement } from '../../types/beatling';

/** All available achievements — unlocked as creatures spawn and evolve */
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_beatling', name: 'First Beat', description: 'Your first Beatling was born', unlockedAt: null },
  { id: 'first_looplet', name: 'Loop Master', description: 'A Looplet appeared', unlockedAt: null },
  { id: 'first_synthling', name: 'Synth Wave', description: 'A Synthling emerged', unlockedAt: null },
  { id: 'first_glitchbit', name: 'Glitch Mode', description: 'A Glitchbit materialized', unlockedAt: null },
  { id: 'first_wavelet', name: 'Bass Drop', description: 'A Wavelet surfaced', unlockedAt: null },
  { id: 'first_codefly', name: 'Code Light', description: 'A Codefly appeared', unlockedAt: null },
  { id: 'full_ecosystem', name: 'Full Ecosystem', description: 'All 6 species active at once', unlockedAt: null },
  { id: 'ascended_one', name: 'Ascended One', description: 'A creature reached Ascended stage', unlockedAt: null },
  { id: 'silence_master', name: 'Silence Master', description: 'A creature dreamed for 60 seconds', unlockedAt: null },
];

/** Unlock an achievement by id if not already unlocked. Returns new array. */
export function checkAchievement(achievements: Achievement[], id: string): Achievement[] {
  return achievements.map((a) =>
    a.id === id && a.unlockedAt === null
      ? { ...a, unlockedAt: Date.now().toString() }
      : a,
  );
}

/** Check if a specific achievement has been unlocked */
export function isUnlocked(achievements: Achievement[], id: string): boolean {
  return achievements.some((a) => a.id === id && a.unlockedAt !== null);
}
