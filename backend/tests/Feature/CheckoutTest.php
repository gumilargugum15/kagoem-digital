<?php

namespace Tests\Feature;

use App\Enums\BillingInterval;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\Order;
use App\Models\Product;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Notifications\OrderCreatedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    private function digitalProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'name' => 'Laravel POS Starter Kit',
            'slug' => 'laravel-pos-starter-kit',
            'type' => ProductType::Digital,
            'category' => 'Source Code',
            'short_description' => 'desc',
            'price' => 299000,
            'status' => ProductStatus::Published,
        ], $overrides));
    }

    private function subscriptionProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'name' => 'POS Cashier',
            'slug' => 'pos-cashier',
            'type' => ProductType::Subscription,
            'category' => 'Subscription',
            'short_description' => 'desc',
            'status' => ProductStatus::Published,
        ], $overrides));
    }

    private function plan(Product $product, array $overrides = []): SubscriptionPlan
    {
        return $product->plans()->create(array_merge([
            'name' => 'Business',
            'price' => 99000,
            'billing_interval' => BillingInterval::Monthly,
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

    private function addToCart(User $user, Product $product, ?int $planId = null, int $quantity = 1): void
    {
        $this->postJson('/api/v1/cart/items', array_filter([
            'product_id' => $product->id,
            'subscription_plan_id' => $planId,
            'quantity' => $quantity,
        ]), $this->authHeaders($user))->assertStatus(201);
    }

    public function test_checkout_creates_order_from_cart(): void
    {
        Notification::fake();
        $user = User::factory()->create(['name' => 'Andi', 'email' => 'andi@example.com']);
        $product = $this->digitalProduct();
        $this->addToCart($user, $product);

        $response = $this->postJson('/api/v1/checkout', ['phone' => '08123456789'], $this->authHeaders($user));

        $response->assertStatus(201);
        $response->assertJsonPath('data.status', 'pending');
        $response->assertJsonPath('data.total', '299000.00');
        $response->assertJsonPath('data.customer_name', 'Andi');
        $response->assertJsonPath('data.customer_email', 'andi@example.com');
        $orderNumber = $response->json('data.order_number');
        $this->assertMatchesRegularExpression('/^KGO-\d{8}-\d{6}$/', $orderNumber);
    }

    public function test_checkout_rejects_empty_cart(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/checkout', [], $this->authHeaders($user));

        $response->assertStatus(422);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_guest_cannot_checkout(): void
    {
        $response = $this->postJson('/api/v1/checkout', []);

        $response->assertStatus(401);
    }

    public function test_checkout_rejects_inactive_product(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $this->addToCart($user, $product);

        $product->update(['status' => ProductStatus::Archived]);

        $response = $this->postJson('/api/v1/checkout', [], $this->authHeaders($user));

        $response->assertStatus(422);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_total_is_calculated_server_side_from_cart_snapshot(): void
    {
        $user = User::factory()->create();
        $digital = $this->digitalProduct(['price' => 299000]);
        $subscriptionProduct = $this->subscriptionProduct();
        $plan = $this->plan($subscriptionProduct, ['price' => 99000]);

        $this->addToCart($user, $digital, quantity: 2);
        $this->addToCart($user, $subscriptionProduct, $plan->id);

        $response = $this->postJson('/api/v1/checkout', [], $this->authHeaders($user));

        $response->assertStatus(201);
        // 299000 * 2 + 99000 = 697000
        $response->assertJsonPath('data.subtotal', '697000.00');
        $response->assertJsonPath('data.total', '697000.00');
    }

    public function test_order_items_created_with_product_snapshot(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $this->addToCart($user, $product, quantity: 3);

        $this->postJson('/api/v1/checkout', [], $this->authHeaders($user));

        $order = Order::first();
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_type' => 'digital',
            'quantity' => 3,
            'unit_price' => '299000.00',
            'subtotal' => '897000.00',
        ]);
    }

    public function test_payment_pending_created_for_order(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $this->addToCart($user, $product);

        $this->postJson('/api/v1/checkout', [], $this->authHeaders($user));

        $order = Order::first();
        $this->assertDatabaseHas('payments', [
            'order_id' => $order->id,
            'provider' => null,
            'status' => 'pending',
            'amount' => '299000.00',
        ]);
    }

    public function test_cart_is_cleared_after_successful_checkout(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $this->addToCart($user, $product);

        $this->postJson('/api/v1/checkout', [], $this->authHeaders($user));

        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_order_created_notification_is_sent(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $this->addToCart($user, $product);

        $this->postJson('/api/v1/checkout', [], $this->authHeaders($user));

        Notification::assertSentTo($user, OrderCreatedNotification::class);
    }

    public function test_duplicate_checkout_on_emptied_cart_is_rejected(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $this->addToCart($user, $product);

        $first = $this->postJson('/api/v1/checkout', [], $this->authHeaders($user));
        $first->assertStatus(201);

        $second = $this->postJson('/api/v1/checkout', [], $this->authHeaders($user));
        $second->assertStatus(422);

        $this->assertDatabaseCount('orders', 1);
    }

    public function test_user_cannot_view_another_users_order(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $product = $this->digitalProduct();
        $this->addToCart($owner, $product);
        $checkout = $this->postJson('/api/v1/checkout', [], $this->authHeaders($owner));
        $orderNumber = $checkout->json('data.order_number');

        $response = $this->getJson("/api/v1/orders/{$orderNumber}", $this->authHeaders($other));

        $response->assertStatus(404);
    }

    public function test_user_can_view_own_order(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $this->addToCart($user, $product);
        $checkout = $this->postJson('/api/v1/checkout', [], $this->authHeaders($user));
        $orderNumber = $checkout->json('data.order_number');

        $response = $this->getJson("/api/v1/orders/{$orderNumber}", $this->authHeaders($user));

        $response->assertOk();
        $response->assertJsonPath('data.order_number', $orderNumber);
    }

    public function test_orders_list_returns_only_own_orders(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $product = $this->digitalProduct();

        $this->addToCart($user, $product);
        $this->postJson('/api/v1/checkout', [], $this->authHeaders($user));

        $this->addToCart($other, $product);
        $this->postJson('/api/v1/checkout', [], $this->authHeaders($other));

        $response = $this->getJson('/api/v1/orders', $this->authHeaders($user));

        $response->assertOk();
        $this->assertCount(1, $response->json('data.data'));
    }
}
