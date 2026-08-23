<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFaqRequest;
use App\Http\Requests\UpdateFaqRequest;
use App\Models\Faq;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class FaqController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->success(Faq::orderBy('sort_order')->get());
    }

    public function store(StoreFaqRequest $request): JsonResponse
    {
        $faq = Faq::create($request->validated());

        return $this->success($faq, 'FAQ created', 201);
    }

    public function show(Faq $faq): JsonResponse
    {
        return $this->success($faq);
    }

    public function update(UpdateFaqRequest $request, Faq $faq): JsonResponse
    {
        $faq->update($request->validated());

        return $this->success($faq, 'FAQ updated');
    }

    public function destroy(Faq $faq): JsonResponse
    {
        $faq->delete();

        return $this->success(null, 'FAQ deleted');
    }
}
