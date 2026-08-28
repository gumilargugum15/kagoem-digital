# TASK: Implementasi Payment Gateway Midtrans pada Kagoem Digital

Saya sedang mengembangkan website **Kagoem Digital**.

Sistem sebelumnya sudah memiliki:

```text
Registration
    ↓
Login
    ↓
Email Verification
    ↓
Product
    ↓
Cart
    ↓
Checkout
    ↓
Order
    ↓
Payment Pending
    ↓
My Orders
    ↓
Order Detail
```

Sekarang implementasikan:

# MIDTRANS PAYMENT GATEWAY

Gunakan **Midtrans Snap** sebagai payment gateway.

Tujuan utama:

```text
Customer
   ↓
My Orders
   ↓
Order Detail
   ↓
Bayar Sekarang
   ↓
Backend Kagoem
   ↓
Midtrans Snap
   ↓
Customer melakukan pembayaran
   ↓
Midtrans Notification / Webhook
   ↓
Kagoem Backend
   ↓
Verifikasi status pembayaran
   ↓
Update Payment
   ↓
Update Order
```

---

# 1. SOURCE OF TRUTH

Sebelum mulai implementasi, baca file:

```text
prompt_registration.md
prompt_resend.md
prompt_checkout.md
prompt_myorders.md
prompt_midtrans.md
```

Gunakan seluruh file tersebut sebagai context implementation.

Khususnya pahami:

* User
* Authentication
* Product
* Cart
* Checkout
* Order
* Order Item
* Payment
* My Orders
* Order Detail

**Jangan membuat ulang functionality yang sudah tersedia.**

---

# 2. INSPECT PROJECT

Sebelum coding, inspect project existing.

Periksa minimal:

```text
Laravel version
PHP version
composer.json
.env
.env.example
config
routes
Models
Migrations
Controllers
Services
Repositories
Requests
Resources
Frontend
Authentication
User
Product
Cart
Order
OrderItem
Payment
Mail
Queue
Tests
```

Cari implementation existing untuk:

```text
Order
Payment
Checkout
My Orders
Order Detail
```

Jika sudah ada:

**gunakan dan extend implementation tersebut.**

Jangan membuat duplicate:

```text
User
Order
OrderItem
Payment
Checkout
```

---

# 3. MIDTRANS ENVIRONMENT

Implementasikan Midtrans menggunakan **Sandbox environment terlebih dahulu**.

Jangan menggunakan production credential.

Tambahkan configuration melalui `.env`.

Gunakan environment variables:

```env
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
```

Sesuaikan naming dengan configuration convention project.

Tambahkan variable yang diperlukan ke:

```text
.env.example
```

Jangan pernah hardcode:

```text
Server Key
Client Key
API credential
Secret
```

di source code.

---

# 4. MIDTRANS SDK

Gunakan official/recommended Midtrans integration approach yang kompatibel dengan versi Laravel/PHP project.

Sebelum install dependency:

```text
inspect composer.json
inspect PHP version
inspect Laravel version
```

Pilih package/version yang compatible.

Jika menggunakan Composer package, jangan melakukan downgrade atau upgrade dependency existing secara sembarangan.

Setelah dependency ditambahkan:

```text
composer install/update
```

sesuai kebutuhan.

Pastikan tidak merusak dependency existing.

---

# 5. MIDTRANS CONFIG

Buat configuration terpusat.

Contoh konsep:

```text
config/midtrans.php
```

Configuration minimal:

```text
server_key
client_key
is_production
is_sanitized
is_3ds
```

Jangan membaca `.env` langsung dari banyak tempat.

Gunakan:

```php
config('midtrans.server_key')
```

atau architecture yang sesuai project.

---

# 6. PAYMENT ARCHITECTURE

Gunakan architecture:

```text
Order
   ↓
Payment
   ↓
Midtrans
```

Payment harus menjadi abstraction antara Order dan Midtrans.

Jangan membuat Order bergantung langsung ke implementation Midtrans di seluruh application.

Idealnya:

