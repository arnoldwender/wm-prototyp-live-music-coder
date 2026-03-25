/* ──────────────────────────────────────────────────────────
   VisualizerDashboard — composes all visualizer panels with
   toggle controls. Reads visiblePanels from store to show
   only active panels in a flex row with equal widths.
   ────────────────────────────────────────────────────────── */

import { useAppStore } from '../../lib/store';
import { VisualizerToggle } from '../molecules/VisualizerToggle';
import { WaveformVisualizer } from './WaveformVisualizer';
import { SpectrumVisualizer } from './SpectrumVisualizer';
import { PatternTimeline } from './PatternTimeline';

/** Composes all visualizer panels with toggle controls */
export function VisualizerDashboard() {
  const visiblePanels = useAppStore((s) => s.layout.visiblePanels);

  /* Build array of only visible panels — each gets equal flex width */
  const activePanels = [
    visiblePanels.waveform && { key: 'waveform', component: <WaveformVisualizer /> },
    visiblePanels.spectrum && { key: 'spectrum', component: <SpectrumVisualizer /> },
    visiblePanels.timeline && { key: 'timeline', component: <PatternTimeline /> },
    visiblePanels.beatlings && {
      key: 'beatlings',
      component: (
        <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Beatling World — Phase 6
        </div>
      ),
    },
  ].filter(Boolean) as { key: string; component: JSX.Element }[];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Toggle bar — always visible */}
      <VisualizerToggle />

      {/* Active visualizer panels — 1px gap acts as separator */}
      <div className="flex flex-1 min-h-0 gap-px" style={{ backgroundColor: 'var(--color-border)' }}>
        {activePanels.length === 0 ? (
          <div
            className="flex-1 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}
          >
            No visualizers active
          </div>
        ) : (
          activePanels.map(({ key, component }) => (
            <div key={key} className="flex-1 min-w-0" style={{ backgroundColor: 'var(--color-bg)' }}>
              {component}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
