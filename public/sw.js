// PWA install needs a registered service worker.
// Keep fetch as network-pass-through only — do not cache navigations
// (Safari can show "This page couldn't load" if fetch interception fails).

const VERSION = "kerago-sw-v4";

self.addEventListener("install", () => {
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

// Pass through only for non-navigation requests.
// Never intercept document navigations — Safari can fail the whole page load.
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") return;
  event.respondWith(fetch(event.request));
});
