/* ──────────────────────────────────────────────────────────
   Beatling types — digital creatures that evolve based on
   audio complexity, code patterns, and user interaction.
   ────────────────────────────────────────────────────────── */

/** Creature species — each has unique visual traits and behaviors */
export type Species = 'beatling' | 'looplet' | 'synthling' | 'glitchbit' | 'wavelet' | 'codefly'

/** Life stage — determines creature size, abilities, and appearance */
export type Stage = 'egg' | 'baby' | 'adult' | 'elder' | 'ascended'

/** Snapshot of a creature's neural state for consciousness metric (IIT phi) */
export interface NeuralSnapshot {
  neurons: number[]
  synapses: number[]
  phi: number
}

/** Full creature state — persisted within the project ecosystem */
export interface BeatlingState {
  id: string
  species: Species
  stage: Stage
  xp: {
    audio: number
    complexity: number
    interaction: number
  }
  brain: NeuralSnapshot
  position: { x: number; y: number }
  color: string
  born: string
}

/** Achievement tier — determines visual styling and XP reward */
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'secret'

/** Unlockable achievement tied to creature milestones and gameplay */
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  tier: AchievementTier
  unlockedAt: string | null
}
