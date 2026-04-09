/* Service Worker — offline-first caching for Live Music Coder PWA.
 * Caches the app shell on install, serves from cache first, and
 * updates in the background (stale-while-revalidate for pages). */

const CACHE_NAME = 'lmc-v1';
const APP_SHELL = [
  '/',
  '/editor',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

/* Install — precache app shell */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

/* Activate — clean old caches */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Fetch — cache-first for assets, stale-while-revalidate for pages */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  /* Skip non-GET requests and external resources */
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  /* Hashed assets (JS/CSS) — cache-first (immutable) */
  if (request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      }))
    );
    return;
  }

  /* Pages and other resources — stale-while-revalidate */
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
