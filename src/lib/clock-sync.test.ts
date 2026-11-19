/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ────────────────────────────────────────────────────────── */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  broadcastBpm,
  broadcastTransport,
  computePhaseAlignedLastEnd,
  initClockSync,
  stopClockSync,
} from './strudel-extensions'

describe('computePhaseAlignedLastEnd', () => {
  it('returns null when cycles are already aligned within 1%', () => {
    expect(computePhaseAlignedLastEnd(4.002, 4.002, 4.0, 0.5, 0)).toBeNull()
    expect(computePhaseAlignedLastEnd(5.995, 5.995, 6.0, 0.5, 0)).toBeNull()
  })

  it('advances monotonically to match leader fractional phase + elapsed latency', () => {
    // Leader was at cycle 10.25 with 500ms elapsed at 0.5 cps (+0.25 cycles) -> target = 10.50.
    // Follower sits at cycle 2.00 -> phase diff = 0.50 -> next lastEnd = 2.00 + 0.50 = 2.50.
    const next = computePhaseAlignedLastEnd(2.0, 2.0, 10.25, 0.5, 500)
    expect(next).toBeCloseTo(2.5, 5)
    // Never moves backward even if currentLastEnd > currentCycle
    const ahead = computePhaseAlignedLastEnd(3.2, 3.0, 10.25, 0.5, 500)
    expect(ahead).toBeGreaterThanOrEqual(3.2)
  })

  it('returns null on invalid inputs', () => {
    expect(computePhaseAlignedLastEnd(1, Number.NaN, 1, 0.5, 0)).toBeNull()
    expect(computePhaseAlignedLastEnd(1, 1, 1, 0, 0)).toBeNull()
  })
})

describe('ClockSync BroadcastChannel integration', () => {
  class MockBroadcastChannel {
    static instances: MockBroadcastChannel[] = []
    name: string
    onmessage: ((ev: MessageEvent) => void) | null = null
    constructor(name: string) {
      this.name = name
      MockBroadcastChannel.instances.push(this)
    }
    postMessage = vi.fn()
    close = vi.fn()
  }

  beforeEach(() => {
    vi.useFakeTimers()
    MockBroadcastChannel.instances = []
    ;(globalThis as unknown as { BroadcastChannel: unknown }).BroadcastChannel = MockBroadcastChannel
    window.__strudelRepl = {
      evaluate: vi.fn().mockResolvedValue(undefined),
      setCpm: vi.fn(),
      stop: vi.fn(),
      scheduler: {
        cps: 0.5,
        lastEnd: 2,
        num_ticks_since_cps_change: 4,
        now: () => 2.0,
      },
    }
  })

  afterEach(() => {
    stopClockSync()
    vi.useRealTimers()
    delete window.__strudelRepl
  })

  it('elects leader after 500ms and emits BPM, cycle phase, and transport transitions', () => {
    initClockSync()
    const ch = MockBroadcastChannel.instances[0]
    expect(ch.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'ping' }))

    vi.advanceTimersByTime(500)
    expect(ch.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'sync', bpm: 120 }))

    broadcastBpm(140)
    expect(ch.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'bpm', bpm: 140, cycle: 2 }),
    )

    broadcastTransport(false)
    expect(ch.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'transport', started: false }),
    )
  })

  it('aligns follower tempo, phase, and stop signal when another leader responds', () => {
    initClockSync()
    const ch = MockBroadcastChannel.instances[0]
    const sentAtMs = performance.timeOrigin + performance.now()

    ch.onmessage?.({
      data: { type: 'sync', bpm: 140, cps: 140 / 240, cycle: 8.5, sentAtMs },
    } as MessageEvent)

    expect(window.__strudelRepl?.setCpm).toHaveBeenCalledWith(35)
    expect(window.__strudelRepl?.scheduler?.lastEnd).toBeCloseTo(2.5, 2)
    expect(window.__strudelRepl?.scheduler?.num_ticks_since_cps_change).toBe(0)

    ch.onmessage?.({
      data: { type: 'transport', bpm: 140, cps: 140 / 240, cycle: 8.5, sentAtMs, started: false },
    } as MessageEvent)
    expect(window.__strudelRepl?.stop).toHaveBeenCalledTimes(1)
  })
})
