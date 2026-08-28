# TASK: Implementasi Checkout System Kagoem Digital

Saya sedang mengembangkan website **Kagoem Digital**.

Sebelumnya sudah dibuat:

* Account / Registration
* Login
* Logout
* Email Verification
* Forgot Password
* Reset Password
* User Profile
* Transactional Email
* Mailtrap untuk testing email

Sekarang lanjutkan ke tahap berikutnya:

# CHECKOUT SYSTEM

Kagoem Digital nantinya menjual beberapa jenis produk:

1. SaaS / Subscription

   * Contoh: POS Kasir Rp5.000/bulan
2. Source Code
3. Ebook
4. UI Template
5. Produk digital lainnya

Untuk task ini, fokus pada **Product → Cart → Checkout → Order → Payment Pending**.

**Jangan implementasikan Midtrans/payment gateway terlebih dahulu.**

Checkout harus dibuat dengan architecture yang nantinya mudah diintegrasikan dengan Midtrans.

---

# 1. SOURCE OF TRUTH

Sebelum mulai:

1. Baca:

   * `prompt_registration.md`
   * `prompt_resend.md`
2. Pahami implementation yang sudah dibuat.
3. Inspect project existing.
4. Jangan membuat duplicate:

   * users
   * authentication
   * email system
   * layout
   * UI components
5. Ikuti architecture dan coding convention existing.

File ini menjadi source of truth untuk fitur checkout.

---

# 2. FLOW CHECKOUT

Implementasikan flow:

```text
User Login
   ↓
Product Catalog
   ↓
Product Detail
   ↓
Add to Cart
   ↓
Cart
   ↓
Checkout
   ↓
Create Order
   ↓
Payment Pending
```

Belum ada payment gateway pada tahap ini.

---

# 3. PRODUCT

Periksa apakah project sudah memiliki tabel/model Product.

Jika sudah:

* gunakan existing Product
* jangan membuat duplicate Product

Jika belum tersedia, buat struktur product yang sesuai architecture.

Product minimal memiliki konsep:

```text
id
name
slug
description
type
price
status
created_at
updated_at
```

Product type:

```text
SAAS
SOURCE_CODE
EBOOK
UI_TEMPLATE
```

Gunakan enum/constants sesuai coding convention project.

---

# 4. PRODUCT DETAIL

Buat halaman:

```text
/products/{slug}
```

Contoh:

```text
POS Kasir Basic

Aplikasi kasir untuk bisnis retail.

Rp5.000 / bulan

Jenis:
SaaS

[ BELI SEKARANG ]
[ TAMBAH KE KERANJANG ]
```

Untuk produk SaaS tampilkan:

```text
Rp5.000 / bulan
```

Untuk digital product:

```text
Rp50.000
```

Jangan mengasumsikan semua product adalah subscription.

---

# 5. CART

Buat cart system.

Flow:

```text
Product
   ↓
Add to Cart
   ↓
Cart
```

Halaman:

```text
/cart
```

Contoh:

```text
Keranjang

POS Kasir Basic
Rp5.000 / bulan
Qty: 1

Subtotal
Rp5.000

[ CHECKOUT ]
```

Cart harus terhubung dengan authenticated user.

---

# 6. GUEST USER

Tentukan behavior berdasarkan architecture project.

Jika user belum login dan mencoba:

```text
Add to Cart
```

atau:

```text
Checkout
```

arahkankan ke:

```text
/login
```

Setelah login, sebisa mungkin user dikembalikan ke proses sebelumnya.

Contoh:

```text
Product
 ↓
Checkout
 ↓
Login
 ↓
Checkout
```

---

# 7. CART DATABASE

Gunakan database untuk cart jika architecture project memungkinkan.

Struktur konseptual:

```text
carts

id
user_id
status
created_at
updated_at
```

dan:

```text
cart_items

id
cart_id
product_id
quantity
unit_price
subtotal
created_at
updated_at
```

Sesuaikan dengan architecture project.

Jika project lebih cocok menggunakan session cart, jelaskan alasan teknis sebelum memilih.

Untuk Kagoem yang akan memiliki account dan order, prefer database cart untuk authenticated user.

---

# 8. PRICE SNAPSHOT

PENTING.

Jangan hanya mengambil harga product saat order dibaca kembali.

Ketika item dimasukkan ke cart/order, simpan harga saat transaksi.

