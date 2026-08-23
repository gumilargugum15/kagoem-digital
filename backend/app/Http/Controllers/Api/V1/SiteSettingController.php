<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class SiteSettingController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $settings = SiteSetting::pluck('value', 'key');

        return $this->success($settings);
    }
}
