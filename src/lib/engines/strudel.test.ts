// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   Strudel engine — unit tests (structural, no real audio)
   ────────────────────────────────────────────────────────── */

import { describe, it, expect } from 'vitest'
import { StrudelEngine } from './strudel'

describe('StrudelEngine', () => {
  it('has correct name', () => {
    const engine = new StrudelEngine()
    expect(engine.name).toBe('strudel')
  })

  it('can be instantiated without init', () => {
    const engine = new StrudelEngine()
    expect(engine).toBeDefined()
  })

  /* Note: Full audio tests require a real AudioContext (browser environment).
   * These are basic structural tests. Integration tests with audio
   * would run in a browser test runner or e2e. */
})
