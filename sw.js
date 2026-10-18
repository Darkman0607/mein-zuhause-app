const CACHE = 'mein-zuhause-pwa-v1-2-20261018';
const OFFLINE = ['./', './index.html', './diagnose.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(OFFLINE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('mein-zuhause-pwa-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if(req.mode === 'navigate') {
    event.respondWith(fetch(req).then(response => {
      if(response.ok) { const copy=response.clone(); caches.open(CACHE).then(c => c.put(req,copy)); }
      return response;
    }).catch(async () => (await caches.match(req)) || (await caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(response => {
    if(response.ok) { const copy=response.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); }
    return response;
  })));
});
