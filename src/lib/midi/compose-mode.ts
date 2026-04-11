/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   MIDI Composition Mode — converts keyboard note events into
   Strudel code written directly into the CodeMirror editor.

   When enabled, pressing keys on a MIDI controller inserts
   note names (c4, d#3, etc.) at the cursor position. The user
   plays a melody → the editor fills with pattern code.

   Features:
   - Chord grouping (simultaneous notes in <angle brackets>)
   - Quantize snapping (delay flush to next beat boundary)
   - Undo stack (remove last N inserted notes from editor)
   - Auto-newline every 4 beats for readable code
   ────────────────────────────────────────────────────────── */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** MIDI note number to Strudel note name mapping */
const NOTE_NAMES = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b']

/** Quantize subdivision options — value is fraction of a beat */
export type QuantizeValue = '16th' | '8th' | '4th' | 'off'

/** Map subdivision name to beat fraction */
const QUANTIZE_MAP: Record<QuantizeValue, number> = {
  '16th': 0.25,
  '8th': 0.5,
  '4th': 1.0,
  'off': 0,
}

/** Convert MIDI note number (0-127) to Strudel note name (e.g., c4, eb3) */
export function midiToNoteName(midiNote: number): string {
  const octave = Math.floor(midiNote / 12) - 1
  const noteIndex = midiNote % 12
  return `${NOTE_NAMES[noteIndex]}${octave}`
}

/** Single undo-able insertion — tracks position and length in the editor */
interface UndoEntry {
  /** Cursor position before the insertion */
  from: number
  /** Number of characters inserted (including separator/newline) */
  length: number
  /** The text that was inserted */
  text: string
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
  /** Quantize subdivision — snap notes to the nearest beat boundary */
  quantize: QuantizeValue
  /** BPM used for quantize timing calculations */
  bpm: number
  /** Timestamp when compose mode was enabled (used for beat alignment) */
  startTime: number
  /** Undo stack — tracks the last N insertions for removal */
  undoStack: UndoEntry[]
  /** Maximum number of undo entries to keep */
  maxUndo: number
  /** Number of notes/chords flushed since last newline (for bar tracking) */
  notesSinceNewline: number
  /** How many beats per bar before auto-inserting a newline */
  beatsPerBar: number
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
  quantize: 'off',
  bpm: 120,
  startTime: 0,
  undoStack: [],
  maxUndo: 64,
  notesSinceNewline: 0,
  beatsPerBar: 4,
}

/** Enable composition mode — notes from MIDI keyboard write code in editor.
 * Accepts either a direct EditorView or a getter function that returns the
 * current view. The getter is preferred because the editor view can be
 * destroyed and recreated (theme changes, vim toggle, etc.). */
export function enableComposeMode(editorViewOrGetter: any, options?: {
  format?: 'mini' | 'note'
  includeVelocity?: boolean
  groupWindow?: number
  quantize?: QuantizeValue
  bpm?: number
  beatsPerBar?: number
}): void {
  state.enabled = true
  /* Store as getter if function, otherwise wrap in a getter */
  state.editorView = typeof editorViewOrGetter === 'function'
    ? editorViewOrGetter
    : editorViewOrGetter
  state.format = options?.format ?? 'mini'
  state.includeVelocity = options?.includeVelocity ?? false
  state.groupWindow = options?.groupWindow ?? 80
  state.quantize = options?.quantize ?? 'off'
  state.bpm = options?.bpm ?? 120
  state.beatsPerBar = options?.beatsPerBar ?? 4
  state.startTime = Date.now()
  state.buffer = []
  state.undoStack = []
  state.notesSinceNewline = 0
  console.log(`[ComposeMode] Enabled — quantize: ${state.quantize}, bpm: ${state.bpm}`)
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
 * Calculate milliseconds until the next quantize boundary.
 * Returns 0 when quantize is off.
 */
function msUntilNextBeat(): number {
  if (state.quantize === 'off') return 0

  const subdivision = QUANTIZE_MAP[state.quantize]
  /* Duration of one subdivision in milliseconds */
  const subdivisionMs = (subdivision / state.bpm) * 60_000
  const elapsed = Date.now() - state.startTime
  const remainder = elapsed % subdivisionMs

  /* If we're very close to a boundary (within 5ms), flush immediately */
  if (remainder < 5 || subdivisionMs - remainder < 5) return 0

  return subdivisionMs - remainder
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

  /* When quantize is on, delay the flush to the next beat boundary */
  const quantizeDelay = msUntilNextBeat()
  const flushDelay = Math.max(state.groupWindow, quantizeDelay)

  state.flushTimer = setTimeout(flushBuffer, flushDelay)
}

/** Flush the note buffer — write accumulated notes to the editor */
function flushBuffer(): void {
  if (state.buffer.length === 0 || !state.editorView) return
  /* Resolve getter function if editorView is a function (returns current ref) */

  const view = typeof state.editorView === 'function' ? state.editorView() : state.editorView
  if (!view) return /* editor was destroyed */
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

  /* Track beat count and insert newline on bar boundary */
  state.notesSinceNewline += 1

  const cursor = view.state.selection.main.head

  /* Determine prefix: newline on bar boundary, otherwise space separator */
  let prefix = ''
  if (state.notesSinceNewline > state.beatsPerBar) {
    /* Bar complete — insert newline for readability */
    prefix = '\n'
    state.notesSinceNewline = 1
  } else {
    /* If there's content before the cursor, add a space separator */
    const charBefore = cursor > 0 ? view.state.doc.sliceString(cursor - 1, cursor) : ''
    const needsSpace = cursor > 0 && charBefore !== ' ' && charBefore !== '\n' && charBefore !== '"' && charBefore !== '('
    if (needsSpace) prefix = ' '
  }

  const insert = prefix + text

  /* Record in undo stack before dispatching */
  state.undoStack.push({
    from: cursor,
    length: insert.length,
    text: insert,
  })

  /* Cap undo stack size */
  if (state.undoStack.length > state.maxUndo) {
    state.undoStack.shift()
  }

  view.dispatch({
    changes: { from: cursor, insert },
    selection: { anchor: cursor + insert.length },
  })
}

/**
 * Undo the last inserted note/chord from the editor.
 * Removes the text that was inserted by the most recent flush.
 * Returns true if an undo was performed, false if the stack is empty.
 */
export function undoLastNote(): boolean {
  if (!state.editorView || state.undoStack.length === 0) return false

  const entry = state.undoStack.pop()!
  const view = typeof state.editorView === 'function' ? state.editorView() : state.editorView
  if (!view) return false /* editor was destroyed */

  /* Verify the text at the expected position still matches (editor not modified externally) */
  const docLength = view.state.doc.length
  const from = entry.from
  const to = from + entry.length

  if (to > docLength) {
    /* Document has been modified, skip this undo entry */
    console.warn('[ComposeMode] Undo skipped — document changed externally')
    return false
  }

  const currentText = view.state.doc.sliceString(from, to)
  if (currentText !== entry.text) {
    console.warn('[ComposeMode] Undo skipped — text mismatch (document edited)')
    return false
  }

  /* Remove the inserted text */
  view.dispatch({
    changes: { from, to, insert: '' },
    selection: { anchor: from },
  })

  /* Decrement bar counter */
  if (state.notesSinceNewline > 0) {
    state.notesSinceNewline -= 1
  }

  return true
}

/**
 * Get the current undo stack depth.
 * Useful for UI to show how many undo steps remain.
 */
export function getUndoDepth(): number {
  return state.undoStack.length
}

/**
 * Update the BPM for quantize calculations.
 * Called when Strudel's clock tempo changes.
 */
export function setComposeBpm(bpm: number): void {
  state.bpm = bpm
}

/**
 * Update the quantize subdivision at runtime.
 * Allows switching between 16th/8th/4th/off without re-enabling.
 */
export function setQuantize(value: QuantizeValue): void {
  state.quantize = value
  console.log(`[ComposeMode] Quantize set to: ${value}`)
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
