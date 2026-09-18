// ============================================================
// الميزان 14.0.0 - app.js - ملف كامل
// الجزء 1: الأساسيات + Firebase + المنتجات + العملاء + الموردين + الخزائن
// ============================================================

console.log('🚀 تحميل app.js - الجزء 1');

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
    appId: "1:564321427560:web:170368d708c4d9dd771bdd",
    measurementId: "G-D6K2GYLBKD"
};

window.firebaseReady = false;

// ═══════════════════════════════════════════════════════════
// 📦 البيانات الأساسية
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
window.getNowTime = function() { return new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }); };

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
    const now = new Date();
    const dateStr = String(now.getDate()).padStart(2, '0') + '/' +
                    String(now.getMonth() + 1).padStart(2, '0') + '/' +
                    now.getFullYear();
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
    if (el) el.textContent = dateStr + ' ' + timeStr;
    const invDateEl = $('invDateDisplay');
    const invTimeEl = $('invTimeDisplay');
    if (invDateEl) invDateEl.value = dateStr;
    if (invTimeEl) invTimeEl.value = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
};

// ═══════════════════════════════════════════════════════════
// ☁️ Firebase Functions
// ═══════════════════════════════════════════════════════════
window.initFirebase = function() {
    try {
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK غير محمّل');
            return false;
        }
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }
        window.firebaseReady = true;
        console.log('✅ Firebase جاهز - Project:', firebaseConfig.projectId);
        return true;
    } catch (e) {
        console.error('❌ خطأ Firebase:', e);
        window.firebaseReady = false;
        return false;
    }
};

window.getFirebaseRef = function() {
    if (!firebaseReady) return null;
    try {
        return firebase.database().ref('mizan');
    } catch (e) {
        console.error('❌ خطأ ref:', e);
        return null;
    }
};

window.syncToCloud = function() {
    const ref = getFirebaseRef();
    if (!ref) { showToast('⚠️ Firebase غير متصل', 'error'); return; }

    const data = {
        products: products || [],
        sales: sales || [],
        purchases: purchases || [],
        customers: customers || [],
        suppliers: suppliers || [],
        cashBoxes: cashBoxes || [],
        expenses: expenses || [],
        treasury: treasury || [],
        payments: payments || [],
        returns: returns || [],
        users: users || [],
        companyData: companyData || {},
        vatSettings: vatSettings || {},
        lastSync: new Date().toISOString(),
        syncedBy: currentUser ? currentUser.name : 'unknown',
        version: '14.0.0'
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

    const cleanData = cleanForFirebase(data);

    showToast('⏳ جاري الرفع للسحابة...', 'info');
    updateSyncStatus('⏳ جاري الرفع...', 'info');

    ref.set(cleanData)
        .then(function() {
            showToast('✅ تم الرفع للسحابة', 'success');
            updateSyncStatus('🟢 متصل - آخر رفع: ' + getNowTime(), 'success');
            console.log('✅ تم رفع البيانات للسحابة');
        })
        .catch(function(err) {
            console.error('❌ فشل الرفع:', err);
            showToast('❌ فشل الرفع: ' + err.message, 'error');
            updateSyncStatus('🔴 فشل الرفع', 'error');
        });
};

window.syncFromCloud = function(silent) {
    const ref = getFirebaseRef();
    if (!ref) {
        if (!silent) showToast('⚠️ Firebase غير متصل', 'error');
        return;
    }

    if (!silent && !confirm('⚠️ سيتم استبدال البيانات الحالية ببيانات السحابة.\n\nمتابعة؟')) return;

    if (!silent) {
        showToast('⏳ جاري التحميل من السحابة...', 'info');
        updateSyncStatus('⏳ جاري التحميل...', 'info');
    }

    ref.once('value')
        .then(function(snapshot) {
            if (!snapshot.exists()) {
                if (!silent) showToast('⚠️ لا توجد بيانات سحابية', 'warning');
                updateSyncStatus('⚪ لا توجد بيانات سحابية', 'warning');
                return;
            }

            const data = snapshot.val();

            if (data.products) window.products = data.products;
            if (data.sales) window.sales = data.sales;
            if (data.purchases) window.purchases = data.purchases;
            if (data.customers) window.customers = data.customers;
            if (data.suppliers) window.suppliers = data.suppliers;
            if (data.cashBoxes) window.cashBoxes = data.cashBoxes;
            if (data.expenses) window.expenses = data.expenses;
            if (data.treasury) window.treasury = data.treasury;
            if (data.payments) window.payments = data.payments;
            if (data.returns) window.returns = data.returns;
            if (data.users) window.users = data.users;
            if (data.companyData) window.companyData = data.companyData;
            if (data.vatSettings) window.vatSettings = data.vatSettings;

            saveAll();

            renderProducts();
            updateDashboard();
            renderCustomers();
            renderSuppliers();
            renderCashBoxes();
            renderExpenses();
            renderTreasury();
            renderInvoices();
            renderPayments();
            renderReturns();
            renderUsers();
            renderSettings();
            populateSaleProducts();
            populateSaleCustomers();
            populatePurProducts();
            populatePurSuppliers();
            populateCashBoxDropdowns();
            populateCollectCustomers();
            populatePaySuppliers();
            populateRetProducts();

            if (!silent) showToast('✅ تم التحميل بنجاح', 'success');
            updateSyncStatus('🟢 متصل - آخر تحميل: ' + getNowTime(), 'success');
            console.log('✅ تم تحميل البيانات من السحابة');
        })
        .catch(function(err) {
            console.error('❌ فشل التحميل:', err);
            if (!silent) showToast('❌ فشل التحميل: ' + err.message, 'error');
            updateSyncStatus('🔴 فشل التحميل', 'error');
        });
};

window.updateSyncStatus = function(msg, type) {
    type = type || 'info';
    let statusEl = $('syncStatus');
    if (!statusEl) {
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            statusEl = document.createElement('span');
            statusEl.id = 'syncStatus';
            statusEl.style.cssText = 'font-size:9px;color:#A89070;background:#0D0D0D;padding:3px 8px;border-radius:6px;border:1px solid #2D2D2D;font-weight:700;';
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
            console.log('🔄 مزامنة تلقائية...');
            syncToCloud();
        }
    }, 5 * 60 * 1000);
    console.log('✅ تم تفعيل المزامنة التلقائية');
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

window.updateConnectionStatus = function() {
    if (!firebaseReady) {
        updateSyncStatus('⚪ Firebase غير مُعد', 'warning');
        return;
    }
    try {
        const ref = firebase.database().ref('.info/connected');
        ref.on('value', function(snap) {
            if (snap.val() === true) {
                updateSyncStatus('🟢 متصل', 'success');
            } else {
                updateSyncStatus('🔴 غير متصل', 'error');
            }
        });
    } catch (e) {
        console.warn('⚠️ مراقبة الاتصال غير متاحة:', e.message);
    }
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
        admin:   ['add', 'edit', 'delete', 'view', 'manage_users', 'settings', 'view_reports', 'clear_data'],
        manager: ['add', 'edit', 'view', 'view_reports', 'settings'],
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
window.canViewSettings = function() { return hasPermission('settings'); };

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
    if (page === 'reports') renderReport(currentReport);
    if (page === 'users') renderUsers();
    if (page === 'settings') { renderSettings(); renderFirebaseSettingsSection(); }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ═══════════════════════════════════════════════════════════
// 💾 المنتجات
// ═══════════════════════════════════════════════════════════
window.saveProduct = function() {
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
            products[idx] = Object.assign({}, products[idx], { name: name, barcode: barcode, buy: buy, sell: sell, qty: qty, min: min });
            showToast('✅ تم التعديل', 'success');
        }
    } else {
        if (products.find(function(p) { return p.name === name; })) { showToast('⚠️ الاسم موجود', 'warning'); return; }
        products.push({ id: Date.now(), name: name, barcode: barcode, buy: buy, sell: sell, qty: qty, min: min });
        showToast('✅ تم الإضافة', 'success');
    }
    setData('products', products);
    resetProductForm();
    renderProducts();
    updateDashboard();
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
    const p = products.find(function(pr) { return pr.id == id; });
    if (!p) return;
    if (!confirm('⚠️ حذف "' + p.name + '"؟')) return;
    window.products = products.filter(function(pr) { return pr.id !== id; });
    setData('products', products);
    renderProducts();
    updateDashboard();
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
                '<button class="btn btn-warning btn-sm" onclick="editProduct(' + p.id + ')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteProduct(' + p.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// 👥 العملاء
// ═══════════════════════════════════════════════════════════
window.saveCustomer = function() {
    const id = $('customerId') ? $('customerId').value : '';
    const name = $('customerName') ? $('customerName').value.trim() : '';
    const phone = $('customerPhone') ? $('customerPhone').value.trim() : '';
    const whatsapp = $('customerWhatsapp') ? $('customerWhatsapp').value.trim() : '';
    const address = $('customerAddress') ? $('customerAddress').value.trim() : '';
    if (!name) { showToast('⚠️ أدخل اسم العميل', 'error'); return; }

    if (id) {
        const idx = customers.findIndex(function(c) { return c.id == id; });
        if (idx > -1) {
            customers[idx] = Object.assign({}, customers[idx], { name: name, phone: phone, whatsapp: whatsapp, address: address });
            showToast('✅ تم التعديل', 'success');
        }
    } else {
        if (customers.find(function(c) { return c.name === name; })) { showToast('⚠️ الاسم موجود', 'warning'); return; }
        customers.push({ id: Date.now(), name: name, phone: phone, whatsapp: whatsapp, address: address });
        showToast('✅ تم الإضافة', 'success');
    }
    setData('customers', customers);
    resetCustomerForm();
    renderCustomers();
    populateSaleCustomers();
    populateCollectCustomers();
    updateDashboard();
};

window.resetCustomerForm = function() {
    ['customerId','customerName','customerPhone','customerWhatsapp','customerAddress'].forEach(function(id) {
        if ($(id)) $(id).value = '';
    });
    if ($('customerFormTitle')) $('customerFormTitle').textContent = '➕ إضافة عميل';
    if ($('customerSaveBtnText')) $('customerSaveBtnText').textContent = 'إضافة';
};

