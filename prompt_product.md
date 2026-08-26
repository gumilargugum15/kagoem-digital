Saya ingin menambahkan fitur baru bernama "Products" pada website Kagoem Digital.

Tujuan fitur ini adalah menjadikan website Kagoem Digital sebagai tempat untuk:

1. Menjual produk digital.
2. Menjual template dan source code.
3. Menjual ebook / panduan digital.
4. Menjual tools/software digital.
5. Menawarkan aplikasi berbasis subscription/langganan.
6. Menawarkan paket aplikasi untuk bisnis.
7. Menjadi channel tambahan untuk mendapatkan customer dan recurring revenue.

==================================================
1. ANALISIS PROJECT TERLEBIH DAHULU
==================================================

Jangan langsung mengubah kode.

Sebelum implementasi:

1. Periksa struktur project.
2. Identifikasi framework frontend.
3. Identifikasi backend.
4. Identifikasi routing.
5. Identifikasi database.
6. Identifikasi authentication.
7. Identifikasi admin dashboard.
8. Identifikasi sistem payment jika sudah ada.
9. Identifikasi sistem upload file.
10. Identifikasi design system.
11. Identifikasi component yang dapat digunakan kembali.

Gunakan arsitektur dan teknologi yang sudah digunakan project.

Jangan melakukan rewrite project.

Jangan mengganti framework atau library utama yang sudah ada.

==================================================
2. NAVBAR
==================================================

Tambahkan menu:

Products

Navbar menjadi:

Home
About
Services
Portfolio
Products
Tech Notes
FAQ
Contact
Konsultasi Gratis

Pertahankan desain navbar Kagoem Digital yang sudah ada.

Products harus terlihat sebagai menu utama yang penting tetapi tidak merusak visual navbar existing.

Pada mobile masukkan Products ke mobile navigation.

==================================================
3. KONSEP PRODUCTS
==================================================

Products adalah marketplace milik Kagoem Digital.

Products dapat berisi dua jenis utama:

A. DIGITAL PRODUCTS

B. SOFTWARE SUBSCRIPTION

Digital Products contohnya:

- Template website
- Template undangan digital
- UI Kit
- Source code
- Boilerplate
- Ebook
- Tutorial
- Script
- Plugin
- Design assets
- Dokumen/template bisnis
- Tools digital

Software Subscription contohnya:

- POS / Kasir
- Inventory
- CRM
- HRIS
- Booking system
- Invoice system
- Aplikasi toko
- Aplikasi bisnis
- SaaS lainnya

==================================================
4. HALAMAN PRODUCTS
==================================================

Buat halaman:

/products

Header:

PRODUCTS

"Produk digital dan aplikasi siap pakai untuk membantu bisnis
dan kebutuhan digital Anda."

Tambahkan search:

"🔍 Cari produk..."

Tambahkan kategori.

Kategori:

All
Digital Products
Software
Template
Source Code
Ebook
Tools
Subscription

==================================================
5. PRODUCT CARD
==================================================

Buat card produk modern.

Setiap card memiliki:

- Product image
- Product type
- Product name
- Short description
- Price
- Discount jika ada
- Rating jika tersedia
- Number of purchases jika tersedia
- CTA

Contoh:

--------------------------------------------------

[IMAGE]

SOFTWARE

POS Cashier

Aplikasi kasir untuk toko dan bisnis retail.

Rp 49.000 / bulan

[ Lihat Detail ]

--------------------------------------------------

Untuk produk digital:

--------------------------------------------------

DIGITAL PRODUCT

Laravel POS Starter Kit

Source code aplikasi POS berbasis Laravel.

Rp 299.000

[ Lihat Produk ]

--------------------------------------------------

==================================================
6. PRODUCT DETAIL
==================================================

Buat halaman:

/products/{slug}

Contoh:

/products/pos-cashier

Halaman detail harus memiliki:

- Hero image
- Gallery
- Product name
- Product type
- Description
- Features
- Technology
- Pricing
- FAQ
- Requirements
- What's included
- Demo
- Reviews
- Related products
- CTA

