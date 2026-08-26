<?php

namespace App\Http\Requests;

use App\Enums\BillingInterval;
use App\Enums\ProductStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubscriptionPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'billing_interval' => ['required', Rule::enum(BillingInterval::class)],
            'max_users' => ['nullable', 'integer', 'min:0'],
            'max_branches' => ['nullable', 'integer', 'min:0'],
            'max_products' => ['nullable', 'integer', 'min:0'],
            'cta_label' => ['nullable', 'string', 'max:100'],
            'is_highlighted' => ['boolean'],
            'status' => ['nullable', Rule::enum(ProductStatus::class)],
            'sort_order' => ['nullable', 'integer'],
            'features' => ['nullable', 'array'],
            'features.*.feature' => ['required_with:features', 'string', 'max:255'],
            'features.*.value' => ['nullable', 'string', 'max:255'],
        ];
    }
}
