<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 9);

        $products = Product::query()
            ->where('status', ProductStatus::Published)
            ->with(['plans' => fn ($query) => $query->where('status', ProductStatus::Published)])
            ->when(
                $request->query('category') && $request->query('category') !== 'All',
                fn ($query) => $query->where('category', $request->query('category')),
            )
            ->when($request->query('type'), fn ($query, $type) => $query->where('type', $type))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('short_description', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhereJsonContains('tags', $search);
                });
            })
            ->when($request->query('sort'), function ($query, $sort) {
                match ($sort) {
                    'popular' => $query->orderByDesc('purchases_count'),
                    'price_low' => $query->orderByRaw('COALESCE(discount_price, price) IS NULL')->orderBy('price'),
                    'price_high' => $query->orderByRaw('COALESCE(discount_price, price) IS NULL')->orderByDesc('price'),
                    default => $query->orderByDesc('published_at'),
                };
            }, fn ($query) => $query->orderByDesc('published_at'))
            ->paginate($perPage);

        return $this->success($products);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::where('status', ProductStatus::Published)
            ->where('slug', $slug)
            ->with(['features', 'plans.planFeatures'])
            ->firstOrFail();

        $related = Product::where('status', ProductStatus::Published)
            ->whereNot('id', $product->id)
            ->where(function ($query) use ($product) {
                $query->where('category', $product->category)
                    ->orWhere('type', $product->type);
            })
            ->orderByDesc('published_at')
            ->limit(4)
            ->get();

        return $this->success([
            'product' => $product,
            'related' => $related,
        ]);
    }
}
