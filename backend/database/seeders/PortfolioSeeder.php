<?php

namespace Database\Seeders;

use App\Models\Portfolio;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PortfolioSeeder extends Seeder
{
    public function run(): void
    {
        $portfolios = [
            [
                'title' => 'Sistem Inventory',
                'category' => 'ERP',
                'client_name' => 'RetailKu',
                'short_description' => 'Sistem manajemen stok gudang multi-cabang dengan laporan real-time.',
                'technologies' => ['Laravel', 'MySQL', 'Vue.js'],
                'is_featured' => true,
            ],
            [
                'title' => 'Aplikasi POS',
                'category' => 'POS',
                'client_name' => 'Kopi Senja',
                'short_description' => 'Aplikasi kasir tablet untuk kafe dengan integrasi pembayaran digital.',
                'technologies' => ['Laravel', 'MySQL', 'Flutter'],
                'is_featured' => true,
            ],
            [
                'title' => 'Dashboard ERP',
                'category' => 'Dashboard',
                'client_name' => 'LogistikPro',
                'short_description' => 'Dashboard analitik untuk memantau performa bisnis secara menyeluruh.',
                'technologies' => ['Laravel', 'PostgreSQL', 'Vue.js'],
                'is_featured' => true,
            ],
            [
                'title' => 'Mobile Sales Application',
                'category' => 'Mobile App',
                'client_name' => 'Sinar Jaya Distribusi',
                'short_description' => 'Aplikasi mobile untuk tim sales lapangan mencatat order dan visit klien.',
                'technologies' => ['Flutter', 'Laravel', 'MySQL'],
                'is_featured' => true,
            ],
            [
                'title' => 'Company Profile Website',
                'category' => 'Website',
                'client_name' => 'EduStart',
                'short_description' => 'Website company profile modern dan responsive untuk perusahaan jasa.',
                'technologies' => ['Laravel', 'Vue.js', 'MySQL'],
                'is_featured' => false,
            ],
            [
                'title' => 'HR Management System',
                'category' => 'Dashboard',
                'client_name' => 'Mitra Sejahtera Group',
                'short_description' => 'Sistem manajemen SDM untuk absensi, cuti, dan penggajian karyawan.',
                'technologies' => ['Laravel', 'MySQL'],
                'is_featured' => false,
            ],
        ];

        foreach ($portfolios as $i => $portfolio) {
            Portfolio::updateOrCreate(
                ['slug' => Str::slug($portfolio['title'])],
                [
                    'title' => $portfolio['title'],
                    'category' => $portfolio['category'],
                    'client_name' => $portfolio['client_name'],
                    'short_description' => $portfolio['short_description'],
                    'technologies' => $portfolio['technologies'],
                    'is_featured' => $portfolio['is_featured'],
                    'is_active' => true,
                    'sort_order' => $i,
                ],
            );
        }
    }
}
