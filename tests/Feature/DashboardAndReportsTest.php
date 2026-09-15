<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Guest;
use App\Models\Hotel;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\RestaurantCategory;
use App\Models\RestaurantOrder;
use App\Models\RestaurantProduct;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use App\Services\ReportService;
use App\Services\ReservationService;
use App\Services\RestaurantService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardAndReportsTest extends TestCase
{
    use RefreshDatabase;

    protected Hotel $hotel;
    protected User $user;
    protected RoomType $roomType;
    protected Room $room;
    protected Guest $guest;
    protected Reservation $reservation;
    protected ReportService $reportService;
    protected ReservationService $reservationService;
    protected RestaurantService $restaurantService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->reportService = app(ReportService::class);
        $this->reservationService = app(ReservationService::class);
        $this->restaurantService = app(RestaurantService::class);

        $this->hotel = Hotel::create([
            'name' => 'Grand Horizon Hotel',
            'code' => 'GH-01',
            'address' => '100 Ocean Blvd',
            'city' => 'Miami',
            'country' => 'United States',
            'phone' => '+1 555-000-1111',
            'email' => 'contact@grandhorizon.com',
            'currency' => 'USD',
            'currency_symbol' => '$',
            'check_in_time' => '14:00',
            'check_out_time' => '11:00',
            'status' => 'active',
        ]);

        $this->user = User::factory()->create(['role' => 'super_admin']);

        $this->roomType = RoomType::create([
            'hotel_id' => $this->hotel->id,
            'name' => 'Ocean Suite',
            'slug' => 'ocean-suite',
            'base_price' => 200.00,
            'max_adults' => 2,
            'max_children' => 2,
            'status' => 'active',
        ]);

        $this->room = Room::create([
            'hotel_id' => $this->hotel->id,
            'room_type_id' => $this->roomType->id,
            'room_number' => '501',
            'floor' => 5,
            'status' => 'occupied',
            'housekeeping_status' => 'clean',
        ]);

        $this->guest = Guest::create([
            'hotel_id' => $this->hotel->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '+1-555-0100',
        ]);

        // Create checked-in reservation with payment
        $this->reservation = $this->reservationService->createReservation([
            'guest_id' => $this->guest->id,
            'room_type_id' => $this->roomType->id,
            'room_id' => $this->room->id,
            'check_in_date' => now()->startOfMonth()->toDateString(),
            'check_out_date' => now()->startOfMonth()->addDays(2)->toDateString(),
            'adults' => 2,
            'children' => 0,
        ], $this->user->id);

        $this->reservationService->checkIn($this->reservation);
        $this->reservation->refresh();

        // Record a room payment
        Payment::create([
            'hotel_id' => $this->hotel->id,
            'invoice_id' => $this->reservation->invoice->id,
            'reservation_id' => $this->reservation->id,
            'guest_id' => $this->guest->id,
            'payment_number' => 'PAY-TEST-001',
            'amount' => 400.00,
            'payment_method' => 'card',
            'payment_date' => now()->toDateString(),
        ]);

        // Record an expense
        Expense::create([
            'hotel_id' => $this->hotel->id,
            'expense_number' => 'EXP-TEST-001',
            'category' => 'electricity',
            'amount' => 150.00,
            'expense_date' => now()->toDateString(),
            'payment_method' => 'bank_transfer',
            'description' => 'Grid utility',
        ]);
    }

    public function test_dashboard_screen_renders_with_trends_and_occupancy(): void
    {
        $response = $this->actingAs($this->user)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('summary')
            ->has('revenueTrend')
            ->has('roomTypesBreakdown')
            ->has('recentBookings')
            ->has('todayArrivals')
            ->has('todayDepartures')
        );
    }

    public function test_reports_screen_can_be_rendered_with_default_period(): void
    {
        $response = $this->actingAs($this->user)->get('/reports');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('reports/index')
            ->has('financial')
            ->has('occupancy')
            ->has('topDishes')
            ->where('period', 'this_month')
        );
    }

    public function test_reports_screen_renders_with_different_periods(): void
    {
        foreach (['today', '7_days', '30_days', 'year'] as $period) {
            $response = $this->actingAs($this->user)->get("/reports?period={$period}");
            $response->assertStatus(200);
            $response->assertInertia(fn ($page) => $page
                ->where('period', $period)
            );
        }
    }

    public function test_financial_report_calculations(): void
    {
        $startDate = now()->startOfMonth();
        $endDate = now()->endOfMonth();

        $summary = $this->reportService->getFinancialSummary($startDate, $endDate, $this->hotel->id);

        $this->assertEquals(400.00, $summary['gross_revenue']);
        $this->assertEquals(400.00, $summary['room_payments']);
        $this->assertEquals(150.00, $summary['total_expenses']);
        $this->assertEquals(250.00, $summary['net_profit']); // 400 - 150
        $this->assertEquals(62.5, $summary['profit_margin']); // (250 / 400) * 100
        $this->assertNotEmpty($summary['expenses_by_category']);
        $this->assertNotEmpty($summary['payment_methods']);
    }

    public function test_occupancy_report_calculations(): void
    {
        $startDate = now()->startOfMonth();
        $endDate = now()->endOfMonth();

        $occupancy = $this->reportService->getOccupancyAndBookingReport($startDate, $endDate, $this->hotel->id);

        $this->assertEquals(1, $occupancy['total_rooms']);
        $this->assertGreaterThan(0, $occupancy['total_available_room_nights']);
        $this->assertGreaterThanOrEqual(2, $occupancy['booked_nights']);
        $this->assertGreaterThan(0, $occupancy['occupancy_rate']);
        $this->assertNotEmpty($occupancy['room_types']);
    }

    public function test_top_selling_dishes_report(): void
    {
        // Add restaurant category and dish
        $category = RestaurantCategory::create([
            'hotel_id' => $this->hotel->id,
            'name' => 'Beverages',
            'slug' => 'beverages',
            'status' => 'active',
        ]);

        $product = RestaurantProduct::create([
            'hotel_id' => $this->hotel->id,
            'category_id' => $category->id,
            'name' => 'Iced Latte',
            'code' => 'COF-01',
            'price' => 5.50,
            'is_available' => true,
        ]);

        // Place restaurant order
        $this->restaurantService->createOrder(
            [
                'payment_method' => 'cash',
                'discount' => 0,
            ],
            [
                [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => 4,
                    'unit_price' => 5.50,
                ],
            ],
            $this->user->id
        );

        $startDate = now()->startOfMonth();
        $endDate = now()->endOfMonth();

        $topDishes = $this->reportService->getTopSellingDishes($startDate, $endDate);

        $this->assertNotEmpty($topDishes);
        $this->assertEquals('Iced Latte', $topDishes[0]['name']);
        $this->assertEquals(4, (int)$topDishes[0]['quantity']);
        $this->assertEquals(22.00, (float)$topDishes[0]['sales']);
    }
}
