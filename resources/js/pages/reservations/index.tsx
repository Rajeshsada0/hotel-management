import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarCheck,
    Plus,
    Search,
    Eye,
    XCircle,
    BedDouble,
    CheckCircle2,
    Clock,
    PlusCircle,
    RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHero } from '@/components/page-hero';
import { StatCard } from '@/components/stat-card';
import AppLayout from '@/layouts/app-layout';
import type { BookingStatus, PaymentStatus, Reservation } from '@/types';

type ReservationsProps = {
    reservations: {
        data: Reservation[];
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        source?: string;
    };
};

const bookingStatusStyles: Record<BookingStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
    checked_in: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
    checked_out: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300',
    no_show: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
    unpaid: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300',
    partially_paid: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
    refunded: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
};

export default function ReservationsIndex({ reservations, filters }: ReservationsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/reservations', {
            search: search || null,
            status: status !== 'all' ? status : null,
        });
    };

    const handleCancel = (res: Reservation) => {
        if (confirm(`Are you sure you want to cancel reservation ${res.booking_number}?`)) {
            router.post(`/reservations/${res.id}/cancel`, {}, { preserveScroll: true });
        }
    };

    const confirmedCount = reservations.data.filter((r) => r.booking_status === 'confirmed').length;
    const inHouseCount = reservations.data.filter((r) => r.booking_status === 'checked_in').length;
    const pendingCount = reservations.data.filter((r) => r.booking_status === 'pending').length;

    return (
        <AppLayout breadcrumbs={[{ title: 'Reservations', href: '/reservations' }]}>
            <Head title="Reservations & Bookings" />

            <div className="flex flex-col gap-6 p-6">
                {/* Hero Banner */}
                <PageHero
                    badge="Reservation Management"
                    badgeIcon={CalendarCheck}
                    title="Bookings & Reservations"
                    description="Search, filter, and manage confirmed stays, in-house guests, cancellations, and folio statements."
                >
                    <Button variant="default" size="sm" asChild className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium">
                        <Link href="/reservations/create">
                            <PlusCircle className="mr-2 h-4 w-4" /> New Booking
                        </Link>
                    </Button>
                </PageHero>

                {/* KPI Stat Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Reservations"
                        value={reservations.total}
                        subtitle="All registered bookings"
                        icon={CalendarCheck}
                        color="blue"
                    />
                    <StatCard
                        title="Confirmed Stays"
                        value={confirmedCount}
                        subtitle="Upcoming arrivals"
                        icon={CheckCircle2}
                        color="emerald"
                    />
                    <StatCard
                        title="Checked In"
                        value={inHouseCount}
                        subtitle="Currently in house"
                        icon={BedDouble}
                        color="purple"
                    />
                    <StatCard
                        title="Pending / Other"
                        value={pendingCount}
                        subtitle="Awaiting deposit/review"
                        icon={Clock}
                        color="amber"
                    />
                </div>

                {/* Filters */}
                <Card className="rounded-xl border border-border/60 shadow-sm bg-card">
                    <CardContent className="pt-5 pb-5">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 items-end">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by Booking #, guest name, phone, email..."
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
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="checked_in">Checked In</SelectItem>
                                        <SelectItem value="checked_out">Checked Out</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium">
                                <Search className="mr-2 h-4 w-4" /> Filter Bookings
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Reservations Table */}
                <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="p-3.5 pl-4">Booking #</th>
                                <th className="p-3.5">Guest</th>
                                <th className="p-3.5">Room</th>
                                <th className="p-3.5">Stay Dates</th>
                                <th className="p-3.5">Source</th>
                                <th className="p-3.5">Total</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5">Payment</th>
                                <th className="p-3.5 pr-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {reservations.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                                        No reservations found matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                reservations.data.map((res) => (
                                    <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-3.5 pl-4 font-semibold text-foreground">
                                            <Link href={`/reservations/${res.id}`} className="hover:underline text-blue-600">
                                                {res.booking_number}
                                            </Link>
                                        </td>
                                        <td className="p-3.5">
                                            <div className="font-medium text-foreground">{res.guest?.full_name}</div>
                                            <div className="text-xs text-muted-foreground">{res.guest?.phone}</div>
                                        </td>
                                        <td className="p-3.5">
                                            {res.room ? (
                                                <div>
                                                    <span className="font-medium text-foreground">Room {res.room.room_number}</span>
                                                    <div className="text-xs text-muted-foreground">{res.room_type?.name}</div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">{res.room_type?.name} (Unassigned)</span>
                                            )}
                                        </td>
                                        <td className="p-3.5 text-xs">
                                            <div className="font-medium text-foreground">{res.check_in_date} → {res.check_out_date}</div>
                                            <div className="text-muted-foreground">{res.total_nights} night(s)</div>
                                        </td>
                                        <td className="p-3.5 capitalize text-xs text-muted-foreground">
                                            {res.booking_source.replace('_', ' ')}
                                        </td>
                                        <td className="p-3.5 font-bold text-foreground">${Number(res.total_amount).toFixed(2)}</td>
                                        <td className="p-3.5">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${bookingStatusStyles[res.booking_status]}`}>
                                                {res.booking_status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-3.5">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${paymentStatusStyles[res.payment_status]}`}>
                                                {res.payment_status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-3.5 pr-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button size="sm" variant="ghost" asChild className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                                    <Link href={`/reservations/${res.id}`} title="View Details">
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {res.booking_status === 'confirmed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                                                        onClick={() => handleCancel(res)}
                                                        title="Cancel Booking"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
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
