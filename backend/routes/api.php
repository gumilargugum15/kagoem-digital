<?php

use App\Http\Controllers\Api\V1\Admin\ContactMessageController as AdminContactMessageController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\FaqController as AdminFaqController;
use App\Http\Controllers\Api\V1\Admin\PortfolioController as AdminPortfolioController;
use App\Http\Controllers\Api\V1\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Api\V1\Admin\SiteSettingController as AdminSiteSettingController;
use App\Http\Controllers\Api\V1\Admin\TechNoteController as AdminTechNoteController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ContactMessageController;
use App\Http\Controllers\Api\V1\FaqController;
use App\Http\Controllers\Api\V1\PortfolioController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\SiteSettingController;
use App\Http\Controllers\Api\V1\StatsController;
use App\Http\Controllers\Api\V1\TechNoteController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::get('/services', [ServiceController::class, 'index']);

    Route::get('/portfolios', [PortfolioController::class, 'index']);
    Route::get('/portfolios/featured', [PortfolioController::class, 'featured']);
    Route::get('/portfolios/{slug}', [PortfolioController::class, 'show']);

    Route::get('/tech-notes', [TechNoteController::class, 'index']);
    Route::get('/tech-notes/{slug}', [TechNoteController::class, 'show']);

    Route::get('/faqs', [FaqController::class, 'index']);
    Route::get('/settings', [SiteSettingController::class, 'index']);
    Route::get('/stats', [StatsController::class, 'index']);
    Route::post('/contact', [ContactMessageController::class, 'store']);

    // Auth
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
    });

    // Admin (protected)
    Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::apiResource('services', AdminServiceController::class);
        Route::apiResource('portfolios', AdminPortfolioController::class);
        Route::apiResource('faqs', AdminFaqController::class);
        Route::apiResource('tech-notes', AdminTechNoteController::class);

        Route::get('/contact-messages', [AdminContactMessageController::class, 'index']);
        Route::get('/contact-messages/{contactMessage}', [AdminContactMessageController::class, 'show']);
        Route::patch('/contact-messages/{contactMessage}', [AdminContactMessageController::class, 'update']);
        Route::delete('/contact-messages/{contactMessage}', [AdminContactMessageController::class, 'destroy']);

        Route::get('/settings', [AdminSiteSettingController::class, 'index']);
        Route::put('/settings', [AdminSiteSettingController::class, 'update']);
    });
});
