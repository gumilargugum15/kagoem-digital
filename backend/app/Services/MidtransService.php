<?php

namespace App\Services;

use App\Exceptions\MidtransException;
use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Thin wrapper around Midtrans's Snap + Core API using Laravel's HTTP client
 * (rather than the official SDK) so calls are trivially fake-able in tests
 * via Http::fake() and we don't add a dependency for what is, in practice,
 * two REST endpoints plus a documented SHA-512 signature formula.
 */
class MidtransService
{
    private string $serverKey;

    public function __construct(?string $serverKey = null)
    {
        $this->serverKey = $serverKey ?? (string) config('midtrans.server_key');
    }

    protected function snapBaseUrl(): string
    {
        return config('midtrans.is_production')
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';
    }

    protected function coreApiBaseUrl(): string
    {
        return config('midtrans.is_production')
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';
    }

    /**
     * Create a Snap transaction for the given order and return Midtrans's raw response
     * (contains `token` and `redirect_url`).
     */
    public function createSnapTransaction(Order $order, string $midtransOrderId): array
    {
        $response = Http::withBasicAuth($this->serverKey, '')
            ->acceptJson()
            ->asJson()
            ->post("{$this->snapBaseUrl()}/snap/v1/transactions", [
                'transaction_details' => [
                    'order_id' => $midtransOrderId,
                    'gross_amount' => (int) round((float) $order->total),
                ],
                'customer_details' => array_filter([
                    'first_name' => $order->customer_name,
                    'email' => $order->customer_email,
                    'phone' => $order->customer_phone,
                ]),
                'item_details' => $order->items->map(fn ($item) => [
                    'id' => (string) ($item->product_id ?? $item->id),
                    'price' => (int) round((float) $item->unit_price),
                    'quantity' => $item->quantity,
                    'name' => Str::limit($item->product_name, 50, ''),
                ])->all(),
            ]);

        if ($response->failed()) {
            Log::error('Midtrans create Snap transaction failed', [
                'order_number' => $order->order_number,
                'midtrans_order_id' => $midtransOrderId,
                'http_status' => $response->status(),
            ]);

            throw new MidtransException('Failed to create Midtrans Snap transaction.');
        }

        return $response->json();
    }

    /**
     * Fetch the authoritative transaction status from Midtrans's Core API.
     * This is called after signature verification so status updates are always
     * based on Midtrans's current record, not a possibly stale/replayed notification body.
     */
    public function getStatus(string $midtransOrderId): array
    {
        $response = Http::withBasicAuth($this->serverKey, '')
            ->acceptJson()
            ->get("{$this->coreApiBaseUrl()}/v2/{$midtransOrderId}/status");

        if ($response->failed()) {
            Log::error('Midtrans get status failed', [
                'midtrans_order_id' => $midtransOrderId,
                'http_status' => $response->status(),
            ]);

            throw new MidtransException('Failed to fetch Midtrans transaction status.');
        }

        return $response->json();
    }

    /**
     * Verify the notification body's signature_key per Midtrans's documented formula:
     * sha512(order_id + status_code + gross_amount + server_key).
     */
    public function isSignatureValid(array $payload): bool
    {
        if (! isset($payload['order_id'], $payload['status_code'], $payload['gross_amount'], $payload['signature_key'])) {
            return false;
        }

        $expected = hash('sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].$this->serverKey
        );

        return hash_equals($expected, (string) $payload['signature_key']);
    }
}
