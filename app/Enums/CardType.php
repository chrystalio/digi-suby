<?php

namespace App\Enums;

enum CardType: string
{
    case Visa = 'visa';
    case Mastercard = 'mastercard';
    case Amex = 'amex';
    case Jcb = 'jcb';
    case Discover = 'discover';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Visa => 'Visa',
            self::Mastercard => 'Mastercard',
            self::Amex => 'American Express',
            self::Jcb => 'JCB',
            self::Discover => 'Discover',
            self::Other => 'Other',
        };
    }

    public function logoDomain(): string
    {
        return match ($this) {
            self::Visa => 'visa.com',
            self::Mastercard => 'mastercard.com',
            self::Amex => 'americanexpress.com',
            self::Jcb => 'jcb.co.jp',
            self::Discover => 'discover.com',
            self::Other => 'credit-card.com',
        };
    }
}