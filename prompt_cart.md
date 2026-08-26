Saya ingin menambahkan fitur "Shopping Cart / Keranjang Belanja"
ke fitur Products pada website Kagoem Digital.

Fitur Cart harus mendukung:

1. Pembelian produk digital satu kali.
2. Pembelian source code/template/ebook/tools.
3. Berlangganan aplikasi/software.
4. Pemilihan subscription plan.
5. Checkout.
6. Order creation.
7. Payment gateway integration di tahap berikutnya.

PENTING:

Jangan membuat payment gateway palsu.

Buat arsitektur payment yang bersifat modular sehingga nantinya
mudah diintegrasikan dengan payment gateway seperti Midtrans,
Xendit, Tripay, atau provider lainnya tanpa harus mengubah
struktur Cart dan Order secara besar-besaran.

==================================================
1. ANALISIS PROJECT
==================================================

Sebelum coding:

1. Baca dan pahami project.
2. Baca file `prompt_product.md` jika tersedia.
3. Analisis fitur Products yang sudah dibuat.
4. Analisis Product model.
5. Analisis Product Price.
6. Analisis Subscription Plan.
7. Analisis User/Auth.
8. Analisis database.
9. Analisis API.
10. Analisis existing admin dashboard.
11. Analisis existing design system.

Jangan membuat struktur baru jika functionality yang dibutuhkan
sudah tersedia.

Gunakan architecture existing project.

Jangan melakukan rewrite project.

==================================================
2. CART
==================================================

Tambahkan menu/cart icon pada navbar.

Contoh:

Products
Tech Notes
...
🛒 Cart

Tampilkan jumlah item:

🛒 2

Jika cart kosong:

🛒 Cart
Your cart is empty.

[Browse Products]

==================================================
3. CART PAGE
==================================================

Buat halaman:

/cart

Layout:

Shopping Cart

--------------------------------------------

Product

Laravel POS Starter Kit
Digital Product

Rp 299.000

Quantity: 1

[Remove]

--------------------------------------------

POS Cashier
Business Plan
Subscription

Rp 99.000 / month

[Remove]

--------------------------------------------

Subtotal
Rp 398.000

Discount
Rp 0

Total
Rp 398.000

[Continue Shopping]

[Checkout]

--------------------------------------------

Pastikan responsive di mobile.

==================================================
4. CART ITEM
==================================================

Setiap cart item memiliki:

id
product_id
product_type
product_name
product_image
price
quantity
billing_interval
subscription_plan_id
subscription_plan_name

Untuk digital product:

quantity dapat lebih dari 1 jika memang diperbolehkan.

Untuk subscription:

quantity harus selalu 1.

==================================================
5. DIGITAL PRODUCT
==================================================

Contoh:

Laravel POS Starter Kit

Type:
Digital Product

Price:
Rp 299.000

Quantity:
1

Cart:

Laravel POS Starter Kit
Rp 299.000

==================================================
6. SUBSCRIPTION PRODUCT
==================================================

Jika user memilih:

POS Cashier

Plan:

Business

Rp 99.000 / bulan

Maka cart harus menyimpan:

product_id
subscription_plan_id
billing_interval
price

Contoh:

POS Cashier
Business Plan
Rp 99.000 / month

Quantity: 1

==================================================
7. SUBSCRIPTION PLAN SELECTION
==================================================

Pada halaman product subscription:

POS CASHIER

[Starter]
Rp 49.000 / bulan

[Business]
Rp 99.000 / bulan

[Professional]
Rp 199.000 / bulan

User harus memilih plan sebelum:

[Add to Cart]

Jika belum memilih plan:

Tampilkan validation:

"Silakan pilih paket terlebih dahulu."

==================================================
8. ADD TO CART
==================================================

Tambahkan tombol:

[Add to Cart]

Setelah berhasil:

"Product added to cart."

Cart badge harus update otomatis.

Contoh:

🛒 1

Jika product sudah ada di cart:

Jangan membuat duplicate item jika product dan subscription
plan sama.

Untuk digital product:

Tambahkan quantity.

Untuk subscription:

Tolak duplicate subscription yang sama.

==================================================
9. REMOVE FROM CART
==================================================

Setiap item memiliki:

[Remove]

Ketika dihapus:

