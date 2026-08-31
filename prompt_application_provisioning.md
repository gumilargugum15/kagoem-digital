# Kagoem Digital — Generic Application Provisioning

Baca dan jalankan seluruh instruksi dalam file ini.

File ini adalah SOURCE OF TRUTH untuk implementasi Generic Application Provisioning
pada project Kagoem Digital.

==================================================
1. TUJUAN
==================================================

Kagoem Digital bukan hanya menjual aplikasi POS.

Ke depannya Kagoem dapat menjual berbagai aplikasi SaaS:

- POS
- Inventory
- Accounting
- CRM
- HR
- dan aplikasi lainnya

Karena itu provisioning TIDAK BOLEH dibuat khusus untuk POS.

Gunakan konsep:

Subscription
    ↓
Application
    ↓
Provisioning Engine
    ↓
Application Adapter
    ↓
External Application


Contoh:

Subscription POS
    ↓
Application = POS
    ↓
POS Adapter
    ↓
POS Application


Subscription Inventory
    ↓
Application = Inventory
    ↓
Inventory Adapter
    ↓
Inventory Application


Subscription Accounting
    ↓
Application = Accounting
    ↓
Accounting Adapter
    ↓
Accounting Application


==================================================
2. SCOPE
==================================================

Task ini fokus pada:

- Application
- Subscription → Application relationship
- Generic Provisioning Engine
- Application Adapter architecture
- Application account mapping
- Provisioning status
- Idempotency
- Retry
- Security
- Integration boundary

POS adalah IMPLEMENTASI PERTAMA.

Inventory, Accounting, CRM, HR dan aplikasi lain hanya perlu
didukung oleh architecture.

JANGAN mengimplementasikan provisioning lengkap untuk semua aplikasi.


==================================================
3. INSPECT PROJECT EXISTING
==================================================

SEBELUM CODING, inspect project Kagoem Digital secara menyeluruh.

Cari:

- User
- Product
- Product Type
- Cart
- Checkout
- Order
- Order Item
- Payment
- Midtrans
- Order Fulfillment
- Subscription
- My Orders
- My Products

Jika project POS tersedia dan dapat diakses,
inspect juga:

- POS User
- POS Authentication
- POS Business / Company / Tenant / Store
- POS Role
- POS API
- POS user creation
- POS business creation
- POS access

Jangan mengarang struktur database aplikasi external.


==================================================
4. PRODUCT TYPE SUDAH ADA
==================================================

Product Type SUDAH ADA.

JANGAN membuat ulang:

- product_type
- product_type migration
- product_type enum
- duplicate product type system

Gunakan implementation existing.

Inspect value product_type yang sebenarnya digunakan.


==================================================
5. APPLICATION CONCEPT
==================================================

Tambahkan konsep Application jika belum tersedia.

Application mewakili aplikasi SaaS yang disediakan Kagoem.

Contoh:

POS
Inventory
Accounting
CRM
HR


Contoh data:

Application
----------------
id
name
slug
code
description
base_url
status
created_at
updated_at


CATATAN:

Jangan menggunakan struktur di atas secara otomatis.

Inspect architecture existing terlebih dahulu.

Gunakan naming convention project.

Jika sudah ada tabel/model yang memiliki fungsi serupa,
gunakan existing implementation.


==================================================
6. PRODUCT DAN APPLICATION
==================================================

Product dan Application adalah dua konsep berbeda.

PRODUCT:

Apa yang dijual.

Contoh:

POS Basic
POS Pro
Inventory Basic
Inventory Pro


APPLICATION:

Aplikasi yang diberikan aksesnya.

Contoh:

POS
Inventory


Relationship:

POS Basic
    ↓
Application = POS

POS Pro
    ↓
Application = POS

Inventory Basic
    ↓
Application = Inventory

Inventory Pro
    ↓
Application = Inventory


Jangan membuat satu Application untuk setiap Product Plan.


==================================================
7. SUBSCRIPTION DAN APPLICATION
==================================================

Subscription harus dapat mengetahui aplikasi yang
diberikan aksesnya.

Contoh:

Subscription
----------------
User = Andi
Product = POS Basic
Application = POS
Status = ACTIVE


Subscription
----------------
User = Andi
Product = Inventory Basic
Application = Inventory
Status = ACTIVE


Jika application dapat diturunkan dari product,
hindari menyimpan data duplicate.

Pilih desain yang paling konsisten dengan
architecture existing.


==================================================
8. PROVISIONING ENGINE
==================================================

Buat Generic Provisioning Engine.

