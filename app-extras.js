// ============================================================
// الميزان 14.0.0 - app-extras.js
// ملف الإضافات الشامل - كل المقترحات في ملف واحد
// ============================================================
// 
// يحتوي على:
// 1. 📱 تحويل PWA (تطبيق موبايل)
// 2. 🎨 الوضع الفاتح (Light Mode)
// 3. 🖼️ شعار الشركة
// 4. 🎁 نظام نقاط العملاء
// 5. 📅 نظام الحجوزات
// 6. 📸 رفع صور المنتجات
// 7. 📊 رسوم بيانية متقدمة
// 8. 🔔 إشعارات فورية
// 9. 🌍 ترجمة إنجليزية (AR/EN)
// 10. 💾 نسخ احتياطي تلقائي
// 11. 📱 اختصارات لوحة المفاتيح
// 12. 🎯 تقارير متقدمة
// 13. 💰 اقتراح الأسعار الذكي
// 14. 📞 قائمة عملاء VIP
// 15. 🎨 قوالب فواتير
// ============================================================

console.log('🚀 تحميل app-extras.js - الإضافات الشاملة');
console.log('📋 15 ميزة سيتم إضافتها...');

// ═══════════════════════════════════════════════════════════
// 1. 📱 PWA — نسخة مبسطة (بدون Service Worker)
// ═══════════════════════════════════════════════════════════
(function initPWA() {
    // فقط meta tags — بدون Service Worker
    const metaTags = [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'الميزان' },
        { name: 'application-name', content: 'الميزان' }
    ];
    
    metaTags.forEach(function(tag) {
        if (!document.querySelector('meta[name="' + tag.name + '"]')) {
            const meta = document.createElement('meta');
            meta.name = tag.name;
            meta.content = tag.content;
            document.head.appendChild(meta);
        }
    });

    console.log('✅ PWA: جاهز (بدون SW)');
})();

