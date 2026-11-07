
const CACHE_NAME = "dully-story-app-pwa-v1";
const CACHE_PREFIX = "dully-story-app-pwa-";
const BASE = "/dully-story-app-pwa/";

const FILES_TO_CACHE = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json",
  BASE + "icons/icon-192.png",
  BASE + "icons/icon-512.png"
];

/* INSTALL */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

/* ACTIVATE */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter(name =>
            name.startsWith(CACHE_PREFIX) &&
            name !== CACHE_NAME
          )
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

/* FETCH */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  /* IGNORE EXTERNAL WEBSITES */
  if (
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(BASE)
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, copy));
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);

        if (cached) {
          return cached;
        }

        if (request.mode === "navigate") {
          const fallback = await caches.match(BASE);

          if (fallback) {
            return fallback;
          }
        }

        return new Response(
          "Huna muunganisho wa internet. Tafadhali jaribu tena.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8"
            }
          }
        );
      })
  );
});
        
