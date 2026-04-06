/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   App root — BrowserRouter with ErrorBoundary, all routes,
   and a catch-all 404 fallback.
   ────────────────────────────────────────────────────────── */

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import { NotFound, ErrorBoundary } from './components/atoms'

/* Lazy-load non-landing pages — reduces initial bundle for first-visit perf */
const Editor = lazy(() => import('./pages/Editor'))
const Docs = lazy(() => import('./pages/Docs'))
const Samples = lazy(() => import('./pages/Samples'))
const Examples = lazy(() => import('./pages/Examples'))
const Legal = lazy(() => import('./pages/Legal'))

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Landing />} />
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
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
