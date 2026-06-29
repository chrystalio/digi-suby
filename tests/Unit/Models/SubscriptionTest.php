<?php

namespace Tests\Unit\Models;

use App\Enums\Currency;
use App\Enums\SubscriptionInterval;
use App\Enums\SubscriptionStatus;
use App\Models\Category;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_fillable_contains_expected_columns(): void
    {
        $expected = [
            'user_id', 'service_id', 'payment_method_id',
            'name', 'amount', 'currency', 'interval',
            'next_billing_date', 'started_at',
            'trial_ends_at', 'cancelled_at', 'status', 'notes',
        ];

        $this->assertEqualsCanonicalizing(
            $expected,
            (new Subscription)->getFillable()
        );
    }

    public function test_casts_work_for_amount_dates_and_enums(): void
    {
        $subscription = Subscription::factory()->create();

        $this->assertIsString($subscription->amount);
        $this->assertEquals(2, strlen(explode('.', $subscription->amount)[1] ?? '00'));
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $subscription->next_billing_date);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $subscription->started_at);
        $this->assertInstanceOf(SubscriptionInterval::class, $subscription->interval);
        $this->assertInstanceOf(SubscriptionStatus::class, $subscription->status);
        $this->assertInstanceOf(Currency::class, $subscription->currency);
    }

    public function test_is_lifetime_and_is_cancelled(): void
    {
        $lifetime = Subscription::factory()->lifetime()->create();
        $cancelled = Subscription::factory()->cancelled()->create();
        $active = Subscription::factory()->create();

        $this->assertTrue($lifetime->isLifetime());
        $this->assertFalse($lifetime->isCancelled());

        $this->assertTrue($cancelled->isCancelled());
        $this->assertFalse($cancelled->isLifetime());

        $this->assertFalse($active->isLifetime());
        $this->assertFalse($active->isCancelled());
    }

    public function test_days_until_next_billing_returns_int_for_active_non_lifetime(): void
    {
        $sub = Subscription::factory()->create([
            'next_billing_date' => now()->addDays(5)->toDateString(),
        ]);

        $this->assertSame(5, $sub->daysUntilNextBilling());
    }

    public function test_days_until_next_billing_returns_null_for_lifetime(): void
    {
        $sub = Subscription::factory()->lifetime()->create();

        $this->assertNull($sub->daysUntilNextBilling());
    }

    public function test_days_until_next_billing_returns_null_for_cancelled(): void
    {
        $sub = Subscription::factory()->cancelled()->create();

        $this->assertNull($sub->daysUntilNextBilling());
    }

    public function test_monthly_equivalent_converts_amounts_to_monthly(): void
    {
        $this->assertEqualsWithDelta(43.45, Subscription::factory()->create(['amount' => 10, 'interval' => SubscriptionInterval::Weekly])->monthlyEquivalent(), 0.01);
        $this->assertEqualsWithDelta(15.99, Subscription::factory()->create(['amount' => 15.99, 'interval' => SubscriptionInterval::Monthly])->monthlyEquivalent(), 0.01);
        $this->assertEqualsWithDelta(10.00, Subscription::factory()->create(['amount' => 30, 'interval' => SubscriptionInterval::Quarterly])->monthlyEquivalent(), 0.01);
        $this->assertEqualsWithDelta(10.00, Subscription::factory()->create(['amount' => 120, 'interval' => SubscriptionInterval::Yearly])->monthlyEquivalent(), 0.01);
        $this->assertSame(0.0, Subscription::factory()->lifetime()->create(['amount' => 500])->monthlyEquivalent());
    }

    public function test_mark_cancelled_sets_status_and_timestamp_in_a_single_save(): void
    {
        $sub = Subscription::factory()->create();
        $initialUpdatedAt = $sub->updated_at;

        // Sleep 1s to ensure updated_at advances
        sleep(1);
        $sub->markCancelled();

        $this->assertSame(SubscriptionStatus::Cancelled, $sub->status);
        $this->assertNotNull($sub->cancelled_at);
        $this->assertTrue($sub->cancelled_at->isToday());
        $this->assertNotEquals($initialUpdatedAt, $sub->updated_at);
    }

    public function test_reopen_clears_cancelled_at_and_resets_status(): void
    {
        $sub = Subscription::factory()->cancelled()->create();

        $sub->reopen();

        $this->assertSame(SubscriptionStatus::Active, $sub->status);
        $this->assertNull($sub->cancelled_at);
    }

    public function test_appended_accessors(): void
    {
        $sub = Subscription::factory()->create([
            'amount' => 15.99,
            'currency' => Currency::USD,
            'next_billing_date' => now()->addDays(3)->toDateString(),
        ]);

        $arr = $sub->toArray();

        $this->assertSame('$15.99', $arr['display_amount']);
        $this->assertTrue($arr['is_renewing_soon']);
        $this->assertArrayHasKey('is_trial_ending_soon', $arr);
    }

    public function test_is_trial_ending_soon_accessor(): void
    {
        $endingSoon = Subscription::factory()->create([
            'status' => SubscriptionStatus::Trial,
            'trial_ends_at' => now()->addDays(3)->toDateString(),
        ]);
        $endingLater = Subscription::factory()->create([
            'status' => SubscriptionStatus::Trial,
            'trial_ends_at' => now()->addDays(30)->toDateString(),
        ]);
        $notTrial = Subscription::factory()->create([
            'status' => SubscriptionStatus::Active,
            'trial_ends_at' => now()->addDays(2)->toDateString(),
        ]);

        $this->assertTrue($endingSoon->is_trial_ending_soon);
        $this->assertFalse($endingLater->is_trial_ending_soon);
        $this->assertFalse($notTrial->is_trial_ending_soon);
    }

    public function test_scope_active(): void
    {
        Subscription::factory()->create();
        Subscription::factory()->cancelled()->create();
        Subscription::factory()->create(['status' => SubscriptionStatus::Trial]);

        // 'active' is the default state; trial and cancelled are excluded.
        $this->assertCount(1, Subscription::active()->get());
    }

    public function test_scope_renewing_within(): void
    {
        Subscription::factory()->create(['next_billing_date' => now()->addDays(3)->toDateString()]);
        Subscription::factory()->create(['next_billing_date' => now()->addDays(30)->toDateString()]);
        Subscription::factory()->cancelled()->create(['next_billing_date' => now()->addDays(2)->toDateString()]);
        Subscription::factory()->lifetime()->create();

        $this->assertCount(1, Subscription::renewingWithin(7)->get());
    }

    public function test_scope_for_currency(): void
    {
        Subscription::factory()->create(['currency' => Currency::USD]);
        Subscription::factory()->create(['currency' => Currency::EUR]);
        Subscription::factory()->create(['currency' => Currency::USD]);

        $this->assertCount(2, Subscription::forCurrency(Currency::USD)->get());
        $this->assertCount(1, Subscription::forCurrency(Currency::EUR)->get());
    }

    public function test_relations(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->for($user)->create();
        $service = Service::factory()->for($user)->for($category)->create();
        $pm = PaymentMethod::factory()->for($user)->create();
        $sub = Subscription::factory()->for($user)->for($service)->for($pm, 'paymentMethod')->create();

        $this->assertTrue($sub->user->is($user));
        $this->assertTrue($sub->service->is($service));
        $this->assertTrue($sub->paymentMethod->is($pm));
    }
}
