<?php

namespace App\Services\Provisioning;

use App\Contracts\ApplicationProvisioningAdapter;
use App\Exceptions\ApplicationProvisioningException;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * First real ApplicationProvisioningAdapter implementation — for the "pos" application code.
 *
 * Calls kagoem-pos-saas's real Provisioning Bootstrap endpoint
 * (POST {KAGOEM_POS_API_URL}/provisioning/tenants), confirmed against its actual source:
 *   - Auth: `Authorization: Bearer <KAGOEM_POS_SERVICE_TOKEN>`, checked by its
 *     VerifyProvisioningServiceToken middleware against its own PROVISIONING_SERVICE_TOKEN
 *     (a single shared secret — both sides must be configured with the same value).
 *   - Request: {external_reference, company_name, owner: {name, email, phone}, plan}.
 *   - Idempotency: keyed on `external_reference` on the kagoem-pos-saas side (a lookup-then-create
 *     with a unique-constraint race fallback) — retrying with the same value is always safe and
 *     never creates a second tenant, so this is deliberately derived from our own subscription_id.
 *   - Response: {success, message, data: {external_user_id, external_account_id, metadata}} —
 *     data.* maps verbatim onto this adapter's return contract.
 *   - metadata.set_password_token is a Password-Broker reset token for kagoem-pos-saas's existing
 *     `/api/v1/auth/reset-password` — it is reissued on every call, including idempotent retries,
 *     so only the most recently stored metadata (which ApplicationProvisioningService always
 *     overwrites via updateOrCreate) should ever be used to build a "set your password" link.
 */
class PosProvisioningAdapter implements ApplicationProvisioningAdapter
{
    public function provision(User $user, Subscription $subscription): array
    {
        $apiUrl = config('services.pos.api_url');
        $serviceToken = config('services.pos.service_token');

        if (! $apiUrl || ! $serviceToken) {
            throw new ApplicationProvisioningException(
                'POS provisioning is not configured: KAGOEM_POS_API_URL/KAGOEM_POS_SERVICE_TOKEN are missing.'
            );
        }

        $externalReference = "kagoem-digital:subscription:{$subscription->id}";

        $response = Http::withToken($serviceToken)
            ->acceptJson()
            ->asJson()
            ->post(rtrim($apiUrl, '/').'/provisioning/tenants', [
                'external_reference' => $externalReference,
                'company_name' => $user->name,
                'owner' => array_filter([
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $subscription->order?->customer_phone,
                ]),
                'plan' => $subscription->subscriptionPlan?->name,
            ]);

        if ($response->failed()) {
            Log::error('POS provisioning request failed', [
                'subscription_id' => $subscription->id,
                'external_reference' => $externalReference,
                'http_status' => $response->status(),
            ]);

            throw new ApplicationProvisioningException(
                "Failed to provision POS tenant (HTTP {$response->status()})."
            );
        }

        $data = $response->json('data', []);

        return [
            'external_user_id' => $data['external_user_id'] ?? null,
            'external_account_id' => $data['external_account_id'] ?? null,
            'metadata' => $data['metadata'] ?? [],
        ];
    }
}
