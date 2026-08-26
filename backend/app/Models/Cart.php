<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'currency',
    ];

    protected $appends = [
        'subtotal',
        'discount',
        'tax',
        'total',
        'items_count',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function getSubtotalAttribute(): float
    {
        return (float) $this->items->sum('subtotal');
    }

    public function getDiscountAttribute(): float
    {
        // Coupon/promo code architecture not implemented yet — always 0 for now.
        return 0.0;
    }

    public function getTaxAttribute(): float
    {
        // Tax rules not defined yet — always 0 for now.
        return 0.0;
    }

    public function getTotalAttribute(): float
    {
        return $this->subtotal - $this->discount + $this->tax;
    }

    public function getItemsCountAttribute(): int
    {
        return (int) $this->items->sum('quantity');
    }
}
