<?php

namespace App\Enums;

enum ApplicationAccountStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';
    case Revoked = 'revoked';
}
