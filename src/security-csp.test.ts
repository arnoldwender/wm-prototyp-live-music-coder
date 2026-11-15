// @vitest-environment node
/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Prevents Content-Security-Policy drift between netlify.toml
   (the live HTTP header) and index.html (the packaged Electron
   <meta> policy). */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function parseDirectives(policy: string): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  for (const raw of policy.split(';')) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const [name, ...values] = trimmed.split(/\s+/)
    map.set(name, new Set(values))
  }
  return map
}

const root = process.cwd()
const netlifyToml = readFileSync(path.join(root, 'netlify.toml'), 'utf8')
const indexHtml = readFileSync(path.join(root, 'index.html'), 'utf8')

const webCspMatch = netlifyToml.match(/Content-Security-Policy\s*=\s*"([^"]+)"/)
const metaCspMatch = indexHtml.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/)

describe('Content-Security-Policy parity & hardening', () => {
  it('extracts both web and desktop CSP policies', () => {
    expect(webCspMatch?.[1]).toBeTruthy()
    expect(metaCspMatch?.[1]).toBeTruthy()
  })

  it('keeps critical anti-exfiltration directives on both web and desktop', () => {
    const web = parseDirectives(webCspMatch![1])
    const meta = parseDirectives(metaCspMatch![1])

    for (const policy of [web, meta]) {
      expect(policy.get('object-src')).toEqual(new Set(["'none'"]))
      expect(policy.get('frame-src')).toEqual(new Set(["'none'"]))
      expect(policy.get('base-uri')).toEqual(new Set(["'self'"]))
      expect(policy.get('form-action')).toEqual(new Set(["'self'"]))
    }

    expect(web.get('frame-ancestors')).toEqual(new Set(["'none'"]))
    // <meta> CSP must NOT include frame-ancestors (browsers ignore it with a console error)
    expect(meta.has('frame-ancestors')).toBe(false)
  })

  it('never allowlists dead third-party origins such as freesound.org or wildcard https: images', () => {
    expect(webCspMatch![1]).not.toContain('freesound.org')
    expect(metaCspMatch![1]).not.toContain('freesound.org')
    expect(webCspMatch![1]).not.toMatch(/img-src[^;]*\bhttps:/)
    expect(metaCspMatch![1]).not.toMatch(/img-src[^;]*\bhttps:/)
  })
})
