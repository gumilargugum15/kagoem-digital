<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Service;
use App\Traits\ApiResponse;
use App\Traits\GeneratesUniqueSlug;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    use ApiResponse, GeneratesUniqueSlug;

    public function index(): JsonResponse
    {
        return $this->success(Service::orderBy('sort_order')->get());
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = ($data['slug'] ?? null) ?: $this->uniqueSlug(Service::class, $data['title']);

        $service = Service::create($data);

        return $this->success($service, 'Service created', 201);
    }

    public function show(Service $service): JsonResponse
    {
        return $this->success($service);
    }

    public function update(UpdateServiceRequest $request, Service $service): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = $this->uniqueSlug(Service::class, $data['title'], $service->id);
        }

        $service->update($data);

        return $this->success($service, 'Service updated');
    }

    public function destroy(Service $service): JsonResponse
    {
        $service->delete();

        return $this->success(null, 'Service deleted');
    }
}
