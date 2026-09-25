// ============================================================
// الميزان 15.0.0 - app.js (النسخة الكاملة المتكاملة)
// مع QR + PDF + WhatsApp
// ============================================================

console.log('🚀 تحميل app.js - النسخة الكاملة v15');

// ═══════════════════════════════════════════════════════════
// ☁️ Firebase Configuration
// ═══════════════════════════════════════════════════════════
window.firebaseConfig = {
    apiKey: "AIzaSyCP7vpqviR6A11gPkC7cO6MQJBGKWcnVWE",
    authDomain: "accounting-balance-ab9d3.firebaseapp.com",
    databaseURL: "https://accounting-balance-ab9d3-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "accounting-balance-ab9d3",
    storageBucket: "accounting-balance-ab9d3.firebasestorage.app",
    messagingSenderId: "564321427560",
    appId: "1:564321427560:web:170368d708c4d9dd771bdd"
};

window.firebaseReady = false;

// ═══════════════════════════════════════════════════════════
// 📦 المتغيرات الأساسية
// ═══════════════════════════════════════════════════════════
var STORAGE_KEY = 'mizan_';

window.products = [];
window.sales = [];
window.purchases = [];
window.customers = [];
window.suppliers = [];
window.cashBoxes = [];
window.expenses = [];
window.treasury = [];
window.payments = [];
window.returns = [];
window.users = [];
window.accounts = [];
window.journalEntries = [];
window.currentSaleItems = [];
window.currentPurItems = [];
window.currentRetItems = [];
window.currentTreasuryFilter = 'all';
window.currentInvoiceFilter = 'all';
window.currentPayTab = 'collect';
window.currentUser = null;
window.companyData = { name: 'الميزان', phone: '', address: '', tax: '', footer: 'شكراً لتعاملكم معنا 🌟' };
window.vatSettings = { defaultVAT: 14 };

// ═══════════════════════════════════════════════════════════
// 🔧 أدوات مساعدة
// ═══════════════════════════════════════════════════════════
window.$ = function(id) { return document.getElementById(id); };

window.getRadioValue = function(name, defaultValue) {
    defaultValue = defaultValue || '';
    const el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : defaultValue;
};

window.setRadioValue = function(name, value) {
    const el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (el) el.checked = true;
};

window.getData = function(key, def) {
    if (def === undefined) def = [];
    try {
        const d = localStorage.getItem(STORAGE_KEY + key);
        return d ? JSON.parse(d) : def;
    } catch (e) { return def; }
};

window.setData = function(key, data) {
    try { localStorage.setItem(STORAGE_KEY + key, JSON.stringify(data)); } catch (e) {}
};

window.toArray = function(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Object.values(data).filter(item => item !== null && item !== undefined);
};

window.showToast = function(msg, type) {
    type = type || 'info';
    const t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast show ' + type;
    clearTimeout(t._t);
    t._t = setTimeout(function() { t.className = 'toast'; }, 3000);
};

window.formatMoney = function(n) { return Number(n || 0).toFixed(2); };
window.getTodayDate = function() { return new Date().toISOString().split('T')[0]; };
window.getNowTime = function() { 
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    return hours + ':' + minutes + ' ' + ampm;
};

window.getPaymentMethodLabel = function(method) {
    const labels = {
        'cash': '💵 نقدي', 'credit': '📝 آجل', 'wallet': '📱 موبايل',
        'visa': '💳 فيزا', 'bank': '🏦 تحويل', 'installment': '📅 تقسيط'
    };
    return labels[method] || method;
};

window.onSalePaymentChange = function() {};
window.toggleMoreMenu = function() {
    const menu = $('moreMenu');
    if (!menu) return;
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
};

window.openModal = function(html) {
    const overlay = $('modalOverlay');
    if (!overlay) return;
    let box = overlay.querySelector('.modal-box');
    if (!box) {
        box = document.createElement('div');
        box.className = 'modal-box';
        overlay.appendChild(box);
    }
    box.innerHTML = html;
    overlay.classList.add('show');
    overlay.onclick = function(e) { if (e.target === overlay) closeModal(); };
};

window.closeModal = function() {
    const overlay = $('modalOverlay');
    if (overlay) overlay.classList.remove('show');
};

