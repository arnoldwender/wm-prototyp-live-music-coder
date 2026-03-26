/* ──────────────────────────────────────────────────────────
   CollectionPanel organism — slide-out panel displaying all
   9 achievements from the Beatling collection system. Shows
   lock/unlock state, unlock timestamps, and creature count
   per species.
   ────────────────────────────────────────────────────────── */

import { useTranslation } from 'react-i18next'
import { Trophy, Lock, X } from 'lucide-react'
import { useAppStore } from '../../lib/store'
import { Button } from '../atoms'
import type { Achievement, AchievementTier } from '../../types/beatling'

/** Tier border color mapping for achievement cards */
const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: 'var(--color-warning)',
  silver: 'var(--color-text-muted)',
  gold: 'var(--color-warning)',
  platinum: 'var(--color-primary)',
  secret: 'var(--color-accent)',
}

interface CollectionPanelProps {
  onClose: () => void
}

/** Format an unlock timestamp into a readable date string */
function formatUnlockDate(timestamp: string): string {
  const date = new Date(Number(timestamp))
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Single achievement card — shows name, description, and lock state */
function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { t } = useTranslation()
  const unlocked = achievement.unlockedAt !== null

  return (
    <article
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: `1px solid ${unlocked ? TIER_COLORS[achievement.tier] : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-sm)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-sm)',
        opacity: unlocked ? 1 : 0.5,
        transition: 'var(--transition-fast)',
      }}
    >
      {/* Achievement icon or lock */}
      <div
        style={{
          flexShrink: 0,
          marginTop: 'var(--space-1)',
          fontSize: 'var(--font-size-lg)',
          lineHeight: 1,
        }}
      >
        {unlocked ? (
          <span aria-hidden="true">{achievement.icon}</span>
        ) : (
          <Lock size={18} style={{ color: 'var(--color-text-muted)' }} />
        )}
      </div>

      {/* Achievement details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text)',
          }}
        >
          {achievement.name}
        </div>
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-1)',
          }}
        >
          {achievement.description}
        </div>
        {/* Unlock timestamp */}
        {unlocked && achievement.unlockedAt && (
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-xs)',
              fontFamily: 'var(--font-family-mono)',
            }}
          >
            {t('collection.unlocked')} {formatUnlockDate(achievement.unlockedAt)}
          </div>
        )}
        {!unlocked && (
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-xs)',
            }}
          >
            {t('collection.locked')}
          </div>
        )}
      </div>
    </article>
  )
}

/** Species list with spawn count (static from ACHIEVEMENTS for now) */
const SPECIES_LIST = [
  { id: 'beatling', label: 'Beatling' },
  { id: 'looplet', label: 'Looplet' },
  { id: 'synthling', label: 'Synthling' },
  { id: 'glitchbit', label: 'Glitchbit' },
  { id: 'wavelet', label: 'Wavelet' },
  { id: 'codefly', label: 'Codefly' },
] as const

/** Slide-out collection panel showing achievements and species overview */
export function CollectionPanel({ onClose }: CollectionPanelProps) {
  const { t } = useTranslation()

  /* Read live achievements from store — updated by BeatlingPanel sync + UI unlock calls */
  const achievements = useAppStore((s) => s.achievements)

  /* Count unlocked achievements */
  const unlockedCount = achievements.filter((a) => a.unlockedAt !== null).length

  return (
    <aside
      className="fixed right-0 top-0 bottom-0 w-full max-w-80 z-40 overflow-y-auto shadow-lg"
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        borderLeft: '1px solid var(--color-border)',
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: 'var(--space-md)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-sm)' }}>
          <Trophy size={18} style={{ color: 'var(--color-warning)' }} />
          <h2
            style={{
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text)',
              fontSize: 'var(--font-size-base)',
            }}
          >
            {t('collection.title')}
          </h2>
        </div>
        <Button variant="ghost" onClick={onClose} aria-label={t('help.close')}>
          <X size={18} />
        </Button>
      </div>

      <div style={{ padding: 'var(--space-md)' }}>
        {/* Progress summary */}
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-md)',
          }}
        >
          {unlockedCount} / {achievements.length} {t('collection.unlocked')}
        </div>

        {/* Achievement cards */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </section>

        {/* Species count overview */}
        <section style={{ marginTop: 'var(--space-xl)' }}>
          <h3
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-sm)',
            }}
          >
            Species
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-xs)',
            }}
          >
            {SPECIES_LIST.map((species) => (
              <div
                key={species.id}
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  padding: 'var(--space-xs) var(--space-sm)',
                  backgroundColor: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {species.label}
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  )
}
