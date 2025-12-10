<?php

namespace App\Enums;

enum CardCategory: string
{
    case Credit = 'credit';
    case Debit = 'debit';

    public function label(): string
    {
        return match ($this) {
            self::Credit => 'Credit Card',
            self::Debit => 'Debit Card',
        };
    }
}