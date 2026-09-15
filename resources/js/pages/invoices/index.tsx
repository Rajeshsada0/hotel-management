import { Head, Link, router } from '@inertiajs/react';
import { Receipt, Search, Eye } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Invoice } from '@/types';

type InvoicesIndexProps = {
    invoices: {
        data: Invoice[];
        links: any[];
        total: number;
    };
    filters: {
        status?: string;
        search?: string;
    };
};

export default function InvoicesIndex({ invoices, filters }: InvoicesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/invoices', {
            search: search || null,
            status: status !== 'all' ? status : null,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Invoices & Billing', href: '/invoices' }]}>
            <Head title="Invoices & Billing" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Receipt className="h-6 w-6 text-primary" /> Invoices & Billing Folios
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage guest invoices, payment receipts, and outstanding folio balances.
                    </p>
                </div>

                <Card className="border shadow-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 items-end">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by Invoice # or guest name..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="unpaid">Unpaid</SelectItem>
                                        <SelectItem value="partially_paid">Partially Paid</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit">
                                <Search className="mr-2 h-4 w-4" /> Filter
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="overflow-x-auto rounded-lg border bg-card">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                            <tr>
                                <th className="p-3">Invoice #</th>
                                <th className="p-3">Guest</th>
                                <th className="p-3">Room</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Total Amount</th>
                                <th className="p-3">Paid</th>
                                <th className="p-3">Balance</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {invoices.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                                        No invoices found.
                                    </td>
                                </tr>
                            ) : (
                                invoices.data.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-muted/30">
                                        <td className="p-3 font-semibold text-foreground">
                                            <Link href={`/invoices/${inv.id}`} className="text-primary hover:underline font-mono">
                                                {inv.invoice_number}
                                            </Link>
                                        </td>
                                        <td className="p-3 font-medium text-foreground">{inv.guest?.full_name}</td>
                                        <td className="p-3">
                                            {inv.reservation?.room ? `Room ${inv.reservation.room.room_number}` : '-'}
                                        </td>
                                        <td className="p-3 text-xs text-muted-foreground">{inv.issue_date}</td>
                                        <td className="p-3 font-bold">${Number(inv.total_amount).toFixed(2)}</td>
                                        <td className="p-3 text-emerald-600 font-semibold">${Number(inv.paid_amount).toFixed(2)}</td>
                                        <td className="p-3 font-bold">
                                            {Number(inv.balance ?? 0) > 0 ? (
                                                <span className="text-rose-600">${Number(inv.balance).toFixed(2)}</span>
                                            ) : (
                                                <span className="text-emerald-600">$0.00</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <Badge
                                                variant="outline"
                                                className={`capitalize font-medium ${
                                                    inv.status === 'paid'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                        : inv.status === 'partially_paid'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                                                        : 'bg-rose-50 text-rose-700 border-rose-300'
                                                }`}
                                            >
                                                {inv.status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-right">
                                            <Button size="sm" variant="ghost" asChild>
                                                <Link href={`/invoices/${inv.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
