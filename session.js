// ============================================================
// session.js - إدارة الجلسات + JWT
// ============================================================

(function() {
    'use strict';

    console.log('🔑 تحميل session.js');

    const SESSION_KEY = 'mizan_session';
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 دقيقة
    const JWT_SECRET = 'MIZAN_JWT_SECRET_2025_' + (localStorage.getItem('mizan_device_id') || 'default');

    // ═══════════════════════════════════════════════════════════
    // 🎫 JWT Token بسيط
    // ═══════════════════════════════════════════════════════════
    window.createJWT = async function(payload) {
        const header = { alg: 'HS256', typ: 'JWT' };
        const now = Math.floor(Date.now() / 1000);
        const fullPayload = Object.assign({}, payload, {
            iat: now,
            exp: now + (30 * 60) // 30 دقيقة
        });

        const encodedHeader = base64UrlEncode(JSON.stringify(header));
        const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
        const signature = await hmacSha256(encodedHeader + '.' + encodedPayload, JWT_SECRET);
        const encodedSignature = base64UrlEncode(signature);

        return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
    };

    window.verifyJWT = async function(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            const [encodedHeader, encodedPayload, encodedSignature] = parts;

            // التحقق من التوقيع
            const expectedSignature = await hmacSha256(encodedHeader + '.' + encodedPayload, JWT_SECRET);
            const expectedEncoded = base64UrlEncode(expectedSignature);

            if (expectedEncoded !== encodedSignature) {
                console.warn('❌ توقيع JWT غير صالح');
                return null;
            }

            // فك التشفير
            const payload = JSON.parse(base64UrlDecode(encodedPayload));

            // التحقق من الانتهاء
            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                console.warn('❌ JWT منتهي');
                return null;
            }

            return payload;

        } catch (e) {
            console.warn('❌ خطأ JWT:', e.message);
            return null;
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 🔐 HMAC-SHA256
    // ═══════════════════════════════════════════════════════════
    async function hmacSha256(message, secret) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        const signature = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(message)
        );
        return Array.from(new Uint8Array(signature))
            .map(b => String.fromCharCode(b))
            .join('');
    }

    function base64UrlEncode(str) {
        return btoa(unescape(encodeURIComponent(str)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    function base64UrlDecode(str) {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        return decodeURIComponent(escape(atob(base64)));
    }

    // ═══════════════════════════════════════════════════════════
    // 📋 إدارة الجلسة
    // ═══════════════════════════════════════════════════════════
    window.saveSession = function(token, user) {
        const session = {
            token: token,
            userId: user.id,
            userName: user.name,
            role: user.role,
            createdAt: Date.now(),
            expiresAt: Date.now() + SESSION_TIMEOUT,
            deviceId: localStorage.getItem('mizan_device_id') || 'unknown',
            userAgent: navigator.userAgent.substring(0, 100)
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        console.log('✅ تم حفظ الجلسة');
    };

    window.getSession = function() {
        try {
            const data = localStorage.getItem(SESSION_KEY);
            if (!data) return null;

            const session = JSON.parse(data);

            // التحقق من الانتهاء
            if (session.expiresAt < Date.now()) {
                console.log('⏰ الجلسة منتهية');
                window.clearSession();
                return null;
            }

            // التحقق من الجهاز
            const currentDevice = localStorage.getItem('mizan_device_id') || 'unknown';
            if (session.deviceId !== currentDevice) {
                console.warn('⚠️ الجهاز مختلف');
                window.clearSession();
                return null;
            }

            return session;

        } catch (e) {
            console.warn('❌ خطأ قراءة الجلسة:', e.message);
            return null;
        }
    };

    window.clearSession = function() {
        localStorage.removeItem(SESSION_KEY);
        console.log('🔒 تم مسح الجلسة');
    };

    window.refreshSession = function() {
        const session = window.getSession();
        if (!session) return false;

        session.expiresAt = Date.now() + SESSION_TIMEOUT;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return true;
    };

    // ═══════════════════════════════════════════════════════════
    // ⏰ مؤقت الجلسة
    // ═══════════════════════════════════════════════════════════
    let sessionCheckInterval = null;

    window.startSessionMonitor = function() {
        if (sessionCheckInterval) clearInterval(sessionCheckInterval);

        sessionCheckInterval = setInterval(function() {
            const session = window.getSession();
            if (!session) {
                // الجلسة انتهت
                if (window.currentUser) {
                    console.warn('⏰ انتهت الجلسة - تسجيل خروج');
                    if (typeof showToast === 'function') {
                        showToast('⏰ انتهت الجلسة', 'warning');
                    }
                    if (typeof lockApp === 'function') {
                        window.currentUser = null;
                        localStorage.removeItem('mizan_current_user');
                        const loginCont = document.getElementById('loginContainer');
                        const appCont = document.getElementById('appContent');
                        if (loginCont) loginCont.classList.remove('hidden');
                        if (appCont) appCont.style.display = 'none';
                        if (typeof populateLoginUsers === 'function') populateLoginUsers();
                    }
                }
            }
        }, 60000); // فحص كل دقيقة
    };

    // ═══════════════════════════════════════════════════════════
    // 🔄 تحديث checkLogin
    // ═══════════════════════════════════════════════════════════
    setTimeout(function() {
        const originalCheckLogin = window.checkLogin;
        if (!originalCheckLogin || originalCheckLogin._secured) return;

        window.checkLogin = async function() {
            const userId = document.getElementById('loginUsername') ? document.getElementById('loginUsername').value : '';
            const password = document.getElementById('loginPassword') ? document.getElementById('loginPassword').value : '';
            const error = document.getElementById('loginError');

            // فحص القفل
            if (typeof isAccountLocked === 'function') {
                const lockStatus = isAccountLocked();
                if (lockStatus.locked) {
                    if (error) {
                        error.textContent = `🚫 الحساب مقفل. حاول بعد ${lockStatus.remaining} دقيقة`;
                        error.classList.add('show');
                    }
                    return;
                }
            }

            if (!userId) {
                if (error) { error.textContent = '⚠️ اختر المستخدم'; error.classList.add('show'); }
                return;
            }

            const user = window.users.find(u => u.id == userId);
            if (!user) {
                if (error) { error.textContent = '⚠️ المستخدم غير موجود'; error.classList.add('show'); }
                return;
            }

            // التحقق من كلمة المرور (مشفرة أو عادية)
            let isValid = false;

            if (user.password && user.password.startsWith('pbkdf2_')) {
                // كلمة مرور مشفرة
                isValid = await window.verifyPasswordPBKDF2(password, user.password);
            } else {
                // كلمة مرور عادية (قديمة)
                isValid = (user.password === password);
                // ترقية فورية
                if (isValid && typeof hashPasswordPBKDF2 === 'function') {
                    const salt = generateSalt();
                    user.password = await hashPasswordPBKDF2(password, salt);
                    window.setData('users', window.users);
                    console.log('🔐 تم ترقية كلمة المرور');
                }
            }

            if (!isValid) {
                if (typeof recordFailedLogin === 'function') recordFailedLogin();
                if (error) { error.textContent = '⚠️ كلمة المرور خاطئة'; error.classList.add('show'); }
                const pwdInput = document.getElementById('loginPassword');
                if (pwdInput) pwdInput.value = '';
                setTimeout(function() { if (error) error.classList.remove('show'); }, 3000);
                return;
            }

            // نجح الدخول
            if (typeof recordSuccessfulLogin === 'function') recordSuccessfulLogin();

            window.currentUser = user;

            // إنشاء JWT
            const token = await window.createJWT({
                userId: user.id,
                name: user.name,
                role: user.role
            });

            // حفظ الجلسة
            window.saveSession(token, user);
            window.startSessionMonitor();

            // حفظ المستخدم
            localStorage.setItem('mizan_current_user', JSON.stringify({
                id: user.id, name: user.name, role: user.role
            }));

            if (error) error.classList.remove('show');
            const pwdInput2 = document.getElementById('loginPassword');
            if (pwdInput2) pwdInput2.value = '';

            const loginCont = document.getElementById('loginContainer');
            const appCont = document.getElementById('appContent');
            if (loginCont) loginCont.classList.add('hidden');
            if (appCont) appCont.style.display = 'block';

            if (typeof updateUserUI === 'function') updateUserUI();
            if (typeof applyPermissions === 'function') applyPermissions();
            if (typeof showToast === 'function') showToast('🔓 مرحباً ' + user.name + '!', 'success');
            if (typeof navigateTo === 'function') navigateTo('dashboard');

            console.log('✅ تم تسجيل الدخول - JWT:', token.substring(0, 30) + '...');

            // مزامنة سحابية
            setTimeout(function() {
                if (window.firebaseReady) {
                    if (typeof startAutoSync === 'function') startAutoSync();
                    if (typeof updateConnectionStatus === 'function') updateConnectionStatus();
                    if (typeof syncFromCloud === 'function') syncFromCloud(true);
                }
            }, 1000);
        };

        window.checkLogin._secured = true;
        console.log('✅ checkLogin محمي بـ JWT + PBKDF2');
    }, 2000);

    console.log('✅ session.js جاهز');
})();
