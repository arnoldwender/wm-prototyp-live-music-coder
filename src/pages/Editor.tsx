/* ──────────────────────────────────────────────────────────
   Editor page — assembles the IDE shell with EditorLayout.
   Visualizer dashboard provides live audio visualization.
   ────────────────────────────────────────────────────────── */

import EditorLayout from '../layouts/EditorLayout'
import { TransportBar, StatusBar, CodeEditor, NodeGraph, VisualizerDashboard } from '../components/organisms'

function Editor() {
  return (
    <EditorLayout
      toolbar={<TransportBar />}
      editor={<CodeEditor />}
      graph={<NodeGraph />}
      visualizers={<VisualizerDashboard />}
      statusBar={<StatusBar />}
    />
  )
}

export default Editor
