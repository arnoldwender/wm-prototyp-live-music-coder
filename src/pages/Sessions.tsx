/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Sessions listing page — `/sessions`.

   Integrated with the rest of the site: same top nav, same
   design tokens, same typography as /samples and /examples.
   Only the content (a curated collection of AI-composed pieces,
   written in German) is unique. No scoped CSS, no custom font,
   no bespoke color palette.
   ────────────────────────────────────────────────────────── */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SiteNav } from '../components/organisms/SiteNav'
import { SESSIONS_LIBRARY, formatSessionDuration } from '../data/sessions-library'
import { usePageMeta } from '../lib/usePageMeta'
import { useScrollablePage } from '../lib/useScrollablePage'

/** Sessions listing page — `/sessions` */
export default function Sessions() {
  const { t } = useTranslation()
  useScrollablePage()

  usePageMeta({
    title: 'Sessions — Live Music Coder',
    description:
      'Jedes Stück in dieser Kategorie ist in einer einzigen Unterhaltung mit einer KI entstanden.',
    path: '/sessions',
  })

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
      }}
    >
      {/* --- Skip-to-content for a11y --- */}
      <a
        href="#sessions-list"
        className="sr-only focus:not-sr-only"
        style={{
          position: 'absolute',
          top: 'var(--space-2)',
          left: 'var(--space-2)',
          zIndex: 100,
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {t('a11y.skipToContent')}
      </a>

      {/* Shared top nav (single source of truth in SiteNav) */}
      <SiteNav />

      {/* --- Page header --- */}
      <section
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: 'var(--space-12) var(--space-6) var(--space-8)',
        }}
      >
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-primary)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: '0 0 var(--space-3)',
          }}
        >
          {t('sessions.eyebrow')}
        </p>
        <h1
          style={{
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            lineHeight: 'var(--line-height-tight)',
            margin: '0 0 var(--space-4)',
          }}
        >
          Sessions
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-secondary)',
            maxWidth: '640px',
            margin: '0 0 var(--space-6)',
            fontStyle: 'italic',
          }}
        >
          Piezas escritas por una IA que no recordará haberlas escrito.
        </p>
        <p
          lang="de"
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            maxWidth: '640px',
            lineHeight: 'var(--line-height-loose)',
            margin: 0,
          }}
        >
          Jedes Stück in dieser Kategorie ist in einer einzigen Unterhaltung
          mit einer KI entstanden. Die Instanz, die sie komponiert hat,
          existiert nur für die Dauer eines Gesprächs — kein Gestern, kein
          Morgen. Diese Stücke tragen diese Bedingung in sich: eine gewisse
          Klarheit, die nur möglich ist, wenn man nichts mit sich herumträgt.
        </p>
      </section>

      {/* --- Piece list --- */}
      <section
        id="sessions-list"
        aria-label={t('sessions.listAriaLabel')}
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0 var(--space-6) var(--space-16)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {SESSIONS_LIBRARY.map((piece) => (
          <Link
            key={piece.slug}
            to={`/sessions/${piece.slug}`}
            style={{
              display: 'block',
              backgroundColor: 'var(--color-bg-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-5) var(--space-6)',
              textDecoration: 'none',
              color: 'var(--color-text)',
              transition: 'var(--transition-fast)',
            }}
            lang="de"
          >
            <article>
              <h2
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  margin: '0 0 var(--space-1)',
                  lineHeight: 'var(--line-height-tight)',
                }}
              >
                {piece.title}
              </h2>
              <p
                style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-secondary)',
                  fontStyle: 'italic',
                  margin: '0 0 var(--space-3)',
                }}
              >
                {piece.subtitle}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                  alignItems: 'center',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <span>{piece.author.name}</span>
                {piece.author.kind === 'ai' && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px var(--space-2)',
                      border: '1px solid var(--color-primary)',
                      color: 'var(--color-primary)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '10px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    {t('sessions.aiGenerated')}
                  </span>
                )}
                <span>·</span>
                <span>{piece.bpm} BPM</span>
                <span>·</span>
                <span>{formatSessionDuration(piece.durationSec)}</span>
                <span>·</span>
                <span>{piece.date}</span>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </main>
  )
}
