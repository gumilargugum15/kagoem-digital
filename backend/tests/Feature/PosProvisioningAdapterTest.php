<?php

namespace Tests\Feature;

use App\Enums\BillingInterval;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Exceptions\ApplicationProvisioningException;
use App\Models\Order;
use App\Models\Product;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\Provisioning\PosProvisioningAdapter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PosProvisioningAdapterTest extends TestCase
{
    use RefreshDatabase;

    private function configurePos(): void
    {
        config([
            'services.pos.api_url' => 'https://pos.test/api/v1',
            'services.pos.service_token' => 'test-service-token',
        ]);
    }

    private function subscriptionWithOrder(User $user, ?string $phone = null, ?SubscriptionPlan $plan = null): Subscription
    {
        $product = Product::create([
            'name' => 'POS Cashier',
            'slug' => 'pos-cashier-'.uniqid(),
            'type' => ProductType::Subscription,
            'category' => 'Subscription',
            'short_description' => 'desc',
            'status' => ProductStatus::Published,
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => 'KGO-TEST-'.uniqid('', true),
            'status' => OrderStatus::Paid,
            'currency' => 'IDR',
            'subtotal' => 5000,
            'discount' => 0,
            'tax' => 0,
            'total' => 5000,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => $phone,
        ]);

        $item = $order->items()->create([
            'product_id' => $product->id,
            'subscription_plan_id' => $plan?->id,
            'product_name' => $product->name,
            'product_type' => $product->type,
            'billing_interval' => BillingInterval::Monthly->value,
            'quantity' => 1,
            'unit_price' => 5000,
            'subtotal' => 5000,
        ]);

        $order->payments()->create([
            'amount' => $order->total,
            'currency' => $order->currency,
            'status' => PaymentStatus::Paid,
            'paid_at' => now(),
        ]);

        return Subscription::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'subscription_plan_id' => $plan?->id,
            'order_id' => $order->id,
            'order_item_id' => $item->id,
            'status' => 'active',
            'started_at' => now(),
            'expires_at' => now()->addMonth(),
        ]);
    }

    public function test_sends_correct_request_shape_and_maps_response(): void
    {
        $this->configurePos();
        Http::fake([
            '*/provisioning/tenants' => Http::response([
                'success' => true,
                'message' => 'Tenant provisioned',
                'data' => [
                    'external_user_id' => '6',
                    'external_account_id' => '2',
                    'metadata' => [
                        'tenant_id' => 2,
                        'tenant_slug' => 'toko-maju-jaya',
                        'set_password_token' => 'abc123',
                        'set_password_expires_in_minutes' => 60,
                    ],
                ],
            ], 201),
        ]);

        $plan = SubscriptionPlan::create([
            'product_id' => Product::create([
                'name' => 'Placeholder',
                'slug' => 'placeholder-'.uniqid(),
                'type' => ProductType::Subscription,
                'category' => 'Subscription',
                'short_description' => 'x',
                'status' => ProductStatus::Published,
            ])->id,
            'name' => 'Basic',
            'price' => 5000,
            'billing_interval' => BillingInterval::Monthly,
            'status' => ProductStatus::Published,
        ]);
        $user = User::factory()->create(['name' => 'Andi Wijaya', 'email' => 'andi@example.com']);
        $subscription = $this->subscriptionWithOrder($user, '+6281234567890', $plan);

        $result = (new PosProvisioningAdapter)->provision($user, $subscription);

        $this->assertSame('6', $result['external_user_id']);
        $this->assertSame('2', $result['external_account_id']);
        $this->assertSame('toko-maju-jaya', $result['metadata']['tenant_slug']);

        Http::assertSent(function ($request) use ($subscription) {
            return $request->url() === 'https://pos.test/api/v1/provisioning/tenants'
                && $request->hasHeader('Authorization', 'Bearer test-service-token')
                && $request['external_reference'] === "kagoem-digital:subscription:{$subscription->id}"
                && $request['company_name'] === 'Andi Wijaya'
                && $request['owner']['name'] === 'Andi Wijaya'
                && $request['owner']['email'] === 'andi@example.com'
                && $request['owner']['phone'] === '+6281234567890'
                && $request['plan'] === 'Basic';
        });
    }

    public function test_missing_config_throws_without_making_a_request(): void
    {
        config(['services.pos.api_url' => null, 'services.pos.service_token' => null]);
        Http::fake();

        $user = User::factory()->create();
        $subscription = $this->subscriptionWithOrder($user);

        $this->expectException(ApplicationProvisioningException::class);
        (new PosProvisioningAdapter)->provision($user, $subscription);

        Http::assertNothingSent();
    }

    public function test_http_failure_throws_provisioning_exception(): void
    {
        $this->configurePos();
        Http::fake([
            '*/provisioning/tenants' => Http::response(['success' => false, 'message' => 'Unauthenticated.'], 401),
        ]);

        $user = User::factory()->create();
        $subscription = $this->subscriptionWithOrder($user);

        $this->expectException(ApplicationProvisioningException::class);
        (new PosProvisioningAdapter)->provision($user, $subscription);
    }

    public function test_same_subscription_always_sends_same_external_reference(): void
    {
        $this->configurePos();
        Http::fake([
            '*/provisioning/tenants' => Http::response([
                'success' => true,
                'data' => ['external_user_id' => '1', 'external_account_id' => '1', 'metadata' => []],
            ], 200),
        ]);

        $user = User::factory()->create();
        $subscription = $this->subscriptionWithOrder($user);
        $adapter = new PosProvisioningAdapter;

        $adapter->provision($user, $subscription);
        $adapter->provision($user, $subscription);

        $references = collect(Http::recorded())
            ->map(fn ($pair) => $pair[0]['external_reference'])
            ->unique();

        $this->assertCount(1, $references);
    }
}
