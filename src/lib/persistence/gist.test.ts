/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ────────────────────────────────────────────────────────── */
import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredToken, setStoredToken, clearStoredToken } from './gist';

/* Ensure storage APIs are available in test environment */
function ensureStorage(): void {
  if (typeof globalThis.sessionStorage === 'undefined' || typeof globalThis.sessionStorage.removeItem !== 'function') {
    const store: Record<string, string> = {};
    globalThis.sessionStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
      get length() { return Object.keys(store).length; },
      key: (index: number) => Object.keys(store)[index] ?? null,
    };
  }
  if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.removeItem !== 'function') {
    const store: Record<string, string> = {};
    globalThis.localStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
      get length() { return Object.keys(store).length; },
      key: (index: number) => Object.keys(store)[index] ?? null,
    };
  }
}

describe('Gist token management', () => {
  beforeEach(() => {
    ensureStorage();
    clearStoredToken();
  });

  it('stores token in sessionStorage by default', async () => {
    await setStoredToken('test-token', false);
    expect(await getStoredToken()).toBe('test-token');
    clearStoredToken();
  });

  it('stores token in localStorage when remember=true', async () => {
    await setStoredToken('test-token', true);
    expect(await getStoredToken()).toBe('test-token');
    clearStoredToken();
  });

  it('clears token from both storages', async () => {
    await setStoredToken('test-token', true);
    clearStoredToken();
    expect(await getStoredToken()).toBeNull();
  });
});
