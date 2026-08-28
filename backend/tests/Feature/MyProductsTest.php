<?php

namespace Tests\Feature;

use App\Enums\BillingInterval;
use App\Enums\DigitalAccessStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Enums\SubscriptionStatus;
use App\Models\DigitalProductAccess;
use App\Models\Order;
use App\Models\Product;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MyProductsTest extends TestCase
{
    use RefreshDatabase;

    private function digitalProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'name' => 'Laravel Ebook',
            'slug' => 'laravel-ebook-'.uniqid(),
            'type' => ProductType::Digital,
            'category' => 'Ebook',
            'short_description' => 'desc',
            'price' => 50000,
            'status' => ProductStatus::Published,
        ], $overrides));
    }

    private function subscriptionProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'name' => 'POS Cashier',
            'slug' => 'pos-cashier-'.uniqid(),
            'type' => ProductType::Subscription,
            'category' => 'Subscription',
            'short_description' => 'desc',
            'status' => ProductStatus::Published,
        ], $overrides));
    }

    private function makePaidOrder(User $user, Product $product): Order
    {
        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => 'KGO-TEST-'.uniqid('', true),
            'status' => OrderStatus::Paid,
            'currency' => 'IDR',
            'subtotal' => $product->price ?? 0,
            'discount' => 0,
            'tax' => 0,
            'total' => $product->price ?? 0,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_type' => $product->type,
            'billing_interval' => $product->type === ProductType::Subscription ? BillingInterval::Monthly->value : null,
            'quantity' => 1,
            'unit_price' => $product->price ?? 0,
            'subtotal' => $product->price ?? 0,
        ]);

        $order->payments()->create([
            'amount' => $order->total,
            'currency' => $order->currency,
            'status' => PaymentStatus::Paid,
            'paid_at' => now(),
        ]);

        return $order->fresh(['items', 'payment']);
    }

    private function authHeaders(User $user): array
    {
        Auth::forgetGuards();
        $token = $user->createToken('test')->plainTextToken;

        return ['Authorization' => "Bearer {$token}"];
    }

    // TEST 1: Authenticated customer can see own products.
    public function test_authenticated_customer_sees_own_products(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $order = $this->makePaidOrder($user, $product);
        DigitalProductAccess::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
            'order_item_id' => $order->items->first()->id,
            'status' => DigitalAccessStatus::Active,
            'granted_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/my-products', $this->authHeaders($user));

        $response->assertOk();
        $this->assertCount(1, $response->json('data.digital'));
    }

    // TEST 2: Customer A cannot see Customer B's products.
    public function test_customer_cannot_see_another_customers_products(): void
    {
        $andi = User::factory()->create(['name' => 'Andi']);
        $budi = User::factory()->create(['name' => 'Budi']);
        $product = $this->digitalProduct();
        $order = $this->makePaidOrder($budi, $product);
        DigitalProductAccess::create([
            'user_id' => $budi->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
            'order_item_id' => $order->items->first()->id,
            'status' => DigitalAccessStatus::Active,
            'granted_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/my-products', $this->authHeaders($andi));

        $response->assertOk();
        $this->assertCount(0, $response->json('data.digital'));
    }

    public function test_guest_cannot_access_my_products(): void
    {
        $this->getJson('/api/v1/my-products')->assertStatus(401);
    }

    // TEST 3: Subscription ACTIVE appears in My Products.
    public function test_active_subscription_appears(): void
    {
        $user = User::factory()->create();
        $product = $this->subscriptionProduct();
        $order = $this->makePaidOrder($user, $product);
        Subscription::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
            'order_item_id' => $order->items->first()->id,
            'status' => SubscriptionStatus::Active,
            'started_at' => now(),
            'expires_at' => now()->addMonth(),
        ]);

        $response = $this->getJson('/api/v1/my-products', $this->authHeaders($user));

        $response->assertOk();
        $response->assertJsonPath('data.subscriptions.0.status', 'active');
    }

    // TEST 4: Subscription EXPIRED still shown, as expired.
    public function test_expired_subscription_still_shown(): void
    {
        $user = User::factory()->create();
        $product = $this->subscriptionProduct();
        $order = $this->makePaidOrder($user, $product);
        Subscription::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
            'order_item_id' => $order->items->first()->id,
            'status' => SubscriptionStatus::Expired,
            'started_at' => now()->subMonths(2),
            'expires_at' => now()->subMonth(),
        ]);

        $response = $this->getJson('/api/v1/my-products', $this->authHeaders($user));

        $response->assertOk();
        $this->assertCount(1, $response->json('data.subscriptions'));
        $response->assertJsonPath('data.subscriptions.0.status', 'expired');
    }

    // TEST 5: Digital Access ACTIVE appears in My Products.
    public function test_active_digital_access_appears(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $order = $this->makePaidOrder($user, $product);
        DigitalProductAccess::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
            'order_item_id' => $order->items->first()->id,
            'status' => DigitalAccessStatus::Active,
            'granted_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/my-products', $this->authHeaders($user));

        $response->assertOk();
        $response->assertJsonPath('data.digital.0.status', 'active');
    }

    // TEST 6 / 7: No fulfillment records exist while payment is pending/failed -> nothing owned.
    public function test_unfulfilled_order_does_not_appear_as_owned(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        // Pending order: fulfillment never runs for it, so no DigitalProductAccess exists.
        Order::create([
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
        ]);

        $response = $this->getJson('/api/v1/my-products', $this->authHeaders($user));

        $response->assertOk();
        $this->assertCount(0, $response->json('data.digital'));
        $this->assertCount(0, $response->json('data.subscriptions'));
    }

    // TEST 8: Duplicate fulfillment (unique order_item_id) does not create duplicate list entries.
    public function test_duplicate_fulfillment_does_not_duplicate_product_in_list(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $order = $this->makePaidOrder($user, $product);
        $itemId = $order->items->first()->id;

        DigitalProductAccess::firstOrCreate(
            ['order_item_id' => $itemId],
            [
                'user_id' => $user->id,
                'product_id' => $product->id,
                'order_id' => $order->id,
                'status' => DigitalAccessStatus::Active,
                'granted_at' => now(),
            ],
        );
        // Simulate a duplicate webhook re-running fulfillment for the same item.
        DigitalProductAccess::firstOrCreate(
            ['order_item_id' => $itemId],
            [
                'user_id' => $user->id,
                'product_id' => $product->id,
                'order_id' => $order->id,
                'status' => DigitalAccessStatus::Active,
                'granted_at' => now(),
            ],
        );

        $response = $this->getJson('/api/v1/my-products', $this->authHeaders($user));

        $response->assertOk();
        $this->assertCount(1, $response->json('data.digital'));
    }

    // TEST 9: Digital product not purchased -> download denied.
    public function test_download_denied_for_unpurchased_digital_product(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $product = $this->digitalProduct(['digital_file' => 'products/files/fake.zip']);
        $order = $this->makePaidOrder($owner, $product);
        $access = DigitalProductAccess::create([
            'user_id' => $owner->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
            'order_item_id' => $order->items->first()->id,
            'status' => DigitalAccessStatus::Active,
            'granted_at' => now(),
        ]);

        $response = $this->getJson(
            "/api/v1/my-products/digital/{$access->id}/download",
            $this->authHeaders($stranger),
        );

        $response->assertStatus(403);
    }

    // TEST 10: Digital product purchased -> download authorized.
    public function test_download_authorized_for_purchased_digital_product(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('products/files/fake.zip', 'fake-content');

        $user = User::factory()->create();
        $product = $this->digitalProduct(['digital_file' => 'products/files/fake.zip']);
        $order = $this->makePaidOrder($user, $product);
        $access = DigitalProductAccess::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
            'order_item_id' => $order->items->first()->id,
            'status' => DigitalAccessStatus::Active,
            'granted_at' => now(),
        ]);

        $response = $this->get(
            "/api/v1/my-products/digital/{$access->id}/download",
            $this->authHeaders($user),
        );

        $response->assertOk();
    }

    public function test_my_products_does_not_n_plus_one_query_per_item(): void
    {
        $user = User::factory()->create();
        for ($i = 0; $i < 5; $i++) {
            $product = $this->digitalProduct();
            $order = $this->makePaidOrder($user, $product);
            DigitalProductAccess::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'order_id' => $order->id,
                'order_item_id' => $order->items->first()->id,
                'status' => DigitalAccessStatus::Active,
                'granted_at' => now(),
            ]);
        }

        DB::enableQueryLog();
        $response = $this->getJson('/api/v1/my-products', $this->authHeaders($user));
        $queryCount = count(DB::getQueryLog());
        DB::disableQueryLog();

        $response->assertOk();
        $this->assertCount(5, $response->json('data.digital'));
        // A handful of fixed queries (auth, subscriptions, digital access, eager-loaded products,
        // etc.) regardless of item count — not growing linearly with the number of items.
        $this->assertLessThan(10, $queryCount);
    }
}
