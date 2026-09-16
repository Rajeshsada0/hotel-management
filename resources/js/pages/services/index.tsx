import { Head, Link, useForm } from '@inertiajs/react';
import {
    Sparkles,
    Plus,
    Utensils,
    Car,
    Coffee,
    Bed,
    ShoppingBag,
    Calendar,
    DollarSign,
    CheckCircle2,
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
import type { Hotel, Reservation, Service, ServiceOrder } from '@/types';

type ServicesProps = {
    hotel?: Hotel | null;
    services: Service[];
    orders: {
        data: ServiceOrder[];
        links: any[];
        total: number;
    };
    inHouseReservations: Reservation[];
};

export default function ServicesIndex({
    hotel,
    services,
    orders,
    inHouseReservations,
}: ServicesProps) {
    const [tab, setTab] = useState<'catalog' | 'orders'>('catalog');
    const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
    const [isOrderServiceOpen, setIsOrderServiceOpen] = useState(false);

    // New Service Form
    const { data: serviceData, setData: setServiceData, post: postService, reset: resetService, processing: serviceProcessing } = useForm({
        name: '',
        code: '',
        category: 'spa',
        price: '',
        description: '',
        status: 'active',
    });

    // Charge Service to Room Form
    const { data: orderData, setData: setOrderData, post: postOrder, reset: resetOrder, processing: orderProcessing } = useForm({
        reservation_id: inHouseReservations[0]?.id ? String(inHouseReservations[0].id) : '',
        service_id: services[0]?.id ? String(services[0].id) : '',
        quantity: '1',
        unit_price: services[0]?.price ? String(services[0].price) : '',
        notes: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postService('/services', {
            onSuccess: () => {
                setIsCreateServiceOpen(false);
                resetService();
            },
        });
    };

    const handleOrderSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postOrder('/services/order', {
            onSuccess: () => {
                setIsOrderServiceOpen(false);
                resetOrder();
            },
        });
    };

    const currency = hotel?.currency_symbol || '$';

    return (
        <AppLayout breadcrumbs={[{ title: 'Hotel Services', href: '/services' }]}>
            <Head title="Hotel Services & Incidentals" />

            <div className="flex flex-col gap-6 p-6">
                {/* Hero Banner */}
                <PageHero
                    badge="Guest Services & Amenities"
                    badgeIcon={Sparkles}
                    title="Hotel Services & Incidentals"
                    description="Manage amenities catalog (Laundry, Spa, Airport Transfer, Minibar) and charge incidentals directly to guest folios."
                >
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Charge Service to Room Modal */}
                        <Dialog open={isOrderServiceOpen} onOpenChange={setIsOrderServiceOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium">
                                    <Plus className="mr-2 h-4 w-4" /> Charge Service to Room
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Charge Service to Guest Folio</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleOrderSubmit} className="space-y-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="reservation_id">In-House Guest & Room</Label>
                                        <Select
                                            value={orderData.reservation_id}
                                            onValueChange={(val) => setOrderData('reservation_id', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select active guest room" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {inHouseReservations.map((res) => (
                                                    <SelectItem key={res.id} value={String(res.id)}>
                                                        Room {res.room?.room_number} — {res.guest?.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="service_id">Service</Label>
                                        <Select
                                            value={orderData.service_id}
                                            onValueChange={(val) => {
                                                const srv = services.find((s) => String(s.id) === val);
                                                setOrderData((prev) => ({
                                                    ...prev,
                                                    service_id: val,
                                                    unit_price: srv ? String(srv.price) : prev.unit_price,
                                                }));
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select service" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {services.map((s) => (
                                                    <SelectItem key={s.id} value={String(s.id)}>
                                                        {s.name} ({currency}{Number(s.price).toFixed(2)})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="quantity">Quantity</Label>
                                            <Input
                                                id="quantity"
                                                type="number"
                                                step="1"
                                                min="1"
                                                value={orderData.quantity}
                                                onChange={(e) => setOrderData('quantity', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="unit_price">Unit Price ({currency})</Label>
                                            <Input
                                                id="unit_price"
                                                type="number"
                                                step="0.01"
                                                value={orderData.unit_price}
                                                onChange={(e) => setOrderData('unit_price', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="notes">Notes / Details</Label>
                                        <Input
                                            id="notes"
                                            value={orderData.notes}
                                            onChange={(e) => setOrderData('notes', e.target.value)}
                                            placeholder="e.g. 2 shirts, 1 jacket"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setIsOrderServiceOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={orderProcessing}>
                                            Post to Folio
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Add Service Modal */}
                        <Dialog open={isCreateServiceOpen} onOpenChange={setIsCreateServiceOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-white/95 text-slate-800 hover:bg-white hover:text-slate-900 border-0 shadow-sm font-medium">
                                    <Plus className="mr-2 h-4 w-4 text-slate-700" /> Add Service
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add Service to Catalog</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="name">Service Name</Label>
                                        <Input
                                            id="name"
                                            value={serviceData.name}
                                            onChange={(e) => setServiceData('name', e.target.value)}
                                            required
                                            placeholder="e.g. Aromatherapy Spa Massage"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="category">Category</Label>
                                            <Select
                                                value={serviceData.category}
                                                onValueChange={(val) => setServiceData('category', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="laundry">Laundry</SelectItem>
                                                    <SelectItem value="spa">Spa & Wellness</SelectItem>
                                                    <SelectItem value="airport_pickup">Transportation</SelectItem>
                                                    <SelectItem value="breakfast">Breakfast</SelectItem>
                                                    <SelectItem value="minibar">Minibar</SelectItem>
                                                    <SelectItem value="extra_bed">Extra Bed</SelectItem>
                                                    <SelectItem value="parking">Parking</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="price">Standard Price ({currency})</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                value={serviceData.price}
                                                onChange={(e) => setServiceData('price', e.target.value)}
                                                required
                                                placeholder="50.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="code">Service Code (Optional)</Label>
                                        <Input
                                            id="code"
                                            value={serviceData.code}
                                            onChange={(e) => setServiceData('code', e.target.value)}
                                            placeholder="SRV-MASSAGE"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            value={serviceData.description}
                                            onChange={(e) => setServiceData('description', e.target.value)}
                                            placeholder="Details of the service..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setIsCreateServiceOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={serviceProcessing}>
                                            Save Service
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </PageHero>

                {/* KPI Stat Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        title="Active Services"
                        value={services.length}
                        subtitle="Catalog offerings"
                        icon={Sparkles}
                        color="blue"
                    />
                    <StatCard
                        title="Service Orders"
                        value={orders.total}
                        subtitle="Completed & posted"
                        icon={ShoppingBag}
                        color="emerald"
                    />
                    <StatCard
                        title="In-House Guests"
                        value={inHouseReservations.length}
                        subtitle="Eligible for folio charging"
                        icon={Bed}
                        color="purple"
                    />
                    <StatCard
                        title="Incidentals Value"
                        value={`$${orders.data.reduce((sum, o) => sum + Number(o.total_price || 0), 0).toFixed(2)}`}
                        subtitle="Billed service charges"
                        icon={DollarSign}
                        color="amber"
                    />
                </div>

                {/* Tab Switcher */}
                <div className="flex rounded-lg border bg-muted p-1 text-sm w-fit">
                    <button
                        onClick={() => setTab('catalog')}
                        className={`rounded-md px-3 py-1 font-medium transition-all ${
                            tab === 'catalog' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                        }`}
                    >
                        Service Catalog ({services.length})
                    </button>
                    <button
                        onClick={() => setTab('orders')}
                        className={`rounded-md px-3 py-1 font-medium transition-all ${
                            tab === 'orders' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                        }`}
                    >
                        Recent Service Orders ({orders.total})
                    </button>
                </div>

                {/* Tab 1: Service Catalog */}
                {tab === 'catalog' && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {services.map((srv) => (
                            <Card key={srv.id} className="border shadow-sm flex flex-col justify-between">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="capitalize text-[10px]">
                                            {srv.category.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-xs font-mono text-muted-foreground">{srv.code || ''}</span>
                                    </div>
                                    <CardTitle className="text-base font-bold text-foreground mt-2 line-clamp-1">
                                        {srv.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs line-clamp-2">
                                        {srv.description || 'Standard hotel guest service'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-2 border-t">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-xs text-muted-foreground">Price</span>
                                        <span className="text-xl font-bold text-foreground">
                                            {currency}{Number(srv.price).toFixed(2)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Tab 2: Service Orders History */}
                {tab === 'orders' && (
                    <div className="overflow-x-auto rounded-lg border bg-card">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                <tr>
                                    <th className="p-3">Order #</th>
                                    <th className="p-3">Service</th>
                                    <th className="p-3">Guest / Room</th>
                                    <th className="p-3 text-right">Qty</th>
                                    <th className="p-3 text-right">Total Price</th>
                                    <th className="p-3">Folio Status</th>
                                    <th className="p-3">Ordered At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            No service orders charged yet.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-muted/30">
                                            <td className="p-3 font-mono text-xs font-semibold text-foreground">
                                                {order.order_number}
                                            </td>
                                            <td className="p-3 font-medium text-foreground">{order.service?.name}</td>
                                            <td className="p-3">
                                                <div className="font-semibold text-foreground">
                                                    Room {order.room?.room_number || '-'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{order.guest?.full_name}</div>
                                            </td>
                                            <td className="p-3 text-right">{Number(order.quantity).toFixed(0)}</td>
                                            <td className="p-3 text-right font-bold text-foreground">
                                                {currency}{Number(order.total_price).toFixed(2)}
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                                                    <CheckCircle2 className="mr-1 h-3 w-3" /> Charged to Folio
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">
                                                {new Date(order.ordered_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
