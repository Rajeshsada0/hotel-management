<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Hotel;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\Purchase;
use App\Models\Staff;
use App\Models\Supplier;
use App\Models\User;
use App\Services\ExpenseService;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryAndExpenseTest extends TestCase
{
    use RefreshDatabase;

    protected Hotel $hotel;
    protected User $user;
    protected Supplier $supplier;
    protected InventoryItem $item;
    protected InventoryService $inventoryService;
    protected ExpenseService $expenseService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->inventoryService = app(InventoryService::class);
        $this->expenseService = app(ExpenseService::class);

        $this->hotel = Hotel::create([
            'name' => 'Grand Horizon Hotel',
            'code' => 'GH-01',
            'address' => '100 Ocean Blvd',
            'city' => 'Miami',
            'country' => 'United States',
            'phone' => '+1 555-000-1111',
            'email' => 'contact@grandhorizon.com',
            'currency' => 'USD',
            'currency_symbol' => '$',
            'check_in_time' => '14:00',
            'check_out_time' => '11:00',
            'status' => 'active',
        ]);

        $this->user = User::factory()->create(['role' => 'super_admin']);

        $this->supplier = Supplier::create([
            'hotel_id' => $this->hotel->id,
            'company_name' => 'LinenPro Textiles',
            'contact_person' => 'Sarah Jenkins',
            'phone' => '+1 555-401-2299',
            'email' => 'sarah@linenpro.com',
            'status' => 'active',
        ]);

        $this->item = InventoryItem::create([
            'hotel_id' => $this->hotel->id,
            'supplier_id' => $this->supplier->id,
            'category' => 'linens',
            'name' => 'King Bedsheet Set',
            'sku' => 'LIN-101',
            'unit' => 'pcs',
            'purchase_price' => 25.00,
            'opening_stock' => 30.00,
            'current_stock' => 30.00,
            'minimum_stock' => 10.00,
            'status' => 'active',
        ]);
    }

    public function test_inventory_index_screen_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get('/inventory');

        $response->assertStatus(200);
    }

    public function test_user_can_create_supplier(): void
    {
        $response = $this->actingAs($this->user)->post('/inventory/suppliers', [
            'company_name' => 'EcoClean Solutions',
            'contact_person' => 'Bob White',
            'phone' => '+1 555-9988',
            'email' => 'bob@ecoclean.com',
            'payment_terms' => 'Net 30',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('suppliers', [
            'company_name' => 'EcoClean Solutions',
            'contact_person' => 'Bob White',
        ]);
    }

    public function test_user_can_create_inventory_item(): void
    {
        $response = $this->actingAs($this->user)->post('/inventory/items', [
            'supplier_id' => $this->supplier->id,
            'category' => 'toiletries',
            'name' => 'Organic Shampoo 50ml',
            'sku' => 'TOI-201',
            'unit' => 'bottle',
            'purchase_price' => 1.50,
            'opening_stock' => 100,
            'minimum_stock' => 20,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('inventory_items', [
            'sku' => 'TOI-201',
            'name' => 'Organic Shampoo 50ml',
            'current_stock' => 100,
        ]);

        // Opening stock transaction recorded
        $this->assertDatabaseHas('inventory_transactions', [
            'transaction_type' => 'stock_in',
            'quantity' => 100,
        ]);
    }

    public function test_user_can_record_stock_in_transaction(): void
    {
        $response = $this->actingAs($this->user)->post('/inventory/transactions', [
            'inventory_item_id' => $this->item->id,
            'transaction_type' => 'stock_in',
            'quantity' => 15,
            'department' => 'Housekeeping',
            'notes' => 'Received surplus shipment',
        ]);

        $response->assertRedirect();

        $this->item->refresh();
        $this->assertEquals(45.00, (float)$this->item->current_stock); // 30 + 15
        $this->assertDatabaseHas('inventory_transactions', [
            'inventory_item_id' => $this->item->id,
            'transaction_type' => 'stock_in',
            'quantity' => 15,
        ]);
    }

    public function test_user_can_record_stock_out_transaction(): void
    {
        $response = $this->actingAs($this->user)->post('/inventory/transactions', [
            'inventory_item_id' => $this->item->id,
            'transaction_type' => 'stock_out',
            'quantity' => 10,
            'department' => 'Housekeeping',
            'notes' => 'Dispatched to 3rd floor closets',
        ]);

        $response->assertRedirect();

        $this->item->refresh();
        $this->assertEquals(20.00, (float)$this->item->current_stock); // 30 - 10
        $this->assertDatabaseHas('inventory_transactions', [
            'inventory_item_id' => $this->item->id,
            'transaction_type' => 'stock_out',
            'quantity' => 10,
        ]);
    }

    public function test_user_cannot_stock_out_more_than_available(): void
    {
        $response = $this->actingAs($this->user)->post('/inventory/transactions', [
            'inventory_item_id' => $this->item->id,
            'transaction_type' => 'stock_out',
            'quantity' => 500, // Available is only 30
        ]);

        $response->assertSessionHasErrors(['quantity']);
        $this->item->refresh();
        $this->assertEquals(30.00, (float)$this->item->current_stock);
    }

    public function test_user_can_create_and_receive_purchase_order(): void
    {
        // 1. Create Purchase Order
        $response = $this->actingAs($this->user)->post('/inventory/purchases', [
            'supplier_id' => $this->supplier->id,
            'purchase_date' => now()->toDateString(),
            'notes' => 'Urgent replenishment',
            'items' => [
                [
                    'inventory_item_id' => $this->item->id,
                    'item_name' => $this->item->name,
                    'quantity' => 20,
                    'unit_cost' => 25.00,
                ],
            ],
        ]);

        $response->assertRedirect();
        $purchase = Purchase::where('supplier_id', $this->supplier->id)->latest()->first();
        $this->assertNotNull($purchase);
        $this->assertEquals('ordered', $purchase->status);
        $this->assertEquals(540.00, (float)$purchase->total_amount); // 500 + 8% tax

        // Initial stock is 30
        $this->assertEquals(30.00, (float)$this->item->current_stock);

        // 2. Mark PO as Received
        $receiveResponse = $this->actingAs($this->user)->post("/inventory/purchases/{$purchase->id}/receive");
        $receiveResponse->assertRedirect();

        $purchase->refresh();
        $this->assertEquals('received', $purchase->status);

        // Item stock should now be 30 + 20 = 50
        $this->item->refresh();
        $this->assertEquals(50.00, (float)$this->item->current_stock);

        $this->assertDatabaseHas('inventory_transactions', [
            'inventory_item_id' => $this->item->id,
            'transaction_type' => 'purchase',
            'quantity' => 20,
        ]);
    }

    public function test_expenses_index_screen_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get('/expenses');

        $response->assertStatus(200);
    }

    public function test_user_can_record_expense(): void
    {
        $response = $this->actingAs($this->user)->post('/expenses', [
            'category' => 'electricity',
            'amount' => 1250.75,
            'expense_date' => now()->toDateString(),
            'payment_method' => 'bank_transfer',
            'description' => 'Main grid power consumption for building',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('expenses', [
            'category' => 'electricity',
            'amount' => 1250.75,
            'payment_method' => 'bank_transfer',
        ]);
    }

    public function test_user_can_add_staff_member(): void
    {
        $response = $this->actingAs($this->user)->post('/expenses/staff', [
            'name' => 'Michael Scott',
            'department' => 'management',
            'position' => 'Regional Hotel Manager',
            'phone' => '+1 555-0199',
            'email' => 'michael.scott@grandhorizon.com',
            'joining_date' => '2024-01-01',
            'salary' => 5000.00,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('staff', [
            'name' => 'Michael Scott',
            'department' => 'management',
            'position' => 'Regional Hotel Manager',
            'salary' => 5000.00,
            'status' => 'active',
        ]);
    }
}
