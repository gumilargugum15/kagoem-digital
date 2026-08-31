<?php

namespace App\Models;

use App\Enums\ApplicationProvisioningStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tracks the provisioning job for one Subscription — unique per subscription_id,
 * which is what makes provisioning idempotent under duplicate Midtrans notifications.
 */
class ApplicationProvisioning extends Model
{
    protected $fillable = [
        'subscription_id',
        'application_id',
        'application_account_id',
        'status',
        'attempts',
        'last_error',
        'provisioned_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => ApplicationProvisioningStatus::class,
            'attempts' => 'integer',
            'provisioned_at' => 'datetime',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(ApplicationAccount::class, 'application_account_id');
    }
}
