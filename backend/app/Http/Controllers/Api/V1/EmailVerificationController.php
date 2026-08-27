<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    use ApiResponse;

    public function verify(Request $request, int $id, string $hash): RedirectResponse
    {
        $frontendUrl = rtrim(config('app.frontend_url'), '/');
        $user = User::find($id);

        if (! $user || ! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return redirect()->away("{$frontendUrl}/email-verified?status=invalid");
        }

        if ($user->hasVerifiedEmail()) {
            return redirect()->away("{$frontendUrl}/email-verified?status=already-verified");
        }

        $user->markEmailAsVerified();

        return redirect()->away("{$frontendUrl}/email-verified?status=verified");
    }

    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->success(null, 'Email sudah terverifikasi.');
        }

        $user->sendEmailVerificationNotification();

        return $this->success(null, 'Email verifikasi telah dikirim ulang.');
    }
}
