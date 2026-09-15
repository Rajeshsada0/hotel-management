<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\Reservation;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InvoiceService
{
    public function __construct(
        protected ?AuditLogService $auditLogService = null
    ) {
        $this->auditLogService ??= app(AuditLogService::class);
    }
    /**
     * Create an invoice for a reservation.
     */
    public function createForReservation(Reservation $reservation, ?int $userId = null): Invoice
    {
        return DB::transaction(function () use ($reservation, $userId) {
            $invoice = Invoice::create([
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'hotel_id' => $reservation->hotel_id,
                'reservation_id' => $reservation->id,
                'guest_id' => $reservation->guest_id,
                'issue_date' => now()->toDateString(),
                'due_date' => $reservation->check_out_date->toDateString(),
                'subtotal' => $reservation->subtotal,
                'discount' => $reservation->discount,
                'tax' => $reservation->tax,
                'total_amount' => $reservation->total_amount,
                'paid_amount' => 0.00,
                'status' => 'unpaid',
                'created_by' => $userId,
            ]);

            // Add room charges item
            $roomName = $reservation->room ? "Room {$reservation->room->room_number}" : ($reservation->roomType?->name ?? 'Room Charge');
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'item_type' => 'room',
                'description' => "Accommodation: {$roomName} ({$reservation->total_nights} nights @ {$reservation->nightly_rate})",
                'quantity' => $reservation->total_nights,
                'unit_price' => $reservation->nightly_rate,
                'total_price' => $reservation->subtotal,
            ]);

            return $invoice;
        });
    }

    /**
     * Add extra service charge (e.g. restaurant, laundry, minibar, spa).
     */
    public function addItem(Invoice $invoice, string $itemType, string $description, float $quantity, float $rate): InvoiceItem
    {
        return DB::transaction(function () use ($invoice, $itemType, $description, $quantity, $rate) {
            $item = InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'item_type' => $itemType,
                'description' => $description,
                'quantity' => $quantity,
                'unit_price' => $rate,
                'total_price' => $quantity * $rate,
            ]);

            $invoice->recalculate();

            // Synchronize with reservation if linked
            if ($invoice->reservation) {
                $invoice->reservation->update([
                    'subtotal' => $invoice->subtotal,
                    'total_amount' => $invoice->total_amount,
                ]);
            }

            return $item;
        });
    }

    /**
     * Record a payment against an invoice.
     */
    public function recordPayment(
        Invoice $invoice,
        float $amount,
        string $method = 'cash',
        ?string $transactionNumber = null,
        ?string $reference = null,
        ?string $notes = null,
        ?int $userId = null
    ): Payment {
        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => 'Payment amount must be greater than zero.',
            ]);
        }

        return DB::transaction(function () use ($invoice, $amount, $method, $transactionNumber, $reference, $notes, $userId) {
            $payment = Payment::create([
                'payment_number' => Payment::generatePaymentNumber(),
                'hotel_id' => $invoice->hotel_id,
                'invoice_id' => $invoice->id,
                'reservation_id' => $invoice->reservation_id,
                'guest_id' => $invoice->guest_id,
                'amount' => $amount,
                'payment_method' => $method,
                'transaction_number' => $transactionNumber,
                'payment_date' => now(),
                'reference' => $reference,
                'notes' => $notes,
                'received_by' => $userId,
            ]);

            $invoice->recalculate();

            // Synchronize reservation payment info
            if ($invoice->reservation) {
                $resPaid = $invoice->payments()->sum('amount');
                $resStatus = 'unpaid';
                if ($resPaid >= $invoice->total_amount && $invoice->total_amount > 0) {
                    $resStatus = 'paid';
                } elseif ($resPaid > 0) {
                    $resStatus = 'partially_paid';
                }

                $invoice->reservation->update([
                    'paid_amount' => $resPaid,
                    'payment_status' => $resStatus,
                ]);
            }

            $this->auditLogService->log(
                action: 'payment_recorded',
                module: 'billing',
                description: sprintf('Recorded payment of $%.2f via %s for Invoice %s', $amount, ucfirst($method), $invoice->invoice_number),
                recordId: $payment->id,
                newValues: ['amount' => $amount, 'method' => $method, 'invoice_id' => $invoice->id],
                userId: $userId,
                hotelId: $invoice->hotel_id
            );

            return $payment;
        });
    }
}
