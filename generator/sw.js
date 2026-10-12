const CACHE_NAME = "almahad-tools-v1";
const APP_FILES = ["./", "./index.html", "./style.css", "./app.js", "./qr-code-styling.min.js", "./manifest.json", "./logo.jpg", "./icon.svg", "./icon-192.png", "./icon-512.png"];
const QR_LIBRARY = "https://cdn.jsdelivr.net/npm/qr-code-styling@1.9.2/lib/qr-code-styling.min.js";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
    self.clients.claim(),
  ]));
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin === location.origin && url.pathname.startsWith(new URL(self.registration.scope).pathname)) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)); }
      return response;
    })));
  } else if (event.request.url === QR_LIBRARY) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok || response.type === "opaque") { const copy = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)); }
      return response;
    })));
  }
});
