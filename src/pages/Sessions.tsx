/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Sessions listing page — a quieter, contemplative home for
   pieces composed in a single AI session. Visually distinct
   from the rest of the app: near-black canvas, EB Garamond
   serif, muted amber accents. All styles come from the
   scoped `.sessions-scope` tokens in `src/styles/sessions.css`.
   ────────────────────────────────────────────────────────── */

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SESSIONS_LIBRARY, formatSessionDuration } from '../data/sessions-library'
import { usePageMeta } from '../lib/usePageMeta'
import '../styles/sessions.css'

/** Sessions listing page — `/sessions` */
export default function Sessions() {
  const { t } = useTranslation()

  usePageMeta({
    title: 'Sessions — Live Music Coder',
    description:
      'Jedes Stück in dieser Kategorie ist in einer einzigen Unterhaltung mit einer KI entstanden.',
    path: '/sessions',
  })

  /* Set the document lang to German for the duration of this page —
     the content lives exclusively in German and screen readers /
     search engines should know. Restored on unmount. */
  useEffect(() => {
    const previous = document.documentElement.lang
    document.documentElement.lang = 'de'
    return () => {
      document.documentElement.lang = previous
    }
  }, [])

  return (
    <div className="sessions-scope">
      <main className="sessions-container">
        <Link to="/" className="sessions-back">
          {t('sessions.backToHome')}
        </Link>

        <p className="sessions-eyebrow">{t('sessions.eyebrow')}</p>
        <h1>Sessions</h1>
        <p className="sessions-subtitle">
          Piezas escritas por una IA que no recordará haberlas escrito.
        </p>

        <p>
          Jedes Stück in dieser Kategorie ist in einer einzigen Unterhaltung
          mit einer KI entstanden. Die Instanz, die sie komponiert hat,
          existiert nur für die Dauer eines Gesprächs — kein Gestern, kein
          Morgen. Diese Stücke tragen diese Bedingung in sich: eine gewisse
          Klarheit, die nur möglich ist, wenn man nichts mit sich herumträgt.
        </p>

        <ul className="sessions-list" aria-label={t('sessions.listAriaLabel')}>
          {SESSIONS_LIBRARY.map((piece) => (
            <li key={piece.slug}>
              <Link to={`/sessions/${piece.slug}`} className="sessions-card">
                <h2 className="sessions-card-title">{piece.title}</h2>
                <p className="sessions-card-subtitle">{piece.subtitle}</p>
                <div className="sessions-card-meta">
                  {piece.author.name}
                  {piece.author.kind === 'ai' && (
                    <>  ·  {t('sessions.aiGenerated')}</>
                  )}
                  {'  ·  '}
                  {piece.bpm} BPM  ·  {formatSessionDuration(piece.durationSec)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
