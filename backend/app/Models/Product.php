<?php

namespace App\Models;

use App\Enums\ProductStatus;
use App\Enums\ProductType;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'category',
        'short_description',
        'description',
        'thumbnail',
        'gallery',
        'tags',
        'badge',
        'price',
        'discount_price',
        'currency',
        'rating',
        'purchases_count',
        'demo_url',
        'digital_file',
        'download_url',
        'whats_included',
        'requirements',
        'technology',
        'faqs',
        'meta_title',
        'meta_description',
        'og_image',
        'sort_order',
        'status',
        'published_at',
    ];

    protected $hidden = [
        'digital_file',
    ];

    protected $appends = [
        'has_digital_file',
    ];

    public function getHasDigitalFileAttribute(): bool
    {
        return ! empty($this->attributes['digital_file']);
    }

    protected function casts(): array
    {
        return [
            'type' => ProductType::class,
            'status' => ProductStatus::class,
            'gallery' => 'array',
            'tags' => 'array',
            'whats_included' => 'array',
            'requirements' => 'array',
            'technology' => 'array',
            'faqs' => 'array',
            'price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'rating' => 'decimal:1',
            'purchases_count' => 'integer',
            'sort_order' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    public function features(): HasMany
    {
        return $this->hasMany(ProductFeature::class)->orderBy('sort_order');
    }

    public function plans(): HasMany
    {
        return $this->hasMany(SubscriptionPlan::class)->orderBy('sort_order');
    }
}
