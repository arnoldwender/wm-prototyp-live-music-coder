// @vitest-environment node
/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Design-token completeness gate — verifies every CSS custom
   property referenced via var(--*) across src/ is defined in
   src/styles/. Prevents silent fallback to unset/inherited
   values (e.g. missing --font-size-4xl shrinking <h1> to 16px). */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = path.resolve(srcDir, '..')

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...walk(full))
    } else if (/\.(css|ts|tsx)$/.test(entry) && !/\.test\./.test(entry)) {
      out.push(full)
    }
  }
  return out
}

describe('CSS design tokens', () => {
  it('defines every var(--*) custom property referenced in UI and style files', () => {
    const allFiles = walk(srcDir)
    const defined = new Set<string>()

    for (const cssFile of allFiles.filter((f) => f.endsWith('.css'))) {
      const content = readFileSync(cssFile, 'utf8')
      for (const match of content.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) {
        defined.add(match[1])
      }
    }

    const undefinedRefs: string[] = []
    for (const file of allFiles) {
      const rel = path.relative(repoRoot, file)
      /* Skip static changelog/blog prose data files that mention `var(--color-*)` in markdown */
      if (rel.startsWith('src/data/')) continue
      const content = readFileSync(file, 'utf8')
      for (const match of content.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) {
        const token = match[1]
        if (token.startsWith('--tw-')) continue
        if (!defined.has(token)) {
          undefinedRefs.push(`${token} in ${rel}`)
        }
      }
    }

    expect(undefinedRefs).toEqual([])
  })
})
