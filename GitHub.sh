#!/bin/bash
# ============================================================
# GitHub.sh - سكربت الرفع الآمن
# ============================================================

echo "🚀 بدء عملية الرفع..."

# التحقق من وجود تغييرات
git add .
if git diff --cached --quiet; then
    echo "⚠️ لا توجد تغييرات للرفع"
    exit 0
fi

# طلب رسالة commit
read -p "📝 أدخل رسالة Commit (افتراضي: تحديث تلقائي): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="تحديث تلقائي - $(date '+%Y-%m-%d %H:%M')"
fi

# Commit
git commit -m "$commit_msg"
if [ $? -ne 0 ]; then
    echo "❌ فشل الـ Commit"
    exit 1
fi
echo "✅ تم الـ Commit: $commit_msg"

# Push
git push
if [ $? -ne 0 ]; then
    echo "❌ فشل الـ Push"
    exit 1
fi
echo "✅ تم الرفع بنجاح!"
