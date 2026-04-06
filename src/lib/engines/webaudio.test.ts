// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   Web Audio engine — unit tests (structural, no real audio)
   ────────────────────────────────────────────────────────── */

import { describe, it, expect } from 'vitest'
import { WebAudioEngine } from './webaudio'

describe('WebAudioEngine', () => {
  it('has correct name', () => {
    expect(new WebAudioEngine().name).toBe('webaudio')
  })
})
