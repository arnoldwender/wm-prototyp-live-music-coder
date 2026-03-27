/* ──────────────────────────────────────────────────────────
   EditorLayout — 3-column IDE layout (VS Code style).
   Left: activity bar (40px icon strip).
   Center: editor zone (top, flex) + visualizer zone (bottom, resizable 15–60%).
   Right: detail panel (collapsible, 280px).
   Toolbar at top, status bar at bottom.
   Panel sizes are driven by Zustand store (PanelLayout).
   ────────────────────────────────────────────────────────── */

import { useCallback, useRef, type ReactNode } from 'react'
import { useAppStore } from '../lib/store'
import { useMediaQuery } from '../lib/useMediaQuery'

interface EditorLayoutProps {
  /** Top toolbar (TransportBar) */
  toolbar: ReactNode
  /** Left icon strip — activity bar (40px) */
  activityBar: ReactNode
  /** Code editor panel */
  editor: ReactNode
  /** Node graph panel */
  graph: ReactNode
  /** Bottom panel — audio visualizers */
  visualizers: ReactNode
  /** Right collapsible detail panel (samples, reference, console, creatures, settings) */
  detailPanel: ReactNode
  /** Bottom status bar */
  statusBar: ReactNode
}

function EditorLayout({ toolbar, activityBar, editor, graph, visualizers, detailPanel, statusBar }: EditorLayoutProps) {
  const zenMode = useAppStore((s) => s.zenMode)
  const layout = useAppStore((s) => s.layout)
  const setEditorWidth = useAppStore((s) => s.setEditorWidth)
  const setVisualizerHeight = useAppStore((s) => s.setVisualizerHeight)

  /* Below 768px: stacked layout, no graph, fixed visualizer height */
  const isMobile = useMediaQuery('(max-width: 768px)')

  /* Ref for the main content area — used to compute resize percentages */
  const mainRef = useRef<HTMLDivElement>(null)

  /* ── Vertical resize (editor <-> graph) ── */
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

  /* ── Horizontal resize (top zone <-> visualizers) ── */
  const handleHorizontalResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const main = mainRef.current
      if (!main) return

      const onMouseMove = (ev: MouseEvent) => {
        const rect = main.getBoundingClientRect()
        /* Percentage measured from bottom */
        const pct = ((rect.bottom - ev.clientY) / rect.height) * 100
        /* Clamp between 15% and 40% — tighter range per plan spec */
        setVisualizerHeight(Math.min(40, Math.max(15, pct)))
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

  /* ── Keyboard resize: vertical handle (Left/Right arrows, 2% per press) ── */
  const handleVerticalKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setEditorWidth(Math.max(20, layout.editorWidth - 2))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setEditorWidth(Math.min(80, layout.editorWidth + 2))
      }
    },
    [layout.editorWidth, setEditorWidth]
  )

  /* ── Keyboard resize: horizontal handle (Up/Down arrows, 2% per press) ── */
  const handleHorizontalKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setVisualizerHeight(Math.min(40, layout.visualizerHeight + 2))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setVisualizerHeight(Math.max(15, layout.visualizerHeight - 2))
      }
    },
    [layout.visualizerHeight, setVisualizerHeight]
  )

  /* Derived size values — desktop uses percentage, mobile uses fixed height */
  const topHeight = isMobile || zenMode ? undefined : `${100 - layout.visualizerHeight}%`
  const bottomHeight = isMobile ? '120px' : `${layout.visualizerHeight}%`

  /* On mobile: graph is always hidden, editor takes full width */
  const showGraph = !isMobile && layout.showGraph

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar (40px) — hidden in zen mode ── */}
      {!zenMode && <header className="shrink-0">{toolbar}</header>}

      {/* ── 3-column main area: activityBar | mainContent | detailPanel ── */}
      <div className="flex-1 flex min-h-0">
        {/* Left: activity bar icon strip — hidden in zen mode and on mobile */}
        {!zenMode && !isMobile && activityBar}

        {/* Center: editor zone (top) + visualizer zone (bottom) */}
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
                  aria-label="Resize editor and graph panels"
                  tabIndex={0}
                  onMouseDown={handleVerticalResize}
                  onKeyDown={handleVerticalKeyDown}
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

          {/* Horizontal resize handle — hidden on mobile and zen mode */}
          {!isMobile && !zenMode && (
            <div
              role="separator"
              aria-orientation="horizontal"
              aria-label="Resize editor and visualizer panels"
              tabIndex={0}
              onMouseDown={handleHorizontalResize}
              onKeyDown={handleHorizontalKeyDown}
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

          {/* Bottom zone: visualizers — hidden in zen mode */}
          {!zenMode && (
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
          )}
        </div>

        {/* Right: detail panel — hidden in zen mode and on mobile */}
        {!zenMode && !isMobile && detailPanel}
      </div>

      {/* ── Status bar (24px) — hidden in zen mode ── */}
      {!zenMode && <footer className="shrink-0">{statusBar}</footer>}
    </div>
  )
}

export default EditorLayout
