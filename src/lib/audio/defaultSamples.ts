/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   First-party Dirt-Samples loader.

   Loads the 218 Dirt-Samples manifest from same-origin static assets
   (/samples/dirt-samples.json) and resolves audio files through our
   first-party /dirt-samples/ proxy (pinned to an immutable commit SHA
   in netlify.toml and vite.config.ts). Under Electron's file:// origin,
   both URLs resolve against https://live-music-coder.pro so visitor IP
   addresses are never sent directly to raw.githubusercontent.com or
   subject to GitHub's 60 req/hr unauthenticated API rate limit.
   ────────────────────────────────────────────────────────── */

const PRODUCTION_ORIGIN = 'https://live-music-coder.pro'

export interface DefaultSampleUrls {
  manifestUrl: string
  baseUrl: string
}

/** Resolve manifest and base URLs for the current runtime protocol. */
export function getDefaultSampleUrls(protocol?: string): DefaultSampleUrls {
  const activeProtocol =
    protocol ?? (typeof window !== 'undefined' ? window.location.protocol : 'https:')

  if (activeProtocol === 'file:') {
    return {
      manifestUrl: `${PRODUCTION_ORIGIN}/samples/dirt-samples.json`,
      baseUrl: `${PRODUCTION_ORIGIN}/dirt-samples/`,
    }
  }

  return {
    manifestUrl: '/samples/dirt-samples.json',
    baseUrl: '/dirt-samples/',
  }
}

function toSingleQuotedJsString(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

/**
 * Build the Strudel REPL expression that registers default samples without autoplay.
 * Must use single-quoted JS strings: Strudel's transpiler rewrites double-quoted
 * strings ("...") into mini-notation m("..."), which throws a parse error on URLs.
 */
export function getDefaultSamplesReplExpression(protocol?: string): string {
  const { manifestUrl, baseUrl } = getDefaultSampleUrls(protocol)
  return `samples(${toSingleQuotedJsString(manifestUrl)}, ${toSingleQuotedJsString(baseUrl)})`
}

/** Register default Dirt-Samples on a Strudel REPL instance, with direct webaudio fallback. */
export async function loadDefaultDirtSamples(repl: {
  evaluate: (code: string, autoplay?: boolean) => Promise<unknown>
}): Promise<void> {
  const expr = getDefaultSamplesReplExpression()
  try {
    await repl.evaluate(expr, false)
  } catch {
    const { manifestUrl, baseUrl } = getDefaultSampleUrls()
    const { samples } = await import('@strudel/webaudio')
    await samples(manifestUrl, baseUrl)
  }
}
