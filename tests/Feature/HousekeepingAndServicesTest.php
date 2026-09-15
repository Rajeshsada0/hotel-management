<?php

namespace Tests\Feature;

use App\Models\Guest;
use App\Models\Hotel;
use App\Models\HousekeepingTask;
use App\Models\Invoice;
use App\Models\MaintenanceRequest;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Service;
use App\Models\User;
use App\Services\HotelServiceService;
use App\Services\HousekeepingService;
use App\Services\ReservationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HousekeepingAndServicesTest extends TestCase
{
    use RefreshDatabase;

    protected Hotel $hotel;
    protected User $user;
    protected User $housekeeper;
    protected RoomType $roomType;
    protected Room $room;
    protected Guest $guest;
    protected Reservation $reservation;
    protected HousekeepingService $housekeepingService;
    protected HotelServiceService $hotelServiceService;
    protected ReservationService $reservationService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->housekeepingService = app(HousekeepingService::class);
        $this->hotelServiceService = app(HotelServiceService::class);
        $this->reservationService = app(ReservationService::class);

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
        $this->housekeeper = User::factory()->create(['role' => 'housekeeping', 'name' => 'Mary Cleaner']);

        $this->roomType = RoomType::create([
            'hotel_id' => $this->hotel->id,
            'name' => 'Deluxe King',
            'slug' => 'deluxe-king',
            'base_price' => 150.00,
            'max_adults' => 2,
            'max_children' => 1,
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
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'phone' => '+1 555-987-6543',
            'email' => 'jane@example.com',
        ]);

        $this->reservation = $this->reservationService->createReservation([
            'guest_id' => $this->guest->id,
            'room_type_id' => $this->roomType->id,
            'room_id' => $this->room->id,
            'check_in_date' => today()->toDateString(),
            'check_out_date' => today()->addDays(2)->toDateString(),
            'adults' => 1,
            'children' => 0,
            'nightly_rate' => 150.00,
        ], $this->user->id);
    }

    public function test_housekeeping_task_lifecycle(): void
    {
        // 1. Assign room cleaning task
        $task = $this->housekeepingService->assignCleaning(
            roomId: $this->room->id,
            housekeeperId: $this->housekeeper->id,
            priority: 'urgent',
            taskType: 'checkout_cleaning',
            notes: 'Turnover room for next guest',
            userId: $this->user->id
        );

        $this->assertEquals('dirty', $task->status);
        $this->assertEquals('dirty', $this->room->fresh()->status);
        $this->assertEquals($this->housekeeper->id, $task->assigned_to);

        // 2. Start cleaning (Dirty -> Cleaning)
        $this->actingAs($this->user);
        $response = $this->patch(route('housekeeping.status', $task->id), ['action' => 'start']);
        $response->assertSessionHasNoErrors();

        $this->assertEquals('cleaning', $task->fresh()->status);
        $this->assertEquals('cleaning', $this->room->fresh()->status);

        // 3. Complete cleaning (Cleaning -> Clean -> Available)
        $response = $this->patch(route('housekeeping.status', $task->id), ['action' => 'complete']);
        $response->assertSessionHasNoErrors();

        $this->assertEquals('clean', $task->fresh()->status);
        $this->assertEquals('available', $this->room->fresh()->status);
    }

    public function test_maintenance_request_locks_and_unlocks_room(): void
    {
        $this->actingAs($this->user);

        // Report maintenance issue on room 101
        $response = $this->post(route('housekeeping.maintenance.store'), [
            'room_id' => $this->room->id,
            'title' => 'Broken AC Compressor',
            'description' => 'Unit making loud noise and blowing warm air',
            'priority' => 'high',
        ]);

        $response->assertSessionHasNoErrors();

        // Room status should now be maintenance
        $this->assertEquals('maintenance', $this->room->fresh()->status);

        $maintenance = MaintenanceRequest::where('room_id', $this->room->id)->first();
        $this->assertNotNull($maintenance);
        $this->assertEquals('reported', $maintenance->status);

        // Resolve maintenance issue
        $response = $this->patch(route('housekeeping.maintenance.resolve', $maintenance->id), [
            'notes' => 'Replaced capacitor and recharged refrigerant',
        ]);

        $response->assertSessionHasNoErrors();

        // Room status should be returned to available
        $this->assertEquals('resolved', $maintenance->fresh()->status);
        $this->assertEquals('available', $this->room->fresh()->status);
    }

    public function test_lost_and_found_logging_and_claiming(): void
    {
        $this->actingAs($this->user);

        // Log found item
        $response = $this->post(route('housekeeping.lost-and-found.store'), [
            'room_id' => $this->room->id,
            'item_name' => 'Gold Wedding Ring',
            'category' => 'jewelry',
            'found_location' => 'Bathroom counter shelf',
            'found_date' => today()->toDateString(),
        ]);

        $response->assertSessionHasNoErrors();

        $item = \App\Models\LostAndFoundItem::where('item_name', 'Gold Wedding Ring')->first();
        $this->assertNotNull($item);
        $this->assertEquals('stored', $item->status);

        // Claim item
        $response = $this->patch(route('housekeeping.lost-and-found.claim', $item->id), [
            'claimed_by' => 'Jane Doe',
            'claimed_date' => today()->toDateString(),
            'notes' => 'Verified with ID',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals('claimed', $item->fresh()->status);
        $this->assertEquals('Jane Doe', $item->fresh()->claimed_by);
    }

    public function test_service_order_charges_directly_to_room_folio(): void
    {
        $service = Service::create([
            'hotel_id' => $this->hotel->id,
            'category' => 'spa',
            'name' => 'Swedish Massage 60m',
            'price' => 95.00,
            'status' => 'active',
        ]);

        $invoice = $this->reservation->invoice;
        $initialInvoiceTotal = (float) $invoice->total_amount;

        $this->actingAs($this->user);

        // Order service for in-house reservation
        $response = $this->post(route('services.order'), [
            'reservation_id' => $this->reservation->id,
            'service_id' => $service->id,
            'quantity' => 2,
            'unit_price' => 95.00,
            'notes' => 'Two guests booked for massage at 4 PM',
        ]);

        $response->assertSessionHasNoErrors();

        // Check invoice was charged
        $expectedTotal = $initialInvoiceTotal + (2 * 95.00);
        $this->assertEquals($expectedTotal, (float)$invoice->fresh()->total_amount);

        // Verify line item exists
        $this->assertDatabaseHas('invoice_items', [
            'invoice_id' => $invoice->id,
            'item_type' => 'spa',
            'total_price' => 190.00,
        ]);
    }
}
