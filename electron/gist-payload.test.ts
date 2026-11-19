// @vitest-environment node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { describe, expect, it } from 'vitest'
import {
  MAX_GIST_BYTES,
  MAX_GIST_FILES,
  describeGistUpload,
  validateClipboardToken,
  validateGistPayload,
} from './gist-payload'

const project = { 'project.json': { content: '{}' }, 'main.js': { content: 'note("c3")' } }

describe('validateGistPayload', () => {
  it('rebuilds a well-formed payload and reports what it holds', () => {
    const upload = validateGistPayload({ files: project, description: 'Live Music Coder: demo', isPublic: false })
    expect(upload.files).toEqual(project)
    expect(upload.fileNames).toEqual(['project.json', 'main.js'])
    expect(upload.totalBytes).toBe(12)
    expect(upload.isPublic).toBe(false)
    expect(upload.gistId).toBeUndefined()
  })

  it('drops everything but the text content of a file', () => {
    const upload = validateGistPayload({ files: { 'a.js': { content: 'x', filename: 'renamed.js' } } })
    expect(upload.files).toEqual({ 'a.js': { content: 'x' } })
  })

  it('rejects a file set to null — the GitHub API reads that as "delete this file"', () => {
    expect(() => validateGistPayload({ files: { 'project.json': null }, gistId: 'a1b2c3d4e5f6a1b2c3d4' })).toThrow()
  })

  it('rejects files without non-empty text content', () => {
    expect(() => validateGistPayload({ files: { 'a.js': { content: '' } } })).toThrow()
    expect(() => validateGistPayload({ files: { 'a.js': { content: 42 } } })).toThrow()
    expect(() => validateGistPayload({ files: { 'a.js': 'x' } })).toThrow()
  })

  it('rejects a missing, empty or oversized file map', () => {
    expect(() => validateGistPayload(null)).toThrow()
    expect(() => validateGistPayload({ files: {} })).toThrow()
    expect(() => validateGistPayload({ files: [] })).toThrow()
    const tooMany = Object.fromEntries(Array.from({ length: MAX_GIST_FILES + 1 }, (_, i) => [`f${i}.js`, { content: 'x' }]))
    expect(() => validateGistPayload({ files: tooMany })).toThrow()
    expect(() => validateGistPayload({ files: { 'big.js': { content: 'x'.repeat(MAX_GIST_BYTES + 1) } } })).toThrow()
  })

  it('accepts only a hexadecimal gist id', () => {
    expect(validateGistPayload({ files: project, gistId: 'A1B2C3D4E5F6A1B2C3D4' }).gistId).toBe('A1B2C3D4E5F6A1B2C3D4')
    expect(() => validateGistPayload({ files: project, gistId: '../user/repos' })).toThrow()
    expect(() => validateGistPayload({ files: project, gistId: 12345678 })).toThrow()
  })

  it('makes a Gist public only for a literal true', () => {
    expect(validateGistPayload({ files: project, isPublic: 'yes' }).isPublic).toBe(false)
    expect(validateGistPayload({ files: project, isPublic: true }).isPublic).toBe(true)
  })
})

describe('describeGistUpload', () => {
  it('names the Gist that an update overwrites', () => {
    const { message } = describeGistUpload(validateGistPayload({ files: project, gistId: 'a1b2c3d4e5f6a1b2c3d4' }))
    expect(message).toBe('Overwrite Gist a1b2c3d4e5f6 on GitHub?')
  })

  it('says PUBLIC for a new public Gist and lists the files that are sent', () => {
    const { message, detail } = describeGistUpload(validateGistPayload({ files: project, isPublic: true }))
    expect(message).toBe('Create a PUBLIC Gist on GitHub?')
    expect(detail).toContain('2 file(s), 1 kB: project.json, main.js')
  })
})

describe('validateClipboardToken', () => {
  it('accepts trimmed single-line tokens and redacts middle characters', () => {
    const sample = ['tok', '_1234567890abcdef1234'].join('')
    const res = validateClipboardToken(`  ${sample}  \n`)
    expect(res).toEqual({
      ok: true,
      token: sample,
      masked: 'tok_…1234',
    })
  })

  it('masks short tokens completely without leaking characters', () => {
    expect(validateClipboardToken('abc123')).toEqual({
      ok: true,
      token: 'abc123',
      masked: '••••',
    })
  })

  it('rejects empty/non-string input as empty', () => {
    expect(validateClipboardToken(undefined)).toEqual({ ok: false, reason: 'empty' })
    expect(validateClipboardToken('   \n\t ')).toEqual({ ok: false, reason: 'empty' })
  })

  it('rejects tokens containing whitespace, control chars, or >256 characters', () => {
    expect(validateClipboardToken('tok_abc def')).toEqual({ ok: false, reason: 'invalid' })
    expect(validateClipboardToken('tok_abc\ndef')).toEqual({ ok: false, reason: 'invalid' })
    expect(validateClipboardToken('tok_abc\u0007def')).toEqual({ ok: false, reason: 'invalid' })
    expect(validateClipboardToken('a'.repeat(257))).toEqual({ ok: false, reason: 'invalid' })
  })
})
