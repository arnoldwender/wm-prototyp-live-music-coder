// @vitest-environment node
/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   The JSON-LD of index.html, which every prerendered route and
   the SPA shell inherit.

   The author is the Wender Media organization: the same @id and
   profile list that wendermedia.com publishes, so search engines
   and AI assistants can tie the app to one known entity. Without
   sameAs the organization is a bare name (an entity check on the
   home page failed for exactly that on 2026-10-05). */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const html = readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8')
const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1])

describe('index.html JSON-LD', () => {
  it('parses', () => {
    expect(blocks.length).toBeGreaterThan(0)
    for (const block of blocks) expect(() => JSON.parse(block)).not.toThrow()
  })

  it('names Wender Media as the author, with its canonical @id and its profiles', () => {
    const app = JSON.parse(blocks[0])
    expect(app['@type']).toBe('WebApplication')
    const author = app.author
    expect(author['@type']).toBe('Organization')
    expect(author['@id']).toBe('https://www.wendermedia.com/#organization')
    expect(author.url).toBe('https://www.wendermedia.com')
    expect(author.founder).toEqual({ '@id': 'https://arnoldwender.com/#person' })
    expect(Array.isArray(author.sameAs)).toBe(true)
    expect(author.sameAs.length).toBeGreaterThan(0)
    for (const url of author.sameAs) expect(url).toMatch(/^https:\/\/[^\s]+$/)
    expect(new Set(author.sameAs).size).toBe(author.sameAs.length)
  })
})
