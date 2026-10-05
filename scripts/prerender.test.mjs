// @vitest-environment node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/**
 * The build-time gate of scripts/prerender.mjs.
 * (Node environment: under the default jsdom one, Vite prepends an import to prerender.mjs and
 * its first-line shebang no longer parses.)
 *
 * It fails the build unless every route of the sitemap has exactly one visible <h1> coming from
 * #root, no Suspense fallback, its own title, description and canonical in the head, and — for the
 * home page — at least 80 visible words counted the way the G3 measurement counts them (the
 * criteria are listed at the top of prerender.mjs). Each case below is a way the prerender can
 * break without the build noticing otherwise.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  MIN_ROOT_WORDS,
  MIN_WORDS,
  PLACEHOLDER,
  SHELL_FILE,
  SITE_URL,
  buildPage,
  checkPage,
  checkTitles,
  escapeHtml,
  h1Count,
  h1Hidden,
  outputFile,
  sitemapPaths,
  visibleWords,
} from './prerender.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const words = (n) => Array.from({ length: n }, (_, i) => `word${i}`).join(' ')

/* The head of index.html, reduced to the tags the script replaces */
const template = (body = '') =>
  '<!doctype html><html lang="en"><head>' +
  '<title>Live Music Coder — Write Code, Hear Music, Live</title>' +
  '<meta name="description" content="Default description." />' +
  '<meta property="og:title" content="Default" />' +
  '<meta property="og:description" content="Default." />' +
  '<meta property="og:url" content="https://live-music-coder.pro" />' +
  '<meta name="twitter:title" content="Default" />' +
  '<meta name="twitter:description" content="Default." />' +
  `</head><body>${PLACEHOLDER}${body}</body></html>`

const meta = (routePath = '/docs', title = 'Documentation — Live Music Coder') => ({
  title,
  description: 'Learn how to use Live Music Coder.',
  path: routePath,
})
const app = (inner = words(MIN_WORDS)) => `<main><h1 style="opacity:1;transform:none">Getting Started</h1><p>${inner}</p></main>`

/** Builds and checks one route like main() does */
function run(appHtml, routeMeta = meta(), routePath = '/docs', tpl = template()) {
  const { page, problems, canonical } = buildPage(tpl, appHtml, routeMeta, routePath)
  const check = checkPage(page, appHtml, { routePath, meta: routeMeta, canonical })
  /* check first: its own `problems` must not overwrite the merged list */
  return { ...check, page, problems: [...problems, ...check.problems] }
}

describe('visibleWords and h1Count count what G3 counts', () => {
  it('skips scripts, styles, templates and comments', () => {
    const html = '<p>one two</p><script>var a = "three four"</script><style>.five{}</style>' +
      '<template>six</template><!-- seven eight --><span>nine</span>'
    expect(visibleWords(html)).toBe(3)
  })

  it('counts Unicode words like Python \\w+ and decodes entities', () => {
    // «Größe» is one word (an ASCII-only \w would split it); &amp; and &times; are no word
    expect(visibleWords('Größe Next.js &amp; &times; Gr&ouml;&szlig;e &#71;o')).toBe(5)
  })

  it('ignores an <h1> inside a comment or a template', () => {
    expect(h1Count('<!-- <h1>x</h1> --><template><h1>y</h1></template><h1>z</h1>')).toBe(1)
  })
})

describe('h1Hidden', () => {
  it('flags an <h1> rendered at opacity 0 (an entrance animation on the server)', () => {
    expect(h1Hidden('<h1 style="position:relative;opacity:0;transform:translateY(24px)">x</h1>')).toBe(true)
    expect(h1Hidden('<h1 style="opacity: 0">x</h1>')).toBe(true)
  })

  it('accepts a visible or partly transparent <h1>, and one without a style', () => {
    expect(h1Hidden('<h1 style="opacity:1;transform:none">x</h1>')).toBe(false)
    expect(h1Hidden('<h1 style="opacity:0.5">x</h1>')).toBe(false)
    expect(h1Hidden('<h1 class="title">x</h1>')).toBe(false)
  })
})

describe('sitemapPaths and outputFile', () => {
  it('turns the sitemap URLs into paths, in order', () => {
    const xml = `<urlset><url><loc>${SITE_URL}/</loc></url><url><loc> ${SITE_URL}/docs </loc></url></urlset>`
    expect(sitemapPaths(xml)).toEqual({ paths: ['/', '/docs'], problems: [] })
  })

  it('flags a URL on another origin and an empty sitemap', () => {
    expect(sitemapPaths('<loc>https://example.com/x</loc>').problems.join(' ')).toMatch(/another origin.*no URL of this site/)
  })

  it('names the file Netlify serves without a trailing slash', () => {
    expect(outputFile('/')).toBe('index.html')
    expect(outputFile('/docs')).toBe('docs.html')
    expect(outputFile('/a/b')).toBe('a/b.html')
  })

  it('covers every URL of the real sitemap with a distinct file', () => {
    const { paths, problems } = sitemapPaths(readFileSync(path.join(root, 'public', 'sitemap.xml'), 'utf8'))
    expect(problems).toEqual([])
    expect(new Set(paths.map(outputFile)).size).toBe(paths.length)
    expect(paths.map(outputFile)).not.toContain(SHELL_FILE)
  })
})

