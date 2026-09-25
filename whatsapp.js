// ============================================================
// whatsapp.js - إرسال الفواتير عبر واتساب
// ============================================================

(function() {
    'use strict';

    console.log('💬 تحميل whatsapp.js');

    // ═══════════════════════════════════════════════════════════
    // 📱 إرسال نص عبر واتساب
    // ═══════════════════════════════════════════════════════════
    window.sendWhatsApp = function(phone, message) {
        if (!phone) {
            if (typeof showToast === 'function') showToast('⚠️ لا يوجد رقم هاتف', 'warning');
            return;
        }

        // تنظيف الرقم
        let cleanPhone = String(phone).replace(/[^0-9]/g, '');

        // إضافة كود الدولة إن لم يكن موجود
        if (cleanPhone.length === 10 && cleanPhone.startsWith('1')) {
            cleanPhone = '20' + cleanPhone; // مصر
        } else if (cleanPhone.length === 9 && cleanPhone.startsWith('5')) {
            cleanPhone = '966' + cleanPhone; // السعودية
        } else if (cleanPhone.length === 9 && cleanPhone.startsWith('5')) {
            cleanPhone = '971' + cleanPhone; // الإمارات
        }

        const encodedMessage = encodeURIComponent(message);
        const url = 'https://wa.me/' + cleanPhone + '?text=' + encodedMessage;

        window.open(url, '_blank');
        console.log('💬 تم فتح واتساب للرقم:', cleanPhone);
    };

    // ═══════════════════════════════════════════════════════════
    // 📄 إرسال فاتورة عبر واتساب
    // ═══════════════════════════════════════════════════════════
    window.sendInvoiceWhatsApp = function(invoiceId) {
        const invoice = (window.sales || []).find(function(s) { return s.id == invoiceId; });
        if (!invoice) {
            if (typeof showToast === 'function') showToast('⚠️ الفاتورة غير موجودة', 'error');
            return;
        }

        // الحصول على هاتف العميل
        let customerPhone = '';
        const customer = (window.customers || []).find(function(c) { return c.name === invoice.customer; });
        if (customer && customer.phone) {
            customerPhone = customer.phone;
        } else if (customer && customer.whatsapp) {
            customerPhone = customer.whatsapp;
        }

        const company = window.companyData || { name: 'الميزان', phone: '', footer: '' };

        // بناء الرسالة
        const lines = [
            '⚖️ *' + company.name + '*',
            '',
            '📄 *فاتورة رقم:* ' + invoice.number,
            '📅 *التاريخ:* ' + invoice.date,
            '🕐 *الوقت:* ' + (invoice.time || ''),
            '',
            '👤 *العميل:* ' + (invoice.customer || 'عميل نقدي'),
            '',
            '*📦 الأصناف:*'
        ];

        (invoice.items || []).forEach(function(item, i) {
            lines.push('  ' + (i+1) + '. ' + item.name + ' × ' + item.qty + ' = ' + window.formatMoney(item.total) + ' ج.م');
        });

        lines.push('');
        lines.push('━━━━━━━━━━━━━━━');

        if (invoice.subtotal) {
            lines.push('💰 *المجموع:* ' + window.formatMoney(invoice.subtotal) + ' ج.م');
        }
        if (invoice.vat > 0) {
            lines.push('📊 *الضريبة:* ' + window.formatMoney(invoice.vat) + ' ج.م');
        }
        if (invoice.discount > 0) {
            lines.push('🎁 *الخصم:* ' + window.formatMoney(invoice.discount) + ' ج.م');
        }

        lines.push('━━━━━━━━━━━━━━━');
        lines.push('*✅ الإجمالي: ' + window.formatMoney(invoice.total) + ' ج.م*');
        lines.push('');
        lines.push('💵 *طريقة الدفع:* ' + window.getPaymentMethodLabel(invoice.paymentMethod));

        if (invoice.remainingAmount > 0) {
            lines.push('⚠️ *المتبقي:* ' + window.formatMoney(invoice.remainingAmount) + ' ج.م');
        }

        lines.push('');
        lines.push('━━━━━━━━━━━━━━━');
        if (company.phone) lines.push('📞 ' + company.phone);
        if (company.footer) lines.push(company.footer);

        const message = lines.join('\n');

        if (!customerPhone) {
            // اطلب رقم
            const input = prompt('📱 أدخل رقم واتساب العميل (مع كود الدولة):', '20');
            if (!input) return;
            customerPhone = input;
        }

        sendWhatsApp(customerPhone, message);
    };

    // ═══════════════════════════════════════════════════════════
    // 💰 تذكير عميل بالديون
    // ═══════════════════════════════════════════════════════════
    window.sendDebtReminderWhatsApp = function(customerName) {
        const customer = (window.customers || []).find(function(c) { return c.name === customerName; });
        if (!customer) return;

        const balance = typeof getCustomerBalance === 'function' ? getCustomerBalance(customerName) : 0;
        if (balance <= 0) {
            if (typeof showToast === 'function') showToast('ℹ️ لا توجد مديونية', 'info');
            return;
        }

        const company = window.companyData || { name: 'الميزان' };

        const message = '⚖️ *' + company.name + '*\n\n' +
            'مرحباً ' + customer.name + '،\n\n' +
            '💳 لديك مديونية مستحقة قدرها:\n' +
            '*' + window.formatMoney(balance) + ' ج.م*\n\n' +
            '📅 نرجو التكرم بالسداد في أقرب وقت.\n\n' +
            '━━━━━━━━━━━━━━━\n' +
            (company.phone ? '📞 ' + company.phone : '') + '\n' +
            'شكراً لتعاملكم معنا 🌟';

        const phone = customer.whatsapp || customer.phone;
        if (!phone) {
            const input = prompt('📱 أدخل رقم واتساب:');
            if (!input) return;
            sendWhatsApp(input, message);
        } else {
            sendWhatsApp(phone, message);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 📊 إرسال تقرير يومي
    // ═══════════════════════════════════════════════════════════
    window.sendDailyReportWhatsApp = function(phone) {
        const today = window.getTodayDate();
        const todaySales = (window.sales || []).filter(function(s) { return s.date === today; });
        const totalSales = todaySales.reduce(function(s, x) { return s + (x.total || 0); }, 0);
        const totalProfit = todaySales.reduce(function(s, x) { return s + (x.profit || 0); }, 0);

        const company = window.companyData || { name: 'الميزان' };

        const message = '📊 *تقرير يومي - ' + company.name + '*\n\n' +
            '📅 التاريخ: ' + today + '\n' +
            '━━━━━━━━━━━━━━━\n' +
            '🧾 عدد الفواتير: *' + todaySales.length + '*\n' +
            '💰 إجمالي المبيعات: *' + window.formatMoney(totalSales) + ' ج.م*\n' +
            '📈 صافي الربح: *' + window.formatMoney(totalProfit) + ' ج.م*\n' +
            '━━━━━━━━━━━━━━━\n' +
            '⚖️ ' + company.name;

        if (!phone) {
            phone = prompt('📱 أدخل رقم واتساب:');
            if (!phone) return;
        }

        sendWhatsApp(phone, message);
    };

    // ═══════════════════════════════════════════════════════════
    // 🎨 زر "مشاركة واتساب" في قائمة الفواتير
    // ═══════════════════════════════════════════════════════════
    function enhanceInvoiceList() {
        setTimeout(function() {
            const invoiceList = document.getElementById('invoiceList');
            if (!invoiceList) return;

            // مراقبة التغييرات
            const observer = new MutationObserver(function() {
                // لا نضيف أي شيء للآن (زر المشاركة متاح عند عرض الفاتورة)
            });

            observer.observe(invoiceList, { childList: true, subtree: true });
        }, 3000);
    }

    enhanceInvoiceList();

    console.log('✅ whatsapp.js جاهز');
})();
