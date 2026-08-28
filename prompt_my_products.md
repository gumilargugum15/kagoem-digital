# Kagoem Digital — My Products / Produk Saya

Baca dan jalankan seluruh instruksi dalam file ini.

File ini adalah SOURCE OF TRUTH untuk implementasi fitur "My Products"
atau "Produk Saya" pada project Kagoem Digital.

==================================================
1. TUJUAN
==================================================

Implementasikan fitur:

MY PRODUCTS / PRODUK SAYA

Fitur ini memungkinkan customer melihat seluruh produk atau layanan
yang sudah berhasil mereka beli dan memiliki akses terhadapnya.

My Products BERBEDA dengan My Orders.

My Orders:
- Menampilkan histori transaksi/order.

My Products:
- Menampilkan produk/layanan yang sudah dimiliki customer.
- Menampilkan status akses.
- Menampilkan subscription.
- Menampilkan digital product.
- Menyediakan action sesuai jenis product.

Contoh:

Customer Andi membeli:

1. POS Cashier Basic
2. Laravel POS Source Code
3. Ebook Laravel

Maka semuanya harus muncul di:

Dashboard
→ Produk Saya


==================================================
2. BACA IMPLEMENTASI EXISTING
==================================================

Sebelum coding, inspect project secara menyeluruh.

Cari dan pahami implementation existing untuk:

- Authentication
- User
- Product
- Product Type
- Cart
- Checkout
- Order
- Order Item
- Payment
- Midtrans
- Midtrans Webhook / Notification
- My Orders
- Order Detail
- Subscription
- Digital Product
- Order Fulfillment

Baca file prompt sebelumnya jika tersedia:

- prompt_registration.md
- prompt_resend.md
- prompt_checkout.md
- prompt_myorders.md
- prompt_midtrans.md
- prompt_order_fulfillment.md

Jangan membuat duplicate implementation.

Gunakan architecture existing.


==================================================
3. PRODUCT TYPE SUDAH ADA
==================================================

Product Type SUDAH ADA.

JANGAN membuat ulang:

- product_type column
- product_type migration
- product_type enum
- duplicate product type logic

Inspect implementation existing dan gunakan value
product_type yang benar-benar digunakan project.


==================================================
4. ORDER FULFILLMENT SUDAH ADA
==================================================

Order Fulfillment merupakan sumber data untuk menentukan
customer memiliki product atau tidak.

Flow existing:

Customer
    ↓
Checkout
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
    ↓
Subscription / Digital Access


My Products harus membaca hasil fulfillment tersebut.

Jangan membuat logic baru yang hanya mengecek order
tanpa mempertimbangkan payment/fulfillment.


==================================================
5. KONSEP MY PRODUCTS
==================================================

My Products harus hanya menampilkan product yang memang
sudah dimiliki customer.

Contoh:

Andi membeli:

POS Cashier Basic
Payment = PAID
Subscription = ACTIVE

Maka:

POS Cashier Basic
Status = ACTIVE

Jika:

Ebook Laravel
Payment = PAID
Digital Access = ACTIVE

Maka:

Ebook Laravel
Status = OWNED / ACTIVE


==================================================
6. SUBSCRIPTION PRODUCT
==================================================

Untuk product_type subscription, tampilkan informasi:

- Product name
- Product image jika tersedia
- Product type
- Subscription status
- Started date
- Expiry date
- Action

Contoh UI:

POS Cashier Basic

Subscription

Status:
ACTIVE

Mulai:
28 August 2026

Berakhir:
28 September 2026

Action:

[ Buka Aplikasi ]

atau jika provisioning belum tersedia:

[ Detail ]

JANGAN membuat tombol "Buka Aplikasi" yang mengarah
ke URL yang belum tersedia.

Gunakan route/configuration existing jika memang sudah ada.


==================================================
7. DIGITAL PRODUCT
==================================================

Untuk product_type digital, tampilkan:

- Product name
- Product image jika tersedia
- Product type
- Access status
- Purchase date / granted date
- Download availability
- Action

Contoh:

Laravel POS Source Code

Digital Product

Status:
OWNED

[ Download ]

Ebook Laravel

Digital Product

Status:
OWNED

[ Download ]


==================================================
8. SUBSCRIPTION STATUS
==================================================

Gunakan status Subscription yang sudah dibuat
oleh Order Fulfillment.

Contoh:

ACTIVE
EXPIRED
CANCELLED

Jangan membuat status baru jika tidak diperlukan.

Visual status:

ACTIVE
→ Active

EXPIRED
→ Expired

CANCELLED
→ Cancelled


==================================================
9. EXPIRED SUBSCRIPTION
==================================================

Jika subscription:

status = expired

maka tetap boleh muncul di My Products
sebagai histori kepemilikan.

Contoh:

