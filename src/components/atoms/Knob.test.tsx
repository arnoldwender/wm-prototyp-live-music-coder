/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Knob tests — rendering, aria attributes, pointer drag,
   wheel, double-click reset, and keyboard a11y. */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Knob from './Knob'

/** Start a drag on the knob. jsdom has no setPointerCapture on SVG elements. */
function startDrag(slider: HTMLElement, clientY = 100) {
  ;(slider as unknown as SVGSVGElement).setPointerCapture = vi.fn()
  fireEvent.pointerDown(slider, { clientY, pointerId: 1 })
}

/** Collect the AbortSignals the knob registers its document listeners with.
 *
 *  A stranded listener is invisible to behaviour: handleDocPointerMove bails on
 *  the drag flag, so a knob that never detaches anything still reports no
 *  onChange after release while piling listeners onto documentElement, one set
 *  per drag, for the life of the page. The signal is the only observable that
 *  tells the two apart. */
function trackDragSignals() {
  const root = document.documentElement
  const realAdd = root.addEventListener.bind(root)
  const signals: AbortSignal[] = []
  const spy = vi.spyOn(root, 'addEventListener').mockImplementation(
    (
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      opts?: boolean | AddEventListenerOptions,
    ) => {
      if (opts && typeof opts === 'object' && opts.signal) signals.push(opts.signal)
      realAdd(type, listener, opts)
    },
  )
  return { signals, restore: () => spy.mockRestore() }
}

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
    startDrag(slider)
    /* pointerdown alone shouldn't fire onChange — only subsequent movement */
    expect(onChange).not.toHaveBeenCalled()
  })

  /* ── Drag teardown ──────────────────────────────────────
     The document-level listeners outlive the SVG's own event surface by
     design, so nothing in the component tree removes them for us. These pin
     the contract that ends a drag; without them, a leak is silent — the knob
     keeps answering to a pointer the user already released. */

  it('follows the pointer while dragging', () => {
    const onChange = vi.fn()
    render(<Knob value={0.5} label="Test" onChange={onChange} />)
    startDrag(screen.getByRole('slider'))
    fireEvent.pointerMove(document.documentElement, { clientY: 80 })
    /* 20px up × 0.005 sensitivity = +0.1 */
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toBeCloseTo(0.6)
  })

  it('stops following the pointer after pointerup', () => {
    const onChange = vi.fn()
    render(<Knob value={0.5} label="Test" onChange={onChange} />)
    startDrag(screen.getByRole('slider'))
    fireEvent.pointerMove(document.documentElement, { clientY: 80 })
    fireEvent.pointerUp(document.documentElement)
    onChange.mockClear()

    fireEvent.pointerMove(document.documentElement, { clientY: 40 })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('stops following the pointer after pointercancel', () => {
    const onChange = vi.fn()
    render(<Knob value={0.5} label="Test" onChange={onChange} />)
    startDrag(screen.getByRole('slider'))
    fireEvent.pointerCancel(document.documentElement)

    fireEvent.pointerMove(document.documentElement, { clientY: 40 })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('stops calling onChange after unmounting mid-drag', () => {
    const onChange = vi.fn()
    const { unmount } = render(<Knob value={0.5} label="Test" onChange={onChange} />)
    startDrag(screen.getByRole('slider'))
    unmount()

    fireEvent.pointerMove(document.documentElement, { clientY: 40 })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('detaches — not merely disarms — its listeners on pointerup', () => {
    const { signals, restore } = trackDragSignals()
    try {
      render(<Knob value={0.5} label="Test" onChange={vi.fn()} />)
      startDrag(screen.getByRole('slider'))
      expect(signals.length).toBeGreaterThan(0)
      expect(signals.some((s) => s.aborted)).toBe(false)

      fireEvent.pointerUp(document.documentElement)
      expect(signals.every((s) => s.aborted)).toBe(true)
    } finally {
      restore()
    }
  })

  it('detaches its listeners on pointercancel', () => {
    const { signals, restore } = trackDragSignals()
    try {
      render(<Knob value={0.5} label="Test" onChange={vi.fn()} />)
      startDrag(screen.getByRole('slider'))
      fireEvent.pointerCancel(document.documentElement)
      expect(signals.length).toBeGreaterThan(0)
      expect(signals.every((s) => s.aborted)).toBe(true)
    } finally {
      restore()
    }
  })

  it('detaches its listeners when unmounted mid-drag', () => {
    const { signals, restore } = trackDragSignals()
    try {
      const { unmount } = render(<Knob value={0.5} label="Test" onChange={vi.fn()} />)
      startDrag(screen.getByRole('slider'))
      unmount()
      expect(signals.length).toBeGreaterThan(0)
      expect(signals.every((s) => s.aborted)).toBe(true)
    } finally {
      restore()
    }
  })

  it('does not strand the first drag when a second starts without a pointerup', () => {
    const onChange = vi.fn()
    const { signals, restore } = trackDragSignals()
    try {
      const { unmount } = render(<Knob value={0.5} label="Test" onChange={onChange} />)
      const slider = screen.getByRole('slider')
      startDrag(slider, 100)
      const firstDragSignals = [...signals]
      startDrag(slider, 100) /* second pointerdown, no intervening pointerup */
      expect(firstDragSignals.every((s) => s.aborted)).toBe(true)

      fireEvent.pointerMove(document.documentElement, { clientY: 80 })
      /* One live registration, so one call — not one per stranded drag */
      expect(onChange).toHaveBeenCalledTimes(1)

      unmount()
      expect(signals.every((s) => s.aborted)).toBe(true)
    } finally {
      restore()
    }
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
