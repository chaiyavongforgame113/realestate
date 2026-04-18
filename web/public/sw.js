/* Estate AI — Service Worker
 * Strategy:
 *  - App shell: precache on install
 *  - Navigation: network-first with offline fallback
 *  - Same-origin static assets (_next/static/*, /icons/*, /fonts/*): stale-while-revalidate
 *  - Image requests: cache-first with 30-day TTL (+ network fallback)
 *  - API (/api/*): network-first, short cache for GET
 *
 * Also handles Web Push notifications for new listings and appointment reminders.
 */

const VERSION = "v1.1.0";
const SHELL_CACHE = `estate-shell-${VERSION}`;
const STATIC_CACHE = `estate-static-${VERSION}`;
const IMAGE_CACHE = `estate-img-${VERSION}`;
const API_CACHE = `estate-api-${VERSION}`;

const SHELL = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL).catch(() => null))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (k) =>
              ![SHELL_CACHE, STATIC_CACHE, IMAGE_CACHE, API_CACHE].includes(k) &&
              k.startsWith("estate-")
          )
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

function isImageRequest(req) {
  return (
    req.destination === "image" ||
    /\.(png|jpe?g|gif|webp|avif|svg|ico)$/i.test(new URL(req.url).pathname)
  );
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation requests → network-first, fallback to offline page
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(SHELL_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match("/offline");
          return (
            offline ||
            new Response("<h1>ออฟไลน์</h1><p>กรุณาเชื่อมต่ออินเทอร์เน็ต</p>", {
              headers: { "Content-Type": "text/html; charset=utf-8" },
              status: 503,
            })
          );
        }
      })()
    );
    return;
  }

  // API — network-first with tiny cache for GET
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          if (fresh.ok) {
            const cache = await caches.open(API_CACHE);
            cache.put(request, fresh.clone());
          }
          return fresh;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ error: "offline" }),
            { status: 503, headers: { "Content-Type": "application/json" } }
          );
        }
      })()
    );
    return;
  }

  // Images — cache-first
  if (isImageRequest(request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(IMAGE_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          if (fresh.ok) cache.put(request, fresh.clone());
          return fresh;
        } catch {
          return new Response("", { status: 504 });
        }
      })()
    );
    return;
  }

  // Static — stale-while-revalidate
  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => null);
        return cached || (await network) || new Response("", { status: 504 });
      })()
    );
    return;
  }
});

// ── Push notifications ──────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let payload = { title: "Estate AI", body: "มีการอัปเดตใหม่", url: "/" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    if (event.data) payload.body = event.data.text();
  }
  const { title, body, url, image, tag } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      image,
      tag: tag || "estate-general",
      renotify: !!tag,
      vibrate: [80, 40, 80],
      data: { url: url || "/" },
      actions: [
        { action: "open", title: "เปิดดู" },
        { action: "close", title: "ปิด" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "close") return;
  const target = event.notification.data?.url || "/";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        const url = new URL(client.url);
        if (url.origin === self.location.origin) {
          client.focus();
          client.navigate(target);
          return;
        }
      }
      await self.clients.openWindow(target);
    })()
  );
});

// Background sync stub (future — offline wishlist actions)
self.addEventListener("sync", (event) => {
  if (event.tag === "estate-wishlist-sync") {
    event.waitUntil(Promise.resolve());
  }
});
