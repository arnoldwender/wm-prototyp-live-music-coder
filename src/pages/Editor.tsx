/* ──────────────────────────────────────────────────────────
   Editor page — assembles the IDE shell with EditorLayout.
   Placeholder panels stand in until real components arrive.
   ────────────────────────────────────────────────────────── */

import { useTranslation } from 'react-i18next'
import EditorLayout from '../layouts/EditorLayout'
import { TransportBar, StatusBar, CodeEditor, NodeGraph } from '../components/organisms'

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

  return (
    <EditorLayout
      toolbar={<TransportBar />}
      editor={<CodeEditor />}
      graph={<NodeGraph />}
      visualizers={<PlaceholderPanel label={t('panels.waveform')} />}
      statusBar={<StatusBar />}
    />
  )
}

export default Editor
