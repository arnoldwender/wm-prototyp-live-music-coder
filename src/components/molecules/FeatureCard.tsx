/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   FeatureCard — feature highlight card for the landing page.
   Displays a ReactNode icon in a colored circle, title, and
   description. Hover effect: scale + border glow.
   ---------------------------------------------------------- */

import type { ReactNode } from 'react'

interface FeatureCardProps {
  /** Lucide icon or any ReactNode rendered inside colored circle */
  icon: ReactNode
  /** Accent color for the icon circle background (CSS value) */
  accentColor?: string
  /** Feature title (already translated) */
  title: string
  /** Feature description (already translated) */
  description: string
}

/** Inline keyframes for subtle border glow on hover */
const glowCSS = `
@keyframes card-glow {
  0%, 100% { border-color: var(--color-border); }
  50%      { border-color: var(--color-strudel-dim); }
}
`

/** Feature highlight card with icon circle and hover effects */
export function FeatureCard({ icon, accentColor, title, description }: FeatureCardProps) {
  return (
    <>
      <style>{glowCSS}</style>
      <article
        className="p-6 rounded-lg"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          transition: 'var(--transition-base)',
          cursor: 'default',
        }}
        /* Scale + glow on hover via CSS class */
        onMouseEnter={(e) => {
          const el = e.currentTarget
          el.style.transform = 'scale(1.03)'
          el.style.borderColor = accentColor ?? 'var(--color-strudel)'
          el.style.boxShadow = `0 0 20px ${accentColor ?? 'var(--color-strudel)'}33`
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget
          el.style.transform = 'scale(1)'
          el.style.borderColor = 'var(--color-border)'
          el.style.boxShadow = 'none'
        }}
      >
        {/* Icon in colored circle */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: `${accentColor ?? 'var(--color-primary)'}1a`,
            color: accentColor ?? 'var(--color-primary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {icon}
        </div>

        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {description}
        </p>
      </article>
    </>
  )
}
