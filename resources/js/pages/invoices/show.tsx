import { Head, Link, useForm } from '@inertiajs/react';
import {
    Printer,
    ArrowLeft,
    CreditCard,
    Plus,
    Building2,
    CheckCircle2,
    Calendar,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Hotel, Invoice } from '@/types';

type InvoiceShowProps = {
    invoice: Invoice;
    hotel?: Hotel | null;
};

export default function InvoiceShow({ invoice, hotel }: InvoiceShowProps) {
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isAddChargeOpen, setIsAddChargeOpen] = useState(false);

    // Payment Form
    const { data: paymentData, setData: setPaymentData, post: postPayment, reset: resetPayment, processing: paymentProcessing } = useForm({
        amount: invoice.balance ? String(invoice.balance) : '0',
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
        postPayment(`/invoices/${invoice.id}/payments`, {
            onSuccess: () => {
                setIsPaymentOpen(false);
                resetPayment();
            },
        });
    };

    const handleChargeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postCharge(`/invoices/${invoice.id}/items`, {
            onSuccess: () => {
                setIsAddChargeOpen(false);
                resetCharge();
            },
        });
    };

    const balance = Number(invoice.balance ?? 0);
    const currency = hotel?.currency_symbol || '$';

    return (
        <AppLayout breadcrumbs={[{ title: 'Invoices', href: '/invoices' }, { title: invoice.invoice_number, href: `/invoices/${invoice.id}` }]}>
            <Head title={`Invoice ${invoice.invoice_number}`} />

            <div className="max-w-4xl mx-auto flex flex-col gap-6 p-6">
                {/* Control Action Bar (Hidden on print) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/invoices">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground">
                                Folio Invoice {invoice.invoice_number}
                            </h1>
                            <p className="text-xs text-muted-foreground">Guest Billing Statement</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" /> Print / PDF
                        </Button>

                        <Dialog open={isAddChargeOpen} onOpenChange={setIsAddChargeOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Plus className="mr-1.5 h-4 w-4" /> Add Charge
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
                                            placeholder="e.g. Laundry Service"
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
                                                placeholder="15.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setIsAddChargeOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={chargeProcessing}>
                                            Add Charge
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {balance > 0 && (
                            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <CreditCard className="mr-2 h-4 w-4" /> Collect Payment
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Record Payment</DialogTitle>
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
                                                placeholder="Approval code or transfer reference"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2">
                                            <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={paymentProcessing}>
                                                Record Payment
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {/* Printable Invoice Container (Section 12 Layout) */}
                <div className="rounded-xl border bg-card p-8 shadow-sm print:border-none print:shadow-none print:p-0">
                    {/* Hotel Header */}
                    <div className="flex justify-between items-start border-b pb-6">
                        <div>
                            <div className="flex items-center gap-2 text-primary font-bold text-xl">
                                <Building2 className="h-6 w-6" />
                                <span>{hotel?.name || 'Grand Horizon Hotel'}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{hotel?.address}, {hotel?.city}, {hotel?.country}</p>
                            <p className="text-xs text-muted-foreground">Phone: {hotel?.phone} · Email: {hotel?.email}</p>
                            {hotel?.tax_number && (
                                <p className="text-xs text-muted-foreground">Tax / VAT ID: {hotel.tax_number}</p>
                            )}
                        </div>

                        <div className="text-right">
                            <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">Invoice</h2>
                            <p className="font-mono text-sm font-bold text-primary mt-1">{invoice.invoice_number}</p>
                            <p className="text-xs text-muted-foreground">Date: {invoice.issue_date}</p>
                            <Badge
                                variant="outline"
                                className={`mt-2 uppercase font-bold text-xs ${
                                    invoice.status === 'paid'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                        : invoice.status === 'partially_paid'
                                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                                        : 'bg-rose-50 text-rose-700 border-rose-300'
                                }`}
                            >
                                {invoice.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>

                    {/* Invoice Meta */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b text-xs">
                        <div>
                            <span className="text-muted-foreground block font-medium">Billed To:</span>
                            <span className="font-bold text-foreground text-sm block mt-0.5">{invoice.guest?.full_name}</span>
                            <span className="text-muted-foreground">{invoice.guest?.phone}</span>
                        </div>

                        <div>
                            <span className="text-muted-foreground block font-medium">Booking #:</span>
                            <span className="font-bold text-foreground block mt-0.5">
                                {invoice.reservation?.booking_number || 'Direct Folio'}
                            </span>
                        </div>

                        <div>
                            <span className="text-muted-foreground block font-medium">Room Assigned:</span>
                            <span className="font-bold text-foreground block mt-0.5">
                                {invoice.reservation?.room ? `Room ${invoice.reservation.room.room_number}` : 'N/A'}
                            </span>
                        </div>

                        <div>
                            <span className="text-muted-foreground block font-medium">Stay Period:</span>
                            <span className="font-bold text-foreground block mt-0.5">
                                {invoice.reservation ? `${invoice.reservation.check_in_date} → ${invoice.reservation.check_out_date}` : '-'}
                            </span>
                        </div>
                    </div>

                    {/* Itemized Table (Section 12) */}
                    <div className="py-6">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="border-b bg-muted/40 text-muted-foreground font-semibold uppercase text-[11px]">
                                <tr>
                                    <th className="p-3">Description</th>
                                    <th className="p-3 text-right">Qty</th>
                                    <th className="p-3 text-right">Rate</th>
                                    <th className="p-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {invoice.items?.map((item) => (
                                    <tr key={item.id}>
                                        <td className="p-3 font-medium text-foreground">
                                            {item.description}
                                            <span className="block text-[11px] text-muted-foreground capitalize">[{item.item_type}]</span>
                                        </td>
                                        <td className="p-3 text-right">{Number(item.quantity).toFixed(0)}</td>
                                        <td className="p-3 text-right">{currency}{Number(item.unit_price).toFixed(2)}</td>
                                        <td className="p-3 text-right font-semibold">{currency}{Number(item.total_price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Summary */}
                    <div className="border-t pt-4 flex flex-col items-end text-xs sm:text-sm">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span className="font-medium text-foreground">{currency}{Number(invoice.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Discount</span>
                                <span className="font-medium text-foreground">-{currency}{Number(invoice.discount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Tax / VAT</span>
                                <span className="font-medium text-foreground">+{currency}{Number(invoice.tax).toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold text-base text-foreground">
                                <span>Grand Total</span>
                                <span>{currency}{Number(invoice.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600 font-semibold">
                                <span>Paid to Date</span>
                                <span>{currency}{Number(invoice.paid_amount).toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold text-base">
                                <span>Balance Due</span>
                                <span className={balance > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                                    {currency}{balance.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Transactions List */}
                    {invoice.payments && invoice.payments.length > 0 && (
                        <div className="mt-8 border-t pt-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                Payment Receipts & Records
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b bg-muted/20 text-muted-foreground uppercase text-[10px]">
                                        <tr>
                                            <th className="p-2">Receipt #</th>
                                            <th className="p-2">Date</th>
                                            <th className="p-2">Method</th>
                                            <th className="p-2">Reference</th>
                                            <th className="p-2 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {invoice.payments.map((p) => (
                                            <tr key={p.id}>
                                                <td className="p-2 font-mono font-medium">{p.payment_number}</td>
                                                <td className="p-2 text-muted-foreground">{new Date(p.payment_date).toLocaleDateString()}</td>
                                                <td className="p-2 capitalize">{p.payment_method.replace('_', ' ')}</td>
                                                <td className="p-2 text-muted-foreground">{p.transaction_number || p.reference || '-'}</td>
                                                <td className="p-2 text-right font-bold text-emerald-600">
                                                    {currency}{Number(p.amount).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-12 text-center text-xs text-muted-foreground border-t pt-6">
                        <p>Thank you for staying at {hotel?.name || 'Grand Horizon Hotel & Resort'}!</p>
                        <p className="mt-0.5">Please contact front desk for any inquiries regarding this statement.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
