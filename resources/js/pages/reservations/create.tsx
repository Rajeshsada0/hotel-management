import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    CalendarCheck,
    ArrowLeft,
    Users,
    BedDouble,
    DollarSign,
    Calculator,
    Ticket,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Guest, Hotel, Room, RoomType } from '@/types';

type CreateReservationProps = {
    hotel?: Hotel | null;
    roomTypes: RoomType[];
    guests: Guest[];
    availableRooms: Room[];
    defaultCheckIn: string;
    defaultCheckOut: string;
    defaultRoomTypeId?: string | null;
};

export default function CreateReservation({
    hotel,
    roomTypes,
    guests,
    availableRooms,
    defaultCheckIn,
    defaultCheckOut,
    defaultRoomTypeId,
}: CreateReservationProps) {
    const [selectedGuestId, setSelectedGuestId] = useState<string>(guests[0]?.id ? String(guests[0].id) : '');

    const initialType = roomTypes.find((t) => String(t.id) === defaultRoomTypeId) ?? roomTypes[0];

    const { data, setData, post, processing, errors } = useForm({
        guest_id: selectedGuestId,
        room_type_id: initialType?.id ? String(initialType.id) : '',
        room_id: '',
        check_in_date: defaultCheckIn,
        check_out_date: defaultCheckOut,
        adults: 1,
        children: 0,
        nightly_rate: initialType?.base_price ? String(initialType.base_price) : '100',
        discount: '0',
        coupon_code: '',
        tax: '0',
        deposit: '0',
        payment_method: 'credit_card',
        booking_source: 'walk_in',
        special_request: '',
        notes: '',
    });

    const [couponInput, setCouponInput] = useState('');
    const [couponMessage, setCouponMessage] = useState<string | null>(null);
    const [couponValid, setCouponValid] = useState<boolean | null>(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    // Calculate nights
    const checkInD = new Date(data.check_in_date);
    const checkOutD = new Date(data.check_out_date);
    const diffTime = checkOutD.getTime() - checkInD.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const subtotal = (parseFloat(data.nightly_rate) || 0) * nights;
    const discount = parseFloat(data.discount) || 0;
    const tax = parseFloat(data.tax) || 0;
    const totalAmount = Math.max(0, subtotal - discount + tax);

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setValidatingCoupon(true);
        try {
            const res = await fetch('/coupons/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    code: couponInput,
                    subtotal: subtotal,
                }),
            });
            const dataRes = await res.json();
            if (dataRes.valid) {
                setCouponValid(true);
                setCouponMessage(dataRes.message);
                setData((prev) => ({
                    ...prev,
                    coupon_code: dataRes.coupon.code,
                    discount: String(dataRes.discount_amount),
                }));
            } else {
                setCouponValid(false);
                setCouponMessage(dataRes.message);
            }
        } catch {
            setCouponValid(false);
            setCouponMessage('Error validating coupon');
        } finally {
            setValidatingCoupon(false);
        }
    };

    // Refresh available rooms when dates or room type change
    const updateAvailability = (inDate: string, outDate: string, typeId: string) => {
        router.get(
            '/reservations/create',
            {
                check_in_date: inDate,
                check_out_date: outDate,
                room_type_id: typeId,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['availableRooms'],
            }
        );
    };

    const handleRoomTypeChange = (typeId: string) => {
        const typeObj = roomTypes.find((t) => String(t.id) === typeId);
        setData((prev) => ({
            ...prev,
            room_type_id: typeId,
            nightly_rate: typeObj ? String(typeObj.base_price) : prev.nightly_rate,
            room_id: '',
        }));
        updateAvailability(data.check_in_date, data.check_out_date, typeId);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reservations');
    };

    const currency = hotel?.currency_symbol || '$';

    return (
        <AppLayout breadcrumbs={[{ title: 'Reservations', href: '/reservations' }, { title: 'New Booking', href: '/reservations/create' }]}>
            <Head title="Create New Reservation" />

            <div className="max-w-4xl mx-auto flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/reservations">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">New Reservation</h1>
                        <p className="text-sm text-muted-foreground">
                            Book a room with automated double-booking checks and rate calculation.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Form Inputs */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Guest Selection */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" /> Guest Selection
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="guest_id">Select Guest Profile</Label>
                                    <Select
                                        value={data.guest_id}
                                        onValueChange={(val) => {
                                            setSelectedGuestId(val);
                                            setData('guest_id', val);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose guest..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {guests.map((g) => (
                                                <SelectItem key={g.id} value={String(g.id)}>
                                                    {g.first_name} {g.last_name} ({g.phone})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stay Dates & Category */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <BedDouble className="h-4 w-4 text-primary" /> Stay & Room Allocation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="check_in_date">Check-in Date</Label>
                                        <Input
                                            id="check_in_date"
                                            type="date"
                                            value={data.check_in_date}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setData('check_in_date', val);
                                                updateAvailability(val, data.check_out_date, data.room_type_id);
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="check_out_date">Check-out Date</Label>
                                        <Input
                                            id="check_out_date"
                                            type="date"
                                            value={data.check_out_date}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setData('check_out_date', val);
                                                updateAvailability(data.check_in_date, val, data.room_type_id);
                                            }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="room_type_id">Room Category</Label>
                                        <Select value={data.room_type_id} onValueChange={handleRoomTypeChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roomTypes.map((t) => (
                                                    <SelectItem key={t.id} value={String(t.id)}>
                                                        {t.name} (${Number(t.base_price).toFixed(2)})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="room_id">Available Room</Label>
                                        <Select value={data.room_id} onValueChange={(val) => setData('room_id', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Auto-assign or choose" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableRooms
                                                    .filter((r) => !data.room_type_id || String(r.room_type_id) === data.room_type_id)
                                                    .map((r) => (
                                                        <SelectItem key={r.id} value={String(r.id)}>
                                                            Room {r.room_number} (Floor {r.floor}, {r.bed_type})
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[11px] text-muted-foreground">
                                            {availableRooms.length} rooms verified available for these dates
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="adults">Adults</Label>
                                        <Input
                                            id="adults"
                                            type="number"
                                            min="1"
                                            value={data.adults}
                                            onChange={(e) => setData('adults', parseInt(e.target.value) || 1)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="children">Children</Label>
                                        <Input
                                            id="children"
                                            type="number"
                                            min="0"
                                            value={data.children}
                                            onChange={(e) => setData('children', parseInt(e.target.value) || 0)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="booking_source">Booking Source</Label>
                                    <Select value={data.booking_source} onValueChange={(val) => setData('booking_source', val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="walk_in">Walk-in</SelectItem>
                                            <SelectItem value="website">Hotel Website</SelectItem>
                                            <SelectItem value="phone">Phone Reservation</SelectItem>
                                            <SelectItem value="booking_com">Booking.com</SelectItem>
                                            <SelectItem value="agoda">Agoda</SelectItem>
                                            <SelectItem value="expedia">Expedia</SelectItem>
                                            <SelectItem value="corporate">Corporate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Special Requests */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Special Requests & Notes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="special_request">Special Request</Label>
                                    <Input
                                        id="special_request"
                                        value={data.special_request}
                                        onChange={(e) => setData('special_request', e.target.value)}
                                        placeholder="e.g. Quiet room, late check-in"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="notes">Internal Notes</Label>
                                    <Input
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Internal hotel notes..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Col: Price Calculation & Summary */}
                    <div className="space-y-6">
                        <Card className="sticky top-6 border shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Calculator className="h-4 w-4 text-primary" /> Pricing Summary
                                </CardTitle>
                                <CardDescription>{nights} Night(s) Stay</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nightly_rate">Nightly Rate ({currency})</Label>
                                    <Input
                                        id="nightly_rate"
                                        type="number"
                                        step="0.01"
                                        value={data.nightly_rate}
                                        onChange={(e) => setData('nightly_rate', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="coupon_code" className="flex items-center gap-1.5">
                                        <Ticket className="h-3.5 w-3.5 text-primary" /> Promo / Coupon Code
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="coupon_code"
                                            placeholder="e.g. SUMMER25"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                            className="font-mono uppercase font-semibold"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleApplyCoupon}
                                            disabled={validatingCoupon || !couponInput.trim()}
                                        >
                                            {validatingCoupon ? 'Checking...' : 'Apply'}
                                        </Button>
                                    </div>
                                    {couponMessage && (
                                        <p className={`text-xs flex items-center gap-1 ${couponValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {couponValid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                                            {couponMessage}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="discount">Discount ({currency})</Label>
                                    <Input
                                        id="discount"
                                        type="number"
                                        step="0.01"
                                        value={data.discount}
                                        onChange={(e) => setData('discount', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="tax">Taxes / VAT ({currency})</Label>
                                    <Input
                                        id="tax"
                                        type="number"
                                        step="0.01"
                                        value={data.tax}
                                        onChange={(e) => setData('tax', e.target.value)}
                                    />
                                </div>

                                <div className="border-t pt-3 space-y-2">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal ({nights} nights)</span>
                                        <span>{currency}{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Discount</span>
                                        <span>-{currency}{discount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Tax</span>
                                        <span>+{currency}{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold text-foreground border-t pt-2">
                                        <span>Total Amount</span>
                                        <span className="text-primary">{currency}{totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="border-t pt-3 space-y-1.5">
                                    <Label htmlFor="deposit">Initial Deposit / Payment ({currency})</Label>
                                    <Input
                                        id="deposit"
                                        type="number"
                                        step="0.01"
                                        value={data.deposit}
                                        onChange={(e) => setData('deposit', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>

                                <Button type="submit" disabled={processing} className="w-full mt-4">
                                    {processing ? 'Creating Booking...' : 'Confirm Reservation'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
