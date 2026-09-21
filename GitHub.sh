#!/bin/bash
git add .
if git diff --cached --quiet; then
    echo "⚠️ لا توجد تغييرات"
else
    git commit -m "إضافة 15 ميزة جديدة"
    git push
    echo "✅ تم الرفع"
fi
