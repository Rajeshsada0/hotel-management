<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\Hotel;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\Purchase;
use App\Models\Staff;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hotel = Hotel::first();
        $admin = User::first();

        // 1. Suppliers (Section 17)
        $linenSupplier = Supplier::firstOrCreate(
            ['company_name' => 'LinenPro Hospitality Textiles'],
            [
                'hotel_id' => $hotel?->id,
                'contact_person' => 'Sarah Jenkins',
                'phone' => '+1 555-401-2299',
                'email' => 'sales@linenpro-hotel.com',
                'address' => '450 Textile Way, Atlanta, GA',
                'tax_number' => 'TX-892144',
                'payment_terms' => 'Net 30',
                'status' => 'active',
            ]
        );

        $toiletrySupplier = Supplier::firstOrCreate(
            ['company_name' => 'CleanCare Amenities & Supplies'],
            [
                'hotel_id' => $hotel?->id,
                'contact_person' => 'Mark Vance',
                'phone' => '+1 555-882-9901',
                'email' => 'orders@cleancare-supplies.com',
                'address' => '880 Clean Ave, Dallas, TX',
                'tax_number' => 'TX-338291',
                'payment_terms' => 'Net 15',
                'status' => 'active',
            ]
        );

        $foodSupplier = Supplier::firstOrCreate(
            ['company_name' => 'Gourmet Fresh Food & Beverage Co.'],
            [
                'hotel_id' => $hotel?->id,
                'contact_person' => 'Robert Chen',
                'phone' => '+1 555-667-1122',
                'email' => 'deliveries@gourmetfresh.com',
                'address' => '12 Market St, Miami, FL',
                'tax_number' => 'FL-551928',
                'payment_terms' => 'COD',
                'status' => 'active',
            ]
        );

        // 2. Inventory Items (Section 16)
        $items = [
            [
                'hotel_id' => $hotel?->id,
                'supplier_id' => $linenSupplier->id,
                'category' => 'linens',
                'name' => 'Egyptian Cotton King Bedsheet',
                'sku' => 'LIN-001',
                'unit' => 'pcs',
                'purchase_price' => 38.00,
                'selling_price' => null,
                'opening_stock' => 50,
                'current_stock' => 45,
                'minimum_stock' => 15,
                'status' => 'active',
            ],
            [
                'hotel_id' => $hotel?->id,
                'supplier_id' => $linenSupplier->id,
                'category' => 'linens',
                'name' => 'Luxury Bath Towel 700 GSM',
                'sku' => 'LIN-002',
                'unit' => 'pcs',
                'purchase_price' => 14.50,
                'selling_price' => null,
                'opening_stock' => 60,
                'current_stock' => 8, // Triggers low stock alert
                'minimum_stock' => 20,
                'status' => 'active',
            ],
            [
                'hotel_id' => $hotel?->id,
                'supplier_id' => $toiletrySupplier->id,
                'category' => 'toiletries',
                'name' => 'Organic Bergamot Shampoo (50ml)',
                'sku' => 'TOI-001',
                'unit' => 'bottle',
                'purchase_price' => 1.25,
                'selling_price' => 4.00,
                'opening_stock' => 200,
                'current_stock' => 160,
                'minimum_stock' => 50,
                'status' => 'active',
            ],
            [
                'hotel_id' => $hotel?->id,
                'supplier_id' => $toiletrySupplier->id,
                'category' => 'toiletries',
                'name' => 'Botanical Hand Soap Bar',
                'sku' => 'TOI-002',
                'unit' => 'pcs',
                'purchase_price' => 0.85,
                'selling_price' => 3.00,
                'opening_stock' => 150,
                'current_stock' => 110,
                'minimum_stock' => 40,
                'status' => 'active',
            ],
            [
                'hotel_id' => $hotel?->id,
                'supplier_id' => $foodSupplier->id,
                'category' => 'food_beverage',
                'name' => 'Colombian Arabica Coffee Beans (1kg)',
                'sku' => 'FNB-001',
                'unit' => 'kg',
                'purchase_price' => 18.00,
                'selling_price' => null,
                'opening_stock' => 25,
                'current_stock' => 4, // Triggers low stock alert
                'minimum_stock' => 10,
                'status' => 'active',
            ],
            [
                'hotel_id' => $hotel?->id,
                'supplier_id' => $toiletrySupplier->id,
                'category' => 'cleaning',
                'name' => 'Disinfectant Multi-Surface Cleaner (5L)',
                'sku' => 'CLN-001',
                'unit' => 'bottle',
                'purchase_price' => 12.00,
                'selling_price' => null,
                'opening_stock' => 20,
                'current_stock' => 14,
                'minimum_stock' => 5,
                'status' => 'active',
            ],
        ];

        foreach ($items as $itemData) {
            InventoryItem::updateOrCreate(['sku' => $itemData['sku']], $itemData);
        }

        // 3. Purchase Order (Section 17)
        $towelItem = InventoryItem::where('sku', 'LIN-002')->first();
        if ($towelItem) {
            $purchase = Purchase::firstOrCreate(
                ['purchase_number' => 'PO-20260915-001'],
                [
                    'hotel_id' => $hotel?->id,
                    'supplier_id' => $linenSupplier->id,
                    'purchase_date' => now()->toDateString(),
                    'delivery_date' => now()->addDays(2)->toDateString(),
                    'subtotal' => 725.00,
                    'tax' => 58.00,
                    'total_amount' => 783.00,
                    'status' => 'ordered',
                    'payment_status' => 'unpaid',
                    'payment_method' => 'bank_transfer',
                    'created_by' => $admin?->id,
                    'notes' => 'Restocking urgent bath towels',
                ]
            );

            if ($purchase->items()->count() === 0) {
                $purchase->items()->create([
                    'inventory_item_id' => $towelItem->id,
                    'item_name' => $towelItem->name,
                    'quantity' => 50,
                    'unit_cost' => 14.50,
                    'total_cost' => 725.00,
                ]);
            }
        }

        // 4. Staff Management (Section 18)
        $staffMembers = [
            [
                'hotel_id' => $hotel?->id,
                'employee_id' => 'EMP-0001',
                'name' => 'Alice Morgan',
                'department' => 'reception',
                'position' => 'Front Desk Supervisor',
                'phone' => '+1 555-110-0011',
                'email' => 'alice.morgan@grandhorizon.com',
                'address' => '101 Bay View Ave, Miami, FL',
                'joining_date' => '2024-03-01',
                'salary' => 3400.00,
                'status' => 'active',
            ],
            [
                'hotel_id' => $hotel?->id,
                'employee_id' => 'EMP-0002',
                'name' => 'Carlos Mendez',
                'department' => 'restaurant',
                'position' => 'Executive Chef',
                'phone' => '+1 555-110-0022',
                'email' => 'carlos.mendez@grandhorizon.com',
                'address' => '224 Coral Way, Miami, FL',
                'joining_date' => '2023-08-15',
                'salary' => 4800.00,
                'status' => 'active',
            ],
            [
                'hotel_id' => $hotel?->id,
                'employee_id' => 'EMP-0003',
                'name' => 'Emily Chen',
                'department' => 'housekeeping',
                'position' => 'Head of Housekeeping',
                'phone' => '+1 555-110-0033',
                'email' => 'emily.chen@grandhorizon.com',
                'address' => '305 Palm St, Miami, FL',
                'joining_date' => '2024-01-10',
                'salary' => 3600.00,
                'status' => 'active',
            ],
            [
                'hotel_id' => $hotel?->id,
                'employee_id' => 'EMP-0004',
                'name' => 'Samantha Ray',
                'department' => 'accounts',
                'position' => 'Chief Accountant',
                'phone' => '+1 555-110-0044',
                'email' => 'samantha.ray@grandhorizon.com',
                'address' => '510 Ocean Drive, Miami, FL',
                'joining_date' => '2023-11-01',
                'salary' => 4200.00,
                'status' => 'active',
            ],
        ];

        foreach ($staffMembers as $staff) {
            Staff::updateOrCreate(['employee_id' => $staff['employee_id']], $staff);
        }

        // 5. Operational Expenses (Section 19)
        $expenses = [
            [
                'hotel_id' => $hotel?->id,
                'expense_number' => 'EXP-20260901-001',
                'category' => 'electricity',
                'amount' => 2450.00,
                'expense_date' => now()->startOfMonth()->toDateString(),
                'payment_method' => 'bank_transfer',
                'description' => 'Monthly Florida Power & Light grid utility bill',
                'created_by' => $admin?->id,
            ],
            [
                'hotel_id' => $hotel?->id,
                'expense_number' => 'EXP-20260903-002',
                'category' => 'water',
                'amount' => 480.00,
                'expense_date' => now()->startOfMonth()->addDays(2)->toDateString(),
                'payment_method' => 'bank_transfer',
                'description' => 'Municipal water and sewage utility bill',
                'created_by' => $admin?->id,
            ],
            [
                'hotel_id' => $hotel?->id,
                'expense_number' => 'EXP-20260905-003',
                'category' => 'internet',
                'amount' => 350.00,
                'expense_date' => now()->startOfMonth()->addDays(4)->toDateString(),
                'payment_method' => 'card',
                'description' => 'Fiber dedicated guest Wi-Fi connection',
                'created_by' => $admin?->id,
            ],
            [
                'hotel_id' => $hotel?->id,
                'expense_number' => 'EXP-20260908-004',
                'category' => 'maintenance',
                'amount' => 620.00,
                'expense_date' => now()->startOfMonth()->addDays(7)->toDateString(),
                'payment_method' => 'card',
                'description' => 'Quarterly central HVAC compressor servicing',
                'created_by' => $admin?->id,
            ],
        ];

        foreach ($expenses as $expense) {
            Expense::updateOrCreate(['expense_number' => $expense['expense_number']], $expense);
        }
    }
}
