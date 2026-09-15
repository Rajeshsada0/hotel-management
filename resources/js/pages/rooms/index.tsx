import { Head, useForm, router } from '@inertiajs/react';
import {
    BedDouble,
    Plus,
    Filter,
    Layers,
    Sparkles,
    AlertTriangle,
    DoorOpen,
    CheckCircle2,
    Clock,
    Brush,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Room, RoomType, RoomStatus } from '@/types';

type RoomsPageProps = {
    rooms: Room[];
    roomTypes: RoomType[];
    floors: string[];
    filters: {
        status?: string;
        floor?: string;
        room_type_id?: string;
    };
};

const statusColors: Record<RoomStatus, string> = {
    available: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    reserved: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    occupied: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
    cleaning: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border-violet-300',
    dirty: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
    maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300',
    out_of_service: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300 border-gray-300',
};

export default function RoomsIndex({ rooms, roomTypes, floors, filters }: RoomsPageProps) {
    const [tab, setTab] = useState<'rooms' | 'types'>('rooms');
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
    const [isCreateTypeOpen, setIsCreateTypeOpen] = useState(false);

    // New Room Form
    const { data: roomData, setData: setRoomData, post: postRoom, reset: resetRoom, processing: roomProcessing } = useForm({
        room_number: '',
        room_type_id: roomTypes[0]?.id ? String(roomTypes[0].id) : '',
        floor: '1',
        building: '',
        price: '',
        bed_type: 'King',
        capacity: 2,
        status: 'available',
        description: '',
    });

    // New Room Type Form
    const { data: typeData, setData: setTypeData, post: postType, reset: resetType, processing: typeProcessing } = useForm({
        name: '',
        description: '',
        max_adults: 2,
        max_children: 1,
        base_price: '',
        extra_adult_price: '0.00',
        extra_child_price: '0.00',
        number_of_beds: 1,
        status: 'active',
    });

    const handleRoomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postRoom('/rooms', {
            onSuccess: () => {
                setIsCreateRoomOpen(false);
                resetRoom();
            },
        });
    };

    const handleTypeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postType('/room-types', {
            onSuccess: () => {
                setIsCreateTypeOpen(false);
                resetType();
            },
        });
    };

    const changeStatus = (room: Room, newStatus: RoomStatus) => {
        router.patch(`/rooms/${room.id}/status`, { status: newStatus }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Rooms & Types', href: '/rooms' }]}>
            <Head title="Rooms & Room Types" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Rooms & Room Types</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your hotel rooms, floor allocations, pricing, and room categories.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Tab Switcher */}
                        <div className="flex rounded-lg border bg-muted p-1 text-sm">
                            <button
                                onClick={() => setTab('rooms')}
                                className={`rounded-md px-3 py-1 font-medium transition-all ${
                                    tab === 'rooms' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                                }`}
                            >
                                Rooms ({rooms.length})
                            </button>
                            <button
                                onClick={() => setTab('types')}
                                className={`rounded-md px-3 py-1 font-medium transition-all ${
                                    tab === 'types' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                                }`}
                            >
                                Room Types ({roomTypes.length})
                            </button>
                        </div>

                        {tab === 'rooms' ? (
                            <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" /> Add Room
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Add New Room</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleRoomSubmit} className="space-y-4 pt-2">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="room_number">Room Number</Label>
                                                <Input
                                                    id="room_number"
                                                    value={roomData.room_number}
                                                    onChange={(e) => setRoomData('room_number', e.target.value)}
                                                    required
                                                    placeholder="e.g. 101"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="floor">Floor</Label>
                                                <Input
                                                    id="floor"
                                                    value={roomData.floor}
                                                    onChange={(e) => setRoomData('floor', e.target.value)}
                                                    required
                                                    placeholder="1"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="room_type_id">Room Type</Label>
                                            <Select
                                                value={roomData.room_type_id}
                                                onValueChange={(val) => setRoomData('room_type_id', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roomTypes.map((t) => (
                                                        <SelectItem key={t.id} value={String(t.id)}>
                                                            {t.name} (${Number(t.base_price).toFixed(2)}/night)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="bed_type">Bed Type</Label>
                                                <Input
                                                    id="bed_type"
                                                    value={roomData.bed_type}
                                                    onChange={(e) => setRoomData('bed_type', e.target.value)}
                                                    required
                                                    placeholder="King, Queen, Twin"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="capacity">Capacity (Guests)</Label>
                                                <Input
                                                    id="capacity"
                                                    type="number"
                                                    min="1"
                                                    value={roomData.capacity}
                                                    onChange={(e) => setRoomData('capacity', parseInt(e.target.value) || 1)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="price">Custom Price Override ($)</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                value={roomData.price}
                                                onChange={(e) => setRoomData('price', e.target.value)}
                                                placeholder="Leave empty to use base type price"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2">
                                            <Button type="button" variant="outline" onClick={() => setIsCreateRoomOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={roomProcessing}>
                                                Create Room
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <Dialog open={isCreateTypeOpen} onOpenChange={setIsCreateTypeOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" /> Add Room Type
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Add Room Category</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleTypeSubmit} className="space-y-4 pt-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="name">Type Name</Label>
                                            <Input
                                                id="name"
                                                value={typeData.name}
                                                onChange={(e) => setTypeData('name', e.target.value)}
                                                required
                                                placeholder="e.g. Deluxe Suite"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="base_price">Base Price ($)</Label>
                                                <Input
                                                    id="base_price"
                                                    type="number"
                                                    step="0.01"
                                                    value={typeData.base_price}
                                                    onChange={(e) => setTypeData('base_price', e.target.value)}
                                                    required
                                                    placeholder="150.00"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="number_of_beds">Beds Count</Label>
                                                <Input
                                                    id="number_of_beds"
                                                    type="number"
                                                    min="1"
                                                    value={typeData.number_of_beds}
                                                    onChange={(e) => setTypeData('number_of_beds', parseInt(e.target.value) || 1)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="max_adults">Max Adults</Label>
                                                <Input
                                                    id="max_adults"
                                                    type="number"
                                                    min="1"
                                                    value={typeData.max_adults}
                                                    onChange={(e) => setTypeData('max_adults', parseInt(e.target.value) || 1)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="max_children">Max Children</Label>
                                                <Input
                                                    id="max_children"
                                                    type="number"
                                                    min="0"
                                                    value={typeData.max_children}
                                                    onChange={(e) => setTypeData('max_children', parseInt(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="description">Description</Label>
                                            <Input
                                                id="description"
                                                value={typeData.description}
                                                onChange={(e) => setTypeData('description', e.target.value)}
                                                placeholder="Brief description of amenities"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2">
                                            <Button type="button" variant="outline" onClick={() => setIsCreateTypeOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={typeProcessing}>
                                                Save Category
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {/* Content: Rooms Tab */}
                {tab === 'rooms' && (
                    <div className="space-y-4">
                        {/* Floor Quick Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm">
                            <span className="text-muted-foreground font-medium flex items-center gap-1">
                                <Layers className="h-4 w-4" /> Floors:
                            </span>
                            <Button
                                size="sm"
                                variant={!filters.floor ? 'default' : 'outline'}
                                onClick={() => router.get('/rooms', { ...filters, floor: '' })}
                            >
                                All
                            </Button>
                            {floors.map((fl) => (
                                <Button
                                    key={fl}
                                    size="sm"
                                    variant={filters.floor === fl ? 'default' : 'outline'}
                                    onClick={() => router.get('/rooms', { ...filters, floor: fl })}
                                >
                                    Floor {fl}
                                </Button>
                            ))}
                        </div>

                        {/* Rooms Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {rooms.map((room) => {
                                const price = room.price ? Number(room.price) : Number(room.room_type?.base_price ?? 0);

                                return (
                                    <Card key={room.id} className="relative overflow-hidden border shadow-sm">
                                        <div className={`h-1.5 w-full ${statusColors[room.status].split(' ')[0]}`} />
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xl font-bold tracking-tight">#{room.room_number}</span>
                                                    <span className="text-xs text-muted-foreground">Floor {room.floor}</span>
                                                </div>
                                                <Badge variant="outline" className={`capitalize font-medium ${statusColors[room.status]}`}>
                                                    {room.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <CardDescription className="line-clamp-1 font-medium text-foreground">
                                                {room.room_type?.name}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3 text-sm">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Bed: {room.bed_type}</span>
                                                <span>Capacity: {room.capacity} guests</span>
                                            </div>

                                            <div className="flex items-baseline justify-between pt-1 border-t">
                                                <span className="text-xs text-muted-foreground">Rate:</span>
                                                <span className="font-bold text-base text-foreground">${price.toFixed(2)}/night</span>
                                            </div>

                                            {/* Quick Status Changers */}
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {room.status === 'dirty' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs w-full text-violet-600 border-violet-200"
                                                        onClick={() => changeStatus(room, 'cleaning')}
                                                    >
                                                        <Brush className="mr-1.5 h-3 w-3" /> Start Cleaning
                                                    </Button>
                                                )}
                                                {room.status === 'cleaning' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs w-full text-emerald-600 border-emerald-200"
                                                        onClick={() => changeStatus(room, 'available')}
                                                    >
                                                        <CheckCircle2 className="mr-1.5 h-3 w-3" /> Mark Clean & Ready
                                                    </Button>
                                                )}
                                                {room.status === 'available' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 text-xs text-muted-foreground"
                                                        onClick={() => changeStatus(room, 'maintenance')}
                                                    >
                                                        <AlertTriangle className="mr-1 h-3 w-3" /> Set Maintenance
                                                    </Button>
                                                )}
                                                {room.status === 'maintenance' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs w-full text-emerald-600"
                                                        onClick={() => changeStatus(room, 'available')}
                                                    >
                                                        <CheckCircle2 className="mr-1 h-3 w-3" /> Finish Maintenance
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Content: Room Types Tab */}
                {tab === 'types' && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {roomTypes.map((type) => (
                            <Card key={type.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold">{type.name}</CardTitle>
                                        <Badge variant="secondary">{type.rooms_count ?? 0} rooms</Badge>
                                    </div>
                                    <CardDescription>{type.description || 'Standard hotel room category'}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-xs text-muted-foreground">Base Rate</span>
                                            <span className="text-lg font-bold text-foreground">
                                                ${Number(type.base_price).toFixed(2)}
                                                <span className="text-xs font-normal text-muted-foreground"> / night</span>
                                            </span>
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t pt-2">
                                            <span>Max Adults: {type.max_adults}</span>
                                            <span>Max Children: {type.max_children}</span>
                                            <span>Beds: {type.number_of_beds}</span>
                                            <span>Extra Adult: ${Number(type.extra_adult_price).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {type.amenities && type.amenities.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {type.amenities.map((am) => (
                                                <span
                                                    key={am}
                                                    className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
                                                >
                                                    {am}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
