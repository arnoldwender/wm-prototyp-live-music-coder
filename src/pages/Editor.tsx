/* ──────────────────────────────────────────────────────────
   Editor page — assembles the IDE shell with EditorLayout.
   Placeholder panels stand in until real components arrive.
   ────────────────────────────────────────────────────────── */

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import EditorLayout from '../layouts/EditorLayout'
import { TransportBar, StatusBar } from '../components/organisms'
import { getOrchestrator } from '../lib/orchestrator'

/** Placeholder panel — shows a centered label with muted styling */
function PlaceholderPanel({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center w-full h-full"
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-family-mono)',
      }}
    >
      {label}
    </div>
  )
}

function Editor() {
  const { t } = useTranslation()

  /* Pre-load Strudel engine and queue a demo pattern on mount */
  useEffect(() => {
    const orch = getOrchestrator()
    orch.getEngine('strudel').then(() => {
      orch.evaluate('note("c3 e3 g3 b3").s("sawtooth").lpf(800)', 'strudel').catch(() => {})
    })
  }, [])

  return (
    <EditorLayout
      toolbar={<TransportBar />}
      editor={<PlaceholderPanel label={t('panels.editor')} />}
      graph={<PlaceholderPanel label={t('panels.graph')} />}
      visualizers={<PlaceholderPanel label={t('panels.waveform')} />}
      statusBar={<StatusBar />}
    />
  )
}

export default Editor
