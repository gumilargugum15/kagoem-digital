<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type');
            $table->string('category');
            $table->string('short_description', 500);
            $table->longText('description')->nullable();
            $table->string('thumbnail')->nullable();
            $table->json('gallery')->nullable();
            $table->json('tags')->nullable();
            $table->string('badge')->nullable();
            $table->decimal('price', 12, 2)->nullable();
            $table->decimal('discount_price', 12, 2)->nullable();
            $table->string('currency', 10)->default('IDR');
            $table->decimal('rating', 2, 1)->nullable();
            $table->unsignedInteger('purchases_count')->default(0);
            $table->string('demo_url')->nullable();
            $table->string('digital_file')->nullable();
            $table->string('download_url')->nullable();
            $table->json('whats_included')->nullable();
            $table->json('requirements')->nullable();
            $table->json('technology')->nullable();
            $table->json('faqs')->nullable();
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->string('og_image')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status')->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
