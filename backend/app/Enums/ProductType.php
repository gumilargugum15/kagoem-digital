<?php

namespace App\Enums;

enum ProductType: string
{
    case Digital = 'digital';
    case Subscription = 'subscription';
    case Service = 'service';
}
