import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Users,
    Plus,
    Search,
    Phone,
    Mail,
    FileText,
    Calendar,
    Globe,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Guest } from '@/types';

type GuestsProps = {
    guests: {
        data: Guest[];
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
    };
};

export default function GuestsIndex({ guests, filters }: GuestsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data, setData, post, reset, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        gender: 'male',
        date_of_birth: '',
        nationality: 'United States',
        phone: '',
        email: '',
        address: '',
        id_type: 'Passport',
        id_number: '',
        passport_number: '',
        notes: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/guests', { search: search || null });
    };

    const handleCreateGuest = (e: React.FormEvent) => {
        e.preventDefault();
        post('/guests', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Guests', href: '/guests' }]}>
            <Head title="Guest Directory" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" /> Guest Management
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Directory of guest profiles, stay history, IDs, and preferences.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Add Guest
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Register New Guest</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateGuest} className="space-y-4 pt-2">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="first_name">First Name</Label>
                                            <Input
                                                id="first_name"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="last_name">Last Name</Label>
                                            <Input
                                                id="last_name"
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                required
                                                placeholder="+1 555-0192"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="guest@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="nationality">Nationality</Label>
                                            <Input
                                                id="nationality"
                                                value={data.nationality}
                                                onChange={(e) => setData('nationality', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="id_type">ID Type</Label>
                                            <Input
                                                id="id_type"
                                                value={data.id_type}
                                                onChange={(e) => setData('id_type', e.target.value)}
                                                placeholder="Passport, License"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="id_number">ID Number</Label>
                                            <Input
                                                id="id_number"
                                                value={data.id_number}
                                                onChange={(e) => setData('id_number', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Street address, City, Country"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="notes">Notes / Special Preferences</Label>
                                        <Input
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="e.g. VIP guest, high floor preference"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            Save Guest Profile
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Search Bar */}
                <Card className="border shadow-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, phone, email, passport number..."
                                className="max-w-md"
                            />
                            <Button type="submit">
                                <Search className="mr-2 h-4 w-4" /> Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Guests Table */}
                <div className="overflow-x-auto rounded-lg border bg-card">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                            <tr>
                                <th className="p-3">Guest Name</th>
                                <th className="p-3">Phone</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Nationality</th>
                                <th className="p-3">ID / Passport</th>
                                <th className="p-3 text-center">Total Stays</th>
                                <th className="p-3">Special Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {guests.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                        No guests found.
                                    </td>
                                </tr>
                            ) : (
                                guests.data.map((g) => (
                                    <tr key={g.id} className="hover:bg-muted/30">
                                        <td className="p-3 font-semibold text-foreground">
                                            {g.first_name} {g.last_name}
                                        </td>
                                        <td className="p-3 text-muted-foreground">{g.phone}</td>
                                        <td className="p-3 text-muted-foreground">{g.email || '-'}</td>
                                        <td className="p-3 text-xs">{g.nationality || '-'}</td>
                                        <td className="p-3 text-xs text-muted-foreground">
                                            {g.id_number || g.passport_number ? (
                                                <span>{g.id_type || 'ID'}: {g.id_number || g.passport_number}</span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-3 text-center">
                                            <Badge variant="secondary">{g.reservations_count ?? 0}</Badge>
                                        </td>
                                        <td className="p-3 text-xs text-muted-foreground line-clamp-1 max-w-xs">
                                            {g.notes || '-'}
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
