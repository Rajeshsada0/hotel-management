<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdminRole = Role::where('slug', 'super_admin')->first();
        $receptionistRole = Role::where('slug', 'receptionist')->first();
        $managerRole = Role::where('slug', 'manager')->first();

        // Super Admin
        User::firstOrCreate(
            ['email' => 'admin@hotel.com'],
            [
                'name' => 'Super Administrator',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'phone' => '+1 (555) 100-2000',
                'role_id' => $superAdminRole?->id,
                'role' => 'super_admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // Hotel Manager
        User::firstOrCreate(
            ['email' => 'manager@hotel.com'],
            [
                'name' => 'Michael Scott',
                'username' => 'manager',
                'password' => Hash::make('password'),
                'phone' => '+1 (555) 100-2002',
                'role_id' => $managerRole?->id,
                'role' => 'manager',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // Receptionist
        User::firstOrCreate(
            ['email' => 'reception@hotel.com'],
            [
                'name' => 'Sarah Jenkins',
                'username' => 'reception',
                'password' => Hash::make('password'),
                'phone' => '+1 (555) 100-2001',
                'role_id' => $receptionistRole?->id,
                'role' => 'receptionist',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
    }
}
