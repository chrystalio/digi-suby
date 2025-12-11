import {
    store,
    update,
} from '@/actions/App/Http/Controllers/PaymentMethodController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    detectCardCategory,
    formatCardNumber,
    getCardBrandName,
    getCardLogoUrl,
} from '@/lib/card-detection';
import {
    CardCategory,
    CardType,
    EWalletProvider,
    PaymentMethod,
    PaymentMethodType,
} from '@/types';
import { useForm } from '@inertiajs/react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaymentMethodFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentMethod?: PaymentMethod | null;
}

const eWalletProviders: {
    value: EWalletProvider;
    label: string;
    placeholder: string;
}[] = [
    { value: 'dana', label: 'DANA', placeholder: '08xxxxxxxxxx' },
    { value: 'ovo', label: 'OVO', placeholder: '08xxxxxxxxxx' },
    { value: 'gopay', label: 'GoPay', placeholder: '08xxxxxxxxxx' },
    {
        value: 'apple_pay',
        label: 'Apple Pay',
        placeholder: 'email@example.com',
    },
    {
        value: 'google_pay',
        label: 'Google Pay',
        placeholder: 'email@example.com',
    },
    { value: 'shopee_pay', label: 'ShopeePay', placeholder: '08xxxxxxxxxx' },
    { value: 'linkaja', label: 'LinkAja', placeholder: '08xxxxxxxxxx' },
];

