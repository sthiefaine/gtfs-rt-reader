self.addEventListener("install", (event) => {
  const urlsToCache = ["/", "/manifest.webmanifest", "/icon.svg"];
  event.waitUntil(
    caches.open("gtfs-rt-static-v1").then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("gtfs-rt-static-") && key !== "gtfs-rt-static-v1")
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) =>
      cached ||
      fetch(request).then((response) => {
        const copy = response.clone();
        caches.open("gtfs-rt-static-v1").then((cache) => {
          cache.put(request, copy);
        });
        return response;
      }).catch(() => cached)
    )
  );
});

