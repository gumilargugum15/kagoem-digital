<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Date;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@kagoemdigital.com'],
            [
                'name' => 'Gugum Gumilar',
                'password' => 'password',
                'role' => UserRole::Admin,
                'status' => UserStatus::Active,
                'email_verified_at' => Date::now(),
            ],
        );
    }
}
