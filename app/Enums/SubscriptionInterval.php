<?php

namespace App\Enums;

enum SubscriptionInterval: string
{
    case Weekly = 'weekly';
    case Monthly = 'monthly';
    case Quarterly = 'quarterly';
    case Yearly = 'yearly';
    case Lifetime = 'lifetime';

    public function label(): string
    {
        return match ($this) {
            self::Weekly => 'Weekly',
            self::Monthly => 'Monthly',
            self::Quarterly => 'Quarterly',
            self::Yearly => 'Yearly',
            self::Lifetime => 'Lifetime',
        };
    }

    /**
     * Approximate number of days per interval. Used for `daysUntilNextBilling()`
     * date math. NOTE: this is NOT used for spend normalization; that uses
     * `monthlyEquivalent()` which is based on calendar months, not days.
     */
    public function intervalDays(): ?int
    {
        return match ($this) {
            self::Weekly => 7,
            self::Monthly => 30,
            self::Quarterly => 90,
            self::Yearly => 365,
            self::Lifetime => null,
        };
    }
}
