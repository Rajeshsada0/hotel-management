<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Hotel;
use App\Models\Reservation;
use App\Models\RoomType;
use App\Services\CouponService;
use App\Services\ReservationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicBookingController extends Controller
{
    public function __construct(
        protected ReservationService $reservationService,
        protected CouponService $couponService
    ) {}

    /**
     * Public hotel booking portal landing page.
     */
    public function index(Request $request): Response
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $checkIn = $request->get('check_in', now()->toDateString());
        $checkOut = $request->get('check_out', now()->addDays(2)->toDateString());
        $adults = (int) $request->get('adults', 1);
        $children = (int) $request->get('children', 0);

        $roomTypes = RoomType::query()
            ->when($hotel, fn ($q) => $q->where('hotel_id', $hotel->id))
            ->where('status', 'active')
            ->withCount(['rooms' => fn ($q) => $q->where('status', 'available')])
            ->get()
            ->map(function ($type) use ($checkIn, $checkOut, $adults, $children) {
                $available = $this->reservationService->getAvailableRooms(
                    checkInDate: $checkIn,
                    checkOutDate: $checkOut,
                    roomTypeId: $type->id,
                    adults: $adults,
                    children: $children
                );
                $type->available_rooms_count = $available->count();
                return $type;
            });

        return Inertia::render('book/index', [
            'hotel' => $hotel,
            'roomTypes' => $roomTypes,
            'initialDates' => [
                'checkIn' => $checkIn,
                'checkOut' => $checkOut,
                'adults' => $adults,
                'children' => $children,
            ],
        ]);
    }

    /**
     * Public API endpoint to check room availability and pricing dynamically.
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        $request->validate([
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'adults' => ['nullable', 'integer', 'min:1'],
            'children' => ['nullable', 'integer', 'min:0'],
        ]);

        $hotel = Hotel::current() ?? Hotel::first();
        $checkIn = Carbon::parse($request->check_in);
        $checkOut = Carbon::parse($request->check_out);
        $nights = max(1, $checkIn->diffInDays($checkOut));

        $roomTypes = RoomType::query()
            ->when($hotel, fn ($q) => $q->where('hotel_id', $hotel->id))
            ->where('status', 'active')
            ->get()
            ->map(function ($type) use ($request, $nights) {
                $available = $this->reservationService->getAvailableRooms(
                    checkInDate: $request->check_in,
                    checkOutDate: $request->check_out,
                    roomTypeId: $type->id,
                    adults: (int) $request->get('adults', 1),
                    children: (int) $request->get('children', 0)
                );
                $subtotal = $type->base_price * $nights;

                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'description' => $type->description,
                    'base_price' => (float) $type->base_price,
                    'total_price' => (float) $subtotal,
                    'nights' => $nights,
                    'max_adults' => $type->max_adults,
                    'max_children' => $type->max_children,
                    'available_count' => $available->count(),
                    'amenities' => $type->amenities,
                ];
            });

        return response()->json([
            'roomTypes' => $roomTypes,
            'nights' => $nights,
            'check_in' => $checkIn->toDateString(),
            'check_out' => $checkOut->toDateString(),
        ]);
    }

    /**
     * Validate a coupon code for online guests.
     */
    public function validateCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $hotel = Hotel::current() ?? Hotel::first();
        $result = $this->couponService->validateCoupon(
            code: $request->code,
            subtotal: (float) $request->subtotal,
            hotelId: $hotel?->id
        );

        return response()->json($result);
    }

    /**
     * Submit an online guest reservation.
     */
    public function reserve(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'room_type_id' => ['required', 'exists:room_types,id'],
            'check_in_date' => ['required', 'date'],
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'adults' => ['required', 'integer', 'min:1'],
            'children' => ['required', 'integer', 'min:0'],
            'special_request' => ['nullable', 'string', 'max:500'],
            'coupon_code' => ['nullable', 'string'],
        ]);

        $hotel = Hotel::current() ?? Hotel::first();

        // 1. Find or create guest
        $guest = Guest::where('email', $validated['email'])
            ->orWhere('phone', $validated['phone'])
            ->first();

        if (!$guest) {
            $guest = Guest::create([
                'hotel_id' => $hotel?->id,
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'address' => $validated['address'] ?? null,
                'city' => $validated['city'] ?? null,
                'country' => $validated['country'] ?? 'United States',
                'id_type' => 'passport',
                'id_number' => 'ONLINE-' . strtoupper(substr(uniqid(), -6)),
            ]);
        }

        // 2. Determine room type pricing & taxes
        $roomType = RoomType::findOrFail($validated['room_type_id']);
        $checkIn = Carbon::parse($validated['check_in_date']);
        $checkOut = Carbon::parse($validated['check_out_date']);
        $nights = max(1, $checkIn->diffInDays($checkOut));
        $subtotal = (float)$roomType->base_price * $nights;

        $discount = 0.00;
        if (!empty($validated['coupon_code'])) {
            $couponRes = $this->couponService->validateCoupon($validated['coupon_code'], $subtotal, $hotel?->id);
            if ($couponRes['valid']) {
                $discount = $couponRes['discount_amount'];
            }
        }

        $taxRate = (float)($hotel?->tax_percentage ?? 10.00);
        $tax = round(($subtotal - $discount) * ($taxRate / 100), 2);

        // 3. Create reservation
        $reservationData = [
            'guest_id' => $guest->id,
            'room_type_id' => $roomType->id,
            'check_in_date' => $validated['check_in_date'],
            'check_out_date' => $validated['check_out_date'],
            'adults' => $validated['adults'],
            'children' => $validated['children'],
            'nightly_rate' => $roomType->base_price,
            'discount' => $discount,
            'coupon_code' => $validated['coupon_code'] ?? null,
            'tax' => $tax,
            'booking_source' => 'website',
            'booking_status' => 'confirmed',
            'special_request' => $validated['special_request'] ?? null,
        ];

        $reservation = $this->reservationService->createReservation($reservationData);

        return redirect()->route('book.confirmation', ['bookingNumber' => $reservation->booking_number])
            ->with('success', 'Your reservation has been confirmed!');
    }

    /**
     * Show booking confirmation voucher.
     */
    public function confirmation(string $bookingNumber): Response
    {
        $reservation = Reservation::where('booking_number', $bookingNumber)
            ->with(['guest', 'roomType', 'room', 'hotel', 'invoice.items'])
            ->firstOrFail();

        return Inertia::render('book/confirmation', [
            'reservation' => $reservation,
            'hotel' => $reservation->hotel ?? Hotel::current() ?? Hotel::first(),
        ]);
    }
}
