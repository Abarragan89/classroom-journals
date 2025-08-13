// Service Worker for aggressive caching
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('v1').then((cache) => {
            return cache.addAll([
                '/',
                '/manifest.json',
                '/_next/static/css/',
                '/_next/static/js/',
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Cache static assets
    if (event.request.url.includes('_next/static') ||
        event.request.url.includes('.woff') ||
        event.request.url.includes('.woff2')) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});
