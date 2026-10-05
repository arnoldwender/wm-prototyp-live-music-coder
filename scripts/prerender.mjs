#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/**
 * Build-time prerender of every route in the served sitemap.
 *
 * Runs at the end of `npm run build`, after `vite build` (client → dist/) and
 * `vite build --ssr src/entry-server.tsx --outDir dist-ssr` (server bundle). For each <loc> of
 * dist/sitemap.xml it calls the bundle's render(path), puts the HTML into the empty #root of
 * dist/index.html, writes the page's title, description and canonical into the <head>, and saves
 * the result where Netlify serves that path: / → index.html, /docs → docs.html (with a file at
 * /docs.html Netlify answers /docs with 200 and /docs/ with a 301 to /docs, so the sitemap URLs
 * stay as they are). The untouched template is kept as dist/spa.html: netlify.toml rewrites
 * every other path (deep links like /sessions/<slug>) to it, so they get the bare app shell and
 * not the prerendered home page. dist-ssr/ is deleted at the end.
 *
 * Why: until 2026-10-05 every URL served the same empty shell — 8 visible words, no <h1>, no
 * canonical, one <title> for all nine pages; a readiness measurement in production failed G3, S4
 * and S5 (below). Crawlers that do not run JavaScript, the AI search bots among them, saw no page.
 *
 * The criteria named in the messages: G3 — the content is in the HTML without JavaScript (at least
 * 80 visible words and an <h1> on the home page); S4 — every sitemap URL is indexable and its
 * canonical is exactly itself; S5 — every sitemap URL has a title, a description and one <h1>,
 * and no title repeats.
 *
 * Gate — nothing is written unless every route passes:
 *   · the template has exactly one empty #root and one each of the head tags replaced below;
 *   · the page has exactly one <h1>, it comes from the prerendered #root and it is not shipped
 *     invisible (an entrance animation's opacity:0 in the server HTML);
 *   · React did not write a Suspense fallback (the page module was not preloaded);
 *   · #root holds at least MIN_ROOT_WORDS words, and the home page at least MIN_WORDS counted
 *     the way the G3 measurement counts them over the whole document (comments, script, style
 *     and template out, tags out, entities decoded, Unicode word tokens);
 *   · the page declared its meta through usePageMeta for this very path, the canonical is
 *     SITE_URL + path, and no two routes share a <title>.
 *
 * Usage: node scripts/prerender.mjs        (the last step of `npm run build`)
 * Exit:  0 written · 1 a check failed, nothing written, or the server bundle is missing
 */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const PLACEHOLDER = '<div id="root"></div>'
export const SITE_URL = 'https://live-music-coder.pro'
/* G3's threshold (80 visible words); G3 looks at the home page only */
export const MIN_WORDS = 80
/* Any other route: enough text that a fallback or an empty render cannot pass */
export const MIN_ROOT_WORDS = 20
/* The SPA shell for paths without a prerendered file — netlify.toml rewrites to it */
export const SHELL_FILE = 'spa.html'

const STRIP_RX = /<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<template\b[\s\S]*?<\/template>/gi
const TAG_RX = /<[^>]+>/g
/* Python's \w is Unicode-aware; JavaScript's is ASCII-only unless spelled out like this */
const WORD_RX = /[\p{L}\p{N}_]+/gu
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
/* React marks a Suspense boundary it could not render on the server */
const FALLBACK_RX = /<!--\$[!?]-->/

/*
 * Python's html.unescape knows every HTML5 name; without that table an unknown name is dropped:
 * the count then matches Python for a symbol (&times; → no word) and inside a word
 * (Gr&ouml;&szlig;e → one word), and differs only for a lone letter entity between spaces.
 */
function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (match, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10)
      return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : match
    }
    return ENTITIES[body.toLowerCase()] ?? ''
  })
}

/** Visible word count of an HTML fragment, as G3 counts it. */
export function visibleWords(html) {
  const text = decodeEntities(html.replace(STRIP_RX, ' ').replace(TAG_RX, ' '))
  return (text.match(WORD_RX) ?? []).length
}

/** Number of <h1> elements outside comments, scripts, styles and templates. */
export function h1Count(html) {
  return (html.replace(STRIP_RX, ' ').match(/<h1\b/gi) ?? []).length
}

