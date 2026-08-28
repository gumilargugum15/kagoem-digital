<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ApiExceptionHandlingTest extends TestCase
{
    use RefreshDatabase;

    public function test_rate_limited_api_request_returns_429_not_500(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();
        $token = $user->createToken('test')->plainTextToken;
        $headers = ['Authorization' => "Bearer {$token}"];

        for ($i = 0; $i < 6; $i++) {
            $this->postJson('/api/v1/auth/email/resend', [], $headers)->assertOk();
        }

        $response = $this->postJson('/api/v1/auth/email/resend', [], $headers);

        $response->assertStatus(429);
        $response->assertJson(['success' => false]);
    }
}