Contoh:

```text
product.price = 5000

cart_item.unit_price = 5000
```

Jika harga product kemudian berubah:

```text
product.price = 7000
```

cart/order lama tetap menggunakan:

```text
5000
```

Gunakan decimal/numeric sesuai database project.

Jangan menggunakan floating point untuk perhitungan uang.

---

# 9. CHECKOUT PAGE

Buat:

```text
/checkout
```

Contoh:

```text
Checkout

Customer
────────────────
Andi
andi@gmail.com

Order
────────────────
POS Kasir Basic
Rp5.000 / bulan

Qty
1

Subtotal
Rp5.000

Total
Rp5.000

[ LANJUTKAN PEMBAYARAN ]
```

---

# 10. CUSTOMER INFORMATION

Gunakan data user yang sudah login.

Minimal:

```text
Name
Email
```

Jangan meminta user membuat akun lagi.

Contoh:

```text
User Kagoem:
Andi
andi@gmail.com
```

akan otomatis digunakan sebagai customer checkout.

---

# 11. BILLING INFORMATION

Buat struktur yang dapat dikembangkan.

Untuk tahap awal minimal:

```text
Name
Email
Phone
```

Jika phone belum tersedia di users, tentukan apakah perlu menambahkannya atau menyimpan pada order/customer information.

Jangan mengubah users table secara sembarangan.

---

# 12. ORDER

Ketika user menekan:

```text
LANJUTKAN PEMBAYARAN
```

buat Order.

Konsep:

```text
orders

id
user_id
order_number
status
currency
subtotal
discount
tax
total
created_at
updated_at
```

dan:

```text
order_items

id
order_id
product_id
product_name
product_type
quantity
unit_price
subtotal
created_at
updated_at
```

PENTING:

`order_items` harus menyimpan snapshot informasi product yang relevan.

Jangan bergantung sepenuhnya pada data product saat ini.

---

# 13. ORDER NUMBER

Buat nomor order yang mudah dibaca.

Contoh:

```text
KGO-20260828-000001
```

atau format yang sesuai convention project.

Pastikan unique.

Jangan menggunakan ID database sebagai satu-satunya nomor order yang ditampilkan kepada customer.

---

# 14. ORDER STATUS

Siapkan status:

```text
PENDING
PAID
FAILED
CANCELLED
EXPIRED
```

Untuk tahap checkout ini, order baru:

```text
PENDING
```

Belum ada status PAID karena payment gateway belum diimplementasikan.

---

# 15. PAYMENT STATUS

Pisahkan konsep:

```text
Order Status
```

dan:

```text
Payment Status
```

Jika architecture memungkinkan, gunakan:

```text
payments
```

dengan konsep:

```text
id
order_id
provider
payment_method
transaction_id
status
amount
paid_at
created_at
updated_at
```

Untuk tahap ini:

```text
provider = null
status = pending
```

atau sesuai architecture.

Tujuannya agar nanti Midtrans dapat diintegrasikan tanpa merombak Order System.

---

# 16. PAYMENT GATEWAY READY

Jangan implementasikan Midtrans sekarang.

Tetapi architecture harus siap:

```text
Checkout
   ↓
Order
   ↓
Payment
   ↓
Payment Gateway
```

Nanti:

```text
Payment
   ↓
Midtrans
   ↓
Payment URL / Snap
   ↓
Customer
   ↓
Payment
   ↓
Webhook
   ↓
Payment Status
   ↓
Order PAID
```

Untuk task ini berhenti pada:

```text
Order PENDING
Payment PENDING
```

---

# 17. ORDER CONFIRMATION

Setelah checkout berhasil:

```text
/checkout/success
```

atau route sesuai convention project.

Tampilkan:

```text
Order Berhasil Dibuat

Order Number:
KGO-20260828-000001

Status:
Menunggu Pembayaran

Total:
Rp5.000

[ LIHAT DETAIL ORDER ]
```

Jangan mengatakan:

```text
Pembayaran berhasil
```

karena payment gateway belum digunakan.

---

# 18. ORDER DETAIL

Buat:

```text
/orders/{orderNumber}
```

Contoh:

```text
Order #KGO-20260828-000001

POS Kasir Basic
Rp5.000 / bulan

Subtotal
Rp5.000

Total
Rp5.000

Status Order:
Menunggu Pembayaran

Status Payment:
Menunggu Pembayaran
```

