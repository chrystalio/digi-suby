import {
    store,
    update,
} from '@/actions/App/Http/Controllers/SubscriptionController';
import { Button } from '@/components/ui/button';
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
import { ServiceLogo } from '@/components/ui/service-logo';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
    CURRENCY_OPTIONS,
    INTERVAL_OPTIONS,
    STATUS_OPTIONS,
} from '@/lib/subscription-options';
import {
    type PaymentMethod,
    type Service,
    type Subscription,
    type SubscriptionFormData,
} from '@/types';
import { useForm } from '@inertiajs/react';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SubscriptionFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscription?: Subscription | null;
    services: Service[];
    paymentMethods: PaymentMethod[];
}

const todayIso = (): string => new Date().toISOString().slice(0, 10);

const blankForm = (): SubscriptionFormData => ({
    service_id: '',
    payment_method_id: '',
    name: '',
    amount: '',
    currency: 'USD',
    interval: 'monthly',
    status: 'active',
    next_billing_date: '',
    started_at: todayIso(),
    trial_ends_at: '',
    notes: '',
});

const fromSubscription = (s: Subscription): SubscriptionFormData => ({
    service_id: s.service?.id ?? '',
    payment_method_id: s.payment_method?.id ?? '',
    name: s.name,
    amount: s.amount,
    currency: s.currency,
    interval: s.interval,
    status: s.status,
    next_billing_date: s.next_billing_date ?? '',
    started_at: s.started_at ?? todayIso(),
    trial_ends_at: s.trial_ends_at ?? '',
    notes: s.notes ?? '',
});

