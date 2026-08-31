<?php

namespace Tests\Feature;

use App\Contracts\ApplicationProvisioningAdapter;
use App\Enums\ApplicationProvisioningStatus;
use App\Enums\ApplicationStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Enums\SubscriptionStatus;
use App\Exceptions\ApplicationProvisioningException;
use App\Models\Application;
use App\Models\ApplicationAccount;
use App\Models\ApplicationProvisioning;
use App\Models\Order;
use App\Models\Product;
use App\Models\Subscription;
use App\Models\User;
use App\Services\ApplicationProvisioningService;
use App\Services\OrderFulfillmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * Always-succeeding fake adapter, for testing the engine (idempotency, account reuse,
 * multiple applications) without depending on any real external system.
 */
class FakeSucceedingProvisioningAdapter implements ApplicationProvisioningAdapter
{
    /** @var array<int, int> call count per user id, for asserting no duplicate calls-with-effect */
    public static array $calls = [];

    public function provision(User $user, Subscription $subscription): array
    {
        self::$calls[$user->id] = (self::$calls[$user->id] ?? 0) + 1;

        return [
            'external_user_id' => 'ext-user-'.$user->id,
            'external_account_id' => 'ext-account-'.$user->id,
            'metadata' => ['source' => 'fake'],
        ];
    }
}

/**
 * Always-failing fake adapter, for testing failure handling.
 */
class FakeFailingProvisioningAdapter implements ApplicationProvisioningAdapter
{
    public function provision(User $user, Subscription $subscription): array
    {
        throw new ApplicationProvisioningException('Simulated external API failure.');
    }
}

/**
 * Fails on the first attempt, succeeds afterwards — for testing retry.
 */
class FakeEventuallySucceedingAdapter implements ApplicationProvisioningAdapter
{
    public static int $attempts = 0;

    public function provision(User $user, Subscription $subscription): array
    {
        self::$attempts++;

        if (self::$attempts < 2) {
            throw new ApplicationProvisioningException('Simulated transient failure.');
        }

        return [
            'external_user_id' => 'ext-user-'.$user->id,
            'external_account_id' => 'ext-account-'.$user->id,
            'metadata' => [],
        ];
    }
}

class ApplicationProvisioningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        FakeSucceedingProvisioningAdapter::$calls = [];
        FakeEventuallySucceedingAdapter::$attempts = 0;
    }

    private function application(string $code, array $overrides = []): Application
    {
        return Application::create(array_merge([
            'name' => ucfirst($code),
            'code' => $code,
            'base_url' => "https://{$code}.example.test",
            'status' => ApplicationStatus::Active,
        ], $overrides));
    }

    private function subscriptionProduct(?Application $application = null, array $overrides = []): Product
    {
        return Product::create(array_merge([
            'name' => 'Subscription Product',
            'slug' => 'sub-product-'.uniqid(),
            'type' => ProductType::Subscription,
            'application_id' => $application?->id,
            'category' => 'Subscription',
            'short_description' => 'desc',
            'status' => ProductStatus::Published,
        ], $overrides));
    }

    private function digitalProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'name' => 'Digital Product',
            'slug' => 'digital-product-'.uniqid(),
            'type' => ProductType::Digital,
            'category' => 'Ebook',
            'short_description' => 'desc',
            'price' => 50000,
            'status' => ProductStatus::Published,
        ], $overrides));
    }

    private function paidOrderWithSubscriptionItem(User $user, Product $product): Order
    {
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
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_type' => $product->type,
            'billing_interval' => 'monthly',
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

        return $order->fresh(['items', 'payment']);
    }

    private function makeSubscription(User $user, Product $product, Order $order, array $overrides = []): Subscription
    {
        return Subscription::create(array_merge([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
            'order_item_id' => $order->items->first()->id,
            'status' => SubscriptionStatus::Active,
            'started_at' => now(),
            'expires_at' => now()->addMonth(),
        ], $overrides));
    }

    // TEST 1: Subscription ACTIVE -> Provisioning triggered.
    public function test_active_subscription_triggers_provisioning(): void
    {
        config(['application_provisioning.adapters.fake-app' => FakeSucceedingProvisioningAdapter::class]);
        $app = $this->application('fake-app');
        $user = User::factory()->create();
        $product = $this->subscriptionProduct($app);
        $order = $this->paidOrderWithSubscriptionItem($user, $product);
        $subscription = $this->makeSubscription($user, $product, $order);

        app(ApplicationProvisioningService::class)->provision($subscription);

        $this->assertDatabaseHas('application_provisionings', [
            'subscription_id' => $subscription->id,
            'status' => 'completed',
        ]);
        $this->assertSame(1, FakeSucceedingProvisioningAdapter::$calls[$user->id] ?? 0);
    }

    // TEST 2: Subscription PENDING -> Provisioning not triggered.
    public function test_pending_subscription_does_not_trigger_provisioning(): void
    {
        config(['application_provisioning.adapters.fake-app' => FakeSucceedingProvisioningAdapter::class]);
        $app = $this->application('fake-app');
        $user = User::factory()->create();
        $product = $this->subscriptionProduct($app);
        $order = $this->paidOrderWithSubscriptionItem($user, $product);
        $subscription = $this->makeSubscription($user, $product, $order, ['status' => SubscriptionStatus::Pending]);

        app(ApplicationProvisioningService::class)->provision($subscription);

        $this->assertDatabaseCount('application_provisionings', 0);
    }

    // TEST 3: Payment PENDING -> Provisioning not triggered.
    public function test_pending_payment_does_not_trigger_provisioning(): void
    {
        config(['application_provisioning.adapters.fake-app' => FakeSucceedingProvisioningAdapter::class]);
        $app = $this->application('fake-app');
        $user = User::factory()->create();
        $product = $this->subscriptionProduct($app);
        $order = $this->paidOrderWithSubscriptionItem($user, $product);
        $order->update(['status' => OrderStatus::Pending]);

        app(OrderFulfillmentService::class)->fulfill($order->fresh(['items', 'payment']));

        $this->assertDatabaseCount('subscriptions', 0);
        $this->assertDatabaseCount('application_provisionings', 0);
    }

    // TEST 4: Payment FAILED -> Provisioning not triggered.
    public function test_failed_payment_does_not_trigger_provisioning(): void
    {
        config(['application_provisioning.adapters.fake-app' => FakeSucceedingProvisioningAdapter::class]);
        $app = $this->application('fake-app');
        $user = User::factory()->create();
        $product = $this->subscriptionProduct($app);
        $order = $this->paidOrderWithSubscriptionItem($user, $product);
        $order->update(['status' => OrderStatus::Failed]);

        app(OrderFulfillmentService::class)->fulfill($order->fresh(['items', 'payment']));

        $this->assertDatabaseCount('subscriptions', 0);
        $this->assertDatabaseCount('application_provisionings', 0);
    }

    // TEST 5: Application = POS -> the real POS adapter is used (and honestly fails today).
    public function test_pos_application_uses_pos_adapter(): void
    {
        config(['services.pos.api_url' => 'https://pos.test/api/v1', 'services.pos.service_token' => 'test-token']);
        Http::fake([
            '*/provisioning/tenants' => Http::response([
                'success' => true,
                'message' => 'Tenant provisioned',
                'data' => [
                    'external_user_id' => '6',
                    'external_account_id' => '2',
                    'metadata' => ['tenant_id' => 2, 'tenant_slug' => 'test-tenant'],
                ],
            ], 201),
        ]);
        $pos = $this->application('pos', ['name' => 'POS']);
        $user = User::factory()->create();
        $product = $this->subscriptionProduct($pos);
        $order = $this->paidOrderWithSubscriptionItem($user, $product);
        $subscription = $this->makeSubscription($user, $product, $order);

        app(ApplicationProvisioningService::class)->provision($subscription);

        $provisioning = ApplicationProvisioning::where('subscription_id', $subscription->id)->first();
        $this->assertSame(ApplicationProvisioningStatus::Completed, $provisioning->status);

        Http::assertSent(function ($request) use ($subscription) {
            return $request->url() === 'https://pos.test/api/v1/provisioning/tenants'
                && $request['external_reference'] === "kagoem-digital:subscription:{$subscription->id}"
                && $request->hasHeader('Authorization', 'Bearer test-token');
        });
    }

    // TEST 6: Application = Inventory -> architecture can resolve an Inventory adapter once registered.
    public function test_inventory_application_resolves_its_own_adapter_when_available(): void
    {
        config(['application_provisioning.adapters.inventory' => FakeSucceedingProvisioningAdapter::class]);
        $inventory = $this->application('inventory', ['name' => 'Inventory']);
        $user = User::factory()->create();
        $product = $this->subscriptionProduct($inventory);
        $order = $this->paidOrderWithSubscriptionItem($user, $product);
        $subscription = $this->makeSubscription($user, $product, $order);

        app(ApplicationProvisioningService::class)->provision($subscription);

        $this->assertDatabaseHas('application_provisionings', [
            'subscription_id' => $subscription->id,
            'application_id' => $inventory->id,
            'status' => 'completed',
        ]);
    }

    // TEST 7: Same subscription provisioned twice -> no duplicate account.
    public function test_provisioning_same_subscription_twice_does_not_duplicate_account(): void
    {
        config(['application_provisioning.adapters.fake-app' => FakeSucceedingProvisioningAdapter::class]);
        $app = $this->application('fake-app');
        $user = User::factory()->create();
        $product = $this->subscriptionProduct($app);
        $order = $this->paidOrderWithSubscriptionItem($user, $product);
        $subscription = $this->makeSubscription($user, $product, $order);

        $service = app(ApplicationProvisioningService::class);
        $service->provision($subscription);
        $service->provision($subscription);

        $this->assertDatabaseCount('application_accounts', 1);
        $this->assertSame(1, FakeSucceedingProvisioningAdapter::$calls[$user->id] ?? 0);
    }

    // TEST 8: Existing external account is reused across a second subscription for the same app.
    public function test_existing_application_account_is_reused(): void
    {
        config(['application_provisioning.adapters.fake-app' => FakeSucceedingProvisioningAdapter::class]);
        $app = $this->application('fake-app');
        $user = User::factory()->create();
        $productA = $this->subscriptionProduct($app, ['name' => 'Plan A']);
        $productB = $this->subscriptionProduct($app, ['name' => 'Plan B']);
        $orderA = $this->paidOrderWithSubscriptionItem($user, $productA);
        $orderB = $this->paidOrderWithSubscriptionItem($user, $productB);
        $subA = $this->makeSubscription($user, $productA, $orderA);
        $subB = $this->makeSubscription($user, $productB, $orderB);

        $service = app(ApplicationProvisioningService::class);
        $service->provision($subA);
        $service->provision($subB);

        $this->assertDatabaseCount('application_accounts', 1);
        $account = ApplicationAccount::first();
        $this->assertDatabaseHas('application_provisionings', [
            'subscription_id' => $subA->id,
            'application_account_id' => $account->id,
        ]);
        $this->assertDatabaseHas('application_provisionings', [
            'subscription_id' => $subB->id,
            'application_account_id' => $account->id,
        ]);
    }

    // TEST 9: External API failure -> provisioning FAILED, subscription/payment unaffected.
    public function test_external_api_failure_marks_provisioning_failed(): void
    {
        config(['application_provisioning.adapters.fake-app' => FakeFailingProvisioningAdapter::class]);
        $app = $this->application('fake-app');
        $user = User::factory()->create();
        $product = $this->subscriptionProduct($app);
        $order = $this->paidOrderWithSubscriptionItem($user, $product);
        $subscription = $this->makeSubscription($user, $product, $order);

        app(ApplicationProvisioningService::class)->provision($subscription);

        $this->assertDatabaseHas('application_provisionings', [
            'subscription_id' => $subscription->id,
            'status' => 'failed',
        ]);
        $this->assertDatabaseCount('application_accounts', 0);
        // Subscription/Order/Payment must be entirely unaffected by provisioning failure.
        $this->assertSame('active', $subscription->fresh()->status->value);
        $this->assertSame('paid', $order->fresh()->status->value);
    }

    // TEST 10: Failed provisioning can be retried and eventually succeeds.
    public function test_failed_provisioning_can_be_retried(): void
    {
        config(['application_provisioning.adapters.fake-app' => FakeEventuallySucceedingAdapter::class]);
        $app = $this->application('fake-app');
        $user = User::factory()->create();
        $product = $this->subscriptionProduct($app);
        $order = $this->paidOrderWithSubscriptionItem($user, $product);
        $subscription = $this->makeSubscription($user, $product, $order);

        $service = app(ApplicationProvisioningService::class);
        $service->provision($subscription);
        $this->assertDatabaseHas('application_provisionings', ['subscription_id' => $subscription->id, 'status' => 'failed']);

        $provisioning = ApplicationProvisioning::where('subscription_id', $subscription->id)->first();
        $service->retry($provisioning);

        $this->assertDatabaseHas('application_provisionings', [
            'subscription_id' => $subscription->id,
            'status' => 'completed',
            'attempts' => 2,
        ]);
    }

    // TEST 11: Digital product -> no application provisioning at all.
    public function test_digital_product_never_triggers_provisioning(): void
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();
        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => 'KGO-TEST-'.uniqid('', true),
            'status' => OrderStatus::Paid,
            'currency' => 'IDR',
            'subtotal' => 50000,
            'discount' => 0,
            'tax' => 0,
            'total' => 50000,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
        ]);
        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_type' => $product->type,
            'quantity' => 1,
            'unit_price' => 50000,
            'subtotal' => 50000,
        ]);
        $order->payments()->create([
            'amount' => $order->total,
            'currency' => $order->currency,
            'status' => PaymentStatus::Paid,
            'paid_at' => now(),
        ]);

        app(OrderFulfillmentService::class)->fulfill($order->fresh(['items', 'payment']));

        $this->assertDatabaseCount('subscriptions', 0);
        $this->assertDatabaseCount('application_provisionings', 0);
        $this->assertDatabaseCount('digital_product_access', 1);
    }

    // TEST 12: Multiple applications -> each subscription maps to its own correct application.
    public function test_multiple_applications_map_correctly(): void
    {
        config([
            'application_provisioning.adapters.fake-a' => FakeSucceedingProvisioningAdapter::class,
            'application_provisioning.adapters.fake-b' => FakeSucceedingProvisioningAdapter::class,
        ]);
        $appA = $this->application('fake-a');
        $appB = $this->application('fake-b');
        $user = User::factory()->create();
        $productA = $this->subscriptionProduct($appA);
        $productB = $this->subscriptionProduct($appB);
        $orderA = $this->paidOrderWithSubscriptionItem($user, $productA);
        $orderB = $this->paidOrderWithSubscriptionItem($user, $productB);
        $subA = $this->makeSubscription($user, $productA, $orderA);
        $subB = $this->makeSubscription($user, $productB, $orderB);

        $service = app(ApplicationProvisioningService::class);
        $service->provision($subA);
        $service->provision($subB);

        $this->assertDatabaseHas('application_provisionings', ['subscription_id' => $subA->id, 'application_id' => $appA->id]);
        $this->assertDatabaseHas('application_provisionings', ['subscription_id' => $subB->id, 'application_id' => $appB->id]);
        $this->assertDatabaseCount('application_accounts', 2);
    }

    // TEST 13: Multiple products, same application -> no duplicate application account.
    public function test_multiple_products_same_application_share_one_account(): void
    {
        config(['application_provisioning.adapters.fake-app' => FakeSucceedingProvisioningAdapter::class]);
        $app = $this->application('fake-app');
        $user = User::factory()->create();
        $basic = $this->subscriptionProduct($app, ['name' => 'POS Basic']);
        $pro = $this->subscriptionProduct($app, ['name' => 'POS Pro']);
        $orderBasic = $this->paidOrderWithSubscriptionItem($user, $basic);
        $orderPro = $this->paidOrderWithSubscriptionItem($user, $pro);
        $subBasic = $this->makeSubscription($user, $basic, $orderBasic);
        $subPro = $this->makeSubscription($user, $pro, $orderPro);

        $service = app(ApplicationProvisioningService::class);
        $service->provision($subBasic);
        $service->provision($subPro);

        $this->assertDatabaseCount('application_accounts', 1);
    }

    // TEST 14: Customers have no HTTP surface to manually trigger provisioning for any subscription.
    public function test_no_customer_facing_route_can_trigger_provisioning(): void
    {
        $matching = collect(Route::getRoutes())->first(
            fn ($route) => str_contains($route->uri(), 'provision')
        );

        $this->assertNull($matching, 'No route should exist for triggering application provisioning directly.');
    }
}
