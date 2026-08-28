<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class OrderCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(private readonly Order $order) {}

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
        return (new MailMessage)
            ->subject("Pesanan {$this->order->order_number} Berhasil Dibuat - ".config('app.name'))
            ->view('emails.order-created', [
                'name' => $notifiable->name,
                'order' => $this->order,
            ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Failed to send order created notification', [
            'order_number' => $this->order->order_number,
            'error' => $exception->getMessage(),
        ]);
    }
}
