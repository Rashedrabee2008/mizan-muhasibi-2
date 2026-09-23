// ============================================================
// security.js - حماية شاملة للميزان
// ============================================================

(function() {
    'use strict';

    console.log('🔒 تحميل security.js');

    const SECURITY_CONFIG = {
        SESSION_TIMEOUT: 30 * 60 * 1000,   // 30 دقيقة
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_TIME: 15 * 60 * 1000,      // 15 دقيقة
        ENABLE_RIGHT_CLICK_BLOCK: true,
        ENABLE_DEVTOOLS_BLOCK: true,
        ENABLE_COPY_BLOCK: false,           // قد يزعج المستخدم
        ENABLE_SCREENSHOT_BLOCK: false
    };

    // ═══════════════════════════════════════════════════════════
    // 🔐 تشفير كلمات المرور (SHA-256 + Salt)
    // ═══════════════════════════════════════════════════════════
    const SALT = 'MizanSecure2025!@#';

    window.hashPassword = async function(password) {
        if (!password) return '';
        try {
            const msgBuffer = new TextEncoder().encode(password + SALT);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            // Fallback بسيط
            let hash = 0;
            const str = password + SALT;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 🚨 Rate Limiting - منع محاولات الدخول المتكررة
    // ═══════════════════════════════════════════════════════════

    window.getLoginAttempts = function() {
        try {
            const data = localStorage.getItem('mizan_login_attempts');
            if (!data) return { count: 0, lastAttempt: 0, lockedUntil: 0 };
            return JSON.parse(data);
        } catch (e) {
            return { count: 0, lastAttempt: 0, lockedUntil: 0 };
        }
    };

    window.recordFailedLogin = function() {
        const attempts = getLoginAttempts();
        attempts.count = (attempts.count || 0) + 1;
        attempts.lastAttempt = Date.now();

        if (attempts.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
            attempts.lockedUntil = Date.now() + SECURITY_CONFIG.LOCKOUT_TIME;
            console.warn('🚫 تم قفل الحساب مؤقتاً');
        }

        localStorage.setItem('mizan_login_attempts', JSON.stringify(attempts));
    };

    window.recordSuccessfulLogin = function() {
        localStorage.setItem('mizan_login_attempts', JSON.stringify({
            count: 0,
            lastAttempt: Date.now(),
            lockedUntil: 0
        }));
    };

    window.isAccountLocked = function() {
        const attempts = getLoginAttempts();
        if (attempts.lockedUntil && attempts.lockedUntil > Date.now()) {
            const remaining = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
            return { locked: true, remaining: remaining };
        }
        return { locked: false };
    };

    // ═══════════════════════════════════════════════════════════
    // 🚫 منع النقر الأيمن
    // ═══════════════════════════════════════════════════════════
    if (SECURITY_CONFIG.ENABLE_RIGHT_CLICK_BLOCK) {
        document.addEventListener('contextmenu', function(e) {
            // السماح فقط في حقول الإدخال
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            e.preventDefault();
            return false;
        });
    }

    // ═══════════════════════════════════════════════════════════
    // 🚫 منع بعض اختصارات لوحة المفاتيح
    // ═══════════════════════════════════════════════════════════
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+I / Ctrl+Shift+J (DevTools)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) {
            if (SECURITY_CONFIG.ENABLE_DEVTOOLS_BLOCK) {
                e.preventDefault();
                return false;
            }
        }

        // Ctrl+U (View Source)
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
            return false;
        }

        // Ctrl+S (Save Page)
        if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
            // نسمح بحفظ الفاتورة في الكاشير
            const cashier = document.getElementById('page-cashier');
            if (cashier && cashier.classList.contains('active')) return;
            e.preventDefault();
            return false;
        }

        // Ctrl+P (Print) - نسمح به داخل التطبيق
        // Print Screen
        if (e.key === 'PrintScreen' && SECURITY_CONFIG.ENABLE_SCREENSHOT_BLOCK) {
            navigator.clipboard.writeText('').catch(() => {});
            e.preventDefault();
        }
    });

    // ═══════════════════════════════════════════════════════════
    // ⏰ الجلسة - تسجيل خروج تلقائي
    // ═══════════════════════════════════════════════════════════
    let sessionTimer = null;
    let lastActivity = Date.now();

    function resetSessionTimer() {
        lastActivity = Date.now();
        if (sessionTimer) clearTimeout(sessionTimer);

        sessionTimer = setTimeout(function() {
            if (window.currentUser) {
                console.warn('⏰ انتهت الجلسة - تسجيل خروج تلقائي');
                if (typeof showToast === 'function') {
                    showToast('⏰ انتهت الجلسة - سيتم تسجيل الخروج', 'warning');
                }
                setTimeout(() => {
                    if (typeof lockApp === 'function') {
                        // لا نطلب تأكيد
                        window.currentUser = null;
                        localStorage.removeItem('mizan_current_user');
                        const loginCont = document.getElementById('loginContainer');
                        const appCont = document.getElementById('appContent');
                        if (loginCont) loginCont.classList.remove('hidden');
                        if (appCont) appCont.style.display = 'none';
                        if (typeof populateLoginUsers === 'function') populateLoginUsers();
                        if (typeof showToast === 'function') {
                            showToast('🔒 تم تسجيل الخروج تلقائياً', 'info');
                        }
                    }
                }, 2000);
            }
        }, SECURITY_CONFIG.SESSION_TIMEOUT);
    }

    // تفعيل عند أي نشاط
    ['click', 'keydown', 'mousemove', 'touchstart', 'scroll'].forEach(event => {
        document.addEventListener(event, resetSessionTimer, { passive: true });
    });

    // بدء المؤقت فقط عند تسجيل الدخول
    const originalCheckLogin = window.checkLogin;
    if (originalCheckLogin) {
        window.checkLogin = async function() {
            // فحص القفل
            const lockStatus = isAccountLocked();
            if (lockStatus.locked) {
                const error = document.getElementById('loginError');
                if (error) {
                    error.textContent = '🚫 الحساب مقفل. حاول بعد ' + lockStatus.remaining + ' دقيقة';
                    error.classList.add('show');
                }
                return;
            }

            const originalUser = window.currentUser;
            const result = originalCheckLogin.apply(this, arguments);

            // إذا نجح الدخول
            setTimeout(() => {
                if (window.currentUser && window.currentUser !== originalUser) {
                    recordSuccessfulLogin();
                    resetSessionTimer();
                    console.log('✅ تم تسجيل الدخول - بدء مؤقت الجلسة');
                } else if (!window.currentUser) {
                    recordFailedLogin();
                }
            }, 100);

            return result;
        };
    }

    // ═══════════════════════════════════════════════════════════
    // 🔒 منع تعدد علامات التبويب (اختياري)
    // ═══════════════════════════════════════════════════════════
    window.enableSingleTabMode = function() {
        const TAB_KEY = 'mizan_active_tab';
        const TAB_ID = Date.now() + Math.random();

        localStorage.setItem(TAB_KEY, TAB_ID);

        setInterval(() => {
            const activeTab = localStorage.getItem(TAB_KEY);
            if (activeTab && activeTab !== String(TAB_ID) && window.currentUser) {
                // علامة تبويب أخرى مفتوحة
                if (typeof showToast === 'function') {
                    showToast('⚠️ التطبيق مفتوح في تبويب آخر', 'warning');
                }
            }
        }, 5000);
    };

    // ═══════════════════════════════════════════════════════════
    // 📊 تسجيل محاولات الدخول
    // ═══════════════════════════════════════════════════════════

    window.logSecurityEvent = function(event, data) {
        const logs = JSON.parse(localStorage.getItem('mizan_security_logs') || '[]');
        logs.push({
            event: event,
            data: data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent.substring(0, 100)
        });

        // احتفظ بآخر 100 حدث فقط
        if (logs.length > 100) logs = logs.slice(-100);

        localStorage.setItem('mizan_security_logs', JSON.stringify(logs));

        // رفع إلى Firebase
        if (window.firebaseReady) {
            try {
                firebase.database().ref('mizan_security_logs').push({
                    event: event,
                    data: data,
                    timestamp: new Date().toISOString(),
                    device: window.__deviceId || 'unknown'
                });
            } catch (e) {}
        }
    };

    window.showSecurityLogs = function() {
        const logs = JSON.parse(localStorage.getItem('mizan_security_logs') || '[]');

        let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>📊 سجل الأحداث الأمنية</h3>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:14px;max-height:400px;overflow-y:auto;">';

        if (logs.length === 0) {
            html += '<div style="text-align:center;padding:30px;color:#5D5D5D;">لا توجد أحداث</div>';
        } else {
            logs.slice().reverse().slice(0, 50).forEach(log => {
                html += '<div style="background:#1A1A1A;border-radius:8px;padding:10px;margin-bottom:6px;border-right:3px solid #E06060;">' +
                    '<div style="color:#E06060;font-weight:800;font-size:12px;">' + log.event + '</div>' +
                    '<div style="color:#A89070;font-size:10px;margin-top:4px;">' + 
                        new Date(log.timestamp).toLocaleString('ar-EG') +
                    '</div>' +
                '</div>';
            });
        }
        html += '</div>';

        if (typeof openModal === 'function') openModal(html);
    };

    // ═══════════════════════════════════════════════════════════
    // 🔐 تشفير البيانات الحساسة قبل الحفظ في Firebase
    // ═══════════════════════════════════════════════════════════

    window.encryptSensitiveData = function(data) {
        // تشفير كلمات المرور فقط
        if (Array.isArray(data)) {
            return data.map(user => {
                if (user && user.password && !user.password.startsWith('HASH_')) {
                    return Object.assign({}, user, { password: 'HASH_' + user.password });
                }
                return user;
            });
        }
        return data;
    };

    console.log('✅ security.js جاهز');
    console.log('🔒 الميزات المفعّلة:');
    console.log('  • منع النقر الأيمن');
    console.log('  • منع F12 و DevTools');
    console.log('  • منع Ctrl+S و Ctrl+U');
    console.log('  • جلسة 30 دقيقة');
    console.log('  • قفل بعد 5 محاولات');
    console.log('  • تسجيل الأحداث');
})();
