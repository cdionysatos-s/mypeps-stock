const CACHE='mypeps-v37';
const SHELL=['./','./index.html','./manifest.json'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys()
    .then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});

/* Network first for the app itself, so a new upload shows up straight away.
   Falls back to the cached copy when there is no signal. */
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  const isShell = e.request.mode==='navigate'
               || url.pathname.endsWith('/')
               || url.pathname.endsWith('index.html')
               || url.pathname.endsWith('manifest.json');
  if(isShell){
    e.respondWith(
      fetch(e.request,{cache:'no-store'})
        .then(r=>{ const c=r.clone(); caches.open(CACHE).then(k=>k.put(e.request,c)).catch(()=>{}); return r; })
        .catch(()=>caches.match(e.request).then(h=>h||caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request)));
});

self.addEventListener('message',e=>{ if(e.data==='skipWaiting') self.skipWaiting(); });
