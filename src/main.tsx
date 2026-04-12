/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Application entry point */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './styles/global.css'
import App from './App.tsx'
import { isElectronMac } from './lib/platform'

/* Tag <html> with `electron-mac` when running the packaged app on
   macOS so global.css can reserve space at the top for the custom
   title-bar drag strip (see <TitleBar /> in App.tsx). Never fires
   on the web or on Linux/Windows. */
if (isElectronMac) {
  document.documentElement.classList.add('electron-mac')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/* Register service worker for PWA offline support.
   Skip under file:// (packaged Electron) — service workers are not
   supported on file:// and the registration always rejects, polluting
   the console and the renderer crash logs. */
if (
  'serviceWorker' in navigator &&
  !import.meta.env.DEV &&
  (location.protocol === 'http:' || location.protocol === 'https:')
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* SW registration failed — app works fine without it */
    })
  })
}
