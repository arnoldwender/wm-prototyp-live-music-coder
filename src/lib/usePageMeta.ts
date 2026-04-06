// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   usePageMeta — sets document.title, meta description, and
   canonical URL per page. Cleans up meta tags on unmount.
   ────────────────────────────────────────────────────────── */

import { useEffect } from 'react'

interface PageMeta {
  title: string
  description: string
  path: string
}

const BASE_URL = 'https://live-music-coder.pro'

/** Set per-page SEO meta tags dynamically (SPA) */
export function usePageMeta({ title, description, path }: PageMeta): void {
  useEffect(() => {
    /* Title */
    document.title = title

    /* Meta description */
    let metaDesc = document.querySelector('meta[name="page-description"]') as HTMLMetaElement | null
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'page-description')
      document.head.appendChild(metaDesc)
    }
    /* Update the main description tag for this page */
    const mainDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (mainDesc) mainDesc.content = description

    /* Canonical URL */
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.href = `${BASE_URL}${path}`

    return () => {
      /* Restore defaults on unmount */
      if (canonical) canonical.href = BASE_URL
    }
  }, [title, description, path])
}
