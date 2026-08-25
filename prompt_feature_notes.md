Saya ingin menambahkan fitur baru bernama "Tech Notes" ke website Kagoem Digital yang sedang saya kerjakan.

PENTING:
Jangan langsung mengubah kode sebelum memahami struktur project yang ada.

==================================================
1. ANALISIS PROJECT TERLEBIH DAHULU
==================================================

Sebelum melakukan perubahan:

1. Periksa struktur folder project.
2. Identifikasi framework yang digunakan.
3. Identifikasi routing yang digunakan.
4. Identifikasi komponen layout/navbar/footer.
5. Identifikasi sistem styling/design system.
6. Identifikasi apakah project sudah memiliki backend/API/database.
7. Identifikasi sistem authentication/admin jika sudah tersedia.
8. Identifikasi cara upload file/image yang sudah digunakan.
9. Identifikasi apakah sudah ada rich text editor atau markdown editor.
10. Identifikasi package yang sudah digunakan dan gunakan kembali jika memungkinkan.

Jangan mengganti framework, arsitektur, atau library utama yang sudah ada.

Gunakan pola coding dan struktur project yang sudah tersedia.

==================================================
2. MENU BARU: TECH NOTES
==================================================

Tambahkan satu menu baru pada navbar utama:

Tech Notes

Navbar menjadi kira-kira:

Home
About
Services
Portfolio
Tech Notes
FAQ
Contact

Pertahankan desain navbar yang sudah ada.

Jangan mengubah style menu yang sudah ada secara drastis.

Menu "Tech Notes" harus terlihat menyatu dengan desain website Kagoem Digital.

Pada desktop:
Tech Notes tampil sebagai menu biasa.

Pada mobile:
Masukkan Tech Notes ke dalam mobile navigation/menu yang sudah digunakan.

==================================================
3. KONSEP TECH NOTES
==================================================

Tech Notes bukan sekadar blog biasa.

Tech Notes adalah platform artikel teknologi milik Kagoem Digital yang digunakan untuk:

- Tutorial programming
- Tutorial Laravel
- Tutorial React
- Tutorial Vue
- Tutorial Flutter
- JavaScript
- TypeScript
- PHP
- MySQL
- PostgreSQL
- Git
- GitLab
- DevOps
- Linux
- Docker
- VPS
- API
- Troubleshooting
- Tips development
- Pengalaman development
- Problem solving
- Best practice software development

Tujuan utama:

1. Memberikan knowledge kepada pengunjung.
2. Mendatangkan traffic dari Google.
3. Menunjukkan expertise Kagoem Digital.
4. Mengarahkan pengunjung ke Services.
5. Mengarahkan pengunjung ke Portfolio.
6. Menghasilkan calon customer.

==================================================
4. HALAMAN TECH NOTES
==================================================

Buat halaman:

/tech-notes

atau mengikuti sistem routing yang sudah digunakan project.

Header:

TECH NOTES

"Catatan, tutorial, dan solusi seputar teknologi dan pengembangan aplikasi."

Tambahkan search box:

"🔍 Cari artikel..."

Tambahkan filter kategori.

Kategori awal:

- All
- Laravel
- PHP
- React
- Vue
- Flutter
- JavaScript
- TypeScript
- MySQL
- PostgreSQL
- Git
- GitLab
- DevOps
- Linux
- Docker
- API
- Tutorial
- Troubleshooting

==================================================
5. ARTICLE CARD
==================================================

Tampilkan artikel dalam bentuk card.

Setiap card memiliki:

- Thumbnail
- Category
- Judul
- Excerpt
- Author
- Published date
- Reading time
- Tags

Contoh:

--------------------------------------------------

[LARAVEL]

Cara Membuat REST API Laravel dengan Sanctum

Panduan membuat authentication API menggunakan Laravel
Sanctum dari awal sampai deployment.

10 min read
24 Aug 2026

[Laravel] [API] [Sanctum]

Baca Artikel →

--------------------------------------------------

Gunakan desain yang modern, bersih dan premium.

Tetap mengikuti visual identity Kagoem Digital.

==================================================
6. DETAIL ARTIKEL
==================================================

Buat halaman detail:

/tech-notes/{slug}

Contoh:

/tech-notes/cara-membuat-rest-api-laravel

Layout:

--------------------------------------------------

CATEGORY

Cara Membuat REST API Laravel dengan Sanctum

24 August 2026
10 min read

--------------------------------------------------

Thumbnail / Hero Image

--------------------------------------------------

Introduction

Isi artikel...

## Persiapan

Isi artikel...

## Implementasi

Isi artikel...

Code Block

Isi artikel...

## Testing

Isi artikel...

--------------------------------------------------

Related Articles

--------------------------------------------------

Author

--------------------------------------------------

CTA Kagoem Digital

--------------------------------------------------

==================================================
7. CODE BLOCK
==================================================

INI ADALAH FITUR PENTING.

Artikel harus mendukung code block seperti artikel developer profesional.

Jika user memasukkan:

```php
public function login(LoginRequest $request): JsonResponse
{
    [$user, $token] = $this->authService->login(
        $request->string('email')->toString(),
        $request->string('password')->toString(),
    );

    return $this->success([
        'user' => new UserResource($user),
        'token' => $token,
    ], 'Login berhasil');
}