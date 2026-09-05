<?php

namespace App\Notifications;

use App\Models\Application;
use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class PosAccountOnboardingNotification extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        private readonly Subscription $subscription,
        private readonly Application $application,
        #[\SensitiveParameter] private readonly array $metadata,
    ) {}

    public function backoff(): array
    {
        return [10, 30, 60];
    }

    public function via(mixed $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        $setPasswordUrl = rtrim((string) $this->application->base_url, '/').'/set-password'
            .'?email='.urlencode($notifiable->email)
            .'&token='.urlencode((string) $this->metadata['set_password_token']);

        return (new MailMessage)
            ->subject("Akun {$this->application->name} Anda Siap - ".config('app.name'))
            ->view('emails.pos-onboarding', [
                'name' => $notifiable->name,
                'applicationName' => $this->application->name,
                'productName' => $this->subscription->product?->name,
                'setPasswordUrl' => $setPasswordUrl,
                'expireMinutes' => $this->metadata['set_password_expires_in_minutes'] ?? null,
            ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Failed to send POS account onboarding notification', [
            'subscription_id' => $this->subscription->id,
            'application_id' => $this->application->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
