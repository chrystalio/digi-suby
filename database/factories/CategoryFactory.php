<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'color' => fake()->hexColor(),
            'icon' => fake()->randomElement(['folder', 'tv', 'music', 'cloud', 'gamepad-2', 'newspaper', 'graduation-cap', 'briefcase', 'bot', 'code']),
            'is_system' => false,
            'user_id' => User::factory(),
        ];
    }

    /**
     * Indicate that the category is a system category.
     */
    public function system(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_system' => true,
            'user_id' => null,
        ]);
    }
}
