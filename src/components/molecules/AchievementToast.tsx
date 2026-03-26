/* ──────────────────────────────────────────────────────────
   AchievementToast molecule — floating notification that
   slides in from top-right when an achievement unlocks.
   Auto-dismisses after 4 seconds with fade-out animation.
   ────────────────────────────────────────────────────────── */

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../lib/store'

/** Toast notification for unlocked achievements */
export function AchievementToast() {
  const { t } = useTranslation()
  const pendingToast = useAppStore((s) => s.pendingToast)
  const dismissToast = useAppStore((s) => s.dismissToast)

  /* Local fade-out state for smooth exit animation */
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!pendingToast) {
      setVisible(false)
      setFading(false)
      return
    }

    /* Slide in */
    setVisible(true)
    setFading(false)

    /* Start fade-out after 3.5 seconds */
    const fadeTimer = setTimeout(() => setFading(true), 3500)
    /* Dismiss after 4 seconds */
    const dismissTimer = setTimeout(() => {
      dismissToast()
      setVisible(false)
      setFading(false)
    }, 4000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(dismissTimer)
    }
  }, [pendingToast, dismissToast])

  if (!pendingToast || !visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t('gamification.achievementUnlocked')}
      style={{
        position: 'fixed',
        top: 'var(--space-4)',
        right: 'var(--space-4)',
        zIndex: 9999,
        minWidth: '280px',
        maxWidth: '360px',
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--color-accent)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        boxShadow: 'var(--shadow-lg)',
        opacity: fading ? 0 : 1,
        transform: visible && !fading ? 'translateX(0)' : 'translateX(100%)',
        transition: 'opacity 500ms ease, transform 300ms ease',
        pointerEvents: 'auto',
      }}
    >
      {/* Achievement icon */}
      <span
        style={{
          fontSize: 'var(--font-size-2xl)',
          lineHeight: 1,
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {pendingToast.icon}
      </span>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-accent)',
            fontWeight: 'var(--font-weight-bold)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--space-1)',
          }}
        >
          {t('gamification.achievementUnlocked')}
        </div>
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text)',
          }}
        >
          {pendingToast.title}
        </div>
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-1)',
          }}
        >
          {pendingToast.description}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => {
          dismissToast()
          setVisible(false)
        }}
        aria-label={t('editor.dismiss')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          fontSize: 'var(--font-size-base)',
          lineHeight: 1,
          padding: 'var(--space-1)',
          flexShrink: 0,
        }}
      >
        &times;
      </button>
    </div>
  )
}
