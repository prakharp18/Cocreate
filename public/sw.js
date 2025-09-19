const CACHE_NAME = 'cocreate-v1';
const urlsToCache = [
  '/',
  '/logo.png',
  '/geminicreated.png',
  'https://fonts.cdnfonts.com/css/satoshi',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
