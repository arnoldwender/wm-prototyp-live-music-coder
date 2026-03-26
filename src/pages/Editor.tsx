/* ──────────────────────────────────────────────────────────
   Editor page — assembles the IDE shell with EditorLayout.
   On mount: loads shared code from URL hash, or shows the
   template selector for first-time visitors.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import EditorLayout from '../layouts/EditorLayout'
import { TransportBar, StatusBar, CodeEditor, NodeGraph, VisualizerDashboard, TemplateSelector, TutorialOverlay } from '../components/organisms'
import { readShareFromUrl } from '../lib/persistence/url'
import { useAppStore } from '../lib/store'
import { getOrchestrator } from '../lib/orchestrator'
import { usePageMeta } from '../lib/usePageMeta'

function Editor() {
  const { t } = useTranslation()
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showSharedWarning, setShowSharedWarning] = useState(false)

  const files = useAppStore((s) => s.files)
  const updateFileCode = useAppStore((s) => s.updateFileCode)
  const setBpm = useAppStore((s) => s.setBpm)
  const setDefaultEngine = useAppStore((s) => s.setDefaultEngine)

  /* Per-page SEO meta tags */
  usePageMeta({
    title: 'Editor — Live Music Coder',
    description: 'Live coding music editor with 4 audio engines, visual node graph, real-time waveform and spectrum visualizers.',
    path: '/editor',
  })

  /* On mount: check URL hash for shared code, or show template selector */
  useEffect(() => {
    const shared = readShareFromUrl()
    if (shared) {
      /* URL hash contains shared code — load it into the active file */
      const activeFile = files.find((f) => f.active)
      if (activeFile) {
        updateFileCode(activeFile.id, shared.code)
      }
      setBpm(shared.bpm)
      setDefaultEngine(shared.engine)
      /* Show security warning — code was loaded from an external URL */
      setShowSharedWarning(true)
    } else if (!localStorage.getItem('lmc-onboarded')) {
      /* First visit — show the template selector */
      setShowTemplateSelector(true)
    } else if (!localStorage.getItem('lmc-tutorial-done')) {
      /* Onboarded but tutorial not completed — show tutorial overlay */
      setShowTutorial(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Stop all audio when leaving the editor page */
  useEffect(() => {
    return () => {
      const orch = getOrchestrator()
      orch.stop()
      /* Reset store play state so TransportBar is correct on re-entry */
      useAppStore.getState().stop()
    }
  }, [])

  const dismissWarning = useCallback(() => setShowSharedWarning(false), [])

  return (
    <>
      {/* Security warning when code was loaded from a shared URL */}
      {showSharedWarning && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'var(--color-warning)',
            color: 'var(--color-bg)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          <span style={{ flex: 1 }}>{t('editor.sharedCodeWarning')}</span>
          <button
            type="button"
            onClick={dismissWarning}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: 'var(--font-size-base)',
              lineHeight: 1,
              padding: 'var(--space-1)',
            }}
            aria-label={t('editor.dismiss')}
          >
            &times;
          </button>
        </div>
      )}
      <EditorLayout
        toolbar={<TransportBar />}
        editor={<CodeEditor />}
        graph={<NodeGraph />}
        visualizers={<VisualizerDashboard />}
        statusBar={<StatusBar />}
      />
      {showTemplateSelector && (
        <TemplateSelector onSelect={() => {
          setShowTemplateSelector(false)
          /* After template selection, show tutorial if not already done */
          if (!localStorage.getItem('lmc-tutorial-done')) {
            setShowTutorial(true)
          }
        }} />
      )}
      {showTutorial && (
        <TutorialOverlay onComplete={() => setShowTutorial(false)} />
      )}
    </>
  )
}

export default Editor
