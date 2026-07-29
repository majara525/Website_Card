# ما الذي يُرفع إلى GitHub؟

## ارفع هذه الملفات والمجلدات

ارفع محتويات حزمة `github-upload/reminders/` إلى مجلد `reminders/` الموجود في مستودع
موقع `mycard.almahad-alali.com`:

```text
.gitignore
app/
assets/
docs/
downloads/reminders.apk
gradle/
index.html
app.html
app.js
styles.css
sw.js
manifest.webmanifest
build.gradle
CHANGELOG.md
gradle.properties
gradlew
gradlew.bat
README.md
settings.gradle
```

زر التنزيل يستخدم نسخة واحدة ثابتة:

```text
downloads/reminders.apk
```

## لا ترفع هذه الملفات

```text
.gradle/
.build/
.idea/
app/build/
build/
local.properties
*.iml
*.jks
*.keystore
```

هذه ملفات مولدة أو محلية أو مفاتيح حساسة. ملف `.gitignore` يمنع رفعها تلقائيًا.

لا ترفع ملف الإصدار القديم:

```text
tazkirati-0.1.0-debug.apk
```

استخدم دائمًا:

```text
reminders.apk
```

## أول رفع

1. افتح مجلد `reminders` في مستودع موقعك على GitHub.
2. ارفع **محتويات** `github-upload/reminders/` إليه.
3. تأكد أن `reminders/index.html` موجود، وليس `reminders/web/index.html`.
4. انتظر نشر الموقع بالطريقة المستخدمة أصلًا للمستودع.
5. افتح `https://mycard.almahad-alali.com/reminders/`.

## كل تحديث لاحق

1. غيّر المصدر.
2. زد `versionCode` و`versionName`.
3. ابنِ واختبر.
4. استبدل `downloads/reminders.apk` مع إبقاء الاسم نفسه.
5. حدّث سجل التغييرات والترقية.
6. ارفع الملفات المعدلة بنفس المسارات.

لا تحذف زر الموقع ولا تغيّر رابط APK؛ سيظل الرابط نفسه يعمل بعد تحديث الملف.
