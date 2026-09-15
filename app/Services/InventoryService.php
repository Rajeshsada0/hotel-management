<?php

namespace App\Services;

use App\Models\Hotel;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\Purchase;
use App\Services\AuditLogService;
use App\Services\NotificationService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    public function __construct(
        protected ?AuditLogService $auditLogService = null,
        protected ?NotificationService $notificationService = null
    ) {
        $this->auditLogService ??= app(AuditLogService::class);
        $this->notificationService ??= app(NotificationService::class);
    }
    /**
     * Record a stock movement transaction and update current stock.
     */
    public function recordTransaction(array $data, ?int $userId = null): InventoryTransaction
    {
        return DB::transaction(function () use ($data, $userId) {
            $item = InventoryItem::findOrFail($data['inventory_item_id']);
            $qty = (float)$data['quantity'];
            $type = $data['transaction_type'];
            $unitPrice = (float)($data['unit_price'] ?? $item->purchase_price);
            $totalPrice = $qty * $unitPrice;

            switch ($type) {
                case 'stock_in':
                case 'purchase':
                case 'return':
                    $item->increment('current_stock', $qty);
                    break;

                case 'stock_out':
                case 'waste':
                    if ($item->current_stock < $qty) {
                        throw ValidationException::withMessages([
                            'quantity' => "Insufficient stock. Available: {$item->current_stock} {$item->unit}.",
                        ]);
                    }
                    $item->decrement('current_stock', $qty);
                    break;

                case 'adjustment':
                    $item->update(['current_stock' => $qty]);
                    break;

                default:
                    throw ValidationException::withMessages([
                        'transaction_type' => 'Invalid transaction type.',
                    ]);
            }

            $hotel = Hotel::current() ?? Hotel::first();

            $transaction = InventoryTransaction::create([
                'hotel_id' => $hotel?->id,
                'inventory_item_id' => $item->id,
                'user_id' => $userId,
                'transaction_type' => $type,
                'quantity' => $qty,
                'unit_price' => $unitPrice,
                'total_price' => $totalPrice,
                'department' => $data['department'] ?? null,
                'reference_number' => $data['reference_number'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            $this->auditLogService->log(
                action: 'stock_adjusted',
                module: 'inventory',
                description: "Recorded {$type} of {$qty} {$item->unit} for item '{$item->name}'",
                recordId: $item->id,
                newValues: ['stock' => $item->fresh()->current_stock, 'type' => $type, 'qty' => $qty],
                userId: $userId,
                hotelId: $hotel?->id
            );

            if ($item->fresh()->current_stock <= $item->minimum_stock) {
                $this->notificationService->createAlert(
                    category: 'low_stock',
                    title: 'Low Inventory Alert',
                    message: "Stock for '{$item->name}' is {$item->fresh()->current_stock} {$item->unit} (Minimum: {$item->minimum_stock} {$item->unit}).",
                    type: 'warning',
                    link: '/inventory',
                    hotelId: $hotel?->id
                );
            }

            return $transaction;
        });
    }

    /**
     * Receive a purchase order, automatically restocking inventory items.
     */
    public function receivePurchase(Purchase $purchase, ?int $userId = null): Purchase
    {
        if ($purchase->status === 'received') {
            throw ValidationException::withMessages([
                'status' => 'Purchase order has already been received.',
            ]);
        }

        return DB::transaction(function () use ($purchase, $userId) {
            foreach ($purchase->items as $item) {
                if ($item->inventory_item_id && $item->inventoryItem) {
                    $invItem = $item->inventoryItem;
                    $invItem->increment('current_stock', (float)$item->quantity);

                    InventoryTransaction::create([
                        'hotel_id' => $purchase->hotel_id,
                        'inventory_item_id' => $invItem->id,
                        'user_id' => $userId,
                        'transaction_type' => 'purchase',
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_cost,
                        'total_price' => $item->total_cost,
                        'reference_number' => $purchase->purchase_number,
                        'notes' => "Received from PO {$purchase->purchase_number}",
                    ]);
                }
            }

            $purchase->update([
                'status' => 'received',
                'delivery_date' => now()->toDateString(),
            ]);

            return $purchase->fresh(['items.inventoryItem', 'supplier']);
        });
    }

    /**
     * Retrieve all items whose stock level is at or below the minimum stock threshold.
     */
    public function getLowStockItems(?int $hotelId = null): Collection
    {
        $query = InventoryItem::with('supplier')
            ->where('status', 'active')
            ->whereColumn('current_stock', '<=', 'minimum_stock');

        if ($hotelId) {
            $query->where('hotel_id', $hotelId);
        }

        return $query->get();
    }
}
