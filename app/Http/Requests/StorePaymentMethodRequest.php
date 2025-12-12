<?php

namespace App\Http\Requests;

use App\Enums\CardCategory;
use App\Enums\CardType;
use App\Enums\EWalletProvider;
use App\Enums\PaymentMethodType;
use App\Services\CardDetectionService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->method_type === PaymentMethodType::Card->value && $this->filled('card_number')) {
            $cardNumber = $this->card_number;

            $this->merge([
                'card_type' => CardDetectionService::detectCardCategory($cardNumber)->value,
                'card_last_four' => CardDetectionService::extractLastFour($cardNumber),
            ]);
        }
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $currentYear = (int) date('Y');

        $rules = [
            'name' => ['required', 'string', 'max:100'],
            'method_type' => ['required', Rule::enum(PaymentMethodType::class)],
            'is_default' => ['boolean'],
        ];

        if ($this->method_type === PaymentMethodType::Card->value) {
            $rules['card_number'] = ['required', 'string', 'min:13', 'max:19', 'regex:/^[\d\s\-]+$/'];
            $rules['card_category'] = ['required', Rule::enum(CardCategory::class)];
            $rules['card_type'] = ['sometimes', Rule::enum(CardType::class)];
            $rules['card_last_four'] = ['sometimes', 'string', 'size:4', 'regex:/^\d{4}$/'];
            $rules['card_expiry_month'] = ['required', 'integer', 'between:1,12'];
            $rules['card_expiry_year'] = [
                'required',
                'integer',
                'min:'.$currentYear,
                'max:'.($currentYear + 20),
            ];
        }

        if ($this->method_type === PaymentMethodType::EWallet->value) {
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
            'card_number.required' => 'Please enter your card number.',
            'card_number.min' => 'Card number must be at least 13 digits.',
            'card_number.max' => 'Card number must not exceed 19 digits.',
            'card_number.regex' => 'Card number can only contain digits, spaces, and dashes.',
            'card_expiry_year.min' => 'Card expiry year must be current year or later.',
            'e_wallet_identifier.required' => 'Please enter your e-wallet phone number or email.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->method_type === PaymentMethodType::Card->value) {
                if ($this->filled('card_number') && ! CardDetectionService::validateCardNumber($this->card_number)) {
                    $validator->errors()->add('card_number', 'The card number is invalid.');
                }

                if ($this->isCardExpired()) {
                    $validator->errors()->add('card_expiry_month', 'Card has already expired.');
                }
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
