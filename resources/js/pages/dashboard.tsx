import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    BedDouble,
    DoorOpen,
    CalendarCheck,
    LogIn,
    LogOut,
    DollarSign,
    Clock,
    Sparkles,
    AlertCircle,
    PlusCircle,
    Building2,
    CalendarRange,
    CheckCircle2,
    UtensilsCrossed,
    TrendingUp,
    BarChart3,
    ArrowUpRight,
    Wallet,
    ArrowRight,
    Boxes,
    Palette,
    Image as ImageIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHero, resolveBannerGradient } from '@/components/page-hero';
import { StatCard } from '@/components/stat-card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { DashboardSummary, Hotel, Reservation, RevenueTrendDay, RoomTypeBreakdown } from '@/types';

type DashboardProps = {
    hotel?: Hotel | null;
    summary: DashboardSummary;
    revenueTrend: RevenueTrendDay[];
    roomTypesBreakdown: RoomTypeBreakdown[];
    recentBookings: Reservation[];
    todayArrivals: Reservation[];
    todayDepartures: Reservation[];
};

const BANNER_IMAGE_PRESETS = [
    {
        name: 'Sunset Luxury Resort (Reference Default)',
        url: '/images/dashboard-banner.jpg',
    },
    {
        name: 'Horizon Twilight Pool',
        url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1920&q=80',
    },
    {
        name: 'Tropical Palm Villas',
        url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80',
    },
    {
        name: 'Grand Hotel & Spa',
        url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80',
    },
];

const BANNER_COLOR_PRESETS = [
    {
        name: 'Royal Blue (Reference Design)',
        gradient: 'bg-gradient-to-r from-[#143d91] via-[#1a4ab9]/95 via-45% to-transparent',
        hex: '#1a4ab9',
    },
    {
        name: 'Deep Ocean Navy',
        gradient: 'bg-gradient-to-r from-[#0b192c] via-[#1e3e62]/95 via-45% to-transparent',
        hex: '#1e3e62',
    },
    {
        name: 'Indigo Twilight',
        gradient: 'bg-gradient-to-r from-[#1e1b4b] via-[#3730a3]/95 via-45% to-transparent',
        hex: '#3730a3',
    },
    {
        name: 'Emerald Oasis',
        gradient: 'bg-gradient-to-r from-[#064e3b] via-[#047857]/95 via-45% to-transparent',
        hex: '#047857',
    },
    {
        name: 'Warm Amber Dusk',
        gradient: 'bg-gradient-to-r from-[#7c2d12] via-[#c2410c]/95 via-45% to-transparent',
        hex: '#c2410c',
    },
];

