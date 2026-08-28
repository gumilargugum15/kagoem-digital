<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Models\Cart;
use App\Notifications\OrderCreatedNotification;
use App\Services\CheckoutService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly CheckoutService $checkoutService) {}

    public function store(CheckoutRequest $request): JsonResponse
    {
        $user = $request->user();
        $cart = Cart::firstOrCreate(['user_id' => $user->id], ['currency' => 'IDR']);

        $order = $this->checkoutService->checkout($user, $cart, $request->validated('phone'));

        $user->notify(new OrderCreatedNotification($order));

        return $this->success($order, 'Order created', 201);
    }
}
