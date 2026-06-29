import type {
    Currency,
    SubscriptionInterval,
    SubscriptionStatus,
} from '@/types';

export const CURRENCY_OPTIONS: {
    value: Currency;
    label: string;
}[] = [
    { value: 'USD', label: 'US Dollar' },
    { value: 'IDR', label: 'Indonesian Rupiah' },
    { value: 'SGD', label: 'Singapore Dollar' },
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
