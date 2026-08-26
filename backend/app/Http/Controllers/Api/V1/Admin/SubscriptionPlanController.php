<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubscriptionPlanRequest;
use App\Http\Requests\UpdateSubscriptionPlanRequest;
use App\Models\Product;
use App\Models\SubscriptionPlan;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class SubscriptionPlanController extends Controller
{
    use ApiResponse;

    public function index(Product $product): JsonResponse
    {
        return $this->success($product->plans()->with('planFeatures')->get());
    }

    public function store(StoreSubscriptionPlanRequest $request, Product $product): JsonResponse
    {
        $data = $request->safe()->except('features');

        $plan = DB::transaction(function () use ($product, $data, $request) {
            $plan = $product->plans()->create($data);
            $this->syncFeatures($plan, $request->input('features', []));

            return $plan;
        });

        return $this->success($plan->load('planFeatures'), 'Subscription plan created', 201);
    }

    public function update(UpdateSubscriptionPlanRequest $request, Product $product, SubscriptionPlan $plan): JsonResponse
    {
        $this->ensureBelongsToProduct($product, $plan);

        $data = $request->safe()->except('features');

        DB::transaction(function () use ($plan, $data, $request) {
            $plan->update($data);
            if ($request->has('features')) {
                $this->syncFeatures($plan, $request->input('features', []));
            }
        });

        return $this->success($plan->fresh()->load('planFeatures'), 'Subscription plan updated');
    }

    public function destroy(Product $product, SubscriptionPlan $plan): JsonResponse
    {
        $this->ensureBelongsToProduct($product, $plan);

        $plan->delete();

        return $this->success(null, 'Subscription plan deleted');
    }

    private function ensureBelongsToProduct(Product $product, SubscriptionPlan $plan): void
    {
        if ($plan->product_id !== $product->id) {
            throw new NotFoundHttpException;
        }
    }

    private function syncFeatures(SubscriptionPlan $plan, array $features): void
    {
        $plan->planFeatures()->delete();

        foreach (array_values($features) as $index => $feature) {
            if (empty($feature['feature'])) {
                continue;
            }

            $plan->planFeatures()->create([
                'feature' => $feature['feature'],
                'value' => $feature['value'] ?? null,
                'sort_order' => $index,
            ]);
        }
    }
}
