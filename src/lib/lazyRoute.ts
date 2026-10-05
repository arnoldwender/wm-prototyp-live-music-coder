// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   lazyRoute — React.lazy for a route page, plus preload().

   The pages behind lazy() are split into their own chunks. Two
   places need such a page to render WITHOUT suspending:
     · the build-time prerender (src/entry-server.tsx):
       renderToString cannot wait for a chunk, it would write the
       Suspense fallback into the HTML instead of the page;
     · the browser, when it takes over a prerendered page
       (src/main.tsx): a suspending page would replace the
       prerendered content with the loading spinner.

   Both call preload() first. Once the module is in memory, the
   lazy() loader returns a thenable that settles on the spot:
   React's lazyInitializer runs then() and, when the callback has
   already fired, renders the module in the same pass (React 19.2,
   ReactLazy.js; the docs accept "a Promise or another thenable").
   Without preload() the page loads exactly as before.
   ────────────────────────────────────────────────────────── */

import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

type PageModule = { default: ComponentType }

export interface LazyRoute {
  /** The component to put in a <Route element> */
  Page: LazyExoticComponent<ComponentType>
  /** Loads the page's chunk; resolves once lazy() can render it synchronously */
  preload: () => Promise<void>
}

/** A thenable whose callback runs inside then(), before then() returns */
function settled(module: PageModule): Promise<PageModule> {
  const thenable = {
    then(onFulfilled: (value: PageModule) => unknown) {
      onFulfilled(module)
      return thenable
    },
  }
  /* @types/react types the loader as returning a Promise; React only calls then() */
  return thenable as unknown as Promise<PageModule>
}

export function lazyRoute(load: () => Promise<PageModule>): LazyRoute {
  let loaded: PageModule | undefined
  let pending: Promise<void> | undefined

  const preload = () => {
    pending ??= load().then(
      (module) => {
        loaded = module
      },
      (error: unknown) => {
        /* A failed chunk request must not stay cached: the next render retries it */
        pending = undefined
        throw error
      },
    )
    return pending
  }

  const Page = lazy(() => (loaded ? settled(loaded) : preload().then(() => loaded!)))
  return { Page, preload }
}
