import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Building2,
    Calendar,
    Users,
    BedDouble,
    Printer,
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    ShieldCheck,
    Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Hotel, Reservation } from '@/types';

interface Props {
    reservation: Reservation;
    hotel?: Hotel | null;
}

export default function BookingConfirmation({ reservation, hotel }: Props) {
    const currency = hotel?.currency_symbol || '$';

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-muted/20 text-foreground py-10 px-4 sm:px-6">
            <Head title={`Booking Confirmed – ${reservation.booking_number}`} />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Back / Navigation buttons (hidden on print) */}
                <div className="flex items-center justify-between print:hidden">
                    <Button variant="ghost" size="sm" asChild className="gap-2">
                        <Link href="/book">
                            <ArrowLeft className="h-4 w-4" /> Book Another Stay
                        </Link>
                    </Button>

                    <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2 shadow-sm">
                        <Printer className="h-4 w-4" /> Print Booking Voucher
                    </Button>
                </div>

                {/* Printable Voucher Card */}
                <div className="bg-card border rounded-2xl p-6 sm:p-10 shadow-lg print:border-none print:shadow-none print:p-0 space-y-8">
                    {/* Header Banner */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b pb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">
                                    {hotel?.name || 'Grand Luxury Hotel'}
                                </h1>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {hotel?.address}, {hotel?.city}, {hotel?.country}
                                </p>
                            </div>
                        </div>

                        <div className="text-center sm:text-right">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                                Booking Reference
                            </span>
                            <span className="font-mono text-xl font-black text-primary">
                                {reservation.booking_number}
                            </span>
                        </div>
                    </div>

                    {/* Confirmation Message */}
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 flex items-center gap-4">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
                        <div>
                            <h2 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                                Reservation Successfully Confirmed!
                            </h2>
                            <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                A confirmation notice has been generated. Please keep your booking reference handy upon check-in.
                            </p>
                        </div>
                    </div>

                    {/* Stay & Guest Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Guest details */}
                        <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                Guest Information
                            </h3>
                            <div className="space-y-1 text-sm">
                                <p className="font-semibold text-foreground">{reservation.guest?.first_name} {reservation.guest?.last_name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> {reservation.guest?.email}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {reservation.guest?.phone}
                                </p>
                            </div>
                        </div>

                        {/* Stay details */}
                        <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                Reservation Details
                            </h3>
                            <div className="space-y-1 text-xs">
                                <div><span className="text-muted-foreground">Room Type:</span> <span className="font-semibold">{reservation.room_type?.name}</span></div>
                                <div><span className="text-muted-foreground">Check-in:</span> <span className="font-semibold">{reservation.check_in_date} (from {hotel?.check_in_time || '14:00'})</span></div>
                                <div><span className="text-muted-foreground">Check-out:</span> <span className="font-semibold">{reservation.check_out_date} (by {hotel?.check_out_time || '11:00'})</span></div>
                                <div><span className="text-muted-foreground">Guests:</span> <span className="font-semibold">{reservation.adults} Adults, {reservation.children} Children</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Receipt className="h-3.5 w-3.5 text-primary" /> Billing Breakdown
                        </h3>
                        <div className="rounded-xl border divide-y overflow-hidden text-sm">
                            <div className="p-3.5 flex justify-between bg-card">
                                <span>Accommodation ({reservation.total_nights} nights @ {currency}{Number(reservation.nightly_rate).toFixed(2)})</span>
                                <span className="font-mono">{currency}{Number(reservation.subtotal).toFixed(2)}</span>
                            </div>
                            {Number(reservation.discount) > 0 && (
                                <div className="p-3.5 flex justify-between text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20">
                                    <span>Promo Discount Applied {reservation.coupon_code ? `(${reservation.coupon_code})` : ''}</span>
                                    <span className="font-mono font-semibold">-{currency}{Number(reservation.discount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="p-3.5 flex justify-between text-muted-foreground bg-card">
                                <span>Taxes & Service Charge</span>
                                <span className="font-mono">+{currency}{Number(reservation.tax).toFixed(2)}</span>
                            </div>
                            <div className="p-4 flex justify-between bg-muted/40 font-bold text-base">
                                <span>Total Amount</span>
                                <span className="text-primary font-mono">{currency}{Number(reservation.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Hotel Policies & Check-in instructions */}
                    <div className="rounded-xl border bg-muted/20 p-4 space-y-2 text-xs text-muted-foreground">
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-primary" /> Important Check-in Instructions
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Please present a valid government-issued photo ID or passport upon check-in.</li>
                            <li>Check-in begins at {hotel?.check_in_time || '14:00'}. Early arrivals subject to room availability.</li>
                            <li>Check-out time is {hotel?.check_out_time || '11:00'}. Late check-outs may incur additional charges.</li>
                            <li>Payment can be settled at the front desk using Cash, Credit Card, or Bank Transfer.</li>
                        </ul>
                    </div>

                    {/* Footer for voucher */}
                    <div className="text-center pt-4 border-t text-xs text-muted-foreground space-y-1">
                        <p>Thank you for choosing {hotel?.name || 'our hotel'}. We look forward to welcoming you!</p>
                        <p>{hotel?.phone ? `Direct Front Desk: ${hotel.phone}` : ''} {hotel?.email ? `• Email: ${hotel.email}` : ''}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
