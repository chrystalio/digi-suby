import { CardCategory } from '@/types';

export interface CardInfo {
    category: CardCategory;
    pattern: RegExp;
    length: number[];
    cvcLength: number[];
}

const cardPatterns: CardInfo[] = [
    {
        category: 'visa',
        pattern: /^4/,
        length: [13, 16, 19],
        cvcLength: [3],
    },
    {
        category: 'mastercard',
        pattern: /^(5[1-5]|2[2-7])/,
        length: [16],
        cvcLength: [3],
    },
    {
        category: 'amex',
        pattern: /^3[47]/,
        length: [15],
        cvcLength: [4],
    },
    {
        category: 'discover',
        pattern:
            /^(6011|622(1(2[6-9]|[3-9][0-9])|[2-8][0-9]{2}|9([0-1][0-9]|2[0-5]))|64[4-9]|65)/,
        length: [16],
        cvcLength: [3],
    },
    {
        category: 'jcb',
        pattern: /^35(2[8-9]|[3-8][0-9])/,
        length: [16],
        cvcLength: [3],
    },
];

/**
 * Detect card category from card number (Visa, Mastercard, etc.)
 */
export function detectCardCategory(cardNumber: string): CardCategory {
    // Remove spaces and dashes
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');

    for (const card of cardPatterns) {
        if (card.pattern.test(cleanNumber)) {
            return card.category;
        }
    }

    return 'other';
}

/**
 * Get card brand name for display
 */
export function getCardBrandName(cardCategory: CardCategory): string {
    const brandNames: Record<CardCategory, string> = {
        visa: 'Visa',
        mastercard: 'Mastercard',
        amex: 'American Express',
        jcb: 'JCB',
        discover: 'Discover',
        other: 'Card',
    };

    return brandNames[cardCategory] || 'Card';
}

/**
 * Format card number with spaces
 */
export function formatCardNumber(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');
    const cardCategory = detectCardCategory(cleanNumber);

    // Amex format: 4-6-5
    if (cardCategory === 'amex') {
        return cleanNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3').trim();
    }

    // Default format: 4-4-4-4
    return cleanNumber.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Validate card number using Luhn algorithm
 */
export function validateCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');

    // Check if it's all numeric
    if (!/^\d+$/.test(cleanNumber)) {
        return false;
    }

    // Check length (13-19 digits for most cards)
    const length = cleanNumber.length;
    if (length < 13 || length > 19) {
        return false;
    }

    // Luhn algorithm
    let sum = 0;
    const numDigits = cleanNumber.length;
    const parity = numDigits % 2;

    for (let i = 0; i < numDigits; i++) {
        let digit = parseInt(cleanNumber[i]);

        if (i % 2 === parity) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
    }

    return sum % 10 === 0;
}

/**
 * Get logo URL from logo.dev for card category
 * Note: Backend caches these URLs for 24 hours to reduce API calls
 */
export function getCardLogoUrl(cardCategory: CardCategory): string {
    const logoDomains: Record<CardCategory, string> = {
        visa: 'visa.com',
        mastercard: 'mastercard.com',
        amex: 'americanexpress.com',
        jcb: 'jcb.co.jp',
        discover: 'discover.com',
        other: 'credit-card.com',
    };

    const domain = logoDomains[cardCategory] || 'credit-card.com';
    const token = import.meta.env.VITE_LOGODEV_TOKEN || '';

    return `https://img.logo.dev/${domain}?token=${token}&size=52&retina=true&format=webp`;
}
