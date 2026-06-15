// Service Worker for Nutrify PWA
const CACHE_NAME = 'nutrify-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './onboarding.html',
  './onboarding.js',
  './dashboard.html',
  './dashboard.js',
  './meal-log.html',
  './meal-log.js',
  './ai-assistant.html',
  './ai-assistant.js',
  './analytics.html',
  './analytics.js',
  './profile.html',
  './profile.js',
  './calculator.js',
  './nutritionApi.js',
  './manifest.json',
  './pwa-install.js',
  'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
  'https://unpkg.com/html5-qrcode'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event (Cleanup Old Caches)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (e) => {
  // Bypass service worker caching for external API queries to ensure fresh search data
  if (e.request.url.includes('openfoodfacts.org')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).catch(() => {
        // Fallback for offline fetch errors (optional)
      });
    })
  );
});
