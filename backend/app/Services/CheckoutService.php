<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use App\Models\Cart;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    /**
     * Atomically turn a user's cart into a pending order + pending payment.
     *
     * Locking the cart and its items for the duration of the transaction is what
     * prevents a double-click/retry from creating two orders: a concurrent request
     * blocks on the row lock until the first checkout commits and clears the cart,
     * then finds the cart empty and is rejected instead of creating a duplicate order.
     */
    public function checkout(User $user, Cart $cart, ?string $phone): Order
    {
        $order = DB::transaction(function () use ($user, $cart, $phone) {
            $cart = Cart::whereKey($cart->id)->lockForUpdate()->firstOrFail();

            $items = $cart->items()
                ->with(['product', 'subscriptionPlan'])
                ->lockForUpdate()
                ->get();

            if ($items->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => ['Keranjang Anda kosong.'],
                ]);
            }

            foreach ($items as $item) {
                if (! $item->product || $item->product->status !== ProductStatus::Published) {
                    throw ValidationException::withMessages([
                        'cart' => ["Produk \"{$item->product_name}\" sudah tidak tersedia."],
                    ]);
                }

                if ($item->subscription_plan_id
                    && (! $item->subscriptionPlan || $item->subscriptionPlan->status !== ProductStatus::Published)
                ) {
                    throw ValidationException::withMessages([
                        'cart' => ["Paket untuk \"{$item->product_name}\" sudah tidak tersedia."],
                    ]);
                }
            }

            $subtotal = (float) $items->sum('subtotal');
            $discount = 0.0;
            $tax = 0.0;
            $total = $subtotal - $discount + $tax;

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => (string) Str::uuid(),
                'status' => OrderStatus::Pending,
                'currency' => $cart->currency,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => $phone,
            ]);

            $order->order_number = sprintf('KGO-%s-%06d', now()->format('Ymd'), $order->id);
            $order->save();

            foreach ($items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'subscription_plan_id' => $item->subscription_plan_id,
                    'product_name' => $item->product_name,
                    'product_type' => $item->product_type,
                    'billing_interval' => $item->billing_interval,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->price,
                    'subtotal' => $item->subtotal,
                ]);
            }

            $order->payments()->create([
                'provider' => null,
                'payment_method' => null,
                'transaction_id' => null,
                'amount' => $total,
                'currency' => $cart->currency,
                'status' => PaymentStatus::Pending,
                'paid_at' => null,
            ]);

            $cart->items()->delete();

            return $order;
        });

        return $order->load(['items', 'payment']);
    }
}
