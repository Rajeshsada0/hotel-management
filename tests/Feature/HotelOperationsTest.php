<?php

namespace Tests\Feature;

use App\Models\Guest;
use App\Models\Hotel;
use App\Models\Invoice;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use App\Services\InvoiceService;
use App\Services\ReservationService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class HotelOperationsTest extends TestCase
{
    use RefreshDatabase;

    protected Hotel $hotel;
    protected User $user;
    protected RoomType $roomType;
    protected Room $room;
    protected Guest $guest;
    protected ReservationService $reservationService;
    protected InvoiceService $invoiceService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->invoiceService = app(InvoiceService::class);
        $this->reservationService = app(ReservationService::class);

        $this->hotel = Hotel::create([
            'name' => 'Grand Horizon Hotel',
            'code' => 'GH-01',
            'address' => '100 Ocean Blvd',
            'city' => 'Miami',
            'country' => 'United States',
            'phone' => '+1 (555) 000-1111',
            'email' => 'admin@grandhorizon.com',
            'currency' => 'USD',
            'currency_symbol' => '$',
            'check_in_time' => '14:00',
            'check_out_time' => '11:00',
            'status' => 'active',
        ]);

        $this->user = User::factory()->create([
            'role' => 'super_admin',
        ]);

        $this->roomType = RoomType::create([
            'hotel_id' => $this->hotel->id,
            'name' => 'Deluxe King',
            'slug' => 'deluxe-king',
            'max_adults' => 2,
            'max_children' => 1,
            'base_price' => 150.00,
            'number_of_beds' => 1,
            'status' => 'active',
        ]);

        $this->room = Room::create([
            'hotel_id' => $this->hotel->id,
            'room_type_id' => $this->roomType->id,
            'room_number' => '101',
            'floor' => '1',
            'status' => 'available',
            'bed_type' => 'King',
            'capacity' => 2,
        ]);

        $this->guest = Guest::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone' => '+1 555-123-4567',
            'email' => 'john@example.com',
        ]);
    }

    public function test_room_availability_and_double_booking_prevention(): void
    {
        // Book room 101 from 2026-09-10 to 2026-09-15
        $this->reservationService->createReservation([
            'guest_id' => $this->guest->id,
            'room_type_id' => $this->roomType->id,
            'room_id' => $this->room->id,
            'check_in_date' => '2026-09-10',
            'check_out_date' => '2026-09-15',
            'adults' => 2,
            'children' => 0,
            'nightly_rate' => 150.00,
            'booking_source' => 'website',
        ], $this->user->id);

        // Test 1: Overlap 2026-09-12 to 2026-09-14 (Double booking attempt) -> MUST BE UNAVAILABLE
        $availableRooms = $this->reservationService->getAvailableRooms('2026-09-12', '2026-09-14', $this->roomType->id);
        $this->assertFalse($availableRooms->contains('id', $this->room->id));

        // Test 2: Double booking exception when creating reservation
        $this->expectException(ValidationException::class);
        $this->reservationService->createReservation([
            'guest_id' => $this->guest->id,
            'room_type_id' => $this->roomType->id,
            'room_id' => $this->room->id,
            'check_in_date' => '2026-09-12',
            'check_out_date' => '2026-09-14',
            'adults' => 2,
            'children' => 0,
            'nightly_rate' => 150.00,
        ], $this->user->id);
    }

    public function test_consecutive_booking_allowed(): void
    {
        // Book room 101 from 2026-09-10 to 2026-09-15
        $this->reservationService->createReservation([
            'guest_id' => $this->guest->id,
            'room_type_id' => $this->roomType->id,
            'room_id' => $this->room->id,
            'check_in_date' => '2026-09-10',
            'check_out_date' => '2026-09-15',
            'adults' => 2,
            'children' => 0,
            'nightly_rate' => 150.00,
            'booking_source' => 'website',
        ], $this->user->id);

        // Consecutive booking starting right on checkout date 2026-09-15 to 2026-09-18 -> MUST BE ALLOWED (Section 28 rule)
        $availableRooms = $this->reservationService->getAvailableRooms('2026-09-15', '2026-09-18', $this->roomType->id);
        $this->assertTrue($availableRooms->contains('id', $this->room->id));
    }

    public function test_check_in_transitions_room_to_occupied(): void
    {
        $reservation = $this->reservationService->createReservation([
            'guest_id' => $this->guest->id,
            'room_type_id' => $this->roomType->id,
            'room_id' => $this->room->id,
            'check_in_date' => today()->toDateString(),
            'check_out_date' => today()->addDays(2)->toDateString(),
            'adults' => 1,
            'children' => 0,
            'nightly_rate' => 150.00,
        ], $this->user->id);

        $this->actingAs($this->user);

        $response = $this->post(route('front-desk.check-in', $reservation->id));
        $response->assertSessionHasNoErrors();

        $this->assertEquals('checked_in', $reservation->fresh()->booking_status);
        $this->assertEquals('occupied', $this->room->fresh()->status);
    }

    public function test_check_out_enforces_payment_and_marks_room_dirty(): void
    {
        $reservation = $this->reservationService->createReservation([
            'guest_id' => $this->guest->id,
            'room_type_id' => $this->roomType->id,
            'room_id' => $this->room->id,
            'check_in_date' => today()->subDays(2)->toDateString(),
            'check_out_date' => today()->toDateString(),
            'adults' => 1,
            'children' => 0,
            'nightly_rate' => 150.00,
        ], $this->user->id);

        $this->reservationService->checkIn($reservation, $this->room->id, $this->user->id);

        $this->actingAs($this->user);

        // Attempt checkout with unpaid balance -> should fail
        $response = $this->post(route('front-desk.check-out', $reservation->id));
        $response->assertSessionHasErrors('balance');
        $this->assertEquals('occupied', $this->room->fresh()->status);

        // Pay folio in full
        $this->invoiceService->recordPayment(
            invoice: $reservation->invoice,
            amount: (float)$reservation->invoice->balance,
            method: 'credit_card',
            userId: $this->user->id
        );

        // Attempt checkout again -> should succeed and mark room dirty
        $response = $this->post(route('front-desk.check-out', $reservation->id));
        $response->assertSessionHasNoErrors();

        $this->assertEquals('checked_out', $reservation->fresh()->booking_status);
        $this->assertEquals('dirty', $this->room->fresh()->status);
    }

    public function test_folio_charge_addition_and_payment(): void
    {
        $reservation = $this->reservationService->createReservation([
            'guest_id' => $this->guest->id,
            'room_type_id' => $this->roomType->id,
            'room_id' => $this->room->id,
            'check_in_date' => today()->toDateString(),
            'check_out_date' => today()->addDay()->toDateString(),
            'adults' => 1,
            'children' => 0,
            'nightly_rate' => 150.00,
        ], $this->user->id);

        $invoice = $reservation->invoice;
        $initialTotal = (float)$invoice->total_amount;

        // Add restaurant charge
        $this->invoiceService->addItem(
            invoice: $invoice,
            itemType: 'restaurant',
            description: 'Room Service Dinner',
            quantity: 1,
            rate: 45.00
        );

        $this->assertEquals($initialTotal + 45.00, (float)$invoice->fresh()->total_amount);

        // Record partial payment
        $this->invoiceService->recordPayment(
            invoice: $invoice,
            amount: 50.00,
            method: 'cash',
            userId: $this->user->id
        );

        $this->assertEquals('partially_paid', $invoice->fresh()->status);
        $this->assertEquals(50.00, (float)$invoice->fresh()->paid_amount);
    }
}
