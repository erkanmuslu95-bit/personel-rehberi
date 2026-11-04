// Uygulama dosyalarını önbelleğe alır, böylece internet olmadan da açılır.
// Kod değiştiğinde VERSION'ı artırın ki telefonlar yeni sürümü alsın.
const VERSION = 'v2';
const CACHE = 'personel-' + VERSION;
const SHELL = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'lib/xlsx.full.min.js',
  'lib/jszip.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(SHELL);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    self.clients.claim();
  })());
});

// Kendi dosyalarımız: önce internetten dene (güncel sürüm gelsin), olmazsa önbellekten aç.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      return await fetchAndStore(c, e.request);
    } catch {
      return (await c.match(e.request, { ignoreSearch: true })) || (await c.match('index.html'));
    }
  })());
});

async function fetchAndStore(cache, req) {
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}
