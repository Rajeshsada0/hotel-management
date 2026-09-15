<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Display comprehensive hotel business reports and analytics (Section 20).
     */
    public function index(Request $request): Response
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $period = $request->query('period', 'this_month');

        // Resolve dates based on selected period
        switch ($period) {
            case 'today':
                $startDate = Carbon::today();
                $endDate = Carbon::today();
                break;
            case '7_days':
                $startDate = Carbon::today()->subDays(6);
                $endDate = Carbon::today();
                break;
            case '30_days':
                $startDate = Carbon::today()->subDays(29);
                $endDate = Carbon::today();
                break;
            case 'year':
                $startDate = Carbon::now()->startOfYear();
                $endDate = Carbon::now()->endOfYear();
                break;
            case 'this_month':
            default:
                $period = 'this_month';
                $startDate = Carbon::now()->startOfMonth();
                $endDate = Carbon::now()->endOfMonth();
                break;
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $startDate = Carbon::parse($request->query('start_date'));
            $endDate = Carbon::parse($request->query('end_date'));
            $period = 'custom';
        }

        $financial = $this->reportService->getFinancialSummary($startDate, $endDate, $hotel?->id);
        $occupancy = $this->reportService->getOccupancyAndBookingReport($startDate, $endDate, $hotel?->id);
        $topDishes = $this->reportService->getTopSellingDishes($startDate, $endDate, 5);

        return Inertia::render('reports/index', [
            'hotel' => $hotel,
            'period' => $period,
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate->toDateString(),
            'financial' => $financial,
            'occupancy' => $occupancy,
            'topDishes' => $topDishes,
        ]);
    }
}
