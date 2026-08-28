# TASK: Implementasi Transactional Email Menggunakan Resend

## 1. Context

Saya sedang mengembangkan website **Kagoem Digital**.

Kagoem Digital nantinya akan menjadi platform yang menjual:

* SaaS / aplikasi berlangganan
* POS Kasir
* Source Code
* Ebook
* UI Template
* Produk digital lainnya

Kagoem Digital memiliki Account System yang digunakan sebagai identitas utama customer.

Saat ini saya ingin menggunakan **Resend sebagai transactional email service** untuk mengirim email dari aplikasi Kagoem Digital.

Resend nantinya digunakan untuk:

* Email verification
* Forgot password
* Reset password
* Invoice
* Payment notification
* Subscription notification
* Product purchase notification
* Digital product download notification
* Email lainnya yang bersifat transactional

Untuk task ini, fokus utama adalah **integrasi Resend dengan aplikasi dan email authentication**.

---

# 2. SOURCE OF TRUTH

Sebelum mulai mengerjakan task:

1. Baca file:

```text
prompt_registration.md
```

2. Pahami requirement authentication yang sudah dibuat sebelumnya.
3. Gunakan hasil implementasi registration/authentication yang sudah ada.
4. Jangan membuat ulang authentication system.
5. Integrasikan Resend ke authentication system existing.

Jika `prompt_registration.md` belum tersedia, jangan membuat asumsi besar. Analisis project existing terlebih dahulu.

---

# 3. WAJIB ANALISIS PROJECT

Sebelum melakukan perubahan kode, periksa:

* Backend framework
* Laravel version
* Frontend framework
* Database
* Mail configuration
* Existing Mail configuration
* Existing Mailables
* Existing Notifications
* Existing email verification
* Existing password reset
* Existing authentication
* `.env`
* `config/mail.php`
* `config/services.php`
* Composer dependencies
* Existing tests

Cari apakah project sudah memiliki:

```text
Mail
Mailable
Notification
Email Verification
Password Reset
Mail Driver
SMTP configuration
```

Jangan membuat duplicate implementation.

---

# 4. TUJUAN

Implementasikan:

```text
Laravel
   ↓
Resend
   ↓
Customer Email
```

Resend harus menjadi transactional email provider untuk Kagoem Digital.

Target utama:

```text
Registration
   ↓
Email Verification
   ↓
Resend
   ↓
Customer
```

Dan:

```text
Forgot Password
   ↓
Reset Password Email
   ↓
Resend
   ↓
Customer
```

---

# 5. RESEND CONFIGURATION

Gunakan environment variable.

Jangan hardcode API key.

Tambahkan konfigurasi yang diperlukan ke `.env`.

Contoh konsep:

```env
MAIL_MAILER=resend

RESEND_API_KEY=

MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="Kagoem Digital"
```

**Jangan mengisi API key dengan nilai contoh atau dummy di source code.**

API key harus berasal dari `.env`.

Jangan commit secret ke Git.

---

# 6. INSTALLATION

Periksa versi Laravel yang digunakan project.

Kemudian gunakan package/library Resend yang kompatibel dengan versi Laravel dan PHP project.

Sebelum melakukan installation:

```text
Check Laravel Version
Check PHP Version
Check Existing Mail Dependencies
Check Composer
```

Jangan sembarang menggunakan package versi terbaru jika tidak kompatibel dengan project.

Gunakan dokumentasi/integrasi Resend yang sesuai dengan versi Laravel project.

Setelah menentukan package yang benar:

```bash
composer require <resend-package>
```

Gunakan command/package yang memang sesuai dengan versi project.

---

# 7. MAIL CONFIGURATION

Konfigurasikan Laravel agar dapat menggunakan Resend.

Periksa:

```text
config/mail.php
config/services.php
```

Jika project sudah memiliki konfigurasi mail, modifikasi secara minimal.

Jangan merusak konfigurasi mail existing.

