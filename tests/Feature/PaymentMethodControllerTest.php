<?php

namespace Tests\Feature;

use App\Enums\CardCategory;
use App\Enums\CardType;
use App\Enums\EWalletProvider;
use App\Enums\PaymentMethodType;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentMethodControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_payment_methods_index()
    {
        $this->get(route('payment-methods.index'))
            ->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_view_payment_methods_index()
    {
        $user = User::factory()->withoutTwoFactor()->create();

        $this->actingAs($user)
            ->get(route('payment-methods.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('payment-methods/index'));
    }

    public function test_users_can_only_see_their_own_payment_methods()
    {
        $user1 = User::factory()->withoutTwoFactor()->create();
        $user2 = User::factory()->withoutTwoFactor()->create();

        PaymentMethod::factory()->for($user1)->create(['name' => 'User 1 Card']);
        PaymentMethod::factory()->for($user2)->create(['name' => 'User 2 Card']);

        $response = $this->actingAs($user1)
            ->get(route('payment-methods.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('payment-methods/index')
            ->has('paymentMethods.data', 1)
            ->where('paymentMethods.data.0.name', 'User 1 Card')
        );
    }

    public function test_users_can_create_card_payment_method()
    {
        $user = User::factory()->withoutTwoFactor()->create();

        $response = $this->actingAs($user)
            ->post(route('payment-methods.store'), [
                'name' => 'My Visa Card',
                'method_type' => PaymentMethodType::Card->value,
                'card_type' => CardType::Credit->value,
                'card_number' => '4532015112830366',
                'card_expiry_month' => 12,
                'card_expiry_year' => (int) date('Y') + 2,
                'is_default' => false,
            ]);

        $response->assertRedirect(route('payment-methods.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('payment_methods', [
            'user_id' => $user->id,
            'name' => 'My Visa Card',
            'method_type' => PaymentMethodType::Card->value,
            'card_type' => CardType::Credit->value,
            'card_category' => CardCategory::Visa->value,
            'card_last_four' => '0366',
        ]);
    }

    public function test_users_can_create_ewallet_payment_method()
    {
        $user = User::factory()->withoutTwoFactor()->create();

        $response = $this->actingAs($user)
            ->post(route('payment-methods.store'), [
                'name' => 'My GoPay',
                'method_type' => PaymentMethodType::EWallet->value,
                'e_wallet_provider' => EWalletProvider::Gopay->value,
                'e_wallet_identifier' => '081234567890',
                'is_default' => false,
            ]);

        $response->assertRedirect(route('payment-methods.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('payment_methods', [
            'user_id' => $user->id,
            'name' => 'My GoPay',
            'method_type' => PaymentMethodType::EWallet->value,
            'e_wallet_identifier' => '081234567890',
        ]);
    }

    public function test_setting_default_payment_method_unsets_other_defaults()
    {
        $user = User::factory()->withoutTwoFactor()->create();

        $existing = PaymentMethod::factory()->for($user)->default()->create();

        $this->actingAs($user)
            ->post(route('payment-methods.store'), [
                'name' => 'New Default Card',
                'method_type' => PaymentMethodType::Card->value,
                'card_type' => CardType::Debit->value,
                'card_number' => '5555555555554444',
                'card_expiry_month' => 12,
                'card_expiry_year' => (int) date('Y') + 2,
                'is_default' => true,
            ]);

        $this->assertDatabaseHas('payment_methods', [
            'id' => $existing->id,
            'is_default' => false,
        ]);

        $this->assertDatabaseHas('payment_methods', [
            'name' => 'New Default Card',
            'card_type' => CardType::Debit->value,
            'card_category' => CardCategory::Mastercard->value,
            'is_default' => true,
        ]);
    }

    public function test_card_validation_requires_card_type()
    {
        $user = User::factory()->withoutTwoFactor()->create();

        $response = $this->actingAs($user)
            ->post(route('payment-methods.store'), [
                'name' => 'My Card',
                'method_type' => PaymentMethodType::Card->value,
                'card_number' => '4532015112830366',
                'card_expiry_month' => 12,
                'card_expiry_year' => (int) date('Y') + 2,
            ]);

        $response->assertSessionHasErrors('card_type');
    }

    public function test_card_validation_requires_card_number()
    {
        $user = User::factory()->withoutTwoFactor()->create();

        $response = $this->actingAs($user)
            ->post(route('payment-methods.store'), [
                'name' => 'My Card',
                'method_type' => PaymentMethodType::Card->value,
                'card_type' => CardType::Credit->value,
                'card_expiry_month' => 12,
                'card_expiry_year' => (int) date('Y') + 2,
            ]);

        $response->assertSessionHasErrors('card_number');
    }

    public function test_card_validation_requires_valid_card_number()
    {
        $user = User::factory()->withoutTwoFactor()->create();

        $response = $this->actingAs($user)
            ->post(route('payment-methods.store'), [
                'name' => 'My Card',
                'method_type' => PaymentMethodType::Card->value,
                'card_type' => CardType::Credit->value,
                'card_number' => '1234567890123456',
                'card_expiry_month' => 12,
                'card_expiry_year' => (int) date('Y') + 2,
            ]);

        $response->assertSessionHasErrors('card_number');
    }

    public function test_card_validation_prevents_expired_cards()
    {
        $user = User::factory()->withoutTwoFactor()->create();

        $response = $this->actingAs($user)
            ->post(route('payment-methods.store'), [
                'name' => 'Expired Card',
                'method_type' => PaymentMethodType::Card->value,
                'card_type' => CardType::Credit->value,
                'card_number' => '4532015112830366',
                'card_expiry_month' => 1,
                'card_expiry_year' => (int) date('Y') - 1,
            ]);

        $response->assertSessionHasErrors('card_expiry_month');
    }

    public function test_ewallet_validation_requires_identifier()
    {
        $user = User::factory()->withoutTwoFactor()->create();

        $response = $this->actingAs($user)
            ->post(route('payment-methods.store'), [
                'name' => 'My Wallet',
                'method_type' => PaymentMethodType::EWallet->value,
                'e_wallet_provider' => EWalletProvider::Dana->value,
            ]);

        $response->assertSessionHasErrors('e_wallet_identifier');
    }

    public function test_users_can_update_their_own_payment_method()
    {
        $user = User::factory()->withoutTwoFactor()->create();
        $paymentMethod = PaymentMethod::factory()->for($user)->create([
            'name' => 'Old Name',
        ]);

        $response = $this->actingAs($user)
            ->put(route('payment-methods.update', $paymentMethod), [
                'name' => 'Updated Name',
                'card_type' => $paymentMethod->card_type->value,
                'card_expiry_month' => $paymentMethod->card_expiry_month,
                'card_expiry_year' => $paymentMethod->card_expiry_year,
                'is_default' => false,
            ]);

        $response->assertRedirect(route('payment-methods.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('payment_methods', [
            'id' => $paymentMethod->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_users_cannot_update_others_payment_methods()
    {
        $user1 = User::factory()->withoutTwoFactor()->create();
        $user2 = User::factory()->withoutTwoFactor()->create();

        $paymentMethod = PaymentMethod::factory()->for($user2)->create();

        $response = $this->actingAs($user1)
            ->put(route('payment-methods.update', $paymentMethod), [
                'name' => 'Hacked Name',
                'card_type' => CardType::Credit->value,
                'card_expiry_month' => 12,
                'card_expiry_year' => (int) date('Y') + 2,
            ]);

        // FormRequest authorization check returns 403 before controller is reached
        $response->assertForbidden();

        $this->assertDatabaseMissing('payment_methods', [
            'id' => $paymentMethod->id,
            'name' => 'Hacked Name',
        ]);
    }

    public function test_users_can_delete_their_own_payment_method()
    {
        $user = User::factory()->withoutTwoFactor()->create();
        $paymentMethod = PaymentMethod::factory()->for($user)->create();

        $response = $this->actingAs($user)
            ->delete(route('payment-methods.destroy', $paymentMethod));

        $response->assertRedirect(route('payment-methods.index'))
            ->assertSessionHas('success');

        $this->assertSoftDeleted('payment_methods', [
            'id' => $paymentMethod->id,
        ]);
    }

    public function test_users_cannot_delete_others_payment_methods()
    {
        $user1 = User::factory()->withoutTwoFactor()->create();
        $user2 = User::factory()->withoutTwoFactor()->create();

        $paymentMethod = PaymentMethod::factory()->for($user2)->create();

        $response = $this->actingAs($user1)
            ->delete(route('payment-methods.destroy', $paymentMethod));

        $response->assertRedirect(route('payment-methods.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('payment_methods', [
            'id' => $paymentMethod->id,
            'deleted_at' => null,
        ]);
    }

    public function test_payment_methods_index_is_paginated()
    {
        $user = User::factory()->withoutTwoFactor()->create();

        PaymentMethod::factory()->for($user)->count(15)->create();

        $response = $this->actingAs($user)
            ->get(route('payment-methods.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('payment-methods/index')
            ->has('paymentMethods.data', 10)
            ->where('paymentMethods.per_page', 10)
        );
    }

    public function test_validation_prevents_non_numeric_card_number()
    {
        $user = User::factory()->withoutTwoFactor()->create();

        $response = $this->actingAs($user)
            ->post(route('payment-methods.store'), [
                'name' => 'My Card',
                'method_type' => PaymentMethodType::Card->value,
                'card_type' => CardType::Credit->value,
                'card_number' => 'abcd1234abcd5678',
                'card_expiry_month' => 12,
                'card_expiry_year' => (int) date('Y') + 2,
            ]);

        $response->assertSessionHasErrors('card_number');
    }

    public function test_card_category_is_detected_automatically()
    {
        $user = User::factory()->withoutTwoFactor()->create();

        $testCases = [
            ['card_number' => '4532015112830366', 'expected_category' => CardCategory::Visa],
            ['card_number' => '5555555555554444', 'expected_category' => CardCategory::Mastercard],
            ['card_number' => '378282246310005', 'expected_category' => CardCategory::Amex],
            ['card_number' => '6011111111111117', 'expected_category' => CardCategory::Discover],
            ['card_number' => '3530111333300000', 'expected_category' => CardCategory::Jcb],
        ];

        foreach ($testCases as $testCase) {
            $this->actingAs($user)
                ->post(route('payment-methods.store'), [
                    'name' => "Test {$testCase['expected_category']->value} Card",
                    'method_type' => PaymentMethodType::Card->value,
                    'card_type' => CardType::Credit->value,
                    'card_number' => $testCase['card_number'],
                    'card_expiry_month' => 12,
                    'card_expiry_year' => (int) date('Y') + 2,
                    'is_default' => false,
                ]);

            $this->assertDatabaseHas('payment_methods', [
                'user_id' => $user->id,
                'card_category' => $testCase['expected_category']->value,
                'card_last_four' => substr($testCase['card_number'], -4),
            ]);
        }
    }

    public function test_users_can_set_default_payment_method()
    {
        $user = User::factory()->withoutTwoFactor()->create();

        $existingDefault = PaymentMethod::factory()->for($user)->default()->create();
        $newDefault = PaymentMethod::factory()->for($user)->create(['is_default' => false]);

        $response = $this->actingAs($user)
            ->post(route('payment-methods.set-default', $newDefault));

        $response->assertRedirect(route('payment-methods.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('payment_methods', [
            'id' => $newDefault->id,
            'is_default' => true,
        ]);

        $this->assertDatabaseHas('payment_methods', [
            'id' => $existingDefault->id,
            'is_default' => false,
        ]);
    }

    public function test_users_cannot_set_default_for_others_payment_methods()
    {
        $user1 = User::factory()->withoutTwoFactor()->create();
        $user2 = User::factory()->withoutTwoFactor()->create();

        $paymentMethod = PaymentMethod::factory()->for($user2)->create(['is_default' => false]);

        $response = $this->actingAs($user1)
            ->post(route('payment-methods.set-default', $paymentMethod));

        $response->assertRedirect(route('payment-methods.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('payment_methods', [
            'id' => $paymentMethod->id,
            'is_default' => false,
        ]);
    }
}
