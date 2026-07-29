# نشر تطبيق أندرويد والموقع

## بناء APK محليًا

```powershell
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
.\gradlew.bat testDebugUnitTest assembleDebug
```

انسخ الناتج من:

```text
.build/app/outputs/apk/debug/app-debug.apk
```

إلى الملف الثابت:

```text
downloads/reminders.apk
```

النسخة الحالية Debug قابلة للتثبيت اليدوي، لكنها ليست إصدار متجر رسمي. للنشر العام استخدم مفتاح توقيع Release محفوظًا خارج GitHub.

## بناء APK في GitHub

الملف:

```text
.github/workflows/build-android.yml
```

يشغّل الاختبارات ويبني APK ويرفعه كـ Artifact باسم `reminders-apk`.

للتشغيل اليدوي:

1. افتح **Actions**.
2. اختر «بناء تطبيق أندرويد».
3. اضغط **Run workflow**.
4. بعد النجاح نزّل Artifact.
5. فك الضغط واستبدل `downloads/reminders.apk` في المستودع مع إبقاء الاسم نفسه.

## نشر الموقع في المسار الصحيح

يجب أن تكون ملفات الموقع (`index.html` و`app.html` و`styles.css` و`app.js` و`sw.js`
و`manifest.webmanifest` و`assets/`) مباشرة داخل مجلد `reminders` في المستودع، وليس داخل
`reminders/web`.

```text
https://mycard.almahad-alali.com/reminders/
```

إذا كان المستودع الحالي منشورًا أصلًا على `mycard.almahad-alali.com`، فإن رفع مجلد
`reminders` إلى فرع النشر نفسه يكفي. لا تشغّل إجراء Pages مستقلًا خاصًا بالتذكيرات لأنه
قد يستبدل بقية الموقع المنشور.

بعد الرفع افحص:

1. `https://mycard.almahad-alali.com/reminders/`
2. `https://mycard.almahad-alali.com/reminders/app.html`
3. `https://mycard.almahad-alali.com/reminders/downloads/reminders.apk`

## تجربة الموقع محليًا

لا تفتح `index.html` مباشرة عند اختبار Service Worker. شغّل خادمًا محليًا من جذر
المستودع، ثم افتح `/reminders/` على عنوان `localhost`.

بعد الزيارة الأولى:

1. افتح `app.html`.
2. أنشئ تذكيرًا.
3. افصل الإنترنت.
4. أعد تحميل الصفحة.
5. تأكد من ظهور التذكير وبقاء الواجهة.

## آيفون وآيباد

لا يوجد IPA أصلي حاليًا. انشر الموقع ثم:

1. افتحه في Safari.
2. اضغط مشاركة.
3. اختر «إضافة إلى الشاشة الرئيسية».

إصدار iOS أصلي لاحقًا يحتاج macOS وXcode وحساب Apple Developer وتوقيعًا وشهادة توزيع.
