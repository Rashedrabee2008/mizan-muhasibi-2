// ============================================================
// device-lock.js v2.0 - نظام حماية متكامل
// يشمل: قفل الأجهزة + كود تنشيط + فترة تجريبية + إشعارات
// ============================================================

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // ⚙️ الإعدادات الرئيسية
    // ═══════════════════════════════════════════════════════════
    const CONFIG = {
        MAX_DEVICES: 2,                          // 🔢 الحد الأقصى للأجهزة
        TRIAL_DAYS: 7000,                        // 📅 فترة تجريبية (7000 يوم)
        STORAGE_KEY: 'mizan_device',
        LICENSE_KEY: 'mizan_license',
        ACTIVATION_KEY: 'mizan_activations',
        MASTER_CODE: 'MIZAN-MASTER-2025-SECRET', // 🔑 كود المطور الرئيسي
        DEV_PHONE: '+201234567890',              // 📱 رقم المطور (غيّره)
        DEV_EMAIL: 'dev@mizan.com',              // 📧 إيميل المطور
        CHECK_INTERVAL: 60000,                   // فحص كل دقيقة
        NOTIFY_ON_NEW_DEVICE: true               // إشعار عند جهاز جديد
    };

    // ═══════════════════════════════════════════════════════════
    // 🆔 توليد بصمة فريدة للجهاز
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
                navigator.platform || 'unknown',
                navigator.deviceMemory || 'unknown'
            ];

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Mizan-License', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Mizan-License', 4, 17);
            components.push(canvas.toDataURL());

            try {
                const gl = canvas.getContext('webgl');
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
                    components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
                }
            } catch (e) {}

            try {
                const audioCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100);
                const oscillator = audioCtx.createOscillator();
                oscillator.type = 'triangle';
                oscillator.frequency.value = 10000;
                const compressor = audioCtx.createDynamicsCompressor();
                oscillator.connect(compressor);
                compressor.connect(audioCtx.destination);
                oscillator.start(0);
                const buffer = await audioCtx.startRendering();
                const data = buffer.getChannelData(0);
                let sum = 0;
                for (let i = 0; i < data.length; i++) sum += Math.abs(data[i]);
                components.push('audio-' + sum.toString());
            } catch (e) {}

            const fingerprint = components.join('|');
            const hash = await sha256(fingerprint);
            return hash.substring(0, 32);

        } catch (e) {
            const fallback = navigator.userAgent + screen.width + screen.height;
            return 'fallback-' + btoa(fallback).substring(0, 24);
        }
    }

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // ═══════════════════════════════════════════════════════════
    // 🔐 توليد كود التنشيط
    // ═══════════════════════════════════════════════════════════
    async function generateActivationCode(deviceId, customPrefix) {
        const prefix = customPrefix || 'MIZAN';
        const deviceShort = deviceId.substring(0, 8).toUpperCase();
        const combined = deviceId + CONFIG.MASTER_CODE;
        const hash = await sha256(combined);
        const codeHash = hash.substring(0, 12).toUpperCase();
        // تنسيق: MIZAN-XXXX-XXXX-XXXX
        return prefix + '-' + 
               deviceShort.substring(0, 4) + '-' + 
               codeHash.substring(0, 4) + '-' + 
               codeHash.substring(4, 8);
    }

    // ═══════════════════════════════════════════════════════════
    // 🔍 التحقق من كود التنشيط
    // ═══════════════════════════════════════════════════════════
    async function validateActivationCode(deviceId, inputCode) {
        if (!inputCode) return false;
        const code = inputCode.trim().toUpperCase();

        // 1. كود المطور الرئيسي (يفتح أي جهاز)
        if (code === CONFIG.MASTER_CODE) {
            return { valid: true, type: 'master' };
        }

        // 2. كود التنشيط الخاص بالجهاز
        const expectedCode = await generateActivationCode(deviceId);
        if (code === expectedCode) {
            return { valid: true, type: 'device' };
        }

        // 3. كود من Firebase (يُنشئه المطور)
        try {
            const ref = firebase.database().ref('mizan_activations/' + code);
            const snapshot = await ref.once('value');
            if (snapshot.exists()) {
                const data = snapshot.val();
                // تحقق من الجهاز أو أنه عام
                if (data.deviceId === deviceId || data.universal === true) {
                    // تحقق من تاريخ الانتهاء
                    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
                        return { valid: false, reason: 'EXPIRED' };
                    }
                    // تحقق من عدد الاستخدامات
                    if (data.maxUses && data.uses >= data.maxUses) {
                        return { valid: false, reason: 'MAX_USES' };
                    }
                    return { valid: true, type: 'firebase', data: data };
                } else {
                    return { valid: false, reason: 'WRONG_DEVICE' };
                }
            }
        } catch (e) {
            console.warn('⚠️ Firebase check failed:', e.message);
        }

        return { valid: false, reason: 'INVALID_CODE' };
    }

    // ═══════════════════════════════════════════════════════════
    // 📅 فحص الفترة التجريبية
    // ═══════════════════════════════════════════════════════════
    async function checkTrial(deviceId) {
        let installDate = localStorage.getItem('mizan_install_date');
        
        if (!installDate) {
            // أول تشغيل
            installDate = new Date().toISOString();
            localStorage.setItem('mizan_install_date', installDate);

            // حفظ في Firebase
            if (window.firebaseReady) {
                try {
                    await firebase.database().ref('mizan_licenses/' + CONFIG.LICENSE_KEY + '/devices/' + deviceId).update({
                        installDate: installDate
                    });
                } catch (e) {}
            }
        }

        const install = new Date(installDate);
        const now = new Date();
        const daysPassed = Math.floor((now - install) / (1000 * 60 * 60 * 24));
        const daysLeft = CONFIG.TRIAL_DAYS - daysPassed;

        return {
            installDate: installDate,
            daysPassed: daysPassed,
            daysLeft: Math.max(0, daysLeft),
            isActive: daysLeft > 0,
            expiresAt: new Date(install.getTime() + CONFIG.TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════════
    // 🔍 فحص شامل للجهاز
    // ═══════════════════════════════════════════════════════════
    async function checkDevice() {
        const deviceId = await generateDeviceId();
        const savedDeviceId = localStorage.getItem(CONFIG.STORAGE_KEY);
        const isActivated = localStorage.getItem('mizan_activated') === 'true';

        // فحص الفترة التجريبية
        const trial = await checkTrial(deviceId);

        // إذا انتهت الفترة التجريبية ولم يتم التنشيط
        if (!trial.isActive && !isActivated) {
            return {
                allowed: false,
                reason: 'TRIAL_EXPIRED',
                deviceId: deviceId,
                trial: trial
            };
        }

        // إذا كان نفس الجهاز
        if (savedDeviceId === deviceId && isActivated) {
            return { allowed: true, deviceId: deviceId, isNew: false, trial: trial };
        }

        // جهاز جديد أو غير مفعّل
        if (!window.firebaseReady) {
            // بدون Firebase - نطلب كود التنشيط
            return {
                allowed: false,
                reason: 'NEED_ACTIVATION',
                deviceId: deviceId,
                trial: trial
            };
        }

        try {
            const ref = firebase.database().ref('mizan_licenses/' + CONFIG.LICENSE_KEY);
            const snapshot = await ref.once('value');
            const data = snapshot.val() || { devices: [], maxDevices: CONFIG.MAX_DEVICES };

            if (!data.devices) data.devices = [];
            if (!data.maxDevices) data.maxDevices = CONFIG.MAX_DEVICES;

            const existingDevice = data.devices.find(d => d.id === deviceId);
            if (existingDevice && existingDevice.activated) {
                existingDevice.lastSeen = new Date().toISOString();
                await ref.update({ devices: data.devices });
                localStorage.setItem(CONFIG.STORAGE_KEY, deviceId);
                localStorage.setItem('mizan_activated', 'true');
                return { allowed: true, deviceId: deviceId, isNew: false, trial: trial };
            }

            // فحص الحد الأقصى
            if (data.devices.length >= data.maxDevices && !isActivated) {
                return {
                    allowed: false,
                    reason: 'MAX_DEVICES',
                    deviceId: deviceId,
                    currentCount: data.devices.length,
                    maxCount: data.maxDevices,
                    trial: trial
                };
            }

            // نحتاج تنشيط
            return {
                allowed: false,
                reason: 'NEED_ACTIVATION',
                deviceId: deviceId,
                trial: trial,
                deviceCount: data.devices.length,
                maxCount: data.maxDevices
            };

        } catch (e) {
            return {
                allowed: false,
                reason: 'NEED_ACTIVATION',
                deviceId: deviceId,
                trial: trial,
                error: e.message
            };
        }
    }

    // ═══════════════════════════════════════════════════════════
    // ✅ تسجيل الجهاز بعد التنشيط
    // ═══════════════════════════════════════════════════════════
    async function registerDevice(deviceId, activationType) {
        const deviceInfo = {
            id: deviceId,
            name: getDeviceName(),
            platform: navigator.platform || 'unknown',
            userAgent: navigator.userAgent.substring(0, 100),
            registeredAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            activated: true,
            activationType: activationType
        };

        localStorage.setItem(CONFIG.STORAGE_KEY, deviceId);
        localStorage.setItem('mizan_activated', 'true');

        if (!window.firebaseReady) return;

        try {
            const ref = firebase.database().ref('mizan_licenses/' + CONFIG.LICENSE_KEY);
            const snapshot = await ref.once('value');
            const data = snapshot.val() || { devices: [], maxDevices: CONFIG.MAX_DEVICES };
            if (!data.devices) data.devices = [];

            // إزالة إذا كان موجوداً
            data.devices = data.devices.filter(d => d.id !== deviceId);
            data.devices.push(deviceInfo);

            await ref.set(data);

            // 📢 إشعار للمطور
            if (CONFIG.NOTIFY_ON_NEW_DEVICE) {
                await notifyDeveloper('جهاز جديد تم تفعيله', {
                    deviceId: deviceId,
                    deviceName: deviceInfo.name,
                    activationType: activationType,
                    time: new Date().toISOString()
                });
            }

        } catch (e) {
            console.warn('⚠️ فشل تسجيل الجهاز في Firebase:', e.message);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 📢 إشعارات المطور
    // ═══════════════════════════════════════════════════════════
    async function notifyDeveloper(title, data) {
        if (!window.firebaseReady) return;
        try {
            const notifRef = firebase.database().ref('mizan_dev_notifications').push();
            await notifRef.set({
                title: title,
                data: data,
                timestamp: new Date().toISOString(),
                read: false
            });
            console.log('📢 تم إرسال إشعار للمطور');
        } catch (e) {
            console.warn('⚠️ فشل إرسال الإشعار:', e.message);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 📱 اسم الجهاز
    // ═══════════════════════════════════════════════════════════
    function getDeviceName() {
        const ua = navigator.userAgent;
        if (/android/i.test(ua)) return 'Android Device';
        if (/iPad|iPhone|iPod/.test(ua)) return 'iOS Device';
        if (/Windows/i.test(ua)) return 'Windows PC';
        if (/Macintosh|Mac OS X/i.test(ua)) return 'Mac';
        if (/Linux/i.test(ua)) return 'Linux PC';
        return 'Unknown Device';
    }

    // ═══════════════════════════════════════════════════════════
    // 🎨 عرض شاشة التنشيط
    // ═══════════════════════════════════════════════════════════
    function showActivationScreen(result) {
        const reason = result.reason;
        const trial = result.trial || { daysLeft: 0 };

        let title, message, icon, extraInfo = '';

        if (reason === 'TRIAL_EXPIRED') {
            icon = '⏰';
            title = 'انتهت الفترة التجريبية';
            message = `انتهت فترتك التجريبية. <br>قم بتفعيل التطبيق للمتابعة.`;
            extraInfo = `
                <div style="background:#0D0D0D;border-radius:12px;padding:14px;margin-bottom:20px;text-align:right;">
                    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #2D2D2D;">
                        <span style="color:#A89070;">تاريخ التثبيت:</span>
                        <strong style="color:#C9A94E;">${new Date(trial.installDate).toLocaleDateString('ar-EG')}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;">
                        <span style="color:#A89070;">الأيام المنقضية:</span>
                        <strong style="color:#E06060;">${trial.daysPassed}</strong>
                    </div>
                </div>
            `;
        } else if (reason === 'MAX_DEVICES') {
            icon = '🚫';
            title = 'تم رفض التفعيل';
            message = 'تم الوصول للحد الأقصى من الأجهزة المسموح بها.';
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
            message = 'هذا الجهاز يحتاج إلى كود تنشيط لتشغيل التطبيق.';
            extraInfo = `
                <div style="background:#0D0D0D;border-radius:12px;padding:14px;margin-bottom:20px;text-align:right;">
                    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #2D2D2D;">
                        <span style="color:#A89070;">الأيام المتبقية:</span>
                        <strong style="color:#2D8F5E;">${trial.daysLeft} يوم</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;">
                        <span style="color:#A89070;">بصمة هذا الجهاز:</span>
                        <strong style="color:#4A8AB5;font-family:monospace;font-size:11px;">${result.deviceId.substring(0, 12)}...</strong>
                    </div>
                </div>
            `;
        }

        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: linear-gradient(135deg, #0D0D0D, #1C1C1C);
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                font-family: 'Tajawal', Arial, sans-serif;
                z-index: 999999;
                overflow-y: auto;
            ">
                <div style="
                    background: #1C1C1C;
                    border: 2px solid #C9A94E;
                    border-radius: 20px;
                    padding: 30px 24px;
                    max-width: 420px;
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 20px 50px rgba(201, 169, 78, 0.3);
                    margin: 20px auto;
                ">
                    <div style="font-size: 64px; margin-bottom: 16px;">${icon}</div>
                    <h1 style="
                        color: #C9A94E;
                        font-size: 22px;
                        margin-bottom: 12px;
                        font-weight: 900;
                    ">${title}</h1>
                    <p style="
                        color: #F5E6C8;
                        font-size: 14px;
                        line-height: 1.8;
                        margin-bottom: 20px;
                    ">${message}</p>
                    
                    ${extraInfo}

                    ${reason !== 'MAX_DEVICES' ? `
                        <div style="margin-bottom: 16px;">
                            <label style="
                                display: block;
                                color: #A89070;
                                font-size: 12px;
                                margin-bottom: 6px;
                                text-align: right;
                                font-weight: 800;
                            ">🔑 أدخل كود التنشيط:</label>
                            <input 
                                type="text" 
                                id="activationCodeInput" 
                                placeholder="MIZAN-XXXX-XXXX-XXXX"
                                style="
                                    width: 100%;
                                    padding: 14px;
                                    border-radius: 10px;
                                    border: 2px solid #3D3D3D;
                                    background: #0D0D0D;
                                    color: #F5E6C8;
                                    font-size: 14px;
                                    font-family: monospace;
                                    text-align: center;
                                    letter-spacing: 2px;
                                    font-weight: 900;
                                    box-sizing: border-box;
                                "
                            />
                            <div id="activationError" style="
                                color: #E06060;
                                font-size: 12px;
                                margin-top: 8px;
                                display: none;
                                font-weight: 800;
                            "></div>
                        </div>
                        <button onclick="window.__tryActivate()" style="
                            width: 100%;
                            padding: 14px;
                            border-radius: 10px;
                            border: none;
                            background: linear-gradient(135deg, #2D8F5E, #1A7A4A);
                            color: #fff;
                            font-size: 14px;
                            font-weight: 900;
                            cursor: pointer;
                            font-family: inherit;
                            margin-bottom: 10px;
                        ">✅ تفعيل التطبيق</button>
                    ` : ''}

                    <button onclick="window.__copyDeviceId('${result.deviceId}')" style="
                        width: 100%;
                        padding: 12px;
                        border-radius: 10px;
                        border: 2px solid #4A8AB5;
                        background: transparent;
                        color: #4A8AB5;
                        font-size: 13px;
                        font-weight: 800;
                        cursor: pointer;
                        font-family: inherit;
                        margin-bottom: 10px;
                    ">📋 نسخ بصمة الجهاز</button>

                    <div style="
                        margin-top: 20px;
                        padding-top: 16px;
                        border-top: 1px dashed #3D3D3D;
                        font-size: 11px;
                        color: #A89070;
                        line-height: 1.8;
                        text-align: right;
                    ">
                        <strong style="color:#C9A94E;display:block;margin-bottom:8px;">📞 تواصل مع المطور:</strong>
                        <div>📱 واتساب: ${CONFIG.DEV_PHONE}</div>
                        <div>📧 إيميل: ${CONFIG.DEV_EMAIL}</div>
                        <div style="margin-top:8px;color:#E6A830;">أرسل بصمة الجهاز للحصول على كود التنشيط</div>
                    </div>
                </div>
            </div>
        `;

        // ربط الأحداث
        window.__tryActivate = async function() {
            const input = document.getElementById('activationCodeInput');
            const errorEl = document.getElementById('activationError');
            const code = input.value.trim();

            if (!code) {
                errorEl.textContent = '⚠️ أدخل كود التنشيط';
                errorEl.style.display = 'block';
                return;
            }

            const validation = await validateActivationCode(result.deviceId, code);

            if (validation.valid) {
                // تسجيل الجهاز
                await registerDevice(result.deviceId, validation.type);
                
                // إشعار نجاح
                alert('✅ تم التفعيل بنجاح!\n\nسيتم إعادة تشغيل التطبيق...');
                window.location.reload();
            } else {
                const msgs = {
                    'INVALID_CODE': '❌ كود غير صحيح',
                    'EXPIRED': '⏰ الكود منتهي الصلاحية',
                    'MAX_USES': '🚫 تم استخدام الكود بالحد الأقصى',
                    'WRONG_DEVICE': '⚠️ الكود لجهاز آخر'
                };
                errorEl.textContent = msgs[validation.reason] || '❌ كود غير صحيح';
                errorEl.style.display = 'block';
                input.value = '';
            }
        };

        window.__copyDeviceId = function(deviceId) {
            navigator.clipboard.writeText(deviceId).then(() => {
                alert('✅ تم نسخ بصمة الجهاز:\n\n' + deviceId);
            }).catch(() => {
                prompt('انسخ بصمة الجهاز:', deviceId);
            });
        };

        // Enter للتفعيل
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
        console.log('🔐 بدء فحص الجهاز...');

        const result = await checkDevice();
        console.log('📋 نتيجة الفحص:', result);

        if (!result.allowed) {
            showActivationScreen(result);
            return false;
        }

        // إظهار رسالة ترحيب
        if (result.trial && result.trial.daysLeft <= 30 && result.trial.daysLeft > 0) {
            setTimeout(() => {
                if (typeof showToast === 'function') {
                    showToast('⏰ متبقي ' + result.trial.daysLeft + ' يوم في الفترة التجريبية', 'warning');
                }
            }, 3000);
        }

        window.__deviceId = result.deviceId;

        // فحص دوري
        setInterval(async () => {
            const check = await checkDevice();
            if (!check.allowed) {
                showActivationScreen(check);
            }
        }, CONFIG.CHECK_INTERVAL);

        return true;
    }

    // ═══════════════════════════════════════════════════════════
    // 🛠️ دوال المطور
    // ═══════════════════════════════════════════════════════════

    // توليد كود لجهاز معين (للمطور)
    window.devGenerateCode = async function(deviceId) {
        if (!deviceId) {
            alert('⚠️ أدخل بصمة الجهاز');
            return null;
        }
        const code = await generateActivationCode(deviceId);
        return code;
    };

    // عرض الأجهزة المسجلة
    window.showRegisteredDevices = async function() {
        if (!window.firebaseReady) {
            alert('⚠️ Firebase غير متصل');
            return;
        }
        try {
            const ref = firebase.database().ref('mizan_licenses/' + CONFIG.LICENSE_KEY);
            const snapshot = await ref.once('value');
            const data = snapshot.val() || { devices: [] };

            let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
                '<h3>💻 الأجهزة المسجلة</h3>' +
                '<div style="background:#0D0D0D;border-radius:10px;padding:14px;max-height:400px;overflow-y:auto;">';

            if (!data.devices || data.devices.length === 0) {
                html += '<div style="text-align:center;padding:30px;color:#5D5D5D;">لا توجد أجهزة مسجلة</div>';
            } else {
                data.devices.forEach((d, i) => {
                    const statusColor = d.activated ? '#2D8F5E' : '#E6A830';
                    const statusText = d.activated ? '✅ مفعّل' : '⏳ غير مفعّل';
                    html += `<div style="
                        background:#1A1A1A;
                        border-radius:10px;
                        padding:12px;
                        margin-bottom:8px;
                        border-right:4px solid ${statusColor};
                    ">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <strong style="color:#C9A94E;">📱 ${d.name || 'جهاز ' + (i+1)}</strong>
                            <span style="color:${statusColor};font-size:11px;font-weight:800;">${statusText}</span>
                        </div>
                        <div style="font-size:11px;color:#A89070;font-family:monospace;word-break:break-all;">
                            ID: ${d.id}
                        </div>
                        <div style="font-size:11px;color:#A89070;margin-top:4px;">
                            📅 ${new Date(d.registeredAt).toLocaleString('ar-EG')}
                        </div>
                        <div style="display:flex;gap:6px;margin-top:8px;">
                            <button onclick="devDeleteDevice('${d.id}')" style="
                                flex:1;
                                background:#E06060;
                                border:none;
                                color:#fff;
                                border-radius:6px;
                                padding:6px;
                                font-size:11px;
                                cursor:pointer;
                                font-family:inherit;
                                font-weight:800;
                            ">🗑️ حذف</button>
                            <button onclick="devToggleActivation('${d.id}', ${!d.activated})" style="
                                flex:1;
                                background:${d.activated ? '#E6A830' : '#2D8F5E'};
                                border:none;
                                color:#fff;
                                border-radius:6px;
                                padding:6px;
                                font-size:11px;
                                cursor:pointer;
                                font-family:inherit;
                                font-weight:800;
                            ">${d.activated ? '⏸️ تعطيل' : '▶️ تفعيل'}</button>
                        </div>
                    </div>`;
                });
            }
            html += '</div>';
            html += `<div style="margin-top:12px;padding:10px;background:#0D0D0D;border-radius:8px;font-size:12px;text-align:center;">
                <span style="color:#A89070;">الحد الأقصى:</span>
                <strong style="color:#C9A94E;">${data.maxDevices || CONFIG.MAX_DEVICES}</strong>
                <span style="color:#A89070;"> | المسجل:</span>
                <strong style="color:#2D8F5E;">${(data.devices || []).length}</strong>
            </div>`;

            if (typeof openModal === 'function') openModal(html);
        } catch (e) {
            alert('❌ خطأ: ' + e.message);
        }
    };

    window.devDeleteDevice = async function(deviceId) {
        if (!confirm('⚠️ حذف هذا الجهاز؟')) return;
        try {
            const ref = firebase.database().ref('mizan_licenses/' + CONFIG.LICENSE_KEY);
            const snapshot = await ref.once('value');
            const data = snapshot.val() || { devices: [] };
            data.devices = data.devices.filter(d => d.id !== deviceId);
            await ref.set(data);
            alert('✅ تم حذف الجهاز');
            if (typeof closeModal === 'function') closeModal();
            setTimeout(window.showRegisteredDevices, 300);
        } catch (e) {
            alert('❌ خطأ: ' + e.message);
        }
    };

    window.devToggleActivation = async function(deviceId, activate) {
        try {
            const ref = firebase.database().ref('mizan_licenses/' + CONFIG.LICENSE_KEY);
            const snapshot = await ref.once('value');
            const data = snapshot.val() || { devices: [] };
            const device = data.devices.find(d => d.id === deviceId);
            if (device) {
                device.activated = activate;
                await ref.set(data);
                alert(activate ? '✅ تم التفعيل' : '⏸️ تم التعطيل');
                if (typeof closeModal === 'function') closeModal();
                setTimeout(window.showRegisteredDevices, 300);
            }
        } catch (e) {
            alert('❌ خطأ: ' + e.message);
        }
    };

    // عرض إشعارات المطور
    window.devShowNotifications = async function() {
        if (!window.firebaseReady) {
            alert('⚠️ Firebase غير متصل');
            return;
        }
        try {
            const ref = firebase.database().ref('mizan_dev_notifications').orderByChild('timestamp').limitToLast(50);
            const snapshot = await ref.once('value');
            const data = snapshot.val() || {};

            let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
                '<h3>📢 إشعارات المطور</h3>' +
                '<div style="background:#0D0D0D;border-radius:10px;padding:14px;max-height:400px;overflow-y:auto;">';

            const notifications = Object.values(data).sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );

            if (notifications.length === 0) {
                html += '<div style="text-align:center;padding:30px;color:#5D5D5D;">لا توجد إشعارات</div>';
            } else {
                notifications.forEach((n) => {
                    html += `<div style="
                        background:#1A1A1A;
                        border-radius:10px;
                        padding:12px;
                        margin-bottom:8px;
                        border-right:4px solid ${n.read ? '#5D5D5D' : '#E6A830'};
                    ">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <strong style="color:#E6A830;font-size:13px;">${n.title}</strong>
                            ${!n.read ? '<span style="color:#E06060;font-size:10px;">● جديد</span>' : ''}
                        </div>
                        <div style="font-size:11px;color:#A89070;line-height:1.6;">
                            ${JSON.stringify(n.data, null, 2).substring(0, 200)}
                        </div>
                        <div style="font-size:10px;color:#5D5D5D;margin-top:6px;">
                            🕐 ${new Date(n.timestamp).toLocaleString('ar-EG')}
                        </div>
                    </div>`;
                });
            }
            html += '</div>';
            if (typeof openModal === 'function') openModal(html);

            // تحديد الإشعارات كمقروءة
            const unreadIds = Object.keys(data).filter(k => !data[k].read);
            for (const id of unreadIds) {
                await firebase.database().ref('mizan_dev_notifications/' + id + '/read').set(true);
            }
        } catch (e) {
            alert('❌ خطأ: ' + e.message);
        }
    };

    // إرسال إشعار يدوي من المستخدم
    window.devSendMessage = function() {
        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>📩 إرسال رسالة للمطور</h3>' +
            '<div class="form-group"><label>الموضوع</label><input type="text" id="msgSubject" placeholder="مثال: مشكلة في التطبيق" /></div>' +
            '<div class="form-group"><label>الرسالة</label><textarea id="msgBody" placeholder="اكتب رسالتك..." style="width:100%;min-height:100px;background:#0D0D0D;color:#F5E6C8;border:2px solid #3D3D3D;border-radius:8px;padding:10px;font-family:inherit;resize:vertical;box-sizing:border-box;"></textarea></div>' +
            '<button class="btn btn-success btn-block" onclick="window.__sendDevMsg()"><i class="fas fa-paper-plane"></i> إرسال</button>';
        if (typeof openModal === 'function') openModal(html);

        window.__sendDevMsg = async function() {
            const subject = document.getElementById('msgSubject').value.trim();
            const body = document.getElementById('msgBody').value.trim();
            if (!subject || !body) {
                alert('⚠️ املأ الحقول');
                return;
            }
            await notifyDeveloper('📩 رسالة من مستخدم', {
                subject: subject,
                message: body,
                deviceId: window.__deviceId || 'unknown',
                userName: window.currentUser ? window.currentUser.name : 'unknown'
            });
            alert('✅ تم إرسال الرسالة');
            if (typeof closeModal === 'function') closeModal();
        };
    };

    // تغيير الحد الأقصى
    window.devSetMaxDevices = async function() {
        const code = prompt('أدخل كود المطور:');
        if (code !== 'ADMIN-MIZAN-2025') {
            alert('❌ كود خاطئ');
            return;
        }
        const newMax = prompt('أدخل الحد الأقصى الجديد:', CONFIG.MAX_DEVICES);
        if (!newMax || isNaN(newMax)) return;
        try {
            await firebase.database().ref('mizan_licenses/' + CONFIG.LICENSE_KEY + '/maxDevices').set(parseInt(newMax));
            alert('✅ تم تغيير الحد الأقصى إلى ' + newMax);
        } catch (e) {
            alert('❌ خطأ: ' + e.message);
        }
    };

    // فحص عدد الإشعارات غير المقروءة
    window.devUnreadCount = async function() {
        if (!window.firebaseReady) return 0;
        try {
            const ref = firebase.database().ref('mizan_dev_notifications').orderByChild('read').equalTo(false);
            const snapshot = await ref.once('value');
            return snapshot.numChildren();
        } catch (e) {
            return 0;
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 🚀 بدء التشغيل
    // ═══════════════════════════════════════════════════════════
    window.initDeviceLock = initDeviceLock;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initDeviceLock, 800);
        });
    } else {
        setTimeout(initDeviceLock, 800);
    }

    console.log('✅ device-lock.js v2.0 - جاهز');
    console.log('🔢 الحد الأقصى للأجهزة:', CONFIG.MAX_DEVICES);
    console.log('📅 الفترة التجريبية:', CONFIG.TRIAL_DAYS, 'يوم');
})();
