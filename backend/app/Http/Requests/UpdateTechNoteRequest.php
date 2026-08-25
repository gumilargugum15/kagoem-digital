<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTechNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:tech_notes,slug,'.$this->route('tech_note')?->id],
            'category' => ['sometimes', 'required', 'string', 'max:100'],
            'excerpt' => ['sometimes', 'required', 'string', 'max:500'],
            'content' => ['sometimes', 'required', 'string'],
            'thumbnail' => ['nullable', 'image', 'max:2048'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'author_name' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
