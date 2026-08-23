<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['title' => 'Website Development', 'short_description' => 'Company profile, landing page, hingga portal berbasis web yang cepat dan modern.'],
            ['title' => 'Mobile Application', 'short_description' => 'Aplikasi mobile Android dan iOS untuk menjangkau pelanggan di mana saja.'],
            ['title' => 'Sistem Informasi', 'short_description' => 'Sistem informasi yang membantu operasional bisnis lebih terstruktur dan efisien.'],
            ['title' => 'Custom Business Application', 'short_description' => 'Aplikasi bisnis yang dibangun khusus sesuai proses kerja perusahaan Anda.'],
            ['title' => 'Inventory System', 'short_description' => 'Kelola stok dan pergudangan secara real-time dan akurat.'],
            ['title' => 'POS / Cashier System', 'short_description' => 'Sistem kasir modern untuk transaksi retail dan F&B yang cepat dan andal.'],
            ['title' => 'ERP & Business System', 'short_description' => 'Integrasikan seluruh proses bisnis dalam satu sistem ERP yang scalable.'],
            ['title' => 'API Integration', 'short_description' => 'Hubungkan sistem Anda dengan layanan pihak ketiga melalui REST API.'],
            ['title' => 'Maintenance & Support', 'short_description' => 'Dukungan teknis berkelanjutan agar aplikasi Anda tetap berjalan optimal.'],
        ];

        foreach ($services as $i => $service) {
            Service::updateOrCreate(
                ['slug' => Str::slug($service['title'])],
                [
                    'title' => $service['title'],
                    'short_description' => $service['short_description'],
                    'is_active' => true,
                    'sort_order' => $i,
                ],
            );
        }
    }
}