Cart otomatis menghitung ulang:

Subtotal
Discount
Total

==================================================
10. UPDATE QUANTITY
==================================================

Digital product:

[-] 1 [+]

Subscription:

Quantity tidak dapat diubah.

Tampilkan:

Quantity: 1

==================================================
11. CART PERSISTENCE
==================================================

Cart harus tetap ada ketika user:

- Refresh halaman.
- Pindah halaman.
- Menutup browser sementara.
- Login.

Jika user belum login:

Gunakan guest cart.

Jika user login:

Cart dapat dikaitkan dengan user.

Jika memungkinkan:

Guest Cart
      ↓
User Login
      ↓
Merge Cart
      ↓
User Cart

Pastikan duplicate product ditangani dengan benar.

==================================================
12. GUEST CART
==================================================

User dapat:

Browse Products
        ↓
Add to Cart
        ↓
View Cart
        ↓
Checkout

Jika checkout membutuhkan authentication:

Tampilkan:

"Silakan login atau daftar terlebih dahulu untuk melanjutkan."

Buttons:

[Login]

[Daftar]

[Continue as Guest]

Gunakan aturan existing authentication project.

Jangan membuat authentication baru.

==================================================
13. CART DATABASE
==================================================

Jika menggunakan backend/database,
gunakan struktur yang sesuai dengan project existing.

Jika belum tersedia, buat:

carts

id
user_id nullable
session_id nullable
currency
created_at
updated_at

cart_items

id
cart_id
product_id
subscription_plan_id nullable
product_name
product_type
price
quantity
billing_interval nullable
subtotal
created_at
updated_at

Gunakan foreign key yang sesuai.

Pastikan cart item tetap menyimpan snapshot harga/product
jika architecture project membutuhkan historical consistency.

==================================================
14. PRICE SNAPSHOT
==================================================

Penting:

Harga pada cart tidak boleh dipercaya dari frontend.

Ketika:

Add to Cart
atau
Checkout

Backend harus mengambil harga dari database.

Jangan menerima:

price

total

subtotal

langsung dari frontend sebagai nilai final.

Backend harus menghitung ulang:

price
quantity
subtotal
discount
tax jika tersedia
total

==================================================
15. PRODUCT VALIDATION
==================================================

Saat Add to Cart:

Backend harus memastikan:

1. Product exists.
2. Product published.
3. Product tersedia.
4. Product type valid.
5. Subscription plan belongs to product.
6. Subscription plan active.
7. Price valid.
8. Billing interval valid.
9. Quantity valid.

Jika product tidak tersedia:

"Product is no longer available."

==================================================
16. CHECKOUT
==================================================

Buat halaman:

/checkout

Flow:

Cart
 ↓
Checkout
 ↓
Review Order
 ↓
Create Order
 ↓
Payment
 ↓
Payment Result

Checkout menampilkan:

Customer Information

Name
Email
Phone

Order Summary

Product
Price
Quantity
Subtotal

Discount

Total

[Place Order]

==================================================
17. ORDER
==================================================

Jika project belum memiliki order system,
buat struktur:

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
payment_status
created_at
updated_at

order_items

id
order_id
product_id
subscription_plan_id nullable
product_name
product_type
price
quantity
billing_interval nullable
subtotal
created_at
updated_at

Order status:

pending
processing
paid
failed
cancelled
refunded

Payment status:

unpaid
pending
paid
failed
expired
refunded

==================================================
18. ORDER NUMBER
==================================================

Generate unique order number.

Contoh:

ORD-20260825-00001

atau format sesuai convention project.

Order number harus unique.

==================================================
19. CHECKOUT VALIDATION
==================================================

Sebelum membuat order:

Backend harus melakukan re-validation.

Check:

Product masih published.
Product masih tersedia.
Subscription plan masih active.
Harga masih sama/valid.
User memiliki hak membeli product tersebut.
Cart masih valid.

Jika harga berubah:

Tampilkan:

"Some product prices have changed.
Please review your cart."

Jangan langsung membuat order dengan harga lama.

==================================================
20. PAYMENT ABSTRACTION
==================================================

Buat abstraction payment.

Contoh:

PaymentGatewayInterface

Method:

createPayment()
getPaymentStatus()
cancelPayment()
refundPayment()

