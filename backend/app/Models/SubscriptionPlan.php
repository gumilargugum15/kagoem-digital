<?php

namespace App\Models;

use App\Enums\BillingInterval;
use App\Enums\ProductStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'product_id',
        'name',
        'description',
        'price',
        'billing_interval',
        'max_users',
        'max_branches',
        'max_products',
        'cta_label',
        'is_highlighted',
        'status',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'billing_interval' => BillingInterval::class,
            'status' => ProductStatus::class,
            'price' => 'decimal:2',
            'max_users' => 'integer',
            'max_branches' => 'integer',
            'max_products' => 'integer',
            'is_highlighted' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function planFeatures(): HasMany
    {
        return $this->hasMany(SubscriptionPlanFeature::class)->orderBy('sort_order');
    }
}
