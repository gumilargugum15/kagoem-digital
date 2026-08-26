<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Traits\ApiResponse;
use App\Traits\GeneratesUniqueSlug;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    use ApiResponse, GeneratesUniqueSlug;

    public function index(): JsonResponse
    {
        $products = Product::withCount('plans')
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get();

        return $this->success($products);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->safe()->except(['features', 'thumbnail', 'gallery', 'digital_file', 'og_image']);
        $data['slug'] = ($data['slug'] ?? null) ?: $this->uniqueSlug(Product::class, $data['name']);
        $data['published_at'] = $data['published_at'] ?? now();

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
        }

        if ($request->hasFile('og_image')) {
            $data['og_image'] = $request->file('og_image')->store('products', 'public');
        }

        if ($request->hasFile('gallery')) {
            $data['gallery'] = collect($request->file('gallery'))
                ->map(fn ($file) => $file->store('products/gallery', 'public'))
                ->all();
        }

        if ($request->hasFile('digital_file')) {
            $data['digital_file'] = $request->file('digital_file')->store('products/files', 'local');
        }

        $product = DB::transaction(function () use ($data, $request) {
            $product = Product::create($data);
            $this->syncFeatures($product, $request->input('features', []));

            return $product;
        });

        return $this->success($product->load('features'), 'Product created', 201);
    }

    public function show(Product $product): JsonResponse
    {
        return $this->success($product->load(['features', 'plans.planFeatures']));
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->safe()->except(['features', 'thumbnail', 'gallery', 'digital_file', 'og_image']);

        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = $this->uniqueSlug(Product::class, $data['name'], $product->id);
        }

        if ($request->hasFile('thumbnail')) {
            if ($product->thumbnail) {
                Storage::disk('public')->delete($product->thumbnail);
            }
            $data['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
        }

        if ($request->hasFile('og_image')) {
            if ($product->og_image) {
                Storage::disk('public')->delete($product->og_image);
            }
            $data['og_image'] = $request->file('og_image')->store('products', 'public');
        }

        if ($request->hasFile('gallery')) {
            foreach ((array) $product->gallery as $path) {
                Storage::disk('public')->delete($path);
            }
            $data['gallery'] = collect($request->file('gallery'))
                ->map(fn ($file) => $file->store('products/gallery', 'public'))
                ->all();
        }

        if ($request->hasFile('digital_file')) {
            if ($product->digital_file) {
                Storage::disk('local')->delete($product->digital_file);
            }
            $data['digital_file'] = $request->file('digital_file')->store('products/files', 'local');
        }

        DB::transaction(function () use ($data, $request, $product) {
            $product->update($data);
            if ($request->has('features')) {
                $this->syncFeatures($product, $request->input('features', []));
            }
        });

        return $this->success($product->fresh()->load('features'), 'Product updated');
    }

    public function destroy(Product $product): JsonResponse
    {
        if ($product->thumbnail) {
            Storage::disk('public')->delete($product->thumbnail);
        }
        if ($product->og_image) {
            Storage::disk('public')->delete($product->og_image);
        }
        foreach ((array) $product->gallery as $path) {
            Storage::disk('public')->delete($path);
        }
        if ($product->digital_file) {
            Storage::disk('local')->delete($product->digital_file);
        }

        $product->delete();

        return $this->success(null, 'Product deleted');
    }

    private function syncFeatures(Product $product, array $features): void
    {
        $product->features()->delete();

        foreach (array_values($features) as $index => $feature) {
            if (empty($feature['name'])) {
                continue;
            }

            $product->features()->create([
                'name' => $feature['name'],
                'description' => $feature['description'] ?? null,
                'sort_order' => $index,
            ]);
        }
    }
}
