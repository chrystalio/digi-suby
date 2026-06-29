<?php

namespace App\Http\Requests;

use App\Enums\Currency;
use App\Enums\SubscriptionInterval;
use App\Enums\SubscriptionStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_id' => [
                'required',
                'ulid',
                Rule::exists('services', 'id')->where(function ($query) {
                    $query->where('is_system', true)
                        ->orWhere('user_id', $this->user()->id);
                }),
            ],
            'payment_method_id' => [
                'nullable',
                'ulid',
                Rule::exists('payment_methods', 'id')->where(
                    fn ($query) => $query->where('user_id', $this->user()->id)
                ),
            ],
            'name' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'currency' => ['required', Rule::enum(Currency::class)],
            'interval' => ['required', Rule::enum(SubscriptionInterval::class)],
            'next_billing_date' => ['nullable', 'date'],
            'started_at' => ['required', 'date'],
            'trial_ends_at' => ['nullable', 'date', 'after_or_equal:started_at'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', Rule::enum(SubscriptionStatus::class)],
        ];
    }
}
