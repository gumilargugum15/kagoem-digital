<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            ServiceSeeder::class,
            PortfolioSeeder::class,
            TechNoteSeeder::class,
            ProductSeeder::class,
            FaqSeeder::class,
            SiteSettingSeeder::class,
        ]);
    }
}
