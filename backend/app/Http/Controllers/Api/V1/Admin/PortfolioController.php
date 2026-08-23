<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePortfolioRequest;
use App\Http\Requests\UpdatePortfolioRequest;
use App\Models\Portfolio;
use App\Traits\ApiResponse;
use App\Traits\GeneratesUniqueSlug;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PortfolioController extends Controller
{
    use ApiResponse, GeneratesUniqueSlug;

    public function index(): JsonResponse
    {
        return $this->success(Portfolio::orderBy('sort_order')->get());
    }

    public function store(StorePortfolioRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = ($data['slug'] ?? null) ?: $this->uniqueSlug(Portfolio::class, $data['title']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('portfolios', 'public');
        }

        $portfolio = Portfolio::create($data);

        return $this->success($portfolio, 'Portfolio created', 201);
    }

    public function show(Portfolio $portfolio): JsonResponse
    {
        return $this->success($portfolio);
    }

    public function update(UpdatePortfolioRequest $request, Portfolio $portfolio): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = $this->uniqueSlug(Portfolio::class, $data['title'], $portfolio->id);
        }

        if ($request->hasFile('image')) {
            if ($portfolio->image) {
                Storage::disk('public')->delete($portfolio->image);
            }
            $data['image'] = $request->file('image')->store('portfolios', 'public');
        }

        $portfolio->update($data);

        return $this->success($portfolio, 'Portfolio updated');
    }

    public function destroy(Portfolio $portfolio): JsonResponse
    {
        if ($portfolio->image) {
            Storage::disk('public')->delete($portfolio->image);
        }

        $portfolio->delete();

        return $this->success(null, 'Portfolio deleted');
    }
}
