<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Services\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function __construct(
        protected InventoryService $inventoryService
    ) {}

    /**
     * Display inventory catalog, stock transactions, suppliers, and purchase orders.
     */
    public function index(): Response
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $items = InventoryItem::with('supplier')
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->map(function ($item) {
                $item->is_low_stock = $item->isLowStock();
                return $item;
            });

        $lowStockItems = $this->inventoryService->getLowStockItems($hotel?->id);

        $transactions = InventoryTransaction::with(['inventoryItem', 'user'])
            ->latest()
            ->paginate(15, ['*'], 'transactions_page');

        $suppliers = Supplier::withCount('inventoryItems')
            ->orderBy('company_name')
            ->get();

        $purchases = Purchase::with(['supplier', 'items.inventoryItem'])
            ->latest()
            ->paginate(10, ['*'], 'purchases_page');

        return Inertia::render('inventory/index', [
            'hotel' => $hotel,
            'items' => $items,
            'lowStockCount' => $lowStockItems->count(),
            'transactions' => $transactions,
            'suppliers' => $suppliers,
            'purchases' => $purchases,
        ]);
    }

    /**
     * Store a new stock inventory item.
     */
    public function storeItem(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'category' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:50', 'unique:inventory_items,sku'],
            'unit' => ['required', 'string', 'max:20'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['nullable', 'numeric', 'min:0'],
            'opening_stock' => ['required', 'numeric', 'min:0'],
            'minimum_stock' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $hotel = Hotel::current() ?? Hotel::first();

        $item = InventoryItem::create(array_merge($validated, [
            'hotel_id' => $hotel?->id,
            'current_stock' => $validated['opening_stock'],
            'status' => 'active',
        ]));

        // Log opening stock transaction if > 0
        if ((float)$validated['opening_stock'] > 0) {
            InventoryTransaction::create([
                'hotel_id' => $hotel?->id,
                'inventory_item_id' => $item->id,
                'user_id' => $request->user()?->id,
                'transaction_type' => 'stock_in',
                'quantity' => $validated['opening_stock'],
                'unit_price' => $validated['purchase_price'],
                'total_price' => (float)$validated['opening_stock'] * (float)$validated['purchase_price'],
                'notes' => 'Opening stock initialization',
            ]);
        }

        return back()->with('success', "Inventory item '{$item->name}' ({$item->sku}) registered.");
    }

    /**
     * Record a stock transaction (Stock In, Stock Out, Waste, Adjustment).
     */
    public function storeTransaction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'transaction_type' => ['required', 'in:stock_in,stock_out,waste,adjustment,return'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'department' => ['nullable', 'string'],
            'reference_number' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $transaction = $this->inventoryService->recordTransaction(
            $validated,
            $request->user()?->id
        );

        return back()->with('success', "Stock movement recorded for '{$transaction->inventoryItem->name}'.");
    }

    /**
     * Register a new supplier.
     */
    public function storeSupplier(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'tax_number' => ['nullable', 'string', 'max:50'],
            'payment_terms' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $hotel = Hotel::current() ?? Hotel::first();

        $supplier = Supplier::create(array_merge($validated, [
            'hotel_id' => $hotel?->id,
            'status' => 'active',
        ]));

        return back()->with('success', "Supplier '{$supplier->company_name}' added successfully.");
    }

    /**
     * Create a new purchase order.
     */
    public function storePurchase(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'purchase_date' => ['required', 'date'],
            'delivery_date' => ['nullable', 'date'],
            'payment_method' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.inventory_item_id' => ['nullable', 'exists:inventory_items,id'],
            'items.*.item_name' => ['required', 'string'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_cost' => ['required', 'numeric', 'min:0'],
        ]);

        $hotel = Hotel::current() ?? Hotel::first();

        $subtotal = 0.00;
        foreach ($validated['items'] as $item) {
            $subtotal += (float)$item['quantity'] * (float)$item['unit_cost'];
        }
        $tax = round($subtotal * 0.08, 2);
        $totalAmount = $subtotal + $tax;

        $purchase = Purchase::create([
            'hotel_id' => $hotel?->id,
            'supplier_id' => $validated['supplier_id'],
            'purchase_number' => Purchase::generatePurchaseNumber(),
            'purchase_date' => $validated['purchase_date'],
            'delivery_date' => $validated['delivery_date'] ?? null,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total_amount' => $totalAmount,
            'status' => 'ordered',
            'payment_status' => 'unpaid',
            'payment_method' => $validated['payment_method'] ?? 'bank_transfer',
            'created_by' => $request->user()?->id,
            'notes' => $validated['notes'] ?? null,
        ]);

        foreach ($validated['items'] as $item) {
            $purchase->items()->create([
                'inventory_item_id' => $item['inventory_item_id'] ?? null,
                'item_name' => $item['item_name'],
                'quantity' => $item['quantity'],
                'unit_cost' => $item['unit_cost'],
                'total_cost' => (float)$item['quantity'] * (float)$item['unit_cost'],
            ]);
        }

        return back()->with('success', "Purchase Order #{$purchase->purchase_number} created.");
    }

    /**
     * Receive a purchase order and automatically replenish inventory stock.
     */
    public function receivePurchase(Request $request, Purchase $purchase): RedirectResponse
    {
        $this->inventoryService->receivePurchase($purchase, $request->user()?->id);

        return back()->with('success', "Purchase Order #{$purchase->purchase_number} marked as received. Stock replenished!");
    }
}
