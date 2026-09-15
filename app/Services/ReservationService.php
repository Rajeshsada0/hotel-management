<?php

namespace App\Services;

use App\Models\Guest;
use App\Models\Hotel;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

use App\Services\AuditLogService;
use App\Services\CouponService;
use App\Services\NotificationService;

class ReservationService
{
    public function __construct(
        protected InvoiceService $invoiceService,
        protected ?CouponService $couponService = null,
        protected ?AuditLogService $auditLogService = null,
        protected ?NotificationService $notificationService = null,
    ) {
        $this->couponService ??= app(CouponService::class);
        $this->auditLogService ??= app(AuditLogService::class);
        $this->notificationService ??= app(NotificationService::class);
    }

    /**
     * Check room availability for a given date range.
     * Prevents double bookings according to Section 28 rules:
     * Overlap condition: (existing.check_in_date < requestedCheckOut) AND (existing.check_out_date > requestedCheckIn)
     */
    public function getAvailableRooms(
        string $checkInDate,
        string $checkOutDate,
        ?int $roomTypeId = null,
        ?int $adults = null,
        ?int $children = null,
        ?int $excludeReservationId = null
    ): Collection {
        $checkIn = Carbon::parse($checkInDate)->format('Y-m-d');
        $checkOut = Carbon::parse($checkOutDate)->format('Y-m-d');

        // IDs of rooms that have active overlapping reservations
        $unavailableRoomIds = Reservation::query()
            ->whereIn('booking_status', ['confirmed', 'checked_in'])
            ->when($excludeReservationId, fn ($q) => $q->where('id', '!=', $excludeReservationId))
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereDate('check_in_date', '<', $checkOut)
                      ->whereDate('check_out_date', '>', $checkIn);
            })
            ->whereNotNull('room_id')
            ->pluck('room_id');

        return Room::query()
            ->with(['roomType', 'hotel'])
            ->whereNotIn('id', $unavailableRoomIds)
            ->whereNotIn('status', ['maintenance', 'out_of_service'])
            ->when($roomTypeId, fn ($q) => $q->where('room_type_id', $roomTypeId))
            ->when($adults, fn ($q) => $q->where('capacity', '>=', $adults))
            ->get();
    }

    /**
     * Verify if a specific room is available for the given dates.
     */
    public function isRoomAvailable(int $roomId, string $checkInDate, string $checkOutDate, ?int $excludeReservationId = null): bool
    {
        $checkIn = Carbon::parse($checkInDate)->format('Y-m-d');
        $checkOut = Carbon::parse($checkOutDate)->format('Y-m-d');

        $room = Room::find($roomId);
        if (!$room || in_array($room->status, ['maintenance', 'out_of_service'], true)) {
            return false;
        }

        $conflict = Reservation::query()
            ->where('room_id', $roomId)
            ->whereIn('booking_status', ['confirmed', 'checked_in'])
            ->when($excludeReservationId, fn ($q) => $q->where('id', '!=', $excludeReservationId))
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereDate('check_in_date', '<', $checkOut)
                      ->whereDate('check_out_date', '>', $checkIn);
            })
            ->exists();

        return !$conflict;
    }

    /**
     * Create a new reservation with double-booking prevention.
     */
    public function createReservation(array $data, ?int $userId = null): Reservation
    {
        return DB::transaction(function () use ($data, $userId) {
            $checkIn = Carbon::parse($data['check_in_date']);
            $checkOut = Carbon::parse($data['check_out_date']);

            if ($checkOut->lte($checkIn)) {
                throw ValidationException::withMessages([
                    'check_out_date' => 'Check-out date must be after check-in date.',
                ]);
            }

            $totalNights = max(1, $checkIn->diffInDays($checkOut));

            // Room Type & Room determination
            $roomType = RoomType::findOrFail($data['room_type_id']);
            $roomId = $data['room_id'] ?? null;

            if ($roomId) {
                if (!$this->isRoomAvailable($roomId, $data['check_in_date'], $data['check_out_date'])) {
                    throw ValidationException::withMessages([
                        'room_id' => "Room {$roomId} is not available for the selected dates (double booking prevented).",
                    ]);
                }
            } else {
                // Automatically allocate first available room of this room type
                $available = $this->getAvailableRooms($data['check_in_date'], $data['check_out_date'], $roomType->id);
                $roomId = $available->first()?->id;
            }

            $nightlyRate = (float)($data['nightly_rate'] ?? $roomType->base_price);
            $subtotal = $nightlyRate * $totalNights;
            $discount = (float)($data['discount'] ?? 0);

            $hotel = Hotel::current() ?? Hotel::first();

            $couponId = null;
            $couponCode = null;
            if (!empty($data['coupon_code'])) {
                $couponRes = $this->couponService->validateCoupon($data['coupon_code'], $subtotal, $hotel?->id);
                if ($couponRes['valid'] && $couponRes['coupon']) {
                    $coupon = $couponRes['coupon'];
                    $couponId = $coupon->id;
                    $couponCode = $coupon->code;
                    $discount = max($discount, $couponRes['discount_amount']);
                    $this->couponService->recordUsage($coupon);
                }
            }

            $tax = (float)($data['tax'] ?? 0);
            $totalAmount = max(0, $subtotal - $discount + $tax);

            $reservation = Reservation::create([
                'booking_number' => Reservation::generateBookingNumber(),
                'hotel_id' => $hotel?->id,
                'guest_id' => $data['guest_id'],
                'room_type_id' => $roomType->id,
                'room_id' => $roomId,
                'check_in_date' => $checkIn->format('Y-m-d'),
                'check_out_date' => $checkOut->format('Y-m-d'),
                'adults' => $data['adults'] ?? 1,
                'children' => $data['children'] ?? 0,
                'total_nights' => $totalNights,
                'nightly_rate' => $nightlyRate,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'coupon_id' => $couponId,
                'coupon_code' => $couponCode,
                'tax' => $tax,
                'total_amount' => $totalAmount,
                'paid_amount' => 0.00,
                'booking_status' => $data['booking_status'] ?? 'confirmed',
                'payment_status' => 'unpaid',
                'booking_source' => $data['booking_source'] ?? 'walk_in',
                'special_request' => $data['special_request'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => $userId,
            ]);

            // Audit log
            $this->auditLogService->log(
                action: 'reservation_created',
                module: 'reservations',
                description: "Created reservation {$reservation->booking_number} ({$reservation->booking_source})",
                recordId: $reservation->id,
                newValues: ['booking_number' => $reservation->booking_number, 'total' => $totalAmount, 'source' => $reservation->booking_source],
                userId: $userId,
                hotelId: $hotel?->id
            );

            // Notification
            $this->notificationService->createAlert(
                category: 'booking',
                title: 'New Booking Created',
                message: "Reservation {$reservation->booking_number} ({$reservation->booking_source}) was created.",
                type: 'info',
                link: "/reservations/{$reservation->id}",
                hotelId: $hotel?->id
            );

            // Create initial invoice
            $this->invoiceService->createForReservation($reservation, $userId);

            // If initial deposit/payment provided, record it
            if (!empty($data['deposit']) && (float)$data['deposit'] > 0) {
                $this->invoiceService->recordPayment(
                    invoice: $reservation->invoice,
                    amount: (float)$data['deposit'],
                    method: $data['payment_method'] ?? 'cash',
                    reference: 'Initial Booking Deposit',
                    userId: $userId
                );
            }

            return $reservation->fresh(['guest', 'room', 'roomType', 'invoice.items', 'invoice.payments']);
        });
    }

    /**
     * Check-in guest.
     * Section 10:
     * 1. Verify reservation.
     * 2. Verify guest.
     * 3. Assign room (if not yet assigned).
     * 4. Record check-in date/time.
     * 5. Change room status to Occupied.
     * 6. Generate/update registration record.
     */
    public function checkIn(Reservation $reservation, ?int $roomId = null, ?int $userId = null): Reservation
    {
        return DB::transaction(function () use ($reservation, $roomId, $userId) {
            $targetRoomId = $roomId ?? $reservation->room_id;

            if (!$targetRoomId) {
                $available = $this->getAvailableRooms(
                    $reservation->check_in_date->format('Y-m-d'),
                    $reservation->check_out_date->format('Y-m-d'),
                    $reservation->room_type_id,
                    excludeReservationId: $reservation->id
                );

                $targetRoomId = $available->first()?->id;

                if (!$targetRoomId) {
                    throw ValidationException::withMessages([
                        'room_id' => 'No available rooms found for this room type. Please select a room manually.',
                    ]);
                }
            }

            // Verify room is available or already held for this reservation
            if ($targetRoomId !== $reservation->room_id) {
                if (!$this->isRoomAvailable($targetRoomId, $reservation->check_in_date->format('Y-m-d'), $reservation->check_out_date->format('Y-m-d'), $reservation->id)) {
                    throw ValidationException::withMessages([
                        'room_id' => 'Selected room is not available for check-in.',
                    ]);
                }
            }

            $room = Room::findOrFail($targetRoomId);

            // Update room status to Occupied
            $room->markOccupied();

            // Update reservation
            $reservation->update([
                'room_id' => $room->id,
                'booking_status' => 'checked_in',
                'actual_check_in_at' => now(),
                'checked_in_by' => $userId,
            ]);

            $this->auditLogService->log(
                action: 'check_in',
                module: 'front_desk',
                description: "Checked in reservation {$reservation->booking_number} into Room {$room->room_number}",
                recordId: $reservation->id,
                newValues: ['room_id' => $room->id, 'room_number' => $room->room_number],
                userId: $userId,
                hotelId: $reservation->hotel_id
            );

            return $reservation->fresh(['guest', 'room', 'roomType', 'invoice']);
        });
    }

    /**
     * Check-out guest.
     * Section 11:
     * Room Charge + Services - Payments = Balance.
     * If balance is zero -> Checkout -> Room = Dirty.
     */
    public function checkOut(Reservation $reservation, bool $allowCreditCheckout = false, ?int $userId = null): Reservation
    {
        return DB::transaction(function () use ($reservation, $allowCreditCheckout, $userId) {
            $invoice = $reservation->invoice;

            if ($invoice) {
                $invoice->recalculate();
                if ($invoice->balance > 0 && !$allowCreditCheckout) {
                    throw ValidationException::withMessages([
                        'balance' => sprintf('Cannot checkout with outstanding balance of %s%.2f. Please collect payment first.', $reservation->hotel?->currency_symbol ?? '$', $invoice->balance),
                    ]);
                }
            }

            // Update room status to Dirty
            if ($reservation->room) {
                $reservation->room->markDirty();
            }

            $reservation->update([
                'booking_status' => 'checked_out',
                'actual_check_out_at' => now(),
                'checked_out_by' => $userId,
            ]);

            $this->auditLogService->log(
                action: 'check_out',
                module: 'front_desk',
                description: "Checked out reservation {$reservation->booking_number} from Room {$reservation->room?->room_number}",
                recordId: $reservation->id,
                newValues: ['actual_check_out_at' => now()->toIso8601String()],
                userId: $userId,
                hotelId: $reservation->hotel_id
            );

            return $reservation->fresh(['guest', 'room', 'roomType', 'invoice']);
        });
    }

    /**
     * Cancel a reservation.
     */
    public function cancelReservation(Reservation $reservation, ?int $userId = null): Reservation
    {
        return DB::transaction(function () use ($reservation, $userId) {
            if ($reservation->booking_status === 'checked_in') {
                throw ValidationException::withMessages([
                    'booking_status' => 'Cannot cancel a currently checked-in reservation. Please check-out instead.',
                ]);
            }

            $reservation->update([
                'booking_status' => 'cancelled',
            ]);

            if ($reservation->room && $reservation->room->status === 'reserved') {
                $reservation->room->update(['status' => 'available']);
            }

            $this->auditLogService->log(
                action: 'reservation_cancelled',
                module: 'reservations',
                description: "Cancelled reservation {$reservation->booking_number}",
                recordId: $reservation->id,
                userId: $userId,
                hotelId: $reservation->hotel_id
            );

            return $reservation->fresh();
        });
    }

    /**
     * Express Walk-In: Guest + Room + Booking + Check-in in one flow.
     */
    public function walkIn(array $guestData, array $bookingData, ?int $userId = null): Reservation
    {
        return DB::transaction(function () use ($guestData, $bookingData, $userId) {
            // Find or create guest
            $guest = Guest::where('phone', $guestData['phone'])
                ->orWhere(function ($q) use ($guestData) {
                    if (!empty($guestData['email'])) {
                        $q->where('email', $guestData['email']);
                    }
                })
                ->first();

            if (!$guest) {
                $guest = Guest::create($guestData);
            } else {
                $guest->update(array_filter($guestData));
            }

            $bookingData['guest_id'] = $guest->id;
            $bookingData['booking_source'] = 'walk_in';
            $bookingData['booking_status'] = 'confirmed';

            $reservation = $this->createReservation($bookingData, $userId);

            // Immediately check-in
            return $this->checkIn($reservation, $reservation->room_id, $userId);
        });
    }
}
