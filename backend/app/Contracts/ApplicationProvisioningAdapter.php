<?php

namespace App\Contracts;

use App\Exceptions\ApplicationProvisioningException;
use App\Models\Subscription;
use App\Models\User;

/**
 * One implementation per external Application (POS, Inventory, Accounting, ...).
 * Implementations own everything specific to talking to that external system —
 * the provisioning engine never contains application-specific logic.
 */
interface ApplicationProvisioningAdapter
{
    /**
     * Ensure the given user has an active account in the external application, creating
     * one if it doesn't exist yet. Must be idempotent — calling this again for a user who
     * already has an account must reuse it, never create a duplicate.
     *
     * @return array{external_user_id: ?string, external_account_id: ?string, metadata: array<string, mixed>}
     *
     * @throws ApplicationProvisioningException if provisioning could not be completed.
     */
    public function provision(User $user, Subscription $subscription): array;
}