==================================================
7. DIGITAL PRODUCT
==================================================

Untuk produk digital, tampilkan:

Product name

Description

Preview

What's included:

✓ Source code
✓ Documentation
✓ Installation guide
✓ Lifetime updates jika tersedia
✓ Support

Harga:

Rp 299.000

CTA:

[Beli Sekarang]

atau:

[Tambahkan ke Keranjang]

Jika sistem cart belum tersedia,
buat struktur yang memungkinkan cart ditambahkan kemudian.

==================================================
8. SOFTWARE SUBSCRIPTION
==================================================

Untuk software/aplikasi subscription,
gunakan pricing card.

Contoh:

POS CASHIER

Starter
Rp 49.000 / bulan

✓ 1 toko
✓ 1 user
✓ Product management
✓ Sales
✓ Reports

[Mulai Berlangganan]

Business
Rp 99.000 / bulan

✓ 3 toko
✓ 5 users
✓ Product management
✓ Sales
✓ Reports
✓ Inventory

[Mulai Berlangganan]

Enterprise
Custom

✓ Unlimited users
✓ Multi branch
✓ Custom feature
✓ Priority support

[Hubungi Kami]

==================================================
9. SUBSCRIPTION INTERVAL
==================================================

Dukung:

Monthly
Yearly

Contoh toggle:

[ Bulanan ] [ Tahunan ]

Jika tahunan:

Hemat 20%

Harga:

Rp 990.000 / tahun

Tampilkan informasi:

"Setara Rp 82.500 / bulan"

==================================================
10. PRODUCT TYPE
==================================================

Setiap product memiliki type:

digital
subscription
service

Contoh:

{
    type: "digital"
}

atau:

{
    type: "subscription"
}

atau:

{
    type: "service"
}

Gunakan enum/constant jika sesuai dengan arsitektur backend.

==================================================
11. PRODUCT STATUS
==================================================

Product memiliki status:

draft
published
archived

Hanya product published yang muncul di public website.

==================================================
12. ADMIN PRODUCT MANAGEMENT
==================================================

Jika project memiliki admin dashboard,
tambahkan:

Products

Admin dapat:

- Create product
- Edit product
- Delete product
- Publish product
- Archive product
- Upload product image
- Upload digital file
- Manage pricing
- Manage subscription plan
- Manage features
- Manage category
- Manage product type

==================================================
13. CREATE PRODUCT
==================================================

Form:

Product Name
Slug
Product Type
Category
Short Description
Description
Thumbnail
Gallery
Price
Discount
Status
Features
Tags

Jika type = digital:

Digital File
Download URL
What's Included

Jika type = subscription:

Subscription Plans

==================================================
14. SUBSCRIPTION PLAN MANAGEMENT
==================================================

Untuk product subscription,
admin dapat membuat beberapa plan.

Contoh:

Starter
Business
Professional
Enterprise

Setiap plan memiliki:

name
price
billing_interval
features
max_users
max_branches
max_products
status

Billing interval:

monthly
yearly

==================================================
15. PRODUCT DATABASE
==================================================

Jika project menggunakan backend/database,
buat migration dan model yang sesuai.

Minimal:

products

id
name
slug
type
category_id
short_description
description
thumbnail
status
created_at
updated_at

product_prices

id
product_id
price
discount_price
currency
billing_interval
created_at
updated_at

product_features

id
product_id
name
description

subscription_plans

id
product_id
name
description
price
billing_interval
status

subscription_plan_features

id
subscription_plan_id
feature
value

Gunakan struktur database yang sesuai dengan arsitektur
existing project.

Jangan membuat tabel jika project sudah memiliki struktur
yang bisa digunakan kembali.

==================================================
16. PRODUCT IMAGE
==================================================

Dukung:

- Thumbnail
- Gallery
- Preview image

Upload:

JPG
JPEG
PNG
WEBP

Tambahkan:

- File validation
- MIME validation
- Maximum file size
- Image optimization jika memungkinkan

Gunakan storage system existing.

==================================================
17. DIGITAL FILE
==================================================

Untuk produk digital seperti:

