# Prompt untuk Claude: Integrasi Frontend Kagoem Digital dengan Laravel Backend

Saya memiliki project website bernama **Kagoem Digital**.

Kagoem Digital adalah usaha jasa pembuatan aplikasi dan solusi digital yang saat ini masih dikelola secara perorangan oleh **Gugum Gumilar**.

Frontend website sudah dibuat menggunakan **Lovable**. Saya ingin melanjutkan project tersebut menjadi aplikasi fullstack.

## TUJUAN

Gunakan frontend hasil Lovable yang sudah tersedia sebagai frontend utama.

Buat backend menggunakan:

* Laravel
* MySQL
* REST API
* Laravel Sanctum untuk login admin

Jangan membuat ulang frontend dari nol.

Jangan mengubah desain utama yang sudah dibuat oleh Lovable.

Pertahankan:

* Layout
* Warna
* Typography
* Responsive design
* Komponen
* Navigasi
* Hero section
* CTA
* Gaya visual modern dengan warna biru dan cyan

---

# KONSEP WEBSITE

Website memiliki menu:

* Home
* About
* Services
* Portfolio
* FAQ
* Contact

Tampilan utama menggunakan konsep modern software/digital agency.

Hero section memiliki pesan utama:

**Mewujudkan Solusi Digital untuk Bisnis Anda**

Website ditujukan untuk:

* Perusahaan
* UMKM
* Startup
* Instansi

Layanan utama:

* Website Development
* Mobile Application
* Sistem Informasi
* Custom Business Application
* Inventory System
* POS / Cashier System
* ERP & Business System
* API Integration
* Maintenance & Support

---

# LANGKAH PERTAMA

Sebelum membuat backend atau mengubah kode:

1. Analisis seluruh struktur project frontend yang sudah tersedia.
2. Identifikasi framework yang digunakan.
3. Periksa package.json.
4. Periksa struktur folder.
5. Identifikasi halaman dan komponen.
6. Identifikasi routing.
7. Identifikasi apakah menggunakan TypeScript.
8. Identifikasi cara terbaik mengintegrasikan REST API Laravel.

Jelaskan hasil analisis secara singkat.

PENTING:

Jangan langsung mengganti kode frontend.

Jangan menghapus komponen yang sudah ada.

Gunakan struktur project yang sudah tersedia.

---

# BACKEND

Buat backend menggunakan Laravel.

Gunakan:

* Laravel versi stabil
* MySQL
* Eloquent ORM
* Migration
* Seeder
* Form Request Validation
* Laravel Sanctum
* REST API

API menggunakan prefix:

/api/v1

---

# DATABASE

Buat tabel berikut.

## USERS

Digunakan untuk login admin.

Fields:

* id
* name
* email
* password
* timestamps

Pada tahap awal cukup satu role:

admin

---

## SERVICES

Digunakan untuk mengelola layanan yang ditampilkan pada website.

Fields:

* id
* title
* slug
* short_description
* description nullable
* icon nullable
* is_active
* sort_order
* timestamps

Buat data awal:

1. Website Development
2. Mobile Application
3. Sistem Informasi
4. Custom Business Application
5. Inventory System
6. POS System
7. ERP & Business System
8. API Integration
9. Maintenance & Support

---

## PORTFOLIOS

Digunakan untuk menampilkan portfolio project.

Fields:

* id
* title
* slug
* category
* short_description
* description nullable
* technologies JSON nullable
* image nullable
* project_url nullable
* is_featured
* is_active
* sort_order
* timestamps

Buat beberapa sample portfolio sesuai desain.

Contoh:

* Sistem Inventory
* Aplikasi POS
* Dashboard ERP
* Mobile Sales Application

---

## FAQS

Fields:

* id
* question
* answer
* is_active
* sort_order
* timestamps

Buat beberapa FAQ awal.

Contoh:

* Berapa biaya pembuatan aplikasi?
* Berapa lama proses pengerjaan?
* Apakah bisa membuat aplikasi sesuai kebutuhan?
* Apakah tersedia maintenance setelah aplikasi selesai?

---

## CONTACT_MESSAGES

Digunakan untuk menyimpan pesan dari calon klien.

Fields:

* id
* name
* email
* phone nullable
* company nullable
* service_id nullable
* message
* status
* timestamps

Status:

* new
* contacted
* closed

---

## SITE_SETTINGS

Digunakan untuk informasi dasar website.

Fields:

* id
* key
* value
* timestamps

Data awal:

* site_name
* owner_name
* email
* whatsapp
* linkedin
* github
* instagram

---

# PUBLIC API

Buat API berikut.

## Services

GET /api/v1/services

## Portfolio

GET /api/v1/portfolios

GET /api/v1/portfolios/{slug}

GET /api/v1/portfolios/featured

## FAQ

GET /api/v1/faqs

## Settings

GET /api/v1/settings

## Contact

POST /api/v1/contact

Contact form harus:

1. Memvalidasi input.
2. Menyimpan pesan ke database.
3. Mengembalikan response JSON.
4. Menampilkan error validation dengan benar.

---

# AUTHENTICATION

Gunakan Laravel Sanctum.

Endpoints:

POST /api/v1/auth/login

POST /api/v1/auth/logout

GET /api/v1/auth/me

Admin endpoint harus membutuhkan authentication.

---

# ADMIN API

Buat CRUD sederhana untuk:

