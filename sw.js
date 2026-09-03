/* Recipe Vault service worker — offline support for a static, no-backend app.
 *
 * Strategy:
 *   - Navigations (HTML): network-first, fall back to cached index.html so the
 *     app opens offline but always shows the latest shell when online.
 *   - Same-origin static assets (js/css/woff2/png/json): stale-while-revalidate
 *     — instant from cache, refreshed in the background, so deploys propagate
 *     without a manual cache-version bump.
 *   - Cross-origin requests (R2 recipe images, YouTube, etc.): left untouched.
 *
 * Bump CACHE_VERSION only if you ever need to hard-invalidate everything.
 */
const CACHE_VERSION = "v2";
const CACHE = "recipe-vault-" + CACHE_VERSION;

// Stable, query-string-free URLs that make the app usable offline after the
// first visit. recipes.js / nutrition.js carry a ?v= cache-buster and are
// picked up by the runtime stale-while-revalidate handler instead.
const PRECACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./avatar.jpg",
  "./fonts.css",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./og-image.png",
  "./fonts/bebasneue-400-normal-latin.woff2",
  "./fonts/bebasneue-400-normal-latin-ext.woff2",
  "./fonts/dmsans-300-normal-latin.woff2",
  "./fonts/dmsans-300-normal-latin-ext.woff2",
  "./fonts/dmsans-300-italic-latin.woff2",
  "./fonts/dmsans-300-italic-latin-ext.woff2",
  "./fonts/dmsans-400-normal-latin.woff2",
  "./fonts/dmsans-400-normal-latin-ext.woff2",
  "./fonts/dmsans-500-normal-latin.woff2",
  "./fonts/dmsans-500-normal-latin-ext.woff2",
  "./fonts/dmsans-700-normal-latin.woff2",
  "./fonts/dmsans-700-normal-latin-ext.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // addAll is atomic; use individual puts so one missing file can't abort install.
      Promise.allSettled(PRECACHE.map((url) => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Only handle our own origin; let cross-origin (images/YouTube) pass through.
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first, fall back to the cached shell when offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() =>
          caches.match("./index.html").then((r) => r || caches.match("./"))
        )
    );
    return;
  }

  // Static assets: stale-while-revalidate. ignoreSearch so a changed ?v=
  // cache-buster still hits the previously cached file instantly.
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req, { ignoreSearch: true }).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200 && res.type === "basic") {
              cache.put(req, res.clone());
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});
