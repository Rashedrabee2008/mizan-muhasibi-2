// ============================================================
// Service Worker - الميزان
// ============================================================

const CACHE_NAME = 'mizan-v15';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './app-extras.js',
    './accounts.js',
    './icon.png'
];

// تثبيت
self.addEventListener('install', (event) => {
    console.log('🔧 SW: تثبيت');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(URLS_TO_CACHE).catch(err => {
                console.warn('⚠️ SW: بعض الملفات فشلت:', err);
            });
        })
    );
});

// تنشيط
self.addEventListener('activate', (event) => {
    console.log('✅ SW: تنشيط');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// جلب البيانات
self.addEventListener('fetch', (event) => {
    // تجاهل طلبات Firebase
    if (event.request.url.includes('firebase') || 
        event.request.url.includes('googleapis') ||
        event.request.url.includes('gstatic')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) return response;
            
            return fetch(event.request).then((res) => {
                if (!res || res.status !== 200 || res.type !== 'basic') {
                    return res;
                }
                
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, resClone);
                });
                
                return res;
            }).catch(() => {
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});

console.log('✅ SW جاهز');
