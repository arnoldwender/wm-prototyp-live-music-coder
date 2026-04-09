/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Individual session piece — `/sessions/:slug`.

   Integrated with the rest of the site: same top nav, same
   design tokens, same typography. Mirrors the page shell used
   by /samples and /examples. The primary action is "Open in
   Editor" which compresses the code via lz-string and routes
   into the built-in CodeMirror editor — exactly what Examples
   does.
   ────────────────────────────────────────────────────────── */

import { Link, useNavigate, useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from '../components/atoms'
import { LanguageSwitcher } from '../components/molecules'
import {
  getSessionBySlug,
  formatSessionDuration,
} from '../data/sessions-library'
import { encodeToUrl } from '../lib/persistence/url'
import { usePageMeta } from '../lib/usePageMeta'

/** Single session piece detail page. */
export default function SessionPiece() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const piece = slug ? getSessionBySlug(slug) : undefined

  usePageMeta({
    title: piece
      ? `${piece.title} — Sessions — Live Music Coder`
      : 'Sessions — Live Music Coder',
    description: piece?.shortDescription ?? '',
    path: piece ? `/sessions/${piece.slug}` : '/sessions',
  })

  /* Unknown slug → redirect to listing instead of 404, so stale
     links auto-recover to the category index. */
  if (!piece) {
    return <Navigate to="/sessions" replace />
  }

  /* Load code into the built-in editor via the same lz-string hash
     flow /examples uses. No external strudel.cc redirect. */
  const handleOpenInEditor = () => {
    const hash = encodeToUrl({
      code: piece.code,
      bpm: piece.bpm,
      engine: piece.engine,
    })
    navigate(`/editor#code=${hash}&autoplay=1`)
  }

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
      }}
    >
      {/* --- Skip-to-content --- */}
      <a
        href="#piece-main"
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

      {/* --- Shared top nav --- */}
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
        <Link
          to="/"
          style={{ textDecoration: 'none', color: 'inherit' }}
          aria-label={t('nav.backToHome')}
        >
          <Logo showTagline size="sm" />
        </Link>

        <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
          <LanguageSwitcher />
          <Link
            to="/samples"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              transition: 'var(--transition-fast)',
            }}
          >
            {t('nav.samples')}
          </Link>
          <Link
            to="/examples"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              transition: 'var(--transition-fast)',
            }}
          >
            {t('nav.examples')}
          </Link>
          <Link
            to="/sessions"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text)',
              textDecoration: 'none',
              transition: 'var(--transition-fast)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {t('nav.sessions')}
          </Link>
          <Link
            to="/docs"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              transition: 'var(--transition-fast)',
            }}
          >
            {t('nav.docs')}
          </Link>
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

      {/* --- Content --- */}
      <article
        id="piece-main"
        lang="de"
        style={{
          maxWidth: '840px',
          margin: '0 auto',
          padding: 'var(--space-10) var(--space-6) var(--space-16)',
        }}
      >
        {/* Back link */}
        <Link
          to="/sessions"
          style={{
            display: 'inline-block',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            marginBottom: 'var(--space-6)',
          }}
        >
          {t('sessions.backToList')}
        </Link>

        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-primary)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: '0 0 var(--space-2)',
          }}
        >
          Sessions
        </p>

        <h1
          style={{
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            lineHeight: 'var(--line-height-tight)',
            margin: '0 0 var(--space-3)',
          }}
        >
          {piece.title}
        </h1>

        <p
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic',
            margin: '0 0 var(--space-6)',
          }}
        >
          {piece.subtitle}
        </p>

        {/* Metadata row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-5)',
            alignItems: 'center',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            padding: 'var(--space-3) 0',
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: 'var(--space-6)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <strong style={{ color: 'var(--color-text)', fontWeight: 'var(--font-weight-medium)' }}>
              {piece.author.name}
            </strong>
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
          </span>
          <span>
            {t('sessions.bpmLabel')}:{' '}
            <strong style={{ color: 'var(--color-text)', fontWeight: 'var(--font-weight-medium)' }}>
              {piece.bpm}
            </strong>
          </span>
          <span>
            {t('sessions.durationLabel')}:{' '}
            <strong style={{ color: 'var(--color-text)', fontWeight: 'var(--font-weight-medium)' }}>
              {formatSessionDuration(piece.durationSec)}
            </strong>
          </span>
          <span>
            {t('sessions.dateLabel')}:{' '}
            <strong style={{ color: 'var(--color-text)', fontWeight: 'var(--font-weight-medium)' }}>
              {piece.date}
            </strong>
          </span>
        </div>

        {/* Short description */}
        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--line-height-loose)',
            margin: '0 0 var(--space-6)',
          }}
        >
          {piece.shortDescription}
        </p>

        {/* Primary action — open in built-in editor */}
        <button
          type="button"
          onClick={handleOpenInEditor}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-5)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-bg)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-bold)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
            marginBottom: 'var(--space-10)',
          }}
        >
          ▸ {t('sessions.openInEditor')}
        </button>

        {/* Strudel source code */}
        <h2
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            margin: '0 0 var(--space-3)',
          }}
        >
          {t('sessions.code')}
        </h2>
        <pre
          style={{
            backgroundColor: 'var(--color-bg-alt)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-5)',
            overflowX: 'auto',
            fontFamily: 'var(--font-family-mono)',
            fontSize: 'var(--font-size-xs)',
            lineHeight: 'var(--line-height-base)',
            color: 'var(--color-text)',
            margin: '0 0 var(--space-10)',
            whiteSpace: 'pre',
          }}
        >
          <code>{piece.code}</code>
        </pre>

        {/* Movements breakdown */}
        {piece.movements && piece.movements.length > 0 && (
          <>
            <h2
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                margin: '0 0 var(--space-3)',
              }}
            >
              {t('sessions.movementsHeading')}
            </h2>
            <ol
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 var(--space-10)',
                borderLeft: '1px solid var(--color-border)',
              }}
            >
              {piece.movements.map((mv) => (
                <li
                  key={mv.roman}
                  style={{
                    padding: 'var(--space-3) 0 var(--space-3) var(--space-5)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <span
                    style={{
                      color: 'var(--color-primary)',
                      fontSize: 'var(--font-size-sm)',
                      letterSpacing: '0.08em',
                      marginRight: 'var(--space-2)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    {mv.roman}.
                  </span>
                  <span
                    style={{
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text)',
                    }}
                  >
                    {mv.name}
                  </span>
                  <div
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)',
                      fontStyle: 'italic',
                      marginTop: '2px',
                      marginLeft: '0',
                    }}
                  >
                    {mv.key}
                    {typeof mv.bars === 'number' && ` — ${mv.bars} Zyklen`}
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}

        {/* Composer notes */}
        <h2
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            margin: '0 0 var(--space-3)',
          }}
        >
          {t('sessions.composerNotesHeading')}
        </h2>
        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--line-height-loose)',
            margin: '0 0 var(--space-10)',
          }}
        >
          {piece.composerNotes}
        </p>

        {/* Footer attribution */}
        {piece.author.kind === 'ai' && piece.author.model && (
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              borderTop: '1px solid var(--color-border)',
              paddingTop: 'var(--space-5)',
              margin: 0,
            }}
          >
            {t('sessions.composedBy')} {piece.author.name} ({piece.author.model})
            {piece.author.curator && (
              <>
                {' '}· {t('sessions.curatedBy')} {piece.author.curator}
              </>
            )}
          </p>
        )}
      </article>
    </main>
  )
}