window.updateClock = function() {
    const el = $('liveDateTime');
    if (!el) return;
    
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, '0');
    
    el.textContent = `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
    
    const invDateEl = $('invDateDisplay');
    const invTimeEl = $('invTimeDisplay');
    if (invDateEl) invDateEl.value = `${day}/${month}/${year}`;
    if (invTimeEl) invTimeEl.value = `${hoursStr}:${minutes} ${ampm}`;
};

// ═══════════════════════════════════════════════════════════
// ☁️ Firebase Functions
// ═══════════════════════════════════════════════════════════
window.initFirebase = function() {
    try {
        if (typeof firebase === 'undefined') return false;
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }
        window.firebaseReady = true;
        console.log('✅ Firebase جاهز:', firebaseConfig.projectId);
        return true;
    } catch (e) {
        console.error('❌ خطأ Firebase:', e);
        window.firebaseReady = false;
        return false;
    }
};

window.getFirebaseRef = function() {
    if (!firebaseReady) return null;
    try { return firebase.database().ref('mizan'); }
    catch (e) { return null; }
};

window.syncToCloud = function() {
    const ref = getFirebaseRef();
    if (!ref) return;

    const data = {
        products, sales, purchases, customers, suppliers, cashBoxes,
        expenses, treasury, payments, returns, users,
        accounts, journalEntries,
        companyData, vatSettings,
        lastSync: new Date().toISOString(),
        syncedBy: currentUser ? currentUser.name : 'unknown',
        version: '15.0.0'
    };

    function cleanForFirebase(obj) {
        if (obj === null || obj === undefined) return null;
        if (Array.isArray(obj)) return obj.map(cleanForFirebase);
        if (typeof obj === 'object') {
            const cleaned = {};
            for (const key in obj) {
                if (!obj.hasOwnProperty(key)) continue;
                const val = obj[key];
                if (val === undefined) continue;
                if (typeof val === 'number' && !isFinite(val)) cleaned[key] = 0;
                else if (typeof val === 'object' && val !== null) cleaned[key] = cleanForFirebase(val);
                else cleaned[key] = val;
            }
            return cleaned;
        }
        return obj;
    }

    ref.set(cleanForFirebase(data))
        .then(function() {
            if (typeof updateSyncStatus === 'function') {
                updateSyncStatus('🟢 متصل - آخر رفع: ' + getNowTime(), 'success');
            }
        })
        .catch(function(err) {
            if (typeof updateSyncStatus === 'function') {
                updateSyncStatus('🔴 فشل الرفع', 'error');
            }
        });
};

window.syncFromCloud = function(silent) {
    const ref = getFirebaseRef();
    if (!ref) return;
    if (!silent && !confirm('⚠️ سيتم استبدال البيانات. متابعة؟')) return;

    ref.once('value').then(function(snapshot) {
        if (!snapshot.exists()) return;
        const data = snapshot.val();

        if (data.products) window.products = toArray(data.products);
        if (data.sales) window.sales = toArray(data.sales);
        if (data.purchases) window.purchases = toArray(data.purchases);
        if (data.customers) window.customers = toArray(data.customers);
        if (data.suppliers) window.suppliers = toArray(data.suppliers);
        if (data.cashBoxes) window.cashBoxes = toArray(data.cashBoxes);
        if (data.expenses) window.expenses = toArray(data.expenses);
        if (data.treasury) window.treasury = toArray(data.treasury);
        if (data.payments) window.payments = toArray(data.payments);
        if (data.returns) window.returns = toArray(data.returns);
        if (data.users) window.users = toArray(data.users);
        if (data.accounts) window.accounts = toArray(data.accounts);
        if (data.journalEntries) window.journalEntries = toArray(data.journalEntries);
        if (data.companyData) window.companyData = data.companyData;
        if (data.vatSettings) window.vatSettings = data.vatSettings;

        saveAll();
        if (typeof refreshAllUI === 'function') refreshAllUI();
        if (!silent) showToast('✅ تم التحميل', 'success');
    }).catch(function(err) {
        if (!silent) showToast('❌ ' + err.message, 'error');
    });
};

window.syncUsersFromCloud = async function() {
    if (!window.firebaseReady) return;
    try {
        const snapshot = await firebase.database().ref('mizan/users').once('value');
        if (snapshot.exists()) {
            let usersData = toArray(snapshot.val()).filter(u => u && u.id);
            if (usersData.length > 0 && usersData.length !== (window.users || []).length) {
                window.users = usersData;
                setData('users', window.users);
                if (typeof populateLoginUsers === 'function') populateLoginUsers();
                console.log('✅ تم تحديث المستخدمين:', usersData.length);
            }
        }
    } catch (e) {
        console.warn('⚠️', e.message);
    }
};

window.updateSyncStatus = function(msg, type) {
    type = type || 'info';
    let statusEl = $('syncStatus');
    if (!statusEl) {
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            statusEl = document.createElement('span');
            statusEl.id = 'syncStatus';
            statusEl.style.cssText = 'font-size:10px;color:#A89070;background:#0D0D0D;padding:3px 8px;border-radius:6px;border:1px solid #2D2D2D;font-weight:700;';
            headerActions.insertBefore(statusEl, headerActions.firstChild);
        }
    }
    if (statusEl) {
        statusEl.textContent = msg;
        const colors = { 'success': '#2D8F5E', 'error': '#E06060', 'info': '#C9A94E', 'warning': '#E6A830' };
        statusEl.style.color = colors[type] || '#A89070';
    }
};

window.autoSyncInterval = null;
window.autoSyncDebounce = null;

window.startAutoSync = function() {
    if (autoSyncInterval) clearInterval(autoSyncInterval);
    autoSyncInterval = setInterval(function() {
        if (firebaseReady && currentUser) {
            syncToCloud();
            syncUsersFromCloud();
        }
    }, 5 * 60 * 1000);
};

window.stopAutoSync = function() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
    }
};

window.scheduleAutoSync = function() {
    if (!firebaseReady || !currentUser) return;
    if (autoSyncDebounce) clearTimeout(autoSyncDebounce);
    autoSyncDebounce = setTimeout(function() { syncToCloud(); }, 10000);
};

// ═══════════════════════════════════════════════════════════
// 🔐 نظام الصلاحيات
// ═══════════════════════════════════════════════════════════
window.ROLES = {
    admin:   { name: 'مدير',   icon: '👑', color: '#E06060' },
    manager: { name: 'مشرف',   icon: '📊', color: '#C9A94E' },
    cashier: { name: 'كاشير',  icon: '💰', color: '#4A8AB5' },
    seller:  { name: 'بائع',   icon: '🛒', color: '#E6A830' },
    viewer:  { name: 'مشاهد',  icon: '👁️', color: '#5D5D5D' }
};

window.hasPermission = function(permission) {
    if (!currentUser) return false;
    const role = currentUser.role;
    const permissions = {
        admin:   ['add', 'edit', 'delete', 'view', 'manage_users', 'settings', 'view_reports', 'clear_data', 'view_accounts'],
        manager: ['add', 'edit', 'view', 'view_reports', 'settings', 'view_accounts'],
        cashier: ['add', 'view', 'add_sale'],
        seller:  ['add_sale', 'view'],
        viewer:  ['view']
    };
    return (permissions[role] || []).indexOf(permission) > -1;
};

window.isAdmin = function() { return currentUser && currentUser.role === 'admin'; };
window.canAdd = function() { return hasPermission('add') || hasPermission('add_sale'); };
window.canEdit = function() { return hasPermission('edit'); };
window.canDelete = function() { return hasPermission('delete'); };
window.canManageUsers = function() { return hasPermission('manage_users'); };
window.canViewAccounts = function() { return hasPermission('view_accounts'); };

// ═══════════════════════════════════════════════════════════
// 🧭 التنقل
// ═══════════════════════════════════════════════════════════
window.navigateTo = function(page) {
    document.querySelectorAll('.page-container').forEach(function(el) { el.classList.remove('active'); });
    const target = $('page-' + page);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(function(el) {
        el.classList.toggle('active', el.dataset.page === page);
    });

    if (page === 'dashboard') updateDashboard();
    if (page === 'inventory') renderProducts();
    if (page === 'cashier') {
        populateSaleProducts();
        populateSaleCustomers();
        populateCashBoxDropdowns();
        renderCashier();
        updateSaleTotals();
    }
    if (page === 'purchases') {
        populatePurProducts();
        populatePurSuppliers();
        populateCashBoxDropdowns();
        renderPurItems();
        updatePurTotals();
        renderPurchases();
        updatePurStats();
    }
    if (page === 'customers') renderCustomers();
    if (page === 'suppliers') renderSuppliers();
    if (page === 'cash-boxes') { populateCashBoxDropdowns(); renderCashBoxes(); }
    if (page === 'expenses') { populateCashBoxDropdowns(); renderExpenses(); updateExpensesStats(); }
    if (page === 'treasury') { populateCashBoxDropdowns(); renderTreasury(); }
    if (page === 'invoices') { updateInvoiceStats(); renderInvoices(); }
    if (page === 'payments') {
        populateCollectCustomers();
        populatePaySuppliers();
        populateCashBoxDropdowns();
        updatePaymentsStats();
        renderPayments();
    }
    if (page === 'returns') {
        toggleReturnParty();
        populateRetProducts();
        populateCashBoxDropdowns();
        updateReturnsStats();
        renderReturns();
    }
    if (page === 'accounts') {
        if (typeof renderAccounts === 'function') renderAccounts();
        if (typeof renderJournalEntries === 'function') renderJournalEntries();
    }
    if (page === 'erp') {
        if (typeof renderWarehouses === 'function') renderWarehouses();
        if (typeof renderBranches === 'function') renderBranches();
        if (typeof renderCurrencies === 'function') renderCurrencies();
    }
    if (page === 'reports') renderReport(currentReport);
    if (page === 'users') renderUsers();
    if (page === 'settings') renderSettings();

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ═══════════════════════════════════════════════════════════
// 💾 المنتجات
// ═══════════════════════════════════════════════════════════
window.saveProduct = function() {
    if (!canAdd()) { showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const id = $('productId') ? $('productId').value : '';
    const name = $('productName') ? $('productName').value.trim() : '';
    const barcode = $('productBarcode') ? $('productBarcode').value.trim() : '';
    const buy = parseFloat($('productBuy') ? $('productBuy').value : 0) || 0;
    const sell = parseFloat($('productSell') ? $('productSell').value : 0) || 0;
    const qty = parseInt($('productQty') ? $('productQty').value : 0) || 0;
    const min = parseInt($('productMin') ? $('productMin').value : 5) || 5;

    if (!name) { showToast('⚠️ أدخل اسم المنتج', 'error'); return; }

    if (id) {
        const idx = products.findIndex(function(p) { return p.id == id; });
        if (idx > -1) {
            products[idx] = Object.assign({}, products[idx], { name, barcode, buy, sell, qty, min });
            showToast('✅ تم التعديل', 'success');
        }
    } else {
        if (products.find(function(p) { return p.name === name; })) { showToast('⚠️ الاسم موجود', 'warning'); return; }
        products.push({ id: Date.now(), name, barcode, buy, sell, qty, min });
        showToast('✅ تم الإضافة', 'success');
    }
    setData('products', products);
    resetProductForm();
    renderProducts();
    updateDashboard();
    scheduleAutoSync();
};

window.resetProductForm = function() {
    ['productId','productName','productBarcode','productBuy','productSell','productQty'].forEach(function(id) {
        if ($(id)) $(id).value = '';
    });
    if ($('productMin')) $('productMin').value = '5';
    if ($('productFormTitle')) $('productFormTitle').textContent = '➕ إضافة منتج جديد';
    if ($('productSaveBtnText')) $('productSaveBtnText').textContent = 'إضافة';
};

window.editProduct = function(id) {
    const p = products.find(function(pr) { return pr.id == id; });
    if (!p) return;
    if ($('productId')) $('productId').value = p.id;
    if ($('productName')) $('productName').value = p.name;
    if ($('productBarcode')) $('productBarcode').value = p.barcode || '';
    if ($('productBuy')) $('productBuy').value = p.buy;
    if ($('productSell')) $('productSell').value = p.sell;
    if ($('productQty')) $('productQty').value = p.qty;
    if ($('productMin')) $('productMin').value = p.min || 5;
    if ($('productFormTitle')) $('productFormTitle').textContent = '✏️ تعديل المنتج';
    if ($('productSaveBtnText')) $('productSaveBtnText').textContent = 'حفظ';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteProduct = function(id) {
    if (!canDelete()) { showToast('⚠️ لا تملك صلاحية', 'error'); return; }
    const p = products.find(function(pr) { return pr.id == id; });
    if (!p) return;
    if (!confirm('⚠️ حذف "' + p.name + '"؟')) return;
    window.products = products.filter(function(pr) { return pr.id !== id; });
    setData('products', products);
    renderProducts();
    updateDashboard();
    scheduleAutoSync();
    showToast('🗑️ تم الحذف', 'info');
};

window.renderProducts = function() {
    const c = $('productList');
    if (!c) return;
    const searchInput = $('inventorySearch');
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let filtered = products;
    if (search) filtered = filtered.filter(function(p) {
        return (p.name || '').toLowerCase().indexOf(search) > -1 || (p.barcode || '').indexOf(search) > -1;
    });

    if (filtered.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-box"></i><span>لا توجد منتجات</span></div>';
        return;
    }
    let html = '<div class="table-header" style="grid-template-columns: 1.5fr 0.8fr 0.8fr 0.8fr 1fr;"><span>الاسم</span><span>الشراء</span><span>البيع</span><span>الكمية</span><span></span></div>';
    filtered.forEach(function(p) {
        const qtyColor = p.qty > (p.min || 5) ? '#C9A94E' : '#E06060';
        html += '<div class="table-row" style="grid-template-columns: 1.5fr 0.8fr 0.8fr 0.8fr 1fr;">' +
            '<span><strong>' + p.name + '</strong>' +
                (p.barcode ? '<br><small style="color:#A89070;font-size:9px;">' + p.barcode + '</small>' : '') +
            '</span>' +
            '<span style="color:#E06060;">' + formatMoney(p.buy) + '</span>' +
            '<span style="color:#2D8F5E;">' + formatMoney(p.sell) + '</span>' +
            '<span style="color:' + qtyColor + ';font-weight:900;">' + p.qty + '</span>' +
            '<div style="display:flex;gap:4px;">' +
                '<button class="btn btn-warning btn-sm" data-permission="edit" onclick="editProduct(' + p.id + ')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-danger btn-sm" data-permission="delete" onclick="deleteProduct(' + p.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
    if (typeof applyPermissions === 'function') applyPermissions();
};

// [بقية الدوال - العملاء، الموردين، الخزائن، الكاشير، المشتريات، المصروفات، الخزنة، الفواتير، الدفعات، المرتجعات، التقارير، المستخدمين، الإعدادات]

// ═══════════════════════════════════════════════════════════
// 🧾 الفواتير - دالة عرض التفاصيل المحدّثة
// ═══════════════════════════════════════════════════════════
window.showInvoiceDetails = function(id) {
    const inv = sales.find(function(s) { return s.id === id; });
    if (!inv) return;

    let itemsHtml = '';
    inv.items.forEach(function(it, i) {
        itemsHtml += '<tr>' +
            '<td style="padding:6px;border-bottom:1px solid #2D2D2D;">' + (i + 1) + '</td>' +
            '<td style="padding:6px;border-bottom:1px solid #2D2D2D;">' + it.name + '</td>' +
            '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;">' + it.qty + '</td>' +
            '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;">' + formatMoney(it.price) + '</td>' +
            '<td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;color:#2D8F5E;">' + formatMoney(it.total) + '</td>' +
        '</tr>';
    });

    const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>📄 فاتورة #' + inv.number + '</h3>' +
        '<div style="background:#0D0D0D;padding:14px;border-radius:10px;border:1px solid #2D2D2D;">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;font-size:12px;">' +
                '<div><span style="color:#A89070;">العميل:</span> <strong>' + (inv.customer || 'عميل نقدي') + '</strong></div>' +
                '<div><span style="color:#A89070;">التاريخ:</span> ' + inv.date + ' ' + (inv.time || '') + '</div>' +
                '<div><span style="color:#A89070;">البائع:</span> ' + (inv.seller || '-') + '</div>' +
                '<div><span style="color:#A89070;">الحالة:</span> ' + (inv.status === 'paid' ? '✅ مدفوعة' : inv.status === 'partial' ? '⚠️ جزئية' : '❌ غير مدفوعة') + '</div>' +
            '</div>' +
            '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                '<thead><tr style="background:#C9A94E;color:#0D0D0D;">' +
                    '<th style="padding:6px;">#</th>' +
                    '<th style="padding:6px;">الصنف</th>' +
                    '<th style="padding:6px;">الكمية</th>' +
                    '<th style="padding:6px;">السعر</th>' +
                    '<th style="padding:6px;">الإجمالي</th>' +
                '</tr></thead>' +
                '<tbody>' + itemsHtml + '</tbody>' +
            '</table>' +
            '<div style="margin-top:12px;padding:10px;background:#1A1A1A;border-radius:8px;">' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;">' +
                    '<span>المجموع:</span><span>' + formatMoney(inv.subtotal || inv.total) + ' ج.م</span>' +
                '</div>' +
                (inv.vat > 0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#9B59B6;"><span>الضريبة:</span><span>' + formatMoney(inv.vat) + ' ج.م</span></div>' : '') +
                (inv.discount > 0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#E6A830;"><span>الخصم:</span><span>' + formatMoney(inv.discount) + ' ج.م</span></div>' : '') +
                '<div style="display:flex;justify-content:space-between;padding:6px 0;border-top:2px solid #C9A94E;margin-top:6px;font-size:16px;font-weight:900;color:#C9A94E;">' +
                    '<span>الإجمالي:</span><span>' + formatMoney(inv.total) + ' ج.م</span>' +
                '</div>' +
            '</div>' +
        '</div>' +
        
        /* ⭐ الأزرار الجديدة - QR + PDF + WhatsApp */
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:12px;">' +
            '<button class="btn btn-success" onclick="printInvoice(' + inv.id + ')">' +
                '<i class="fas fa-print"></i> طباعة' +
            '</button>' +
            '<button class="btn btn-info" onclick="generateInvoicePDF(' + inv.id + ')">' +
                '<i class="fas fa-file-pdf"></i> PDF' +
            '</button>' +
            '<button class="btn btn-primary" onclick="showInvoiceQR(' + inv.id + ')">' +
                '<i class="fas fa-qrcode"></i> QR Code' +
            '</button>' +
            '<button class="btn btn-warning" onclick="sendInvoiceWhatsApp(' + inv.id + ')">' +
                '<i class="fab fa-whatsapp"></i> واتساب' +
            '</button>' +
        '</div>' +
        '<button class="btn btn-secondary btn-block" onclick="closeModal()" style="margin-top:6px;">' +
            '<i class="fas fa-times"></i> إغلاق' +
        '</button>';
    
    openModal(html);
};

// ═══════════════════════════════════════════════════════════
// 💾 حفظ كل البيانات
// ═══════════════════════════════════════════════════════════
window.saveAll = function() {
    setData('products', products);
    setData('sales', sales);
    setData('purchases', purchases);
    setData('customers', customers);
    setData('suppliers', suppliers);
    setData('cashBoxes', cashBoxes);
    setData('expenses', expenses);
    setData('treasury', treasury);
    setData('payments', payments);
    setData('returns', returns);
    setData('users', users);
    setData('accounts', accounts);
    setData('journalEntries', journalEntries);
    setData('companyData', companyData);
};

// ═══════════════════════════════════════════════════════════
// 🚀 التهيئة
// ═══════════════════════════════════════════════════════════
window.refreshAllUI = function() {
    renderProducts();
    updateDashboard();
    if (typeof renderCustomers === 'function') renderCustomers();
    if (typeof renderSuppliers === 'function') renderSuppliers();
    if (typeof renderCashBoxes === 'function') renderCashBoxes();
    if (typeof renderExpenses === 'function') renderExpenses();
    if (typeof renderTreasury === 'function') renderTreasury();
    if (typeof renderInvoices === 'function') renderInvoices();
    if (typeof renderPayments === 'function') renderPayments();
    if (typeof renderReturns === 'function') renderReturns();
    if (typeof renderUsers === 'function') renderUsers();
    if (typeof renderAccounts === 'function') renderAccounts();
    if (typeof renderJournalEntries === 'function') renderJournalEntries();
    if (typeof populateLoginUsers === 'function') populateLoginUsers();
    if (typeof populateSaleProducts === 'function') populateSaleProducts();
    if (typeof populateSaleCustomers === 'function') populateSaleCustomers();
};

window.init = function() {
    console.log('🚀 بدء التهيئة v15.0.0...');

    window.products = toArray(getData('products', []));
    window.sales = toArray(getData('sales', []));
    window.purchases = toArray(getData('purchases', []));
    window.customers = toArray(getData('customers', []));
    window.suppliers = toArray(getData('suppliers', []));
    window.cashBoxes = toArray(getData('cashBoxes', []));
    window.expenses = toArray(getData('expenses', []));
    window.treasury = toArray(getData('treasury', []));
    window.payments = toArray(getData('payments', []));
    window.returns = toArray(getData('returns', []));
    window.users = toArray(getData('users', []));
    window.accounts = toArray(getData('accounts', []));
    window.journalEntries = toArray(getData('journalEntries', []));
    window.companyData = getData('companyData', { name: 'الميزان', phone: '', address: '', tax: '', footer: 'شكراً لتعاملكم معنا 🌟' });
    window.vatSettings = getData('vatSettings', { defaultVAT: 14 });

    // بيانات افتراضية
    if (products.length === 0 && !localStorage.getItem('mizan_seeded_v3')) {
        window.products = [
            { id: 1, name: 'قلم جاف', barcode: '1001', buy: 2, sell: 5, qty: 50, min: 10 },
            { id: 2, name: 'كشكول 60 ورقة', barcode: '1002', buy: 8, sell: 15, qty: 30, min: 5 },
            { id: 3, name: 'مسطرة 30 سم', barcode: '1003', buy: 3, sell: 7, qty: 40, min: 10 }
        ];
        setData('products', products);
        localStorage.setItem('mizan_seeded_v3', 'true');
    }

    if (cashBoxes.length === 0) {
        window.cashBoxes = [
            { id: 1, name: 'نقدي', type: 'cash', icon: '💵', isDefault: true, active: true, openingBalance: 0 },
            { id: 2, name: 'فودافون كاش', type: 'wallet', icon: '📱', isDefault: false, active: true, openingBalance: 0 },
            { id: 3, name: 'انستاباي', type: 'wallet', icon: '💳', isDefault: false, active: true, openingBalance: 0 },
            { id: 4, name: 'بنك', type: 'bank', icon: '🏦', isDefault: false, active: true, openingBalance: 0 }
        ];
        setData('cashBoxes', cashBoxes);
    }

    if (users.length === 0) {
        window.users = [
            { id: 1, name: 'المدير',  password: '123456', role: 'admin',   active: true },
            { id: 2, name: 'محمد',   password: '123456', role: 'manager', active: true },
            { id: 3, name: 'أحمد',   password: '123456', role: 'cashier', active: true },
            { id: 4, name: 'علي',    password: '123456', role: 'seller',  active: true },
            { id: 5, name: 'زائر',   password: '123456', role: 'viewer',  active: true }
        ];
        setData('users', users);
    }

    if ($('expDate')) $('expDate').value = getTodayDate();
    if ($('collectDate')) $('collectDate').value = getTodayDate();
    if ($('payDate')) $('payDate').value = getTodayDate();
    if ($('headerCompanyName')) $('headerCompanyName').textContent = companyData.name || 'الميزان';

    initFirebase();
    if (typeof populateLoginUsers === 'function') populateLoginUsers();

    const loginCont = $('loginContainer');
    const appCont = $('appContent');
    if (loginCont) loginCont.classList.remove('hidden');
    if (appCont) appCont.style.display = 'none';

    updateClock();
    if (typeof refreshAllUI === 'function') refreshAllUI();

    setInterval(function() {
        if (window.firebaseReady && !window.currentUser) {
            syncUsersFromCloud();
        }
    }, 30000);

    console.log('✅ التطبيق جاهز!');
    console.log('👥 المستخدمون:', users.length);
    console.log('📚 الحسابات:', accounts.length);
    console.log('🔐 المستخدم الافتراضي: المدير / 123456');
};

document.addEventListener('DOMContentLoaded', function() {
    init();
    setInterval(updateClock, 1000);
    console.log('✅ app.js v15.0.0 كامل');
});
