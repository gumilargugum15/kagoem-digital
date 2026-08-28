Baca dan jalankan seluruh instruksi yang terdapat di file:

`prompt_my_orders.md`

File tersebut adalah **SOURCE OF TRUTH** untuk implementasi fitur **My Orders / Order History dan Order Detail** pada Kagoem Digital.

## INSTRUKSI UTAMA

Jangan meminta saya menyalin isi `prompt_my_orders.md` ke chat.

Baca file tersebut secara lengkap, pahami requirement-nya, kemudian **kerjakan implementasinya langsung pada project yang sedang terbuka**.

Jangan hanya memberikan tutorial, contoh kode, atau rekomendasi.

---

# WORKFLOW

Ikuti workflow berikut:

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
MIGRATE jika diperlukan
 ↓
TEST
 ↓
FIX
 ↓
REVIEW
 ↓
REPORT
```

---

# 1. READ REQUIREMENT

Baca seluruh isi:

```text
prompt_my_orders.md
```

Pahami seluruh requirement yang terdapat di dalamnya.

Jangan melewati bagian:

* My Orders
* Order History
* Order Detail
* Order Status
* Payment Status
* Authorization
* Pagination
* Search
* Filter
* Customer ownership
* API
* Frontend
* Security
* Testing
* Acceptance Criteria

---

# 2. BACA REQUIREMENT SEBELUMNYA

Karena fitur My Orders merupakan lanjutan dari Checkout System, baca juga:

```text
prompt_registration.md
prompt_resend.md
prompt_checkout.md
```

Tujuannya untuk memahami:

```text
User
 ↓
Authentication
 ↓
Product
 ↓
Cart
 ↓
Checkout
 ↓
Order
 ↓
Payment
 ↓
My Orders
```

Jangan membuat ulang functionality yang sudah tersedia.

---

# 3. INSPECT PROJECT

Sebelum coding, inspect project existing.

Periksa minimal:

```text
Laravel version
PHP version
composer.json
Database
Models
Migrations
Controllers
Services
Repositories
Routes
API
Frontend
Authentication
User
Product
Cart
Cart Item
Order
Order Item
Payment
Mail
Notifications
Tests
```

Cari implementation existing untuk:

```text
Order
OrderItem
Payment
Checkout
User
Authentication
```

Jika sudah tersedia:

**gunakan dan kembangkan implementation existing.**

Jangan membuat duplicate:

```text
users
products
orders
order_items
payments
authentication
```

---

# 4. ANALYZE

Bandingkan:

```text
prompt_my_orders.md
        ↓
Existing Order System
        ↓
Required Changes
```

Identifikasi:

```text
Yang sudah tersedia
Yang perlu dimodifikasi
Yang perlu dibuat
Yang perlu di-test
```

Pastikan implementation tetap kompatibel dengan Checkout System sebelumnya.

---

# 5. PLAN

Buat implementation plan singkat berdasarkan hasil inspection.

Tentukan:

```text
Models
Controllers
Services
Routes
API
Frontend Pages
Frontend Components
Queries
Filters
Pagination
Authorization
Tests
```

Setelah plan selesai:

**langsung implementasikan tanpa menunggu approval.**

---

# 6. IMPLEMENT MY ORDERS

Implementasikan halaman:

```text
/orders
```

atau route sesuai convention project.

Customer dapat melihat:

```text
Order Number
Product
Total
Order Status
Payment Status
Order Date
Action
```

Contoh:

```text
Pesanan Saya

#KGO-20260828-000001
POS Kasir Basic
Rp5.000
Menunggu Pembayaran
28 Agustus 2026

[Detail]
```

---

# 7. ORDER DETAIL

Implementasikan:

```text
/orders/{orderNumber}
```

Customer dapat melihat:

```text
Order Number
Customer
Order Date
Products
Quantity
Unit Price
Subtotal
Discount
Tax
Total
Order Status
Payment Status
```

Contoh:

```text
Order #KGO-20260828-000001

POS Kasir Basic
Rp5.000 x 1

Subtotal
Rp5.000

Total
Rp5.000

Status Order
Menunggu Pembayaran

Status Payment
Menunggu Pembayaran
```

Gunakan data dari database.

Jangan menghitung ulang secara berbeda dari data order yang sudah tersimpan.

---

# 8. USER OWNERSHIP

Ini sangat penting.

Customer hanya boleh melihat order miliknya sendiri.

Contoh:

```text
Andi
 ↓
Order Andi ✓
```

Tetapi:

```text
Andi
 ↓
