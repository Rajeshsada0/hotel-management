<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Hotel;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use App\Services\ReservationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function __construct(
        protected ReservationService $reservationService
    ) {}

    /**
     * Display list of reservations.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $source = $request->input('source');

        $reservations = Reservation::with(['guest', 'room', 'roomType', 'invoice'])
            ->when($search, function ($q, $search) {
                $q->where('booking_number', 'like', "%{$search}%")
                  ->orWhereHas('guest', function ($g) use ($search) {
                      $g->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            })
            ->when($status, fn ($q) => $q->where('booking_status', $status))
            ->when($source, fn ($q) => $q->where('booking_source', $source))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('reservations/index', [
            'reservations' => $reservations,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'source' => $source,
            ],
        ]);
    }

    /**
     * Show form to create a new reservation.
     */
    public function create(Request $request): Response
    {
        $hotel = Hotel::current() ?? Hotel::first();
        $roomTypes = RoomType::where('status', 'active')->get();
        $guests = Guest::orderBy('first_name')->take(50)->get();

        $checkIn = $request->input('check_in_date', today()->toDateString());
        $checkOut = $request->input('check_out_date', today()->addDay()->toDateString());
        $roomTypeId = $request->input('room_type_id');

        $availableRooms = [];
        if ($checkIn && $checkOut) {
            $availableRooms = $this->reservationService->getAvailableRooms(
                checkInDate: $checkIn,
                checkOutDate: $checkOut,
                roomTypeId: $roomTypeId ? (int)$roomTypeId : null
            );
        }

        return Inertia::render('reservations/create', [
            'hotel' => $hotel,
            'roomTypes' => $roomTypes,
            'guests' => $guests,
            'availableRooms' => $availableRooms,
            'defaultCheckIn' => $checkIn,
            'defaultCheckOut' => $checkOut,
            'defaultRoomTypeId' => $roomTypeId,
        ]);
    }

    /**
     * Store a newly created reservation.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'guest_id' => ['required', 'exists:guests,id'],
            'room_type_id' => ['required', 'exists:room_types,id'],
            'room_id' => ['nullable', 'exists:rooms,id'],
            'check_in_date' => ['required', 'date'],
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'adults' => ['required', 'integer', 'min:1'],
            'children' => ['required', 'integer', 'min:0'],
            'nightly_rate' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'coupon_code' => ['nullable', 'string'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'deposit' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'string'],
            'booking_source' => ['required', 'string'],
            'special_request' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $reservation = $this->reservationService->createReservation($validated, $request->user()->id);

        return redirect()->route('reservations.show', $reservation->id)
            ->with('success', "Reservation {$reservation->booking_number} created successfully.");
    }

    /**
     * Show reservation folio details.
     */
    public function show(Reservation $reservation): Response
    {
        $reservation->load([
            'guest',
            'room.roomType',
            'roomType',
            'coupon',
            'invoice.items',
            'invoice.payments.receivedByUser',
            'checkedInByUser',
            'checkedOutByUser',
            'createdByUser',
        ]);

        return Inertia::render('reservations/show', [
            'reservation' => $reservation,
            'invoice' => $reservation->invoice,
        ]);
    }

    /**
     * Cancel a reservation.
     */
    public function cancel(Request $request, Reservation $reservation): RedirectResponse
    {
        $this->reservationService->cancelReservation($reservation, $request->user()->id);

        return back()->with('success', "Reservation {$reservation->booking_number} cancelled.");
    }
}
