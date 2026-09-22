// ============================================================
// device-lock.js v3.1 - النسخة النهائية المُصلحة
// يحل مشكلة Firebase Arrays + قفل الأجهزة + التنشيط اليدوي
// ============================================================

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // ⚙️ الإعدادات
    // ═══════════════════════════════════════════════════════════
    const CONFIG = {
        MAX_DEVICES: 3,
        TRIAL_DAYS: 7000,
        STORAGE_KEY: 'mizan_device',
        LICENSE_KEY: 'mizan_license',
        DEV_PHONE: '+201234567890',
        DEV_EMAIL: 'dev@mizan.com',
        CHECK_INTERVAL: 120000
    };

    // ═══════════════════════════════════════════════════════════
    // 🆔 توليد بصمة الجهاز
    // ═══════════════════════════════════════════════════════════
    async function generateDeviceId() {
        try {
            const components = [
                navigator.userAgent,
                navigator.language,
                screen.width + 'x' + screen.height,
                screen.colorDepth,
                new Date().getTimezoneOffset(),
                navigator.hardwareConcurrency || 'unknown',
                navigator.platform || 'unknown'
            ];

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Mizan', 2, 15);
            components.push(canvas.toDataURL());

            try {
                const gl = canvas.getContext('webgl');
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
                    components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
                }
            } catch (e) {}

            const fingerprint = components.join('|');
            const hash = await sha256(fingerprint);
            return hash.substring(0, 32);
        } catch (e) {
            return 'fb-' + btoa(navigator.userAgent + screen.width).substring(0, 24);
        }
    }

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // ═══════════════════════════════════════════════════════════
    // 🔄 تحويل Firebase Object إلى Array (الحل الأساسي)
    // ═══════════════════════════════════════════════════════════
    function toArray(data) {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        return Object.values(data).filter(item => item !== null && item !== undefined);
    }

    // ═══════════════════════════════════════════════════════════
    // 🔍 فحص الجهاز
    // ═══════════════════════════════════════════════════════════
    async function checkDevice() {
        const deviceId = await generateDeviceId();
        window.__deviceId = deviceId;

        // انتظار Firebase
        let attempts = 0;
        while (!window.firebaseReady && attempts < 20) {
            await new Promise(r => setTimeout(r, 200));
            attempts++;
        }

        if (!window.firebaseReady) {
            console.warn('⚠️ Firebase غير متصل - سيتم السماح مؤقتاً');
            try { localStorage.setItem(CONFIG.STORAGE_KEY, deviceId); } catch(e) {}
            return { allowed: true, deviceId: deviceId, offline: true };
        }

        try {
            const ref = firebase.database().ref('mizan_licenses/' + CONFIG.LICENSE_KEY);
            const snapshot = await ref.once('value');
            const data = snapshot.val() || {};

            // ✅ الحل: تحويل devices من كائن إلى مصفوفة
            const devices = toArray(data.devices);
            const maxDevices = data.maxDevices || CONFIG.MAX_DEVICES;

            console.log('📊 الأجهزة المسجلة:', devices.length, '/', maxDevices);

            // فحص: هل الجهاز موجود ومفعّل؟
            const existingDevice = devices.find(d => d && d.id === deviceId);

            if (existingDevice && existingDevice.activated) {
                // ✅ الجهاز مفعّل
                existingDevice.lastSeen = new Date().toISOString();
                
                try {
                    await ref.update({
                        devices: devices,
                        maxDevices: maxDevices
                    });
                } catch (e) {
                    console.warn('⚠️ فشل تحديث lastSeen:', e.message);
                }
                
                try { localStorage.setItem(CONFIG.STORAGE_KEY, deviceId); } catch(e) {}
                
                console.log('✅ جهاز مفعّل - مرحباً');
                return { allowed: true, deviceId: deviceId, isNew: false };
            }

            // جهاز مسجل لكن غير مفعّل
            if (existingDevice && !existingDevice.activated) {
                return {
                    allowed: false,
                    reason: 'NEED_ACTIVATION',
                    deviceId: deviceId
                };
            }

            // فحص الحد الأقصى
            const activeDevices = devices.filter(d => d && d.activated);

            if (activeDevices.length >= maxDevices) {
                return {
                    allowed: false,
                    reason: 'MAX_DEVICES',
                    deviceId: deviceId,
                    currentCount: activeDevices.length,
                    maxCount: maxDevices
                };
            }

            // جهاز جديد - يحتاج تنشيط
            return {
                allowed: false,
                reason: 'NEED_ACTIVATION',
                deviceId: deviceId,
                deviceCount: devices.length,
                maxCount: maxDevices
            };

        } catch (e) {
            console.error('❌ خطأ Firebase:', e);
            return { allowed: true, deviceId: deviceId, offline: true, error: e.message };
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 🔐 التحقق من كود التنشيط
    // ═══════════════════════════════════════════════════════════
    async function validateActivationCode(deviceId, inputCode) {
        if (!inputCode) return { valid: false, reason: 'EMPTY' };
        const code = inputCode.trim().toUpperCase();

        if (!window.firebaseReady) {
            return { valid: false, reason: 'NO_INTERNET' };
        }

        try {
            // 1. فحص كود المطور الرئيسي
            const masterCode = await getMasterCode();
            if (code === masterCode) {
                return { valid: true, type: 'master' };
            }

            // 2. فحص من Firebase
            const ref = firebase.database().ref('mizan_activations/' + code);
            const snapshot = await ref.once('value');

            if (!snapshot.exists()) {
                return { valid: false, reason: 'INVALID_CODE' };
            }

            const data = snapshot.val();

            // فحص الجهاز
            if (data.deviceId && data.deviceId !== deviceId) {
                return { valid: false, reason: 'WRONG_DEVICE' };
            }

            // فحص تاريخ الانتهاء
            if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
                return { valid: false, reason: 'EXPIRED' };
            }

            // فحص عدد الاستخدامات
            if (data.maxUses && (data.uses || 0) >= data.maxUses) {
                return { valid: false, reason: 'MAX_USES' };
            }

            // تحديث عدد الاستخدامات
            if (data.maxUses) {
                await ref.update({ uses: (data.uses || 0) + 1 });
            }

            return { valid: true, type: 'firebase' };

        } catch (e) {
            console.error('خطأ في التحقق:', e);
            return { valid: false, reason: 'ERROR' };
        }
    }

    // كود المطور (مشفر)
    async function getMasterCode() {
        const parts = ['TVpBTi1N', 'QVNURVIt', 'MjAyNS1T', 'RUNSRVQ='];
        return atob(parts.join(''));
    }

    // ═══════════════════════════════════════════════════════════
    // ✅ تسجيل الجهاز
    // ═══════════════════════════════════════════════════════════
    async function registerDevice(deviceId, activationType) {
        const deviceInfo = {
            id: deviceId,
            name: getDeviceName(),
            platform: navigator.platform || 'unknown',
            registeredAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            activated: true,
            activationType: activationType
        };

        try { localStorage.setItem(CONFIG.STORAGE_KEY, deviceId); } catch(e) {}

        if (!window.firebaseReady) return;

        try {
            const ref = firebase.database().ref('mizan_licenses/' + CONFIG.LICENSE_KEY);
            const snapshot = await ref.once('value');
            const data = snapshot.val() || {};
            
            // ✅ تحويل إلى مصفوفة
            let devices = toArray(data.devices);
            
            // إزالة الجهاز إذا كان موجوداً
            devices = devices.filter(d => d && d.id !== deviceId);
            devices.push(deviceInfo);

            const maxDevices = data.maxDevices || CONFIG.MAX_DEVICES;

            await ref.set({
                devices: devices,
                maxDevices: maxDevices
            });

            console.log('✅ تم تسجيل الجهاز');

            // إشعار للمطور
            try {
                await firebase.database().ref('mizan_dev_notifications').push({
                    title: 'جهاز جديد تم تفعيله',
                    data: {
                        deviceId: deviceId,
                        deviceName: deviceInfo.name,
                        activationType: activationType,
                        time: new Date().toISOString()
                    },
                    timestamp: new Date().toISOString(),
                    read: false
                });
            } catch (e) {}

        } catch (e) {
            console.warn('⚠️ فشل تسجيل الجهاز:', e.message);
        }
    }

    function getDeviceName() {
        const ua = navigator.userAgent;
        if (/android/i.test(ua)) return 'Android Device';
        if (/iPad|iPhone|iPod/.test(ua)) return 'iOS Device';
        if (/Windows/i.test(ua)) return 'Windows PC';
        if (/Macintosh/i.test(ua)) return 'Mac';
        if (/Linux/i.test(ua)) return 'Linux PC';
        return 'Unknown Device';
    }

    // ═══════════════════════════════════════════════════════════
    // 🎨 شاشة التنشيط
    // ═══════════════════════════════════════════════════════════
    function showActivationScreen(result) {
        const reason = result.reason;
        let title, message, icon, extraInfo = '';
        let showInput = true;

        if (reason === 'MAX_DEVICES') {
            icon = '🚫';
            title = 'تم رفض التفعيل';
            message = 'تم الوصول للحد الأقصى من الأجهزة المسموح بها.';
            showInput = false;
            extraInfo = `
                <div style="background:#0D0D0D;border-radius:12px;padding:14px;margin-bottom:20px;text-align:right;">
                    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #2D2D2D;">
                        <span style="color:#A89070;">الأجهزة المسجلة:</span>
                        <strong style="color:#E06060;">${result.currentCount}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;">
                        <span style="color:#A89070;">الحد الأقصى:</span>
                        <strong style="color:#C9A94E;">${result.maxCount}</strong>
                    </div>
                </div>
            `;
        } else {
            icon = '🔐';
            title = 'تنشيط التطبيق مطلوب';
            message = 'أدخل كود التنشيط لتشغيل التطبيق على هذا الجهاز.';
            extraInfo = `
                <div style="background:#0D0D0D;border-radius:12px;padding:14px;margin-bottom:20px;text-align:right;">
                    <div style="font-size:11px;color:#A89070;margin-bottom:6px;font-weight:800;">بصمة جهازك:</div>
                    <div style="font-size:11px;color:#4A8AB5;font-family:monospace;word-break:break-all;background:#000;padding:8px;border-radius:6px;line-height:1.4;">
                        ${result.deviceId}
                    </div>
                    <button onclick="window.__copyDeviceId()" style="
                        margin-top:8px;width:100%;padding:8px;
                        background:#4A8AB5;border:none;color:#fff;
                        border-radius:6px;font-size:11px;cursor:pointer;
                        font-family:inherit;font-weight:800;
                    ">📋 نسخ البصمة الكاملة</button>
                </div>
            `;
        }

        document.body.innerHTML = `
            <div style="
                position: fixed;top:0;left:0;width:100%;height:100%;
                background:linear-gradient(135deg,#0D0D0D,#1C1C1C);
                display:flex;justify-content:center;align-items:center;
                padding:20px;font-family:'Tajawal',Arial,sans-serif;
                z-index:999999;overflow-y:auto;
            ">
                <div style="
                    background:#1C1C1C;border:2px solid #C9A94E;
                    border-radius:20px;padding:30px 24px;max-width:420px;
                    width:100%;text-align:center;
                    box-shadow:0 20px 50px rgba(201,169,78,0.3);
                    margin:20px auto;
                ">
                    <div style="font-size:64px;margin-bottom:16px;">${icon}</div>
                    <h1 style="color:#C9A94E;font-size:22px;margin-bottom:12px;font-weight:900;">${title}</h1>
                    <p style="color:#F5E6C8;font-size:14px;line-height:1.8;margin-bottom:20px;">${message}</p>
                    ${extraInfo}

                    ${showInput ? `
                        <div style="margin-bottom:16px;text-align:right;">
                            <label style="display:block;color:#A89070;font-size:12px;margin-bottom:6px;font-weight:800;">
                                🔑 كود التنشيط:
                            </label>
                            <input type="text" id="activationCodeInput" 
                                placeholder="أدخل الكود هنا"
                                style="
                                    width:100%;padding:14px;border-radius:10px;
                                    border:2px solid #3D3D3D;background:#0D0D0D;
                                    color:#F5E6C8;font-size:13px;
                                    font-family:monospace;text-align:center;
                                    letter-spacing:1px;font-weight:900;
                                    box-sizing:border-box;
                                " />
                            <div id="activationError" style="
                                color:#E06060;font-size:12px;margin-top:8px;
                                display:none;font-weight:800;text-align:center;
                            "></div>
                        </div>
                        <button onclick="window.__tryActivate()" style="
                            width:100%;padding:14px;border-radius:10px;border:none;
                            background:linear-gradient(135deg,#2D8F5E,#1A7A4A);
                            color:#fff;font-size:14px;font-weight:900;
                            cursor:pointer;font-family:inherit;margin-bottom:10px;
                        ">✅ تفعيل التطبيق</button>
                    ` : ''}

                    <div style="
                        margin-top:20px;padding-top:16px;
                        border-top:1px dashed #3D3D3D;
                        font-size:11px;color:#A89070;line-height:1.8;text-align:right;
                    ">
                        <strong style="color:#C9A94E;display:block;margin-bottom:8px;">📞 تواصل مع المطور:</strong>
                        <div>📱 واتساب: ${CONFIG.DEV_PHONE}</div>
                        <div>📧 إيميل: ${CONFIG.DEV_EMAIL}</div>
                    </div>
                </div>
            </div>
        `;

        // نسخ البصمة
        window.__copyDeviceId = function() {
            const id = result.deviceId;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(id).then(() => {
                    alert('✅ تم نسخ البصمة الكاملة:\n\n' + id);
                }).catch(() => {
                    prompt('انسخ البصمة يدوياً:', id);
                });
            } else {
                prompt('انسخ البصمة يدوياً:', id);
            }
        };

        // محاولة التنشيط
        window.__tryActivate = async function() {
            const input = document.getElementById('activationCodeInput');
            const errorEl = document.getElementById('activationError');
            const code = input.value.trim();

            if (!code) {
                errorEl.textContent = '⚠️ أدخل كود التنشيط';
                errorEl.style.color = '#E06060';
                errorEl.style.display = 'block';
                return;
            }

            errorEl.textContent = '⏳ جاري التحقق...';
            errorEl.style.color = '#C9A94E';
            errorEl.style.display = 'block';

            const validation = await validateActivationCode(result.deviceId, code);

            if (validation.valid) {
                errorEl.textContent = '✅ تم التفعيل! جاري إعادة التشغيل...';
                errorEl.style.color = '#2D8F5E';
                
                await registerDevice(result.deviceId, validation.type);
                
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                const msgs = {
                    'INVALID_CODE': '❌ كود غير صحيح',
                    'EXPIRED': '⏰ الكود منتهي',
                    'MAX_USES': '🚫 تم استخدام الكود بالحد الأقصى',
                    'WRONG_DEVICE': '⚠️ الكود مخصص لجهاز آخر',
                    'NO_INTERNET': '⚠️ لا يوجد اتصال بالإنترنت',
                    'ERROR': '⚠️ خطأ في التحقق'
                };
                errorEl.textContent = msgs[validation.reason] || '❌ كود غير صحيح';
                errorEl.style.color = '#E06060';
                input.value = '';
            }
        };

        // تركيز تلقائي
        setTimeout(() => {
            const input = document.getElementById('activationCodeInput');
            if (input) {
                input.focus();
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') window.__tryActivate();
                });
            }
        }, 100);
    }

    // ═══════════════════════════════════════════════════════════
    // 🚀 التشغيل الرئيسي
    // ═══════════════════════════════════════════════════════════
    async function initDeviceLock() {
        console.log('🔐 فحص الجهاز...');

        const result = await checkDevice();
        console.log('📋 النتيجة:', result);

        if (!result.allowed) {
            showActivationScreen(result);
            return false;
        }

        console.log('✅ الجهاز مسموح - التطبيق جاهز');
        return true;
    }

    // ═══════════════════════════════════════════════════════════
    // 🛠️ دوال المطور
    // ═══════════════════════════════════════════════════════════

    // توليد كود لجهاز معين
    window.devGenerateCode = async function(deviceId) {
        if (!deviceId) return null;
        const deviceShort = deviceId.substring(0, 8).toUpperCase();
        const masterCode = await getMasterCode();
        const combined = deviceId + masterCode;
        const hash = await sha256(combined);
        const codeHash = hash.substring(0, 12).toUpperCase();
        return 'MIZAN-' + deviceShort.substring(0, 4) + '-' + 
               codeHash.substring(0, 4) + '-' + codeHash.substring(4, 8);
    };

    // عرض الأجهزة المسجلة
    window.devShowDevices = async function() {
        if (!window.firebaseReady) { alert('⚠️ Firebase غير متصل'); return; }
        try {
            const ref = firebase.database().ref('mizan_licenses/' + CONFIG.LICENSE_KEY);
            const snapshot = await ref.once('value');
            const data = snapshot.val() || {};
            const devices = toArray(data.devices);
            
            let msg = `📱 الأجهزة المسجلة (${devices.length}/${data.maxDevices || CONFIG.MAX_DEVICES}):\n\n`;
            if (devices.length === 0) {
                msg += 'لا توجد أجهزة مسجلة';
            } else {
                devices.forEach((d, i) => {
                    msg += `${i+1}. ${d.name || 'جهاز'} ${d.activated ? '✅' : '⏳'}\n`;
                    msg += `   ID: ${(d.id || '').substring(0, 16)}...\n`;
                    msg += `   التاريخ: ${new Date(d.registeredAt).toLocaleDateString('ar-EG')}\n\n`;
                });
            }
            alert(msg);
        } catch (e) {
            alert('❌ خطأ: ' + e.message);
        }
    };

    // حذف جهاز
    window.devRemoveDevice = async function(deviceId) {
        if (!confirm('⚠️ حذف هذا الجهاز؟')) return;
        try {
            const ref = firebase.database().ref('mizan_licenses/' + CONFIG.LICENSE_KEY);
            const snapshot = await ref.once('value');
            const data = snapshot.val() || {};
            let devices = toArray(data.devices);
            devices = devices.filter(d => d && d.id !== deviceId);
            
            await ref.set({
                devices: devices,
                maxDevices: data.maxDevices || CONFIG.MAX_DEVICES
            });
            
            alert('✅ تم حذف الجهاز');
        } catch (e) {
            alert('❌ خطأ: ' + e.message);
        }
    };

    window.initDeviceLock = initDeviceLock;

    // بدء التشغيل
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initDeviceLock, 500));
    } else {
        setTimeout(initDeviceLock, 500);
    }

    console.log('✅ device-lock.js v3.1 - جاهز');
})();
