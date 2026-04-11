/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   OscillatorSelector tests — verifies the four buttons render,
   onChange fires with the correct waveform type, and the
   selected button receives different styling. */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import OscillatorSelector from './OscillatorSelector'

describe('OscillatorSelector', () => {
  it('renders 4 waveform buttons', () => {
    render(<OscillatorSelector value="sine" onChange={() => {}} />)
    const buttons = screen.getAllByRole('radio')
    expect(buttons).toHaveLength(4)
  })

  it('fires onChange with the correct waveform type when clicked', () => {
    const onChange = vi.fn()
    render(<OscillatorSelector value="sine" onChange={onChange} />)
    const sawButton = screen.getByRole('radio', { name: /saw/i })
    fireEvent.click(sawButton)
    expect(onChange).toHaveBeenCalledWith('sawtooth')
  })

  it('fires onChange for square waveform', () => {
    const onChange = vi.fn()
    render(<OscillatorSelector value="sine" onChange={onChange} />)
    fireEvent.click(screen.getByRole('radio', { name: /square/i }))
    expect(onChange).toHaveBeenCalledWith('square')
  })

  it('fires onChange for triangle waveform', () => {
    const onChange = vi.fn()
    render(<OscillatorSelector value="sine" onChange={onChange} />)
    fireEvent.click(screen.getByRole('radio', { name: /triangle/i }))
    expect(onChange).toHaveBeenCalledWith('triangle')
  })

  it('marks the selected button via aria-checked', () => {
    render(<OscillatorSelector value="sawtooth" onChange={() => {}} />)
    const sawButton = screen.getByRole('radio', { name: /saw/i })
    const sineButton = screen.getByRole('radio', { name: /sine/i })
    expect(sawButton.getAttribute('aria-checked')).toBe('true')
    expect(sineButton.getAttribute('aria-checked')).toBe('false')
  })

  it('applies different background to the selected button', () => {
    render(<OscillatorSelector value="square" onChange={() => {}} />)
    const squareButton = screen.getByRole('radio', { name: /square/i }) as HTMLButtonElement
    const sineButton = screen.getByRole('radio', { name: /sine/i }) as HTMLButtonElement
    /* Selected button uses primary token; unselected uses transparent */
    expect(squareButton.style.backgroundColor).toBe('var(--color-primary)')
    expect(sineButton.style.backgroundColor).toBe('transparent')
  })

  it('exposes the group with radiogroup role', () => {
    render(<OscillatorSelector value="sine" onChange={() => {}} />)
    expect(screen.getByRole('radiogroup', { name: /oscillator waveform/i })).toBeInTheDocument()
  })
})
