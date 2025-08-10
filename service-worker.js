const CACHE='series-tracker-cache-v1';
const FILES=['.','index.html','styles.css','app.js','manifest.json'];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(clients.claim());
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});
