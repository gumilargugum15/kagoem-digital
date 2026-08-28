# Kagoem Digital — Order Fulfillment

Baca dan jalankan seluruh instruksi dalam file ini.

File ini adalah SOURCE OF TRUTH untuk implementasi Order Fulfillment
setelah pembayaran berhasil pada project Kagoem Digital.

==================================================
1. TUJUAN
==================================================

Product Type SUDAH ADA di project.

JANGAN membuat ulang:

- product_type
- migration product_type
- enum product_type
- field product_type baru

Gunakan implementation product_type yang sudah tersedia.

Task ini fokus pada proses setelah:

Order
  ↓
Payment
  ↓
Midtrans
  ↓
Payment PAID
  ↓
Order Fulfillment

Kagoem Digital saat ini mendukung minimal:

1. subscription
2. digital

Physical product adalah future feature dan belum perlu
diimplementasikan.

==================================================
2. INSPECT EXISTING PROJECT
==================================================

Sebelum coding, inspect implementation existing.

Cari dan pahami:

- Product
- product_type
- Cart
- Checkout
- Order
- OrderItem
- Payment
- Midtrans
- Midtrans webhook/notification
- My Orders
- Order Detail
- User
- Authentication

Baca prompt/dokumentasi sebelumnya jika tersedia:

- prompt_registration.md
- prompt_resend.md
- prompt_checkout.md
- prompt_myorders.md
- prompt_midtrans.md

Jangan membuat duplicate implementation.

Gunakan architecture existing.

==================================================
3. PRODUCT TYPE YANG SUDAH ADA
==================================================

Gunakan product_type existing.

Jangan mengubah nama/value product_type
tanpa alasan yang jelas.

Pertama-tama inspect nilai product_type yang sebenarnya
digunakan oleh project.

Contoh kemungkinan:

subscription
digital

Tetapi JANGAN berasumsi.

Gunakan value yang benar-benar ditemukan di project.

==================================================
4. CURRENT ORDER FLOW
==================================================

Pertahankan flow existing:

Customer
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
Midtrans
  ↓
Webhook
  ↓
Payment PAID

Tambahkan:

Payment PAID
  ↓
Order Fulfillment

==================================================
5. FULFILLMENT ARCHITECTURE
==================================================

Buat service/architecture yang bertanggung jawab
memproses fulfillment setelah Order berhasil dibayar.

Contoh konsep:

OrderFulfillmentService

Flow:

Payment PAID
    ↓
Fulfillment Service
    ↓
Get Order Items
    ↓
For each Order Item
    ↓
Check Product Type
    ├── subscription
    │       ↓
    │   Subscription Fulfillment
    │
    └── digital
            ↓
        Digital Product Fulfillment

Jangan menempatkan seluruh logic fulfillment
di Controller.

Gunakan Service/Domain layer yang sesuai
dengan architecture project existing.

==================================================
6. SUBSCRIPTION FULFILLMENT
==================================================

Jika Order Item memiliki product_type subscription:

Payment PAID
    ↓
Create Subscription
    ↓
ACTIVE

Inspect terlebih dahulu apakah table/model Subscription
sudah ada.

Jika BELUM ADA, buat migration dan model yang diperlukan.

Minimal informasi:

- user_id
- product_id
- order_id
- order_item_id
- status
- started_at
- expires_at

Status minimal:

pending
active
expired
cancelled

Namun jika project sudah memiliki status convention,
ikuti convention existing.

==================================================
7. SUBSCRIPTION DURATION
==================================================

JANGAN hardcode:

30 days

atau

1 month

sebelum mengetahui architecture Product/Plan yang sudah ada.

Inspect apakah product sudah memiliki:

- duration
- billing period
- subscription period
- plan
- interval
- period unit

Jika sudah ada, gunakan implementation tersebut.

Jika belum ada dan duration memang dibutuhkan,
buat architecture paling sederhana yang konsisten
dengan project.

Untuk contoh:

1 month

maka:

started_at = payment success date
expires_at = started_at + 1 month

==================================================
8. DIGITAL PRODUCT FULFILLMENT
==================================================

Jika product_type adalah digital:

Payment PAID
    ↓
Grant Digital Product Access

Inspect apakah project sudah memiliki
mechanism untuk digital product/file/download.

