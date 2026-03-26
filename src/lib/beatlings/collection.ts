/* ──────────────────────────────────────────────────────────
   Collection system — 22 achievements across 5 tiers tied
   to creature milestones, gameplay, and session activity.
   Tracks unlock state with timestamps.
   ────────────────────────────────────────────────────────── */

import type { Achievement, AchievementTier } from '../../types/beatling';

/** XP reward per achievement tier */
export const TIER_XP: Record<AchievementTier, number> = {
  bronze: 50,
  silver: 100,
  gold: 200,
  platinum: 500,
  secret: 100,
};

/** All available achievements — unlocked as creatures spawn, evolve, and user plays */
export const ACHIEVEMENTS: Achievement[] = [
  /* --- Creature spawn achievements (Bronze) --- */
  { id: 'first_beatling', name: 'First Beat', description: 'Your first Beatling was born', icon: '🥁', tier: 'bronze', unlockedAt: null },
  { id: 'first_looplet', name: 'Loop Master', description: 'A Looplet appeared', icon: '🔄', tier: 'bronze', unlockedAt: null },
  { id: 'first_synthling', name: 'Synth Wave', description: 'A Synthling emerged', icon: '🎹', tier: 'bronze', unlockedAt: null },
  { id: 'first_glitchbit', name: 'Glitch Mode', description: 'A Glitchbit materialized', icon: '👾', tier: 'bronze', unlockedAt: null },
  { id: 'first_wavelet', name: 'Bass Drop', description: 'A Wavelet surfaced', icon: '🌊', tier: 'bronze', unlockedAt: null },
  { id: 'first_codefly', name: 'Code Light', description: 'A Codefly appeared', icon: '✨', tier: 'bronze', unlockedAt: null },

  /* --- Discovery achievements (Bronze) --- */
  { id: 'first_play', name: 'First Note', description: 'Play your first sound', icon: '🎵', tier: 'bronze', unlockedAt: null },
  { id: 'first_share', name: 'Sharing is Caring', description: 'Share a creation via URL', icon: '🔗', tier: 'bronze', unlockedAt: null },
  { id: 'first_save', name: 'Saved!', description: 'Save to GitHub Gist', icon: '💾', tier: 'bronze', unlockedAt: null },
  { id: 'template_used', name: 'Quick Start', description: 'Use a starter template', icon: '🚀', tier: 'bronze', unlockedAt: null },

  /* --- Mastery achievements (Silver) --- */
  { id: 'all_engines', name: 'Polyglot', description: 'Use all 4 audio engines', icon: '🎛️', tier: 'silver', unlockedAt: null },
  { id: 'long_session', name: 'Deep Focus', description: 'Code for 30+ minutes in one session', icon: '⏰', tier: 'silver', unlockedAt: null },
  { id: 'complex_pattern', name: 'Architect', description: 'Create a pattern with 5+ lines', icon: '🏗️', tier: 'silver', unlockedAt: null },
  { id: 'ten_evaluations', name: 'Experimenter', description: 'Evaluate code 10 times in one session', icon: '🧪', tier: 'silver', unlockedAt: null },

  /* --- Gold achievements --- */
  { id: 'full_ecosystem', name: 'Full Ecosystem', description: 'All 6 species active at once', icon: '🌍', tier: 'gold', unlockedAt: null },
  { id: 'ascended_one', name: 'Ascended One', description: 'A creature reached Ascended stage', icon: '👼', tier: 'gold', unlockedAt: null },
  { id: 'all_species_evolved', name: 'Evolution Master', description: 'Evolve all 6 species past egg stage', icon: '🧬', tier: 'gold', unlockedAt: null },
  { id: 'high_consciousness', name: 'Enlightenment', description: 'A creature reaches Phi > 0.5', icon: '🧠', tier: 'gold', unlockedAt: null },
  { id: 'hundred_firings', name: 'Neural Storm', description: '1000 total neuron firings across all creatures', icon: '⚡', tier: 'gold', unlockedAt: null },

  /* --- Platinum achievements --- */
  { id: 'ascended_all', name: 'Transcendence', description: 'All 6 species reach Ascended stage', icon: '✨', tier: 'platinum', unlockedAt: null },

  /* --- Secret achievements --- */
  { id: 'night_owl', name: 'Night Owl', description: 'Code music after midnight', icon: '🦉', tier: 'secret', unlockedAt: null },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Evaluate code within 5 seconds of opening editor', icon: '💨', tier: 'secret', unlockedAt: null },
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
