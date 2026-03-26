/* ──────────────────────────────────────────────────────────
   App store — global state for transport, engine, layout,
   gamification (XP, streaks, toasts, session stats).
   Uses Zustand for lightweight reactive state management.
   ────────────────────────────────────────────────────────── */

import { create } from 'zustand'
import type { EngineType } from '../types/engine'
import type { PanelLayout, ProjectFile } from '../types/project'
import type { Species, Stage } from '../types/beatling'

/** Brain stats for a single creature — synced to store for UI display */
export interface CreatureStat {
  id: string
  species: Species
  stage: Stage
  neuronCount: number
  synapseCount: number
  intelligence: number
  emotionalState: number
  phi: number
  totalFirings: number
  isSleeping: boolean
  xpTotal: number
  /* Normalized 0-1 position for canvas hit-testing */
  x: number
  y: number
}
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
  creaturesSpawned: number
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

  /* Beatling ecosystem — synced from BeatlingPanel every frame */
  creatureCount: number
  creatureStats: CreatureStat[]
  selectedCreatureId: string | null
  showBrainPanel: boolean
  setCreatureCount: (count: number) => void
  setCreatureStats: (stats: CreatureStat[]) => void
  selectCreature: (id: string | null) => void
  toggleBrainPanel: () => void

  /* Gamification: Achievement toast */
  pendingToast: ToastData | null
  showToast: (toast: ToastData) => void
  dismissToast: () => void

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
  trackCreatureSpawn: () => void

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
  creatureCount: 0,
  creatureStats: [],
  selectedCreatureId: null,
  showBrainPanel: false,

  /* --- Gamification initial state --- */
  pendingToast: null,
  userXp: 0,
  userLevel: 1,
  streak: loadStreak(),
  sessionStats: { startTime: Date.now(), evaluations: 0, creaturesSpawned: 0 },

  /* --- Beatling ecosystem --- */
  setCreatureCount: (count: number) => set({ creatureCount: count }),
  setCreatureStats: (stats: CreatureStat[]) => set({ creatureStats: stats }),
  selectCreature: (id: string | null) => set({ selectedCreatureId: id, showBrainPanel: id !== null }),
  toggleBrainPanel: () => set((s) => ({ showBrainPanel: !s.showBrainPanel, selectedCreatureId: null })),

  /* --- Gamification: Toast --- */
  showToast: (toast: ToastData) => set({ pendingToast: toast }),
  dismissToast: () => set({ pendingToast: null }),

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
  incrementEval: () => set((s) => ({
    sessionStats: { ...s.sessionStats, evaluations: s.sessionStats.evaluations + 1 },
  })),
  trackCreatureSpawn: () => set((s) => ({
    sessionStats: { ...s.sessionStats, creaturesSpawned: s.sessionStats.creaturesSpawned + 1 },
  })),

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
