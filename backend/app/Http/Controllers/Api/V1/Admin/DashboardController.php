<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Portfolio;
use App\Models\Service;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->success([
            'services_count' => Service::count(),
            'portfolios_count' => Portfolio::count(),
            'contact_messages_count' => ContactMessage::count(),
            'latest_messages' => ContactMessage::latest()->take(5)->get(),
        ]);
    }
}
