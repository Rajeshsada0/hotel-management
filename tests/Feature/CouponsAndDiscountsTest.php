<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Guest;
use App\Models\Hotel;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponsAndDiscountsTest extends TestCase
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
            'name' => 'Grand Palace Hotel',
            'code' => 'GPH',
            'address' => '123 Ocean Drive',
            'city' => 'Miami',
            'country' => 'United States',
            'phone' => '+1 305-555-0100',
            'email' => 'contact@grandpalace.com',
            'currency' => 'USD',
            'currency_symbol' => '$',
            'check_in_time' => '15:00',
            'check_out_time' => '11:00',
            'status' => 'active',
        ]);

        $this->user = User::factory()->create([
            'role' => 'super_admin',
        ]);

        $this->roomType = RoomType::create([
            'hotel_id' => $this->hotel->id,
            'name' => 'Deluxe King Suite',
            'slug' => 'deluxe-king-suite',
            'base_price' => 200.00,
            'max_adults' => 2,
            'max_children' => 1,
            'number_of_beds' => 1,
            'status' => 'active',
        ]);

        $this->room = Room::create([
            'hotel_id' => $this->hotel->id,
            'room_type_id' => $this->roomType->id,
            'room_number' => '401',
            'floor' => '4',
            'status' => 'available',
            'bed_type' => 'king',
            'capacity' => 2,
        ]);

        $this->guest = Guest::create([
            'hotel_id' => $this->hotel->id,
            'first_name' => 'Eleanor',
            'last_name' => 'Vance',
            'email' => 'eleanor.vance@example.com',
            'phone' => '+1 555-0199',
        ]);
    }

    public function test_admin_can_view_coupons_listing_and_create_new_percentage_coupon(): void
    {
        $this->actingAs($this->user)
            ->get(route('coupons.index'))
            ->assertOk();

        $response = $this->actingAs($this->user)
            ->post(route('coupons.store'), [
                'code' => 'SUMMER20',
                'name' => 'Summer Getaway 20%',
                'discount_type' => 'percentage',
                'value' => 20,
                'min_spend' => 100,
                'max_discount' => 50,
                'valid_from' => now()->toDateString(),
                'valid_until' => now()->addMonth()->toDateString(),
                'usage_limit' => 10,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('coupons', [
            'code' => 'SUMMER20',
            'discount_type' => 'percentage',
            'value' => 20.00,
            'is_active' => true,
        ]);
    }

    public function test_coupon_validation_endpoint_validates_valid_coupon_and_enforces_min_spend(): void
    {
        Coupon::create([
            'hotel_id' => $this->hotel->id,
            'code' => 'SAVE50',
            'name' => '$50 Off Promo',
            'discount_type' => 'fixed',
            'value' => 50.00,
            'min_spend' => 300.00,
            'is_active' => true,
        ]);

        // Below minimum spend: fails
        $resFail = $this->actingAs($this->user)
            ->postJson(route('coupons.validate'), [
                'code' => 'SAVE50',
                'subtotal' => 200.00,
            ]);

        $resFail->assertOk()
            ->assertJson([
                'valid' => false,
            ]);

        // Above minimum spend: succeeds
        $resSuccess = $this->actingAs($this->user)
            ->postJson(route('coupons.validate'), [
                'code' => 'SAVE50',
                'subtotal' => 400.00,
            ]);

        $resSuccess->assertOk()
            ->assertJson([
                'valid' => true,
                'discount_amount' => 50.00,
            ]);
    }

    public function test_reservation_creation_applies_coupon_discount_and_increments_usage_count(): void
    {
        $coupon = Coupon::create([
            'hotel_id' => $this->hotel->id,
            'code' => 'VIP15',
            'name' => 'VIP 15% Discount',
            'discount_type' => 'percentage',
            'value' => 15.00,
            'is_active' => true,
            'used_count' => 0,
        ]);

        $in = now()->addDays(2)->toDateString();
        $out = now()->addDays(5)->toDateString(); // 3 nights @ $200 = $600 subtotal. 15% discount = $90

        $response = $this->actingAs($this->user)
            ->post(route('reservations.store'), [
                'guest_id' => $this->guest->id,
                'room_type_id' => $this->roomType->id,
                'room_id' => $this->room->id,
                'check_in_date' => $in,
                'check_out_date' => $out,
                'adults' => 2,
                'children' => 0,
                'nightly_rate' => 200.00,
                'coupon_code' => 'VIP15',
                'tax' => 51.00,
                'booking_source' => 'phone',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('reservations', [
            'guest_id' => $this->guest->id,
            'coupon_id' => $coupon->id,
            'coupon_code' => 'VIP15',
            'subtotal' => 600.00,
            'discount' => 90.00,
        ]);

        $this->assertEquals(1, $coupon->fresh()->used_count);
    }
}
