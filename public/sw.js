// Minimal service worker — required for Android "Install app" prompt.
// Network-only fetch handler (no caching) to avoid stale JS / hydration issues.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
