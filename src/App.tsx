/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   App root — conditional Router (HashRouter in Electron under
   file://, BrowserRouter on the web), ErrorBoundary, all routes,
   and a catch-all 404 fallback.

   Why conditional: BrowserRouter relies on HTML5 history which
   requires a URL origin. Under file:// in packaged Electron it
   always resolves to the app root and breaks navigation.
   See .wm-electron-audit.md R1.
   ────────────────────────────────────────────────────────── */

import { lazy, Suspense } from 'react'
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import { NotFound, ErrorBoundary } from './components/atoms'
import { isElectron, isElectronMac, TITLEBAR_HEIGHT } from './lib/platform'

/* Lazy-load non-landing pages — reduces initial bundle for first-visit perf */
const Editor = lazy(() => import('./pages/Editor'))
const Docs = lazy(() => import('./pages/Docs'))
const Samples = lazy(() => import('./pages/Samples'))
const Examples = lazy(() => import('./pages/Examples'))
const Legal = lazy(() => import('./pages/Legal'))
const Sessions = lazy(() => import('./pages/Sessions'))
const SessionPiece = lazy(() => import('./pages/SessionPiece'))
const Changelog = lazy(() => import('./pages/Changelog'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))

/* Electron needs HashRouter under file:// because HTML5 history
   can't distinguish file:// paths. `isElectron` is imported from
   src/lib/platform.ts, which detects window.electronAPI. */
const Router = isElectron ? HashRouter : BrowserRouter

/* Custom title-bar drag strip for Electron on macOS. The main window
   is created with `titleBarStyle: 'hiddenInset'` so there is no native
   title bar — which also means no default draggable region. Without
   this strip the window can't be moved, and the macOS traffic lights
   (rendered at x=12, y=12 by electron/main.ts) end up floating over
   whatever is at the top-left of the current page. The strip is
   invisible (transparent), sits above the app content, and has
   `-webkit-app-region: drag` so macOS treats it as a title bar while
   the traffic lights keep working natively inside it. Body padding
   provided by `.electron-mac body` in global.css reserves matching
   space below so nothing is covered. */
function TitleBar() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: `${TITLEBAR_HEIGHT}px`,
        /* Cast to any — React typings don't include the vendor
           -webkit-app-region property even though Electron relies
           on it. */
        WebkitAppRegion: 'drag',
        zIndex: 9999,
      } as React.CSSProperties}
    />
  )
}

/* Loading fallback for lazy routes. Uses HARDCODED colors (not tokens)
   for the same reason as ErrorBoundary: if a chunk fails or stalls before
   the token CSS loads, this is the only thing the user sees on top of
   BrowserWindow.backgroundColor. A null fallback would be invisible and
   manifests as the v1.0.1 "black screen" symptom. */
function RouteLoader() {
  return (
    <main
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#09090b',
        color: '#a1a1aa',
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        gap: '16px',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: '32px',
          height: '32px',
          border: '3px solid #27272a',
          borderTopColor: '#a855f7',
          borderRadius: '50%',
          animation: 'lmc-spin 800ms linear infinite',
        }}
      />
      <p style={{ fontSize: '14px', margin: 0 }}>Loading editor…</p>
      <style>{`@keyframes lmc-spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}

function App() {
  return (
    <ErrorBoundary>
      {isElectronMac && <TitleBar />}
      <Router>
        <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Both web and Electron show the Landing page at /.
              In Electron, Landing renders a slim version (hero + footer only)
              via the isElectron prop from platform.ts. The hero's "Start Coding"
              CTA navigates to /editor. */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/docs/:sectionId" element={<Docs />} />
          <Route path="/samples" element={<Samples />} />
          <Route path="/examples" element={<Examples />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/:slug" element={<SessionPiece />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/legal" element={<Legal />} />
          {/* Catch-all — any unmatched path renders the 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  )
}

export default App
