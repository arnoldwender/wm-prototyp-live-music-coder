/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ────────────────────────────────────────────────────────── */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  getStoredToken,
  hasStoredToken,
  setStoredToken,
  clearStoredToken,
  purgeLegacyGistStorage,
  parseGistId,
} from './gist'

function ensureStorage(): void {
  if (typeof globalThis.sessionStorage === 'undefined' || typeof globalThis.sessionStorage.removeItem !== 'function') {
    const store: Record<string, string> = {}
    globalThis.sessionStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
      get length() { return Object.keys(store).length },
      key: (index: number) => Object.keys(store)[index] ?? null,
    }
  }
  if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.removeItem !== 'function') {
    const store: Record<string, string> = {}
    globalThis.localStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
      get length() { return Object.keys(store).length },
      key: (index: number) => Object.keys(store)[index] ?? null,
    }
  }
}

describe('Gist token isolation & legacy scrubbing', () => {
  beforeEach(() => {
    ensureStorage()
    clearStoredToken()
  })

  it('holds web token only in ephemeral memory and never writes to localStorage or sessionStorage', async () => {
    await setStoredToken('ghp_ephemeral_test_token', true)
    expect(await getStoredToken()).toBe('ghp_ephemeral_test_token')
    expect(await hasStoredToken()).toBe(true)

    expect(sessionStorage.getItem('lmc-gist-token')).toBeNull()
    expect(sessionStorage.getItem('lmc-gist-key')).toBeNull()
    expect(localStorage.getItem('lmc-gist-token-enc')).toBeNull()
    expect(localStorage.getItem('lmc-gist-token-persist')).toBeNull()
  })

  it('scrubs legacy PAT keys from both sessionStorage and localStorage', async () => {
    sessionStorage.setItem('lmc-gist-token', 'legacy-session-secret')
    sessionStorage.setItem('lmc-gist-key', 'legacy-aes-key')
    localStorage.setItem('lmc-gist-token-enc', 'legacy-ciphertext')
    localStorage.setItem('lmc-gist-token-persist', 'legacy-plain-secret')

    purgeLegacyGistStorage()

    expect(sessionStorage.getItem('lmc-gist-token')).toBeNull()
    expect(sessionStorage.getItem('lmc-gist-key')).toBeNull()
    expect(localStorage.getItem('lmc-gist-token-enc')).toBeNull()
    expect(localStorage.getItem('lmc-gist-token-persist')).toBeNull()
  })

  it('clears ephemeral token cleanly', async () => {
    await setStoredToken('ghp_ephemeral_test_token')
    clearStoredToken()
    expect(await getStoredToken()).toBeNull()
    expect(await hasStoredToken()).toBe(false)
  })

  it('parses Gist IDs from URLs and raw hex identifiers', () => {
    expect(parseGistId('https://gist.github.com/arnoldwender/a1b2c3d4e5f6')).toBe('a1b2c3d4e5f6')
    expect(parseGistId('a1b2c3d4e5f6')).toBe('a1b2c3d4e5f6')
    expect(parseGistId('not-a-valid-id!')).toBeNull()
  })
})
