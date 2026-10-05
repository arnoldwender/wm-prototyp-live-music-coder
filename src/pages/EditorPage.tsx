/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   /editor route — a light wrapper around the IDE.

   The IDE (src/pages/Editor.tsx) pulls in the audio engines,
   CodeMirror and React Flow, which cannot run in the build's
   Node prerender. So while the build prerenders this route and
   while the browser hydrates that HTML, the route renders a
   static placeholder that carries the page's <h1> and says what
   the editor does — the text crawlers without JavaScript read.
   Right after hydration useIsClient flips and the IDE mounts;
   until its chunk has loaded, the same placeholder stays up.
   ────────────────────────────────────────────────────────── */

import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useIsClient } from '../lib/useIsClient'
import { usePageMeta } from '../lib/usePageMeta'
import { loadEditor } from '../routes'

const Editor = lazy(loadEditor)

/** What the route shows before the IDE is running */
function EditorPlaceholder() {
  const { t } = useTranslation()

  return (
    <main
      id="main-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'var(--space-8)',
        textAlign: 'center',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
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
