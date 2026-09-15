import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarCheck,
    Plus,
    Search,
    Filter,
    ArrowUpDown,
    Eye,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const bookingStatusBadges: Record<BookingStatus, string> = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
    checked_in: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    checked_out: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-300',
    cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
    no_show: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
};

const paymentStatusBadges: Record<PaymentStatus, string> = {
    unpaid: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
    partially_paid: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-300',
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

    return (
        <AppLayout breadcrumbs={[{ title: 'Reservations', href: '/reservations' }]}>
            <Head title="Reservations & Bookings" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <CalendarCheck className="h-6 w-6 text-primary" /> Reservations & Bookings
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Search, filter, manage guest reservations and folio records.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild>
                            <Link href="/reservations/create">
                                <Plus className="mr-2 h-4 w-4" /> New Reservation
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border shadow-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 items-end">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by Booking #, guest name, phone, email..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
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

                            <Button type="submit">
                                <Search className="mr-2 h-4 w-4" /> Filter
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Reservations Table */}
                <div className="overflow-x-auto rounded-lg border bg-card">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                            <tr>
                                <th className="p-3">Booking #</th>
                                <th className="p-3">Guest</th>
                                <th className="p-3">Room</th>
                                <th className="p-3">Stay Dates</th>
                                <th className="p-3">Source</th>
                                <th className="p-3">Total</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Payment</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {reservations.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                                        No reservations found matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                reservations.data.map((res) => (
                                    <tr key={res.id} className="hover:bg-muted/30">
                                        <td className="p-3 font-semibold text-foreground">
                                            <Link href={`/reservations/${res.id}`} className="hover:underline text-primary">
                                                {res.booking_number}
                                            </Link>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-medium text-foreground">{res.guest?.full_name}</div>
                                            <div className="text-xs text-muted-foreground">{res.guest?.phone}</div>
                                        </td>
                                        <td className="p-3">
                                            {res.room ? (
                                                <div>
                                                    <span className="font-medium">Room {res.room.room_number}</span>
                                                    <div className="text-xs text-muted-foreground">{res.room_type?.name}</div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">{res.room_type?.name} (Unassigned)</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-xs">
                                            <div>{res.check_in_date} → {res.check_out_date}</div>
                                            <div className="text-muted-foreground">{res.total_nights} night(s)</div>
                                        </td>
                                        <td className="p-3 capitalize text-xs text-muted-foreground">
                                            {res.booking_source.replace('_', ' ')}
                                        </td>
                                        <td className="p-3 font-bold">${Number(res.total_amount).toFixed(2)}</td>
                                        <td className="p-3">
                                            <Badge variant="outline" className={`capitalize font-medium ${bookingStatusBadges[res.booking_status]}`}>
                                                {res.booking_status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            <Badge variant="outline" className={`capitalize font-medium ${paymentStatusBadges[res.payment_status]}`}>
                                                {res.payment_status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={`/reservations/${res.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {res.booking_status === 'confirmed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-rose-600 hover:text-rose-700"
                                                        onClick={() => handleCancel(res)}
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
