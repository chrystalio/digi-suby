<?php

namespace Database\Factories;

use App\Enums\Currency;
use App\Enums\SubscriptionInterval;
use App\Enums\SubscriptionStatus;
use App\Models\Category;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'service_id' => Service::factory(),
            'payment_method_id' => null,
            'name' => 'Personal Plan',
            'amount' => 9.99,
            'currency' => Currency::USD,
            'interval' => SubscriptionInterval::Monthly,
            'next_billing_date' => now()->addDays(30)->toDateString(),
            'started_at' => now()->subMonth()->toDateString(),
            'trial_ends_at' => null,
            'cancelled_at' => null,
            'status' => SubscriptionStatus::Active,
            'notes' => null,
        ];
    }

    public function trial(): static
    {
        return $this->state(fn () => [
            'status' => SubscriptionStatus::Trial,
            'trial_ends_at' => now()->addDays(14)->toDateString(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => [
            'status' => SubscriptionStatus::Cancelled,
            'cancelled_at' => now()->subDay()->toDateString(),
        ]);
    }

    public function lifetime(): static
    {
        return $this->state(fn () => [
            'interval' => SubscriptionInterval::Lifetime,
            'next_billing_date' => null,
        ]);
    }

    public function weekly(): static
    {
        return $this->state(fn () => [
            'interval' => SubscriptionInterval::Weekly,
            'next_billing_date' => now()->addDays(7)->toDateString(),
        ]);
    }

    public function yearly(): static
    {
        return $this->state(fn () => [
            'interval' => SubscriptionInterval::Yearly,
            'next_billing_date' => now()->addDays(365)->toDateString(),
        ]);
    }

    public function withPaymentMethod(?PaymentMethod $pm = null): static
    {
        return $this->state(fn (array $attrs) => [
            'payment_method_id' => $pm ?? PaymentMethod::factory()->for(
                User::find($attrs['user_id']) ?? User::factory()
            ),
        ]);
    }
}
