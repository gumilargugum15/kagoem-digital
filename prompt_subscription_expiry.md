# Kagoem Digital — Subscription Expiry Automation

Baca dan jalankan seluruh instruksi dalam file ini.

File ini adalah SOURCE OF TRUTH untuk implementasi automation masa
berlaku subscription pada project Kagoem Digital.

==================================================
1. SOURCE OF TRUTH
==================================================

Sebelum mulai implementasi, baca dan pahami file berikut:

```text
prompt_order_fulfillment.md
prompt_midtrans.md
prompt_checkout.md   (jika tersedia)
prompt_myorders.md   (jika tersedia)
```

Khususnya pahami:

- Order
- OrderItem
- OrderFulfillmentService
- Subscription
- SubscriptionStatus
- OrderStatus
- Payment
- product_type
- billing_interval

**Jangan membuat ulang functionality yang sudah tersedia.**

Gunakan architecture existing.

==================================================
2. INSPECT PROJECT
==================================================

Sebelum coding, inspect implementation existing.

Periksa minimal:

```text
backend/app/Enums/SubscriptionStatus.php
backend/app/Models/Subscription.php
backend/app/Services/OrderFulfillmentService.php
backend/app/Enums/DigitalAccessStatus.php
backend/app/Models/DigitalProductAccess.php
routes/console.php
bootstrap/app.php  (atau app/Console/Kernel.php sesuai versi Laravel)
```

Perhatikan versi Laravel yang digunakan.

Di Laravel versi baru, scheduled task didefinisikan di:
`routes/console.php` + `Schedule::command(...)->daily()`

Di Laravel versi lama, scheduled task didefinisikan di:
`app/Console/Kernel.php` method `schedule()`

Sesuaikan dengan versi project.

==================================================
3. TUJUAN
==================================================

Saat ini belum ada proses yang mengubah:

```text
Subscription.status  = active
↓ (expires_at sudah terlewati)
Subscription.status  = expired
```

Akibatnya, customer berpotensi tetap memiliki status "active"
selamanya meskipun masa subscription-nya sudah berakhir.

Kita perlu membuat automation yang berjalan setiap hari:

```text
SETIAP HARI
    ↓
Pindai semua Subscription
    ↓
Filter: status = active  DAN  expires_at < now
    ↓
Ubah status menjadi expired
    ↓
Log proses
```

==================================================
4. SCOPE
==================================================

Fokus task ini HANYA pada:

```text
Subscription Expiry Automation
```

Tidak termasuk dalam scope:

- POS Provisioning / offboarding
- Recurring Billing
- Auto Debit
- Subscription Renewal
- Refund
- Cancellation flow manual
- Digital product access expiry (DigitalProductAccess.expires_at
  saat ini null dan permanen — JANGAN ubah)

Fitur tersebut akan dibuat pada tahap berikutnya.

==================================================
5. WHAT TO BUILD
==================================================

### 5.1 Console Command

Buat command Artisan, contoh:

```text
php artisan subscription:expire
```

Command ini bertanggung jawab menandai subscription yang
sudah lewat masa berlakunya.

Algoritma:

```text
BEGIN
  ↓
Query Subscription
  ↓
where status = active
  ↓
where expires_at < now
  ↓
(chunking untuk menghindari memory issue jika data besar)
  ↓
Untuk setiap subscription:
  ↓
ubah status menjadi expired
  ↓
jika ada expires_at null, SKIP (tidak boleh expired tanpa tanggal)
  ↓
Log per perubahan
  ↓
END
```

Catatan penting:

- GUNAKAN chunking (misal `->chunkById(...)`) untuk data besar.
- Jangan mengubah subscription yang `expires_at`-nya masih masa depan.
- Jangan menyentuh subscription berstatus pending/cancelled.
- Jangan mengubah digital product access.

### 5.2 Scheduler

Daftarkan command tersebut ke Laravel scheduler agar berjalan
otomatis setiap hari.

```text
Schedule::command('subscription:expire')->daily();
```

- Gunakan lokasi yang sesuai versi Laravel (routes/console.php
  atau Kernel).
- Jangan menambahkan job lain ke scheduler pada task ini
  di luar scope.

### 5.3 Idempotency & Safety

- Jika command dijalankan berulang kali, subscription yang
  sudah expired tidak boleh berubah status lagi (natural idempotent
  karena filter status = active).
