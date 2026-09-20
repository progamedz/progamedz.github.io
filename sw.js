const CACHE_NAME = 'yova-flash-v12';
const ASSETS = [
  './',
  './index.html',
  './jb.html',
  './style.css',
  './app.js',
  './logo.jpeg',
  './logo_raw.png',
  './flag.png',
  './jb.js',
  './core.js',
  './core.js?v=10',
  './jb.js?v=10',
  './mem.js',
  './int64.js',
  './ps4_offsets.js',
  './rpc_worker.js',
  './goldhen.bin',
  './payload2.bin',
  './patches/1302.bin',
  './patches/1350.bin',
  './patches/1352.bin'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
