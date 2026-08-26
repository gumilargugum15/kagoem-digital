<?php

namespace Tests\Feature;

use App\Enums\BillingInterval;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartTest extends TestCase
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

    public function test_guest_can_add_product_to_cart(): void
    {
        $product = $this->digitalProduct();

        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ], ['X-Cart-Session' => 'guest-session-1']);

        $response->assertStatus(201);
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);
    }

    public function test_authenticated_user_can_add_product_to_cart(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();

        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
        ], $this->authHeaders($user));

        $response->assertStatus(201);
        $this->assertDatabaseHas('carts', ['user_id' => $user->id]);
        $this->assertDatabaseHas('cart_items', ['product_id' => $product->id]);
    }

    public function test_user_can_update_item_quantity(): void
    {
        $product = $this->digitalProduct();
        $headers = ['X-Cart-Session' => 'guest-session-qty'];

        $this->postJson('/api/v1/cart/items', ['product_id' => $product->id], $headers);
        $itemId = CartItem::first()->id;

        $response = $this->putJson("/api/v1/cart/items/{$itemId}", ['quantity' => 3], $headers);

        $response->assertOk();
        $this->assertDatabaseHas('cart_items', ['id' => $itemId, 'quantity' => 3, 'subtotal' => 897000]);
    }

    public function test_user_can_remove_item_from_cart(): void
    {
        $product = $this->digitalProduct();
        $headers = ['X-Cart-Session' => 'guest-session-remove'];

        $this->postJson('/api/v1/cart/items', ['product_id' => $product->id], $headers);
        $itemId = CartItem::first()->id;

        $response = $this->deleteJson("/api/v1/cart/items/{$itemId}", [], $headers);

        $response->assertOk();
        $this->assertDatabaseMissing('cart_items', ['id' => $itemId]);
    }

    public function test_cart_total_is_calculated_correctly(): void
    {
        $digital = $this->digitalProduct();
        $subscriptionProduct = $this->subscriptionProduct();
        $plan = $this->plan($subscriptionProduct);
        $headers = ['X-Cart-Session' => 'guest-session-total'];

        $this->postJson('/api/v1/cart/items', ['product_id' => $digital->id, 'quantity' => 2], $headers);
        $this->postJson('/api/v1/cart/items', [
            'product_id' => $subscriptionProduct->id,
            'subscription_plan_id' => $plan->id,
        ], $headers);

        $response = $this->getJson('/api/v1/cart', $headers);

        $response->assertOk();
        // 299000 * 2 + 99000 = 697000
        $response->assertJsonPath('data.subtotal', 697000);
        $response->assertJsonPath('data.total', 697000);
    }

    public function test_subscription_item_quantity_cannot_be_changed(): void
    {
        $product = $this->subscriptionProduct();
        $plan = $this->plan($product);
        $headers = ['X-Cart-Session' => 'guest-session-sub-qty'];

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'subscription_plan_id' => $plan->id,
        ], $headers);
        $itemId = CartItem::first()->id;

        $response = $this->putJson("/api/v1/cart/items/{$itemId}", ['quantity' => 2], $headers);

        $response->assertStatus(422);
        $this->assertDatabaseHas('cart_items', ['id' => $itemId, 'quantity' => 1]);
    }

    public function test_subscription_plan_not_belonging_to_product_is_rejected(): void
    {
        $product = $this->subscriptionProduct();
        $otherProduct = $this->subscriptionProduct(['slug' => 'inventory-manager', 'name' => 'Inventory Manager']);
        $otherPlan = $this->plan($otherProduct);
        $headers = ['X-Cart-Session' => 'guest-session-invalid-plan'];

        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'subscription_plan_id' => $otherPlan->id,
        ], $headers);

        $response->assertStatus(422);
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_price_is_always_taken_from_backend_not_frontend(): void
    {
        $product = $this->digitalProduct(['price' => 299000]);
        $headers = ['X-Cart-Session' => 'guest-session-price'];

        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'price' => 1,
            'total' => 1,
        ], $headers);

        $response->assertStatus(201);
        $this->assertDatabaseHas('cart_items', ['product_id' => $product->id, 'price' => 299000]);
    }

    public function test_subscription_requires_a_plan_selection(): void
    {
        $product = $this->subscriptionProduct();
        $headers = ['X-Cart-Session' => 'guest-session-no-plan'];

        $response = $this->postJson('/api/v1/cart/items', ['product_id' => $product->id], $headers);

        $response->assertStatus(422);
    }

    public function test_duplicate_digital_product_increments_quantity_instead_of_creating_new_row(): void
    {
        $product = $this->digitalProduct();
        $headers = ['X-Cart-Session' => 'guest-session-dup-digital'];

        $this->postJson('/api/v1/cart/items', ['product_id' => $product->id], $headers);
        $this->postJson('/api/v1/cart/items', ['product_id' => $product->id], $headers);

        $this->assertDatabaseCount('cart_items', 1);
        $this->assertDatabaseHas('cart_items', ['product_id' => $product->id, 'quantity' => 2]);
    }

    public function test_duplicate_subscription_plan_is_rejected(): void
    {
        $product = $this->subscriptionProduct();
        $plan = $this->plan($product);
        $headers = ['X-Cart-Session' => 'guest-session-dup-sub'];

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'subscription_plan_id' => $plan->id,
        ], $headers);
        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'subscription_plan_id' => $plan->id,
        ], $headers);

        $response->assertStatus(422);
        $this->assertDatabaseCount('cart_items', 1);
    }

    public function test_guest_cart_merges_into_user_cart_on_login(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $sessionId = 'guest-session-merge';

        $this->postJson('/api/v1/cart/items', ['product_id' => $product->id], [
            'X-Cart-Session' => $sessionId,
        ]);

        $headers = array_merge($this->authHeaders($user), ['X-Cart-Session' => $sessionId]);
        $response = $this->getJson('/api/v1/cart', $headers);

        $response->assertOk();
        $response->assertJsonPath('data.items_count', 1);
        $this->assertDatabaseHas('carts', ['user_id' => $user->id]);
        $this->assertDatabaseCount('carts', 1);
    }

    public function test_guest_request_without_session_id_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/cart');

        $response->assertStatus(422);
    }

    private function authHeaders(User $user): array
    {
        $token = $user->createToken('test')->plainTextToken;

        return ['Authorization' => "Bearer {$token}"];
    }
}
