#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/**
 * Deterministic generator for public/sitemap.xml covering all indexable routes:
 *   - 10 top-level routes (/, /editor, /docs, /samples, /examples, /sessions,
 *     /blog, /changelog, /legal, /datenschutz)
 *   - all 14 /docs/:sectionId routes from src/data/docs.ts
 *   - all 49 /sessions/:slug routes from src/data/sessions-library.ts
 *   - all /blog/:slug routes from src/data/blog-library.ts
 *
 * Keeps <loc> first inside each <url> (required by scripts/mutate-verify-llms-txt.sh)
 * and includes ISO <lastmod> dates derived from source data.
 *
 * Parity with the TypeScript data arrays is enforced on every test run by
 * src/sitemap.test.ts without mutating the working tree during `npm run build`.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_URL = 'https://live-music-coder.pro'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function extractDocIds(source) {
  return [...source.matchAll(/^\s*id:\s*['"]([a-z0-9-]+)['"]/gm)].map((m) => m[1])
}

function extractSlugDates(source) {
  return [...source.matchAll(/\bslug:\s*['"]([a-z0-9-]+)['"][\s\S]*?\bdate:\s*['"](\d{4}-\d{2}-\d{2})['"]/g)].map(
    (m) => ({ slug: m[1], date: m[2] }),
  )
}

function extractDates(source) {
  return [...source.matchAll(/\bdate:\s*['"](\d{4}-\d{2}-\d{2})['"]/g)].map((m) => m[1])
}

function maxDate(dates, fallback = '2026-10-05') {
  return dates.length > 0 ? [...dates].sort().at(-1) : fallback
}

const docsSrc = readFileSync(path.join(root, 'src/data/docs.ts'), 'utf8')
const sessionsSrc = readFileSync(path.join(root, 'src/data/sessions-library.ts'), 'utf8')
const blogSrc = readFileSync(path.join(root, 'src/data/blog-library.ts'), 'utf8')
const changelogSrc = readFileSync(path.join(root, 'src/data/changelog-library.ts'), 'utf8')

const docIds = extractDocIds(docsSrc)
const sessions = extractSlugDates(sessionsSrc)
const blogPosts = extractSlugDates(blogSrc)
const changelogDates = extractDates(changelogSrc)

const latestSiteDate = maxDate([
  ...changelogDates,
  ...sessions.map((s) => s.date),
  ...blogPosts.map((p) => p.date),
])
const latestSessionDate = maxDate(sessions.map((s) => s.date), latestSiteDate)
const latestBlogDate = maxDate(blogPosts.map((p) => p.date), latestSiteDate)

const entries = [
  { path: '/', lastmod: latestSiteDate, changefreq: 'weekly', priority: '1.0' },
  { path: '/editor', lastmod: latestSiteDate, changefreq: 'weekly', priority: '0.9' },
  { path: '/docs', lastmod: latestSiteDate, changefreq: 'weekly', priority: '0.8' },
  { path: '/samples', lastmod: latestSiteDate, changefreq: 'monthly', priority: '0.7' },
  { path: '/examples', lastmod: latestSiteDate, changefreq: 'monthly', priority: '0.7' },
  { path: '/sessions', lastmod: latestSessionDate, changefreq: 'monthly', priority: '0.7' },
  { path: '/blog', lastmod: latestBlogDate, changefreq: 'monthly', priority: '0.6' },
  { path: '/changelog', lastmod: maxDate(changelogDates, latestSiteDate), changefreq: 'monthly', priority: '0.5' },
  { path: '/legal', lastmod: latestSiteDate, changefreq: 'yearly', priority: '0.3' },
  { path: '/datenschutz', lastmod: latestSiteDate, changefreq: 'yearly', priority: '0.3' },
  ...docIds.map((id) => ({
    path: `/docs/${id}`,
    lastmod: latestSiteDate,
    changefreq: 'monthly',
    priority: '0.7',
  })),
  ...sessions.map(({ slug, date }) => ({
    path: `/sessions/${slug}`,
    lastmod: date,
    changefreq: 'yearly',
    priority: '0.6',
  })),
  ...blogPosts.map(({ slug, date }) => ({
    path: `/blog/${slug}`,
    lastmod: date,
    changefreq: 'yearly',
    priority: '0.6',
  })),
]

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map(
    (e) =>
      [
        '  <url>',
        `    <loc>${SITE_URL}${e.path}</loc>`,
        `    <lastmod>${e.lastmod}</lastmod>`,
        `    <changefreq>${e.changefreq}</changefreq>`,
        `    <priority>${e.priority}</priority>`,
        '  </url>',
      ].join('\n'),
  ),
  '</urlset>',
  '',
].join('\n')

const outPath = path.join(root, 'public/sitemap.xml')
writeFileSync(outPath, xml, 'utf8')
console.log(`[generate-sitemap] wrote ${entries.length} URLs to public/sitemap.xml`)