Order Budi ✗
```

Jangan hanya mengandalkan frontend.

Authorization harus dilakukan di backend.

Jika Andi mencoba:

```text
/orders/KGO-20260828-000002
```

dan order tersebut milik Budi:

```text
403 Forbidden
```

atau response yang sesuai architecture/security project.

Jangan membocorkan informasi order milik user lain.

---

# 9. ORDER STATUS

Gunakan status yang sudah dibuat pada Checkout System.

Minimal:

```text
PENDING
PAID
FAILED
CANCELLED
EXPIRED
```

Jangan membuat status baru tanpa alasan.

Mapping UI:

```text
PENDING
→ Menunggu Pembayaran

PAID
→ Pembayaran Berhasil

FAILED
→ Pembayaran Gagal

CANCELLED
→ Dibatalkan

EXPIRED
→ Kedaluwarsa
```

Jika project sudah memiliki mapping/status translation, gunakan existing implementation.

---

# 10. PAYMENT STATUS

Pisahkan:

```text
Order Status
```

dan:

```text
Payment Status
```

Contoh:

```text
Order Status:
PENDING

Payment Status:
PENDING
```

Nantinya setelah Midtrans:

```text
Payment Status:
PAID
```

dan order dapat berubah:

```text
Order Status:
PAID
```

**Jangan mengimplementasikan Midtrans pada task ini.**

---

# 11. SEARCH

Jika requirement dalam `prompt_my_orders.md` mencakup search, implementasikan search berdasarkan:

```text
Order Number
```

dan field lain yang memang diperlukan.

Contoh:

```text
Search:
KGO-20260828
```

Backend harus melakukan filtering.

Jangan mengambil seluruh order lalu melakukan filtering hanya di frontend.

---

# 12. FILTER

Jika requirement mencakup filter status:

```text
All
Pending
Paid
Failed
Cancelled
Expired
```

implementasikan server-side filtering jika menggunakan API/database query.

Pastikan filter hanya berlaku pada order milik user yang sedang login.

---

# 13. PAGINATION

Jika jumlah order banyak, gunakan pagination.

Contoh:

```text
1 2 3 4 5 Next
```

Jangan mengambil seluruh order user sekaligus jika jumlah data berpotensi besar.

Gunakan pagination Laravel/project existing.

---

# 14. SORTING

Default sorting:

```text
Order terbaru → Order terlama
```

Gunakan:

```text
created_at DESC
```

atau convention existing.

---

# 15. EMPTY STATE

Jika user belum mempunyai order:

```text
Anda belum memiliki pesanan.

[ Jelajahi Produk ]
```

Jangan menampilkan error.

---

# 16. LOADING STATE

Frontend harus menangani:

```text
Loading
Success
Empty
Error
```

Gunakan loading component existing jika tersedia.

Jangan membuat loading system duplicate.

---

# 17. ERROR HANDLING

Jika order tidak ditemukan:

```text
Order tidak ditemukan.
```

Jika user tidak memiliki akses:

```text
Anda tidak memiliki akses ke order ini.
```

Jangan menampilkan:

```text
SQL error
Stack trace
Database information
Internal exception
```

kepada customer.

---

# 18. API

Jika project menggunakan API, implementasikan endpoint sesuai convention existing.

Minimal konsep:

```http
GET /api/orders
GET /api/orders/{orderNumber}
```

List harus hanya mengembalikan order user authenticated.

Contoh:

```text
GET /api/orders
Authorization: Bearer <token>
```

Response berisi:

```text
order_number
status
payment_status
total
created_at
```

Detail:

```text
GET /api/orders/{orderNumber}
```

Response berisi:

```text
order
customer
items
pricing
status
payment
```

Ikuti format API existing.

Jangan membuat format response baru yang bertentangan dengan API project.

---

# 19. DATABASE QUERY

Pastikan query efficient.

Gunakan:

```text
eager loading
proper indexes
pagination
scoped queries
```

Hindari N+1 query.

Contoh:

```text
Order
 ├── User
 ├── OrderItems
 │    └── Product
 └── Payment
