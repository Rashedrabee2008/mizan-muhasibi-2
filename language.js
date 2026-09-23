// ============================================================
// language.js - نظام الترجمة العربية/الإنجليزية
// ============================================================

(function() {
    'use strict';

    console.log('🌍 تحميل language.js');

    // ═══════════════════════════════════════════════════════════
    // 📚 قاموس الترجمة
    // ═══════════════════════════════════════════════════════════
    const TRANSLATIONS = {
        ar: {
            // الهيدر
            'app_name': 'الميزان',
            'app_subtitle': 'نظام محاسبة',
            'user_badge': 'المستخدم',
            'lock': 'قفل',
            'theme': 'الوضع',
            'language': 'اللغة',
            
            // التنقل السفلي
            'nav_home': 'الرئيسية',
            'nav_inventory': 'المخزون',
            'nav_cashier': 'الكاشير',
            'nav_reports': 'التقارير',
            'nav_more': 'المزيد',
            
            // قائمة المزيد
            'more_purchases': 'المشتريات',
            'more_customers': 'العملاء',
            'more_suppliers': 'الموردين',
            'more_expenses': 'المصروفات',
            'more_invoices': 'الفواتير',
            'more_payments': 'التحصيل/السداد',
            'more_returns': 'المرتجعات',
            'more_treasury': 'حركات الخزنة',
            'more_accounts': 'الحسابات',
            'more_cash_boxes': 'الخزائن',
            'more_users': 'المستخدمين',
            'more_settings': 'الإعدادات',
            
            // لوحة التحكم
            'dashboard': 'لوحة التحكم',
            'dash_products': '📦 المنتجات',
            'dash_inventory': '📊 الكميات',
            'dash_inventory_value': '💰 قيمة المخزون',
            'dash_low_stock': '⚠️ قاربت على النفاذ',
            'dash_sales_count': '🧾 عدد الفواتير',
            'dash_sales_total': '💰 إجمالي المبيعات',
            'dash_purchases_total': '🛒 إجمالي المشتريات',
            'dash_expenses_total': '💸 إجمالي المصروفات',
            'dash_treasury': '💰 إجمالي الخزائن',
            'dash_profit': '📈 صافي الربح',
            'dash_customer_debt': '💳 مديونيات العملاء',
            'dash_supplier_debt': '📋 التزامات الموردين',
            'last_sales': 'آخر المبيعات',
            'no_sales': 'لا توجد مبيعات',
            'sales_chart': 'المبيعات - آخر 7 أيام',
            
            // تسجيل الدخول
            'login_title': 'الميزان',
            'login_subtitle': 'نظام محاسبة ونقاط بيع',
            'login_username': '👤 اسم المستخدم',
            'login_password': '🔑 كلمة المرور',
            'login_select_user': 'اختر المستخدم...',
            'login_password_placeholder': 'أدخل كلمة المرور...',
            'login_button': 'دخول',
            'login_error': '⚠️ بيانات الدخول غير صحيحة',
            'login_hint': '💡 المستخدمون الافتراضيون: المدير / كلمة المرور: 123456',
            
            // الحسابات
            'accounts': 'الحسابات',
            'accounts_assets': '💎 الأصول',
            'accounts_liabilities': '📋 الالتزامات',
            'accounts_equity': '👑 حقوق الملكية',
            'accounts_revenue': '💰 الإيرادات',
            'accounts_expenses': '💸 المصروفات',
            'trial_balance': 'ميزان المراجعة',
            'income_statement': 'قائمة الدخل',
            'balance_sheet': 'الميزانية',
            'account_code': '📌 الكود',
            'account_name': '📝 الاسم',
            'account_type': '🏷️ النوع',
            'account_parent': '🔗 الحساب الأب',
            'account_notes': '📄 ملاحظات',
            'add_account': 'إضافة حساب',
            'save': 'حفظ',
            'cancel': 'إلغاء',
            
            // التقارير
            'reports': 'التقارير',
            'report_daily': 'يومي',
            'report_monthly': 'شهري',
            'report_yearly': 'سنوي',
            'report_sellers': 'البائعين',
            'report_products': 'المنتجات',
            'report_customers': 'العملاء',
            'print': 'طباعة',
            'export_csv': 'CSV',
            
            // عام
            'save': 'حفظ',
            'cancel': 'إلغاء',
            'delete': 'حذف',
            'edit': 'تعديل',
            'search': '🔍 بحث...',
            'add': 'إضافة',
            'confirm': 'تأكيد',
            'yes': 'نعم',
            'no': 'لا',
            
            // الرسائل
            'msg_saved': '✅ تم الحفظ',
            'msg_deleted': '🗑️ تم الحذف',
            'msg_error': '❌ خطأ',
            'msg_no_permission': '⚠️ لا تملك صلاحية'
        },
        
        en: {
            // Header
            'app_name': 'Mizan',
            'app_subtitle': 'Accounting System',
            'user_badge': 'User',
            'lock': 'Lock',
            'theme': 'Theme',
            'language': 'Language',
            
            // Bottom Nav
            'nav_home': 'Home',
            'nav_inventory': 'Inventory',
            'nav_cashier': 'Cashier',
            'nav_reports': 'Reports',
            'nav_more': 'More',
            
            // More Menu
            'more_purchases': 'Purchases',
            'more_customers': 'Customers',
            'more_suppliers': 'Suppliers',
            'more_expenses': 'Expenses',
            'more_invoices': 'Invoices',
            'more_payments': 'Collection/Payment',
            'more_returns': 'Returns',
            'more_treasury': 'Treasury',
            'more_accounts': 'Accounts',
            'more_cash_boxes': 'Cash Boxes',
            'more_users': 'Users',
            'more_settings': 'Settings',
            
            // Dashboard
            'dashboard': 'Dashboard',
            'dash_products': '📦 Products',
            'dash_inventory': '📊 Quantity',
            'dash_inventory_value': '💰 Inventory Value',
            'dash_low_stock': '⚠️ Low Stock',
            'dash_sales_count': '🧾 Invoices Count',
            'dash_sales_total': '💰 Total Sales',
            'dash_purchases_total': '🛒 Total Purchases',
            'dash_expenses_total': '💸 Total Expenses',
            'dash_treasury': '💰 Total Treasury',
            'dash_profit': '📈 Net Profit',
            'dash_customer_debt': '💳 Customer Debts',
            'dash_supplier_debt': '📋 Supplier Debts',
            'last_sales': 'Latest Sales',
            'no_sales': 'No sales',
            'sales_chart': 'Sales - Last 7 Days',
            
            // Login
            'login_title': 'Mizan',
            'login_subtitle': 'Accounting & POS System',
            'login_username': '👤 Username',
            'login_password': '🔑 Password',
            'login_select_user': 'Select User...',
            'login_password_placeholder': 'Enter password...',
            'login_button': 'Login',
            'login_error': '⚠️ Invalid credentials',
            'login_hint': '💡 Default users: Admin / Password: 123456',
            
            // Accounts
            'accounts': 'Accounts',
            'accounts_assets': '💎 Assets',
            'accounts_liabilities': '📋 Liabilities',
            'accounts_equity': '👑 Equity',
            'accounts_revenue': '💰 Revenue',
            'accounts_expenses': '💸 Expenses',
            'trial_balance': 'Trial Balance',
            'income_statement': 'Income Statement',
            'balance_sheet': 'Balance Sheet',
            'account_code': '📌 Code',
            'account_name': '📝 Name',
            'account_type': '🏷️ Type',
            'account_parent': '🔗 Parent Account',
            'account_notes': '📄 Notes',
            'add_account': 'Add Account',
            'save': 'Save',
            'cancel': 'Cancel',
            
            // Reports
            'reports': 'Reports',
            'report_daily': 'Daily',
            'report_monthly': 'Monthly',
            'report_yearly': 'Yearly',
            'report_sellers': 'Sellers',
            'report_products': 'Products',
            'report_customers': 'Customers',
            'print': 'Print',
            'export_csv': 'CSV',
            
            // General
            'save': 'Save',
            'cancel': 'Cancel',
            'delete': 'Delete',
            'edit': 'Edit',
            'search': '🔍 Search...',
            'add': 'Add',
            'confirm': 'Confirm',
            'yes': 'Yes',
            'no': 'No',
            
            // Messages
            'msg_saved': '✅ Saved',
            'msg_deleted': '🗑️ Deleted',
            'msg_error': '❌ Error',
            'msg_no_permission': '⚠️ No permission'
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 🌍 إدارة اللغة الحالية
    // ═══════════════════════════════════════════════════════════
    window.currentLang = localStorage.getItem('mizan_lang') || 'ar';

    window.t = function(key) {
        return TRANSLATIONS[window.currentLang][key] || TRANSLATIONS.ar[key] || key;
    };

    // ═══════════════════════════════════════════════════════════
    // 🔄 تطبيق اللغة
    // ═══════════════════════════════════════════════════════════
    window.applyLanguage = function(lang) {
        window.currentLang = lang;
        localStorage.setItem('mizan_lang', lang);

        const isRTL = lang === 'ar';
        const html = document.documentElement;

        // تغيير الاتجاه
        html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
        html.setAttribute('lang', lang);
        document.body.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

        // تطبيق ترجمات النصوص
        translatePage();

        // تحديث زر اللغة
        const btn = document.getElementById('langToggleBtn');
        if (btn) {
            btn.innerHTML = isRTL ? 'EN' : 'ع';
            btn.title = isRTL ? 'English' : 'العربية';
        }

        console.log('✅ تم تطبيق اللغة:', lang);
    };

    // ═══════════════════════════════════════════════════════════
    // 🔍 ترجمة الصفحة
    // ═══════════════════════════════════════════════════════════
    window.translatePage = function() {
        // عناصر تحتوي على data-i18n
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            const key = el.getAttribute('data-i18n');
            const translated = t(key);
            if (translated) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translated;
                } else {
                    el.textContent = translated;
                }
            }
        });
    };

    // ═══════════════════════════════════════════════════════════
    // 🎯 تبديل اللغة
    // ═══════════════════════════════════════════════════════════
    window.toggleLanguage = function() {
        const newLang = window.currentLang === 'ar' ? 'en' : 'ar';
        applyLanguage(newLang);

        if (typeof showToast === 'function') {
            showToast(
                newLang === 'ar' ? '🌍 تم التبديل للعربية' : '🌍 Switched to English',
                'info'
            );
        }
    };

    // ═══════════════════════════════════════════════════════════
    // ⏰ الساعة 12 ساعة + التاريخ المنسق
    // ═══════════════════════════════════════════════════════════

    window.updateClock12 = function() {
        const el = document.getElementById('liveDateTime');
        if (!el) return;

        const now = new Date();
        const isRTL = window.currentLang === 'ar';

        // التاريخ
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();

        // الوقت - 12 ساعة
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? (isRTL ? 'م' : 'PM') : (isRTL ? 'ص' : 'AM');
        hours = hours % 12 || 12;
        const hoursStr = String(hours).padStart(2, '0');

        // تنسيق
        let dateStr = `${day}/${month}/${year}`;
        let timeStr = `${hoursStr}:${minutes}:${seconds} ${ampm}`;

        // تحديث
        el.textContent = `${dateStr} - ${timeStr}`;
        el.title = dateStr + ' ' + timeStr;

        // تحديث حقل تاريخ الفاتورة
        const invDateEl = document.getElementById('invDateDisplay');
        const invTimeEl = document.getElementById('invTimeDisplay');
        if (invDateEl) invDateEl.value = dateStr;
        if (invTimeEl) invTimeEl.value = `${hoursStr}:${minutes} ${ampm}`;
    };

    // استبدال دالة تحديث الساعة القديمة
    window.updateClock = window.updateClock12;

    // ═══════════════════════════════════════════════════════════
    // 🎯 زر التبديل
    // ═══════════════════════════════════════════════════════════
    function addLangToggle() {
        const header = document.querySelector('.header-actions');
        if (!header || document.getElementById('langToggleBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'langToggleBtn';
        btn.title = 'تبديل اللغة / Switch Language';
        btn.innerHTML = window.currentLang === 'ar' ? 'EN' : 'ع';
        btn.style.cssText = `
            background: #0D0D0D;
            border: 2px solid #3D3D3D;
            color: #C9A94E;
            font-size: 11px;
            cursor: pointer;
            padding: 4px 6px;
            border-radius: 6px;
            height: 28px;
            min-width: 28px;
            font-weight: 900;
            font-family: inherit;
            transition: all 0.2s;
        `;
        btn.onclick = toggleLanguage;

        // إضافة قبل زر القفل
        const lockBtn = header.querySelector('.lock-btn');
        if (lockBtn) {
            header.insertBefore(btn, lockBtn);
        } else {
            header.appendChild(btn);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 🚀 بدء التشغيل
    // ═══════════════════════════════════════════════════════════

    // تطبيق اللغة المحفوظة
    setTimeout(function() {
        applyLanguage(window.currentLang);
        addLangToggle();
    }, 1000);

    // تحديث الساعة كل ثانية
    setInterval(window.updateClock12, 1000);
    window.updateClock12();

    console.log('✅ language.js جاهز');
})();
