<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\DigitalAccessStatus;
use App\Http\Controllers\Controller;
use App\Models\DigitalProductAccess;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class MyProductsController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $subscriptions = $user->subscriptions()
            ->with('product:id,name,slug,thumbnail,type')
            ->latest()
            ->get();

        $digital = $user->digitalProductAccess()
            ->with('product:id,name,slug,thumbnail,type,digital_file,download_url')
            ->latest()
            ->get();

        return $this->success([
            'subscriptions' => $subscriptions,
            'digital' => $digital,
        ]);
    }

    public function download(Request $request, DigitalProductAccess $access): Response
    {
        if ($access->user_id !== $request->user()->id) {
            return $this->error('Anda tidak memiliki akses ke produk ini.', 403);
        }

        if ($access->status !== DigitalAccessStatus::Active) {
            return $this->error('Akses download untuk produk ini tidak aktif.', 403);
        }

        $product = $access->product;

        if (! $product) {
            return $this->error('Produk tidak ditemukan.', 404);
        }

        if ($product->has_digital_file) {
            $access->increment('download_count');

            return Storage::disk('local')->download(
                $product->digital_file,
                $product->slug.'-'.basename($product->digital_file),
            );
        }

        if ($product->download_url) {
            $access->increment('download_count');

            return $this->success(['redirect_url' => $product->download_url]);
        }

        return $this->error('File belum tersedia untuk produk ini.', 404);
    }
}
