import { destroy } from '@/actions/App/Http/Controllers/SubscriptionController';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ServiceLogo } from '@/components/ui/service-logo';
import { SubscriptionFormModal } from '@/pages/subscriptions/subscription-form-modal';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index as subscriptionsIndex } from '@/routes/subscriptions';
import {
    type BreadcrumbItem,
    type PaginatedData,
    type PaymentMethod,
    type Service,
    type Subscription,
    type SubscriptionsFilters,
} from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    CalendarClock,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Subscriptions', href: subscriptionsIndex().url },
];

interface Props {
    subscriptions: PaginatedData<Subscription>;
    services: Service[];
    paymentMethods: PaymentMethod[];
    filters: SubscriptionsFilters;
}

interface SubscriptionCardProps {
    subscription: Subscription;
    onEdit: (subscription: Subscription) => void;
}

// Status palette — sophisticated, not loud. Used as solid colors so the
// card body stays calm (cream paper) and the band pops as a single stripe.
const STATUS_PALETTE: Record<
    string,
    { band: string; accent: string; label: string }
> = {
    active: { band: '#065F46', accent: '#10B981', label: 'Active' },
    trial: { band: '#1E40AF', accent: '#3B82F6', label: 'Trial' },
    cancelled: { band: '#9A3412', accent: '#EA580C', label: 'Cancelled' },
};

const DISPLAY_FONT =
    "'Fraunces', ui-serif, Georgia, 'Times New Roman', serif";

function StatusPill({
    accent,
    color,
    children,
}: {
    accent: string;
    color: string;
    children: React.ReactNode;
}) {
    return (
        <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ backgroundColor: `${accent}1f`, color }}
        >
            {children}
        </span>
    );
}

function ReceiptRow({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {label}
            </span>
            <span className="flex min-w-0 items-center gap-1.5 text-right text-xs font-medium text-foreground tabular-nums">
                {children}
            </span>
        </div>
    );
}

