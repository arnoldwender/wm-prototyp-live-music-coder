#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/**
 * Browser check of the prerendered build: does React adopt the HTML that scripts/prerender.mjs
 * wrote, without a mismatch, and does the app still work afterwards?
 *
 * prerender.mjs proves the HTML is there; only a browser proves hydration accepts it. A mismatch
 * does not break a page visibly — React reports a recoverable error (#418 in a production build)
 * and re-renders on the client — so nothing but this check notices that the prerender has stopped
 * matching what the browser renders.
 *
 * Steps: serve dist/ (or --dist DIR) with `vite preview` on a random port, confirm it is this build
 * (the served home page must carry the prerendered <h1>), then in Chromium, service workers blocked:
 *   1. every route of dist/sitemap.xml, in English: no console error, no uncaught page error,
 *      exactly one <h1>, and #root still marked with the route's path;
 *   2. /editor: the IDE replaces the placeholder (useIsClient flipped after hydration);
 *   3. /: the "Start Coding" button opens the editor — the event handlers are attached;
 *   4. /legal#datenschutz: hydrates as the Impressum, then shows the Datenschutz tab;
 *   5. /docs with German saved as the language: rendered from scratch, in German, no error;
 *   6. a deep link (/sessions/<slug>): no prerendered file of its own, rendered without error.
 *
 * Usage:  npm run build && node scripts/verify-hydration.mjs [--dist DIR]
 *         node scripts/verify-hydration.mjs --url https://live-music-coder.pro   (a deployment)
 * Exit:   0 all checks pass · 1 a check failed or the server/browser could not start
 * Not part of `npm run build`: Netlify's image has no Playwright browsers.
 */

import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { sitemapPaths } from './prerender.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argValue = (flag) => {
  const at = process.argv.indexOf(flag)
  return at > -1 ? process.argv[at + 1] : undefined
}
const remoteUrl = argValue('--url')
const dist = path.resolve(argValue('--dist') ?? path.join(root, 'dist'))
/* Random port: a fixed one may already serve another project (or a previous run still exiting) */
const port = 4600 + Math.floor(Math.random() * 300)
const base = remoteUrl ? remoteUrl.replace(/\/+$/, '') : `http://127.0.0.1:${port}`
const label = remoteUrl ?? path.relative(root, dist)

const failures = []
const fail = (message) => failures.push(message)
const prerenderedH1 = (html) => html.match(/<div id="root"[^>]*>[\s\S]*?<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]
/*
 * Netlify injects its collaboration drawer (an iframe of app.netlify.com) into deploy previews
 * only; the site's CSP blocks it and Chromium logs that as a console error. Not the app, not
 * hydration, and absent on the production domain. Printed, never counted.
 */
const NOT_THE_APP = [/Framing 'https:\/\/app\.netlify\.com\/' violates the following Content Security Policy/]

