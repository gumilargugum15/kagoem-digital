<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePortfolioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:portfolios,slug,'.$this->route('portfolio')?->id],
            'category' => ['sometimes', 'required', 'string', 'max:100'],
            'client_name' => ['nullable', 'string', 'max:255'],
            'short_description' => ['sometimes', 'required', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'technologies' => ['nullable', 'array'],
            'technologies.*' => ['string', 'max:100'],
            'image' => ['nullable', 'image', 'max:2048'],
            'project_url' => ['nullable', 'url', 'max:255'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer'],
        ];
    }
}