```text
Checkout
   ↓
Order
   ↓
Payment Service
   ↓
Midtrans Service
   ↓
Midtrans API
```

Jika project memiliki Service Layer, gunakan Service Layer.

---

# 7. PAYMENT TABLE

Inspect payment table yang sudah dibuat pada Checkout System.

Jangan membuat duplicate table jika sudah tersedia.

Pastikan payment memiliki informasi yang diperlukan untuk Midtrans.

Minimal konsep:

```text
id
order_id
provider
payment_method
transaction_id
provider_transaction_id
status
amount
currency
paid_at
raw_response
created_at
updated_at
```

Tidak harus persis seperti struktur di atas.

Sesuaikan dengan database existing.

Jika perlu migration tambahan, buat migration baru.

Jangan mengubah migration lama yang sudah pernah dijalankan di environment shared/production.

---

# 8. MIDTRANS TRANSACTION DATA

Ketika customer melakukan:

```text
Bayar Sekarang
```

backend harus membuat transaksi Midtrans berdasarkan order existing.

Gunakan:

```text
order_id
order_number
gross_amount
customer details
item details
```

Contoh:

```text
Order:
KGO-20260828-000001

Customer:
Andi
andi@gmail.com

Product:
POS Kasir Basic

Quantity:
1

Gross Amount:
5000
```

Pastikan:

```text
gross_amount == order.total
```

Backend harus menjadi sumber nilai transaksi.

**Jangan menerima `gross_amount` dari frontend.**

---

# 9. CREATE SNAP TRANSACTION

Buat service khusus, misalnya:

```text
MidtransService
```

atau sesuai architecture project.

Service bertanggung jawab:

```text
Create Snap Transaction
Get Transaction Status
Verify Transaction
```

Jangan menaruh seluruh logic Midtrans di Controller.

Flow:

```text
POST /payment
      ↓
Validate Order
      ↓
Check Ownership
      ↓
Check Order Status
      ↓
Check Existing Payment
      ↓
Create / Reuse Midtrans Transaction
      ↓
Get Snap Token
      ↓
Save Payment
      ↓
Return Snap Token
```

---

# 10. BAYAR SEKARANG

Pada halaman:

```text
/orders/{orderNumber}
```

jika order:

```text
PENDING
```

tampilkan:

```text
[ BAYAR SEKARANG ]
```

Jika order:

```text
PAID
```

jangan tampilkan tombol pembayaran.

Jika:

```text
CANCELLED
EXPIRED
```

jangan izinkan pembayaran baru kecuali business logic memang mengizinkan.

---

# 11. PAYMENT ENDPOINT

Buat endpoint sesuai architecture project.

Contoh:

```http
POST /api/orders/{orderNumber}/payment
```

atau route convention existing.

Backend harus:

1. Authenticate user.
2. Verify order ownership.
3. Verify order masih payable.
4. Verify total.
5. Check existing payment.
6. Create Midtrans transaction.
7. Save Snap Token / transaction data.
8. Return payment information.

Response minimal:

```json
{
    "success": true,
    "data": {
        "order_number": "KGO-20260828-000001",
        "snap_token": "..."
    }
}
```

Jangan mengembalikan:

```text
MIDTRANS_SERVER_KEY
```

atau credential lainnya.

---

# 12. FRONTEND MIDTRANS SNAP

Integrasikan Midtrans Snap JS menggunakan:

```text
MIDTRANS_CLIENT_KEY
```

Frontend hanya boleh menggunakan:

```text
Client Key
```

**Jangan pernah expose Server Key ke frontend.**

Load Snap JS sesuai environment:

```text
Sandbox → Sandbox Snap JS
Production → Production Snap JS
```

Gunakan configuration environment.

---

# 13. SNAP FLOW

Expected:

```text
Order Detail
     ↓
[ Bayar Sekarang ]
     ↓
Frontend request backend
     ↓
Backend create Snap transaction
     ↓
Backend returns Snap Token
     ↓
Frontend calls Midtrans Snap
     ↓
Payment UI appears
```