Konsep:

ApplicationProvisioningService


Flow:

Payment PAID
    ↓
Order Fulfillment
    ↓
Subscription ACTIVE
    ↓
Provisioning Engine
    ↓
Get Application
    ↓
Resolve Adapter
    ↓
Provision Application
    ↓
Store Mapping
    ↓
COMPLETED


Jangan menempatkan logic POS secara langsung
di core provisioning service.


==================================================
9. APPLICATION ADAPTER
==================================================

Gunakan konsep adapter/interface.

Contoh konsep:

ApplicationProvisioningAdapter

Methods dapat berupa:

- provision()
- findAccount()
- createAccount()
- ensureAccess()
- suspendAccess()
- revokeAccess()

Namun JANGAN mengimplementasikan method
yang tidak diperlukan.

Gunakan interface/contract sesuai architecture
project existing.


==================================================
10. POS ADAPTER
==================================================

POS menjadi adapter pertama.

Contoh:

PosProvisioningAdapter


Flow:

Subscription ACTIVE
    ↓
Provisioning Engine
    ↓
Application = POS
    ↓
PosProvisioningAdapter
    ↓
Find/Create POS Account
    ↓
Ensure Access
    ↓
Return Provisioning Result


JANGAN menaruh logic POS di:

- Subscription model
- Order model
- Payment controller
- Midtrans webhook controller

Gunakan provisioning layer.


==================================================
11. FUTURE INVENTORY ADAPTER
==================================================

Architecture harus memungkinkan:

InventoryProvisioningAdapter


Flow:

Subscription ACTIVE
    ↓
Application = Inventory
    ↓
InventoryProvisioningAdapter
    ↓
Provision Inventory Account
    ↓
Grant Access


Tetapi JANGAN mengimplementasikan Inventory
provisioning penuh pada task ini.


==================================================
12. FUTURE ACCOUNTING ADAPTER
==================================================

Architecture harus memungkinkan:

AccountingProvisioningAdapter


Tanpa mengimplementasikan seluruh integration
Accounting sekarang.


==================================================
13. APPLICATION REGISTRY
==================================================

Provisioning Engine harus dapat menentukan:

Application = POS
    ↓
PosProvisioningAdapter


Application = Inventory
    ↓
InventoryProvisioningAdapter


Application = Accounting
    ↓
AccountingProvisioningAdapter


Jangan membuat:

if application == "pos"
    ...
else if application == "inventory"
    ...


di banyak tempat.

Gunakan registry/resolver/factory yang sesuai
dengan architecture project.


==================================================
14. ACCOUNT MAPPING
==================================================

Kagoem memiliki User sendiri.

External Application juga dapat memiliki User sendiri.

Jangan menggabungkan database user secara paksa.

Konsep:

KAGOEM
User Andi
    │
    │
    ▼
Subscription
    │
    ▼
Application
    │
    ▼
Application Account Mapping
    │
    ▼
External User


Mapping harus memungkinkan:

Kagoem User
→ POS User

Kagoem User
→ Inventory User

Kagoem User
→ Accounting User


Jangan membuat mapping khusus POS jika bisa dibuat generic.


==================================================
15. APPLICATION ACCOUNT
==================================================

Jika diperlukan, buat generic mapping seperti:

application_accounts

atau nama lain yang sesuai architecture.

Contoh informasi:

- id
- user_id
- application_id
- external_user_id
- external_account_id
- status
- metadata
- created_at
- updated_at

JANGAN menggunakan nama field di atas secara otomatis.

Sesuaikan dengan architecture existing.


==================================================
16. MULTIPLE APPLICATIONS
==================================================

Andi dapat memiliki beberapa subscription:

POS Basic
Inventory Basic
Accounting Basic


Maka:

Andi
 │
 ├── POS Subscription
 │      ↓
 │   POS Account
 │
 ├── Inventory Subscription
 │      ↓
 │   Inventory Account
 │
 └── Accounting Subscription
        ↓
     Accounting Account


Jangan membuat satu external account
untuk semua aplikasi jika masing-masing aplikasi
memiliki identity system berbeda.


==================================================
17. MULTIPLE PRODUCTS DALAM SATU APPLICATION
==================================================

Contoh:

POS Basic
POS Pro


Keduanya:

Application = POS


Jika Andi melakukan upgrade:

POS Basic
    ↓
POS Pro


Jangan membuat duplicate POS account.

Gunakan account existing dan update access/plan
sesuai business rule.


==================================================
18. IDEMPOTENCY
==================================================

Provisioning WAJIB idempotent.

