// @vitest-environment node
/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   The server render behind scripts/prerender.mjs, in a Node
   environment without window or document — as in the build.

   Each sitemap route must render its page (one <h1>, no Suspense
   fallback) and declare its own meta; the descriptions count from
   the data; the language is English whatever the machine's locale;
   /editor renders the placeholder, never the IDE. */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { BASE_SAMPLE_COUNT } from './data/sample-library'
import { TOTAL_EXAMPLE_COUNT } from './data/example-library'
import { h1Count, h1Hidden, sitemapPaths } from '../scripts/prerender.mjs'
import type { render as Render } from './entry-server'

const { paths: ROUTES } = sitemapPaths(readFileSync(path.resolve(process.cwd(), 'public/sitemap.xml'), 'utf8'))

let render: typeof Render

beforeAll(async () => {
  /* src/i18n picks its language when it is first imported. Pretend the build
     machine speaks German before that happens: the prerender must still come
     out in English, because src/main.tsx only hydrates English pages. */
  vi.stubGlobal('navigator', { language: 'de-DE' })
  ;({ render } = await import('./entry-server'))
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('render(path) for every route of the sitemap', () => {
  it('runs without a window, like the build', () => {
    expect(typeof window).toBe('undefined')
    expect(ROUTES.length).toBeGreaterThanOrEqual(9)
  })

  it.each(ROUTES)('%s renders its page with one visible <h1> and its own meta', async (route) => {
    const { html, meta } = await render(route)
    expect(h1Count(html)).toBe(1)
    expect(h1Hidden(html)).toBe(false)
    expect(html).not.toMatch(/<!--\$[!?]-->/)
    expect(meta?.path).toBe(route)
    expect(meta?.title.trim()).not.toBe('')
    expect(meta?.description.trim()).not.toBe('')
  })

  it('gives every route a different <title> (S5)', async () => {
    const titles = await Promise.all(ROUTES.map(async (route) => (await render(route)).meta?.title))
    expect(new Set(titles).size).toBe(ROUTES.length)
  })
})

describe('what the prerender publishes', () => {
  it('counts the samples and examples in the descriptions from the data', async () => {
    expect((await render('/samples')).meta?.description).toContain(`Browse ${BASE_SAMPLE_COUNT} Dirt-Samples`)
    expect((await render('/examples')).meta?.description).toMatch(new RegExp(`^${TOTAL_EXAMPLE_COUNT} curated`))
  })

  it('renders in English although the machine speaks German', async () => {
    expect((await render('/docs')).html).toContain('>Getting Started</h1>')
  })

  it('renders the /editor placeholder, not the IDE', async () => {
    const { html } = await render('/editor')
    expect(html).toContain('>Live coding music editor</h1>')
    expect(html).not.toContain('cm-editor')
  })
})
