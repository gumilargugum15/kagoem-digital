<?php

use App\Http\Controllers\Api\V1\Admin\ContactMessageController as AdminContactMessageController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\FaqController as AdminFaqController;
use App\Http\Controllers\Api\V1\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\PortfolioController as AdminPortfolioController;
use App\Http\Controllers\Api\V1\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\V1\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Api\V1\Admin\SiteSettingController as AdminSiteSettingController;
use App\Http\Controllers\Api\V1\Admin\SubscriptionPlanController as AdminSubscriptionPlanController;
use App\Http\Controllers\Api\V1\Admin\TechNoteController as AdminTechNoteController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\ContactMessageController;
use App\Http\Controllers\Api\V1\EmailVerificationController;
use App\Http\Controllers\Api\V1\FaqController;
use App\Http\Controllers\Api\V1\MidtransNotificationController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PortfolioController;
use App\Http\Controllers\Api\V1\ProductController;
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

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'store']);
    Route::put('/cart/items/{item}', [CartController::class, 'update']);
    Route::delete('/cart/items/{item}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);

    Route::get('/faqs', [FaqController::class, 'index']);
    Route::get('/settings', [SiteSettingController::class, 'index']);
    Route::get('/stats', [StatsController::class, 'index']);
    Route::post('/contact', [ContactMessageController::class, 'store']);

    Route::post('/payment/midtrans/notification', MidtransNotificationController::class);

    // Auth
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:6,1');
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');
    Route::get('/auth/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware('signed')
        ->name('verification.verify');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('/auth/profile/password', [AuthController::class, 'updatePassword']);
        Route::post('/auth/email/resend', [EmailVerificationController::class, 'resend'])->middleware('throttle:6,1');

        Route::post('/checkout', [CheckoutController::class, 'store'])->middleware('throttle:10,1');

        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
        Route::post('/orders/{orderNumber}/payment', [PaymentController::class, 'store'])->middleware('throttle:10,1');
    });

    // Admin (protected)
    Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::apiResource('services', AdminServiceController::class);
        Route::apiResource('portfolios', AdminPortfolioController::class);
        Route::apiResource('faqs', AdminFaqController::class);
        Route::apiResource('tech-notes', AdminTechNoteController::class);
        Route::apiResource('products', AdminProductController::class);
        Route::post('/products/{product}/plans', [AdminSubscriptionPlanController::class, 'store']);
        Route::get('/products/{product}/plans', [AdminSubscriptionPlanController::class, 'index']);
        Route::put('/products/{product}/plans/{plan}', [AdminSubscriptionPlanController::class, 'update']);
        Route::delete('/products/{product}/plans/{plan}', [AdminSubscriptionPlanController::class, 'destroy']);

        Route::get('/contact-messages', [AdminContactMessageController::class, 'index']);
        Route::get('/contact-messages/{contactMessage}', [AdminContactMessageController::class, 'show']);
        Route::patch('/contact-messages/{contactMessage}', [AdminContactMessageController::class, 'update']);
        Route::delete('/contact-messages/{contactMessage}', [AdminContactMessageController::class, 'destroy']);

        Route::get('/settings', [AdminSiteSettingController::class, 'index']);
        Route::put('/settings', [AdminSiteSettingController::class, 'update']);

        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{orderNumber}', [AdminOrderController::class, 'show']);
    });
});
