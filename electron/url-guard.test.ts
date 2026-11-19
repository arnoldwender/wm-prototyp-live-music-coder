// @vitest-environment node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { createExternalUrlGate, describeExternalUrl, isOwnAppUrl } from './url-guard'

describe('isOwnAppUrl', () => {
  const rendererDir = path.resolve('/opt/live-music-coder/dist')

  it('accepts file URLs inside the renderer dist directory including hash routes', () => {
    const indexUrl = `${pathToFileURL(path.join(rendererDir, 'index.html')).href}#/editor`
    expect(isOwnAppUrl(indexUrl, rendererDir, null)).toBe(true)
  })

  it('rejects sibling directory prefix collisions (dist-evil)', () => {
    const siblingUrl = pathToFileURL(path.resolve('/opt/live-music-coder/dist-evil/index.html')).href
    expect(isOwnAppUrl(siblingUrl, rendererDir, null)).toBe(false)
  })

  it('rejects parent traversal and remote origins when packaged', () => {
    const etcUrl = pathToFileURL(path.resolve('/etc/passwd')).href
    expect(isOwnAppUrl(etcUrl, rendererDir, null)).toBe(false)
    expect(isOwnAppUrl('https://evil.example/steal', rendererDir, null)).toBe(false)
  })

  it('allows only the configured devOrigin over HTTP in development', () => {
    expect(isOwnAppUrl('http://localhost:5173/editor', rendererDir, 'http://localhost:5173')).toBe(true)
    expect(isOwnAppUrl('http://localhost:9999/editor', rendererDir, 'http://localhost:5173')).toBe(false)
  })
})

describe('createExternalUrlGate', () => {
  it('allows valid https/mailto links up to the burst limit and blocks javascript:/file:/credentials', () => {
    const allow = createExternalUrlGate(2, 10_000)
    expect(allow('javascript:alert(1)')).toBeNull()
    expect(allow('file:///etc/passwd')).toBeNull()
    expect(allow('https://user:pass@evil.example/')).toBeNull()
    expect(allow('https://github.com/arnoldwender')).toBe('https://github.com/arnoldwender')
    expect(allow('mailto:info@wendermedia.com')).toBe('mailto:info@wendermedia.com')
    expect(allow('https://wendermedia.com')).toBeNull()
  })
})

describe('describeExternalUrl', () => {
  it('formats long https query URLs with bounded length and mailto recipients cleanly', () => {
    const longUrl = `https://example.com/path?token=${'a'.repeat(350)}`
    const web = describeExternalUrl(longUrl)
    expect(web.hostLabel).toBe('https://example.com')
    expect(web.displayUrl.length).toBe(300)
    expect(web.displayUrl.endsWith('...')).toBe(true)

    const mail = describeExternalUrl('mailto:info@wendermedia.com')
    expect(mail.hostLabel).toBe('info@wendermedia.com')
    expect(mail.displayUrl).toBe('mailto:info@wendermedia.com')
  })
})
