const CACHE = 'neon-d41a7b22';
const SHELL = ['./', 'index.html', 'style.css?v=d41a7b22', 'engines.js?v=d41a7b22', 'calendar.js?v=d41a7b22', 'app.js?v=d41a7b22', 'ui.js?v=d41a7b22', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'logo-128.png', 'logo-320.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => (k.startsWith('omnixs-') || k.startsWith('neon-')) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin || u.pathname.startsWith('/api/') || u.pathname.startsWith('/.netlify/')) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put('index.html', cp)); } return res; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: false }).then(hit => hit || fetch(r).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => Response.error())));
});
