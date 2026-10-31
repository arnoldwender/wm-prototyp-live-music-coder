#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/**
 * Browser check of the AI disclosure (Art. 50 EU AI Act): every AI-composed session shows its label
 * where it is perceived, and the site claims nothing it does not have.
 *
 * What is AI-made here are the 49 sessions. There is no AI image: the icons and og-image come from
 * scripts/render-icons.mjs. No built HTML has an <img>, so a search of dist/ cannot tell a labelled
 * session from an unlabelled one, and the labels of the deep links exist only after rendering.
 *
 * Steps, in Chromium with service workers blocked:
 *   1. /sessions in en, de and es: every card shows the visible label of that language;
 *   2. every /sessions/<slug>, in English: the label is visible on the page;
 *   3. every route of the sitemap: renders no image and no raster background. This check assumes the
 *      site has no AI image, so a new image fails until someone decides whether it needs a label;
 *   4. / in en, de and es: the footer names the sessions and does not claim AI images.
 *
 * Usage:  npm run build && node scripts/verify-ai-labels.mjs [--dist DIR]
 *         node scripts/verify-ai-labels.mjs --url https://live-music-coder.pro   (a deployment)
 * Exit:   0 all checks pass · 1 a check failed or the server/browser could not start
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
/* Random port, offset from verify-hydration so both can run side by side */
const port = 4900 + Math.floor(Math.random() * 90)
const base = remoteUrl ? remoteUrl.replace(/\/+$/, '') : `http://127.0.0.1:${port}`

const LABELS = { en: 'AI-composed', de: 'KI-komponiert', es: 'Compuesta por IA' }
const FOOTER_NAMES_SESSIONS = { en: /sessions on this website/i, de: /Sessions auf dieser Website/i, es: /sesiones de este sitio/i }
const CLAIMS_IMAGES = /images on this website|Bilder auf dieser Website|imágenes de este sitio/i
const SITE_ICON = /\.svg(\?|$)/

const failures = []
const fail = (message) => failures.push(message)

let sitemapXml
let server
if (remoteUrl) {
  sitemapXml = await (await fetch(`${base}/sitemap.xml`)).text()
} else {
  sitemapXml = readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  server = spawn(
    process.execPath,
    [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--outDir', dist, '--port', String(port), '--strictPort', '--host', '127.0.0.1'],
    { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] },
  )
}
const { paths: routes } = sitemapPaths(sitemapXml)

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) {
    try {
      if ((await fetch(`${base}/?verify=${Date.now()}`)).ok) return
    } catch {
      /* not listening yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`${base} did not answer within 10 s`)
}

/** A context in this language, with the counter of visible labels available on every page */
async function contextFor(browser, lang) {
  const context = await browser.newContext({ locale: lang, serviceWorkers: 'block' })
  await context.addInitScript((value) => {
    try { localStorage.setItem('lmc-lang', value) } catch { /* storage blocked */ }
    window.__visibleLabels = (scope, text) => [...scope.querySelectorAll('span')].filter((n) => {
      const box = n.getBoundingClientRect()
      return n.textContent.trim() === text && box.width > 0 && box.height > 0 && getComputedStyle(n).visibility !== 'hidden'
    }).length
  }, lang)
  return context
}

let slugs = []
let labelled = 0
let browser
try {
  await waitForServer()
  browser = await chromium.launch()

  // 1. /sessions: each card carries the label of the language it is read in
  for (const [lang, label] of Object.entries(LABELS)) {
    const context = await contextFor(browser, lang)
    const page = await context.newPage()
    await page.goto(`${base}/sessions`, { waitUntil: 'load' })
    await page.waitForFunction((text) => document.body.textContent.includes(text), label, { timeout: 10_000 }).catch(() => {})
    const cards = await page.evaluate(
      (text) => [...document.querySelectorAll('#sessions-list a[href^="/sessions/"]')].map((a) => ({
        href: a.getAttribute('href'),
        labels: window.__visibleLabels(a, text),
      })),
      label,
    )
    if (cards.length === 0) fail(`/sessions (${lang}): no session card rendered`)
    for (const card of cards) if (card.labels !== 1) fail(`/sessions (${lang}): ${card.href} shows ${card.labels} "${label}" labels`)
    if (lang === 'en') slugs = cards.map((card) => card.href)
    await context.close()
  }

  // 2. Each session page shows the label where the piece is presented
  {
    const context = await contextFor(browser, 'en')
    const page = await context.newPage()
    for (const href of slugs) {
      await page.goto(`${base}${href}`, { waitUntil: 'load' })
      await page.waitForSelector('h1', { timeout: 10_000 }).catch(() => {})
      const n = await page.evaluate((text) => window.__visibleLabels(document.body, text), LABELS.en)
      if (n < 1) fail(`${href}: no visible "${LABELS.en}" label`)
      else labelled += 1
    }
    await context.close()
  }

  // 3. No route renders an image nobody has classified
  {
    const context = await contextFor(browser, 'en')
    const page = await context.newPage()
    for (const route of routes) {
      await page.goto(`${base}${route}`, { waitUntil: 'load' })
      await page.waitForLoadState('networkidle').catch(() => {})
      const media = await page.evaluate(() => {
        const found = [...document.images].map((img) => img.currentSrc || img.src)
        for (const el of document.querySelectorAll('body *')) {
          const url = getComputedStyle(el).backgroundImage.match(/url\(["']?([^"')]+)/)?.[1]
          if (url && !url.startsWith('data:')) found.push(url)
        }
        return found
      })
      for (const url of media.filter((u) => !SITE_ICON.test(u))) {
        fail(`${route}: renders ${url}. Decide whether it is AI-generated: if it is, it needs a label`)
      }
    }
    await context.close()
  }

  // 4. The footer says what is true, in every language
  for (const lang of Object.keys(LABELS)) {
    const context = await contextFor(browser, lang)
    const page = await context.newPage()
    await page.goto(`${base}/`, { waitUntil: 'load' })
    await page.waitForLoadState('networkidle').catch(() => {})
    const footer = await page.locator('footer').last().textContent().catch(() => '')
    if (CLAIMS_IMAGES.test(footer)) fail(`/ (${lang}): the footer claims AI images, and the site has none`)
    if (!FOOTER_NAMES_SESSIONS[lang].test(footer)) fail(`/ (${lang}): the footer does not name the AI-composed sessions`)
    await context.close()
  }
} catch (error) {
  fail(error.message)
} finally {
  await browser?.close()
  server?.kill()
}

if (failures.length === 0 && slugs.length === 0) fail('no session was measured')
if (failures.length > 0) {
  for (const failure of failures.slice(0, 20)) console.error(`[verify-ai-labels] FAIL — ${failure}`)
  if (failures.length > 20) console.error(`[verify-ai-labels] … and ${failures.length - 20} more`)
  process.exit(1)
}
console.log(
  `[verify-ai-labels] OK — ${slugs.length} sessions labelled in en, de and es on /sessions, ${labelled} session pages, ` +
    `${routes.length} routes without unclassified images, the footer names the sessions`,
)
