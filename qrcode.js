// ============================================================
// qrcode.js - توليد QR Code للفواتير
// ============================================================

(function() {
    'use strict';

    console.log('📱 تحميل qrcode.js');

    // ═══════════════════════════════════════════════════════════
    // 📱 مكتبة QR Code (CDN)
    // ═══════════════════════════════════════════════════════════
    function loadQRCodeLibrary() {
        return new Promise(function(resolve, reject) {
            if (typeof QRCode !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // ═══════════════════════════════════════════════════════════
    // 📋 إنشاء نص الفاتورة
    // ═══════════════════════════════════════════════════════════
    window.generateInvoiceQRText = function(invoice) {
        // نص مبسط يحتوي على معلومات مهمة
        const lines = [
            '⚖️ ' + (window.companyData ? window.companyData.name : 'الميزان'),
            '📄 فاتورة #' + invoice.number,
            '📅 ' + invoice.date + ' ' + (invoice.time || ''),
            '👤 ' + (invoice.customer || 'عميل نقدي'),
            '💰 ' + window.formatMoney(invoice.total) + ' ج.م',
            '',
            '📦 الأصناف:'
        ];

        (invoice.items || []).slice(0, 5).forEach(function(item, i) {
            lines.push('  ' + (i+1) + '. ' + item.name + ' × ' + item.qty + ' = ' + window.formatMoney(item.total));
        });

        if (invoice.items && invoice.items.length > 5) {
            lines.push('  ... و ' + (invoice.items.length - 5) + ' أصناف أخرى');
        }

        lines.push('');
        lines.push('💵 الدفع: ' + window.getPaymentMethodLabel(invoice.paymentMethod));
        lines.push('📱 تواصل: ' + (window.companyData ? window.companyData.phone : ''));

        return lines.join('\n');
    };

    // ═══════════════════════════════════════════════════════════
    // 🎨 عرض QR Code
    // ═══════════════════════════════════════════════════════════
    window.showInvoiceQR = async function(invoiceId) {
        try {
            await loadQRCodeLibrary();
            
            const invoice = (window.sales || []).find(function(s) { return s.id == invoiceId; });
            if (!invoice) {
                if (typeof showToast === 'function') showToast('⚠️ الفاتورة غير موجودة', 'error');
                return;
            }

            const qrText = generateInvoiceQRText(invoice);
            
            // حذف القديم
            const oldQR = document.getElementById('qrContainer');
            if (oldQR) oldQR.remove();

            const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
                '<h3>📱 QR Code - فاتورة #' + invoice.number + '</h3>' +
                '<div style="background:#fff;padding:20px;border-radius:12px;text-align:center;">' +
                    '<div id="qrContainer" style="display:inline-block;padding:10px;background:#fff;border-radius:8px;"></div>' +
                    '<div style="margin-top:15px;color:#0D0D0D;font-size:12px;font-weight:800;">' +
                        'امسح الكود للاطلاع على الفاتورة' +
                    '</div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:12px;">' +
                    '<button class="btn btn-primary" onclick="downloadInvoiceQR(' + invoice.id + ')"><i class="fas fa-download"></i> تحميل</button>' +
                    '<button class="btn btn-success" onclick="shareInvoiceQR(' + invoice.id + ')"><i class="fas fa-share"></i> مشاركة</button>' +
                '</div>' +
                '<button class="btn btn-info btn-block" onclick="printInvoiceQR(' + invoice.id + ')" style="margin-top:6px;"><i class="fas fa-print"></i> طباعة</button>';

            if (typeof openModal === 'function') openModal(html);

            // توليد QR بعد ظهور النافذة
            setTimeout(function() {
                const container = document.getElementById('qrContainer');
                if (container && typeof QRCode !== 'undefined') {
                    new QRCode(container, {
                        text: qrText,
                        width: 240,
                        height: 240,
                        colorDark: '#0D0D0D',
                        colorLight: '#FFFFFF',
                        correctLevel: QRCode.CorrectLevel.M
                    });
                    console.log('✅ تم توليد QR Code');
                }
            }, 300);

        } catch (e) {
            console.error('❌ خطأ QR:', e);
            if (typeof showToast === 'function') showToast('❌ فشل توليد QR', 'error');
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 💾 تحميل QR كصورة
    // ═══════════════════════════════════════════════════════════
    window.downloadInvoiceQR = function(invoiceId) {
        const container = document.getElementById('qrContainer');
        if (!container) return;

        const canvas = container.querySelector('canvas');
        const img = container.querySelector('img');

        if (canvas) {
            const link = document.createElement('a');
            link.download = 'invoice-qr-' + invoiceId + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else if (img) {
            const link = document.createElement('a');
            link.download = 'invoice-qr-' + invoiceId + '.png';
            link.href = img.src;
            link.click();
        }

        if (typeof showToast === 'function') showToast('✅ تم التحميل', 'success');
    };

    // ═══════════════════════════════════════════════════════════
    // 📤 مشاركة QR
    // ═══════════════════════════════════════════════════════════
    window.shareInvoiceQR = async function(invoiceId) {
        const invoice = (window.sales || []).find(function(s) { return s.id == invoiceId; });
        if (!invoice) return;

        const text = generateInvoiceQRText(invoice);

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'فاتورة #' + invoice.number,
                    text: text
                });
            } catch (e) {}
        } else {
            // نسخ إلى الحافظة
            try {
                await navigator.clipboard.writeText(text);
                if (typeof showToast === 'function') showToast('✅ تم نسخ تفاصيل الفاتورة', 'success');
            } catch (e) {
                alert(text);
            }
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 🖨️ طباعة QR
    // ═══════════════════════════════════════════════════════════
    window.printInvoiceQR = function(invoiceId) {
        const container = document.getElementById('qrContainer');
        if (!container) return;

        const canvas = container.querySelector('canvas');
        const img = container.querySelector('img');
        const qrImage = canvas ? canvas.toDataURL() : (img ? img.src : '');

        const invoice = (window.sales || []).find(function(s) { return s.id == invoiceId; });
        const companyName = window.companyData ? window.companyData.name : 'الميزان';

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <title>QR - فاتورة #${invoice.number}</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
                    h1 { color: #C9A94E; margin-bottom: 20px; }
                    img { max-width: 300px; margin: 20px 0; }
                    .info { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-top: 20px; }
                    .info div { padding: 5px 0; }
                </style>
            </head>
            <body>
                <h1>⚖️ ${companyName}</h1>
                <h2>فاتورة #${invoice.number}</h2>
                <img src="${qrImage}" alt="QR Code" />
                <div class="info">
                    <div><strong>التاريخ:</strong> ${invoice.date}</div>
                    <div><strong>العميل:</strong> ${invoice.customer || 'عميل نقدي'}</div>
                    <div><strong>الإجمالي:</strong> ${window.formatMoney(invoice.total)} ج.م</div>
                </div>
                <p style="margin-top:20px;color:#666;">امسح الكود للاطلاع على تفاصيل الفاتورة</p>
                <script>window.print();</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // ═══════════════════════════════════════════════════════════
    // 🔗 إضافة زر QR في قائمة الفواتير
    // ═══════════════════════════════════════════════════════════
    function addQRButtonToInvoices() {
        // سيتم استدعاؤها بعد تحميل الفواتير
        setTimeout(function() {
            // يمكن استخدامها عند عرض الفواتير
        }, 3000);
    }

    // تحميل المكتبة مسبقاً
    setTimeout(loadQRCodeLibrary, 3000);

    console.log('✅ qrcode.js جاهز');
})();
