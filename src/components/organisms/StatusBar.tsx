/* ──────────────────────────────────────────────────────────
   StatusBar organism — bottom bar showing engine status,
   CPU usage, creature count, XP level, streak, and ready state.
   ────────────────────────────────────────────────────────── */

import { useTranslation } from 'react-i18next'
import { useAppStore, xpForLevel } from '../../lib/store'
import { ENGINE_COLORS } from '../../lib/constants'
import { Badge } from '../atoms'

/** Inline XP progress bar — shows level + filled bar + XP numbers */
function XpBar() {
  const userXp = useAppStore((s) => s.userXp)
  const userLevel = useAppStore((s) => s.userLevel)

  /* XP thresholds for current and next level */
  const currentLevelXp = xpForLevel(userLevel)
  const nextLevelXp = xpForLevel(userLevel + 1)
  const xpInLevel = userXp - currentLevelXp
  const xpNeeded = nextLevelXp - currentLevelXp
  const progress = xpNeeded > 0 ? Math.max(0, Math.min(xpInLevel / xpNeeded, 1)) : 0

  /* Bar width in characters (6 chars total) — clamp to prevent negative .repeat() */
  const filledChars = Math.max(0, Math.min(6, Math.round(progress * 6)))
  const emptyChars = 6 - filledChars
  const barText = '\u2588'.repeat(filledChars) + '\u2591'.repeat(emptyChars)

  return (
    <span
      style={{
        fontFamily: 'var(--font-family-mono)',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-muted)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
      }}
      title={`Level ${userLevel} — ${userXp} XP`}
    >
      <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-bold)' }}>
        Lv.{userLevel}
      </span>
      <span style={{ color: 'var(--color-primary)', opacity: 0.7 }}>{barText}</span>
      <span>{xpInLevel}/{xpNeeded} XP</span>
    </span>
  )
}

/** Bottom status bar with runtime information */
function StatusBar() {
  const { t } = useTranslation()
  const defaultEngine = useAppStore((s) => s.defaultEngine)
  const fileCount = useAppStore((s) => s.files.length)
  const creatureCount = useAppStore((s) => s.creatureCount)
  const toggleBrainPanel = useAppStore((s) => s.toggleBrainPanel)
  const showBrainPanel = useAppStore((s) => s.showBrainPanel)
  const streak = useAppStore((s) => s.streak)

  return (
    <footer
      className="flex items-center justify-between shrink-0"
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        borderTop: '1px solid var(--color-border)',
        padding: 'var(--space-2) var(--space-3)',
        height: '28px',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-muted)',
      }}
    >
      {/* Left: engine badge + XP bar */}
      <div className="flex items-center gap-3">
        <span>{t('status.engine')}:</span>
        <Badge color={ENGINE_COLORS[defaultEngine]}>
          {t(`engines.${defaultEngine}`)}
        </Badge>
        <XpBar />
      </div>

      {/* Right: streak, file count, creatures, status */}
      <div className="flex items-center gap-4">
        {/* Streak counter — only visible when streak > 0 */}
        {streak.current > 0 && (
          <span
            title={t('gamification.streakDays', { count: streak.current })}
            style={{ fontSize: 'var(--font-size-xs)' }}
          >
            {'\uD83D\uDD25'} {streak.current}
          </span>
        )}

        {/* File count from store */}
        <span>
          {t('status.files')}: {fileCount}
        </span>

        {/* Live creature count — clickable to toggle Brain Panel */}
        <button
          type="button"
          onClick={toggleBrainPanel}
          style={{
            background: 'none',
            border: 'none',
            color: showBrainPanel ? 'var(--color-primary)' : 'inherit',
            cursor: 'pointer',
            fontSize: 'inherit',
            fontFamily: 'inherit',
            padding: 0,
          }}
          aria-label={t('status.toggleBrain', 'Toggle brain panel')}
        >
          {t('status.creatures')}: {creatureCount}/12
        </button>

        {/* Ready indicator */}
        <span
          style={{ color: 'var(--color-success)' }}
        >
          {t('status.ready')}
        </span>
      </div>
    </footer>
  )
}

export default StatusBar
