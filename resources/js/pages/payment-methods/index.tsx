import { destroy } from '@/actions/App/Http/Controllers/PaymentMethodController';
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
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { getColumns } from '@/pages/payment-methods/columns';
import { PaymentMethodFormModal } from '@/pages/payment-methods/payment-method-form-modal';
import { dashboard } from '@/routes';
import {
    BreadcrumbItem,
    PaginatedData,
    PaymentMethod,
    SharedData,
} from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { PlusCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Payment Methods', href: '#' },
];

interface PaymentMethodsIndexProps {
    paymentMethods: PaginatedData<PaymentMethod>;
}

export default function Index({ paymentMethods }: PaymentMethodsIndexProps) {
    const { flash } = usePage<SharedData>().props;
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPaymentMethod, setEditingPaymentMethod] =
        useState<PaymentMethod | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingPaymentMethod, setDeletingPaymentMethod] =
        useState<PaymentMethod | null>(null);

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleCreate = () => {
        setEditingPaymentMethod(null);
        setIsModalOpen(true);
    };

    const handleEdit = (paymentMethod: PaymentMethod) => {
        setEditingPaymentMethod(paymentMethod);
        setIsModalOpen(true);
    };

    const handleDelete = (paymentMethod: PaymentMethod) => {
        setDeletingPaymentMethod(paymentMethod);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (deletingPaymentMethod) {
            router.delete(destroy.url(deletingPaymentMethod.id), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setDeletingPaymentMethod(null);
                },
            });
        }
    };

    const columns = useMemo(
        () => getColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        [],
    );

    const handlePageChange = (page: number) => {
        router.get('/payment-methods', { page }, { preserveScroll: true });
    };

    const handlePageSizeChange = (pageSize: number) => {
        router.get(
            '/payment-methods',
            { per_page: pageSize, page: 1 },
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Methods" />
            <div className="mx-8 my-4">
                <h2 className="my-2 text-xl font-semibold">Payment Methods</h2>
                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <Input
                                type="search"
                                placeholder="Filter by name..."
                                value={
                                    (columnFilters.find((f) => f.id === 'name')
                                        ?.value as string) ?? ''
                                }
                                onChange={(e) =>
                                    setColumnFilters([
                                        { id: 'name', value: e.target.value },
                                    ])
                                }
                                className="w-full sm:w-64"
                            />
                            <Button
                                className="w-full sm:w-auto"
                                onClick={handleCreate}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Payment Method
                            </Button>
                        </div>

                        <div className="grid">
                            <div className="overflow-x-auto">
                                <DataTable
                                    data={paymentMethods.data}
                                    columns={columns}
                                    columnFilters={columnFilters}
                                    onColumnFiltersChange={setColumnFilters}
                                    pageCount={paymentMethods.last_page}
                                    currentPage={paymentMethods.current_page}
                                    pageSize={paymentMethods.per_page}
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageSizeChange}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <PaymentMethodFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                paymentMethod={editingPaymentMethod}
            />

            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete Payment Method
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-semibold">
                                {deletingPaymentMethod?.name}
                            </span>
                            ? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
