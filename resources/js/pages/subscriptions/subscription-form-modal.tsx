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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    CURRENCY_OPTIONS,
    INTERVAL_OPTIONS,
    STATUS_OPTIONS,
    type PaymentMethod,
    type Service,
    type Subscription,
    type SubscriptionFormData,
} from '@/types';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

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
                            <Select
                                value={data.service_id || undefined}
                                onValueChange={(value) =>
                                    setData('service_id', value)
                                }
                            >
                                <SelectTrigger id="service_id">
                                    <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map((service) => (
                                        <SelectItem
                                            key={service.id}
                                            value={service.id}
                                        >
                                            {service.name}
                                            {service.is_system ? ' (System)' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            <Select
                                value={data.payment_method_id || 'none'}
                                onValueChange={(value) =>
                                    setData(
                                        'payment_method_id',
                                        value === 'none' ? '' : value,
                                    )
                                }
                            >
                                <SelectTrigger id="payment_method_id">
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        None
                                    </SelectItem>
                                    {paymentMethods.map((pm) => (
                                        <SelectItem key={pm.id} value={pm.id}>
                                            {pm.name}
                                            {pm.card_last_four
                                                ? ` •••• ${pm.card_last_four}`
                                                : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                                {opt.symbol} {opt.value}
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
