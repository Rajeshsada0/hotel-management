import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    Users,
    BedDouble,
    Check,
    Ticket,
    ShieldCheck,
    Phone,
    Mail,
    MapPin,
    ArrowRight,
    Star,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Coffee,
    Wifi,
    Tv,
    Wind,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { Hotel, RoomType } from '@/types';

interface Props {
    hotel?: Hotel | null;
    roomTypes: Array<RoomType & { available_rooms_count: number }>;
    initialDates: {
        checkIn: string;
        checkOut: string;
        adults: number;
        children: number;
    };
}

export default function PublicBookingIndex({ hotel, roomTypes: initialRoomTypes, initialDates }: Props) {
    const currency = hotel?.currency_symbol || '$';

    // Search bar state
    const [checkIn, setCheckIn] = useState(initialDates.checkIn);
    const [checkOut, setCheckOut] = useState(initialDates.checkOut);
    const [adults, setAdults] = useState(initialDates.adults);
    const [children, setChildren] = useState(initialDates.children);
    const [roomTypes, setRoomTypes] = useState(initialRoomTypes);
    const [loadingSearch, setLoadingSearch] = useState(false);

    // Selected room for checkout
    const [selectedRoomType, setSelectedRoomType] = useState<(RoomType & { available_rooms_count: number }) | null>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Guest checkout form
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [specialRequest, setSpecialRequest] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState<string | null>(null);
    const [couponValid, setCouponValid] = useState<boolean | null>(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Calculate stay duration
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diff = Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingSearch(true);

        try {
            const res = await fetch(`/book/availability?check_in=${checkIn}&check_out=${checkOut}&adults=${adults}&children=${children}`, {
                headers: { 'Accept': 'application/json' },
            });
            const data = await res.json();
            if (data.roomTypes) {
                setRoomTypes(data.roomTypes.map((rt: any) => ({
                    ...rt,
                    available_rooms_count: rt.available_count,
                })));
            }
        } catch {
            console.error('Failed to query live availability');
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleApplyCoupon = async (subtotal: number) => {
        if (!couponCode.trim()) return;
        setValidatingCoupon(true);

        try {
            const res = await fetch('/book/coupon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    code: couponCode,
                    subtotal,
                }),
            });
            const result = await res.json();
            if (result.valid) {
                setCouponValid(true);
                setCouponDiscount(result.discount_amount);
                setCouponMessage(result.message);
            } else {
                setCouponValid(false);
                setCouponDiscount(0);
                setCouponMessage(result.message);
            }
        } catch {
            setCouponValid(false);
            setCouponDiscount(0);
            setCouponMessage('Error validating promotional coupon.');
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleReserve = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRoomType) return;
        setSubmitting(true);

        router.post('/book/reserve', {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            room_type_id: selectedRoomType.id,
            check_in_date: checkIn,
            check_out_date: checkOut,
            adults,
            children,
            special_request: specialRequest || null,
            coupon_code: couponValid ? couponCode : null,
        }, {
            onFinish: () => setSubmitting(false),
        });
    };

    const roomSubtotal = selectedRoomType ? Number(selectedRoomType.base_price) * diff : 0;
    const taxRate = 10;
    const computedTax = Math.max(0, (roomSubtotal - couponDiscount) * (taxRate / 100));
    const totalAmount = Math.max(0, roomSubtotal - couponDiscount + computedTax);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
            <Head title={`Book Your Stay – ${hotel?.name || 'Grand Luxury Hotel'}`} />

            {/* Top Bar */}
            <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="font-bold text-base tracking-tight text-foreground block">
                                {hotel?.name || 'Grand Luxury Hotel & Suites'}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {hotel?.city || 'Downtown'}, {hotel?.country || 'USA'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                            {hotel?.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5 text-primary" /> {hotel.phone}
                                </span>
                            )}
                            {hotel?.email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5 text-primary" /> {hotel.email}
                                </span>
                            )}
                        </div>
                        <Button variant="outline" size="sm" asChild className="text-xs font-semibold">
                            <Link href="/dashboard">Staff Login</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-primary/10 via-background to-background py-16 px-4 sm:px-6 border-b">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                        <Sparkles className="h-3.5 w-3.5" /> Best Online Rate Guaranteed
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                        Experience Comfort & Elegance
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                        Reserve your stay directly with us for exclusive room discounts, flexible check-in, and premium hotel service.
                    </p>

                    {/* Search Bar Widget */}
                    <div className="mt-8 bg-card border rounded-2xl p-4 sm:p-6 shadow-xl max-w-4xl mx-auto text-left">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                            <div className="space-y-1.5">
                                <Label htmlFor="checkIn" className="text-xs font-semibold">Check-in Date</Label>
                                <Input
                                    id="checkIn"
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="checkOut" className="text-xs font-semibold">Check-out Date</Label>
                                <Input
                                    id="checkOut"
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    min={checkIn}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="adults" className="text-xs font-semibold">Adults</Label>
                                <Input
                                    id="adults"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={adults}
                                    onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="children" className="text-xs font-semibold">Children</Label>
                                <Input
                                    id="children"
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={children}
                                    onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>

                            <div>
                                <Button type="submit" disabled={loadingSearch} className="w-full gap-2 font-semibold">
                                    <Calendar className="h-4 w-4" />
                                    {loadingSearch ? 'Checking...' : 'Check Dates'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Room Catalog Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Available Accommodations</h2>
                        <p className="text-sm text-muted-foreground">
                            Displaying rates for {diff} night(s) stay from {checkIn} to {checkOut} ({adults} Adults, {children} Children)
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roomTypes.map((type) => {
                        const totalForStay = Number(type.base_price) * diff;
                        const isAvailable = type.available_rooms_count > 0;

                        return (
                            <div
                                key={type.id}
                                className={`rounded-2xl border bg-card overflow-hidden shadow-sm flex flex-col justify-between transition hover:shadow-md ${
                                    !isAvailable ? 'opacity-70 bg-muted/20' : ''
                                }`}
                            >
                                <div className="p-6 space-y-4">
                                    {/* Room Type Header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground">{type.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {type.description || 'Premium guest room furnished with modern amenities, luxury bedding, and high-speed Wi-Fi.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Capacity and Features */}
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-muted-foreground font-medium">
                                            <Users className="h-3.5 w-3.5 text-primary" /> Max {type.max_adults} Adults, {type.max_children} Kids
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-muted-foreground font-medium">
                                            <BedDouble className="h-3.5 w-3.5 text-primary" /> {type.number_of_beds || 1} Bed(s)
                                        </span>
                                    </div>

                                    {/* Amenities */}
                                    <div className="pt-2 border-t flex flex-wrap gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><Wifi className="h-3.5 w-3.5 text-primary" /> Free Wi-Fi</span>
                                        <span className="flex items-center gap-1"><Wind className="h-3.5 w-3.5 text-primary" /> Climate AC</span>
                                        <span className="flex items-center gap-1"><Tv className="h-3.5 w-3.5 text-primary" /> Smart TV</span>
                                        <span className="flex items-center gap-1"><Coffee className="h-3.5 w-3.5 text-primary" /> Breakfast Avail.</span>
                                    </div>
                                </div>

                                {/* Price & Action Footer */}
                                <div className="p-6 bg-muted/40 border-t flex items-center justify-between gap-4">
                                    <div>
                                        <div className="text-xs text-muted-foreground">From</div>
                                        <div className="text-2xl font-black text-foreground tracking-tight">
                                            {currency}{Number(type.base_price).toFixed(2)}
                                            <span className="text-xs font-normal text-muted-foreground"> / night</span>
                                        </div>
                                        <div className="text-xs text-primary font-medium">
                                            Total: {currency}{totalForStay.toFixed(2)} ({diff} nights)
                                        </div>
                                    </div>

                                    <div>
                                        {isAvailable ? (
                                            <Button
                                                onClick={() => {
                                                    setSelectedRoomType(type);
                                                    setIsCheckoutOpen(true);
                                                }}
                                                className="gap-2 font-semibold shadow-sm"
                                            >
                                                Select Room <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button disabled variant="secondary" size="sm">
                                                Sold Out
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Checkout & Reservation Modal */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Complete Your Reservation
                        </DialogTitle>
                        <DialogDescription>
                            Enter your details to confirm your stay at {hotel?.name || 'our hotel'}.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRoomType && (
                        <form onSubmit={handleReserve} className="space-y-4 py-2 text-sm">
                            {/* Selected Room Summary */}
                            <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-base text-foreground">{selectedRoomType.name}</span>
                                    <span className="font-bold text-primary font-mono">{currency}{Number(selectedRoomType.base_price).toFixed(2)}/night</span>
                                </div>
                                <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1">
                                    <div>Check-in: <span className="font-semibold text-foreground">{checkIn}</span></div>
                                    <div>Check-out: <span className="font-semibold text-foreground">{checkOut}</span></div>
                                    <div>Duration: <span className="font-semibold text-foreground">{diff} Night(s)</span></div>
                                    <div>Guests: <span className="font-semibold text-foreground">{adults} Adults, {children} Children</span></div>
                                </div>
                            </div>

                            {/* Guest Details */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="john.doe@example.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        placeholder="+1 555-0199"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="specialRequest">Special Requests (Optional)</Label>
                                <Input
                                    id="specialRequest"
                                    value={specialRequest}
                                    onChange={(e) => setSpecialRequest(e.target.value)}
                                    placeholder="e.g. Quiet room, high floor, twin beds, early check-in"
                                />
                            </div>

                            {/* Promotional Coupon Entry */}
                            <div className="space-y-1.5 pt-2 border-t">
                                <Label htmlFor="coupon" className="flex items-center gap-1.5 text-xs font-semibold">
                                    <Ticket className="h-3.5 w-3.5 text-primary" /> Have a promo or coupon code?
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="coupon"
                                        placeholder="e.g. WELCOME10"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="font-mono uppercase font-bold text-xs"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleApplyCoupon(roomSubtotal)}
                                        disabled={validatingCoupon || !couponCode.trim()}
                                    >
                                        {validatingCoupon ? 'Verifying...' : 'Apply'}
                                    </Button>
                                </div>
                                {couponMessage && (
                                    <p className={`text-xs flex items-center gap-1 ${couponValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {couponValid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                                        {couponMessage}
                                    </p>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-2 border-t pt-3 text-xs">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Accommodation ({diff} nights @ {currency}{Number(selectedRoomType.base_price).toFixed(2)})</span>
                                    <span>{currency}{roomSubtotal.toFixed(2)}</span>
                                </div>
                                {couponDiscount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-semibold">
                                        <span>Promo Discount</span>
                                        <span>-{currency}{couponDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Taxes & Fees (10% VAT)</span>
                                    <span>+{currency}{computedTax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-foreground border-t pt-2">
                                    <span>Total Stay Cost</span>
                                    <span className="text-primary font-mono">{currency}{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <DialogFooter className="pt-3">
                                <Button type="button" variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting} className="font-semibold gap-2">
                                    <Check className="h-4 w-4" />
                                    {submitting ? 'Confirming...' : 'Book Reservation Now'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Footer */}
            <footer className="border-t bg-card py-8 text-center text-xs text-muted-foreground space-y-2">
                <p>© {new Date().getFullYear()} {hotel?.name || 'Hotel Management System'}. All rights reserved.</p>
                <p>Check-in Time: {hotel?.check_in_time || '14:00'} • Check-out Time: {hotel?.check_out_time || '11:00'}</p>
            </footer>
        </div>
    );
}
