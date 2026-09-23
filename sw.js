// ============================================================
// Service Worker - الميزان v15
// ============================================================

const CACHE_NAME = 'mizan-v15-' + Date.now();
const URLS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './app-extras.js',
    './accounts.js',
    './icon.png'
];

// ═══ تثبيت ═══
self.addEventListener('install', (event) => {
    console.log('🔧 SW: تثبيت');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(URLS_TO_CACHE.map(url => 
                new Request(url, { mode: 'no-cors' })
            )).catch(err => console.warn('⚠️ SW:', err));
        })
    );
});

// ═══ تنشيط ═══
self.addEventListener('activate', (event) => {
    console.log('✅ SW: تنشيط');
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(
                names.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// ═══ جلب ═══
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('firebase') || 
        event.request.url.includes('googleapis') ||
        event.request.url.includes('gstatic')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) return response;
            
            return fetch(event.request).then((res) => {
                if (!res || res.status !== 200 || res.type !== 'basic') return res;
                
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
                return res;
            }).catch(() => {
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});

// ═══ إشعارات Push ═══
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'الميزان';
    const options = {
        body: data.body || 'لديك إشعار جديد',
        icon: './icon.png',
        badge: './icon.png',
        vibrate: [200, 100, 200],
        data: data.data || {},
        actions: data.actions || []
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

// ═══ نقر على الإشعار ═══
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('./')
    );
});

console.log('✅ SW جاهز');
