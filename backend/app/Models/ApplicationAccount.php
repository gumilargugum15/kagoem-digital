<?php

namespace App\Models;

use App\Enums\ApplicationAccountStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Maps one Kagoem Digital User to their account inside one external Application.
 * One row per (user, application) — reused across every subscription/product the
 * user has within that same application, never duplicated.
 */
class ApplicationAccount extends Model
{
    protected $fillable = [
        'user_id',
        'application_id',
        'external_user_id',
        'external_account_id',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'status' => ApplicationAccountStatus::class,
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
