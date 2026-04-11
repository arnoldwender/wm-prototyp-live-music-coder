/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   VirtualKeyboard tests — covers key counts, click triggering,
   active highlight rendering, and the QWERTY mapping. */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import VirtualKeyboard from './VirtualKeyboard'

describe('VirtualKeyboard', () => {
  it('renders 14 white keys for 2 octaves', () => {
    render(<VirtualKeyboard onNoteOn={() => {}} onNoteOff={() => {}} />)
    const whiteKeys = document.querySelectorAll('[data-key-type="white"]')
    expect(whiteKeys).toHaveLength(14)
  })

  it('renders 10 black keys for 2 octaves', () => {
    render(<VirtualKeyboard onNoteOn={() => {}} onNoteOff={() => {}} />)
    const blackKeys = document.querySelectorAll('[data-key-type="black"]')
    expect(blackKeys).toHaveLength(10)
  })

  it('fires onNoteOn with the correct MIDI note when a key is pressed', () => {
    const onNoteOn = vi.fn()
    render(<VirtualKeyboard startOctave={3} onNoteOn={onNoteOn} onNoteOff={() => {}} />)
    /* First white key at startOctave=3 should be C3 = MIDI 48 */
    const whiteKeys = document.querySelectorAll('[data-key-type="white"]')
    const firstKey = whiteKeys[0] as HTMLButtonElement
    firstKey.setPointerCapture = vi.fn()
    fireEvent.pointerDown(firstKey, { clientX: 0, clientY: 0, pointerId: 1 })
    expect(onNoteOn).toHaveBeenCalledTimes(1)
    expect(onNoteOn.mock.calls[0][0]).toBe(48)
  })

  it('highlights active notes via aria-pressed', () => {
    render(
      <VirtualKeyboard
        startOctave={3}
        activeNotes={[48]}
        onNoteOn={() => {}}
        onNoteOff={() => {}}
      />
    )
    const whiteKeys = document.querySelectorAll('[data-key-type="white"]')
    const firstKey = whiteKeys[0] as HTMLButtonElement
    expect(firstKey.getAttribute('aria-pressed')).toBe('true')
  })

  it('does not highlight inactive notes', () => {
    render(
      <VirtualKeyboard
        startOctave={3}
        activeNotes={[]}
        onNoteOn={() => {}}
        onNoteOff={() => {}}
      />
    )
    const whiteKeys = document.querySelectorAll('[data-key-type="white"]')
    const firstKey = whiteKeys[0] as HTMLButtonElement
    expect(firstKey.getAttribute('aria-pressed')).toBe('false')
  })

  it('maps QWERTY A key to MIDI 48 (C3) at startOctave=3', () => {
    const onNoteOn = vi.fn()
    render(<VirtualKeyboard startOctave={3} onNoteOn={onNoteOn} onNoteOff={() => {}} />)
    /* Dispatch on window — VirtualKeyboard listens at window level */
    fireEvent.keyDown(window, { key: 'a' })
    expect(onNoteOn).toHaveBeenCalledTimes(1)
    expect(onNoteOn.mock.calls[0][0]).toBe(48)
  })

  it('maps QWERTY S key to MIDI 50 (D3) at startOctave=3', () => {
    const onNoteOn = vi.fn()
    render(<VirtualKeyboard startOctave={3} onNoteOn={onNoteOn} onNoteOff={() => {}} />)
    fireEvent.keyDown(window, { key: 's' })
    expect(onNoteOn.mock.calls[0][0]).toBe(50)
  })

  it('exposes the keyboard with role group and accessible label', () => {
    render(<VirtualKeyboard onNoteOn={() => {}} onNoteOff={() => {}} />)
    expect(screen.getByRole('group', { name: /piano keyboard/i })).toBeInTheDocument()
  })
})