Source code
Ebook
Template
ZIP
PDF

Jangan expose file download secara public.

Gunakan protected download mechanism.

User yang sudah membeli produk baru dapat melakukan download.

Jika sistem authentication/payment belum tersedia,
buat abstraction/interface sehingga payment dapat ditambahkan
kemudian.

==================================================
18. PAYMENT
==================================================

Jika project sudah mempunyai payment gateway,
integrasikan dengan sistem existing.

Jika belum ada:

JANGAN membuat payment gateway palsu.

Buat architecture yang memungkinkan integrasi payment gateway
di tahap berikutnya.

Contoh interface:

PaymentService

createPayment()
checkPaymentStatus()
handleWebhook()

Payment gateway dapat ditambahkan kemudian.

==================================================
19. ORDER
==================================================

Buat konsep order:

orders

id
user_id
order_number
status
subtotal
discount
total
currency
created_at
updated_at

order_items

id
order_id
product_id
product_name
price
quantity
subtotal

Status:

pending
paid
failed
cancelled
refunded

==================================================
20. DIGITAL PRODUCT ACCESS
==================================================

Jika order sudah:

paid

User mendapatkan akses:

Download

Contoh:

My Products

Laravel POS Starter Kit

[Download]

[Documentation]

[Support]

==================================================
21. SUBSCRIPTION
==================================================

Untuk subscription:

My Subscriptions

POS Cashier
Business Plan

Status:
Active

Next Billing:
25 September 2026

Rp 99.000 / bulan

Actions:

[Manage Subscription]

[Cancel Subscription]

==================================================
22. USER DASHBOARD
==================================================

Jika authentication sudah tersedia,
tambahkan:

My Products
My Orders
My Subscriptions

Contoh:

Dashboard

---------------------------------

My Products

Laravel POS Starter Kit
[Download]

---------------------------------

My Subscriptions

POS Cashier - Business
Active

Rp 99.000 / month

[Manage]

---------------------------------

Order History

INV-2026-0001
Rp 299.000
Paid

---------------------------------

==================================================
23. PRODUCT SEARCH
==================================================

Search berdasarkan:

- Product name
- Description
- Category
- Tags

Tambahkan debounce jika menggunakan API.

==================================================
24. PRODUCT FILTER
==================================================

Filter:

All
Digital Products
Software
Subscription
Template
Source Code
Ebook
Tools

Tambahkan sorting:

Newest
Popular
Price Low → High
Price High → Low

==================================================
25. PRODUCT FEATURE COMPARISON
==================================================

Untuk software subscription,
buat comparison table.

Contoh:

Feature              Starter   Business   Enterprise

Users                   1          5          Unlimited
Branches                1          3          Unlimited
Products              100        500        Unlimited
Reports                 ✓          ✓            ✓
Inventory               ✓          ✓            ✓
Multi Branch            ✕          ✓            ✓
Custom Feature          ✕          ✕            ✓

Gunakan responsive table pada mobile.

==================================================
26. DEMO
==================================================

Untuk software subscription,
tambahkan:

[Live Demo]

Contoh:

POS Cashier
[ Lihat Demo ]

Jika demo tersedia,
gunakan link demo existing.

==================================================
27. CTA
==================================================

Tambahkan CTA di halaman Products:

"Temukan solusi digital untuk bisnis Anda."

"Gunakan produk siap pakai atau konsultasikan kebutuhan
aplikasi custom Anda dengan Kagoem Digital."

Buttons:

[Lihat Products]

[Konsultasi Gratis]

==================================================
28. RELATED PRODUCTS
==================================================

Pada detail product:

Produk Terkait

Tampilkan 3-4 produk berdasarkan:

category
type
tags

==================================================
29. SEO
==================================================

Setiap product memiliki:

meta_title
meta_description
canonical_url
og_image

URL:

/products/pos-cashier

Bukan:

/products?id=123

Gunakan SEO implementation yang sesuai dengan framework
existing project.

==================================================
30. RESPONSIVE
==================================================

Mobile first.

Pastikan:

Product card responsive.

Pricing card responsive.

