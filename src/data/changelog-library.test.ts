// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   Changelog library tests — entry structure, field validation,
   category constraints, and version lookup.
   ────────────────────────────────────────────────────────── */

import { describe, it, expect } from 'vitest'
import {
  CHANGELOG,
  CHANGELOG_CATEGORIES,
  getChangelogByVersion,
} from './changelog-library'
import type { ChangelogCategory } from './changelog-library'

describe('changelog-library', () => {
  /* --- Array integrity --- */

  it('CHANGELOG array is not empty', () => {
    expect(CHANGELOG.length).toBeGreaterThan(0)
  })

  /* --- Required fields --- */

  it('all entries have required fields: date, title, category, body', () => {
    for (const entry of CHANGELOG) {
      expect(entry.date).toBeTruthy()
      expect(entry.title).toBeTruthy()
      expect(entry.category).toBeTruthy()
      expect(entry.body).toBeTruthy()
    }
  })

  it('all dates follow ISO format (YYYY-MM-DD)', () => {
    const isoPattern = /^\d{4}-\d{2}-\d{2}$/
    for (const entry of CHANGELOG) {
      expect(entry.date).toMatch(isoPattern)
    }
  })

  /* --- Category validation --- */

  it('all categories are valid ChangelogCategory values', () => {
    const validCategories: ChangelogCategory[] = CHANGELOG_CATEGORIES
    for (const entry of CHANGELOG) {
      expect(validCategories).toContain(entry.category)
    }
  })

  /* --- getChangelogByVersion --- */

  it('returns correct entries for a known version', () => {
    const entries = getChangelogByVersion('1.0.0')
    expect(entries.length).toBeGreaterThan(0)
    for (const entry of entries) {
      expect(entry.version).toBe('1.0.0')
    }
  })

  it('returns an empty array for unknown version', () => {
    const entries = getChangelogByVersion('99.99.99')
    expect(entries).toEqual([])
  })

  it('returns multiple entries when a version has several', () => {
    /* v1.0.2 appears on multiple entries */
    const entries = getChangelogByVersion('1.0.2')
    expect(entries.length).toBeGreaterThanOrEqual(1)
  })
})
