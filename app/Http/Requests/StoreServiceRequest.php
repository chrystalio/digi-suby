<?php

namespace App\Http\Requests;

use App\Models\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'url' => 'required|url|max:255',
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

    public function messages(): array
    {
        return [
            'url.required' => 'URL is required to fetch the service logo automatically.',
            'category_id.exists' => 'Please select a valid category.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $slug = Str::slug($this->name);

        $existingCount = Service::where('slug', $slug)->count();
        if ($existingCount > 0) {
            $slug .= '-'.Str::lower(Str::random(4));
        }

        $this->merge(['slug' => $slug]);
    }
}
