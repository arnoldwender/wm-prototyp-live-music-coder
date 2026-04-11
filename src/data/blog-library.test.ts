// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   Blog library tests — post structure, required fields,
   slug uniqueness, and slug lookup.
   ────────────────────────────────────────────────────────── */

import { describe, it, expect } from 'vitest'
import { BLOG_POSTS, BLOG_TAGS, getBlogPostBySlug } from './blog-library'

describe('blog-library', () => {
  /* --- Array integrity --- */

  it('BLOG_POSTS array is not empty', () => {
    expect(BLOG_POSTS.length).toBeGreaterThan(0)
  })

  /* --- Required fields --- */

  it('all posts have required fields: slug, title, summary, date, author, tags, body', () => {
    for (const post of BLOG_POSTS) {
      expect(post.slug).toBeTruthy()
      expect(post.title).toBeTruthy()
      expect(post.summary).toBeTruthy()
      expect(post.date).toBeTruthy()
      expect(post.author).toBeTruthy()
      expect(post.author.name).toBeTruthy()
      expect(Array.isArray(post.tags)).toBe(true)
      expect(post.tags.length).toBeGreaterThan(0)
      expect(post.body).toBeTruthy()
    }
  })

  it('all dates follow ISO format (YYYY-MM-DD)', () => {
    const isoPattern = /^\d{4}-\d{2}-\d{2}$/
    for (const post of BLOG_POSTS) {
      expect(post.date).toMatch(isoPattern)
    }
  })

  it('all tags are valid BlogTag values', () => {
    for (const post of BLOG_POSTS) {
      for (const tag of post.tags) {
        expect(BLOG_TAGS).toContain(tag)
      }
    }
  })

  /* --- Slug uniqueness --- */

  it('all slugs are unique', () => {
    const slugs = BLOG_POSTS.map((p) => p.slug)
    const uniqueSlugs = new Set(slugs)
    expect(uniqueSlugs.size).toBe(slugs.length)
  })

  /* --- getBlogPostBySlug --- */

  it('returns the correct post for a known slug', () => {
    const post = getBlogPostBySlug('why-four-engines')
    expect(post).toBeDefined()
    expect(post!.slug).toBe('why-four-engines')
    expect(post!.title).toContain('Four Audio Engines')
  })

  it('returns undefined for an unknown slug', () => {
    const post = getBlogPostBySlug('this-slug-does-not-exist')
    expect(post).toBeUndefined()
  })
})
