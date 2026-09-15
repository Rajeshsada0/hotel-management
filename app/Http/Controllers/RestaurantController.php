<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Models\Reservation;
use App\Models\RestaurantCategory;
use App\Models\RestaurantOrder;
use App\Models\RestaurantProduct;
use App\Models\RestaurantTable;
use App\Services\RestaurantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantController extends Controller
{
    public function __construct(
        protected RestaurantService $restaurantService
    ) {}

    /**
     * Display the Restaurant & POS Terminal (Section 14 & 28).
     */
    public function index(Request $request): Response
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $categories = RestaurantCategory::with(['products' => function ($query) {
            $query->orderBy('name');
        }])->orderBy('sort_order')->orderBy('name')->get();

        $tables = RestaurantTable::orderBy('table_number')->get();

        $orders = RestaurantOrder::with(['items', 'table', 'guest', 'room', 'server'])
            ->latest()
            ->paginate(15);

        // Currently in-house reservations for "Charge to Room"
        $inHouseReservations = Reservation::with(['guest', 'room'])
            ->where('booking_status', 'checked_in')
            ->orderBy('room_id')
            ->get();

        return Inertia::render('restaurant/index', [
            'hotel' => $hotel,
            'categories' => $categories,
            'tables' => $tables,
            'orders' => $orders,
            'inHouseReservations' => $inHouseReservations,
        ]);
    }

    /**
     * Place a new POS order (Supports Cash, Card, and Charge to Room).
     */
    public function storeOrder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'table_id' => ['nullable', 'exists:restaurant_tables,id'],
            'payment_method' => ['required', 'in:cash,card,charge_to_room,unpaid'],
            'reservation_id' => ['nullable', 'exists:reservations,id'],
            'room_id' => ['nullable', 'exists:rooms,id'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'exists:restaurant_products,id'],
            'items.*.product_name' => ['required', 'string'],
            'items.*.quantity' => ['required', 'numeric', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.notes' => ['nullable', 'string'],
        ]);

        $order = $this->restaurantService->createOrder(
            $validated,
            $validated['items'],
            $request->user()?->id
        );

        $msg = "Order #{$order->order_number} placed successfully.";
        if ($order->payment_method === 'charge_to_room') {
            $msg .= " Charged \${$order->total_amount} to Room {$order->room?->room_number} folio.";
        }

        return back()->with('success', $msg);
    }

    /**
     * Settle an unpaid order.
     */
    public function settleOrder(Request $request, RestaurantOrder $order): RedirectResponse
    {
        $validated = $request->validate([
            'payment_method' => ['required', 'in:cash,card'],
        ]);

        $this->restaurantService->settleOrder($order, $validated['payment_method']);

        return back()->with('success', "Order #{$order->order_number} settled with {$validated['payment_method']}.");
    }

    /**
     * Create a new menu item / product.
     */
    public function storeProduct(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:restaurant_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'price' => ['required', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'is_available' => ['boolean'],
            'description' => ['nullable', 'string'],
        ]);

        $hotel = Hotel::current() ?? Hotel::first();

        $product = RestaurantProduct::create(array_merge($validated, [
            'hotel_id' => $hotel?->id,
            'is_available' => $request->boolean('is_available', true),
        ]));

        return back()->with('success', "Product '{$product->name}' added to menu.");
    }

    /**
     * Create a new dining table.
     */
    public function storeTable(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'table_number' => ['required', 'string', 'max:50'],
            'capacity' => ['required', 'integer', 'min:1'],
            'location' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $hotel = Hotel::current() ?? Hotel::first();

        $table = RestaurantTable::create(array_merge($validated, [
            'hotel_id' => $hotel?->id,
            'status' => 'available',
        ]));

        return back()->with('success', "Table {$table->table_number} added.");
    }
}