Pastikan application dapat membaca:

```text
RESEND_API_KEY
MAIL_FROM_ADDRESS
MAIL_FROM_NAME
```

---

# 8. EMAIL SENDER

Gunakan sender:

```text
Kagoem Digital
```

Email sender berasal dari:

```env
MAIL_FROM_ADDRESS=
```

Contoh production:

```env
MAIL_FROM_ADDRESS=noreply@kagoemdigital.com
MAIL_FROM_NAME="Kagoem Digital"
```

Jangan hardcode domain.

Gunakan environment variable.

---

# 9. EMAIL VERIFICATION

Integrasikan Resend dengan email verification yang sudah dibuat berdasarkan `prompt_registration.md`.

Flow:

```text
User Register
      ↓
Create User
      ↓
Send Verification Email
      ↓
Laravel
      ↓
Resend
      ↓
User Email
      ↓
Click Verification Link
      ↓
Email Verified
```

Jangan membuat verification system baru.

Gunakan mekanisme verification existing/framework jika sudah tersedia.

---

# 10. VERIFICATION EMAIL DESIGN

Email harus terlihat profesional dan sesuai branding Kagoem Digital.

Minimal:

```text
Kagoem Digital

Halo, {name}

Terima kasih telah membuat akun
di Kagoem Digital.

Silakan verifikasi alamat email Anda
untuk mengaktifkan akun.

[ VERIFIKASI EMAIL ]

Jika Anda tidak membuat akun ini,
abaikan email ini.

© Kagoem Digital
```

Gunakan email template yang reusable.

Jangan menulis HTML email langsung di controller.

---

# 11. EMAIL TEMPLATE ARCHITECTURE

Buat struktur yang mudah dikembangkan.

Contoh jika sesuai dengan architecture project:

```text
resources/views/emails/
```

atau struktur email yang sudah digunakan project.

Pisahkan template:

```text
verification.blade.php
password-reset.blade.php
```

Jika menggunakan Mailable/Notification:

```text
app/Mail/
app/Notifications/
```

ikuti architecture existing.

Tujuannya agar nanti mudah menambahkan:

```text
invoice.blade.php
payment-success.blade.php
subscription-expiring.blade.php
product-purchased.blade.php
download-ready.blade.php
```

---

# 12. FORGOT PASSWORD

Integrasikan Resend dengan password reset existing.

Flow:

```text
User
 ↓
Forgot Password
 ↓
Input Email
 ↓
Laravel
 ↓
Resend
 ↓
Reset Password Email
 ↓
User Click Link
 ↓
Reset Password
```

Jangan membuat custom password reset system jika framework sudah menyediakan mekanisme yang aman.

---

# 13. PASSWORD RESET EMAIL

Template minimal:

```text
Kagoem Digital

Halo, {name}

Kami menerima permintaan untuk
mengatur ulang password akun Anda.

[ RESET PASSWORD ]

Jika Anda tidak meminta reset password,
Anda dapat mengabaikan email ini.

Link reset password memiliki batas waktu.

© Kagoem Digital
```

---

# 14. MAIL SERVICE ARCHITECTURE

Jangan menaruh logic Resend secara langsung di controller seperti:

```php
public function register()
{
    // send email directly
}
```

Jika architecture project memungkinkan, gunakan:

```text
Controller
    ↓
Service / Notification / Mailable
    ↓
Laravel Mail
    ↓
Resend
```

Tujuannya agar application code tidak bergantung langsung pada implementation provider.

Dengan demikian jika suatu hari Kagoem ingin mengganti:

```text
Resend
   ↓
Brevo
```

atau provider lain, perubahan dapat dilakukan dengan minimal.

---

# 15. ERROR HANDLING

Jika Resend gagal:

```text
Resend API unavailable
Invalid API key
Domain not verified
Network error
Rate limit
Invalid sender
```

Aplikasi jangan menampilkan error internal kepada user.

