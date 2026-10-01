// ==========================================
// MEDICINE REMINDER SYSTEM
// SERVICE WORKER
// ==========================================

const CACHE_NAME = "medicine-reminder-v3";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./logo.png"
];


// ==========================================
// INSTALL
// ==========================================

self.addEventListener("install", (event) => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then((cache) => {

                return cache.addAll(APP_FILES);

            })
            .catch((error) => {

                console.error(
                    "❌ Cache install failed:",
                    error
                );

            })

    );

    self.skipWaiting();

});


// ==========================================
// ACTIVATE
// ==========================================

self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys()
            .then((cacheNames) => {

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


// ==========================================
// FETCH
// ==========================================

self.addEventListener("fetch", (event) => {

    const url = new URL(event.request.url);


    // ==========================================
    // RAILWAY BACKEND
    // NEVER INTERCEPT API REQUESTS
    // ==========================================

    if (
        url.hostname ===
        "medicine-reminder-system-production.up.railway.app"
    ) {

        return;

    }


    // ==========================================
    // ONLY HANDLE GET REQUESTS
    // ==========================================

    if (event.request.method !== "GET") {

        return;

    }


    // ==========================================
    // FRONTEND CACHE
    // ==========================================

    event.respondWith(

        caches.match(event.request)
            .then((cachedResponse) => {

                if (cachedResponse) {

                    return cachedResponse;

                }

                return fetch(event.request);

            })
            .catch(() => {

                return fetch(event.request);

            })

    );

});


// ==========================================
// MESSAGE
// ==========================================

self.addEventListener("message", (event) => {

    if (
        event.data &&
        event.data.action === "SKIP_WAITING"
    ) {

        self.skipWaiting();

    }

});