Gunakan Snap token yang diberikan backend.

Jangan membuat token sendiri.

---

# 14. SNAP CALLBACK

Handle callback frontend seperti:

```text
onSuccess
onPending
onError
onClose
```

Tetapi pahami:

**Frontend callback BUKAN sumber kebenaran final payment.**

Callback hanya digunakan untuk UX.

Contoh:

```text
onSuccess
   ↓
Refresh Order
   ↓
Backend cek status
```

Jangan langsung melakukan:

```text
onSuccess
   ↓
Order = PAID
```

tanpa verifikasi backend.

---

# 15. PAYMENT PENDING

Saat Snap transaction dibuat:

```text
Payment Status:
PENDING
```

Order tetap:

```text
Order Status:
PENDING
```

Customer dapat kembali ke:

```text
Order Detail
```

dan melihat:

```text
Menunggu Pembayaran
```

---

# 16. MIDTRANS WEBHOOK / NOTIFICATION

Buat endpoint notification:

```text
POST /api/payment/midtrans/notification
```

atau route yang sesuai architecture project.

Endpoint ini harus dapat menerima notification dari Midtrans.

Flow:

```text
Midtrans
   ↓
Notification
   ↓
Kagoem Backend
   ↓
Validate Notification
   ↓
Verify Signature
   ↓
Get Transaction Status
   ↓
Update Payment
   ↓
Update Order
```

---

# 17. WEBHOOK SECURITY

**Jangan mempercayai notification hanya berdasarkan request body.**

Lakukan verifikasi.

Gunakan:

```text
signature_key
```

atau mekanisme verifikasi yang direkomendasikan Midtrans.

Jika memungkinkan, lakukan server-side status verification menggunakan Midtrans API.

Jangan:

```text
POST webhook
 ↓
status=settlement
 ↓
langsung PAID
```

tanpa validasi.

---

# 18. TRANSACTION STATUS MAPPING

Buat mapping Midtrans → Kagoem.

Contoh:

```text
Midtrans settlement
        ↓
Payment PAID
        ↓
Order PAID
```

```text
Midtrans capture
        ↓
Payment PAID
        ↓
Order PAID
```

```text
Midtrans pending
        ↓
Payment PENDING
        ↓
Order PENDING
```

```text
Midtrans expire
        ↓
Payment EXPIRED
        ↓
Order EXPIRED
```

```text
Midtrans cancel
        ↓
Payment CANCELLED
        ↓
Order CANCELLED
```

```text
Midtrans deny
        ↓
Payment FAILED
        ↓
Order FAILED
```

Sesuaikan mapping dengan payment architecture existing dan dokumentasi Midtrans terbaru.

---

# 19. ORDER STATUS VS PAYMENT STATUS

Jangan mencampur:

```text
Order Status
```

dan:

```text
Payment Status
```

Contoh:

```text
Payment:
PAID

Order:
PAID
```

Tetapi status payment harus berasal dari payment processing.

---

# 20. IDEMPOTENCY

Webhook bisa dikirim lebih dari sekali.

Pastikan notification yang sama tidak menyebabkan:

```text
duplicate payment
duplicate order update
duplicate fulfillment
duplicate email
```

Implementasikan idempotent processing.

Contoh:

```text
Midtrans notification
        ↓
Check transaction_id
        ↓
Already processed?
   ├── YES → return success
   └── NO  → process
```

Gunakan database transaction jika diperlukan.

---

# 21. DATABASE TRANSACTION

Saat processing webhook:

```text
BEGIN
 ↓
Find Payment
 ↓
Validate notification
 ↓
Update Payment
 ↓
Update Order
 ↓
COMMIT
```

Jika gagal:

```text
ROLLBACK
```

Pastikan tidak terjadi kondisi:

```text
Payment = PAID
Order = PENDING
```

tanpa alasan yang valid.

---

# 22. AMOUNT VALIDATION

Pastikan amount dari Midtrans sesuai dengan amount order.

Contoh:

```text
Order Total:
5000
```

Notification:

```text
gross_amount:
5000
```

