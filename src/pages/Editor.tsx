/* ──────────────────────────────────────────────────────────
   Editor page — assembles the IDE shell with EditorLayout.
   On mount: loads shared code from URL hash, or shows the
   template selector for first-time visitors.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect } from 'react'
import EditorLayout from '../layouts/EditorLayout'
import { TransportBar, StatusBar, CodeEditor, NodeGraph, VisualizerDashboard, TemplateSelector, TutorialOverlay } from '../components/organisms'
import { readShareFromUrl } from '../lib/persistence/url'
import { useAppStore } from '../lib/store'

function Editor() {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  const files = useAppStore((s) => s.files)
  const updateFileCode = useAppStore((s) => s.updateFileCode)
  const setBpm = useAppStore((s) => s.setBpm)
  const setDefaultEngine = useAppStore((s) => s.setDefaultEngine)

  /* On mount: check URL hash for shared code, or show template selector */
  useEffect(() => {
    const shared = readShareFromUrl()
    if (shared) {
      /* URL hash contains shared code — load it into the active file */
      const activeFile = files.find((f) => f.active)
      if (activeFile) {
        updateFileCode(activeFile.id, shared.code)
      }
      setBpm(shared.bpm)
      setDefaultEngine(shared.engine)
    } else if (!localStorage.getItem('lmc-onboarded')) {
      /* First visit — show the template selector */
      setShowTemplateSelector(true)
    } else if (!localStorage.getItem('lmc-tutorial-done')) {
      /* Onboarded but tutorial not completed — show tutorial overlay */
      setShowTutorial(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <EditorLayout
        toolbar={<TransportBar />}
        editor={<CodeEditor />}
        graph={<NodeGraph />}
        visualizers={<VisualizerDashboard />}
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
    </>
  )
}

export default Editor
