<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\UpdateApplicationRequest;
use App\Models\Application;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ApplicationController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->success(Application::orderBy('name')->get(['id', 'name', 'code', 'base_url', 'status']));
    }

    public function store(StoreApplicationRequest $request): JsonResponse
    {
        $application = Application::create($request->validated());

        return $this->success($application, 'Application created', 201);
    }

    public function show(Application $application): JsonResponse
    {
        return $this->success($application);
    }

    public function update(UpdateApplicationRequest $request, Application $application): JsonResponse
    {
        $application->update($request->validated());

        return $this->success($application, 'Application updated');
    }
}
