// ============================================================
// الميزان 14.0.0 - Service Worker
// يعمل بدون إنترنت + caching
// ============================================================

const CACHE_NAME = 'mizan-v14-' + new Date().getTime();
const OFFLINE_URL = 'index.html';

// الملفات التي سيتم تخزينها مؤقتاً (تعمل بدون إنترنت)
const CACHE_FILES = [
    './',
    './index.html',
    './app.js',
    './style.css',
    './manifest.json'
];

// ═══════════════════════════════════════════════════════════
// التثبيت - تخزين الملفات مؤقتاً
// ═══════════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: جاري التثبيت...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 تخزين الملفات مؤقتاً...');
                return cache.addAll(CACHE_FILES.map(url => new Request(url, { cache: 'reload' })));
            })
            .then(() => {
                console.log('✅ Service Worker: تم التثبيت');
                return self.skipWaiting();
            })
            .catch((err) => {
                console.error('❌ Service Worker: فشل التثبيت', err);
            })
    );
});

// ═══════════════════════════════════════════════════════════
// التنشيط - حذف النسخ القديمة
// ═══════════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
    console.log('⚡ Service Worker: جاري التنشيط...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('🗑️ حذف النسخة القديمة:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: تم التنشيط');
                return self.clients.claim();
            })
    );
});

// ═══════════════════════════════════════════════════════════
// الجلب - إرجاع الملفات من الكاش أو الإنترنت
// ═══════════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
    // تجاهل طلبات Firebase و APIs
    const url = new URL(event.request.url);
    
    if (url.hostname.includes('firebase') ||
        url.hostname.includes('googleapis') ||
        url.hostname.includes('gstatic') ||
        url.hostname.includes('cdnjs') ||
        event.request.method !== 'GET') {
        return; // اترك الطلب يمر عادي
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // ملف موجود في الكاش — استخدمه فوراً، ثم حدّثه بالخلفية
                    fetch(event.request)
                        .then((networkResponse) => {
                            if (networkResponse && networkResponse.status === 200) {
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(event.request, networkResponse.clone());
                                });
                            }
                        })
                        .catch(() => {});
                    return cachedResponse;
                }

                // غير موجود في الكاش — اجلبه من الإنترنت
                return fetch(event.request)
                    .then((response) => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                        return response;
                    })
                    .catch(() => {
                        // عند فشل الإنترنت — أعد صفحة index.html
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// ═══════════════════════════════════════════════════════════
// الإشعارات (اختياري)
// ═══════════════════════════════════════════════════════════
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('✅ Service Worker: تم التحميل');