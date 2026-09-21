// ============================================================
// الميزان 14.0.0 - app-extras-v2.js
// الحزمة الأولى: 5 ميزات إضافية
// ============================================================
// 
// الميزات:
// 1. 📸 مسح الباركود بالكاميرا
// 2. 🔔 تنبيهات ذكية
// 3. 🎯 أهداف المبيعات
// 4. 🌙 وضع الليل التلقائي
// 5. 🎁 قسائم الخصم
// ═══════════════════════════════════════════════════════════

console.log('🚀 تحميل app-extras-v2.js - الحزمة الأولى');
console.log('📋 5 ميزات جديدة...');

// ═══════════════════════════════════════════════════════════
// 1. 📸 مسح الباركود بالكاميرا
// ═══════════════════════════════════════════════════════════
(function initBarcodeScanner() {
    // إضافة مكتبة QuaggaJS لقراءة الباركود
    function loadQuagga(callback) {
        if (window.Quagga) { callback(); return; }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js';
        script.onload = callback;
        script.onerror = function() { console.log('⚠️ فشل تحميل Quagga'); };
        document.head.appendChild(script);
    }

    window.openBarcodeScanner = function() {
        loadQuagga(function() {
            if (!window.Quagga) {
                if (typeof showToast === 'function') showToast('⚠️ لم يتم تحميل ماسح الباركود', 'error');
                return;
            }

            const html = '<button class="modal-close" onclick="closeBarcodeScanner()">&times;</button>' +
                '<h3>📸 مسح الباركود</h3>' +
                '<div style="background:#000;border-radius:10px;overflow:hidden;margin-bottom:12px;position:relative;">' +
                    '<div id="barcodeReader" style="width:100%;height:300px;background:#000;"></div>' +
                    '<div style="position:absolute;top:50%;left:10%;right:10%;height:2px;background:#E06060;box-shadow:0 0 10px #E06060;transform:translateY(-50%);"></div>' +
                '</div>' +
                '<div style="text-align:center;color:#A89070;font-size:12px;margin-bottom:12px;">' +
                    '💡 وجّه الكاميرا نحو الباركود' +
                '</div>' +
                '<div id="barcodeResult" style="background:#0D0D0D;border-radius:8px;padding:12px;text-align:center;font-weight:900;color:#C9A94E;min-height:40px;display:flex;align-items:center;justify-content:center;">' +
                    '⏳ جاري البحث...' +
                '</div>' +
                '<button class="btn btn-secondary btn-block" onclick="closeBarcodeScanner()" style="margin-top:12px;">إلغاء</button>';

            if (typeof openModal === 'function') openModal(html);

            setTimeout(function() {
                const reader = document.getElementById('barcodeReader');
                if (!reader) return;

                Quagga.init({
                    inputStream: {
                        name: 'Live',
                        type: 'LiveStream',
                        target: reader,
                        constraints: {
                            facingMode: 'environment',
                            width: { min: 640 },
                            height: { min: 480 }
                        }
                    },
                    decoder: {
                        readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'code_39_reader', 'upc_reader', 'upc_e_reader']
                    },
                    locate: true
                }, function(err) {
                    if (err) {
                        console.log('⚠️ فشل تشغيل الكاميرا:', err);
                        const result = document.getElementById('barcodeResult');
                        if (result) {
                            result.innerHTML = '⚠️ يرجى السماح بالوصول للكاميرا';
                            result.style.color = '#E06060';
                        }
                        return;
                    }
                    console.log('✅ الكاميرا جاهزة');
                    Quagga.start();
                });

                Quagga.onDetected(function(result) {
                    const code = result.codeResult.code;
                    console.log('📸 تم قراءة الباركود:', code);
                    
                    const resultEl = document.getElementById('barcodeResult');
                    if (resultEl) {
                        resultEl.innerHTML = '✅ ' + code;
                        resultEl.style.color = '#2D8F5E';
                    }

                    Quagga.stop();

                    setTimeout(function() {
                        if (typeof closeModal === 'function') closeModal();
                        window.handleBarcodeScanned(code);
                    }, 500);
                });
            }, 300);
        });
    };

    window.closeBarcodeScanner = function() {
        if (window.Quagga && Quagga.stop) {
            try { Quagga.stop(); } catch(e) {}
        }
        if (typeof closeModal === 'function') closeModal();
    };

    window.handleBarcodeScanned = function(code) {
        // البحث عن المنتج بالباركود
        if (typeof products === 'undefined') return;
        
        const product = products.find(function(p) {
            return p.barcode === code || String(p.id) === code;
        });

        if (product) {
            // إضافة للمنتج للفاتورة
            const productSelect = document.getElementById('saleProduct');
            if (productSelect) {
                productSelect.value = product.id;
                if (typeof updateSalePrice === 'function') updateSalePrice();
                if (typeof showToast === 'function') {
                    showToast('✅ ' + product.name + ' - تم إضافته', 'success');
                }
                setTimeout(function() {
                    if (typeof addSaleItem === 'function') addSaleItem();
                }, 200);
            } else {
                if (typeof showToast === 'function') {
                    showToast('✅ وجد المنتج: ' + product.name, 'success');
                }
            }
        } else {
            if (typeof showToast === 'function') {
                showToast('⚠️ لم يوجد منتج بالباركود: ' + code, 'warning');
            }
        }
    };

    // إضافة زر المسح في الكاشير
    function addScanButton() {
        const addItemRow = document.querySelector('.pos-add-item');
        if (!addItemRow || document.getElementById('scanBarcodeBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'scanBarcodeBtn';
        btn.className = 'pos-btn';
        btn.style.cssText = 'background:linear-gradient(135deg,#9B59B6,#7B3A96);color:#fff;border-color:#9B59B6;min-width:44px;padding:10px;';
        btn.innerHTML = '<i class="fas fa-barcode"></i>';
        btn.title = 'مسح الباركود';
        btn.onclick = openBarcodeScanner;
        addItemRow.appendChild(btn);
    }

    // إعادة المحاولة
    let attempts = 0;
    function tryAddScanButton() {
        attempts++;
        addScanButton();
        if (attempts < 15) {
            setTimeout(tryAddScanButton, 1000);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(tryAddScanButton, 2000);
        });
    } else {
        setTimeout(tryAddScanButton, 2000);
    }

    console.log('✅ مسح الباركود: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 2. 🔔 تنبيهات ذكية
// ═══════════════════════════════════════════════════════════
(function initSmartAlerts() {
    window.checkSmartAlerts = function() {
        const alerts = [];

        // 1. منتجات نفدت
        if (typeof products !== 'undefined') {
            const lowStock = products.filter(function(p) { return p.qty <= (p.min || 5) && p.qty > 0; });
            if (lowStock.length > 0) {
                alerts.push({
                    type: 'warning',
                    icon: '⚠️',
                    title: 'منتجات قاربت على النفاد',
                    count: lowStock.length,
                    message: lowStock.slice(0, 3).map(function(p) { return p.name + ' (' + p.qty + ')'; }).join(', ')
                });
            }

            const outOfStock = products.filter(function(p) { return p.qty === 0; });
            if (outOfStock.length > 0) {
                alerts.push({
                    type: 'danger',
                    icon: '🚨',
                    title: 'منتجات نفدت',
                    count: outOfStock.length,
                    message: outOfStock.slice(0, 3).map(function(p) { return p.name; }).join(', ')
                });
            }
        }

        // 2. عملاء متأخرين في السداد
        if (typeof customers !== 'undefined' && typeof sales !== 'undefined') {
            const today = new Date();
            const overdueCustomers = [];
            
            customers.forEach(function(c) {
                const balance = typeof getCustomerBalance === 'function' ? getCustomerBalance(c.name) : 0;
                if (balance > 100) {
                    const oldestUnpaid = sales.filter(function(s) {
                        return s.customer === c.name && 
                               (s.status === 'unpaid' || s.status === 'partial') &&
                               s.paymentMethod === 'credit';
                    }).sort(function(a, b) { return a.id - b.id; })[0];

                    if (oldestUnpaid) {
                        const days = Math.floor((today - new Date(oldestUnpaid.date)) / (1000 * 60 * 60 * 24));
                        if (days > 30) {
                            overdueCustomers.push({ name: c.name, balance: balance, days: days });
                        }
                    }
                }
            });

            if (overdueCustomers.length > 0) {
                alerts.push({
                    type: 'danger',
                    icon: '💳',
                    title: 'عملاء متأخرين في السداد',
                    count: overdueCustomers.length,
                    message: overdueCustomers.slice(0, 3).map(function(c) { 
                        return c.name + ' (' + c.days + ' يوم)'; 
                    }).join(', ')
                });
            }
        }

        // 3. فواتير آجلة قديمة
        if (typeof sales !== 'undefined') {
            const today = new Date();
            const oldCredit = sales.filter(function(s) {
                if (s.paymentMethod !== 'credit') return false;
                if (s.status === 'paid') return false;
                const days = Math.floor((today - new Date(s.date)) / (1000 * 60 * 60 * 24));
                return days > 60;
            });

            if (oldCredit.length > 0) {
                alerts.push({
                    type: 'warning',
                    icon: '📄',
                    title: 'فواتير آجلة قديمة (أكثر من 60 يوم)',
                    count: oldCredit.length,
                    message: 'بحاجة للمتابعة'
                });
            }
        }

        return alerts;
    };

    window.showSmartAlerts = function() {
        const alerts = checkSmartAlerts();

        let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>🔔 التنبيهات الذكية</h3>';

        if (alerts.length === 0) {
            html += '<div class="empty-state">' +
                '<i class="fas fa-check-circle" style="color:#2D8F5E;"></i>' +
                '<span style="color:#2D8F5E;">كل شيء تمام!</span>' +
                '<small>لا توجد تنبيهات حالياً</small>' +
                '</div>';
        } else {
            alerts.forEach(function(alert) {
                const colors = { 'danger': '#E06060', 'warning': '#E6A830', 'info': '#4A8AB5' };
                const color = colors[alert.type] || '#C9A94E';
                
                html += '<div style="background:#0D0D0D;border-radius:10px;padding:14px;margin-bottom:10px;border-right:4px solid ' + color + ';">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                        '<strong style="color:' + color + ';font-size:14px;">' + alert.icon + ' ' + alert.title + '</strong>' +
                        '<span style="background:' + color + ';color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:900;">' + alert.count + '</span>' +
                    '</div>' +
                    '<div style="font-size:12px;color:#A89070;">' + alert.message + '</div>' +
                '</div>';
            });
        }

        html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';

        if (typeof openModal === 'function') openModal(html);
    };

    // فحص التنبيهات دورياً
    function checkPeriodically() {
        if (typeof products === 'undefined') return;
        const alerts = checkSmartAlerts();
        if (alerts.length > 0 && window.currentUser) {
            // إظهار شارة على الهيدر
            updateAlertsBadge(alerts.length);
        }
    }

    function updateAlertsBadge(count) {
        let badge = document.getElementById('alertsBadge');
        const header = document.querySelector('.header-actions');
        
        if (!header) return;
        
        if (!badge && count > 0) {
            badge = document.createElement('button');
            badge.id = 'alertsBadge';
            badge.style.cssText = 'background:#E06060;border:none;color:#fff;font-size:11px;' +
                'cursor:pointer;padding:4px 8px;border-radius:6px;font-weight:900;' +
                'height:28px;min-width:28px;display:inline-flex;align-items:center;justify-content:center;';
            badge.innerHTML = '🔔' + count;
            badge.onclick = showSmartAlerts;
            header.insertBefore(badge, header.firstChild);
        } else if (badge && count > 0) {
            badge.innerHTML = '🔔' + count;
        } else if (badge && count === 0) {
            badge.remove();
        }
    }

    // فحص كل دقيقة
    setInterval(checkPeriodically, 60000);
    
    // فحص أول مرة بعد 5 ثواني
    setTimeout(checkPeriodically, 5000);

    console.log('✅ التنبيهات الذكية: جاهزة');
})();

// ═══════════════════════════════════════════════════════════
// 3. 🎯 أهداف المبيعات
// ═══════════════════════════════════════════════════════════
(function initSalesGoals() {
    window.getSalesGoal = function() {
        return getData('sales_goal', { monthly: 0, daily: 0 });
    };

    window.setSalesGoal = function() {
        const goal = getSalesGoal();
        
        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>🎯 أهداف المبيعات</h3>' +
            '<div style="background:#0D0D0D;border-radius:10px;padding:14px;margin-bottom:12px;">' +
                '<div class="form-group"><label>🎯 الهدف الشهري (ج.م)</label>' +
                    '<input type="number" id="goalMonthly" value="' + (goal.monthly || 0) + '" min="0" step="100" /></div>' +
                '<div class="form-group"><label>📅 الهدف اليومي (ج.م)</label>' +
                    '<input type="number" id="goalDaily" value="' + (goal.daily || 0) + '" min="0" step="10" /></div>' +
            '</div>' +
            '<button class="btn btn-success btn-block" onclick="saveSalesGoal()">💾 حفظ الأهداف</button>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:6px;">إلغاء</button>';
        
        if (typeof openModal === 'function') openModal(html);
    };

    window.saveSalesGoal = function() {
        const monthly = parseFloat(document.getElementById('goalMonthly').value) || 0;
        const daily = parseFloat(document.getElementById('goalDaily').value) || 0;
        
        setData('sales_goal', { monthly: monthly, daily: daily });
        
        if (typeof showToast === 'function') showToast('✅ تم حفظ الأهداف', 'success');
        if (typeof closeModal === 'function') closeModal();
        
        // تحديث العرض
        setTimeout(renderGoalsWidget, 500);
    };

    window.getGoalProgress = function() {
        const goal = getSalesGoal();
        if (!goal.monthly && !goal.daily) return null;

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const monthStr = todayStr.substring(0, 7);

        let todayTotal = 0;
        let monthTotal = 0;

        if (typeof sales !== 'undefined') {
            sales.forEach(function(s) {
                if (s.date === todayStr) todayTotal += s.total || 0;
                if ((s.date || '').startsWith(monthStr)) monthTotal += s.total || 0;
            });
        }

        return {
            daily: {
                target: goal.daily || 0,
                actual: todayTotal,
                percent: goal.daily > 0 ? Math.min(100, (todayTotal / goal.daily) * 100) : 0
            },
            monthly: {
                target: goal.monthly || 0,
                actual: monthTotal,
                percent: goal.monthly > 0 ? Math.min(100, (monthTotal / goal.monthly) * 100) : 0
            }
        };
    };

    function renderGoalsWidget() {
        const pageContent = document.querySelector('#page-dashboard .page-content');
        if (!pageContent) return;

        const progress = getGoalProgress();
        let widget = document.getElementById('goalsWidget');

        if (!progress) {
            if (widget) widget.remove();
            return;
        }

        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'goalsWidget';
            widget.style.cssText = 'background:#1C1C1C;border-radius:14px;padding:14px;margin:14px 0;border:2px solid #2D2D2D;border-right:4px solid #C9A94E;';
            
            const firstStats = pageContent.querySelector('.dashboard-stats');
            if (firstStats) {
                firstStats.parentNode.insertBefore(widget, firstStats);
            }
        }

        const dailyPct = Math.round(progress.daily.percent);
        const monthlyPct = Math.round(progress.monthly.percent);
        
        const dailyColor = dailyPct >= 100 ? '#2D8F5E' : dailyPct >= 70 ? '#E6A830' : '#E06060';
        const monthlyColor = monthlyPct >= 100 ? '#2D8F5E' : monthlyPct >= 70 ? '#E6A830' : '#E06060';

        widget.innerHTML = 
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
                '<h3 style="color:#C9A94E;font-size:14px;font-weight:900;">🎯 أهداف المبيعات</h3>' +
                '<button onclick="setSalesGoal()" style="background:none;border:1px solid #C9A94E;color:#C9A94E;font-size:10px;padding:3px 8px;border-radius:6px;cursor:pointer;font-weight:900;">تعديل</button>' +
            '</div>' +
            
            (progress.daily.target > 0 ? 
                '<div style="margin-bottom:10px;">' +
                    '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">' +
                        '<span style="color:#A89070;">📅 اليومي:</span>' +
                        '<span style="color:' + dailyColor + ';font-weight:900;">' + progress.daily.actual.toFixed(0) + ' / ' + progress.daily.target.toFixed(0) + ' ج.م</span>' +
                    '</div>' +
                    '<div style="background:#0D0D0D;border-radius:10px;height:8px;overflow:hidden;">' +
                        '<div style="background:linear-gradient(90deg,' + dailyColor + ',' + dailyColor + '99);height:100%;width:' + dailyPct + '%;transition:width 0.5s;"></div>' +
                    '</div>' +
                    '<div style="text-align:left;font-size:10px;color:' + dailyColor + ';margin-top:2px;font-weight:900;">' + dailyPct + '%</div>' +
                '</div>' : '') +
            
            (progress.monthly.target > 0 ? 
                '<div>' +
                    '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">' +
                        '<span style="color:#A89070;">📆 الشهري:</span>' +
                        '<span style="color:' + monthlyColor + ';font-weight:900;">' + progress.monthly.actual.toFixed(0) + ' / ' + progress.monthly.target.toFixed(0) + ' ج.م</span>' +
                    '</div>' +
                    '<div style="background:#0D0D0D;border-radius:10px;height:8px;overflow:hidden;">' +
                        '<div style="background:linear-gradient(90deg,' + monthlyColor + ',' + monthlyColor + '99);height:100%;width:' + monthlyPct + '%;transition:width 0.5s;"></div>' +
                    '</div>' +
                    '<div style="text-align:left;font-size:10px;color:' + monthlyColor + ';margin-top:2px;font-weight:900;">' + monthlyPct + '%</div>' +
                '</div>' : '');
    }

    // إعادة التحديث عند التنقل
    const _originalUpdateDashboard = window.updateDashboard;
    window.updateDashboard = function() {
        if (_originalUpdateDashboard) _originalUpdateDashboard.apply(this, arguments);
        setTimeout(renderGoalsWidget, 100);
    };

    // إضافة زر الأهداف في قائمة المزيد
    function addGoalMenu() {
        const moreMenu = document.getElementById('moreMenu');
        if (!moreMenu) return;
        
        const grid = moreMenu.querySelector('div[style*="grid"]');
        if (!grid || grid.querySelector('.goal-added')) return;
        
        grid.classList.add('goal-added');
        
        const btn = document.createElement('button');
        btn.className = 'more-item';
        btn.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;background:#0D0D0D;border:2px solid #2D2D2D;color:#F5E6C8;padding:12px 6px;border-radius:10px;font-family:inherit;font-size:12px;cursor:pointer;';
        btn.innerHTML = '<i class="fas fa-bullseye" style="color:#2D8F5E;font-size:20px;"></i> أهداف المبيعات';
        btn.onclick = function() {
            if (typeof toggleMoreMenu === 'function') toggleMoreMenu();
            setSalesGoal();
        };
        grid.appendChild(btn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addGoalMenu, 3000);
        });
    } else {
        setTimeout(addGoalMenu, 3000);
    }

    console.log('✅ أهداف المبيعات: جاهزة');
})();

