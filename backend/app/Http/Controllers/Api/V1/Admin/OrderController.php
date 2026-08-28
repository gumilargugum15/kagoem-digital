<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $orders = Order::with(['user:id,name,email', 'items', 'payment'])
            ->latest()
            ->paginate(15);

        return $this->success($orders);
    }

    public function show(string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['user:id,name,email', 'items.subscription', 'items.digitalAccess', 'payment'])
            ->firstOrFail();

        return $this->success($order);
    }
}