```

Gunakan relationship yang sesuai.

---

# 20. SECURITY

Periksa:

```text
Authentication
Authorization
Ownership
Mass Assignment
SQL Injection
IDOR
```

Fokus khusus pada **IDOR / Insecure Direct Object Reference**.

User tidak boleh mendapatkan order user lain hanya dengan mengubah:

```text
orderNumber
```

atau:

```text
order_id
```

pada URL/API request.

---

# 21. FRONTEND UX

Pastikan My Orders responsive:

```text
Desktop
Tablet
Mobile
```

Gunakan design system existing.

Jangan membuat UI yang berbeda jauh dari Kagoem Digital.

---

# 22. ACTION UNTUK PENDING ORDER

Jika order:

```text
PENDING
```

boleh tampilkan:

```text
[Bayar Sekarang]
```

**Tetapi jangan menghubungkannya ke Midtrans pada task ini.**

Jika belum ada payment gateway:

```text
[Bayar Sekarang]
```

dapat:

* belum aktif
* menampilkan "Payment Gateway belum tersedia"
* atau tidak ditampilkan

Ikuti requirement `prompt_my_orders.md`.

Jangan membuat fake payment.

---

# 23. EMAIL

Jangan membuat email system baru.

Gunakan email architecture existing:

```text
Mailtrap
```

untuk development.

Jika requirement mencakup order email, gunakan Mail/Mailable/Notification existing.

Jangan mengirim email payment successful karena Midtrans belum tersedia.

---

# 24. TESTING

Buat automated test.

Minimal:

### My Orders

```text
✓ Authenticated user dapat melihat order miliknya
✓ User tanpa order mendapatkan empty state
✓ Pagination berjalan
✓ Search berjalan jika required
✓ Filter berjalan jika required
✓ Order terbaru muncul terlebih dahulu
```

### Order Detail

```text
✓ User dapat melihat order sendiri
✓ User tidak dapat melihat order user lain
✓ Order tidak ditemukan ditangani
✓ Order items ditampilkan
✓ Total ditampilkan
✓ Payment status ditampilkan
```

### Security

```text
✓ IDOR prevented
✓ Unauthorized user rejected
✓ User A cannot access User B order
```

---

# 25. TEST DATA

Gunakan minimal dua user:

```text
User A:
Andi

User B:
Budi
```

Andi memiliki:

```text
KGO-000001
```

Budi memiliki:

```text
KGO-000002
```

Test:

```text
Andi → KGO-000001 ✓
Andi → KGO-000002 ✗
Budi → KGO-000002 ✓
Budi → KGO-000001 ✗
```

---

# 26. RUN TEST

Setelah implementasi:

```text
Run migration jika diperlukan
Run backend tests
Run frontend tests jika tersedia
Run lint
Run static analysis jika tersedia
Run frontend build
```

Jika ada error:

```text
IDENTIFY
 ↓
FIX
 ↓
TEST AGAIN
```

Ulangi sampai hasilnya stabil.

Jangan menyatakan berhasil sebelum benar-benar menjalankan test.

---

# 27. GIT SAFETY

Jangan menjalankan:

```bash
git reset --hard
git clean -fd
git checkout .
```

Jangan menghapus perubahan existing yang bukan bagian dari task.

Jangan commit atau push kecuali saya meminta secara eksplisit.

---

# 28. FINAL REVIEW

Pastikan:

```text
[ ] My Orders tersedia
[ ] Order Detail tersedia
[ ] User hanya melihat order sendiri
[ ] IDOR dicegah
[ ] Pagination tersedia jika required
[ ] Search tersedia jika required
[ ] Filter tersedia jika required
[ ] Sorting benar
[ ] Empty state tersedia
[ ] Loading state tersedia
[ ] Error handling tersedia
[ ] API tersedia jika project menggunakan API
[ ] Order status benar
[ ] Payment status benar
[ ] Tidak ada Midtrans implementation
[ ] Tidak ada fake payment
[ ] Automated test tersedia
[ ] Existing checkout tetap berjalan
[ ] Existing authentication tetap berjalan
[ ] Existing email tetap berjalan
```

---

# 29. FINAL REPORT

Setelah benar-benar selesai, berikan laporan:

```text
## 1. Requirement Summary

## 2. Existing Architecture Analysis

## 3. Implementation Summary

## 4. Database Changes

## 5. Files Created

## 6. Files Modified

## 7. Routes

## 8. API Endpoints

## 9. My Orders Flow

## 10. Order Detail Flow

## 11. Authorization & Security

## 12. Search / Filter / Pagination

## 13. Email Integration

## 14. Tests Created

## 15. Test Results

## 16. Build Results

## 17. Known Issues

## 18. Next Recommended Step
```

Jangan menampilkan credential, API key, password, token, atau secret.

---

# IMPORTANT

File:

```text
prompt_my_orders.md
```

adalah **SOURCE OF TRUTH**.

Jangan mengubah requirement berdasarkan asumsi pribadi.

Jika menemukan perbedaan dengan implementation existing, gunakan pendekatan yang paling aman dan tetap mengikuti requirement.

**Jangan berhenti pada analisis.**

Kerjakan implementation langsung pada project sampai selesai.

Mulai sekarang:

```text
READ prompt_my_orders.md
        ↓
READ related prompts
        ↓
INSPECT PROJECT
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
REVIEW
        ↓
REPORT
```

**Kerjakan langsung. Jangan hanya menjelaskan.**
