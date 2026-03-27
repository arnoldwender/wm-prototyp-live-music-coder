/* ──────────────────────────────────────────────────────────
   CollectionPanel — achievements dashboard with cyberpunk styling.
   Progress ring, tier badges, scanline effects.
   ────────────────────────────────────────────────────────── */

import { X } from 'lucide-react'
import { useAppStore } from '../../lib/store'
import { Button } from '../atoms'
import type { Achievement, AchievementTier } from '../../types/beatling'

const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: '#cd7f32',
  silver: '#a1a1aa',
  gold: '#fbbf24',
  platinum: '#a855f7',
  secret: '#ef4444',
}

const TIER_LABELS: Record<AchievementTier, string> = {
  bronze: 'BRONZE',
  silver: 'SILVER',
  gold: 'GOLD',
  platinum: 'PLAT',
  secret: 'SECRET',
}

interface CollectionPanelProps {
  onClose: () => void
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const unlocked = achievement.unlockedAt !== null
  const color = TIER_COLORS[achievement.tier]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
        backgroundColor: unlocked ? 'rgba(168, 85, 247, 0.05)' : 'var(--color-bg)',
        border: '1px solid',
        borderColor: unlocked ? color : 'var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        opacity: unlocked ? 1 : 0.4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Scanline for unlocked */}
      {unlocked && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(168,85,247,0.02) 2px, rgba(168,85,247,0.02) 4px)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Icon */}
      <span style={{
        fontSize: '20px',
        lineHeight: 1,
        flexShrink: 0,
        filter: unlocked ? 'none' : 'grayscale(1)',
      }}>
        {achievement.icon}
      </span>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: unlocked ? 'var(--color-text)' : 'var(--color-text-muted)',
        }}>
          {achievement.name}
        </div>
        <div style={{
          fontSize: '10px',
          color: 'var(--color-text-muted)',
          marginTop: '1px',
          lineHeight: 1.3,
        }}>
          {achievement.description}
        </div>
      </div>

      {/* Tier badge */}
      <span style={{
        fontSize: '8px',
        fontWeight: 700,
        fontFamily: 'var(--font-family-mono)',
        letterSpacing: '0.1em',
        color: unlocked ? color : 'var(--color-text-muted)',
        flexShrink: 0,
        textShadow: unlocked ? `0 0 6px ${color}` : 'none',
      }}>
        {TIER_LABELS[achievement.tier]}
      </span>
    </div>
  )
}

export function CollectionPanel({ onClose }: CollectionPanelProps) {
  const achievements = useAppStore((s) => s.achievements)
  const unlocked = achievements.filter((a) => a.unlockedAt !== null).length
  const total = achievements.length
  const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0

  /* SVG ring progress */
  const ringSize = 64
  const strokeWidth = 4
  const radius = (ringSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (pct / 100) * circumference

  return (
    <aside
      className="fixed right-0 top-0 bottom-0 w-full max-w-80 z-40 overflow-y-auto"
      style={{
        backgroundColor: 'rgba(9, 9, 11, 0.98)',
        borderLeft: '1px solid var(--color-border)',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-primary)',
          textShadow: '0 0 8px rgba(168,85,247,0.4)',
        }}>
          Achievements
        </span>
        <Button variant="ghost" onClick={onClose} aria-label="Close">
          <X size={16} />
        </Button>
      </div>

      {/* Progress ring + stats */}
      <div className="flex items-center gap-4" style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
        <svg width={ringSize} height={ringSize} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle cx={ringSize/2} cy={ringSize/2} r={radius}
            fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} />
          {/* Progress ring */}
          <circle cx={ringSize/2} cy={ringSize/2} r={radius}
            fill="none" stroke="var(--color-primary)" strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease', filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.5))' }} />
        </svg>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-family-mono)', color: 'var(--color-text)' }}>
            {pct}<span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>%</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>
            {unlocked}/{total} unlocked
          </div>
        </div>
      </div>

      {/* Achievement list */}
      <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {/* Unlocked first, then locked */}
        {achievements
          .sort((a, b) => (a.unlockedAt ? 0 : 1) - (b.unlockedAt ? 0 : 1))
          .map((a) => <AchievementCard key={a.id} achievement={a} />)}
      </div>
    </aside>
  )
}
