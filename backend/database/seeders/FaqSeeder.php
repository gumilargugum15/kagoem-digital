<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            [
                'question' => 'Berapa biaya pembuatan aplikasi?',
                'answer' => 'Biaya bervariasi sesuai kompleksitas dan fitur yang dibutuhkan. Hubungi kami untuk konsultasi gratis dan penawaran sesuai kebutuhan Anda.',
            ],
            [
                'question' => 'Berapa lama proses pengerjaan?',
                'answer' => 'Estimasi pengerjaan sekitar 2-12 minggu tergantung skala dan kompleksitas project.',
            ],
            [
                'question' => 'Apakah bisa membuat aplikasi sesuai kebutuhan?',
                'answer' => 'Tentu, seluruh solusi kami dibangun custom sesuai kebutuhan, alur kerja, dan branding bisnis Anda.',
            ],
            [
                'question' => 'Apakah tersedia maintenance setelah aplikasi selesai?',
                'answer' => 'Ya, kami menyediakan paket maintenance dan support berkelanjutan setelah aplikasi selesai dikerjakan.',
            ],
        ];

        foreach ($faqs as $i => $faq) {
            Faq::updateOrCreate(
                ['question' => $faq['question']],
                [
                    'answer' => $faq['answer'],
                    'is_active' => true,
                    'sort_order' => $i,
                ],
            );
        }
    }
}
