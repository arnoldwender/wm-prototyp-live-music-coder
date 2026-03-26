/* ──────────────────────────────────────────────────────────
   Editor page — assembles the IDE shell with EditorLayout.
   On mount: loads shared code from URL hash, checks streak,
   initializes session stats. Shows template selector for
   first-time visitors. Renders achievement toast overlay.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import EditorLayout from '../layouts/EditorLayout'
import { TransportBar, StatusBar, CodeEditor, NodeGraph, VisualizerDashboard, TemplateSelector, TutorialOverlay } from '../components/organisms'
import { SidePanel } from '../components/organisms/SidePanel'
import { AchievementToast } from '../components/molecules'
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
  const checkStreak = useAppStore((s) => s.checkStreak)

  /* Per-page SEO meta tags */
  usePageMeta({
    title: 'Editor — Live Music Coder',
    description: 'Live coding music editor with 4 audio engines, visual node graph, real-time waveform and spectrum visualizers.',
    path: '/editor',
  })

  /* On mount: check streak, load shared code, or show template selector */
  useEffect(() => {
    /* Check and update daily streak */
    checkStreak()

    /* Check night_owl achievement — coding after midnight (0:00 - 4:59) */
    const hour = new Date().getHours()
    if (hour >= 0 && hour < 5) {
      useAppStore.getState().unlockAchievement('night_owl')
    }

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

  /* Stop all audio when leaving the editor page + show session summary */
  useEffect(() => {
    return () => {
      const orch = getOrchestrator()
      orch.stop()
      /* Reset store play state so TransportBar is correct on re-entry */
      useAppStore.getState().stop()

      /* Show session summary toast if session was > 60 seconds */
      const stats = useAppStore.getState().sessionStats
      const elapsed = Math.floor((Date.now() - stats.startTime) / 1000)
      if (elapsed > 60) {
        const minutes = Math.floor(elapsed / 60)
        useAppStore.getState().showToast({
          icon: '\uD83D\uDCCA',
          title: t('gamification.sessionSummary'),
          description: t('gamification.sessionDetails', {
            minutes,
            evaluations: stats.evaluations,
            creatures: stats.creaturesSpawned,
          }),
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        sidePanel={<SidePanel />}
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

      {/* Achievement toast overlay — renders above everything */}
      <AchievementToast />
    </>
  )
}

export default Editor