Pastikan user hanya dapat melihat order miliknya sendiri.

---

# 19. MY ORDERS

Buat:

```text
/orders
```

Contoh:

```text
Pesanan Saya

#KGO-20260828-000001
POS Kasir Basic
Rp5.000
Pending

[ DETAIL ]
```

---

# 20. CHECKOUT VALIDATION

Sebelum membuat order:

* user harus authenticated
* cart tidak boleh kosong
* product harus aktif
* product harus masih tersedia
* quantity valid
* price harus diambil dari server
* total harus dihitung server-side

**Jangan percaya total harga dari frontend.**

Frontend hanya mengirim:

```text
product_id
quantity
```

Backend menghitung:

```text
unit_price
subtotal
tax
discount
total
```

---

# 21. TRANSACTION DATABASE

Pembuatan order harus menggunakan database transaction.

Konsep:

```text
BEGIN TRANSACTION

Create Order
Create Order Items
Create Payment

Clear Cart

COMMIT
```

Jika terjadi error:

```text
ROLLBACK
```

Jangan sampai:

```text
Order berhasil
tetapi Order Item gagal
```

atau:

```text
Order berhasil
tetapi cart tidak konsisten
```

---

# 22. DOUBLE CHECKOUT

Cegah user membuat order duplicate akibat:

* double click
* refresh
* network retry
* duplicate request

Gunakan mechanism yang sesuai:

* idempotency
* unique constraint
* request lock
* disable button
* backend validation

Jangan hanya mengandalkan frontend button disable.

---

# 23. EMAIL

Gunakan email system yang sudah dibuat sebelumnya.

Untuk tahap ini setelah order dibuat, boleh kirim email:

```text
Order Created
```

menggunakan Mailtrap untuk development.

Contoh:

```text
Kagoem Digital

Halo Andi,

Pesanan Anda berhasil dibuat.

Order:
KGO-20260828-000001

Produk:
POS Kasir Basic

Total:
Rp5.000

Status:
Menunggu Pembayaran
```

Jangan mengirim email "Payment Successful".

Payment belum terjadi.

---

# 24. ADMIN ORDER

Jika project sudah memiliki admin dashboard, tambahkan:

```text
Admin
 ↓
Orders
 ↓
Order Detail
```

Admin dapat melihat:

* order number
* customer
* product
* quantity
* subtotal
* total
* order status
* payment status
* created date

Jangan menambahkan fitur manual "mark as paid" kecuali memang sudah menjadi bagian architecture/admin requirement.

---

# 25. SECURITY

Pastikan:

* user hanya dapat melihat cart sendiri
* user hanya dapat melihat order sendiri
* total dihitung backend
* harga dihitung backend
* product tidak dipercaya dari frontend
* quantity divalidasi
* order number unique
* authorization diterapkan
* CSRF sesuai framework
* mass assignment aman
* SQL injection terlindungi
* sensitive data tidak masuk response
* user tidak dapat mengubah harga melalui request

---

# 26. API

Jika project menggunakan API, buat endpoint sesuai convention existing.

Minimal:

```http
GET    /api/products
GET    /api/products/{slug}

GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/{id}
DELETE /api/cart/items/{id}

POST   /api/checkout

GET    /api/orders
GET    /api/orders/{orderNumber}
```

Sesuaikan dengan architecture existing.

---

# 27. FRONTEND STATE

Pastikan UI memiliki state:

```text
Loading
Success
Validation Error
Server Error
Empty Cart
Product Unavailable
Checkout Success
```

Contoh empty cart:

```text
Keranjang Anda masih kosong.

[ JELAJAHI PRODUK ]
```

---

# 28. RESPONSIVE

Checkout harus nyaman digunakan:

* Desktop
* Tablet
* Mobile

Mobile checkout harus tetap mudah digunakan.

---

# 29. TESTING

Buat automated test minimal:

### Cart

```text
✓ User dapat menambahkan product
✓ User dapat melihat cart
✓ User dapat mengubah quantity
✓ User dapat menghapus item
✓ Guest tidak dapat checkout
✓ Cart user tidak dapat diakses user lain
```

### Checkout

