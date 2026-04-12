// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
//
// Post-build step: replaces __CACHE_VERSION__ in dist/sw.js with a Unix
// timestamp so the service worker cache name busts on every deploy.
// Runs via the "postbuild" npm script — always executes after `vite build`.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const src = resolve(root, 'src/sw.template.js')
const dest = resolve(root, 'dist/sw.js')

if (!existsSync(src)) {
  console.error('[sw-version] src/sw.template.js not found — skipping')
  process.exit(0)
}

const version = Date.now().toString()
const content = readFileSync(src, 'utf-8').replace(/__CACHE_VERSION__/g, version)
writeFileSync(dest, content)

console.log(`[sw-version] dist/sw.js → CACHE_NAME lmc-${version}`)
