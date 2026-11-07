
const CACHE_NAME = "story-za-dully-v3";

const FILES_TO_CACHE = [
  "/story-za-dully-pwa/",
  "/story-za-dully-pwa/index.html",
  "/story-za-dully-pwa/manifest.json",
  "/story-za-dully-pwa/icons/icon-192.png",
  "/story-za-dully-pwa/icons/icon-512.png"
];

/* INSTALL */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", (event) => {

  const request = event.request;

  // Hifadhi GET requests pekee
  if (request.method !== "GET") {
    return;
  }

  // Usihifadhi maombi ya Blogger au tovuti nyingine
  const requestURL = new URL(request.url);

  if (requestURL.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {

        if (response && response.status === 200) {

          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });

        }

        return response;

      })
      .catch(async () => {

        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
          return cachedResponse;
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