POS Cashier Basic

Subscription

Status:
EXPIRED

Expired:
28 September 2026

Action:

[ Renew ]

Jika fitur Renew belum tersedia:

[ Detail ]

Jangan membuat renewal implementation pada task ini.


==================================================
10. DIGITAL PRODUCT ACCESS
==================================================

Digital product yang sudah dibeli:

digital_product_access.status = active

harus muncul sebagai:

OWNED / ACTIVE

Customer harus dapat mengetahui bahwa
product tersebut sudah dimiliki.


==================================================
11. DOWNLOAD ACTION
==================================================

Untuk digital product:

[ Download ]

harus melakukan authorization di backend.

Flow:

Customer
    ↓
Klik Download
    ↓
Backend
    ↓
Check authenticated user
    ↓
Check Digital Product Access
    ↓
Access ACTIVE?
    ├── NO → 403
    └── YES
          ↓
Generate secure download
          ↓
Download file


JANGAN menggunakan public direct file URL.


==================================================
12. API
==================================================

Implementasikan endpoint My Products
mengikuti convention API existing.

Jika belum ada endpoint yang sesuai,
buat endpoint seperti:

GET /api/my-products

Tetapi sebelum membuat endpoint:

INSPECT existing routes.

Jika project sudah memiliki endpoint serupa,
gunakan/extend endpoint tersebut daripada membuat duplicate.


==================================================
13. API RESPONSE
==================================================

Response harus mudah digunakan frontend.

Contoh struktur:

{
    "subscriptions": [
        {
            "id": 1,
            "product": {
                "id": 10,
                "name": "POS Cashier Basic",
                "product_type": "subscription"
            },
            "status": "active",
            "started_at": "2026-08-28",
            "expires_at": "2026-09-28"
        }
    ],
    "digital_products": [
        {
            "id": 5,
            "product": {
                "id": 20,
                "name": "Laravel POS Source Code",
                "product_type": "digital"
            },
            "status": "active",
            "granted_at": "2026-08-28",
            "download_available": true
        }
    ]
}

CATATAN:

Jangan memaksakan response structure ini jika project
sudah memiliki API response convention sendiri.

Ikuti convention existing.


==================================================
14. AUTHORIZATION
==================================================

Customer hanya boleh melihat produk miliknya sendiri.

Contoh:

Andi memiliki:

POS Basic
Ebook Laravel

Budi tidak boleh melihat:

Andi → POS Basic
Andi → Ebook Laravel

API harus selalu menggunakan authenticated user.

JANGAN menerima:

user_id

dari frontend sebagai sumber utama untuk menentukan
customer yang sedang login.

Gunakan authenticated user dari backend.


==================================================
15. SECURITY
==================================================

Pastikan:

Customer A
    ↓
GET /api/my-products

hanya mendapatkan data Customer A.

Customer A tidak boleh:

- Melihat subscription Customer B
- Melihat digital access Customer B
- Download product yang dibeli Customer B
- Memanipulasi user_id untuk mengambil data user lain


==================================================
16. FRONTEND
==================================================

Jika project memiliki frontend Kagoem Digital,
buat halaman:

/my-products

atau route sesuai convention existing.

Tambahkan navigation:

Dashboard
Products
My Orders
My Products
Profile


==================================================
17. UI MY PRODUCTS
==================================================

Buat UI yang konsisten dengan design system existing.

Jangan membuat design system baru.

Halaman:

Produk Saya

Tampilkan section:

Subscription
----------------------------

[ POS Cashier Basic ]

Subscription
Status: Active
Expires: 28 September 2026

[ Buka Aplikasi ]


Digital Products
----------------------------

[ Laravel POS Source Code ]

Digital Product
Status: Owned

[ Download ]


[ Ebook Laravel ]

Digital Product
Status: Owned

[ Download ]


==================================================
18. EMPTY STATE
==================================================

Jika customer belum memiliki product:

Produk Saya

Anda belum memiliki produk.

[ Jelajahi Produk ]


Gunakan existing product/catalog route.


==================================================
19. LOADING STATE
==================================================

Implementasikan loading state ketika API sedang dipanggil.

Contoh:

Loading Produk...

Jangan menampilkan error sebagai empty state.


==================================================
20. ERROR STATE
==================================================

Jika API gagal:

Gagal memuat produk.

[ Coba Lagi ]


Jangan menganggap error API sebagai:

"No products found."


==================================================
21. RESPONSIVE
==================================================

My Products harus responsive:

Desktop
Tablet
Mobile

Gunakan existing UI framework/component system.


==================================================
22. PERFORMANCE
==================================================

Hindari N+1 query.

Gunakan eager loading jika diperlukan.

Pastikan API tidak melakukan query berulang
untuk setiap product.


==================================================
23. DUPLICATE PRODUCT
==================================================

