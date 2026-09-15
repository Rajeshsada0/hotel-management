<?php

namespace Database\Seeders;

use App\Models\Guest;
use App\Models\Hotel;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ReservationSeeder extends Seeder
{
    public function run(): void
    {
        $hotel = Hotel::current() ?? Hotel::first();
        $admin = User::first();

        $guest1 = Guest::where('first_name', 'Alexander')->first();
        $guest2 = Guest::where('first_name', 'David')->first();
        $guest3 = Guest::where('first_name', 'Elena')->first();
        $guest4 = Guest::where('first_name', 'Sophia')->first();

        $room203 = Room::where('room_number', '203')->first();
        $room204 = Room::where('room_number', '204')->first();
        $room302 = Room::where('room_number', '302')->first();
        $room103 = Room::where('room_number', '103')->first();

        // 1. In-house checked-in guest (Alexander Wright in 204)
        if ($guest1 && $room204) {
            $checkIn = Carbon::today()->subDays(1);
            $checkOut = Carbon::today()->addDays(2);
            $nights = 3;
            $rate = (float)$room204->roomType->base_price;
            $subtotal = $rate * $nights;
            $tax = round($subtotal * 0.10, 2);
            $total = $subtotal + $tax;

            $res1 = Reservation::firstOrCreate(
                ['booking_number' => 'BK-2026-0001'],
                [
                    'hotel_id' => $hotel?->id,
                    'guest_id' => $guest1->id,
                    'room_type_id' => $room204->room_type_id,
                    'room_id' => $room204->id,
                    'check_in_date' => $checkIn->toDateString(),
                    'check_out_date' => $checkOut->toDateString(),
                    'actual_check_in_at' => $checkIn->copy()->setTime(14, 30),
                    'adults' => 2,
                    'children' => 0,
                    'total_nights' => $nights,
                    'nightly_rate' => $rate,
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'total_amount' => $total,
                    'paid_amount' => 200.00,
                    'booking_status' => 'checked_in',
                    'payment_status' => 'partially_paid',
                    'booking_source' => 'website',
                    'checked_in_by' => $admin?->id,
                ]
            );

            $inv1 = Invoice::firstOrCreate(
                ['invoice_number' => 'INV-2026-0001'],
                [
                    'hotel_id' => $hotel?->id,
                    'reservation_id' => $res1->id,
                    'guest_id' => $guest1->id,
                    'issue_date' => $checkIn->toDateString(),
                    'due_date' => $checkOut->toDateString(),
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'total_amount' => $total,
                    'paid_amount' => 200.00,
                    'status' => 'partially_paid',
                    'created_by' => $admin?->id,
                ]
            );

            InvoiceItem::firstOrCreate(
                ['invoice_id' => $inv1->id, 'description' => "Accommodation: Room 204 ({$nights} nights @ {$rate})"],
                ['item_type' => 'room', 'quantity' => $nights, 'unit_price' => $rate, 'total_price' => $subtotal]
            );

            Payment::firstOrCreate(
                ['payment_number' => 'PAY-2026-0001'],
                [
                    'hotel_id' => $hotel?->id,
                    'invoice_id' => $inv1->id,
                    'reservation_id' => $res1->id,
                    'guest_id' => $guest1->id,
                    'amount' => 200.00,
                    'payment_method' => 'credit_card',
                    'transaction_number' => 'TXN-9847291',
                    'payment_date' => $checkIn->copy()->setTime(14, 35),
                    'received_by' => $admin?->id,
                ]
            );
        }

        // 2. In-house checked-in guest (David Chen in 203)
        if ($guest2 && $room203) {
            $checkIn = Carbon::today();
            $checkOut = Carbon::today()->addDays(3);
            $nights = 3;
            $rate = (float)$room203->roomType->base_price;
            $subtotal = $rate * $nights;
            $tax = round($subtotal * 0.10, 2);
            $total = $subtotal + $tax;

            $res2 = Reservation::firstOrCreate(
                ['booking_number' => 'BK-2026-0002'],
                [
                    'hotel_id' => $hotel?->id,
                    'guest_id' => $guest2->id,
                    'room_type_id' => $room203->room_type_id,
                    'room_id' => $room203->id,
                    'check_in_date' => $checkIn->toDateString(),
                    'check_out_date' => $checkOut->toDateString(),
                    'actual_check_in_at' => now(),
                    'adults' => 2,
                    'children' => 0,
                    'total_nights' => $nights,
                    'nightly_rate' => $rate,
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'total_amount' => $total,
                    'paid_amount' => $total,
                    'booking_status' => 'checked_in',
                    'payment_status' => 'paid',
                    'booking_source' => 'walk_in',
                    'checked_in_by' => $admin?->id,
                ]
            );

            $inv2 = Invoice::firstOrCreate(
                ['invoice_number' => 'INV-2026-0002'],
                [
                    'hotel_id' => $hotel?->id,
                    'reservation_id' => $res2->id,
                    'guest_id' => $guest2->id,
                    'issue_date' => $checkIn->toDateString(),
                    'due_date' => $checkOut->toDateString(),
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'total_amount' => $total,
                    'paid_amount' => $total,
                    'status' => 'paid',
                    'created_by' => $admin?->id,
                ]
            );

            InvoiceItem::firstOrCreate(
                ['invoice_id' => $inv2->id, 'description' => "Accommodation: Room 203 ({$nights} nights @ {$rate})"],
                ['item_type' => 'room', 'quantity' => $nights, 'unit_price' => $rate, 'total_price' => $subtotal]
            );

            Payment::firstOrCreate(
                ['payment_number' => 'PAY-2026-0002'],
                [
                    'hotel_id' => $hotel?->id,
                    'invoice_id' => $inv2->id,
                    'reservation_id' => $res2->id,
                    'guest_id' => $guest2->id,
                    'amount' => $total,
                    'payment_method' => 'cash',
                    'payment_date' => now(),
                    'received_by' => $admin?->id,
                ]
            );
        }

        // 3. Confirmed upcoming booking (Elena Rostova in 302)
        if ($guest3 && $room302) {
            $checkIn = Carbon::today()->addDays(1);
            $checkOut = Carbon::today()->addDays(4);
            $nights = 3;
            $rate = (float)$room302->roomType->base_price;
            $subtotal = $rate * $nights;
            $tax = round($subtotal * 0.10, 2);
            $total = $subtotal + $tax;

            Reservation::firstOrCreate(
                ['booking_number' => 'BK-2026-0003'],
                [
                    'hotel_id' => $hotel?->id,
                    'guest_id' => $guest3->id,
                    'room_type_id' => $room302->room_type_id,
                    'room_id' => $room302->id,
                    'check_in_date' => $checkIn->toDateString(),
                    'check_out_date' => $checkOut->toDateString(),
                    'adults' => 1,
                    'children' => 0,
                    'total_nights' => $nights,
                    'nightly_rate' => $rate,
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'total_amount' => $total,
                    'paid_amount' => 0.00,
                    'booking_status' => 'confirmed',
                    'payment_status' => 'unpaid',
                    'booking_source' => 'booking_com',
                ]
            );
        }
    }
}