Jika:

Subscription ACTIVE
    ↓
Provisioning
    ↓
SUCCESS


Kemudian provisioning dipanggil lagi:

Subscription ACTIVE
    ↓
Provisioning
    ↓
Existing Application Account
    ↓
Ensure Access
    ↓
SUCCESS


Jangan membuat duplicate:

- external user
- external business
- external tenant
- application account mapping


==================================================
19. PROVISIONING STATUS
==================================================

Sediakan status provisioning jika memang diperlukan.

Contoh:

pending
processing
completed
failed


Jika provisioning gagal:

Subscription tetap ACTIVE.

Payment tetap PAID.

Provisioning:

FAILED


Jangan mengubah:

Payment PAID → FAILED

hanya karena provisioning gagal.


==================================================
20. RETRY
==================================================

Provisioning harus dapat di-retry.

Contoh:

Payment PAID
    ↓
Subscription ACTIVE
    ↓
Provisioning FAILED
    ↓
Retry
    ↓
Provisioning SUCCESS


Retry tidak boleh membuat duplicate account.


==================================================
21. PAYMENT DAN PROVISIONING
==================================================

Payment dan Provisioning adalah dua concern berbeda.

Flow:

Payment
    ↓
PAID
    ↓
Subscription
    ↓
ACTIVE
    ↓
Provisioning


Jangan membuat provisioning sebagai bagian dari
Midtrans Controller secara langsung.


==================================================
22. ORDER FULFILLMENT
==================================================

Integrasikan dengan Order Fulfillment existing.

Flow:

Order
    ↓
Payment PAID
    ↓
Order Fulfillment
    ↓
Product Type


Jika:

product_type = subscription

    ↓
Create Subscription
    ↓
Application Provisioning


Jika:

product_type = digital

    ↓
Digital Product Access


Digital product TIDAK boleh menjalankan
Application Provisioning.


==================================================
23. DIGITAL PRODUCT
==================================================

Contoh:

Ebook
Source Code
UI Template


Flow:

Payment PAID
    ↓
Digital Fulfillment
    ↓
Digital Access


Tidak boleh:

Payment PAID
    ↓
Provision POS


==================================================
24. SERVICE-TO-SERVICE AUTHENTICATION
==================================================

Jika Kagoem berkomunikasi dengan external application
melalui API:

JANGAN menggunakan:

- customer password
- customer session
- frontend token customer


Gunakan service-to-service authentication.

Inspect apakah project sudah memiliki:

- API Key
- Service Token
- OAuth
- Client Credential
- Internal API Authentication


Jika belum tersedia,
gunakan mechanism yang aman dan configurable.


==================================================
25. ENVIRONMENT CONFIGURATION
==================================================

External application harus configurable.

Contoh konsep:

KAGOEM_POS_API_URL=
KAGOEM_POS_SERVICE_TOKEN=

KAGOEM_INVENTORY_API_URL=
KAGOEM_INVENTORY_SERVICE_TOKEN=

Namun JANGAN menambahkan environment variable
untuk aplikasi yang belum diintegrasikan
tanpa kebutuhan.

Jangan hardcode URL.


==================================================
26. SECURITY
==================================================

Pastikan:

Customer tidak dapat memanggil provisioning
secara bebas.

Provisioning hanya dapat dilakukan oleh
authorized internal process.

Jangan expose:

- service token
- API key
- external credentials
- internal endpoint credentials

ke frontend.


==================================================
27. PROVISIONING TRIGGER
==================================================

Provisioning harus dipicu setelah:

Payment verified
    ↓
Payment PAID
    ↓
Order PAID
    ↓
Subscription ACTIVE


Jangan trigger provisioning dari:

- checkout page
- frontend redirect
- frontend callback
- Snap JavaScript callback


==================================================
28. TRANSACTION SAFETY
==================================================

Jika Kagoem dan external application
menggunakan database berbeda:

JANGAN mencoba membuat distributed transaction
tanpa infrastructure yang memang mendukungnya.

Gunakan:

- provisioning status
- idempotency
- retry
- error handling


==================================================
29. LOGGING
==================================================

Log event provisioning:

- provisioning started
- provisioning completed
- provisioning failed
- retry

Minimal context:

- user_id
- subscription_id
- application_id
- provisioning status

JANGAN log:

- password
- service token
- API secret
- sensitive credential


==================================================
30. AUDIT
==================================================

Jika project sudah memiliki audit infrastructure,
gunakan implementation existing.

Contoh event:

