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
                            <p>Pembayaran Anda telah kami terima. Terima kasih!</p>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-collapse:collapse;">
                                <tr>
                                    <td style="padding:8px 0;color:#6b7280;font-size:13px;">Order</td>
                                    <td style="padding:8px 0;text-align:right;font-weight:bold;">{{ $order->order_number }}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="padding:8px 0;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;">Produk</td>
                                </tr>
                                @foreach ($order->items as $item)
                                <tr>
                                    <td style="padding:4px 0;">{{ $item->product_name }} &times;{{ $item->quantity }}</td>
                                    <td style="padding:4px 0;text-align:right;">Rp {{ number_format((float) $item->subtotal, 0, ',', '.') }}</td>
                                </tr>
                                @endforeach
                                <tr>
                                    <td style="padding:12px 0 0;border-top:1px solid #e5e7eb;font-weight:bold;">Total</td>
                                    <td style="padding:12px 0 0;border-top:1px solid #e5e7eb;text-align:right;font-weight:bold;">Rp {{ number_format((float) $order->total, 0, ',', '.') }}</td>
                                </tr>
                            </table>

                            <p>Status: <strong>Pembayaran Berhasil</strong></p>
                        </td>
                    </tr>
                    @include('emails.partials.footer')
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