Jika belum ada, implementasikan:

digital_product_access

Minimal:

- id
- user_id
- product_id
- order_id
- order_item_id
- status
- granted_at
- expires_at
- download_count
- created_at
- updated_at

Default digital product:

status = active
expires_at = NULL

==================================================
9. DIGITAL DOWNLOAD
==================================================

Source code, ebook, UI template, dan file digital
tidak boleh diakses melalui public URL tanpa authorization.

Gunakan private storage jika architecture project
mendukung.

Flow:

User
  ↓
My Products / My Downloads
  ↓
Download
  ↓
Backend
  ↓
Check Digital Product Access
  ↓
Authorized?
  ├── NO → 403
  └── YES
       ↓
Generate secure temporary download
       ↓
Download

Jangan expose private file secara langsung.

==================================================
10. MIXED ORDER
==================================================

Pastikan satu order dapat memiliki beberapa
product type.

Contoh:

Order #KGO-000001

1. POS Cashier Basic
   product_type = subscription
   Rp5.000

2. Laravel Ebook
   product_type = digital
   Rp50.000

Total:

Rp55.000

Setelah payment berhasil:

Order PAID
   ↓
Fulfillment
   ├── Subscription ACTIVE
   └── Digital Access ACTIVE

Jangan membuat order terpisah.

==================================================
11. IDEMPOTENCY
==================================================

Ini WAJIB.

Midtrans dapat mengirim notification lebih dari sekali.

Contoh:

Notification 1
  ↓
Payment PAID
  ↓
Fulfillment

Notification 2
  ↓
Payment already PAID
  ↓
JANGAN membuat fulfillment duplicate

Jangan sampai:

1 payment
→ 2 subscription

atau:

1 payment
→ 2 digital access

Gunakan:

- unique constraint
- database transaction
- existing payment state
- business logic

sesuai architecture yang paling tepat.

==================================================
12. PAYMENT STATUS
==================================================

Fulfillment hanya boleh dijalankan setelah
payment benar-benar berhasil dan sudah diverifikasi
oleh backend.

JANGAN menggunakan:

- frontend callback
- redirect URL
- JavaScript callback
- query parameter

sebagai sumber kebenaran pembayaran.

Gunakan payment status yang berasal dari
backend/Midtrans notification yang sudah diverifikasi.

==================================================
13. TRANSACTION SAFETY
==================================================

Pastikan proses:

Payment PAID
  ↓
Order PAID
  ↓
Fulfillment

aman terhadap failure.

Jika memungkinkan, gunakan database transaction
untuk proses yang harus atomic.

Jangan membuat:

Payment = PAID

tetapi:

Subscription/Access tidak tercatat

tanpa mekanisme error handling yang jelas.

==================================================
14. MY PRODUCTS
==================================================

Setelah fulfillment berhasil, customer harus dapat
melihat produk yang dimilikinya.

Jika endpoint belum ada, buat:

GET /api/my-products

atau gunakan naming convention API existing.

Response minimal dapat memuat:

Subscription:

- product
- status
- started_at
- expires_at

Digital:

- product
- status
- granted_at
- download availability

Jangan membuat API yang duplicate jika endpoint
serupa sudah ada.

==================================================
15. ORDER DETAIL
==================================================

Order Detail harus tetap menunjukkan:

Order
Payment
Items
Status

Jika payment berhasil:

Payment:
PAID

Order:
PAID

Jika product subscription sudah dibuat:

Subscription:
ACTIVE

Jika digital:

Digital Access:
ACTIVE

Gunakan architecture existing.

==================================================
16. POS PROVISIONING
==================================================

JANGAN implementasikan full POS provisioning
pada task ini.

Untuk subscription POS, cukup buat fulfillment
yang menghasilkan Subscription ACTIVE.

Siapkan service/integration point yang nantinya
dapat digunakan untuk:

Subscription ACTIVE
    ↓
Provision POS
    ↓
Create/activate POS user
    ↓
Grant POS access

Jangan mengarang struktur database aplikasi POS.

==================================================
17. ADMIN
==================================================

Tidak perlu membuat Admin Subscription Management
yang kompleks pada task ini kecuali memang sudah
dibutuhkan oleh architecture existing.

Fokus task:

Payment
  ↓
Order
  ↓
