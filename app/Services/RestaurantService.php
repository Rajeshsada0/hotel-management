<?php

namespace App\Services;

use App\Models\Hotel;
use App\Models\Reservation;
use App\Models\RestaurantOrder;
use App\Models\RestaurantOrderItem;
use App\Models\RestaurantProduct;
use App\Models\RestaurantTable;
use App\Models\Room;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RestaurantService
{
    public function __construct(
        protected InvoiceService $invoiceService
    ) {}

    /**
     * Create a new POS restaurant order with items and handle "Charge to Room".
     */
    public function createOrder(array $orderData, array $itemsData, ?int $userId = null): RestaurantOrder
    {
        if (empty($itemsData)) {
            throw ValidationException::withMessages([
                'items' => 'Order must contain at least one item.',
            ]);
        }

        return DB::transaction(function () use ($orderData, $itemsData, $userId) {
            $hotel = Hotel::current() ?? Hotel::first();

            $subtotal = 0.00;
            $preparedItems = [];

            foreach ($itemsData as $item) {
                $qty = (float)($item['quantity'] ?? 1);
                $unitPrice = (float)$item['unit_price'];
                $itemTotal = $qty * $unitPrice;
                $subtotal += $itemTotal;

                $preparedItems[] = [
                    'product_id' => $item['product_id'] ?? null,
                    'product_name' => $item['product_name'],
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'total_price' => $itemTotal,
                    'notes' => $item['notes'] ?? null,
                ];
            }

            $discount = (float)($orderData['discount'] ?? 0.00);
            $tax = (float)($orderData['tax'] ?? round($subtotal * 0.08, 2)); // 8% sales tax
            $totalAmount = max(0, $subtotal - $discount + $tax);

            $orderNumber = RestaurantOrder::generateOrderNumber();
            $paymentMethod = $orderData['payment_method'] ?? 'unpaid';
            $paymentStatus = in_array($paymentMethod, ['cash', 'card', 'charge_to_room']) ? 'paid' : 'unpaid';

            $tableId = $orderData['table_id'] ?? null;
            $table = $tableId ? RestaurantTable::find($tableId) : null;
            if ($table) {
                $table->update(['status' => 'occupied']);
            }

            // Charge to Room resolution (Section 14)
            $reservationId = $orderData['reservation_id'] ?? null;
            $roomId = $orderData['room_id'] ?? null;
            $guestId = null;
            $invoiceItemId = null;

            if ($paymentMethod === 'charge_to_room') {
                $reservation = null;

                if ($reservationId) {
                    $reservation = Reservation::with(['invoice', 'room'])->find($reservationId);
                } elseif ($roomId) {
                    $reservation = Reservation::with(['invoice', 'room'])
                        ->where('room_id', $roomId)
                        ->where('booking_status', 'checked_in')
                        ->latest()
                        ->first();
                }

                if (!$reservation || !$reservation->invoice) {
                    throw ValidationException::withMessages([
                        'room_id' => 'No active checked-in guest folio found for this room.',
                    ]);
                }

                $reservationId = $reservation->id;
                $roomId = $reservation->room_id;
                $guestId = $reservation->guest_id;

                $locationDesc = $table ? "Table {$table->table_number}" : ($roomId ? "Room {$reservation->room?->room_number}" : "Restaurant");
                $chargeDesc = "Restaurant Order #{$orderNumber} ({$locationDesc})";

                // Add itemized line to guest hotel invoice
                $invItem = $this->invoiceService->addItem(
                    invoice: $reservation->invoice,
                    itemType: 'restaurant',
                    description: $chargeDesc,
                    quantity: 1,
                    rate: $totalAmount
                );

                $invoiceItemId = $invItem->id;
            }

            $order = RestaurantOrder::create([
                'order_number' => $orderNumber,
                'hotel_id' => $hotel?->id,
                'table_id' => $tableId,
                'server_id' => $userId,
                'reservation_id' => $reservationId,
                'room_id' => $roomId,
                'guest_id' => $guestId,
                'invoice_item_id' => $invoiceItemId,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total_amount' => $totalAmount,
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'order_status' => 'completed',
                'notes' => $orderData['notes'] ?? null,
            ]);

            foreach ($preparedItems as $item) {
                $order->items()->create($item);
            }

            return $order->fresh(['items', 'table', 'server', 'reservation.room', 'guest']);
        });
    }

    /**
     * Settle an unpaid table order.
     */
    public function settleOrder(RestaurantOrder $order, string $paymentMethod): RestaurantOrder
    {
        return DB::transaction(function () use ($order, $paymentMethod) {
            $order->update([
                'payment_method' => $paymentMethod,
                'payment_status' => 'paid',
                'order_status' => 'completed',
            ]);

            if ($order->table) {
                $order->table->update(['status' => 'available']);
            }

            return $order->fresh(['table']);
        });
    }
}
