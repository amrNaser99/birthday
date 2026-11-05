# أجمل صدفة في عمري — الموقع

## المعاينة المحلية

افتح Terminal داخل مجلد المشروع ثم شغّل:

```powershell
python -m http.server 8080 --directory dist
```

ثم افتح: `http://localhost:8080`

## إضافة الفيلم

ضع الفيديو النهائي في:

`dist/assets/our-story.mp4`

ويمكن إضافة موسيقى اختيارية مرخصة في:

`dist/assets/ambient-music.mp3`

## الكارت

صفحة الكارت موجودة في `dist/print-card.html`، والـQR النهائي في `dist/assets/qr-code.png`.

لا تطبع الكارت قبل اختبار الرابط المنشور من هاتف خارج حساب المالك.
