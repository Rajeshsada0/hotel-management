import { Head, Link, router } from '@inertiajs/react';
import {
    Receipt,
    Search,
    Eye,
    CheckCircle2,
    Clock,
    DollarSign,
    BarChart3,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHero } from '@/components/page-hero';
import { StatCard } from '@/components/stat-card';
import AppLayout from '@/layouts/app-layout';
import type { Invoice, PaymentStatus } from '@/types';

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

const invoiceStatusStyles: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
    partially_paid: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
    unpaid: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300',
    refunded: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
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

    const paidCount = invoices.data.filter((i) => i.status === 'paid').length;
    const unpaidCount = invoices.data.filter((i) => i.status === 'unpaid' || i.status === 'partially_paid').length;
    const totalCollected = invoices.data.reduce((sum, i) => sum + Number(i.paid_amount || 0), 0);

    return (
        <AppLayout breadcrumbs={[{ title: 'Invoices & Billing', href: '/invoices' }]}>
            <Head title="Invoices & Billing" />

            <div className="flex flex-col gap-6 p-6">
                {/* Hero Banner */}
                <PageHero
                    badge="Financial Accounting"
                    badgeIcon={Receipt}
                    title="Invoices & Billing Folios"
                    description="Tax-compliant invoicing, payment processing, partial receipts, and outstanding folio tracking."
                >
                    <Button variant="outline" size="sm" asChild className="bg-white/95 text-slate-800 hover:bg-white hover:text-slate-900 border-0 shadow-sm font-medium">
                        <Link href="/reports">
                            <BarChart3 className="mr-2 h-4 w-4 text-slate-700" /> Financial Reports
                        </Link>
                    </Button>
                </PageHero>

                {/* KPI Stat Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        title="Total Invoices"
                        value={invoices.total}
                        subtitle="Registered invoices"
                        icon={Receipt}
                        color="blue"
                    />
                    <StatCard
                        title="Paid in Full"
                        value={paidCount}
                        subtitle="Settled invoices"
                        icon={CheckCircle2}
                        color="emerald"
                    />
                    <StatCard
                        title="Outstanding"
                        value={unpaidCount}
                        subtitle="Awaiting settlement"
                        icon={Clock}
                        color="amber"
                    />
                    <StatCard
                        title="Collected Revenue"
                        value={`$${totalCollected.toFixed(2)}`}
                        subtitle="Total received payments"
                        icon={DollarSign}
                        color="purple"
                    />
                </div>

                {/* Search & Filter */}
                <Card className="rounded-xl border border-border/60 shadow-sm bg-card">
                    <CardContent className="pt-5 pb-5">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 items-end">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by Invoice # or guest name..."
                                    className="bg-muted/30"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="bg-muted/30">
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

                            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium">
                                <Search className="mr-2 h-4 w-4" /> Filter Invoices
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Invoices Table */}
                <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="p-3.5 pl-4">Invoice #</th>
                                <th className="p-3.5">Guest</th>
                                <th className="p-3.5">Room</th>
                                <th className="p-3.5">Date</th>
                                <th className="p-3.5">Total Amount</th>
                                <th className="p-3.5">Paid</th>
                                <th className="p-3.5">Balance</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5 pr-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {invoices.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                                        No invoices found.
                                    </td>
                                </tr>
                            ) : (
                                invoices.data.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-3.5 pl-4 font-semibold text-foreground">
                                            <Link href={`/invoices/${inv.id}`} className="hover:underline text-blue-600">
                                                {inv.invoice_number}
                                            </Link>
                                        </td>
                                        <td className="p-3.5 font-medium text-foreground">{inv.reservation?.guest?.full_name ?? 'Walk-in'}</td>
                                        <td className="p-3.5 text-muted-foreground">Room {inv.reservation?.room?.room_number ?? 'N/A'}</td>
                                        <td className="p-3.5 text-muted-foreground">{inv.issue_date}</td>
                                        <td className="p-3.5 font-bold text-foreground">${Number(inv.total_amount).toFixed(2)}</td>
                                        <td className="p-3.5 text-emerald-600 font-medium">${Number(inv.paid_amount).toFixed(2)}</td>
                                        <td className="p-3.5 font-medium text-foreground">${Number(inv.balance).toFixed(2)}</td>
                                        <td className="p-3.5">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${invoiceStatusStyles[inv.status]}`}>
                                                {inv.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-3.5 pr-4 text-right">
                                            <Button size="sm" variant="ghost" asChild className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                                <Link href={`/invoices/${inv.id}`} title="View Invoice">
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
