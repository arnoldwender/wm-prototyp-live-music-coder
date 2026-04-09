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

/* Lazy-load non-landing pages — reduces initial bundle for first-visit perf */
const Editor = lazy(() => import('./pages/Editor'))
const Docs = lazy(() => import('./pages/Docs'))
const Samples = lazy(() => import('./pages/Samples'))
const Examples = lazy(() => import('./pages/Examples'))
const Legal = lazy(() => import('./pages/Legal'))

/* Target detection — electronAPI is only present in packaged Electron
   via contextBridge in electron/preload.ts. */
const isElectron = typeof window !== 'undefined' && !!window.electronAPI
const Router = isElectron ? HashRouter : BrowserRouter

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={null}>
        <Routes>
          {/* In Electron, / renders the Editor directly (no landing page);
              on the web, / renders the marketing Landing. */}
          <Route path="/" element={isElectron ? <Editor /> : <Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/docs/:sectionId" element={<Docs />} />
          <Route path="/samples" element={<Samples />} />
          <Route path="/examples" element={<Examples />} />
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