Kemudian:

PaymentService

yang menggunakan:

PaymentGatewayInterface

Jangan mengimplementasikan provider tertentu jika belum diminta.

Contoh architecture:

PaymentService
      |
      +-- MidtransGateway
      |
      +-- XenditGateway
      |
      +-- OtherGateway

Dengan demikian payment gateway dapat diganti tanpa
mengubah Cart atau Order.

==================================================
21. PAYMENT FLOW
==================================================

Flow yang diinginkan:

User
 ↓
Cart
 ↓
Checkout
 ↓
Create Order
 ↓
Create Payment
 ↓
Payment Gateway
 ↓
Customer Payment
 ↓
Webhook
 ↓
Verify Payment
 ↓
Update Order
 ↓
Grant Product Access / Activate Subscription

PENTING:

Jangan menganggap pembayaran berhasil hanya berdasarkan
response frontend.

Payment status final harus diverifikasi melalui backend/webhook
payment gateway.

==================================================
22. PAYMENT WEBHOOK
==================================================

Siapkan architecture:

POST /api/payment/webhook

atau mengikuti routing convention existing.

Webhook harus:

1. Verify signature.
2. Identify transaction/order.
3. Check payment status.
4. Update order.
5. Prevent duplicate processing.
6. Grant digital product access jika paid.
7. Activate subscription jika paid.

Webhook harus idempotent.

Jika webhook yang sama diterima beberapa kali,
jangan membuat duplicate access atau subscription.

==================================================
23. DIGITAL PRODUCT ACCESS
==================================================

Jika order:

payment_status = paid

dan product_type:

digital

Maka user mendapatkan access.

Contoh:

My Products

Laravel POS Starter Kit

[Download]

[Documentation]

File download harus protected.

Jangan menyimpan file digital sebagai public URL.

==================================================
24. SUBSCRIPTION ACTIVATION
==================================================

Jika order:

payment_status = paid

dan product_type:

subscription

maka:

Subscription dibuat/diaktifkan.

Data minimal:

user_id
product_id
subscription_plan_id
order_id
status
started_at
current_period_start
current_period_end
billing_interval

Status:

active
past_due
cancelled
expired

==================================================
25. SUBSCRIPTION RENEWAL
==================================================

Arsitektur harus disiapkan agar nantinya dapat mendukung:

Monthly
Yearly

Contoh:

Business
Rp 99.000 / month

Period:

25 Aug 2026
-
25 Sep 2026

Jangan mengimplementasikan auto-renewal jika payment gateway
belum tersedia.

Siapkan struktur agar fitur tersebut dapat ditambahkan.

==================================================
26. CART CLEAR
==================================================

Setelah payment berhasil:

Cart harus dikosongkan.

Namun:

Order
Order Items
Digital Access
Subscription

harus tetap tersimpan.

Jangan bergantung pada cart setelah order dibuat.

==================================================
27. PAYMENT FAILED
==================================================

Jika payment gagal:

Order tetap tersimpan.

Status:

payment_status = failed

User dapat:

[Try Payment Again]

Jangan membuat duplicate order jika user mencoba pembayaran
ulang untuk order yang sama, jika architecture memungkinkan.

==================================================
28. PAYMENT EXPIRED
==================================================

Jika payment expired:

Order:

payment_status = expired

User dapat:

[Pay Again]

==================================================
29. ORDER HISTORY
==================================================

Jika user dashboard sudah tersedia:

Tambahkan:

My Orders

Contoh:

ORD-20260825-00001

POS Cashier
Rp 99.000

Status:
Paid

[View Detail]

==================================================
30. ORDER DETAIL
==================================================

Buat:

/orders/{orderNumber}

Menampilkan:

Order Number
Order Date
Status
Payment Status

Products

Subtotal
Discount
Tax
Total

Payment Method

Jika tersedia:

[Download Invoice]

==================================================
31. INVOICE
==================================================

Arsitektur harus memungkinkan pembuatan invoice.

Informasi:

Kagoem Digital
Customer
Order Number
Date
Products
Subtotal
Discount
Tax
Total
Payment Status

Jika PDF system belum ada,
buat abstraction sehingga dapat ditambahkan kemudian.

==================================================
32. CART UX
==================================================

