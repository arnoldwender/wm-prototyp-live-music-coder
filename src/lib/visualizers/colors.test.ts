// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   VIZ_COLORS drift guard — parses src/styles/tokens/colors.css
   at test-time and asserts that hardcoded Canvas 2D literals
   match the canonical CSS design tokens.

   Canvas 2D cannot use CSS custom properties directly, so
   colors.ts contains literal hex values. This test catches
   silent drift between the two sources of truth.
   ────────────────────────────────────────────────────────── */

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { VIZ_COLORS } from './colors'

/* Resolve the token CSS file.
   Vitest with jsdom sets process.cwd() to the project root, so we anchor
   from there rather than relying on __dirname (which resolves to project root
   in the jsdom environment, not the source file's directory). */
const CSS_PATH = path.resolve(process.cwd(), 'src/styles/tokens/colors.css')

/* Helper — extract a CSS custom property value from raw CSS text.
   Returns the trimmed value string or null if the property is absent. */
function extractToken(css: string, property: string): string | null {
  /* Pattern: --property-name: <value>; (handles spaces, tabs, newlines) */
  const re = new RegExp(`${property}\\s*:\\s*([^;]+);`)
  const match = css.match(re)
  return match ? match[1].trim() : null
}

describe('VIZ_COLORS ↔ design tokens drift guard', () => {
  /* Load the CSS file once for all assertions */
  const css = fs.readFileSync(CSS_PATH, 'utf-8')

  /* 1. Background — most visible drift risk: bg becomes mismatched when
        the dark-mode base changes */
  it('bg matches --color-bg', () => {
    const token = extractToken(css, '--color-bg')
    expect(token).not.toBeNull()
    expect(VIZ_COLORS.bg).toBe(token)
  })

  /* 2. Primary / waveform — brand purple; affects all waveform rendering */
  it('waveform matches --color-primary', () => {
    const token = extractToken(css, '--color-primary')
    expect(token).not.toBeNull()
    expect(VIZ_COLORS.waveform).toBe(token)
  })

  /* 3. Text secondary — label rendering color on canvas overlays */
  it('text matches --color-text-secondary', () => {
    const token = extractToken(css, '--color-text-secondary')
    expect(token).not.toBeNull()
    expect(VIZ_COLORS.text).toBe(token)
  })

  /* 4. Grid — beat-grid lines use the dim border token (subtle lines vs UI borders).
        VIZ_COLORS.grid maps to --color-border-dim, not --color-border. */
  it('grid matches --color-border-dim', () => {
    const token = extractToken(css, '--color-border-dim')
    expect(token).not.toBeNull()
    expect(VIZ_COLORS.grid).toBe(token)
  })
})
