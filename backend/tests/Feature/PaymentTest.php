<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    private function digitalProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'name' => 'Laravel POS Starter Kit',
            'slug' => 'laravel-pos-starter-kit-'.uniqid(),
            'type' => ProductType::Digital,
            'category' => 'Source Code',
            'short_description' => 'desc',
            'price' => 299000,
            'status' => ProductStatus::Published,
        ], $overrides));
    }

    private function authHeaders(User $user): array
    {
        Auth::forgetGuards();
        $token = $user->createToken('test')->plainTextToken;

        return ['Authorization' => "Bearer {$token}"];
    }

    private function checkoutOrderFor(User $user, Product $product): Order
    {
        $headers = $this->authHeaders($user);
        $this->postJson('/api/v1/cart/items', ['product_id' => $product->id], $headers)->assertStatus(201);
        $response = $this->postJson('/api/v1/checkout', [], $headers)->assertStatus(201);

        return Order::where('order_number', $response->json('data.order_number'))->first();
    }

    private function fakeSnapSuccess(): void
    {
        Http::fake([
            '*/snap/v1/transactions' => Http::response([
                'token' => 'fake-snap-token-123',
                'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/fake-snap-token-123',
            ], 201),
        ]);
    }

    public function test_authenticated_user_can_create_payment_for_own_pending_order(): void
    {
        $this->fakeSnapSuccess();
        $user = User::factory()->create();
        $order = $this->checkoutOrderFor($user, $this->digitalProduct());

        $response = $this->postJson("/api/v1/orders/{$order->order_number}/payment", [], $this->authHeaders($user));

        $response->assertOk();
        $response->assertJsonPath('data.order_number', $order->order_number);
        $response->assertJsonPath('data.snap_token', 'fake-snap-token-123');
        $this->assertDatabaseHas('payments', [
            'order_id' => $order->id,
            'snap_token' => 'fake-snap-token-123',
            'provider' => 'midtrans',
        ]);
    }

    public function test_user_cannot_pay_another_users_order(): void
    {
        $this->fakeSnapSuccess();
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $order = $this->checkoutOrderFor($owner, $this->digitalProduct());

        $response = $this->postJson("/api/v1/orders/{$order->order_number}/payment", [], $this->authHeaders($other));

        $response->assertStatus(404);
    }

    public function test_paid_order_cannot_create_duplicate_payment(): void
    {
        $this->fakeSnapSuccess();
        $user = User::factory()->create();
        $order = $this->checkoutOrderFor($user, $this->digitalProduct());
        $order->update(['status' => OrderStatus::Paid]);
        $order->payment->update(['status' => PaymentStatus::Paid]);

        $response = $this->postJson("/api/v1/orders/{$order->order_number}/payment", [], $this->authHeaders($user));

        $response->assertStatus(422);
    }

    public function test_cancelled_order_cannot_be_paid(): void
    {
        $this->fakeSnapSuccess();
        $user = User::factory()->create();
        $order = $this->checkoutOrderFor($user, $this->digitalProduct());
        $order->update(['status' => OrderStatus::Cancelled]);

        $response = $this->postJson("/api/v1/orders/{$order->order_number}/payment", [], $this->authHeaders($user));

        $response->assertStatus(422);
    }

    public function test_expired_order_cannot_be_paid(): void
    {
        $this->fakeSnapSuccess();
        $user = User::factory()->create();
        $order = $this->checkoutOrderFor($user, $this->digitalProduct());
        $order->update(['status' => OrderStatus::Expired]);

        $response = $this->postJson("/api/v1/orders/{$order->order_number}/payment", [], $this->authHeaders($user));

        $response->assertStatus(422);
    }

    public function test_gross_amount_sent_to_midtrans_matches_order_total(): void
    {
        $this->fakeSnapSuccess();
        $user = User::factory()->create();
        $order = $this->checkoutOrderFor($user, $this->digitalProduct(['price' => 299000]));

        $this->postJson("/api/v1/orders/{$order->order_number}/payment", [], $this->authHeaders($user))
            ->assertOk();

        Http::assertSent(function ($request) use ($order) {
            return $request['transaction_details']['gross_amount'] === (int) round((float) $order->total);
        });
    }

    public function test_snap_token_is_returned(): void
    {
        $this->fakeSnapSuccess();
        $user = User::factory()->create();
        $order = $this->checkoutOrderFor($user, $this->digitalProduct());

        $response = $this->postJson("/api/v1/orders/{$order->order_number}/payment", [], $this->authHeaders($user));

        $this->assertNotEmpty($response->json('data.snap_token'));
    }

    public function test_existing_snap_token_is_reused_without_calling_midtrans_again(): void
    {
        $this->fakeSnapSuccess();
        $user = User::factory()->create();
        $order = $this->checkoutOrderFor($user, $this->digitalProduct());
        $headers = $this->authHeaders($user);

        $this->postJson("/api/v1/orders/{$order->order_number}/payment", [], $headers)->assertOk();
        $this->postJson("/api/v1/orders/{$order->order_number}/payment", [], $headers)->assertOk();

        Http::assertSentCount(1);
    }

    public function test_response_never_exposes_server_key(): void
    {
        $this->fakeSnapSuccess();
        $user = User::factory()->create();
        $order = $this->checkoutOrderFor($user, $this->digitalProduct());

        $response = $this->postJson("/api/v1/orders/{$order->order_number}/payment", [], $this->authHeaders($user));

        $response->assertJsonMissingPath('data.server_key');
        $body = $response->getContent();
        $this->assertStringNotContainsString(config('midtrans.server_key'), $body);
    }

    public function test_guest_cannot_create_payment(): void
    {
        // Guard against any real outbound call: an unauthenticated request should never
        // reach MidtransService at all — this just keeps the test hermetic if it somehow did.
        Http::fake();
        $user = User::factory()->create();
        $order = $this->checkoutOrderFor($user, $this->digitalProduct());

        // The setup above resolved an authenticated user through the sanctum guard, which
        // caches the resolved user for the guard instance's lifetime (persists across
        // requests within one test method) — forget it so this request is genuinely anonymous.
        Auth::forgetGuards();

        $this->postJson("/api/v1/orders/{$order->order_number}/payment")->assertStatus(401);
    }

    public function test_payment_creation_error_from_midtrans_does_not_leak_details(): void
    {
        Http::fake([
            '*/snap/v1/transactions' => Http::response(['error_messages' => ['Invalid credentials']], 401),
        ]);
        $user = User::factory()->create();
        $order = $this->checkoutOrderFor($user, $this->digitalProduct());

        $response = $this->postJson("/api/v1/orders/{$order->order_number}/payment", [], $this->authHeaders($user));

        $response->assertStatus(502);
        $this->assertStringNotContainsString('Invalid credentials', $response->getContent());
    }
}
