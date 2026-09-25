// ============================================================
// dev-panel.js - لوحة تحكم المطور الكاملة
// ============================================================

(function() {
    'use strict';

    const DEV_ACCESS_CODE = 'MIZAN-DEV-2025'; // 🔑 كود الوصول للمطور

    // ═══════════════════════════════════════════════════════════
    // 🎨 فتح لوحة تحكم المطور
    // ═══════════════════════════════════════════════════════════
    window.openDevPanel = function() {
        // فحص كود الوصول
        const code = prompt('🔐 أدخل كود المطور:');
        if (code !== DEV_ACCESS_CODE) {
            if (code !== null) alert('❌ كود خاطئ');
            return;
        }

        showDevPanel();
    };

    // ═══════════════════════════════════════════════════════════
    // 🖥️ عرض اللوحة
    // ═══════════════════════════════════════════════════════════
    async function showDevPanel() {
        const deviceId = window.__deviceId || 'unknown';

        let html = `
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <h3 style="color:#E06060;">🛠️ لوحة تحكم المطور</h3>
            
            <div style="background:#0D0D0D;border-radius:10px;padding:14px;margin-bottom:12px;border-right:4px solid #C9A94E;">
                <div style="font-size:11px;color:#A89070;margin-bottom:4px;">بصمة هذا الجهاز:</div>
                <div style="font-size:12px;color:#4A8AB5;font-family:monospace;word-break:break-all;">${deviceId}</div>
                <button onclick="copyToClipboard('${deviceId}')" style="
                    margin-top:8px;
                    background:#4A8AB5;
                    border:none;
                    color:#fff;
                    padding:6px 12px;
                    border-radius:6px;
                    font-size:11px;
                    cursor:pointer;
                    font-family:inherit;
                    font-weight:800;
                ">📋 نسخ البصمة</button>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                <button onclick="devTabDevices()" class="dev-tab-btn" data-tab="devices" style="
                    background:#2D8F5E;border:none;color:#fff;padding:12px;border-radius:8px;
                    font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;
                ">💻 الأجهزة</button>
                <button onclick="devTabCodes()" class="dev-tab-btn" data-tab="codes" style="
                    background:#0D0D0D;border:2px solid #3D3D3D;color:#F5E6C8;padding:12px;border-radius:8px;
                    font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;
                ">🔑 الأكواد</button>
                <button onclick="devTabNotifications()" class="dev-tab-btn" data-tab="notifications" style="
                    background:#0D0D0D;border:2px solid #3D3D3D;color:#F5E6C8;padding:12px;border-radius:8px;
                    font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;
                ">📢 الإشعارات</button>
                <button onclick="devTabStats()" class="dev-tab-btn" data-tab="stats" style="
                    background:#0D0D0D;border:2px solid #3D3D3D;color:#F5E6C8;padding:12px;border-radius:8px;
                    font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;
                ">📊 الإحصائيات</button>
            </div>

            <div id="devPanelContent" style="background:#0D0D0D;border-radius:10px;padding:14px;min-height:300px;">
                <div style="text-align:center;padding:30px;color:#5D5D5D;">جاري التحميل...</div>
            </div>
        `;

        if (typeof openModal === 'function') openModal(html);
        setTimeout(() => devTabDevices(), 100);
    }

    // ═══════════════════════════════════════════════════════════
    // 📋 التبويبات
    // ═══════════════════════════════════════════════════════════
    window.devTabDevices = async function() {
        setActiveTab('devices');
        const content = document.getElementById('devPanelContent');
        if (!content) return;

        if (!window.firebaseReady) {
            content.innerHTML = '<div style="text-align:center;padding:30px;color:#E06060;">⚠️ Firebase غير متصل</div>';
            return;
        }

        content.innerHTML = '<div style="text-align:center;padding:30px;color:#A89070;">⏳ جاري التحميل...</div>';

        try {
            const ref = firebase.database().ref('mizan_licenses/mizan_license');
            const snapshot = await ref.once('value');
            const data = snapshot.val() || { devices: [], maxDevices: 2 };
            const devices = data.devices || [];

            let html = `
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding:10px;background:#1A1A1A;border-radius:8px;">
                    <span style="color:#A89070;font-size:12px;">📱 الأجهزة المسجلة</span>
                    <strong style="color:#C9A94E;font-size:14px;">${devices.length} / ${data.maxDevices || 2}</strong>
                </div>
            `;

            if (devices.length === 0) {
                html += '<div style="text-align:center;padding:30px;color:#5D5D5D;">لا توجد أجهزة</div>';
            } else {
                devices.forEach((d, i) => {
                    const statusColor = d.activated ? '#2D8F5E' : '#E6A830';
                    const statusText = d.activated ? '✅ مفعّل' : '⏳ غير مفعّل';
                    const installDate = d.installDate ? new Date(d.installDate).toLocaleDateString('ar-EG') : 'غير معروف';
                    
                    html += `
                        <div style="
                            background:#1A1A1A;border-radius:10px;padding:12px;
                            margin-bottom:8px;border-right:4px solid ${statusColor};
                        ">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                                <strong style="color:#C9A94E;font-size:13px;">📱 ${d.name || 'جهاز ' + (i+1)}</strong>
                                <span style="color:${statusColor};font-size:10px;font-weight:800;">${statusText}</span>
                            </div>
                            <div style="font-size:10px;color:#A89070;font-family:monospace;word-break:break-all;margin-bottom:4px;">
                                ${d.id}
                            </div>
                            <div style="font-size:10px;color:#5D5D5D;">
                                📅 التسجيل: ${new Date(d.registeredAt).toLocaleDateString('ar-EG')}
                            </div>
                            <div style="font-size:10px;color:#5D5D5D;">
                                🕐 آخر ظهور: ${new Date(d.lastSeen).toLocaleString('ar-EG')}
                            </div>
                            <div style="display:flex;gap:6px;margin-top:8px;">
                                <button onclick="devGenCodeForDevice('${d.id}')" style="
                                    flex:1;background:#C9A94E;border:none;color:#0D0D0D;
                                    border-radius:6px;padding:6px;font-size:11px;cursor:pointer;
                                    font-family:inherit;font-weight:900;
                                ">🔑 كود</button>
                                <button onclick="devToggleActivation('${d.id}', ${!d.activated})" style="
                                    flex:1;background:${d.activated ? '#E6A830' : '#2D8F5E'};border:none;color:#fff;
                                    border-radius:6px;padding:6px;font-size:11px;cursor:pointer;
                                    font-family:inherit;font-weight:900;
                                ">${d.activated ? '⏸️' : '▶️'}</button>
                                <button onclick="devDeleteDevice('${d.id}')" style="
                                    flex:1;background:#E06060;border:none;color:#fff;
                                    border-radius:6px;padding:6px;font-size:11px;cursor:pointer;
                                    font-family:inherit;font-weight:900;
                                ">🗑️</button>
                            </div>
                        </div>
                    `;
                });
            }

            content.innerHTML = html;
        } catch (e) {
            content.innerHTML = `<div style="text-align:center;padding:30px;color:#E06060;">❌ ${e.message}</div>`;
        }
    };

    window.devTabCodes = function() {
        setActiveTab('codes');
        const content = document.getElementById('devPanelContent');
        if (!content) return;

        content.innerHTML = `
            <h4 style="color:#C9A94E;font-size:13px;margin-bottom:12px;">🔑 توليد كود تنشيط</h4>
            
            <div style="margin-bottom:12px;">
                <label style="color:#A89070;font-size:11px;display:block;margin-bottom:6px;font-weight:800;">بصمة الجهاز:</label>
                <input type="text" id="codeGenDeviceId" placeholder="أدخل بصمة الجهاز..." style="
                    width:100%;padding:12px;border-radius:8px;border:2px solid #3D3D3D;
                    background:#0D0D0D;color:#F5E6C8;font-family:monospace;font-size:12px;
                    box-sizing:border-box;
                " />
                <button onclick="document.getElementById('codeGenDeviceId').value = window.__deviceId || ''" style="
                    margin-top:6px;background:transparent;border:1px solid #4A8AB5;color:#4A8AB5;
                    padding:4px 10px;border-radius:6px;font-size:10px;cursor:pointer;font-family:inherit;
                ">📱 استخدم بصمة هذا الجهاز</button>
            </div>

            <button onclick="generateAndShowCode()" style="
                width:100%;padding:12px;border-radius:8px;border:none;
                background:linear-gradient(135deg, #2D8F5E, #1A7A4A);color:#fff;
                font-size:13px;font-weight:900;cursor:pointer;font-family:inherit;
                margin-bottom:12px;
            ">🎯 توليد الكود</button>

            <div id="generatedCodeBox"></div>

            <hr style="border:none;border-top:1px dashed #2D2D2D;margin:16px 0;" />

            <h4 style="color:#C9A94E;font-size:13px;margin-bottom:12px;">🎁 أكواد عامة (Universal)</h4>
            <div style="font-size:11px;color:#A89070;margin-bottom:10px;line-height:1.6;">
                أكواد تعمل على أي جهاز. مفيدة للتوزيع.
            </div>
            <button onclick="createUniversalCode()" style="
                width:100%;padding:12px;border-radius:8px;border:none;
                background:linear-gradient(135deg, #C9A94E, #B8953A);color:#0D0D0D;
                font-size:13px;font-weight:900;cursor:pointer;font-family:inherit;
            ">➕ إنشاء كود عام</button>
        `;
    };

    window.devTabNotifications = async function() {
        setActiveTab('notifications');
        const content = document.getElementById('devPanelContent');
        if (!content) return;

        if (!window.firebaseReady) {
            content.innerHTML = '<div style="text-align:center;padding:30px;color:#E06060;">⚠️ Firebase غير متصل</div>';
            return;
        }

        content.innerHTML = '<div style="text-align:center;padding:30px;color:#A89070;">⏳ جاري التحميل...</div>';

        try {
            const ref = firebase.database().ref('mizan_dev_notifications').limitToLast(50);
            const snapshot = await ref.once('value');
            const data = snapshot.val() || {};
            const notifications = Object.values(data).sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );

            let html = `
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding:10px;background:#1A1A1A;border-radius:8px;">
                    <span style="color:#A89070;font-size:12px;">📢 الإشعارات</span>
                    <strong style="color:#C9A94E;font-size:14px;">${notifications.length}</strong>
                </div>
            `;

            if (notifications.length === 0) {
                html += '<div style="text-align:center;padding:30px;color:#5D5D5D;">لا توجد إشعارات</div>';
            } else {
                notifications.forEach((n) => {
                    html += `
                        <div style="
                            background:#1A1A1A;border-radius:10px;padding:12px;
                            margin-bottom:8px;border-right:4px solid ${n.read ? '#5D5D5D' : '#E6A830'};
                        ">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                                <strong style="color:#E6A830;font-size:12px;">${n.title}</strong>
                                ${!n.read ? '<span style="color:#E06060;font-size:9px;">● جديد</span>' : ''}
                            </div>
                            <div style="font-size:10px;color:#A89070;background:#0D0D0D;padding:8px;border-radius:6px;font-family:monospace;overflow-x:auto;">
                                ${JSON.stringify(n.data).substring(0, 150)}...
                            </div>
                            <div style="font-size:9px;color:#5D5D5D;margin-top:6px;">
                                🕐 ${new Date(n.timestamp).toLocaleString('ar-EG')}
                            </div>
                        </div>
                    `;
                });
            }

            content.innerHTML = html;
        } catch (e) {
            content.innerHTML = `<div style="text-align:center;padding:30px;color:#E06060;">❌ ${e.message}</div>`;
        }
    };

    window.devTabStats = async function() {
        setActiveTab('stats');
        const content = document.getElementById('devPanelContent');
        if (!content) return;

        content.innerHTML = '<div style="text-align:center;padding:30px;color:#A89070;">⏳ جاري التحميل...</div>';

        try {
            let stats = {
                totalDevices: 0,
                activeDevices: 0,
                totalNotifications: 0,
                unreadNotifications: 0,
                maxDevices: 2
            };

            if (window.firebaseReady) {
                const devicesRef = firebase.database().ref('mizan_licenses/mizan_license');
                const devicesSnap = await devicesRef.once('value');
                const devicesData = devicesSnap.val() || {};
                const devices = devicesData.devices || [];
                stats.totalDevices = devices.length;
                stats.activeDevices = devices.filter(d => d.activated).length;
                stats.maxDevices = devicesData.maxDevices || 2;

                const notifRef = firebase.database().ref('mizan_dev_notifications');
                const notifSnap = await notifRef.once('value');
                const notifData = notifSnap.val() || {};
                stats.totalNotifications = Object.keys(notifData).length;
                stats.unreadNotifications = Object.values(notifData).filter(n => !n.read).length;
            }

            content.innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div style="background:#1A1A1A;padding:14px;border-radius:10px;border-right:4px solid #C9A94E;text-align:center;">
                        <div style="font-size:24px;font-weight:900;color:#C9A94E;">${stats.totalDevices}</div>
                        <div style="font-size:11px;color:#A89070;">إجمالي الأجهزة</div>
                    </div>
                    <div style="background:#1A1A1A;padding:14px;border-radius:10px;border-right:4px solid #2D8F5E;text-align:center;">
                        <div style="font-size:24px;font-weight:900;color:#2D8F5E;">${stats.activeDevices}</div>
                        <div style="font-size:11px;color:#A89070;">أجهزة مفعّلة</div>
                    </div>
                    <div style="background:#1A1A1A;padding:14px;border-radius:10px;border-right:4px solid #E6A830;text-align:center;">
                        <div style="font-size:24px;font-weight:900;color:#E6A830;">${stats.maxDevices}</div>
                        <div style="font-size:11px;color:#A89070;">الحد الأقصى</div>
                    </div>
                    <div style="background:#1A1A1A;padding:14px;border-radius:10px;border-right:4px solid #E06060;text-align:center;">
                        <div style="font-size:24px;font-weight:900;color:#E06060;">${stats.unreadNotifications}</div>
                        <div style="font-size:11px;color:#A89070;">إشعارات جديدة</div>
                    </div>
                </div>

                <div style="margin-top:14px;padding:12px;background:#1A1A1A;border-radius:10px;">
                    <h4 style="color:#C9A94E;font-size:12px;margin-bottom:8px;">⚙️ إعدادات سريعة</h4>
                    <button onclick="devSetMaxDevices()" style="
                        width:100%;padding:10px;border-radius:8px;border:none;
                        background:#4A8AB5;color:#fff;font-size:12px;font-weight:800;
                        cursor:pointer;font-family:inherit;margin-bottom:6px;
                    ">🔢 تغيير الحد الأقصى للأجهزة</button>
                    <button onclick="devShowAllNotifications()" style="
                        width:100%;padding:10px;border-radius:8px;border:none;
                        background:#E6A830;color:#0D0D0D;font-size:12px;font-weight:800;
                        cursor:pointer;font-family:inherit;margin-bottom:6px;
                    ">📢 عرض كل الإشعارات</button>
                    <button onclick="devClearAllNotifications()" style="
                        width:100%;padding:10px;border-radius:8px;border:none;
                        background:#E06060;color:#fff;font-size:12px;font-weight:800;
                        cursor:pointer;font-family:inherit;
                    ">🗑️ حذف كل الإشعارات</button>
                </div>
            `;
        } catch (e) {
            content.innerHTML = `<div style="text-align:center;padding:30px;color:#E06060;">❌ ${e.message}</div>`;
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 🔧 الدوال المساعدة
    // ═══════════════════════════════════════════════════════════
    function setActiveTab(tabName) {
        document.querySelectorAll('.dev-tab-btn').forEach(btn => {
            const isActive = btn.dataset.tab === tabName;
            btn.style.background = isActive ? '#2D8F5E' : '#0D0D0D';
            btn.style.border = isActive ? 'none' : '2px solid #3D3D3D';
            btn.style.color = isActive ? '#fff' : '#F5E6C8';
        });
    }

    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('✅ تم النسخ:\n\n' + text);
        }).catch(() => {
            prompt('انسخ:', text);
        });
    };

    window.generateAndShowCode = async function() {
        const deviceId = document.getElementById('codeGenDeviceId').value.trim();
        if (!deviceId) {
            alert('⚠️ أدخل بصمة الجهاز');
            return;
        }

        const code = await window.devGenerateCode(deviceId);
        const box = document.getElementById('generatedCodeBox');
        if (box) {
            box.innerHTML = `
                <div style="background:#0D0D0D;border:2px solid #2D8F5E;border-radius:10px;padding:14px;margin-top:12px;">
                    <div style="color:#2D8F5E;font-size:11px;font-weight:800;margin-bottom:6px;">✅ الكود المُولّد:</div>
                    <div style="background:#000;padding:12px;border-radius:8px;font-family:monospace;font-size:16px;color:#0F0;text-align:center;letter-spacing:2px;font-weight:900;word-break:break-all;">
                        ${code}
                    </div>
                    <button onclick="copyToClipboard('${code}')" style="
                        width:100%;margin-top:8px;padding:10px;border-radius:8px;border:none;
                        background:#4A8AB5;color:#fff;font-size:12px;font-weight:800;
                        cursor:pointer;font-family:inherit;
                    ">📋 نسخ الكود</button>
                </div>
            `;
        }
    };

    window.devGenCodeForDevice = async function(deviceId) {
        const code = await window.devGenerateCode(deviceId);
        const html = `
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <h3>🔑 كود تنشيط الجهاز</h3>
            <div style="background:#0D0D0D;border-radius:10px;padding:14px;margin-bottom:12px;">
                <div style="font-size:11px;color:#A89070;margin-bottom:6px;">بصمة الجهاز:</div>
                <div style="font-size:11px;color:#4A8AB5;font-family:monospace;word-break:break-all;">${deviceId}</div>
            </div>
            <div style="background:#000;padding:20px;border-radius:10px;border:2px solid #2D8F5E;text-align:center;margin-bottom:12px;">
                <div style="color:#2D8F5E;font-size:11px;font-weight:800;margin-bottom:8px;">كود التنشيط:</div>
                <div style="font-family:monospace;font-size:20px;color:#0F0;letter-spacing:3px;font-weight:900;word-break:break-all;">${code}</div>
            </div>
            <button class="btn btn-success btn-block" onclick="copyToClipboard('${code}')">
                <i class="fas fa-copy"></i> نسخ الكود
            </button>
        `;
        if (typeof openModal === 'function') openModal(html);
    };

    window.createUniversalCode = async function() {
        if (!window.firebaseReady) {
            alert('⚠️ Firebase غير متصل');
            return;
        }

        const customCode = prompt('أدخل كود مخصص (أو اتركه فارغاً للتوليد التلقائي):');
        const code = customCode && customCode.trim() ? customCode.trim().toUpperCase() : 'UNI-' + Math.random().toString(36).substring(2, 10).toUpperCase();

        const maxUses = prompt('الحد الأقصى للاستخدامات (اتركه فارغاً لاستخدامات غير محدودة):', '');
        const expiresAt = prompt('تاريخ الانتهاء (YYYY-MM-DD) أو اتركه فارغاً:', '');

        try {
            await firebase.database().ref('mizan_activations/' + code).set({
                universal: true,
                maxUses: maxUses ? parseInt(maxUses) : null,
                uses: 0,
                expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
                createdAt: new Date().toISOString()
            });

            alert('✅ تم إنشاء الكود العام:\n\n' + code);
            copyToClipboard(code);
        } catch (e) {
            alert('❌ خطأ: ' + e.message);
        }
    };

    window.devShowAllNotifications = function() {
        devTabNotifications();
    };

    window.devClearAllNotifications = async function() {
        if (!confirm('⚠️ حذف كل الإشعارات؟')) return;
        try {
            await firebase.database().ref('mizan_dev_notifications').remove();
            alert('✅ تم الحذف');
            devTabNotifications();
        } catch (e) {
            alert('❌ خطأ: ' + e.message);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 🚀 إضافة زر المطور في الإعدادات
    // ═══════════════════════════════════════════════════════════
    function addDevPanelButton() {
        const settingsPage = document.querySelector('#page-settings .page-content');
        if (!settingsPage || document.getElementById('devPanelBtn')) return;

        const devSection = document.createElement('div');
        devSection.className = 'settings-section';
        devSection.id = 'devPanelSection';
        devSection.style.borderColor = '#E06060';
        devSection.innerHTML = `
            <h3 style="color:#E06060;">🛠️ أدوات المطور</h3>
            <p class="settings-desc">لوحة تحكم متقدمة للمطور (محمية بكود)</p>
            <button class="btn btn-block" onclick="openDevPanel()" style="
                background:linear-gradient(135deg, #E06060, #C04040);color:#fff;
            ">
                <i class="fas fa-tools"></i> فتح لوحة المطور
            </button>
        `;

        const dangerSection = settingsPage.querySelector('.settings-section.danger');
        if (dangerSection) {
            settingsPage.insertBefore(devSection, dangerSection);
        } else {
            settingsPage.appendChild(devSection);
        }
    }

    // تشغيل الإضافة بعد التحميل
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(addDevPanelButton, 3000);
        });
    } else {
        setTimeout(addDevPanelButton, 3000);
    }

    console.log('✅ dev-panel.js جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 🔧 إصلاحات إضافية
// ═══════════════════════════════════════════════════════════

// دالة toggle التفعيل
window.devToggleActivation = window.devToggleActivation || async function(deviceId, activate) {
    try {
        const ref = firebase.database().ref('mizan_licenses/mizan_license/devices');
        const snapshot = await ref.once('value');
        let devices = snapshot.val() || [];
        if (!Array.isArray(devices)) devices = Object.values(devices);
        
        devices = devices.map(d => {
            if (d && d.id === deviceId) {
                d.activated = activate;
            }
            return d;
        });
        
        await firebase.database().ref('mizan_licenses/mizan_license/devices').set(devices);
        alert(activate ? '✅ تم التفعيل' : '⏸️ تم التعطيل');
        if (typeof devTabDevices === 'function') devTabDevices();
    } catch (e) {
        alert('❌ ' + e.message);
    }
};

// دالة توليد الكود
window.devGenerateCode = window.devGenerateCode || async function(deviceId) {
    if (!deviceId) return 'MIZAN-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const short = deviceId.substring(0, 8).toUpperCase();
    const hash = btoa(deviceId + 'MIZAN2025').substring(0, 12).replace(/[^A-Z0-9]/g, '');
    return 'MIZAN-' + short.substring(0, 4) + '-' + hash.substring(0, 4) + '-' + hash.substring(4, 8);
};

console.log('✅ dev-panel.js - الإصلاحات الإضافية محمّلة');

// ═══════════════════════════════════════════════════════════
// 🔧 الإصلاحات النهائية
// ═══════════════════════════════════════════════════════════

// دالة toggle تفعيل الأجهزة
window.devToggleActivation = async function(deviceId, activate) {
    if (!window.firebaseReady) {
        alert('⚠️ Firebase غير متصل');
        return;
    }
    
    try {
        const ref = firebase.database().ref('mizan_licenses/mizan_license/devices');
        const snapshot = await ref.once('value');
        let devices = snapshot.val() || [];
        
        if (!Array.isArray(devices)) {
            devices = Object.values(devices);
        }
        
        let found = false;
        devices = devices.map(function(d) {
            if (d && d.id === deviceId) {
                d.activated = activate;
                found = true;
            }
            return d;
        });
        
        if (!found) {
            alert('⚠️ الجهاز غير موجود');
            return;
        }
        
        await ref.set(devices);
        alert(activate ? '✅ تم تفعيل الجهاز' : '⏸️ تم تعطيل الجهاز');
        
        if (typeof devTabDevices === 'function') {
            devTabDevices();
        }
    } catch (e) {
        console.error('❌', e);
        alert('❌ ' + e.message);
    }
};

// دالة توليد كود التنشيط
window.devGenerateCode = async function(deviceId) {
    if (!deviceId) {
        return 'MIZAN-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }
    
    try {
        const shortId = deviceId.substring(0, 8).toUpperCase();
        const hash = btoa(deviceId + 'MIZAN2025SECRET').replace(/[^A-Z0-9]/gi, '').toUpperCase();
        return 'MIZAN-' + shortId.substring(0, 4) + '-' + hash.substring(0, 4) + '-' + hash.substring(4, 8);
    } catch (e) {
        return 'MIZAN-' + deviceId.substring(0, 8).toUpperCase();
    }
};

// دالة عرض الأجهزة (محدثة)
window.devTabDevices = async function() {
    const content = document.getElementById('devPanelContent');
    if (!content) return;
    
    if (!window.firebaseReady) {
        content.innerHTML = '<div style="text-align:center;padding:30px;color:#E06060;">⚠️ Firebase غير متصل</div>';
        return;
    }
    
    content.innerHTML = '<div style="text-align:center;padding:30px;color:#A89070;">⏳ جاري التحميل...</div>';
    
    try {
        const ref = firebase.database().ref('mizan_licenses/mizan_license');
        const snapshot = await ref.once('value');
        const data = snapshot.val() || {};
        let devices = data.devices || [];
        
        if (!Array.isArray(devices)) {
            devices = Object.values(devices);
        }
        
        const maxDevices = data.maxDevices || 5;
        
        let html = '<div style="display:flex;justify-content:space-between;margin-bottom:12px;padding:10px;background:#1A1A1A;border-radius:8px;">' +
            '<span style="color:#A89070;font-size:12px;">📱 الأجهزة المسجلة</span>' +
            '<strong style="color:#C9A94E;font-size:14px;">' + devices.length + ' / ' + maxDevices + '</strong>' +
        '</div>';
        
        if (devices.length === 0) {
            html += '<div style="text-align:center;padding:30px;color:#5D5D5D;">لا توجد أجهزة مسجلة</div>';
        } else {
            devices.forEach(function(d, i) {
                const statusColor = d.activated ? '#2D8F5E' : '#E6A830';
                const statusText = d.activated ? '✅ مفعّل' : '⏳ غير مفعّل';
                
                html += '<div style="background:#1A1A1A;border-radius:10px;padding:12px;margin-bottom:8px;border-right:4px solid ' + statusColor + ';">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                        '<strong style="color:#C9A94E;font-size:13px;">📱 ' + (d.name || 'جهاز ' + (i+1)) + '</strong>' +
                        '<span style="color:' + statusColor + ';font-size:10px;font-weight:800;">' + statusText + '</span>' +
                    '</div>' +
                    '<div style="font-size:10px;color:#A89070;font-family:monospace;word-break:break-all;margin-bottom:4px;">' +
                        (d.id || '') +
                    '</div>' +
                    '<div style="font-size:10px;color:#5D5D5D;">' +
                        '📅 ' + (d.registeredAt ? new Date(d.registeredAt).toLocaleDateString('ar-EG') : 'غير معروف') +
                    '</div>' +
                    '<div style="display:flex;gap:6px;margin-top:8px;">' +
                        '<button onclick="devGenCodeForDevice(\'' + d.id + '\')" style="flex:1;background:#C9A94E;border:none;color:#0D0D0D;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">🔑 كود</button>' +
                        '<button onclick="devToggleActivation(\'' + d.id + '\', ' + !d.activated + ')" style="flex:1;background:' + (d.activated ? '#E6A830' : '#2D8F5E') + ';border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">' + (d.activated ? '⏸️' : '▶️') + '</button>' +
                        '<button onclick="devDeleteDevice(\'' + d.id + '\')" style="flex:1;background:#E06060;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">🗑️</button>' +
                    '</div>' +
                '</div>';
            });
        }
        
        content.innerHTML = html;
    } catch (e) {
        content.innerHTML = '<div style="text-align:center;padding:30px;color:#E06060;">❌ ' + e.message + '</div>';
    }
};

console.log('✅ dev-panel.js - الإصلاحات محمّلة');
