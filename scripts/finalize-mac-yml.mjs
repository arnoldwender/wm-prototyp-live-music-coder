// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
//
// Rewrite release/latest-mac.yml so it survives contact with GitHub.
//
// electron-builder writes this file when it finishes packaging, which is before
// two things that still have to happen, and it gets both wrong:
//
//   1. NAMES. It writes `Live-Music-Coder-1.3.0-mac.zip`, with hyphens. The file
//      on disk has SPACES, and GitHub turns spaces into DOTS on upload, so the
//      asset is stored as `Live.Music.Coder-1.3.0-mac.zip`. electron-updater
//      requests the name in the yml verbatim, gets 404 on every file, and the
//      whole installed base silently stops updating. This is not hypothetical —
//      it shipped in v1.2.0 and had to be fixed after publication.
//
//   2. HASHES. The DMGs are notarized and stapled AFTER packaging. Stapling
//      rewrites the file, so every sha512 electron-builder computed is stale the
//      moment the ticket lands, and electron-updater discards the download as
//      corrupt.
//
// So: staple first, run this second, upload third. Order is the whole point.
//
// Usage: node scripts/finalize-mac-yml.mjs

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseUpdateYml } from './update-yml.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ymlPath = resolve(root, 'release/latest-mac.yml')

if (!existsSync(ymlPath)) {
  console.error('[finalize-yml] release/latest-mac.yml not found — build first')
  process.exit(1)
}

/** The name GitHub will store the asset under: spaces become dots. */
function publishedName(localName) {
  return localName.replaceAll(' ', '.')
}

/* electron-builder records the base64 of the RAW digest, not hex. */
function sha512Base64(path) {
  return createHash('sha512').update(readFileSync(path)).digest('base64')
}

const original = readFileSync(ymlPath, 'utf-8')
const entries = parseUpdateYml(original)

if (entries.length === 0) {
  console.error('[finalize-yml] yml lists no files')
  process.exit(1)
}

let out = original
let rewritten = 0

for (const entry of entries) {
  /* Find the artifact on disk. electron-builder's yml name is hyphenated, the
     file is spaced — reconstruct rather than guess, by matching the version and
     suffix against what is actually in release/. */
  const spaced = entry.url.replace(/^Live-Music-Coder/, 'Live Music Coder')
  const dotted = publishedName(spaced)
  const candidates = [
    resolve(root, 'release', spaced),
    resolve(root, 'release', entry.url),
  ]
  const found = candidates.find((p) => existsSync(p))

  if (!found) {
    console.error(`[finalize-yml] ${entry.url}: no artifact on disk`)
    process.exit(1)
  }

  const size = statSync(found).size
  const sha512 = sha512Base64(found)

  const changedName = dotted !== entry.url
  const changedHash = sha512 !== entry.sha512
  const changedSize = size !== entry.size

  /* Replace this entry's block. Anchored on the url line so the trailing
     top-level `sha512:` — which belongs to no file — is never touched. */
  const block = new RegExp(
    `( {2}- url: )${entry.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n( {4}sha512: ).*\\n( {4}size: ).*`,
  )
  out = out.replace(block, `$1${dotted}\n$2${sha512}\n$3${size}`)

  if (changedName || changedHash || changedSize) rewritten += 1
  console.log(
    `  ${dotted}` +
      `${changedName ? '  [name]' : ''}` +
      `${changedHash ? '  [sha512]' : ''}` +
      `${changedSize ? '  [size]' : ''}`,
  )
}

/* The top-level path/sha512 pair mirrors the first file — it has to move too, or
   a legacy client resolves a name that does not exist. */
const first = entries[0]
const firstDotted = publishedName(first.url.replace(/^Live-Music-Coder/, 'Live Music Coder'))
const firstPath = resolve(root, 'release', first.url.replace(/^Live-Music-Coder/, 'Live Music Coder'))
out = out.replace(/^path: .*$/m, `path: ${firstDotted}`)
out = out.replace(/^sha512: .*$/m, `sha512: ${sha512Base64(firstPath)}`)

writeFileSync(ymlPath, out)
console.log(`\n[finalize-yml] ${rewritten}/${entries.length} entries corrected\n`)
