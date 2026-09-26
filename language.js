// ============================================================
// language.js - نظام الترجمة الكامل
// الميزان 15.0.0
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
            'theme_dark': 'الوضع الداكن',
            'theme_light': 'الوضع الفاتح',
            
            // شاشة الدخول
            'login_title': 'الميزان',
            'login_subtitle': 'نظام محاسبة ونقاط بيع',
            'login_username': '👤 اسم المستخدم',
            'login_password': '🔑 كلمة المرور',
            'login_select': 'اختر المستخدم...',
            'login_password_placeholder': 'أدخل كلمة المرور...',
            'login_button': 'دخول',
            'login_error': '⚠️ بيانات الدخول غير صحيحة',
            'login_hint': '💡 المستخدمون الافتراضيون: المدير / كلمة المرور: 123456',
            
            // التنقل السفلي
            'nav_dashboard': 'الرئيسية',
            'nav_inventory': 'المخزون',
            'nav_cashier': 'الكاشير',
            'nav_reports': 'التقارير',
            'nav_more': 'المزيد',
            
            // الأقسام
            'dashboard': 'لوحة التحكم',
            'inventory': 'المخزون',
            'cashier': 'الكاشير',
            'purchases': 'المشتريات',
            'customers': 'العملاء',
            'suppliers': 'الموردين',
            'cash_boxes': 'الخزائن',
            'expenses': 'المصروفات',
            'treasury': 'حركات الخزنة',
            'invoices': 'فواتير البيع',
            'payments': 'التحصيل والسداد',
            'returns': 'المرتجعات',
            'accounts': 'الحسابات',
            'erp': 'إدارة الموارد',
            'reports': 'التقارير',
            'users': 'المستخدمين',
            'settings': 'الإعدادات',
            
            // لوحة التحكم
            'dash_products': '📦 المنتجات',
            'dash_inventory': '📊 الكميات',
            'dash_inventory_value': '💰 قيمة المخزون',
            'dash_low_stock': '⚠️ قاربت على النفاذ',
            'dash_invoices_count': '🧾 عدد الفواتير',
            'dash_sales_total': '💰 إجمالي المبيعات',
            'dash_purchases_total': '🛒 إجمالي المشتريات',
            'dash_expenses_total': '💸 إجمالي المصروفات',
            'dash_treasury': '💰 إجمالي الخزائن',
            'dash_profit': '📈 صافي الربح',
            'dash_customer_debt': '💳 مديونيات العملاء',
            'dash_supplier_debt': '📋 التزامات الموردين',
            
            // ملخص الأداء
            'perf_title': 'ملخص الأداء',
            'perf_best_day': '🏆 أفضل يوم مبيعات',
            'perf_avg_invoice': '📊 متوسط الفاتورة',
            'perf_best_customer': '⭐ أفضل عميل',
            'perf_best_product': '📦 أفضل منتج',
            'perf_this_month': 'هذا الشهر',
            'perf_no_data': 'لا توجد بيانات',
            'perf_no_customer': 'لا يوجد',
            'perf_no_product': 'لا يوجد',
            'perf_egp': 'ج.م',
            'perf_piece': 'قطعة',
            
            // آخر المبيعات
            'last_sales': 'آخر المبيعات',
            'no_sales': 'لا توجد مبيعات',
            'customer': 'العميل',
            'amount': 'المبلغ',
            'profit': 'الربح',
            
            // عام
            'save': 'حفظ',
            'cancel': 'إلغاء',
            'delete': 'حذف',
            'edit': 'تعديل',
            'add': 'إضافة',
            'search': '🔍 بحث...',
            'close': 'إغلاق',
            'confirm': 'تأكيد',
            'yes': 'نعم',
            'no': 'لا',
            'total': 'الإجمالي',
            'subtotal': 'المجموع',
            'quantity': 'الكمية',
            'price': 'السعر',
            'name': 'الاسم',
            'phone': 'الهاتف',
            'address': 'العنوان',
            'date': 'التاريخ',
            'time': 'الوقت',
            'status': 'الحالة',
            'notes': 'ملاحظات',
            'print': 'طباعة',
            'pdf': 'PDF',
            'whatsapp': 'واتساب',
            'qr_code': 'QR Code',
            
            // رسائل
            'msg_saved': '✅ تم الحفظ',
            'msg_deleted': '🗑️ تم الحذف',
            'msg_added': '✅ تم الإضافة',
            'msg_updated': '✅ تم التعديل',
            'msg_error': '❌ خطأ',
            'msg_confirm_delete': '⚠️ هل أنت متأكد؟',
            'msg_no_permission': '⚠️ لا تملك صلاحية',
            'msg_lang_switched': '🌍 تم التحويل للإنجليزية',
            'msg_invoice_saved': '✅ تم حفظ الفاتورة',
            'msg_product_saved': '✅ تم حفظ المنتج',
            'msg_customer_saved': '✅ تم حفظ العميل',
            'msg_supplier_saved': '✅ تم حفظ المورد',
            'msg_expense_saved': '✅ تم حفظ المصروف',
            'msg_purchase_saved': '✅ تم حفظ الشراء',
            
            // الحسابات
            'accounting_balance': 'ميزان المراجعة',
            'income_statement': 'قائمة الدخل',
            'balance_sheet': 'الميزانية العمومية',
            'assets': 'الأصول',
            'liabilities': 'الالتزامات',
            'equity': 'حقوق الملكية',
            'revenue': 'الإيرادات',
            'expenses': 'المصروفات',
            'net_profit': 'صافي الربح',
            'trial_balance': 'ميزان المراجعة',
            'account_code': 'الكود',
            'account_name': 'الاسم',
            'account_type': 'النوع',
            'account_parent': 'الحساب الأب',
            'account_notes': 'ملاحظات',
            
            // التقارير
            'report_daily': 'يومي',
            'report_monthly': 'شهري',
            'report_yearly': 'سنوي',
            'report_sellers': 'البائعين',
            'report_products': 'المنتجات',
            'report_customers': 'العملاء',
            'export_csv': 'CSV',
            
            // AI
            'ai_title': 'مساعد الميزان الذكي',
            'ai_smart_analytics': 'تحليلات ذكية',
            'ai_based_on_data': 'مبنية على بياناتك الفعلية',
            'ai_week_predict': 'توقع الأسبوع القادم',
            'ai_critical_stock': 'مخزون حرج',
            'ai_churning': 'عملاء معرضون',
            'ai_analytics': 'تحليلات متاحة',
            'ai_predict_sales': 'توقع المبيعات الأسبوع القادم',
            'ai_predict_stock': 'المنتجات على وشك النفاذ',
            'ai_predict_customers': 'تحليل سلوك العملاء',
            
            // ERP
            'erp_warehouses': 'المستودعات',
            'erp_branches': 'الفروع',
            'erp_currencies': 'العملات',
            'warehouse_name': 'اسم المستودع',
            'warehouse_type': 'النوع',
            'warehouse_location': 'الموقع',
            'warehouse_manager': 'المسؤول',
            
            // الإعدادات
            'company_data': 'بيانات الشركة',
            'company_name': 'اسم الشركة',
            'company_phone': 'الهاتف',
            'company_address': 'العنوان',
            'company_tax': 'الرقم الضريبي',
            'company_footer': 'ملاحظة الفاتورة',
            'backup': 'النسخ الاحتياطي',
            'export_data': 'تصدير البيانات',
            'import_data': 'استيراد نسخة',
            'about_app': 'عن التطبيق',
            'version': 'الإصدار',
            'products_count': 'المنتجات',
            'invoices_count': 'الفواتير',
            'customers_count': 'العملاء',
            'suppliers_count': 'الموردين',
            'logout': 'تسجيل الخروج',
            'developer_tools': 'أدوات المطور',
            'danger_zone': 'منطقة الخطر',
            'clear_data': 'مسح كل البيانات',
            
            // المزيد
            'more_purchases': 'المشتريات',
            'more_customers': 'العملاء',
            'more_suppliers': 'الموردين',
            'more_expenses': 'المصروفات',
            'more_invoices': 'الفواتير',
            'more_payments': 'التحصيل/السداد',
            'more_returns': 'المرتجعات',
            'more_treasury': 'حركات الخزنة',
            'more_accounts': 'الحسابات',
            'more_erp': 'الموارد',
            'more_cash_boxes': 'الخزائن',
            'more_users': 'المستخدمين',
            'more_settings': 'الإعدادات',
            'more_ai': 'مساعد ذكي',
            'more_new': 'جديد!'
        },
        
        en: {
            // Header
            'app_name': 'Mizan',
            'app_subtitle': 'Accounting System',
            'user_badge': 'User',
            'lock': 'Lock',
            'theme_dark': 'Dark Mode',
            'theme_light': 'Light Mode',
            
            // Login
            'login_title': 'Mizan',
            'login_subtitle': 'Accounting & POS System',
            'login_username': '👤 Username',
            'login_password': '🔑 Password',
            'login_select': 'Select User...',
            'login_password_placeholder': 'Enter password...',
            'login_button': 'Login',
            'login_error': '⚠️ Invalid credentials',
            'login_hint': '💡 Default user: Admin / Password: 123456',
            
            // Bottom Navigation
            'nav_dashboard': 'Home',
            'nav_inventory': 'Inventory',
            'nav_cashier': 'Cashier',
            'nav_reports': 'Reports',
            'nav_more': 'More',
            
            // Sections
            'dashboard': 'Dashboard',
            'inventory': 'Inventory',
            'cashier': 'Cashier',
            'purchases': 'Purchases',
            'customers': 'Customers',
            'suppliers': 'Suppliers',
            'cash_boxes': 'Cash Boxes',
            'expenses': 'Expenses',
            'treasury': 'Treasury Movements',
            'invoices': 'Sales Invoices',
            'payments': 'Collection & Payment',
            'returns': 'Returns',
            'accounts': 'Accounts',
            'erp': 'Resource Management',
            'reports': 'Reports',
            'users': 'Users',
            'settings': 'Settings',
            
            // Dashboard
            'dash_products': '📦 Products',
            'dash_inventory': '📊 Quantities',
            'dash_inventory_value': '💰 Inventory Value',
            'dash_low_stock': '⚠️ Low Stock',
            'dash_invoices_count': '🧾 Invoices Count',
            'dash_sales_total': '💰 Total Sales',
            'dash_purchases_total': '🛒 Total Purchases',
            'dash_expenses_total': '💸 Total Expenses',
            'dash_treasury': '💰 Total Treasury',
            'dash_profit': '📈 Net Profit',
            'dash_customer_debt': '💳 Customer Debts',
            'dash_supplier_debt': '📋 Supplier Debts',
            
            // Performance Summary
            'perf_title': 'Performance Summary',
            'perf_best_day': '🏆 Best Sales Day',
            'perf_avg_invoice': '📊 Average Invoice',
            'perf_best_customer': '⭐ Best Customer',
            'perf_best_product': '📦 Best Product',
            'perf_this_month': 'This Month',
            'perf_no_data': 'No Data',
            'perf_no_customer': 'None',
            'perf_no_product': 'None',
            'perf_egp': 'EGP',
            'perf_piece': 'Pcs',
            
            // Last Sales
            'last_sales': 'Last Sales',
            'no_sales': 'No Sales',
            'customer': 'Customer',
            'amount': 'Amount',
            'profit': 'Profit',
            
            // General
            'save': 'Save',
            'cancel': 'Cancel',
            'delete': 'Delete',
            'edit': 'Edit',
            'add': 'Add',
            'search': '🔍 Search...',
            'close': 'Close',
            'confirm': 'Confirm',
            'yes': 'Yes',
            'no': 'No',
            'total': 'Total',
            'subtotal': 'Subtotal',
            'quantity': 'Quantity',
            'price': 'Price',
            'name': 'Name',
            'phone': 'Phone',
            'address': 'Address',
            'date': 'Date',
            'time': 'Time',
            'status': 'Status',
            'notes': 'Notes',
            'print': 'Print',
            'pdf': 'PDF',
            'whatsapp': 'WhatsApp',
            'qr_code': 'QR Code',
            
            // Messages
            'msg_saved': '✅ Saved',
            'msg_deleted': '🗑️ Deleted',
            'msg_added': '✅ Added',
            'msg_updated': '✅ Updated',
            'msg_error': '❌ Error',
            'msg_confirm_delete': '⚠️ Are you sure?',
            'msg_no_permission': '⚠️ No permission',
            'msg_lang_switched': '🌍 Switched to Arabic',
            'msg_invoice_saved': '✅ Invoice saved',
            'msg_product_saved': '✅ Product saved',
            'msg_customer_saved': '✅ Customer saved',
            'msg_supplier_saved': '✅ Supplier saved',
            'msg_expense_saved': '✅ Expense saved',
            'msg_purchase_saved': '✅ Purchase saved',
            
            // Accounts
            'accounting_balance': 'Trial Balance',
            'income_statement': 'Income Statement',
            'balance_sheet': 'Balance Sheet',
            'assets': 'Assets',
            'liabilities': 'Liabilities',
            'equity': 'Equity',
            'revenue': 'Revenue',
            'expenses': 'Expenses',
            'net_profit': 'Net Profit',
            'trial_balance': 'Trial Balance',
            'account_code': 'Code',
            'account_name': 'Name',
            'account_type': 'Type',
            'account_parent': 'Parent Account',
            'account_notes': 'Notes',
            
            // Reports
            'report_daily': 'Daily',
            'report_monthly': 'Monthly',
            'report_yearly': 'Yearly',
            'report_sellers': 'Sellers',
            'report_products': 'Products',
            'report_customers': 'Customers',
            'export_csv': 'CSV',
            
            // AI
            'ai_title': 'Mizan Smart Assistant',
            'ai_smart_analytics': 'Smart Analytics',
            'ai_based_on_data': 'Based on your actual data',
            'ai_week_predict': 'Next Week Prediction',
            'ai_critical_stock': 'Critical Stock',
            'ai_churning': 'Churning Customers',
            'ai_analytics': 'Analytics Available',
            'ai_predict_sales': 'Predict Next Week Sales',
            'ai_predict_stock': 'Products About to Run Out',
            'ai_predict_customers': 'Analyze Customer Behavior',
            
            // ERP
            'erp_warehouses': 'Warehouses',
            'erp_branches': 'Branches',
            'erp_currencies': 'Currencies',
            'warehouse_name': 'Warehouse Name',
            'warehouse_type': 'Type',
            'warehouse_location': 'Location',
            'warehouse_manager': 'Manager',
            
            // Settings
            'company_data': 'Company Data',
            'company_name': 'Company Name',
            'company_phone': 'Phone',
            'company_address': 'Address',
            'company_tax': 'Tax Number',
            'company_footer': 'Invoice Note',
            'backup': 'Backup',
            'export_data': 'Export Data',
            'import_data': 'Import Backup',
            'about_app': 'About',
            'version': 'Version',
            'products_count': 'Products',
            'invoices_count': 'Invoices',
            'customers_count': 'Customers',
            'suppliers_count': 'Suppliers',
            'logout': 'Logout',
            'developer_tools': 'Developer Tools',
            'danger_zone': 'Danger Zone',
            'clear_data': 'Clear All Data',
            
            // More
            'more_purchases': 'Purchases',
            'more_customers': 'Customers',
            'more_suppliers': 'Suppliers',
            'more_expenses': 'Expenses',
            'more_invoices': 'Invoices',
            'more_payments': 'Collection/Payment',
            'more_returns': 'Returns',
            'more_treasury': 'Treasury',
            'more_accounts': 'Accounts',
            'more_erp': 'Resources',
            'more_cash_boxes': 'Cash Boxes',
            'more_users': 'Users',
            'more_settings': 'Settings',
            'more_ai': 'Smart Assistant',
            'more_new': 'New!'
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 🌍 اللغة الحالية
    // ═══════════════════════════════════════════════════════════
    window.currentLang = localStorage.getItem('mizan_lang') || 'ar';

    window.t = function(key) {
        return TRANSLATIONS[window.currentLang][key] || TRANSLATIONS.ar[key] || key;
    };

    // ═══════════════════════════════════════════════════════════
    // 🔄 تطبيق الترجمة على الصفحة
    // ═══════════════════════════════════════════════════════════
    window.translatePage = function() {
        const lang = window.currentLang;
        
        // 1. ترجمة العناصر بـ data-i18n
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
        
        // 2. ترجمة الصفحات بالـ IDs
        const pageTranslations = {
            'page-dashboard': 'dashboard',
            'page-inventory': 'inventory',
            'page-cashier': 'cashier',
            'page-purchases': 'purchases',
            'page-customers': 'customers',
            'page-suppliers': 'suppliers',
            'page-cash-boxes': 'cash_boxes',
            'page-expenses': 'expenses',
            'page-treasury': 'treasury',
            'page-invoices': 'invoices',
            'page-payments': 'payments',
            'page-returns': 'returns',
            'page-accounts': 'accounts',
            'page-erp': 'erp',
            'page-reports': 'reports',
            'page-users': 'users',
            'page-settings': 'settings'
        };
        
        Object.keys(pageTranslations).forEach(function(pageId) {
            const page = document.getElementById(pageId);
            if (!page) return;
            
            // ترجمة العنوان الرئيسي
            const h2 = page.querySelector('.page-content > h2');
            if (h2) {
                const key = pageTranslations[pageId];
                const translated = t(key);
                if (translated) {
                    // احتفظ بالأيقونة
                    const icon = h2.querySelector('i');
                    if (icon) {
                        h2.innerHTML = '';
                        h2.appendChild(icon);
                        h2.appendChild(document.createTextNode(' ' + translated));
                    } else {
                        h2.textContent = translated;
                    }
                }
            }
        });
        
        // 3. ترجمة لوحة التحكم
        if (lang === 'en') {
            const dashMap = {
                'dashProducts': '📦 Products',
                'dashInventory': '📊 Quantities',
                'dashInventoryValue': '💰 Inventory Value',
                'dashLowStock': '⚠️ Low Stock',
                'dashSalesCount': '🧾 Invoices',
                'dashSalesTotal': '💰 Total Sales',
                'dashPurchasesTotal': '🛒 Purchases',
                'dashExpensesTotal': '💸 Expenses',
                'dashTreasury': '💰 Treasury',
                'dashProfit': '📈 Net Profit',
                'dashCustomerDebt': '💳 Customer Debts',
                'dashSupplierDebt': '📋 Supplier Debts'
            };
            
            const cardMap = {
                'dashProducts': 'Products',
                'dashInventory': 'Quantities',
                'dashInventoryValue': 'Inventory Value',
                'dashLowStock': 'Low Stock',
                'dashSalesCount': 'Invoices',
                'dashSalesTotal': 'Total Sales',
                'dashPurchasesTotal': 'Purchases',
                'dashExpensesTotal': 'Expenses',
                'dashTreasury': 'Treasury',
                'dashProfit': 'Net Profit',
                'dashCustomerDebt': 'Customer Debts',
                'dashSupplierDebt': 'Supplier Debts'
            };
            
            // ترجمة البطاقات
            document.querySelectorAll('.dashboard-card').forEach(function(card) {
                const label = card.querySelector('.label');
                const number = card.querySelector('.number');
                if (label && number) {
                    const id = number.id;
                    if (cardMap[id]) {
                        const emojis = {
                            'dashProducts': '📦 ',
                            'dashInventory': '📊 ',
                            'dashInventoryValue': '💰 ',
                            'dashLowStock': '⚠️ ',
                            'dashSalesCount': '🧾 ',
                            'dashSalesTotal': '💰 ',
                            'dashPurchasesTotal': '🛒 ',
                            'dashExpensesTotal': '💸 ',
                            'dashTreasury': '💰 ',
                            'dashProfit': '📈 ',
                            'dashCustomerDebt': '💳 ',
                            'dashSupplierDebt': '📋 '
                        };
                        label.textContent = (emojis[id] || '') + cardMap[id];
                    }
                }
            });
        } else {
            // ترجمة عربية
            const cardMap = {
                'dashProducts': '📦 المنتجات',
                'dashInventory': '📊 الكميات',
                'dashInventoryValue': '💰 قيمة المخزون',
                'dashLowStock': '⚠️ قاربت على النفاذ',
                'dashSalesCount': '🧾 عدد الفواتير',
                'dashSalesTotal': '💰 إجمالي المبيعات',
                'dashPurchasesTotal': '🛒 إجمالي المشتريات',
                'dashExpensesTotal': '💸 إجمالي المصروفات',
                'dashTreasury': '💰 إجمالي الخزائن',
                'dashProfit': '📈 صافي الربح',
                'dashCustomerDebt': '💳 مديونيات العملاء',
                'dashSupplierDebt': '📋 التزامات الموردين'
            };
            
            document.querySelectorAll('.dashboard-card').forEach(function(card) {
                const label = card.querySelector('.label');
                const number = card.querySelector('.number');
                if (label && number && cardMap[number.id]) {
                    label.textContent = cardMap[number.id];
                }
            });
        }
        
        // 4. ترجمة التنقل السفلي
        const navMap = {
            'dashboard': 'nav_dashboard',
            'inventory': 'nav_inventory',
            'cashier': 'nav_cashier',
            'reports': 'nav_reports',
            'more': 'nav_more'
        };
        
        document.querySelectorAll('.bottom-nav .nav-item').forEach(function(item) {
            const page = item.dataset.page;
            const span = item.querySelector('span');
            if (span && navMap[page]) {
                span.textContent = t(navMap[page]);
            }
        });
        
        // 5. ترجمة قائمة المزيد
        document.querySelectorAll('#moreMenu .more-item').forEach(function(item) {
            const onclick = item.getAttribute('onclick') || '';
            const span = item.textContent.trim();
            const icon = item.querySelector('i');
            const iconHTML = icon ? icon.outerHTML : '';
            
            let key = '';
            if (onclick.indexOf('purchases') > -1) key = 'more_purchases';
            else if (onclick.indexOf('customers') > -1) key = 'more_customers';
            else if (onclick.indexOf('suppliers') > -1) key = 'more_suppliers';
            else if (onclick.indexOf('expenses') > -1) key = 'more_expenses';
            else if (onclick.indexOf('invoices') > -1) key = 'more_invoices';
            else if (onclick.indexOf('payments') > -1) key = 'more_payments';
            else if (onclick.indexOf('returns') > -1) key = 'more_returns';
            else if (onclick.indexOf('treasury') > -1) key = 'more_treasury';
            else if (onclick.indexOf('accounts') > -1) key = 'more_accounts';
            else if (onclick.indexOf('erp') > -1) key = 'more_erp';
            else if (onclick.indexOf('cash-boxes') > -1) key = 'more_cash_boxes';
            else if (onclick.indexOf('users') > -1) key = 'more_users';
            else if (onclick.indexOf('settings') > -1) key = 'more_settings';
            
            if (key) {
                item.innerHTML = iconHTML + ' ' + t(key);
            }
        });
        
        // 6. ترجمة ملخص الأداء
        const perfTitle = document.querySelector('.performance-summary h3 span');
        if (perfTitle) perfTitle.textContent = t('perf_title');
        
        const perfCards = document.querySelectorAll('.perf-card');
        perfCards.forEach(function(card) {
            const label = card.querySelector('.perf-label');
            const sub = card.querySelector('.perf-sub');
            const unit = card.querySelector('.perf-unit');
            
            if (label) {
                const labelText = label.textContent.trim();
                if (labelText.indexOf('أفضل يوم') > -1) label.textContent = t('perf_best_day');
                else if (labelText.indexOf('متوسط') > -1) label.textContent = t('perf_avg_invoice');
                else if (labelText.indexOf('أفضل عميل') > -1) label.textContent = t('perf_best_customer');
                else if (labelText.indexOf('أفضل منتج') > -1) label.textContent = t('perf_best_product');
            }
            
            if (sub) {
                const subText = sub.textContent.trim();
                if (subText === 'هذا الشهر') sub.textContent = t('perf_this_month');
                else if (subText === 'لا يوجد' || subText === '—') {
                    // تحقق من الـ ID
                    if (sub.id === 'bestCustomerName') sub.textContent = t('perf_no_customer');
                    else if (sub.id === 'bestProductName') sub.textContent = t('perf_no_product');
                }
            }
            
            if (unit) {
                const unitText = unit.textContent.trim();
                if (unitText === 'ج.م') unit.textContent = t('perf_egp');
                else if (unitText === 'قطعة') unit.textContent = t('perf_piece');
            }
        });
        
        // 7. ترجمة آخر المبيعات
        const lastSalesH2 = document.querySelector('#dashLastSales')?.previousElementSibling;
        if (lastSalesH2 && lastSalesH2.tagName === 'H2') {
            const icon = lastSalesH2.querySelector('i');
            if (icon) {
                lastSalesH2.innerHTML = '';
                lastSalesH2.appendChild(icon);
                lastSalesH2.appendChild(document.createTextNode(' ' + t('last_sales')));
            }
        }
        
        // 8. ترجمة الأزرار الرئيسية
        document.querySelectorAll('button').forEach(function(btn) {
            const text = btn.textContent.trim();
            
            // أزرار الحفظ
            if (text === 'حفظ' && lang === 'en') btn.textContent = 'Save';
            else if (text === 'Save' && lang === 'ar') btn.textContent = 'حفظ';
            
            // أزرار الإلغاء
            if (text === 'إلغاء' && lang === 'en') btn.textContent = 'Cancel';
            else if (text === 'Cancel' && lang === 'ar') btn.textContent = 'إلغاء';
            
            // أزرار الإغلاق
            if (text === 'إغلاق' && lang === 'en') btn.textContent = 'Close';
            else if (text === 'Close' && lang === 'ar') btn.textContent = 'إغلاق';
            
            // أزرار الحذف
            if (text === 'حذف' && lang === 'en') btn.textContent = 'Delete';
            else if (text === 'Delete' && lang === 'ar') btn.textContent = 'حذف';
        });
        
        console.log('✅ تم تطبيق الترجمة:', lang);
    };

    // ═══════════════════════════════════════════════════════════
    // 🔄 تبديل اللغة
    // ═══════════════════════════════════════════════════════════
    window.toggleLanguage = function() {
        const newLang = window.currentLang === 'ar' ? 'en' : 'ar';
        window.currentLang = newLang;
        localStorage.setItem('mizan_lang', newLang);
        
        const isRTL = newLang === 'ar';
        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', newLang);
        
        // تحديث الزر
        const btn = document.getElementById('langToggleBtn');
        if (btn) btn.innerHTML = isRTL ? 'EN' : 'ع';
        
        // ترجمة الصفحة
        setTimeout(translatePage, 100);
        
        // رسالة
        if (typeof showToast === 'function') {
            showToast(t('msg_lang_switched'), 'info');
        }
        
        // إعادة تحميل البيانات
        setTimeout(function() {
            if (typeof updateDashboard === 'function') updateDashboard();
            if (typeof updateQuickSummary === 'function') updateQuickSummary();
            if (typeof renderProducts === 'function') renderProducts();
            if (typeof renderCustomers === 'function') renderCustomers();
            if (typeof renderSuppliers === 'function') renderSuppliers();
            if (typeof renderInvoices === 'function') renderInvoices();
            if (typeof renderExpenses === 'function') renderExpenses();
            if (typeof renderCashBoxes === 'function') renderCashBoxes();
            if (typeof renderTreasury === 'function') renderTreasury();
            if (typeof renderPayments === 'function') renderPayments();
            if (typeof renderReturns === 'function') renderReturns();
            if (typeof renderUsers === 'function') renderUsers();
        }, 300);
    };

    // ═══════════════════════════════════════════════════════════
    // 🎯 إضافة زر اللغة
    // ═══════════════════════════════════════════════════════════
    function addLangToggle() {
        const header = document.querySelector('.header-actions');
        if (!header) return;
        
        let btn = document.getElementById('langToggleBtn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'langToggleBtn';
            btn.title = 'Switch Language / تبديل اللغة';
            btn.onclick = window.toggleLanguage;
            btn.style.cssText = 'background:#0D0D0D;border:1.5px solid #3D3D3D;color:#C9A94E;width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:900;font-family:inherit;padding:0;display:inline-flex;align-items:center;justify-content:center;';
            
            const lockBtn = header.querySelector('.lock-btn');
            if (lockBtn) header.insertBefore(btn, lockBtn);
            else header.appendChild(btn);
        }
        
        btn.innerHTML = window.currentLang === 'ar' ? 'EN' : 'ع';
    }

    // ═══════════════════════════════════════════════════════════
    // 🚀 التهيئة
    // ═══════════════════════════════════════════════════════════
    function initLanguage() {
        const isRTL = window.currentLang === 'ar';
        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', window.currentLang);
        
        addLangToggle();
        
        // تأخير الترجمة حتى تحمّل كل شيء
        setTimeout(translatePage, 1500);
        
        // مراقبة التغييرات في DOM
        const observer = new MutationObserver(function() {
            setTimeout(translatePage, 200);
        });
        
        setTimeout(function() {
            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
            }
        }, 3000);
        
        console.log('✅ language.js جاهز - اللغة:', window.currentLang);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initLanguage, 500);
        });
    } else {
        setTimeout(initLanguage, 500);
    }

    // إعادة المحاولة بعد 3 ثواني للتأكد
    setTimeout(function() {
        if (!document.getElementById('langToggleBtn')) {
            addLangToggle();
        }
        translatePage();
    }, 3000);

})();
