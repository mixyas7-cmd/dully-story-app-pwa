const CACHE_NAME = "dully-story-app-pwa-v3";
const CACHE_PREFIX = "dully-story-app-pwa-";
const BASE = "/dully-story-app-pwa/";

const APP_FILES = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json"
];

// Install app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate this version without deleting other apps' caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) =>
            name.startsWith(CACHE_PREFIX) &&
            name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// Network first for this app's own files
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

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
            .then((cache) => cache.put(request, copy));
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);

        if (cached) return cached;

        if (request.mode === "navigate") {
          const home = await caches.match(BASE);
          if (home) return home;
        }

        return new Response(
          "Hakuna muunganisho wa internet. Tafadhali jaribu tena.",
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
        
