// Minimal service worker — enables install prompt.
// Never break navigations if the network fails.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Only handle GET; let browser handle the rest normally
  if (req.method !== "GET") return;

  event.respondWith(
    fetch(req).catch(() => {
      // Avoid hard crash pages when offline / flaky network
      if (req.mode === "navigate") {
        return new Response(
          "<!doctype html><title>KeraGo</title><p style='font-family:sans-serif;padding:2rem'>Network error. Check connection and reload.</p>",
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
      return Response.error();
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate?.(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "KeraGo", body: "You have a new update", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url || "/" },
    })
  );
});
