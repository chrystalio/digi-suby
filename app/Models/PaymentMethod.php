<?php

namespace App\Models;

use App\Enums\CardCategory;
use App\Enums\CardType;
use App\Enums\EWalletProvider;
use App\Enums\PaymentMethodType;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentMethod extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'method_type',
        'card_type',
        'card_category',
        'card_last_four',
        'card_expiry_month',
        'card_expiry_year',
        'e_wallet_provider',
        'e_wallet_identifier',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'method_type' => PaymentMethodType::class,
            'card_type' => CardType::class,
            'card_category' => CardCategory::class,
            'e_wallet_provider' => EWalletProvider::class,
            'is_default' => 'boolean',
            'card_expiry_month' => 'integer',
            'card_expiry_year' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the masked card number display.
     */
    public function getMaskedNumberAttribute(): ?string
    {
        if ($this->method_type !== PaymentMethodType::Card) {
            return null;
        }

        return "•••• •••• •••• {$this->card_last_four}";
    }

    /**
     * Get the formatted expiry date.
     */
    public function getExpiryAttribute(): ?string
    {
        if ($this->method_type !== PaymentMethodType::Card) {
            return null;
        }

        return sprintf('%02d/%02d', $this->card_expiry_month, $this->card_expiry_year % 100);
    }

    /**
     * Get the logo URL from logo.dev.
     */
    public function getLogoUrlAttribute(): string
    {
        $domain = match ($this->method_type) {
            PaymentMethodType::Card => $this->card_type?->logoDomain() ?? 'credit-card.com',
            PaymentMethodType::EWallet => $this->e_wallet_provider?->logoDomain() ?? 'wallet.com',
        };

        $token = config('services.logodev.token');

        return "https://img.logo.dev/{$domain}?token={$token}&size=64";
    }

    /**
     * Get the display identifier (masked card or e-wallet identifier).
     */
    public function getDisplayIdentifierAttribute(): string
    {
        return match ($this->method_type) {
            PaymentMethodType::Card => $this->masked_number,
            PaymentMethodType::EWallet => $this->e_wallet_identifier,
        };
    }

    /**
     * Get the type label (Visa, DANA, etc.).
     */
    public function getTypeLabelAttribute(): string
    {
        return match ($this->method_type) {
            PaymentMethodType::Card => $this->card_type?->label() ?? 'Card',
            PaymentMethodType::EWallet => $this->e_wallet_provider?->label() ?? 'E-Wallet',
        };
    }

    /**
     * Check if the card has expired.
     */
    public function isExpired(): bool
    {
        if ($this->method_type !== PaymentMethodType::Card) {
            return false;
        }

        $now = now();
        $expiryDate = now()
            ->setYear($this->card_expiry_year)
            ->setMonth($this->card_expiry_month)
            ->endOfMonth();

        return $now->greaterThan($expiryDate);
    }

    /**
     * Check if the card expires within 30 days.
     */
    public function expiresSoon(): bool
    {
        if ($this->method_type !== PaymentMethodType::Card) {
            return false;
        }

        if ($this->isExpired()) {
            return false;
        }

        $expiryDate = now()
            ->setYear($this->card_expiry_year)
            ->setMonth($this->card_expiry_month)
            ->endOfMonth();

        return now()->diffInDays($expiryDate, false) <= 30;
    }
}