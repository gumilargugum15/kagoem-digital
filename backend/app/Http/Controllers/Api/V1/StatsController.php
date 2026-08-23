<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $projectsCount = Portfolio::where('is_active', true)->count();
        $clientsCount = Portfolio::where('is_active', true)
            ->whereNotNull('client_name')
            ->distinct('client_name')
            ->count('client_name');

        return $this->success([
            'projects_count' => $projectsCount,
            'clients_count' => $clientsCount,
        ]);
    }
}
