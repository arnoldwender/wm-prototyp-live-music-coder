/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   AchievementToast molecule — small, subtle notification that
   slides in from bottom-right corner. Click to dismiss.
   Auto-dismisses after 2 seconds.
   ────────────────────────────────────────────────────────── */

import { useEffect, useState } from 'react'
import { useAppStore } from '../../lib/store'

/** Subtle toast for unlocked achievements.
 *  Outer component conditionally renders the inner Toast — when
 *  `pendingToast` becomes null, Toast unmounts and its `fading` state
 *  is discarded. When a new toast appears, Toast remounts with a fresh
 *  `fading=false`. This avoids React 19's set-state-in-effect lint
 *  (and the extra render) that the previous useEffect-mirror approach
 *  triggered. */
export function AchievementToast() {
  const pendingToast = useAppStore((s) => s.pendingToast)
  const dismissToast = useAppStore((s) => s.dismissToast)

  if (!pendingToast) return null

  return (
    <Toast
      icon={pendingToast.icon}
      title={pendingToast.title}
      onDismiss={dismissToast}
    />
  )
}

interface ToastProps {
  icon: string
  title: string
  onDismiss: () => void
}

function Toast({ icon, title, onDismiss }: ToastProps) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    /* Start fade after 1.5s, dismiss at 2s */
    const fadeTimer = setTimeout(() => setFading(true), 1500)
    const dismissTimer = setTimeout(() => {
      onDismiss()
    }, 2000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(dismissTimer)
    }
  }, [onDismiss])

  return (
    <button
      type="button"
      role="status"
      aria-live="polite"
      onClick={onDismiss}
      aria-label="Dismiss achievement"
      style={{
        position: 'fixed',
        bottom: 'var(--space-10)',
        right: 'var(--space-3)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        backgroundColor: 'var(--color-bg-alt)',
        backdropFilter: 'blur(6px)',
        border: '1px solid var(--color-strudel-dim)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-2) var(--space-3)',
        boxShadow: 'var(--shadow-md)',
        opacity: fading ? 0 : 0.95,
        transform: fading ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 400ms ease, transform 200ms ease',
        cursor: 'pointer',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-family-sans)',
        maxWidth: '240px',
      }}
    >
      <span style={{ fontSize: '14px', lineHeight: 1, flexShrink: 0 }} aria-hidden="true">
        {icon}
      </span>
      <span style={{ fontSize: '11px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {title}
      </span>
    </button>
  )
}