Valid.

Jika:

```text
Order Total:
5000

Midtrans:
10000
```

jangan langsung mengubah menjadi PAID.

Tandai sebagai invalid dan log untuk investigation.

---

# 23. TRANSACTION ID

Simpan identifier dari Midtrans.

Minimal konsep:

```text
order_number
transaction_id
provider
```

Pastikan dapat digunakan untuk:

```text
Get transaction status
Debug
Audit
Reconciliation
```

---

# 24. GET PAYMENT STATUS

Buat service/backend capability untuk mendapatkan status transaksi Midtrans.

Contoh:

```text
Order Detail
     ↓
Backend
     ↓
Payment Record
     ↓
Midtrans Get Status
```

Jangan memanggil Midtrans setiap kali halaman order dibuka jika tidak diperlukan.

Gunakan database payment status sebagai primary application state setelah webhook diproses.

---

# 25. PAYMENT RETRY

Jika payment:

```text
EXPIRED
```

atau:

```text
FAILED
```

tentukan behavior sesuai requirement.

Jika retry diperbolehkan:

```text
Order
 ↓
Bayar Lagi
 ↓
Create new Midtrans transaction
 ↓
New transaction_id
```

Jangan overwrite transaction history secara sembarangan.

Jika requirement belum mendukung retry:

```text
Bayar Lagi
```

tidak perlu dibuat.

---

# 26. PAYMENT HISTORY

Jangan menghapus payment record lama ketika customer melakukan retry.

Contoh:

```text
Order
 ├── Payment #1 → EXPIRED
 └── Payment #2 → PAID
```

Jika architecture existing mendukung multiple payment attempts, gunakan model tersebut.

Jika belum, implementasikan dengan cara yang aman dan jelaskan perubahan architecture.

---

# 27. ORDER DETAIL UPDATE

Setelah payment berhasil:

```text
Order Detail
```

harus menampilkan:

```text
Payment Status:
Pembayaran Berhasil

Order Status:
PAID
```

Jika customer kembali dari Snap:

```text
Frontend
 ↓
Refresh Order
 ↓
Backend
 ↓
Display current status
```

Jangan hanya bergantung pada callback frontend.

---

# 28. MY ORDERS UPDATE

Pada:

```text
/orders
```

status harus otomatis terlihat:

```text
POS Kasir Basic
Rp5.000

Pembayaran Berhasil
```

setelah backend menerima notification dan memproses payment.

---

# 29. EMAIL PAYMENT SUCCESS

Setelah payment benar-benar terverifikasi:

```text
Payment = PAID
```

boleh kirim email:

```text
Payment Successful
```

Gunakan email system existing.

Development:

```text
Mailtrap
```

Pastikan email tidak dikirim berkali-kali akibat duplicate webhook.

Contoh:

```text
Payment PAID
     ↓
Check payment_success_email_sent
     ↓
Not sent → send
Already sent → skip
```

Jika project sudah memiliki notification/event system, gunakan architecture tersebut.

---

# 30. PAYMENT EVENTS

Jika project menggunakan event architecture, pertimbangkan:

```text
PaymentPaid
```

Flow:

```text
Midtrans Webhook
      ↓
PaymentPaid
      ↓
Order Update
      ↓
Email
      ↓
Fulfillment
```

Jangan membuat event architecture baru jika project belum membutuhkannya.

Gunakan pattern existing.

---

# 31. LOGGING

Tambahkan logging yang cukup untuk debugging.

Log informasi seperti:

```text
order_number
payment_id
midtrans_transaction_id
transaction_status
fraud_status
```

Jangan log:

```text
server_key
client_secret
password
token sensitif
```

Gunakan log level yang sesuai.

Jangan menyimpan credential di log.

---

# 32. WEBHOOK RESPONSE

Endpoint notification harus memberikan response yang sesuai sehingga Midtrans mengetahui notification berhasil diproses.

Pastikan error handling benar.

Jika notification valid dan berhasil diproses:

```text
HTTP 200
```

Jika invalid:

gunakan response/error handling sesuai best practice dan framework.

Jangan selalu mengembalikan HTTP 200 untuk semua kondisi jika hal tersebut menyebabkan notification failure tidak dapat dideteksi.

---

# 33. WEBHOOK PUBLIC ACCESS

Endpoint webhook harus dapat diakses oleh Midtrans.

Development lokal:

```text
Internet
   ↓
Tunnel
   ↓
localhost Kagoem
```

Contoh tool:

```text
ngrok
```

Jangan memasukkan URL localhost sebagai production notification URL.

Dokumentasikan cara menjalankan local webhook testing.

---

# 34. SANDBOX TESTING

Gunakan Midtrans Sandbox.

Jangan menggunakan real payment.

Test minimal:

```text
Pending
Success / Settlement
Failed / Deny
Cancel
Expire
```

Gunakan test payment method yang tersedia di Midtrans Sandbox.

Jangan menggunakan kartu atau rekening asli.

---

# 35. TEST SCENARIO

Scenario:

```text
User:
Andi

Product:
POS Kasir Basic

Price:
Rp5.000

Order:
KGO-20260828-000001
```

Flow:

```text
Andi Login
 ↓
My Orders
 ↓
Order Detail
 ↓
Bayar Sekarang
 ↓
Midtrans Snap
 ↓
Sandbox Payment
 ↓
Midtrans Notification
 ↓
Kagoem Webhook
 ↓
Verify
 ↓
Payment PAID
 ↓
Order PAID
```

Expected:

```text
Payment.status = PAID
Order.status = PAID
```

---

# 36. AUTOMATED TESTING

Buat test untuk:

### Create Payment

```text
✓ Authenticated user can pay own order
✓ User cannot pay another user's order
✓ Pending order can create payment
✓ Paid order cannot create duplicate payment
✓ Cancelled order cannot be paid
✓ Expired order behavior is correct
✓ Amount comes from backend
✓ Snap token is returned
```

### Webhook

```text
✓ Valid notification processed
✓ Invalid signature rejected
✓ Invalid amount rejected
✓ Unknown order handled
✓ Unknown transaction handled
✓ Settlement updates payment
✓ Settlement updates order
✓ Pending keeps order pending
✓ Expire updates payment
✓ Cancel updates payment
✓ Duplicate webhook is idempotent
```

### Security

```text
✓ Server Key never exposed
✓ Client only receives Client Key/Snap Token
✓ User ownership enforced
✓ IDOR prevented
```

---

# 37. MOCK MIDTRANS

Automated tests **jangan bergantung pada real Midtrans Sandbox API**.

Gunakan mock/fake HTTP response untuk:

```text
Create Transaction
Get Transaction Status
```

Integration/manual tests boleh menggunakan Sandbox.

---

# 38. FRONTEND TESTING

Pastikan:

```text
Bayar Sekarang
```

mengalami state:

```text
Loading
Success
Error
Closed
Pending
```

Jangan membuat user dapat klik berkali-kali saat request sedang berjalan.

---

# 39. ERROR HANDLING

Jika Midtrans API error:

Tampilkan:

```text
Pembayaran belum dapat diproses.
Silakan coba lagi.
```

Jangan tampilkan:

```text
Server Key
Raw API response
Stack trace
Internal exception
```

Log detail hanya di backend.

---

# 40. NO FAKE PAYMENT

**DILARANG** membuat:

```text
[Bayar]
 ↓
Order = PAID
```

tanpa transaksi Midtrans dan validasi.

Payment hanya dapat dianggap berhasil setelah status diverifikasi.

---

# 41. PRODUCTION READINESS

Walaupun development menggunakan Sandbox, architecture harus siap untuk:

```text
SANDBOX
MIDTRANS_IS_PRODUCTION=false
```

dan:

```text
PRODUCTION
MIDTRANS_IS_PRODUCTION=true
```

Tanpa perubahan source code.

Cukup mengganti environment configuration dan credentials.

---

# 42. SECURITY CHECKLIST

Pastikan:

