/* ──────────────────────────────────────────────────────────
   EditorLayout — resizable three-panel IDE layout.
   Toolbar at top, status bar at bottom.
   Top zone: editor + graph with vertical resize handle.
   Bottom zone: visualizers with horizontal resize handle.
   Panel sizes are driven by Zustand store (PanelLayout).
   ────────────────────────────────────────────────────────── */

import { useCallback, useRef, type ReactNode } from 'react'
import { useAppStore } from '../lib/store'
import { useMediaQuery } from '../lib/useMediaQuery'

interface EditorLayoutProps {
  /** Top toolbar (TransportBar) */
  toolbar: ReactNode
  /** Left panel — code editor */
  editor: ReactNode
  /** Right panel — node graph */
  graph: ReactNode
  /** Bottom panel — audio visualizers */
  visualizers: ReactNode
  /** Bottom status bar */
  statusBar: ReactNode
}

function EditorLayout({ toolbar, editor, graph, visualizers, statusBar }: EditorLayoutProps) {
  const layout = useAppStore((s) => s.layout)
  const setEditorWidth = useAppStore((s) => s.setEditorWidth)
  const setVisualizerHeight = useAppStore((s) => s.setVisualizerHeight)

  /* Below 768px: stacked layout, no graph, fixed visualizer height */
  const isMobile = useMediaQuery('(max-width: 768px)')

  /* Ref for the main content area — used to compute resize percentages */
  const mainRef = useRef<HTMLDivElement>(null)

  /* ── Vertical resize (editor ↔ graph) ── */
  const handleVerticalResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const main = mainRef.current
      if (!main) return

      const onMouseMove = (ev: MouseEvent) => {
        const rect = main.getBoundingClientRect()
        const pct = ((ev.clientX - rect.left) / rect.width) * 100
        /* Clamp between 20% and 80% */
        setEditorWidth(Math.min(80, Math.max(20, pct)))
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [setEditorWidth]
  )

  /* ── Horizontal resize (top zone ↔ visualizers) ── */
  const handleHorizontalResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const main = mainRef.current
      if (!main) return

      const onMouseMove = (ev: MouseEvent) => {
        const rect = main.getBoundingClientRect()
        /* Percentage measured from bottom */
        const pct = ((rect.bottom - ev.clientY) / rect.height) * 100
        /* Clamp between 15% and 60% */
        setVisualizerHeight(Math.min(60, Math.max(15, pct)))
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [setVisualizerHeight]
  )

  /* Derived size values — desktop uses percentage, mobile uses fixed height */
  const topHeight = isMobile ? undefined : `${100 - layout.visualizerHeight}%`
  const bottomHeight = isMobile ? '200px' : `${layout.visualizerHeight}%`

  /* On mobile: graph is always hidden, editor takes full width */
  const showGraph = !isMobile && layout.showGraph

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar ── */}
      <header className="shrink-0">{toolbar}</header>

      {/* ── Main content area ── */}
      <div ref={mainRef} className="flex-1 flex flex-col min-h-0">
        {/* Top zone: editor + graph (stacked vertically on mobile) */}
        <div
          className={isMobile ? 'flex flex-col flex-1 min-h-0' : 'flex min-h-0'}
          style={topHeight ? { height: topHeight } : undefined}
        >
          {/* Editor panel — full width on mobile, percentage on desktop */}
          <section
            aria-label="Editor"
            className="min-w-0 overflow-auto"
            style={{
              width: isMobile ? '100%' : showGraph ? `${layout.editorWidth}%` : '100%',
              flex: isMobile ? '1 1 0%' : undefined,
            }}
          >
            {editor}
          </section>

          {/* Vertical resize handle + Graph panel — desktop only when graph is visible */}
          {showGraph && (
            <>
              <div
                role="separator"
                aria-orientation="vertical"
                tabIndex={0}
                onMouseDown={handleVerticalResize}
                className="shrink-0 cursor-col-resize transition-colors"
                style={{
                  width: '1px',
                  backgroundColor: 'var(--color-border)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-primary)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-border)'
                }}
              />

              <section
                aria-label="Graph"
                className="min-w-0 overflow-auto"
                style={{ width: `${layout.graphWidth}%` }}
              >
                {graph}
              </section>
            </>
          )}
        </div>

        {/* Horizontal resize handle — hidden on mobile (no drag resize) */}
        {!isMobile && (
          <div
            role="separator"
            aria-orientation="horizontal"
            tabIndex={0}
            onMouseDown={handleHorizontalResize}
            className="shrink-0 cursor-row-resize transition-colors"
            style={{
              height: '1px',
              backgroundColor: 'var(--color-border)',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-primary)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-border)'
            }}
          />
        )}

        {/* Bottom zone: visualizers — fixed 200px on mobile, percentage on desktop */}
        <section
          aria-label="Visualizers"
          className="min-h-0 overflow-auto shrink-0"
          style={{
            height: bottomHeight,
            borderTop: isMobile ? '1px solid var(--color-border)' : undefined,
          }}
        >
          {visualizers}
        </section>
      </div>

      {/* ── Status bar ── */}
      <footer className="shrink-0">{statusBar}</footer>
    </div>
  )
}

export default EditorLayout
