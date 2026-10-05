/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Server entry for the build-time prerender (scripts/prerender.mjs),
   built with `vite build --ssr src/entry-server.tsx --outDir dist-ssr`.

   render(url) renders the same tree as src/main.tsx — AppContent
   inside a router, in StrictMode — for one route, after loading
   that route's page module, so renderToString writes the page and
   not the Suspense fallback (src/lib/lazyRoute.ts). The page's
   usePageMeta hands its title, description and path to
   PageMetaContext; the script writes them into the <head>.

   Always English: src/i18n picks English when there is no window,
   and src/main.tsx only hydrates when the browser starts in
   English on the same path.
   ────────────────────────────────────────────────────────── */

import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import './i18n'
import { AppContent } from './App'
import { ErrorBoundary } from './components/atoms'
import { PageMetaContext, type PageMeta } from './lib/usePageMeta'
import { preloadRoute } from './routes'

export interface RenderResult {
  /** The markup for #root */
  html: string
  /** What the page passed to usePageMeta; null if it never called it */
  meta: PageMeta | null
}

export async function render(url: string): Promise<RenderResult> {
  await preloadRoute(url)

  let meta: PageMeta | null = null
  const html = renderToString(
    <StrictMode>
      <PageMetaContext.Provider value={(pageMeta) => { meta = pageMeta }}>
        <ErrorBoundary>
          <StaticRouter location={url}>
            <AppContent />
          </StaticRouter>
        </ErrorBoundary>
      </PageMetaContext.Provider>
    </StrictMode>,
  )
  return { html, meta }
}
