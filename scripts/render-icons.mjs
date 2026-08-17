/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Renders public/icon-192.png and public/icon-512.png from
   public/icon-source.svg so the PWA icons can never silently drift
   from the mark. Run after any change to the icon source:

       node scripts/render-icons.mjs

   Playwright is resolved from a sibling repo rather than added as a
   dependency — this is a one-off authoring tool, not part of the build,
   and the app does not need a browser automation package in its tree.
   If the path below no longer resolves, point PLAYWRIGHT_PATH at any
   checkout that has playwright installed.
   ────────────────────────────────────────────────────────── */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const PW = process.env.PLAYWRIGHT_PATH
  ?? '~/Development/wm-brand-wendermedia-org/node_modules/playwright/index.mjs'
const { chromium } = await import(PW)

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(path.join(root, 'public/icon-source.svg'), 'utf-8')

const browser = await chromium.launch()
for (const size of [192, 512]) {
  const ctx = await browser.newContext({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  })
  const page = await ctx.newPage()
  /* margin:0 and an exactly-sized SVG keep the raster edge-to-edge —
     maskable icons must be full bleed or the OS crop eats the mark. */
  await page.setContent(
    `<body style="margin:0">${svg.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`)}</body>`
  )
  await page.screenshot({ path: path.join(root, `public/icon-${size}.png`), omitBackground: false })
  console.log(`public/icon-${size}.png written`)
  await ctx.close()
}

/* ── Social preview ────────────────────────────────────────
   og-image.png must be rendered with the real webfaces loaded, or the
   single most-shared image of the product ships in the system font
   while the site itself is set in IBM Plex. The @font-face rules below
   point at the same woff2 files the app serves from public/fonts/. */
{
  const ogSvg = readFileSync(path.join(root, 'public/og-image.svg'), 'utf-8')
  const fontDir = path.join(root, 'public/fonts')
  const face = (family, weight, file) =>
    `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;` +
    `src:url('file://${path.join(fontDir, file)}') format('woff2');}`
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.setContent(`<style>
    ${face('IBM Plex Sans', 400, 'ibm-plex-sans-latin-400-normal.woff2')}
    ${face('IBM Plex Sans', 700, 'ibm-plex-sans-latin-700-normal.woff2')}
    ${face('IBM Plex Mono', 400, 'ibm-plex-mono-latin-400-normal.woff2')}
  </style><body style="margin:0">${ogSvg}</body>`)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(root, 'public/og-image.png') })
  console.log('public/og-image.png written')
  await ctx.close()
}

await browser.close()
