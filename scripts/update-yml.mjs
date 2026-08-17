// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
//
// Minimal parser for electron-builder's latest-mac.yml.
//
// Hand-rolled rather than pulling in a YAML dependency: the shape is fixed and
// generated, and a verifier that depends on more code has more ways to be wrong
// than the thing it verifies.

/**
 * @typedef {{ url: string, sha512?: string, size?: number }} UpdateFile
 */

/**
 * Parse the `files:` list.
 *
 * The trailing top-level keys are the trap. electron-builder repeats the FIRST
 * file's hash at the root for legacy clients:
 *
 *     files:
 *       - url: app-arm64.dmg
 *         sha512: <arm64 hash>
 *     path: app.zip
 *     sha512: <zip hash>          <-- top level, belongs to nothing in files[]
 *
 * A parser that keeps assigning to the last entry silently overwrites the arm64
 * hash with the zip's, and then reports a checksum mismatch on a file that is
 * perfectly fine. Indentation is what separates them, so indentation is what
 * this checks: a line starting in column zero ends the list.
 *
 * @param {string} yml
 * @returns {UpdateFile[]}
 */
export function parseUpdateYml(yml) {
  /** @type {UpdateFile[]} */
  const files = []
  /** @type {UpdateFile | null} */
  let current = null
  let inFiles = false

  for (const line of yml.split('\n')) {
    if (line.trim() === '') continue

    /* A key in column zero is a top-level key: `files:` opens the list, and
       anything else after it closes the list for good. */
    if (/^\S/.test(line)) {
      if (/^files:\s*$/.test(line)) {
        inFiles = true
        continue
      }
      if (inFiles) break
      continue
    }

    if (!inFiles) continue

    const url = line.match(/^\s+-\s+url:\s*(.+?)\s*$/)
    if (url) {
      current = { url: url[1] }
      files.push(current)
      continue
    }

    if (!current) continue

    const sha512 = line.match(/^\s+sha512:\s*(.+?)\s*$/)
    if (sha512) {
      current.sha512 = sha512[1]
      continue
    }

    const size = line.match(/^\s+size:\s*(\d+)\s*$/)
    if (size) current.size = Number(size[1])
  }

  return files
}
