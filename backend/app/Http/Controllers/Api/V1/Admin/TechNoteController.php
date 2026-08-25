<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTechNoteRequest;
use App\Http\Requests\UpdateTechNoteRequest;
use App\Models\TechNote;
use App\Traits\ApiResponse;
use App\Traits\GeneratesUniqueSlug;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class TechNoteController extends Controller
{
    use ApiResponse, GeneratesUniqueSlug;

    public function index(): JsonResponse
    {
        return $this->success(TechNote::orderByDesc('published_at')->orderByDesc('id')->get());
    }

    public function store(StoreTechNoteRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = ($data['slug'] ?? null) ?: $this->uniqueSlug(TechNote::class, $data['title']);
        $data['published_at'] = $data['published_at'] ?? now();

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('tech-notes', 'public');
        }

        $note = TechNote::create($data);

        return $this->success($note, 'Tech note created', 201);
    }

    public function show(TechNote $techNote): JsonResponse
    {
        return $this->success($techNote);
    }

    public function update(UpdateTechNoteRequest $request, TechNote $techNote): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = $this->uniqueSlug(TechNote::class, $data['title'], $techNote->id);
        }

        if ($request->hasFile('thumbnail')) {
            if ($techNote->thumbnail) {
                Storage::disk('public')->delete($techNote->thumbnail);
            }
            $data['thumbnail'] = $request->file('thumbnail')->store('tech-notes', 'public');
        }

        $techNote->update($data);

        return $this->success($techNote, 'Tech note updated');
    }

    public function destroy(TechNote $techNote): JsonResponse
    {
        if ($techNote->thumbnail) {
            Storage::disk('public')->delete($techNote->thumbnail);
        }

        $techNote->delete();

        return $this->success(null, 'Tech note deleted');
    }
}
