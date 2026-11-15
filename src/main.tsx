/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Application entry point */
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import i18n, { INITIAL_LANGUAGE, readyLanguagePromise } from './i18n'
import './styles/global.css'
import App from './App.tsx'
import { isElectron, isElectronMac } from './lib/platform'
import { loadEditor, preloadRoute } from './routes'

if (isElectronMac) {
  document.documentElement.classList.add('electron-mac')
}

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

const prerenderedPath = container.dataset.prerendered
const path = location.pathname.replace(/(.)\/+$/, '$1')

if (prerenderedPath === undefined) {
  if (INITIAL_LANGUAGE === 'en') {
    createRoot(container).render(app)
  } else {
    void readyLanguagePromise.then(() => {
      createRoot(container).render(app)
    })
  }
} else {
  /* Fetch the IDE chunk while the placeholder hydrates (src/pages/EditorPage.tsx) */
  if (path === '/editor') void loadEditor()

  void Promise.all([
    preloadRoute(path).then(() => true, () => false),
    readyLanguagePromise,
  ]).then(([pageLoaded]) => {
    const sameRender = pageLoaded && prerenderedPath === path && i18n.language === 'en' && !isElectron
    if (sameRender) {
      hydrateRoot(container, app)
    } else {
      createRoot(container).render(app)
    }
  })
}

/* Register service worker for PWA offline support (skipped on file:// Electron). */
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
