/* Book to Game — service worker: utamakan jaringan agar revisi buku/game langsung terbaru,
   simpan salinan untuk dimainkan tanpa internet. */
var CACHE = "b2g-v1";
var INTI = ["./", "index.html", "inti.js", "buku/pustaka.js", "manifest.webmanifest", "ikon.svg", "ikon-192.png", "ikon-512.png"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(INTI); }).catch(function () {})); self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== CACHE; }).map(function (x) { return caches.delete(x); })); })); self.clients.claim(); });
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET" || /generativelanguage/.test(e.request.url)) return;
  e.respondWith(fetch(e.request).then(function (r) {
    if (r && (r.ok || r.type === "opaque")) { var c = r.clone(); caches.open(CACHE).then(function (ca) { ca.put(e.request, c); }); }
    return r;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (m) { return m || caches.match("index.html"); }); }));
});
