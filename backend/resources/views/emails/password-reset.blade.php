<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name') }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
                    @include('emails.partials.header')
                    <tr>
                        <td style="padding:32px;color:#111827;font-size:15px;line-height:1.6;">
                            <p>Halo, {{ $name }}</p>
                            <p>Kami menerima permintaan untuk mengatur ulang password akun Anda.</p>
                            <p style="text-align:center;margin:32px 0;">
                                <a href="{{ $resetUrl }}" style="background-color:#111827;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;display:inline-block;">Reset Password</a>
                            </p>
                            <p>Link reset password ini akan kedaluwarsa dalam {{ $expireMinutes }} menit.</p>
                            <p>Jika Anda tidak meminta reset password, Anda dapat mengabaikan email ini.</p>
                        </td>
                    </tr>
                    @include('emails.partials.footer')
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