Tambahkan animasi ringan ketika:

Add to Cart

Contoh:

Product → 🛒

Cart badge:

0 → 1

Tampilkan toast:

"Laravel POS Starter Kit berhasil ditambahkan ke keranjang."

Jangan menggunakan animasi berlebihan.

==================================================
33. EMPTY CART
==================================================

Jika cart kosong:

🛒

Keranjang Anda masih kosong.

Temukan produk digital dan aplikasi yang sesuai kebutuhan Anda.

[Browse Products]

==================================================
34. CART SUMMARY
==================================================

Desktop:

Cart Items                    Summary

Product                       Subtotal
Product                       Discount
Product                       Tax
                              Total

                              [Checkout]

Mobile:

Items

Summary

Subtotal
Discount
Tax
Total

[Checkout]

Checkout button harus sticky/bottom jika UX sesuai.

==================================================
35. SECURITY
==================================================

Sangat penting:

Jangan percaya data harga dari frontend.

Jangan percaya total dari frontend.

Jangan percaya product_name dari frontend sebagai data
transactional.

Backend harus melakukan:

- Authorization
- Validation
- Price calculation
- Product validation
- Subscription validation
- Order calculation

Gunakan transaction database saat:

Create Order
Create Order Items
Create Payment

Jika salah satu gagal,
rollback transaction.

==================================================
36. RACE CONDITION
==================================================

Jika product memiliki stock/limited availability,
validasi availability pada saat checkout.

Jangan hanya melakukan validasi saat Add to Cart.

==================================================
37. API
==================================================

Jika menggunakan REST API,
buat endpoint mengikuti convention project.

Contoh:

GET    /api/cart

POST   /api/cart/items

PUT    /api/cart/items/{id}

DELETE /api/cart/items/{id}

DELETE /api/cart

POST   /api/checkout

GET    /api/orders

GET    /api/orders/{orderNumber}

POST   /api/orders/{orderNumber}/payment

POST   /api/payment/webhook

Sesuaikan endpoint dengan routing existing.

Jangan membuat endpoint duplicate.

==================================================
38. FRONTEND COMPONENT
==================================================

Gunakan reusable components:

CartIcon
CartBadge
CartDrawer
CartItem
CartList
CartSummary
EmptyCart
CheckoutForm
OrderSummary
PaymentStatus

Jika project sudah memiliki component yang sama,
gunakan existing component.

==================================================
39. CART DRAWER
==================================================

Selain halaman /cart,
buat optional Cart Drawer.

Ketika user klik:

🛒

Muncul:

Your Cart

Laravel POS Starter Kit
Rp 299.000

POS Cashier
Business
Rp 99.000 / month

Total:

Rp 398.000

[View Cart]

[Checkout]

Cart Drawer harus responsive.

==================================================
40. PRODUCT DETAIL INTEGRATION
==================================================

Pada Product Detail:

Digital Product:

[Add to Cart]

Subscription:

Select Plan

[Starter]
[Business]
[Professional]

Kemudian:

[Add to Cart]

Setelah berhasil:

[Go to Cart]

==================================================
41. CART DUPLICATION RULE
==================================================

Digital product:

Product A
Quantity 1

Add Product A lagi:

Quantity 2

Subscription:

Product A
Business Plan

Add lagi:

Jangan membuat duplicate.

Jika user ingin plan berbeda:

Product A
Starter

Product A
Business

Keduanya boleh berada di cart jika sistem bisnis mengizinkan.

Jika tidak masuk akal secara bisnis,
berikan validation yang jelas.

==================================================
42. DISCOUNT ARCHITECTURE
==================================================

Siapkan struktur agar nantinya dapat mendukung:

Coupon
Discount
Promo Code

Contoh:

Subtotal
Rp 500.000

Discount
-Rp 50.000

Total
Rp 450.000

Jangan implementasikan coupon system penuh jika belum diminta.

Buat architecture yang memungkinkan ditambahkan kemudian.

==================================================
43. TAX ARCHITECTURE
==================================================

Siapkan field:

subtotal
discount
tax
total

Jangan menghitung pajak jika business rule belum ditentukan.

==================================================
44. CURRENCY
==================================================

Default:

IDR / Rupiah

Format:

Rp 99.000

