import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Users,
    CreditCard,
    Plus,
    Printer,
    CheckCircle2,
    LogIn,
    LogOut,
    Receipt,
    Clock,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Invoice, Reservation } from '@/types';

type ReservationShowProps = {
    reservation: Reservation;
    invoice?: Invoice | null;
};

export default function ReservationShow({ reservation, invoice }: ReservationShowProps) {
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isAddChargeOpen, setIsAddChargeOpen] = useState(false);

    // Payment Form
    const { data: paymentData, setData: setPaymentData, post: postPayment, reset: resetPayment, processing: paymentProcessing } = useForm({
        amount: invoice?.balance ? String(invoice.balance) : '0',
        payment_method: 'credit_card',
        transaction_number: '',
        reference: '',
        notes: '',
    });

    // Add Charge Form
    const { data: chargeData, setData: setChargeData, post: postCharge, reset: resetCharge, processing: chargeProcessing } = useForm({
        item_type: 'restaurant',
        description: '',
        quantity: '1',
        unit_price: '',
    });

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoice) return;
        postPayment(`/invoices/${invoice.id}/payments`, {
            onSuccess: () => {
                setIsPaymentOpen(false);
                resetPayment();
            },
        });
    };

    const handleChargeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoice) return;
        postCharge(`/invoices/${invoice.id}/items`, {
            onSuccess: () => {
                setIsAddChargeOpen(false);
                resetCharge();
            },
        });
    };

    const handleCheckIn = () => {
        router.post(`/front-desk/check-in/${reservation.id}`, {}, { preserveScroll: true });
    };

    const handleCheckOut = () => {
        const balance = invoice?.balance ?? reservation.balance ?? 0;
        if (balance > 0) {
            alert(`Cannot check out: Outstanding balance of $${Number(balance).toFixed(2)}. Please record payment first.`);
            return;
        }
        router.post(`/front-desk/check-out/${reservation.id}`, {}, { preserveScroll: true });
    };

    const balance = Number(invoice?.balance ?? reservation.balance ?? 0);

    return (
        <AppLayout breadcrumbs={[{ title: 'Reservations', href: '/reservations' }, { title: reservation.booking_number, href: `/reservations/${reservation.id}` }]}>
            <Head title={`Reservation ${reservation.booking_number}`} />

            <div className="max-w-5xl mx-auto flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/reservations">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    {reservation.booking_number}
                                </h1>
                                <Badge variant="outline" className="capitalize font-semibold">
                                    {reservation.booking_status.replace('_', ' ')}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Created on {new Date(reservation.created_at || '').toLocaleDateString()} · Source: {reservation.booking_source}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {reservation.booking_status === 'confirmed' && (
                            <Button onClick={handleCheckIn}>
                                <LogIn className="mr-2 h-4 w-4" /> Check In Guest
                            </Button>
                        )}

                        {reservation.booking_status === 'checked_in' && (
                            <Button onClick={handleCheckOut}>
                                <LogOut className="mr-2 h-4 w-4" /> Check Out
                            </Button>
                        )}

                        {invoice && (
                            <Button variant="outline" asChild>
                                <Link href={`/invoices/${invoice.id}`}>
                                    <Receipt className="mr-2 h-4 w-4" /> Print Folio
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Stay & Folio Details */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Guest & Stay Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold text-muted-foreground">Guest Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1 text-sm">
                                    <p className="font-bold text-base text-foreground">{reservation.guest?.full_name}</p>
                                    <p className="text-muted-foreground">📞 {reservation.guest?.phone}</p>
                                    <p className="text-muted-foreground">✉️ {reservation.guest?.email || 'N/A'}</p>
                                    <p className="text-muted-foreground">
                                        ID: {reservation.guest?.id_type || 'ID'}: {reservation.guest?.id_number || reservation.guest?.passport_number || 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold text-muted-foreground">Room & Stay Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1 text-sm">
                                    <p className="font-bold text-base text-foreground">
                                        {reservation.room ? `Room ${reservation.room.room_number}` : 'Room Pending Assignment'}
                                    </p>
                                    <p className="text-muted-foreground">{reservation.room_type?.name}</p>
                                    <p className="text-muted-foreground">
                                        📅 {reservation.check_in_date} → {reservation.check_out_date} ({reservation.total_nights} nights)
                                    </p>
                                    <p className="text-muted-foreground">
                                        👥 {reservation.adults} Adults, {reservation.children} Children
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Folio Breakdown */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base font-semibold">Folio & Itemized Charges</CardTitle>
                                    <p className="text-xs text-muted-foreground">All room charges, restaurant, and incidentals</p>
                                </div>

                                {invoice && (
                                    <Dialog open={isAddChargeOpen} onOpenChange={setIsAddChargeOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline">
                                                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Charge
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Add Folio Charge</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleChargeSubmit} className="space-y-4 pt-2">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="item_type">Charge Type</Label>
                                                    <Select
                                                        value={chargeData.item_type}
                                                        onValueChange={(val) => setChargeData('item_type', val)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="restaurant">Restaurant / POS</SelectItem>
                                                            <SelectItem value="laundry">Laundry</SelectItem>
                                                            <SelectItem value="minibar">Mini Bar</SelectItem>
                                                            <SelectItem value="service">Hotel Service</SelectItem>
                                                            <SelectItem value="other">Other Charge</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="description">Description</Label>
                                                    <Input
                                                        id="description"
                                                        value={chargeData.description}
                                                        onChange={(e) => setChargeData('description', e.target.value)}
                                                        required
                                                        placeholder="e.g. Dinner at Seaside Bistro"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="quantity">Qty</Label>
                                                        <Input
                                                            id="quantity"
                                                            type="number"
                                                            step="0.01"
                                                            value={chargeData.quantity}
                                                            onChange={(e) => setChargeData('quantity', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="unit_price">Unit Price ($)</Label>
                                                        <Input
                                                            id="unit_price"
                                                            type="number"
                                                            step="0.01"
                                                            value={chargeData.unit_price}
                                                            onChange={(e) => setChargeData('unit_price', e.target.value)}
                                                            required
                                                            placeholder="25.00"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-2 pt-2">
                                                    <Button type="button" variant="outline" onClick={() => setIsAddChargeOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" disabled={chargeProcessing}>
                                                        Add Charge to Folio
                                                    </Button>
                                                </div>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                            <tr>
                                                <th className="p-3">Type</th>
                                                <th className="p-3">Description</th>
                                                <th className="p-3 text-right">Qty</th>
                                                <th className="p-3 text-right">Rate</th>
                                                <th className="p-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {invoice?.items?.map((item) => (
                                                <tr key={item.id} className="hover:bg-muted/20">
                                                    <td className="p-3 text-xs capitalize text-muted-foreground">{item.item_type}</td>
                                                    <td className="p-3 font-medium text-foreground">{item.description}</td>
                                                    <td className="p-3 text-right text-muted-foreground">{Number(item.quantity).toFixed(0)}</td>
                                                    <td className="p-3 text-right text-muted-foreground">${Number(item.unit_price).toFixed(2)}</td>
                                                    <td className="p-3 text-right font-semibold">${Number(item.total_price).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payments Received */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Payment Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {invoice?.payments && invoice.payments.length > 0 ? (
                                    <div className="overflow-x-auto rounded-lg border">
                                        <table className="w-full text-left text-sm">
                                            <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                                <tr>
                                                    <th className="p-3">Receipt #</th>
                                                    <th className="p-3">Method</th>
                                                    <th className="p-3">Date</th>
                                                    <th className="p-3">Reference</th>
                                                    <th className="p-3 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {invoice.payments.map((p) => (
                                                    <tr key={p.id} className="hover:bg-muted/20">
                                                        <td className="p-3 font-mono text-xs">{p.payment_number}</td>
                                                        <td className="p-3 capitalize text-xs">{p.payment_method.replace('_', ' ')}</td>
                                                        <td className="p-3 text-xs text-muted-foreground">
                                                            {new Date(p.payment_date).toLocaleString()}
                                                        </td>
                                                        <td className="p-3 text-xs text-muted-foreground">{p.reference || p.transaction_number || '-'}</td>
                                                        <td className="p-3 text-right font-bold text-emerald-600">
                                                            +${Number(p.amount).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Col: Balance & Actions */}
                    <div className="space-y-6">
                        <Card className="border shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Folio Financials</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>${Number(invoice?.subtotal ?? reservation.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Discount</span>
                                    <span>-${Number(invoice?.discount ?? reservation.discount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Tax / VAT</span>
                                    <span>+${Number(invoice?.tax ?? reservation.tax).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold text-base">
                                    <span>Total Amount</span>
                                    <span>${Number(invoice?.total_amount ?? reservation.total_amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-emerald-600 font-semibold">
                                    <span>Total Paid</span>
                                    <span>${Number(invoice?.paid_amount ?? reservation.paid_amount).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                    <span>Balance Due</span>
                                    <span className={balance > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                                        ${balance.toFixed(2)}
                                    </span>
                                </div>

                                {invoice && (
                                    <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="w-full mt-4">
                                                <CreditCard className="mr-2 h-4 w-4" /> Collect Payment
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Record Folio Payment</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-2">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="amount">Amount ($)</Label>
                                                    <Input
                                                        id="amount"
                                                        type="number"
                                                        step="0.01"
                                                        value={paymentData.amount}
                                                        onChange={(e) => setPaymentData('amount', e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="payment_method">Payment Method</Label>
                                                    <Select
                                                        value={paymentData.payment_method}
                                                        onValueChange={(val) => setPaymentData('payment_method', val)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="cash">Cash</SelectItem>
                                                            <SelectItem value="credit_card">Credit Card</SelectItem>
                                                            <SelectItem value="debit_card">Debit Card</SelectItem>
                                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                            <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                                                            <SelectItem value="online">Online</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="transaction_number">Transaction / Ref #</Label>
                                                    <Input
                                                        id="transaction_number"
                                                        value={paymentData.transaction_number}
                                                        onChange={(e) => setPaymentData('transaction_number', e.target.value)}
                                                        placeholder="Card last 4 or transfer reference"
                                                    />
                                                </div>

                                                <div className="flex justify-end gap-2 pt-2">
                                                    <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" disabled={paymentProcessing}>
                                                        Confirm Payment
                                                    </Button>
                                                </div>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
