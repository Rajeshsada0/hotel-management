import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarRange,
    Search,
    Users,
    BedDouble,
    DoorOpen,
    CalendarCheck,
    ArrowRight,
    PlusCircle,
    LayoutGrid,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHero } from '@/components/page-hero';
import { StatCard } from '@/components/stat-card';
import AppLayout from '@/layouts/app-layout';
import type { Hotel, Room, RoomType } from '@/types';

type AvailabilityProps = {
    hotel?: Hotel | null;
    availableRooms: Room[];
    roomTypes: RoomType[];
    filters: {
        check_in_date: string;
        check_out_date: string;
        adults: number;
        children: number;
        room_type_id?: number | null;
    };
};

export default function Availability({ hotel, availableRooms, roomTypes, filters }: AvailabilityProps) {
    const [checkIn, setCheckIn] = useState(filters.check_in_date);
    const [checkOut, setCheckOut] = useState(filters.check_out_date);
    const [adults, setAdults] = useState(filters.adults);
    const [children, setChildren] = useState(filters.children);
    const [roomTypeId, setRoomTypeId] = useState<string>(filters.room_type_id ? String(filters.room_type_id) : 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/availability', {
            check_in_date: checkIn,
            check_out_date: checkOut,
            adults,
            children,
            room_type_id: roomTypeId !== 'all' ? roomTypeId : null,
        });
    };

    // Calculate nights count
    const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) || 1);

    // Group available rooms by Room Type
    const roomsByType = availableRooms.reduce<Record<string, { type: RoomType; rooms: Room[] }>>((acc, room) => {
        const typeName = room.room_type?.name ?? 'Standard';
        if (!acc[typeName]) {
            acc[typeName] = {
                type: room.room_type!,
                rooms: [],
            };
        }
        acc[typeName].rooms.push(room);
        return acc;
    }, {});

    const currency = hotel?.currency_symbol || '$';

    return (
        <AppLayout breadcrumbs={[{ title: 'Front Desk', href: '/front-desk' }, { title: 'Room Availability', href: '/availability' }]}>
            <Head title="Room Availability Search" />

            <div className="flex flex-col gap-6 p-6">
                {/* Hero Banner matching Dashboard style */}
                <PageHero
                    badge="Front Desk & Room Inventory"
                    badgeIcon={CalendarRange}
                    title="Room Availability & Stays"
                    description="Search real-time room availability across all accommodation tiers, prevent double-bookings, and reserve guest stays."
                >
                    <Button variant="outline" size="sm" asChild className="bg-white/95 text-slate-800 hover:bg-white hover:text-slate-900 border-0 shadow-sm font-medium">
                        <Link href="/front-desk">
                            <LayoutGrid className="mr-2 h-4 w-4 text-slate-700" />
                            Front Desk Board
                        </Link>
                    </Button>
                    <Button variant="default" size="sm" asChild className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium">
                        <Link href="/reservations/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Booking
                        </Link>
                    </Button>
                </PageHero>

                {/* KPI Summary Stat Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Available Rooms"
                        value={availableRooms.length}
                        subtitle="Ready for check-in"
                        icon={DoorOpen}
                        color="emerald"
                    />
                    <StatCard
                        title="Categories Available"
                        value={Object.keys(roomsByType).length || roomTypes.length}
                        subtitle="Active room types"
                        icon={BedDouble}
                        color="blue"
                    />
                    <StatCard
                        title="Stay Duration"
                        value={`${nights} Night${nights > 1 ? 's' : ''}`}
                        subtitle={`${checkIn} to ${checkOut}`}
                        icon={CalendarCheck}
                        color="purple"
                    />
                    <StatCard
                        title="Guest Filter"
                        value={`${adults + children} Guests`}
                        subtitle={`${adults} Adults, ${children} Children`}
                        icon={Users}
                        color="amber"
                    />
                </div>

                {/* Filter / Search Bar */}
                <Card className="rounded-xl border border-border/60 shadow-sm bg-card">
                    <CardHeader className="pb-3 border-b border-border/50">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Search className="h-4 w-4 text-primary" /> Search Criteria & Dates
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5 items-end">
                            <div className="space-y-1.5">
                                <Label htmlFor="check_in_date">Check-in Date</Label>
                                <Input
                                    id="check_in_date"
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="check_out_date">Check-out Date</Label>
                                <Input
                                    id="check_out_date"
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="room_type">Room Category</Label>
                                <Select value={roomTypeId} onValueChange={setRoomTypeId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {roomTypes.map((t) => (
                                            <SelectItem key={t.id} value={String(t.id)}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="adults">Adults</Label>
                                    <Input
                                        id="adults"
                                        type="number"
                                        min="1"
                                        value={adults}
                                        onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="children">Children</Label>
                                    <Input
                                        id="children"
                                        type="number"
                                        min="0"
                                        value={children}
                                        onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium">
                                <Search className="mr-2 h-4 w-4" /> Check Availability
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Results Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-foreground">
                            Available Accommodations: {checkIn} to {checkOut} ({availableRooms.length} rooms ready)
                        </h2>
                    </div>

                    {availableRooms.length === 0 ? (
                        <Card className="rounded-xl border border-border/60 p-8 text-center bg-card shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-3">
                                <CalendarRange className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-base">No rooms available for the selected dates</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                                All rooms in this category are either occupied, reserved, or undergoing turnover. Try selecting alternative stay dates or categories.
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(roomsByType).map(([typeName, group]) => (
                                <div key={typeName} className="space-y-3">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">{typeName}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                Base Rate: {currency}{Number(group.type.base_price).toFixed(2)}/night · Max Capacity: {group.type.max_adults} Adults, {group.type.max_children} Children
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                                            {group.rooms.length} Available
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                        {group.rooms.map((room) => {
                                            const price = room.price ? Number(room.price) : Number(group.type.base_price);

                                            return (
                                                <Card key={room.id} className="rounded-xl border border-border/60 shadow-sm hover:shadow-md hover:border-primary/50 transition-all bg-card">
                                                    <CardHeader className="pb-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xl font-bold tracking-tight text-foreground">
                                                                Room {room.room_number}
                                                            </span>
                                                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                                                                Available
                                                            </span>
                                                        </div>
                                                        <CardDescription className="text-xs">
                                                            Floor {room.floor} · {room.bed_type}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3 text-sm">
                                                        <div className="flex justify-between items-baseline pt-1">
                                                            <span className="text-xs text-muted-foreground">Nightly Rate:</span>
                                                            <span className="text-lg font-bold text-foreground">
                                                                {currency}{price.toFixed(2)}
                                                            </span>
                                                        </div>

                                                        <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium" asChild>
                                                            <Link
                                                                href={`/reservations/create?check_in_date=${checkIn}&check_out_date=${checkOut}&room_type_id=${room.room_type_id}&room_id=${room.id}&adults=${adults}&children=${children}`}
                                                            >
                                                                Book Room <ArrowRight className="ml-2 h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
