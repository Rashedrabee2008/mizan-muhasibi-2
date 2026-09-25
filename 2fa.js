// ============================================================
// 2fa.js - التحقق الثنائي (Two-Factor Authentication)
// ============================================================

(function() {
    'use strict';

    console.log('🔐 تحميل 2fa.js');

    const TWOFA_KEY = 'mizan_2fa';
    const OTP_LENGTH = 6;
    const OTP_VALIDITY = 5 * 60 * 1000; // 5 دقائق

    // ═══════════════════════════════════════════════════════════
    // 🔢 توليد رمز OTP
    // ═══════════════════════════════════════════════════════════
    window.generateOTP = function() {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const otp = String(array[0] % 1000000).padStart(OTP_LENGTH, '0');
        return otp;
    };

    // ═══════════════════════════════════════════════════════════
    // 📱 إرسال OTP عبر واتساب (بدائي - يفتح واتساب)
    // ═══════════════════════════════════════════════════════════
    window.sendOTPWhatsApp = function(phone, otp) {
        const message = encodeURIComponent(
            `🔐 رمز التحقق من تطبيق الميزان:\n\n` +
            `${otp}\n\n` +
            `صالح لمدة 5 دقائق فقط.\n` +
            `لا تشارك هذا الرمز مع أي شخص.`
        );

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const url = `https://wa.me/${cleanPhone}?text=${message}`;

        window.open(url, '_blank');
        console.log('📱 تم فتح واتساب للتحقق');
    };

    // ═══════════════════════════════════════════════════════════
    // 📧 إرسال OTP (محاكاة)
    // ═══════════════════════════════════════════════════════════
    window.sendOTP = function(user) {
        const otp = generateOTP();
        const expiresAt = Date.now() + OTP_VALIDITY;

        // حفظ OTP مؤقتاً
        const otpData = {
            code: otp,
            userId: user.id,
            userName: user.name,
            phone: user.phone || '',
            createdAt: Date.now(),
            expiresAt: expiresAt,
            attempts: 0,
            maxAttempts: 3
        };

        sessionStorage.setItem(TWOFA_KEY, JSON.stringify(otpData));

        // عرض في Toast
        if (typeof showToast === 'function') {
            showToast(`📱 الرمز: ${otp} (صالح 5 دقائق)`, 'info');
        }

        // فتح واتساب إذا كان هناك رقم
        if (user.phone) {
            setTimeout(() => {
                if (confirm(`📱 إرسال الرمز إلى ${user.phone} عبر واتساب؟\n\nالرمز: ${otp}`)) {
                    sendOTPWhatsApp(user.phone, otp);
                }
            }, 500);
        }

        console.log('📱 OTP:', otp);
        return otp;
    };

    // ═══════════════════════════════════════════════════════════
    // ✅ التحقق من OTP
    // ═══════════════════════════════════════════════════════════
    window.verifyOTP = function(inputCode) {
        try {
            const data = sessionStorage.getItem(TWOFA_KEY);
            if (!data) return { valid: false, reason: 'NO_OTP' };

            const otpData = JSON.parse(data);

            // التحقق من الانتهاء
            if (otpData.expiresAt < Date.now()) {
                sessionStorage.removeItem(TWOFA_KEY);
                return { valid: false, reason: 'EXPIRED' };
            }

            // التحقق من عدد المحاولات
            if (otpData.attempts >= otpData.maxAttempts) {
                sessionStorage.removeItem(TWOFA_KEY);
                return { valid: false, reason: 'MAX_ATTEMPTS' };
            }

            otpData.attempts++;
            sessionStorage.setItem(TWOFA_KEY, JSON.stringify(otpData));

            // التحقق من الرمز
            if (inputCode === otpData.code) {
                sessionStorage.removeItem(TWOFA_KEY);
                return { valid: true };
            }

            return { valid: false, reason: 'WRONG_CODE' };

        } catch (e) {
            console.error('❌ خطأ تحقق OTP:', e);
            return { valid: false, reason: 'ERROR' };
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 🎨 شاشة التحقق
    // ═══════════════════════════════════════════════════════════
    window.showOTPScreen = function(user) {
        const otp = sendOTP(user);

        const html = `
            <div style="
                position: fixed; top:0; left:0; width:100%; height:100%;
                background: linear-gradient(135deg, #0D0D0D, #1C1C1C);
                display: flex; align-items: center; justify-content: center;
                z-index: 99999; padding: 20px;
                font-family: 'Tajawal', sans-serif;
            ">
                <div style="
                    background: #1C1C1C;
                    border: 2px solid #C9A94E;
                    border-radius: 20px;
                    padding: 30px 24px;
                    max-width: 400px;
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 20px 50px rgba(201,169,78,0.3);
                ">
                    <div style="font-size: 64px; margin-bottom: 16px;">🔐</div>
                    <h1 style="color: #C9A94E; font-size: 22px; margin-bottom: 12px; font-weight: 900;">
                        التحقق الثنائي
                    </h1>
                    <p style="color: #F5E6C8; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
                        تم إرسال رمز التحقق إلى<br>
                        <strong style="color: #C9A94E;">${user.phone || 'هاتفك'}</strong>
                    </p>
                    
                    <div style="
                        background: #0D0D0D;
                        border: 2px dashed #C9A94E;
                        border-radius: 12px;
                        padding: 16px;
                        margin-bottom: 20px;
                    ">
                        <div style="color: #A89070; font-size: 11px; margin-bottom: 6px;">
                            رمز التحقق:
                        </div>
                        <div style="
                            color: #C9A94E;
                            font-size: 32px;
                            font-weight: 900;
                            font-family: 'Courier New', monospace;
                            letter-spacing: 8px;
                        ">${otp}</div>
                        <div style="color: #5D5D5D; font-size: 10px; margin-top: 8px;">
                            (صالح لمدة 5 دقائق)
                        </div>
                    </div>
                    
                    <input type="text" id="otpInput" 
                        placeholder="أدخل الرمز"
                        maxlength="6"
                        inputmode="numeric"
                        style="
                            width: 100%;
                            padding: 14px;
                            border-radius: 10px;
                            border: 2px solid #3D3D3D;
                            background: #0D0D0D;
                            color: #F5E6C8;
                            font-size: 24px;
                            text-align: center;
                            font-family: 'Courier New', monospace;
                            font-weight: 900;
                            letter-spacing: 8px;
                            box-sizing: border-box;
                            margin-bottom: 12px;
                            outline: none;
                        " />
                    
                    <div id="otpError" style="
                        color: #E06060;
                        font-size: 12px;
                        margin-bottom: 12px;
                        min-height: 18px;
                        font-weight: 800;
                    "></div>
                    
                    <button onclick="window.__verifyOTP()" style="
                        width: 100%;
                        padding: 14px;
                        border-radius: 10px;
                        border: none;
                        background: linear-gradient(135deg, #2D8F5E, #1A7A4A);
                        color: #fff;
                        font-size: 15px;
                        font-weight: 900;
                        cursor: pointer;
                        font-family: inherit;
                        margin-bottom: 10px;
                    ">✅ تحقق</button>
                    
                    <button onclick="window.__resendOTP()" style="
                        width: 100%;
                        padding: 10px;
                        border-radius: 10px;
                        border: 1.5px solid #C9A94E;
                        background: transparent;
                        color: #C9A94E;
                        font-size: 13px;
                        font-weight: 800;
                        cursor: pointer;
                        font-family: inherit;
                    ">🔄 إعادة إرسال</button>
                </div>
            </div>
        `;

        // إضافة شاشة OTP
        const otpContainer = document.createElement('div');
        otpContainer.id = 'otpContainer';
        otpContainer.innerHTML = html;
        document.body.appendChild(otpContainer);

        // دالة التحقق
        window.__verifyOTP = function() {
            const input = document.getElementById('otpInput');
            const error = document.getElementById('otpError');
            const code = input.value.trim();

            if (code.length !== 6) {
                error.textContent = '⚠️ أدخل 6 أرقام';
                return;
            }

            const result = verifyOTP(code);

            if (result.valid) {
                document.getElementById('otpContainer').remove();
                console.log('✅ تم التحقق الثنائي');
                if (typeof showToast === 'function') {
                    showToast('✅ تم التحقق بنجاح', 'success');
                }
                // متابعة تسجيل الدخول
                if (window.__continueLogin) {
                    window.__continueLogin();
                }
            } else {
                const messages = {
                    'WRONG_CODE': '❌ رمز خاطئ',
                    'EXPIRED': '⏰ الرمز منتهي',
                    'MAX_ATTEMPTS': '🚫 تجاوزت عدد المحاولات',
                    'NO_OTP': '⚠️ لا يوجد رمز',
                    'ERROR': '❌ خطأ'
                };
                error.textContent = messages[result.reason] || '❌ خطأ';
                input.value = '';
            }
        };

        window.__resendOTP = function() {
            document.getElementById('otpContainer').remove();
            showOTPScreen(user);
        };

        setTimeout(() => {
            const input = document.getElementById('otpInput');
            if (input) {
                input.focus();
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') window.__verifyOTP();
                });
            }
        }, 100);
    };

    // ═══════════════════════════════════════════════════════════
    // 🎛️ تفعيل 2FA للمستخدم
    // ═══════════════════════════════════════════════════════════
    window.enable2FA = async function(userId) {
        try {
            const user = window.users.find(u => u.id == userId);
            if (!user) return false;

            const phone = prompt('📱 أدخل رقم واتساب (مثال: 201234567890):');
            if (!phone) return false;

            user.phone = phone.replace(/[^0-9]/g, '');
            user.twoFAEnabled = true;

            window.setData('users', window.users);

            // رفع إلى Firebase
            if (window.firebaseReady) {
                await firebase.database().ref('mizan/users').set(window.users);
            }

            if (typeof showToast === 'function') {
                showToast('✅ تم تفعيل 2FA', 'success');
            }

            console.log('✅ تم تفعيل 2FA للمستخدم:', user.name);
            return true;

        } catch (e) {
            console.error('❌ خطأ:', e);
            return false;
        }
    };

    window.disable2FA = async function(userId) {
        try {
            const user = window.users.find(u => u.id == userId);
            if (!user) return false;

            user.twoFAEnabled = false;
            window.setData('users', window.users);

            if (window.firebaseReady) {
                await firebase.database().ref('mizan/users').set(window.users);
            }

            if (typeof showToast === 'function') {
                showToast('✅ تم إلغاء 2FA', 'info');
            }

            return true;

        } catch (e) {
            return false;
        }
    };

    console.log('✅ 2fa.js جاهز');
})();
