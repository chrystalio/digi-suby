<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'slug',
        'url',
        'is_system',
    ];

    protected $appends = ['logo'];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function getLogoAttribute(): ?string
    {
        if (! $this->url) {
            return null;
        }

        $domain = $this->extractDomain($this->url);
        $token = config('services.logodev.token');

        // Get theme from cookie (light/dark/system), default to light
        $appearance = request()->cookie('appearance', 'system');
        $theme = match ($appearance) {
            'light' => 'light',
            'dark' => 'dark',
            default => 'light',
        };

        $baseUrl = "https://img.logo.dev/{$domain}";

        // Build query parameters
        $params = [
            'size' => 128,
            'format' => 'webp',
            'theme' => $theme,
        ];

        if ($token) {
            $params['token'] = $token;
            $params['retina'] = 'true';
        }

        return $baseUrl . '?' . http_build_query($params);
    }

    /**
     * Extract clean domain from URL.
     */
    protected function extractDomain(string $url): string
    {
        // Remove protocol
        $domain = preg_replace('#^https?://#', '', $url);

        // Remove path
        $domain = preg_replace('#/.*$#', '', $domain);

        // Remove www
        $domain = preg_replace('#^www\.#', '', $domain);

        return strtolower(trim($domain));
    }

    /**
     * Scope: Visible services to user (system + own).
     */
    public function scopeVisibleTo($query, $user)
    {
        return $query->where(function ($q) use ($user) {
            $q->where('is_system', true)
                ->orWhere('user_id', $user->id);
        });
    }
}
