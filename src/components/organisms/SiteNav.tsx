/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   SiteNav — the single source of truth for the top navigation
   shown on Landing, Samples, Examples, Sessions, SessionPiece,
   Docs, Blog, Changelog, and Legal pages.

   Responsive for WCAG 1.4.10 Reflow (320 CSS px):
   - ≥ 768px (md): horizontal inline links + Open Editor CTA
   - < 768px: LanguageSwitcher + 44×44px accessible menu button
     opening a collapsible navigation panel.
   ────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import { Logo } from '../atoms'
import { LanguageSwitcher } from '../molecules'

/** Navigation entries in the order they should appear. */
const NAV_ITEMS: {
  to: string
  i18nKey: string
  italic?: boolean
}[] = [
  { to: '/samples', i18nKey: 'nav.samples' },
  { to: '/examples', i18nKey: 'nav.examples' },
  { to: '/sessions', i18nKey: 'nav.sessions', italic: true },
  { to: '/docs', i18nKey: 'nav.docs' },
]

/** Determine whether a nav entry matches the current path.
 *  Uses startsWith so /sessions/:slug highlights Sessions and
 *  /docs/:sectionId highlights Documentation. */
function isActivePath(current: string, target: string): boolean {
  if (target === '/') return current === '/'
  return current === target || current.startsWith(target + '/')
}

export function SiteNav() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  /* Keyed to pathname so route transitions close the mobile menu automatically
     without needing a setState-in-effect. */
  const [openForPath, setOpenForPath] = useState<string | null>(null)
  const menuOpen = openForPath === pathname

  return (
    <nav
      aria-label={t('nav.mainAriaLabel')}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && menuOpen) {
          setOpenForPath(null)
        }
      }}
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 md:px-6"
        style={{ minHeight: 'var(--size-nav)' }}
      >
        {/* Left: Logo linked to home */}
        <Link
          to="/"
          style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}
          aria-label={t('nav.backToHome')}
        >
          <Logo size="sm" />
        </Link>

        {/* Desktop (≥ 768px): language switcher + nav links + primary CTA */}
        <div
          className="hidden md:flex items-center"
          style={{ gap: 'var(--space-4)' }}
        >
          <LanguageSwitcher />

          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: active
                    ? 'var(--color-text)'
                    : 'var(--color-text-secondary)',
                  fontWeight: active
                    ? 'var(--font-weight-medium)'
                    : 'var(--font-weight-normal)',
                  fontStyle: item.italic ? 'italic' : 'normal',
                  textDecoration: 'none',
                  transition: 'var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
              >
                {t(item.i18nKey)}
              </Link>
            )
          })}

          <Link
            to="/editor"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-bg)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-bold)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-fast)',
            }}
          >
            {t('nav.openEditor')}
          </Link>
        </div>

        {/* Mobile (< 768px): language switcher + 44×44px menu toggle */}
        <div
          className="flex md:hidden items-center"
          style={{ gap: 'var(--space-2)' }}
        >
          <LanguageSwitcher />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-site-nav"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            onClick={() =>
              setOpenForPath((prev) => (prev === pathname ? null : pathname))
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 'var(--size-touch)',
              minHeight: 'var(--size-touch)',
              padding: 'var(--space-2)',
              backgroundColor: 'transparent',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Collapsible mobile menu (< 768px) */}
      {menuOpen && (
        <div
          id="mobile-site-nav"
          className="flex md:hidden flex-col px-4 pb-4"
          style={{
            gap: 'var(--space-2)',
            borderTop: '1px solid var(--color-border)',
            paddingTop: 'var(--space-3)',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpenForPath(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 'var(--size-touch)',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--font-size-sm)',
                  color: active
                    ? 'var(--color-primary)'
                    : 'var(--color-text-secondary)',
                  backgroundColor: active
                    ? 'var(--color-bg-elevated)'
                    : 'transparent',
                  fontWeight: active
                    ? 'var(--font-weight-semibold)'
                    : 'var(--font-weight-normal)',
                  fontStyle: item.italic ? 'italic' : 'normal',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                }}
              >
                {t(item.i18nKey)}
              </Link>
            )
          })}

          <Link
            to="/editor"
            onClick={() => setOpenForPath(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'var(--size-touch)',
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-bg)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-bold)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
            }}
          >
            {t('nav.openEditor')}
          </Link>
        </div>
      )}
    </nav>
  )
}

export default SiteNav
