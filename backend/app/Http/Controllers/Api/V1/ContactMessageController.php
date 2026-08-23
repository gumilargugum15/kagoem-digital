<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Models\ContactMessage;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ContactMessageController extends Controller
{
    use ApiResponse;

    public function store(ContactRequest $request): JsonResponse
    {
        $message = ContactMessage::create($request->validated());

        return $this->success($message, 'Message sent successfully', 201);
    }
}
