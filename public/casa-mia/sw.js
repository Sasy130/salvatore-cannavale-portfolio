const CACHE='casa-mia-shell-v1';
const FILES=['/casa-mia/offline.html','/casa-mia/icon-192.png','/casa-mia/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('casa-mia-shell-')&&key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()]))});
// Never cache API, authenticated HTML, booking records, login responses or mutations.
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(url.origin!==self.location.origin||event.request.method!=='GET'||!url.pathname.startsWith('/casa-mia/'))return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('/casa-mia/offline.html')))}else if(FILES.includes(url.pathname)){event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)))}});
