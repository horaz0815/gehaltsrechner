// Service Worker: zuerst Netz (immer aktuell), offline aus dem Cache
var CACHE = 'gehaltsrechner-3.2.0';
var FILES = ['./', 'index.html', 'manifest.json', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) {
    e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
    self.skipWaiting();
});
self.addEventListener('activate', function (e) {
    e.waitUntil(caches.keys().then(function (k) {
        return Promise.all(k.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
    }));
    self.clients.claim();
});
self.addEventListener('fetch', function (e) {
    if (e.request.method !== 'GET') return;
    if (e.request.url.indexOf('version.json') !== -1) return; // Update-Pruefung nie aus dem Cache
    e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(function (r) {
        var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); return r;
    }).catch(function () {
        return caches.match(e.request).then(function (m) { return m || caches.match('index.html'); });
    }));
});