export function PaymentMethodFormModal({
    open,
    onOpenChange,
    paymentMethod,
}: PaymentMethodFormModalProps) {
    const isEditing = !!paymentMethod;
    const currentYear = new Date().getFullYear();
    const [detectedCardCategory, setDetectedCardCategory] =
        useState<CardCategory>('other');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: paymentMethod?.name ?? '',
        method_type: (paymentMethod?.method_type ??
            'card') as PaymentMethodType,
        card_number: '',
        card_type: (paymentMethod?.card_type ?? 'credit') as CardType | null,
        card_category: (paymentMethod?.card_category ??
            'visa') as CardCategory | null,
        card_last_four: (paymentMethod?.card_last_four ?? '') as string | null,
        card_expiry_month: (paymentMethod?.card_expiry_month?.toString() ??
            '') as string | null,
        card_expiry_year: (paymentMethod?.card_expiry_year?.toString() ??
            '') as string | null,
        e_wallet_provider: (paymentMethod?.e_wallet_provider ??
            'dana') as EWalletProvider | null,
        e_wallet_identifier: (paymentMethod?.e_wallet_identifier ?? '') as
            | string
            | null,
        is_default: paymentMethod?.is_default ?? false,
    });

    useEffect(() => {
        if (open) {
            const formData = {
                name: paymentMethod?.name ?? '',
                method_type: (paymentMethod?.method_type ??
                    'card') as PaymentMethodType,
                card_number: '',
                card_type: (paymentMethod?.card_type ??
                    'credit') as CardType | null,
                card_category: (paymentMethod?.card_category ??
                    'visa') as CardCategory | null,
                card_last_four: (paymentMethod?.card_last_four ?? '') as
                    | string
                    | null,
                card_expiry_month:
                    (paymentMethod?.card_expiry_month?.toString() ?? '') as
                        | string
                        | null,
                card_expiry_year:
                    (paymentMethod?.card_expiry_year?.toString() ?? '') as
                        | string
                        | null,
                e_wallet_provider: (paymentMethod?.e_wallet_provider ??
                    'dana') as EWalletProvider | null,
                e_wallet_identifier: (paymentMethod?.e_wallet_identifier ??
                    '') as string | null,
                is_default: paymentMethod?.is_default ?? false,
            };
            setData(formData);
            setDetectedCardCategory(paymentMethod?.card_category ?? 'other');
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const formatted = formatCardNumber(value);
        const detected = detectCardCategory(value);

        setData('card_number', formatted);
        setDetectedCardCategory(detected);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const originalData = { ...data };
        const payload = { ...data };

        if (payload.method_type === 'card') {
            payload.e_wallet_provider = null;
            payload.e_wallet_identifier = null;
        } else if (payload.method_type === 'e_wallet') {
            payload.card_number = '';
            payload.card_type = null;
            payload.card_category = null;
            payload.card_last_four = null;
            payload.card_expiry_month = null;
            payload.card_expiry_year = null;
        }

        if (isEditing && paymentMethod) {
            put(update.url(paymentMethod.id), {
                ...payload,
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
                onError: () => {
                    setData(originalData);
                },
            });
        } else {
            post(store.url(), {
                ...payload,
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
                onError: () => {
                    setData(originalData);
                },
            });
        }
    };

    const selectedEWalletProvider = eWalletProviders.find(
        (p) => p.value === data.e_wallet_provider,
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? 'Edit Payment Method'
                            : 'Add Payment Method'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the payment method details below.'
                            : 'Fill in the details to add a new payment method.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="e.g., Personal Visa Card, Work GoPay"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label>Payment Method Type</Label>
                            <RadioGroup
                                value={data.method_type}
                                onValueChange={(value) =>
                                    setData(
                                        'method_type',
                                        value as PaymentMethodType,
                                    )
                                }
                                disabled={isEditing}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="card" id="card" />
                                    <Label
                                        htmlFor="card"
                                        className="cursor-pointer font-normal"
                                    >
                                        Card
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="e_wallet"
                                        id="e_wallet"
                                    />
                                    <Label
                                        htmlFor="e_wallet"
                                        className="cursor-pointer font-normal"
                                    >
                                        E-Wallet
                                    </Label>
                                </div>
                            </RadioGroup>
                            {isEditing && (
                                <p className="text-xs text-muted-foreground">
                                    Payment type cannot be changed after
                                    creation
                                </p>
                            )}
                        </div>

                        {data.method_type === 'card' && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="card_type">Card Type</Label>
                                    <Select
                                        value={data.card_type ?? undefined}
                                        onValueChange={(value) =>
                                            setData(
                                                'card_type',
                                                value as CardType,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="card_type">
                                            <SelectValue placeholder="Select card type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="credit">
                                                Credit Card
                                            </SelectItem>
                                            <SelectItem value="debit">
                                                Debit Card
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.card_type && (
                                        <p className="text-sm text-destructive">
                                            {errors.card_type}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="card_number">
                                        Card Number
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="card_number"
                                            value={data.card_number}
                                            onChange={handleCardNumberChange}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            className="pr-16"
                                        />
                                        {data.card_number && (
                                            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
                                                <img
                                                    src={getCardLogoUrl(
                                                        detectedCardCategory,
                                                    )}
                                                    alt={getCardBrandName(
                                                        detectedCardCategory,
                                                    )}
                                                    className="h-6 w-auto object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display =
                                                            'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {!data.card_number && (
                                            <div className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                    {!isEditing && (
                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-500" />
                                            Full number used to detect card type. Only the last 4 digits are saved.
                                        </p>
                                    )}
                                    {isEditing && (
                                        <p className="text-xs text-muted-foreground">
                                            {data.card_category && (
                                                <>
                                                    {getCardBrandName(
                                                        data.card_category,
                                                    )}{' '}
                                                    •••• •••• ••••{' '}
                                                    {data.card_last_four}
                                                </>
                                            )}
                                        </p>
                                    )}
                                    {errors.card_number && (
                                        <p className="text-sm text-destructive">
                                            {errors.card_number}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="card_expiry_month">
                                            Expiry Month
                                        </Label>
                                        <Select
                                            value={data.card_expiry_month ?? ''}
                                            onValueChange={(value) =>
                                                setData(
                                                    'card_expiry_month',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger id="card_expiry_month">
                                                <SelectValue placeholder="Month" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from(
                                                    { length: 12 },
                                                    (_, i) => i + 1,
                                                ).map((month) => (
                                                    <SelectItem
                                                        key={month}
                                                        value={month.toString()}
                                                    >
                                                        {month
                                                            .toString()
                                                            .padStart(2, '0')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.card_expiry_month && (
                                            <p className="text-sm text-destructive">
                                                {errors.card_expiry_month}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="card_expiry_year">
                                            Expiry Year
                                        </Label>
                                        <Select
                                            value={data.card_expiry_year ?? ''}
                                            onValueChange={(value) =>
                                                setData(
                                                    'card_expiry_year',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger id="card_expiry_year">
                                                <SelectValue placeholder="Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from(
                                                    { length: 21 },
                                                    (_, i) => currentYear + i,
                                                ).map((year) => (
                                                    <SelectItem
                                                        key={year}
                                                        value={year.toString()}
                                                    >
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.card_expiry_year && (
                                            <p className="text-sm text-destructive">
                                                {errors.card_expiry_year}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {data.method_type === 'e_wallet' && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="e_wallet_provider">
                                        E-Wallet Provider
                                    </Label>
                                    <Select
                                        value={
                                            data.e_wallet_provider ?? undefined
                                        }
                                        onValueChange={(value) =>
                                            setData(
                                                'e_wallet_provider',
                                                value as EWalletProvider,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="e_wallet_provider">
                                            <SelectValue placeholder="Select provider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {eWalletProviders.map(
                                                (provider) => (
                                                    <SelectItem
                                                        key={provider.value}
                                                        value={provider.value}
                                                    >
                                                        {provider.label}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.e_wallet_provider && (
                                        <p className="text-sm text-destructive">
                                            {errors.e_wallet_provider}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="e_wallet_identifier">
                                        {selectedEWalletProvider?.value ===
                                            'apple_pay' ||
                                        selectedEWalletProvider?.value ===
                                            'google_pay'
                                            ? 'Email Address'
                                            : 'Phone Number'}
                                    </Label>
                                    <Input
                                        id="e_wallet_identifier"
                                        value={data.e_wallet_identifier ?? ''}
                                        onChange={(e) =>
                                            setData(
                                                'e_wallet_identifier',
                                                e.target.value,
                                            )
                                        }
                                        placeholder={
                                            selectedEWalletProvider?.placeholder ??
                                            '08xxxxxxxxxx'
                                        }
                                    />
                                    {errors.e_wallet_identifier && (
                                        <p className="text-sm text-destructive">
                                            {errors.e_wallet_identifier}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_default"
                                checked={data.is_default}
                                onCheckedChange={(checked) =>
                                    setData('is_default', checked as boolean)
                                }
                            />
                            <Label
                                htmlFor="is_default"
                                className="cursor-pointer text-sm font-normal"
                            >
                                Set as default payment method
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Saving...'
                                : isEditing
                                  ? 'Update Payment Method'
                                  : 'Add Payment Method'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
