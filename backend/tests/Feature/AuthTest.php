<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Andi',
            'email' => 'andi@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.user.email', 'andi@example.com');
        $response->assertJsonPath('data.user.role', UserRole::Customer->value);
        $this->assertDatabaseHas('users', ['email' => 'andi@example.com', 'role' => 'customer']);

        $user = User::where('email', 'andi@example.com')->first();
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_registration_requires_matching_password_confirmation(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Andi',
            'email' => 'andi@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('password');
    }

    public function test_registration_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'andi@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Andi',
            'email' => 'andi@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }

    public function test_user_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->create(['password' => 'password123']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.user.id', $user->id);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create(['password' => 'password123']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
    }

    public function test_suspended_user_cannot_login(): void
    {
        $user = User::factory()->suspended()->create(['password' => 'password123']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/auth/logout', [], $this->authHeaders($user));

        $response->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_guest_cannot_access_me(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_view_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->getJson('/api/v1/auth/me', $this->authHeaders($user));

        $response->assertOk();
        $response->assertJsonPath('data.email', $user->email);
    }

    public function test_user_can_update_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->putJson('/api/v1/auth/profile', [
            'name' => 'New Name',
            'email' => $user->email,
        ], $this->authHeaders($user));

        $response->assertOk();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'New Name']);
    }

    public function test_changing_email_requires_reverification(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email_verified_at' => now()]);

        $response = $this->putJson('/api/v1/auth/profile', [
            'name' => $user->name,
            'email' => 'changed@example.com',
        ], $this->authHeaders($user));

        $response->assertOk();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'email_verified_at' => null]);
        Notification::assertSentTo($user->fresh(), VerifyEmail::class);
    }

    public function test_user_can_update_password_with_correct_current_password(): void
    {
        $user = User::factory()->create(['password' => 'old-password']);

        $response = $this->putJson('/api/v1/auth/profile/password', [
            'current_password' => 'old-password',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ], $this->authHeaders($user));

        $response->assertOk();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'new-password123',
        ]);
        $login->assertOk();
    }

    public function test_update_password_rejects_wrong_current_password(): void
    {
        $user = User::factory()->create(['password' => 'old-password']);

        $response = $this->putJson('/api/v1/auth/profile/password', [
            'current_password' => 'not-the-password',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ], $this->authHeaders($user));

        $response->assertStatus(422);
    }

    public function test_forgot_password_sends_reset_link_for_existing_user(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/auth/forgot-password', ['email' => $user->email]);

        $response->assertOk();
        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_forgot_password_does_not_leak_unknown_email(): void
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'unknown@example.com']);

        $response->assertOk();
    }

    public function test_user_can_reset_password_with_valid_token(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'brand-new-password',
            'password_confirmation' => 'brand-new-password',
        ]);

        $response->assertOk();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'brand-new-password',
        ]);
        $login->assertOk();
    }

    public function test_reset_password_fails_with_invalid_token(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => 'invalid-token',
            'email' => $user->email,
            'password' => 'brand-new-password',
            'password_confirmation' => 'brand-new-password',
        ]);

        $response->assertStatus(422);
    }

    public function test_email_can_be_verified_with_valid_signed_url(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)],
        );

        $response = $this->get($url);

        $response->assertRedirect();
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_email_verification_fails_with_invalid_hash(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1('wrong@example.com')],
        );

        $this->get($url);

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_authenticated_user_can_resend_verification_email(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();

        $response = $this->postJson('/api/v1/auth/email/resend', [], $this->authHeaders($user));

        $response->assertOk();
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_customer_cannot_access_admin_routes(): void
    {
        $user = User::factory()->create(['role' => UserRole::Customer]);

        $response = $this->getJson('/api/v1/admin/dashboard', $this->authHeaders($user));

        $response->assertStatus(403);
    }

    public function test_admin_can_access_admin_routes(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this->getJson('/api/v1/admin/dashboard', $this->authHeaders($user));

        $response->assertOk();
    }

    private function authHeaders(User $user): array
    {
        $token = $user->createToken('test')->plainTextToken;

        return ['Authorization' => "Bearer {$token}"];
    }
}
