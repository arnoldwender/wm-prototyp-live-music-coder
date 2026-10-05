/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Application entry point */
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import i18n from './i18n'
import './styles/global.css'
import App from './App.tsx'
import { isElectron, isElectronMac } from './lib/platform'
import { loadEditor, preloadRoute } from './routes'

/* Tag <html> with `electron-mac` when running the packaged app on
   macOS so global.css can reserve space at the top for the custom
   title-bar drag strip (see <TitleBar /> in App.tsx). Never fires
   on the web or on Linux/Windows. */
if (isElectronMac) {
  document.documentElement.classList.add('electron-mac')
}

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

/* Mounting.
   `npm run build` prerenders every route of public/sitemap.xml
   (scripts/prerender.mjs): the route's HTML carries the page in
   #root and data-prerendered="<its path>". That HTML is English —
   the build has no browser language — so React adopts it with
   hydrateRoot only when the browser also starts in English on the
   same path. Otherwise it renders from scratch over it: a single
   swap without the loading spinner, because the page's module is
   loaded first. Deep links get the bare SPA shell (spa.html) and
   Electron its own build: an empty #root, rendered as always. */
const prerenderedPath = container.dataset.prerendered
const path = location.pathname.replace(/(.)\/+$/, '$1')

if (prerenderedPath === undefined) {
  createRoot(container).render(app)
} else {
  /* Fetch the IDE chunk while the placeholder hydrates (src/pages/EditorPage.tsx) */
  if (path === '/editor') void loadEditor()

  void preloadRoute(path)
    .then(() => true, () => false)
    .then((pageLoaded) => {
      const sameRender = pageLoaded && prerenderedPath === path && i18n.language === 'en' && !isElectron
      if (sameRender) {
        hydrateRoot(container, app)
      } else {
        createRoot(container).render(app)
      }
    })
}

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
