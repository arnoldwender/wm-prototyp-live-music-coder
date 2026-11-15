/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   /editor route — a light wrapper around the IDE.

   The IDE (src/pages/Editor.tsx) pulls in the audio engines,
   CodeMirror and React Flow, which cannot run in the build's
   Node prerender. So while the build prerenders this route and
   while the browser hydrates that HTML, the route renders a
   static placeholder that carries the page's <h1>, says what
   the editor does, and keeps 1-click legal links (§ 5 DDG /
   Art. 13 DSGVO) reachable even without JavaScript.
   Right after hydration useIsClient flips and the IDE mounts;
   until its chunk has loaded, the same placeholder stays up.
   ────────────────────────────────────────────────────────── */

import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useIsClient } from '../lib/useIsClient'
import { usePageMeta } from '../lib/usePageMeta'
import { loadEditor } from '../routes'

const Editor = lazy(loadEditor)

/** What the route shows before the IDE is running */
function EditorPlaceholder() {
  const { t } = useTranslation()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
      }}
    >
      <main
        id="main-content"
        tabIndex={-1}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-8)',
          textAlign: 'center',
          gap: 'var(--space-4)',
        }}
      >
        <h1
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            lineHeight: 'var(--line-height-tight)',
            margin: 0,
          }}
        >
          {t('editor.placeholderTitle')}
        </h1>
        <p
          style={{
            maxWidth: '640px',
            margin: 0,
            fontSize: 'var(--font-size-base)',
            lineHeight: 'var(--line-height-loose)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {t('editor.placeholderText')}
        </p>
        <p
          role="status"
          aria-live="polite"
          style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}
        >
          {t('editor.loading')}
        </p>
      </main>

      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <Link to="/legal" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
          {t('legal.impressum')}
        </Link>
        <span aria-hidden="true">|</span>
        <Link to="/datenschutz" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
          {t('legal.datenschutz')}
        </Link>
      </footer>
    </div>
  )
}

export default function EditorPage() {
  const isClient = useIsClient()

  /* Per-page SEO meta tags — here and not in the IDE, so the prerender gets them */
  usePageMeta({
    title: 'Editor — Live Music Coder',
    description: 'Live coding music editor with 4 audio engines, visual node graph, real-time waveform and spectrum visualizers.',
    path: '/editor',
  })

  /* Server render and hydration pass: the static placeholder only */
  if (!isClient) return <EditorPlaceholder />

  return (
    <Suspense fallback={<EditorPlaceholder />}>
      <Editor />
    </Suspense>
  )
}
