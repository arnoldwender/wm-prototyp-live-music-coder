/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Gamification types — achievement tiers and unlockable
   milestones for the live coding experience.
   ────────────────────────────────────────────────────────── */

/** Achievement tier — determines visual styling and XP reward */
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'secret'

/** Unlockable achievement tied to coding milestones and gameplay */
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  tier: AchievementTier
  unlockedAt: string | null
}
