<?php

namespace App\Enums;

enum ApplicationProvisioningStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Completed = 'completed';
    case Failed = 'failed';
}
