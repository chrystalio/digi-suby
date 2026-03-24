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
        Schema::create('services', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('category_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('slug')->unique();
            $table->string('url')->nullable();
            $table->boolean('is_system')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'is_system']);
            $table->index('category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
