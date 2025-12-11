<?php

namespace App\Enums;

enum PaymentMethodType: string
{
    case Card = 'card';
    case EWallet = 'e_wallet';

    public function label(): string
    {
        return match ($this) {
            self::Card => 'Card',
            self::EWallet => 'E-Wallet',
        };
    }
}
