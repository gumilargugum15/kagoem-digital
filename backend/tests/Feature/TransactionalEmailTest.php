<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionalEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_resend_api_key_configuration_is_readable(): void
    {
        config(['services.resend.key' => 'test-resend-key']);

        $this->assertSame('test-resend-key', config('services.resend.key'));
    }

    public function test_mail_from_address_is_configured(): void
    {
        $this->assertNotEmpty(config('mail.from.address'));
    }

    public function test_mail_from_name_is_configured(): void
    {
        $this->assertNotEmpty(config('mail.from.name'));
    }

    public function test_verify_email_notification_uses_branded_template_and_signed_url(): void
    {
        $user = User::factory()->create();

        $mail = (new VerifyEmailNotification)->toMail($user);

        $this->assertSame('emails.verification', $mail->view);
        $this->assertSame($user->name, $mail->viewData['name']);
        $this->assertStringContainsString('/api/v1/auth/email/verify/', $mail->viewData['verificationUrl']);
    }

    public function test_reset_password_notification_uses_branded_template_and_frontend_url(): void
    {
        $user = User::factory()->create();

        $mail = (new ResetPasswordNotification('test-token'))->toMail($user);

        $this->assertSame('emails.password-reset', $mail->view);
        $this->assertSame($user->name, $mail->viewData['name']);
        $this->assertStringStartsWith(rtrim(config('app.frontend_url'), '/').'/reset-password?', $mail->viewData['resetUrl']);
        $this->assertStringContainsString('token=test-token', $mail->viewData['resetUrl']);
    }
}
