<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Log;
use Throwable;

class VerifyEmailNotification extends BaseVerifyEmail implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(protected mixed $notifiableId = null) {}

    public function backoff(): array
    {
        return [10, 30, 60];
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verifikasi Alamat Email Anda - '.config('app.name'))
            ->view('emails.verification', [
                'name' => $notifiable->name,
                'verificationUrl' => $this->verificationUrl($notifiable),
            ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Failed to send verification email notification', [
            'notifiable_id' => $this->notifiableId,
            'error' => $exception->getMessage(),
        ]);
    }
}
