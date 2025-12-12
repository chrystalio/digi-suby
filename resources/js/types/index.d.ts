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
