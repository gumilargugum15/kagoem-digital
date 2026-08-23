# Kagoem Digital

Website fullstack untuk **Kagoem Digital** — frontend React + Vite (SPA), backend menggunakan Laravel + MySQL sebagai REST API.

## Struktur Project

```
.
├── frontend/       # Frontend (React + Vite SPA, client-side routing via react-router-dom)
│   ├── src/
│   └── .env        # Env frontend (VITE_API_URL)
├── backend/        # Backend (Laravel)
└── prompt.md       # Spesifikasi awal project
```

## Requirement

- Node.js 18+ (disarankan 20/22 — Node 14 bawaan sistem lama TIDAK cukup untuk Vite 8/React 19)
- PHP 8.2+ (project ini dikembangkan dengan PHP 8.4)
- Composer 2
- MySQL / MariaDB
- npm

## 1. Setup Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env   # jika belum ada .env
php artisan key:generate
```

### Buat Database MySQL

```sql
CREATE DATABASE kagoem_digital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kagoem'@'localhost' IDENTIFIED BY 'kagoem_secret';
GRANT ALL PRIVILEGES ON kagoem_digital.* TO 'kagoem'@'localhost';
FLUSH PRIVILEGES;
```

### Konfigurasi `.env` backend

Edit `backend/.env`:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kagoem_digital
DB_USERNAME=kagoem
DB_PASSWORD=kagoem_secret

FRONTEND_URL=http://localhost:3000
```

### Migration & Seeder

```bash
php artisan migrate --seed
```

Seeder akan membuat:
- 1 admin user (`admin@kagoemdigital.com` / `password` — **ganti setelah setup**)
- 9 services, 6 portfolio, 4 FAQ, 7 site settings (data awal sesuai `prompt.md`)

### Storage Link (untuk upload gambar portfolio)

```bash
php artisan storage:link
```

### Jalankan Laravel

```bash
php artisan serve
```

Backend berjalan di `http://localhost:8000`, API di `http://localhost:8000/api/v1`.

## 2. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env   # sesuaikan VITE_API_URL jika backend tidak di localhost:8000
npm run dev
```

Frontend berjalan di `http://localhost:5173` (default Vite dev server).

> Jika port 5173 sudah dipakai proses lain di server, jalankan dengan `npm run dev -- --port 5174` dan sesuaikan.

## Admin Panel

- URL: `http://localhost:5173/admin/login` (menyesuaikan port frontend)
- Login default: `admin@kagoemdigital.com` / `password`
- Fitur: Dashboard ringkas, kelola Services, Portfolio (dengan upload gambar), FAQ, lihat & kelola Contact Messages, kelola Site Settings.

## API Utama

Base URL: `http://localhost:8000/api/v1`

**Public**

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/services` | Daftar layanan aktif |
| GET | `/portfolios` | Daftar portfolio aktif (`?category=` untuk filter) |
| GET | `/portfolios/featured` | Portfolio unggulan |
| GET | `/portfolios/{slug}` | Detail portfolio |
| GET | `/faqs` | Daftar FAQ aktif |
| GET | `/settings` | Informasi dasar website (key-value) |
| GET | `/stats` | Statistik jumlah project & client (untuk hero section) |
| POST | `/contact` | Kirim pesan dari form kontak |

**Auth**

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| POST | `/auth/login` | Login admin (Sanctum token) |
| POST | `/auth/logout` | Logout (butuh token) |
| GET | `/auth/me` | Info admin yang sedang login (butuh token) |

**Admin** (semua butuh header `Authorization: Bearer <token>`)

| Method | Endpoint |
| --- | --- |
| GET | `/admin/dashboard` |
| GET/POST/PUT/DELETE | `/admin/services`, `/admin/services/{id}` |
| GET/POST/PUT/DELETE | `/admin/portfolios`, `/admin/portfolios/{id}` |
| GET/POST/PUT/DELETE | `/admin/faqs`, `/admin/faqs/{id}` |
| GET/PATCH/DELETE | `/admin/contact-messages`, `/admin/contact-messages/{id}` |
| GET/PUT | `/admin/settings` |

Semua response mengikuti format konsisten:

```json
{ "success": true, "message": "Success", "data": { } }
```

```json
{ "success": false, "message": "Validation failed", "errors": { } }
```

## Catatan

- Frontend adalah SPA murni (tidak ada SSR) — routing client-side menggunakan `react-router-dom`, di-build dengan Vite standar (`@vitejs/plugin-react` + `@tailwindcss/vite`).
- Layout, warna, typography, navigasi, hero, dan CTA landing page dipertahankan seperti desain awal — hanya data yang sebelumnya hardcode kini diambil dari API Laravel.
- Admin panel (`/admin/*`) menggunakan desain terpisah (sidebar + tabel) dari landing page publik.
- Karena SPA di-serve statis, saat deploy ke server produksi pastikan semua request non-file di-rewrite ke `index.html` (fallback SPA routing), misalnya `try_files $uri /index.html;` di Nginx.
