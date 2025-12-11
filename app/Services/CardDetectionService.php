<?php

namespace App\Services;

use App\Enums\CardCategory;

class CardDetectionService
{
    /**
     * Detect the card category from a card number.
     */
    public static function detectCardCategory(string $cardNumber): CardCategory
    {
        // Remove spaces and dashes
        $cardNumber = preg_replace('/[\s\-]/', '', $cardNumber);

        // Visa: starts with 4
        if (preg_match('/^4/', $cardNumber)) {
            return CardCategory::Visa;
        }

        // Mastercard: starts with 51-55 or 2221-2720
        if (preg_match('/^5[1-5]/', $cardNumber) || preg_match('/^2[2-7]/', $cardNumber)) {
            return CardCategory::Mastercard;
        }

        // American Express: starts with 34 or 37
        if (preg_match('/^3[47]/', $cardNumber)) {
            return CardCategory::Amex;
        }

        // Discover: starts with 6011, 622126-622925, 644-649, or 65
        if (preg_match('/^6011/', $cardNumber) ||
            preg_match('/^622(1(2[6-9]|[3-9][0-9])|[2-8][0-9]{2}|9([0-1][0-9]|2[0-5]))/', $cardNumber) ||
            preg_match('/^64[4-9]/', $cardNumber) ||
            preg_match('/^65/', $cardNumber)) {
            return CardCategory::Discover;
        }

        // JCB: starts with 3528-3589
        if (preg_match('/^35(2[8-9]|[3-8][0-9])/', $cardNumber)) {
            return CardCategory::Jcb;
        }

        return CardCategory::Other;
    }

    /**
     * Extract the last 4 digits from a card number.
     */
    public static function extractLastFour(string $cardNumber): string
    {
        // Remove spaces and dashes
        $cardNumber = preg_replace('/[\s\-]/', '', $cardNumber);

        return substr($cardNumber, -4);
    }

    /**
     * Validate card number using Luhn algorithm.
     */
    public static function validateCardNumber(string $cardNumber): bool
    {
        // Remove spaces and dashes
        $cardNumber = preg_replace('/[\s\-]/', '', $cardNumber);

        // Check if it's all numeric
        if (! preg_match('/^\d+$/', $cardNumber)) {
            return false;
        }

        // Check length (13-19 digits for most cards)
        $length = strlen($cardNumber);
        if ($length < 13 || $length > 19) {
            return false;
        }

        // Luhn algorithm
        $sum = 0;
        $numDigits = strlen($cardNumber);
        $parity = $numDigits % 2;

        for ($i = 0; $i < $numDigits; $i++) {
            $digit = (int) $cardNumber[$i];

            if ($i % 2 === $parity) {
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }

            $sum += $digit;
        }

        return ($sum % 10) === 0;
    }
}
