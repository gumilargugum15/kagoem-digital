<?php

use App\Services\Provisioning\PosProvisioningAdapter;

return [

    /*
    |--------------------------------------------------------------------------
    | Application Adapter Registry
    |--------------------------------------------------------------------------
    |
    | Maps an applications.code value to the adapter class responsible for
    | provisioning access in that external application. The provisioning engine
    | resolves adapters through this registry — never through if/else chains.
    |
    | Add a new application by registering it here and implementing
    | App\Contracts\ApplicationProvisioningAdapter — no changes needed to the
    | engine, Subscription, Order, or Payment code.
    |
    */

    'adapters' => [
        'pos' => PosProvisioningAdapter::class,
    ],

];
