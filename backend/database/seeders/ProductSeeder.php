<?php

namespace Database\Seeders;

use App\Enums\BillingInterval;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedDigitalProducts();
        $this->seedSubscriptionProducts();
    }

    private function seedDigitalProducts(): void
    {
        $digitalProducts = [
            [
                'name' => 'Laravel POS Starter Kit',
                'category' => 'Source Code',
                'short_description' => 'Source code aplikasi POS berbasis Laravel siap dikembangkan lebih lanjut.',
                'description' => "Starter kit lengkap untuk membangun aplikasi Point of Sale menggunakan Laravel. Sudah termasuk manajemen produk, transaksi, dan laporan penjualan dasar.\n\nCocok untuk developer yang ingin mempercepat proses development aplikasi kasir tanpa membangun dari nol.",
                'tags' => ['Laravel', 'POS', 'Source Code'],
                'price' => 299000,
                'discount_price' => null,
                'badge' => 'best_seller',
                'rating' => 4.8,
                'purchases_count' => 128,
                'technology' => ['Laravel', 'MySQL', 'Tailwind CSS'],
                'requirements' => ['PHP 8.2+', 'MySQL 8', 'Composer'],
                'whats_included' => ['Source code lengkap', 'Dokumentasi', 'Panduan instalasi', 'Update gratis 6 bulan', 'Support via email'],
                'faqs' => [
                    ['question' => 'Apakah source code bisa dimodifikasi bebas?', 'answer' => 'Ya, Anda mendapatkan hak penuh untuk memodifikasi source code sesuai kebutuhan bisnis Anda.'],
                    ['question' => 'Apakah tersedia demo sebelum membeli?', 'answer' => 'Tersedia demo online yang dapat dicoba langsung sebelum melakukan pembelian.'],
                ],
                'features' => [
                    ['name' => 'Manajemen Produk', 'description' => 'Kelola stok dan kategori produk dengan mudah.'],
                    ['name' => 'Transaksi Kasir', 'description' => 'Proses transaksi cepat dengan dukungan multi metode pembayaran.'],
                    ['name' => 'Laporan Penjualan', 'description' => 'Laporan harian, mingguan, dan bulanan otomatis.'],
                ],
                'demo_url' => null,
            ],
            [
                'name' => 'Template Undangan Digital Elegan',
                'category' => 'Template',
                'short_description' => 'Template undangan pernikahan digital dengan desain elegan dan responsive.',
                'description' => 'Template undangan digital siap pakai dengan animasi halus, galeri foto, RSVP, dan peta lokasi.',
                'tags' => ['Template', 'Undangan', 'Wedding'],
                'price' => 149000,
                'discount_price' => 99000,
                'badge' => 'sale',
                'rating' => 4.6,
                'purchases_count' => 340,
                'technology' => ['HTML', 'CSS', 'JavaScript'],
                'requirements' => ['Tidak perlu skill coding'],
                'whats_included' => ['File template lengkap', 'Panduan penggunaan', 'Free 1x revisi warna'],
                'faqs' => [
                    ['question' => 'Apakah bisa custom nama dan tanggal?', 'answer' => 'Bisa, semua detail acara dapat disesuaikan setelah pembelian.'],
                ],
                'features' => [
                    ['name' => 'RSVP Online', 'description' => 'Tamu dapat konfirmasi kehadiran secara online.'],
                    ['name' => 'Galeri Foto', 'description' => 'Menampilkan galeri foto pasangan.'],
                ],
                'demo_url' => null,
            ],
            [
                'name' => 'Ebook Panduan Digital Marketing untuk UMKM',
                'category' => 'Ebook',
                'short_description' => 'Panduan praktis strategi digital marketing untuk pelaku UMKM.',
                'description' => 'Ebook berisi strategi pemasaran digital yang dapat langsung diterapkan oleh pelaku UMKM, mulai dari media sosial hingga iklan berbayar.',
                'tags' => ['Ebook', 'Marketing', 'UMKM'],
                'price' => 79000,
                'discount_price' => null,
                'badge' => 'new',
                'rating' => 4.5,
                'purchases_count' => 56,
                'technology' => null,
                'requirements' => ['PDF reader'],
                'whats_included' => ['Ebook PDF 80 halaman', 'Template rencana konten', 'Update gratis'],
                'faqs' => [],
                'features' => [],
                'demo_url' => null,
            ],
        ];

        foreach ($digitalProducts as $i => $item) {
            $product = Product::updateOrCreate(
                ['slug' => Str::slug($item['name'])],
                [
                    'name' => $item['name'],
                    'type' => ProductType::Digital,
                    'category' => $item['category'],
                    'short_description' => $item['short_description'],
                    'description' => $item['description'],
                    'tags' => $item['tags'],
                    'price' => $item['price'],
                    'discount_price' => $item['discount_price'],
                    'badge' => $item['badge'],
                    'rating' => $item['rating'],
                    'purchases_count' => $item['purchases_count'],
                    'technology' => $item['technology'],
                    'requirements' => $item['requirements'],
                    'whats_included' => $item['whats_included'],
                    'faqs' => $item['faqs'],
                    'demo_url' => $item['demo_url'],
                    'status' => ProductStatus::Published,
                    'sort_order' => $i,
                    'published_at' => now()->subDays($i * 2),
                ],
            );

            $product->features()->delete();
            foreach ($item['features'] as $fi => $feature) {
                $product->features()->create([...$feature, 'sort_order' => $fi]);
            }
        }
    }

    private function seedSubscriptionProducts(): void
    {
        $subscriptionProducts = [
            [
                'name' => 'POS Cashier',
                'category' => 'Subscription',
                'short_description' => 'Aplikasi kasir untuk toko dan bisnis retail.',
                'description' => "Aplikasi kasir berbasis cloud untuk membantu operasional toko retail Anda. Kelola produk, transaksi, dan laporan dari mana saja.\n\nTersedia beberapa paket berlangganan sesuai skala bisnis Anda.",
                'tags' => ['POS', 'Kasir', 'Retail'],
                'badge' => 'popular',
                'rating' => 4.7,
                'purchases_count' => 210,
                'technology' => ['Laravel', 'React', 'Cloud Hosting'],
                'requirements' => ['Koneksi internet stabil'],
                'whats_included' => null,
                'faqs' => [
                    ['question' => 'Apakah bisa berhenti berlangganan kapan saja?', 'answer' => 'Bisa, Anda dapat membatalkan langganan kapan saja tanpa penalti.'],
                    ['question' => 'Apakah data tersimpan di cloud?', 'answer' => 'Ya, seluruh data transaksi tersimpan aman di cloud dan dapat diakses dari mana saja.'],
                ],
                'demo_url' => 'https://demo.kagoemdigital.com/pos-cashier',
                'plans' => [
                    [
                        'name' => 'Starter', 'price' => 49000, 'billing_interval' => BillingInterval::Monthly,
                        'max_users' => 1, 'max_branches' => 1, 'max_products' => 100, 'is_highlighted' => false,
                        'features' => [['feature' => '1 toko'], ['feature' => '1 user'], ['feature' => 'Product management'], ['feature' => 'Sales'], ['feature' => 'Reports']],
                    ],
                    [
                        'name' => 'Starter', 'price' => 470000, 'billing_interval' => BillingInterval::Yearly,
                        'max_users' => 1, 'max_branches' => 1, 'max_products' => 100, 'is_highlighted' => false,
                        'features' => [['feature' => '1 toko'], ['feature' => '1 user'], ['feature' => 'Product management'], ['feature' => 'Sales'], ['feature' => 'Reports']],
                    ],
                    [
                        'name' => 'Business', 'price' => 99000, 'billing_interval' => BillingInterval::Monthly,
                        'max_users' => 5, 'max_branches' => 3, 'max_products' => 500, 'is_highlighted' => true,
                        'features' => [['feature' => '3 toko'], ['feature' => '5 users'], ['feature' => 'Product management'], ['feature' => 'Sales'], ['feature' => 'Reports'], ['feature' => 'Inventory']],
                    ],
                    [
                        'name' => 'Business', 'price' => 950000, 'billing_interval' => BillingInterval::Yearly,
                        'max_users' => 5, 'max_branches' => 3, 'max_products' => 500, 'is_highlighted' => true,
                        'features' => [['feature' => '3 toko'], ['feature' => '5 users'], ['feature' => 'Product management'], ['feature' => 'Sales'], ['feature' => 'Reports'], ['feature' => 'Inventory']],
                    ],
                    [
                        'name' => 'Enterprise', 'price' => null, 'billing_interval' => BillingInterval::Monthly,
                        'max_users' => null, 'max_branches' => null, 'max_products' => null, 'is_highlighted' => false,
                        'cta_label' => 'Hubungi Kami',
                        'features' => [['feature' => 'Unlimited users'], ['feature' => 'Multi branch'], ['feature' => 'Custom feature'], ['feature' => 'Priority support']],
                    ],
                ],
            ],
            [
                'name' => 'Inventory Manager',
                'category' => 'Software',
                'short_description' => 'Aplikasi manajemen inventory untuk gudang dan multi cabang.',
                'description' => 'Kelola stok barang, mutasi antar gudang, dan laporan inventory secara real-time.',
                'tags' => ['Inventory', 'Warehouse'],
                'badge' => null,
                'rating' => 4.4,
                'purchases_count' => 64,
                'technology' => ['Laravel', 'React'],
                'requirements' => ['Koneksi internet stabil'],
                'whats_included' => null,
                'faqs' => [],
                'demo_url' => null,
                'plans' => [
                    [
                        'name' => 'Starter', 'price' => 59000, 'billing_interval' => BillingInterval::Monthly,
                        'max_users' => 2, 'max_branches' => 1, 'max_products' => 200, 'is_highlighted' => false,
                        'features' => [['feature' => '1 gudang'], ['feature' => '2 users'], ['feature' => 'Stock tracking']],
                    ],
                    [
                        'name' => 'Business', 'price' => 129000, 'billing_interval' => BillingInterval::Monthly,
                        'max_users' => 10, 'max_branches' => 5, 'max_products' => 1000, 'is_highlighted' => true,
                        'features' => [['feature' => '5 gudang'], ['feature' => '10 users'], ['feature' => 'Stock tracking'], ['feature' => 'Multi warehouse transfer']],
                    ],
                ],
            ],
        ];

        foreach ($subscriptionProducts as $i => $item) {
            $product = Product::updateOrCreate(
                ['slug' => Str::slug($item['name'])],
                [
                    'name' => $item['name'],
                    'type' => ProductType::Subscription,
                    'category' => $item['category'],
                    'short_description' => $item['short_description'],
                    'description' => $item['description'],
                    'tags' => $item['tags'],
                    'badge' => $item['badge'],
                    'rating' => $item['rating'],
                    'purchases_count' => $item['purchases_count'],
                    'technology' => $item['technology'],
                    'requirements' => $item['requirements'],
                    'whats_included' => $item['whats_included'],
                    'faqs' => $item['faqs'],
                    'demo_url' => $item['demo_url'],
                    'status' => ProductStatus::Published,
                    'sort_order' => $i,
                    'published_at' => now()->subDays($i * 2),
                ],
            );

            $product->plans()->delete();
            foreach ($item['plans'] as $pi => $planData) {
                $features = $planData['features'] ?? [];
                unset($planData['features']);

                $plan = $product->plans()->create([...$planData, 'sort_order' => $pi]);

                foreach ($features as $fi => $feature) {
                    $plan->planFeatures()->create([...$feature, 'sort_order' => $fi]);
                }
            }
        }
    }
}
