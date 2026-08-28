<?php

namespace App\Models;

use App\Enums\DigitalAccessStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigitalProductAccess extends Model
{
    protected $table = 'digital_product_access';

    protected $fillable = [
        'user_id',
        'product_id',
        'order_id',
        'order_item_id',
        'status',
        'granted_at',
        'expires_at',
        'download_count',
    ];

    protected function casts(): array
    {
        return [
            'status' => DigitalAccessStatus::class,
            'granted_at' => 'datetime',
            'expires_at' => 'datetime',
            'download_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
