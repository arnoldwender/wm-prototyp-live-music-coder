/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   MIDI Composition Mode — converts keyboard note events into
   Strudel code written directly into the CodeMirror editor.

   When enabled, pressing keys on a MIDI controller inserts
   note names (c4, d#3, etc.) at the cursor position. The user
   plays a melody → the editor fills with pattern code.
   ────────────────────────────────────────────────────────── */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** MIDI note number to Strudel note name mapping */
const NOTE_NAMES = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b']

/** Convert MIDI note number (0-127) to Strudel note name (e.g., c4, eb3) */
export function midiToNoteName(midiNote: number): string {
  const octave = Math.floor(midiNote / 12) - 1
  const noteIndex = midiNote % 12
  return `${NOTE_NAMES[noteIndex]}${octave}`
}

/** Composition mode state */
interface ComposeState {
  enabled: boolean
  /** Collected notes for the current beat/group */
  buffer: { note: string; velocity: number; timestamp: number }[]
  /** Time window to group simultaneous notes (ms) */
  groupWindow: number
  /** Timer for flushing the note buffer */
  flushTimer: ReturnType<typeof setTimeout> | null
  /** Reference to CodeMirror EditorView */
  editorView: any
  /** Format: 'mini' for mini-notation, 'note' for note() function calls */
  format: 'mini' | 'note'
  /** Whether to include velocity */
  includeVelocity: boolean
  /** Separator between notes */
  separator: ' '
}

const state: ComposeState = {
  enabled: false,
  buffer: [],
  groupWindow: 80,
  flushTimer: null,
  editorView: null,
  format: 'mini',
  includeVelocity: false,
  separator: ' ',
}

/** Enable composition mode — notes from MIDI keyboard write code in editor */
export function enableComposeMode(editorView: any, options?: {
  format?: 'mini' | 'note'
  includeVelocity?: boolean
  groupWindow?: number
}): void {
  state.enabled = true
  state.editorView = editorView
  state.format = options?.format ?? 'mini'
  state.includeVelocity = options?.includeVelocity ?? false
  state.groupWindow = options?.groupWindow ?? 80
  state.buffer = []
  console.log('[ComposeMode] Enabled — MIDI notes will be written to editor')
}

/** Disable composition mode */
export function disableComposeMode(): void {
  state.enabled = false
  if (state.flushTimer) clearTimeout(state.flushTimer)
  state.buffer = []
  console.log('[ComposeMode] Disabled')
}

/** Toggle composition mode */
export function toggleComposeMode(editorView: any): boolean {
  if (state.enabled) {
    disableComposeMode()
    return false
  } else {
    enableComposeMode(editorView)
    return true
  }
}

/** Check if composition mode is active */
export function isComposeModeActive(): boolean {
  return state.enabled
}

/**
 * Handle a MIDI note-on event in composition mode.
 * Buffers notes and flushes them as a group after the group window.
 * Called from strudel-keys.ts when a note is received.
 */
export function composeNoteOn(midiNote: number, velocity: number): void {
  if (!state.enabled || !state.editorView) return

  const noteName = midiToNoteName(midiNote)
  state.buffer.push({ note: noteName, velocity, timestamp: Date.now() })

  /* Reset the flush timer — group simultaneous notes (chords) */
  if (state.flushTimer) clearTimeout(state.flushTimer)
  state.flushTimer = setTimeout(flushBuffer, state.groupWindow)
}

/** Flush the note buffer — write accumulated notes to the editor */
function flushBuffer(): void {
  if (state.buffer.length === 0 || !state.editorView) return

  const view = state.editorView
  const notes = state.buffer.map((n) => n.note)
  state.buffer = []

  let text: string

  if (notes.length === 1) {
    /* Single note */
    text = notes[0]
  } else {
    /* Chord — wrap in angle brackets for mini-notation: <c4 e4 g4> */
    text = `<${notes.join(' ')}>`
  }

  /* Add separator */
  const cursor = view.state.selection.main.head

  /* If there's content before the cursor, add a space separator */
  const charBefore = cursor > 0 ? view.state.doc.sliceString(cursor - 1, cursor) : ''
  const needsSpace = cursor > 0 && charBefore !== ' ' && charBefore !== '\n' && charBefore !== '"' && charBefore !== '('

  const insert = (needsSpace ? ' ' : '') + text

  view.dispatch({
    changes: { from: cursor, insert },
    selection: { anchor: cursor + insert.length },
  })
}

/**
 * Insert a complete Strudel pattern template at cursor position.
 * Used by the MIDI quick-action menu to scaffold a pattern.
 */
export function insertPatternTemplate(editorView: any, template: 'melody' | 'chord' | 'drums'): void {
  if (!editorView) return

  const templates: Record<string, string> = {
    melody: '// Play a melody on your MIDI keyboard\n$: note("',
    chord: '// Play chords on your MIDI keyboard\n$: note("<',
    drums: '// Trigger drum sounds from MIDI pads\n$: s("',
  }

  const cursor = editorView.state.selection.main.head
  const text = templates[template] ?? templates.melody

  editorView.dispatch({
    changes: { from: cursor, insert: text },
    selection: { anchor: cursor + text.length },
  })
}
