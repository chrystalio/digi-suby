<?php

namespace App\Http\Requests;

use App\Enums\Currency;
use App\Enums\SubscriptionInterval;
use App\Enums\SubscriptionStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('subscription'));
    }

    public function rules(): array
    {
        return [
            'service_id' => [
                'sometimes',
                'ulid',
                Rule::exists('services', 'id')->where(function ($query) {
                    $query->where('is_system', true)
                        ->orWhere('user_id', $this->user()->id);
                }),
            ],
            'payment_method_id' => [
                'sometimes',
                'nullable',
                'ulid',
                Rule::exists('payment_methods', 'id')->where(
                    fn ($query) => $query->where('user_id', $this->user()->id)
                ),
            ],
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0', 'max:9999999.99'],
            'currency' => ['sometimes', 'required', Rule::enum(Currency::class)],
            'interval' => ['sometimes', 'required', Rule::enum(SubscriptionInterval::class)],
            'next_billing_date' => ['sometimes', 'nullable', 'date'],
            'started_at' => ['sometimes', 'required', 'date'],
            'trial_ends_at' => ['sometimes', 'nullable', 'date', 'after_or_equal:started_at'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'required', Rule::enum(SubscriptionStatus::class)],
        ];
    }
}
