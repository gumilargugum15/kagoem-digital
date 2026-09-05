<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $application = $this->route('application');

        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:100', 'unique:applications,code,'.$application->id],
            'base_url' => ['nullable', 'url', 'max:255'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }
}
