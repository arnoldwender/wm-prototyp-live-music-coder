/* ──────────────────────────────────────────────────────────
   AchievementToast molecule — small, subtle notification that
   slides in from bottom-right corner. Click to dismiss.
   Auto-dismisses after 2 seconds.
   ────────────────────────────────────────────────────────── */

import { useEffect, useState } from 'react'
import { useAppStore } from '../../lib/store'

/** Subtle toast for unlocked achievements */
export function AchievementToast() {
  const pendingToast = useAppStore((s) => s.pendingToast)
  const dismissToast = useAppStore((s) => s.dismissToast)

  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!pendingToast) {
      setVisible(false)
      setFading(false)
      return
    }

    setVisible(true)
    setFading(false)

    /* Start fade after 1.5s, dismiss at 2s */
    const fadeTimer = setTimeout(() => setFading(true), 1500)
    const dismissTimer = setTimeout(() => {
      dismissToast()
      setVisible(false)
      setFading(false)
    }, 2000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(dismissTimer)
    }
  }, [pendingToast, dismissToast])

  if (!pendingToast || !visible) return null

  return (
    <button
      type="button"
      role="status"
      aria-live="polite"
      onClick={() => { dismissToast(); setVisible(false) }}
      aria-label="Dismiss achievement"
      style={{
        position: 'fixed',
        bottom: 'var(--space-10)',
        right: 'var(--space-3)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        backgroundColor: 'rgba(24, 24, 27, 0.85)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-2) var(--space-3)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        opacity: fading ? 0 : 0.95,
        transform: visible && !fading ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 400ms ease, transform 200ms ease',
        cursor: 'pointer',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-family-sans)',
        maxWidth: '240px',
      }}
    >
      <span style={{ fontSize: '14px', lineHeight: 1, flexShrink: 0 }} aria-hidden="true">
        {pendingToast.icon}
      </span>
      <span style={{ fontSize: '11px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {pendingToast.title}
      </span>
    </button>
  )
}
