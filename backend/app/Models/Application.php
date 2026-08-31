<?php

namespace App\Models;

use App\Enums\ApplicationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A SaaS application Kagoem Digital can grant access to (POS, Inventory, Accounting, ...).
 * Distinct from Product: many Products (e.g. "POS Basic", "POS Pro") can point to the
 * same Application ("POS") — see products.application_id.
 */
class Application extends Model
{
    protected $fillable = [
        'name',
        'code',
        'base_url',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => ApplicationStatus::class,
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function accounts(): HasMany
    {
        return $this->hasMany(ApplicationAccount::class);
    }

    public function provisionings(): HasMany
    {
        return $this->hasMany(ApplicationProvisioning::class);
    }
}