* Services
* Portfolio
* FAQ
* Contact Messages
* Site Settings

Tidak perlu membuat fitur yang berlebihan.

Admin digunakan untuk mengelola konten website.

---

# FRONTEND INTEGRATION

Hubungkan frontend Lovable ke backend Laravel.

Jangan gunakan mock data setelah API selesai dibuat.

Gunakan environment variable.

Contoh:

VITE_API_URL=http://localhost:8000/api/v1

Buat API client/service terpusat sesuai struktur frontend yang sudah ada.

Contoh jika sesuai:

src/
├── services/
│   ├── api.ts
│   ├── services.ts
│   ├── portfolios.ts
│   ├── faqs.ts
│   └── contact.ts
├── types/
└── components/

Sesuaikan struktur ini dengan struktur project frontend sebenarnya.

Jangan memaksakan struktur baru jika project sudah memiliki struktur yang lebih baik.

---

# INTEGRASI HALAMAN

## HOME

Tampilkan data layanan dari API.

Tampilkan featured portfolio dari API.

Data statistik pada hero boleh tetap static terlebih dahulu.

---

## SERVICES

Data layanan harus diambil dari API.

Tampilkan:

* Icon
* Judul
* Deskripsi

---

## PORTFOLIO

Data portfolio harus berasal dari API.

Tambahkan:

* Loading state
* Empty state
* Error state

Jika ada kategori pada frontend, gunakan untuk filtering.

---

## FAQ

Data FAQ harus berasal dari API.

Gunakan tampilan accordion yang sudah tersedia pada desain.

---

## CONTACT

Hubungkan form dengan:

POST /api/v1/contact

Saat submit:

1. Validasi form.
2. Tampilkan loading.
3. Kirim data ke backend.
4. Tampilkan notifikasi sukses.
5. Reset form jika berhasil.
6. Tampilkan pesan error jika gagal.

---

# ADMIN PANEL

Buat admin panel yang sederhana.

Karena website ini masih dikelola sendiri, jangan membuat admin panel terlalu kompleks.

Fitur:

* Login
* Logout
* Dashboard sederhana
* Kelola Services
* Kelola Portfolio
* Kelola FAQ
* Lihat Contact Messages
* Kelola Site Settings

Dashboard cukup menampilkan:

* Jumlah Services
* Jumlah Portfolio
* Jumlah Contact Messages
* Pesan terbaru

Gunakan desain yang sederhana dan responsive.

Admin panel boleh menggunakan desain terpisah dari landing page.

---

# FILE UPLOAD

Portfolio dapat memiliki gambar.

Gunakan Laravel Storage.

Validasi:

* Hanya image yang valid
* Batasi ukuran file
* Gunakan storage yang aman

Dokumentasikan:

php artisan storage:link

---

# RESPONSE API

Gunakan response yang konsisten.

Success:

{
"success": true,
"message": "Success",
"data": {}
}

Validation Error:

{
"success": false,
"message": "Validation failed",
"errors": {}
}

Gunakan HTTP status code yang benar.

---

# CODE QUALITY

Gunakan prinsip:

* Simple
* Clean
* Maintainable
* DRY
* KISS

Project ini masih dikelola oleh satu developer.

Jangan membuat:

* Microservices
* Repository pattern yang tidak diperlukan
* CQRS
* Event system yang kompleks
* Architecture yang berlebihan

Gunakan pendekatan Laravel standar yang clean dan mudah dipahami.

---

# IMPLEMENTATION ORDER

Kerjakan secara bertahap.

STEP 1:
Analisis frontend Lovable terlebih dahulu.

STEP 2:
Setup Laravel dan MySQL.

STEP 3:
Buat migration, model, dan seeder.

STEP 4:
Buat Public API.

STEP 5:
Buat authentication menggunakan Sanctum.

STEP 6:
Buat Admin API.

STEP 7:
Hubungkan frontend Lovable dengan API Laravel.

STEP 8:
Buat admin panel sederhana.

STEP 9:
Testing seluruh fitur.

---

# TESTING CHECKLIST

Pastikan:

* Website frontend tetap berjalan.
* Desain Lovable tidak rusak.
* Responsive desktop dan mobile tetap baik.
* Services berhasil diambil dari API.
* Portfolio berhasil diambil dari API.
* FAQ berhasil diambil dari API.
* Contact form berhasil menyimpan data.
* Admin dapat login.
* Admin CRUD berfungsi.
* File upload berfungsi.
* Protected API tidak bisa diakses tanpa login.
* Error API ditangani dengan baik.

---

# README

Buat README.md yang menjelaskan:

1. Requirement.
2. Cara setup frontend.
3. Cara setup backend Laravel.
4. Cara membuat database MySQL.
5. Konfigurasi .env.
6. Migration.
7. Seeder.
8. Storage link.
9. Cara menjalankan Laravel.
10. Cara menjalankan frontend.
11. API utama.

---

# IMPORTANT

Mulai dari STEP 1.

Analisis project frontend yang tersedia terlebih dahulu.

Jangan langsung membuat ulang frontend.

Jangan mengubah desain Kagoem Digital secara signifikan.

Setelah memahami struktur frontend, implementasikan backend dan integrasi secara bertahap.

Prioritas utama adalah membuat website Kagoem Digital yang sudah memiliki desain bagus menjadi website yang benar-benar berfungsi dan mudah dikelola.
