<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Hotel;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\RestaurantOrder;
use App\Models\RestaurantOrderItem;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\ServiceOrder;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Get aggregated financial report (Revenue, Expenses, Net Profit, Taxes, Payment Methods).
     */
    public function getFinancialSummary(CarbonInterface $startDate, CarbonInterface $endDate, ?int $hotelId = null): array
    {
        $hotel = $hotelId ? Hotel::find($hotelId) : (Hotel::current() ?? Hotel::first());

        // 1. Room Revenue (Collected payments linked to reservations or room stay invoices)
        $roomPaymentsQuery = Payment::whereBetween('payment_date', [$startDate->toDateString(), $endDate->toDateString()]);
        if ($hotel) {
            $roomPaymentsQuery->where('hotel_id', $hotel->id);
        }
        $totalCollectedPayments = (float)$roomPaymentsQuery->sum('amount');

        // 2. Restaurant Direct Revenue (Orders paid via cash or card directly at restaurant)
        $restaurantQuery = RestaurantOrder::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereIn('payment_method', ['cash', 'card'])
            ->where('payment_status', 'paid');
        if ($hotel) {
            $restaurantQuery->where('hotel_id', $hotel->id);
        }
        $restaurantDirectRevenue = (float)$restaurantQuery->sum('total_amount');

        // 3. Hotel Services Revenue (Total charged service orders)
        $serviceOrdersQuery = ServiceOrder::whereBetween('ordered_at', [$startDate->startOfDay(), $endDate->endOfDay()]);
        if ($hotel) {
            $serviceOrdersQuery->where('hotel_id', $hotel->id);
        }
        $servicesRevenue = (float)$serviceOrdersQuery->sum('total_price');

        // Combined Revenue: Collected Payments + Restaurant Direct (charges to room are collected through invoice payments)
        $grossRevenue = $totalCollectedPayments + $restaurantDirectRevenue;

        // 4. Operational Expenses
        $expenseQuery = Expense::whereBetween('expense_date', [$startDate->toDateString(), $endDate->toDateString()]);
        if ($hotel) {
            $expenseQuery->where('hotel_id', $hotel->id);
        }
        $totalExpenses = (float)$expenseQuery->sum('amount');

        // Category breakdown of expenses
        $expensesByCategory = (clone $expenseQuery)
            ->select('category', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category,
                'total' => (float)$row->total,
                'count' => (int)$row->count,
            ])
            ->values()
            ->toArray();

        // 5. Net Profit
        $netProfit = $grossRevenue - $totalExpenses;
        $profitMargin = $grossRevenue > 0 ? round(($netProfit / $grossRevenue) * 100, 1) : 0;

        // 6. Payment Methods distribution
        $paymentMethods = (clone $roomPaymentsQuery)
            ->select('payment_method', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($row) => [
                'method' => $row->payment_method,
                'total' => (float)$row->total,
                'count' => (int)$row->count,
            ])
            ->values()
            ->toArray();

        return [
            'gross_revenue' => $grossRevenue,
            'room_payments' => $totalCollectedPayments,
            'restaurant_direct_revenue' => $restaurantDirectRevenue,
            'services_revenue' => $servicesRevenue,
            'total_expenses' => $totalExpenses,
            'net_profit' => $netProfit,
            'profit_margin' => $profitMargin,
            'expenses_by_category' => $expensesByCategory,
            'payment_methods' => $paymentMethods,
        ];
    }

    /**
     * Get booking and occupancy metrics for date period.
     */
    public function getOccupancyAndBookingReport(CarbonInterface $startDate, CarbonInterface $endDate, ?int $hotelId = null): array
    {
        $hotel = $hotelId ? Hotel::find($hotelId) : (Hotel::current() ?? Hotel::first());

        $totalRooms = Room::when($hotel, fn ($q) => $q->where('hotel_id', $hotel->id))->count();
        $daysCount = max(1, $startDate->diffInDays($endDate) + 1);
        $totalAvailableRoomNights = $totalRooms * $daysCount;

        // Reservations active during this window
        $reservationsQuery = Reservation::when($hotel, fn ($q) => $q->where('hotel_id', $hotel->id))
            ->whereDate('check_in_date', '<=', $endDate->toDateString())
            ->whereDate('check_out_date', '>=', $startDate->toDateString());

        $totalBookings = (clone $reservationsQuery)->count();
        $checkedInCount = (clone $reservationsQuery)->where('booking_status', 'checked_in')->count();
        $checkedOutCount = (clone $reservationsQuery)->where('booking_status', 'checked_out')->count();
        $confirmedCount = (clone $reservationsQuery)->where('booking_status', 'confirmed')->count();
        $cancelledCount = (clone $reservationsQuery)->where('booking_status', 'cancelled')->count();

        // Calculate booked room nights
        $bookedNights = (clone $reservationsQuery)
            ->whereIn('booking_status', ['confirmed', 'checked_in', 'checked_out'])
            ->sum('total_nights');

        $occupancyRate = $totalAvailableRoomNights > 0
            ? min(100, (int)round(($bookedNights / $totalAvailableRoomNights) * 100))
            : 0;

        // Booking sources breakdown
        $bookingSources = (clone $reservationsQuery)
            ->select('booking_source', DB::raw('COUNT(*) as count'))
            ->groupBy('booking_source')
            ->get()
            ->map(fn ($row) => [
                'source' => $row->booking_source,
                'count' => (int)$row->count,
            ])
            ->values()
            ->toArray();

        // Performance by Room Type
        $roomTypes = RoomType::when($hotel, fn ($q) => $q->where('hotel_id', $hotel->id))
            ->withCount('rooms')
            ->get()
            ->map(function ($rt) use ($startDate, $endDate) {
                $bookings = Reservation::where('room_type_id', $rt->id)
                    ->whereDate('check_in_date', '<=', $endDate->toDateString())
                    ->whereDate('check_out_date', '>=', $startDate->toDateString())
                    ->whereIn('booking_status', ['confirmed', 'checked_in', 'checked_out'])
                    ->get();

                $revenue = (float)$bookings->sum('total_amount');
                $nights = (int)$bookings->sum('total_nights');

                return [
                    'id' => $rt->id,
                    'name' => $rt->name,
                    'base_price' => (float)$rt->base_price,
                    'rooms_count' => $rt->rooms_count,
                    'bookings_count' => $bookings->count(),
                    'total_nights' => $nights,
                    'revenue' => $revenue,
                ];
            })
            ->toArray();

        return [
            'total_rooms' => $totalRooms,
            'days_count' => $daysCount,
            'total_available_room_nights' => $totalAvailableRoomNights,
            'booked_nights' => $bookedNights,
            'occupancy_rate' => $occupancyRate,
            'total_bookings' => $totalBookings,
            'confirmed_count' => $confirmedCount,
            'checked_in_count' => $checkedInCount,
            'checked_out_count' => $checkedOutCount,
            'cancelled_count' => $cancelledCount,
            'booking_sources' => $bookingSources,
            'room_types' => $roomTypes,
        ];
    }

    /**
     * Get top selling restaurant dishes for the period.
     */
    public function getTopSellingDishes(CarbonInterface $startDate, CarbonInterface $endDate, int $limit = 5): array
    {
        return RestaurantOrderItem::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->select('product_name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(total_price) as total_sales'))
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->take($limit)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->product_name,
                'quantity' => (float)$row->total_qty,
                'sales' => (float)$row->total_sales,
            ])
            ->toArray();
    }
}