APPLICATION_PROVISIONING_STARTED
APPLICATION_PROVISIONING_COMPLETED
APPLICATION_PROVISIONING_FAILED


==================================================
31. MY PRODUCTS INTEGRATION
==================================================

My Products harus dapat mengetahui:

Subscription
    ↓
Application
    ↓
Access Status


Contoh:

POS Basic

Application:
POS

Subscription:
ACTIVE

[ Buka POS ]


Inventory Basic

Application:
Inventory

Subscription:
ACTIVE

[ Buka Inventory ]


Jangan hardcode button berdasarkan nama product.

Gunakan Application configuration.


==================================================
32. APPLICATION URL
==================================================

Jangan hardcode:

https://pos.example.com

atau:

https://inventory.example.com


Gunakan configuration/application data
sesuai architecture existing.

Contoh:

Application
----------------
POS
Base URL
https://pos.example.com


Inventory
Base URL
https://inventory.example.com


==================================================
33. OPEN APPLICATION
==================================================

Jika provisioning selesai:

My Products
    ↓
POS
    ↓
[ Buka Aplikasi ]


Jika provisioning gagal:

POS
Status:
Provisioning Failed

[ Retry ]


Jika retry belum tersedia di frontend:

[ Detail ]


Jangan membuat button yang tidak memiliki
backend implementation.


==================================================
34. ACCESS CONTROL
==================================================

Customer hanya boleh membuka aplikasi
jika:

Subscription = ACTIVE
AND
Provisioning = COMPLETED


Jika:

Subscription = EXPIRED

maka application access nantinya dapat:

SUSPENDED


Full expiration/suspend mechanism BELUM perlu
diimplementasikan pada task ini.


==================================================
35. DATABASE
==================================================

Inspect database existing sebelum membuat migration.

Kemungkinan kebutuhan:

applications
subscriptions
application_accounts
provisionings

Tetapi JANGAN membuat semua tabel tersebut
secara otomatis.

Gunakan existing tables jika sudah tersedia.

Buat hanya yang memang diperlukan.


==================================================
36. ADMIN
==================================================

Jika project memiliki Admin Product Management,
siapkan kemampuan untuk menentukan Application
untuk subscription product.

Contoh:

Product:
POS Basic

Product Type:
subscription

Application:
POS


Product:
Inventory Basic

Product Type:
subscription

Application:
Inventory


Jika UI Admin belum diperlukan,
fokuskan implementation pada backend/data architecture.


==================================================
37. API
==================================================

Sesuaikan API existing.

Jika diperlukan:

GET /api/my-products

harus dapat memberikan:

- product
- application
- subscription
- status
- access information


Jangan membuat duplicate endpoint jika sudah ada.


==================================================
38. TESTING
==================================================

Buat automated tests minimal:

TEST 1
Subscription ACTIVE
→ Provisioning triggered


TEST 2
Subscription PENDING
→ Provisioning not triggered


TEST 3
Payment PENDING
→ Provisioning not triggered


TEST 4
Payment FAILED
→ Provisioning not triggered


TEST 5
Application = POS
→ POS adapter digunakan


TEST 6
Application = Inventory
→ architecture dapat resolve Inventory adapter
jika adapter tersedia


TEST 7
Same subscription provisioned twice
→ no duplicate account


TEST 8
Existing external user
→ reuse existing user


TEST 9
External API failure
→ provisioning FAILED


TEST 10
Failed provisioning
→ retry possible


TEST 11
Digital product
→ no application provisioning


TEST 12
Multiple applications
→ each subscription maps to correct application


TEST 13
Multiple products same application
→ no duplicate application account


TEST 14
Unauthorized customer
→ cannot manually trigger provisioning
for another customer


==================================================
39. MANUAL TEST
==================================================

Jika environment tersedia:

SCENARIO 1 — POS

1. Register Andi.
2. Login Kagoem.
3. Buy POS subscription.
4. Checkout.
5. Pay through Midtrans Sandbox.
6. Payment = PAID.
7. Subscription = ACTIVE.
8. Application = POS.
9. Provisioning = COMPLETED.
10. POS account tersedia.
11. Andi dapat membuka POS.


SCENARIO 2 — DIGITAL

1. Buy Ebook.
2. Pay.
3. Payment = PAID.
4. Digital Access = ACTIVE.
5. Tidak ada Application Provisioning.


SCENARIO 3 — MULTIPLE APPLICATION

Jika Inventory belum memiliki adapter/API,
gunakan automated test/mock.

Pastikan architecture dapat membedakan:

POS
vs
Inventory