- Pastikan tidak ada data yang corrupt.
- Pastikan perubahan status konsisten.
- Pastikan tidak ada race condition yang menyebabkan
  subscription aktif tetap lolos pengecekan.

==================================================
6. LOGGING
==================================================

Tambahkan logging yang cukup untuk debugging dan audit:

```text
subscription_id
user_id
product_id
expires_at
new status
```

Jangan log:

```text
credential
token
password
sensitive data
```

==================================================
7. ORDER STATUS
==================================================

Ketika subscription expired karena masa berlakunya habis,
Order yang menaunginya TIDAK otomatis berubah statusnya.

Order.status adalah state yang terpisah dari Subscription.status.

Jangan mencampur keduanya tanpa alasan yang jelas dan
tanpa dokumentasi.

==================================================
8. TESTS
==================================================

Buat automated test untuk command ini.

Minimal scenario:

```text
✓ Subscription active dengan expires_at masa depan
    → tetap active

✓ Subscription active dengan expires_at masa lalu
    → menjadi expired

✓ Subscription pending / cancelled
    → tidak berubah

✓ Subscription active tanpa expires_at (null)
    → tidak diubah (skip), tidak error

✓ Command idempotent (dijalankan dua kali)
    → hasil sama, tidak double-process

✓ Mixed data: hanya yang expired yang berubah
```

Gunakan pattern testing yang sudah ada di project
(lihat backend/tests yang sudah ada).

==================================================
9. MANUAL TESTING
==================================================

Sediakan cara menjalankan command secara manual:

```bash
php artisan subscription:expire
```

dan:

```bash
php artisan schedule:list
```

untuk memverifikasi scheduler terdaftar.

Buat data uji (seeder atau factory atau Tinker) dengan
subscription yang expires_at-nya sudah lewat untuk
memverifikasi command bekerja.

==================================================
10. GIT SAFETY
==================================================

Jangan menjalankan:

```bash
git reset --hard
git clean -fd
git checkout .
```

Jangan menghapus perubahan existing.

Jangan melakukan:

```bash
git commit
git push
```

kecuali diminta secara eksplisit.

==================================================
11. FINAL REVIEW
==================================================

Sebelum menyatakan task selesai:

```text
[ ] prompt_subscription_expiry.md dibaca seluruhnya
[ ] Existing Subscription dianalisis
[ ] Versi Laravel dikonfirmasi
[ ] Lokasi scheduler benar untuk versi Laravel
[ ] Console command dibuat
[ ] Command hanya menandai subscription yang benar-benar expired
[ ] Chunking digunakan
[ ] expires_at null ditangani (skip, tidak error)
[ ] Scheduler didaftarkan (daily)
[ ] Order status tidak berubah oleh task ini
[ ] Logging ditambahkan
[ ] Automated tests tersedia
[ ] Tests berhasil
[ ] Build berhasil
[ ] Existing functionality tidak rusak
[ ] Tidak ada secret hardcoded
[ ] Tidak ada perubahan di luar scope
```

==================================================
12. FINAL REPORT
==================================================

Setelah implementation selesai, berikan laporan:

```text
## 1. Requirement Summary
## 2. Existing Architecture Analysis
## 3. Implementation
## 4. Console Command
## 5. Scheduler
## 6. Database Changes (jika ada)
## 7. Files Created
## 8. Files Modified
## 9. Tests
## 10. Test Results
## 11. Build Results
## 12. Manual Testing
## 13. Known Issues
## 14. Next Recommended Step (POS Provisioning)
```

Jangan tampilkan:

```text
Server Key
Password
API Secret
Access Token
Credential
```

==================================================
13. IMPORTANT
==================================================

Jangan mengimplementasikan fitur di luar scope task ini.

Task ini fokus pada:

```text
SUBSCRIPTION EXPIRY AUTOMATION
```

Hanya itu.

---

# FINAL COMMAND

Setelah membaca file ini, JANGAN hanya menjelaskan apa yang
harus dilakukan.

Kerjakan implementasinya langsung pada project.

Gunakan workflow:

```text
READ
 ↓
INSPECT
 ↓
ANALYZE
 ↓
PLAN
 ↓
IMPLEMENT
 ↓
TEST
 ↓
FIX
 ↓
RETEST
 ↓
REVIEW
 ↓
REPORT
```

Jika menemukan error:

```text
IDENTIFY
 ↓
FIX
 ↓
TEST AGAIN
```

Ulangi sampai implementation stabil.

**Jangan berhenti pada tahap analisis.**
