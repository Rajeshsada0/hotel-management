import { Head, Link } from '@inertiajs/react';
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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

    // Calculate max value for 7-day trend chart scaling
    const maxTrendRevenue = Math.max(...revenueTrend.map((d) => d.total), 100);

    return (
        <>
            <Head title="Hotel Executive Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Top Banner / Hotel Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border p-6">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-medium text-sm">
                            <Building2 className="h-4 w-4" />
                            <span>{hotel?.code ? `[${hotel.code}]` : ''} {hotel?.city ? `${hotel.city}, ${hotel.country}` : 'Hotel Operations'}</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                            {hotel?.name || 'Hotel Management System'}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Live occupancy, daily revenue, front desk operations, and department activity.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/reports">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Analytics & Reports
                            </Link>
                        </Button>
                        <Button variant="default" size="sm" asChild>
                            <Link href="/reservations/create">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Booking
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Today's Summary Stat Cards (Section 3) */}
                <div>
                    <h2 className="text-base font-semibold text-foreground mb-3 flex items-center justify-between">
                        <span>Today's Real-Time Summary</span>
                        <span className="text-xs font-normal text-muted-foreground">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                        {/* Total Rooms */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-medium text-muted-foreground">Occupancy</CardTitle>
                                <BedDouble className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">{summary.occupancy_rate}%</div>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    {summary.occupied_rooms} of {summary.total_rooms} rooms occupied
                                </p>
                            </CardContent>
                        </Card>

                        {/* Available Rooms */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-medium text-muted-foreground">Available</CardTitle>
                                <DoorOpen className="h-4 w-4 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-600">{summary.available_rooms}</div>
                                <p className="text-[11px] text-muted-foreground mt-1">Ready for check-in</p>
                            </CardContent>
                        </Card>

                        {/* Housekeeping Flow */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-medium text-muted-foreground">Housekeeping</CardTitle>
                                <Sparkles className="h-4 w-4 text-violet-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-bold text-rose-600">{summary.dirty_rooms}</span>
                                    <span className="text-xs text-muted-foreground">dirty</span>
                                    <span className="text-muted-foreground">/</span>
                                    <span className="text-lg font-semibold text-amber-600">{summary.cleaning_rooms || 0}</span>
                                    <span className="text-xs text-muted-foreground">cleaning</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">Room turnover queue</p>
                            </CardContent>
                        </Card>

                        {/* Check-ins & Check-outs Today */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-medium text-muted-foreground">Movements Today</CardTitle>
                                <CalendarRange className="h-4 w-4 text-indigo-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-indigo-600">+{summary.check_ins_today}</span>
                                    <span className="text-xs text-muted-foreground">in</span>
                                    <span className="text-muted-foreground">/</span>
                                    <span className="text-xl font-bold text-orange-600">-{summary.check_outs_today}</span>
                                    <span className="text-xs text-muted-foreground">out</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">Arrivals & departures</p>
                            </CardContent>
                        </Card>

                        {/* Today's Revenue */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-medium text-muted-foreground">Today's Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-600">
                                    {currency}{summary.today_revenue.toFixed(2)}
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    +{currency}{(summary.today_restaurant_sales || 0).toFixed(2)} POS sales
                                </p>
                            </CardContent>
                        </Card>

                        {/* Pending Payments */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-medium text-muted-foreground">Pending Folios</CardTitle>
                                <Clock className="h-4 w-4 text-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-600">
                                    {currency}{summary.pending_payments.toFixed(2)}
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">Unpaid guest balances</p>
                            </CardContent>
                        </Card>
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
                            <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2">
                                {revenueTrend.map((item, idx) => {
                                    const heightPct = Math.max(8, Math.min(100, Math.round((item.total / maxTrendRevenue) * 100)));

                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                            <div className="text-[11px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                {currency}{Math.round(item.total)}
                                            </div>
                                            <div className="w-full bg-muted/40 rounded-t-md flex flex-col justify-end overflow-hidden h-36">
                                                <div
                                                    className="w-full bg-primary/80 hover:bg-primary transition-all rounded-t-md"
                                                    style={{ height: `${heightPct}%` }}
                                                    title={`${item.day} (${item.date}): Room ${currency}${item.room_revenue}, POS ${currency}${item.restaurant_revenue}`}
                                                />
                                            </div>
                                            <div className="text-center">
                                                <span className="text-xs font-semibold block text-foreground">{item.day}</span>
                                                <span className="text-[10px] text-muted-foreground block">{item.date}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-primary/80" />
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
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <LogIn className="h-4 w-4 text-indigo-600" /> Today's Arrivals ({todayArrivals.length})
                                </CardTitle>
                                <CardDescription>Guests scheduled to check in today</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="text-xs">
                                <Link href="/front-desk">Front Desk <ArrowRight className="h-3 w-3 ml-1" /></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border">
                                {todayArrivals.map((res) => (
                                    <div key={res.id} className="py-2.5 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-sm text-foreground">
                                                {res.guest?.first_name} {res.guest?.last_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono">
                                                Room {res.room?.room_number || 'Unassigned'} • #{res.booking_number}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="capitalize text-xs border-indigo-500 text-indigo-600">
                                                {res.booking_status}
                                            </Badge>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                {res.total_nights} nights • {currency}{Number(res.total_amount).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {todayArrivals.length === 0 && (
                                    <div className="py-6 text-center text-muted-foreground text-xs">
                                        No pending arrivals for today.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Today's Expected Departures */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <LogOut className="h-4 w-4 text-orange-600" /> Today's Departures ({todayDepartures.length})
                                </CardTitle>
                                <CardDescription>Checked-in guests scheduled to depart today</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="text-xs">
                                <Link href="/front-desk">Checkout Board <ArrowRight className="h-3 w-3 ml-1" /></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border">
                                {todayDepartures.map((res) => (
                                    <div key={res.id} className="py-2.5 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-sm text-foreground">
                                                {res.guest?.first_name} {res.guest?.last_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono">
                                                Room {res.room?.room_number} • #{res.booking_number}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="capitalize text-xs border-orange-500 text-orange-600">
                                                In-House
                                            </Badge>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                Due: {currency}{(Number(res.total_amount) - Number(res.paid_amount)).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {todayDepartures.length === 0 && (
                                    <div className="py-6 text-center text-muted-foreground text-xs">
                                        No scheduled checkouts for today.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Module Navigation Grid */}
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                        Hotel Department Shortcuts
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        <Link
                            href="/front-desk"
                            className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-all flex flex-col items-center text-center gap-2 group"
                        >
                            <LogIn className="h-6 w-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-xs text-foreground">Front Desk</span>
                        </Link>

                        <Link
                            href="/restaurant"
                            className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-all flex flex-col items-center text-center gap-2 group"
                        >
                            <UtensilsCrossed className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-xs text-foreground">Restaurant POS</span>
                        </Link>

                        <Link
                            href="/housekeeping"
                            className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-all flex flex-col items-center text-center gap-2 group"
                        >
                            <Sparkles className="h-6 w-6 text-violet-600 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-xs text-foreground">Housekeeping</span>
                        </Link>

                        <Link
                            href="/inventory"
                            className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-all flex flex-col items-center text-center gap-2 group"
                        >
                            <Boxes className="h-6 w-6 text-amber-600 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-xs text-foreground">Inventory</span>
                        </Link>

                        <Link
                            href="/reports"
                            className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-all flex flex-col items-center text-center gap-2 group"
                        >
                            <BarChart3 className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-xs text-foreground">Reports & P&L</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