Contoh user-facing:

```text
Email belum dapat dikirim.
Silakan coba lagi beberapa saat.
```

Sedangkan detail error harus masuk ke application log.

Contoh:

```text
storage/logs/laravel.log
```

Jangan log:

* API key
* password
* token sensitif
* credential

---

# 16. QUEUE / ASYNC EMAIL

Periksa apakah project sudah menggunakan Laravel Queue.

Jika tersedia, gunakan queue untuk email transactional agar request user tidak menunggu proses pengiriman email.

Contoh konsep:

```text
Registration
     ↓
Create User
     ↓
Queue Email
     ↓
Response ke User
     ↓
Queue Worker
     ↓
Resend
     ↓
Customer
```

Jika queue belum digunakan, jangan membuat infrastructure queue yang terlalu kompleks tanpa kebutuhan.

Tetapi architecture email harus siap untuk menggunakan queue di tahap berikutnya.

---

# 17. EMAIL RETRY

Jika email dikirim menggunakan queue, gunakan retry mechanism yang sesuai.

Jika Resend gagal sementara:

```text
Attempt 1
   ↓
Failed
   ↓
Retry
   ↓
Attempt 2
   ↓
Retry
   ↓
Attempt 3
```

Gunakan konfigurasi yang wajar.

Jangan membuat infinite retry.

---

# 18. EMAIL LOGGING

Pastikan kegagalan email dapat dilacak.

Minimal application log menyimpan:

```text
email type
recipient identifier jika aman
success/failure
error message
timestamp
```

Jangan menyimpan API key atau credential.

Jika project sudah mempunyai logging system, gunakan yang existing.

---

# 19. LOCAL DEVELOPMENT

Buat konfigurasi yang mudah untuk development.

Jangan sampai developer harus memasukkan secret Resend ke source code.

Gunakan:

```env
RESEND_API_KEY=
```

di `.env`.

`.env.example` hanya boleh berisi placeholder:

```env
RESEND_API_KEY=
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="Kagoem Digital"
```

Jangan masukkan API key sebenarnya ke `.env.example`.

Pastikan `.env` tidak masuk Git.

---

# 20. TESTING

Buat automated test untuk:

### Verification Email

```text
✓ Registration berhasil
✓ Verification notification dikirim
✓ Email menggunakan sender yang benar
✓ Verification URL tersedia
```

### Password Reset

```text
✓ Forgot password berhasil
✓ Reset email dikirim
✓ Reset URL tersedia
```

### Configuration

```text
✓ Resend API configuration dapat dibaca
✓ MAIL_FROM_ADDRESS dapat dibaca
✓ MAIL_FROM_NAME dapat dibaca
```

Gunakan fake/mail testing mechanism Laravel jika sesuai.

Jangan mengirim email sungguhan ke Resend ketika menjalankan automated test.

---

# 21. MANUAL TEST

Setelah automated test berhasil, lakukan manual test menggunakan Resend jika environment memungkinkan.

Test:

```text
1. Register user baru
2. Check email
3. Klik verification link
4. Login
5. Logout
6. Forgot password
7. Check email reset password
8. Reset password
9. Login menggunakan password baru
```

Jika API key atau domain belum tersedia, jangan mengarang hasil.

Laporkan:

```text
Manual email test blocked because:
RESEND_API_KEY is not configured.
```

---

# 22. ENVIRONMENT

Pastikan dokumentasi menjelaskan variable:

```env
MAIL_MAILER=
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME=
RESEND_API_KEY=
```

Jangan menampilkan nilai secret sebenarnya pada final report.

---

# 23. DOMAIN VERIFICATION

Jangan mencoba membuat atau mengubah DNS secara otomatis.

Jika domain belum diverifikasi di Resend, dokumentasikan bahwa user perlu menambahkan DNS record dari dashboard Resend.

Contoh dokumentasi:

```text
Resend Dashboard
      ↓
Domains
      ↓
Add Domain
      ↓
kagoemdigital.com
      ↓
Copy DNS Records
      ↓
Add records to DNS provider
      ↓
Verify Domain
```

Jangan membuat nilai DNS record sendiri.

Gunakan nilai yang diberikan oleh Resend.

---

# 24. SECURITY

Pastikan:

* API key hanya berada di environment variable
* API key tidak masuk Git
* API key tidak masuk frontend
* API key tidak masuk API response
* API key tidak ditampilkan pada log
* credential tidak ditampilkan pada exception response
* email verification token tidak dicatat secara tidak perlu
* password reset token tidak dilog
* sender address dikontrol dari backend
* frontend tidak dapat menentukan arbitrary sender email

---

# 25. BACKWARD COMPATIBILITY

Jika sebelumnya project menggunakan:

```text
SMTP
```

atau:

```text
log mail
```

periksa impact perubahan.

Jangan menghapus konfigurasi existing jika masih dibutuhkan.

Jika memungkinkan:

```text
Development:
MAIL_MAILER=log

Production:
MAIL_MAILER=resend
```

atau sesuai kebutuhan architecture project.

Namun jangan membuat asumsi. Ikuti environment configuration yang sudah ada.

---

# 26. OUT OF SCOPE

Jangan implementasikan:

* Midtrans
* Payment Gateway
* Checkout
* Subscription
* POS provisioning
* Product marketplace
* Source code marketplace
* Ebook marketplace
* UI Template marketplace
* License management
* Download management

Task ini hanya:

```text
Resend
+
Email Verification
+
Password Reset
+
Transactional Email Foundation
```

---

# 27. ACCEPTANCE CRITERIA

Implementasi dianggap berhasil jika:

* [ ] Resend berhasil dikonfigurasi
* [ ] API key menggunakan `.env`
* [ ] Tidak ada secret hardcoded
* [ ] Laravel dapat menggunakan Resend
* [ ] Verification email menggunakan Resend
* [ ] Password reset email menggunakan Resend
* [ ] Sender menggunakan Kagoem Digital
* [ ] Email template terpisah dari controller
* [ ] Error handling tersedia
* [ ] Logging tersedia
* [ ] Queue digunakan jika architecture existing mendukung
* [ ] Automated test tersedia
* [ ] Existing authentication tidak rusak
* [ ] Existing functionality tidak rusak
* [ ] `.env.example` diperbarui
* [ ] Dokumentasi setup diperbarui

---

# 28. FINAL REPORT

Setelah implementasi selesai, tampilkan:

## Project Analysis

Jelaskan:

* Laravel version
* PHP version
* Existing mail architecture
* Existing authentication architecture

## Installation

Package yang diinstall.

## Configuration

File configuration yang diubah.

## Files Created

Daftar file baru.

## Files Modified

Daftar file yang diubah.

## Email Flow

Jelaskan:

```text
Registration
→ Verification
→ Resend
→ Customer
```

dan:

```text
Forgot Password
→ Resend
→ Customer
```

## Environment Variables

Tampilkan variable yang dibutuhkan tanpa nilai secret.

## Tests

Tampilkan test yang dibuat.

## Test Result

Tampilkan hasil test.

## Manual Test

Jelaskan apakah berhasil melakukan pengiriman email nyata atau belum.

## Known Issues

Jika ada.

## Next Step

Berikan rekomendasi tahap berikutnya.

---

# FINAL INSTRUCTION

Jangan hanya memberikan tutorial.

**Kerjakan implementasi langsung pada project yang sedang dibuka.**

Mulai dengan membaca:

```text
prompt_registration.md
```

Kemudian inspect project existing.

Setelah memahami architecture, implementasikan Resend sesuai requirement di file ini.

**Jangan membuat asumsi tentang versi Laravel, package, konfigurasi, atau struktur project sebelum melakukan inspection.**