Namun database/API harus tetap menyimpan nilai numerik,
bukan string:

SALAH:

"Rp 99.000"

BENAR:

99000

Currency:

IDR

==================================================
45. RESPONSIVE
==================================================

Mobile first.

Pastikan:

- Cart mudah digunakan di smartphone.
- Product image tidak overflow.
- Checkout form responsive.
- Cart drawer responsive.
- Pricing responsive.
- Order summary responsive.
- Button mudah ditekan.

==================================================
46. DESIGN
==================================================

Pertahankan visual identity Kagoem Digital.

Gunakan design existing:

- Typography
- Colors
- Button
- Card
- Border radius
- Shadow
- Spacing

Cart harus terlihat:

Modern
Clean
Professional
Premium
Simple

Jangan membuat tampilan seperti marketplace generik.

==================================================
47. ADMIN
==================================================

Jika admin dashboard tersedia,
tambahkan:

Orders

Admin dapat melihat:

Order Number
Customer
Products
Total
Payment Status
Order Status
Created At

Admin dapat:

View Order
Update status jika business rule mengizinkan
View payment information

Jangan memberikan admin kemampuan mengubah status paid
secara sembarangan jika status tersebut seharusnya berasal
dari payment gateway/webhook.

==================================================
48. TESTING
==================================================

Buat test untuk minimal:

1. Guest can add product to cart.
2. User can add product to cart.
3. User can update quantity.
4. User can remove item.
5. Cart total calculated correctly.
6. Subscription quantity cannot exceed 1.
7. Invalid subscription plan rejected.
8. Product price is taken from backend.
9. Checkout creates order.
10. Duplicate webhook does not duplicate access.
11. Paid digital product grants access.
12. Paid subscription activates subscription.
13. Failed payment does not grant access.
14. Expired payment does not grant access.

Jika menggunakan Laravel:

php artisan test

Jika menggunakan frontend test:

jalankan test command existing project.

==================================================
49. IMPLEMENTATION PHASE
==================================================

Implementasikan bertahap.

PHASE 1:
Cart UI

- Cart icon
- Badge
- Cart drawer
- Cart page
- Cart item
- Cart summary
- Add/remove/update quantity
- Empty cart
- Product detail integration

PHASE 2:
Backend Cart

- carts
- cart_items
- API
- Validation
- Price calculation
- Guest cart
- User cart
- Cart merge

PHASE 3:
Checkout

- Checkout page
- Order
- Order items
- Order validation
- Transaction
- Order history

PHASE 4:
Payment abstraction

- PaymentGatewayInterface
- PaymentService
- Payment transaction
- Webhook architecture

PHASE 5:
Payment Gateway

Implement provider setelah provider ditentukan.

PHASE 6:
Digital Access + Subscription

- Digital product access
- Protected download
- Subscription activation
- Subscription period
- Renewal architecture

==================================================
50. IMPORTANT IMPLEMENTATION RULE
==================================================

Jangan mengimplementasikan semua phase sekaligus jika
project belum siap.

Prioritaskan PHASE 1 dan PHASE 2 terlebih dahulu.

Setelah selesai PHASE 1 dan PHASE 2:

1. Jalankan build.
2. Jalankan tests.
3. Periksa database.
4. Periksa API.
5. Periksa responsive UI.

Kemudian lanjutkan phase berikutnya.

Jangan merusak:

Home
About
Services
Portfolio
Products
Tech Notes
FAQ
Contact
Existing Authentication
Existing API

==================================================
51. OUTPUT REPORT
==================================================

Setelah implementasi berikan laporan:

1. File yang dibuat.
2. File yang dimodifikasi.
3. Database migration.
4. Model.
5. Controller.
6. Service.
7. Repository jika digunakan.
8. API endpoint.
9. Frontend route.
10. Components.
11. Payment abstraction.
12. Test yang dibuat.
13. Cara menjalankan migration.
14. Cara menjalankan test.
15. Cara testing Cart.
16. Cara testing Checkout.
17. Hasil npm run build.
18. Hasil php artisan test.
19. Fitur yang belum diimplementasikan.

Jangan hanya memberikan contoh kode.

IMPLEMENTASIKAN LANGSUNG KE PROJECT SESUAI ARSITEKTUR EXISTING.