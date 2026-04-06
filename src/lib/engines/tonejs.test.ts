// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   Tone.js engine — unit tests (structural, no real audio)
   ────────────────────────────────────────────────────────── */

import { describe, it, expect } from 'vitest'
import { ToneJsEngine } from './tonejs'

describe('ToneJsEngine', () => {
  it('has correct name', () => {
    const engine = new ToneJsEngine()
    expect(engine.name).toBe('tonejs')
  })

  it('can be instantiated without init', () => {
    const engine = new ToneJsEngine()
    expect(engine).toBeDefined()
  })
})
