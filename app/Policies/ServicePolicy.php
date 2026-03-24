<?php

namespace App\Policies;

use App\Models\Service;
use App\Models\User;

class ServicePolicy
{
    public function view(User $user, Service $service): bool
    {
        return $service->is_system || $service->user_id === $user->id;
    }

    public function create(): true
    {
        return true;
    }

    public function update(User $user, Service $service): bool
    {
        if ($service->is_system) {
            return false;
        }

        return $service->user_id === $user->id;
    }

    public function delete(User $user, Service $service): bool
    {
        if ($service->is_system) {
            return false;
        }

        return $service->user_id === $user->id;
    }
}
