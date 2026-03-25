/* ──────────────────────────────────────────────────────────
   TransportBar organism — full top toolbar for the music IDE.
   Left: Play/Stop/Record, BPM, EngineSelector
   Right: Undo/Redo/Share/Gist, Settings, LanguageSwitcher
   ────────────────────────────────────────────────────────── */

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
} from 'lucide-react'
import { useAppStore } from '../../lib/store'
import { MIN_BPM, MAX_BPM } from '../../lib/constants'
import { Button, Icon, Tooltip } from '../atoms'
import { ToolbarGroup, EngineSelector, LanguageSwitcher } from '../molecules'

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

  return (
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
              onClick={togglePlay}
              aria-label={t('transport.play')}
            >
              <Icon icon={Play} size={16} />
            </Button>
          </Tooltip>

          <Tooltip content={t('transport.stop')}>
            <Button
              variant="icon"
              onClick={stop}
              aria-label={t('transport.stop')}
            >
              <Icon icon={Square} size={16} />
            </Button>
          </Tooltip>

          <Tooltip content={t('transport.record')}>
            <Button
              variant="icon"
              active={isRecording}
              onClick={toggleRecord}
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
              onChange={(e) => setBpm(Number(e.target.value))}
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
        <ToolbarGroup separator={false}>
          <EngineSelector />
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
            <Button variant="icon" aria-label={t('toolbar.share')}>
              <Icon icon={Share2} size={16} />
            </Button>
          </Tooltip>

          <Tooltip content={t('toolbar.gist')}>
            <Button variant="icon" aria-label={t('toolbar.gist')}>
              <Icon icon={FileCode2} size={16} />
            </Button>
          </Tooltip>
        </ToolbarGroup>

        {/* Settings */}
        <ToolbarGroup>
          <Tooltip content={t('toolbar.settings')}>
            <Button variant="icon" aria-label={t('toolbar.settings')}>
              <Icon icon={Settings} size={16} />
            </Button>
          </Tooltip>
        </ToolbarGroup>

        {/* Language switcher (last, no separator) */}
        <LanguageSwitcher />
      </div>
    </header>
  )
}

export default TransportBar
