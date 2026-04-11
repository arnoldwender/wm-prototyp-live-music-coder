/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   MIDI Composition Mode — converts keyboard note events into
   Strudel code written directly into the CodeMirror editor.

   Architecture based on knectardev/midi_strudel_dash pattern:
   - 20ms chord window (notes within 20ms = simultaneous chord)
   - Synchronous CM6 dispatch (no RAF, no requestAnimationFrame)
   - Direct view.dispatch({changes}) for each note/chord
   - Undo stack for removing last inserted text
   ────────────────────────────────────────────────────────── */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** MIDI note number to Strudel note name */
const NOTE_NAMES = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b']

export type QuantizeValue = '16th' | '8th' | '4th' | 'off'

/** Convert MIDI note number (0-127) to Strudel note name (c4, eb3, etc.) */
export function midiToNoteName(midiNote: number): string {
  const octave = Math.floor(midiNote / 12) - 1
  const noteIndex = midiNote % 12
  return `${NOTE_NAMES[noteIndex]}${octave}`
}

/* ── Undo tracking ──────────────────────────────────── */

interface UndoEntry {
  from: number
  length: number
  text: string
}

/* ── State ──────────────────────────────────────────── */

/** Captured note for chord grouping */
interface CapturedNote {
  midi: number
  name: string
  velocity: number
  time: number
}

let enabled = false
let viewGetter: (() => any) | null = null
let capturedNotes: CapturedNote[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
const undoStack: UndoEntry[] = []
let noteCount = 0

/** Chord detection window — notes within this ms are grouped */
const CHORD_WINDOW = 20

/** Max undo entries */
const MAX_UNDO = 64

/** Notes per line before auto-newline */
const NOTES_PER_LINE = 8

/* ── Public API ─────────────────────────────────────── */

/** Enable compose mode. Pass a GETTER function for the EditorView
 * (not the view directly — it changes when the editor rebuilds). */
export function enableComposeMode(viewGetterFn: (() => any) | any, _options?: {
  quantize?: QuantizeValue
  bpm?: number
  beatsPerBar?: number
}): void {
  enabled = true
  viewGetter = typeof viewGetterFn === 'function' ? viewGetterFn : () => viewGetterFn
  capturedNotes = []
  noteCount = 0
  undoStack.length = 0
  console.log('[ComposeMode] Enabled')
}

export function disableComposeMode(): void {
  enabled = false
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null }
  capturedNotes = []
  console.log('[ComposeMode] Disabled')
}

export function toggleComposeMode(viewGetterFn: (() => any) | any): boolean {
  if (enabled) { disableComposeMode(); return false }
  enableComposeMode(viewGetterFn)
  return true
}

export function isComposeModeActive(): boolean {
  return enabled
}

/** Remove the last inserted note/chord from the editor */
export function undoLastNote(): boolean {
  const view = viewGetter?.()
  if (!view || undoStack.length === 0) return false

  const entry = undoStack.pop()!
  const docLength = view.state.doc.length
  const from = entry.from
  const to = Math.min(from + entry.length, docLength)

  /* Verify text still matches before removing */
  const currentText = view.state.doc.sliceString(from, to)
  if (currentText !== entry.text) {
    console.warn('[ComposeMode] Undo skipped — editor text changed')
    return false
  }

  view.dispatch({ changes: { from, to, insert: '' }, selection: { anchor: from } })
  noteCount = Math.max(0, noteCount - 1)
  return true
}

export function getUndoDepth(): number {
  return undoStack.length
}

/* ── Note handler (called from strudel-keys.ts) ───── */

/**
 * Handle a MIDI note-on in compose mode.
 * Groups simultaneous notes (chords) using a 20ms time window.
 */
export function composeNoteOn(midiNote: number, velocity: number): void {
  if (!enabled) return

  const view = viewGetter?.()
  if (!view) {
    console.warn('[ComposeMode] No editor view — is the editor mounted?')
    return
  }

  const now = Date.now()
  const noteName = midiToNoteName(midiNote)

  capturedNotes.push({ midi: midiNote, name: noteName, velocity, time: now })
  console.log(`[ComposeMode] Captured: ${noteName} (${capturedNotes.length} in buffer)`)

  /* Reset flush timer — wait for more notes in the chord window */
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(() => flush(view), CHORD_WINDOW)
}

/* ── Flush buffer → editor ────────────────────────── */

function flush(view: any): void {
  if (capturedNotes.length === 0) return

  /* Re-resolve view in case it changed during the 20ms window */
  const currentView = viewGetter?.() ?? view
  if (!currentView?.state) {
    console.warn('[ComposeMode] View lost during flush')
    capturedNotes = []
    return
  }

  /* Build text: single note or <chord> */
  const notes = capturedNotes.map(n => n.name)
  capturedNotes = []

  let text: string
  if (notes.length === 1) {
    text = notes[0]
  } else {
    /* Sort chord notes low to high for readability */
    text = `<${notes.join(' ')}>`
  }

  /* Determine prefix: space or newline */
  const cursor = currentView.state.selection.main.head
  let prefix = ''

  noteCount++
  if (noteCount > 1 && noteCount % NOTES_PER_LINE === 1) {
    /* New line every N notes for readability */
    prefix = '\n'
  } else if (cursor > 0) {
    const charBefore = currentView.state.doc.sliceString(cursor - 1, cursor)
    if (charBefore !== ' ' && charBefore !== '\n' && charBefore !== '"' && charBefore !== '(') {
      prefix = ' '
    }
  }

  const insert = prefix + text

  /* Record for undo */
  undoStack.push({ from: cursor, length: insert.length, text: insert })
  if (undoStack.length > MAX_UNDO) undoStack.shift()

  /* Insert into editor */
  currentView.dispatch({
    changes: { from: cursor, insert },
    selection: { anchor: cursor + insert.length },
  })

  console.log(`[ComposeMode] Wrote: "${insert.trim()}" at ${cursor}`)
}

/* ── Pattern template helpers ─────────────────────── */

export function insertPatternTemplate(editorView: any, template: 'melody' | 'chord' | 'drums'): void {
  const view = typeof editorView === 'function' ? editorView() : editorView
  if (!view) return

  const templates: Record<string, string> = {
    melody: '// Play a melody on your MIDI keyboard\n$: note("',
    chord: '// Play chords on your MIDI keyboard\n$: note("<',
    drums: '// Trigger drum sounds from MIDI pads\n$: s("',
  }

  const cursor = view.state.selection.main.head
  const text = templates[template] ?? templates.melody

  view.dispatch({
    changes: { from: cursor, insert: text },
    selection: { anchor: cursor + text.length },
  })
}

/* Compose BPM/quantize setters (for future UI integration) */
export function setComposeBpm(_bpm: number): void { /* reserved */ }
export function setQuantize(_q: QuantizeValue): void { /* reserved */ }
