<?php

namespace Database\Factories;

use App\Enums\CardCategory;
use App\Enums\CardType;
use App\Enums\EWalletProvider;
use App\Enums\PaymentMethodType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PaymentMethod>
 */
class PaymentMethodFactory extends Factory
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
            'name' => fake()->randomElement(['Personal Card', 'Business Card', 'Primary Wallet']),
            'method_type' => PaymentMethodType::Card,
            'card_type' => CardType::Credit,
            'card_category' => CardCategory::Visa,
            'card_last_four' => fake()->numerify('####'),
            'card_expiry_month' => fake()->numberBetween(1, 12),
            'card_expiry_year' => fake()->numberBetween(date('Y'), date('Y') + 10),
            'e_wallet_provider' => null,
            'e_wallet_identifier' => null,
            'is_default' => false,
        ];
    }

    /**
     * Indicate that the payment method is a card.
     */
    public function card(?CardCategory $category = null, ?CardType $type = null): static
    {
        return $this->state(fn (array $attributes) => [
            'method_type' => PaymentMethodType::Card,
            'card_type' => $type ?? CardType::Credit,
            'card_category' => $category ?? CardCategory::Visa,
            'card_last_four' => fake()->numerify('####'),
            'card_expiry_month' => fake()->numberBetween(1, 12),
            'card_expiry_year' => fake()->numberBetween(date('Y'), date('Y') + 10),
            'e_wallet_provider' => null,
            'e_wallet_identifier' => null,
        ]);
    }

    /**
     * Indicate that the payment method is an e-wallet.
     */
    public function eWallet(?EWalletProvider $provider = null): static
    {
        $selectedProvider = $provider ?? EWalletProvider::Dana;
        $isEmailBased = in_array($selectedProvider, [EWalletProvider::ApplePay, EWalletProvider::GooglePay]);

        return $this->state(fn (array $attributes) => [
            'method_type' => PaymentMethodType::EWallet,
            'card_type' => null,
            'card_category' => null,
            'card_last_four' => null,
            'card_expiry_month' => null,
            'card_expiry_year' => null,
            'e_wallet_provider' => $selectedProvider,
            'e_wallet_identifier' => $isEmailBased ? fake()->safeEmail() : '08'.fake()->numerify('##########'),
        ]);
    }

    /**
     * Indicate that the payment method is the default.
     */
    public function default(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
        ]);
    }

    /**
     * Indicate that the card has expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'card_expiry_month' => 1,
            'card_expiry_year' => date('Y') - 1,
        ]);
    }
}
