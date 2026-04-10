/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   VisualizerPills — segmented pill toggle for selecting
   which audio visualizer panels are visible. Max 3 active
   at once; clicking a 4th deactivates the leftmost panel.
   ────────────────────────────────────────────────────────── */

import { Activity, BarChart3, Clock, Piano, Grid3x3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../lib/store';
import type { PanelLayout } from '../../types/project';

const PANELS: { key: keyof PanelLayout['visiblePanels']; Icon: LucideIcon }[] = [
  { key: 'waveform', Icon: Activity },
  { key: 'spectrum', Icon: BarChart3 },
  { key: 'timeline', Icon: Clock },
  { key: 'pianoroll', Icon: Piano },
  { key: 'punchcard', Icon: Grid3x3 },
];

/** Maximum number of simultaneously active visualizer panels */
const MAX_ACTIVE = 3;

/** Segmented pill toggle for waveform/spectrum/timeline/pianoroll panels */
export function VisualizerPills() {
  const { t } = useTranslation();
  const visiblePanels = useAppStore((s) => s.layout.visiblePanels);
  const togglePanel = useAppStore((s) => s.togglePanel);

  const activeCount = Object.values(visiblePanels).filter(Boolean).length;

  const handleToggle = (key: keyof PanelLayout['visiblePanels']) => {
    if (!visiblePanels[key] && activeCount >= MAX_ACTIVE) {
      /* Deactivate leftmost active panel to make room */
      const firstActive = PANELS.find((p) => visiblePanels[p.key]);
      if (firstActive) togglePanel(firstActive.key);
    }
    togglePanel(key);
  };

  return (
    <div
      className="flex items-center shrink-0"
      style={{
        padding: 'var(--space-1) var(--space-3)',
        gap: '1px',
        backgroundColor: 'var(--color-bg-alt)',
        borderBottom: '1px solid var(--color-border)',
      }}
      role="group"
      aria-label="Visualizer panels"
    >
      {PANELS.map(({ key, Icon }) => {
        const active = visiblePanels[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleToggle(key)}
            aria-pressed={active}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              padding: 'var(--space-1) var(--space-3)',
              fontSize: '11px',
              fontWeight: active ? 600 : 500,
              minHeight: '32px',
              color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
              backgroundColor: active ? 'var(--color-bg-elevated)' : 'transparent',
              border: '1px solid',
              borderColor: active ? 'var(--color-border)' : 'transparent',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon size={12} />
            {t(`panels.${key}`)}
          </button>
        );
      })}
    </div>
  );
}
