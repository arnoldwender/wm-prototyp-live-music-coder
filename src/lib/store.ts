/* ──────────────────────────────────────────────────────────
   App store — global state for transport, engine, and layout
   Uses Zustand for lightweight reactive state management.
   ────────────────────────────────────────────────────────── */

import { create } from 'zustand'
import type { EngineType } from '../types/engine'
import type { PanelLayout } from '../types/project'
import { DEFAULT_BPM, MIN_BPM, MAX_BPM, DEFAULT_ENGINE, DEFAULT_LAYOUT } from './constants'

/** Visible panel names that can be toggled */
type PanelName = keyof PanelLayout['visiblePanels']

/** Application state shape */
interface AppState {
  /* Transport */
  isPlaying: boolean
  isRecording: boolean
  bpm: number

  /* Engine */
  defaultEngine: EngineType

  /* Layout */
  layout: PanelLayout

  /* Transport actions */
  togglePlay: () => void
  stop: () => void
  toggleRecord: () => void
  setBpm: (bpm: number) => void

  /* Engine actions */
  setDefaultEngine: (engine: EngineType) => void

  /* Layout actions */
  togglePanel: (panel: PanelName) => void
  setEditorWidth: (width: number) => void
  setVisualizerHeight: (height: number) => void
}

export const useAppStore = create<AppState>()((set) => ({
  /* --- Initial state --- */
  isPlaying: false,
  isRecording: false,
  bpm: DEFAULT_BPM,
  defaultEngine: DEFAULT_ENGINE,
  layout: { ...DEFAULT_LAYOUT, visiblePanels: { ...DEFAULT_LAYOUT.visiblePanels } },

  /* --- Transport actions --- */

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  stop: () => set({ isPlaying: false, isRecording: false }),

  toggleRecord: () => set((s) => ({ isRecording: !s.isRecording })),

  /** Set BPM, clamped to valid range */
  setBpm: (bpm: number) =>
    set({ bpm: Math.min(MAX_BPM, Math.max(MIN_BPM, bpm)) }),

  /* --- Engine actions --- */

  setDefaultEngine: (engine: EngineType) => set({ defaultEngine: engine }),

  /* --- Layout actions --- */

  /** Toggle a visualizer panel on/off */
  togglePanel: (panel: PanelName) =>
    set((s) => ({
      layout: {
        ...s.layout,
        visiblePanels: {
          ...s.layout.visiblePanels,
          [panel]: !s.layout.visiblePanels[panel],
        },
      },
    })),

  /** Set editor width — graph auto-fills the remainder */
  setEditorWidth: (width: number) =>
    set((s) => ({
      layout: {
        ...s.layout,
        editorWidth: width,
        graphWidth: 100 - width,
      },
    })),

  /** Set visualizer area height */
  setVisualizerHeight: (height: number) =>
    set((s) => ({
      layout: {
        ...s.layout,
        visualizerHeight: height,
      },
    })),
}))
