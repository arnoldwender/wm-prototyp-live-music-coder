/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   SiteNav — the single source of truth for the top navigation
   shown on Landing, Samples, Examples, Sessions, SessionPiece,
   and any future marketing / browse page.

   Previously each page inlined its own copy of this markup,
   which meant adding a new nav item (e.g. /sessions) left the
   link missing on every page that had not been touched — the
   exact bug that caused "Sessions disappears when I click
   Samples or Examples".

   The active route is highlighted automatically via
   useLocation() — no prop drilling needed. A single source
   array (`NAV_ITEMS`) drives both the DOM order and the
   highlight logic, so adding another link is a one-line edit.
   ────────────────────────────────────────────────────────── */

import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from '../atoms'
import { LanguageSwitcher } from '../molecules'

/** Navigation entries in the order they should appear.
 *  `i18nKey` is the key under the `nav.*` namespace.
 *  `italic` flags links that should be visually de-emphasised
 *  (used for /sessions to signal it's a distinct kind of page). */
const NAV_ITEMS: {
  to: string
  i18nKey: string
  italic?: boolean
}[] = [
  { to: '/samples', i18nKey: 'nav.samples' },
  { to: '/examples', i18nKey: 'nav.examples' },
  { to: '/sessions', i18nKey: 'nav.sessions', italic: true },
  { to: '/docs', i18nKey: 'nav.docs' },
  { to: '/blog', i18nKey: 'nav.blog' },
  { to: '/changelog', i18nKey: 'nav.changelog' },
]

/** Determine whether a nav entry matches the current path.
 *  Uses startsWith so /sessions/:slug highlights Sessions. */
function isActivePath(current: string, target: string): boolean {
  if (target === '/') return current === '/'
  return current === target || current.startsWith(target + '/')
}

export function SiteNav() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <nav
      aria-label="Main navigation"
      className="flex items-center justify-between"
      style={{
        height: '64px',
        padding: '0 var(--space-6)',
        backgroundColor: 'var(--color-bg-alt)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Left: Logo linked to home */}
      <Link
        to="/"
        style={{ textDecoration: 'none', color: 'inherit' }}
        aria-label={t('nav.backToHome')}
      >
        <Logo showTagline size="sm" />
      </Link>

      {/* Right: language switcher + nav links + primary CTA */}
      <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
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
    </nav>
  )
}

export default SiteNav
