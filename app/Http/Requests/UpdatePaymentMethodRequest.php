<?php

namespace App\Http\Requests;

use App\Enums\CardCategory;
use App\Enums\CardType;
use App\Enums\EWalletProvider;
use App\Enums\PaymentMethodType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('payment_method'));
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $currentYear = (int) date('Y');
        $paymentMethod = $this->route('payment_method');

        $rules = [
            'name' => ['required', 'string', 'max:100'],
            'is_default' => ['boolean'],
        ];

        if ($paymentMethod->method_type === PaymentMethodType::Card) {
            $rules['card_type'] = ['required', Rule::enum(CardType::class)];
            $rules['card_category'] = ['sometimes', Rule::enum(CardCategory::class)];
            $rules['card_last_four'] = ['sometimes', 'string', 'size:4', 'regex:/^\d{4}$/'];
            $rules['card_expiry_month'] = ['required', 'integer', 'between:1,12'];
            $rules['card_expiry_year'] = [
                'required',
                'integer',
                'min:'.$currentYear,
                'max:'.($currentYear + 20),
            ];
        }

        if ($paymentMethod->method_type === PaymentMethodType::EWallet) {
            $rules['e_wallet_provider'] = ['required', Rule::enum(EWalletProvider::class)];
            $rules['e_wallet_identifier'] = ['required', 'string', 'max:100'];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'card_last_four.size' => 'Please enter the last 4 digits of your card.',
            'card_last_four.regex' => 'Card digits must be numeric.',
            'card_expiry_year.min' => 'Card expiry year must be current year or later.',
            'e_wallet_identifier.required' => 'Please enter your e-wallet phone number or email.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $paymentMethod = $this->route('payment_method');

            if ($paymentMethod->method_type === PaymentMethodType::Card && $this->isCardExpired()) {
                $validator->errors()->add('card_expiry_month', 'Card has already expired.');
            }
        });
    }

    protected function isCardExpired(): bool
    {
        $month = (int) $this->card_expiry_month;
        $year = (int) $this->card_expiry_year;

        $currentYear = (int) date('Y');
        $currentMonth = (int) date('m');

        if ($year < $currentYear) {
            return true;
        }

        if ($year === $currentYear && $month < $currentMonth) {
            return true;
        }

        return false;
    }
}
