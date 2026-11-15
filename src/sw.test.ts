// @vitest-environment node
/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Service Worker safety invariants — prevents regressions
   that would force-reload live audio performances mid-set or
   cache 206 Partial Content / 404 responses. */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const swPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'sw.template.js')
const swRaw = readFileSync(swPath, 'utf8')
const swCode = swRaw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

describe('Service Worker lifecycle & cache safety', () => {
  it('never force-navigates open tabs on activate (protects live audio performances)', () => {
    expect(swCode).not.toMatch(/\.navigate\s*\(/)
  })

  it('only calls skipWaiting inside an explicit message handler, never unconditionally on install', () => {
    const installBlock = swCode.match(/addEventListener\(\s*['"]install['"][\s\S]*?\}\s*\);/)?.[0] ?? ''
    expect(installBlock).toBeTruthy()
    expect(installBlock).not.toMatch(/skipWaiting\s*\(/)
    expect(swCode).toMatch(/SKIP_WAITING/)
  })

  it('guards cache.put behind status === 200 and skips byte-range and dirt-samples requests', () => {
    expect(swCode).toMatch(/response\.status\s*===\s*200/)
    expect(swCode).toMatch(/request\.headers\.has\(\s*['"]range['"]\s*\)/)
    expect(swCode).toMatch(/\/dirt-samples\//)
    expect(swCode).toMatch(/\/spa\.html/)
  })
})
