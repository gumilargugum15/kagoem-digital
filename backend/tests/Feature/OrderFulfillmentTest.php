<?php

namespace Tests\Feature;

use App\Enums\BillingInterval;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\DigitalProductAccess;
use App\Models\Order;
use App\Models\Product;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OrderFulfillmentTest extends TestCase
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

    private function subscriptionProductWithPlan(array $overrides = []): array
    {
        $product = Product::create(array_merge([
            'name' => 'POS Cashier',
            'slug' => 'pos-cashier-'.uniqid(),
            'type' => ProductType::Subscription,
            'category' => 'Subscription',
            'short_description' => 'desc',
            'status' => ProductStatus::Published,
        ], $overrides));

        $plan = $product->plans()->create([
            'name' => 'Basic',
            'price' => 5000,
            'billing_interval' => BillingInterval::Monthly,
            'status' => ProductStatus::Published,
        ]);

        return [$product, $plan];
    }

    /**
     * Build an order with arbitrary items directly via models (bypassing the checkout
     * HTTP flow, which is already covered by CheckoutTest) and attach a pending payment
     * with a known midtrans_order_id, ready for a webhook to settle it.
     *
     * @param  array<int, array{product: Product, plan?: SubscriptionPlan, quantity?: int}>  $items
     */
    private function orderWithItems(User $user, array $items): Order
    {
        $total = 0;
        foreach ($items as $spec) {
            $product = $spec['product'];
            $plan = $spec['plan'] ?? null;
            $qty = $spec['quantity'] ?? 1;
            $price = $plan?->price ?? $product->price;
            $total += (float) $price * $qty;
        }

        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => 'KGO-TEST-'.uniqid('', true),
            'status' => OrderStatus::Pending,
            'currency' => 'IDR',
            'subtotal' => $total,
            'discount' => 0,
            'tax' => 0,
            'total' => $total,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
        ]);

        foreach ($items as $spec) {
            $product = $spec['product'];
            $plan = $spec['plan'] ?? null;
            $qty = $spec['quantity'] ?? 1;
            $price = $plan?->price ?? $product->price;

            $order->items()->create([
                'product_id' => $product->id,
                'subscription_plan_id' => $plan?->id,
                'product_name' => $product->name,
                'product_type' => $product->type,
                'billing_interval' => $plan?->billing_interval?->value,
                'quantity' => $qty,
                'unit_price' => $price,
                'subtotal' => (float) $price * $qty,
            ]);
        }

        $midtransOrderId = "{$order->order_number}-1";
        $order->payments()->create([
            'midtrans_order_id' => $midtransOrderId,
            'provider' => 'midtrans',
            'snap_token' => 'fake-token',
            'amount' => $order->total,
            'currency' => $order->currency,
            'status' => PaymentStatus::Pending,
        ]);

        return $order->fresh(['payment', 'items']);
    }

    private function signedPayload(Order $order, array $overrides = []): array
    {
        $midtransOrderId = $order->payment->midtrans_order_id;
        $statusCode = $overrides['status_code'] ?? '200';
        $grossAmount = $overrides['gross_amount'] ?? number_format((float) $order->total, 2, '.', '');

        $payload = array_merge([
            'order_id' => $midtransOrderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'settlement',
            'transaction_id' => 'midtrans-txn-'.uniqid(),
            'payment_type' => 'bank_transfer',
            'fraud_status' => 'accept',
        ], $overrides);

        $payload['signature_key'] = hash('sha512',
            $midtransOrderId.$statusCode.$grossAmount.config('midtrans.server_key')
        );

        return $payload;
    }

    private function fakeStatus(array $statusResponse): void
    {
        Http::fake([
            '*/v2/*/status' => Http::response($statusResponse, 200),
        ]);
    }

    private function settle(Order $order, array $overrides = []): void
    {
        $payload = $this->signedPayload($order, $overrides);
        $this->fakeStatus($payload);
        $this->postJson('/api/v1/payment/midtrans/notification', $payload)->assertOk();
    }

    private function authHeaders(User $user): array
    {
        Auth::forgetGuards();
        $token = $user->createToken('test')->plainTextToken;

        return ['Authorization' => "Bearer {$token}"];
    }

    // TEST 1: Subscription product, Payment PAID -> Subscription ACTIVE
    public function test_subscription_product_becomes_active_on_payment_paid(): void
    {
        $user = User::factory()->create();
        [$product, $plan] = $this->subscriptionProductWithPlan();
        $order = $this->orderWithItems($user, [['product' => $product, 'plan' => $plan]]);

        $this->settle($order);

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'subscription_plan_id' => $plan->id,
            'order_id' => $order->id,
            'status' => 'active',
        ]);

        $subscription = Subscription::where('order_id', $order->id)->first();
        $this->assertNotNull($subscription->started_at);
        $this->assertNotNull($subscription->expires_at);
        $this->assertEqualsWithDelta(
            $subscription->started_at->copy()->addMonth()->timestamp,
            $subscription->expires_at->timestamp,
            2,
        );
    }

    // TEST 2: Digital product, Payment PAID -> Digital Access ACTIVE
    public function test_digital_product_grants_access_on_payment_paid(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $order = $this->orderWithItems($user, [['product' => $product]]);

        $this->settle($order);

        $this->assertDatabaseHas('digital_product_access', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
            'status' => 'active',
            'download_count' => 0,
        ]);

        $access = DigitalProductAccess::where('order_id', $order->id)->first();
        $this->assertNotNull($access->granted_at);
        $this->assertNull($access->expires_at);
    }

    // TEST 3 / 10: Mixed order with multiple items -> all fulfilled per product_type
    public function test_mixed_order_fulfills_subscription_and_digital_access(): void
    {
        $user = User::factory()->create();
        [$subProduct, $plan] = $this->subscriptionProductWithPlan();
        $digitalProduct = $this->digitalProduct();
        $order = $this->orderWithItems($user, [
            ['product' => $subProduct, 'plan' => $plan],
            ['product' => $digitalProduct],
        ]);

        $this->settle($order);

        $this->assertDatabaseCount('subscriptions', 1);
        $this->assertDatabaseCount('digital_product_access', 1);
        $this->assertDatabaseHas('subscriptions', ['order_id' => $order->id, 'product_id' => $subProduct->id]);
        $this->assertDatabaseHas('digital_product_access', ['order_id' => $order->id, 'product_id' => $digitalProduct->id]);
    }

    // TEST 4: Payment PENDING -> no fulfillment
    public function test_pending_payment_does_not_trigger_fulfillment(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $order = $this->orderWithItems($user, [['product' => $product]]);

        $this->settle($order, ['transaction_status' => 'pending', 'fraud_status' => null]);

        $this->assertSame('pending', $order->fresh()->status->value);
        $this->assertDatabaseCount('digital_product_access', 0);
    }

    // TEST 5: Payment FAILED (deny) -> no fulfillment
    public function test_denied_payment_does_not_trigger_fulfillment(): void
    {
        $user = User::factory()->create();
        [$product, $plan] = $this->subscriptionProductWithPlan();
        $order = $this->orderWithItems($user, [['product' => $product, 'plan' => $plan]]);

        $this->settle($order, ['transaction_status' => 'deny', 'fraud_status' => null]);

        $this->assertSame('failed', $order->fresh()->status->value);
        $this->assertDatabaseCount('subscriptions', 0);
    }

    // TEST 6: Duplicate notification -> no duplicate subscription
    public function test_duplicate_notification_does_not_duplicate_subscription(): void
    {
        $user = User::factory()->create();
        [$product, $plan] = $this->subscriptionProductWithPlan();
        $order = $this->orderWithItems($user, [['product' => $product, 'plan' => $plan]]);

        $this->settle($order);
        $this->settle($order);
        $this->settle($order);

        $this->assertDatabaseCount('subscriptions', 1);
    }

    // TEST 7: Duplicate notification -> no duplicate digital access
    public function test_duplicate_notification_does_not_duplicate_digital_access(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $order = $this->orderWithItems($user, [['product' => $product]]);

        $this->settle($order);
        $this->settle($order);
        $this->settle($order);

        $this->assertDatabaseCount('digital_product_access', 1);
    }

    // TEST 8: User without digital access -> download denied
    public function test_download_denied_without_access(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct(['digital_file' => 'products/files/fake.zip']);
        $other = User::factory()->create();
        $order = $this->orderWithItems($other, [['product' => $product]]);
        $this->settle($order);
        $access = DigitalProductAccess::where('order_id', $order->id)->first();

        $response = $this->getJson("/api/v1/my-products/digital/{$access->id}/download", $this->authHeaders($user));

        $response->assertStatus(403);
    }

    // TEST 9: User who bought digital product -> download authorized
    public function test_download_authorized_for_owner(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('products/files/fake.zip', 'fake-content');

        $user = User::factory()->create();
        $product = $this->digitalProduct(['digital_file' => 'products/files/fake.zip']);
        $order = $this->orderWithItems($user, [['product' => $product]]);
        $this->settle($order);
        $access = DigitalProductAccess::where('order_id', $order->id)->first();

        $response = $this->get("/api/v1/my-products/digital/{$access->id}/download", $this->authHeaders($user));

        $response->assertOk();
        $this->assertDatabaseHas('digital_product_access', ['id' => $access->id, 'download_count' => 1]);
    }

    public function test_my_products_endpoint_lists_subscriptions_and_digital_access(): void
    {
        $user = User::factory()->create();
        [$subProduct, $plan] = $this->subscriptionProductWithPlan();
        $digitalProduct = $this->digitalProduct();
        $order = $this->orderWithItems($user, [
            ['product' => $subProduct, 'plan' => $plan],
            ['product' => $digitalProduct],
        ]);
        $this->settle($order);

        $response = $this->getJson('/api/v1/my-products', $this->authHeaders($user));

        $response->assertOk();
        $this->assertCount(1, $response->json('data.subscriptions'));
        $this->assertCount(1, $response->json('data.digital'));
    }

    public function test_order_detail_shows_fulfillment_status(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $order = $this->orderWithItems($user, [['product' => $product]]);
        $this->settle($order);

        $response = $this->getJson("/api/v1/orders/{$order->order_number}", $this->authHeaders($user));

        $response->assertOk();
        $response->assertJsonPath('data.items.0.digital_access.status', 'active');
    }
}
