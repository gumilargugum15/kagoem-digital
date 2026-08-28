<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->when($request->filled('search'), fn ($query) => $query->where(
                'order_number', 'like', '%'.$request->input('search').'%'
            ))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->input('status')))
            ->with(['items', 'payment'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $this->success($orders);
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)
            ->where('order_number', $orderNumber)
            ->with(['items.subscription', 'items.digitalAccess', 'payment'])
            ->firstOrFail();

        return $this->success($order);
    }
}
