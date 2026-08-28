<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\MidtransException;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\MidtransService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly MidtransService $midtrans) {}

    public function store(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)
            ->where('order_number', $orderNumber)
            ->with('items')
            ->firstOrFail();

        if ($order->status !== OrderStatus::Pending) {
            return $this->error('Order ini tidak dapat dibayar.', 422);
        }

        $payment = $order->payment;

        if (! $payment || $payment->status !== PaymentStatus::Pending) {
            return $this->error('Order ini tidak dapat dibayar.', 422);
        }

        if ($payment->snap_token) {
            return $this->success([
                'order_number' => $order->order_number,
                'snap_token' => $payment->snap_token,
            ]);
        }

        $midtransOrderId = "{$order->order_number}-{$payment->id}";

        try {
            $result = $this->midtrans->createSnapTransaction($order, $midtransOrderId);
        } catch (MidtransException) {
            return $this->error('Pembayaran belum dapat diproses. Silakan coba lagi.', 502);
        }

        if (empty($result['token'])) {
            return $this->error('Pembayaran belum dapat diproses. Silakan coba lagi.', 502);
        }

        $payment->update([
            'midtrans_order_id' => $midtransOrderId,
            'snap_token' => $result['token'],
            'provider' => 'midtrans',
        ]);

        return $this->success([
            'order_number' => $order->order_number,
            'snap_token' => $payment->snap_token,
        ]);
    }
}
