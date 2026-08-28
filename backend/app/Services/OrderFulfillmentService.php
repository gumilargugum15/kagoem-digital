<?php

namespace App\Services;

use App\Enums\DigitalAccessStatus;
use App\Enums\OrderStatus;
use App\Enums\ProductType;
use App\Enums\SubscriptionStatus;
use App\Models\DigitalProductAccess;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Subscription;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Turns a PAID order into the access the customer actually paid for:
 * an active Subscription for subscription items, and a DigitalProductAccess
 * grant for digital items.
 *
 * Every fulfillment write is keyed by order_item_id, which is unique per
 * table — calling fulfill() on the same order twice (e.g. duplicate Midtrans
 * notifications) is a no-op the second time, via firstOrCreate.
 */
class OrderFulfillmentService
{
    public function fulfill(Order $order): void
    {
        if ($order->status !== OrderStatus::Paid) {
            return;
        }

        foreach ($order->items as $item) {
            match ($item->product_type) {
                ProductType::Subscription->value => $this->fulfillSubscription($order, $item),
                ProductType::Digital->value => $this->fulfillDigitalAccess($order, $item),
                default => null,
            };
        }
    }

    private function fulfillSubscription(Order $order, OrderItem $item): void
    {
        $startedAt = $order->payment?->paid_at ?? now();

        $subscription = Subscription::firstOrCreate(
            ['order_item_id' => $item->id],
            [
                'user_id' => $order->user_id,
                'product_id' => $item->product_id,
                'subscription_plan_id' => $item->subscription_plan_id,
                'order_id' => $order->id,
                'status' => SubscriptionStatus::Active,
                'started_at' => $startedAt,
                'expires_at' => $this->subscriptionExpiry($startedAt, $item->billing_interval),
            ],
        );

        if ($subscription->wasRecentlyCreated) {
            Log::info('Subscription fulfilled', [
                'order_number' => $order->order_number,
                'subscription_id' => $subscription->id,
            ]);
        }
    }

    private function fulfillDigitalAccess(Order $order, OrderItem $item): void
    {
        $access = DigitalProductAccess::firstOrCreate(
            ['order_item_id' => $item->id],
            [
                'user_id' => $order->user_id,
                'product_id' => $item->product_id,
                'order_id' => $order->id,
                'status' => DigitalAccessStatus::Active,
                'granted_at' => $order->payment?->paid_at ?? now(),
                'expires_at' => null,
                'download_count' => 0,
            ],
        );

        if ($access->wasRecentlyCreated) {
            Log::info('Digital product access granted', [
                'order_number' => $order->order_number,
                'digital_product_access_id' => $access->id,
            ]);
        }
    }

    private function subscriptionExpiry(Carbon $startedAt, ?string $billingInterval): Carbon
    {
        return match ($billingInterval) {
            'yearly' => $startedAt->copy()->addYear(),
            default => $startedAt->copy()->addMonth(),
        };
    }
}
