/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   TransportBar organism — top toolbar for the music IDE.
   3 workflow groups separated by dividers:
     Group 1 Transport: Play/Stop, BPM, Engine selector
     Group 2 Edit: Undo, Redo, Graph toggle
     Group 3 Share: Share, Gist, Collection, Language switcher
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useMediaQuery } from '../../lib/useMediaQuery'
import {
  MoreHorizontal,
  Play,
  Square,
  Circle,
  Share2,
  FileCode2,
  GitBranch,
  Undo2,
  Redo2,
} from 'lucide-react'
import { isElectron, electronAPI } from '../../lib/electron'
import { Save, Download } from 'lucide-react'
import { useAppStore } from '../../lib/store'
import { getOrchestrator } from '../../lib/orchestrator'
import { MIN_BPM, MAX_BPM } from '../../lib/constants'
import { Button, Icon, Logo, Tooltip } from '../atoms'
import { ToolbarGroup, EngineSelector, LanguageSwitcher, ShareDialog } from '../molecules'
import { GistDialog } from './GistDialog'

/* ── GroupDivider — visual separator between workflow groups ── */
function GroupDivider() {
  return (
    <div
      style={{
        width: '1px',
        height: '20px',
        backgroundColor: 'var(--color-border)',
        opacity: 0.5,
        margin: '0 var(--space-2)',
      }}
    />
  )
}

