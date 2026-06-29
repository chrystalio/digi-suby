import type {
    Currency,
    SubscriptionInterval,
    SubscriptionStatus,
} from '@/types';

export const CURRENCY_OPTIONS: {
    value: Currency;
    label: string;
    symbol: string;
}[] = [
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'GBP', label: 'British Pound', symbol: '£' },
    { value: 'IDR', label: 'Indonesian Rupiah', symbol: 'Rp' },
    { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
    { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
    { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
    { value: 'SGD', label: 'Singapore Dollar', symbol: 'S$' },
    { value: 'MYR', label: 'Malaysian Ringgit', symbol: 'RM' },
    { value: 'PHP', label: 'Philippine Peso', symbol: '₱' },
];

export const INTERVAL_OPTIONS: {
    value: SubscriptionInterval;
    label: string;
}[] = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'lifetime', label: 'Lifetime' },
];

export const STATUS_OPTIONS: {
    value: SubscriptionStatus;
    label: string;
}[] = [
    { value: 'active', label: 'Active' },
    { value: 'trial', label: 'Trial' },
    { value: 'cancelled', label: 'Cancelled' },
];
