<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    /**
     * Determine if the user can view the category.
     */
    public function view(User $user, Category $category): bool
    {
        return $category->is_system || $category->user_id === $user->id;
    }

    /**
     * Determine if the user can create categories.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the user can update the category.
     */
    public function update(User $user, Category $category): bool
    {
        // Cannot update system categories
        if ($category->is_system) {
            return false;
        }

        return $category->user_id === $user->id;
    }

    /**
     * Determine if the user can delete the category.
     */
    public function delete(User $user, Category $category): bool
    {
        // Cannot delete system categories
        if ($category->is_system) {
            return false;
        }

        // Cannot delete if services are attached
        if ($category->services()->count() > 0) {
            return false;
        }

        return $category->user_id === $user->id;
    }
}