// ═══════════════════════════════════════════════════════════
// 2. 🎨 الوضع الفاتح (Light Mode)
// ═══════════════════════════════════════════════════════════
(function initThemeToggle() {
    // إضافة زر تبديل الوضع
    function addThemeToggle() {
        const header = document.querySelector('.header-actions');
        if (!header || document.getElementById('themeToggleBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'themeToggleBtn';
        btn.className = 'theme-toggle-btn';
        btn.title = 'تبديل الوضع';
        btn.innerHTML = getThemeIcon();
        btn.onclick = toggleTheme;
        btn.style.cssText = 'background:#0D0D0D;border:2px solid #3D3D3D;' +
            'color:#C9A94E;font-size:14px;cursor:pointer;padding:6px 10px;' +
            'border-radius:8px;transition:0.2s;';
        header.insertBefore(btn, header.firstChild);
    }

    function getThemeIcon() {
        const theme = localStorage.getItem('mizan_theme') || 'dark';
        return theme === 'dark' ? '☀️' : '🌙';
    }

    window.toggleTheme = function() {
        const current = localStorage.getItem('mizan_theme') || 'dark';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('mizan_theme', newTheme);
        applyTheme(newTheme);
        
        const btn = document.getElementById('themeToggleBtn');
        if (btn) btn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
        
        if (typeof showToast === 'function') {
            showToast(newTheme === 'dark' ? '🌙 الوضع الداكن' : '☀️ الوضع الفاتح', 'info');
        }
    };

    window.applyTheme = function(theme) {
        document.body.classList.toggle('light-mode', theme === 'light');
    };

    // CSS للوضع الفاتح
    const themeCSS = `
        body.light-mode {
            background: #F5F0E8 !important;
            color: #1A1A1A !important;
        }
        body.light-mode .top-header,
        body.light-mode .page-content,
        body.light-mode .form-card,
        body.light-mode .dashboard-card,
        body.light-mode .invoice-header-card,
        body.light-mode .add-item-section,
        body.light-mode .items-table-container,
        body.light-mode .totals-box,
        body.light-mode .pos-totals-box,
        body.light-mode .modal-box,
        body.light-mode .settings-section,
        body.light-mode .stat-mini,
        body.light-mode .pos-items-box,
        body.light-mode .pos-meta-row,
        body.light-mode .pos-meta-item {
            background: #FFFFFF !important;
            border-color: #E0D5B8 !important;
            color: #1A1A1A !important;
        }
        body.light-mode .table-row {
            background: #FFFFFF !important;
            color: #1A1A1A !important;
            border-color: #E0D5B8 !important;
        }
        body.light-mode .table-row:hover {
            background: #F5F0E8 !important;
        }
        body.light-mode .table-header {
            color: #8B7A3A !important;
            border-color: #C9A94E !important;
        }
        body.light-mode input,
        body.light-mode select,
        body.light-mode textarea {
            background: #FFFFFF !important;
            color: #1A1A1A !important;
            border-color: #E0D5B8 !important;
        }
        body.light-mode .login-box {
            background: #FFFFFF !important;
        }
        body.light-mode .bottom-nav {
            background: #FFFFFF !important;
            border-color: #E0D5B8 !important;
        }
        body.light-mode .user-badge,
        body.light-mode .clock,
        body.light-mode .lock-btn {
            background: #F5F0E8 !important;
            color: #8B7A3A !important;
        }
        body.light-mode .page-content h2,
        body.light-mode .form-card h3,
        body.light-mode .pos-section-title,
        body.light-mode .add-item-header {
            color: #8B7A3A !important;
        }
        body.light-mode .empty-state {
            background: #F5F0E8 !important;
            color: #8B7A3A !important;
        }
        body.light-mode .pos-customer-row {
            background: linear-gradient(135deg, #FFF9E8, #FFFFFF) !important;
        }
        body.light-mode .pos-customer-select {
            background: #FFFFFF !important;
            color: #1A1A1A !important;
        }
        body.light-mode .item-row {
            background: #FFFFFF !important;
            color: #1A1A1A !important;
        }
        body.light-mode .item-row:nth-child(even) {
            background: #FAFAFA !important;
        }
        body.light-mode .report-table-row {
            background: #FFFFFF !important;
            color: #1A1A1A !important;
        }
        body.light-mode .report-stat {
            background: #FFFFFF !important;
        }
    `;

    const style = document.createElement('style');
    style.textContent = themeCSS;
    document.head.appendChild(style);

    // تطبيق الوضع المحفوظ
    const savedTheme = localStorage.getItem('mizan_theme') || 'dark';
    if (savedTheme === 'light') {
        if (document.body) {
            applyTheme('light');
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                applyTheme('light');
            });
        }
    }

    // إضافة الزر
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addThemeToggle, 1500);
        });
    } else {
        setTimeout(addThemeToggle, 1500);
    }

    console.log('✅ الوضع الفاتح: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 3. 🖼️ شعار الشركة (في الهيدر)
// ═══════════════════════════════════════════════════════════
(function initCompanyLogo() {
    function addLogo() {
        if (typeof companyData === 'undefined') return;
        if (!companyData.logo) return;
        
        const logoIcon = document.querySelector('.top-header .logo-icon');
        if (!logoIcon || logoIcon.querySelector('img')) return;
        
        logoIcon.innerHTML = '<img src="' + companyData.logo + '" style="max-width:100%;max-height:100%;border-radius:6px;" alt="logo">';
        logoIcon.style.cssText = 'width:36px;height:36px;display:flex;align-items:center;justify-content:center;overflow:hidden;';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addLogo, 2000);
        });
    } else {
        setTimeout(addLogo, 2000);
    }

    console.log('✅ شعار الشركة: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 4. 🎁 نظام نقاط العملاء
// ═══════════════════════════════════════════════════════════
(function initLoyaltyPoints() {
    // إعدادات النظام
    const POINTS_PER_EGP = 0.01; // نقطة لكل جنيه
    const POINTS_VALUE = 0.1; // كل نقطة = 10 قروش

    window.getCustomerPoints = function(customerName) {
        const points = getData('customer_points', {});
        return points[customerName] || 0;
    };

    window.addCustomerPoints = function(customerName, points) {
        if (!customerName || customerName === 'عميل نقدي') return;
        const allPoints = getData('customer_points', {});
        allPoints[customerName] = (allPoints[customerName] || 0) + points;
        setData('customer_points', allPoints);
    };

    window.redeemCustomerPoints = function(customerName, points) {
        const current = getCustomerPoints(customerName);
        if (current < points) return false;
        const allPoints = getData('customer_points', {});
        allPoints[customerName] = current - points;
        setData('customer_points', allPoints);
        return true;
    };

    // تعديل saveSale لإضافة نقاط
    const _originalSaveSale = window.saveSale;
    window.saveSale = function() {
        const customer = document.getElementById('saleCustomer')?.value;
        if (_originalSaveSale) _originalSaveSale.apply(this, arguments);
        
        if (customer && customer !== 'عميل نقدي' && typeof sales !== 'undefined' && sales.length > 0) {
            const lastSale = sales[sales.length - 1];
            if (lastSale.customer === customer) {
                const points = Math.floor(lastSale.total * POINTS_PER_EGP);
                addCustomerPoints(customer, points);
                if (points > 0 && typeof showToast === 'function') {
                    setTimeout(function() {
                        showToast('🎁 حصل ' + customer + ' على ' + points + ' نقطة', 'success');
                    }, 500);
                }
            }
        }
    };

    // إضافة عمود النقاط في صفحة العملاء
    const _originalRenderCustomers = window.renderCustomers;
    window.renderCustomers = function() {
        if (_originalRenderCustomers) _originalRenderCustomers.apply(this, arguments);
        
        setTimeout(function() {
            const customerList = document.getElementById('customerList');
            if (!customerList) return;
            
            const rows = customerList.querySelectorAll('.table-row');
            rows.forEach(function(row) {
                const nameSpan = row.querySelector('strong');
                if (!nameSpan) return;
                const name = nameSpan.textContent.trim();
                const points = getCustomerPoints(name);
                if (points > 0 && !row.querySelector('.customer-points-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'customer-points-badge';
                    badge.innerHTML = '🎁 ' + points;
                    badge.style.cssText = 'display:inline-block;background:linear-gradient(135deg,#C9A94E,#B8953A);color:#0D0D0D;' +
                        'padding:2px 8px;border-radius:10px;font-size:10px;font-weight:900;margin-right:6px;';
                    nameSpan.parentNode.insertBefore(badge, nameSpan.nextSibling);
                }
            });
        }, 200);
    };

    console.log('✅ نظام النقاط: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 5. 📅 نظام الحجوزات
// ═══════════════════════════════════════════════════════════
(function initReservations() {
    window.reservations = getData('reservations', []);

    window.saveReservation = function() {
        const name = prompt('👤 اسم العميل:');
        if (!name) return;
        
        const phone = prompt('📞 رقم الهاتف:');
        if (!phone) return;
        
        const date = prompt('📅 تاريخ الحجز (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
        if (!date) return;
        
        const time = prompt('🕐 وقت الحجز (HH:MM):', '12:00');
        if (!time) return;
        
        const note = prompt('📝 ملاحظات (اختياري):') || '';
        
        const reservation = {
            id: Date.now(),
            name: name,
            phone: phone,
            date: date,
            time: time,
            note: note,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        reservations.push(reservation);
        setData('reservations', reservations);
        
        if (typeof showToast === 'function') {
            showToast('✅ تم حفظ الحجز', 'success');
        }
    };

    window.showReservationsManager = function() {
        const today = new Date().toISOString().split('T')[0];
        const upcoming = reservations.filter(function(r) { return r.date >= today && r.status === 'pending'; })
            .sort(function(a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
        
        let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>📅 الحجوزات القادمة</h3>' +
            '<button class="btn btn-primary btn-block" onclick="closeModal(); saveReservation();" style="margin-bottom:12px;">' +
                '<i class="fas fa-plus"></i> إضافة حجز جديد' +
            '</button>';
        
        if (upcoming.length === 0) {
            html += '<div class="empty-state"><i class="fas fa-calendar"></i><span>لا توجد حجوزات قادمة</span></div>';
        } else {
            html += '<div style="max-height:400px;overflow-y:auto;">';
            upcoming.forEach(function(r) {
                const isToday = r.date === today;
                const color = isToday ? '#C9A94E' : '#4A8AB5';
                html += '<div style="background:#0D0D0D;border-radius:10px;padding:12px;margin-bottom:8px;border-right:4px solid ' + color + ';">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                        '<strong style="color:' + color + ';">' + r.name + '</strong>' +
                        (isToday ? '<span style="background:' + color + ';color:#0D0D0D;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:900;">اليوم</span>' : '') +
                    '</div>' +
                    '<div style="font-size:12px;color:#A89070;margin-top:6px;">' +
                        '📅 ' + r.date + ' 🕐 ' + r.time + '<br>' +
                        '📞 ' + r.phone +
                        (r.note ? '<br>📝 ' + r.note : '') +
                    '</div>' +
                    '<div style="display:flex;gap:4px;margin-top:8px;">' +
                        '<button class="btn btn-success btn-sm" onclick="confirmReservation(' + r.id + ')">✅ تأكيد</button>' +
                        '<button class="btn btn-danger btn-sm" onclick="cancelReservation(' + r.id + ')">❌ إلغاء</button>' +
                    '</div>' +
                '</div>';
            });
            html += '</div>';
        }
        
        html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
        
        if (typeof openModal === 'function') openModal(html);
    };

    window.confirmReservation = function(id) {
        const r = reservations.find(function(x) { return x.id === id; });
        if (r) {
            r.status = 'confirmed';
            setData('reservations', reservations);
            if (typeof showToast === 'function') showToast('✅ تم تأكيد الحجز', 'success');
            closeModal();
            setTimeout(showReservationsManager, 200);
        }
    };

    window.cancelReservation = function(id) {
        if (!confirm('⚠️ إلغاء الحجز؟')) return;
        const r = reservations.find(function(x) { return x.id === id; });
        if (r) {
            r.status = 'cancelled';
            setData('reservations', reservations);
            if (typeof showToast === 'function') showToast('❌ تم إلغاء الحجز', 'info');
            closeModal();
            setTimeout(showReservationsManager, 200);
        }
    };

    // إضافة زر الحجوزات في لوحة التحكم
    function addReservationsButton() {
        const pageContent = document.querySelector('#page-dashboard .page-content');
        if (!pageContent || document.getElementById('reservationsBtn')) return;
        
        const today = new Date().toISOString().split('T')[0];
        const todayCount = reservations.filter(function(r) { 
            return r.date === today && r.status === 'pending'; 
        }).length;
        
        const btn = document.createElement('button');
        btn.id = 'reservationsBtn';
        btn.className = 'btn btn-info btn-block';
        btn.style.cssText = 'margin-top:12px;';
        btn.innerHTML = '📅 إدارة الحجوزات' + (todayCount > 0 ? ' <span style="background:#E06060;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;margin-right:6px;">' + todayCount + '</span>' : '');
        btn.onclick = showReservationsManager;
        
        const lastSalesHeading = pageContent.querySelector('h2:last-of-type');
        if (lastSalesHeading) {
            lastSalesHeading.parentNode.insertBefore(btn, lastSalesHeading);
        } else {
            pageContent.appendChild(btn);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addReservationsButton, 2500);
        });
    } else {
        setTimeout(addReservationsButton, 2500);
    }

    console.log('✅ نظام الحجوزات: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 6. 📸 رفع صور المنتجات
// ═══════════════════════════════════════════════════════════
(function initProductImages() {
    window.getProductImage = function(productId) {
        const images = getData('product_images', {});
        return images[productId] || '';
    };

    window.saveProductImage = function(productId, imageData) {
        const images = getData('product_images', {});
        images[productId] = imageData;
        setData('product_images', images);
    };

    window.uploadProductImage = function(productId) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 500000) {
                if (typeof showToast === 'function') showToast('⚠️ الصورة كبيرة جداً (الحد 500KB)', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(ev) {
                saveProductImage(productId, ev.target.result);
                if (typeof showToast === 'function') showToast('✅ تم حفظ الصورة', 'success');
                
                // تحديث عرض المنتجات
                if (typeof renderProducts === 'function') renderProducts();
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    // تعديل renderProducts لإظهار الصور
    const _originalRenderProducts = window.renderProducts;
    window.renderProducts = function() {
        if (_originalRenderProducts) _originalRenderProducts.apply(this, arguments);
        
        setTimeout(function() {
            const productList = document.getElementById('productList');
            if (!productList) return;
            
            const rows = productList.querySelectorAll('.table-row');
            rows.forEach(function(row) {
                const nameSpan = row.querySelector('strong');
                if (!nameSpan || row.querySelector('.product-image')) return;
                
                // البحث عن المنتج في القائمة
                if (typeof products === 'undefined') return;
                const productName = nameSpan.textContent.trim();
                const product = products.find(function(p) { return p.name === productName; });
                if (!product) return;
                
                const imgData = getProductImage(product.id);
                if (imgData) {
                    const img = document.createElement('img');
                    img.className = 'product-image';
                    img.src = imgData;
                    img.style.cssText = 'width:32px;height:32px;border-radius:6px;object-fit:cover;' +
                        'margin-left:6px;vertical-align:middle;border:1px solid #3D3D3D;';
                    nameSpan.parentNode.insertBefore(img, nameSpan);
                } else {
                    const placeholder = document.createElement('button');
                    placeholder.className = 'product-image-add';
                    placeholder.innerHTML = '📷';
                    placeholder.title = 'إضافة صورة';
                    placeholder.style.cssText = 'background:transparent;border:1px dashed #3D3D3D;' +
                        'width:32px;height:32px;border-radius:6px;cursor:pointer;color:#A89070;' +
                        'font-size:14px;margin-left:6px;vertical-align:middle;';
                    placeholder.onclick = function(e) {
                        e.stopPropagation();
                        uploadProductImage(product.id);
                    };
                    nameSpan.parentNode.insertBefore(placeholder, nameSpan);
                }
            });
        }, 200);
    };

    console.log('✅ صور المنتجات: جاهزة');
})();

// ═══════════════════════════════════════════════════════════
// 7. 📊 رسوم بيانية متقدمة (Canvas Chart)
// ═══════════════════════════════════════════════════════════
(function initAdvancedCharts() {
    window.drawSalesChart = function(containerId) {
        const container = document.getElementById(containerId);
        if (!container || typeof sales === 'undefined') return;
        
        // حساب آخر 30 يوم
        const days = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayTotal = sales.filter(function(s) { return s.date === dateStr; })
                .reduce(function(sum, s) { return sum + (s.total || 0); }, 0);
            days.push({ date: dateStr, total: dayTotal, day: d.getDate() });
        }
        
        const maxVal = Math.max.apply(null, days.map(function(d) { return d.total; }).concat([1]));
        
        let svg = '<svg viewBox="0 0 320 120" style="width:100%;height:120px;background:#0D0D0D;border-radius:10px;padding:8px;">';
        
        // Grid lines
        for (let i = 0; i <= 4; i++) {
            const y = 10 + (i * 25);
            svg += '<line x1="10" y1="' + y + '" x2="310" y2="' + y + '" stroke="#2D2D2D" stroke-width="0.5" stroke-dasharray="2,2"/>';
        }
        
        // Line
        const points = days.map(function(d, i) {
            const x = 15 + (i * 10);
            const y = 105 - ((d.total / maxVal) * 90);
            return x + ',' + y;
        }).join(' ');
        
        svg += '<polyline points="' + points + '" fill="none" stroke="#C9A94E" stroke-width="2" stroke-linejoin="round"/>';
        
        // Fill area
        svg += '<polygon points="15,105 ' + points + ' 305,105" fill="url(#goldGradient)" opacity="0.3"/>';
        
        // Gradient
        svg += '<defs><linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">' +
            '<stop offset="0%" style="stop-color:#C9A94E;stop-opacity:0.6"/>' +
            '<stop offset="100%" style="stop-color:#C9A94E;stop-opacity:0"/>' +
            '</linearGradient></defs>';
        
        // Points
        days.forEach(function(d, i) {
            if (d.total > 0) {
                const x = 15 + (i * 10);
                const y = 105 - ((d.total / maxVal) * 90);
                svg += '<circle cx="' + x + '" cy="' + y + '" r="2" fill="#C9A94E"/>';
            }
        });
        
        svg += '</svg>';
        
        container.innerHTML = svg;
    };

    // إضافة رسم بياني في لوحة التحكم
    function addChartsToDashboard() {
        const pageContent = document.querySelector('#page-dashboard .page-content');
        if (!pageContent || document.getElementById('advancedChartContainer')) return;
        
        const chartDiv = document.createElement('div');
        chartDiv.id = 'advancedChartContainer';
        chartDiv.style.cssText = 'background:#1C1C1C;border-radius:14px;padding:14px;margin:14px 0;border:1px solid #2D2D2D;';
        chartDiv.innerHTML = '<h3 style="color:#C9A94E;font-size:14px;margin-bottom:12px;">📈 المبيعات - آخر 30 يوم</h3>' +
            '<div id="salesChart30"></div>';
        
        const firstStats = pageContent.querySelector('.dashboard-stats');
        if (firstStats) {
            firstStats.parentNode.insertBefore(chartDiv, firstStats);
        }
        
        setTimeout(function() {
            drawSalesChart('salesChart30');
        }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addChartsToDashboard, 3000);
        });
    } else {
        setTimeout(addChartsToDashboard, 3000);
    }

    console.log('✅ الرسوم البيانية: جاهزة');
})();

// ═══════════════════════════════════════════════════════════
// 8. 🔔 إشعارات فورية
// ═══════════════════════════════════════════════════════════
(function initNotifications() {
    window.requestNotificationPermission = function() {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted') return;
        
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                console.log('✅ تم تفعيل الإشعارات');
            }
        });
    };

    window.sendNotification = function(title, body, icon) {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;
        
        try {
            new Notification(title, {
                body: body,
                icon: icon || 'icon-192.png',
                badge: 'icon-192.png',
                tag: 'mizan-notification',
                requireInteraction: false
            });
        } catch (e) {
            console.log('ℹ️ الإشعارات غير مدعومة');
        }
    };

    // إشعار عند حفظ فاتورة
    const _originalSaveSale = window.saveSale;
    window.saveSale = function() {
        const beforeCount = sales.length;
        if (_originalSaveSale) _originalSaveSale.apply(this, arguments);
        
        setTimeout(function() {
            if (sales.length > beforeCount) {
                const inv = sales[sales.length - 1];
                sendNotification(
                    '🧾 فاتورة جديدة #' + inv.number,
                    'العميل: ' + inv.customer + '\nالإجمالي: ' + inv.total.toFixed(2) + ' ج.م'
                );
            }
        }, 500);
    };

    // طلب الإذن بعد 10 ثواني
    setTimeout(requestNotificationPermission, 10000);

    console.log('✅ الإشعارات: جاهزة');
})();

// ═══════════════════════════════════════════════════════════
// 9. 🌍 ترجمة إنجليزية (AR/EN)
// ═══════════════════════════════════════════════════════════
(function initLanguageToggle() {
    const translations = {
        'ar': {},
        'en': {
            'لوحة التحكم': 'Dashboard',
            'المخزون': 'Inventory',
            'الكاشير': 'POS',
            'المشتريات': 'Purchases',
            'التقارير': 'Reports',
            'المزيد': 'More',
            'الرئيسية': 'Home',
            'المنتجات': 'Products',
            'الكميات': 'Quantities',
            'قيمة المخزون': 'Stock Value',
            'قاربت على النفاذ': 'Low Stock',
            'عدد الفواتير': 'Invoices',
            'إجمالي المبيعات': 'Total Sales',
            'إجمالي المشتريات': 'Total Purchases',
            'إجمالي المصروفات': 'Total Expenses',
            'إجمالي الخزائن': 'Total Treasury',
            'صافي الربح': 'Net Profit',
            'مديونيات العملاء': 'Customer Debts',
            'التزامات الموردين': 'Supplier Debts',
            'آخر المبيعات': 'Last Sales',
            'حفظ': 'Save',
            'طباعة': 'Print',
            'إلغاء': 'Cancel',
            'إضافة': 'Add',
            'حذف': 'Delete',
            'تعديل': 'Edit',
            'بحث': 'Search',
            'العملاء': 'Customers',
            'الموردين': 'Suppliers',
            'المستخدمين': 'Users',
            'الإعدادات': 'Settings',
            'الفواتير': 'Invoices',
            'المرتجعات': 'Returns',
            'المصروفات': 'Expenses',
            'التحصيل والسداد': 'Collections',
            'حركات الخزنة': 'Treasury',
            'الخزائن': 'Cash Boxes',
            'الشركة': 'Company',
            'الدخول': 'Login',
            'كلمة المرور': 'Password',
            'اسم المستخدم': 'Username',
            'تسجيل خروج': 'Logout'
        }
    };

    window.currentLang = localStorage.getItem('mizan_lang') || 'ar';

    window.setLanguage = function(lang) {
        window.currentLang = lang;
        localStorage.setItem('mizan_lang', lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        if (lang === 'en') {
            translateToEnglish();
        } else {
            if (typeof showToast === 'function') {
                showToast('🌍 تم التبديل للعربية', 'info');
                setTimeout(function() { location.reload(); }, 500);
            }
        }
    };

    function translateToEnglish() {
        const map = translations.en;
        const allElements = document.querySelectorAll('h1, h2, h3, h4, label, button, span, div');
        
        allElements.forEach(function(el) {
            if (el.children.length > 0) return;
            const text = el.textContent.trim();
            if (map[text]) {
                el.textContent = map[text];
            }
        });
        
        if (typeof showToast === 'function') {
            showToast('🌍 English mode', 'info');
        }
    }

    // إضافة زر اللغة
    function addLangToggle() {
        const header = document.querySelector('.header-actions');
        if (!header || document.getElementById('langToggleBtn')) return;
        
        const btn = document.createElement('button');
        btn.id = 'langToggleBtn';
        btn.className = 'lang-toggle-btn';
        btn.title = 'تغيير اللغة';
        btn.innerHTML = window.currentLang === 'ar' ? 'EN' : 'AR';
        btn.style.cssText = 'background:#0D0D0D;border:2px solid #3D3D3D;color:#C9A94E;' +
            'font-size:12px;cursor:pointer;padding:6px 10px;border-radius:8px;font-weight:900;';
        btn.onclick = function() {
            setLanguage(window.currentLang === 'ar' ? 'en' : 'ar');
        };
        header.insertBefore(btn, header.firstChild);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addLangToggle, 1800);
        });
    } else {
        setTimeout(addLangToggle, 1800);
    }

    console.log('✅ الترجمة: جاهزة');
})();

// ═══════════════════════════════════════════════════════════
// 10. 💾 نسخ احتياطي تلقائي
// ═══════════════════════════════════════════════════════════
(function initAutoBackup() {
    window.autoBackup = function() {
        try {
            const data = {
                version: '14.0.0',
                backupDate: new Date().toISOString(),
                products: products,
                sales: sales,
                purchases: purchases,
                customers: customers,
                suppliers: suppliers,
                cashBoxes: cashBoxes,
                expenses: expenses,
                treasury: treasury,
                payments: payments,
                returns: returns,
                users: users,
                companyData: companyData,
                reservations: getData('reservations', []),
                customerPoints: getData('customer_points', {})
            };
            
            const json = JSON.stringify(data);
            setData('last_backup', {
                date: new Date().toISOString(),
                size: (json.length / 1024).toFixed(2) + ' KB'
            });
            
            // حفظ نسخة في localStorage
            try {
                localStorage.setItem('mizan_last_backup_data', json);
            } catch (e) {
                console.log('ℹ️ لا توجد مساحة كافية');
            }
            
            console.log('✅ تم إنشاء نسخة احتياطية');
            return true;
        } catch (e) {
            console.error('❌ فشل النسخ:', e);
            return false;
        }
    };

    // نسخ احتياطي كل 6 ساعات
    setInterval(function() {
        if (window.currentUser) {
            autoBackup();
        }
    }, 6 * 60 * 60 * 1000);

    // نسخ عند الخروج
    window.addEventListener('beforeunload', function() {
        if (window.currentUser) {
            autoBackup();
        }
    });

    window.showBackupStatus = function() {
        const lastBackup = getData('last_backup', null);
        if (lastBackup) {
            const date = new Date(lastBackup.date).toLocaleString('ar-EG');
            if (typeof showToast === 'function') {
                showToast('💾 آخر نسخة: ' + date + ' (' + lastBackup.size + ')', 'info');
            }
        } else {
            if (typeof showToast === 'function') {
                showToast('ℹ️ لا توجد نسخة احتياطية بعد', 'info');
            }
        }
    };

    console.log('✅ النسخ الاحتياطي: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 11. 📱 اختصارات لوحة المفاتيح
// ═══════════════════════════════════════════════════════════
(function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // تجاهل لو الكتابة في input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            // Esc فقط يعمل
            if (e.key === 'Escape') {
                if (typeof closeModal === 'function') closeModal();
            }
            return;
        }
        
        // Ctrl + 1-9 للتنقل
        if (e.ctrlKey && !e.shiftKey && !e.altKey) {
            const key = e.key;
            if (key === '1') { e.preventDefault(); if (typeof navigateTo === 'function') navigateTo('dashboard'); }
            if (key === '2') { e.preventDefault(); if (typeof navigateTo === 'function') navigateTo('inventory'); }
            if (key === '3') { e.preventDefault(); if (typeof navigateTo === 'function') navigateTo('cashier'); }
            if (key === '4') { e.preventDefault(); if (typeof navigateTo === 'function') navigateTo('purchases'); }
            if (key === '5') { e.preventDefault(); if (typeof navigateTo === 'function') navigateTo('customers'); }
            if (key === '6') { e.preventDefault(); if (typeof navigateTo === 'function') navigateTo('suppliers'); }
            if (key === '7') { e.preventDefault(); if (typeof navigateTo === 'function') navigateTo('invoices'); }
            if (key === '8') { e.preventDefault(); if (typeof navigateTo === 'function') navigateTo('reports'); }
            if (key === '9') { e.preventDefault(); if (typeof navigateTo === 'function') navigateTo('settings'); }
            
            // Ctrl + S = حفظ فاتورة
            if (key === 's' || key === 'S') {
                e.preventDefault();
                const cashier = document.getElementById('page-cashier');
                if (cashier && cashier.classList.contains('active')) {
                    if (typeof saveSale === 'function') saveSale();
                }
            }
        }
        
        // F1 = مساعدة
        if (e.key === 'F1') {
            e.preventDefault();
            showKeyboardShortcuts();
        }
    });

    window.showKeyboardShortcuts = function() {
        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>⌨️ اختصارات لوحة المفاتيح</h3>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:14px;">' +
                '<div style="margin-bottom:8px;"><strong style="color:#C9A94E;">Ctrl + 1</strong> → لوحة التحكم</div>' +
                '<div style="margin-bottom:8px;"><strong style="color:#C9A94E;">Ctrl + 2</strong> → المخزون</div>' +
                '<div style="margin-bottom:8px;"><strong style="color:#C9A94E;">Ctrl + 3</strong> → الكاشير</div>' +
                '<div style="margin-bottom:8px;"><strong style="color:#C9A94E;">Ctrl + 4</strong> → المشتريات</div>' +
                '<div style="margin-bottom:8px;"><strong style="color:#C9A94E;">Ctrl + 5</strong> → العملاء</div>' +
                '<div style="margin-bottom:8px;"><strong style="color:#C9A94E;">Ctrl + 6</strong> → الموردين</div>' +
                '<div style="margin-bottom:8px;"><strong style="color:#C9A94E;">Ctrl + 7</strong> → الفواتير</div>' +
                '<div style="margin-bottom:8px;"><strong style="color:#C9A94E;">Ctrl + 8</strong> → التقارير</div>' +
                '<div style="margin-bottom:8px;"><strong style="color:#C9A94E;">Ctrl + 9</strong> → الإعدادات</div>' +
                '<div style="margin-bottom:8px;"><strong style="color:#C9A94E;">Ctrl + S</strong> → حفظ الفاتورة</div>' +
                '<div style="margin-bottom:8px;"><strong style="color:#C9A94E;">F1</strong> → هذه القائمة</div>' +
                '<div><strong style="color:#C9A94E;">Esc</strong> → إغلاق النوافذ</div>' +
            '</div>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
        
        if (typeof openModal === 'function') openModal(html);
    };

    console.log('✅ اختصارات لوحة المفاتيح: جاهزة');
})();

// ═══════════════════════════════════════════════════════════
// 12. 💰 اقتراح الأسعار الذكي
// ═══════════════════════════════════════════════════════════
(function initSmartPricing() {
    window.suggestPrice = function(productId) {
        if (typeof products === 'undefined') return null;
        const product = products.find(function(p) { return p.id == productId; });
        if (!product) return null;

        // حساب متوسط سعر البيع
        let totalSold = 0;
        let totalRevenue = 0;
        sales.forEach(function(s) {
            (s.items || []).forEach(function(it) {
                if (it.productId == productId) {
                    totalSold += it.qty;
                    totalRevenue += it.total;
                }
            });
        });

        const avgPrice = totalSold > 0 ? totalRevenue / totalSold : product.sell;
        const costMargin = (product.sell - product.buy) / product.buy * 100;
        
        // اقتراح بناءً على هامش الربح
        let suggestedPrice = product.sell;
        if (costMargin < 20) {
            suggestedPrice = product.buy * 1.3; // هامش 30%
        } else if (costMargin > 100) {
            suggestedPrice = product.buy * 1.8; // هامش 80%
        } else {
            suggestedPrice = product.buy * 1.5; // هامش 50%
        }

        return {
            current: product.sell,
            suggested: Math.round(suggestedPrice * 100) / 100,
            avgSold: Math.round(avgPrice * 100) / 100,
            margin: Math.round(costMargin),
            soldQty: totalSold
        };
    };

    window.showPriceSuggestion = function(productId) {
        const info = suggestPrice(productId);
        if (!info) return;

        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>💰 اقتراح السعر</h3>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:14px;">' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2D2D2D;">' +
                    '<span style="color:#A89070;">السعر الحالي:</span>' +
                    '<strong style="color:#C9A94E;">' + info.current.toFixed(2) + ' ج.م</strong>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2D2D2D;">' +
                    '<span style="color:#A89070;">متوسط البيع:</span>' +
                    '<strong style="color:#4A8AB5;">' + info.avgSold.toFixed(2) + ' ج.م</strong>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2D2D2D;">' +
                    '<span style="color:#A89070;">هامش الربح:</span>' +
                    '<strong style="color:' + (info.margin > 30 ? '#2D8F5E' : '#E6A830') + ';">' + info.margin + '%</strong>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2D2D2D;">' +
                    '<span style="color:#A89070;">الكمية المباعة:</span>' +
                    '<strong style="color:#C9A94E;">' + info.soldQty + '</strong>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;margin-top:8px;border-top:2px solid #C9A94E;">' +
                    '<span style="color:#C9A94E;font-weight:900;">💰 السعر المقترح:</span>' +
                    '<strong style="color:#2D8F5E;font-size:18px;">' + info.suggested.toFixed(2) + ' ج.م</strong>' +
                '</div>' +
            '</div>' +
            '<button class="btn btn-success btn-block" onclick="applyPrice(' + productId + ', ' + info.suggested + ')" style="margin-top:12px;">' +
                '<i class="fas fa-check"></i> تطبيق السعر المقترح' +
            '</button>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:6px;">إلغاء</button>';
        
        if (typeof openModal === 'function') openModal(html);
    };

    window.applyPrice = function(productId, newPrice) {
        const product = products.find(function(p) { return p.id == productId; });
        if (!product) return;
        
        product.sell = newPrice;
        if (typeof setData === 'function') setData('products', products);
        if (typeof renderProducts === 'function') renderProducts();
        if (typeof closeModal === 'function') closeModal();
        if (typeof showToast === 'function') showToast('✅ تم تحديث السعر إلى ' + newPrice.toFixed(2) + ' ج.م', 'success');
    };

    console.log('✅ اقتراح الأسعار: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 13. 📞 قائمة عملاء VIP
// ═══════════════════════════════════════════════════════════
(function initVIPCustomers() {
    window.getVIPCustomers = function() {
        if (typeof sales === 'undefined' || typeof customers === 'undefined') return [];
        
        const customerStats = {};
        sales.forEach(function(s) {
            if (!s.customer || s.customer === 'عميل نقدي') return;
            if (!customerStats[s.customer]) {
                customerStats[s.customer] = { name: s.customer, total: 0, count: 0 };
            }
            customerStats[s.customer].total += s.total || 0;
            customerStats[s.customer].count++;
        });

        const list = Object.values(customerStats).sort(function(a, b) { return b.total - a.total; });
        const topCount = Math.max(1, Math.ceil(list.length * 0.2)); // أفضل 20%
        
        return list.slice(0, topCount);
    };

    window.showVIPCustomers = function() {
        const vips = getVIPCustomers();
        
        let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>⭐ عملاء VIP</h3>';
        
        if (vips.length === 0) {
            html += '<div class="empty-state"><i class="fas fa-star"></i><span>لا توجد بيانات كافية</span></div>';
        } else {
            html += '<p style="color:#A89070;font-size:11px;text-align:center;margin-bottom:12px;">أفضل 20% من العملاء</p>';
            html += '<div style="max-height:400px;overflow-y:auto;">';
            vips.forEach(function(v, i) {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐';
                html += '<div style="background:#0D0D0D;border-radius:10px;padding:12px;margin-bottom:8px;border-right:4px solid #C9A94E;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                        '<strong style="color:#C9A94E;font-size:14px;">' + medal + ' ' + v.name + '</strong>' +
                        '<span style="color:#2D8F5E;font-weight:900;">' + v.total.toFixed(2) + ' ج.م</span>' +
                    '</div>' +
                    '<div style="font-size:11px;color:#A89070;margin-top:4px;">' +
                        '🧾 ' + v.count + ' فاتورة • متوسط ' + (v.total / v.count).toFixed(2) + ' ج.م' +
                    '</div>' +
                '</div>';
            });
            html += '</div>';
        }
        
        html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
        
        if (typeof openModal === 'function') openModal(html);
    };

    console.log('✅ عملاء VIP: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 14. 🎨 قوالب فواتير (3 أنماط)
// ═══════════════════════════════════════════════════════════
(function initInvoiceTemplates() {
    window.invoiceTemplate = localStorage.getItem('mizan_invoice_template') || 'classic';

    window.setInvoiceTemplate = function(template) {
        window.invoiceTemplate = template;
        localStorage.setItem('mizan_invoice_template', template);
        if (typeof showToast === 'function') {
            const names = { 'classic': 'الكلاسيكي', 'modern': 'الحديث', 'minimal': 'البسيط' };
            showToast('🎨 تم تغيير القالب إلى: ' + names[template], 'success');
        }
    };

    window.getInvoiceTemplateStyles = function() {
        if (window.invoiceTemplate === 'modern') {
            return {
                headerColor: 'linear-gradient(135deg, #C9A94E, #B8953A)',
                headerTextColor: '#0D0D0D',
                borderStyle: '3px solid #C9A94E',
                fontFamily: 'Tajawal, sans-serif',
                titleSize: '26px'
            };
        }
        if (window.invoiceTemplate === 'minimal') {
            return {
                headerColor: '#FFFFFF',
                headerTextColor: '#000000',
                borderStyle: '1px solid #000',
                fontFamily: 'Arial, sans-serif',
                titleSize: '20px'
            };
        }
        return {
            headerColor: '#000000',
            headerTextColor: '#FFFFFF',
            borderStyle: '2px dashed #000',
            fontFamily: 'Arial, sans-serif',
            titleSize: '24px'
        };
    };

    // زر تبديل القالب في الإعدادات
    function addTemplateSelector() {
        const settingsPage = document.getElementById('page-settings');
        if (!settingsPage || document.getElementById('invoiceTemplateSection')) return;
        
        const section = document.createElement('div');
        section.id = 'invoiceTemplateSection';
        section.className = 'settings-section';
        section.innerHTML = '<h3><i class="fas fa-palette"></i> قالب الفاتورة</h3>' +
            '<p style="font-size:11px;color:#A89070;margin-bottom:12px;">اختر النمط المناسب لفواتيرك</p>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">' +
                '<button class="btn ' + (invoiceTemplate === 'classic' ? 'btn-primary' : 'btn-secondary') + '" onclick="setInvoiceTemplate(\'classic\'); updateTemplateButtons()">🎨 كلاسيكي</button>' +
                '<button class="btn ' + (invoiceTemplate === 'modern' ? 'btn-primary' : 'btn-secondary') + '" onclick="setInvoiceTemplate(\'modern\'); updateTemplateButtons()">✨ حديث</button>' +
                '<button class="btn ' + (invoiceTemplate === 'minimal' ? 'btn-primary' : 'btn-secondary') + '" onclick="setInvoiceTemplate(\'minimal\'); updateTemplateButtons()">📄 بسيط</button>' +
            '</div>';
        
        const backupSection = settingsPage.querySelector('.settings-section');
        if (backupSection) {
            backupSection.parentNode.insertBefore(section, backupSection);
        }
    }

    window.updateTemplateButtons = function() {
        const buttons = document.querySelectorAll('#invoiceTemplateSection button');
        buttons.forEach(function(btn) {
            btn.className = 'btn btn-secondary';
        });
        const activeIdx = invoiceTemplate === 'classic' ? 0 : invoiceTemplate === 'modern' ? 1 : 2;
        if (buttons[activeIdx]) buttons[activeIdx].className = 'btn btn-primary';
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addTemplateSelector, 2500);
        });
    } else {
        setTimeout(addTemplateSelector, 2500);
    }

    console.log('✅ قوالب الفواتير: جاهزة');
})();

// ═══════════════════════════════════════════════════════════
// 15. 📋 تصدير Excel (CSV)
// ═══════════════════════════════════════════════════════════
(function initExcelExport() {
    window.exportToExcel = function(type) {
        let csv = '\uFEFF'; // BOM للعربية
        let filename = 'mizan_' + type + '_' + new Date().toISOString().split('T')[0] + '.csv';
        
        if (type === 'products' && typeof products !== 'undefined') {
            csv += 'المنتج,الباركود,سعر الشراء,سعر البيع,الكمية,الحد الأدنى\n';
            products.forEach(function(p) {
                csv += '"' + (p.name || '') + '","' + (p.barcode || '') + '",' + p.buy + ',' + p.sell + ',' + p.qty + ',' + (p.min || 5) + '\n';
            });
        } else if (type === 'customers' && typeof customers !== 'undefined') {
            csv += 'الاسم,الهاتف,واتساب,العنوان,المديونية\n';
            customers.forEach(function(c) {
                const debt = typeof getCustomerBalance === 'function' ? getCustomerBalance(c.name) : 0;
                csv += '"' + c.name + '","' + (c.phone || '') + '","' + (c.whatsapp || '') + '","' + (c.address || '') + '",' + debt.toFixed(2) + '\n';
            });
        } else if (type === 'invoices' && typeof sales !== 'undefined') {
            csv += '#,العميل,التاريخ,المجموع,الضريبة,الإجمالي,المدفوع,المتبقي,الحالة\n';
            sales.forEach(function(inv) {
                csv += inv.number + ',"' + (inv.customer || '') + '","' + inv.date + '",' + (inv.subtotal || 0).toFixed(2) + ',' + (inv.vat || 0).toFixed(2) + ',' + inv.total.toFixed(2) + ',' + (inv.paidAmount || 0).toFixed(2) + ',' + (inv.remainingAmount || 0).toFixed(2) + ',"' + inv.status + '"\n';
            });
        } else {
            if (typeof showToast === 'function') showToast('⚠️ لا توجد بيانات', 'warning');
            return;
        }
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        
        if (typeof showToast === 'function') showToast('✅ تم تصدير ' + filename, 'success');
    };

    console.log('✅ تصدير Excel: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 🎯 قائمة "المزيد" - إضافة كل الميزات الجديدة
// ═══════════════════════════════════════════════════════════
(function addExtrasToMenu() {
    function addMenuItems() {
        const moreMenu = document.getElementById('moreMenu');
        if (!moreMenu || moreMenu.querySelector('.extras-added')) return;
        
        const grid = moreMenu.querySelector('div[style*="grid"]');
        if (!grid) return;
        
        grid.classList.add('extras-added');
        
        const items = [
            { icon: '📅', color: '#4A8AB5', label: 'الحجوزات', action: 'showReservationsManager()' },
            { icon: '⭐', color: '#C9A94E', label: 'عملاء VIP', action: 'showVIPCustomers()' },
            { icon: '⌨️', color: '#9B59B6', label: 'اختصارات', action: 'showKeyboardShortcuts()' },
            { icon: '💾', color: '#2D8F5E', label: 'النسخ الاحتياطي', action: 'showBackupStatus()' }
        ];
        
        items.forEach(function(item) {
            const btn = document.createElement('button');
            btn.className = 'more-item';
            btn.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;background:#0D0D0D;border:2px solid #2D2D2D;color:#F5E6C8;padding:12px 6px;border-radius:10px;font-family:inherit;font-size:12px;cursor:pointer;';
            btn.innerHTML = '<i class="fas ' + (item.icon === '📅' ? 'fa-calendar' : item.icon === '⭐' ? 'fa-star' : item.icon === '⌨️' ? 'fa-keyboard' : 'fa-database') + '" style="color:' + item.color + ';font-size:20px;"></i> ' + item.label;
            btn.onclick = function() {
                if (typeof toggleMoreMenu === 'function') toggleMoreMenu();
                eval(item.action);
            };
            grid.appendChild(btn);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addMenuItems, 3000);
        });
    } else {
        setTimeout(addMenuItems, 3000);
    }
})();

// ═══════════════════════════════════════════════════════════
// 🎉 تم تحميل كل الميزات بنجاح
// ═══════════════════════════════════════════════════════════
console.log('');
console.log('════════════════════════════════════════════════');
console.log('🎉 تم تحميل app-extras.js بنجاح!');
console.log('════════════════════════════════════════════════');
console.log('✅ 1. PWA (تطبيق موبايل)');
console.log('✅ 2. الوضع الفاتح');
console.log('✅ 3. شعار الشركة');
console.log('✅ 4. نظام نقاط العملاء');
console.log('✅ 5. نظام الحجوزات');
console.log('✅ 6. رفع صور المنتجات');
console.log('✅ 7. رسوم بيانية متقدمة');
console.log('✅ 8. إشعارات فورية');
console.log('✅ 9. ترجمة AR/EN');
console.log('✅ 10. نسخ احتياطي تلقائي');
console.log('✅ 11. اختصارات لوحة المفاتيح');
console.log('✅ 12. اقتراح الأسعار الذكي');
console.log('✅ 13. عملاء VIP');
console.log('✅ 14. قوالب الفواتير');
console.log('✅ 15. تصدير Excel');
console.log('════════════════════════════════════════════════');
console.log('📖 استخدم: showKeyboardShortcuts() لعرض الاختصارات');
console.log('════════════════════════════════════════════════');
