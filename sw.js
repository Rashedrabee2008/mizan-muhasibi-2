// ============================================================
// Service Worker - العمل بدون إنترنت
// ============================================================

const CACHE_NAME = 'mizan-v1.0.0';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './app-extras.js',
    './device-lock.js',
    './dev-panel.js',
    './icon.png',
    'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// ═══ تثبيت ═══
self.addEventListener('install', (event) => {
    console.log('🔧 SW: تثبيت');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 SW: تخزين الملفات');
            return cache.addAll(URLS_TO_CACHE.map(url => {
                return new Request(url, { mode: 'no-cors' });
            })).catch(err => {
                console.warn('⚠️ SW: بعض الملفات فشلت:', err);
            });
        })
    );
    self.skipWaiting();
});

// ═══ تنشيط ═══
self.addEventListener('activate', (event) => {
    console.log('✅ SW: تنشيط');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ SW: حذف cache قديم:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// ═══ جلب البيانات ═══
self.addEventListener('fetch', (event) => {
    // تجاهل طلبات Firebase
    if (event.request.url.includes('firebase') || 
        event.request.url.includes('googleapis')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            // إذا موجود في cache، أرجعه
            if (response) {
                // جلب نسخة جديدة في الخلفية
                fetch(event.request).then((newResponse) => {
                    if (newResponse && newResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, newResponse.clone());
                        });
                    }
                }).catch(() => {});
                
                return response;
            }

            // إذا غير موجود، جلبه من الشبكة
            return fetch(event.request).then((response) => {
                // تجاهل الطلبات غير الناجحة
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // احفظ نسخة
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch(() => {
                // إذا فشل الاتصال، أرجع صفحة offline
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});

// ═══ رسائل من التطبيق ═══
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
