<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSiteSettingRequest;
use App\Models\SiteSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class SiteSettingController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->success(SiteSetting::pluck('value', 'key'));
    }

    public function update(UpdateSiteSettingRequest $request): JsonResponse
    {
        foreach ($request->validated('settings') as $key => $value) {
            SiteSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return $this->success(SiteSetting::pluck('value', 'key'), 'Settings updated');
    }
}