```text
✓ Checkout berhasil
✓ Cart kosong ditolak
✓ Product inactive ditolak
✓ Quantity invalid ditolak
✓ Harga dihitung backend
✓ Total dihitung backend
✓ Order dibuat
✓ Order item dibuat
✓ Payment pending dibuat
✓ Cart dibersihkan setelah order berhasil
```

### Security

```text
✓ User tidak dapat melihat order user lain
✓ User tidak dapat mengubah price
✓ User tidak dapat mengubah total
✓ Duplicate checkout ditangani
```

---

# 30. TEST CASE CONTOH

Gunakan scenario:

```text
User:
Andi

Email:
andi@gmail.com

Product:
POS Kasir Basic

Price:
Rp5.000 / bulan

Quantity:
1
```

Expected:

```text
Order:
KGO-20260828-XXXXXX

Subtotal:
Rp5.000

Total:
Rp5.000

Order Status:
PENDING

Payment Status:
PENDING
```

---

# 31. OUT OF SCOPE

Jangan implementasikan:

* Midtrans
* Resend production
* Payment gateway
* QRIS
* Virtual Account
* Credit Card
* Subscription billing otomatis
* Webhook payment
* POS provisioning
* License generation
* Digital download
* Invoice PDF
* Refund

Semua akan dibuat pada tahap berikutnya.

---

# 32. ACCEPTANCE CRITERIA

Task dianggap selesai jika flow berikut berhasil:

```text
User Login
   ↓
Product
   ↓
Add to Cart
   ↓
Cart
   ↓
Checkout
   ↓
Create Order
   ↓
Create Order Items
   ↓
Create Payment Pending
   ↓
Clear Cart
   ↓
Checkout Success
   ↓
Order Detail
```

Dan:

```text
Order Status = PENDING
Payment Status = PENDING
```

---

# 33. FINAL REVIEW

Sebelum selesai periksa:

* [ ] Existing authentication tetap berjalan
* [ ] Existing email system tetap berjalan
* [ ] Product tidak duplicate
* [ ] User tidak duplicate
* [ ] Cart dibuat
* [ ] Cart item dibuat
* [ ] Order dibuat
* [ ] Order item dibuat
* [ ] Payment dibuat
* [ ] Order number unique
* [ ] Price snapshot tersedia
* [ ] Total dihitung server
* [ ] Database transaction digunakan
* [ ] Authorization tersedia
* [ ] Duplicate checkout ditangani
* [ ] Email order confirmation tersedia
* [ ] Automated test tersedia
* [ ] Existing functionality tidak rusak

---

# 34. FINAL REPORT

Setelah selesai, tampilkan:

## Project Analysis

## Existing Product Architecture

## Existing Authentication Architecture

## Database Changes

## Files Created

## Files Modified

## API Endpoints

## Cart Flow

## Checkout Flow

## Order Flow

## Payment Architecture

## Email Flow

## Tests Created

## Test Results

## Manual Test

## Known Issues

## Next Recommended Step

---

# NEXT STEP

Setelah Checkout System ini selesai dan seluruh test berhasil, **next step yang direkomendasikan adalah implementasi Payment Gateway Midtrans**.

Architecture yang diharapkan:

```text
Kagoem Digital
      │
      ▼
   Checkout
      │
      ▼
    Order
      │
      ▼
   Payment
      │
      ▼
   Midtrans
      │
      ├── QRIS
      ├── Virtual Account
      ├── E-Wallet
      └── Payment Methods
      │
      ▼
   Webhook
      │
      ▼
Payment Status
      │
      ▼
Order PAID
      │
      ▼
Product Fulfillment
```

**Jangan implementasikan bagian Midtrans pada task ini.**

---

# FINAL INSTRUCTION

Jangan hanya memberikan tutorial atau contoh kode.

**Kerjakan implementasinya langsung pada project yang sedang terbuka.**

Mulai dengan membaca:

```text
prompt_registration.md
prompt_resend.md
prompt_checkout.md
```

Kemudian lakukan:

```text
READ
 ↓
INSPECT
 ↓
PLAN
 ↓
IMPLEMENT
 ↓
MIGRATE
 ↓
TEST
 ↓
FIX
 ↓
REVIEW
 ↓
REPORT
```

Jangan berhenti pada tahap analisis.

Jika menemukan masalah pada architecture existing, sesuaikan solusi dengan project tanpa merusak functionality yang sudah berjalan.
