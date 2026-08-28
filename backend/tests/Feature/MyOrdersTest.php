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
use Tests\TestCase;

class MyOrdersTest extends TestCase
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
        // RequestGuard caches the first resolved user for the guard instance's lifetime,
        // which persists across requests within one test method — forget it so switching
        // to a different user's token actually re-resolves against that token.
        Auth::forgetGuards();

        $token = $user->createToken('test')->plainTextToken;

        return ['Authorization' => "Bearer {$token}"];
    }

    /**
     * Create an order through the real checkout HTTP flow (integration-style).
     * Only use this a handful of times per test — the checkout route is throttled.
     */
    private function createOrderFor(User $user, Product $product, array $orderOverrides = []): Order
    {
        $headers = $this->authHeaders($user);
        $this->postJson('/api/v1/cart/items', ['product_id' => $product->id], $headers)->assertStatus(201);
        $response = $this->postJson('/api/v1/checkout', [], $headers)->assertStatus(201);

        $order = Order::where('order_number', $response->json('data.order_number'))->first();

        if ($orderOverrides !== []) {
            $order->forceFill($orderOverrides)->save();
        }

        return $order->fresh();
    }

    /**
     * Build an order directly via models, bypassing the checkout HTTP flow/throttle —
     * for tests that need many orders or precise control over created_at.
     */
    private function makeOrder(User $user, Product $product, array $overrides = []): Order
    {
        // created_at isn't mass-assignable, so pull it out and set it separately.
        $createdAt = $overrides['created_at'] ?? null;
        unset($overrides['created_at']);

        $order = Order::create(array_merge([
            'user_id' => $user->id,
            'order_number' => 'KGO-TEST-'.uniqid('', true),
            'status' => OrderStatus::Pending,
            'currency' => 'IDR',
            'subtotal' => $product->price,
            'discount' => 0,
            'tax' => 0,
            'total' => $product->price,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
        ], $overrides));

        if ($createdAt) {
            $order->forceFill(['created_at' => $createdAt])->save();
        }

        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_type' => $product->type,
            'quantity' => 1,
            'unit_price' => $product->price,
            'subtotal' => $product->price,
        ]);

        $order->payments()->create([
            'amount' => $order->total,
            'currency' => $order->currency,
            'status' => PaymentStatus::Pending,
        ]);

        return $order->fresh();
    }

    public function test_user_can_see_own_orders(): void
    {
        $andi = User::factory()->create(['name' => 'Andi']);
        $product = $this->digitalProduct();
        $order = $this->createOrderFor($andi, $product);

        $response = $this->getJson('/api/v1/orders', $this->authHeaders($andi));

        $response->assertOk();
        $this->assertCount(1, $response->json('data.data'));
        $response->assertJsonPath('data.data.0.order_number', $order->order_number);
    }

    public function test_user_without_orders_gets_empty_result(): void
    {
        $andi = User::factory()->create();

        $response = $this->getJson('/api/v1/orders', $this->authHeaders($andi));

        $response->assertOk();
        $this->assertCount(0, $response->json('data.data'));
    }

    public function test_newest_order_appears_first(): void
    {
        $andi = User::factory()->create();
        $product = $this->digitalProduct();

        $older = $this->makeOrder($andi, $product, ['created_at' => now()->subDay()]);
        $newer = $this->makeOrder($andi, $product, ['created_at' => now()]);

        $response = $this->getJson('/api/v1/orders', $this->authHeaders($andi));

        $response->assertOk();
        $response->assertJsonPath('data.data.0.order_number', $newer->order_number);
        $response->assertJsonPath('data.data.1.order_number', $older->order_number);
    }

    public function test_pagination_limits_results_per_page(): void
    {
        $andi = User::factory()->create();
        $product = $this->digitalProduct();

        for ($i = 0; $i < 12; $i++) {
            $this->makeOrder($andi, $product);
        }

        $response = $this->getJson('/api/v1/orders', $this->authHeaders($andi));

        $response->assertOk();
        $this->assertCount(10, $response->json('data.data'));
        $this->assertSame(12, $response->json('data.total'));
        $this->assertSame(2, $response->json('data.last_page'));
    }

    public function test_search_by_order_number(): void
    {
        $andi = User::factory()->create();
        $product = $this->digitalProduct();
        $order = $this->createOrderFor($andi, $product);
        $this->createOrderFor($andi, $product);

        $response = $this->getJson('/api/v1/orders?search='.$order->order_number, $this->authHeaders($andi));

        $response->assertOk();
        $this->assertCount(1, $response->json('data.data'));
        $response->assertJsonPath('data.data.0.order_number', $order->order_number);
    }

    public function test_filter_by_status_only_returns_matching_orders(): void
    {
        $andi = User::factory()->create();
        $product = $this->digitalProduct();
        $pending = $this->createOrderFor($andi, $product);
        $this->createOrderFor($andi, $product, ['status' => OrderStatus::Paid]);

        $response = $this->getJson('/api/v1/orders?status=pending', $this->authHeaders($andi));

        $response->assertOk();
        $this->assertCount(1, $response->json('data.data'));
        $response->assertJsonPath('data.data.0.order_number', $pending->order_number);
    }

    public function test_filter_only_applies_to_authenticated_users_own_orders(): void
    {
        $andi = User::factory()->create();
        $budi = User::factory()->create();
        $product = $this->digitalProduct();
        $this->createOrderFor($andi, $product, ['status' => OrderStatus::Pending]);
        $this->createOrderFor($budi, $product, ['status' => OrderStatus::Pending]);

        $response = $this->getJson('/api/v1/orders?status=pending', $this->authHeaders($andi));

        $response->assertOk();
        $this->assertCount(1, $response->json('data.data'));
    }

    public function test_order_detail_shows_items_total_and_statuses(): void
    {
        $andi = User::factory()->create();
        $product = $this->digitalProduct();
        $order = $this->createOrderFor($andi, $product);

        $response = $this->getJson("/api/v1/orders/{$order->order_number}", $this->authHeaders($andi));

        $response->assertOk();
        $response->assertJsonPath('data.status', 'pending');
        $response->assertJsonPath('data.payment.status', 'pending');
        $response->assertJsonPath('data.total', $order->total);
        $this->assertCount(1, $response->json('data.items'));
    }

    public function test_order_not_found_is_handled_gracefully(): void
    {
        $andi = User::factory()->create();

        $response = $this->getJson('/api/v1/orders/KGO-NOTFOUND-000000', $this->authHeaders($andi));

        $response->assertStatus(404);
        $response->assertJsonPath('success', false);
    }

    public function test_andi_can_access_own_order_but_not_budis(): void
    {
        $andi = User::factory()->create(['name' => 'Andi']);
        $budi = User::factory()->create(['name' => 'Budi']);
        $product = $this->digitalProduct();

        $andiOrder = $this->createOrderFor($andi, $product);
        $budiOrder = $this->createOrderFor($budi, $product);

        $this->getJson("/api/v1/orders/{$andiOrder->order_number}", $this->authHeaders($andi))
            ->assertOk();

        $this->getJson("/api/v1/orders/{$budiOrder->order_number}", $this->authHeaders($andi))
            ->assertStatus(404);
    }

    public function test_budi_can_access_own_order_but_not_andis(): void
    {
        $andi = User::factory()->create(['name' => 'Andi']);
        $budi = User::factory()->create(['name' => 'Budi']);
        $product = $this->digitalProduct();

        $andiOrder = $this->createOrderFor($andi, $product);
        $budiOrder = $this->createOrderFor($budi, $product);

        $this->getJson("/api/v1/orders/{$budiOrder->order_number}", $this->authHeaders($budi))
            ->assertOk();

        $this->getJson("/api/v1/orders/{$andiOrder->order_number}", $this->authHeaders($budi))
            ->assertStatus(404);
    }

    public function test_andis_order_list_never_includes_budis_orders(): void
    {
        $andi = User::factory()->create(['name' => 'Andi']);
        $budi = User::factory()->create(['name' => 'Budi']);
        $product = $this->digitalProduct();

        $andiOrder = $this->createOrderFor($andi, $product);
        $this->createOrderFor($budi, $product);

        $response = $this->getJson('/api/v1/orders', $this->authHeaders($andi));

        $response->assertOk();
        $this->assertCount(1, $response->json('data.data'));
        $response->assertJsonPath('data.data.0.order_number', $andiOrder->order_number);
    }

    public function test_guest_cannot_access_orders_endpoint(): void
    {
        $this->getJson('/api/v1/orders')->assertStatus(401);
    }
}