Jika customer melakukan renewal subscription:

JANGAN membuat product card duplicate.

Contoh:

Andi memperpanjang:

POS Cashier Basic

My Products harus tetap menampilkan:

POS Cashier Basic

dengan subscription terbaru/aktif.

Bukan:

POS Cashier Basic
POS Cashier Basic
POS Cashier Basic


Gunakan architecture existing untuk menentukan
subscription yang aktif/current.


==================================================
24. MULTIPLE DIGITAL PURCHASE
==================================================

Jika digital product yang sama dibeli lebih dari sekali,
My Products tidak boleh menampilkan duplicate product
tanpa alasan bisnis yang jelas.

Customer cukup melihat:

Laravel POS Source Code
OWNED


==================================================
25. ORDER RELATION
==================================================

My Products bukan pengganti My Orders.

Tetap pertahankan:

My Orders
    ↓
Order History

My Products
    ↓
Owned Products / Active Services


==================================================
26. DATABASE
==================================================

Jangan membuat tabel baru jika existing
subscription atau digital_product_access
sudah dapat digunakan.

Inspect terlebih dahulu.

Gunakan:

subscriptions

dan/atau

digital_product_access

yang sudah dibuat pada task Order Fulfillment.


==================================================
27. TESTING BACKEND
==================================================

Buat test minimal:

TEST 1
Authenticated customer
→ dapat melihat product miliknya.

TEST 2
Customer A
→ tidak dapat melihat product Customer B.

TEST 3
Subscription ACTIVE
→ muncul di My Products.

TEST 4
Subscription EXPIRED
→ tetap dapat ditampilkan sebagai expired.

TEST 5
Digital Access ACTIVE
→ muncul di My Products.

TEST 6
Payment PENDING
→ product tidak muncul sebagai owned/active.

TEST 7
Payment FAILED
→ product tidak muncul sebagai owned/active.

TEST 8
Duplicate fulfillment
→ tidak membuat duplicate product.

TEST 9
Digital product yang belum dibeli
→ download denied.

TEST 10
Digital product yang sudah dibeli
→ download authorized.


==================================================
28. TESTING FRONTEND
==================================================

Jika frontend memiliki testing infrastructure,
buat test untuk:

- Loading
- Empty state
- Error state
- Subscription card
- Digital product card
- Download action
- Responsive behavior jika framework mendukung


==================================================
29. BACKWARD COMPATIBILITY
==================================================

Jangan merusak:

Registration
Checkout
My Orders
Order Detail
Midtrans
Payment
Order Fulfillment

Setelah implementasi pastikan existing flow tetap berjalan.


==================================================
30. GIT SAFETY
==================================================

Jangan menjalankan:

git reset --hard
git clean -fd
git checkout .

Jangan menghapus perubahan existing.

Jangan commit.

Jangan push.


==================================================
31. FINAL VALIDATION
==================================================

Validasi flow:

Customer
    ↓
Login
    ↓
Buy Product
    ↓
Checkout
    ↓
Midtrans
    ↓
Payment PAID
    ↓
Order Fulfillment
    ↓
Subscription / Digital Access
    ↓
My Products
    ↓
Customer melihat product


Untuk Subscription:

My Products
    ↓
POS Cashier
    ↓
Subscription ACTIVE
    ↓
Buka POS / Detail


Untuk Digital:

My Products
    ↓
Ebook / Source Code
    ↓
Download
    ↓
Authorization
    ↓
Secure Download


==================================================
32. FINAL REPORT
==================================================

Setelah selesai berikan laporan:

## Architecture Analysis

## Existing Implementation Analysis

## API Changes

## Backend Changes

## Frontend Changes

## Database Changes

## Authorization

## Download Security

## Files Created

## Files Modified

## Automated Tests

## Test Results

## Build Results

## Known Issues

## Recommended Next Task


==================================================
FINAL COMMAND
==================================================

Sekarang:

1. Baca file ini secara keseluruhan.
2. Inspect project existing.
3. Inspect Product Type.
4. Inspect Order Fulfillment.
5. Inspect Subscription.
6. Inspect Digital Product Access.
7. Inspect My Orders.
8. Inspect API routes.
9. Implement My Products.
10. Implement backend API jika belum tersedia.
11. Implement frontend page jika frontend tersedia.
12. Implement authorization.
13. Implement loading state.
14. Implement empty state.
15. Implement error state.
16. Implement download action untuk digital product jika infrastructure sudah tersedia.
17. Buat automated tests.
18. Jalankan tests.
19. Fix semua error.
20. Retest.
21. Review perubahan.
22. Pastikan tidak ada duplicate implementation.
23. Berikan final report.

JANGAN hanya memberikan rekomendasi atau contoh kode.

KERJAKAN LANGSUNG PADA PROJECT.