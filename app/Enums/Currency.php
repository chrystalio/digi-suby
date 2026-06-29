<?php

namespace App\Enums;

enum Currency: string
{
    case USD = 'USD';
    case EUR = 'EUR';
    case GBP = 'GBP';
    case IDR = 'IDR';
    case JPY = 'JPY';
    case AUD = 'AUD';
    case CAD = 'CAD';
    case SGD = 'SGD';
    case MYR = 'MYR';
    case PHP = 'PHP';

    public function symbol(): string
    {
        return match ($this) {
            self::USD => '$',
            self::EUR => '€',
            self::GBP => '£',
            self::IDR => 'Rp',
            self::JPY => '¥',
            self::AUD => 'A$',
            self::CAD => 'C$',
            self::SGD => 'S$',
            self::MYR => 'RM',
            self::PHP => '₱',
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::USD => 'US Dollar',
            self::EUR => 'Euro',
            self::GBP => 'British Pound',
            self::IDR => 'Indonesian Rupiah',
            self::JPY => 'Japanese Yen',
            self::AUD => 'Australian Dollar',
            self::CAD => 'Canadian Dollar',
            self::SGD => 'Singapore Dollar',
            self::MYR => 'Malaysian Ringgit',
            self::PHP => 'Philippine Peso',
        };
    }
}
