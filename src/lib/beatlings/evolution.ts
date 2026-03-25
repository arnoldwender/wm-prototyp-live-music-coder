/* ──────────────────────────────────────────────────────────
   Evolution system — XP accumulation from audio, complexity,
   and interaction sources. Stage transitions at thresholds.
   ────────────────────────────────────────────────────────── */

import type { Stage } from '../../types/beatling';

/** XP split by source — allows tracking what drives evolution */
export interface BeatlingXp {
  audio: number;
  complexity: number;
  interaction: number;
}

/** Stage transition thresholds (total XP across all sources) */
export const XP_THRESHOLDS = {
  baby: 50,
  adult: 200,
  elder: 500,
  ascended: 1000,
} as const;

/** Sum all XP sources into a single total */
export function getTotalXp(xp: BeatlingXp): number {
  return xp.audio + xp.complexity + xp.interaction;
}

/** Determine life stage based on total accumulated XP */
export function getStage(xp: BeatlingXp): Stage {
  const total = getTotalXp(xp);
  if (total >= XP_THRESHOLDS.ascended) return 'ascended';
  if (total >= XP_THRESHOLDS.elder) return 'elder';
  if (total >= XP_THRESHOLDS.adult) return 'adult';
  if (total >= XP_THRESHOLDS.baby) return 'baby';
  return 'egg';
}

/** Immutably add XP to a specific source type */
export function addXp(xp: BeatlingXp, type: keyof BeatlingXp, amount: number): BeatlingXp {
  return { ...xp, [type]: xp[type] + amount };
}

/** Visual size multiplier per life stage */
export function getStageSizeMultiplier(stage: Stage): number {
  switch (stage) {
    case 'egg': return 0.5;
    case 'baby': return 0.7;
    case 'adult': return 1.0;
    case 'elder': return 1.2;
    case 'ascended': return 1.5;
  }
}

/** Glow intensity per life stage (0 = none, 1 = full) */
export function getStageGlow(stage: Stage): number {
  switch (stage) {
    case 'egg': return 0;
    case 'baby': return 0.1;
    case 'adult': return 0.3;
    case 'elder': return 0.5;
    case 'ascended': return 1.0;
  }
}
