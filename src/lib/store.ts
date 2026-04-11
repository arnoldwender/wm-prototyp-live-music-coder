/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   App store — global state for transport, engine, layout,
   gamification (XP, streaks, toasts, session stats).
   Uses Zustand for lightweight reactive state management.
   ────────────────────────────────────────────────────────── */

import { create } from 'zustand'
import type { EngineType } from '../types/engine'
import type { PanelLayout, ProjectFile } from '../types/project'
import { DEFAULT_BPM, MIN_BPM, MAX_BPM, DEFAULT_ENGINE, DEFAULT_LAYOUT } from './constants'

/** Toast data for achievement notifications */
export interface ToastData {
  title: string
  description: string
  icon: string
}

/** Streak tracking state */
export interface StreakState {
  current: number
  lastActiveDate: string | null
}

/** Session statistics for end-of-session summary */
export interface SessionStats {
  startTime: number
  evaluations: number
}

/** Visible panel names that can be toggled */
type PanelName = keyof PanelLayout['visiblePanels']

/** XP required to reach a given level. Level 1 starts at 0 XP. */
export function xpForLevel(n: number): number {
  if (n <= 1) return 0
  return Math.floor(100 * Math.pow(n - 1, 1.5))
}

/** Calculate level from total XP */
function calculateLevel(xp: number): number {
  let level = 1
  while (level < 50 && xp >= xpForLevel(level + 1)) {
    level++
  }
  return level
}

/** Load streak from localStorage */
function loadStreak(): StreakState {
  try {
    const raw = localStorage.getItem('lmc-streak')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore parse errors */ }
  return { current: 0, lastActiveDate: null }
}

/** Persist streak to localStorage */
function saveStreak(streak: StreakState): void {
  try {
    localStorage.setItem('lmc-streak', JSON.stringify(streak))
  } catch { /* ignore storage errors */ }
}

/** Get today's date as YYYY-MM-DD string */
function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Get yesterday's date as YYYY-MM-DD string */
function yesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

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

  /* Editor settings — synced from SettingsPanel for reactive CM6 reconfiguration */
  editorTheme: string
  vimMode: boolean
  setEditorTheme: (id: string) => void
  setVimMode: (enabled: boolean) => void

  /* Synth panel — selected oscillator waveform for the on-screen MIDI keyboard */
  synthOscillator: 'sine' | 'sawtooth' | 'square' | 'triangle'
  setSynthOscillator: (type: 'sine' | 'sawtooth' | 'square' | 'triangle') => void

  /* Detail panel — right collapsible sidebar */
  activeDetailSection: string | null
  detailPanelWidth: number
  setActiveDetailSection: (section: string | null) => void
  setDetailPanelWidth: (width: number) => void
  toggleDetailSection: (section: string) => void
  zenMode: boolean
  toggleZenMode: () => void

  /* Gamification: Achievement toast */
  pendingToast: ToastData | null
  showToast: (toast: ToastData) => void
  dismissToast: () => void

  /* Gamification: Engine usage tracking */
  usedEngines: Set<string>
  trackEngine: (engine: string) => void

  /* Gamification: User XP & Level */
  userXp: number
  userLevel: number
  addUserXp: (amount: number) => void

  /* Gamification: Streak */
  streak: StreakState
  checkStreak: () => void

  /* Gamification: Session stats */
  sessionStats: SessionStats
  incrementEval: () => void

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
  setFileEngine: (fileId: string, engine: EngineType) => void
  renameFile: (fileId: string, name: string) => void
  getActiveFile: () => ProjectFile | undefined
}

/** Load editor settings from localStorage for initial store hydration */
function loadEditorSettingsForStore(): { editorTheme: string; vimMode: boolean } {
  try {
    const raw = localStorage.getItem('lmc-editor-settings')
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        editorTheme: typeof parsed.themeId === 'string' ? parsed.themeId : 'purple',
        vimMode: typeof parsed.vimMode === 'boolean' ? parsed.vimMode : false,
      }
    }
  } catch { /* corrupted storage */ }
  return { editorTheme: 'purple', vimMode: false }
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

  /* Editor settings — hydrated from localStorage */
  editorTheme: loadEditorSettingsForStore().editorTheme,
  vimMode: loadEditorSettingsForStore().vimMode,
  setEditorTheme: (id: string) => set({ editorTheme: id }),
  setVimMode: (enabled: boolean) => set({ vimMode: enabled }),

  /* Synth panel — defaults to sine, the most musical and forgiving waveform */
  synthOscillator: 'sine',
  setSynthOscillator: (type) => set({ synthOscillator: type }),

  activeDetailSection: 'samples',
  detailPanelWidth: 280,
  setActiveDetailSection: (section: string | null) => set({ activeDetailSection: section }),
  setDetailPanelWidth: (width: number) => set({ detailPanelWidth: width }),
  toggleDetailSection: (section: string) => set((s) => ({
    activeDetailSection: s.activeDetailSection === section ? null : section,
  })),
  zenMode: false,
  toggleZenMode: () => set((s) => ({ zenMode: !s.zenMode })),

  /* --- Gamification initial state --- */
  pendingToast: null,
  usedEngines: new Set<string>(),
  userXp: 0,
  userLevel: 1,
  streak: loadStreak(),
  sessionStats: { startTime: Date.now(), evaluations: 0 },

  /* --- Gamification: Toast --- */
  showToast: (toast: ToastData) => set({ pendingToast: toast }),
  dismissToast: () => set({ pendingToast: null }),

  /* --- Gamification: Engine tracking --- */
  trackEngine: (engine: string) => {
    const state = get()
    if (state.usedEngines.has(engine)) return
    const newSet = new Set(state.usedEngines)
    newSet.add(engine)
    set({ usedEngines: newSet })
  },

  /* --- Gamification: XP & Level --- */
  addUserXp: (amount: number) => set((s) => {
    const newXp = s.userXp + amount
    const newLevel = calculateLevel(newXp)
    return { userXp: newXp, userLevel: newLevel }
  }),

  /* --- Gamification: Streak --- */
  checkStreak: () => set((s) => {
    const today = todayString()
    const yesterday = yesterdayString()
    let newStreak: StreakState

    if (s.streak.lastActiveDate === today) {
      /* Already active today — no change */
      return {}
    } else if (s.streak.lastActiveDate === yesterday) {
      /* Consecutive day — increment streak */
      newStreak = { current: s.streak.current + 1, lastActiveDate: today }
    } else {
      /* Gap or first visit — reset to 1 */
      newStreak = { current: 1, lastActiveDate: today }
    }

    saveStreak(newStreak)
    return { streak: newStreak }
  }),

  /* --- Gamification: Session stats --- */
  incrementEval: () => {
    const s = get()
    const newEvals = s.sessionStats.evaluations + 1
    set({ sessionStats: { ...s.sessionStats, evaluations: newEvals } })
  },

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

  /** Change a file's audio engine */
  setFileEngine: (fileId: string, engine: EngineType) =>
    set((s) => ({
      files: s.files.map((f) =>
        f.id === fileId ? { ...f, engine } : f,
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
