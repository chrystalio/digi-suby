<?php

namespace App\Policies;

use App\Models\Subscription;
use App\Models\User;

class SubscriptionPolicy
{
    public function view(User $user, Subscription $subscription): bool
    {
        return $user->id === $subscription->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Subscription $subscription): bool
    {
        return $user->id === $subscription->user_id;
    }

    public function delete(User $user, Subscription $subscription): bool
    {
        return $user->id === $subscription->user_id;
    }

    public function cancel(User $user, Subscription $subscription): bool
    {
        return $this->view($user, $subscription) && ! $subscription->isCancelled();
    }

    public function reopen(User $user, Subscription $subscription): bool
    {
        return $this->view($user, $subscription) && $subscription->isCancelled();
    }
}
