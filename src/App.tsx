/* ──────────────────────────────────────────────────────────
   App root — BrowserRouter with Landing and Editor routes.
   ────────────────────────────────────────────────────────── */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Editor from './pages/Editor'
import Docs from './pages/Docs'
import Samples from './pages/Samples'
import Examples from './pages/Examples'
import Legal from './pages/Legal'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/:sectionId" element={<Docs />} />
        <Route path="/samples" element={<Samples />} />
        <Route path="/examples" element={<Examples />} />
        <Route path="/legal" element={<Legal />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
