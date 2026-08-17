// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media

/**
 * Guard for TOTAL_EXAMPLE_COUNT.
 *
 * The constant was declared partway down example-library.ts, before roughly 154
 * further entries were pushed onto EXAMPLE_LIBRARY. It therefore froze at 65
 * while the array held 219 — and src/pages/Examples.tsx renders the constant in
 * the page header while mapping over the array below it, so the page advertised
 * "65 patterns" on top of a list of 219.
 *
 * That is the rare defect that costs nothing to fix and gives the user 154 more
 * of something they already had.
 */

import { describe, it, expect } from 'vitest';
import { EXAMPLE_LIBRARY, TOTAL_EXAMPLE_COUNT } from './example-library';

describe('TOTAL_EXAMPLE_COUNT', () => {
  it('matches the real library length', () => {
    expect(TOTAL_EXAMPLE_COUNT).toBe(EXAMPLE_LIBRARY.length);
  });

  it('is not a stale snapshot taken mid-file', () => {
    // A literal or a snapshot taken before the later push() calls would sit far
    // below the real length. Asserting a floor keeps the failure legible if the
    // declaration ever migrates back up the file.
    expect(TOTAL_EXAMPLE_COUNT).toBeGreaterThan(200);
  });
});
