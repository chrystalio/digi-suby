import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { getCardLogoUrl } from '@/lib/card-detection';
import { PaymentMethod } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Star, Trash2 } from 'lucide-react';

interface GetColumnsProps {
    onEdit: (paymentMethod: PaymentMethod) => void;
    onDelete: (paymentMethod: PaymentMethod) => void;
    onSetDefault: (paymentMethod: PaymentMethod) => void;
}

export function getColumns({
    onEdit,
    onDelete,
    onSetDefault,
}: GetColumnsProps): ColumnDef<PaymentMethod>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Payment Method',
            cell: ({ row }) => {
                const method = row.original;
                const logoUrl =
                    method.method_type === 'card' && method.card_category
                        ? getCardLogoUrl(method.card_category)
                        : method.logo_url;

                // Use smaller size for e-wallets (they have more whitespace)
                const logoSize =
                    method.method_type === 'card' ? 'h-9 w-9' : 'h-5 w-5';

                return (
                    <div className="flex items-center gap-4">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted/30">
                            <img
                                src={logoUrl}
                                alt={method.type_label}
                                className={`${logoSize} object-contain`}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent =
                                        e.currentTarget.parentElement;
                                    if (parent) {
                                        const icon =
                                            document.createElement('div');
                                        icon.className =
                                            'text-muted-foreground';
                                        icon.innerHTML =
                                            method.method_type === 'card'
                                                ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>'
                                                : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>';
                                        parent.appendChild(icon);
                                    }
                                }}
                            />
                            {method.is_default && (
                                <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 shadow-sm">
                                    <Star className="h-3 w-3 fill-white text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="truncate font-semibold text-foreground">
                                    {method.name}
                                </span>
                                {method.method_type === 'card' &&
                                    method.card_type && (
                                        <Badge
                                            variant="outline"
                                            className="shrink-0 text-xs font-normal capitalize"
                                        >
                                            {method.card_type}
                                        </Badge>
                                    )}
                            </div>
                            <div className="flex items-center gap-2">
                                {method.method_type === 'card' &&
                                method.card_last_four ? (
                                    <span className="font-mono text-sm text-muted-foreground">
                                        •••• •••• •••• {method.card_last_four}
                                    </span>
                                ) : (
                                    <>
                                        <span className="text-xs text-muted-foreground">
                                            {method.type_label}
                                        </span>
                                        {method.display_identifier && (
                                            <>
                                                <span className="text-xs text-muted-foreground">
                                                    •
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {method.display_identifier}
                                                </span>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'method_type',
            header: 'Type',
            cell: ({ row }) => {
                const method = row.original;
                return (
                    <Badge variant="outline" className="capitalize">
                        {method.method_type === 'card' ? 'Card' : 'E-Wallet'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'expiry',
            header: 'Expiry',
            cell: ({ row }) => {
                const method = row.original;
                if (method.method_type !== 'card' || !method.expiry) {
                    return <span className="text-muted-foreground">-</span>;
                }

                const isExpired =
                    method.card_expiry_year && method.card_expiry_month
                        ? new Date(
                              method.card_expiry_year,
                              method.card_expiry_month - 1,
                          ) < new Date()
                        : false;

                const expiryText = (
                    <span
                        className={
                            isExpired
                                ? 'font-medium text-destructive'
                                : 'text-foreground'
                        }
                    >
                        {method.expiry}
                    </span>
                );

                if (isExpired) {
                    return (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                {expiryText}
                            </TooltipTrigger>
                            <TooltipContent>
                                This card has expired
                            </TooltipContent>
                        </Tooltip>
                    );
                }

                return expiryText;
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const method = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {!method.is_default && (
                                <DropdownMenuItem
                                    onClick={() => onSetDefault(method)}
                                >
                                    <Star className="mr-2 h-4 w-4" />
                                    Set as Default
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onEdit(method)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(method)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}
