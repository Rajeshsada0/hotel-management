<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Models\Reservation;
use App\Models\Service;
use App\Models\ServiceOrder;
use App\Services\HotelServiceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HotelServiceController extends Controller
{
    public function __construct(
        protected HotelServiceService $hotelServiceService
    ) {}

    /**
     * Display service catalog and service orders (Section 24).
     */
    public function index(): Response
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $services = Service::orderBy('category')
            ->orderBy('name')
            ->get();

        $orders = ServiceOrder::with(['service', 'guest', 'room', 'reservation'])
            ->latest()
            ->paginate(15);

        // Currently in-house reservations for charging to room
        $inHouseReservations = Reservation::with(['guest', 'room'])
            ->where('booking_status', 'checked_in')
            ->orderBy('room_id')
            ->get();

        return Inertia::render('services/index', [
            'hotel' => $hotel,
            'services' => $services,
            'orders' => $orders,
            'inHouseReservations' => $inHouseReservations,
        ]);
    }

    /**
     * Store a newly created service in catalog.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', 'unique:services,code'],
            'price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $hotel = Hotel::current() ?? Hotel::first();

        Service::create(array_merge($validated, ['hotel_id' => $hotel?->id]));

        return back()->with('success', "Service '{$validated['name']}' added to catalog.");
    }

    /**
     * Order a service and charge directly to room folio.
     */
    public function order(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reservation_id' => ['required', 'exists:reservations,id'],
            'service_id' => ['required', 'exists:services,id'],
            'quantity' => ['required', 'numeric', 'min:1'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $order = $this->hotelServiceService->orderService($validated, $request->user()->id);

        return back()->with('success', "Service '{$order->service->name}' charged to Room {$order->room?->room_number} folio.");
    }
}