Comparison table responsive.

Gallery responsive.

CTA mudah diklik di smartphone.

==================================================
31. DESIGN
==================================================

Pertahankan identitas Kagoem Digital.

Gunakan design existing:

- typography
- colors
- spacing
- buttons
- border radius
- cards
- shadows

Products harus terlihat:

Modern
Premium
Professional
Clean
Trustworthy

Jangan membuat marketplace dengan desain yang terlalu ramai.

==================================================
32. PRODUCT BADGE
==================================================

Tambahkan badge:

NEW
BEST SELLER
POPULAR
SALE
SUBSCRIPTION

Contoh:

[POPULAR]

POS Cashier

Rp 99.000 / bulan

==================================================
33. TRUST ELEMENT
==================================================

Untuk meningkatkan conversion,
tambahkan:

✓ Secure Payment
✓ Instant Access
✓ Developer Support
✓ Regular Updates

Untuk subscription:

✓ Cancel anytime
✓ Regular updates
✓ Customer support
✓ Cloud based

Gunakan hanya jika memang sesuai dengan produk.

Jangan membuat klaim palsu.

==================================================
34. ARCHITECTURE
==================================================

Gunakan reusable components.

Contoh:

ProductCard
ProductGrid
ProductFilter
ProductSearch
ProductDetail
PricingCard
SubscriptionPlan
FeatureComparison
ProductGallery
ProductBadge
ProductCTA

Jika menggunakan backend:

ProductController
ProductService
ProductRepository
ProductResource

Gunakan pattern existing project.

==================================================
35. SECURITY
==================================================

Pastikan:

- Admin authorization
- Input validation
- Upload validation
- Protected digital download
- Subscription authorization
- Order authorization
- Tidak ada user yang dapat mengakses order milik user lain
- Jangan expose file digital secara public
- Jangan expose credential/payment secret

==================================================
36. PERFORMANCE
==================================================

Optimalkan:

- Image lazy loading
- Image compression
- Pagination
- API pagination
- Query optimization
- Caching product list jika sesuai
- Lazy loading gallery

==================================================
37. TESTING
==================================================

Setelah implementasi:

Frontend:

npm run build

Jika ada:

npm run lint

Backend:

php artisan test

Jika migration dibuat:

php artisan migrate

Pastikan tidak ada error.

==================================================
38. IMPLEMENTATION STRATEGY
==================================================

Implementasikan bertahap.

PHASE 1:

- Navbar Products
- Products landing page
- Product listing
- Product card
- Category filter
- Search
- Product detail
- Digital product
- Subscription product
- Pricing cards

PHASE 2:

- Admin product management
- Product CRUD
- Category
- Tags
- Image upload
- Subscription plan management

PHASE 3:

- Authentication
- Cart
- Orders
- Payment integration
- Digital download
- User dashboard

PHASE 4:

- Subscription management
- Billing
- Renewal
- Cancel subscription
- Payment webhook

Jangan mengimplementasikan payment gateway jika belum
tersedia atau belum jelas gateway yang digunakan.

==================================================
39. IMPORTANT
==================================================

Jangan merusak:

- Home
- About
- Services
- Portfolio
- Tech Notes
- FAQ
- Contact
- Existing authentication
- Existing API
- Existing database

Gunakan component existing jika memungkinkan.

Sebelum membuat file baru,
pastikan tidak ada file/component yang sudah memiliki fungsi sama.

==================================================
40. OUTPUT REPORT
==================================================

Setelah selesai berikan laporan:

1. File dibuat.
2. File diubah.
3. Route baru.
4. API endpoint baru.
5. Database migration.
6. Model.
7. Controller.
8. Service.
9. Component.
10. Package baru.
11. Cara menjalankan migration.
12. Cara menjalankan seeder.
13. Cara membuat product.
14. Cara membuat subscription plan.
15. Cara publish product.
16. Cara testing.
17. Hasil npm run build.
18. Hasil php artisan test.

IMPLEMENTASIKAN LANGSUNG KE PROJECT.

Jangan hanya memberikan contoh kode atau penjelasan.