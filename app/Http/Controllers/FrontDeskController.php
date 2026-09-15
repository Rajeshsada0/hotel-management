<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Hotel;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use App\Services\ReservationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FrontDeskController extends Controller
{
    public function __construct(
        protected ReservationService $reservationService
    ) {}

    /**
     * Front Desk Overview & Quick Operations Board.
     */
    public function index(): Response
    {
        $hotel = Hotel::current() ?? Hotel::first();

        // Today's arrivals (confirmed bookings expected today)
        $arrivals = Reservation::with(['guest', 'room', 'roomType'])
            ->whereDate('check_in_date', today())
            ->where('booking_status', 'confirmed')
            ->orderBy('created_at')
            ->get();

        // Today's departures (in-house guests expected to check out today)
        $departures = Reservation::with(['guest', 'room', 'roomType', 'invoice'])
            ->whereDate('check_out_date', today())
            ->where('booking_status', 'checked_in')
            ->orderBy('room_id')
            ->get();

        // In-house guests currently staying
        $inHouse = Reservation::with(['guest', 'room', 'roomType', 'invoice'])
            ->where('booking_status', 'checked_in')
            ->orderBy('room_id')
            ->get();

        // All rooms with current state for the visual room matrix
        $rooms = Room::with(['roomType', 'currentReservation.guest'])
            ->orderBy('room_number')
            ->get();

        $roomTypes = RoomType::where('status', 'active')->get();

        return Inertia::render('front-desk/index', [
            'hotel' => $hotel,
            'arrivals' => $arrivals,
            'departures' => $departures,
            'inHouse' => $inHouse,
            'rooms' => $rooms,
            'roomTypes' => $roomTypes,
        ]);
    }

    /**
     * Room Availability Search Page (Section 7).
     * Prevents double booking and returns available rooms for dates.
     */
    public function availability(Request $request): Response
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $checkIn = $request->input('check_in_date', today()->toDateString());
        $checkOut = $request->input('check_out_date', today()->addDay()->toDateString());
        $adults = (int) $request->input('adults', 1);
        $children = (int) $request->input('children', 0);
        $roomTypeId = $request->input('room_type_id') ? (int) $request->input('room_type_id') : null;

        $availableRooms = $this->reservationService->getAvailableRooms(
            checkInDate: $checkIn,
            checkOutDate: $checkOut,
            roomTypeId: $roomTypeId,
            adults: $adults,
            children: $children
        );

        $roomTypes = RoomType::where('status', 'active')->get();

        return Inertia::render('front-desk/availability', [
            'hotel' => $hotel,
            'availableRooms' => $availableRooms,
            'roomTypes' => $roomTypes,
            'filters' => [
                'check_in_date' => $checkIn,
                'check_out_date' => $checkOut,
                'adults' => $adults,
                'children' => $children,
                'room_type_id' => $roomTypeId,
            ],
        ]);
    }

    /**
     * Perform Guest Check-In.
     */
    public function checkIn(Request $request, Reservation $reservation): RedirectResponse
    {
        $validated = $request->validate([
            'room_id' => ['nullable', 'exists:rooms,id'],
        ]);

        $this->reservationService->checkIn(
            reservation: $reservation,
            roomId: $validated['room_id'] ?? null,
            userId: $request->user()->id
        );

        return back()->with('success', "Guest {$reservation->guest->full_name} successfully checked into Room {$reservation->fresh()->room?->room_number}.");
    }

    /**
     * Perform Guest Check-Out.
     */
    public function checkOut(Request $request, Reservation $reservation): RedirectResponse
    {
        $allowCredit = (bool) $request->input('allow_credit', false);

        $this->reservationService->checkOut(
            reservation: $reservation,
            allowCreditCheckout: $allowCredit,
            userId: $request->user()->id
        );

        return back()->with('success', "Guest {$reservation->guest->full_name} checked out. Room is now marked as Dirty for housekeeping.");
    }

    /**
     * Perform Express Walk-In Check-In.
     */
    public function walkIn(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // Guest data
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'id_type' => ['nullable', 'string', 'max:50'],
            'id_number' => ['nullable', 'string', 'max:50'],
            'nationality' => ['nullable', 'string', 'max:100'],

            // Booking data
            'room_type_id' => ['required', 'exists:room_types,id'],
            'room_id' => ['nullable', 'exists:rooms,id'],
            'check_in_date' => ['required', 'date'],
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'adults' => ['required', 'integer', 'min:1'],
            'children' => ['required', 'integer', 'min:0'],
            'nightly_rate' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'deposit' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'string'],
        ]);

        $guestData = [
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'id_type' => $validated['id_type'] ?? null,
            'id_number' => $validated['id_number'] ?? null,
            'nationality' => $validated['nationality'] ?? null,
        ];

        $bookingData = [
            'room_type_id' => $validated['room_type_id'],
            'room_id' => $validated['room_id'] ?? null,
            'check_in_date' => $validated['check_in_date'],
            'check_out_date' => $validated['check_out_date'],
            'adults' => $validated['adults'],
            'children' => $validated['children'],
            'nightly_rate' => $validated['nightly_rate'],
            'discount' => $validated['discount'] ?? 0,
            'tax' => $validated['tax'] ?? 0,
            'deposit' => $validated['deposit'] ?? 0,
            'payment_method' => $validated['payment_method'] ?? 'cash',
        ];

        $reservation = $this->reservationService->walkIn(
            guestData: $guestData,
            bookingData: $bookingData,
            userId: $request->user()->id
        );

        return redirect()->route('front-desk.index')
            ->with('success', "Walk-in check-in completed for {$reservation->guest->full_name} in Room {$reservation->room?->room_number}.");
    }
}