function SubscriptionCard({ subscription, onEdit }: SubscriptionCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const palette =
        STATUS_PALETTE[subscription.status] ?? {
            band: '#1E293B',
            accent: '#64748B',
            label: subscription.status,
        };

    const startedAt = subscription.started_at;

    return (
        <>
            <div
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 shadow-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-xl focus-within:ring-2 focus-within:ring-ring"
                style={{
                    background:
                        'linear-gradient(180deg, #FAFAF7 0%, #F4F1EA 100%)',
                }}
            >
                {/* Status spine — 6px colored stripe across the top */}
                <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: palette.band }}
                />

                {/* Header band — service identity on dark */}
                <div
                    className="relative flex items-center justify-between gap-2 px-4 py-2.5 text-white"
                    style={{ backgroundColor: palette.band }}
                >
                    <div className="flex min-w-0 items-center gap-2.5">
                        <ServiceLogo
                            src={subscription.service?.logo ?? null}
                            alt={
                                subscription.service?.name ?? subscription.name
                            }
                            size="xs"
                            className="ring-1 ring-white/25"
                        />
                        <div className="min-w-0">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/60">
                                {palette.label}
                            </p>
                            <h3 className="truncate text-[13px] font-semibold leading-tight">
                                {subscription.service?.name ??
                                    subscription.name}
                            </h3>
                        </div>
                    </div>

                    {(subscription.can_edit || subscription.can_delete) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    aria-label="Subscription actions"
                                    className="rounded-md p-1 text-white/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 hover:bg-white/10 hover:text-white"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                {subscription.can_edit && (
                                    <DropdownMenuItem
                                        onClick={() => onEdit(subscription)}
                                        className="flex cursor-pointer items-center"
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                {subscription.can_delete && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() =>
                                                setIsDeleteDialogOpen(true)
                                            }
                                            className="cursor-pointer text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Hero — the amount, in display serif. Italic for character. */}
                <div className="px-5 pb-3 pt-5">
                    <div className="flex items-baseline gap-1.5">
                        <span
                            className="text-[44px] font-semibold leading-none tracking-tight tabular-nums"
                            style={{
                                fontFamily: DISPLAY_FONT,
                                fontStyle: 'italic',
                                color: palette.band,
                            }}
                        >
                            {subscription.display_amount}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                            / {subscription.interval}
                        </span>
                    </div>
                    {subscription.service &&
                        subscription.name !== subscription.service.name && (
                            <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                                {subscription.name}
                            </p>
                        )}
                </div>

                {/* Hairline rule */}
                <div
                    className="mx-5 h-px"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.08)' }}
                />

                {/* Receipt-style metadata rows */}
                <div className="space-y-1.5 px-5 py-3">
                    <ReceiptRow label="Renews">
                        {subscription.is_lifetime ? (
                            <span className="font-medium italic text-muted-foreground">
                                Lifetime
                            </span>
                        ) : subscription.is_cancelled ? (
                            <span className="font-medium italic text-muted-foreground">
                                Cancelled
                            </span>
                        ) : subscription.next_billing_date ? (
                            <>
                                <span>{subscription.next_billing_date}</span>
                                {subscription.days_until_next_billing !==
                                    null && (
                                    <span className="text-muted-foreground">
                                        · in{' '}
                                        {subscription.days_until_next_billing}
                                        d
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-muted-foreground">—</span>
                        )}
                    </ReceiptRow>

                    {subscription.payment_method && (
                        <ReceiptRow label="Payment">
                            <span className="truncate">
                                {subscription.payment_method.name}
                            </span>
                            {subscription.payment_method.card_last_four && (
                                <span className="text-muted-foreground tabular-nums">
                                    •• {subscription.payment_method.card_last_four}
                                </span>
                            )}
                        </ReceiptRow>
                    )}

                    {startedAt && !subscription.is_cancelled && (
                        <ReceiptRow label="Since">
                            <span className="tabular-nums">{startedAt}</span>
                        </ReceiptRow>
                    )}
                </div>

                {/* Urgency pills — bottom of card, only when relevant */}
                {(subscription.is_trial_ending_soon ||
                    subscription.is_renewing_soon) && (
                    <div className="flex flex-wrap items-center gap-1.5 px-5 pb-4">
                        {subscription.is_trial_ending_soon && (
                            <StatusPill
                                accent={palette.accent}
                                color={palette.band}
                            >
                                <CalendarClock className="h-3 w-3" />
                                Trial ends soon
                            </StatusPill>
                        )}
                        {subscription.is_renewing_soon && (
                            <StatusPill
                                accent={palette.accent}
                                color={palette.band}
                            >
                                Renewing soon
                            </StatusPill>
                        )}
                    </div>
                )}
            </div>

            {subscription.can_delete && (
                <DeleteSubscriptionDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    subscription={subscription}
                />
            )}
        </>
    );
}

function DeleteSubscriptionDialog({
    open,
    onOpenChange,
    subscription,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscription: Subscription;
}) {
    const handleDelete = () => {
        router.delete(destroy.url(subscription.id), {
            onSuccess: () => onOpenChange(false),
            preserveScroll: true,
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete "{subscription.name}"?
                        This soft-deletes the record but keeps its history.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-white hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

type StatusFilter = '' | 'active' | 'trial' | 'cancelled';

interface FilterChipProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

function FilterChip({ label, isActive, onClick }: FilterChipProps) {
    return (
        <button
            onClick={onClick}
            className={`rounded-lg px-2.5 py-1 text-sm font-medium transition-colors ${
                isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
        >
            {label}
        </button>
    );
}

export default function SubscriptionsIndex({
    subscriptions,
    services,
    paymentMethods,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>((filters.status as StatusFilter) ?? '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] =
        useState<Subscription | null>(null);

    const applyFilters = (
        overrides?: Partial<Record<string, string | number>>,
    ) => {
        router.get(
            subscriptionsIndex().url,
            {
                search,
                status: statusFilter,
                per_page: subscriptions.per_page,
                ...overrides,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleSearch = () => {
        applyFilters();
    };

    const handleStatusChange = (status: StatusFilter) => {
        setStatusFilter(status);
        router.get(
            subscriptionsIndex().url,
            {
                search,
                status,
                per_page: subscriptions.per_page,
                page: 1,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            subscriptionsIndex().url,
            {
                page,
                search,
                status: statusFilter,
                per_page: subscriptions.per_page,
            },
            { preserveScroll: true },
        );
    };

    const handlePageSizeChange = (pageSize: number) => {
        router.get(
            subscriptionsIndex().url,
            {
                page: 1,
                search,
                status: statusFilter,
                per_page: pageSize,
            },
            { preserveScroll: true },
        );
    };

    const handleCreate = () => {
        setEditingSubscription(null);
        setIsModalOpen(true);
    };

    const handleEdit = (subscription: Subscription) => {
        setEditingSubscription(subscription);
        setIsModalOpen(true);
    };

    const isFiltered = search !== '' || statusFilter !== '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscriptions">
                <link
                    rel="preconnect"
                    href="https://fonts.bunny.net"
                    crossOrigin=""
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.bunny.net/css?family=fraunces:400,600,700,400i,700i&display=swap"
                />
            </Head>

            <div className="mx-8 my-4">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold">Subscriptions</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Track your recurring services, their cost, and when
                        they bill next.
                    </p>
                </div>

                <div className="mb-4 flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search subscriptions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleSearch()
                            }
                            className="h-10 pl-10 pr-10"
                        />
                        {search && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    router.get(
                                        subscriptionsIndex().url,
                                        {
                                            search: '',
                                            status: statusFilter,
                                            per_page: subscriptions.per_page,
                                        },
                                        {
                                            preserveScroll: true,
                                            preserveState: true,
                                        },
                                    );
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <Button
                        size="default"
                        className="gap-1.5"
                        onClick={handleCreate}
                    >
                        <Plus className="h-4 w-4" />
                        Add Subscription
                    </Button>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-2">
                    <FilterChip
                        label="All"
                        isActive={statusFilter === ''}
                        onClick={() => handleStatusChange('')}
                    />
                    <FilterChip
                        label="Active"
                        isActive={statusFilter === 'active'}
                        onClick={() => handleStatusChange('active')}
                    />
                    <FilterChip
                        label="Trial"
                        isActive={statusFilter === 'trial'}
                        onClick={() => handleStatusChange('trial')}
                    />
                    <FilterChip
                        label="Cancelled"
                        isActive={statusFilter === 'cancelled'}
                        onClick={() => handleStatusChange('cancelled')}
                    />
                </div>

                {isFiltered && (
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                        {search && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    router.get(
                                        subscriptionsIndex().url,
                                        {
                                            search: '',
                                            status: statusFilter,
                                            per_page: subscriptions.per_page,
                                        },
                                        { preserveScroll: true },
                                    );
                                }}
                                className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm hover:bg-muted/80"
                            >
                                "{search}"
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                        {statusFilter && (
                            <button
                                onClick={() => handleStatusChange('')}
                                className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm hover:bg-muted/80"
                            >
                                {statusFilter}
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setSearch('');
                                setStatusFilter('');
                                router.get(
                                    subscriptionsIndex().url,
                                    {
                                        search: '',
                                        status: '',
                                        per_page: subscriptions.per_page,
                                        page: 1,
                                    },
                                    { preserveScroll: true },
                                );
                            }}
                            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {subscriptions.data.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 py-12 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <CalendarClock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">
                            {isFiltered
                                ? 'No subscriptions match'
                                : 'No subscriptions yet'}
                        </h3>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            {isFiltered
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : 'Add your first subscription to start tracking recurring spend.'}
                        </p>
                        {!isFiltered && (
                            <Button
                                className="mt-4"
                                size="sm"
                                onClick={handleCreate}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Subscription
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {subscriptions.data.map((subscription) => (
                                <SubscriptionCard
                                    key={subscription.id}
                                    subscription={subscription}
                                    onEdit={handleEdit}
                                />
                            ))}
                        </div>

                        {subscriptions.last_page > 1 && (
                            <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
                                <p className="text-sm text-muted-foreground">
                                    Showing {subscriptions.from} to{' '}
                                    {subscriptions.to} of {subscriptions.total}{' '}
                                    subscriptions
                                </p>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            subscriptions.current_page === 1
                                        }
                                        onClick={() =>
                                            handlePageChange(
                                                subscriptions.current_page -
                                                    1,
                                            )
                                        }
                                        className="h-8"
                                    >
                                        Previous
                                    </Button>

                                    {Array.from(
                                        { length: Math.min(5, subscriptions.last_page) },
                                        (_, i) => {
                                            let pageNum;
                                            if (
                                                subscriptions.last_page <= 5
                                            ) {
                                                pageNum = i + 1;
                                            } else if (
                                                subscriptions.current_page <=
                                                3
                                            ) {
                                                pageNum = i + 1;
                                            } else if (
                                                subscriptions.current_page >=
                                                subscriptions.last_page - 2
                                            ) {
                                                pageNum =
                                                    subscriptions.last_page -
                                                    4 + i;
                                            } else {
                                                pageNum =
                                                    subscriptions.current_page -
                                                    2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={
                                                        subscriptions.current_page ===
                                                        pageNum
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        handlePageChange(pageNum)
                                                    }
                                                    className="h-8 w-8 p-0"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        },
                                    )}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            subscriptions.current_page ===
                                            subscriptions.last_page
                                        }
                                        onClick={() =>
                                            handlePageChange(
                                                subscriptions.current_page +
                                                    1,
                                            )
                                        }
                                        className="h-8"
                                    >
                                        Next
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        Show
                                    </span>
                                    <select
                                        value={subscriptions.per_page}
                                        onChange={(e) =>
                                            handlePageSizeChange(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="h-8 rounded-md border bg-background px-2 py-1 text-sm"
                                    >
                                        <option value="12">12</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                    <span className="text-sm text-muted-foreground">
                                        per page
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <SubscriptionFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                subscription={editingSubscription}
                services={services}
                paymentMethods={paymentMethods}
            />
        </AppLayout>
    );
}
