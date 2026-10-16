// Cache hors-ligne : l'application et Leaflet en cache d'abord ; les fonds de carte en réseau d'abord, avec repli sur le cache.
const V = 'releve-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== 'tuiles').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.hostname === 'data.geopf.fr' || u.hostname.endsWith('openstreetmap.org')){
    e.respondWith(fetch(e.request).then(r => { if (r.ok){ const c = r.clone(); caches.open('tuiles').then(ca => ca.put(e.request, c)); } return r; }).catch(() => caches.match(e.request)));
    return;
  }
  // l'application : réseau d'abord pour recevoir les mises à jour, cache si pas de réseau
  e.respondWith(fetch(e.request).then(r => { if (r.ok && (u.origin === location.origin || u.hostname === 'unpkg.com')){ const c = r.clone(); caches.open(V).then(ca => ca.put(e.request, c)); } return r; }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html'))));
});