// ═══════════════════════════════════════════════════════════
// 4. 🌙 وضع الليل التلقائي
// ═══════════════════════════════════════════════════════════
(function initAutoDarkMode() {
    window.enableAutoDarkMode = function() {
        localStorage.setItem('mizan_auto_theme', 'true');
        checkAutoTheme();
        if (typeof showToast === 'function') showToast('✅ تم تفعيل الوضع التلقائي', 'success');
    };

    window.disableAutoDarkMode = function() {
        localStorage.removeItem('mizan_auto_theme');
        if (typeof showToast === 'function') showToast('⏸️ تم إيقاف الوضع التلقائي', 'info');
    };

    function checkAutoTheme() {
        if (localStorage.getItem('mizan_auto_theme') !== 'true') return;
        
        const hour = new Date().getHours();
        // الوضع الفاتح من 6 صباحاً حتى 6 مساءً
        // الوضع الداكن من 6 مساءً حتى 6 صباحاً
        const shouldBeLight = hour >= 6 && hour < 18;
        const currentTheme = localStorage.getItem('mizan_theme') || 'dark';
        const targetTheme = shouldBeLight ? 'light' : 'dark';
        
        if (currentTheme !== targetTheme) {
            localStorage.setItem('mizan_theme', targetTheme);
            if (typeof applyTheme === 'function') applyTheme(targetTheme);
            
            const btn = document.getElementById('themeToggleBtn');
            if (btn) btn.innerHTML = targetTheme === 'dark' ? '☀️' : '🌙';
            
            console.log('🌓 تم تبديل الوضع تلقائياً إلى: ' + targetTheme);
        }
    }

    // فحص كل 15 دقيقة
    setInterval(checkAutoTheme, 15 * 60 * 1000);
    
    // فحص أول مرة
    setTimeout(checkAutoTheme, 3000);

    console.log('✅ وضع الليل التلقائي: جاهز');
})();

