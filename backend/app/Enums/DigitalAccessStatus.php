<?php

namespace App\Enums;

enum DigitalAccessStatus: string
{
    case Active = 'active';
    case Revoked = 'revoked';
}