Fulfillment
  ↓
Customer Access

==================================================
18. DATABASE
==================================================

Inspect database existing terlebih dahulu.

Jika Subscription belum ada:

buat migration subscriptions.

Jika Digital Access belum ada:

buat migration digital_product_access.

Jangan membuat migration product_type karena
product_type SUDAH ADA.

Jangan menghapus atau merusak data existing.

Tambahkan:

- foreign key
- index
- unique constraint

sesuai kebutuhan.

==================================================
19. TESTING
==================================================

Buat automated tests minimal:

TEST 1
Subscription product
Payment PAID
→ Subscription ACTIVE

TEST 2
Digital product
Payment PAID
→ Digital Access ACTIVE

TEST 3
Mixed order
Payment PAID
→ Subscription created
→ Digital Access created

TEST 4
Payment PENDING
→ No fulfillment

TEST 5
Payment FAILED
→ No fulfillment

TEST 6
Duplicate Midtrans notification
→ No duplicate subscription

TEST 7
Duplicate Midtrans notification
→ No duplicate digital access

TEST 8
User tidak memiliki digital product
→ Download denied / 403

TEST 9
User membeli digital product
→ Download authorized

TEST 10
Order memiliki multiple items
→ Semua item diproses sesuai product_type

==================================================
20. BACKWARD COMPATIBILITY
==================================================

Jangan merusak flow existing:

Registration
  ↓
Login
  ↓
Product
  ↓
Cart
  ↓
Checkout
  ↓
Order
  ↓
Midtrans
  ↓
Payment
  ↓
My Orders

Tambahkan fulfillment setelah payment berhasil.

==================================================
21. GIT SAFETY
==================================================

Jangan menjalankan:

git reset --hard
git clean -fd
git checkout .

Jangan menghapus perubahan existing.

Jangan commit.

Jangan push.

==================================================
22. TESTING MANUAL
==================================================

Setelah automated test berhasil,
lakukan manual test jika environment memungkinkan.

Scenario:

1. Login sebagai customer
2. Pilih product subscription
3. Checkout
4. Bayar menggunakan Midtrans Sandbox
5. Pastikan payment menjadi PAID
6. Pastikan subscription menjadi ACTIVE

Kemudian:

1. Pilih digital product
2. Checkout
3. Bayar menggunakan Midtrans Sandbox
4. Pastikan payment menjadi PAID
5. Pastikan digital access menjadi ACTIVE
6. Test download

Kemudian:

1. Buat mixed order
2. Bayar
3. Pastikan kedua fulfillment berhasil.

==================================================
23. FINAL REVIEW
==================================================

Pastikan architecture:

Product
   ↓
Product Type (EXISTING)
   ↓
Cart
   ↓
Order
   ↓
Payment
   ↓
Midtrans
   ↓
Payment PAID
   ↓
Order Fulfillment
   ├── subscription
   │      ↓
   │   Subscription ACTIVE
   │
   └── digital
          ↓
      Digital Access ACTIVE

==================================================
24. FINAL REPORT
==================================================

Setelah selesai, berikan:

## Architecture Analysis

## Existing Product Type Analysis

## Fulfillment Architecture

## Subscription Fulfillment

## Digital Product Fulfillment

## Download Security

## Idempotency

## Database Changes

## API Changes

## Files Created

## Files Modified

## Automated Tests

## Test Results

## Manual Test Results

## Known Issues

## Future POS Provisioning

## Recommended Next Task

==================================================
FINAL COMMAND
==================================================

Sekarang:

1. Inspect project existing.
2. Temukan implementation product_type yang SUDAH ADA.
3. Jangan membuat ulang product_type.
4. Inspect Order, OrderItem, Payment, dan Midtrans.
5. Implement Order Fulfillment.
6. Implement Subscription Fulfillment.
7. Implement Digital Product Fulfillment.
8. Implement secure Digital Download Access jika belum ada.
9. Implement idempotency.
10. Buat migration hanya jika benar-benar diperlukan.
11. Buat automated tests.
12. Jalankan tests.
13. Fix errors.
14. Retest.
15. Review seluruh perubahan.
16. Berikan final report.

JANGAN hanya memberikan contoh kode atau rekomendasi.

KERJAKAN LANGSUNG PADA PROJECT.