// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   Compose mode tests — MIDI note conversion, enable/disable
   toggle, and note buffering with mock EditorView.
   ────────────────────────────────────────────────────────── */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  midiToNoteName,
  enableComposeMode,
  disableComposeMode,
  isComposeModeActive,
  composeNoteOn,
} from './compose-mode'

/** Creates a mock CodeMirror EditorView with a dispatch spy */
function createMockEditorView() {
  return {
    state: {
      selection: { main: { head: 0 } },
      doc: { sliceString: () => '' },
    },
    dispatch: vi.fn(),
  }
}

describe('compose-mode', () => {
  /* Reset state between tests by disabling compose mode */
  beforeEach(() => {
    disableComposeMode()
  })

  /* --- midiToNoteName --- */

  it('converts MIDI 48 to c3', () => {
    expect(midiToNoteName(48)).toBe('c3')
  })

  it('converts MIDI 60 to c4', () => {
    expect(midiToNoteName(60)).toBe('c4')
  })

  it('converts MIDI 61 to db4', () => {
    expect(midiToNoteName(61)).toBe('db4')
  })

  it('converts MIDI 69 to a4', () => {
    expect(midiToNoteName(69)).toBe('a4')
  })

  it('converts MIDI 72 to c5', () => {
    expect(midiToNoteName(72)).toBe('c5')
  })

  /* --- enableComposeMode / disableComposeMode --- */

  it('enableComposeMode activates compose mode', () => {
    const view = createMockEditorView()
    expect(isComposeModeActive()).toBe(false)
    enableComposeMode(view)
    expect(isComposeModeActive()).toBe(true)
  })

  it('disableComposeMode deactivates compose mode', () => {
    const view = createMockEditorView()
    enableComposeMode(view)
    expect(isComposeModeActive()).toBe(true)
    disableComposeMode()
    expect(isComposeModeActive()).toBe(false)
  })

  it('toggling enable/disable cycles state correctly', () => {
    const view = createMockEditorView()
    expect(isComposeModeActive()).toBe(false)
    enableComposeMode(view)
    expect(isComposeModeActive()).toBe(true)
    disableComposeMode()
    expect(isComposeModeActive()).toBe(false)
    enableComposeMode(view)
    expect(isComposeModeActive()).toBe(true)
  })

  /* --- isComposeModeActive --- */

  it('returns false by default', () => {
    expect(isComposeModeActive()).toBe(false)
  })

  it('returns true after enabling', () => {
    enableComposeMode(createMockEditorView())
    expect(isComposeModeActive()).toBe(true)
  })

  /* --- composeNoteOn --- */

  it('buffers a note and dispatches to the editor', async () => {
    vi.useFakeTimers()
    const view = createMockEditorView()
    enableComposeMode(view)

    composeNoteOn(60, 100)

    /* Flush the group window timer (default 80ms) */
    vi.advanceTimersByTime(100)

    expect(view.dispatch).toHaveBeenCalledTimes(1)
    const call = view.dispatch.mock.calls[0][0]
    expect(call.changes.insert).toContain('c4')

    vi.useRealTimers()
  })

  it('does not dispatch when compose mode is disabled', async () => {
    vi.useFakeTimers()
    const view = createMockEditorView()

    /* Mode is disabled — note should be ignored */
    composeNoteOn(60, 100)
    vi.advanceTimersByTime(100)

    expect(view.dispatch).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})
