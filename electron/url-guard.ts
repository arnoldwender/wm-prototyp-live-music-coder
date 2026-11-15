// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { fileURLToPath } from 'node:url'
import { isAbsolute, relative, resolve } from 'node:path'

/**
 * Determine whether a navigation target belongs to our bundled renderer
 * directory (`file:`) or the active development server origin (`http:`/`https:`).
 *
 * Uses `fileURLToPath` + `path.relative` rather than string prefix matching on
 * `url.pathname` so Windows drive letters (`/C:/...` vs `C:\...`) match
 * accurately and sibling-prefix escapes (`dist-other/`) are rejected.
 */
export function isOwnAppUrl(
  rawUrl: string,
  rendererDir: string,
  devOrigin: string | null,
): boolean {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return false
  }

  if (url.protocol === 'file:') {
    try {
      const targetPath = resolve(fileURLToPath(url))
      const baseDir = resolve(rendererDir)
      const rel = relative(baseDir, targetPath)
      return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
    } catch {
      return false
    }
  }

  return devOrigin !== null && url.origin === devOrigin
}

const ALLOWED_EXTERNAL_PROTOCOLS = new Set(['https:', 'http:', 'mailto:'])

/**
 * Validate and rate-limit external URL launches from the renderer.
 * Prevents evaluated pattern loops from flooding the OS with browser tabs.
 */
export function createExternalUrlGate(maxCalls = 3, windowMs = 5_000): (rawUrl: string) => string | null {
  const timestamps: number[] = []

  return (rawUrl: string): string | null => {
    if (typeof rawUrl !== 'string' || rawUrl.length === 0 || rawUrl.length > 2048) {
      return null
    }
    let parsed: URL
    try {
      parsed = new URL(rawUrl)
    } catch {
      return null
    }
    if (!ALLOWED_EXTERNAL_PROTOCOLS.has(parsed.protocol)) {
      return null
    }

    const now = Date.now()
    while (timestamps.length > 0 && now - timestamps[0] > windowMs) {
      timestamps.shift()
    }
    if (timestamps.length >= maxCalls) {
      return null
    }
    timestamps.push(now)
    return parsed.toString()
  }
}
