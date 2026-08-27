<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
        ])->refresh();

        event(new Registered($user));

        $token = $user->createToken('customer')->plainTextToken;

        return $this->success([
            'user' => $user,
            'token' => $token,
        ], 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi akun.', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status !== UserStatus::Active) {
            throw ValidationException::withMessages([
                'email' => ['Akun ini tidak aktif. Silakan hubungi kami.'],
            ]);
        }

        $token = $user->createToken($user->isAdmin() ? 'admin-panel' : 'customer')->plainTextToken;

        return $this->success([
            'user' => $user,
            'token' => $token,
        ], 'Login successful');
    }

    public function logout(): JsonResponse
    {
        Auth::user()->currentAccessToken()->delete();

        return $this->success(null, 'Logout successful');
    }

    public function me(): JsonResponse
    {
        return $this->success(Auth::user());
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $emailChanged = $request->validated('email') !== $user->email;

        $user->fill([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
        ]);

        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        return $this->success($user, 'Profil berhasil diperbarui.');
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->forceFill(['password' => $request->validated('password')])->save();
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        return $this->success(null, 'Password berhasil diperbarui.');
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        Password::sendResetLink($request->only('email'));

        return $this->success(null, 'Jika email terdaftar, link reset password telah dikirim.');
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->validated(),
            function (User $user, string $password) {
                $user->forceFill(['password' => $password])->save();
                $user->tokens()->delete();
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => ['Token reset password tidak valid atau sudah kadaluarsa.'],
            ]);
        }

        return $this->success(null, 'Password berhasil direset. Silakan login.');
    }
}
