<?php

namespace App\Models;

use App\Enums\Currency;
use App\Enums\SubscriptionInterval;
use App\Enums\SubscriptionStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'service_id',
        'payment_method_id',
        'name',
        'amount',
        'currency',
        'interval',
        'next_billing_date',
        'started_at',
        'trial_ends_at',
        'cancelled_at',
        'status',
        'notes',
    ];

    protected $appends = [
        'display_amount',
        'is_trial_ending_soon',
        'is_renewing_soon',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'next_billing_date' => 'date',
            'started_at' => 'date',
            'trial_ends_at' => 'date',
            'cancelled_at' => 'date',
            'interval' => SubscriptionInterval::class,
            'status' => SubscriptionStatus::class,
            'currency' => Currency::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    // ---------- Status / interval helpers ----------

    public function isLifetime(): bool
    {
        return $this->interval === SubscriptionInterval::Lifetime;
    }

    public function isCancelled(): bool
    {
        return $this->status === SubscriptionStatus::Cancelled;
    }

    public function daysUntilNextBilling(): ?int
    {
        if ($this->isLifetime() || $this->isCancelled() || $this->next_billing_date === null) {
            return null;
        }

        return (int) now()->startOfDay()->diffInDays($this->next_billing_date, false);
    }

    /**
     * Normalize amount to a monthly figure (in the subscription's own currency).
     * Lifetime plans return 0.0 so they can be excluded from spend totals.
     */
    public function monthlyEquivalent(): float
    {
        return match ($this->interval) {
            SubscriptionInterval::Weekly => (float) $this->amount * 4.345,
            SubscriptionInterval::Monthly => (float) $this->amount,
            SubscriptionInterval::Quarterly => (float) $this->amount / 3,
            SubscriptionInterval::Yearly => (float) $this->amount / 12,
            SubscriptionInterval::Lifetime => 0.0,
        };
    }

    /**
     * Compute the next billing date from a start date and an interval.
     * Returns null for lifetime plans (no recurring billing).
     *
     * Single source of truth: the controller and factory both call this so
     * the formula only lives in one place.
     */
    public static function computeNextBillingDate(
        Carbon|string $startedAt,
        SubscriptionInterval $interval,
    ): ?Carbon {
        $start = $startedAt instanceof Carbon
            ? $startedAt->copy()
            : Carbon::parse($startedAt);

        return match ($interval) {
            SubscriptionInterval::Weekly => $start->addWeek(),
            SubscriptionInterval::Monthly => $start->addMonth(),
            SubscriptionInterval::Quarterly => $start->addMonths(3),
            SubscriptionInterval::Yearly => $start->addYear(),
            SubscriptionInterval::Lifetime => null,
        };
    }

    public function markCancelled(): void
    {
        $this->status = SubscriptionStatus::Cancelled;
        $this->cancelled_at = now()->toDateString();
        $this->save();
    }

    public function reopen(): void
    {
        $this->status = SubscriptionStatus::Active;
        $this->cancelled_at = null;
        $this->save();
    }

    // ---------- Scopes ----------

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', SubscriptionStatus::Active->value);
    }

    /**
     * Subscriptions whose next billing date is within the given number of days,
     * excluding cancelled and lifetime.
     */
    public function scopeRenewingWithin(Builder $query, int $days): Builder
    {
        return $query
            ->whereNotNull('next_billing_date')
            ->where('status', '!=', SubscriptionStatus::Cancelled->value)
            ->where('interval', '!=', SubscriptionInterval::Lifetime->value)
            ->whereDate('next_billing_date', '<=', now()->addDays($days)->toDateString());
    }

    public function scopeForCurrency(Builder $query, Currency $currency): Builder
    {
        return $query->where('currency', $currency->value);
    }

    // ---------- Appended accessors ----------

    public function getDisplayAmountAttribute(): string
    {
        return $this->currency->symbol() . number_format((float) $this->amount, 2, '.', ',');
    }

    public function getIsTrialEndingSoonAttribute(): bool
    {
        return $this->status === SubscriptionStatus::Trial
            && $this->trial_ends_at !== null
            && $this->trial_ends_at->diffInDays(now(), false) >= -7
            && $this->trial_ends_at->isFuture();
    }

    public function getIsRenewingSoonAttribute(): bool
    {
        if ($this->isCancelled() || $this->isLifetime() || $this->next_billing_date === null) {
            return false;
        }

        return $this->next_billing_date->diffInDays(now(), false) >= -7
            && $this->next_billing_date->isFuture();
    }
}
