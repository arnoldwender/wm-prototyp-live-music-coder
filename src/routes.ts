// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   Route table of the lazily loaded pages.

   One list feeds <Routes> in App.tsx and preloadRoute(), which
   the build-time prerender (src/entry-server.tsx) and the
   browser (src/main.tsx) call before rendering a prerendered
   page — so the page that is rendered and the page that is
   preloaded cannot drift apart.

   Landing (/) and the /editor wrapper are not here: both are
   in the main bundle. The IDE behind /editor is its own chunk,
   loaded only in the browser (loadEditor, src/pages/EditorPage.tsx):
   its audio engines cannot run in the Node prerender.
   ────────────────────────────────────────────────────────── */

import { matchPath } from 'react-router-dom'
import { lazyRoute, type LazyRoute } from './lib/lazyRoute'

const docs = lazyRoute(() => import('./pages/Docs'))
const samples = lazyRoute(() => import('./pages/Samples'))
const examples = lazyRoute(() => import('./pages/Examples'))
const legal = lazyRoute(() => import('./pages/Legal'))
const sessions = lazyRoute(() => import('./pages/Sessions'))
const sessionPiece = lazyRoute(() => import('./pages/SessionPiece'))
const changelog = lazyRoute(() => import('./pages/Changelog'))
const blog = lazyRoute(() => import('./pages/Blog'))
const blogPost = lazyRoute(() => import('./pages/BlogPost'))

/** Lazy pages by route pattern (react-router path syntax) */
export const LAZY_PAGES: ReadonlyArray<{ path: string; route: LazyRoute }> = [
  { path: '/docs', route: docs },
  { path: '/docs/:sectionId', route: docs },
  { path: '/samples', route: samples },
  { path: '/examples', route: examples },
  { path: '/sessions', route: sessions },
  { path: '/sessions/:slug', route: sessionPiece },
  { path: '/changelog', route: changelog },
  { path: '/blog', route: blog },
  { path: '/blog/:slug', route: blogPost },
  { path: '/legal', route: legal },
]

/** Loads the page module of the route matching `pathname`; resolves at once for other routes */
export function preloadRoute(pathname: string): Promise<void> {
  const match = LAZY_PAGES.find(({ path }) => matchPath(path, pathname))
  return match ? match.route.preload() : Promise.resolve()
}

/** The IDE chunk — browser only (see the header) */
export const loadEditor = () => import('./pages/Editor')