export default function Dashboard({
    hotel,
    summary,
    revenueTrend,
    roomTypesBreakdown,
    recentBookings,
    todayArrivals,
    todayDepartures,
}: DashboardProps) {
    const currency = hotel?.currency_symbol || '$';

    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const [bannerImage, setBannerImage] = useState(hotel?.banner_image || '/images/dashboard-banner.jpg');
    const [bannerColor, setBannerColor] = useState(hotel?.banner_color || 'bg-gradient-to-r from-[#143d91] via-[#1a4ab9]/95 via-45% to-transparent');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveBanner = () => {
        setIsSaving(true);
        router.put('/settings/hotel', {
            banner_image: bannerImage,
            banner_color: bannerColor,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsSaving(false);
                setIsCustomizeOpen(false);
            },
        });
    };

    // Calculate max value for 7-day trend chart scaling
    const maxTrendRevenue = Math.max(...revenueTrend.map((d) => d.total), 100);

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: dashboard() }]}>
            <Head title="Hotel Executive Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Top Banner / Hotel Header */}
                <PageHero
                    bgImage={hotel?.banner_image || bannerImage}
                    gradientClass={hotel?.banner_color || bannerColor}
                    badge={hotel?.code ? `[${hotel.code}] ${hotel?.city || ''}, ${hotel?.country || ''}` : 'Hotel Operations'}
                    badgeIcon={Building2}
                    title={hotel?.name || 'Grand Horizon Hotel & Resort'}
                    description="Live occupancy, daily revenue, front desk operations, and department activity."
                >
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCustomizeOpen(true)}
                        className="bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-md shadow-sm font-medium text-xs px-3.5 py-2 h-9 rounded-lg transition-all"
                    >
                        <Palette className="mr-1.5 h-3.5 w-3.5" />
                        Customize Banner
                    </Button>
                    <Button variant="outline" size="sm" asChild className="bg-white text-slate-800 hover:bg-slate-50 border-0 shadow-sm font-semibold text-xs px-3.5 py-2 h-9 rounded-lg">
                        <Link href="/reports">
                            <BarChart3 className="mr-2 h-4 w-4 text-slate-700" />
                            Analytics & Reports
                        </Link>
                    </Button>
                    <Button variant="default" size="sm" asChild className="bg-[#1a56db] hover:bg-blue-700 text-white shadow-sm font-semibold text-xs px-3.5 py-2 h-9 rounded-lg">
                        <Link href="/reservations/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Booking
                        </Link>
                    </Button>
                </PageHero>

                {/* Banner Customization Modal */}
                <Dialog open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base">
                                <Palette className="h-4 w-4 text-blue-600" />
                                Customize Hero Banner & Theme
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Choose an image and color gradient scheme for your hotel dashboard banner.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            {/* Live Modal Preview */}
                            <div className="relative overflow-hidden rounded-xl border border-border/40 min-h-[110px] p-4 text-white shadow-sm">
                                <div
                                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
                                    style={{ backgroundImage: `url('${bannerImage}')` }}
                                />
                                <div
                                    className="absolute inset-0 z-0"
                                    style={{ background: resolveBannerGradient(bannerColor) }}
                                />
                                <div className="relative z-10 space-y-1">
                                    <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-medium border border-white/20">
                                        Live Preview • [{hotel?.code || 'GH-01'}] {hotel?.city || 'Miami'}
                                    </span>
                                    <h4 className="text-base font-bold drop-shadow-sm">{hotel?.name || 'Grand Horizon Hotel & Resort'}</h4>
                                    <p className="text-xs text-blue-100/90 line-clamp-1">Live occupancy, daily revenue, front desk operations.</p>
                                </div>
                            </div>

                            {/* Color Selection */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-foreground">Color Gradient Theme</Label>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {BANNER_COLOR_PRESETS.map((preset) => {
                                        const isSelected = bannerColor === preset.gradient;
                                        return (
                                            <button
                                                key={preset.name}
                                                type="button"
                                                onClick={() => setBannerColor(preset.gradient)}
                                                className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                                                    isSelected
                                                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 font-semibold'
                                                        : 'border-border hover:bg-muted/50 text-foreground'
                                                }`}
                                            >
                                                <span
                                                    className="h-3.5 w-3.5 rounded-full shrink-0 border border-white/40 shadow-xs"
                                                    style={{ backgroundColor: preset.hex }}
                                                />
                                                <span className="truncate">{preset.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Image Selection */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-foreground">Banner Image</Label>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {BANNER_IMAGE_PRESETS.map((preset) => {
                                        const isSelected = bannerImage === preset.url;
                                        return (
                                            <button
                                                key={preset.name}
                                                type="button"
                                                onClick={() => setBannerImage(preset.url)}
                                                className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                                                    isSelected
                                                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 font-semibold'
                                                        : 'border-border hover:bg-muted/50 text-foreground'
                                                }`}
                                            >
                                                <div
                                                    className="h-7 w-10 rounded bg-cover bg-center shrink-0 border"
                                                    style={{ backgroundImage: `url('${preset.url}')` }}
                                                />
                                                <span className="truncate text-xs">{preset.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="pt-1">
                                    <Label htmlFor="custom_banner_url" className="text-xs text-muted-foreground">Custom Image URL or Path</Label>
                                    <Input
                                        id="custom_banner_url"
                                        value={bannerImage}
                                        onChange={(e) => setBannerImage(e.target.value)}
                                        placeholder="/images/dashboard-banner.jpg"
                                        className="mt-1 h-8 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
                            <Link href="/settings/hotel" className="text-xs text-blue-600 hover:underline">
                                More hotel settings →
                            </Link>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsCustomizeOpen(false)}
                                    disabled={isSaving}
                                    className="text-xs h-8"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleSaveBanner}
                                    disabled={isSaving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Today's Summary Stat Cards (Section 3) */}
                <div>
                    <h2 className="text-base font-semibold text-foreground mb-3 flex items-center justify-between">
                        <span>Today's Real-Time Summary</span>
                        <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                            <CalendarCheck className="h-3.5 w-3.5" />
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                        <StatCard
                            title="Occupancy"
                            value={`${summary.occupancy_rate}%`}
                            subtitle={`${summary.occupied_rooms} of ${summary.total_rooms} rooms occupied`}
                            icon={BedDouble}
                            color="blue"
                            showWave={true}
                            href="/front-desk"
                        />
                        <StatCard
                            title="Available"
                            value={summary.available_rooms}
                            subtitle="Ready for check-in"
                            icon={DoorOpen}
                            color="emerald"
                            href="/availability"
                        />
                        <StatCard
                            title="Housekeeping"
                            value={
                                <span className="flex items-baseline gap-1 text-2xl font-bold">
                                    <span className="text-rose-600">{summary.dirty_rooms}</span>
                                    <span className="text-xs font-normal text-muted-foreground">dirty</span>
                                    <span className="text-muted-foreground font-light text-sm">/</span>
                                    <span className="text-amber-600 font-semibold text-lg">{summary.cleaning_rooms || 0}</span>
                                    <span className="text-xs font-normal text-muted-foreground">cleaning</span>
                                </span>
                            }
                            subtitle="Room turnover queue"
                            icon={Sparkles}
                            color="purple"
                            href="/housekeeping"
                        />
                        <StatCard
                            title="Movements Today"
                            value={
                                <span className="flex items-baseline gap-1 text-2xl font-bold">
                                    <span className="text-blue-600">+{summary.check_ins_today}</span>
                                    <span className="text-xs font-normal text-muted-foreground">in</span>
                                    <span className="text-muted-foreground font-light text-sm">/</span>
                                    <span className="text-rose-600 font-semibold text-lg">-{summary.check_outs_today}</span>
                                    <span className="text-xs font-normal text-muted-foreground">out</span>
                                </span>
                            }
                            subtitle="Arrivals & departures"
                            icon={CalendarRange}
                            color="amber"
                            href="/front-desk"
                        />
                        <StatCard
                            title="Today's Revenue"
                            value={`${currency}${summary.today_revenue.toFixed(2)}`}
                            subtitle={`+ ${currency}${(summary.today_restaurant_sales || 0).toFixed(2)} POS sales`}
                            icon={DollarSign}
                            color="sky"
                            href="/invoices"
                        />
                        <StatCard
                            title="Pending Folios"
                            value={`${currency}${summary.pending_payments.toFixed(2)}`}
                            subtitle="Unpaid guest balances"
                            icon={Clock}
                            color="rose"
                            href="/invoices"
                        />
                    </div>
                </div>

                {/* Section 3 Charts & Visual Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 7-Day Revenue Trend Visual (7 Cols) */}
                    <Card className="lg:col-span-7">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" /> Last 7 Days Revenue Trend
                                </CardTitle>
                                <CardDescription>Combined room booking payments and restaurant POS income</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="text-xs text-primary">
                                <Link href="/reports">View Full P&L <ArrowRight className="h-3 w-3 ml-1" /></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {/* Chart with Y-axis */}
                            <div className="flex gap-2">
                                {/* Y-axis labels */}
                                <div className="flex flex-col justify-between text-[10px] text-muted-foreground pb-8 pr-1 text-right" style={{ minWidth: 32 }}>
                                    <span>{currency}{Math.round(maxTrendRevenue)}</span>
                                    <span>{currency}{Math.round(maxTrendRevenue * 0.67)}</span>
                                    <span>{currency}{Math.round(maxTrendRevenue * 0.33)}</span>
                                    <span>{currency}0</span>
                                </div>
                                {/* Bars */}
                                <div className="flex-1 flex items-end justify-between gap-2 h-44 pb-0">
                                    {revenueTrend.map((item, idx) => {
                                        const heightPct = Math.max(4, Math.min(100, Math.round((item.total / maxTrendRevenue) * 100)));

                                        return (
                                            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                                                <div className="text-[11px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {currency}{Math.round(item.total)}
                                                </div>
                                                <div className="w-full flex flex-col justify-end overflow-hidden" style={{ height: '120px' }}>
                                                    <div
                                                        className="w-full bg-indigo-400 hover:bg-indigo-500 transition-all rounded-sm"
                                                        style={{ height: `${heightPct}%` }}
                                                        title={`${item.day} (${item.date}): Room ${currency}${item.room_revenue}, POS ${currency}${item.restaurant_revenue}`}
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-xs font-medium block text-foreground">{item.day}</span>
                                                    <span className="text-[10px] text-muted-foreground block">{item.date}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-indigo-400" />
                                    <span>Daily Total Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-3.5 w-3.5 text-rose-500" />
                                    <span>This Month Expenses: {currency}{(summary.this_month_expenses || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Room Type Utilization Breakdown (5 Cols) */}
                    <Card className="lg:col-span-5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <BedDouble className="h-4 w-4 text-primary" /> Room Type Occupancy
                            </CardTitle>
                            <CardDescription>Live distribution by accommodation category</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {roomTypesBreakdown.map((type) => (
                                <div key={type.id} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-semibold text-foreground">{type.name}</span>
                                        <span className="text-muted-foreground">
                                            {type.occupied_rooms} / {type.total_rooms} occupied ({type.occupancy_rate}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                type.occupancy_rate > 75
                                                    ? 'bg-rose-500'
                                                    : type.occupancy_rate > 40
                                                    ? 'bg-blue-600'
                                                    : 'bg-emerald-500'
                                            }`}
                                            style={{ width: `${type.occupancy_rate}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[11px] text-muted-foreground">
                                        <span>Base: {currency}{type.base_price.toFixed(2)}/night</span>
                                        <span>{type.total_rooms - type.occupied_rooms} available</span>
                                    </div>
                                </div>
                            ))}

                            {roomTypesBreakdown.length === 0 && (
                                <div className="py-6 text-center text-muted-foreground text-xs">
                                    No room types configured.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Operations & Today's Guest Movements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Today's Expected Arrivals */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <LogIn className="h-4 w-4 text-indigo-500" /> Today's Arrivals ({todayArrivals.length})
                                </CardTitle>
                                <CardDescription>Guests scheduled to check in today</CardDescription>
                            </div>
                            <Link href="/front-desk" className="text-xs font-medium text-primary flex items-center gap-1 hover:underline">
                                Front Desk <ArrowRight className="h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border">
                                {todayArrivals.map((res) => (
                                    <div key={res.id} className="py-3 flex items-center gap-3">
                                        {/* Guest avatar circle */}
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">
                                            {res.guest?.first_name?.[0]}{res.guest?.last_name?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-foreground truncate">
                                                {res.guest?.first_name} {res.guest?.last_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Room {res.room?.room_number || 'Unassigned'} • #{res.booking_number}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <Badge variant="outline" className="capitalize text-xs border-emerald-500 text-emerald-600 bg-emerald-50">
                                                {res.booking_status}
                                            </Badge>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                {res.total_nights} nights • {currency}{Number(res.total_amount).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {todayArrivals.length === 0 && (
                                    <div className="py-8 text-center text-muted-foreground text-xs">
                                        No pending arrivals for today.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Today's Expected Departures */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <LogOut className="h-4 w-4 text-orange-500" /> Today's Departures ({todayDepartures.length})
                                </CardTitle>
                                <CardDescription>Checked-in guests scheduled to depart today</CardDescription>
                            </div>
                            <Link href="/front-desk" className="text-xs font-medium text-primary flex items-center gap-1 hover:underline">
                                Checkout Board <ArrowRight className="h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border">
                                {todayDepartures.map((res) => (
                                    <div key={res.id} className="py-3 flex items-center gap-3">
                                        {/* Guest avatar circle */}
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
                                            {res.guest?.first_name?.[0]}{res.guest?.last_name?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-foreground truncate">
                                                {res.guest?.first_name} {res.guest?.last_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Room {res.room?.room_number} • #{res.booking_number}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <Badge variant="outline" className="capitalize text-xs border-orange-500 text-orange-600 bg-orange-50">
                                                In-House
                                            </Badge>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                Due: {currency}{(Number(res.total_amount) - Number(res.paid_amount)).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {todayDepartures.length === 0 && (
                                    <div className="py-8 text-center">
                                        <CalendarRange className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground">No scheduled checkouts for today.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Module Navigation Grid */}
                <div>
                    <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">
                        Hotel Department Shortcuts
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        <Link
                            href="/front-desk"
                            className="flex items-center gap-3 p-4 rounded-xl border bg-white dark:bg-card hover:shadow-md hover:border-indigo-200 transition-all group"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                                <LogIn className="h-5 w-5 text-indigo-600" />
                            </div>
                            <span className="flex-1 font-semibold text-sm text-foreground">Front Desk</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-indigo-500 transition-colors" />
                        </Link>

                        <Link
                            href="/restaurant"
                            className="flex items-center gap-3 p-4 rounded-xl border bg-white dark:bg-card hover:shadow-md hover:border-emerald-200 transition-all group"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                                <UtensilsCrossed className="h-5 w-5 text-emerald-600" />
                            </div>
                            <span className="flex-1 font-semibold text-sm text-foreground">Restaurant POS</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-emerald-500 transition-colors" />
                        </Link>

                        <Link
                            href="/housekeeping"
                            className="flex items-center gap-3 p-4 rounded-xl border bg-white dark:bg-card hover:shadow-md hover:border-violet-200 transition-all group"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 group-hover:bg-violet-200 transition-colors">
                                <Sparkles className="h-5 w-5 text-violet-600" />
                            </div>
                            <span className="flex-1 font-semibold text-sm text-foreground">Housekeeping</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-violet-500 transition-colors" />
                        </Link>

                        <Link
                            href="/inventory"
                            className="flex items-center gap-3 p-4 rounded-xl border bg-white dark:bg-card hover:shadow-md hover:border-amber-200 transition-all group"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 group-hover:bg-amber-200 transition-colors">
                                <Boxes className="h-5 w-5 text-amber-600" />
                            </div>
                            <span className="flex-1 font-semibold text-sm text-foreground">Inventory</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-amber-500 transition-colors" />
                        </Link>

                        <Link
                            href="/reports"
                            className="flex items-center gap-3 p-4 rounded-xl border bg-white dark:bg-card hover:shadow-md hover:border-blue-200 transition-all group"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="flex-1 font-semibold text-sm text-foreground">Reports & P&L</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-blue-500 transition-colors" />
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
