<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\SubscriptionPlan;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $cart = $this->resolveCart($request);

        return $this->success($cart->load($this->cartRelations()));
    }

    public function store(StoreCartItemRequest $request): JsonResponse
    {
        $cart = $this->resolveCart($request);

        $product = Product::find($request->integer('product_id'));

        if (! $product || $product->status !== ProductStatus::Published) {
            return $this->error('Product is no longer available.', 422);
        }

        $plan = null;

        if ($request->filled('subscription_plan_id')) {
            $plan = SubscriptionPlan::where('product_id', $product->id)
                ->find($request->integer('subscription_plan_id'));

            if (! $plan || $plan->status !== ProductStatus::Published) {
                return $this->error('Subscription plan is not available.', 422);
            }

            if ($plan->price === null) {
                return $this->error('Paket ini memerlukan konsultasi. Silakan hubungi kami.', 422);
            }
        }

        if ($product->type === ProductType::Subscription && ! $plan) {
            return $this->error('Silakan pilih paket terlebih dahulu.', 422);
        }

        if ($product->type !== ProductType::Subscription && $plan) {
            return $this->error('Product is not a subscription product.', 422);
        }

        $existing = $cart->items()
            ->where('product_id', $product->id)
            ->where('subscription_plan_id', $plan?->id)
            ->first();

        if ($existing && $product->type === ProductType::Subscription) {
            return $this->error('Produk ini sudah ada di keranjang.', 422);
        }

        $quantity = $product->type === ProductType::Subscription ? 1 : max(1, $request->integer('quantity', 1));

        $item = DB::transaction(fn () => $this->addItemToCart($cart, $product, $plan, $existing, $quantity));

        return $this->success([
            'cart' => $cart->fresh()->load($this->cartRelations()),
            'item' => $item,
        ], 'Product added to cart.', 201);
    }

    public function update(UpdateCartItemRequest $request, CartItem $item): JsonResponse
    {
        $cart = $this->resolveCart($request);

        if ($item->cart_id !== $cart->id) {
            return $this->error('Cart item not found.', 404);
        }

        if ($item->subscription_plan_id !== null) {
            return $this->error('Quantity for a subscription item cannot be changed.', 422);
        }

        $quantity = $request->integer('quantity');
        $item->update([
            'quantity' => $quantity,
            'subtotal' => $item->price * $quantity,
        ]);

        return $this->success($cart->fresh()->load($this->cartRelations()), 'Cart updated');
    }

    public function destroy(Request $request, CartItem $item): JsonResponse
    {
        $cart = $this->resolveCart($request);

        if ($item->cart_id !== $cart->id) {
            return $this->error('Cart item not found.', 404);
        }

        $item->delete();

        return $this->success($cart->fresh()->load($this->cartRelations()), 'Item removed from cart.');
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $cart->items()->delete();

        return $this->success($cart->fresh()->load($this->cartRelations()), 'Cart cleared.');
    }

    private function cartRelations(): array
    {
        return [
            'items.product:id,name,slug,thumbnail,type',
            'items.subscriptionPlan:id,name',
        ];
    }

    private function resolveCart(Request $request): Cart
    {
        $user = $request->user('sanctum');
        $sessionId = $request->header('X-Cart-Session');

        if ($user) {
            $cart = Cart::firstOrCreate(['user_id' => $user->id], ['currency' => 'IDR']);

            if ($sessionId) {
                $guestCart = Cart::where('session_id', $sessionId)->whereNull('user_id')->first();

                if ($guestCart && $guestCart->id !== $cart->id) {
                    DB::transaction(function () use ($guestCart, $cart) {
                        $this->mergeCarts($guestCart, $cart);
                    });
                }
            }

            return $cart;
        }

        if (! $sessionId) {
            throw ValidationException::withMessages([
                'session' => ['Cart session is required.'],
            ]);
        }

        return Cart::firstOrCreate(
            ['session_id' => $sessionId, 'user_id' => null],
            ['currency' => 'IDR'],
        );
    }

    private function addItemToCart(
        Cart $cart,
        Product $product,
        ?SubscriptionPlan $plan,
        ?CartItem $existing,
        int $quantity,
    ): CartItem {
        $price = $plan?->price ?? $product->discount_price ?? $product->price ?? 0;
        $billingInterval = $plan?->billing_interval?->value;

        if ($existing) {
            $existing->quantity += $quantity;
            $existing->price = $price;
            $existing->subtotal = $price * $existing->quantity;
            $existing->save();

            return $existing;
        }

        return $cart->items()->create([
            'product_id' => $product->id,
            'subscription_plan_id' => $plan?->id,
            'product_name' => $product->name,
            'product_type' => $product->type,
            'price' => $price,
            'quantity' => $quantity,
            'billing_interval' => $billingInterval,
            'subtotal' => $price * $quantity,
        ]);
    }

    private function mergeCarts(Cart $from, Cart $to): void
    {
        foreach ($from->items as $guestItem) {
            $product = Product::find($guestItem->product_id);

            if (! $product || $product->status !== ProductStatus::Published) {
                continue;
            }

            $plan = $guestItem->subscription_plan_id
                ? SubscriptionPlan::where('product_id', $product->id)->find($guestItem->subscription_plan_id)
                : null;

            if ($guestItem->subscription_plan_id && (! $plan || $plan->status !== ProductStatus::Published)) {
                continue;
            }

            $existing = $to->items()
                ->where('product_id', $guestItem->product_id)
                ->where('subscription_plan_id', $guestItem->subscription_plan_id)
                ->first();

            if ($existing) {
                if ($product->type !== ProductType::Subscription) {
                    $price = $plan?->price ?? $product->discount_price ?? $product->price ?? 0;
                    $existing->quantity += $guestItem->quantity;
                    $existing->price = $price;
                    $existing->subtotal = $price * $existing->quantity;
                    $existing->save();
                }

                // Subscription duplicates are simply dropped — the user cart's item wins.
                continue;
            }

            $guestItem->update(['cart_id' => $to->id]);
        }

        $from->delete();
    }
}
