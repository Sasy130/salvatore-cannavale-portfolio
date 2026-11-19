const CACHE='casa-mia-shell-v3';
const FILES=['/casa-mia/offline.html','/casa-mia/icon-192.png','/casa-mia/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('casa-mia-shell-')&&key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()]))});
// Never cache API, authenticated HTML, booking records, login responses or mutations.
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(url.origin!==self.location.origin||event.request.method!=='GET'||!url.pathname.startsWith('/casa-mia/'))return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('/casa-mia/offline.html')))}else if(FILES.includes(url.pathname)){event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)))}});
// Push payloads contain no guest data; links are fixed to this app's scope.
self.addEventListener('push',event=>{event.waitUntil((async()=>{
 let data={};try{data=event.data?.json()||{};}catch{}
 const test=data.kind==='test',booking=data.kind==='booking',eventId=/^[a-zA-Z0-9-]{1,80}$/.test(data.eventId||'')?data.eventId:'update';
 await self.registration.showNotification(test?'DIMORA MIA · prova dal server':booking?'DIMORA MIA · nuova prenotazione':'DIMORA MIA',{
  body:test?'Notifica di prova inviata dal server.':booking?'Hai ricevuto una prenotazione. Apri l’app per i dettagli.':'Apri DIMORA MIA per controllare gli aggiornamenti.',
  icon:'/casa-mia/icon-192.png',badge:'/casa-mia/icon-192.png',tag:'casa-mia-'+eventId,renotify:false,
  data:{url:booking?'/casa-mia/gestione?view=reservations':'/casa-mia/gestione'}
 });
})())});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{
 const path=event.notification.data?.url==='/casa-mia/gestione?view=reservations'?'/casa-mia/gestione?view=reservations':'/casa-mia/gestione';
 const target=new URL(path,self.location.origin).href;
 const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 const client=windows.find(c=>{try{const u=new URL(c.url);return u.origin===self.location.origin&&u.pathname.startsWith('/casa-mia/');}catch{return false;}});
 if(client){try{await client.navigate(target);await client.focus();return;}catch{}}
 await self.clients.openWindow(target);
})())});
