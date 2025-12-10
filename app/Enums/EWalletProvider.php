<?php

namespace App\Enums;

enum EWalletProvider: string
{
    case Dana = 'dana';
    case Ovo = 'ovo';
    case Gopay = 'gopay';
    case ApplePay = 'apple_pay';
    case GooglePay = 'google_pay';
    case ShopeePay = 'shopee_pay';
    case LinkAja = 'linkaja';

    public function label(): string
    {
        return match ($this) {
            self::Dana => 'DANA',
            self::Ovo => 'OVO',
            self::Gopay => 'GoPay',
            self::ApplePay => 'Apple Pay',
            self::GooglePay => 'Google Pay',
            self::ShopeePay => 'ShopeePay',
            self::LinkAja => 'LinkAja',
        };
    }

    public function logoDomain(): string
    {
        return match ($this) {
            self::Dana => 'dana.id',
            self::Ovo => 'ovo.id',
            self::Gopay => 'gojek.com',
            self::ApplePay => 'apple.com',
            self::GooglePay => 'google.com',
            self::ShopeePay => 'shopee.com',
            self::LinkAja => 'linkaja.id',
        };
    }

    public function identifierLabel(): string
    {
        return match ($this) {
            self::Dana, self::Ovo, self::Gopay, self::ShopeePay, self::LinkAja => 'Phone Number',
            self::ApplePay, self::GooglePay => 'Email Address',
        };
    }

    public function identifierPlaceholder(): string
    {
        return match ($this) {
            self::Dana, self::Ovo, self::Gopay, self::ShopeePay, self::LinkAja => '08xxxxxxxxxx',
            self::ApplePay, self::GooglePay => 'email@example.com',
        };
    }
}