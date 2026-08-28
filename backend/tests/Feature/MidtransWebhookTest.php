<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Notifications\PaymentSuccessNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class MidtransWebhookTest extends TestCase
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

    private function orderWithPendingPayment(): Order
    {
        $user = User::factory()->create();
        $product = $this->digitalProduct();

        $order = Order::create([
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

        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_type' => $product->type,
            'quantity' => 1,
            'unit_price' => $product->price,
            'subtotal' => $product->price,
        ]);

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

    public function test_valid_settlement_notification_marks_payment_and_order_paid(): void
    {
        Notification::fake();
        $order = $this->orderWithPendingPayment();
        $payload = $this->signedPayload($order, ['transaction_status' => 'settlement']);
        $this->fakeStatus($payload);

        $response = $this->postJson('/api/v1/payment/midtrans/notification', $payload);

        $response->assertOk();
        $this->assertSame('paid', $order->fresh()->status->value);
        $this->assertSame('paid', $order->payment->fresh()->status->value);
        Notification::assertSentTo($order->user, PaymentSuccessNotification::class);
    }

    public function test_invalid_signature_is_rejected(): void
    {
        $order = $this->orderWithPendingPayment();
        $payload = $this->signedPayload($order);
        $payload['signature_key'] = 'tampered-signature';

        $response = $this->postJson('/api/v1/payment/midtrans/notification', $payload);

        $response->assertStatus(403);
        $this->assertSame('pending', $order->fresh()->status->value);
    }

    public function test_invalid_amount_is_rejected_and_does_not_mark_paid(): void
    {
        $order = $this->orderWithPendingPayment();
        // Sign the payload consistently but with a gross_amount that doesn't match the order total.
        $tamperedGross = number_format((float) $order->total + 500000, 2, '.', '');
        $payload = $this->signedPayload($order, ['gross_amount' => $tamperedGross]);
        $this->fakeStatus($payload);

        $response = $this->postJson('/api/v1/payment/midtrans/notification', $payload);

        $response->assertOk();
        $this->assertSame('pending', $order->fresh()->status->value);
        $this->assertSame('pending', $order->payment->fresh()->status->value);
    }

    public function test_midtrans_having_no_record_of_transaction_yet_leaves_status_unchanged(): void
    {
        $order = $this->orderWithPendingPayment();
        $payload = $this->signedPayload($order);
        // Midtrans's Get Status responds HTTP 200 with this body when it has no record of the
        // transaction yet (e.g. customer never opened the payment page) — must not be treated
        // as an amount mismatch, and must not mark anything paid.
        Http::fake([
            '*/v2/*/status' => Http::response([
                'status_code' => '404',
                'status_message' => "Transaction doesn't exist.",
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/payment/midtrans/notification', $payload);

        $response->assertStatus(503);
        $this->assertSame('pending', $order->fresh()->status->value);
        $this->assertSame('pending', $order->payment->fresh()->status->value);
    }

    public function test_unknown_order_id_is_handled_gracefully(): void
    {
        $payload = [
            'order_id' => 'KGO-DOES-NOT-EXIST-1',
            'status_code' => '200',
            'gross_amount' => '299000.00',
            'transaction_status' => 'settlement',
        ];
        $payload['signature_key'] = hash('sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].config('midtrans.server_key')
        );

        $response = $this->postJson('/api/v1/payment/midtrans/notification', $payload);

        $response->assertStatus(404);
    }

    public function test_pending_status_keeps_order_pending(): void
    {
        $order = $this->orderWithPendingPayment();
        $payload = $this->signedPayload($order, ['transaction_status' => 'pending', 'fraud_status' => null]);
        $this->fakeStatus($payload);

        $this->postJson('/api/v1/payment/midtrans/notification', $payload)->assertOk();

        $this->assertSame('pending', $order->fresh()->status->value);
        $this->assertSame('pending', $order->payment->fresh()->status->value);
    }

    public function test_expire_status_updates_payment_and_order(): void
    {
        $order = $this->orderWithPendingPayment();
        $payload = $this->signedPayload($order, ['transaction_status' => 'expire', 'fraud_status' => null]);
        $this->fakeStatus($payload);

        $this->postJson('/api/v1/payment/midtrans/notification', $payload)->assertOk();

        $this->assertSame('expired', $order->fresh()->status->value);
        $this->assertSame('expired', $order->payment->fresh()->status->value);
    }

    public function test_cancel_status_updates_payment_and_order(): void
    {
        $order = $this->orderWithPendingPayment();
        $payload = $this->signedPayload($order, ['transaction_status' => 'cancel', 'fraud_status' => null]);
        $this->fakeStatus($payload);

        $this->postJson('/api/v1/payment/midtrans/notification', $payload)->assertOk();

        $this->assertSame('cancelled', $order->fresh()->status->value);
        $this->assertSame('cancelled', $order->payment->fresh()->status->value);
    }

    public function test_deny_status_marks_payment_and_order_failed(): void
    {
        $order = $this->orderWithPendingPayment();
        $payload = $this->signedPayload($order, ['transaction_status' => 'deny', 'fraud_status' => null]);
        $this->fakeStatus($payload);

        $this->postJson('/api/v1/payment/midtrans/notification', $payload)->assertOk();

        $this->assertSame('failed', $order->fresh()->status->value);
        $this->assertSame('failed', $order->payment->fresh()->status->value);
    }

    public function test_duplicate_webhook_is_idempotent_and_sends_email_once(): void
    {
        Notification::fake();
        $order = $this->orderWithPendingPayment();
        $payload = $this->signedPayload($order, ['transaction_status' => 'settlement']);
        $this->fakeStatus($payload);

        $this->postJson('/api/v1/payment/midtrans/notification', $payload)->assertOk();
        $this->postJson('/api/v1/payment/midtrans/notification', $payload)->assertOk();
        $this->postJson('/api/v1/payment/midtrans/notification', $payload)->assertOk();

        $this->assertSame('paid', $order->fresh()->status->value);
        Notification::assertSentToTimes($order->user, PaymentSuccessNotification::class, 1);
    }

    public function test_paid_at_is_recorded_when_payment_settles(): void
    {
        $order = $this->orderWithPendingPayment();
        $payload = $this->signedPayload($order, ['transaction_status' => 'settlement']);
        $this->fakeStatus($payload);

        $this->postJson('/api/v1/payment/midtrans/notification', $payload)->assertOk();

        $this->assertNotNull(Payment::find($order->payment->id)->paid_at);
    }
}
