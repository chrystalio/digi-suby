<?php

namespace Tests\Unit\Policies;

use App\Enums\SubscriptionStatus;
use App\Models\Category;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\Subscription;
use App\Models\User;
use App\Policies\PaymentMethodPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentMethodPolicyTest extends TestCase
{
    use RefreshDatabase;

    private PaymentMethodPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new PaymentMethodPolicy;
    }

    public function test_delete_baseline_allows_when_no_subscriptions(): void
    {
        $user = User::factory()->create();
        $pm = PaymentMethod::factory()->for($user)->create();

        $this->assertTrue($this->policy->delete($user, $pm));
    }

    public function test_delete_blocks_when_payment_method_has_active_subscription(): void
    {
        $user = User::factory()->create();
        $pm = PaymentMethod::factory()->for($user)->create();
        $category = Category::factory()->for($user)->create();
        $service = Service::factory()->for($user)->for($category)->create();
        Subscription::factory()
            ->for($user)
            ->for($service)
            ->for($pm, 'paymentMethod')
            ->create();

        $this->assertFalse($this->policy->delete($user, $pm));
    }

    public function test_delete_allows_when_subscriptions_are_soft_deleted(): void
    {
        $user = User::factory()->create();
        $pm = PaymentMethod::factory()->for($user)->create();
        $category = Category::factory()->for($user)->create();
        $service = Service::factory()->for($user)->for($category)->create();
        $sub = Subscription::factory()
            ->for($user)
            ->for($service)
            ->for($pm, 'paymentMethod')
            ->create();
        $sub->delete(); // soft delete

        $this->assertTrue($this->policy->delete($user, $pm));
    }

    public function test_delete_blocks_when_cancelled_subscription_still_exists(): void
    {
        // Cancelled subs still occupy a slot on the PM — you wouldn't want
        // the user to delete the PM out from under their history. The spec
        // says `hasSubscriptions` checks for ANY non-deleted subscription.
        $user = User::factory()->create();
        $pm = PaymentMethod::factory()->for($user)->create();
        $category = Category::factory()->for($user)->create();
        $service = Service::factory()->for($user)->for($category)->create();
        Subscription::factory()
            ->for($user)
            ->for($service)
            ->for($pm, 'paymentMethod')
            ->cancelled()
            ->create();

        $this->assertFalse($this->policy->delete($user, $pm));
    }

    public function test_delete_denies_non_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $pm = PaymentMethod::factory()->for($owner)->create();

        $this->assertFalse($this->policy->delete($other, $pm));
    }
}
