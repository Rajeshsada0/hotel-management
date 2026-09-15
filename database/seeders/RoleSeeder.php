<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'slug' => 'super_admin',
                'name' => 'Super Admin',
                'description' => 'Full system access and configurations',
            ],
            [
                'slug' => 'hotel_admin',
                'name' => 'Hotel Admin',
                'description' => 'Hotel operations and administration',
            ],
            [
                'slug' => 'manager',
                'name' => 'Manager',
                'description' => 'Reports, revenue oversight and staff supervision',
            ],
            [
                'slug' => 'receptionist',
                'name' => 'Receptionist',
                'description' => 'Guest bookings, check-in, check-out and front desk operations',
            ],
            [
                'slug' => 'accountant',
                'name' => 'Accountant',
                'description' => 'Billing, invoicing, payments and financial reports',
            ],
            [
                'slug' => 'housekeeping',
                'name' => 'Housekeeping',
                'description' => 'Room cleaning, maintenance status and inspection',
            ],
            [
                'slug' => 'restaurant_staff',
                'name' => 'Restaurant Staff',
                'description' => 'POS orders, tables and kitchen coordination',
            ],
            [
                'slug' => 'storekeeper',
                'name' => 'Storekeeper',
                'description' => 'Inventory stocks, supplies and purchase orders',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['slug' => $role['slug']], $role);
        }
    }
}
