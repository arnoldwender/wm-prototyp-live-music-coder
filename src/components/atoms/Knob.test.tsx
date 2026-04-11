/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Knob tests — rendering, aria attributes, pointer drag,
   wheel, double-click reset, and keyboard a11y. */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Knob from './Knob'

describe('Knob', () => {
  it('renders with label, unit, and formatted value', () => {
    render(
      <Knob
        value={0.5}
        min={0}
        max={100}
        label="Test"
        unit="%"
        onChange={() => {}}
      />
    )
    expect(screen.getByText('Test')).toBeInTheDocument()
    /* 0.5 on 0-100 range = 50, rounded to int for unit '%' */
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('exposes slider role with correct aria values', () => {
    render(
      <Knob
        value={0.25}
        min={0}
        max={1}
        label="Gain"
        onChange={() => {}}
      />
    )
    const slider = screen.getByRole('slider', { name: /gain/i })
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '1')
    expect(slider).toHaveAttribute('aria-valuenow', '0.25')
  })

  it('formats Hz display as kHz above 1000', () => {
    render(
      <Knob
        value={1}
        min={20}
        max={20000}
        label="Cutoff"
        unit="Hz"
        onChange={() => {}}
      />
    )
    /* value=1 maps to max=20000 which formats to "20.0k" */
    expect(screen.getByText('20.0k')).toBeInTheDocument()
  })

  it('fires onChange with defaultValue on double-click', () => {
    const onChange = vi.fn()
    render(
      <Knob
        value={0.8}
        label="Res"
        defaultValue={0.1}
        onChange={onChange}
      />
    )
    const slider = screen.getByRole('slider')
    fireEvent.doubleClick(slider)
    expect(onChange).toHaveBeenCalledWith(0.1)
  })

  it('fires onChange when ArrowUp is pressed', () => {
    const onChange = vi.fn()
    render(
      <Knob
        value={0.5}
        step={0.1}
        label="Volume"
        onChange={onChange}
      />
    )
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toBeCloseTo(0.6)
  })

  it('fires onChange when ArrowDown is pressed', () => {
    const onChange = vi.fn()
    render(
      <Knob
        value={0.5}
        step={0.1}
        label="Volume"
        onChange={onChange}
      />
    )
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'ArrowDown' })
    expect(onChange.mock.calls[0][0]).toBeCloseTo(0.4)
  })

  it('jumps to 0 on Home key and 1 on End key', () => {
    const onChange = vi.fn()
    render(<Knob value={0.5} label="Test" onChange={onChange} />)
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'Home' })
    expect(onChange).toHaveBeenLastCalledWith(0)
    fireEvent.keyDown(slider, { key: 'End' })
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('resets to defaultValue on Enter key', () => {
    const onChange = vi.fn()
    render(
      <Knob
        value={0.9}
        label="Test"
        defaultValue={0.42}
        onChange={onChange}
      />
    )
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(0.42)
  })

  it('responds to pointerdown by starting drag (no immediate change)', () => {
    const onChange = vi.fn()
    render(<Knob value={0.5} label="Test" onChange={onChange} />)
    const slider = screen.getByRole('slider')
    ;(slider as unknown as SVGSVGElement).setPointerCapture = vi.fn()
    fireEvent.pointerDown(slider, { clientY: 100, pointerId: 1 })
    /* pointerdown alone shouldn't fire onChange — only subsequent movement */
    expect(onChange).not.toHaveBeenCalled()
  })

  it('rounds ms unit to integer', () => {
    render(
      <Knob
        value={0.5}
        min={0}
        max={1000}
        label="Attack"
        unit="ms"
        onChange={() => {}}
      />
    )
    expect(screen.getByText('500')).toBeInTheDocument()
  })
})
