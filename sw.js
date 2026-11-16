/* Recipe Vault service worker — offline support for a static, no-backend app.
 *
 * Strategy:
 *   - Navigations (HTML): network-first, fall back to cached index.html so the
 *     app opens offline but always shows the latest shell when online.
 *   - Versioned assets (style.css?v=…, app.js?v=…, recipes.js?v=…): the URL
 *     changes whenever the file changes, so an EXACT cache hit is always the
 *     right file and a new version is always fetched from the network. Older
 *     versions of the same file are deleted once the new one is stored.
 *   - Unversioned assets (fonts, icons): stale-while-revalidate.
 *   - Offline with no exact hit: fall back to any cached version of the file.
 *   - Cross-origin requests (R2 recipe images, YouTube, etc.): left untouched.
 *
 * Never serve a versioned request from a different version of the file while
 * online: that pairs a new index.html with old CSS/JS/recipes (the bug this
 * replaced — the lookup ignored ?v= and kept returning the first copy cached).
 *
 * Bump CACHE_VERSION only if you ever need to hard-invalidate everything.
 */
const CACHE_VERSION = "v4";
const CACHE = "recipe-vault-" + CACHE_VERSION;

// Stable, query-string-free URLs that make the app usable offline after the
// first visit. recipes.js / nutrition.js carry a ?v= cache-buster and are
// picked up by the runtime stale-while-revalidate handler instead.
const PRECACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
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

  const versioned = /[?&]v=/.test(url.search);
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const exact = await cache.match(req);
      if (versioned && exact) return exact; // immutable: same URL, same content

      const network = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          cache.put(req, copy).then(() => {
            if (!versioned) return;
            // Drop every other cached copy of this file (older ?v= and the
            // unversioned precache entry) so the cache can't grow or go stale.
            return cache.keys().then((keys) =>
              Promise.all(
                keys
                  .filter((k) => new URL(k.url).pathname === url.pathname && k.url !== req.url)
                  .map((k) => cache.delete(k))
              )
            );
          });
        }
        return res;
      });

      if (exact) {
        network.catch(() => {}); // unversioned: serve now, refresh in the background
        return exact;
      }
      try {
        return await network;
      } catch (err) {
        // Offline: any cached version of the file beats a failed request.
        const anyVersion = await cache.match(req, { ignoreSearch: true });
        if (anyVersion) return anyVersion;
        throw err;
      }
    })
  );
});
