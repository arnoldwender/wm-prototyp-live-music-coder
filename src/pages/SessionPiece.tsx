/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Individual session piece — `/sessions/:slug`.
   Renders title, subtitle, author badge, metadata row,
   Strudel source code block, composer notes, and a
   movement breakdown. The primary action is "Open in
   Editor", which compresses the code via lz-string and
   navigates into the built-in CodeMirror editor at
   `/editor#code=<hash>` — the same flow Examples uses.
   ────────────────────────────────────────────────────────── */

import { useEffect } from 'react'
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  getSessionBySlug,
  formatSessionDuration,
} from '../data/sessions-library'
import { encodeToUrl } from '../lib/persistence/url'
import { usePageMeta } from '../lib/usePageMeta'
import '../styles/sessions.css'

/** Single session piece detail page. */
export default function SessionPiece() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const piece = slug ? getSessionBySlug(slug) : undefined

  /* Pin document lang to German while viewing — content is German */
  useEffect(() => {
    if (!piece) return
    const previous = document.documentElement.lang
    document.documentElement.lang = 'de'
    return () => {
      document.documentElement.lang = previous
    }
  }, [piece])

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

  /* Load code into the built-in editor. Mirrors the pattern used
     by Examples.tsx to keep the editor handoff consistent. */
  const handleOpenInEditor = () => {
    const hash = encodeToUrl({
      code: piece.code,
      bpm: piece.bpm,
      engine: piece.engine,
    })
    navigate(`/editor#code=${hash}&autoplay=1`)
  }

  return (
    <div className="sessions-scope">
      <main className="sessions-container">
        <Link to="/sessions" className="sessions-back">
          {t('sessions.backToList')}
        </Link>

        <p className="sessions-eyebrow">Sessions</p>
        <h1>{piece.title}</h1>
        <p className="sessions-subtitle">{piece.subtitle}</p>

        <div className="sessions-meta">
          <span>
            <strong>{piece.author.name}</strong>
            {piece.author.kind === 'ai' && (
              <span className="sessions-badge" style={{ marginLeft: '0.6rem' }}>
                {t('sessions.aiGenerated')}
              </span>
            )}
          </span>
          <span>
            {t('sessions.bpmLabel')}: <strong>{piece.bpm}</strong>
          </span>
          <span>
            {t('sessions.durationLabel')}:{' '}
            <strong>{formatSessionDuration(piece.durationSec)}</strong>
          </span>
          <span>
            {t('sessions.dateLabel')}: <strong>{piece.date}</strong>
          </span>
        </div>

        <p>{piece.shortDescription}</p>

        <button
          type="button"
          className="sessions-button"
          onClick={handleOpenInEditor}
        >
          ▸ {t('sessions.openInEditor')}
        </button>

        <h2>{t('sessions.code')}</h2>
        <pre className="sessions-code">
          <code>{piece.code}</code>
        </pre>

        {piece.movements && piece.movements.length > 0 && (
          <>
            <h2>{t('sessions.movementsHeading')}</h2>
            <ol className="sessions-movements">
              {piece.movements.map((mv) => (
                <li key={mv.roman}>
                  <span className="movement-roman">{mv.roman}.</span>
                  <span className="movement-name">{mv.name}</span>
                  <span className="movement-key">
                    {mv.key}
                    {typeof mv.bars === 'number' && ` — ${mv.bars} Zyklen`}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}

        <h2>{t('sessions.composerNotesHeading')}</h2>
        <p>{piece.composerNotes}</p>

        <hr className="sessions-divider" />

        <p style={{ color: 'var(--sessions-text-dim)', fontSize: '0.8125rem' }}>
          {piece.author.kind === 'ai' && piece.author.model && (
            <>
              {t('sessions.composedBy')} {piece.author.name} ({piece.author.model})
              {piece.author.curator && (
                <>
                  {' '}
                  · {t('sessions.curatedBy')} {piece.author.curator}
                </>
              )}
            </>
          )}
        </p>
      </main>
    </div>
  )
}
