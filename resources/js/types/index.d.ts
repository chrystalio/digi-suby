import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    is_system: boolean;
    created_at: string;
    updated_at: string;
}

export interface Flash {
    success: string | null;
    error: string | null;
}

export type PaymentMethodType = 'card' | 'e_wallet';
export type CardType =
    | 'visa'
    | 'mastercard'
    | 'amex'
    | 'jcb'
    | 'discover'
    | 'other';
export type CardCategory = 'credit' | 'debit';
export type EWalletProvider =
    | 'dana'
    | 'ovo'
    | 'gopay'
    | 'apple_pay'
    | 'google_pay'
    | 'shopee_pay'
    | 'linkaja';

export interface PaymentMethod {
    id: string;
    user_id: number;
    name: string;
    method_type: PaymentMethodType;
    card_type: CardType | null;
    card_category: CardCategory | null;
    card_last_four: string | null;
    card_expiry_month: number | null;
    card_expiry_year: number | null;
    e_wallet_provider: EWalletProvider | null;
    e_wallet_identifier: string | null;
    is_default: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    masked_number: string | null;
    expiry: string | null;
    logo_url: string;
    display_identifier: string;
    type_label: string;
}

export interface Service {
    id: string;
    name: string;
    slug: string;
    url: string | null;
    logo: string | null;
    category: {
        id: string;
        name: string;
        color: string;
        icon: string | null;
    } | null;
    is_system: boolean;
    can_edit: boolean;
    can_delete: boolean;
}

export interface ServicesFilters {
    search: string;
    category: string;
    type: string;
    per_page: number;
}

export interface ServiceFormData {
    name: string;
    url: string;
    category_id: string;
}

// --- Subscription domain ---
// String-literal unions mirror app/Enums/*.php — keep in sync.

export type Currency =
    | 'USD'
    | 'EUR'
    | 'GBP'
    | 'IDR'
    | 'JPY'
    | 'AUD'
    | 'CAD'
    | 'SGD'
    | 'MYR'
    | 'PHP';

export type SubscriptionInterval =
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly'
    | 'lifetime';

export type SubscriptionStatus = 'active' | 'trial' | 'cancelled';

export interface Subscription {
    id: string;
    name: string;
    amount: string;
    currency: Currency;
    interval: SubscriptionInterval;
    status: SubscriptionStatus;
    next_billing_date: string | null;
    started_at: string | null;
    trial_ends_at: string | null;
    cancelled_at: string | null;
    notes: string | null;
    display_amount: string;
    days_until_next_billing: number | null;
    is_trial_ending_soon: boolean;
    is_renewing_soon: boolean;
    is_cancelled: boolean;
    is_lifetime: boolean;
    monthly_equivalent: number;
    service: {
        id: string;
        name: string;
        slug: string;
        logo: string | null;
    } | null;
    payment_method: {
        id: string;
        name: string;
        card_last_four: string | null;
    } | null;
    can_edit: boolean;
    can_delete: boolean;
}

export interface SubscriptionsFilters {
    search: string;
    status: string;
    currency: string;
    per_page: number;
}

export interface SubscriptionFormData {
    service_id: string;
    payment_method_id: string | null;
    name: string;
    amount: string;
    currency: Currency;
    interval: SubscriptionInterval;
    status: SubscriptionStatus;
    next_billing_date: string;
    started_at: string;
    trial_ends_at: string | null;
    notes: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    flash: Flash;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