/** Main transport and toolbar header */
function TransportBar() {
  const { t } = useTranslation()

  /* Transport state */
  const isPlaying = useAppStore((s) => s.isPlaying)
  const isRecording = useAppStore((s) => s.isRecording)
  const bpm = useAppStore((s) => s.bpm)

  /* Transport actions */
  const togglePlay = useAppStore((s) => s.togglePlay)
  const stop = useAppStore((s) => s.stop)
  const setBpm = useAppStore((s) => s.setBpm)
  const toggleRecord = useAppStore((s) => s.toggleRecord)

  /* Graph toggle */
  const showGraph = useAppStore((s) => s.layout.showGraph)
  const toggleGraph = useAppStore((s) => s.toggleGraph)

  /* Responsive — hide Groups 2+3 on mobile behind overflow menu */
  const isMobile = useMediaQuery('(max-width: 768px)')

  /* Platform detection for keyboard shortcut labels */
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)
  const [showOverflow, setShowOverflow] = useState(false)

  /* Ref for click-outside detection on overflow menu */
  const overflowRef = useRef<HTMLDivElement>(null)

  /** Close overflow menu when clicking outside */
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
      setShowOverflow(false)
    }
  }, [])

  useEffect(() => {
    if (showOverflow) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showOverflow, handleClickOutside])

  /* Dialog and panel visibility state */
  const [showShare, setShowShare] = useState(false)
  const [showGist, setShowGist] = useState(false)

  /* ── Orchestrator-wired handlers ── */

  /** Play/pause toggle — bridges UI state with audio engine */
  const handlePlay = async () => {
    const orch = getOrchestrator()
    if (isPlaying) {
      orch.stop()
      togglePlay()
    } else {
      await orch.start()

      /* Evaluate the active file so pressing Play produces sound */
      const activeFile = useAppStore.getState().files.find((f) => f.active)
      if (activeFile?.code) {
        try {
          await orch.evaluate(activeFile.code, activeFile.engine)
        } catch (err) {
          console.error('[TransportBar] Initial evaluate failed:', err)
        }
      }

      togglePlay()
    }
  }

  const handleStop = () => {
    getOrchestrator().stop()
    stop()
  }

  /* Record toggle — start/stop audio capture and download */
  const handleRecord = async () => {
    const { getRecorder } = await import('../../lib/audio/recorder')
    const recorder = getRecorder()
    if (recorder.isRecording()) {
      try {
        await recorder.stopAndDownload('live-music-coder')
      } catch (err) {
        console.error('[TransportBar] Recording stop failed:', err)
      }
      toggleRecord()
    } else {
      recorder.start()
      toggleRecord()
    }
  }

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = Number(e.target.value)
    setBpm(newBpm)
    getOrchestrator().setBpm(newBpm)
  }

  /* Undo/Redo — dispatch keyboard shortcuts to active CodeMirror editor */
  const handleUndo = () => {
    const el = document.querySelector('.cm-editor .cm-content') as HTMLElement | null
    if (el) {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }))
    }
  }

  const handleRedo = () => {
    const el = document.querySelector('.cm-editor .cm-content') as HTMLElement | null
    if (el) {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true, bubbles: true }))
    }
  }

  return (
    <>
    <header
      className="flex items-center justify-between shrink-0"
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 var(--space-3)',
        height: '40px',
      }}
    >
      {/* ── Left side: Logo + Group 1 Transport ── */}
      <div className="flex items-center">
        {/* Logo — links back to landing page */}
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: 'inherit',
            marginRight: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label={t('nav.backToHome')}
        >
          <Logo size="sm" />
        </Link>

        {/* Group 1 — Transport: Play / Stop */}
        <ToolbarGroup>
          <Tooltip content={t('transport.play')}>
            <Button
              variant="icon"
              active={isPlaying}
              onClick={handlePlay}
              aria-label={t('transport.play')}
            >
              <Icon icon={Play} size={16} />
            </Button>
          </Tooltip>

          <Tooltip content={t('transport.stop')}>
            <Button
              variant="icon"
              onClick={handleStop}
              aria-label={t('transport.stop')}
            >
              <Icon icon={Square} size={16} />
            </Button>
          </Tooltip>

          <Tooltip content={isRecording ? t('transport.stopRecord') : t('transport.record')}>
            <Button
              variant="icon"
              active={isRecording}
              onClick={handleRecord}
              aria-label={isRecording ? t('transport.stopRecord') : t('transport.record')}
            >
              <Circle
                size={14}
                fill={isRecording ? 'var(--color-error)' : 'none'}
                color={isRecording ? 'var(--color-error)' : 'currentColor'}
                style={isRecording ? { animation: 'playing-indicator 1.5s ease-in-out infinite' } : undefined}
              />
            </Button>
          </Tooltip>
        </ToolbarGroup>

        {/* Group 1 — BPM input with subtle background */}
        <ToolbarGroup>
          <label className="flex items-center gap-2">
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                fontWeight: 500,
              }}
            >
              {t('transport.bpm')}
            </span>
            <input
              type="number"
              min={MIN_BPM}
              max={MAX_BPM}
              value={bpm}
              onChange={handleBpmChange}
              aria-label={t('transport.bpm')}
              className="focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                width: '56px',
                backgroundColor: 'var(--color-bg-elevated)',
                color: 'var(--color-text)',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: 'var(--font-family-mono)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                textAlign: 'center',
              }}
            />
          </label>
        </ToolbarGroup>

        {/* Group 1 — Engine selector */}
        <ToolbarGroup>
          <EngineSelector />
        </ToolbarGroup>

        {/* Divider between Group 1 and Group 2 (desktop only) */}
        {!isMobile && <GroupDivider />}

        {/* Group 2 — Edit: Undo, Redo, Graph toggle (desktop only) */}
        {!isMobile && (
          <ToolbarGroup separator={false}>
            <Tooltip content={t('toolbar.undo')}>
              <Button
                variant="icon"
                onClick={handleUndo}
                aria-label={t('toolbar.undo')}
              >
                <Icon icon={Undo2} size={16} />
              </Button>
            </Tooltip>

            <Tooltip content={t('toolbar.redo')}>
              <Button
                variant="icon"
                onClick={handleRedo}
                aria-label={t('toolbar.redo')}
              >
                <Icon icon={Redo2} size={16} />
              </Button>
            </Tooltip>

            <Tooltip content={t('panels.graph')}>
              <Button
                variant="icon"
                active={showGraph}
                onClick={toggleGraph}
                aria-label={t('panels.graph')}
              >
                <Icon icon={GitBranch} size={16} />
              </Button>
            </Tooltip>
          </ToolbarGroup>
        )}
      </div>

      {/* ── Right side: Group 3 Share ── */}
      <div className="flex items-center">
        {/* Desktop: Group 3 inline */}
        {!isMobile && (
          <>
            <GroupDivider />

            {/* Share / Gist */}
            <ToolbarGroup>
              <Tooltip content={t('toolbar.share')}>
                <Button variant="icon" onClick={() => setShowShare(true)} aria-label={t('toolbar.share')}>
                  <Icon icon={Share2} size={16} />
                </Button>
              </Tooltip>

              <Tooltip content={t('toolbar.gist')}>
                <Button variant="icon" onClick={() => setShowGist(true)} aria-label={t('toolbar.gist')}>
                  <Icon icon={FileCode2} size={16} />
                </Button>
              </Tooltip>
            </ToolbarGroup>

            {/* Group 4 — Desktop-only: Save and Export Audio (Electron only, tree-shaken in web build) */}
            {isElectron && (
              <>
                <GroupDivider />
                <ToolbarGroup>
                  <Tooltip content={`Save Project (${isMac ? '⌘S' : 'Ctrl+S'})`}>
                    <Button variant="ghost" onClick={() => {
                      const store = useAppStore.getState()
                      const project = {
                        id: `project_${Date.now()}`,
                        name: 'Live Music Coder Project',
                        version: 1 as const,
                        created: new Date().toISOString(),
                        updated: new Date().toISOString(),
                        bpm: store.bpm,
                        defaultEngine: store.defaultEngine,
                        files: store.files,
                        graph: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
                        layout: store.layout,
                      }
                      electronAPI?.saveProject(JSON.stringify(project))
                    }}>
                      <Save size={16} />
                    </Button>
                  </Tooltip>
                  <Tooltip content={`Export Audio (${isMac ? '⌘E' : 'Ctrl+E'})`}>
                    <Button variant="ghost" onClick={() => {
                      electronAPI?.notify('Export', 'Use the recording feature first, then export.')
                    }}>
                      <Download size={16} />
                    </Button>
                  </Tooltip>
                </ToolbarGroup>
              </>
            )}

            {/* Language switcher (last element) */}
            <LanguageSwitcher />
          </>
        )}

        {/* Mobile: overflow menu for Groups 2+3 */}
        {isMobile && (
          <div ref={overflowRef} style={{ position: 'relative' }}>
            <Tooltip content={t('toolbar.more', 'More')}>
              <Button
                variant="icon"
                active={showOverflow}
                onClick={() => setShowOverflow(!showOverflow)}
                aria-label={t('toolbar.more', 'More')}
              >
                <Icon icon={MoreHorizontal} size={16} />
              </Button>
            </Tooltip>

            {/* Overflow dropdown — Groups 2+3 actions */}
            {showOverflow && (
              <nav
                aria-label="More actions"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 'var(--space-2)',
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-2)',
                  zIndex: 50,
                  minWidth: '160px',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                {/* Edit actions */}
                <Button
                  variant="icon"
                  onClick={() => { handleUndo(); setShowOverflow(false) }}
                  aria-label={t('toolbar.undo')}
                  style={{ width: '100%', justifyContent: 'flex-start', gap: 'var(--space-3)' }}
                >
                  <Icon icon={Undo2} size={16} /> {t('toolbar.undo')}
                </Button>
                <Button
                  variant="icon"
                  onClick={() => { handleRedo(); setShowOverflow(false) }}
                  aria-label={t('toolbar.redo')}
                  style={{ width: '100%', justifyContent: 'flex-start', gap: 'var(--space-3)' }}
                >
                  <Icon icon={Redo2} size={16} /> {t('toolbar.redo')}
                </Button>
                <Button
                  variant="icon"
                  active={showGraph}
                  onClick={() => { toggleGraph(); setShowOverflow(false) }}
                  aria-label={t('panels.graph')}
                  style={{ width: '100%', justifyContent: 'flex-start', gap: 'var(--space-3)' }}
                >
                  <Icon icon={GitBranch} size={16} /> {t('panels.graph')}
                </Button>

                {/* Divider between edit and share groups */}
                <div style={{ borderTop: '1px solid var(--color-border)', margin: 'var(--space-2) 0' }} />

                {/* Share actions */}
                <Button
                  variant="icon"
                  onClick={() => { setShowShare(true); setShowOverflow(false) }}
                  aria-label={t('toolbar.share')}
                  style={{ width: '100%', justifyContent: 'flex-start', gap: 'var(--space-3)' }}
                >
                  <Icon icon={Share2} size={16} /> {t('toolbar.share')}
                </Button>
                <Button
                  variant="icon"
                  onClick={() => { setShowGist(true); setShowOverflow(false) }}
                  aria-label={t('toolbar.gist')}
                  style={{ width: '100%', justifyContent: 'flex-start', gap: 'var(--space-3)' }}
                >
                  <Icon icon={FileCode2} size={16} /> {t('toolbar.gist')}
                </Button>
                <div style={{ borderTop: '1px solid var(--color-border)', margin: 'var(--space-2) 0' }} />
                <div style={{ padding: '0 var(--space-2)' }}>
                  <LanguageSwitcher />
                </div>
              </nav>
            )}
          </div>
        )}
      </div>
    </header>

    {/* ── Modal dialogs and panels (rendered outside header flow) ── */}
    {showShare && <ShareDialog onClose={() => setShowShare(false)} />}
    {showGist && <GistDialog onClose={() => setShowGist(false)} />}
    </>
  )
}

export default TransportBar