export function SubscriptionFormModal({
    open,
    onOpenChange,
    subscription,
    services,
    paymentMethods,
}: SubscriptionFormModalProps) {
    const isEditing = !!subscription;

    const { data, setData, post, put, processing, errors, reset } =
        useForm<SubscriptionFormData>(blankForm());

    const [serviceOpen, setServiceOpen] = useState(false);
    const [paymentMethodOpen, setPaymentMethodOpen] = useState(false);

    const selectedService =
        services.find((s) => s.id === data.service_id) ?? null;
    const selectedPaymentMethod =
        paymentMethods.find((pm) => pm.id === data.payment_method_id) ?? null;

    useEffect(() => {
        if (open) {
            setData(subscription ? fromSubscription(subscription) : blankForm());
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, subscription?.id]);

    // Lifetime plans have no recurring billing date — clear it on interval change.
    useEffect(() => {
        if (data.interval === 'lifetime' && data.next_billing_date !== '') {
            setData('next_billing_date', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.interval]);

    // Trial end date only makes sense while status is 'trial'.
    useEffect(() => {
        if (data.status !== 'trial' && data.trial_ends_at !== null) {
            setData('trial_ends_at', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.status]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...data,
            payment_method_id: data.payment_method_id || null,
            trial_ends_at: data.trial_ends_at || null,
            next_billing_date: data.next_billing_date || null,
        };

        if (isEditing && subscription) {
            put(update.url(subscription.id), {
                ...payload,
                onSuccess: () => onOpenChange(false),
            });
        } else {
            post(store.url(), {
                ...payload,
                onSuccess: () => onOpenChange(false),
            });
        }
    };

    const isLifetime = data.interval === 'lifetime';
    const isTrial = data.status === 'trial';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Subscription' : 'Add Subscription'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the subscription details below.'
                            : 'Track a recurring expense by linking it to a service and a payment method.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Subscription Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g., Netflix Premium"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="service_id">Service</Label>
                            <div className="relative">
                                <button
                                    type="button"
                                    id="service_id"
                                    onClick={() => setServiceOpen(!serviceOpen)}
                                    className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <span className="flex min-w-0 items-center gap-2">
                                        {selectedService ? (
                                            <>
                                                <ServiceLogo
                                                    src={selectedService.logo}
                                                    alt={selectedService.name}
                                                    size="xs"
                                                />
                                                <span className="truncate">
                                                    {selectedService.name}
                                                    {selectedService.is_system
                                                        ? ' (System)'
                                                        : ''}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                Select a service
                                            </span>
                                        )}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 flex-shrink-0 opacity-50 transition-transform',
                                            serviceOpen && 'rotate-180',
                                        )}
                                    />
                                </button>
                                {serviceOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setServiceOpen(false)}
                                        />
                                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                                            <div className="max-h-48 overflow-y-auto p-1">
                                                {services.map((service) => (
                                                    <button
                                                        key={service.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setData(
                                                                'service_id',
                                                                service.id,
                                                            );
                                                            setServiceOpen(
                                                                false,
                                                            );
                                                        }}
                                                        className={cn(
                                                            'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                                                            data.service_id ===
                                                                service.id &&
                                                                'bg-accent text-accent-foreground',
                                                        )}
                                                    >
                                                        <ServiceLogo
                                                            src={service.logo}
                                                            alt={service.name}
                                                            size="xs"
                                                        />
                                                        <span className="truncate">
                                                            {service.name}
                                                            {service.is_system
                                                                ? ' (System)'
                                                                : ''}
                                                        </span>
                                                        {data.service_id ===
                                                            service.id && (
                                                            <Check className="ml-auto h-4 w-4" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            {errors.service_id && (
                                <p className="text-sm text-destructive">
                                    {errors.service_id}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="payment_method_id">
                                Payment Method{' '}
                                <span className="text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <div className="relative">
                                <button
                                    type="button"
                                    id="payment_method_id"
                                    onClick={() =>
                                        setPaymentMethodOpen(!paymentMethodOpen)
                                    }
                                    className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <span className="flex min-w-0 items-center gap-2">
                                        {selectedPaymentMethod ? (
                                            <>
                                                <ServiceLogo
                                                    src={
                                                        selectedPaymentMethod.logo_url
                                                    }
                                                    alt={
                                                        selectedPaymentMethod.name
                                                    }
                                                    size="xs"
                                                />
                                                <span className="truncate">
                                                    {
                                                        selectedPaymentMethod.name
                                                    }
                                                    {selectedPaymentMethod.card_last_four
                                                        ? ` •••• ${selectedPaymentMethod.card_last_four}`
                                                        : ''}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                None
                                            </span>
                                        )}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 flex-shrink-0 opacity-50 transition-transform',
                                            paymentMethodOpen && 'rotate-180',
                                        )}
                                    />
                                </button>
                                {paymentMethodOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() =>
                                                setPaymentMethodOpen(false)
                                            }
                                        />
                                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                                            <div className="max-h-48 overflow-y-auto p-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setData(
                                                            'payment_method_id',
                                                            '',
                                                        );
                                                        setPaymentMethodOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className={cn(
                                                        'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                                                        data.payment_method_id ===
                                                            '' &&
                                                            'bg-accent text-accent-foreground',
                                                    )}
                                                >
                                                    <span className="text-muted-foreground">
                                                        None
                                                    </span>
                                                    {data.payment_method_id ===
                                                        '' && (
                                                        <Check className="ml-auto h-4 w-4" />
                                                    )}
                                                </button>
                                                {paymentMethods.map((pm) => (
                                                    <button
                                                        key={pm.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setData(
                                                                'payment_method_id',
                                                                pm.id,
                                                            );
                                                            setPaymentMethodOpen(
                                                                false,
                                                            );
                                                        }}
                                                        className={cn(
                                                            'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                                                            data.payment_method_id ===
                                                                pm.id &&
                                                                'bg-accent text-accent-foreground',
                                                        )}
                                                    >
                                                        <ServiceLogo
                                                            src={pm.logo_url}
                                                            alt={pm.name}
                                                            size="xs"
                                                        />
                                                        <span className="truncate">
                                                            {pm.name}
                                                            {pm.card_last_four
                                                                ? ` •••• ${pm.card_last_four}`
                                                                : ''}
                                                        </span>
                                                        {data.payment_method_id ===
                                                            pm.id && (
                                                            <Check className="ml-auto h-4 w-4" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            {errors.payment_method_id && (
                                <p className="text-sm text-destructive">
                                    {errors.payment_method_id}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.amount}
                                    onChange={(e) =>
                                        setData('amount', e.target.value)
                                    }
                                    placeholder="9.99"
                                />
                                {errors.amount && (
                                    <p className="text-sm text-destructive">
                                        {errors.amount}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    value={data.currency}
                                    onValueChange={(value) =>
                                        setData(
                                            'currency',
                                            value as SubscriptionFormData['currency'],
                                        )
                                    }
                                >
                                    <SelectTrigger id="currency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CURRENCY_OPTIONS.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="interval">Interval</Label>
                                <Select
                                    value={data.interval}
                                    onValueChange={(value) =>
                                        setData(
                                            'interval',
                                            value as SubscriptionFormData['interval'],
                                        )
                                    }
                                >
                                    <SelectTrigger id="interval">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INTERVAL_OPTIONS.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData(
                                            'status',
                                            value as SubscriptionFormData['status'],
                                        )
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="started_at">Started At</Label>
                                <Input
                                    id="started_at"
                                    type="date"
                                    value={data.started_at}
                                    onChange={(e) =>
                                        setData('started_at', e.target.value)
                                    }
                                />
                                {errors.started_at && (
                                    <p className="text-sm text-destructive">
                                        {errors.started_at}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="next_billing_date">
                                    Next Billing Date
                                </Label>
                                <Input
                                    id="next_billing_date"
                                    type="date"
                                    value={data.next_billing_date ?? ''}
                                    disabled={isLifetime}
                                    onChange={(e) =>
                                        setData(
                                            'next_billing_date',
                                            e.target.value,
                                        )
                                    }
                                />
                                {isLifetime && (
                                    <p className="text-xs text-muted-foreground">
                                        Lifetime plans do not recur.
                                    </p>
                                )}
                                {errors.next_billing_date && (
                                    <p className="text-sm text-destructive">
                                        {errors.next_billing_date}
                                    </p>
                                )}
                            </div>
                        </div>

                        {isTrial && (
                            <div className="grid gap-2">
                                <Label htmlFor="trial_ends_at">
                                    Trial Ends At
                                </Label>
                                <Input
                                    id="trial_ends_at"
                                    type="date"
                                    value={data.trial_ends_at ?? ''}
                                    onChange={(e) =>
                                        setData('trial_ends_at', e.target.value)
                                    }
                                />
                                {errors.trial_ends_at && (
                                    <p className="text-sm text-destructive">
                                        {errors.trial_ends_at}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                placeholder="Plan tier, seat count, or anything else worth remembering."
                                rows={3}
                            />
                            {errors.notes && (
                                <p className="text-sm text-destructive">
                                    {errors.notes}
                                </p>
                            )}
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
                                    ? 'Save Changes'
                                    : 'Add Subscription'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