// ═══════════════════════════════════════════════════════════
// 5. 🎁 قسائم الخصم
// ═══════════════════════════════════════════════════════════
(function initDiscountCoupons() {
    // تحميل القسائم
    window.coupons = getData('coupons', [
        { id: 1, code: 'WELCOME10', type: 'percent', value: 10, minAmount: 0, usageLimit: 0, usedCount: 0, expiry: '', active: true },
        { id: 2, code: 'SAVE50', type: 'fixed', value: 50, minAmount: 500, usageLimit: 0, usedCount: 0, expiry: '', active: true }
    ]);

    window.saveCoupons = function() {
        setData('coupons', coupons);
    };

    window.validateCoupon = function(code, amount) {
        if (!code) return { valid: false, error: 'أدخل الكود' };
        
        code = code.toUpperCase().trim();
        const coupon = coupons.find(function(c) { return c.code === code && c.active; });
        
        if (!coupon) return { valid: false, error: '❌ كود غير موجود' };
        if (coupon.expiry && new Date(coupon.expiry) < new Date()) return { valid: false, error: '❌ انتهت صلاحية الكود' };
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return { valid: false, error: '❌ تم استهلاك الكود' };
        if (amount < coupon.minAmount) return { valid: false, error: '⚠️ الحد الأدنى: ' + coupon.minAmount + ' ج.م' };
        
        let discount = 0;
        if (coupon.type === 'percent') {
            discount = amount * (coupon.value / 100);
        } else {
            discount = Math.min(coupon.value, amount);
        }
        
        return { valid: true, coupon: coupon, discount: discount };
    };

    window.useCoupon = function(code) {
        const coupon = coupons.find(function(c) { return c.code === code; });
        if (coupon) {
            coupon.usedCount = (coupon.usedCount || 0) + 1;
            saveCoupons();
        }
    };

    window.showCouponInput = function() {
        const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>🎁 قسيمة خصم</h3>' +
            '<div class="form-group">' +
                '<label>كود الخصم</label>' +
                '<input type="text" id="couponCodeInput" placeholder="أدخل الكود..." style="text-align:center;font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:2px;" />' +
            '</div>' +
            '<div id="couponResult" style="margin-bottom:12px;"></div>' +
            '<button class="btn btn-success btn-block" onclick="applyCoupon()">✅ تطبيق</button>' +
            '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:6px;">إلغاء</button>';
        
        if (typeof openModal === 'function') openModal(html);
        
        setTimeout(function() {
            const input = document.getElementById('couponCodeInput');
            if (input) {
                input.focus();
                input.onkeydown = function(e) {
                    if (e.key === 'Enter') applyCoupon();
                };
            }
        }, 200);
    };

    window.applyCoupon = function() {
        const code = document.getElementById('couponCodeInput').value;
        const resultEl = document.getElementById('couponResult');
        
        if (!code) {
            if (resultEl) resultEl.innerHTML = '<div style="color:#E06060;font-size:12px;text-align:center;">⚠️ أدخل الكود</div>';
            return;
        }
        
        // حساب المجموع من الفاتورة الحالية
        let total = 0;
        if (typeof currentSaleItems !== 'undefined' && currentSaleItems.length > 0) {
            total = currentSaleItems.reduce(function(s, i) { return s + i.total; }, 0);
        }
        
        const result = validateCoupon(code, total);
        
        if (!result.valid) {
            if (resultEl) resultEl.innerHTML = '<div style="color:#E06060;font-size:13px;text-align:center;font-weight:900;">' + result.error + '</div>';
            return;
        }
        
        // تطبيق الخصم
        if (typeof currentSaleItems !== 'undefined' && currentSaleItems.length > 0) {
            const discountInput = document.getElementById('saleDiscount');
            if (discountInput) {
                discountInput.value = result.discount.toFixed(2);
                if (typeof updateSaleTotals === 'function') updateSaleTotals();
            }
            useCoupon(result.coupon.code);
            
            if (typeof showToast === 'function') {
                showToast('🎁 تم تطبيق خصم ' + result.discount.toFixed(2) + ' ج.م', 'success');
            }
            if (typeof closeModal === 'function') closeModal();
        } else {
            if (resultEl) resultEl.innerHTML = '<div style="color:#E6A830;font-size:12px;text-align:center;">⚠️ أضف أصناف أولاً</div>';
        }
    };

    window.manageCoupons = function() {
        let html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
            '<h3>🎁 إدارة القسائم</h3>' +
            '<button class="btn btn-success btn-block" onclick="addNewCoupon()" style="margin-bottom:12px;">➕ إضافة قسيمة جديدة</button>';
        
        if (coupons.length === 0) {
            html += '<div class="empty-state"><i class="fas fa-ticket-alt"></i><span>لا توجد قسائم</span></div>';
        } else {
            html += '<div style="max-height:400px;overflow-y:auto;">';
            coupons.forEach(function(c, i) {
                const typeText = c.type === 'percent' ? '%' : ' ج.م';
                const valueText = c.type === 'percent' ? c.value + typeText : c.value + typeText;
                html += '<div style="background:#0D0D0D;border-radius:10px;padding:12px;margin-bottom:8px;border-right:4px solid ' + (c.active ? '#2D8F5E' : '#5D5D5D') + ';">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                        '<strong style="color:#C9A94E;font-family:monospace;font-size:15px;letter-spacing:1px;">' + c.code + '</strong>' +
                        '<span style="background:#C9A94E;color:#0D0D0D;padding:2px 10px;border-radius:10px;font-size:12px;font-weight:900;">' + valueText + '</span>' +
                    '</div>' +
                    '<div style="font-size:11px;color:#A89070;margin-top:4px;">' +
                        '🎯 الحد الأدنى: ' + (c.minAmount || 0) + ' ج.م • ' +
                        'استُخدم: ' + (c.usedCount || 0) + (c.usageLimit ? ' / ' + c.usageLimit : '') +
                    '</div>' +
                    '<div style="display:flex;gap:4px;margin-top:8px;">' +
                        '<button onclick="toggleCoupon(' + c.id + ')" style="flex:1;background:' + (c.active ? '#E6A830' : '#2D8F5E') + ';color:#fff;border:none;padding:5px;border-radius:6px;font-size:11px;font-weight:900;cursor:pointer;">' + (c.active ? '⏸️ إيقاف' : '▶️ تفعيل') + '</button>' +
                        '<button onclick="deleteCoupon(' + c.id + ')" style="flex:1;background:#E06060;color:#fff;border:none;padding:5px;border-radius:6px;font-size:11px;font-weight:900;cursor:pointer;">🗑️ حذف</button>' +
                    '</div>' +
                '</div>';
            });
            html += '</div>';
        }
        
        html += '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:12px;">إغلاق</button>';
        
        if (typeof openModal === 'function') openModal(html);
    };

    window.addNewCoupon = function() {
        const code = prompt('🎁 كود القسيمة (مثل: SAVE20):');
        if (!code) return;
        
        const upperCode = code.toUpperCase().trim();
        if (coupons.find(function(c) { return c.code === upperCode; })) {
            alert('⚠️ هذا الكود موجود بالفعل!');
            return;
        }
        
        const type = prompt('نوع الخصم:\n1 = نسبة مئوية (%)\n2 = مبلغ ثابت (ج.م)', '1');
        if (!type) return;
        
        const value = parseFloat(prompt('💰 قيمة الخصم:'));
        if (!value || value <= 0) return;
        
        const minAmount = parseFloat(prompt('📊 الحد الأدنى للمبلغ (0 = بدون حد):', '0')) || 0;
        const usageLimit = parseInt(prompt('🎯 عدد مرات الاستخدام (0 = غير محدود):', '0')) || 0;
        
        coupons.push({
            id: Date.now(),
            code: upperCode,
            type: type === '1' ? 'percent' : 'fixed',
            value: value,
            minAmount: minAmount,
            usageLimit: usageLimit,
            usedCount: 0,
            active: true
        });
        
        saveCoupons();
        if (typeof showToast === 'function') showToast('✅ تم إضافة القسيمة: ' + upperCode, 'success');
        setTimeout(manageCoupons, 300);
    };

    window.toggleCoupon = function(id) {
        const coupon = coupons.find(function(c) { return c.id === id; });
        if (coupon) {
            coupon.active = !coupon.active;
            saveCoupons();
            manageCoupons();
        }
    };

    window.deleteCoupon = function(id) {
        if (!confirm('⚠️ حذف هذه القسيمة؟')) return;
        window.coupons = coupons.filter(function(c) { return c.id !== id; });
        saveCoupons();
        manageCoupons();
    };

    // إضافة زر القسيمة في الكاشير
    function addCouponButton() {
        const posActions = document.querySelector('.pos-actions');
        if (!posActions || document.getElementById('couponBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'couponBtn';
        btn.className = 'pos-btn';
        btn.style.cssText = 'background:linear-gradient(135deg,#9B59B6,#7B3A96);color:#fff;border-color:#9B59B6;';
        btn.innerHTML = '<i class="fas fa-ticket-alt"></i><span>قسيمة</span>';
        btn.title = 'تطبيق قسيمة خصم';
        btn.onclick = showCouponInput;
        posActions.appendChild(btn);
    }

    // إضافة زر إدارة القسائم في قائمة المزيد
    function addCouponMenu() {
        const moreMenu = document.getElementById('moreMenu');
        if (!moreMenu) return;
        
        const grid = moreMenu.querySelector('div[style*="grid"]');
        if (!grid || grid.querySelector('.coupon-added')) return;
        
        grid.classList.add('coupon-added');
        
        const btn = document.createElement('button');
        btn.className = 'more-item';
        btn.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;background:#0D0D0D;border:2px solid #2D2D2D;color:#F5E6C8;padding:12px 6px;border-radius:10px;font-family:inherit;font-size:12px;cursor:pointer;';
        btn.innerHTML = '<i class="fas fa-ticket-alt" style="color:#9B59B6;font-size:20px;"></i> القسائم';
        btn.onclick = function() {
            if (typeof toggleMoreMenu === 'function') toggleMoreMenu();
            manageCoupons();
        };
        grid.appendChild(btn);
    }

    let attempts = 0;
    function tryAdd() {
        attempts++;
        addCouponButton();
        addCouponMenu();
        if (attempts < 5) {
            setTimeout(tryAdd, 1000);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(tryAdd, 2000);
        });
    } else {
        setTimeout(tryAdd, 2000);
    }

    console.log('✅ قسائم الخصم: جاهزة');
})();

// ═══════════════════════════════════════════════════════════
// 🎉 تم التحميل
// ═══════════════════════════════════════════════════════════
console.log('');
console.log('════════════════════════════════════════════════');
console.log('🎉 تم تحميل app-extras-v2.js');
console.log('════════════════════════════════════════════════');
console.log('✅ 1. 📸 مسح الباركود');
console.log('✅ 2. 🔔 تنبيهات ذكية');
console.log('✅ 3. 🎯 أهداف المبيعات');
console.log('✅ 4. 🌙 وضع الليل التلقائي');
console.log('✅ 5. 🎁 قسائم الخصم');
console.log('════════════════════════════════════════════════');