window.editCustomer = function(id) {
    const c = customers.find(function(cu) { return cu.id == id; });
    if (!c) return;
    if ($('customerId')) $('customerId').value = c.id;
    if ($('customerName')) $('customerName').value = c.name;
    if ($('customerPhone')) $('customerPhone').value = c.phone || '';
    if ($('customerWhatsapp')) $('customerWhatsapp').value = c.whatsapp || '';
    if ($('customerAddress')) $('customerAddress').value = c.address || '';
    if ($('customerFormTitle')) $('customerFormTitle').textContent = '✏️ تعديل';
    if ($('customerSaveBtnText')) $('customerSaveBtnText').textContent = 'حفظ';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteCustomer = function(id) {
    const c = customers.find(function(cu) { return cu.id == id; });
    if (!c) return;
    if (!confirm('⚠️ حذف "' + c.name + '"؟')) return;
    window.customers = customers.filter(function(cu) { return cu.id !== id; });
    setData('customers', customers);
    renderCustomers();
    populateSaleCustomers();
    populateCollectCustomers();
    updateDashboard();
    showToast('🗑️ تم الحذف', 'info');
};

window.getCustomerBalance = function(customerName) {
    if (!customerName || customerName === 'عميل نقدي') return 0;
    return Math.max(0, sales.filter(function(s) { return s.customer === customerName && s.paymentMethod === 'credit'; })
        .reduce(function(sum, s) { return sum + (s.remainingAmount !== undefined ? s.remainingAmount : s.total); }, 0));
};

window.renderCustomers = function() {
    const c = $('customerList');
    if (!c) return;
    const searchInput = $('customerSearch');
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let filtered = search ? customers.filter(function(cu) { return cu.name.toLowerCase().indexOf(search) > -1; }) : customers;
    if (filtered.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><span>لا يوجد عملاء</span></div>';
        return;
    }
    let html = '<div class="table-header" style="grid-template-columns: 1.3fr 1fr 1fr 1.5fr;"><span>الاسم</span><span>الهاتف</span><span>المديونية</span><span></span></div>';
    filtered.forEach(function(cu) {
        const balance = getCustomerBalance(cu.name);
        html += '<div class="table-row" style="grid-template-columns: 1.3fr 1fr 1fr 1.5fr;">' +
            '<span><strong>' + cu.name + '</strong>' +
                (cu.address ? '<br><small style="color:#A89070;font-size:9px;">📍 ' + cu.address + '</small>' : '') +
            '</span>' +
            '<span style="font-size:11px;color:#A89070;">' + (cu.phone || '-') + '</span>' +
            '<span style="color:' + (balance > 0 ? '#E06060' : '#2D8F5E') + ';font-weight:900;">' + formatMoney(balance) + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-warning btn-sm" onclick="editCustomer(' + cu.id + ')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteCustomer(' + cu.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// 🚚 الموردين
// ═══════════════════════════════════════════════════════════
window.saveSupplier = function() {
    const id = $('supplierId') ? $('supplierId').value : '';
    const name = $('supplierName') ? $('supplierName').value.trim() : '';
    const phone = $('supplierPhone') ? $('supplierPhone').value.trim() : '';
    const whatsapp = $('supplierWhatsapp') ? $('supplierWhatsapp').value.trim() : '';
    const address = $('supplierAddress') ? $('supplierAddress').value.trim() : '';
    if (!name) { showToast('⚠️ أدخل اسم المورد', 'error'); return; }

    if (id) {
        const idx = suppliers.findIndex(function(s) { return s.id == id; });
        if (idx > -1) {
            suppliers[idx] = Object.assign({}, suppliers[idx], { name: name, phone: phone, whatsapp: whatsapp, address: address });
            showToast('✅ تم التعديل', 'success');
        }
    } else {
        if (suppliers.find(function(s) { return s.name === name; })) { showToast('⚠️ الاسم موجود', 'warning'); return; }
        suppliers.push({ id: Date.now(), name: name, phone: phone, whatsapp: whatsapp, address: address });
        showToast('✅ تم الإضافة', 'success');
    }
    setData('suppliers', suppliers);
    resetSupplierForm();
    renderSuppliers();
    populatePurSuppliers();
    populatePaySuppliers();
    updateDashboard();
};

window.resetSupplierForm = function() {
    ['supplierId','supplierName','supplierPhone','supplierWhatsapp','supplierAddress'].forEach(function(id) {
        if ($(id)) $(id).value = '';
    });
    if ($('supplierFormTitle')) $('supplierFormTitle').textContent = '➕ إضافة مورد';
    if ($('supplierSaveBtnText')) $('supplierSaveBtnText').textContent = 'إضافة';
};

window.editSupplier = function(id) {
    const s = suppliers.find(function(su) { return su.id == id; });
    if (!s) return;
    if ($('supplierId')) $('supplierId').value = s.id;
    if ($('supplierName')) $('supplierName').value = s.name;
    if ($('supplierPhone')) $('supplierPhone').value = s.phone || '';
    if ($('supplierWhatsapp')) $('supplierWhatsapp').value = s.whatsapp || '';
    if ($('supplierAddress')) $('supplierAddress').value = s.address || '';
    if ($('supplierFormTitle')) $('supplierFormTitle').textContent = '✏️ تعديل';
    if ($('supplierSaveBtnText')) $('supplierSaveBtnText').textContent = 'حفظ';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteSupplier = function(id) {
    const s = suppliers.find(function(su) { return su.id == id; });
    if (!s) return;
    if (!confirm('⚠️ حذف "' + s.name + '"؟')) return;
    window.suppliers = suppliers.filter(function(su) { return su.id !== id; });
    setData('suppliers', suppliers);
    renderSuppliers();
    populatePurSuppliers();
    populatePaySuppliers();
    updateDashboard();
    showToast('🗑️ تم الحذف', 'info');
};

window.getSupplierBalance = function(supplierName) {
    if (!supplierName) return 0;
    return Math.max(0, purchases.filter(function(p) { return p.supplierName === supplierName && p.payment === 'credit'; })
        .reduce(function(sum, p) { return sum + (p.remainingAmount !== undefined ? p.remainingAmount : p.total); }, 0));
};

window.renderSuppliers = function() {
    const c = $('supplierList');
    if (!c) return;
    const searchInput = $('supplierSearch');
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let filtered = search ? suppliers.filter(function(s) { return s.name.toLowerCase().indexOf(search) > -1; }) : suppliers;
    if (filtered.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-truck"></i><span>لا يوجد موردين</span></div>';
        return;
    }
    let html = '<div class="table-header" style="grid-template-columns: 1.3fr 1fr 1fr 1.5fr;"><span>الاسم</span><span>الهاتف</span><span>المديونية</span><span></span></div>';
    filtered.forEach(function(s) {
        const balance = getSupplierBalance(s.name);
        html += '<div class="table-row" style="grid-template-columns: 1.3fr 1fr 1fr 1.5fr;">' +
            '<span><strong>' + s.name + '</strong>' +
                (s.address ? '<br><small style="color:#A89070;font-size:9px;">📍 ' + s.address + '</small>' : '') +
            '</span>' +
            '<span style="font-size:11px;color:#A89070;">' + (s.phone || '-') + '</span>' +
            '<span style="color:' + (balance > 0 ? '#E6A830' : '#2D8F5E') + ';font-weight:900;">' + formatMoney(balance) + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-warning btn-sm" onclick="editSupplier(' + s.id + ')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteSupplier(' + s.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// 💰 الخزائن
// ═══════════════════════════════════════════════════════════
window.getCashBoxById = function(id) { return cashBoxes.find(function(b) { return b.id == id; }); };
window.getDefaultCashBox = function() { return cashBoxes.find(function(b) { return b.isDefault; }) || cashBoxes[0]; };

window.getCashBoxBalance = function(boxId) {
    let balance = 0;
    const box = getCashBoxById(boxId);
    if (box && box.openingBalance) balance += parseFloat(box.openingBalance) || 0;
    treasury.forEach(function(t) {
        if (t.cashBoxId == boxId) {
            if (t.type === 'deposit') balance += (parseFloat(t.amount) || 0);
            else if (t.type === 'withdraw') balance -= (parseFloat(t.amount) || 0);
        }
    });
    return balance;
};

window.getTotalCashBalance = function() {
    return cashBoxes.reduce(function(s, box) { return s + getCashBoxBalance(box.id); }, 0);
};

window.getBoxTypeName = function(type) {
    const types = { 'cash': '💵 نقدي', 'wallet': '📱 محفظة', 'bank': '🏦 بنكي', 'visa': '💳 فيزا', 'other': '📋 أخرى' };
    return types[type] || type;
};

window.saveCashBox = function() {
    const id = $('cashBoxId') ? $('cashBoxId').value : '';
    const name = $('cashBoxName') ? $('cashBoxName').value.trim() : '';
    const type = $('cashBoxType') ? $('cashBoxType').value : 'cash';
    const icon = $('cashBoxIcon') ? $('cashBoxIcon').value : '💵';
    const details = $('cashBoxDetails') ? $('cashBoxDetails').value.trim() : '';
    const openingBalance = parseFloat($('cashBoxOpeningBalance') ? $('cashBoxOpeningBalance').value : 0) || 0;
    const isDefault = $('cashBoxIsDefault') ? $('cashBoxIsDefault').checked : false;
    if (!name) { showToast('⚠️ أدخل اسم الخزنة', 'error'); return; }

    if (id) {
        const idx = cashBoxes.findIndex(function(b) { return b.id == id; });
        if (idx > -1) {
            if (isDefault) cashBoxes.forEach(function(b) { b.isDefault = false; });
            cashBoxes[idx] = Object.assign({}, cashBoxes[idx], { name: name, type: type, icon: icon, details: details, openingBalance: openingBalance, isDefault: isDefault || cashBoxes[idx].isDefault });
            showToast('✅ تم التعديل', 'success');
        }
    } else {
        if (cashBoxes.find(function(b) { return b.name === name; })) { showToast('⚠️ الاسم موجود', 'warning'); return; }
        if (isDefault) cashBoxes.forEach(function(b) { b.isDefault = false; });
        cashBoxes.push({ id: Date.now(), name: name, type: type, icon: icon, details: details, openingBalance: openingBalance, isDefault: isDefault || cashBoxes.length === 0, active: true });
        showToast('✅ تم الإضافة', 'success');
    }
    setData('cashBoxes', cashBoxes);
    resetCashBoxForm();
    renderCashBoxes();
    populateCashBoxDropdowns();
};

window.resetCashBoxForm = function() {
    ['cashBoxId','cashBoxName','cashBoxDetails'].forEach(function(id) { if ($(id)) $(id).value = ''; });
    if ($('cashBoxType')) $('cashBoxType').value = 'cash';
    if ($('cashBoxIcon')) $('cashBoxIcon').value = '💵';
    if ($('cashBoxOpeningBalance')) $('cashBoxOpeningBalance').value = '0';
    if ($('cashBoxIsDefault')) $('cashBoxIsDefault').checked = false;
    if ($('cashBoxFormTitle')) $('cashBoxFormTitle').textContent = '➕ إضافة خزنة جديدة';
    if ($('cashBoxSaveBtnText')) $('cashBoxSaveBtnText').textContent = 'إضافة';
};

window.editCashBox = function(id) {
    const box = getCashBoxById(id);
    if (!box) return;
    if ($('cashBoxId')) $('cashBoxId').value = box.id;
    if ($('cashBoxName')) $('cashBoxName').value = box.name;
    if ($('cashBoxType')) $('cashBoxType').value = box.type;
    if ($('cashBoxIcon')) $('cashBoxIcon').value = box.icon || '💵';
    if ($('cashBoxDetails')) $('cashBoxDetails').value = box.details || '';
    if ($('cashBoxOpeningBalance')) $('cashBoxOpeningBalance').value = box.openingBalance || 0;
    if ($('cashBoxIsDefault')) $('cashBoxIsDefault').checked = box.isDefault || false;
    if ($('cashBoxFormTitle')) $('cashBoxFormTitle').textContent = '✏️ تعديل';
    if ($('cashBoxSaveBtnText')) $('cashBoxSaveBtnText').textContent = 'حفظ';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteCashBox = function(id) {
    const box = getCashBoxById(id);
    if (!box) return;
    if (box.isDefault) { showToast('⚠️ لا يمكن حذف الافتراضية', 'error'); return; }
    const balance = getCashBoxBalance(id);
    if (balance !== 0) {
        if (!confirm('⚠️ الخزنة فيها ' + formatMoney(balance) + ' ج.م. متابعة؟')) return;
    } else {
        if (!confirm('⚠️ حذف "' + box.name + '"؟')) return;
    }
    window.cashBoxes = cashBoxes.filter(function(b) { return b.id != id; });
    setData('cashBoxes', cashBoxes);
    renderCashBoxes();
    populateCashBoxDropdowns();
    showToast('🗑️ تم الحذف', 'info');
};

window.setDefaultCashBox = function(id) {
    cashBoxes.forEach(function(b) { b.isDefault = false; });
    const box = getCashBoxById(id);
    if (box) box.isDefault = true;
    setData('cashBoxes', cashBoxes);
    renderCashBoxes();
    populateCashBoxDropdowns();
    showToast('⭐ تم التعيين', 'success');
};

window.renderCashBoxes = function() {
    const c = $('cashBoxList');
    if (!c) return;
    if (cashBoxes.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-vault"></i><span>لا توجد خزائن</span></div>';
        if ($('cbCount')) $('cbCount').textContent = '0';
        if ($('cbTotal')) $('cbTotal').textContent = '0.00';
        return;
    }
    const total = getTotalCashBalance();
    if ($('cbCount')) $('cbCount').textContent = cashBoxes.length;
    if ($('cbTotal')) $('cbTotal').textContent = formatMoney(total);

    let html = '';
    cashBoxes.forEach(function(box) {
        const balance = getCashBoxBalance(box.id);
        html += '<div class="cash-box-card ' + (box.isDefault ? 'default' : '') + '" style="margin-bottom:10px;">' +
            '<div class="cash-box-header">' +
                '<div class="cash-box-icon">' + (box.icon || '💵') + '</div>' +
                '<div class="cash-box-info">' +
                    '<div class="cash-box-name">' + box.name + (box.isDefault ? ' ⭐' : '') + '</div>' +
                    '<div class="cash-box-type">' + getBoxTypeName(box.type) + '</div>' +
                    (box.details ? '<div class="cash-box-details">' + box.details + '</div>' : '') +
                '</div>' +
            '</div>' +
            '<div class="cash-box-balance">' +
                '<div class="balance-label">الرصيد الحالي</div>' +
                '<div class="balance-value">' + formatMoney(balance) + ' ج.م</div>' +
            '</div>' +
            '<div class="cash-box-actions">' +
                (!box.isDefault ? '<button class="btn-icon-sm" onclick="setDefaultCashBox(' + box.id + ')">⭐</button>' : '') +
                '<button class="btn-icon-sm" onclick="editCashBox(' + box.id + ')">✏️</button>' +
                '<button class="btn-icon-sm danger" onclick="deleteCashBox(' + box.id + ')">🗑️</button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.populateCashBoxDropdowns = function() {
    const ids = ['saleCashBox', 'purCashBox', 'expCashBox', 'manualCashBox', 'collectCashBox', 'payCashBox', 'retCashBox'];
    const defaultBox = getDefaultCashBox();

    ids.forEach(function(id) {
        const sel = $(id);
        if (!sel) return;
        const cv = sel.value;
        let html = '<option value="">اختر الخزنة...</option>';
        cashBoxes.filter(function(b) { return b.active !== false; }).forEach(function(box) {
            html += '<option value="' + box.id + '">' + (box.icon || '') + ' ' + box.name + (box.isDefault ? ' ⭐' : '') + '</option>';
        });
        sel.innerHTML = html;
        if (cv) sel.value = cv;
        else if (defaultBox) sel.value = defaultBox.id;
    });
};

console.log('✅ تم تحميل app.js - الجزء 1 كاملاً');

// ============================================================
// الميزان 14.0.0 - app.js - ملف كامل
// الجزء 2: الكاشير + المشتريات + المصروفات + الخزنة + الفواتير
// ============================================================

console.log('🚀 تحميل app.js - الجزء 2');

// ═══════════════════════════════════════════════════════════
// 💰 الكاشير
// ═══════════════════════════════════════════════════════════
window.populateSaleProducts = function() {
    const sel = $('saleProduct');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر منتج...</option>';
    products.forEach(function(p) {
        sel.innerHTML += '<option value="' + p.id + '">' + p.name + ' (متاح: ' + p.qty + ')</option>';
    });
    sel.value = cv;
};

window.populateSaleCustomers = function() {
    const sel = $('saleCustomer');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">عميل نقدي</option>';
    customers.forEach(function(c) {
        sel.innerHTML += '<option value="' + c.name + '">' + c.name + '</option>';
    });
    sel.value = cv;
};

window.updateSalePrice = function() {
    const id = $('saleProduct') ? $('saleProduct').value : '';
    const priceInput = $('salePrice');
    if (!id) { if (priceInput) priceInput.value = ''; return; }
    const product = products.find(function(pr) { return pr.id == id; });
    if (product && priceInput) priceInput.value = product.sell;
};

window.addSaleItem = function() {
    const productSelect = $('saleProduct');
    const qtyInput = $('saleQty');
    const priceInput = $('salePrice');
    const id = productSelect ? productSelect.value : '';
    let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
    let price = parseFloat(priceInput ? priceInput.value : 0) || 0;

    if (!id) { showToast('⚠️ اختر منتج', 'error'); return; }
    const p = products.find(function(pr) { return pr.id == id; });
    if (!p) return;
    if (price <= 0) price = p.sell;
    if (qty <= 0) qty = 1;

    const ex = currentSaleItems.find(function(i) { return i.productId == id; });
    const totalQty = qty + (ex ? ex.qty : 0);
    if (totalQty > p.qty) { showToast('⚠️ المتاح: ' + p.qty, 'error'); return; }

    if (ex) {
        ex.qty += qty;
        ex.price = price;
        ex.total = ex.qty * ex.price;
    } else {
        currentSaleItems.push({ productId: p.id, name: p.name, qty: qty, price: price, costPrice: p.buy, total: qty * price });
    }

    if (qtyInput) qtyInput.value = 1;
    if (priceInput) priceInput.value = '';
    if (productSelect) productSelect.value = '';

    renderCashier();
    updateSaleTotals();
    showToast('✅ تم إضافة ' + p.name, 'success');
};

window.removeSaleItem = function(i) {
    currentSaleItems.splice(i, 1);
    renderCashier();
    updateSaleTotals();
};

window.renderCashier = function() {
    const c = $('saleItemsContainer');
    const tb = $('saleTotalBox');
    if (!c) return;
    const badge = $('itemsCountBadge');
    if (badge) badge.textContent = currentSaleItems.length;

    if (currentSaleItems.length === 0) {
        c.innerHTML = '<div class="empty-items"><i class="fas fa-shopping-cart"></i><span>لا توجد أصناف</span><small>أضف صنف من الأعلى</small></div>';
        if (tb) tb.style.display = 'none';
        return;
    }

    let html = '<div class="items-header-row"><span>ID</span><span>اسم الصنف</span><span>الوحدة</span><span>الكمية</span><span>السعر</span><span>الإجمالي</span><span></span></div>';
    currentSaleItems.forEach(function(it, i) {
        html += '<div class="item-row">' +
            '<span class="item-id">#' + String(it.productId).slice(-4) + '</span>' +
            '<span class="item-name">' + it.name + '</span>' +
            '<span class="item-unit">قطعة</span>' +
            '<span class="item-qty">' + it.qty + '</span>' +
            '<span class="item-price">' + formatMoney(it.price) + '</span>' +
            '<span class="item-total">' + formatMoney(it.qty * it.price) + '</span>' +
            '<button class="item-delete" onclick="removeSaleItem(' + i + ')"><i class="fas fa-times"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
    if (tb) tb.style.display = 'block';
};

window.updateSaleTotals = function() {
    const subtotal = currentSaleItems.reduce(function(s, i) { return s + i.total; }, 0);
    const totalQty = currentSaleItems.reduce(function(s, i) { return s + i.qty; }, 0);
    const invoiceType = getRadioValue('saleInvoiceType', 'simple');
    const isTax = invoiceType === 'tax';
    const vat = isTax ? (subtotal * (vatSettings.defaultVAT / 100)) : 0;
    const discount = parseFloat($('saleDiscount') ? $('saleDiscount').value : 0) || 0;
    const levelDiscount = parseFloat($('saleLevelDiscount') ? $('saleLevelDiscount').value : 0) || 0;
    const grandTotal = Math.max(0, subtotal + vat - discount - levelDiscount);

    if ($('statItemsCount')) $('statItemsCount').textContent = currentSaleItems.length;
    if ($('statTotalQty')) $('statTotalQty').textContent = totalQty;
    if ($('saleSubtotal')) $('saleSubtotal').textContent = formatMoney(subtotal);
    if ($('saleVAT')) $('saleVAT').textContent = formatMoney(vat);
    if ($('saleTotal')) $('saleTotal').textContent = formatMoney(grandTotal) + ' ج.م';
};

window.updateInvoiceHeader = function() {
    const now = new Date();
    if ($('invDateDisplay')) {
        $('invDateDisplay').value = String(now.getDate()).padStart(2, '0') + '/' +
            String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    }
    if ($('invTimeDisplay')) {
        $('invTimeDisplay').value = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }
    if ($('invNumberDisplay')) $('invNumberDisplay').textContent = '#' + (sales.length + 1);
};

window.saveSale = function() {
    if (currentSaleItems.length === 0) { showToast('⚠️ لا توجد أصناف', 'error'); return; }

    for (let i = 0; i < currentSaleItems.length; i++) {
        const it = currentSaleItems[i];
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (!p) { showToast('⚠️ المنتج غير موجود', 'error'); return; }
        if (p.qty < it.qty) { showToast('⚠️ الكمية غير كافية: ' + it.name, 'error'); return; }
    }

    const customer = $('saleCustomer') ? $('saleCustomer').value : 'عميل نقدي';
    const seller = $('saleSeller') ? $('saleSeller').value : '';
    const delivery = $('saleDelivery') ? $('saleDelivery').value : '';
    const shipping = $('saleShipping') ? $('saleShipping').value.trim() : '';
    const paymentMethod = getRadioValue('salePaymentMethod', 'cash');
    const invoiceType = getRadioValue('saleInvoiceType', 'simple');
    const isTax = invoiceType === 'tax';
    const cashBoxId = ($('saleCashBox') ? $('saleCashBox').value : '') || (getDefaultCashBox() ? getDefaultCashBox().id : null);
    const box = getCashBoxById(cashBoxId);

    const subtotal = currentSaleItems.reduce(function(s, i) { return s + i.total; }, 0);
    const vat = isTax ? (subtotal * (vatSettings.defaultVAT / 100)) : 0;
    const discount = parseFloat($('saleDiscount') ? $('saleDiscount').value : 0) || 0;
    const levelDiscount = parseFloat($('saleLevelDiscount') ? $('saleLevelDiscount').value : 0) || 0;
    const total = Math.max(0, subtotal + vat - discount - levelDiscount);

    const today = getTodayDate();
    let cogsTotal = 0;

    currentSaleItems.forEach(function(it) {
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (p) { it.costPrice = p.buy; cogsTotal += p.buy * it.qty; p.qty -= it.qty; }
    });

    const isCash = ['cash', 'wallet', 'visa', 'bank'].indexOf(paymentMethod) > -1;
    const inv = {
        id: Date.now(), number: sales.length + 1,
        customer: customer,
        customerId: (customers.find(function(c) { return c.name === customer; }) || {}).id || null,
        seller: seller, delivery: delivery, shipping: shipping,
        paymentMethod: paymentMethod, invoiceType: invoiceType,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        subtotal: subtotal, vat: vat, discount: discount, levelDiscount: levelDiscount, total: total,
        cogs: cogsTotal, profit: subtotal - cogsTotal - discount - levelDiscount,
        paidAmount: isCash ? total : 0,
        remainingAmount: isCash ? 0 : total,
        status: isCash ? 'paid' : 'unpaid',
        items: JSON.parse(JSON.stringify(currentSaleItems)),
        date: today, time: getNowTime(),
        soldBy: currentUser ? currentUser.name : ''
    };
    sales.push(inv);

    if (isCash) {
        treasury.push({
            id: Date.now() + 1, type: 'deposit', amount: total,
            note: 'فاتورة بيع #' + inv.number + ' - ' + customer,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'sale', refId: inv.id,
            date: today, time: getNowTime()
        });
    }

    setData('sales', sales);
    setData('products', products);
    setData('treasury', treasury);

    currentSaleItems = [];
    if ($('saleCustomer')) $('saleCustomer').value = '';
    if ($('saleDiscount')) $('saleDiscount').value = '0';
    if ($('saleLevelDiscount')) $('saleLevelDiscount').value = '0';
    if ($('saleDelivery')) $('saleDelivery').value = '';
    if ($('saleShipping')) $('saleShipping').value = '';
    setRadioValue('salePaymentMethod', 'cash');
    setRadioValue('saleInvoiceType', 'simple');

    renderCashier();
    updateSaleTotals();
    populateSaleProducts();
    updateInvoiceHeader();
    renderProducts();
    updateDashboard();
    renderCashBoxes();

    showToast('✅ فاتورة #' + inv.number + ' - ' + formatMoney(total) + (isCash ? ' 💵' : ' 📝 آجل'), 'success');
};

window.clearSale = function() {
    if (currentSaleItems.length === 0) return;
    if (!confirm('⚠️ إلغاء الفاتورة؟')) return;
    currentSaleItems = [];
    if ($('saleCustomer')) $('saleCustomer').value = '';
    if ($('saleDiscount')) $('saleDiscount').value = '0';
    if ($('saleLevelDiscount')) $('saleLevelDiscount').value = '0';
    if ($('saleDelivery')) $('saleDelivery').value = '';
    if ($('saleShipping')) $('saleShipping').value = '';
    renderCashier();
    updateSaleTotals();
    showToast('🗑️ تم الإلغاء', 'info');
};

// ═══════════════════════════════════════════════════════════
// 🛒 المشتريات
// ═══════════════════════════════════════════════════════════
window.populatePurProducts = function() {
    const sel = $('purProduct');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر منتج...</option>';
    products.forEach(function(p) {
        sel.innerHTML += '<option value="' + p.id + '">' + p.name + ' (شراء: ' + formatMoney(p.buy) + ')</option>';
    });
    sel.value = cv;
};

window.populatePurSuppliers = function() {
    const sel = $('purSupplier');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر مورد...</option>';
    suppliers.forEach(function(s) {
        sel.innerHTML += '<option value="' + s.name + '">' + s.name + '</option>';
    });
    sel.value = cv;
};

window.updatePurPrice = function() {
    const id = $('purProduct') ? $('purProduct').value : '';
    const priceInput = $('purPrice');
    if (!id) { if (priceInput) priceInput.value = ''; return; }
    const product = products.find(function(pr) { return pr.id == id; });
    if (product && priceInput) priceInput.value = product.buy;
};

window.addPurItem = function() {
    const productSelect = $('purProduct');
    const qtyInput = $('purQty');
    const priceInput = $('purPrice');
    const id = productSelect ? productSelect.value : '';
    let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
    let price = parseFloat(priceInput ? priceInput.value : 0) || 0;

    if (!id) { showToast('⚠️ اختر منتج', 'error'); return; }
    const p = products.find(function(pr) { return pr.id == id; });
    if (!p) return;
    if (price <= 0) price = p.buy;
    if (qty <= 0) qty = 1;

    const ex = currentPurItems.find(function(i) { return i.productId == id; });
    if (ex) {
        ex.qty += qty;
        ex.price = price;
        ex.total = ex.qty * ex.price;
    } else {
        currentPurItems.push({ productId: p.id, name: p.name, qty: qty, price: price, total: qty * price });
    }

    if (qtyInput) qtyInput.value = 1;
    if (priceInput) priceInput.value = '';
    if (productSelect) productSelect.value = '';

    renderPurItems();
    updatePurTotals();
    showToast('✅ تم الإضافة', 'success');
};

window.removePurItem = function(i) {
    currentPurItems.splice(i, 1);
    renderPurItems();
    updatePurTotals();
};

window.renderPurItems = function() {
    const c = $('purItemsContainer');
    const tb = $('purTotalBox');
    if (!c) return;

    if (currentPurItems.length === 0) {
        c.innerHTML = '<div class="empty-items"><i class="fas fa-shopping-cart"></i><span>لا توجد أصناف</span><small>أضف صنف من الأعلى</small></div>';
        if (tb) tb.style.display = 'none';
        return;
    }

    let html = '<div class="items-header-row"><span>ID</span><span>اسم الصنف</span><span>الوحدة</span><span>الكمية</span><span>السعر</span><span>الإجمالي</span><span></span></div>';
    currentPurItems.forEach(function(it, i) {
        html += '<div class="item-row">' +
            '<span class="item-id">#' + String(it.productId).slice(-4) + '</span>' +
            '<span class="item-name">' + it.name + '</span>' +
            '<span class="item-unit">قطعة</span>' +
            '<span class="item-qty">' + it.qty + '</span>' +
            '<span class="item-price">' + formatMoney(it.price) + '</span>' +
            '<span class="item-total" style="color:#E06060;">' + formatMoney(it.qty * it.price) + '</span>' +
            '<button class="item-delete" onclick="removePurItem(' + i + ')"><i class="fas fa-times"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
    if (tb) tb.style.display = 'block';
};

window.updatePurTotals = function() {
    const subtotal = currentPurItems.reduce(function(s, i) { return s + i.total; }, 0);
    const totalQty = currentPurItems.reduce(function(s, i) { return s + i.qty; }, 0);
    if ($('purStatItemsCount')) $('purStatItemsCount').textContent = currentPurItems.length;
    if ($('purStatTotalQty')) $('purStatTotalQty').textContent = totalQty;
    if ($('purSubtotal')) $('purSubtotal').textContent = formatMoney(subtotal);
    if ($('purTotal')) $('purTotal').textContent = formatMoney(subtotal) + ' ج.م';
};

window.savePurchase = function() {
    if (currentPurItems.length === 0) { showToast('⚠️ لا توجد أصناف', 'error'); return; }
    const supplierName = $('purSupplier') ? $('purSupplier').value : '';
    if (!supplierName) { showToast('⚠️ اختر مورد', 'error'); return; }

    const payment = $('purPayment') ? $('purPayment').value : 'cash';
    const cashBoxId = ($('purCashBox') ? $('purCashBox').value : '') || (getDefaultCashBox() ? getDefaultCashBox().id : null);
    const box = getCashBoxById(cashBoxId);
    const notes = $('purNotes') ? $('purNotes').value.trim() : '';
    const subtotal = currentPurItems.reduce(function(s, i) { return s + i.total; }, 0);
    const today = getTodayDate();

    currentPurItems.forEach(function(it) {
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (p) { p.qty += it.qty; p.buy = it.price; }
    });

    const isCash = payment === 'cash';
    const inv = {
        id: Date.now(), number: purchases.length + 1,
        supplierName: supplierName, notes: notes, subtotal: subtotal, total: subtotal,
        payment: payment, cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        paidAmount: isCash ? subtotal : 0,
        remainingAmount: isCash ? 0 : subtotal,
        status: isCash ? 'paid' : 'unpaid',
        items: JSON.parse(JSON.stringify(currentPurItems)),
        date: today, time: getNowTime(),
        purchasedBy: currentUser ? currentUser.name : ''
    };
    purchases.push(inv);

    if (isCash) {
        treasury.push({
            id: Date.now() + 1, type: 'withdraw', amount: subtotal,
            note: 'فاتورة شراء #' + inv.number + ' - ' + supplierName,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'purchase', refId: inv.id,
            date: today, time: getNowTime()
        });
    }

    setData('purchases', purchases);
    setData('products', products);
    setData('treasury', treasury);

    currentPurItems = [];
    if ($('purSupplier')) $('purSupplier').value = '';
    if ($('purNotes')) $('purNotes').value = '';
    if ($('purPayment')) $('purPayment').value = 'cash';

    renderPurItems();
    updatePurTotals();
    renderPurchases();
    updatePurStats();
    populatePurProducts();
    populateSaleProducts();
    renderProducts();
    updateDashboard();

    showToast('✅ فاتورة شراء #' + inv.number + ' - ' + formatMoney(subtotal), 'success');
};

window.clearPurchase = function() {
    if (currentPurItems.length === 0) return;
    if (!confirm('⚠️ إلغاء؟')) return;
    currentPurItems = [];
    if ($('purSupplier')) $('purSupplier').value = '';
    if ($('purNotes')) $('purNotes').value = '';
    renderPurItems();
    updatePurTotals();
    showToast('🗑️ تم الإلغاء', 'info');
};

window.updatePurStats = function() {
    const total = purchases.reduce(function(s, p) { return s + (p.total || 0); }, 0);
    const today = purchases.filter(function(p) { return p.date === getTodayDate(); }).reduce(function(s, p) { return s + (p.total || 0); }, 0);
    if ($('purTotalCount')) $('purTotalCount').textContent = purchases.length;
    if ($('purTotalAmount')) $('purTotalAmount').textContent = formatMoney(total);
    if ($('purTodayAmount')) $('purTodayAmount').textContent = formatMoney(today);
};

window.renderPurchases = function() {
    const c = $('purchasesList');
    if (!c) return;
    if (purchases.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><span>لا توجد فواتير</span></div>';
        return;
    }
    const sorted = purchases.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 30);
    let html = '<div class="table-header" style="grid-template-columns: 0.5fr 1.3fr 1fr 0.8fr 0.8fr 1.2fr;"><span>#</span><span>المورد</span><span>المبلغ</span><span>الدفع</span><span>التاريخ</span><span></span></div>';
    sorted.forEach(function(inv) {
        const statusLabel = inv.status === 'paid' ? '✅ نقدي' : '📝 آجل';
        html += '<div class="table-row" style="grid-template-columns: 0.5fr 1.3fr 1fr 0.8fr 0.8fr 1.2fr;">' +
            '<span>#' + inv.number + '</span>' +
            '<span><strong>' + inv.supplierName + '</strong></span>' +
            '<span style="color:#E06060;font-weight:700;">' + formatMoney(inv.total) + '</span>' +
            '<span style="font-size:10px;">' + statusLabel + '</span>' +
            '<span style="font-size:10px;color:#A89070;">' + inv.date + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-info btn-sm" onclick="printPurchaseFromList(' + inv.id + ')"><i class="fas fa-print"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deletePurchase(' + inv.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.deletePurchase = function(id) {
    const inv = purchases.find(function(p) { return p.id == id; });
    if (!inv) return;
    if (!confirm('⚠️ حذف فاتورة #' + inv.number + '؟')) return;
    inv.items.forEach(function(it) {
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (p) p.qty -= it.qty;
    });
    window.treasury = treasury.filter(function(t) { return !(t.refType === 'purchase' && t.refId === id); });
    window.purchases = purchases.filter(function(p) { return p.id !== id; });
    setData('purchases', purchases);
    setData('products', products);
    setData('treasury', treasury);
    renderPurchases();
    updatePurStats();
    renderProducts();
    updateDashboard();
    renderCashBoxes();
    showToast('🗑️ تم الحذف', 'info');
};

// ═══════════════════════════════════════════════════════════
// 💸 المصروفات
// ═══════════════════════════════════════════════════════════
window.saveExpense = function() {
    const note = $('expNote') ? $('expNote').value.trim() : '';
    const amount = parseFloat($('expAmount') ? $('expAmount').value : 0) || 0;
    const category = $('expCategory') ? $('expCategory').value : 'عام';
    const date = ($('expDate') ? $('expDate').value : '') || getTodayDate();
    const cashBoxId = ($('expCashBox') ? $('expCashBox').value : '') || (getDefaultCashBox() ? getDefaultCashBox().id : null);

    if (!note) { showToast('⚠️ أدخل البيان', 'error'); return; }
    if (amount <= 0) { showToast('⚠️ أدخل مبلغ صحيح', 'error'); return; }
    if (!cashBoxId) { showToast('⚠️ اختر الخزنة', 'error'); return; }

    const box = getCashBoxById(cashBoxId);
    const balance = getCashBoxBalance(cashBoxId);
    if (balance < amount) {
        showToast('⚠️ رصيد الخزنة غير كافي (متاح: ' + formatMoney(balance) + ')', 'error');
        return;
    }

    const exp = {
        id: Date.now(), note: note, amount: amount, category: category, date: date,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        time: getNowTime(),
        createdBy: currentUser ? currentUser.name : ''
    };
    expenses.push(exp);

    treasury.push({
        id: Date.now() + 1, type: 'withdraw', amount: amount,
        note: 'مصروف (' + category + ') - ' + note,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        refType: 'expense', refId: exp.id,
        date: date, time: getNowTime()
    });

    setData('expenses', expenses);
    setData('treasury', treasury);
    $('expNote').value = '';
    $('expAmount').value = '';

    renderExpenses();
    updateExpensesStats();
    updateDashboard();
    renderCashBoxes();
    showToast('✅ تم إضافة ' + formatMoney(amount) + ' ج.م', 'success');
};

window.updateExpensesStats = function() {
    const total = expenses.reduce(function(s, e) { return s + (e.amount || 0); }, 0);
    const today = expenses.filter(function(e) { return e.date === getTodayDate(); }).reduce(function(s, e) { return s + (e.amount || 0); }, 0);
    const month = expenses.filter(function(e) { return (e.date || '').indexOf(getTodayDate().substring(0, 7)) === 0; }).reduce(function(s, e) { return s + (e.amount || 0); }, 0);
    if ($('expTotalCount')) $('expTotalCount').textContent = expenses.length;
    if ($('expTotalAmount')) $('expTotalAmount').textContent = formatMoney(total);
    if ($('expTodayAmount')) $('expTodayAmount').textContent = formatMoney(today);
    if ($('expMonthAmount')) $('expMonthAmount').textContent = formatMoney(month);
};

window.renderExpenses = function() {
    const c = $('expensesList');
    if (!c) return;
    if (expenses.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-money-bill-wave"></i><span>لا توجد مصروفات</span></div>';
        return;
    }
    const sorted = expenses.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 50);
    let html = '<div class="table-header" style="grid-template-columns: 1.3fr 0.8fr 0.8fr 0.8fr 0.6fr;"><span>البيان</span><span>المبلغ</span><span>التصنيف</span><span>التاريخ</span><span></span></div>';
    sorted.forEach(function(e) {
        html += '<div class="table-row" style="grid-template-columns: 1.3fr 0.8fr 0.8fr 0.8fr 0.6fr;">' +
            '<span><strong>' + e.note + '</strong>' +
                (e.cashBoxName ? '<br><small style="color:#A89070;font-size:9px;">💰 ' + e.cashBoxName + '</small>' : '') +
            '</span>' +
            '<span style="color:#E06060;font-weight:700;">' + formatMoney(e.amount) + '</span>' +
            '<span style="font-size:11px;color:#A89070;">' + (e.category || 'عام') + '</span>' +
            '<span style="font-size:10px;color:#A89070;">' + e.date + '</span>' +
            '<button class="btn btn-danger btn-sm" onclick="deleteExpense(' + e.id + ')"><i class="fas fa-trash"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.deleteExpense = function(id) {
    const e = expenses.find(function(x) { return x.id == id; });
    if (!e) return;
    if (!confirm('⚠️ حذف مصروف "' + e.note + '"؟')) return;
    window.treasury = treasury.filter(function(t) { return !(t.refType === 'expense' && t.refId === id); });
    window.expenses = expenses.filter(function(x) { return x.id !== id; });
    setData('expenses', expenses);
    setData('treasury', treasury);
    renderExpenses();
    updateExpensesStats();
    updateDashboard();
    renderCashBoxes();
    showToast('🗑️ تم الحذف', 'info');
};

// ═══════════════════════════════════════════════════════════
// 📊 حركات الخزنة
// ═══════════════════════════════════════════════════════════
window.addTreasuryTransaction = function() {
    const type = $('treasuryType') ? $('treasuryType').value : 'deposit';
    const amount = parseFloat($('treasuryAmount') ? $('treasuryAmount').value : 0) || 0;
    const note = ($('treasuryNote') ? $('treasuryNote').value.trim() : '') || (type === 'deposit' ? 'إيداع' : 'سحب');
    const cashBoxId = $('manualCashBox') ? $('manualCashBox').value : '';

    if (amount <= 0) { showToast('⚠️ أدخل مبلغ صحيح', 'error'); return; }
    if (!cashBoxId) { showToast('⚠️ اختر الخزنة', 'error'); return; }

    const box = getCashBoxById(cashBoxId);
    if (type === 'withdraw') {
        const balance = getCashBoxBalance(cashBoxId);
        if (balance < amount) { showToast('⚠️ الرصيد غير كافي', 'error'); return; }
    }

    treasury.push({
        id: Date.now(), type: type, amount: amount, note: note,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        refType: 'manual', refId: null,
        date: getTodayDate(), time: getNowTime()
    });

    setData('treasury', treasury);
    $('treasuryAmount').value = '';
    $('treasuryNote').value = '';

    renderTreasury();
    updateDashboard();
    renderCashBoxes();
    showToast((type === 'deposit' ? '✅ إيداع ' : '✅ سحب ') + formatMoney(amount), 'success');
};

window.filterTreasury = function(filter, btn) {
    window.currentTreasuryFilter = filter;
    document.querySelectorAll('#page-treasury .filter-chip').forEach(function(c) { c.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderTreasury();
};

window.renderTreasury = function() {
    const totalBalance = getTotalCashBalance();
    if ($('treasuryBalance')) $('treasuryBalance').textContent = formatMoney(totalBalance) + ' 🇪🇬';

    const deposits = treasury.filter(function(t) { return t.type === 'deposit'; }).reduce(function(s, t) { return s + (t.amount || 0); }, 0);
    const withdrawals = treasury.filter(function(t) { return t.type === 'withdraw'; }).reduce(function(s, t) { return s + (t.amount || 0); }, 0);
    if ($('treasuryDeposits')) $('treasuryDeposits').textContent = formatMoney(deposits);
    if ($('treasuryWithdrawals')) $('treasuryWithdrawals').textContent = formatMoney(withdrawals);

    const c = $('treasuryList');
    if (!c) return;

    let filtered = treasury;
    if (currentTreasuryFilter === 'sale') filtered = filtered.filter(function(t) { return t.refType === 'sale'; });
    else if (currentTreasuryFilter === 'purchase') filtered = filtered.filter(function(t) { return t.refType === 'purchase'; });
    else if (currentTreasuryFilter === 'expense') filtered = filtered.filter(function(t) { return t.refType === 'expense'; });
    else if (currentTreasuryFilter === 'collect') filtered = filtered.filter(function(t) { return t.refType === 'collect'; });
    else if (currentTreasuryFilter === 'pay') filtered = filtered.filter(function(t) { return t.refType === 'pay'; });
    else if (currentTreasuryFilter === 'manual') filtered = filtered.filter(function(t) { return t.refType === 'manual'; });

    if (filtered.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-vault"></i><span>لا توجد حركات</span></div>';
        return;
    }

    const sorted = filtered.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 100);
    let html = '<div class="table-header" style="grid-template-columns: 1.5fr 0.8fr 0.7fr 0.8fr;"><span>البيان</span><span>المبلغ</span><span>النوع</span><span>التاريخ</span></div>';
    sorted.forEach(function(t) {
        const isDep = t.type === 'deposit';
        const color = isDep ? '#2D8F5E' : '#E06060';
        const refIcons = { 'sale': '💰', 'purchase': '🛒', 'expense': '💸', 'collect': '💵', 'pay': '💳', 'manual': '✋' };
        html += '<div class="table-row" style="grid-template-columns: 1.5fr 0.8fr 0.7fr 0.8fr;">' +
            '<span style="font-size:11px;">' + (refIcons[t.refType] || '📋') + ' ' + t.note +
                (t.cashBoxName ? '<br><small style="color:#A89070;font-size:9px;">' + t.cashBoxName + '</small>' : '') +
            '</span>' +
            '<span style="color:' + color + ';font-weight:700;font-size:12px;">' + (isDep ? '+' : '-') + formatMoney(t.amount) + '</span>' +
            '<span style="color:' + color + ';font-size:10px;">' + (isDep ? '💚 إيداع' : '❤️ سحب') + '</span>' +
            '<span style="font-size:10px;color:#A89070;">' + t.date + '<br>' + (t.time || '') + '</span>' +
        '</div>';
    });
    c.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// 📄 الفواتير
// ═══════════════════════════════════════════════════════════
window.updateInvoiceStats = function() {
    const total = sales.reduce(function(s, i) { return s + (i.total || 0); }, 0);
    const today = sales.filter(function(s) { return s.date === getTodayDate(); }).reduce(function(s, i) { return s + (i.total || 0); }, 0);
    const pending = sales.filter(function(s) { return s.status === 'unpaid' || s.status === 'partial'; }).reduce(function(s, i) { return s + (i.remainingAmount || 0); }, 0);
    if ($('invTotalCount')) $('invTotalCount').textContent = sales.length;
    if ($('invTotalAmount')) $('invTotalAmount').textContent = formatMoney(total);
    if ($('invTodayAmount')) $('invTodayAmount').textContent = formatMoney(today);
    if ($('invPendingAmount')) $('invPendingAmount').textContent = formatMoney(pending);
};

window.filterInvoices = function(filter, btn) {
    window.currentInvoiceFilter = filter;
    document.querySelectorAll('#page-invoices .filter-chip').forEach(function(c) { c.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderInvoices();
};

window.renderInvoices = function() {
    const c = $('invoiceList');
    if (!c) return;
    const searchInput = $('invoiceSearch');
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let filtered = sales;
    if (currentInvoiceFilter === 'paid') filtered = filtered.filter(function(i) { return i.status === 'paid'; });
    if (currentInvoiceFilter === 'unpaid') filtered = filtered.filter(function(i) { return i.status === 'unpaid'; });
    if (currentInvoiceFilter === 'partial') filtered = filtered.filter(function(i) { return i.status === 'partial'; });
    if (search) filtered = filtered.filter(function(i) {
        return (i.customer || '').toLowerCase().indexOf(search) > -1 || String(i.number).indexOf(search) > -1;
    });

    if (filtered.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-file-invoice"></i><span>لا توجد فواتير</span></div>';
        return;
    }

    const sorted = filtered.slice().sort(function(a, b) { return b.id - a.id; });
    let html = '<div class="table-header" style="grid-template-columns: 0.5fr 1.3fr 1fr 0.8fr 0.7fr 1.5fr;"><span>#</span><span>العميل</span><span>المبلغ</span><span>الدفع</span><span>الحالة</span><span></span></div>';
    sorted.forEach(function(inv) {
        const statusLabel = inv.status === 'paid' ? '✅' : inv.status === 'partial' ? '⚠️' : '❌';
        const payIcons = { 'cash': '💵', 'credit': '📝', 'wallet': '📱', 'visa': '💳', 'bank': '🏦', 'installment': '📅' };
        html += '<div class="table-row" style="grid-template-columns: 0.5fr 1.3fr 1fr 0.8fr 0.7fr 1.5fr;">' +
            '<span>#' + inv.number + '</span>' +
            '<span>' + (inv.customer || 'عميل نقدي') + '</span>' +
            '<span style="color:#2D8F5E;font-weight:700;">' + formatMoney(inv.total) + '</span>' +
            '<span>' + (payIcons[inv.paymentMethod] || '💵') + '</span>' +
            '<span style="font-size:14px;">' + statusLabel + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-info btn-sm" onclick="showInvoiceDetails(' + inv.id + ')"><i class="fas fa-eye"></i></button>' +
                '<button class="btn btn-success btn-sm" onclick="printInvoice(' + inv.id + ')"><i class="fas fa-print"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteInvoice(' + inv.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.showInvoiceDetails = function(id) {
    const inv = sales.find(function(s) { return s.id === id; });
    if (!inv) return;

    let itemsHtml = '';
    inv.items.forEach(function(it, i) {
        itemsHtml += '<tr><td style="padding:6px;border-bottom:1px solid #2D2D2D;">' + (i + 1) + '</td><td style="padding:6px;border-bottom:1px solid #2D2D2D;">' + it.name + '</td><td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;">' + it.qty + '</td><td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;">' + formatMoney(it.price) + '</td><td style="padding:6px;border-bottom:1px solid #2D2D2D;text-align:center;color:#2D8F5E;">' + formatMoney(it.total) + '</td></tr>';
    });

    const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3>📄 فاتورة #' + inv.number + '</h3>' +
        '<div style="background:#0D0D0D;padding:14px;border-radius:10px;border:1px solid #2D2D2D;">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;font-size:12px;">' +
                '<div><span style="color:#A89070;">العميل:</span> <strong>' + (inv.customer || 'عميل نقدي') + '</strong></div>' +
                '<div><span style="color:#A89070;">التاريخ:</span> ' + inv.date + ' ' + (inv.time || '') + '</div>' +
                '<div><span style="color:#A89070;">البائع:</span> ' + (inv.seller || '-') + '</div>' +
                '<div><span style="color:#A89070;">المندوب:</span> ' + (inv.delivery || '-') + '</div>' +
                '<div><span style="color:#A89070;">الدفع:</span> ' + getPaymentMethodLabel(inv.paymentMethod) + '</div>' +
                '<div><span style="color:#A89070;">الحالة:</span> ' + (inv.status === 'paid' ? '✅ مدفوعة' : inv.status === 'partial' ? '⚠️ جزئية' : '❌ غير مدفوعة') + '</div>' +
            '</div>' +
            '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                '<thead><tr style="background:#C9A94E;color:#0D0D0D;">' +
                    '<th style="padding:6px;">#</th><th style="padding:6px;">الصنف</th><th style="padding:6px;">الكمية</th>' +
                    '<th style="padding:6px;">السعر</th><th style="padding:6px;">الإجمالي</th>' +
                '</tr></thead>' +
                '<tbody>' + itemsHtml + '</tbody>' +
            '</table>' +
            '<div style="margin-top:12px;padding:10px;background:#1A1A1A;border-radius:8px;">' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;">' +
                    '<span>المجموع:</span><span>' + formatMoney(inv.subtotal || inv.total) + ' ج.م</span>' +
                '</div>' +
                (inv.vat > 0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#9B59B6;"><span>الضريبة:</span><span>' + formatMoney(inv.vat) + ' ج.م</span></div>' : '') +
                (inv.discount > 0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#E6A830;"><span>خصم نقدي:</span><span>' + formatMoney(inv.discount) + ' ج.م</span></div>' : '') +
                '<div style="display:flex;justify-content:space-between;padding:6px 0;border-top:2px solid #C9A94E;margin-top:6px;font-size:16px;font-weight:900;color:#C9A94E;">' +
                    '<span>الإجمالي:</span><span>' + formatMoney(inv.total) + ' ج.م</span>' +
                '</div>' +
                (inv.paidAmount > 0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#2D8F5E;"><span>المدفوع:</span><span>' + formatMoney(inv.paidAmount) + ' ج.م</span></div>' : '') +
                (inv.remainingAmount > 0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#E06060;font-weight:700;"><span>المتبقي:</span><span>' + formatMoney(inv.remainingAmount) + ' ج.م</span></div>' : '') +
            '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:12px;">' +
            '<button class="btn btn-success" onclick="printInvoice(' + inv.id + ')"><i class="fas fa-print"></i> A4</button>' +
            '<button class="btn btn-warning" onclick="printThermalInvoice(' + inv.id + ')"><i class="fas fa-receipt"></i> حرارية</button>' +
            '<button class="btn btn-secondary" onclick="closeModal()"><i class="fas fa-times"></i> إغلاق</button>' +
        '</div>';
    openModal(html);
};

window.deleteInvoice = function(id) {
    const inv = sales.find(function(s) { return s.id === id; });
    if (!inv) return;
    if (!confirm('⚠️ حذف فاتورة #' + inv.number + '؟')) return;

    inv.items.forEach(function(it) {
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (p) p.qty += it.qty;
    });

    window.treasury = treasury.filter(function(t) { return !(t.refType === 'sale' && t.refId === id); });
    window.sales = sales.filter(function(s) { return s.id !== id; });

    setData('sales', sales);
    setData('products', products);
    setData('treasury', treasury);

    renderInvoices();
    updateInvoiceStats();
    renderProducts();
    updateDashboard();
    renderCashBoxes();
    showToast('🗑️ تم الحذف', 'info');
};

console.log('✅ تم تحميل app.js - الجزء 2 كاملاً');

// ============================================================
// الميزان 14.0.0 - app.js - ملف كامل
// الجزء 3: التحصيل + المرتجعات + WhatsApp + الطباعة + التقارير + المستخدمين + التهيئة
// ============================================================

console.log('🚀 تحميل app.js - الجزء 3');

// ═══════════════════════════════════════════════════════════
// 💳 التحصيل والسداد
// ═══════════════════════════════════════════════════════════
window.switchPayTab = function(tab, btn) {
    window.currentPayTab = tab;
    document.querySelectorAll('#page-payments .tab-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    const collect = $('payTabCollect');
    const pay = $('payTabPay');
    if (collect) collect.style.display = tab === 'collect' ? 'block' : 'none';
    if (pay) pay.style.display = tab === 'pay' ? 'block' : 'none';
};

window.populateCollectCustomers = function() {
    const sel = $('collectCustomer');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر عميل...</option>';
    customers.forEach(function(c) {
        const bal = getCustomerBalance(c.name);
        const text = c.name + (bal > 0 ? ' (مديونية: ' + formatMoney(bal) + ')' : '');
        sel.innerHTML += '<option value="' + c.name + '">' + text + '</option>';
    });
    sel.value = cv;
};

window.populatePaySuppliers = function() {
    const sel = $('paySupplier');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر مورد...</option>';
    suppliers.forEach(function(s) {
        const bal = getSupplierBalance(s.name);
        const text = s.name + (bal > 0 ? ' (مديونية: ' + formatMoney(bal) + ')' : '');
        sel.innerHTML += '<option value="' + s.name + '">' + text + '</option>';
    });
    sel.value = cv;
};

window.updateCollectInfo = function() {
    const name = $('collectCustomer') ? $('collectCustomer').value : '';
    const box = $('collectInfoBox');
    if (!box) return;
    if (!name) { box.style.display = 'none'; return; }
    const balance = getCustomerBalance(name);
    box.style.display = 'block';
    if ($('collectCurrentDebt')) $('collectCurrentDebt').textContent = formatMoney(balance);
    const amountInput = $('collectAmount');
    if (amountInput) { amountInput.max = balance; if (balance > 0) amountInput.value = balance.toFixed(2); }
};

window.updatePayInfo = function() {
    const name = $('paySupplier') ? $('paySupplier').value : '';
    const box = $('payInfoBox');
    if (!box) return;
    if (!name) { box.style.display = 'none'; return; }
    const balance = getSupplierBalance(name);
    box.style.display = 'block';
    if ($('payCurrentDebt')) $('payCurrentDebt').textContent = formatMoney(balance);
    const amountInput = $('payAmount');
    if (amountInput) { amountInput.max = balance; if (balance > 0) amountInput.value = balance.toFixed(2); }
};

window.distributePayment = function(customerName, amount) {
    const relatedInvoices = [];
    let remaining = amount;
    const customerInvoices = sales.filter(function(s) {
        return s.customer === customerName && (s.status === 'unpaid' || s.status === 'partial');
    }).sort(function(a, b) { return a.id - b.id; });

    customerInvoices.forEach(function(inv) {
        if (remaining <= 0.01) return;
        const invRemaining = inv.remainingAmount !== undefined ? inv.remainingAmount : inv.total;
        if (invRemaining <= 0.01) return;
        const pay = Math.min(remaining, invRemaining);
        inv.paidAmount = (inv.paidAmount || 0) + pay;
        inv.remainingAmount = invRemaining - pay;
        inv.status = inv.remainingAmount <= 0.01 ? 'paid' : 'partial';
        if (inv.remainingAmount <= 0.01) inv.remainingAmount = 0;
        relatedInvoices.push({ invoiceId: inv.id, invoiceNumber: inv.number, amount: pay });
        remaining -= pay;
    });
    return relatedInvoices;
};

window.distributePay = function(supplierName, amount) {
    const relatedInvoices = [];
    let remaining = amount;
    const supplierInvoices = purchases.filter(function(p) {
        return p.supplierName === supplierName && p.payment === 'credit' && (p.status === 'unpaid' || p.status === 'partial');
    }).sort(function(a, b) { return a.id - b.id; });

    supplierInvoices.forEach(function(inv) {
        if (remaining <= 0.01) return;
        const invRemaining = inv.remainingAmount !== undefined ? inv.remainingAmount : inv.total;
        if (invRemaining <= 0.01) return;
        const pay = Math.min(remaining, invRemaining);
        inv.paidAmount = (inv.paidAmount || 0) + pay;
        inv.remainingAmount = invRemaining - pay;
        inv.status = inv.remainingAmount <= 0.01 ? 'paid' : 'partial';
        if (inv.remainingAmount <= 0.01) inv.remainingAmount = 0;
        relatedInvoices.push({ invoiceId: inv.id, invoiceNumber: inv.number, amount: pay });
        remaining -= pay;
    });
    return relatedInvoices;
};

window.saveCollect = function() {
    const party = $('collectCustomer') ? $('collectCustomer').value : '';
    const amount = parseFloat($('collectAmount') ? $('collectAmount').value : 0) || 0;
    const date = ($('collectDate') ? $('collectDate').value : '') || getTodayDate();
    const cashBoxId = $('collectCashBox') ? $('collectCashBox').value : '';
    const note = $('collectNote') ? $('collectNote').value.trim() : '';

    if (!party) { showToast('⚠️ اختر عميل', 'error'); return; }
    if (amount <= 0) { showToast('⚠️ أدخل مبلغ صحيح', 'error'); return; }
    if (!cashBoxId) { showToast('⚠️ اختر الخزنة', 'error'); return; }

    const balance = getCustomerBalance(party);
    if (amount > balance + 0.01) { showToast('⚠️ المبلغ أكبر من المديونية', 'error'); return; }

    const box = getCashBoxById(cashBoxId);
    const pay = {
        id: Date.now(), type: 'collect', party: party, amount: amount, date: date,
        time: getNowTime(), note: note, cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        relatedInvoices: [],
        createdBy: currentUser ? currentUser.name : ''
    };
    pay.relatedInvoices = distributePayment(party, amount);
    payments.push(pay);

    treasury.push({
        id: Date.now() + 1, type: 'deposit', amount: amount,
        note: 'تحصيل من ' + party + (note ? ' - ' + note : ''),
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        refType: 'collect', refId: pay.id,
        date: date, time: getNowTime()
    });

    setData('payments', payments);
    setData('treasury', treasury);
    setData('sales', sales);

    $('collectAmount').value = '';
    $('collectNote').value = '';
    $('collectCustomer').value = '';
    const info = $('collectInfoBox'); if (info) info.style.display = 'none';

    updatePaymentsStats();
    renderPayments();
    renderTreasury();
    renderCustomers();
    renderInvoices();
    updateInvoiceStats();
    updateDashboard();
    renderCashBoxes();
    showToast('✅ تم تحصيل ' + formatMoney(amount) + ' ج.م', 'success');
};

window.savePay = function() {
    const party = $('paySupplier') ? $('paySupplier').value : '';
    const amount = parseFloat($('payAmount') ? $('payAmount').value : 0) || 0;
    const date = ($('payDate') ? $('payDate').value : '') || getTodayDate();
    const cashBoxId = $('payCashBox') ? $('payCashBox').value : '';
    const note = $('payNote') ? $('payNote').value.trim() : '';

    if (!party) { showToast('⚠️ اختر مورد', 'error'); return; }
    if (amount <= 0) { showToast('⚠️ أدخل مبلغ صحيح', 'error'); return; }
    if (!cashBoxId) { showToast('⚠️ اختر الخزنة', 'error'); return; }

    const balance = getSupplierBalance(party);
    if (amount > balance + 0.01) { showToast('⚠️ المبلغ أكبر من الالتزام', 'error'); return; }

    const box = getCashBoxById(cashBoxId);
    const boxBalance = getCashBoxBalance(cashBoxId);
    if (boxBalance < amount) { showToast('⚠️ رصيد الخزنة غير كافي', 'error'); return; }

    const pay = {
        id: Date.now(), type: 'pay', party: party, amount: amount, date: date,
        time: getNowTime(), note: note, cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        relatedInvoices: [],
        createdBy: currentUser ? currentUser.name : ''
    };
    pay.relatedInvoices = distributePay(party, amount);
    payments.push(pay);

    treasury.push({
        id: Date.now() + 1, type: 'withdraw', amount: amount,
        note: 'سداد لـ ' + party + (note ? ' - ' + note : ''),
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        refType: 'pay', refId: pay.id,
        date: date, time: getNowTime()
    });

    setData('payments', payments);
    setData('treasury', treasury);
    setData('purchases', purchases);

    $('payAmount').value = '';
    $('payNote').value = '';
    $('paySupplier').value = '';
    const info = $('payInfoBox'); if (info) info.style.display = 'none';

    updatePaymentsStats();
    renderPayments();
    renderTreasury();
    renderSuppliers();
    renderPurchases();
    updatePurStats();
    updateDashboard();
    renderCashBoxes();
    showToast('✅ تم سداد ' + formatMoney(amount) + ' ج.م', 'success');
};

window.updatePaymentsStats = function() {
    const collected = payments.filter(function(p) { return p.type === 'collect'; }).reduce(function(s, p) { return s + (p.amount || 0); }, 0);
    const paid = payments.filter(function(p) { return p.type === 'pay'; }).reduce(function(s, p) { return s + (p.amount || 0); }, 0);
    if ($('payTotalCollected')) $('payTotalCollected').textContent = formatMoney(collected);
    if ($('payTotalPaid')) $('payTotalPaid').textContent = formatMoney(paid);
};

window.renderPayments = function() {
    const c = $('paymentsList');
    if (!c) return;
    if (payments.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-hand-holding-usd"></i><span>لا توجد عمليات</span></div>';
        return;
    }
    const sorted = payments.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 50);
    let html = '<div class="table-header" style="grid-template-columns: 0.7fr 1.5fr 1fr 1fr 0.7fr;"><span>النوع</span><span>الجهة</span><span>المبلغ</span><span>التاريخ</span><span></span></div>';
    sorted.forEach(function(p) {
        const isCollect = p.type === 'collect';
        const color = isCollect ? '#2D8F5E' : '#E06060';
        html += '<div class="table-row" style="grid-template-columns: 0.7fr 1.5fr 1fr 1fr 0.7fr;">' +
            '<span style="color:' + color + ';font-size:11px;font-weight:700;">' + (isCollect ? '💰 تحصيل' : '💸 سداد') + '</span>' +
            '<span>' + p.party + '</span>' +
            '<span style="color:' + color + ';font-weight:700;">' + formatMoney(p.amount) + '</span>' +
            '<span style="font-size:10px;color:#A89070;">' + p.date + '</span>' +
            '<button class="btn btn-info btn-sm" onclick="showReceipt(' + p.id + ')"><i class="fas fa-receipt"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.showReceipt = function(id) {
    const pay = payments.find(function(p) { return p.id === id; });
    if (!pay) return;
    const isCollect = pay.type === 'collect';
    const label = isCollect ? 'إيصال استلام نقدية' : 'إيصال دفع نقدية';
    const color = isCollect ? '#2D8F5E' : '#E06060';
    const html = '<button class="modal-close" onclick="closeModal()">&times;</button>' +
        '<h3 style="color:' + color + ';">🧾 ' + label + '</h3>' +
        '<div style="background:#fff;color:#000;padding:20px;border-radius:8px;border:2px solid ' + color + ';">' +
            '<div style="text-align:center;padding-bottom:12px;border-bottom:2px dashed #333;margin-bottom:12px;">' +
                '<h2 style="color:' + color + ';font-size:20px;">' + (companyData.name || 'الميزان') + '</h2>' +
                '<p style="font-size:12px;">' + label + '</p>' +
            '</div>' +
            '<div style="padding:10px 0;border-bottom:1px dashed #333;margin-bottom:12px;">' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;"><span style="font-weight:700;color:#555;">رقم الإيصال:</span><span>#' + String(pay.id).slice(-6) + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;"><span style="font-weight:700;color:#555;">التاريخ:</span><span>' + pay.date + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;"><span style="font-weight:700;color:#555;">الوقت:</span><span>' + pay.time + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;"><span style="font-weight:700;color:#555;">' + (isCollect ? 'العميل' : 'المورد') + ':</span><span>' + pay.party + '</span></div>' +
            '</div>' +
            '<div style="text-align:center;padding:15px;border:2px solid ' + color + ';border-radius:8px;margin:12px 0;background:#f9f9f9;">' +
                '<div style="font-size:12px;font-weight:700;color:#555;margin-bottom:6px;">' + (isCollect ? 'المبلغ المستلم' : 'المبلغ المدفوع') + '</div>' +
                '<div style="font-size:26px;font-weight:900;color:' + color + ';font-family:monospace;">' + formatMoney(pay.amount) + ' ج.م</div>' +
            '</div>' +
            (pay.note ? '<div style="text-align:center;font-size:11px;color:#666;margin:8px 0;">📝 ' + pay.note + '</div>' : '') +
            '<div style="text-align:center;margin-top:12px;padding-top:10px;border-top:2px dashed #333;font-size:11px;color:#666;">' + (companyData.footer || 'شكراً لتعاملكم معنا 🌟') + '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:12px;">' +
            '<button class="btn btn-primary" onclick="printReceipt(' + pay.id + ')"><i class="fas fa-print"></i> طباعة</button>' +
            '<button class="btn btn-secondary" onclick="closeModal()"><i class="fas fa-times"></i> إغلاق</button>' +
        '</div>';
    openModal(html);
};

// ═══════════════════════════════════════════════════════════
// 🔄 المرتجعات
// ═══════════════════════════════════════════════════════════
window.toggleReturnParty = function() {
    const type = $('retType') ? $('retType').value : 'sale';
    const label = $('retPartyLabel');
    const sel = $('retParty');
    if (label) label.textContent = type === 'sale' ? 'العميل' : 'المورد';
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر...</option>';
    if (type === 'sale') {
        customers.forEach(function(c) { sel.innerHTML += '<option value="' + c.name + '">' + c.name + '</option>'; });
    } else {
        suppliers.forEach(function(s) { sel.innerHTML += '<option value="' + s.name + '">' + s.name + '</option>'; });
    }
    sel.value = cv;
};

window.populateRetProducts = function() {
    const sel = $('retProduct');
    if (!sel) return;
    const cv = sel.value;
    sel.innerHTML = '<option value="">اختر منتج...</option>';
    products.forEach(function(p) {
        sel.innerHTML += '<option value="' + p.id + '">' + p.name + ' (متاح: ' + p.qty + ')</option>';
    });
    sel.value = cv;
};

window.updateRetPrice = function() {
    const id = $('retProduct') ? $('retProduct').value : '';
    const priceInput = $('retPrice');
    if (!id) { if (priceInput) priceInput.value = ''; return; }
    const product = products.find(function(pr) { return pr.id == id; });
    if (product && priceInput) priceInput.value = product.sell;
};

window.addRetItem = function() {
    const productSelect = $('retProduct');
    const qtyInput = $('retQty');
    const priceInput = $('retPrice');
    const id = productSelect ? productSelect.value : '';
    let qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
    let price = parseFloat(priceInput ? priceInput.value : 0) || 0;

    if (!id) { showToast('⚠️ اختر منتج', 'error'); return; }
    const p = products.find(function(pr) { return pr.id == id; });
    if (!p) return;
    if (price <= 0) price = p.sell;
    if (qty <= 0) qty = 1;

    const ex = currentRetItems.find(function(i) { return i.productId == id; });
    if (ex) {
        ex.qty += qty;
        ex.price = price;
        ex.total = ex.qty * ex.price;
    } else {
        currentRetItems.push({ productId: p.id, name: p.name, qty: qty, price: price, costPrice: p.buy, total: qty * price });
    }

    if (qtyInput) qtyInput.value = 1;
    if (priceInput) priceInput.value = '';
    if (productSelect) productSelect.value = '';

    renderRetItems();
    showToast('✅ تم الإضافة', 'success');
};

window.removeRetItem = function(i) {
    currentRetItems.splice(i, 1);
    renderRetItems();
};

window.renderRetItems = function() {
    const c = $('retItemsContainer');
    const tb = $('retTotalBox');
    if (!c) return;
    if (currentRetItems.length === 0) {
        c.innerHTML = '<div class="empty-items"><i class="fas fa-undo-alt"></i><span>لا توجد أصناف</span><small>أضف صنف من الأعلى</small></div>';
        if (tb) tb.style.display = 'none';
        return;
    }
    let html = '<div class="items-header-row"><span>ID</span><span>اسم الصنف</span><span>الوحدة</span><span>الكمية</span><span>السعر</span><span>الإجمالي</span><span></span></div>';
    currentRetItems.forEach(function(it, i) {
        html += '<div class="item-row">' +
            '<span class="item-id">#' + String(it.productId).slice(-4) + '</span>' +
            '<span class="item-name">' + it.name + '</span>' +
            '<span class="item-unit">قطعة</span>' +
            '<span class="item-qty">' + it.qty + '</span>' +
            '<span class="item-price">' + formatMoney(it.price) + '</span>' +
            '<span class="item-total" style="color:#E6A830;">' + formatMoney(it.qty * it.price) + '</span>' +
            '<button class="item-delete" onclick="removeRetItem(' + i + ')"><i class="fas fa-times"></i></button>' +
        '</div>';
    });
    c.innerHTML = html;
    const total = currentRetItems.reduce(function(s, i) { return s + i.total; }, 0);
    if ($('retTotal')) $('retTotal').textContent = formatMoney(total) + ' ج.م';
    if (tb) tb.style.display = 'block';
};

window.saveReturn = function() {
    if (currentRetItems.length === 0) { showToast('⚠️ لا توجد أصناف', 'error'); return; }
    const type = $('retType') ? $('retType').value : 'sale';
    const party = $('retParty') ? $('retParty').value : '';
    if (!party) { showToast('⚠️ اختر ' + (type === 'sale' ? 'العميل' : 'المورد'), 'error'); return; }
    const cashBoxId = $('retCashBox') ? $('retCashBox').value : '';
    if (!cashBoxId) { showToast('⚠️ اختر الخزنة', 'error'); return; }

    const box = getCashBoxById(cashBoxId);
    const notes = $('retNotes') ? $('retNotes').value.trim() : '';
    const total = currentRetItems.reduce(function(s, i) { return s + i.total; }, 0);
    const today = getTodayDate();

    for (let i = 0; i < currentRetItems.length; i++) {
        const it = currentRetItems[i];
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (!p) { showToast('⚠️ المنتج غير موجود', 'error'); return; }
        if (type === 'purchase' && p.qty < it.qty) { showToast('⚠️ كمية غير كافية', 'error'); return; }
    }

    currentRetItems.forEach(function(it) {
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (p) {
            if (type === 'sale') p.qty += it.qty;
            else p.qty -= it.qty;
        }
    });

    const ret = {
        id: Date.now(), number: returns.length + 1, type: type, party: party,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        notes: notes, total: total, items: JSON.parse(JSON.stringify(currentRetItems)),
        date: today, time: getNowTime(),
        createdBy: currentUser ? currentUser.name : ''
    };
    returns.push(ret);

    if (type === 'sale') {
        treasury.push({
            id: Date.now() + 1, type: 'withdraw', amount: total,
            note: 'مرتجع بيع #' + ret.number + ' - ' + party,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'return', refId: ret.id,
            date: today, time: getNowTime()
        });
    } else {
        treasury.push({
            id: Date.now() + 1, type: 'deposit', amount: total,
            note: 'مرتجع شراء #' + ret.number + ' - ' + party,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'return', refId: ret.id,
            date: today, time: getNowTime()
        });
    }

    setData('returns', returns);
    setData('products', products);
    setData('treasury', treasury);

    currentRetItems = [];
    if ($('retParty')) $('retParty').value = '';
    if ($('retNotes')) $('retNotes').value = '';

    renderRetItems();
    renderReturns();
    updateReturnsStats();
    renderProducts();
    updateDashboard();
    renderCashBoxes();
    populateSaleProducts();

    showToast('✅ مرتجع #' + ret.number + ' - ' + formatMoney(total) + ' ج.م', 'success');
};

window.clearReturn = function() {
    if (currentRetItems.length === 0) return;
    if (!confirm('⚠️ إلغاء المرتجع؟')) return;
    currentRetItems = [];
    if ($('retParty')) $('retParty').value = '';
    if ($('retNotes')) $('retNotes').value = '';
    renderRetItems();
    showToast('🗑️ تم الإلغاء', 'info');
};

window.updateReturnsStats = function() {
    const total = returns.reduce(function(s, r) { return s + (r.total || 0); }, 0);
    if ($('retTotalCount')) $('retTotalCount').textContent = returns.length;
    if ($('retTotalAmount')) $('retTotalAmount').textContent = formatMoney(total);
};

window.renderReturns = function() {
    const c = $('returnsList');
    if (!c) return;
    if (returns.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-undo-alt"></i><span>لا توجد مرتجعات</span></div>';
        return;
    }
    const sorted = returns.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 50);
    let html = '<div class="table-header" style="grid-template-columns: 0.5fr 0.8fr 1.3fr 1fr 1fr 1.2fr;"><span>#</span><span>النوع</span><span>الجهة</span><span>المبلغ</span><span>التاريخ</span><span></span></div>';
    sorted.forEach(function(r) {
        const isSale = r.type === 'sale';
        const color = isSale ? '#E6A830' : '#4A8AB5';
        html += '<div class="table-row" style="grid-template-columns: 0.5fr 0.8fr 1.3fr 1fr 1fr 1.2fr;">' +
            '<span>#' + r.number + '</span>' +
            '<span style="color:' + color + ';font-size:11px;font-weight:700;">' + (isSale ? '🔄 بيع' : '🔄 شراء') + '</span>' +
            '<span>' + r.party + '</span>' +
            '<span style="color:' + color + ';font-weight:700;">' + formatMoney(r.total) + '</span>' +
            '<span style="font-size:10px;color:#A89070;">' + r.date + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-success btn-sm" onclick="printReturnFromList(' + r.id + ')"><i class="fas fa-print"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteReturn(' + r.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.deleteReturn = function(id) {
    const ret = returns.find(function(r) { return r.id == id; });
    if (!ret) return;
    if (!confirm('⚠️ حذف مرتجع #' + ret.number + '؟')) return;
    ret.items.forEach(function(it) {
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (p) {
            if (ret.type === 'sale') p.qty -= it.qty;
            else p.qty += it.qty;
        }
    });
    window.treasury = treasury.filter(function(t) { return !(t.refType === 'return' && t.refId === id); });
    window.returns = returns.filter(function(r) { return r.id !== id; });
    setData('returns', returns);
    setData('products', products);
    setData('treasury', treasury);
    renderReturns();
    updateReturnsStats();
    renderProducts();
    updateDashboard();
    renderCashBoxes();
    showToast('🗑️ تم الحذف', 'info');
};

// ═══════════════════════════════════════════════════════════
// 💬 WhatsApp Integration
// ═══════════════════════════════════════════════════════════
window.cleanPhoneNumber = function(phone) {
    if (!phone) return '';
    let cleaned = String(phone).replace(/[^0-9]/g, '');
    if (cleaned.indexOf('0') === 0) cleaned = '20' + cleaned.substring(1);
    if (cleaned.length === 10 && cleaned.indexOf('20') !== 0) cleaned = '20' + cleaned;
    return cleaned;
};

window.openWhatsApp = function(phone, message) {
    const cleaned = cleanPhoneNumber(phone);
    if (!cleaned) { showToast('⚠️ رقم غير صحيح', 'error'); return; }
    const url = 'https://wa.me/' + cleaned + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank');
};

window.sendInvoiceWhatsApp = function(invoiceId) {
    const inv = sales.find(function(s) { return s.id === invoiceId; });
    if (!inv) { showToast('⚠️ الفاتورة غير موجودة', 'error'); return; }

    const customer = customers.find(function(c) { return c.name === inv.customer; });
    let phone = (customer && (customer.whatsapp || customer.phone)) || '';

    if (!phone) {
        phone = prompt('📱 أدخل رقم واتساب للعميل "' + (inv.customer || 'عميل نقدي') + '":', '');
        if (!phone) return;
        if (customer) { customer.whatsapp = phone; setData('customers', customers); }
    }

    const c = companyData;
    let itemsText = '';
    (inv.items || []).forEach(function(it) {
        itemsText += '• ' + it.name + ' × ' + it.qty + ' = ' + formatMoney(it.total) + ' ج.م\n';
    });

    const msg = '🧾 *فاتورة #' + inv.number + '*\n' +
        '━━━━━━━━━━━━━━━━━━\n' +
        '🏪 *' + (c.name || 'الميزان') + '*\n' +
        (c.phone ? '📞 ' + c.phone + '\n' : '') +
        '━━━━━━━━━━━━━━━━━━\n' +
        '📅 التاريخ: ' + inv.date + '\n' +
        '🕐 الوقت: ' + (inv.time || '') + '\n' +
        '👤 العميل: ' + (inv.customer || 'عميل نقدي') + '\n' +
        '━━━━━━━━━━━━━━━━━━\n' +
        '*📦 الأصناف:*\n' + itemsText +
        '━━━━━━━━━━━━━━━━━━\n' +
        '💰 المجموع: ' + formatMoney(inv.subtotal || inv.total) + ' ج.م\n' +
        (inv.vat > 0 ? '🧾 الضريبة: ' + formatMoney(inv.vat) + ' ج.م\n' : '') +
        '━━━━━━━━━━━━━━━━━━\n' +
        '💵 *الإجمالي: ' + formatMoney(inv.total) + ' ج.م*\n' +
        (inv.remainingAmount > 0 ? '❌ *المتبقي: ' + formatMoney(inv.remainingAmount) + ' ج.م*\n' : '') +
        '━━━━━━━━━━━━━━━━━━\n' +
        '🙏 ' + (c.footer || 'شكراً لتعاملكم معنا');

    openWhatsApp(phone, msg);
    showToast('✅ تم فتح واتساب', 'success');
};

window.remindCustomerWhatsApp = function(customerName) {
    const customer = customers.find(function(c) { return c.name === customerName; });
    if (!customer) { showToast('⚠️ العميل غير موجود', 'error'); return; }

    let phone = customer.whatsapp || customer.phone || '';
    if (!phone) {
        phone = prompt('📱 أدخل رقم واتساب للعميل "' + customerName + '":', '');
        if (!phone) return;
        customer.whatsapp = phone;
        setData('customers', customers);
    }

    const balance = getCustomerBalance(customerName);
    if (balance <= 0) { showToast('⚠️ العميل ليس عليه مديونية', 'warning'); return; }

    const unpaidInvoices = sales.filter(function(s) {
        return s.customer === customerName && (s.status === 'unpaid' || s.status === 'partial');
    }).sort(function(a, b) { return a.id - b.id; });

    let invoicesText = '';
    unpaidInvoices.forEach(function(inv) {
        invoicesText += '• فاتورة #' + inv.number + ' (' + inv.date + '): ' + formatMoney(inv.remainingAmount || inv.total) + ' ج.م\n';
    });

    const c = companyData;
    const msg = '🔔 *تذكير بمديونية*\n' +
        '━━━━━━━━━━━━━━━━━━\n' +
        '🏪 *' + (c.name || 'الميزان') + '*\n' +
        '━━━━━━━━━━━━━━━━━━\n' +
        '👤 عزيزي/عزيزتي *' + customerName + '*،\n' +
        'السلام عليكم ورحمة الله وبركاته 🌸\n\n' +
        'نود تذكيركم بلطف بوجود مبالغ مستحقة لصالحنا:\n\n' +
        '*📄 الفواتير غير المسددة:*\n' + invoicesText +
        '━━━━━━━━━━━━━━━━━━\n' +
        '💰 *إجمالي المديونية: ' + formatMoney(balance) + ' ج.م*\n' +
        '━━━━━━━━━━━━━━━━━━\n' +
        '📝 نرجو التكرم بالسداد في أقرب وقت.\n' +
        'شكراً لتعاملكم معنا 🌟';

    openWhatsApp(phone, msg);
    showToast('✅ تم فتح واتساب', 'success');
};

window.sendReceiptWhatsApp = function(paymentId) {
    const pay = payments.find(function(p) { return p.id === paymentId; });
    if (!pay) return;

    let phone = '';
    if (pay.type === 'collect') {
        const customer = customers.find(function(c) { return c.name === pay.party; });
        phone = (customer && (customer.whatsapp || customer.phone)) || '';
    } else {
        const supplier = suppliers.find(function(s) { return s.name === pay.party; });
        phone = (supplier && (supplier.whatsapp || supplier.phone)) || '';
    }

    if (!phone) {
        phone = prompt('📱 أدخل رقم واتساب لـ "' + pay.party + '":', '');
        if (!phone) return;
    }

    const isCollect = pay.type === 'collect';
    const c = companyData;
    const msg = (isCollect ? '💵 *إيصال استلام نقدية*\n' : '💳 *إيصال دفع نقدية*\n') +
        '━━━━━━━━━━━━━━━━━━\n' +
        '🏪 *' + (c.name || 'الميزان') + '*\n' +
        '━━━━━━━━━━━━━━━━━━\n' +
        '📋 رقم الإيصال: #' + String(pay.id).slice(-6) + '\n' +
        '📅 التاريخ: ' + pay.date + '\n' +
        '👤 ' + (isCollect ? 'العميل' : 'المورد') + ': ' + pay.party + '\n' +
        '━━━━━━━━━━━━━━━━━━\n' +
        '💰 *' + (isCollect ? 'المبلغ المستلم' : 'المبلغ المدفوع') + ': ' + formatMoney(pay.amount) + ' ج.م*\n' +
        '━━━━━━━━━━━━━━━━━━\n' +
        '🙏 ' + (c.footer || 'شكراً لتعاملكم معنا');

    openWhatsApp(phone, msg);
    showToast('✅ تم فتح واتساب', 'success');
};

window.sendDailyReportWhatsApp = function() {
    const phone = prompt('📱 أدخل رقم واتساب لإرسال التقرير إليه:', '');
    if (!phone) return;

    const today = getTodayDate();
    const todaySales = sales.filter(function(s) { return s.date === today; });
    const totalSales = todaySales.reduce(function(s, i) { return s + (i.total || 0); }, 0);
    const cashSales = todaySales.filter(function(s) { return s.paymentMethod === 'cash'; }).reduce(function(s, i) { return s + (i.total || 0); }, 0);
    const creditSales = todaySales.filter(function(s) { return s.paymentMethod === 'credit'; }).reduce(function(s, i) { return s + (i.total || 0); }, 0);
    const todayExpenses = expenses.filter(function(e) { return e.date === today; }).reduce(function(s, e) { return s + (e.amount || 0); }, 0);
    const todayPurchases = purchases.filter(function(p) { return p.date === today; }).reduce(function(s, p) { return s + (p.total || 0); }, 0);
    const cogs = todaySales.reduce(function(s, i) { return s + (i.cogs || 0); }, 0);
    const profit = totalSales - cogs - todayExpenses;
    const treasury = getTotalCashBalance();

    const c = companyData;
    const msg = '📊 *تقرير يومي*\n' +
        '━━━━━━━━━━━━━━━━━━\n' +
        '🏪 *' + (c.name || 'الميزان') + '*\n' +
        '━━━━━━━━━━━━━━━━━━\n' +
        '💰 *المبيعات:* ' + formatMoney(totalSales) + ' ج.م\n' +
        '   • نقدي: ' + formatMoney(cashSales) + '\n' +
        '   • آجل: ' + formatMoney(creditSales) + '\n' +
        '   • عدد الفواتير: ' + todaySales.length + '\n' +
        '━━━━━━━━━━━━━━━━━━\n' +
        '🛒 *المشتريات:* ' + formatMoney(todayPurchases) + '\n' +
        '💸 *المصروفات:* ' + formatMoney(todayExpenses) + '\n' +
        '📈 *صافي الربح:* ' + formatMoney(profit) + '\n' +
        '💰 *رصيد الخزائن:* ' + formatMoney(treasury);

    openWhatsApp(phone, msg);
    showToast('✅ تم فتح واتساب', 'success');
};

// ✅ إضافة زر واتساب في نافذة الفاتورة
var _originalShowInvoiceDetails = window.showInvoiceDetails;
window.showInvoiceDetails = function(id) {
    if (_originalShowInvoiceDetails) _originalShowInvoiceDetails(id);
    setTimeout(function() {
        const modal = $('modalOverlay') ? $('modalOverlay').querySelector('.modal-box') : null;
        if (!modal) return;
        const btnGrid = modal.querySelector('div[style*="grid-template-columns"]:last-of-type');
        if (!btnGrid) return;
        if (btnGrid.querySelector('.whatsapp-btn')) return;
        const waBtn = document.createElement('button');
        waBtn.className = 'btn whatsapp-btn';
        waBtn.style.cssText = 'background:linear-gradient(135deg,#25D366,#1DA851);color:#fff;';
        waBtn.innerHTML = '<i class="fab fa-whatsapp"></i> واتساب';
        waBtn.onclick = function() { sendInvoiceWhatsApp(id); };
        btnGrid.style.gridTemplateColumns = '1fr 1fr 1fr 1fr';
        btnGrid.appendChild(waBtn);
    }, 100);
};

var _originalShowReceipt = window.showReceipt;
window.showReceipt = function(id) {
    if (_originalShowReceipt) _originalShowReceipt(id);
    setTimeout(function() {
        const modal = $('modalOverlay') ? $('modalOverlay').querySelector('.modal-box') : null;
        if (!modal) return;
        const btnGrid = modal.querySelector('div[style*="grid-template-columns"]:last-of-type');
        if (!btnGrid) return;
        if (btnGrid.querySelector('.whatsapp-btn')) return;
        const waBtn = document.createElement('button');
        waBtn.className = 'btn whatsapp-btn';
        waBtn.style.cssText = 'background:linear-gradient(135deg,#25D366,#1DA851);color:#fff;';
        waBtn.innerHTML = '<i class="fab fa-whatsapp"></i> واتساب';
        waBtn.onclick = function() { sendReceiptWhatsApp(id); };
        btnGrid.appendChild(waBtn);
    }, 100);
};

// ═══════════════════════════════════════════════════════════
// 🖨️ الطباعة A4
// ═══════════════════════════════════════════════════════════
window.printInvoice = function(id) {
    const inv = sales.find(function(s) { return s.id === id; });
    if (!inv) return;
    const c = companyData;
    let itemsHtml = '';
    inv.items.forEach(function(it, i) {
        itemsHtml += '<tr><td style="padding:8px;border:1px solid #ddd;text-align:center;">' + (i + 1) + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;">' + it.name + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + it.qty + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + formatMoney(it.price) + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + formatMoney(it.total) + '</td></tr>';
    });
    const html = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>فاتورة</title>' +
        '<style>*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif}body{padding:20px;background:#fff;color:#000;font-size:13px}' +
        '.header{text-align:center;padding-bottom:15px;border-bottom:2px dashed #333;margin-bottom:15px}' +
        '.header h1{font-size:24px;margin-bottom:5px}' +
        '.info{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:15px;padding:10px;background:#f5f5f5;border-radius:5px;font-size:12px}' +
        'table{width:100%;border-collapse:collapse;margin-bottom:15px;font-size:12px}' +
        'table th{background:#000;color:#fff;padding:10px 8px;text-align:center}' +
        'table td{padding:8px;border:1px solid #ddd;text-align:center}' +
        '.totals{width:300px;margin-right:auto;font-size:13px}' +
        '.totals .row{display:flex;justify-content:space-between;padding:6px 10px;border-bottom:1px solid #eee}' +
        '.totals .total{background:#000;color:#fff;font-weight:900;font-size:18px;padding:12px;margin-top:8px;border-radius:5px}' +
        '.footer{text-align:center;margin-top:20px;padding-top:15px;border-top:2px dashed #333;font-size:11px;color:#666}' +
        '@media print{@page{size:auto;margin:10mm}body{padding:0}}</style></head><body>' +
        '<div class="header"><h1>' + (c.name || 'الميزان') + '</h1>' +
            (c.phone ? '<p>📞 ' + c.phone + '</p>' : '') +
            '<p style="margin-top:8px;font-size:14px;font-weight:bold;">فاتورة بيع</p></div>' +
        '<div class="info">' +
            '<div><strong>رقم:</strong> #' + inv.number + '</div>' +
            '<div><strong>التاريخ:</strong> ' + inv.date + ' ' + (inv.time || '') + '</div>' +
            '<div><strong>العميل:</strong> ' + (inv.customer || 'عميل نقدي') + '</div>' +
            '<div><strong>الدفع:</strong> ' + getPaymentMethodLabel(inv.paymentMethod) + '</div></div>' +
        '<table><thead><tr><th>#</th><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>' + itemsHtml + '</tbody></table>' +
        '<div class="totals">' +
            '<div class="row"><span>المجموع:</span><span>' + formatMoney(inv.subtotal || inv.total) + ' ج.م</span></div>' +
            (inv.vat > 0 ? '<div class="row"><span>الضريبة:</span><span>' + formatMoney(inv.vat) + ' ج.م</span></div>' : '') +
            '<div class="row total"><span>الإجمالي:</span><span>' + formatMoney(inv.total) + ' ج.م</span></div>' +
            (inv.remainingAmount > 0 ? '<div class="row" style="color:#E06060;"><span>المتبقي:</span><span>' + formatMoney(inv.remainingAmount) + ' ج.م</span></div>' : '') +
        '</div>' +
        '<div class="footer">' + (c.footer || 'شكراً لتعاملكم معنا 🌟') + '</div>' +
        '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print();setTimeout(function(){window.close();},1000);},300);};</scr' + 'ipt>' +
        '</body></html>';
    const w = window.open('', '_blank', 'width=800,height=600');
    if (!w) { showToast('⚠️ الرجاء السماح بالنوافذ', 'warning'); return; }
    w.document.write(html);
    w.document.close();
};

window.printPurchaseInvoice = function(id) {
    const inv = purchases.find(function(p) { return p.id === id; });
    if (!inv) return;
    const c = companyData;
    let itemsHtml = '';
    inv.items.forEach(function(it, i) {
        itemsHtml += '<tr><td style="padding:8px;border:1px solid #ddd;text-align:center;">' + (i + 1) + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;">' + it.name + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + it.qty + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + formatMoney(it.price) + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + formatMoney(it.total) + '</td></tr>';
    });
    const html = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>فاتورة شراء</title>' +
        '<style>*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif}body{padding:20px;background:#fff;color:#000;font-size:13px}' +
        '.header{text-align:center;padding-bottom:15px;border-bottom:2px dashed #333;margin-bottom:15px}' +
        '.header h1{font-size:24px}' +
        '.badge{display:inline-block;background:#E06060;color:#fff;padding:4px 16px;border-radius:20px;font-size:11px;font-weight:900;margin-bottom:10px}' +
        '.info{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:15px;padding:10px;background:#f5f5f5;border-radius:5px;font-size:12px}' +
        'table{width:100%;border-collapse:collapse;margin-bottom:15px;font-size:12px}' +
        'table th{background:#E06060;color:#fff;padding:10px 8px;text-align:center}' +
        'table td{padding:8px;border:1px solid #ddd;text-align:center}' +
        '.totals{width:300px;margin-right:auto;font-size:13px}' +
        '.totals .total{background:#E06060;color:#fff;font-weight:900;font-size:18px;padding:12px;margin-top:8px;border-radius:5px;display:flex;justify-content:space-between}' +
        '.footer{text-align:center;margin-top:20px;padding-top:15px;border-top:2px dashed #333;font-size:11px;color:#666}</style></head><body>' +
        '<div class="header"><div class="badge">🛒 فاتورة شراء</div><h1>' + (c.name || 'الميزان') + '</h1></div>' +
        '<div class="info">' +
            '<div><strong>رقم:</strong> #' + inv.number + '</div>' +
            '<div><strong>التاريخ:</strong> ' + inv.date + '</div>' +
            '<div><strong>المورد:</strong> ' + inv.supplierName + '</div>' +
            '<div><strong>الدفع:</strong> ' + (inv.payment === 'cash' ? 'نقدي' : 'آجل') + '</div></div>' +
        '<table><thead><tr><th>#</th><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>' + itemsHtml + '</tbody></table>' +
        '<div class="totals"><div class="total"><span>الإجمالي:</span><span>' + formatMoney(inv.total) + ' ج.م</span></div></div>' +
        '<div class="footer">' + (c.footer || 'شكراً لتعاملكم معنا 🌟') + '</div>' +
        '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print();setTimeout(function(){window.close();},1000);},300);};</scr' + 'ipt>' +
        '</body></html>';
    const w = window.open('', '_blank', 'width=800,height=600');
    if (!w) { showToast('⚠️ الرجاء السماح بالنوافذ', 'warning'); return; }
    w.document.write(html);
    w.document.close();
};

window.printPurchaseFromList = function(id) { printPurchaseInvoice(id); };

window.printReturnInvoice = function(id) {
    const ret = returns.find(function(r) { return r.id === id; });
    if (!ret) return;
    const c = companyData;
    const isSale = ret.type === 'sale';
    const color = isSale ? '#E6A830' : '#4A8AB5';
    const title = isSale ? 'مرتجع بيع' : 'مرتجع شراء';
    let itemsHtml = '';
    ret.items.forEach(function(it, i) {
        itemsHtml += '<tr><td style="padding:8px;border:1px solid #ddd;text-align:center;">' + (i + 1) + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;">' + it.name + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + it.qty + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + formatMoney(it.price) + '</td>' +
            '<td style="padding:8px;border:1px solid #ddd;text-align:center;">' + formatMoney(it.total) + '</td></tr>';
    });
    const html = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>' + title + '</title>' +
        '<style>*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif}body{padding:20px;background:#fff;color:#000;font-size:13px}' +
        '.header{text-align:center;padding-bottom:15px;border-bottom:2px dashed #333;margin-bottom:15px}' +
        '.header h1{font-size:24px}' +
        '.badge{display:inline-block;background:' + color + ';color:#fff;padding:4px 16px;border-radius:20px;font-size:11px;font-weight:900;margin-bottom:10px}' +
        '.info{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:15px;padding:10px;background:#f5f5f5;border-radius:5px;font-size:12px}' +
        'table{width:100%;border-collapse:collapse;margin-bottom:15px;font-size:12px}' +
        'table th{background:' + color + ';color:#fff;padding:10px 8px;text-align:center}' +
        'table td{padding:8px;border:1px solid #ddd;text-align:center}' +
        '.totals{width:300px;margin-right:auto}' +
        '.totals .total{background:' + color + ';color:#fff;font-weight:900;font-size:18px;padding:12px;border-radius:5px;display:flex;justify-content:space-between}</style></head><body>' +
        '<div class="header"><div class="badge">🔄 ' + title + '</div><h1>' + (c.name || 'الميزان') + '</h1></div>' +
        '<div class="info">' +
            '<div><strong>رقم:</strong> #' + ret.number + '</div>' +
            '<div><strong>التاريخ:</strong> ' + ret.date + '</div>' +
            '<div><strong>' + (isSale ? 'العميل' : 'المورد') + ':</strong> ' + ret.party + '</div></div>' +
        '<table><thead><tr><th>#</th><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>' + itemsHtml + '</tbody></table>' +
        '<div class="totals"><div class="total"><span>إجمالي المرتجع:</span><span>' + formatMoney(ret.total) + ' ج.م</span></div></div>' +
        '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print();setTimeout(function(){window.close();},1000);},300);};</scr' + 'ipt>' +
        '</body></html>';
    const w = window.open('', '_blank', 'width=800,height=600');
    if (!w) { showToast('⚠️ الرجاء السماح بالنوافذ', 'warning'); return; }
    w.document.write(html);
    w.document.close();
};

window.printReturnFromList = function(id) { printReturnInvoice(id); };

window.printThermalInvoice = function(id) {
    const inv = sales.find(function(s) { return s.id === id; });
    if (!inv) return;
    const c = companyData;
    let itemsHtml = '';
    inv.items.forEach(function(it) {
        itemsHtml += '<tr><td>' + it.name + '</td><td>' + it.qty + '</td><td>' + formatMoney(it.price) + '</td><td>' + formatMoney(it.total) + '</td></tr>';
    });
    const html = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>حرارية</title>' +
        '<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:"Courier New",monospace;background:#fff;color:#000;padding:3px}' +
        '@page{size:58mm auto;margin:2mm}' +
        '.wrap{width:100%;font-size:11px}' +
        '.h{text-align:center;border-bottom:1px dashed #000;padding-bottom:5px;margin-bottom:5px}' +
        '.h h2{font-size:14px;margin:3px 0}' +
        '.info{font-size:10px;padding:3px 0;border-bottom:1px dashed #000;margin-bottom:5px}' +
        '.info div{display:flex;justify-content:space-between;padding:2px 0}' +
        'table{width:100%;border-collapse:collapse;font-size:10px;margin:5px 0}' +
        'table th{background:#000;color:#fff;padding:3px 2px;text-align:center}' +
        'table td{padding:3px 2px;text-align:center;border-bottom:1px dotted #000}' +
        '.totals{border-top:1px dashed #000;padding-top:5px;margin-top:5px}' +
        '.row{display:flex;justify-content:space-between;padding:2px 0;font-size:11px}' +
        '.row.grand{border-top:1px solid #000;border-bottom:1px solid #000;font-size:14px;font-weight:900;padding:4px 0;margin:3px 0}' +
        '.footer{text-align:center;border-top:1px dashed #000;padding-top:5px;margin-top:5px;font-size:10px}</style></head><body><div class="wrap">' +
        '<div class="h"><h2>' + (c.name || 'الميزان') + '</h2>' +
            (c.phone ? '<p>📞 ' + c.phone + '</p>' : '') + '</div>' +
        '<div class="info">' +
            '<div><span>فاتورة:</span><span>#' + inv.number + '</span></div>' +
            '<div><span>التاريخ:</span><span>' + inv.date + '</span></div>' +
            '<div><span>العميل:</span><span>' + (inv.customer || 'نقدي') + '</span></div></div>' +
        '<table><thead><tr><th>الصنف</th><th>كمية</th><th>سعر</th><th>إجمالي</th></tr></thead><tbody>' + itemsHtml + '</tbody></table>' +
        '<div class="totals">' +
            '<div class="row"><span>المجموع:</span><span>' + formatMoney(inv.subtotal || inv.total) + '</span></div>' +
            (inv.vat > 0 ? '<div class="row"><span>الضريبة:</span><span>' + formatMoney(inv.vat) + '</span></div>' : '') +
            '<div class="row grand"><span>الإجمالي:</span><span>' + formatMoney(inv.total) + '</span></div></div>' +
        '<div class="footer"><p>' + (c.footer || 'شكراً لتعاملكم معنا 🌟') + '</p></div>' +
        '</div>' +
        '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print();setTimeout(function(){window.close();},1000);},300);};</scr' + 'ipt>' +
        '</body></html>';
    const w = window.open('', '_blank', 'width=400,height=600');
    if (!w) { showToast('⚠️ الرجاء السماح بالنوافذ', 'warning'); return; }
    w.document.write(html);
    w.document.close();
};

window.printReceipt = function(id) {
    const pay = payments.find(function(p) { return p.id === id; });
    if (!pay) return;
    const isCollect = pay.type === 'collect';
    const c = companyData;
    const html = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>إيصال</title>' +
        '<style>*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif}body{padding:20px}' +
        '.box{max-width:400px;margin:0 auto;border:2px solid #000;padding:20px}' +
        '.header{text-align:center;padding-bottom:12px;border-bottom:2px dashed #333;margin-bottom:12px}' +
        '.header h2{font-size:22px;margin-bottom:4px}' +
        '.info div{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px dotted #ccc}' +
        '.amount{text-align:center;padding:15px;border:2px solid #000;margin:12px 0;background:#f9f9f9}' +
        '.amount .lbl{font-size:12px;font-weight:700;color:#555;margin-bottom:6px}' +
        '.amount .val{font-size:26px;font-weight:900;font-family:monospace}' +
        '.footer{text-align:center;padding-top:12px;border-top:2px dashed #333;margin-top:12px;font-size:11px;color:#666}</style></head><body>' +
        '<div class="box">' +
            '<div class="header"><h2>' + (c.name || 'الميزان') + '</h2><p>' + (isCollect ? 'إيصال استلام نقدية' : 'إيصال دفع نقدية') + '</p></div>' +
            '<div class="info">' +
                '<div><span>رقم:</span><span>#' + String(pay.id).slice(-6) + '</span></div>' +
                '<div><span>التاريخ:</span><span>' + pay.date + '</span></div>' +
                '<div><span>الوقت:</span><span>' + pay.time + '</span></div>' +
                '<div><span>' + (isCollect ? 'العميل' : 'المورد') + ':</span><span>' + pay.party + '</span></div></div>' +
            '<div class="amount"><div class="lbl">' + (isCollect ? 'المبلغ المستلم' : 'المبلغ المدفوع') + '</div><div class="val">' + formatMoney(pay.amount) + ' ج.م</div></div>' +
            (pay.note ? '<div style="text-align:center;font-size:11px;color:#666;">📝 ' + pay.note + '</div>' : '') +
            '<div class="footer">' + (c.footer || 'شكراً لتعاملكم معنا 🌟') + '</div>' +
        '</div>' +
        '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print();setTimeout(function(){window.close();},1000);},300);};</scr' + 'ipt>' +
        '</body></html>';
    const w = window.open('', '_blank', 'width=500,height=700');
    if (!w) { showToast('⚠️ الرجاء السماح بالنوافذ', 'warning'); return; }
    w.document.write(html);
    w.document.close();
};

// ═══════════════════════════════════════════════════════════
// 🖨️ حفظ وطباعة
// ═══════════════════════════════════════════════════════════
window.saveSaleAndPrint = function() {
    if (currentSaleItems.length === 0) { showToast('⚠️ لا توجد أصناف', 'error'); return; }
    const itemsSnapshot = JSON.parse(JSON.stringify(currentSaleItems));
    const customerSnapshot = $('saleCustomer') ? $('saleCustomer').value : 'عميل نقدي';
    const sellerSnapshot = $('saleSeller') ? $('saleSeller').value : '';
    const deliverySnapshot = $('saleDelivery') ? $('saleDelivery').value : '';
    const shippingSnapshot = $('saleShipping') ? $('saleShipping').value.trim() : '';
    const paymentSnapshot = getRadioValue('salePaymentMethod', 'cash');
    const invoiceTypeSnapshot = getRadioValue('saleInvoiceType', 'simple');
    const isTax = invoiceTypeSnapshot === 'tax';
    const cashBoxIdSnapshot = ($('saleCashBox') ? $('saleCashBox').value : '') || (getDefaultCashBox() ? getDefaultCashBox().id : null);
    const boxSnapshot = getCashBoxById(cashBoxIdSnapshot);
    const discountSnapshot = parseFloat($('saleDiscount') ? $('saleDiscount').value : 0) || 0;
    const levelDiscountSnapshot = parseFloat($('saleLevelDiscount') ? $('saleLevelDiscount').value : 0) || 0;

    for (let i = 0; i < currentSaleItems.length; i++) {
        const it = currentSaleItems[i];
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (!p || p.qty < it.qty) { showToast('⚠️ مشكلة في ' + it.name, 'error'); return; }
    }

    const today = getTodayDate();
    let cogsTotal = 0;
    currentSaleItems.forEach(function(it) {
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (p) { it.costPrice = p.buy; cogsTotal += p.buy * it.qty; p.qty -= it.qty; }
    });

    const subtotal = itemsSnapshot.reduce(function(s, i) { return s + i.total; }, 0);
    const vat = isTax ? (subtotal * (vatSettings.defaultVAT / 100)) : 0;
    const total = Math.max(0, subtotal + vat - discountSnapshot - levelDiscountSnapshot);
    const isCash = ['cash', 'wallet', 'visa', 'bank'].indexOf(paymentSnapshot) > -1;

    const inv = {
        id: Date.now(), number: sales.length + 1,
        customer: customerSnapshot,
        customerId: (customers.find(function(c) { return c.name === customerSnapshot; }) || {}).id || null,
        seller: sellerSnapshot, delivery: deliverySnapshot, shipping: shippingSnapshot,
        paymentMethod: paymentSnapshot, invoiceType: invoiceTypeSnapshot,
        cashBoxId: cashBoxIdSnapshot, cashBoxName: boxSnapshot ? boxSnapshot.name : '',
        subtotal: subtotal, vat: vat, discount: discountSnapshot, levelDiscount: levelDiscountSnapshot, total: total,
        cogs: cogsTotal, profit: subtotal - cogsTotal - discountSnapshot - levelDiscountSnapshot,
        paidAmount: isCash ? total : 0,
        remainingAmount: isCash ? 0 : total,
        status: isCash ? 'paid' : 'unpaid',
        items: itemsSnapshot, date: today, time: getNowTime(),
        soldBy: currentUser ? currentUser.name : ''
    };
    sales.push(inv);

    if (isCash) {
        treasury.push({
            id: Date.now() + 1, type: 'deposit', amount: total,
            note: 'فاتورة بيع #' + inv.number + ' - ' + customerSnapshot,
            cashBoxId: cashBoxIdSnapshot, cashBoxName: boxSnapshot ? boxSnapshot.name : '',
            refType: 'sale', refId: inv.id, date: today, time: getNowTime()
        });
    }

    setData('sales', sales);
    setData('products', products);
    setData('treasury', treasury);

    currentSaleItems = [];
    if ($('saleCustomer')) $('saleCustomer').value = '';
    if ($('saleDiscount')) $('saleDiscount').value = '0';
    if ($('saleLevelDiscount')) $('saleLevelDiscount').value = '0';

    renderCashier();
    updateSaleTotals();
    populateSaleProducts();
    renderProducts();
    updateDashboard();
    renderCashBoxes();

    showToast('✅ فاتورة #' + inv.number + ' جاري الطباعة...', 'success');
    setTimeout(function() { printInvoice(inv.id); }, 300);
};

window.saveSaleAndThermal = function() {
    if (currentSaleItems.length === 0) { showToast('⚠️ لا توجد أصناف', 'error'); return; }
    const itemsSnapshot = JSON.parse(JSON.stringify(currentSaleItems));
    const customerSnapshot = $('saleCustomer') ? $('saleCustomer').value : 'عميل نقدي';
    const sellerSnapshot = $('saleSeller') ? $('saleSeller').value : '';
    const paymentSnapshot = getRadioValue('salePaymentMethod', 'cash');
    const cashBoxIdSnapshot = ($('saleCashBox') ? $('saleCashBox').value : '') || (getDefaultCashBox() ? getDefaultCashBox().id : null);
    const boxSnapshot = getCashBoxById(cashBoxIdSnapshot);

    for (let i = 0; i < currentSaleItems.length; i++) {
        const it = currentSaleItems[i];
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (!p || p.qty < it.qty) { showToast('⚠️ مشكلة في ' + it.name, 'error'); return; }
    }

    const today = getTodayDate();
    let cogsTotal = 0;
    currentSaleItems.forEach(function(it) {
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (p) { it.costPrice = p.buy; cogsTotal += p.buy * it.qty; p.qty -= it.qty; }
    });

    const subtotal = itemsSnapshot.reduce(function(s, i) { return s + i.total; }, 0);
    const total = subtotal;
    const isCash = ['cash', 'wallet', 'visa', 'bank'].indexOf(paymentSnapshot) > -1;

    const inv = {
        id: Date.now(), number: sales.length + 1,
        customer: customerSnapshot, seller: sellerSnapshot,
        paymentMethod: paymentSnapshot, invoiceType: 'simple',
        cashBoxId: cashBoxIdSnapshot, cashBoxName: boxSnapshot ? boxSnapshot.name : '',
        subtotal: subtotal, vat: 0, discount: 0, levelDiscount: 0, total: total,
        cogs: cogsTotal, profit: subtotal - cogsTotal,
        paidAmount: isCash ? total : 0, remainingAmount: isCash ? 0 : total,
        status: isCash ? 'paid' : 'unpaid',
        items: itemsSnapshot, date: today, time: getNowTime(),
        soldBy: currentUser ? currentUser.name : ''
    };
    sales.push(inv);

    if (isCash) {
        treasury.push({
            id: Date.now() + 1, type: 'deposit', amount: total,
            note: 'فاتورة بيع #' + inv.number + ' - ' + customerSnapshot,
            cashBoxId: cashBoxIdSnapshot, cashBoxName: boxSnapshot ? boxSnapshot.name : '',
            refType: 'sale', refId: inv.id, date: today, time: getNowTime()
        });
    }

    setData('sales', sales);
    setData('products', products);
    setData('treasury', treasury);

    currentSaleItems = [];
    if ($('saleCustomer')) $('saleCustomer').value = '';

    renderCashier();
    updateSaleTotals();
    populateSaleProducts();
    renderProducts();
    updateDashboard();
    renderCashBoxes();

    showToast('✅ فاتورة #' + inv.number + ' - طباعة حرارية', 'success');
    setTimeout(function() { printThermalInvoice(inv.id); }, 300);
};

window.savePurchaseAndPrint = function() {
    if (currentPurItems.length === 0) { showToast('⚠️ لا توجد أصناف', 'error'); return; }
    const supplierName = $('purSupplier') ? $('purSupplier').value : '';
    if (!supplierName) { showToast('⚠️ اختر مورد', 'error'); return; }
    const payment = $('purPayment') ? $('purPayment').value : 'cash';
    const cashBoxId = ($('purCashBox') ? $('purCashBox').value : '') || (getDefaultCashBox() ? getDefaultCashBox().id : null);
    const box = getCashBoxById(cashBoxId);
    const notes = $('purNotes') ? $('purNotes').value.trim() : '';
    const itemsSnapshot = JSON.parse(JSON.stringify(currentPurItems));
    const subtotal = currentPurItems.reduce(function(s, i) { return s + i.total; }, 0);
    const today = getTodayDate();

    currentPurItems.forEach(function(it) {
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (p) { p.qty += it.qty; p.buy = it.price; }
    });

    const isCash = payment === 'cash';
    const inv = {
        id: Date.now(), number: purchases.length + 1,
        supplierName: supplierName, notes: notes, subtotal: subtotal, total: subtotal,
        payment: payment, cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
        paidAmount: isCash ? subtotal : 0,
        remainingAmount: isCash ? 0 : subtotal,
        status: isCash ? 'paid' : 'unpaid',
        items: itemsSnapshot, date: today, time: getNowTime(),
        purchasedBy: currentUser ? currentUser.name : ''
    };
    purchases.push(inv);

    if (isCash) {
        treasury.push({
            id: Date.now() + 1, type: 'withdraw', amount: subtotal,
            note: 'فاتورة شراء #' + inv.number + ' - ' + supplierName,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'purchase', refId: inv.id, date: today, time: getNowTime()
        });
    }

    setData('purchases', purchases);
    setData('products', products);
    setData('treasury', treasury);

    currentPurItems = [];
    if ($('purSupplier')) $('purSupplier').value = '';
    if ($('purNotes')) $('purNotes').value = '';

    renderPurItems();
    updatePurTotals();
    renderPurchases();
    updatePurStats();
    populatePurProducts();
    populateSaleProducts();
    renderProducts();
    updateDashboard();

    showToast('✅ فاتورة شراء #' + inv.number + ' جاري الطباعة...', 'success');
    setTimeout(function() { printPurchaseInvoice(inv.id); }, 300);
};

window.saveReturnAndPrint = function() {
    if (currentRetItems.length === 0) { showToast('⚠️ لا توجد أصناف', 'error'); return; }
    const type = $('retType') ? $('retType').value : 'sale';
    const party = $('retParty') ? $('retParty').value : '';
    if (!party) { showToast('⚠️ اختر ' + (type === 'sale' ? 'العميل' : 'المورد'), 'error'); return; }
    const cashBoxId = $('retCashBox') ? $('retCashBox').value : '';
    if (!cashBoxId) { showToast('⚠️ اختر الخزنة', 'error'); return; }

    const box = getCashBoxById(cashBoxId);
    const notes = $('retNotes') ? $('retNotes').value.trim() : '';
    const itemsSnapshot = JSON.parse(JSON.stringify(currentRetItems));
    const total = currentRetItems.reduce(function(s, i) { return s + i.total; }, 0);
    const today = getTodayDate();

    for (let i = 0; i < currentRetItems.length; i++) {
        const it = currentRetItems[i];
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (!p) { showToast('⚠️ المنتج غير موجود', 'error'); return; }
        if (type === 'purchase' && p.qty < it.qty) { showToast('⚠️ كمية غير كافية', 'error'); return; }
    }

    currentRetItems.forEach(function(it) {
        const p = products.find(function(pr) { return pr.id == it.productId; });
        if (p) {
            if (type === 'sale') p.qty += it.qty;
            else p.qty -= it.qty;
        }
    });

    const ret = {
        id: Date.now(), number: returns.length + 1, type: type, party: party,
        cashBoxId: cashBoxId, cashBoxName: box ? box.name : '', notes: notes, total: total,
        items: itemsSnapshot, date: today, time: getNowTime(),
        createdBy: currentUser ? currentUser.name : ''
    };
    returns.push(ret);

    if (type === 'sale') {
        treasury.push({
            id: Date.now() + 1, type: 'withdraw', amount: total,
            note: 'مرتجع بيع #' + ret.number + ' - ' + party,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'return', refId: ret.id, date: today, time: getNowTime()
        });
    } else {
        treasury.push({
            id: Date.now() + 1, type: 'deposit', amount: total,
            note: 'مرتجع شراء #' + ret.number + ' - ' + party,
            cashBoxId: cashBoxId, cashBoxName: box ? box.name : '',
            refType: 'return', refId: ret.id, date: today, time: getNowTime()
        });
    }

    setData('returns', returns);
    setData('products', products);
    setData('treasury', treasury);

    currentRetItems = [];
    if ($('retParty')) $('retParty').value = '';

    renderRetItems();
    renderReturns();
    updateReturnsStats();
    renderProducts();
    updateDashboard();
    renderCashBoxes();
    populateSaleProducts();

    showToast('✅ مرتجع #' + ret.number + ' جاري الطباعة...', 'success');
    setTimeout(function() { printReturnInvoice(ret.id); }, 300);
};

// ═══════════════════════════════════════════════════════════
// 📊 التقارير
// ═══════════════════════════════════════════════════════════
window.currentReport = 'daily';
window.currentReportData = null;

window.getDateRange = function(period) {
    const now = new Date();
    if (period === 'daily') {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({
                date: d.toISOString().split('T')[0],
                label: ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1)
            });
        }
        return days;
    }
    if (period === 'monthly') {
        const months = [];
        const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                date: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
                label: monthNames[d.getMonth()] + ' ' + d.getFullYear()
            });
        }
        return months;
    }
    if (period === 'yearly') {
        const years = [];
        for (let i = 2; i >= 0; i--) {
            const year = now.getFullYear() - i;
            years.push({ date: String(year), label: 'سنة ' + year });
        }
        return years;
    }
    return [];
};

window.getReportData = function(period, dateStr) {
    const filterFn = function(date) {
        if (!date) return false;
        if (period === 'daily') return date === dateStr;
        if (period === 'monthly') return (date || '').indexOf(dateStr) === 0;
        if (period === 'yearly') return (date || '').indexOf(dateStr) === 0;
        return false;
    };

    const daySales = sales.filter(function(s) { return filterFn(s.date); });
    const dayPurchases = purchases.filter(function(p) { return filterFn(p.date); });
    const dayExpenses = expenses.filter(function(e) { return filterFn(e.date); });
    const dayReturns = returns.filter(function(r) { return filterFn(r.date); });
    const dayPayments = payments.filter(function(p) { return filterFn(p.date); });

    const salesAmount = daySales.reduce(function(s, x) { return s + (x.total || 0); }, 0);
    const purchasesAmount = dayPurchases.reduce(function(s, x) { return s + (x.total || 0); }, 0);
    const expensesAmount = dayExpenses.reduce(function(s, x) { return s + (x.amount || 0); }, 0);
    const cogsAmount = daySales.reduce(function(s, x) { return s + (x.cogs || 0); }, 0);
    const returnsAmount = dayReturns.filter(function(r) { return r.type === 'sale'; }).reduce(function(s, x) { return s + (x.total || 0); }, 0);

    const collected = dayPayments.filter(function(p) { return p.type === 'collect'; }).reduce(function(s, p) { return s + (p.amount || 0); }, 0);
    const paid = dayPayments.filter(function(p) { return p.type === 'pay'; }).reduce(function(s, p) { return s + (p.amount || 0); }, 0);

    const grossProfit = salesAmount - cogsAmount;
    const netProfit = grossProfit - expensesAmount;

    return {
        salesCount: daySales.length,
        salesAmount: salesAmount,
        purchasesCount: dayPurchases.length,
        purchasesAmount: purchasesAmount,
        expensesCount: dayExpenses.length,
        expensesAmount: expensesAmount,
        returnsCount: dayReturns.length,
        returnsAmount: returnsAmount,
        cogs: cogsAmount,
        grossProfit: grossProfit,
        netProfit: netProfit,
        collected: collected,
        paid: paid
    };
};

window.switchReport = function(type, btn) {
    window.currentReport = type;
    document.querySelectorAll('.report-tab').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderReport(type);
};

window.renderReport = function(type) {
    const container = $('reportContent');
    if (!container) return;

    if (type === 'daily' || type === 'monthly' || type === 'yearly') {
        const periods = getDateRange(type);
        const dataList = periods.map(function(p) { return Object.assign({}, p, getReportData(type, p.date)); });

        let totals = { salesAmount: 0, salesCount: 0, purchasesAmount: 0, expensesAmount: 0, returnsAmount: 0, cogs: 0, grossProfit: 0, netProfit: 0, collected: 0, paid: 0 };
        dataList.forEach(function(d) {
            totals.salesAmount += d.salesAmount;
            totals.salesCount += d.salesCount;
            totals.purchasesAmount += d.purchasesAmount;
            totals.expensesAmount += d.expensesAmount;
            totals.returnsAmount += d.returnsAmount;
            totals.cogs += d.cogs;
            totals.grossProfit += d.grossProfit;
            totals.netProfit += d.netProfit;
            totals.collected += d.collected;
            totals.paid += d.paid;
        });

        window.currentReportData = { type: type, dataList: dataList, totals: totals };

        const maxSales = Math.max.apply(null, dataList.map(function(d) { return d.salesAmount; }).concat([1]));
        const maxPurchases = Math.max.apply(null, dataList.map(function(d) { return d.purchasesAmount; }).concat([1]));
        const maxProfit = Math.max.apply(null, dataList.map(function(d) { return Math.abs(d.netProfit); }).concat([1]));

        let chartHtml = '';
        dataList.forEach(function(d) {
            chartHtml += '<div class="chart-bar-wrap">' +
                '<div style="display:flex;gap:2px;width:100%;align-items:flex-end;height:100%;justify-content:center;">' +
                    '<div class="chart-bar sales" style="height:' + Math.max((d.salesAmount / maxSales) * 100, 3) + '%;width:33%;">' +
                        (d.salesAmount > 0 ? '<span class="chart-bar-value">' + d.salesAmount.toFixed(0) + '</span>' : '') +
                    '</div>' +
                    '<div class="chart-bar purchases" style="height:' + Math.max((d.purchasesAmount / maxPurchases) * 100, 3) + '%;width:33%;">' +
                        (d.purchasesAmount > 0 ? '<span class="chart-bar-value">' + d.purchasesAmount.toFixed(0) + '</span>' : '') +
                    '</div>' +
                    '<div class="chart-bar profit" style="height:' + Math.max((Math.abs(d.netProfit) / maxProfit) * 100, 3) + '%;width:33%;">' +
                        (d.netProfit !== 0 ? '<span class="chart-bar-value">' + d.netProfit.toFixed(0) + '</span>' : '') +
                    '</div>' +
                '</div>' +
                '<div class="chart-bar-label">' + d.label + '</div>' +
            '</div>';
        });

        let tableHtml = '';
        dataList.forEach(function(d) {
            tableHtml += '<div class="report-table-row" style="grid-template-columns: 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr;">' +
                '<span>' + d.label + '</span>' +
                '<span class="green">' + formatMoney(d.salesAmount) + '</span>' +
                '<span class="red">' + formatMoney(d.purchasesAmount) + '</span>' +
                '<span class="orange">' + formatMoney(d.expensesAmount) + '</span>' +
                '<span class="gold">' + formatMoney(d.grossProfit) + '</span>' +
                '<span class="' + (d.netProfit >= 0 ? 'green' : 'red') + '">' + formatMoney(d.netProfit) + '</span>' +
            '</div>';
        });

        container.innerHTML =
            '<div class="report-summary">' +
                '<div class="report-stat green"><div class="num">' + formatMoney(totals.salesAmount) + '</div><div class="lbl">💰 إجمالي المبيعات</div></div>' +
                '<div class="report-stat red"><div class="num">' + formatMoney(totals.purchasesAmount) + '</div><div class="lbl">🛒 إجمالي المشتريات</div></div>' +
                '<div class="report-stat orange"><div class="num">' + formatMoney(totals.expensesAmount) + '</div><div class="lbl">💸 إجمالي المصروفات</div></div>' +
                '<div class="report-stat gold"><div class="num">' + formatMoney(totals.grossProfit) + '</div><div class="lbl">📈 إجمالي الربح</div></div>' +
                '<div class="report-stat ' + (totals.netProfit >= 0 ? 'green' : 'red') + '"><div class="num">' + formatMoney(totals.netProfit) + '</div><div class="lbl">💵 صافي الربح</div></div>' +
                '<div class="report-stat blue"><div class="num">' + totals.salesCount + '</div><div class="lbl">🧾 عدد الفواتير</div></div>' +
            '</div>' +
            '<div class="report-chart">' +
                '<h4>📊 الرسم البياني</h4>' +
                '<div class="chart-bars">' + chartHtml + '</div>' +
            '</div>' +
            '<h3 style="color:#C9A94E;font-size:14px;margin:14px 0 8px;">📋 التفاصيل</h3>' +
            '<div class="report-table-header" style="grid-template-columns: 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr;">' +
                '<span>الفترة</span><span>مبيعات</span><span>مشتريات</span><span>مصروفات</span><span>إجمالي ربح</span><span>صافي ربح</span>' +
            '</div>' +
            tableHtml;
    }

    if (type === 'sellers') {
        const sellerData = {};
        sales.forEach(function(s) {
            const seller = s.seller || s.soldBy || 'غير محدد';
            if (!sellerData[seller]) sellerData[seller] = { name: seller, count: 0, total: 0, profit: 0, items: 0 };
            sellerData[seller].count++;
            sellerData[seller].total += s.total || 0;
            sellerData[seller].profit += s.profit || 0;
            sellerData[seller].items += (s.items || []).reduce(function(ss, it) { return ss + it.qty; }, 0);
        });
        const list = Object.values(sellerData).sort(function(a, b) { return b.total - a.total; });
        window.currentReportData = { type: type, list: list };

        if (list.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-user-tie"></i><span>لا توجد مبيعات</span></div>';
            return;
        }

        let tableHtml = '';
        list.forEach(function(d, i) {
            const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            tableHtml += '<div class="report-table-row" style="grid-template-columns: 0.4fr 1.5fr 0.7fr 1fr 0.7fr 1fr;">' +
                '<span><span class="rank-badge ' + rankClass + '">' + (i + 1) + '</span></span>' +
                '<span><strong>' + d.name + '</strong></span>' +
                '<span class="blue">' + d.count + '</span>' +
                '<span class="gold">' + formatMoney(d.total) + '</span>' +
                '<span class="orange">' + d.items + '</span>' +
                '<span class="green">' + formatMoney(d.profit) + '</span>' +
            '</div>';
        });

        container.innerHTML =
            '<div class="report-summary">' +
                '<div class="report-stat green"><div class="num">' + list.length + '</div><div class="lbl">👨‍💼 عدد البائعين</div></div>' +
                '<div class="report-stat gold"><div class="num">' + formatMoney(list.reduce(function(s, d) { return s + d.total; }, 0)) + '</div><div class="lbl">💰 إجمالي المبيعات</div></div>' +
                '<div class="report-stat blue"><div class="num">' + list.reduce(function(s, d) { return s + d.count; }, 0) + '</div><div class="lbl">🧾 عدد الفواتير</div></div>' +
            '</div>' +
            '<h3 style="color:#C9A94E;font-size:14px;margin:14px 0 8px;">📋 ترتيب البائعين</h3>' +
            '<div class="report-table-header" style="grid-template-columns: 0.4fr 1.5fr 0.7fr 1fr 0.7fr 1fr;">' +
                '<span>#</span><span>البائع</span><span>الفواتير</span><span>المبيعات</span><span>الكمية</span><span>الربح</span>' +
            '</div>' +
            tableHtml;
    }

    if (type === 'products') {
        const productData = {};
        sales.forEach(function(s) {
            (s.items || []).forEach(function(it) {
                const key = it.productId || it.name;
                if (!productData[key]) productData[key] = { name: it.name, qty: 0, total: 0, profit: 0, count: 0 };
                productData[key].qty += it.qty;
                productData[key].total += it.total;
                const p = products.find(function(pr) { return pr.id == it.productId; });
                productData[key].profit += (it.price - (it.costPrice || (p ? p.buy : 0))) * it.qty;
                productData[key].count++;
            });
        });
        const list = Object.values(productData).sort(function(a, b) { return b.total - a.total; });
        window.currentReportData = { type: type, list: list };

        if (list.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-box"></i><span>لا توجد مبيعات</span></div>';
            return;
        }

        let tableHtml = '';
        list.forEach(function(d, i) {
            const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            tableHtml += '<div class="report-table-row" style="grid-template-columns: 0.4fr 1.5fr 0.7fr 1fr 1fr;">' +
                '<span><span class="rank-badge ' + rankClass + '">' + (i + 1) + '</span></span>' +
                '<span><strong>' + d.name + '</strong></span>' +
                '<span class="blue">' + d.qty + '</span>' +
                '<span class="gold">' + formatMoney(d.total) + '</span>' +
                '<span class="green">' + formatMoney(d.profit) + '</span>' +
            '</div>';
        });

        container.innerHTML =
            '<div class="report-summary">' +
                '<div class="report-stat green"><div class="num">' + list.length + '</div><div class="lbl">📦 عدد المنتجات</div></div>' +
                '<div class="report-stat gold"><div class="num">' + formatMoney(list.reduce(function(s, d) { return s + d.total; }, 0)) + '</div><div class="lbl">💰 إجمالي المبيعات</div></div>' +
                '<div class="report-stat blue"><div class="num">' + list.reduce(function(s, d) { return s + d.qty; }, 0) + '</div><div class="lbl">📊 إجمالي الكمية</div></div>' +
            '</div>' +
            '<h3 style="color:#C9A94E;font-size:14px;margin:14px 0 8px;">📋 ترتيب المنتجات</h3>' +
            '<div class="report-table-header" style="grid-template-columns: 0.4fr 1.5fr 0.7fr 1fr 1fr;">' +
                '<span>#</span><span>المنتج</span><span>الكمية</span><span>المبيعات</span><span>الربح</span>' +
            '</div>' +
            tableHtml;
    }

    if (type === 'customers') {
        const customerData = {};
        sales.forEach(function(s) {
            if (!s.customer || s.customer === 'عميل نقدي') return;
            if (!customerData[s.customer]) customerData[s.customer] = { name: s.customer, count: 0, total: 0, debt: 0, lastDate: '' };
            customerData[s.customer].count++;
            customerData[s.customer].total += s.total || 0;
            customerData[s.customer].debt += s.remainingAmount || 0;
            if (!customerData[s.customer].lastDate || s.date > customerData[s.customer].lastDate) {
                customerData[s.customer].lastDate = s.date;
            }
        });
        const list = Object.values(customerData).sort(function(a, b) { return b.total - a.total; });
        window.currentReportData = { type: type, list: list };

        if (list.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><span>لا يوجد عملاء مسجلون بمبيعات</span></div>';
            return;
        }

        let tableHtml = '';
        list.forEach(function(d, i) {
            const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            tableHtml += '<div class="report-table-row" style="grid-template-columns: 0.4fr 1.3fr 0.7fr 1fr 1fr 0.9fr;">' +
                '<span><span class="rank-badge ' + rankClass + '">' + (i + 1) + '</span></span>' +
                '<span><strong>' + d.name + '</strong></span>' +
                '<span class="blue">' + d.count + '</span>' +
                '<span class="gold">' + formatMoney(d.total) + '</span>' +
                '<span class="' + (d.debt > 0 ? 'red' : 'green') + '">' + formatMoney(d.debt) + '</span>' +
                '<span style="font-size:9px;color:#A89070;">' + d.lastDate + '</span>' +
            '</div>';
        });

        container.innerHTML =
            '<div class="report-summary">' +
                '<div class="report-stat green"><div class="num">' + list.length + '</div><div class="lbl">👥 عدد العملاء</div></div>' +
                '<div class="report-stat gold"><div class="num">' + formatMoney(list.reduce(function(s, d) { return s + d.total; }, 0)) + '</div><div class="lbl">💰 إجمالي المبيعات</div></div>' +
                '<div class="report-stat blue"><div class="num">' + list.reduce(function(s, d) { return s + d.count; }, 0) + '</div><div class="lbl">🧾 عدد الفواتير</div></div>' +
                '<div class="report-stat red"><div class="num">' + formatMoney(list.reduce(function(s, d) { return s + d.debt; }, 0)) + '</div><div class="lbl">💳 إجمالي المديونيات</div></div>' +
            '</div>' +
            '<h3 style="color:#C9A94E;font-size:14px;margin:14px 0 8px;">📋 ترتيب العملاء</h3>' +
            '<div class="report-table-header" style="grid-template-columns: 0.4fr 1.3fr 0.7fr 1fr 1fr 0.9fr;">' +
                '<span>#</span><span>العميل</span><span>الفواتير</span><span>المبيعات</span><span>المديونية</span><span>آخر شراء</span>' +
            '</div>' +
            tableHtml;
    }
};

window.printCurrentReport = function() {
    if (!window.currentReportData) {
        showToast('⚠️ اختر تقرير أولاً', 'warning');
        return;
    }
    const type = window.currentReportData.type;
    const c = companyData;
    const typeNames = { daily: 'تقرير يومي', monthly: 'تقرير شهري', yearly: 'تقرير سنوي', sellers: 'تقرير البائعين', products: 'تقرير المنتجات', customers: 'تقرير العملاء' };
    const title = typeNames[type] || 'تقرير';

    let tableHtml = '';
    if (type === 'daily' || type === 'monthly' || type === 'yearly') {
        tableHtml = '<table><thead><tr><th>الفترة</th><th>مبيعات</th><th>مشتريات</th><th>مصروفات</th><th>إجمالي ربح</th><th>صافي ربح</th></tr></thead><tbody>';
        window.currentReportData.dataList.forEach(function(d) {
            tableHtml += '<tr><td>' + d.label + '</td>' +
                '<td style="color:#2D8F5E;">' + formatMoney(d.salesAmount) + '</td>' +
                '<td style="color:#E06060;">' + formatMoney(d.purchasesAmount) + '</td>' +
                '<td style="color:#E6A830;">' + formatMoney(d.expensesAmount) + '</td>' +
                '<td style="color:#C9A94E;">' + formatMoney(d.grossProfit) + '</td>' +
                '<td style="color:' + (d.netProfit >= 0 ? '#2D8F5E' : '#E06060') + ';">' + formatMoney(d.netProfit) + '</td></tr>';
        });
        tableHtml += '</tbody></table>';
    }
    if (type === 'sellers' || type === 'products' || type === 'customers') {
        const header = type === 'sellers' ? ['#', 'البائع', 'الفواتير', 'المبيعات', 'الكمية', 'الربح'] :
                      type === 'products' ? ['#', 'المنتج', 'الكمية', 'المبيعات', 'الربح'] :
                      ['#', 'العميل', 'الفواتير', 'المبيعات', 'المديونية', 'آخر شراء'];
        tableHtml = '<table><thead><tr>' + header.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>';
        window.currentReportData.list.forEach(function(d, i) {
            if (type === 'sellers') tableHtml += '<tr><td>' + (i + 1) + '</td><td>' + d.name + '</td><td>' + d.count + '</td><td>' + formatMoney(d.total) + '</td><td>' + d.items + '</td><td>' + formatMoney(d.profit) + '</td></tr>';
            else if (type === 'products') tableHtml += '<tr><td>' + (i + 1) + '</td><td>' + d.name + '</td><td>' + d.qty + '</td><td>' + formatMoney(d.total) + '</td><td>' + formatMoney(d.profit) + '</td></tr>';
            else if (type === 'customers') tableHtml += '<tr><td>' + (i + 1) + '</td><td>' + d.name + '</td><td>' + d.count + '</td><td>' + formatMoney(d.total) + '</td><td>' + formatMoney(d.debt) + '</td><td>' + d.lastDate + '</td></tr>';
        });
        tableHtml += '</tbody></table>';
    }

    const html = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>' + title + '</title>' +
        '<style>*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif}body{padding:20px}' +
        '.header{text-align:center;padding-bottom:15px;border-bottom:2px dashed #333;margin-bottom:15px}' +
        '.header h1{font-size:24px;margin-bottom:5px}' +
        'table{width:100%;border-collapse:collapse;margin-bottom:15px;font-size:12px}' +
        'table th{background:#000;color:#fff;padding:10px 8px;text-align:center}' +
        'table td{padding:8px;border:1px solid #ddd;text-align:center}' +
        '.footer{text-align:center;margin-top:20px;padding-top:15px;border-top:2px dashed #333;font-size:11px;color:#666}' +
        '@media print{@page{size:A4 landscape;margin:10mm}body{padding:0}}</style></head><body>' +
        '<div class="header"><h1>' + (c.name || 'الميزان') + '</h1>' +
            '<p style="font-size:16px;font-weight:900;margin-top:8px;">' + title + '</p>' +
            '<p style="font-size:11px;">' + new Date().toLocaleString('ar-EG') + '</p></div>' +
        tableHtml +
        '<div class="footer">' + (c.footer || 'شكراً لتعاملكم معنا 🌟') + '</div>' +
        '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print();setTimeout(function(){window.close();},1000);},300);};</scr' + 'ipt>' +
        '</body></html>';

    const w = window.open('', '_blank', 'width=1000,height=700');
    if (!w) { showToast('⚠️ الرجاء السماح بالنوافذ', 'warning'); return; }
    w.document.write(html);
    w.document.close();
};

window.exportReportCSV = function() {
    if (!window.currentReportData) {
        showToast('⚠️ اختر تقرير أولاً', 'warning');
        return;
    }
    const type = window.currentReportData.type;
    let csv = '\uFEFF';
    const filename = 'report_' + type + '_' + new Date().toISOString().split('T')[0] + '.csv';

    if (type === 'daily' || type === 'monthly' || type === 'yearly') {
        csv += 'الفترة,المبيعات,المشتريات,المصروفات,إجمالي الربح,صافي الربح\n';
        window.currentReportData.dataList.forEach(function(d) {
            csv += '"' + d.label + '","' + formatMoney(d.salesAmount) + '","' + formatMoney(d.purchasesAmount) + '","' + formatMoney(d.expensesAmount) + '","' + formatMoney(d.grossProfit) + '","' + formatMoney(d.netProfit) + '"\n';
        });
    } else if (type === 'sellers') {
        csv += '#,البائع,الفواتير,المبيعات,الكمية,الربح\n';
        window.currentReportData.list.forEach(function(d, i) {
            csv += (i + 1) + ',"' + d.name + '",' + d.count + ',"' + formatMoney(d.total) + '",' + d.items + ',"' + formatMoney(d.profit) + '"\n';
        });
    } else if (type === 'products') {
        csv += '#,المنتج,الكمية,المبيعات,الربح\n';
        window.currentReportData.list.forEach(function(d, i) {
            csv += (i + 1) + ',"' + d.name + '",' + d.qty + ',"' + formatMoney(d.total) + '","' + formatMoney(d.profit) + '"\n';
        });
    } else if (type === 'customers') {
        csv += '#,العميل,الفواتير,المبيعات,المديونية,آخر شراء\n';
        window.currentReportData.list.forEach(function(d, i) {
            csv += (i + 1) + ',"' + d.name + '",' + d.count + ',"' + formatMoney(d.total) + '","' + formatMoney(d.debt) + '","' + d.lastDate + '"\n';
        });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    showToast('✅ تم تصدير CSV', 'success');
};

// ═══════════════════════════════════════════════════════════
// 👤 المستخدمين
// ═══════════════════════════════════════════════════════════
window.renderUsers = function() {
    const c = $('userList');
    if (!c) return;
    if (users.length === 0) {
        c.innerHTML = '<div class="empty-state"><i class="fas fa-user-cog"></i><span>لا يوجد مستخدمين</span></div>';
        return;
    }
    let html = '<div class="table-header" style="grid-template-columns: 1.5fr 1fr 0.8fr 1.2fr;"><span>الاسم</span><span>الدور</span><span>الحالة</span><span></span></div>';
    users.forEach(function(u) {
        const roleInfo = ROLES[u.role] || { name: u.role, icon: '❓' };
        html += '<div class="table-row" style="grid-template-columns: 1.5fr 1fr 0.8fr 1.2fr;">' +
            '<span><strong>' + u.name + '</strong></span>' +
            '<span>' + roleInfo.icon + ' ' + roleInfo.name + '</span>' +
            '<span style="color:' + (u.active !== false ? '#2D8F5E' : '#E06060') + ';">' + (u.active !== false ? '✅' : '⏸️') + '</span>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;">' +
                '<button class="btn btn-warning btn-sm" onclick="editUser(' + u.id + ')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteUser(' + u.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    });
    c.innerHTML = html;
};

window.saveUser = function() {
    const id = $('userId') ? $('userId').value : '';
    const name = $('userName') ? $('userName').value.trim() : '';
    const password = $('userPassword') ? $('userPassword').value.trim() : '';
    const role = $('userRole') ? $('userRole').value : 'cashier';
    if (!name || !password) { showToast('⚠️ أدخل البيانات', 'error'); return; }
    if (id) {
        const idx = users.findIndex(function(u) { return u.id == id; });
        if (idx > -1) { users[idx] = Object.assign({}, users[idx], { name: name, password: password, role: role }); showToast('✅ تم التعديل', 'success'); }
    } else {
        if (users.find(function(u) { return u.name === name; })) { showToast('⚠️ الاسم موجود', 'warning'); return; }
        users.push({ id: Date.now(), name: name, password: password, role: role, active: true });
        showToast('✅ تم الإضافة', 'success');
    }
    setData('users', users);
    resetUserForm();
    renderUsers();
    populateLoginUsers();
};

window.resetUserForm = function() {
    ['userId','userName','userPassword'].forEach(function(id) { if ($(id)) $(id).value = ''; });
    if ($('userRole')) $('userRole').value = 'cashier';
    if ($('userFormTitle')) $('userFormTitle').textContent = '➕ إضافة مستخدم';
    if ($('userSaveBtnText')) $('userSaveBtnText').textContent = 'إضافة';
};

window.editUser = function(id) {
    const u = users.find(function(us) { return us.id == id; });
    if (!u) return;
    if ($('userId')) $('userId').value = u.id;
    if ($('userName')) $('userName').value = u.name;
    if ($('userPassword')) $('userPassword').value = u.password;
    if ($('userRole')) $('userRole').value = u.role;
    if ($('userFormTitle')) $('userFormTitle').textContent = '✏️ تعديل';
    if ($('userSaveBtnText')) $('userSaveBtnText').textContent = 'حفظ';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteUser = function(id) {
    const u = users.find(function(us) { return us.id == id; });
    if (!u) return;
    if (!confirm('⚠️ حذف "' + u.name + '"؟')) return;
    window.users = users.filter(function(us) { return us.id !== id; });
    setData('users', users);
    renderUsers();
    populateLoginUsers();
    showToast('🗑️ تم الحذف', 'info');
};

// ═══════════════════════════════════════════════════════════
// 📊 لوحة التحكم
// ═══════════════════════════════════════════════════════════
window.updateDashboard = function() {
    const totalProducts = products.length;
    const totalQty = products.reduce(function(s, p) { return s + (p.qty || 0); }, 0);
    const totalValue = products.reduce(function(s, p) { return s + ((p.qty || 0) * (p.buy || 0)); }, 0);
    const lowStock = products.filter(function(p) { return p.qty <= (p.min || 5); }).length;
    const totalSalesCount = sales.length;
    const totalSalesAmount = sales.reduce(function(s, sale) { return s + (sale.total || 0); }, 0);
    const totalPurchasesAmount = purchases.reduce(function(s, pur) { return s + (pur.total || 0); }, 0);
    const totalExpensesAmount = expenses.reduce(function(s, exp) { return s + (exp.amount || 0); }, 0);
    const totalProfit = sales.reduce(function(s, sale) { return s + (sale.profit || 0); }, 0) - totalExpensesAmount;
    const totalTreasury = getTotalCashBalance();
    let custDebt = 0; customers.forEach(function(c) { custDebt += getCustomerBalance(c.name); });
    let supDebt = 0; suppliers.forEach(function(s) { supDebt += getSupplierBalance(s.name); });

    if ($('dashProducts')) $('dashProducts').textContent = totalProducts;
    if ($('dashInventory')) $('dashInventory').textContent = totalQty;
    if ($('dashInventoryValue')) $('dashInventoryValue').textContent = formatMoney(totalValue);
    if ($('dashLowStock')) $('dashLowStock').textContent = lowStock;
    if ($('dashSalesCount')) $('dashSalesCount').textContent = totalSalesCount;
    if ($('dashSalesTotal')) $('dashSalesTotal').textContent = formatMoney(totalSalesAmount);
    if ($('dashPurchasesTotal')) $('dashPurchasesTotal').textContent = formatMoney(totalPurchasesAmount);
    if ($('dashExpensesTotal')) $('dashExpensesTotal').textContent = formatMoney(totalExpensesAmount);
    if ($('dashTreasury')) $('dashTreasury').textContent = formatMoney(totalTreasury);
    if ($('dashProfit')) $('dashProfit').textContent = formatMoney(totalProfit);
    if ($('dashCustomerDebt')) $('dashCustomerDebt').textContent = formatMoney(custDebt);
    if ($('dashSupplierDebt')) $('dashSupplierDebt').textContent = formatMoney(supDebt);

    const container = $('dashLastSales');
    if (!container) return;
    if (sales.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><span>لا توجد مبيعات</span></div>';
        return;
    }
    const last5 = sales.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 5);
    let html = '<div class="table-header" style="grid-template-columns: 0.5fr 1.5fr 1fr 1fr;"><span>#</span><span>العميل</span><span>المبلغ</span><span>الربح</span></div>';
    last5.forEach(function(inv) {
        html += '<div class="table-row" style="grid-template-columns: 0.5fr 1.5fr 1fr 1fr;">' +
            '<span>#' + inv.number + '</span>' +
            '<span style="font-size:11px;">' + (inv.customer || 'عميل نقدي') + '</span>' +
            '<span style="color:#2D8F5E;font-weight:700;">' + formatMoney(inv.total) + '</span>' +
            '<span style="color:#C9A94E;font-weight:700;">' + formatMoney(inv.profit || 0) + '</span>' +
        '</div>';
    });
    container.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════
// ⚙️ الإعدادات + Firebase UI
// ═══════════════════════════════════════════════════════════
window.renderSettings = function() {
    const c = companyData;
    if ($('setCompanyName')) $('setCompanyName').value = c.name || '';
    if ($('setCompanyPhone')) $('setCompanyPhone').value = c.phone || '';
    if ($('setCompanyAddress')) $('setCompanyAddress').value = c.address || '';
    if ($('setCompanyTax')) $('setCompanyTax').value = c.tax || '';
    if ($('setCompanyFooter')) $('setCompanyFooter').value = c.footer || '';
    if ($('setProductsCount')) $('setProductsCount').textContent = products.length;
    if ($('setSalesCount')) $('setSalesCount').textContent = sales.length;
    if ($('setCustomersCount')) $('setCustomersCount').textContent = customers.length;
    if ($('setSuppliersCount')) $('setSuppliersCount').textContent = suppliers.length;
};

window.renderFirebaseSettingsSection = function() {
    const settingsPage = $('page-settings');
    if (!settingsPage) return;
    if ($('firebaseSettingsSection')) {
        const statusText = $('fbStatusText');
        if (statusText) {
            statusText.textContent = firebaseReady ? '🟢 متصل' : '⚪ غير مُعد';
            statusText.style.color = firebaseReady ? '#2D8F5E' : '#E6A830';
        }
        const autoSyncText = $('fbAutoSyncText');
        if (autoSyncText) {
            autoSyncText.textContent = autoSyncInterval ? '🟢 مفعلة' : '🔴 معطلة';
            autoSyncText.style.color = autoSyncInterval ? '#2D8F5E' : '#5D5D5D';
        }
        return;
    }

    const section = document.createElement('div');
    section.id = 'firebaseSettingsSection';
    section.className = 'settings-section';
    section.innerHTML = '<h3><i class="fas fa-cloud"></i> Firebase (المزامنة السحابية)</h3>' +
        '<p style="font-size:11px;color:#A89070;margin-bottom:12px;">اربط بياناتك بالسحابة للعمل من أي جهاز</p>' +
        '<div style="background:#0D0D0D;border-radius:8px;padding:10px;margin-bottom:10px;border-right:4px solid #C9A94E;font-size:12px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="color:#A89070;">الحالة:</span>' +
                '<strong id="fbStatusText" style="color:' + (firebaseReady ? '#2D8F5E' : '#E6A830') + ';">' + (firebaseReady ? '🟢 متصل' : '⚪ غير مُعد') + '</strong>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">' +
                '<span style="color:#A89070;">المزامنة التلقائية:</span>' +
                '<strong id="fbAutoSyncText" style="color:' + (autoSyncInterval ? '#2D8F5E' : '#5D5D5D') + ';">' + (autoSyncInterval ? '🟢 مفعلة' : '🔴 معطلة') + '</strong>' +
            '</div>' +
        '</div>' +
        '<button class="btn btn-primary btn-block" onclick="syncToCloud()"><i class="fas fa-cloud-upload-alt"></i> رفع البيانات للسحابة</button>' +
        '<button class="btn btn-info btn-block" onclick="syncFromCloud()" style="margin-top:6px;"><i class="fas fa-cloud-download-alt"></i> تحميل البيانات من السحابة</button>' +
        '<button class="btn btn-warning btn-block" onclick="toggleAutoSync()" style="margin-top:6px;"><i class="fas fa-sync"></i> <span id="autoSyncToggleText">' + (autoSyncInterval ? 'إيقاف' : 'تفعيل') + ' المزامنة التلقائية</span></button>';

    const backupSection = settingsPage.querySelector('.settings-section');
    if (backupSection) {
        backupSection.parentNode.insertBefore(section, backupSection);
    } else {
        const content = settingsPage.querySelector('.page-content');
        if (content) content.appendChild(section);
    }
};

window.toggleAutoSync = function() {
    if (autoSyncInterval) {
        stopAutoSync();
        showToast('⏸️ تم إيقاف المزامنة التلقائية', 'info');
    } else {
        if (!firebaseReady) {
            showToast('⚠️ Firebase غير متصل', 'error');
            return;
        }
        startAutoSync();
        showToast('✅ تم تفعيل المزامنة التلقائية', 'success');
    }
    const text = $('autoSyncToggleText');
    if (text) text.textContent = autoSyncInterval ? 'إيقاف' : 'تفعيل';
    const status = $('fbAutoSyncText');
    if (status) {
        status.textContent = autoSyncInterval ? '🟢 مفعلة' : '🔴 معطلة';
        status.style.color = autoSyncInterval ? '#2D8F5E' : '#5D5D5D';
    }
};

window.saveCompanySettings = function() {
    companyData.name = $('setCompanyName') ? $('setCompanyName').value.trim() : 'الميزان';
    companyData.phone = $('setCompanyPhone') ? $('setCompanyPhone').value.trim() : '';
    companyData.address = $('setCompanyAddress') ? $('setCompanyAddress').value.trim() : '';
    companyData.tax = $('setCompanyTax') ? $('setCompanyTax').value.trim() : '';
    companyData.footer = $('setCompanyFooter') ? $('setCompanyFooter').value.trim() : 'شكراً لتعاملكم معنا 🌟';
    setData('companyData', companyData);
    if ($('headerCompanyName')) $('headerCompanyName').textContent = companyData.name;
    showToast('✅ تم الحفظ', 'success');
};

window.exportData = function() {
    const data = {
        version: '14.0.0', exportDate: new Date().toISOString(),
        products: products, sales: sales, purchases: purchases,
        customers: customers, suppliers: suppliers, cashBoxes: cashBoxes,
        expenses: expenses, treasury: treasury, payments: payments,
        returns: returns, users: users, companyData: companyData
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mizan_backup_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    showToast('✅ تم التصدير', 'success');
};

window.importData = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!confirm('⚠️ سيتم استبدال البيانات. متابعة؟')) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            ['products','sales','purchases','customers','suppliers','cashBoxes','expenses','treasury','payments','returns','users','companyData'].forEach(function(k) {
                if (data[k]) window[k] = data[k];
            });
            saveAll();
            init();
            showToast('✅ تم الاستيراد', 'success');
        } catch (err) { showToast('❌ ملف غير صالح', 'error'); }
    };
    reader.readAsText(file);
    event.target.value = '';
};

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
    setData('companyData', companyData);
};

window.clearAllData = function() {
    if (!confirm('⚠️ مسح جميع البيانات؟')) return;
    if (!confirm('⚠️ تأكيد نهائي؟')) return;
    ['products','sales','purchases','customers','suppliers','cashBoxes','expenses','treasury','payments','returns','users','companyData'].forEach(function(k) {
        localStorage.removeItem(STORAGE_KEY + k);
    });
    localStorage.removeItem('mizan_seeded_v2');
    location.reload();
};

// ═══════════════════════════════════════════════════════════
// 🔐 تسجيل الدخول
// ═══════════════════════════════════════════════════════════
window.populateLoginUsers = function() {
    const sel = $('loginUsername');
    if (!sel) return;
    sel.innerHTML = '<option value="">اختر المستخدم...</option>';
    users.forEach(function(u) {
        if (u.active !== false) {
            const roleInfo = ROLES[u.role] || { icon: '❓', name: u.role };
            sel.innerHTML += '<option value="' + u.id + '">' + roleInfo.icon + ' ' + u.name + ' (' + roleInfo.name + ')</option>';
        }
    });
};

window.checkLogin = function() {
    const userId = $('loginUsername') ? $('loginUsername').value : '';
    const password = $('loginPassword') ? $('loginPassword').value : '';
    const error = $('loginError');

    if (!userId) {
        if (error) { error.textContent = '⚠️ اختر المستخدم'; error.classList.add('show'); }
        return;
    }

    const user = users.find(function(u) { return u.id == userId; });
    if (!user) {
        if (error) { error.textContent = '⚠️ المستخدم غير موجود'; error.classList.add('show'); }
        return;
    }

    if (user.password !== password) {
        if (error) { error.textContent = '⚠️ كلمة المرور خاطئة'; error.classList.add('show'); }
        $('loginPassword').value = '';
        setTimeout(function() { if (error) error.classList.remove('show'); }, 3000);
        return;
    }

    window.currentUser = user;
    localStorage.setItem('mizan_current_user', JSON.stringify({ id: user.id, name: user.name, role: user.role }));

    if (error) error.classList.remove('show');
    $('loginPassword').value = '';

    const loginCont = $('loginContainer');
    const appCont = $('appContent');
    if (loginCont) loginCont.classList.add('hidden');
    if (appCont) appCont.style.display = 'block';

    updateUserUI();
    applyPermissions();
    showToast('🔓 مرحباً ' + user.name + '!', 'success');
    navigateTo('dashboard');

    setTimeout(function() {
        if (firebaseReady) {
            startAutoSync();
            updateConnectionStatus();
            syncFromCloud(true);
        }
    }, 1000);
};

window.lockApp = function() {
    if (!confirm('⚠️ هل تريد تسجيل الخروج؟')) return;
    window.currentUser = null;
    localStorage.removeItem('mizan_current_user');
    const loginCont = $('loginContainer');
    const appCont = $('appContent');
    if (loginCont) loginCont.classList.remove('hidden');
    if (appCont) appCont.style.display = 'none';
    if ($('loginPassword')) $('loginPassword').value = '';
    if ($('loginUsername')) $('loginUsername').value = '';
    populateLoginUsers();
    stopAutoSync();
    showToast('🔒 تم تسجيل الخروج', 'info');
};

window.updateUserUI = function() {
    if (!currentUser) return;
    const el = $('currentUserName');
    if (el) {
        const roleInfo = ROLES[currentUser.role] || { icon: '❓' };
        el.textContent = roleInfo.icon + ' ' + currentUser.name;
    }
};

window.applyPermissions = function() {
    if (!currentUser) return;
    const role = currentUser.role;
    document.querySelectorAll('[data-permission]').forEach(function(el) {
        const perm = el.dataset.permission;
        el.style.display = hasPermission(perm) ? '' : 'none';
    });
    const userMenuItem = document.querySelector('[onclick*="users"]');
    if (userMenuItem) userMenuItem.style.display = (role === 'admin' || role === 'manager') ? '' : 'none';
    const settingsMenuItem = document.querySelector('[onclick*="settings"]');
    if (settingsMenuItem) settingsMenuItem.style.display = (role === 'admin') ? '' : 'none';
};

// ═══════════════════════════════════════════════════════════
// 🚀 التهيئة
// ═══════════════════════════════════════════════════════════
window.init = function() {
    console.log('🚀 بدء التهيئة...');

    window.products = getData('products', []);
    window.sales = getData('sales', []);
    window.purchases = getData('purchases', []);
    window.customers = getData('customers', []);
    window.suppliers = getData('suppliers', []);
    window.cashBoxes = getData('cashBoxes', []);
    window.expenses = getData('expenses', []);
    window.treasury = getData('treasury', []);
    window.payments = getData('payments', []);
    window.returns = getData('returns', []);
    window.users = getData('users', []);
    window.companyData = getData('companyData', { name: 'الميزان', phone: '', address: '', tax: '', footer: 'شكراً لتعاملكم معنا 🌟' });
    window.vatSettings = getData('vatSettings', { defaultVAT: 14 });

    if (products.length === 0 && !localStorage.getItem('mizan_seeded_v2')) {
        window.products = [
            { id: 1, name: 'قلم جاف', barcode: '1001', buy: 2, sell: 5, qty: 50, min: 10 },
            { id: 2, name: 'كشكول 60 ورقة', barcode: '1002', buy: 8, sell: 15, qty: 30, min: 5 },
            { id: 3, name: 'مسطرة 30 سم', barcode: '1003', buy: 3, sell: 7, qty: 40, min: 10 }
        ];
        setData('products', products);
        localStorage.setItem('mizan_seeded_v2', 'true');
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

    populateLoginUsers();
    const loginCont = $('loginContainer');
    const appCont = $('appContent');
    if (loginCont) loginCont.classList.remove('hidden');
    if (appCont) appCont.style.display = 'none';

    updateClock();
    renderProducts();
    updateDashboard();
    populateSaleProducts();
    populateSaleCustomers();
    populatePurProducts();
    populatePurSuppliers();
    populateCashBoxDropdowns();
    populateCollectCustomers();
    populatePaySuppliers();
    populateRetProducts();
    updateInvoiceHeader();
    updatePurStats();
    renderCustomers();
    renderSuppliers();
    renderCashBoxes();
    renderExpenses();
    updateExpensesStats();
    renderTreasury();
    updateInvoiceStats();
    renderInvoices();
    updatePaymentsStats();
    renderPayments();
    updateReturnsStats();
    renderReturns();
    renderUsers();
    renderSettings();

    console.log('✅ التطبيق جاهز!');
    console.log('👥 المستخدمون:', users.length);
    console.log('🔐 المستخدم الافتراضي: المدير / 123456');
    console.log('☁️ Firebase:', firebaseReady ? 'متصل - ' + firebaseConfig.projectId : 'غير مُعد');
};

document.addEventListener('DOMContentLoaded', function() {
    init();
    setInterval(updateClock, 1000);
    console.log('✅ تم تحميل app.js كاملاً - v15 مع Firebase + WhatsApp + التقارير');
});
