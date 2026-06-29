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
import { Badge } from '@/components/ui/badge';
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

function statusVariant(
    status: Subscription['status'],
): 'default' | 'secondary' | 'outline' {
    if (status === 'active') return 'default';
    if (status === 'trial') return 'secondary';
    return 'outline';
}

interface SubscriptionCardProps {
    subscription: Subscription;
    onEdit: (subscription: Subscription) => void;
}

function SubscriptionCard({ subscription, onEdit }: SubscriptionCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    return (
        <>
            <div className="group relative rounded-xl border bg-card p-4 transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring">
                <div className="flex items-start gap-3">
                    <ServiceLogo
                        src={subscription.service?.logo ?? null}
                        alt={subscription.service?.name ?? subscription.name}
                        size="sm"
                    />

                    <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium">
                            {subscription.name}
                        </h4>
                        {subscription.service && (
                            <p className="truncate text-xs text-muted-foreground">
                                {subscription.service.name}
                            </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <Badge variant={statusVariant(subscription.status)}>
                                {subscription.status}
                            </Badge>
                            {subscription.is_trial_ending_soon && (
                                <Badge variant="secondary">
                                    <CalendarClock className="mr-1 h-3 w-3" />
                                    trial ends soon
                                </Badge>
                            )}
                            {subscription.is_renewing_soon && (
                                <Badge>renewing soon</Badge>
                            )}
                        </div>
                    </div>

                    {(subscription.can_edit || subscription.can_delete) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex-shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 hover:bg-accent">
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

                <div className="mt-3 flex items-end justify-between">
                    <span className="text-lg font-semibold">
                        {subscription.display_amount}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        / {subscription.interval}
                    </span>
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                    {subscription.is_lifetime ? (
                        <span>Lifetime — no recurring charge</span>
                    ) : subscription.is_cancelled ? (
                        <span>
                            Cancelled
                            {subscription.cancelled_at &&
                                ` on ${subscription.cancelled_at}`}
                        </span>
                    ) : subscription.next_billing_date ? (
                        <span>
                            Next billing {subscription.next_billing_date}
                            {subscription.days_until_next_billing !== null && (
                                <>
                                    {' '}
                                    ·{' '}
                                    {subscription.days_until_next_billing <= 0
                                        ? 'today'
                                        : `in ${subscription.days_until_next_billing} day${subscription.days_until_next_billing === 1 ? '' : 's'}`}
                                </>
                            )}
                        </span>
                    ) : (
                        <span>No upcoming billing</span>
                    )}
                </div>
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
            <Head title="Subscriptions" />

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
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
