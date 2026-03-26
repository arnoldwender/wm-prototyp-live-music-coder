/* ──────────────────────────────────────────────────────────
   VisualizerDashboard — composes all visualizer panels with
   toggle controls. Reads visiblePanels from store to show
   only active panels in a flex row with equal widths.
   ────────────────────────────────────────────────────────── */

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../lib/store';
import { VisualizerToggle } from '../molecules/VisualizerToggle';
import { WaveformVisualizer } from './WaveformVisualizer';
import { SpectrumVisualizer } from './SpectrumVisualizer';
import { PatternTimeline } from './PatternTimeline';
import { BeatlingPanel } from './BeatlingPanel';
import { BrainPanel } from './BrainPanel';
import { PianorollVisualizer } from './PianorollVisualizer';

/** Composes all visualizer panels with toggle controls */
export function VisualizerDashboard() {
  const { t } = useTranslation();
  const visiblePanels = useAppStore((s) => s.layout.visiblePanels);
  const showBrainPanel = useAppStore((s) => s.showBrainPanel);

  /* Build array of only visible panels — each gets equal flex width */
  const activePanels = [
    visiblePanels.waveform && { key: 'waveform', component: <WaveformVisualizer /> },
    visiblePanels.spectrum && { key: 'spectrum', component: <SpectrumVisualizer /> },
    visiblePanels.timeline && { key: 'timeline', component: <PatternTimeline /> },
    visiblePanels.pianoroll && { key: 'pianoroll', component: <PianorollVisualizer /> },
    visiblePanels.beatlings && {
      key: 'beatlings',
      component: <BeatlingPanel />,
    },
    (visiblePanels.brain || showBrainPanel) && {
      key: 'brain',
      component: <BrainPanel />,
    },
  ].filter(Boolean) as { key: string; component: ReactNode }[];

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
            {t('panels.noVisualizers')}
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
