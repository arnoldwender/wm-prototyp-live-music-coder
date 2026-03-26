/* ──────────────────────────────────────────────────────────
   App root — BrowserRouter with ErrorBoundary, all routes,
   and a catch-all 404 fallback.
   ────────────────────────────────────────────────────────── */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Editor from './pages/Editor'
import Docs from './pages/Docs'
import Samples from './pages/Samples'
import Examples from './pages/Examples'
import Legal from './pages/Legal'
import { NotFound, ErrorBoundary } from './components/atoms'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
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
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
