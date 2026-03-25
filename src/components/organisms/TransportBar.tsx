/* ──────────────────────────────────────────────────────────
   TransportBar organism — full top toolbar for the music IDE.
   Left: Play/Stop/Record, BPM, EngineSelector
   Right: Undo/Redo/Share/Gist, Settings, LanguageSwitcher
   ────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { MoreHorizontal } from 'lucide-react'
import {
  Play,
  Square,
  Circle,
  Share2,
  FileCode2,
  Settings,
  GitBranch,
  Trophy,
} from 'lucide-react'
import { useAppStore } from '../../lib/store'
import { getOrchestrator } from '../../lib/orchestrator'
import { getRecorder } from '../../lib/audio/recorder'
import { MIN_BPM, MAX_BPM } from '../../lib/constants'
import { Button, Icon, Logo, Tooltip } from '../atoms'
import { ToolbarGroup, EngineSelector, LanguageSwitcher, ShareDialog, HelpPanel } from '../molecules'
import { GistDialog } from './GistDialog'
import { CollectionPanel } from './CollectionPanel'

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
  const toggleRecord = useAppStore((s) => s.toggleRecord)
  const setBpm = useAppStore((s) => s.setBpm)

  /* Graph toggle — reactive selectors instead of imperative getState() */
  const showGraph = useAppStore((s) => s.layout.showGraph)
  const toggleGraph = useAppStore((s) => s.toggleGraph)

  /* Responsive — hide secondary actions on mobile behind overflow menu */
  const isMobile = useMediaQuery('(max-width: 768px)')
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
  const [showHelp, setShowHelp] = useState(false)
  const [showCollection, setShowCollection] = useState(false)

  /* Orchestrator-wired handlers — bridge UI state with audio engine */
  const handlePlay = async () => {
    const orch = getOrchestrator()
    if (isPlaying) {
      orch.stop()
      togglePlay()
    } else {
      await orch.start()

      /* Evaluate the active file's code so there is a pattern to play.
       * Without this, pressing Play with no prior edit produces silence. */
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

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = Number(e.target.value)
    setBpm(newBpm)
    getOrchestrator().setBpm(newBpm)
  }

  /* Record handler — toggles audio recording via MediaRecorder */
  const handleRecord = async () => {
    const recorder = getRecorder()
    if (recorder.isRecording()) {
      await recorder.stopAndDownload('live-music-coder')
      toggleRecord()
    } else {
      recorder.start()
      toggleRecord()
    }
  }

  return (
    <>
    <header
      className="flex items-center justify-between shrink-0"
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        borderBottom: '1px solid var(--color-border)',
        padding: isMobile ? 'var(--space-2) var(--space-3)' : 'var(--space-3) var(--space-6)',
        height: '48px',
      }}
    >
      {/* --- Left side: Logo + Transport controls --- */}
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

        {/* Play / Stop / Record */}
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

          <Tooltip content={t('transport.record')}>
            <Button
              variant="icon"
              active={isRecording}
              onClick={handleRecord}
              aria-label={t('transport.record')}
            >
              {/* Record circle — filled red when recording */}
              <Circle
                size={16}
                aria-hidden="true"
                style={{
                  fill: isRecording ? 'var(--color-error)' : 'none',
                  color: isRecording ? 'var(--color-error)' : 'currentColor',
                  transition: 'var(--transition-fast)',
                }}
              />
            </Button>
          </Tooltip>
        </ToolbarGroup>

        {/* BPM input */}
        <ToolbarGroup>
          <label className="flex items-center gap-2">
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                fontWeight: 'var(--font-weight-medium)',
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
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-mono)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                textAlign: 'center',
              }}
            />
          </label>
        </ToolbarGroup>

        {/* Engine selector */}
        <ToolbarGroup>
          <EngineSelector />
        </ToolbarGroup>

        {/* Node Graph toggle — hidden on mobile (graph not available) */}
        {!isMobile && (
          <ToolbarGroup separator={false}>
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

      {/* --- Right side: Actions and settings --- */}
      <div className="flex items-center">
        {/* Desktop: show all toolbar actions inline */}
        {!isMobile && (
          <>
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

            {/* Collection / Achievements toggle */}
            <ToolbarGroup>
              <Tooltip content={t('collection.title')}>
                <Button
                  variant="icon"
                  active={showCollection}
                  onClick={() => setShowCollection(!showCollection)}
                  aria-label={t('collection.title')}
                >
                  <Icon icon={Trophy} size={16} />
                </Button>
              </Tooltip>
            </ToolbarGroup>

            {/* Settings / Help toggle */}
            <ToolbarGroup>
              <Tooltip content={t('toolbar.settings')}>
                <Button
                  variant="icon"
                  active={showHelp}
                  onClick={() => setShowHelp(!showHelp)}
                  aria-label={t('toolbar.settings')}
                >
                  <Icon icon={Settings} size={16} />
                </Button>
              </Tooltip>
            </ToolbarGroup>

            {/* Language switcher (last, no separator) */}
            <LanguageSwitcher />
          </>
        )}

        {/* Mobile: settings + overflow menu for secondary actions */}
        {isMobile && (
          <>
            {/* Settings — always visible on mobile */}
            <Tooltip content={t('toolbar.settings')}>
              <Button
                variant="icon"
                active={showHelp}
                onClick={() => setShowHelp(!showHelp)}
                aria-label={t('toolbar.settings')}
              >
                <Icon icon={Settings} size={16} />
              </Button>
            </Tooltip>

            {/* Overflow menu toggle */}
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

              {/* Overflow dropdown — secondary actions */}
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
                  <Button
                    variant="icon"
                    onClick={() => { setShowCollection(!showCollection); setShowOverflow(false) }}
                    aria-label={t('collection.title')}
                    style={{ width: '100%', justifyContent: 'flex-start', gap: 'var(--space-3)' }}
                  >
                    <Icon icon={Trophy} size={16} /> {t('collection.title')}
                  </Button>
                  <div style={{ borderTop: '1px solid var(--color-border)', margin: 'var(--space-2) 0' }} />
                  <div style={{ padding: '0 var(--space-2)' }}>
                    <LanguageSwitcher />
                  </div>
                </nav>
              )}
            </div>
          </>
        )}
      </div>
    </header>

    {/* --- Modal dialogs and panels (rendered outside header flow) --- */}
    {showShare && <ShareDialog onClose={() => setShowShare(false)} />}
    {showGist && <GistDialog onClose={() => setShowGist(false)} />}
    {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}
    {showCollection && <CollectionPanel onClose={() => setShowCollection(false)} />}
    </>
  )
}

export default TransportBar
