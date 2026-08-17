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
import { useLocation } from 'react-router-dom'
import EditorLayout from '../layouts/EditorLayout'
import { TransportBar, StatusBar, CodeEditor, NodeGraph, VisualizerDashboard, TemplateSelector, TutorialOverlay, ActivityBar, DetailPanel } from '../components/organisms'
import { AchievementToast } from '../components/molecules'
import { readShareFromUrl } from '../lib/persistence/url'
import type { UrlShareData } from '../lib/persistence/url'
import { useAppStore } from '../lib/store'
import { getOrchestrator } from '../lib/orchestrator'
import { usePageMeta } from '../lib/usePageMeta'
import { startAutosave, readAutosave, clearAutosave } from '../lib/persistence/autosave'
import type { Project } from '../types/project'

function Editor() {
  const { t } = useTranslation()
  const location = useLocation()
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showSharedWarning, setShowSharedWarning] = useState(false)
  const [recovered, setRecovered] = useState<Project | null>(null)

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

  /* On mount: check streak, load shared code, or show template selector.
   *
   *  Shared code can arrive from two channels:
   *    1. `location.state.share` — set by in-app navigation from
   *       Examples, SessionPiece, etc. Preferred because it survives
   *       HashRouter under Electron (the URL hash is reserved for
   *       routing there, so a `#code=` fragment gets clobbered).
   *    2. `window.location.hash` — the legacy channel, still used by
   *       external share links on the web (both hand-crafted and
   *       generated via `generateShareUrl`).
   */
  useEffect(() => {
    /* Check and update daily streak */
    checkStreak()

    const stateShare = (location.state as { share?: UrlShareData } | null)?.share
    const shared = stateShare ?? readShareFromUrl()
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

      /* SECURITY: Always show warning for shared/external code — never skip */
      setShowSharedWarning(true)
      /* Clean the hash after reading (only meaningful under BrowserRouter;
         harmless under HashRouter because the share came from state). */
      if (!stateShare) window.location.hash = ''
    } else if (!localStorage.getItem('lmc-onboarded')) {
      /* First visit — show the template selector */
      setShowTemplateSelector(true)
    } else if (!localStorage.getItem('lmc-tutorial-done')) {
      /* Onboarded but tutorial not completed — show tutorial overlay */
      setShowTutorial(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Autosave + crash recovery.
   *
   * The service worker calls skipWaiting() on install and navigates every open
   * client on activate, so a deploy reloads a live-coding session mid-set. Until
   * this existed there was nothing to come back to: the whole IndexedDB layer
   * shipped with zero consumers.
   *
   * The restore is OFFERED, never applied silently — the user may have opened
   * the editor deliberately empty, and overwriting their buffer with a previous
   * session would be its own kind of data loss. */
  useEffect(() => {
    const snapshot = (): Project => {
      const s = useAppStore.getState()
      const now = new Date().toISOString()
      return {
        id: 'autosave',
        name: 'Autosave',
        version: 1,
        created: now,
        updated: now,
        bpm: s.bpm,
        defaultEngine: s.defaultEngine,
        files: s.files,
        graph: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
        layout: s.layout,
      }
    }

    /* Offer recovery only when there is something to recover AND the current
       buffer is untouched, so we never talk over work in progress. */
    void readAutosave().then((saved) => {
      if (!saved) return
      const current = useAppStore.getState().files
      const currentIsEmpty = current.every((f) => f.code.trim() === '')
      const savedHasCode = saved.files?.some((f) => f.code.trim() !== '')
      if (currentIsEmpty && savedHasCode) setRecovered(saved)
    })

    return startAutosave(useAppStore.subscribe, snapshot)
  }, [])

  const acceptRecovery = useCallback(() => {
    if (!recovered) return
    useAppStore.getState().loadProject({
      bpm: recovered.bpm,
      defaultEngine: recovered.defaultEngine,
      files: recovered.files,
      layout: recovered.layout,
    })
    setRecovered(null)
  }, [recovered])

  const declineRecovery = useCallback(() => {
    setRecovered(null)
    void clearAutosave()
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
      {/* Crash-recovery offer. Non-modal by design: the shared-code warning is a
          security gate and blocks, this is a convenience and must not stand
          between the user and an empty editor. */}
      {recovered && (
        <div
          role="dialog"
          aria-label={t('editor.recoverTitle')}
          style={{
            position: 'fixed',
            bottom: 'var(--space-4)',
            right: 'var(--space-4)',
            zIndex: 900,
            maxWidth: '360px',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text)',
            marginBottom: 'var(--space-2)',
          }}>
            {t('editor.recoverTitle')}
          </div>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-3)',
            lineHeight: 'var(--line-height-base)',
          }}>
            {t('editor.recoverBody')}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={declineRecovery}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                minHeight: 'var(--size-touch, 44px)',
              }}
            >
              {t('editor.recoverDiscard')}
            </button>
            <button
              type="button"
              onClick={acceptRecovery}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-bg)',
                background: 'var(--color-primary)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                minHeight: 'var(--size-touch, 44px)',
              }}
            >
              {t('editor.recoverRestore')}
            </button>
          </div>
        </div>
      )}

      {showSharedWarning && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-backdrop)',
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