```text
[ ] Server Key hanya di backend
[ ] Client Key hanya di frontend
[ ] Credentials dari .env
[ ] .env tidak di-commit
[ ] Webhook signature diverifikasi
[ ] Amount diverifikasi
[ ] Order ownership diverifikasi
[ ] Transaction ID diverifikasi
[ ] Duplicate webhook ditangani
[ ] Payment status tidak dipercaya dari frontend
[ ] Order status tidak dipercaya dari frontend
[ ] Sensitive data tidak masuk log
```

---

# 43. GIT SAFETY

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

kecuali saya meminta secara eksplisit.

---

# 44. FINAL ACCEPTANCE CRITERIA

Implementation dianggap berhasil jika:

```text
Customer
   ↓
My Orders
   ↓
Order Detail
   ↓
Bayar Sekarang
   ↓
Backend
   ↓
Midtrans Snap
   ↓
Sandbox Payment
   ↓
Midtrans Notification
   ↓
Webhook Kagoem
   ↓
Verify Notification
   ↓
Update Payment
   ↓
Update Order
```

berhasil dijalankan.

Expected:

```text
Payment:
PAID

Order:
PAID
```

dan status tersebut terlihat pada:

```text
My Orders
Order Detail
```

---

# 45. FINAL REVIEW

Sebelum menyatakan task selesai:

```text
[ ] prompt_midtrans.md dibaca seluruhnya
[ ] Existing Checkout dianalisis
[ ] Existing Payment dianalisis
[ ] Midtrans configuration dibuat
[ ] Sandbox digunakan
[ ] Credentials menggunakan .env
[ ] Midtrans Service dibuat
[ ] Create Snap Transaction berjalan
[ ] Snap Token diterima
[ ] Snap JS terintegrasi
[ ] Bayar Sekarang tersedia
[ ] Webhook tersedia
[ ] Signature diverifikasi
[ ] Amount diverifikasi
[ ] Transaction status diverifikasi
[ ] Payment status diperbarui
[ ] Order status diperbarui
[ ] Idempotency diterapkan
[ ] Duplicate webhook aman
[ ] Email payment success aman dari duplicate
[ ] My Orders menampilkan status terbaru
[ ] Order Detail menampilkan status terbaru
[ ] Automated tests tersedia
[ ] Tests berhasil
[ ] Build berhasil
[ ] Tidak ada secret hardcoded
[ ] Tidak ada Server Key di frontend
[ ] Existing functionality tidak rusak
```

---

# 46. FINAL REPORT

Setelah implementation selesai, berikan laporan:

```text
## 1. Requirement Summary

## 2. Existing Architecture Analysis

## 3. Midtrans Architecture

## 4. Database Changes

## 5. Environment Variables

## 6. Composer Dependencies

## 7. Files Created

## 8. Files Modified

## 9. API Endpoints

## 10. Payment Flow

## 11. Snap Integration

## 12. Webhook Flow

## 13. Payment Status Mapping

## 14. Order Status Mapping

## 15. Security

## 16. Idempotency

## 17. Email Integration

## 18. Automated Tests

## 19. Test Results

## 20. Build Results

## 21. Manual Sandbox Testing

## 22. Known Issues

## 23. Environment Setup Required

## 24. Next Recommended Step
```

Jangan tampilkan:

```text
Server Key
Password
API Secret
Access Token
Credential
```

---

# IMPORTANT

Jangan mengimplementasikan fitur di luar scope:

```text
Subscription Recurring Billing
Auto Debit
Subscription Renewal
POS Account Provisioning
License Generation
Product Download
Refund Management
Settlement Reconciliation
```

Fitur tersebut akan dibuat pada tahap berikutnya.

Fokus task ini:

```text
ORDER
  ↓
PAYMENT
  ↓
MIDTRANS SNAP
  ↓
WEBHOOK
  ↓
PAYMENT STATUS
  ↓
ORDER STATUS
```

---

# FINAL COMMAND

Setelah membaca file ini, **jangan hanya menjelaskan apa yang harus dilakukan**.

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
