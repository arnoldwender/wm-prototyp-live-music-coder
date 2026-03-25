/* ──────────────────────────────────────────────────────────
   TransportBar organism — full top toolbar for the music IDE.
   Left: Play/Stop/Record, BPM, EngineSelector
   Right: Undo/Redo/Share/Gist, Settings, LanguageSwitcher
   ────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Play,
  Square,
  Circle,
  Undo2,
  Redo2,
  Share2,
  FileCode2,
  Settings,
  GitBranch,
} from 'lucide-react'
import { useAppStore } from '../../lib/store'
import { getOrchestrator } from '../../lib/orchestrator'
import { getRecorder } from '../../lib/audio/recorder'
import { MIN_BPM, MAX_BPM } from '../../lib/constants'
import { Button, Icon, Tooltip } from '../atoms'
import { ToolbarGroup, EngineSelector, LanguageSwitcher, ShareDialog, HelpPanel } from '../molecules'
import { GistDialog } from './GistDialog'

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

  /* Dialog and panel visibility state */
  const [showShare, setShowShare] = useState(false)
  const [showGist, setShowGist] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

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
        padding: 'var(--space-3) var(--space-6)',
        height: '48px',
      }}
    >
      {/* --- Left side: Transport controls --- */}
      <div className="flex items-center">
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

        {/* Node Graph toggle */}
        <ToolbarGroup separator={false}>
          <Tooltip content={t('panels.graph')}>
            <Button
              variant="icon"
              active={useAppStore.getState().layout.showGraph}
              onClick={() => useAppStore.getState().toggleGraph()}
              aria-label={t('panels.graph')}
            >
              <Icon icon={GitBranch} size={16} />
            </Button>
          </Tooltip>
        </ToolbarGroup>
      </div>

      {/* --- Right side: Actions and settings --- */}
      <div className="flex items-center">
        {/* Undo / Redo */}
        <ToolbarGroup>
          <Tooltip content={t('toolbar.undo')}>
            <Button variant="icon" aria-label={t('toolbar.undo')}>
              <Icon icon={Undo2} size={16} />
            </Button>
          </Tooltip>

          <Tooltip content={t('toolbar.redo')}>
            <Button variant="icon" aria-label={t('toolbar.redo')}>
              <Icon icon={Redo2} size={16} />
            </Button>
          </Tooltip>
        </ToolbarGroup>

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
      </div>
    </header>

    {/* --- Modal dialogs and panels (rendered outside header flow) --- */}
    {showShare && <ShareDialog onClose={() => setShowShare(false)} />}
    {showGist && <GistDialog onClose={() => setShowGist(false)} />}
    {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}
    </>
  )
}

export default TransportBar
