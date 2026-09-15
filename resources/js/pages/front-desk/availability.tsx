import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarRange,
    Search,
    Users,
    BedDouble,
    CheckCircle2,
    CalendarCheck,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <CalendarRange className="h-6 w-6 text-primary" />
                        Room Availability Search
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Check real-time room availability and prevent double bookings for requested stay dates.
                    </p>
                </div>

                {/* Filter / Search Bar */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Search Criteria</CardTitle>
                    </CardHeader>
                    <CardContent>
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

                            <Button type="submit" className="w-full">
                                <Search className="mr-2 h-4 w-4" /> Check Availability
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Results Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-foreground">
                            Available Rooms for Stay: {checkIn} to {checkOut} ({availableRooms.length} rooms ready)
                        </h2>
                    </div>

                    {availableRooms.length === 0 ? (
                        <Card className="p-8 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                                <CalendarRange className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-base">No rooms available for the selected dates</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                                All rooms in this category are either occupied, reserved, or undergoing maintenance. Try selecting different dates or room categories.
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
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                                            {group.rooms.length} Available
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                        {group.rooms.map((room) => {
                                            const price = room.price ? Number(room.price) : Number(group.type.base_price);

                                            return (
                                                <Card key={room.id} className="border shadow-sm hover:border-primary/50 transition-colors">
                                                    <CardHeader className="pb-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xl font-bold tracking-tight text-foreground">
                                                                Room {room.room_number}
                                                            </span>
                                                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                                Available
                                                            </Badge>
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

                                                        <Button className="w-full" asChild>
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
