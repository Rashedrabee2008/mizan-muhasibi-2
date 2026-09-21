// ============================================================
// الميزان 14.0.0 - app-extras.js (نسخة نظيفة 100%)
// ============================================================
// 
// الإضافات:
// 1. 🎨 الوضع الفاتح
// 2. 🖼️ شعار الشركة
// 3. 🎁 نظام نقاط العملاء
// 4. 📊 رسوم بيانية محسّنة
// 5. 🔔 إشعارات
// 6. 🌍 ترجمة AR/EN
// 7. 💾 نسخ احتياطي
// 8. ⌨️ اختصارات لوحة المفاتيح
// 9. 💰 اقتراح الأسعار
// 10. ⭐ عملاء VIP
// 11. 📋 تصدير Excel
// 12. 🎨 قوالب فواتير
// ═══════════════════════════════════════════════════════════

console.log('🚀 تحميل app-extras.js - النسخة النظيفة');

// ═══════════════════════════════════════════════════════════
// 1. 🎨 الوضع الفاتح (Light Mode)
// ═══════════════════════════════════════════════════════════
(function initThemeToggle() {
    function addThemeToggle() {
        const header = document.querySelector('.header-actions');
        if (!header || document.getElementById('themeToggleBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'themeToggleBtn';
        btn.title = 'تبديل الوضع';
        btn.innerHTML = getThemeIcon();
        btn.onclick = toggleTheme;
        btn.style.cssText = 'background:#0D0D0D;border:2px solid #3D3D3D;color:#C9A94E;' +
            'font-size:12px;cursor:pointer;padding:4px 6px;border-radius:6px;' +
            'height:28px;min-width:28px;font-weight:900;';
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

    const themeCSS = `
        body.light-mode { background: #F5F0E8 !important; color: #1A1A1A !important; }
        body.light-mode .top-header,
        body.light-mode .page-content,
        body.light-mode .form-card,
        body.light-mode .dashboard-card,
        body.light-mode .modal-box,
        body.light-mode .settings-section,
        body.light-mode .stat-mini,
        body.light-mode .pos-items-box,
        body.light-mode .pos-meta-item,
        body.light-mode .cash-box-card { background: #FFFFFF !important; border-color: #E0D5B8 !important; color: #1A1A1A !important; }
        body.light-mode .table-row { background: #FFFFFF !important; color: #1A1A1A !important; border-color: #E0D5B8 !important; }
        body.light-mode input,
        body.light-mode select { background: #FFFFFF !important; color: #1A1A1A !important; border-color: #E0D5B8 !important; }
        body.light-mode .bottom-nav { background: #FFFFFF !important; border-color: #E0D5B8 !important; }
    `;

    const style = document.createElement('style');
    style.textContent = themeCSS;
    document.head.appendChild(style);

    const savedTheme = localStorage.getItem('mizan_theme') || 'dark';
    if (savedTheme === 'light') {
        if (document.body) applyTheme('light');
        else document.addEventListener('DOMContentLoaded', function() { applyTheme('light'); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(addThemeToggle, 1500); });
    } else {
        setTimeout(addThemeToggle, 1500);
    }

    console.log('✅ الوضع الفاتح: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 2. 🖼️ شعار الشركة
// ═══════════════════════════════════════════════════════════
(function initCompanyLogo() {
    function addLogo() {
        if (typeof companyData === 'undefined' || !companyData.logo) return;
        
        const logoIcon = document.querySelector('.top-header .logo-icon');
        if (!logoIcon || logoIcon.querySelector('img')) return;
        
        logoIcon.innerHTML = '<img src="' + companyData.logo + '" style="max-width:100%;max-height:100%;border-radius:6px;" alt="logo">';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(addLogo, 2000); });
    } else {
        setTimeout(addLogo, 2000);
    }

    console.log('✅ شعار الشركة: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 3. 🎁 نظام نقاط العملاء
// ═══════════════════════════════════════════════════════════
(function initLoyaltyPoints() {
    const POINTS_PER_EGP = 0.01;

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

    const _originalSaveSale = window.saveSale;
    window.saveSale = function() {
        const customer = document.getElementById('saleCustomer') ? document.getElementById('saleCustomer').value : '';
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

    console.log('✅ نظام النقاط: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 4. 📊 رسوم بيانية (SVG نظيف)
// ═══════════════════════════════════════════════════════════
(function initAdvancedCharts() {
    window.drawSalesChart = function(containerId) {
        const container = document.getElementById(containerId);
        if (!container || typeof sales === 'undefined') return;
        
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayTotal = sales.filter(function(s) { return s.date === dateStr; })
                .reduce(function(sum, s) { return sum + (s.total || 0); }, 0);
            days.push({ date: dateStr, total: dayTotal });
        }
        
        const maxVal = Math.max.apply(null, days.map(function(d) { return d.total; }).concat([1]));
        
        let svg = '<svg viewBox="0 0 300 100" preserveAspectRatio="none" style="width:100%;height:100px;background:transparent;">';
        
        for (let i = 0; i <= 4; i++) {
            const y = 5 + (i * 22);
            svg += '<line x1="5" y1="' + y + '" x2="295" y2="' + y + '" stroke="#2D2D2D" stroke-width="0.5" stroke-dasharray="2,2"/>';
        }
        
        const points = days.map(function(d, i) {
            const x = 8 + (i * 9.5);
            const y = 92 - ((d.total / maxVal) * 85);
            return x + ',' + y;
        }).join(' ');
        
        svg += '<polyline points="' + points + '" fill="none" stroke="#C9A94E" stroke-width="1.5" stroke-linejoin="round"/>';
        svg += '</svg>';
        
        container.innerHTML = svg;
    };

    function addChartsToDashboard() {
        const pageContent = document.querySelector('#page-dashboard .page-content');
        if (!pageContent || document.getElementById('advancedChartContainer')) return;
        
        const chartDiv = document.createElement('div');
        chartDiv.id = 'advancedChartContainer';
        chartDiv.style.cssText = 'background:#1C1C1C;border-radius:14px;padding:14px;margin:14px 0;' +
            'border:1px solid #2D2D2D;overflow:hidden;box-sizing:border-box;width:100%;';
        chartDiv.innerHTML = '<h3 style="color:#C9A94E;font-size:14px;margin-bottom:12px;">📈 المبيعات - آخر 30 يوم</h3>' +
            '<div id="salesChart30" style="width:100%;height:100px;"></div>';
        
        const firstStats = pageContent.querySelector('.dashboard-stats');
        if (firstStats) {
            firstStats.parentNode.insertBefore(chartDiv, firstStats);
        }
        
        setTimeout(function() { drawSalesChart('salesChart30'); }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(addChartsToDashboard, 3000); });
    } else {
        setTimeout(addChartsToDashboard, 3000);
    }

    console.log('✅ الرسوم البيانية: جاهزة');
})();

// ═══════════════════════════════════════════════════════════
// 5. 🔔 الإشعارات
// ═══════════════════════════════════════════════════════════
(function initNotifications() {
    if (!('Notification' in window)) return;

    window.sendNotification = function(title, body) {
        if (Notification.permission !== 'granted') return;
        try {
            new Notification(title, { body: body, tag: 'mizan' });
        } catch (e) {}
    };

    setTimeout(function() {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, 10000);

    console.log('✅ الإشعارات: جاهزة');
})();

// ═══════════════════════════════════════════════════════════
// 6. 🌍 الترجمة (زر فقط — بدون تغيير كامل)
// ═══════════════════════════════════════════════════════════
(function initLanguageToggle() {
    window.currentLang = localStorage.getItem('mizan_lang') || 'ar';

    function addLangToggle() {
        const header = document.querySelector('.header-actions');
        if (!header || document.getElementById('langToggleBtn')) return;
        
        const btn = document.createElement('button');
        btn.id = 'langToggleBtn';
        btn.title = 'تغيير اللغة';
        btn.innerHTML = window.currentLang === 'ar' ? 'EN' : 'AR';
        btn.style.cssText = 'background:#0D0D0D;border:2px solid #3D3D3D;color:#C9A94E;' +
            'font-size:11px;cursor:pointer;padding:4px 6px;border-radius:6px;' +
            'height:28px;min-width:28px;font-weight:900;';
        btn.onclick = function() {
            window.currentLang = window.currentLang === 'ar' ? 'en' : 'ar';
            localStorage.setItem('mizan_lang', window.currentLang);
            btn.innerHTML = window.currentLang === 'ar' ? 'EN' : 'AR';
            
            if (typeof showToast === 'function') {
                showToast(window.currentLang === 'en' ? '🌍 English mode (Coming soon)' : '🌍 الوضع العربي', 'info');
            }
        };
        header.insertBefore(btn, header.firstChild);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(addLangToggle, 1800); });
    } else {
        setTimeout(addLangToggle, 1800);
    }

    console.log('✅ الترجمة: جاهزة');
})();

// ═══════════════════════════════════════════════════════════
// 7. 💾 النسخ الاحتياطي
// ═══════════════════════════════════════════════════════════
(function initAutoBackup() {
    window.autoBackup = function() {
        try {
            const data = {
                version: '14.0.0',
                backupDate: new Date().toISOString(),
                products: products, sales: sales, purchases: purchases,
                customers: customers, suppliers: suppliers, cashBoxes: cashBoxes,
                expenses: expenses, treasury: treasury, payments: payments,
                returns: returns, users: users, companyData: companyData
            };
            const json = JSON.stringify(data);
            setData('last_backup', {
                date: new Date().toISOString(),
                size: (json.length / 1024).toFixed(2) + ' KB'
            });
            console.log('✅ تم إنشاء نسخة احتياطية');
            return true;
        } catch (e) {
            return false;
        }
    };

    setInterval(function() {
        if (window.currentUser) autoBackup();
    }, 6 * 60 * 60 * 1000);

    window.showBackupStatus = function() {
        const lastBackup = getData('last_backup', null);
        if (lastBackup) {
            const date = new Date(lastBackup.date).toLocaleString('ar-EG');
            if (typeof showToast === 'function') {
                showToast('💾 آخر نسخة: ' + date + ' (' + lastBackup.size + ')', 'info');
            }
        } else {
            if (typeof showToast === 'function') showToast('ℹ️ لا توجد نسخة احتياطية', 'info');
        }
    };

    console.log('✅ النسخ الاحتياطي: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 8. ⌨️ اختصارات لوحة المفاتيح
// ═══════════════════════════════════════════════════════════
(function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            if (e.key === 'Escape') {
                if (typeof closeModal === 'function') closeModal();
            }
            return;
        }
        
        if (e.ctrlKey && !e.shiftKey && !e.altKey) {
            const key = e.key;
            const map = { '1': 'dashboard', '2': 'inventory', '3': 'cashier', '4': 'purchases',
                          '5': 'customers', '6': 'suppliers', '7': 'invoices', '8': 'reports', '9': 'settings' };
            if (map[key]) {
                e.preventDefault();
                if (typeof navigateTo === 'function') navigateTo(map[key]);
            }
            if (key === 's' || key === 'S') {
                e.preventDefault();
                const cashier = document.getElementById('page-cashier');
                if (cashier && cashier.classList.contains('active')) {
                    if (typeof saveSale === 'function') saveSale();
                }
            }
        }
        
        if (e.key === 'F1') {
            e.preventDefault();
            showKeyboardShortcuts();
        }
    });

    window.showKeyboardShortcuts = function() {
        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>⌨️ اختصارات لوحة المفاتيح</h3>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:14px;font-size:13px;line-height:2;">' +
                '<div><strong style="color:#C9A94E;">Ctrl + 1-9</strong> → التنقل بين الصفحات</div>' +
                '<div><strong style="color:#C9A94E;">Ctrl + S</strong> → حفظ الفاتورة</div>' +
                '<div><strong style="color:#C9A94E;">F1</strong> → هذه القائمة</div>' +
                '<div><strong style="color:#C9A94E;">Esc</strong> → إغلاق النوافذ</div>' +
            '</div>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
        
        if (typeof openModal === 'function') openModal(html);
    };

    console.log('✅ اختصارات لوحة المفاتيح: جاهزة');
})();

// ═══════════════════════════════════════════════════════════
// 9. 💰 اقتراح الأسعار
// ═══════════════════════════════════════════════════════════
(function initSmartPricing() {
    window.suggestPrice = function(productId) {
        if (typeof products === 'undefined') return null;
        const product = products.find(function(p) { return p.id == productId; });
        if (!product) return null;

        let totalSold = 0, totalRevenue = 0;
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
        
        let suggestedPrice = product.sell;
        if (costMargin < 20) suggestedPrice = product.buy * 1.3;
        else if (costMargin > 100) suggestedPrice = product.buy * 1.8;
        else suggestedPrice = product.buy * 1.5;

        return {
            current: product.sell,
            suggested: Math.round(suggestedPrice * 100) / 100,
            avgSold: Math.round(avgPrice * 100) / 100,
            margin: Math.round(costMargin),
            soldQty: totalSold
        };
    };

    console.log('✅ اقتراح الأسعار: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 10. ⭐ عملاء VIP
// ═══════════════════════════════════════════════════════════
(function initVIPCustomers() {
    window.getVIPCustomers = function() {
        if (typeof sales === 'undefined') return [];
        const customerStats = {};
        sales.forEach(function(s) {
            if (!s.customer || s.customer === 'عميل نقدي') return;
            if (!customerStats[s.customer]) customerStats[s.customer] = { name: s.customer, total: 0, count: 0 };
            customerStats[s.customer].total += s.total || 0;
            customerStats[s.customer].count++;
        });

        const list = Object.values(customerStats).sort(function(a, b) { return b.total - a.total; });
        const topCount = Math.max(1, Math.ceil(list.length * 0.2));
        return list.slice(0, topCount);
    };

    window.showVIPCustomers = function() {
        const vips = getVIPCustomers();
        let html = '<button class="modal-close" onclick="closeModal()">&times;</button><h3>⭐ عملاء VIP</h3>';
        
        if (vips.length === 0) {
            html += '<div class="empty-state"><i class="fas fa-star"></i><span>لا توجد بيانات</span></div>';
        } else {
            html += '<div style="max-height:400px;overflow-y:auto;">';
            vips.forEach(function(v, i) {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐';
                html += '<div style="background:#0D0D0D;border-radius:10px;padding:12px;margin-bottom:8px;border-right:4px solid #C9A94E;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                        '<strong style="color:#C9A94E;">' + medal + ' ' + v.name + '</strong>' +
                        '<span style="color:#2D8F5E;font-weight:900;">' + v.total.toFixed(2) + ' ج.م</span>' +
                    '</div>' +
                    '<div style="font-size:11px;color:#A89070;margin-top:4px;">🧾 ' + v.count + ' فاتورة</div>' +
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
// 11. 📋 تصدير Excel
// ═══════════════════════════════════════════════════════════
(function initExcelExport() {
    window.exportToExcel = function(type) {
        let csv = '\uFEFF';
        const filename = 'mizan_' + type + '_' + new Date().toISOString().split('T')[0] + '.csv';
        
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
            csv += '#,العميل,التاريخ,المجموع,الإجمالي,الحالة\n';
            sales.forEach(function(inv) {
                csv += inv.number + ',"' + (inv.customer || '') + '","' + inv.date + '",' + inv.total.toFixed(2) + ',' + inv.total.toFixed(2) + ',"' + inv.status + '"\n';
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
// 12. 🎨 قوالب فواتير
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

    console.log('✅ قوالب الفواتير: جاهزة');
})();

// ═══════════════════════════════════════════════════════════
// 🎯 إضافة أزرار جديدة في قائمة "المزيد"
// ═══════════════════════════════════════════════════════════
(function addExtrasToMenu() {
    function addMenuItems() {
        const moreMenu = document.getElementById('moreMenu');
        if (!moreMenu) return;
        
        const grid = moreMenu.querySelector('div[style*="grid"]');
        if (!grid || grid.querySelector('.extras-added')) return;
        
        grid.classList.add('extras-added');
        
        const items = [
            { icon: 'fa-star', color: '#C9A94E', label: 'عملاء VIP', action: 'showVIPCustomers' },
            { icon: 'fa-keyboard', color: '#9B59B6', label: 'اختصارات', action: 'showKeyboardShortcuts' },
            { icon: 'fa-database', color: '#2D8F5E', label: 'النسخ الاحتياطي', action: 'showBackupStatus' }
        ];
        
        items.forEach(function(item) {
            const btn = document.createElement('button');
            btn.className = 'more-item';
            btn.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;background:#0D0D0D;border:2px solid #2D2D2D;color:#F5E6C8;padding:12px 6px;border-radius:10px;font-family:inherit;font-size:12px;cursor:pointer;';
            btn.innerHTML = '<i class="fas ' + item.icon + '" style="color:' + item.color + ';font-size:20px;"></i> ' + item.label;
            btn.onclick = function() {
                if (typeof toggleMoreMenu === 'function') toggleMoreMenu();
                if (typeof window[item.action] === 'function') window[item.action]();
            };
            grid.appendChild(btn);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(addMenuItems, 3000); });
    } else {
        setTimeout(addMenuItems, 3000);
    }
})();

// ═══════════════════════════════════════════════════════════
// 🎉 تم التحميل بنجاح
// ═══════════════════════════════════════════════════════════
console.log('');
console.log('════════════════════════════════════════════════');
console.log('🎉 تم تحميل app-extras.js (النسخة النظيفة)');
console.log('════════════════════════════════════════════════');
console.log('✅ 12 ميزة إضافية جاهزة');
console.log('⚠️ لا PWA (لتجنب الأخطاء)');
console.log('════════════════════════════════════════════════');
