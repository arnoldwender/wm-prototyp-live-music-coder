// @vitest-environment node
/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Ensures public/sitemap.xml stays 100% synchronized with
   top-level routes, docSections, SESSIONS_LIBRARY, and BLOG_POSTS,
   and carries valid ISO <lastmod> dates on every entry. */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { docSections } from './data/docs'
import { SESSIONS_LIBRARY } from './data/sessions-library'
import { BLOG_POSTS } from './data/blog-library'
import { sitemapPaths } from '../scripts/prerender.mjs'

const xml = readFileSync(path.resolve(process.cwd(), 'public/sitemap.xml'), 'utf8')

describe('public/sitemap.xml completeness', () => {
  it('lists every static page, doc section, session piece, and blog post exactly once', () => {
    const { paths, problems } = sitemapPaths(xml)
    expect(problems).toEqual([])

    const expectedPaths = [
      '/',
      '/editor',
      '/docs',
      '/samples',
      '/examples',
      '/sessions',
      '/blog',
      '/changelog',
      '/legal',
      '/datenschutz',
      ...docSections.map((s) => `/docs/${s.id}`),
      ...SESSIONS_LIBRARY.map((s) => `/sessions/${s.slug}`),
      ...BLOG_POSTS.map((p) => `/blog/${p.slug}`),
    ]

    expect(paths).toEqual(expectedPaths)
    expect(new Set(paths).size).toBe(expectedPaths.length)
  })

  it('includes a valid YYYY-MM-DD <lastmod> on every <url> entry', () => {
    const urlCount = [...xml.matchAll(/<url>/g)].length
    const lastmods = [...xml.matchAll(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)].map((m) => m[1])
    expect(lastmods.length).toBe(urlCount)
  })
})
