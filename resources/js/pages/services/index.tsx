import { destroy } from '@/actions/App/Http/Controllers/ServiceController';
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
import { ServiceFormModal } from '@/pages/services/service-form-modal';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index as servicesIndex } from '@/routes/services';
import {
    type BreadcrumbItem,
    type Category,
    type PaginatedData,
    type Service,
    type ServicesFilters,
} from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ExternalLink,
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
    { title: 'Services', href: servicesIndex().url },
];

interface Props {
    services: PaginatedData<Service>;
    categories: Category[];
    filters: ServicesFilters;
}

interface ServiceCardProps {
    service: Service;
    onEdit: (service: Service) => void;
}

function ServiceCard({ service, onEdit }: ServiceCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    return (
        <>
            <div className="group relative rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
                <div className="flex items-start gap-3">
                    {/* Logo */}
                    <ServiceLogo src={service.logo} alt={service.name} size="sm" />

                    <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium">
                            {service.name}
                        </h4>

                        {service.category && (
                            <div className="mt-1.5 flex items-center gap-1.5">
                                <div
                                    className="h-1 w-1 rounded-full ring-1 ring-background"
                                    style={{ backgroundColor: service.category.color ?? undefined }}
                                />
                                <span className="text-xs text-muted-foreground">
                                    {service.category.name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action menu */}
                    {(service.can_edit || service.can_delete || service.url) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex-shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent">
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                {service.url && (
                                    <DropdownMenuItem asChild>
                                        <a
                                            href={service.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex cursor-pointer items-center"
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Visit
                                        </a>
                                    </DropdownMenuItem>
                                )}
                                {service.can_edit && (
                                    <DropdownMenuItem
                                        onClick={() => onEdit(service)}
                                        className="flex cursor-pointer items-center"
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                {service.can_delete && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => setIsDeleteDialogOpen(true)}
                                            className="text-destructive focus:text-destructive cursor-pointer"
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
            </div>

            {service.can_delete && (
                <DeleteServiceDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    service={service}
                />
            )}
        </>
    );
}

function DeleteServiceDialog({
    open,
    onOpenChange,
    service,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: Service;
}) {
    const handleDelete = () => {
        router.delete(destroy.url(service.id), {
            onSuccess: () => {
                onOpenChange(false);
            },
            preserveScroll: true,
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Service</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete "{service.name}"? This
                        action cannot be undone.
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

type FilterType = 'all' | 'user' | 'system';

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

interface CategoryChipProps {
    category: Category;
    isActive: boolean;
    onClick: () => void;
}

function CategoryChip({ category, isActive, onClick }: CategoryChipProps) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium transition-colors ${
                isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
        >
            <span
                className="h-1.5 w-1.5 rounded-full ring-1 ring-inset ring-background"
                style={{ backgroundColor: category.color ?? undefined }}
            />
            {category.name}
        </button>
    );
}

export default function ServicesIndex({ services, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category ?? '');
    const [typeFilter, setTypeFilter] = useState<FilterType>(
        filters.type === 'user' ? 'user' : filters.type === 'system' ? 'system' : 'all'
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const applyFilters = (overrides?: Record<string, string | number>) => {
        router.get(
            servicesIndex().url,
            {
                search,
                category: categoryFilter,
                type: typeFilter === 'all' ? '' : typeFilter,
                per_page: services.per_page,
                ...overrides,
            },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleSearch = () => {
        applyFilters();
    };

    const handleTypeChange = (type: FilterType) => {
        setTypeFilter(type);
        router.get(
            servicesIndex().url,
            {
                search,
                category: categoryFilter,
                type: type === 'all' ? '' : type,
                per_page: services.per_page,
                page: 1,
            },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleCategoryChange = (categoryId: string) => {
        const newCategory = categoryFilter === categoryId ? '' : categoryId;
        setCategoryFilter(newCategory);
        router.get(
            servicesIndex().url,
            {
                search,
                category: newCategory,
                type: typeFilter === 'all' ? '' : typeFilter,
                per_page: services.per_page,
                page: 1,
            },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            servicesIndex().url,
            {
                page,
                search,
                category: categoryFilter,
                type: typeFilter === 'all' ? '' : typeFilter,
                per_page: services.per_page,
            },
            { preserveScroll: true }
        );
    };

    const handlePageSizeChange = (pageSize: number) => {
        router.get(
            servicesIndex().url,
            {
                page: 1,
                search,
                category: categoryFilter,
                type: typeFilter === 'all' ? '' : typeFilter,
                per_page: pageSize,
            },
            { preserveScroll: true }
        );
    };

    const activeCategory = categories.find((c) => c.id === categoryFilter);

    const handleCreate = () => {
        setEditingService(null);
        setIsModalOpen(true);
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services" />

            <div className="mx-8 my-4">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold">Services</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Browse and manage your subscription services
                    </p>
                </div>

                {/* Search Bar with Add Button */}
                <div className="mb-4 flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search services..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="h-10 pl-10 pr-10"
                        />
                        {search && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    router.get(
                                        servicesIndex().url,
                                        {
                                            search: '',
                                            category: categoryFilter,
                                            type: typeFilter === 'all' ? '' : typeFilter,
                                            per_page: services.per_page,
                                        },
                                        { preserveScroll: true, preserveState: true }
                                    );
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <Button size="default" className="gap-1.5" onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        Add Service
                    </Button>
                </div>

                {/* Filters */}
                <div className="mb-6 space-y-3">
                    {/* Type Filter */}
                    <div className="flex items-center gap-2">
                        <FilterChip
                            label="All"
                            isActive={typeFilter === 'all'}
                            onClick={() => handleTypeChange('all')}
                        />
                        <FilterChip
                            label="My Services"
                            isActive={typeFilter === 'user'}
                            onClick={() => handleTypeChange('user')}
                        />
                        <FilterChip
                            label="Available Services"
                            isActive={typeFilter === 'system'}
                            onClick={() => handleTypeChange('system')}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap items-center gap-2">
                        <CategoryChip
                            key="all"
                            category={{ id: '', name: 'All', description: null, color: null, icon: null, is_system: false, created_at: '', updated_at: '' }}
                            isActive={categoryFilter === ''}
                            onClick={() => handleCategoryChange('')}
                        />
                        {categories.map((category) => (
                            <CategoryChip
                                key={category.id}
                                category={category}
                                isActive={categoryFilter === category.id}
                                onClick={() => handleCategoryChange(category.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Active filters display */}
                {(categoryFilter || typeFilter !== 'all') && (
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                        {typeFilter !== 'all' && (
                            <button
                                onClick={() => handleTypeChange('all')}
                                className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm hover:bg-muted/80"
                            >
                                <span>{typeFilter === 'user' ? 'My Services' : 'Available Services'}</span>
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                        {categoryFilter && activeCategory && (
                            <button
                                onClick={() => handleCategoryChange('')}
                                className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm hover:bg-muted/80"
                            >
                                <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: activeCategory.color ?? undefined }}
                                />
                                {activeCategory.name}
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                        {(categoryFilter || typeFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    handleTypeChange('all');
                                    setCategoryFilter('');
                                    router.get(
                                        servicesIndex().url,
                                        { search, category: '', type: '', per_page: services.per_page, page: 1 },
                                        { preserveScroll: true, preserveState: true }
                                    );
                                }}
                                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                )}

                {/* Services Grid */}
                {services.data.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 py-12 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Search className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">
                            {search || categoryFilter || typeFilter !== 'all' ? 'No services found' : 'No services yet'}
                        </h3>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            {search || categoryFilter || typeFilter !== 'all'
                                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                                : 'Add your first service to start tracking your subscriptions.'}
                        </p>
                        {!search && !categoryFilter && typeFilter === 'all' && (
                            <Button className="mt-4" size="sm" onClick={handleCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Service
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Services Grid */}
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            {services.data.map((service) => (
                                <ServiceCard key={service.id} service={service} onEdit={handleEdit} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {services.last_page > 1 && (
                            <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
                                <p className="text-sm text-muted-foreground">
                                    Showing {services.from} to {services.to} of {services.total} services
                                </p>

                                <div className="flex items-center gap-1">
                                    {/* Previous */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={services.current_page === 1}
                                        onClick={() => handlePageChange(services.current_page - 1)}
                                        className="h-8"
                                    >
                                        Previous
                                    </Button>

                                    {/* Page numbers */}
                                    {Array.from({ length: Math.min(5, services.last_page) }, (_, i) => {
                                        let pageNum;
                                        if (services.last_page <= 5) {
                                            pageNum = i + 1;
                                        } else if (services.current_page <= 3) {
                                            pageNum = i + 1;
                                        } else if (services.current_page >= services.last_page - 2) {
                                            pageNum = services.last_page - 4 + i;
                                        } else {
                                            pageNum = services.current_page - 2 + i;
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={services.current_page === pageNum ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum)}
                                                className="h-8 w-8 p-0"
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}

                                    {/* Next */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={services.current_page === services.last_page}
                                        onClick={() => handlePageChange(services.current_page + 1)}
                                        className="h-8"
                                    >
                                        Next
                                    </Button>
                                </div>

                                {/* Page size selector */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Show</span>
                                    <select
                                        value={services.per_page}
                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                        className="h-8 rounded-md border bg-background px-2 py-1 text-sm"
                                    >
                                        <option value="12">12</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                    <span className="text-sm text-muted-foreground">per page</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ServiceFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                service={editingService}
                categories={categories}
            />
        </AppLayout>
    );
}
