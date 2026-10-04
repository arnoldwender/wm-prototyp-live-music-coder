// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media

/**
 * Guard for the numbers public/llms.txt states about the content.
 *
 * llms.txt is static text that AI search engines read and quote. Its numbers ("219 code
 * examples", "49 curated AI-composed sessions", "14 documentation sections", "19 factory device
 * profiles") are snapshots of the data files, so a library that grows leaves the text behind —
 * the same defect example-library.count.test.ts caught on the Examples page. This test fails
 * until the text follows. Every occurrence of a phrase is checked, not just the first.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { EXAMPLE_LIBRARY } from './example-library';
import { SESSIONS_LIBRARY } from './sessions-library';
import { docSections } from './docs';
import { MIDI_DEVICES } from './midi-devices';

/* Anchored at the project root like colors.test.ts: under jsdom, import.meta.url is not a
   file: URL, and process.cwd() is the project root. */
const llms = readFileSync(resolve(process.cwd(), 'public/llms.txt'), 'utf8');

/** Every number the text states for a phrase. */
const stated = (pattern: RegExp): number[] => [...llms.matchAll(pattern)].map((m) => Number(m[1]));

describe('public/llms.txt counts', () => {
  it.each([
    ['code examples', /(\d+) (?:curated )?code examples/g, EXAMPLE_LIBRARY.length],
    ['AI-composed sessions', /(\d+) curated,? AI-composed/g, SESSIONS_LIBRARY.length],
    ['documentation sections', /(\d+)(?:-section documentation| documentation sections)/g, docSections.length],
    ['MIDI device profiles', /(\d+) factory device profiles/g, MIDI_DEVICES.length],
  ] as const)('%s match the data', (_label, pattern, actual) => {
    const numbers = stated(pattern);
    // The phrase must still be there: a rewrite that drops it would otherwise pass in silence.
    expect(numbers.length).toBeGreaterThan(0);
    for (const n of numbers) expect(n).toBe(actual);
  });
});
