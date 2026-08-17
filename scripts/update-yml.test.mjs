// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
import { describe, it, expect } from 'vitest'
import { parseUpdateYml } from './update-yml.mjs'

/* The real v1.2.0 file, verbatim, hashes shortened. The trailing top-level
   `path:` / `sha512:` / `releaseDate:` keys are the whole point of the fixture. */
const REAL_YML = `version: 1.2.0
files:
  - url: Live.Music.Coder-1.2.0-mac.zip
    sha512: ZIPHASH==
    size: 145244018
  - url: Live.Music.Coder-1.2.0-arm64-mac.zip
    sha512: ARM64ZIPHASH==
    size: 136886948
  - url: Live.Music.Coder-1.2.0.dmg
    sha512: DMGHASH==
    size: 145998267
  - url: Live.Music.Coder-1.2.0-arm64.dmg
    sha512: ARM64DMGHASH==
    size: 137668531
path: Live.Music.Coder-1.2.0-mac.zip
sha512: ZIPHASH==
releaseDate: '2026-08-17T07:41:17.702Z'
`

describe('parseUpdateYml', () => {
  it('reads every file entry', () => {
    expect(parseUpdateYml(REAL_YML).map((f) => f.url)).toEqual([
      'Live.Music.Coder-1.2.0-mac.zip',
      'Live.Music.Coder-1.2.0-arm64-mac.zip',
      'Live.Music.Coder-1.2.0.dmg',
      'Live.Music.Coder-1.2.0-arm64.dmg',
    ])
  })

  it('does not let the top-level sha512 overwrite the last file', () => {
    /* This is the bug that made the verifier report a checksum mismatch on a
       perfectly good arm64 DMG: electron-builder repeats the FIRST file's hash
       at the root, and a parser that ignores indentation assigns it to the
       LAST entry. Verified against the real artifact — both the local copy and
       the published one hash to the value the yml states. */
    const files = parseUpdateYml(REAL_YML)
    const arm64Dmg = files.find((f) => f.url === 'Live.Music.Coder-1.2.0-arm64.dmg')

    expect(arm64Dmg.sha512).toBe('ARM64DMGHASH==')
    expect(arm64Dmg.sha512).not.toBe('ZIPHASH==')
  })

  it('keeps sizes attached to the right file', () => {
    const files = parseUpdateYml(REAL_YML)
    expect(files.map((f) => f.size)).toEqual([145244018, 136886948, 145998267, 137668531])
  })

  it('returns nothing when there is no files block', () => {
    expect(parseUpdateYml('version: 1.2.0\npath: x.zip\nsha512: ABC==\n')).toEqual([])
  })

  it('ignores keys that appear before the files block', () => {
    const files = parseUpdateYml('version: 1.2.0\nsha512: DECOY==\nfiles:\n  - url: a.zip\n    sha512: REAL==\n')
    expect(files).toHaveLength(1)
    expect(files[0].sha512).toBe('REAL==')
  })
})