describe('buildPage writes the route into the template', () => {
  it('replaces the head tags, adds the canonical and marks #root with the path', () => {
    const { page, problems } = run(app())
    expect(problems).toEqual([])
    expect(page).toContain('<title>Documentation — Live Music Coder</title>')
    expect(page).toContain('<meta name="description" content="Learn how to use Live Music Coder." />')
    expect(page).toContain(`<meta property="og:url" content="${SITE_URL}/docs" />`)
    expect(page).toContain(`<link rel="canonical" href="${SITE_URL}/docs" />`)
    expect(page).toContain('<div id="root" data-prerendered="/docs"><main>')
    expect(page).not.toContain('Write Code, Hear Music, Live')
  })

  it('gives the home page the canonical with its slash, like the sitemap', () => {
    const { page } = run(app(), meta('/', 'Home'), '/')
    expect(page).toContain(`<link rel="canonical" href="${SITE_URL}/" />`)
  })

  it('escapes the meta and keeps "$&" literal (function replacements)', () => {
    const { page } = run(app(`price $& more ${words(MIN_WORDS)}`), { ...meta(), title: 'A "quoted" <title> $&' })
    expect(page).toContain('<title>A &quot;quoted&quot; &lt;title&gt; $&amp;</title>')
    expect(page).toContain('price $& more')
    expect(escapeHtml('a&b')).toBe('a&amp;b')
  })

  it('fails when the template lost a head tag, has two placeholders or already a canonical', () => {
    expect(run(app(), meta(), '/docs', template().replace(/<meta property="og:url"[^>]*>/, '')).problems.join(' '))
      .toMatch(/one og:url in the template, found 0/)
    expect(run(app(), meta(), '/docs', template(PLACEHOLDER)).problems.join(' ')).toMatch(/found 2/)
    expect(run(app(), meta(), '/docs', template().replace('</head>', '<link rel="canonical" href="x" /></head>')).problems.join(' '))
      .toMatch(/already carries a canonical/)
  })
})

describe('checkPage', () => {
  it('fails a page that never called usePageMeta', () => {
    const { page, canonical } = buildPage(template(), app(), { title: '', description: '' }, '/docs')
    expect(checkPage(page, app(), { routePath: '/docs', meta: null, canonical }).problems.join(' ')).toMatch(/never called usePageMeta/)
  })

  it('fails when the page declares another path than the sitemap', () => {
    expect(run(app(), meta('/documentation')).problems.join(' ')).toMatch(/declares path \/documentation/)
  })

  it('fails when the app renders no <h1>, or two, or the only one sits outside #root', () => {
    expect(run(`<main>${words(MIN_WORDS)}</main>`).problems.join(' ')).toMatch(/0 <h1>/)
    expect(run(app(`<h1>again</h1>${words(MIN_WORDS)}`)).problems.join(' ')).toMatch(/2 <h1>/)
    expect(run(`<main>${words(MIN_WORDS)}</main>`, meta(), '/docs', template(`<h1>static</h1>`)).problems.join(' '))
      .toMatch(/not in the prerendered #root/)
  })

  it('fails an <h1> shipped at opacity 0', () => {
    const hidden = app().replace('opacity:1', 'opacity:0')
    expect(run(hidden).problems.join(' ')).toMatch(/opacity:0/)
  })

  it('fails when React wrote a Suspense fallback', () => {
    expect(run(`<!--$!--><main role="status">Loading...</main><!--/$-->${app()}`).problems.join(' ')).toMatch(/Suspense fallback/)
  })

  it('needs MIN_WORDS on the home page (G3) and MIN_ROOT_WORDS everywhere', () => {
    expect(run(app(words(10)), meta('/', 'Home'), '/').problems.join(' ')).toMatch(/fewer than 80 \(G3\)/)
    expect(run(app(words(MIN_ROOT_WORDS - 3))).problems.join(' ')).toMatch(/empty or fallback render/)
    expect(run(app(words(MIN_ROOT_WORDS))).problems).toEqual([])
  })

  it('counts the whole home page, as G3 does: words outside #root count too', () => {
    const result = run(app(words(30)), meta('/', 'Home'), '/', template(`<dialog><p>${words(60)}</p></dialog>`))
    expect(result.problems).toEqual([])
    expect(result.rootWords).toBeLessThan(MIN_WORDS)
  })
})

describe('checkTitles', () => {
  it('flags a <title> shared by two routes (S5)', () => {
    const results = [{ routePath: '/a', meta: meta('/a', 'Same') }, { routePath: '/b', meta: meta('/b', 'Same') }, { routePath: '/c', meta: meta('/c', 'Other') }]
    expect(checkTitles(results)).toEqual(['<title> "Same" on /a, /b (S5)'])
  })
})

describe('netlify.toml', () => {
  it('rewrites paths without a file to the SPA shell the script writes, not to the home page', () => {
    const toml = readFileSync(path.join(root, 'netlify.toml'), 'utf8')
    const rule = toml.match(/\[\[redirects\]\][^[]*from = "\/\*"[^[]*/)?.[0] ?? ''
    expect(rule).toMatch(new RegExp(`to = "/${SHELL_FILE.replace('.', '\\.')}"`))
    expect(rule).toMatch(/status = 200/)
    expect(rule).not.toMatch(/force = true/)
  })
})
