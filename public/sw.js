// PWA install needs a service worker file. Do NOT intercept pages —
// Safari shows "This page couldn't load" if fetch() on navigations fails.

const VERSION = "kerago-sw-v3";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// Intentionally no fetch handler — let the browser load pages normally.