/* The sitemap and the home page's <h1> come from the build under test */
let sitemapXml
let homeHtml
let server
if (remoteUrl) {
  sitemapXml = await (await fetch(`${base}/sitemap.xml`)).text()
} else {
  sitemapXml = readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  homeHtml = readFileSync(path.join(dist, 'index.html'), 'utf8')
  server = spawn(
    process.execPath,
    [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--outDir', dist, '--port', String(port), '--strictPort', '--host', '127.0.0.1'],
    { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] },
  )
}
const { paths: routes, problems: sitemapProblems } = sitemapPaths(sitemapXml)
for (const problem of sitemapProblems) fail(`sitemap: ${problem}`)

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const response = await fetch(`${base}/?verify=${Date.now()}`)
      if (response.ok) return await response.text()
    } catch {
      /* not listening yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`${base} did not answer within 10 s`)
}

/** A page whose console errors and uncaught errors are collected */
async function openPage(context) {
  const page = await context.newPage()
  const errors = []
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    if (NOT_THE_APP.some((rx) => rx.test(message.text()))) {
      console.log(`[verify-hydration] ignored (deploy-preview drawer): ${message.text().split('\n')[0]}`)
      return
    }
    errors.push(`console: ${message.text().split('\n')[0]}`)
  })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message.split('\n')[0]}`))
  return { page, errors }
}

/* Recoverable errors are reported after commit: give them a moment to land */
const settle = (page) => page.waitForTimeout(500)

let browser
try {
  const servedHome = await waitForServer()
  const expectedH1 = prerenderedH1(servedHome)
  if (!expectedH1) throw new Error(`${base}/ serves no prerendered <h1> in #root`)
  if (homeHtml && prerenderedH1(homeHtml) !== expectedH1) throw new Error(`${base} does not serve ${label}`)

  browser = await chromium.launch()
  const english = await browser.newContext({ locale: 'en-US', serviceWorkers: 'block' })

  // 1. Every route of the sitemap hydrates in English
  for (const route of routes) {
    const { page, errors } = await openPage(english)
    await page.goto(`${base}${route}`, { waitUntil: 'load' })
    await page.waitForLoadState('networkidle').catch(() => {})
    await settle(page)
    const marked = await page.locator('#root').getAttribute('data-prerendered')
    if (marked !== route) fail(`${route}: #root is marked ${JSON.stringify(marked)}, expected ${route}`)
    const h1s = await page.locator('h1').count()
    if (h1s !== 1) fail(`${route}: expected exactly one <h1> after hydration, found ${h1s}`)
    for (const error of errors) fail(`${route}: ${error}`)
    await page.close()
  }

  // 2. /editor: the IDE mounts once hydration is done
  {
    const { page, errors } = await openPage(english)
    await page.goto(`${base}/editor`, { waitUntil: 'load' })
    try {
      await page.waitForSelector('.cm-editor', { state: 'attached', timeout: 15_000 })
    } catch {
      fail('/editor: the IDE never replaced the placeholder (useIsClient did not flip, or its chunk failed)')
    }
    await settle(page)
    for (const error of errors) fail(`/editor (IDE): ${error}`)
    await page.close()
  }

  // 3. /: the start button navigates to the editor
  {
    const { page, errors } = await openPage(english)
    await page.goto(`${base}/`, { waitUntil: 'load' })
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.getByRole('button', { name: /Start Coding/ }).click()
    try {
      await page.waitForURL(/\/editor$/, { timeout: 5_000 })
      await page.waitForSelector('.cm-editor', { state: 'attached', timeout: 15_000 })
    } catch {
      fail('/: clicking "Start Coding" did not open the editor: the handlers are not attached')
    }
    await settle(page)
    for (const error of errors) fail(`/ → /editor: ${error}`)
    await page.close()
  }

  // 4. /legal#datenschutz: the hash only takes effect after hydration
  if (routes.includes('/legal')) {
    const { page, errors } = await openPage(english)
    await page.goto(`${base}/legal#datenschutz`, { waitUntil: 'load' })
    try {
      await page.waitForSelector('#tab-datenschutz[aria-selected="true"]', { timeout: 5_000 })
    } catch {
      fail('/legal#datenschutz: the Datenschutz tab never became selected')
    }
    await settle(page)
    for (const error of errors) fail(`/legal#datenschutz: ${error}`)
    await page.close()
  }

  // 5. German saved as the language: rendered from scratch over the English HTML
  {
    const german = await browser.newContext({ locale: 'de-DE', serviceWorkers: 'block' })
    await german.addInitScript(() => {
      try { localStorage.setItem('lmc-lang', 'de') } catch { /* storage blocked */ }
    })
    const { page, errors } = await openPage(german)
    await page.goto(`${base}/docs`, { waitUntil: 'load' })
    try {
      await page.waitForFunction(() => document.querySelector('h1')?.textContent === 'Erste Schritte', null, { timeout: 5_000 })
    } catch {
      fail('/docs in German: the page never switched to German')
    }
    const lang = await page.locator('html').getAttribute('lang')
    if (lang !== 'de') fail(`/docs in German: <html lang> is ${JSON.stringify(lang)}, expected "de"`)
    await settle(page)
    for (const error of errors) fail(`/docs (de): ${error}`)
    await german.close()
  }

  // 6. A deep link without a prerendered file of its own
  {
    const slug = (await (await fetch(`${base}/sessions`)).text()).match(/href="\/sessions\/([a-z0-9-]+)"/)?.[1]
    if (!slug) {
      fail('/sessions lists no session link to follow')
    } else {
      const { page, errors } = await openPage(english)
      await page.goto(`${base}/sessions/${slug}`, { waitUntil: 'load' })
      await page.waitForLoadState('networkidle').catch(() => {})
      await settle(page)
      const h1s = await page.locator('h1').count()
      if (h1s < 1) fail(`/sessions/${slug}: no <h1> rendered`)
      for (const error of errors) fail(`/sessions/${slug}: ${error}`)
      await page.close()
    }
  }
} catch (error) {
  fail(error.message)
} finally {
  await browser?.close()
  server?.kill()
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`[verify-hydration] FAIL — ${failure}`)
  process.exit(1)
}
console.log(
  `[verify-hydration] OK — ${label}: ${routes.length} routes hydrate without errors, the IDE mounts, ` +
    'the start button works, /legal#datenschutz, German and a deep link render cleanly',
)
