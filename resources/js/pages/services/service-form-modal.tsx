import {
    store,
    update,
} from '@/actions/App/Http/Controllers/ServiceController';
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
import { Category, Service } from '@/types';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface ServiceFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service?: Service | null;
    categories: Category[];
}

export function ServiceFormModal({
    open,
    onOpenChange,
    service,
    categories,
}: ServiceFormModalProps) {
    const isEditing = !!service;
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: service?.name ?? '',
        url: service?.url ?? '',
        category_id: service?.category?.id ?? '',
    });

    useEffect(() => {
        if (open) {
            setData({
                name: service?.name ?? '',
                url: service?.url ?? '',
                category_id: service?.category?.id ?? '',
            });
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && service) {
            put(update.url(service.id), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post(store.url(), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Service' : 'Add Service'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the service details below.'
                            : 'Add a custom subscription service. The logo will be automatically fetched from the official website URL.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {isEditing && service?.logo && (
                            <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-3">
                                <ServiceLogo
                                    src={service.logo}
                                    alt={service.name}
                                    size="md"
                                />
                                <div>
                                    <p className="text-sm font-medium">
                                        Current Logo
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Fetched from: {service.url || 'No URL set'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="name">Service Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g., ChatGPT Plus"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="url">Official Website URL</Label>
                            <Input
                                id="url"
                                type="url"
                                value={data.url}
                                onChange={(e) => setData('url', e.target.value)}
                                placeholder="https://example.com"
                            />
                            <p className="text-xs text-muted-foreground">
                                The official website domain is used to
                                automatically fetch the service logo. Use the
                                main domain (e.g., https://openai.com, not
                                https://chat.openai.com).
                            </p>
                            {errors.url && (
                                <p className="text-sm text-destructive">
                                    {errors.url}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setCategoryOpen(!categoryOpen)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {data.category_id
                                        ? categories.find(
                                              (c) => c.id === data.category_id
                                          )?.name
                                        : 'Select a category'}
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 opacity-50 transition-transform',
                                            categoryOpen && 'transform rotate-180'
                                        )}
                                    />
                                </button>

                                {categoryOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setCategoryOpen(false)}
                                        />
                                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                                            <div className="p-1">
                                                <input
                                                    type="text"
                                                    placeholder="Search category..."
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    value={categorySearch}
                                                    onChange={(e) =>
                                                        setCategorySearch(
                                                            e.target.value
                                                        )
                                                    }
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="max-h-48 overflow-y-auto p-1">
                                                {categories
                                                    .filter((c) =>
                                                        c.name
                                                            .toLowerCase()
                                                            .includes(
                                                                categorySearch.toLowerCase()
                                                            )
                                                    )
                                                    .map((category) => (
                                                        <button
                                                            key={category.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setData(
                                                                    'category_id',
                                                                    category.id
                                                                );
                                                                setCategoryOpen(
                                                                    false
                                                                );
                                                                setCategorySearch(
                                                                    ''
                                                                );
                                                            }}
                                                            className={cn(
                                                                'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                                                                data.category_id ===
                                                                    category.id &&
                                                                    'bg-accent text-accent-foreground'
                                                            )}
                                                        >
                                                            <div
                                                                className="h-2 w-2 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        category.color ??
                                                                        undefined,
                                                                }}
                                                            />
                                                            {category.name}
                                                            {data.category_id ===
                                                                category.id && (
                                                                <Check className="ml-auto h-4 w-4" />
                                                            )}
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            {errors.category_id && (
                                <p className="text-sm text-destructive">
                                    {errors.category_id}
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
                                  : 'Add Service'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
