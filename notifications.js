// ============================================================
// notifications.js - نظام الإشعارات للميزان
// ============================================================

(function() {
    'use strict';

    console.log('🔔 تحميل notifications.js');

    // ═══════════════════════════════════════════════════════════
    // 🔔 طلب الإذن للإشعارات
    // ═══════════════════════════════════════════════════════════
    window.requestNotificationPermission = async function() {
        if (!('Notification' in window)) {
            showToast('⚠️ المتصفح لا يدعم الإشعارات', 'warning');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                showToast('✅ تم تفعيل الإشعارات', 'success');
                return true;
            } else {
                showToast('⚠️ لم يتم تفعيل الإشعارات', 'warning');
                return false;
            }
        }

        return false;
    };

    // ═══════════════════════════════════════════════════════════
    // 📤 إرسال إشعار
    // ═══════════════════════════════════════════════════════════
    window.sendNotification = function(title, body, options) {
        options = options || {};

        // 1. Toast داخلي
        if (typeof showToast === 'function') {
            showToast(title + ' - ' + body, options.type || 'info');
        }

        // 2. إشعار النظام
        if (Notification.permission === 'granted') {
            const notif = new Notification(title, {
                body: body,
                icon: './icon.png',
                badge: './icon.png',
                vibrate: [200, 100, 200],
                tag: options.tag || 'mizan-' + Date.now(),
                requireInteraction: options.requireInteraction || false,
                data: options.data || {}
            });

            notif.onclick = function() {
                window.focus();
                notif.close();
            };

            // إغلاق تلقائي بعد 10 ثواني
            setTimeout(() => notif.close(), 10000);

            return notif;
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 🔔 إشعارات جاهزة
    // ═══════════════════════════════════════════════════════════

    // إشعار فاتورة جديدة
    window.notifyNewInvoice = function(invoice) {
        sendNotification(
            '💰 فاتورة جديدة #' + invoice.number,
            'العميل: ' + (invoice.customer || 'نقدي') + ' | المبلغ: ' + formatMoney(invoice.total) + ' ج.م',
            { type: 'success', tag: 'invoice-' + invoice.number }
        );
    };

    // إشعار انخفاض المخزون
    window.notifyLowStock = function(product) {
        sendNotification(
            '⚠️ انخفاض المخزون',
            product.name + ' - الكمية الحالية: ' + product.qty + ' (الحد الأدنى: ' + product.min + ')',
            { type: 'warning', tag: 'stock-' + product.id, requireInteraction: true }
        );
    };

    // إشعار تحصيل
    window.notifyCollect = function(party, amount) {
        sendNotification(
            '💵 تحصيل جديد',
            'من ' + party + ' - المبلغ: ' + formatMoney(amount) + ' ج.م',
            { type: 'success' }
        );
    };

    // إشعار سداد
    window.notifyPay = function(party, amount) {
        sendNotification(
            '💳 سداد جديد',
            'لـ ' + party + ' - المبلغ: ' + formatMoney(amount) + ' ج.م',
            { type: 'info' }
        );
    };

    // إشعار مصروف
    window.notifyExpense = function(note, amount) {
        sendNotification(
            '💸 مصروف جديد',
            note + ' - ' + formatMoney(amount) + ' ج.م',
            { type: 'warning' }
        );
    };

    // إشعار ترحيب
    window.notifyWelcome = function(userName) {
        sendNotification(
            '👋 مرحباً ' + userName,
            'تم تسجيل الدخول بنجاح',
            { type: 'success' }
        );
    };

    // ═══════════════════════════════════════════════════════════
    // 📅 إشعار يومي (ملخص)
    // ═══════════════════════════════════════════════════════════
    window.sendDailySummary = function() {
        if (Notification.permission !== 'granted') return;

        const today = getTodayDate();
        const todaySales = sales.filter(s => s.date === today);
        const totalSales = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);

        sendNotification(
            '📊 ملخص اليوم',
            'عدد الفواتير: ' + todaySales.length + ' | المبيعات: ' + formatMoney(totalSales) + ' ج.م',
            { type: 'info', tag: 'daily-summary' }
        );
    };

    // ═══════════════════════════════════════════════════════════
    // 🎯 أوامر الإشعارات من Console
    // ═══════════════════════════════════════════════════════════
    window.testNotification = function() {
        sendNotification('🎉 اختبار', 'هذا إشعار تجريبي!', { type: 'success' });
    };

    // تفعيل تلقائي عند أول استخدام
    setTimeout(() => {
        if (Notification.permission === 'default') {
            console.log('💡 يمكنك تفعيل الإشعارات بـ: requestNotificationPermission()');
        }
    }, 5000);

    console.log('✅ notifications.js جاهز');
})();
