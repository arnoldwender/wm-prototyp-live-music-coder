/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   SiteFooter — shared semantic footer across Landing, Samples,
   Examples, Sessions, Docs, Blog, Changelog, and Legal pages.
   Guarantees 1-click access to Impressum (/legal), Datenschutz
   (/datenschutz), AGPL-3.0 source repository, and EU AI Act
   Art. 50 session disclosure in all 3 locales.
   ────────────────────────────────────────────────────────── */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface SiteFooterProps {
  /** Show the Strudel / Tone.js / Web Audio engine legend row (used on Landing) */
  showPoweredBy?: boolean
}

function EngineDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 'var(--space-3)',
        height: 'var(--space-3)',
        borderRadius: 'var(--radius-full)',
        backgroundColor: color,
      }}
    />
  )
}

export function SiteFooter({ showPoweredBy = false }: SiteFooterProps) {
  const { t } = useTranslation()

  return (
    <footer
      className="text-center py-12 px-4"
      style={{
        color: 'var(--color-text-muted)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {showPoweredBy && (
        <p
          className="flex flex-wrap items-center justify-center gap-3 mb-4"
          style={{
            fontSize: 'var(--font-size-xs)',
            letterSpacing: 'var(--letter-spacing-legend)',
          }}
        >
          {t('landing.poweredBy')}
          <EngineDot color="var(--color-strudel)" />
          Strudel
          <EngineDot color="var(--color-tonejs)" />
          Tone.js
          <EngineDot color="var(--color-webaudio)" />
          Web Audio
        </p>
      )}

      {/* Blog + Changelog */}
      <p
        className="flex flex-wrap items-center justify-center gap-3 mb-3"
        style={{ fontSize: 'var(--font-size-xs)' }}
      >
        <Link
          to="/blog"
          style={{
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          {t('nav.blog')}
        </Link>
        <span aria-hidden="true">|</span>
        <Link
          to="/changelog"
          style={{
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          {t('nav.changelog')}
        </Link>
      </p>

      {/* Legal links (§ 5 DDG + Art. 13 DSGVO) + AGPL-3.0 Source Code */}
      <p
        className="flex flex-wrap items-center justify-center gap-3 mb-2"
        style={{ fontSize: 'var(--font-size-xs)' }}
      >
        <Link
          to="/legal"
          style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
        >
          {t('legal.impressum')}
        </Link>
        <span aria-hidden="true">|</span>
        <Link
          to="/datenschutz"
          style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
        >
          {t('legal.datenschutz')}
        </Link>
        <span aria-hidden="true">|</span>
        <a
          href="https://github.com/arnoldwender/wm-prototyp-live-music-coder"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
        >
          GitHub
        </a>
      </p>

      <p style={{ fontSize: 'var(--font-size-xs)', margin: '0 0 var(--space-1)' }}>
        {t('footer.license')}
      </p>

      {/* KI-Kennzeichnung — EU AI Act Art. 50 */}
      <p
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          margin: 0,
        }}
      >
        {t('footer.aiDisclosure')}
      </p>

      <p
        className="flex flex-wrap items-center justify-center gap-2 mt-3"
        style={{ fontSize: 'var(--font-size-xs)' }}
      >
        <a
          href="https://arnoldwender.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
        >
          Arnold Wender
        </a>
        <span aria-hidden="true" style={{ color: 'var(--color-border)' }}>
          |
        </span>
        <a
          href="https://wendermedia.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
        >
          Wender Media
        </a>
      </p>
    </footer>
  )
}

export default SiteFooter
