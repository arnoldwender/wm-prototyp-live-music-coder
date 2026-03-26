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
import { getOrchestrator } from '../lib/orchestrator'

function Editor() {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  const files = useAppStore((s) => s.files)
  const updateFileCode = useAppStore((s) => s.updateFileCode)
  const setBpm = useAppStore((s) => s.setBpm)
  const setDefaultEngine = useAppStore((s) => s.setDefaultEngine)

  /* On mount: set page title, check URL hash for shared code, or show template selector */
  useEffect(() => {
    document.title = 'Editor — Live Music Coder'
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

  /* Stop all audio when leaving the editor page */
  useEffect(() => {
    return () => {
      const orch = getOrchestrator()
      orch.stop()
      /* Reset store play state so TransportBar is correct on re-entry */
      useAppStore.getState().stop()
    }
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