/** True when the first <h1> carries opacity:0 in its own style attribute. */
export function h1Hidden(html) {
  const tag = html.replace(STRIP_RX, ' ').match(/<h1\b[^>]*>/i)?.[0] ?? ''
  const style = tag.match(/\sstyle="([^"]*)"/i)?.[1] ?? ''
  return /(^|;)\s*opacity\s*:\s*0(\.0+)?\s*(;|$)/i.test(style)
}

/** Text escaped for an HTML attribute value or text node. */
export function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Paths of the sitemap's <loc> entries, in order; an entry on another origin is a problem. */
export function sitemapPaths(xml, origin = SITE_URL) {
  const paths = []
  const problems = []
  for (const [, raw] of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    const loc = decodeEntities(raw)
    if (loc === origin || loc.startsWith(`${origin}/`)) {
      paths.push(loc.slice(origin.length) || '/')
    } else {
      problems.push(`sitemap entry on another origin: ${loc}`)
    }
  }
  if (paths.length === 0) problems.push('the sitemap lists no URL of this site')
  return { paths, problems }
}

/** The file in dist/ that serves a path without a trailing slash: / → index.html, /docs → docs.html. */
export function outputFile(routePath) {
  return routePath === '/' ? 'index.html' : `${routePath.replace(/^\/+|\/+$/g, '')}.html`
}

/* The head tags written per route. Each must occur exactly once in the template. */
const HEAD_TAGS = [
  { label: '<title>', rx: /<title>[^<]*<\/title>/, render: (m) => `<title>${escapeHtml(m.title)}</title>` },
  { label: 'meta description', rx: /<meta name="description" content="[^"]*"\s*\/?>/, render: (m) => `<meta name="description" content="${escapeHtml(m.description)}" />` },
  { label: 'og:title', rx: /<meta property="og:title" content="[^"]*"\s*\/?>/, render: (m) => `<meta property="og:title" content="${escapeHtml(m.title)}" />` },
  { label: 'og:description', rx: /<meta property="og:description" content="[^"]*"\s*\/?>/, render: (m) => `<meta property="og:description" content="${escapeHtml(m.description)}" />` },
  { label: 'og:url', rx: /<meta property="og:url" content="[^"]*"\s*\/?>/, render: (m, url) => `<meta property="og:url" content="${escapeHtml(url)}" />` },
  { label: 'twitter:title', rx: /<meta name="twitter:title" content="[^"]*"\s*\/?>/, render: (m) => `<meta name="twitter:title" content="${escapeHtml(m.title)}" />` },
  { label: 'twitter:description', rx: /<meta name="twitter:description" content="[^"]*"\s*\/?>/, render: (m) => `<meta name="twitter:description" content="${escapeHtml(m.description)}" />` },
]

const count = (text, rx) => (text.match(new RegExp(rx.source, 'g' + rx.flags.replace('g', ''))) ?? []).length

/**
 * The page for one route: the app HTML in #root (marked with its path for src/main.tsx) and the
 * route's meta in the head. Returns the page plus the problems found on the way.
 */
export function buildPage(template, appHtml, meta, routePath, siteUrl = SITE_URL) {
  const problems = []
  const canonical = `${siteUrl}${routePath}`

  const placeholders = template.split(PLACEHOLDER).length - 1
  if (placeholders !== 1) problems.push(`expected exactly one ${PLACEHOLDER} in the template, found ${placeholders}`)
  if (count(template, /<link rel="canonical"/) !== 0) problems.push('the template already carries a canonical link')

  let page = template
  for (const tag of HEAD_TAGS) {
    const found = count(page, tag.rx)
    if (found !== 1) {
      problems.push(`expected exactly one ${tag.label} in the template, found ${found}`)
      continue
    }
    /* A function replacement: "$&" in a title must stay literal */
    page = page.replace(tag.rx, () => tag.render(meta, canonical))
  }
  page = page.replace('</head>', () => `<link rel="canonical" href="${escapeHtml(canonical)}" />\n  </head>`)
  if (placeholders === 1) {
    page = page.replace(PLACEHOLDER, () => `<div id="root" data-prerendered="${escapeHtml(routePath)}">${appHtml}</div>`)
  }
  return { page, problems, canonical }
}

/**
 * The gate for one built page. Returns the problems (empty = fine) and the measured figures, so a
 * failure names its number.
 */
