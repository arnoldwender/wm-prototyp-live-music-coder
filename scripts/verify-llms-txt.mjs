// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
//
// Pre-build gate for public/llms.txt — the summary that ChatGPT, Perplexity, Claude and the
// other AI search engines read. Runs via the "prebuild" npm script, so every `npm run build`
// (the Netlify build included) stops before Vite if the file is broken.
//
// Checks:
//   1. public/llms.txt exists
//   2. the first non-empty line is an H1 (`# `)
//   3. there is a blockquote (`> `) with the summary
//   4. there is at least one markdown link `[label](url)`
//   5. every link is an absolute https:// URL
//   6. at least one link points to this site, and every link to this site is a <loc> of
//      public/sitemap.xml. This is a SPA: every path answers 200 with the same shell, so a
//      mistyped or invented route would never show up as a 404. Until 2026-10-04 /sessions,
//      /blog and /changelog were linked here while the sitemap did not list them.
//   7. no line consists only of an HTML/XML tag — leftover markup from whatever wrote the file
//
// Usage:
//   node scripts/verify-llms-txt.mjs                  # checks public/
//   node scripts/verify-llms-txt.mjs --public <dir>   # another directory with llms.txt + sitemap.xml
//                                                     # (used by scripts/mutate-verify-llms-txt.sh)
// Exit 0 if every check passes, 1 if any fails.

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const publicFlag = argv.indexOf('--public')
// resolve, not join: an absolute directory (a temporary copy for the mutations) stays absolute.
const publicDir = resolve(root, publicFlag >= 0 && argv[publicFlag + 1] ? argv[publicFlag + 1] : 'public')
const llmsPath = join(publicDir, 'llms.txt')
const sitemapPath = join(publicDir, 'sitemap.xml')

const fail = (msg) => {
  console.error(`[verify-llms-txt] ${msg}`)
  process.exit(1)
}

// Check 1: the file exists
if (!existsSync(llmsPath)) fail(`${llmsPath} does not exist`)

const content = readFileSync(llmsPath, 'utf8')
const lines = content.split('\n')

// Check 2: the first non-empty line is an H1
const firstLine = lines.find((l) => l.trim().length > 0)
if (!firstLine?.startsWith('# ')) fail('the first line must be an H1 heading (# )')

// Check 3: a blockquote with the summary
if (!lines.some((l) => l.trim().startsWith('> '))) fail('missing blockquote (> ) with the summary')

// Check 4: markdown links
const links = Array.from(content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g))
if (links.length === 0) fail('no markdown link — add at least one [descriptive label](url)')

// Check 5: absolute https:// URLs only
const notHttps = links.filter((m) => !m[2].startsWith('https://'))
if (notHttps.length > 0) {
  fail(`every link must be an absolute https:// URL:\n${notHttps.slice(0, 3).map((m) => `  [${m[1]}](${m[2]})`).join('\n')}`)
}

// Check 7: no line that is only a tag. llms.txt is plain markdown; such a line is leftover markup
// from the tool that wrote the file (closing tags of an editing tool have reached a live llms.txt
// elsewhere, and no link check could see them).
const markup = lines
  .map((l, i) => ({ line: i + 1, text: l.trim() }))
  .filter(({ text }) => /^<\/?[A-Za-z][\w:-]*(?:\s[^<>]*)?\/?>$/.test(text))
if (markup.length > 0) fail(`stray markup lines:\n${markup.map(({ line, text }) => `  line ${line}: ${text}`).join('\n')}`)

// Check 6: links to this site must be URLs the sitemap lists. The origin comes from the sitemap
// itself (one origin only), never from a hard-coded host.
if (!existsSync(sitemapPath)) fail(`${sitemapPath} does not exist`)
// Entities as they appear in <loc> (XML): an "&" in a path is written "&amp;".
const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
const decodeEntities = (s) =>
  s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|(amp|lt|gt|quot|apos));/gi, (_, dec, hex, name) =>
    dec ? String.fromCodePoint(Number(dec)) : hex ? String.fromCodePoint(parseInt(hex, 16)) : named[name.toLowerCase()],
  )
const sitemapUrls = [...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeEntities(m[1].trim()))
// A gate that saw nothing checked nothing.
if (sitemapUrls.length === 0) fail('sitemap.xml lists no <loc> — nothing to check the links against')
const origins = new Set(sitemapUrls.map((u) => new URL(u).origin))
if (origins.size !== 1) fail(`sitemap.xml mixes origins: ${[...origins].join(', ')}`)
const [siteOrigin] = origins
const sitemapSet = new Set(sitemapUrls)
const ownLinks = links.map((m) => m[2]).filter((url) => new URL(url).origin === siteOrigin)
if (ownLinks.length === 0) fail(`no markdown link to ${siteOrigin} — llms.txt must point AI search engines at this site's pages`)
const notInSitemap = ownLinks.filter((url) => !sitemapSet.has(url))
if (notInSitemap.length > 0) fail(`links to this site that sitemap.xml does not list:\n${notInSitemap.map((u) => `  ${u}`).join('\n')}`)

console.log(`[verify-llms-txt] ok — ${links.length} links, ${ownLinks.length} to ${siteOrigin}, all listed in sitemap.xml (${sitemapUrls.length} URLs)`)
