<?php

namespace App\Services;

use App\Models\Hotel;
use App\Models\Reservation;
use App\Models\Service;
use App\Models\ServiceOrder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class HotelServiceService
{
    public function __construct(
        protected InvoiceService $invoiceService
    ) {}

    /**
     * Create service order and optionally charge to room invoice.
     */
    public function orderService(array $data, ?int $userId = null): ServiceOrder
    {
        return DB::transaction(function () use ($data, $userId) {
            $service = Service::findOrFail($data['service_id']);
            $reservation = Reservation::with(['invoice', 'room', 'guest'])->findOrFail($data['reservation_id']);

            $quantity = (float)($data['quantity'] ?? 1);
            $unitPrice = (float)($data['unit_price'] ?? $service->price);
            $totalPrice = $quantity * $unitPrice;
            $chargedToRoom = (bool)($data['charged_to_room'] ?? true);

            $hotel = Hotel::current() ?? Hotel::first();

            $order = ServiceOrder::create([
                'order_number' => ServiceOrder::generateOrderNumber(),
                'hotel_id' => $hotel?->id,
                'reservation_id' => $reservation->id,
                'guest_id' => $reservation->guest_id,
                'room_id' => $reservation->room_id,
                'service_id' => $service->id,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total_price' => $totalPrice,
                'status' => 'completed',
                'charged_to_room' => $chargedToRoom,
                'ordered_at' => now(),
                'notes' => $data['notes'] ?? null,
                'created_by' => $userId,
            ]);

            // Add charge to room folio
            if ($chargedToRoom && $reservation->invoice) {
                $category = $service->category ?? 'service';
                $description = "{$service->name} (Qty: {$quantity})";

                $invoiceItem = $this->invoiceService->addItem(
                    invoice: $reservation->invoice,
                    itemType: $category,
                    description: $description,
                    quantity: $quantity,
                    rate: $unitPrice
                );

                $order->update(['invoice_item_id' => $invoiceItem->id]);
            }

            return $order->fresh(['service', 'guest', 'room', 'reservation']);
        });
    }
}
