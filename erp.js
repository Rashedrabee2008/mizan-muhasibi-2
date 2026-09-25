// ============================================================
// erp.js - نظام ERP بسيط
// ============================================================

(function() {
    'use strict';

    console.log('📊 تحميل erp.js');

    // ═══════════════════════════════════════════════════════════
    // 📦 إدارة المستودعات
    // ═══════════════════════════════════════════════════════════
    window.warehouses = window.warehouses || [];

    window.WAREHOUSE_TYPES = {
        'main':     { name: 'رئيسي',   icon: '🏭' },
        'branch':   { name: 'فرع',     icon: '🏪' },
        'storage':  { name: 'مخزن',    icon: '📦' },
        'returns':  { name: 'مرتجعات', icon: '🔄' }
    };

    window.loadWarehouses = function() {
        try {
            const data = localStorage.getItem('mizan_warehouses');
            window.warehouses = data ? JSON.parse(data) : [];
            
            if (window.warehouses.length === 0) {
                // إنشاء مستودع رئيسي افتراضي
                window.warehouses = [{
                    id: 1,
                    name: 'المستودع الرئيسي',
                    type: 'main',
                    location: 'المقر الرئيسي',
                    manager: 'المدير',
                    active: true,
                    createdAt: new Date().toISOString()
                }];
                localStorage.setItem('mizan_warehouses', JSON.stringify(window.warehouses));
            }
        } catch (e) {
            window.warehouses = [];
        }
    };

    window.saveWarehouse = function() {
        const id = document.getElementById('warehouseId') ? document.getElementById('warehouseId').value : '';
        const name = document.getElementById('warehouseName') ? document.getElementById('warehouseName').value.trim() : '';
        const type = document.getElementById('warehouseType') ? document.getElementById('warehouseType').value : 'storage';
        const location = document.getElementById('warehouseLocation') ? document.getElementById('warehouseLocation').value.trim() : '';
        const manager = document.getElementById('warehouseManager') ? document.getElementById('warehouseManager').value.trim() : '';

        if (!name) {
            if (typeof showToast === 'function') showToast('⚠️ أدخل اسم المستودع', 'error');
            return;
        }

        if (id) {
            const idx = window.warehouses.findIndex(function(w) { return w.id == id; });
            if (idx > -1) {
                window.warehouses[idx] = Object.assign({}, window.warehouses[idx], {
                    name: name, type: type, location: location, manager: manager
                });
                if (typeof showToast === 'function') showToast('✅ تم التعديل', 'success');
            }
        } else {
            if (window.warehouses.find(function(w) { return w.name === name; })) {
                if (typeof showToast === 'function') showToast('⚠️ الاسم موجود', 'warning');
                return;
            }
            window.warehouses.push({
                id: Date.now(),
                name: name,
                type: type,
                location: location,
                manager: manager,
                active: true,
                createdAt: new Date().toISOString()
            });
            if (typeof showToast === 'function') showToast('✅ تم الإضافة', 'success');
        }

        localStorage.setItem('mizan_warehouses', JSON.stringify(window.warehouses));
        resetWarehouseForm();
        renderWarehouses();
    };

    window.resetWarehouseForm = function() {
        ['warehouseId', 'warehouseName', 'warehouseLocation', 'warehouseManager'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const typeEl = document.getElementById('warehouseType');
        if (typeEl) typeEl.value = 'storage';
        const titleEl = document.getElementById('warehouseFormTitle');
        if (titleEl) titleEl.textContent = '➕ إضافة مستودع جديد';
    };

    window.renderWarehouses = function() {
        const c = document.getElementById('warehouseList');
        if (!c) return;

        if (window.warehouses.length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-warehouse"></i><span>لا توجد مستودعات</span></div>';
            return;
        }

        let html = '';
        window.warehouses.forEach(function(w) {
            const typeInfo = window.WAREHOUSE_TYPES[w.type] || { name: w.type, icon: '📦' };
            
            html += '<div class="cash-box-card" style="margin-bottom:10px;border-right:4px solid #4A8AB5;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                    '<div style="display:flex;align-items:center;gap:8px;">' +
                        '<span style="font-size:24px;">' + typeInfo.icon + '</span>' +
                        '<div>' +
                            '<div style="color:#C9A94E;font-weight:900;font-size:14px;">' + w.name + '</div>' +
                            '<div style="color:#A89070;font-size:10px;">' + typeInfo.name + (w.location ? ' - ' + w.location : '') + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<span style="color:' + (w.active ? '#2D8F5E' : '#E06060') + ';font-size:11px;">' +
                        (w.active ? '✅ نشط' : '⏸️ موقوف') +
                    '</span>' +
                '</div>' +
                (w.manager ? '<div style="font-size:11px;color:#A89070;margin-top:4px;">👤 المسؤول: ' + w.manager + '</div>' : '') +
                '<div style="display:flex;gap:6px;margin-top:10px;">' +
                    '<button onclick="editWarehouse(' + w.id + ')" style="flex:1;background:#E6A830;border:none;color:#0D0D0D;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">✏️ تعديل</button>' +
                    '<button onclick="deleteWarehouse(' + w.id + ')" style="flex:1;background:#E06060;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">🗑️ حذف</button>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    window.editWarehouse = function(id) {
        const w = window.warehouses.find(function(x) { return x.id == id; });
        if (!w) return;
        
        const ids = ['warehouseId', 'warehouseName', 'warehouseLocation', 'warehouseManager'];
        const values = [w.id, w.name, w.location || '', w.manager || ''];
        
        ids.forEach(function(id, i) {
            const el = document.getElementById(id);
            if (el) el.value = values[i];
        });
        
        const typeEl = document.getElementById('warehouseType');
        if (typeEl) typeEl.value = w.type;
        const titleEl = document.getElementById('warehouseFormTitle');
        if (titleEl) titleEl.textContent = '✏️ تعديل المستودع';
    };

    window.deleteWarehouse = function(id) {
        if (!confirm('⚠️ حذف هذا المستودع؟')) return;
        window.warehouses = window.warehouses.filter(function(w) { return w.id != id; });
        localStorage.setItem('mizan_warehouses', JSON.stringify(window.warehouses));
        renderWarehouses();
        if (typeof showToast === 'function') showToast('🗑️ تم الحذف', 'info');
    };

    // ═══════════════════════════════════════════════════════════
    // 🏢 إدارة الفروع
    // ═══════════════════════════════════════════════════════════
    window.branches = window.branches || [];

    window.loadBranches = function() {
        try {
            const data = localStorage.getItem('mizan_branches');
            window.branches = data ? JSON.parse(data) : [];
            
            if (window.branches.length === 0) {
                window.branches = [{
                    id: 1,
                    name: 'الفرع الرئيسي',
                    code: 'BR-001',
                    address: 'المقر الرئيسي',
                    phone: '',
                    manager: 'المدير',
                    active: true,
                    createdAt: new Date().toISOString()
                }];
                localStorage.setItem('mizan_branches', JSON.stringify(window.branches));
            }
        } catch (e) {
            window.branches = [];
        }
    };

    window.saveBranch = function() {
        const id = document.getElementById('branchId') ? document.getElementById('branchId').value : '';
        const name = document.getElementById('branchName') ? document.getElementById('branchName').value.trim() : '';
        const code = document.getElementById('branchCode') ? document.getElementById('branchCode').value.trim() : '';
        const address = document.getElementById('branchAddress') ? document.getElementById('branchAddress').value.trim() : '';
        const phone = document.getElementById('branchPhone') ? document.getElementById('branchPhone').value.trim() : '';

        if (!name) {
            if (typeof showToast === 'function') showToast('⚠️ أدخل اسم الفرع', 'error');
            return;
        }

        if (id) {
            const idx = window.branches.findIndex(function(b) { return b.id == id; });
            if (idx > -1) {
                window.branches[idx] = Object.assign({}, window.branches[idx], {
                    name: name, code: code, address: address, phone: phone
                });
                if (typeof showToast === 'function') showToast('✅ تم التعديل', 'success');
            }
        } else {
            window.branches.push({
                id: Date.now(),
                name: name,
                code: code || 'BR-' + String(window.branches.length + 1).padStart(3, '0'),
                address: address,
                phone: phone,
                manager: '',
                active: true,
                createdAt: new Date().toISOString()
            });
            if (typeof showToast === 'function') showToast('✅ تم الإضافة', 'success');
        }

        localStorage.setItem('mizan_branches', JSON.stringify(window.branches));
        renderBranches();
    };

    window.renderBranches = function() {
        const c = document.getElementById('branchList');
        if (!c) return;

        if (window.branches.length === 0) {
            c.innerHTML = '<div class="empty-state"><i class="fas fa-building"></i><span>لا توجد فروع</span></div>';
            return;
        }

        let html = '';
        window.branches.forEach(function(b) {
            html += '<div class="cash-box-card" style="margin-bottom:10px;border-right:4px solid #9B59B6;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                    '<div style="display:flex;align-items:center;gap:8px;">' +
                        '<span style="font-size:24px;">🏢</span>' +
                        '<div>' +
                            '<div style="color:#C9A94E;font-weight:900;font-size:14px;">' + b.name + '</div>' +
                            '<div style="color:#A89070;font-size:10px;">كود: ' + b.code + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<span style="color:' + (b.active ? '#2D8F5E' : '#E06060') + ';font-size:11px;">' +
                        (b.active ? '✅ نشط' : '⏸️ موقوف') +
                    '</span>' +
                '</div>' +
                (b.address ? '<div style="font-size:11px;color:#A89070;">📍 ' + b.address + '</div>' : '') +
                (b.phone ? '<div style="font-size:11px;color:#A89070;">📞 ' + b.phone + '</div>' : '') +
                '<div style="display:flex;gap:6px;margin-top:10px;">' +
                    '<button onclick="deleteBranch(' + b.id + ')" style="flex:1;background:#E06060;border:none;color:#fff;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:900;">🗑️ حذف</button>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    window.deleteBranch = function(id) {
        if (!confirm('⚠️ حذف هذا الفرع؟')) return;
        window.branches = window.branches.filter(function(b) { return b.id != id; });
        localStorage.setItem('mizan_branches', JSON.stringify(window.branches));
        renderBranches();
    };

    // ═══════════════════════════════════════════════════════════
    // 💱 إدارة العملات
    // ═══════════════════════════════════════════════════════════
    window.currencies = window.currencies || [];

    window.DEFAULT_CURRENCIES = [
        { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', rate: 1, isDefault: true },
        { code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 50.00, isDefault: false },
        { code: 'EUR', name: 'يورو', symbol: '€', rate: 54.00, isDefault: false },
        { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rate: 13.33, isDefault: false },
        { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', rate: 13.60, isDefault: false }
    ];

    window.loadCurrencies = function() {
        try {
            const data = localStorage.getItem('mizan_currencies');
            window.currencies = data ? JSON.parse(data) : DEFAULT_CURRENCIES;
        } catch (e) {
            window.currencies = DEFAULT_CURRENCIES;
        }
    };

    window.convertCurrency = function(amount, fromCode, toCode) {
        const from = window.currencies.find(function(c) { return c.code === fromCode; });
        const to = window.currencies.find(function(c) { return c.code === toCode; });
        if (!from || !to) return amount;
        
        const amountInEGP = amount * from.rate;
        return amountInEGP / to.rate;
    };

    window.renderCurrencies = function() {
        const c = document.getElementById('currencyList');
        if (!c) return;

        let html = '<div style="background:#1A1A1A;border-radius:10px;padding:12px;margin-bottom:12px;color:#A89070;font-size:11px;text-align:center;">' +
            '💱 سعر الصرف مقابل الجنيه المصري' +
        '</div>';

        window.currencies.forEach(function(curr) {
            html += '<div class="cash-box-card" style="margin-bottom:8px;border-right:4px solid ' + (curr.isDefault ? '#C9A94E' : '#4A8AB5') + ';padding:12px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                    '<div>' +
                        '<div style="color:#C9A94E;font-weight:900;font-size:14px;">' + curr.symbol + ' ' + curr.name + '</div>' +
                        '<div style="color:#A89070;font-size:10px;">' + curr.code + (curr.isDefault ? ' ⭐' : '') + '</div>' +
                    '</div>' +
                    '<div style="text-align:left;">' +
                        '<div style="color:#2D8F5E;font-weight:900;font-size:15px;">' + curr.rate.toFixed(2) + '</div>' +
                        '<div style="color:#A89070;font-size:9px;">ج.م لكل وحدة</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        });

        c.innerHTML = html;
    };

    // ═══════════════════════════════════════════════════════════
    // 🚀 التهيئة
    // ═══════════════════════════════════════════════════════════
    function initERP() {
        loadWarehouses();
        loadBranches();
        loadCurrencies();
        console.log('✅ ERP جاهز');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initERP, 3000);
        });
    } else {
        setTimeout(initERP, 3000);
    }

    console.log('✅ erp.js جاهز');
})();
    // ═══════════════════════════════════════════════════════════
    // 🎛️ تبديل تبويبات ERP
    // ═══════════════════════════════════════════════════════════
    window.showERPTab = function(tab, btn) {
        // إخفاء كل التبويبات
        ['warehouses', 'branches', 'currencies'].forEach(function(t) {
            const el = document.getElementById('erpTab' + t.charAt(0).toUpperCase() + t.slice(1));
            if (el) el.style.display = 'none';
        });
        
        // إظهار التبويب المطلوب
        const target = document.getElementById('erpTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
        if (target) target.style.display = 'block';
        
        // تحديث الأزرار
        document.querySelectorAll('#page-erp .tab-btn').forEach(function(b) {
            b.classList.remove('active');
        });
        if (btn) btn.classList.add('active');
        
        // تحديث القوائم
        if (tab === 'warehouses') renderWarehouses();
        if (tab === 'branches') renderBranches();
        if (tab === 'currencies') renderCurrencies();
    };
    
    console.log('✅ showERPTab جاهزة');

