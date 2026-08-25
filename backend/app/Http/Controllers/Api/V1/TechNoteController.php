<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TechNote;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TechNoteController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 9);

        $notes = TechNote::query()
            ->where('is_active', true)
            ->when(
                $request->query('category') && $request->query('category') !== 'All',
                fn ($query) => $query->where('category', $request->query('category')),
            )
            ->when($request->query('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('published_at')
            ->paginate($perPage);

        return $this->success($notes);
    }

    public function show(string $slug): JsonResponse
    {
        $note = TechNote::where('is_active', true)
            ->where('slug', $slug)
            ->firstOrFail();

        $related = TechNote::where('is_active', true)
            ->where('category', $note->category)
            ->whereNot('id', $note->id)
            ->orderByDesc('published_at')
            ->limit(3)
            ->get();

        return $this->success([
            'article' => $note,
            'related' => $related,
        ]);
    }
}
