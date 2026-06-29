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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('service_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('payment_method_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name', 100);
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3);
            $table->string('interval', 20);
            $table->date('next_billing_date')->nullable();
            $table->date('started_at');
            $table->date('trial_ends_at')->nullable();
            $table->date('cancelled_at')->nullable();
            $table->string('status', 20)->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'next_billing_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
