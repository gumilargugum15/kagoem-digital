<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'site_name' => 'Kagoem Digital',
            'owner_name' => 'Gugum Gumilar',
            'email' => 'hello@kagoemdigital.com',
            'whatsapp' => '+6281234567890',
            'linkedin' => 'https://linkedin.com/company/kagoemdigital',
            'github' => 'https://github.com/kagoemdigital',
            'instagram' => 'https://instagram.com/kagoemdigital',
        ];

        foreach ($settings as $key => $value) {
            SiteSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
