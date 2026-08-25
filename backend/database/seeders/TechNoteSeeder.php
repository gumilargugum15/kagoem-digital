<?php

namespace Database\Seeders;

use App\Models\TechNote;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TechNoteSeeder extends Seeder
{
    public function run(): void
    {
        $notes = [
            [
                'title' => 'Cara Membuat REST API Laravel dengan Sanctum',
                'category' => 'Laravel',
                'excerpt' => 'Panduan membuat authentication API menggunakan Laravel Sanctum dari awal sampai deployment.',
                'tags' => ['Laravel', 'API', 'Sanctum'],
                'content' => <<<'MD'
## Introduction

Laravel Sanctum menyediakan cara ringan untuk melakukan authentication pada SPA, mobile app, maupun API sederhana menggunakan token. Pada tutorial ini kita akan membuat endpoint login yang mengembalikan token Sanctum.

## Persiapan

Install Sanctum melalui composer lalu publish konfigurasinya:

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

Tambahkan trait `HasApiTokens` pada model `User`:

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
}
```

## Implementasi

Buat `LoginRequest` untuk validasi input, kemudian buat `AuthController` dengan method `login`:

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
```

Daftarkan route-nya:

```php
Route::post('/auth/login', [AuthController::class, 'login']);
```

## Testing

Uji endpoint dengan curl atau Postman:

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Accept: application/json" \
  -d "email=admin@kagoemdigital.com&password=password"
```

Response yang berhasil akan mengembalikan `token` yang dapat digunakan pada header `Authorization: Bearer <token>` untuk mengakses endpoint yang dilindungi.
MD,
            ],
            [
                'title' => 'Optimasi Query Eloquent agar Tidak N+1',
                'category' => 'Laravel',
                'excerpt' => 'Kenali masalah N+1 query pada Eloquent dan cara mengatasinya dengan eager loading.',
                'tags' => ['Laravel', 'MySQL', 'Best Practice'],
                'content' => <<<'MD'
## Introduction

Masalah N+1 query adalah salah satu penyebab utama aplikasi Laravel menjadi lambat ketika data mulai banyak.

## Mengenali Masalah

Perhatikan kode berikut:

```php
$portfolios = Portfolio::all();

foreach ($portfolios as $portfolio) {
    echo $portfolio->category;
}
```

Jika relasi diakses di dalam loop, setiap iterasi bisa memicu query tambahan.

## Solusi: Eager Loading

Gunakan method `with()` untuk memuat relasi sekaligus:

```php
$portfolios = Portfolio::with('category')->get();
```

## Testing

Gunakan Laravel Debugbar atau `DB::listen()` untuk memantau jumlah query yang dieksekusi sebelum dan setelah optimasi.
MD,
            ],
            [
                'title' => 'Mengelola State di React dengan useReducer',
                'category' => 'React',
                'excerpt' => 'Kapan sebaiknya beralih dari useState ke useReducer untuk state management yang lebih terstruktur.',
                'tags' => ['React', 'JavaScript', 'TypeScript'],
                'content' => <<<'MD'
## Introduction

Ketika state sebuah komponen semakin kompleks dengan banyak field yang saling berhubungan, `useReducer` menjadi pilihan yang lebih rapi dibanding beberapa `useState` terpisah.

## Persiapan

```tsx
type State = { count: number };
type Action = { type: "increment" } | { type: "decrement" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
  }
}
```

## Implementasi

```tsx
const [state, dispatch] = useReducer(reducer, { count: 0 });

return (
  <button onClick={() => dispatch({ type: "increment" })}>
    {state.count}
  </button>
);
```

## Testing

Gunakan React Testing Library untuk memastikan dispatch action mengubah state sesuai ekspektasi.
MD,
            ],
            [
                'title' => 'Setup CI/CD Sederhana dengan GitLab CI',
                'category' => 'GitLab',
                'excerpt' => 'Konfigurasi pipeline GitLab CI untuk menjalankan test otomatis setiap push ke branch main.',
                'tags' => ['GitLab', 'DevOps', 'CI/CD'],
                'content' => <<<'MD'
## Introduction

GitLab CI memungkinkan kita menjalankan pipeline otomatis setiap kali ada perubahan kode.

## Persiapan

Buat file `.gitlab-ci.yml` di root project:

```yaml
stages:
  - test

test:
  stage: test
  image: php:8.4
  script:
    - composer install
    - php artisan test
```

## Implementasi

Tambahkan job untuk build frontend:

```yaml
build:
  stage: build
  image: node:22
  script:
    - npm ci
    - npm run build
```

## Testing

Push commit ke branch dan periksa tab **CI/CD > Pipelines** di GitLab untuk memastikan seluruh job berjalan sukses (warna hijau).
MD,
            ],
            [
                'title' => 'Deploy Aplikasi Laravel ke VPS dengan Nginx',
                'category' => 'DevOps',
                'excerpt' => 'Langkah-langkah deploy aplikasi Laravel production-ready ke VPS Ubuntu menggunakan Nginx.',
                'tags' => ['DevOps', 'Linux', 'VPS'],
                'content' => <<<'MD'
## Introduction

Deploy Laravel ke VPS membutuhkan konfigurasi web server, PHP-FPM, dan database yang tepat.

## Persiapan

Install dependency dasar di server:

```bash
sudo apt update
sudo apt install nginx mysql-server php8.4-fpm php8.4-mbstring php8.4-xml
```

## Implementasi

Contoh konfigurasi Nginx:

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/app/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
    }
}
```

## Testing

Jalankan `php artisan config:cache` dan `php artisan migrate --force`, lalu akses domain untuk memastikan aplikasi berjalan tanpa error 500.
MD,
            ],
            [
                'title' => 'Menggunakan Docker Compose untuk Local Development',
                'category' => 'Docker',
                'excerpt' => 'Menyiapkan environment PHP, MySQL, dan Node.js dengan satu file docker-compose.yml.',
                'tags' => ['Docker', 'Linux', 'DevOps'],
                'content' => <<<'MD'
## Introduction

Docker Compose mempermudah setup environment development tanpa harus install PHP, MySQL, dan Node.js langsung di komputer.

## Persiapan

Buat file `docker-compose.yml`:

```yaml
services:
  app:
    image: php:8.4-fpm
    volumes:
      - ./backend:/var/www/html
  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: kagoem_digital
      MYSQL_ROOT_PASSWORD: secret
```

## Implementasi

Jalankan seluruh service:

```bash
docker compose up -d
```

## Testing

Cek status container dengan `docker compose ps` dan pastikan aplikasi bisa diakses melalui `http://localhost`.
MD,
            ],
        ];

        foreach ($notes as $i => $note) {
            TechNote::updateOrCreate(
                ['slug' => Str::slug($note['title'])],
                [
                    'title' => $note['title'],
                    'category' => $note['category'],
                    'excerpt' => $note['excerpt'],
                    'content' => $note['content'],
                    'tags' => $note['tags'],
                    'author_name' => 'Kagoem Digital Team',
                    'is_active' => true,
                    'published_at' => now()->subDays($i * 3),
                ],
            );
        }
    }
}