export function checkPage(page, appHtml, { routePath, meta, canonical }) {
  const problems = []

  if (!meta) {
    problems.push('the page never called usePageMeta: no title, description or canonical to write')
  } else {
    if (meta.path !== routePath) problems.push(`usePageMeta declares path ${meta.path}, the sitemap lists ${routePath}`)
    if (!meta.title.trim()) problems.push('empty <title> (S5)')
    if (!meta.description.trim()) problems.push('empty meta description (S5)')
  }

  const canonicals = [...page.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((m) => m[1])
  if (canonicals.length !== 1 || canonicals[0] !== escapeHtml(canonical)) {
    problems.push(`expected one canonical ${canonical}, found ${canonicals.length ? canonicals.join(', ') : 'none'} (S4)`)
  }

  const h1s = h1Count(page)
  const rootH1s = h1Count(appHtml)
  if (h1s !== 1) {
    problems.push(`the page has ${h1s} <h1>, expected exactly one (S5)`)
  } else if (rootH1s !== 1) {
    problems.push('the only <h1> is not in the prerendered #root: the page did not render')
  } else if (h1Hidden(appHtml)) {
    problems.push('the <h1> ships with opacity:0 — an entrance animation rendered its initial state on the server')
  }

  if (FALLBACK_RX.test(appHtml)) {
    problems.push('React wrote a Suspense fallback: the page module was not loaded before rendering')
  }

  const words = visibleWords(page)
  const rootWords = visibleWords(appHtml)
  if (routePath === '/' && words < MIN_WORDS) {
    problems.push(`the home page has ${words} visible words (${rootWords} in #root), fewer than ${MIN_WORDS} (G3)`)
  }
  if (rootWords < MIN_ROOT_WORDS) {
    problems.push(`#root holds ${rootWords} words, fewer than ${MIN_ROOT_WORDS}: an empty or fallback render`)
  }
  return { problems, words, rootWords, h1s }
}

/** Problems across routes: a <title> on two URLs fails S5. */
export function checkTitles(results) {
  const seen = new Map()
  for (const { routePath, meta } of results) {
    if (!meta) continue
    seen.set(meta.title, [...(seen.get(meta.title) ?? []), routePath])
  }
  return [...seen].filter(([, paths]) => paths.length > 1).map(([title, paths]) => `<title> "${title}" on ${paths.join(', ')} (S5)`)
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const dist = path.join(root, 'dist')
  const ssrDir = path.join(root, 'dist-ssr')
  const serverEntry = path.join(ssrDir, 'entry-server.js')

  let render
  try {
    ;({ render } = await import(pathToFileURL(serverEntry).href))
  } catch (error) {
    console.error(`[prerender] cannot load ${path.relative(root, serverEntry)}: ${error.message}`)
    console.error('[prerender] run `vite build --ssr src/entry-server.tsx --outDir dist-ssr` first')
    process.exit(1)
  }

  const template = readFileSync(path.join(dist, 'index.html'), 'utf8')
  const { paths, problems } = sitemapPaths(readFileSync(path.join(dist, 'sitemap.xml'), 'utf8'))

  const results = []
  for (const routePath of paths) {
    const { html: appHtml, meta } = await render(routePath)
    const { page, problems: buildProblems, canonical } = buildPage(template, appHtml, meta ?? { title: '', description: '' }, routePath)
    const check = checkPage(page, appHtml, { routePath, meta, canonical })
    for (const problem of [...buildProblems, ...check.problems]) problems.push(`${routePath}: ${problem}`)
    results.push({ routePath, meta, page, ...check })
  }
  problems.push(...checkTitles(results))

  if (problems.length > 0) {
    for (const problem of problems) console.error(`[prerender] FAIL — ${problem}`)
    process.exit(1)
  }

  /* The bare shell first: index.html is about to become the prerendered home page */
  writeFileSync(path.join(dist, SHELL_FILE), template)
  for (const { routePath, page, words, rootWords, h1s } of results) {
    const file = path.join(dist, outputFile(routePath))
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, page)
    console.log(
      `[prerender] ${routePath.padEnd(11)} → dist/${outputFile(routePath).padEnd(15)} ${String(words).padStart(5)} words ` +
        `(${rootWords} in #root), ${h1s} <h1>, ${Math.round(Buffer.byteLength(page) / 1024)} KB`,
    )
  }
  rmSync(ssrDir, { recursive: true, force: true })
  console.log(`[prerender] ${results.length} routes prerendered; dist/${SHELL_FILE} keeps the SPA shell`)
}

/* Only when run as a script: tests import the checks without a build */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
