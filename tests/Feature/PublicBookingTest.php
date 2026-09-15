<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Hotel;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicBookingTest extends TestCase
{
    use RefreshDatabase;

    protected Hotel $hotel;
    protected RoomType $roomType;
    protected Room $room;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hotel = Hotel::create([
            'name' => 'Paradise Palms Resort',
            'code' => 'PPR',
            'address' => '500 Coconut Blvd',
            'city' => 'Honolulu',
            'country' => 'United States',
            'phone' => '+1 808-555-0122',
            'email' => 'aloha@paradisepalms.com',
            'currency' => 'USD',
            'currency_symbol' => '$',
            'check_in_time' => '15:00',
            'check_out_time' => '11:00',
            'tax_percentage' => 10.00,
            'status' => 'active',
        ]);

        $this->roomType = RoomType::create([
            'hotel_id' => $this->hotel->id,
            'name' => 'Oceanfront Villa',
            'slug' => 'oceanfront-villa',
            'base_price' => 300.00,
            'max_adults' => 2,
            'max_children' => 2,
            'number_of_beds' => 2,
            'status' => 'active',
        ]);

        $this->room = Room::create([
            'hotel_id' => $this->hotel->id,
            'room_type_id' => $this->roomType->id,
            'room_number' => 'V-101',
            'floor' => '1',
            'status' => 'available',
            'bed_type' => 'king',
            'capacity' => 4,
        ]);
    }

    public function test_public_booking_portal_is_accessible_without_authentication(): void
    {
        $response = $this->get(route('book.index'));
        $response->assertOk();
    }

    public function test_availability_api_returns_available_rooms_and_calculated_stay_pricing(): void
    {
        $in = now()->addDays(2)->toDateString();
        $out = now()->addDays(5)->toDateString(); // 3 nights @ $300 = $900

        $response = $this->getJson(route('book.availability', [
            'check_in' => $in,
            'check_out' => $out,
            'adults' => 2,
            'children' => 1,
        ]));

        $response->assertOk()
            ->assertJsonStructure([
                'roomTypes',
                'nights',
                'check_in',
                'check_out',
            ]);

        $this->assertEquals(3, $response->json('nights'));
        $this->assertEquals(900.0, $response->json('roomTypes.0.total_price'));
        $this->assertEquals(1, $response->json('roomTypes.0.available_count'));
    }

    public function test_guest_can_submit_reservation_online_with_coupon_and_invoice_is_created(): void
    {
        Coupon::create([
            'hotel_id' => $this->hotel->id,
            'code' => 'ALOHA20',
            'name' => 'Aloha 20% Discount',
            'discount_type' => 'percentage',
            'value' => 20.00,
            'is_active' => true,
        ]);

        $in = now()->addDays(3)->toDateString();
        $out = now()->addDays(6)->toDateString(); // 3 nights @ 300 = 900. Discount 20% = 180.

        $response = $this->post(route('book.reserve'), [
            'first_name' => 'Sophia',
            'last_name' => 'Chen',
            'email' => 'sophia.chen@example.com',
            'phone' => '+1 808-555-0987',
            'room_type_id' => $this->roomType->id,
            'check_in_date' => $in,
            'check_out_date' => $out,
            'adults' => 2,
            'children' => 0,
            'coupon_code' => 'ALOHA20',
            'special_request' => 'Ground floor villa preferred.',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('guests', [
            'email' => 'sophia.chen@example.com',
            'first_name' => 'Sophia',
            'last_name' => 'Chen',
        ]);

        $reservation = Reservation::where('booking_source', 'website')->latest()->first();
        $this->assertNotNull($reservation);
        $this->assertEquals('900.00', $reservation->subtotal);
        $this->assertEquals('180.00', $reservation->discount);
        $this->assertEquals('ALOHA20', $reservation->coupon_code);
        $this->assertEquals('website', $reservation->booking_source);

        // Verify invoice was created for reservation
        $this->assertNotNull($reservation->invoice);
        $this->assertCount(1, $reservation->invoice->items);

        // Verify confirmation page
        $confirmRes = $this->get(route('book.confirmation', ['bookingNumber' => $reservation->booking_number]));
        $confirmRes->assertOk();
    }
}
