const CACHE_NAME = 'erc-portal-cache-v8';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/favicon.ico',
];

// Install SW and cache initial assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate SW and clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch events: Network first, fallback to cache for HTML/assets
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // Only handle GET requests, bypass API calls and dev server modules
  if (
    event.request.method !== 'GET' ||
    url.includes('/api/') ||
    url.includes('/@') ||
    url.includes('/node_modules/') ||
    url.includes('?v=') ||
    url.includes('?t=')
  ) {
    return;
  }

  const isHtmlNav = event.request.mode === 'navigate' || (event.request.headers.get('accept') || '').includes('text/html');
  const fetchReq = isHtmlNav ? new Request(event.request.url, { cache: 'no-cache' }) : event.request;

  event.respondWith(
    fetch(fetchReq)
      .then((response) => {
        // Cache successful network responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If HTML request failed and not in cache, fallback to index
          const accept = event.request.headers.get('accept') || '';
          if (accept.includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});
