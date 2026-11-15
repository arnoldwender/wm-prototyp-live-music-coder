// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   usePageMeta — the title, meta description and canonical URL
   of a page. Each page calls it once, so this is the single
   source for both places that write those tags:

   · the browser: an effect sets document.title, the description
     and the canonical link on every page change (SPA);
   · the build-time prerender: effects never run there, so the
     values are handed to PageMetaContext during render, and
     scripts/prerender.mjs writes them into the <head> of the
     route's HTML file (src/entry-server.tsx provides the context).

   In the browser the context is absent and the call is a no-op.
   ────────────────────────────────────────────────────────── */

import { createContext, useContext, useEffect } from 'react'

export interface PageMeta {
  title: string
  description: string
  path: string
}

/** Origin of every canonical URL — the production domain, never the request host */
export const SITE_URL = 'https://live-music-coder.pro'

/** Receives the page's meta during a server render; null in the browser */
export const PageMetaContext = createContext<((meta: PageMeta) => void) | null>(null)

/** Set per-page SEO meta tags dynamically (SPA) */
export function usePageMeta({ title, description, path }: PageMeta): void {
  const collect = useContext(PageMetaContext)
  collect?.({ title, description, path })

  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${path}`

    /* Title */
    document.title = title

    /* Meta description — index.html always carries one */
    const mainDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (mainDesc) mainDesc.content = description

    /* Open Graph + Twitter Card tags — keep client SPA navigation in sync with SSR head */
    const setMetaContent = (selector: string, content: string) => {
      const el = document.querySelector(selector) as HTMLMetaElement | null
      if (el) el.content = content
    }
    setMetaContent('meta[property="og:title"]', title)
    setMetaContent('meta[property="og:description"]', description)
    setMetaContent('meta[property="og:url"]', canonicalUrl)
    setMetaContent('meta[name="twitter:title"]', title)
    setMetaContent('meta[name="twitter:description"]', description)

    /* Canonical URL — the prerendered pages carry one; the SPA shell gets it here */
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl

    return () => {
      /* Restore defaults on unmount */
      if (canonical) canonical.href = SITE_URL
    }
  }, [title, description, path])
}
