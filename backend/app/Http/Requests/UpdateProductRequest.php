<?php

namespace App\Http\Requests;

use App\Enums\ProductStatus;
use App\Enums\ProductType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug,'.$this->route('product')?->id],
            'type' => ['sometimes', 'required', Rule::enum(ProductType::class)],
            'application_id' => ['nullable', 'integer', 'exists:applications,id'],
            'category' => ['sometimes', 'required', 'string', 'max:100'],
            'short_description' => ['sometimes', 'required', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'badge' => ['nullable', Rule::in(['new', 'best_seller', 'popular'])],
            'price' => ['nullable', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'currency' => ['nullable', 'string', 'max:10'],
            'demo_url' => ['nullable', 'url', 'max:255'],
            'digital_file' => ['nullable', 'file', 'mimes:zip,pdf,rar', 'max:51200'],
            'download_url' => ['nullable', 'url', 'max:255'],
            'whats_included' => ['nullable', 'array'],
            'whats_included.*' => ['string', 'max:255'],
            'requirements' => ['nullable', 'array'],
            'requirements.*' => ['string', 'max:255'],
            'technology' => ['nullable', 'array'],
            'technology.*' => ['string', 'max:100'],
            'faqs' => ['nullable', 'array'],
            'faqs.*.question' => ['required_with:faqs', 'string', 'max:255'],
            'faqs.*.answer' => ['required_with:faqs', 'string', 'max:1000'],
            'features' => ['nullable', 'array'],
            'features.*.name' => ['required_with:features', 'string', 'max:255'],
            'features.*.description' => ['nullable', 'string', 'max:500'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'og_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'sort_order' => ['nullable', 'integer'],
            'status' => ['nullable', Rule::enum(ProductStatus::class)],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
