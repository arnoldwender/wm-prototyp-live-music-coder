/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   VisualizerToggle — toggle buttons for each visualizer panel.
   Reads panel visibility from store and dispatches togglePanel.
   ────────────────────────────────────────────────────────── */

import { useTranslation } from 'react-i18next';
import { Activity, BarChart3, Clock, Piano } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { Button } from '../atoms';
import type { PanelLayout } from '../../types/project';

/** Panel definitions with Lucide icons for visual clarity */
const panels: { key: keyof PanelLayout['visiblePanels']; Icon: LucideIcon }[] = [
  { key: 'waveform', Icon: Activity },
  { key: 'spectrum', Icon: BarChart3 },
  { key: 'timeline', Icon: Clock },
  { key: 'pianoroll', Icon: Piano },
];

/** Toggle buttons for each visualizer panel */
export function VisualizerToggle() {
  const { t } = useTranslation();
  const visiblePanels = useAppStore((s) => s.layout.visiblePanels);
  const togglePanel = useAppStore((s) => s.togglePanel);

  return (
    <nav
      className="flex items-center gap-1 px-2 py-1 shrink-0"
      style={{ backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}
      aria-label="Visualizer panels"
    >
      {panels.map(({ key, Icon }) => (
        <Button
          key={key}
          variant="ghost"
          active={visiblePanels[key]}
          onClick={() => togglePanel(key)}
          aria-pressed={visiblePanels[key]}
          className="!px-2 !py-0.5 text-xs"
        >
          <Icon size={14} className="mr-1 inline-block" />
          {t(`panels.${key}`)}
        </Button>
      ))}
    </nav>
  );
}
