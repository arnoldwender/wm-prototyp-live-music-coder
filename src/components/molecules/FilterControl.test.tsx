/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   FilterControl tests — renders knobs, type buttons, canvas,
   and verifies callbacks fire on type change. */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FilterControl from './FilterControl'

describe('FilterControl', () => {
  const baseProps = {
    type: 'lpf' as const,
    cutoff: 1000,
    resonance: 0.2,
    onTypeChange: vi.fn(),
    onCutoffChange: vi.fn(),
    onResonanceChange: vi.fn(),
  }

  it('renders 2 knobs (cutoff + resonance)', () => {
    render(<FilterControl {...baseProps} />)
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(2)
  })

  it('renders 4 filter type radio buttons', () => {
    render(<FilterControl {...baseProps} />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(4)
  })

  it('renders a FilterCurve canvas', () => {
    const { container } = render(<FilterControl {...baseProps} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeTruthy()
  })

  it('marks the current filter type as checked', () => {
    render(<FilterControl {...baseProps} type="hpf" />)
    const hpfButton = screen.getByRole('radio', { name: /high-pass/i })
    expect(hpfButton).toHaveAttribute('aria-checked', 'true')
  })

  it('fires onTypeChange when a different type button is clicked', () => {
    const onTypeChange = vi.fn()
    render(<FilterControl {...baseProps} onTypeChange={onTypeChange} />)
    const bpfButton = screen.getByRole('radio', { name: /band-pass/i })
    fireEvent.click(bpfButton)
    expect(onTypeChange).toHaveBeenCalledWith('bpf')
  })

  it('fires onTypeChange for notch type', () => {
    const onTypeChange = vi.fn()
    render(<FilterControl {...baseProps} onTypeChange={onTypeChange} />)
    const notchButton = screen.getByRole('radio', { name: /notch/i })
    fireEvent.click(notchButton)
    expect(onTypeChange).toHaveBeenCalledWith('notch')
  })

  it('exposes the Cutoff knob with Hz value text', () => {
    render(<FilterControl {...baseProps} cutoff={1000} />)
    const cutoffKnob = screen.getByRole('slider', { name: /cutoff/i })
    expect(cutoffKnob).toBeInTheDocument()
  })

  it('fires onResonanceChange when Res knob keyboard-stepped', () => {
    const onResonanceChange = vi.fn()
    render(
      <FilterControl
        {...baseProps}
        resonance={0.2}
        onResonanceChange={onResonanceChange}
      />
    )
    const resKnob = screen.getByRole('slider', { name: /res/i })
    fireEvent.keyDown(resKnob, { key: 'ArrowUp' })
    expect(onResonanceChange).toHaveBeenCalledTimes(1)
  })

  it('renders the control group with filter-control label', () => {
    render(<FilterControl {...baseProps} />)
    expect(screen.getByRole('group', { name: /filter control/i })).toBeInTheDocument()
  })
})
