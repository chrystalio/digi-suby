<?php

namespace Tests\Unit\Policies;

use App\Enums\SubscriptionStatus;
use App\Models\Category;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\Subscription;
use App\Models\User;
use App\Policies\SubscriptionPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionPolicyTest extends TestCase
{
    use RefreshDatabase;

    private SubscriptionPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new SubscriptionPolicy;
    }

    private function makeSubscriptionFor(User $user): Subscription
    {
        $category = Category::factory()->for($user)->create();
        $service = Service::factory()->for($user)->for($category)->create();

        return Subscription::factory()->for($user)->for($service)->create();
    }

    public function test_view_allows_owner(): void
    {
        $user = User::factory()->create();
        $sub = $this->makeSubscriptionFor($user);

        $this->assertTrue($this->policy->view($user, $sub));
    }

    public function test_view_denies_non_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $sub = $this->makeSubscriptionFor($owner);

        $this->assertFalse($this->policy->view($other, $sub));
    }

    public function test_create_always_allows(): void
    {
        $user = User::factory()->create();

        $this->assertTrue($this->policy->create($user));
    }

    public function test_update_allows_owner(): void
    {
        $user = User::factory()->create();
        $sub = $this->makeSubscriptionFor($user);

        $this->assertTrue($this->policy->update($user, $sub));
    }

    public function test_update_denies_non_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $sub = $this->makeSubscriptionFor($owner);

        $this->assertFalse($this->policy->update($other, $sub));
    }

    public function test_delete_allows_owner(): void
    {
        $user = User::factory()->create();
        $sub = $this->makeSubscriptionFor($user);

        $this->assertTrue($this->policy->delete($user, $sub));
    }

    public function test_delete_denies_non_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $sub = $this->makeSubscriptionFor($owner);

        $this->assertFalse($this->policy->delete($other, $sub));
    }

    public function test_cancel_allows_owner_for_non_cancelled(): void
    {
        $user = User::factory()->create();
        $sub = $this->makeSubscriptionFor($user);

        $this->assertTrue($this->policy->cancel($user, $sub));
    }

    public function test_cancel_denies_already_cancelled(): void
    {
        $user = User::factory()->create();
        $sub = $this->makeSubscriptionFor($user);
        $sub->update(['status' => SubscriptionStatus::Cancelled, 'cancelled_at' => now()]);

        $this->assertFalse($this->policy->cancel($user, $sub));
    }

    public function test_cancel_denies_non_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $sub = $this->makeSubscriptionFor($owner);

        $this->assertFalse($this->policy->cancel($other, $sub));
    }

    public function test_reopen_allows_owner_for_cancelled(): void
    {
        $user = User::factory()->create();
        $sub = $this->makeSubscriptionFor($user);
        $sub->update(['status' => SubscriptionStatus::Cancelled, 'cancelled_at' => now()]);

        $this->assertTrue($this->policy->reopen($user, $sub));
    }

    public function test_reopen_denies_active(): void
    {
        $user = User::factory()->create();
        $sub = $this->makeSubscriptionFor($user);

        $this->assertFalse($this->policy->reopen($user, $sub));
    }

    public function test_reopen_denies_non_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $sub = $this->makeSubscriptionFor($owner);
        $sub->update(['status' => SubscriptionStatus::Cancelled, 'cancelled_at' => now()]);

        $this->assertFalse($this->policy->reopen($other, $sub));
    }
}
