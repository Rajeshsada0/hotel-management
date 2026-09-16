import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    LogIn,
    LogOut,
    UserCheck,
    BedDouble,
    Plus,
    CalendarCheck,
    Search,
    AlertCircle,
    CheckCircle2,
    Clock,
    DollarSign,
    UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHero } from '@/components/page-hero';
import { StatCard } from '@/components/stat-card';
import AppLayout from '@/layouts/app-layout';
import type { Hotel, Reservation, Room, RoomType, RoomStatus } from '@/types';

type FrontDeskProps = {
    hotel?: Hotel | null;
    arrivals: Reservation[];
    departures: Reservation[];
    inHouse: Reservation[];
    rooms: Room[];
    roomTypes: RoomType[];
};

const roomStatusStyles: Record<RoomStatus, { bg: string; text: string; border: string }> = {
    available: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300' },
    reserved: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300' },
    occupied: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300' },
    cleaning: { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-300' },
    dirty: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300' },
    maintenance: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300' },
    out_of_service: { bg: 'bg-gray-50 dark:bg-gray-900', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-300' },
};

export default function FrontDeskIndex({
    hotel,
    arrivals,
    departures,
    inHouse,
    rooms,
    roomTypes,
}: FrontDeskProps) {
    const [activeTab, setActiveTab] = useState<'matrix' | 'arrivals' | 'departures' | 'in_house'>('matrix');
    const [isWalkInOpen, setIsWalkInOpen] = useState(false);

    // Express Walk-in form
    const { data: walkInData, setData: setWalkInData, post: postWalkIn, reset: resetWalkIn, processing: walkInProcessing } = useForm({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        id_type: 'Passport',
        id_number: '',
        nationality: '',
        room_type_id: roomTypes[0]?.id ? String(roomTypes[0].id) : '',
        room_id: '',
        check_in_date: todayStr(),
        check_out_date: tomorrowStr(),
        adults: 1,
        children: 0,
        nightly_rate: roomTypes[0]?.base_price ? String(roomTypes[0].base_price) : '100',
        discount: '0',
        tax: '0',
        deposit: '0',
        payment_method: 'cash',
    });

    function todayStr() {
        const d = new Date();
        return d.toISOString().split('T')[0];
    }

    function tomorrowStr() {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    }

    const handleWalkInSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postWalkIn('/front-desk/walk-in', {
            onSuccess: () => {
                setIsWalkInOpen(false);
                resetWalkIn();
            },
        });
    };

    const handleCheckIn = (res: Reservation) => {
        if (confirm(`Check-in guest ${res.guest?.full_name} into Room ${res.room?.room_number}?`)) {
            router.post(`/front-desk/check-in/${res.id}`, {}, { preserveScroll: true });
        }
    };

    const handleCheckOut = (res: Reservation) => {
        const balance = res.invoice?.balance ?? res.balance ?? 0;
        if (balance > 0) {
            alert(`Cannot checkout: Guest has an outstanding balance of $${Number(balance).toFixed(2)}. Please record payment in folio.`);
            return;
        }

        if (confirm(`Confirm checkout for ${res.guest?.full_name}? Room will be marked dirty for housekeeping.`)) {
            router.post(`/front-desk/check-out/${res.id}`, {}, { preserveScroll: true });
        }
    };

    const currency = hotel?.currency_symbol || '$';

    return (
        <AppLayout breadcrumbs={[{ title: 'Front Desk', href: '/front-desk' }]}>
            <Head title="Front Desk Operations" />

            <div className="flex flex-col gap-6 p-6">
                {/* Hero Banner */}
                <PageHero
                    badge="Front Desk & Operations"
                    badgeIcon={LogIn}
                    title="Front Desk & Guest Movements"
                    description="Real-time control over arrivals, check-ins, departures, room keys, and guest folios."
                >
                    <Button variant="outline" size="sm" asChild className="bg-white/95 text-slate-800 hover:bg-white hover:text-slate-900 border-0 shadow-sm font-medium">
                        <Link href="/availability">
                            <Search className="mr-2 h-4 w-4 text-slate-700" /> Check Availability
                        </Link>
                    </Button>

                    <Dialog open={isWalkInOpen} onOpenChange={setIsWalkInOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium">
                                <UserPlus className="mr-2 h-4 w-4" /> Express Walk-In
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Express Walk-In Guest Check-In</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleWalkInSubmit} className="space-y-4 pt-2">
                                    <div className="border-b pb-3">
                                        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
                                            1. Guest Details
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="first_name">First Name</Label>
                                                <Input
                                                    id="first_name"
                                                    value={walkInData.first_name}
                                                    onChange={(e) => setWalkInData('first_name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="last_name">Last Name</Label>
                                                <Input
                                                    id="last_name"
                                                    value={walkInData.last_name}
                                                    onChange={(e) => setWalkInData('last_name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    value={walkInData.phone}
                                                    onChange={(e) => setWalkInData('phone', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={walkInData.email}
                                                    onChange={(e) => setWalkInData('email', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="id_type">ID Type</Label>
                                                <Input
                                                    id="id_type"
                                                    value={walkInData.id_type}
                                                    onChange={(e) => setWalkInData('id_type', e.target.value)}
                                                    placeholder="Passport, License"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="id_number">ID / Passport #</Label>
                                                <Input
                                                    id="id_number"
                                                    value={walkInData.id_number}
                                                    onChange={(e) => setWalkInData('id_number', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
                                            2. Stay & Room Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="room_type_id">Room Category</Label>
                                                <Select
                                                    value={walkInData.room_type_id}
                                                    onValueChange={(val) => {
                                                        const selectedType = roomTypes.find((t) => String(t.id) === val);
                                                        setWalkInData((prev) => ({
                                                            ...prev,
                                                            room_type_id: val,
                                                            nightly_rate: selectedType ? String(selectedType.base_price) : prev.nightly_rate,
                                                        }));
                                                    }}
                                                >
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

                                            <div className="space-y-1">
                                                <Label htmlFor="room_id">Select Room</Label>
                                                <Select
                                                    value={walkInData.room_id}
                                                    onValueChange={(val) => setWalkInData('room_id', val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Auto-assign or pick" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {rooms
                                                            .filter((r) => r.status === 'available' && (!walkInData.room_type_id || String(r.room_type_id) === walkInData.room_type_id))
                                                            .map((r) => (
                                                                <SelectItem key={r.id} value={String(r.id)}>
                                                                    Room {r.room_number} (Floor {r.floor})
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1">
                                                <Label htmlFor="check_in_date">Check-in Date</Label>
                                                <Input
                                                    id="check_in_date"
                                                    type="date"
                                                    value={walkInData.check_in_date}
                                                    onChange={(e) => setWalkInData('check_in_date', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label htmlFor="check_out_date">Check-out Date</Label>
                                                <Input
                                                    id="check_out_date"
                                                    type="date"
                                                    value={walkInData.check_out_date}
                                                    onChange={(e) => setWalkInData('check_out_date', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label htmlFor="nightly_rate">Nightly Rate ($)</Label>
                                                <Input
                                                    id="nightly_rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={walkInData.nightly_rate}
                                                    onChange={(e) => setWalkInData('nightly_rate', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label htmlFor="deposit">Initial Payment / Deposit ($)</Label>
                                                <Input
                                                    id="deposit"
                                                    type="number"
                                                    step="0.01"
                                                    value={walkInData.deposit}
                                                    onChange={(e) => setWalkInData('deposit', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-3 border-t">
                                        <Button type="button" variant="outline" onClick={() => setIsWalkInOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={walkInProcessing}>
                                            Complete Walk-In Check-In
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                </PageHero>

                {/* KPI Summary Stat Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Today's Arrivals"
                        value={arrivals.length}
                        subtitle="Guests scheduled today"
                        icon={LogIn}
                        color="blue"
                    />
                    <StatCard
                        title="In-House Guests"
                        value={inHouse.length}
                        subtitle="Currently occupied rooms"
                        icon={UserCheck}
                        color="emerald"
                    />
                    <StatCard
                        title="Today's Departures"
                        value={departures.length}
                        subtitle="Check-outs pending"
                        icon={LogOut}
                        color="amber"
                    />
                    <StatCard
                        title="Available Rooms"
                        value={rooms.filter((r) => r.status === 'available').length}
                        subtitle="Ready for walk-in"
                        icon={BedDouble}
                        color="purple"
                        href="/availability"
                    />
                </div>

                {/* Tabs */}
                <div className="flex rounded-lg border bg-muted p-1 text-sm w-fit">
                    <button
                        onClick={() => setActiveTab('matrix')}
                        className={`rounded-md px-3 py-1 font-medium transition-all ${
                            activeTab === 'matrix' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                        }`}
                    >
                        Live Room Board ({rooms.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('arrivals')}
                        className={`rounded-md px-3 py-1 font-medium transition-all ${
                            activeTab === 'arrivals' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                        }`}
                    >
                        Today's Arrivals ({arrivals.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('departures')}
                        className={`rounded-md px-3 py-1 font-medium transition-all ${
                            activeTab === 'departures' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                        }`}
                    >
                        Today's Departures ({departures.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('in_house')}
                        className={`rounded-md px-3 py-1 font-medium transition-all ${
                            activeTab === 'in_house' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                        }`}
                    >
                        In-House Guests ({inHouse.length})
                    </button>
                </div>

                {/* Tab Content: Live Room Matrix */}
                {activeTab === 'matrix' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Available</span>
                            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-blue-500" /> Occupied</span>
                            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-500" /> Reserved</span>
                            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-rose-500" /> Dirty</span>
                            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-violet-500" /> Cleaning</span>
                            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-orange-500" /> Maintenance</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {rooms.map((room) => {
                                const style = roomStatusStyles[room.status];
                                const currentGuest = room.current_reservation?.guest?.full_name;

                                return (
                                    <div
                                        key={room.id}
                                        className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${style.bg} ${style.border}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-foreground">#{room.room_number}</span>
                                            <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                                                Fl {room.floor}
                                            </span>
                                        </div>

                                        <div className="my-2">
                                            <p className="text-xs font-medium text-foreground line-clamp-1">{room.room_type?.name}</p>
                                            {currentGuest ? (
                                                <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 line-clamp-1 mt-0.5">
                                                    👤 {currentGuest}
                                                </p>
                                            ) : (
                                                <p className={`text-[11px] font-medium capitalize mt-0.5 ${style.text}`}>
                                                    ● {room.status.replace('_', ' ')}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40 flex justify-between">
                                            <span>{room.bed_type}</span>
                                            <span>${Number(room.price ?? room.room_type?.base_price ?? 0).toFixed(0)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tab Content: Arrivals */}
                {activeTab === 'arrivals' && (
                    <div className="space-y-4">
                        {arrivals.length === 0 ? (
                            <Card className="p-8 text-center text-muted-foreground">
                                <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                <p>No scheduled arrivals remaining for today.</p>
                            </Card>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                        <tr>
                                            <th className="p-3">Booking #</th>
                                            <th className="p-3">Guest</th>
                                            <th className="p-3">Category</th>
                                            <th className="p-3">Room Assigned</th>
                                            <th className="p-3">Stay</th>
                                            <th className="p-3">Total Amount</th>
                                            <th className="p-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {arrivals.map((arr) => (
                                            <tr key={arr.id} className="hover:bg-muted/30">
                                                <td className="p-3 font-medium text-foreground">{arr.booking_number}</td>
                                                <td className="p-3 font-medium">
                                                    <div>{arr.guest?.full_name}</div>
                                                    <div className="text-xs text-muted-foreground">{arr.guest?.phone}</div>
                                                </td>
                                                <td className="p-3 text-muted-foreground">{arr.room_type?.name}</td>
                                                <td className="p-3">
                                                    {arr.room ? (
                                                        <Badge variant="outline">Room {arr.room.room_number}</Badge>
                                                    ) : (
                                                        <span className="text-amber-600 text-xs font-medium">Not Assigned</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground">
                                                    {arr.total_nights} nights ({arr.check_in_date} → {arr.check_out_date})
                                                </td>
                                                <td className="p-3 font-bold">${Number(arr.total_amount).toFixed(2)}</td>
                                                <td className="p-3 text-right">
                                                    <Button size="sm" onClick={() => handleCheckIn(arr)}>
                                                        <LogIn className="mr-1.5 h-3.5 w-3.5" /> Check In
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content: Departures */}
                {activeTab === 'departures' && (
                    <div className="space-y-4">
                        {departures.length === 0 ? (
                            <Card className="p-8 text-center text-muted-foreground">
                                <CheckCircle2 className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                <p>No scheduled departures remaining for today.</p>
                            </Card>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                        <tr>
                                            <th className="p-3">Room</th>
                                            <th className="p-3">Guest</th>
                                            <th className="p-3">Booking #</th>
                                            <th className="p-3">Total Charged</th>
                                            <th className="p-3">Balance Due</th>
                                            <th className="p-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {departures.map((dep) => {
                                            const balance = dep.invoice?.balance ?? dep.balance ?? 0;

                                            return (
                                                <tr key={dep.id} className="hover:bg-muted/30">
                                                    <td className="p-3 font-bold text-foreground">Room {dep.room?.room_number}</td>
                                                    <td className="p-3">
                                                        <div className="font-medium">{dep.guest?.full_name}</div>
                                                        <div className="text-xs text-muted-foreground">{dep.guest?.phone}</div>
                                                    </td>
                                                    <td className="p-3 text-xs text-muted-foreground">{dep.booking_number}</td>
                                                    <td className="p-3">${Number(dep.total_amount).toFixed(2)}</td>
                                                    <td className="p-3 font-bold">
                                                        {balance > 0 ? (
                                                            <span className="text-rose-600">${Number(balance).toFixed(2)}</span>
                                                        ) : (
                                                            <span className="text-emerald-600">$0.00 (Settled)</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {dep.invoice && (
                                                                <Button size="sm" variant="outline" asChild>
                                                                    <Link href={`/invoices/${dep.invoice.id}`}>Folio</Link>
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant={balance > 0 ? 'secondary' : 'default'}
                                                                onClick={() => handleCheckOut(dep)}
                                                            >
                                                                <LogOut className="mr-1.5 h-3.5 w-3.5" /> Check Out
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content: In-House Guests */}
                {activeTab === 'in_house' && (
                    <div className="space-y-4">
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                    <tr>
                                        <th className="p-3">Room</th>
                                        <th className="p-3">Guest</th>
                                        <th className="p-3">Check-in</th>
                                        <th className="p-3">Check-out</th>
                                        <th className="p-3">Balance</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {inHouse.map((res) => {
                                        const balance = res.invoice?.balance ?? res.balance ?? 0;

                                        return (
                                            <tr key={res.id} className="hover:bg-muted/30">
                                                <td className="p-3 font-bold text-foreground">Room {res.room?.room_number}</td>
                                                <td className="p-3">
                                                    <div className="font-medium">{res.guest?.full_name}</div>
                                                    <div className="text-xs text-muted-foreground">{res.guest?.phone}</div>
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground">{res.check_in_date}</td>
                                                <td className="p-3 text-xs text-muted-foreground">{res.check_out_date}</td>
                                                <td className="p-3 font-bold">
                                                    {balance > 0 ? (
                                                        <span className="text-rose-600">${Number(balance).toFixed(2)}</span>
                                                    ) : (
                                                        <span className="text-emerald-600">Settled</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link href={`/reservations/${res.id}`}>View Folio</Link>
                                                        </Button>
                                                        <Button size="sm" onClick={() => handleCheckOut(res)}>
                                                            Check Out
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
