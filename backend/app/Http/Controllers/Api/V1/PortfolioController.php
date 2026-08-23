<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $portfolios = Portfolio::where('is_active', true)
            ->when($request->query('category'), fn ($query, $category) => $query->where('category', $category))
            ->orderBy('sort_order')
            ->get();

        return $this->success($portfolios);
    }

    public function featured(): JsonResponse
    {
        $portfolios = Portfolio::where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('sort_order')
            ->get();

        return $this->success($portfolios);
    }

    public function show(string $slug): JsonResponse
    {
        $portfolio = Portfolio::where('is_active', true)
            ->where('slug', $slug)
            ->firstOrFail();

        return $this->success($portfolio);
    }
}
