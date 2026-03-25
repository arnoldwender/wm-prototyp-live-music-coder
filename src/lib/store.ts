/* ──────────────────────────────────────────────────────────
   App store — global state for transport, engine, and layout
   Uses Zustand for lightweight reactive state management.
   ────────────────────────────────────────────────────────── */

import { create } from 'zustand'
import type { EngineType } from '../types/engine'
import type { PanelLayout, ProjectFile } from '../types/project'
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

  /* Files */
  files: ProjectFile[]

  /* Transport actions */
  togglePlay: () => void
  stop: () => void
  toggleRecord: () => void
  setBpm: (bpm: number) => void

  /* Engine actions */
  setDefaultEngine: (engine: EngineType) => void

  /* Layout actions */
  togglePanel: (panel: PanelName) => void
  toggleGraph: () => void
  setEditorWidth: (width: number) => void
  setVisualizerHeight: (height: number) => void

  /* File management actions */
  addFile: (name: string, engine: EngineType) => void
  removeFile: (fileId: string) => void
  setActiveFile: (fileId: string) => void
  updateFileCode: (fileId: string, code: string) => void
  renameFile: (fileId: string, name: string) => void
  getActiveFile: () => ProjectFile | undefined
}

/** Default file loaded on startup — Strudel demo pattern */
const DEFAULT_FILE: ProjectFile = {
  id: 'file_1',
  name: 'main.js',
  engine: 'strudel' as EngineType,
  code: 'note("c3 e3 g3 b3").s("sawtooth").lpf(800)',
  active: true,
}

export const useAppStore = create<AppState>()((set, get) => ({
  /* --- Initial state --- */
  isPlaying: false,
  isRecording: false,
  bpm: DEFAULT_BPM,
  defaultEngine: DEFAULT_ENGINE,
  layout: { ...DEFAULT_LAYOUT, visiblePanels: { ...DEFAULT_LAYOUT.visiblePanels } },
  files: [{ ...DEFAULT_FILE }],

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

  /** Toggle the node graph panel — adjusts editor width accordingly */
  toggleGraph: () =>
    set((s) => {
      const show = !s.layout.showGraph;
      return {
        layout: {
          ...s.layout,
          showGraph: show,
          editorWidth: show ? 60 : 100,
          graphWidth: show ? 40 : 0,
        },
      };
    }),

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

  /* --- File management actions --- */

  /** Add a new file with the given name and engine */
  addFile: (name: string, engine: EngineType) =>
    set((s) => ({
      files: [
        ...s.files,
        {
          id: `file_${Date.now()}`,
          name,
          engine,
          code: '',
          active: false,
        },
      ],
    })),

  /** Remove a file by id — prevents removing the last file.
   *  If removing the active file, activates the first remaining file. */
  removeFile: (fileId: string) =>
    set((s) => {
      if (s.files.length <= 1) return s
      const removed = s.files.find((f) => f.id === fileId)
      const remaining = s.files.filter((f) => f.id !== fileId)
      /* If the removed file was active, activate the first remaining */
      if (removed?.active && remaining.length > 0) {
        remaining[0] = { ...remaining[0], active: true }
      }
      return { files: remaining }
    }),

  /** Set the active file — deactivates all others */
  setActiveFile: (fileId: string) =>
    set((s) => ({
      files: s.files.map((f) => ({
        ...f,
        active: f.id === fileId,
      })),
    })),

  /** Update the code content of a file */
  updateFileCode: (fileId: string, code: string) =>
    set((s) => ({
      files: s.files.map((f) =>
        f.id === fileId ? { ...f, code } : f,
      ),
    })),

  /** Rename a file */
  renameFile: (fileId: string, name: string) =>
    set((s) => ({
      files: s.files.map((f) =>
        f.id === fileId ? { ...f, name } : f,
      ),
    })),

  /** Get the currently active file */
  getActiveFile: () => get().files.find((f) => f.active),
}))
