import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    Printer,
    DollarSign,
    TrendingUp,
    TrendingDown,
    BedDouble,
    UtensilsCrossed,
    Wallet,
    CreditCard,
    ArrowUpRight,
    Sparkles,
    Users,
    Percent,
    PieChart,
    Building2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { FinancialReport, Hotel, OccupancyReport, TopDishReport } from '@/types';

type ReportsProps = {
    hotel?: Hotel | null;
    period: string;
    startDate: string;
    endDate: string;
    financial: FinancialReport;
    occupancy: OccupancyReport;
    topDishes: TopDishReport[];
};

export default function ReportsIndex({
    hotel,
    period,
    startDate,
    endDate,
    financial,
    occupancy,
    topDishes,
}: ReportsProps) {
    const currency = hotel?.currency_symbol || '$';

    const handlePeriodChange = (newPeriod: string) => {
        router.get('/reports', { period: newPeriod }, { preserveState: true });
    };

    const isProfitable = financial.net_profit >= 0;

    return (
        <AppLayout breadcrumbs={[{ title: 'Reports & Analytics', href: '/reports' }]}>
            <Head title="Hotel Reports & Analytics" />

            <div className="flex flex-col gap-6 p-6 print:p-0">
                {/* Header & Filter Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-primary" /> Reports & Business Analytics
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Audited financial statements, room occupancy performance, departmental revenue, and expenses.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                        >
                            <Printer className="h-4 w-4 mr-1.5" /> Print / Export
                        </Button>
                    </div>
                </div>

                {/* Date Period Filter Pills */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 print:hidden">
                    <div className="flex flex-wrap gap-1.5">
                        {[
                            { key: 'today', label: 'Today' },
                            { key: '7_days', label: 'Last 7 Days' },
                            { key: 'this_month', label: 'This Month' },
                            { key: '30_days', label: 'Last 30 Days' },
                            { key: 'year', label: 'Year to Date' },
                        ].map((p) => (
                            <Button
                                key={p.key}
                                variant={period === p.key ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePeriodChange(p.key)}
                                className="text-xs rounded-full"
                            >
                                {p.label}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Reporting Window:</span>
                        <span className="font-semibold text-foreground">{startDate}</span>
                        <span>to</span>
                        <span className="font-semibold text-foreground">{endDate}</span>
                    </div>
                </div>

                {/* Executive Summary P&L KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Gross Revenue */}
                    <Card className="border-emerald-500/30 bg-emerald-500/5">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                    Gross Revenue
                                </CardDescription>
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {currency}{financial.gross_revenue.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-xs text-muted-foreground">
                                Rooms ({currency}{financial.room_payments.toFixed(2)}) + POS ({currency}{financial.restaurant_direct_revenue.toFixed(2)})
                            </span>
                        </CardContent>
                    </Card>

                    {/* Operational Expenses */}
                    <Card className="border-rose-500/30 bg-rose-500/5">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-rose-700 dark:text-rose-400 font-semibold">
                                    Operational Expenses
                                </CardDescription>
                                <TrendingDown className="h-4 w-4 text-rose-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                                {currency}{financial.total_expenses.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-xs text-muted-foreground">
                                Utilities, supplies, maintenance, payroll
                            </span>
                        </CardContent>
                    </Card>

                    {/* Net Operating Profit */}
                    <Card className={`border-2 ${isProfitable ? 'border-emerald-500/50' : 'border-rose-500/50'}`}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription className="font-semibold text-foreground">
                                    Net Operating Profit
                                </CardDescription>
                                <DollarSign className={`h-4 w-4 ${isProfitable ? 'text-emerald-600' : 'text-rose-600'}`} />
                            </div>
                            <CardTitle className={`text-2xl font-bold ${isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {isProfitable ? '+' : ''}{currency}{financial.net_profit.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Badge variant={isProfitable ? 'outline' : 'destructive'} className="text-[10px] px-1.5 py-0">
                                    {financial.profit_margin}% Margin
                                </Badge>
                                <span className="text-xs text-muted-foreground">Profit margin</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Overall Occupancy Rate */}
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription className="font-semibold">Average Occupancy</CardDescription>
                                <Percent className="h-4 w-4 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-primary">
                                {occupancy.occupancy_rate}%
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-xs text-muted-foreground">
                                {occupancy.booked_nights} of {occupancy.total_available_room_nights} room nights sold
                            </span>
                        </CardContent>
                    </Card>
                </div>

                {/* Financial Breakdown & Revenue Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Revenue Streams Distribution (6 Cols) */}
                    <Card className="lg:col-span-6">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-emerald-600" /> Revenue Stream Composition
                            </CardTitle>
                            <CardDescription>Income breakdown across rooms, dining, and hotel services</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Room Revenue */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <BedDouble className="h-3.5 w-3.5 text-blue-600" /> Room Accommodation
                                    </span>
                                    <span className="font-bold text-foreground">
                                        {currency}{financial.room_payments.toFixed(2)}
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-full rounded-full"
                                        style={{
                                            width: `${financial.gross_revenue > 0 ? (financial.room_payments / financial.gross_revenue) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Restaurant Direct Revenue */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <UtensilsCrossed className="h-3.5 w-3.5 text-emerald-600" /> Restaurant & POS Direct
                                    </span>
                                    <span className="font-bold text-foreground">
                                        {currency}{financial.restaurant_direct_revenue.toFixed(2)}
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-emerald-600 h-full rounded-full"
                                        style={{
                                            width: `${financial.gross_revenue > 0 ? (financial.restaurant_direct_revenue / financial.gross_revenue) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Hotel Services Folio Charges */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5 text-violet-600" /> Hotel Amenities & Services
                                    </span>
                                    <span className="font-bold text-foreground">
                                        {currency}{financial.services_revenue.toFixed(2)}
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-violet-600 h-full rounded-full"
                                        style={{
                                            width: `${financial.gross_revenue > 0 ? (financial.services_revenue / financial.gross_revenue) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Payment Methods Breakdown */}
                            <div className="pt-4 border-t border-border">
                                <span className="text-xs font-semibold text-muted-foreground uppercase block mb-2">
                                    Payment Methods Collected
                                </span>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    {financial.payment_methods.map((pm) => (
                                        <div key={pm.method} className="p-2 border rounded-lg bg-muted/20">
                                            <span className="text-[10px] text-muted-foreground uppercase block font-medium">
                                                {pm.method.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-sm font-bold text-foreground">
                                                {currency}{pm.total.toFixed(2)}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground block">
                                                {pm.count} txns
                                            </span>
                                        </div>
                                    ))}
                                    {financial.payment_methods.length === 0 && (
                                        <div className="col-span-3 text-xs text-muted-foreground py-2">
                                            No payment records in this window.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Operational Expenses by Category (6 Cols) */}
                    <Card className="lg:col-span-6">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-rose-600" /> Operational Expense Distribution
                            </CardTitle>
                            <CardDescription>Breakdown of hotel overhead, utilities, and procurement</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {financial.expenses_by_category.map((exp) => {
                                const pct = financial.total_expenses > 0
                                    ? Math.round((exp.total / financial.total_expenses) * 100)
                                    : 0;

                                return (
                                    <div key={exp.category} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="capitalize font-medium text-foreground">
                                                {exp.category.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-muted-foreground font-semibold">
                                                {currency}{exp.total.toFixed(2)} ({pct}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-rose-500 h-full rounded-full"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            {financial.expenses_by_category.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground text-xs">
                                    No expenses logged for this reporting period.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Room Types Performance Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <BedDouble className="h-4 w-4 text-primary" /> Room Type Performance & Utilization
                        </CardTitle>
                        <CardDescription>Accommodations revenue contribution and total nights booked</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b text-xs font-semibold uppercase text-muted-foreground bg-muted/40">
                                    <tr>
                                        <th className="p-3">Room Type</th>
                                        <th className="p-3">Base Price</th>
                                        <th className="p-3">Total Rooms</th>
                                        <th className="p-3">Bookings Count</th>
                                        <th className="p-3">Nights Booked</th>
                                        <th className="p-3">Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {occupancy.room_types.map((rt) => (
                                        <tr key={rt.id} className="hover:bg-muted/20">
                                            <td className="p-3 font-semibold text-foreground">
                                                {rt.name}
                                            </td>
                                            <td className="p-3 text-muted-foreground text-xs">
                                                {currency}{rt.base_price.toFixed(2)} / night
                                            </td>
                                            <td className="p-3 font-medium">
                                                {rt.rooms_count}
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline">{rt.bookings_count} bookings</Badge>
                                            </td>
                                            <td className="p-3 font-semibold">
                                                {rt.total_nights} nights
                                            </td>
                                            <td className="p-3 font-bold text-primary">
                                                {currency}{rt.revenue.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    {occupancy.room_types.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-6 text-center text-muted-foreground">
                                                No room types found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Operational Details: Booking Sources & Top Restaurant Dishes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Booking Sources Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Users className="h-4 w-4 text-indigo-600" /> Booking Channels & Sources
                            </CardTitle>
                            <CardDescription>Where guests discovered and reserved accommodations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {occupancy.booking_sources.map((bs) => {
                                    const pct = occupancy.total_bookings > 0
                                        ? Math.round((bs.count / occupancy.total_bookings) * 100)
                                        : 0;

                                    return (
                                        <div key={bs.source} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="capitalize font-medium text-foreground">
                                                    {bs.source.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-muted-foreground font-semibold">
                                                    {bs.count} bookings ({pct}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-indigo-600 h-full rounded-full"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}

                                {occupancy.booking_sources.length === 0 && (
                                    <div className="py-6 text-center text-muted-foreground text-xs">
                                        No bookings recorded in this period.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Selling Restaurant Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <UtensilsCrossed className="h-4 w-4 text-emerald-600" /> Top Selling Restaurant Items
                            </CardTitle>
                            <CardDescription>Most popular dishes and beverages ordered by volume</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border">
                                {topDishes.map((dish, i) => (
                                    <div key={dish.name} className="py-2.5 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-muted-foreground w-4">
                                                #{i + 1}
                                            </span>
                                            <span className="text-sm font-medium text-foreground">
                                                {dish.name}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-primary block">
                                                {currency}{dish.sales.toFixed(2)}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                {dish.quantity} orders
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {topDishes.length === 0 && (
                                    <div className="py-6 text-center text-muted-foreground text-xs">
                                        No restaurant sales recorded in this period.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
