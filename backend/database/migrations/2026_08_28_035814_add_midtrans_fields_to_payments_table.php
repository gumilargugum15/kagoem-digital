<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('midtrans_order_id')->nullable()->unique()->after('order_id');
            $table->string('snap_token')->nullable()->after('transaction_id');
            $table->string('fraud_status')->nullable()->after('status');
            $table->json('raw_response')->nullable()->after('fraud_status');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['midtrans_order_id', 'snap_token', 'fraud_status', 'raw_response']);
        });
    }
};
