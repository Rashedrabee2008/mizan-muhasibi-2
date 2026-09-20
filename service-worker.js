// ============================================================
// الميزان 14.0.0 - Service Worker
// يعمل بدون إنترنت + caching
// ============================================================

const CACHE_NAME = 'mizan-v15-' + Date.now();
const CACHE_FILES = [
    './',
    './index.html',
    './app.js',
    './app-extras.js',
    './style.css',
    './manifest.json'
];

self.addEventListener('install', function(event) {
    console.log('🔧 Service Worker: تثبيت...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(CACHE_FILES.map(function(url) {
                    return new Request(url, { cache: 'reload' });
                }));
            })
            .then(function() {
                return self.skipWaiting();
            })
            .catch(function(err) {
                console.log('⚠️ فشل تثبيت SW:', err);
            })
    );
});

self.addEventListener('activate', function(event) {
    console.log('⚡ Service Worker: تنشيط...');
    event.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(
                names.map(function(name) {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(event) {
    const url = new URL(event.request.url);
    
    // تجاهل Firebase
    if (url.hostname.includes('firebase') || 
        url.hostname.includes('googleapis') || 
        url.hostname.includes('gstatic') ||
        url.hostname.includes('cdnjs') ||
        event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function(cached) {
            if (cached) {
                fetch(event.request).then(function(response) {
                    if (response && response.status === 200) {
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(event.request, response.clone());
                        });
                    }
                }).catch(function() {});
                return cached;
            }
            
            return fetch(event.request).then(function(response) {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const toCache = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, toCache);
                });
                return response;
            }).catch(function() {
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});

console.log('✅ Service Worker: تم التحميل');
