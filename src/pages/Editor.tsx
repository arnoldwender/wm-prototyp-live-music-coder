/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Editor page — assembles the IDE shell with EditorLayout.
   On mount: loads shared code from URL hash, checks streak,
   initializes session stats. Shows template selector for
   first-time visitors. Renders achievement toast overlay.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import EditorLayout from '../layouts/EditorLayout'
import { TransportBar, StatusBar, CodeEditor, NodeGraph, VisualizerDashboard, TemplateSelector, TutorialOverlay, ActivityBar, DetailPanel } from '../components/organisms'
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

    const shared = readShareFromUrl()
    if (shared) {
      const activeFile = files.find((f) => f.active)
      if (activeFile) {
        updateFileCode(activeFile.id, shared.code)
        if (activeFile.engine !== shared.engine) {
          useAppStore.getState().setFileEngine(activeFile.id, shared.engine)
        }
      }
      setBpm(shared.bpm)
      setDefaultEngine(shared.engine)

      /* Check if this is an internal autoplay (from landing page examples) */
      const isAutoplay = window.location.hash.includes('autoplay=1')
      if (!isAutoplay) {
        setShowSharedWarning(true)
      }
      /* Clean the hash after reading */
      window.location.hash = ''
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
          }),
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dismissWarning = useCallback(() => setShowSharedWarning(false), [])

  return (
    <>
      {/* Security warning modal when code was loaded from a shared URL */}
      {showSharedWarning && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            padding: 'var(--space-4)',
          }}
        >
          <div
            role="alertdialog"
            aria-label={t('editor.sharedCodeWarning')}
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-warning)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-6)',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: 'var(--space-3)' }}>&#9888;</div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-4)',
              lineHeight: 'var(--line-height-base)',
            }}>
              {t('editor.sharedCodeWarning')}
            </div>
            <button
              type="button"
              onClick={dismissWarning}
              style={{
                backgroundColor: 'var(--color-warning)',
                color: 'var(--color-bg)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-6)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-bold)',
                cursor: 'pointer',
              }}
            >
              {t('editor.dismiss')}
            </button>
          </div>
        </div>
      )}
      <EditorLayout
        toolbar={<TransportBar />}
        activityBar={<ActivityBar />}
        editor={<CodeEditor />}
        graph={<NodeGraph />}
        visualizers={<VisualizerDashboard />}
        detailPanel={<DetailPanel />}
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

      {/* Achievement toast overlay — renders above everything */}
      <AchievementToast />
    </>
  )
}

export default Editor