==================================================
40. BACKWARD COMPATIBILITY
==================================================

Jangan merusak:

Registration
Email
Product
Cart
Checkout
My Orders
Midtrans
Payment
Order Fulfillment
Subscription
Digital Product
My Products


==================================================
41. GIT SAFETY
==================================================

Jangan menjalankan:

git reset --hard
git clean -fd
git checkout .


Jangan menghapus perubahan existing.

Jangan commit.

Jangan push.


==================================================
42. FINAL ARCHITECTURE
==================================================

Target architecture:

                         KAGOEM
                            │
                         Product
                            │
                    ┌───────┴───────┐
                    │               │
              Subscription       Digital
                    │               │
                    │               └── Digital Access
                    │
              Application
                    │
           Provisioning Engine
                    │
             Adapter Resolver
                    │
       ┌────────────┼────────────┐
       │            │            │
       ▼            ▼            ▼
    POS Adapter  Inventory    Accounting
                   Adapter      Adapter
       │            │            │
       ▼            ▼            ▼
      POS       Inventory    Accounting
    System       System        System


==================================================
43. FUTURE APPLICATION
==================================================

Architecture harus memungkinkan penambahan:

CRM
HR
Project Management
Warehouse
Accounting
Marketplace
dan aplikasi SaaS lainnya.


Penambahan aplikasi baru idealnya hanya membutuhkan:

1. Register Application.
2. Create Application Adapter.
3. Configure API/credentials.
4. Implement provisioning logic.
5. Add tests.

Core:

Order
Payment
Subscription
Fulfillment

tidak boleh perlu dirombak total.


==================================================
44. FINAL REVIEW
==================================================

Pastikan tidak ada:

- POS-specific logic di core Subscription
- POS-specific logic di Payment
- POS-specific logic di Order
- hardcoded external application URL
- hardcoded API credential
- duplicate user
- duplicate application account
- duplicate provisioning
- provisioning dari frontend
- provisioning untuk digital product


==================================================
45. FINAL REPORT
==================================================

Setelah selesai berikan:

## 1. Architecture Analysis

## 2. Existing Application Analysis

## 3. Existing Product Type Analysis

## 4. Subscription Architecture

## 5. Application Architecture

## 6. Provisioning Engine

## 7. Adapter Architecture

## 8. POS Integration

## 9. Future Inventory Integration

## 10. Account Mapping

## 11. API Changes

## 12. Database Changes

## 13. Security

## 14. Idempotency

## 15. Retry Mechanism

## 16. Error Handling

## 17. Logging

## 18. My Products Integration

## 19. Files Created

## 20. Files Modified

## 21. Automated Tests

## 22. Test Results

## 23. Manual Test Results

## 24. Known Issues

## 25. Future Extension Strategy

## 26. Recommended Next Task


==================================================
FINAL COMMAND
==================================================

Sekarang:

1. Baca file ini secara keseluruhan.
2. Inspect project Kagoem Digital.
3. Inspect Product Type yang sudah ada.
4. Inspect Product.
5. Inspect Order.
6. Inspect Order Item.
7. Inspect Payment.
8. Inspect Midtrans.
9. Inspect Order Fulfillment.
10. Inspect Subscription.
11. Inspect My Products.
12. Jika tersedia, inspect aplikasi POS.
13. Tentukan Application architecture berdasarkan hasil inspection.
14. Jangan mengarang struktur external application.
15. Implement Generic Application Provisioning.
16. Implement Provisioning Engine.
17. Implement Adapter architecture.
18. Implement POS adapter sebagai implementation pertama.
19. Implement account mapping jika diperlukan.
20. Implement provisioning status.
21. Implement idempotency.
22. Implement retry/error handling jika diperlukan.
23. Integrasikan dengan Subscription dan Order Fulfillment.
24. Pastikan Digital Product tidak memicu provisioning.
25. Buat automated tests.
26. Jalankan tests.
27. Fix semua error.
28. Retest.
29. Review seluruh perubahan.
30. Pastikan architecture dapat dikembangkan untuk Inventory,
    Accounting, CRM, HR, dan aplikasi SaaS lainnya.
31. Berikan final report.

JANGAN hanya memberikan rekomendasi atau contoh kode.

KERJAKAN LANGSUNG PADA PROJECT.

Jika ada keputusan architecture yang belum dapat ditentukan
karena struktur project/external application belum cukup jelas,
JANGAN mengarang.

Tunjukkan hasil inspection, jelaskan opsi yang tersedia,
dan pilih solusi paling aman yang sesuai dengan architecture existing.