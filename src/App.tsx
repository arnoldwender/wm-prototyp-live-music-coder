/* ──────────────────────────────────────────────────────────
   App root — BrowserRouter with Landing and Editor routes.
   ────────────────────────────────────────────────────────── */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Editor from './pages/Editor'
import Docs from './pages/Docs'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/:sectionId" element={<Docs />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
