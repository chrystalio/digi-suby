<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('service'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'url' => ['nullable', 'url', 'max:255'],
            'category_id' => [
                'required',
                'ulid',
                Rule::exists('categories', 'id')->where(function ($query) {
                    $query->where('is_system', true)
                        ->orWhere('user_id', $this->user()->id);
                }),
            ],
        ];
    }
}
