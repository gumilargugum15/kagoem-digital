<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Log;
use Throwable;

class ResetPasswordNotification extends BaseResetPassword implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(#[\SensitiveParameter] string $token, protected mixed $notifiableId = null)
    {
        parent::__construct($token);
    }

    public function backoff(): array
    {
        return [10, 30, 60];
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        $expireMinutes = config('auth.passwords.'.config('auth.defaults.passwords').'.expire');

        return (new MailMessage)
            ->subject('Reset Password Akun Anda - '.config('app.name'))
            ->view('emails.password-reset', [
                'name' => $notifiable->name,
                'resetUrl' => $this->resetUrl($notifiable),
                'expireMinutes' => $expireMinutes,
            ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Failed to send password reset notification', [
            'notifiable_id' => $this->notifiableId,
            'error' => $exception->getMessage(),
        ]);
    }
}
