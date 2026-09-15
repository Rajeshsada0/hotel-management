<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Hotel;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\RestaurantOrder;
use App\Models\Room;
use App\Models\RoomType;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the hotel operations dashboard with live real-time metrics.
     */
    public function index(Request $request): Response
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $totalRooms = Room::count();
        $occupiedRooms = Room::where('status', 'occupied')->count();
        $availableRooms = Room::where('status', 'available')->count();
        $reservedRooms = Room::where('status', 'reserved')->count();
        $dirtyRooms = Room::where('status', 'dirty')->count();
        $cleaningRooms = Room::where('status', 'cleaning')->count();
        $cleanRooms = $availableRooms;

        $checkInsToday = Reservation::whereDate('check_in_date', today())
            ->whereIn('booking_status', ['confirmed', 'checked_in'])
            ->count();

        $checkOutsToday = Reservation::whereDate('check_out_date', today())
            ->whereIn('booking_status', ['checked_in', 'checked_out'])
            ->count();

        $todayRevenue = (float) Payment::whereDate('payment_date', today())->sum('amount');
        $todayRestaurantSales = (float) RestaurantOrder::whereDate('created_at', today())
            ->where('payment_status', 'paid')
            ->sum('total_amount');

        $pendingPayments = (float) Invoice::whereIn('status', ['unpaid', 'partially_paid'])
            ->sum(DB::raw('total_amount - paid_amount'));

        $thisMonthExpenses = (float) Expense::whereYear('expense_date', now()->year)
            ->whereMonth('expense_date', now()->month)
            ->sum('amount');

        $occupancyRate = $totalRooms > 0 ? (int) round(($occupiedRooms / $totalRooms) * 100) : 0;

        $summary = [
            'total_rooms' => $totalRooms,
            'available_rooms' => $availableRooms,
            'occupied_rooms' => $occupiedRooms,
            'reserved_rooms' => $reservedRooms,
            'dirty_rooms' => $dirtyRooms,
            'cleaning_rooms' => $cleaningRooms,
            'clean_rooms' => $cleanRooms,
            'check_ins_today' => $checkInsToday,
            'check_outs_today' => $checkOutsToday,
            'today_revenue' => $todayRevenue,
            'today_restaurant_sales' => $todayRestaurantSales,
            'this_month_expenses' => $thisMonthExpenses,
            'pending_payments' => max(0, $pendingPayments),
            'occupancy_rate' => $occupancyRate,
        ];

        // 7-day revenue trend
        $revenueTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = Carbon::today()->subDays($i);
            $roomRev = (float) Payment::whereDate('payment_date', $day)->sum('amount');
            $restRev = (float) RestaurantOrder::whereDate('created_at', $day)
                ->whereIn('payment_method', ['cash', 'card'])
                ->where('payment_status', 'paid')
                ->sum('total_amount');

            $revenueTrend[] = [
                'date' => $day->format('M d'),
                'day' => $day->format('D'),
                'room_revenue' => $roomRev,
                'restaurant_revenue' => $restRev,
                'total' => $roomRev + $restRev,
            ];
        }

        // Room Type Occupancy Breakdown
        $roomTypesBreakdown = RoomType::withCount('rooms')
            ->get()
            ->map(function ($type) {
                $occupied = Room::where('room_type_id', $type->id)
                    ->where('status', 'occupied')
                    ->count();

                $rate = $type->rooms_count > 0 ? (int)round(($occupied / $type->rooms_count) * 100) : 0;

                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'base_price' => (float)$type->base_price,
                    'total_rooms' => $type->rooms_count,
                    'occupied_rooms' => $occupied,
                    'occupancy_rate' => $rate,
                ];
            });

        // Recent guest movements
        $recentBookings = Reservation::with(['guest', 'room', 'roomType'])
            ->latest()
            ->take(5)
            ->get();

        $todayArrivals = Reservation::with(['guest', 'room', 'roomType'])
            ->whereDate('check_in_date', today())
            ->where('booking_status', 'confirmed')
            ->take(5)
            ->get();

        $todayDepartures = Reservation::with(['guest', 'room', 'roomType'])
            ->whereDate('check_out_date', today())
            ->where('booking_status', 'checked_in')
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'hotel' => $hotel,
            'summary' => $summary,
            'revenueTrend' => $revenueTrend,
            'roomTypesBreakdown' => $roomTypesBreakdown,
            'recentBookings' => $recentBookings,
            'todayArrivals' => $todayArrivals,
            'todayDepartures' => $todayDepartures,
        ]);
    }
}
