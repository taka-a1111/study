/* BUILD_TAG: 2026-09-03u */
var CACHE = "kumonmath-2026-09-03u";
var ASSETS = ["./", "./index.html", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./digit_model.json"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
    .then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.map(function(x){ return x === CACHE ? null : caches.delete(x); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("message", function(e){
  if(e.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  // 更新確認用ファイルは常にネットワークから取る
  if(e.request.url.indexOf("version.json") >= 0){
    e.respondWith(fetch(e.request, {cache: "no-store"}).catch(function(){
      return new Response('{"build":""}', {headers:{"Content-Type":"application/json"}});
    }));
    return;
  }
  // それ以外はネットワーク優先・オフライン時のみキャッシュ
  e.respondWith(fetch(e.request).then(function(res){
    var c = res.clone();
    caches.open(CACHE).then(function(x){ x.put(e.request, c); });
    return res;
  }).catch(function(){
    return caches.match(e.request).then(function(h){ return h || caches.match("./index.html"); });
  }));
});
