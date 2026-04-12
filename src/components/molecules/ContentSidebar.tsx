/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   ContentSidebar — shared left navigation sidebar for all
   content pages: Samples, Examples, Sessions, Docs.

   Design DNA taken from Docs.tsx as the golden reference:
   - 240px wide, sticky at top:64px, height: 100vh - 64px
   - Section headers: xs/bold/uppercase/muted
   - Links: sm text, primary color + bg-elevated when active
   - Hidden on < lg (mobile uses horizontal filter pills instead)

   Usage:
     <ContentSidebar>
       ...page-specific filter groups (SidebarSection + SidebarFilterItem)...
     </ContentSidebar>
   ────────────────────────────────────────────────────────── */

import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'

/* ── Shared style constants — match Docs.tsx sidebar DNA ── */

const SECTION_TITLE_STYLE: React.CSSProperties = {
  fontSize: 'var(--font-size-xs)',
  fontWeight: 'var(--font-weight-bold)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--color-text-muted)',
  margin: 0,
  marginBottom: 'var(--space-3)',
}

/** Nav entries shown in every content page sidebar */
const BROWSE_ITEMS: { to: string; i18nKey: string }[] = [
  { to: '/samples', i18nKey: 'nav.samples' },
  { to: '/examples', i18nKey: 'nav.examples' },
  { to: '/sessions', i18nKey: 'nav.sessions' },
  { to: '/docs', i18nKey: 'nav.docs' },
]

function isActivePath(current: string, target: string): boolean {
  return current === target || current.startsWith(target + '/')
}

/* ── SidebarSection ────────────────────────────────────── */

interface SidebarSectionProps {
  title: string
  children: ReactNode
}

/** A titled group of sidebar filter/nav items */
export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <h3 style={SECTION_TITLE_STYLE}>{title}</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{children}</ul>
    </div>
  )
}

/* ── SidebarFilterItem ─────────────────────────────────── */

interface SidebarFilterItemProps {
  active: boolean
  count?: number
  onClick: () => void
  children: ReactNode
}

/** A single clickable filter row in a SidebarSection */
export function SidebarFilterItem({ active, count, onClick, children }: SidebarFilterItemProps) {
  return (
    <li style={{ marginBottom: 'var(--space-1)' }}>
      <button
        type="button"
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: active ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
          color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
          backgroundColor: active ? 'var(--color-bg-elevated)' : 'transparent',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'var(--transition-fast)',
        }}
      >
        <span>{children}</span>
        {count !== undefined && (
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {count}
          </span>
        )}
      </button>
    </li>
  )
}

/* ── ContentSidebar ────────────────────────────────────── */

interface ContentSidebarProps {
  /** Page-specific filter groups — rendered below the Browse nav */
  children?: ReactNode
}

/**
 * Shared sticky sidebar for Samples, Examples, Sessions, and Docs.
 * Shows a "Browse" cross-page navigation section, then any
 * page-specific filter groups passed as children.
 * Hidden on mobile (< lg) — horizontal filter pills handle mobile UX.
 */
export function ContentSidebar({ children }: ContentSidebarProps) {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <aside
      className="hidden lg:block"
      aria-label={t('sidebar.ariaLabel')}
      style={{
        width: '240px',
        flexShrink: 0,
        borderRight: '1px solid var(--color-border)',
        padding: 'var(--space-8) var(--space-6)',
        position: 'sticky',
        top: '64px',
        height: 'calc(100vh - 64px)',
        overflowY: 'auto',
      }}
    >
      {/* Browse — cross-page navigation */}
      <h2 style={{ ...SECTION_TITLE_STYLE, marginBottom: 'var(--space-4)' }}>
        {t('sidebar.browse')}
      </h2>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {BROWSE_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.to)
          return (
            <li key={item.to} style={{ marginBottom: 'var(--space-1)' }}>
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'block',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  backgroundColor: active ? 'var(--color-bg-elevated)' : 'transparent',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'var(--transition-fast)',
                }}
              >
                {t(item.i18nKey)}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Page-specific filter groups */}
      {children && (
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            marginTop: 'var(--space-6)',
            paddingTop: 'var(--space-6)',
          }}
        >
          {children}
        </div>
      )}
    </aside>
  )
}

export default ContentSidebar
