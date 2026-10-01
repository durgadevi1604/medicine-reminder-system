// ==========================================
// MEDICINE REMINDER SYSTEM
// SERVICE WORKER
// ==========================================

const CACHE_NAME = "medicine-reminder-v1";
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

                    cacheNames
                        .filter((cacheName) => {

                            return (
                                cacheName !== CACHE_NAME
                            );

                        })
                        .map((cacheName) => {

                            return caches.delete(cacheName);

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

    event.respondWith(

        caches.match(event.request)
            .then((cachedResponse) => {

                if (cachedResponse) {

                    return cachedResponse;

                }

                return fetch(event.request);

            })

    );

});