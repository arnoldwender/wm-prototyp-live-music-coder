/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Editor page — assembles the IDE shell with EditorLayout.
   On mount: loads shared code from URL hash, checks streak,
   initializes session stats. Shows template selector for
   first-time visitors. Renders achievement toast overlay.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import EditorLayout from '../layouts/EditorLayout'
import { TransportBar, StatusBar, CodeEditor, NodeGraph, VisualizerDashboard, TemplateSelector, TutorialOverlay, ActivityBar, DetailPanel } from '../components/organisms'
import { AchievementToast } from '../components/molecules'
import { readShareFromUrl } from '../lib/persistence/url'
import type { UrlShareData } from '../lib/persistence/url'
import { clearEphemeralWebToken } from '../lib/persistence/gist'
import { DEFAULT_BPM, DEFAULT_ENGINE } from '../lib/constants'
import { useAppStore } from '../lib/store'
import { getOrchestrator } from '../lib/orchestrator'
import { startAutosave, readAutosave, clearAutosave } from '../lib/persistence/autosave'
import type { Project } from '../types/project'
import { FOCUSABLE_SELECTOR } from '../lib/focusable'

const SAFE_DEFAULT_CODE = 'note("c3 e3 g3 b3").s("sawtooth").lpf(800)'

function Editor() {
  const { t } = useTranslation()
  const location = useLocation()
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [recovered, setRecovered] = useState<Project | null>(null)

  const files = useAppStore((s) => s.files)
  const updateFileCode = useAppStore((s) => s.updateFileCode)
  const setBpm = useAppStore((s) => s.setBpm)
  const setDefaultEngine = useAppStore((s) => s.setDefaultEngine)
  const checkStreak = useAppStore((s) => s.checkStreak)
  const untrustedCodePending = useAppStore((s) => s.untrustedCodePending)
  const setUntrustedCodePending = useAppStore((s) => s.setUntrustedCodePending)

  const warningDialogRef = useRef<HTMLDivElement>(null)
  const reviewBtnRef = useRef<HTMLButtonElement>(null)

  /* The page's title, description and canonical are set by the route wrapper,
     src/pages/EditorPage.tsx, which the prerender renders without this IDE. */

  /* On mount: check streak, load shared code, or show template selector.
   *
   *  Shared code can arrive from two channels:
   *    1. `location.state.share` — set by first-party in-app navigation from
   *       Examples, Samples, SessionPiece, ExampleGallery. Survives HashRouter
   *       under Electron and cannot be forged cross-origin.
   *    2. `window.location.hash` — external share links (`#code=...`), which
   *       are untrusted and activate `untrustedCodePending` until reviewed.
   */
  useEffect(() => {
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

      if (!stateShare) {
        /* External URL share — block execution and wipe ephemeral PAT until reviewed */
        clearEphemeralWebToken()
        setUntrustedCodePending(true)
        window.location.hash = ''
      } else {
        setUntrustedCodePending(false)
      }
    } else if (!localStorage.getItem('lmc-onboarded')) {
      setShowTemplateSelector(true)
    } else if (!localStorage.getItem('lmc-tutorial-done')) {
      setShowTutorial(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Move focus into the untrusted-code security gate whenever it opens */
  useEffect(() => {
    if (!untrustedCodePending) return
    clearEphemeralWebToken()
    reviewBtnRef.current?.focus()
  }, [untrustedCodePending])

  /* Autosave + crash recovery.
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
      useAppStore.getState().stop()

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

  const approveExternalCode = useCallback(() => {
    setUntrustedCodePending(false)
  }, [setUntrustedCodePending])

  const discardExternalCode = useCallback(() => {
    useAppStore.getState().loadProject({
      bpm: DEFAULT_BPM,
      defaultEngine: DEFAULT_ENGINE,
      files: [
        {
          id: `file_${Date.now()}`,
          name: 'main.js',
          engine: DEFAULT_ENGINE,
          code: SAFE_DEFAULT_CODE,
          active: true,
        },
      ],
    })
    setUntrustedCodePending(false)
  }, [setUntrustedCodePending])

  const handleWarningKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const container = warningDialogRef.current
    if (!container) return
    const focusable = container.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTOR
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  return (
    <>
      <h1 className="sr-only">{t('editor.placeholderTitle')}</h1>

      {/* Crash-recovery offer (non-modal convenience) */}
      {recovered && !untrustedCodePending && (
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

      {/* Blocking security gate whenever code enters from URL hash, Gist, or .lmc file */}
      {untrustedCodePending && (
        <div
          onKeyDown={handleWarningKeyDown}
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
            ref={warningDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="shared-code-warning-title"
            aria-describedby="shared-code-warning-desc"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-warning)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-6)',
              maxWidth: '440px',
              width: '100%',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div aria-hidden="true" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>&#9888;</div>
            <h2
              id="shared-code-warning-title"
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-2)',
              }}
            >
              {t('editor.sharedCodeWarningTitle')}
            </h2>
            <p
              id="shared-code-warning-desc"
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-4)',
                lineHeight: 'var(--line-height-base)',
              }}
            >
              {t('editor.sharedCodeWarning')}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={discardExternalCode}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-2) var(--space-4)',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                  minHeight: 'var(--size-touch, 44px)',
                }}
              >
                {t('editor.discardExternalCode')}
              </button>
              <button
                ref={reviewBtnRef}
                type="button"
                onClick={approveExternalCode}
                style={{
                  backgroundColor: 'var(--color-warning)',
                  color: 'var(--color-bg)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-2) var(--space-5)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  cursor: 'pointer',
                  minHeight: 'var(--size-touch, 44px)',
                }}
              >
                {t('editor.reviewBeforeRun')}
              </button>
            </div>
          </div>
        </div>
      )}

      <EditorLayout
        inert={untrustedCodePending}
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
          if (!localStorage.getItem('lmc-tutorial-done')) {
            setShowTutorial(true)
          }
        }} />
      )}
      {showTutorial && (
        <TutorialOverlay onComplete={() => setShowTutorial(false)} />
      )}

      <AchievementToast />
    </>
  )
}

export default Editor
