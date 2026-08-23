<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $messages = ContactMessage::with('service')
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate(15);

        return $this->success($messages);
    }

    public function show(ContactMessage $contactMessage): JsonResponse
    {
        return $this->success($contactMessage->load('service'));
    }

    public function update(Request $request, ContactMessage $contactMessage): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:new,contacted,closed'],
        ]);

        $contactMessage->update(['status' => $request->input('status')]);

        return $this->success($contactMessage, 'Message updated');
    }

    public function destroy(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->delete();

        return $this->success(null, 'Message deleted');
    }
}
