<?php

namespace Tests\Feature;

use App\Models\Guest;
use App\Models\Hotel;
use App\Models\InventoryItem;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use App\Services\InventoryService;
use App\Services\InvoiceService;
use App\Services\ReservationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    protected Hotel $hotel;
    protected User $user;
    protected RoomType $roomType;
    protected Room $room;
    protected Guest $guest;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hotel = Hotel::create([
            'name' => 'Sunset Bay Resort',
            'code' => 'SBR',
            'address' => '456 Coastal Way',
            'city' => 'San Diego',
            'country' => 'United States',
            'phone' => '+1 619-555-0155',
            'email' => 'info@sunsetbay.com',
            'currency' => 'USD',
            'currency_symbol' => '$',
            'check_in_time' => '15:00',
            'check_out_time' => '11:00',
            'status' => 'active',
        ]);

        $this->user = User::factory()->create([
            'name' => 'Marcus Front Desk',
            'role' => 'receptionist',
        ]);

        $this->roomType = RoomType::create([
            'hotel_id' => $this->hotel->id,
            'name' => 'Ocean View King',
            'slug' => 'ocean-view-king',
            'base_price' => 250.00,
            'max_adults' => 2,
            'max_children' => 0,
            'number_of_beds' => 1,
            'status' => 'active',
        ]);

        $this->room = Room::create([
            'hotel_id' => $this->hotel->id,
            'room_type_id' => $this->roomType->id,
            'room_number' => '305',
            'floor' => '3',
            'status' => 'available',
            'bed_type' => 'king',
            'capacity' => 2,
        ]);

        $this->guest = Guest::create([
            'hotel_id' => $this->hotel->id,
            'first_name' => 'Jonathan',
            'last_name' => 'Archer',
            'email' => 'jonathan.archer@example.com',
            'phone' => '+1 555-0211',
        ]);
    }

    public function test_check_in_and_check_out_write_audit_log_records_with_front_desk_module(): void
    {
        $reservationService = app(ReservationService::class);

        // Create reservation
        $reservation = $reservationService->createReservation([
            'guest_id' => $this->guest->id,
            'room_type_id' => $this->roomType->id,
            'room_id' => $this->room->id,
            'check_in_date' => now()->toDateString(),
            'check_out_date' => now()->addDays(2)->toDateString(),
            'adults' => 2,
            'children' => 0,
            'nightly_rate' => 250.00,
            'booking_source' => 'walk_in',
        ], $this->user->id);

        $this->assertDatabaseHas('audit_logs', [
            'module' => 'reservations',
            'action' => 'reservation_created',
            'record_id' => $reservation->id,
        ]);

        // Check-in
        $reservationService->checkIn($reservation, $this->room->id, $this->user->id);

        $this->assertDatabaseHas('audit_logs', [
            'module' => 'front_desk',
            'action' => 'check_in',
            'record_id' => $reservation->id,
        ]);

        // Pay invoice so check-out is permitted
        $invoiceService = app(InvoiceService::class);
        $invoiceService->recordPayment($reservation->invoice, $reservation->invoice->total_amount, 'card', null, 'Full Settlement', null, $this->user->id);

        $this->assertDatabaseHas('audit_logs', [
            'module' => 'billing',
            'action' => 'payment_recorded',
        ]);

        // Check-out
        $reservationService->checkOut($reservation, false, $this->user->id);

        $this->assertDatabaseHas('audit_logs', [
            'module' => 'front_desk',
            'action' => 'check_out',
            'record_id' => $reservation->id,
        ]);
    }

    public function test_inventory_stock_movement_writes_audit_log_record(): void
    {
        $item = InventoryItem::create([
            'hotel_id' => $this->hotel->id,
            'category' => 'toiletries',
            'name' => 'Botanical Hand Soap 50ml',
            'sku' => 'SOAP-BOT-50',
            'unit' => 'bottle',
            'purchase_price' => 1.50,
            'selling_price' => 0.00,
            'opening_stock' => 50,
            'current_stock' => 50,
            'minimum_stock' => 10,
            'status' => 'active',
        ]);

        $inventoryService = app(InventoryService::class);
        $inventoryService->recordTransaction([
            'inventory_item_id' => $item->id,
            'transaction_type' => 'stock_in',
            'quantity' => 20,
            'department' => 'housekeeping',
        ], $this->user->id);

        $this->assertDatabaseHas('audit_logs', [
            'module' => 'inventory',
            'action' => 'stock_adjusted',
            'record_id' => $item->id,
        ]);
    }

    public function test_audit_log_index_page_is_accessible_by_authorized_staff_with_filtering(): void
    {
        $this->actingAs($this->user)
            ->get(route('audit-logs.index'))
            ->assertOk();

        $this->actingAs($this->user)
            ->get(route('audit-logs.index', ['module' => 'front_desk']))
            ->assertOk();
    }
}
