<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\MidtransException;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Notifications\PaymentSuccessNotification;
use App\Services\MidtransService;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MidtransNotificationController extends Controller
{
    public function __construct(
        private readonly MidtransService $midtrans,
        private readonly OrderFulfillmentService $fulfillment,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::info('Midtrans notification received', [
            'order_id' => $payload['order_id'] ?? null,
            'transaction_status' => $payload['transaction_status'] ?? null,
            'fraud_status' => $payload['fraud_status'] ?? null,
        ]);

        if (! $this->midtrans->isSignatureValid($payload)) {
            Log::warning('Midtrans notification rejected: invalid signature', [
                'order_id' => $payload['order_id'] ?? null,
            ]);

            return response()->json(['message' => 'Invalid signature.'], 403);
        }

        $midtransOrderId = (string) $payload['order_id'];
        $payment = Payment::where('midtrans_order_id', $midtransOrderId)->first();

        if (! $payment) {
            Log::warning('Midtrans notification for unknown transaction', ['order_id' => $midtransOrderId]);

            return response()->json(['message' => 'Transaction not found.'], 404);
        }

        try {
            $status = $this->midtrans->getStatus($midtransOrderId);
        } catch (MidtransException) {
            // Transient failure fetching authoritative status — ask Midtrans to retry later.
            return response()->json(['message' => 'Unable to verify transaction status.'], 503);
        }

        // Midtrans's Get Status endpoint can respond HTTP 200 with a body of
        // {"status_code": "404", "status_message": "Transaction doesn't exist."} when it has
        // no record of this transaction (e.g. the customer never opened the payment page).
        // That's distinct from an amount mismatch — don't touch payment/order state, and ask
        // Midtrans to retry later rather than silently accepting or misreporting it.
        if (($status['status_code'] ?? null) === '404') {
            Log::warning('Midtrans has no record of this transaction yet', [
                'order_id' => $midtransOrderId,
            ]);

            return response()->json(['message' => 'Transaction status not yet available.'], 503);
        }

        [$shouldNotify, $order] = DB::transaction(function () use ($payment, $status) {
            $payment = Payment::whereKey($payment->id)->lockForUpdate()->first();
            $order = Order::whereKey($payment->order_id)->lockForUpdate()->first();

            return [$this->applyStatus($payment, $order, $status), $order];
        });

        if ($shouldNotify) {
            $order->user?->notify(new PaymentSuccessNotification($order));
        }

        return response()->json(['message' => 'OK']);
    }

    /**
     * Apply Midtrans's authoritative status to the payment/order inside a locked transaction.
     * Returns whether a "payment success" email should be sent (i.e. this call is the one
     * that actually transitioned the payment into PAID, not a duplicate/already-applied one).
     */
    private function applyStatus(Payment $payment, Order $order, array $status): bool
    {
        $transactionStatus = $status['transaction_status'] ?? null;
        $fraudStatus = $status['fraud_status'] ?? null;
        $grossAmount = (float) ($status['gross_amount'] ?? 0);

        if (abs($grossAmount - (float) $order->total) > 0.01) {
            Log::warning('Midtrans amount mismatch — payment left unchanged', [
                'order_number' => $order->order_number,
                'order_total' => (float) $order->total,
                'midtrans_gross_amount' => $grossAmount,
            ]);

            $payment->update(['raw_response' => $status]);

            return false;
        }

        [$paymentStatus, $orderStatus] = match (true) {
            in_array($transactionStatus, ['capture', 'settlement'], true)
                && ($fraudStatus === null || $fraudStatus === 'accept') => [PaymentStatus::Paid, OrderStatus::Paid],
            $transactionStatus === 'capture' && $fraudStatus === 'challenge' => [PaymentStatus::Pending, OrderStatus::Pending],
            $transactionStatus === 'pending' => [PaymentStatus::Pending, OrderStatus::Pending],
            $transactionStatus === 'expire' => [PaymentStatus::Expired, OrderStatus::Expired],
            $transactionStatus === 'cancel' => [PaymentStatus::Cancelled, OrderStatus::Cancelled],
            $transactionStatus === 'deny' => [PaymentStatus::Failed, OrderStatus::Failed],
            default => [$payment->status, $order->status],
        };

        $wasPaid = $payment->status === PaymentStatus::Paid;

        $payment->update([
            'status' => $paymentStatus,
            'transaction_id' => $status['transaction_id'] ?? $payment->transaction_id,
            'payment_method' => $status['payment_type'] ?? $payment->payment_method,
            'fraud_status' => $fraudStatus,
            'raw_response' => $status,
            'paid_at' => $paymentStatus === PaymentStatus::Paid ? ($payment->paid_at ?? now()) : $payment->paid_at,
        ]);

        $order->update(['status' => $orderStatus]);

        if ($paymentStatus === PaymentStatus::Paid) {
            $this->fulfillment->fulfill($order->fresh(['items', 'payment']));
        }

        return $paymentStatus === PaymentStatus::Paid && ! $wasPaid;
    }
}
