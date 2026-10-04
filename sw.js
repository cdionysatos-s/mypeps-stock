const CACHE='mypeps-v2';
const FILES=['./','./index.html','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request).then(r=>{const c2=r.clone();
    caches.open(CACHE).then(c=>c.put(e.request,c2)).catch(()=>{});return r;}).catch(()=>caches.match('./index.html'))));});
