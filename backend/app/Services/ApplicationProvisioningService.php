<?php

namespace App\Services;

use App\Enums\ApplicationAccountStatus;
use App\Enums\ApplicationProvisioningStatus;
use App\Enums\SubscriptionStatus;
use App\Models\Application;
use App\Models\ApplicationAccount;
use App\Models\ApplicationProvisioning;
use App\Models\Subscription;
use App\Notifications\PosAccountOnboardingNotification;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Generic Application Provisioning Engine.
 *
 * Turns an ACTIVE Subscription into real access in whatever external Application its
 * Product points to (POS, Inventory, Accounting, ...), by resolving the adapter registered
 * for that application's code (config/application_provisioning.php) — no application-specific
 * logic lives here, only orchestration, idempotency, retry, and status tracking.
 *
 * Never throws: a failed provisioning attempt is recorded as such and does not affect
 * Payment/Order/Subscription, which is why this is safe to call from inside the same
 * DB transaction that just marked those PAID/ACTIVE.
 */
class ApplicationProvisioningService
{
    public function provision(Subscription $subscription): void
    {
        if ($subscription->status !== SubscriptionStatus::Active) {
            return;
        }

        $application = $subscription->application();

        if (! $application) {
            // Not every subscription product is necessarily linked to a provisionable
            // application (e.g. it predates this feature, or is a plain support-only plan).
            return;
        }

        $provisioning = ApplicationProvisioning::firstOrCreate(
            ['subscription_id' => $subscription->id],
            ['application_id' => $application->id, 'status' => ApplicationProvisioningStatus::Pending],
        );

        if ($provisioning->status === ApplicationProvisioningStatus::Completed) {
            return;
        }

        $this->attempt($provisioning, $subscription, $application);
    }

    public function retry(ApplicationProvisioning $provisioning): void
    {
        if ($provisioning->status === ApplicationProvisioningStatus::Completed) {
            return;
        }

        $this->attempt($provisioning, $provisioning->subscription, $provisioning->application);
    }

    private function attempt(ApplicationProvisioning $provisioning, Subscription $subscription, Application $application): void
    {
        $provisioning->update([
            'status' => ApplicationProvisioningStatus::Processing,
            'attempts' => $provisioning->attempts + 1,
        ]);

        $logContext = [
            'user_id' => $subscription->user_id,
            'subscription_id' => $subscription->id,
            'application_id' => $application->id,
            'application_code' => $application->code,
        ];

        Log::info('APPLICATION_PROVISIONING_STARTED', $logContext);

        $adapterClass = config("application_provisioning.adapters.{$application->code}");

        if (! $adapterClass) {
            $this->fail($provisioning, $logContext, "No provisioning adapter registered for application code '{$application->code}'.");

            return;
        }

        try {
            $adapter = app($adapterClass);
            $result = $adapter->provision($subscription->user, $subscription);

            $account = ApplicationAccount::updateOrCreate(
                ['user_id' => $subscription->user_id, 'application_id' => $application->id],
                [
                    'external_user_id' => $result['external_user_id'] ?? null,
                    'external_account_id' => $result['external_account_id'] ?? null,
                    'status' => ApplicationAccountStatus::Active,
                    'metadata' => $result['metadata'] ?? null,
                ],
            );

            $this->maybeSendOnboardingEmail($account, $subscription, $application, $result['metadata'] ?? []);

            $provisioning->update([
                'status' => ApplicationProvisioningStatus::Completed,
                'application_account_id' => $account->id,
                'provisioned_at' => now(),
                'last_error' => null,
            ]);

            Log::info('APPLICATION_PROVISIONING_COMPLETED', [...$logContext, 'application_account_id' => $account->id]);
        } catch (Throwable $e) {
            $this->fail($provisioning, $logContext, $e->getMessage());
        }
    }

    /**
     * Send the customer their POS set-password link — but only the one time it's
     * actually needed: a brand-new ApplicationAccount for a brand-new external user.
     * Re-provisioning an existing account (retry, re-subscription) or reusing an
     * owner that already existed on the external side must never re-trigger this,
     * since either the customer already has working credentials or resending would
     * silently invalidate a password they already use. See
     * KAGOEM_POS_CUSTOMER_ONBOARDING_SET_PASSWORD_DESIGN.md §8.
     */
    private function maybeSendOnboardingEmail(ApplicationAccount $account, Subscription $subscription, Application $application, array $metadata): void
    {
        if (! $account->wasRecentlyCreated) {
            return;
        }

        if (($metadata['user_was_created'] ?? false) !== true) {
            return;
        }

        if (empty($metadata['set_password_token']) || empty($application->base_url)) {
            return;
        }

        $subscription->user->notify(new PosAccountOnboardingNotification($subscription, $application, $metadata));
    }

    private function fail(ApplicationProvisioning $provisioning, array $logContext, string $message): void
    {
        $provisioning->update([
            'status' => ApplicationProvisioningStatus::Failed,
            'last_error' => $message,
        ]);

        Log::warning('APPLICATION_PROVISIONING_FAILED', [...$logContext, 'error' => $message]);
    }
}
