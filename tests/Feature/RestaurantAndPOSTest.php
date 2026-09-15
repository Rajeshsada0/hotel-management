<?php

namespace Tests\Feature;

use App\Models\Guest;
use App\Models\Hotel;
use App\Models\Invoice;
use App\Models\Reservation;
use App\Models\RestaurantCategory;
use App\Models\RestaurantOrder;
use App\Models\RestaurantProduct;
use App\Models\RestaurantTable;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use App\Services\ReservationService;
use App\Services\RestaurantService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RestaurantAndPOSTest extends TestCase
{
    use RefreshDatabase;

    protected Hotel $hotel;
    protected User $user;
    protected RoomType $roomType;
    protected Room $room;
    protected Guest $guest;
    protected Reservation $reservation;
    protected RestaurantCategory $category;
    protected RestaurantProduct $product;
    protected RestaurantTable $table;
    protected RestaurantService $restaurantService;
    protected ReservationService $reservationService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->restaurantService = app(RestaurantService::class);
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

        $this->roomType = RoomType::create([
            'hotel_id' => $this->hotel->id,
            'name' => 'Deluxe King Room',
            'slug' => 'deluxe-king',
            'base_price' => 180.00,
            'max_adults' => 2,
            'max_children' => 1,
            'status' => 'active',
        ]);

        $this->room = Room::create([
            'hotel_id' => $this->hotel->id,
            'room_type_id' => $this->roomType->id,
            'room_number' => '305',
            'floor' => 3,
            'status' => 'occupied',
            'housekeeping_status' => 'clean',
        ]);

        $this->guest = Guest::create([
            'hotel_id' => $this->hotel->id,
            'first_name' => 'David',
            'last_name' => 'Miller',
            'email' => 'david.miller@example.com',
            'phone' => '+1-555-0199',
            'id_type' => 'passport',
            'id_number' => 'US-991823',
        ]);

        // Checked in guest with invoice
        $this->reservation = $this->reservationService->createReservation([
            'guest_id' => $this->guest->id,
            'room_type_id' => $this->roomType->id,
            'room_id' => $this->room->id,
            'check_in_date' => now()->toDateString(),
            'check_out_date' => now()->addDays(3)->toDateString(),
            'adults' => 1,
            'children' => 0,
        ], $this->user->id);

        $this->reservationService->checkIn($this->reservation);
        $this->reservation->refresh();

        // Restaurant category, product, table
        $this->category = RestaurantCategory::create([
            'hotel_id' => $this->hotel->id,
            'name' => 'Main Course',
            'slug' => 'main-course',
            'status' => 'active',
        ]);

        $this->product = RestaurantProduct::create([
            'hotel_id' => $this->hotel->id,
            'category_id' => $this->category->id,
            'name' => 'Grilled Ribeye Steak',
            'code' => 'STK-01',
            'price' => 34.00,
            'cost_price' => 15.00,
            'is_available' => true,
        ]);

        $this->table = RestaurantTable::create([
            'hotel_id' => $this->hotel->id,
            'table_number' => 'T-04',
            'capacity' => 4,
            'location' => 'Main Dining Hall',
            'status' => 'available',
        ]);
    }

    public function test_restaurant_index_screen_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get('/restaurant');

        $response->assertStatus(200);
    }

    public function test_user_can_create_menu_product(): void
    {
        $response = $this->actingAs($this->user)->post('/restaurant/products', [
            'category_id' => $this->category->id,
            'name' => 'Caesar Salad',
            'code' => 'SLD-01',
            'price' => 12.50,
            'cost_price' => 4.50,
            'is_available' => true,
            'description' => 'Fresh romaine, croutons, parmesan',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('restaurant_products', [
            'name' => 'Caesar Salad',
            'price' => 12.50,
            'code' => 'SLD-01',
        ]);
    }

    public function test_user_can_create_restaurant_table(): void
    {
        $response = $this->actingAs($this->user)->post('/restaurant/tables', [
            'table_number' => 'T-10',
            'capacity' => 6,
            'location' => 'Terrace',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('restaurant_tables', [
            'table_number' => 'T-10',
            'capacity' => 6,
            'status' => 'available',
        ]);
    }

    public function test_user_can_create_pos_order_with_cash(): void
    {
        $response = $this->actingAs($this->user)->post('/restaurant/order', [
            'table_id' => $this->table->id,
            'payment_method' => 'cash',
            'discount' => 0,
            'tax' => 2.72,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'product_name' => $this->product->name,
                    'quantity' => 1,
                    'unit_price' => 34.00,
                ],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('restaurant_orders', [
            'payment_method' => 'cash',
            'payment_status' => 'paid',
            'order_status' => 'completed',
        ]);

        // Table marked occupied when order opened
        $this->table->refresh();
        $this->assertEquals('occupied', $this->table->status);
    }

    public function test_user_can_create_pos_order_charged_to_room_folio(): void
    {
        $initialInvoiceTotal = (float)$this->reservation->invoice->total_amount;

        $response = $this->actingAs($this->user)->post('/restaurant/order', [
            'table_id' => $this->table->id,
            'payment_method' => 'charge_to_room',
            'reservation_id' => $this->reservation->id,
            'discount' => 0,
            'tax' => 2.72,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'product_name' => $this->product->name,
                    'quantity' => 1,
                    'unit_price' => 34.00,
                ],
            ],
        ]);

        $response->assertRedirect();

        // Check order recorded with guest and reservation links
        $order = RestaurantOrder::where('payment_method', 'charge_to_room')->latest()->first();
        $this->assertNotNull($order);
        $this->assertEquals($this->reservation->id, $order->reservation_id);
        $this->assertEquals($this->guest->id, $order->guest_id);
        $this->assertEquals('paid', $order->payment_status);

        // Check invoice folio updated with restaurant line item
        $this->reservation->invoice->refresh();
        $this->assertDatabaseHas('invoice_items', [
            'invoice_id' => $this->reservation->invoice->id,
            'item_type' => 'restaurant',
            'total_price' => 36.72, // 34 subtotal + 2.72 tax
        ]);

        $this->assertEquals(
            round($initialInvoiceTotal + 36.72, 2),
            round((float)$this->reservation->invoice->total_amount, 2)
        );
    }

    public function test_user_can_settle_unpaid_table_order(): void
    {
        // Place unpaid order first
        $order = $this->restaurantService->createOrder(
            [
                'table_id' => $this->table->id,
                'payment_method' => 'unpaid',
                'discount' => 0,
            ],
            [
                [
                    'product_id' => $this->product->id,
                    'product_name' => $this->product->name,
                    'quantity' => 2,
                    'unit_price' => 34.00,
                ],
            ],
            $this->user->id
        );

        $this->table->refresh();
        $this->assertEquals('occupied', $this->table->status);
        $this->assertEquals('unpaid', $order->payment_status);

        // Settle with card
        $response = $this->actingAs($this->user)->post("/restaurant/orders/{$order->id}/settle", [
            'payment_method' => 'card',
        ]);

        $response->assertRedirect();

        $order->refresh();
        $this->assertEquals('paid', $order->payment_status);
        $this->assertEquals('card', $order->payment_method);

        $this->table->refresh();
        $this->assertEquals('available', $this->table->status);
    }
}
