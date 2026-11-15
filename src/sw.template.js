/* SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Arnold Wender / Wender Media
 *
 * Service Worker — performance-safe caching for Live Music Coder PWA.
 *
 * CRITICAL INVARIANT FOR LIVE CODING:
 * Never call self.skipWaiting() unconditionally on install and NEVER call
 * client.navigate(client.url) on activate. Reloading open tabs mid-performance
 * kills active Web Audio / Strudel sets on stage. New service worker versions
 * wait safely until tabs close (or an explicit SKIP_WAITING message is sent). */

/* __CACHE_VERSION__ is replaced with a Unix timestamp at build time by the
 * swVersionPlugin in vite.config.ts. */
const CACHE_NAME = 'lmc-__CACHE_VERSION__';
const APP_SHELL = [
  '/',
  '/editor',
  '/spa.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

function isCacheableResponse(response) {
  return Boolean(
    response &&
    response.ok &&
    response.status === 200 &&
    response.type === 'basic'
  );
}

/* Install — precache app shell without hijacking live audio tabs */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(APP_SHELL.map((url) => cache.add(url).catch(() => undefined)))
    )
  );
});

/* Allow an explicit user-triggered update banner to activate waiting SW */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* Activate — clean superseded caches and claim uncontrolled clients safely */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

/* Fetch — network-first for HTML navigations, cache-first for hashed assets */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  /* Skip non-GET, cross-origin, and byte-range requests (Cache API rejects 206) */
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;
  if (request.headers.has('range')) return;

  const url = new URL(request.url);

  /* Never cache audio sample libraries — avoids exhausting Cache Storage quota */
  if (url.pathname.startsWith('/dirt-samples/') || (url.pathname.startsWith('/samples/') && !url.pathname.endsWith('.json'))) {
    return;
  }

  /* HTML navigations — network-first so deploys serve matching HTML + asset hashes,
   * falling back offline to cached route or /spa.html shell (never undefined). */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isCacheableResponse(response)) {
            const clone = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;
          const spaShell = await caches.match('/spa.html');
          if (spaShell) return spaShell;
          const homeShell = await caches.match('/');
          return homeShell || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
        })
    );
    return;
  }

  /* Hashed Vite build assets (/assets/*) and self-hosted fonts (/fonts/*) — cache-first */
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/fonts/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (isCacheableResponse(response)) {
            const clone = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  /* Same-origin metadata/icons/manifest — stale-while-revalidate on 200 responses only */
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (isCacheableResponse(response)) {
            const clone = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
