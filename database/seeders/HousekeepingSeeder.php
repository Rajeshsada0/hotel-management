<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\HousekeepingTask;
use App\Models\MaintenanceRequest;
use App\Models\Role;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class HousekeepingSeeder extends Seeder
{
    public function run(): void
    {
        $hotel = Hotel::current() ?? Hotel::first();
        $housekeeperRole = Role::where('slug', 'housekeeping')->first();

        // Seed 3 housekeepers (matching Section 15 example: John, Mary, David)
        $john = User::firstOrCreate(
            ['email' => 'john.cleaner@hotel.com'],
            [
                'name' => 'John Cleaner',
                'username' => 'john_cleaner',
                'password' => Hash::make('password'),
                'phone' => '+1 (555) 300-0001',
                'role_id' => $housekeeperRole?->id,
                'role' => 'housekeeping',
                'status' => 'active',
            ]
        );

        $mary = User::firstOrCreate(
            ['email' => 'mary.cleaner@hotel.com'],
            [
                'name' => 'Mary Cleaner',
                'username' => 'mary_cleaner',
                'password' => Hash::make('password'),
                'phone' => '+1 (555) 300-0002',
                'role_id' => $housekeeperRole?->id,
                'role' => 'housekeeping',
                'status' => 'active',
            ]
        );

        $david = User::firstOrCreate(
            ['email' => 'david.cleaner@hotel.com'],
            [
                'name' => 'David Cleaner',
                'username' => 'david_cleaner',
                'password' => Hash::make('password'),
                'phone' => '+1 (555) 300-0003',
                'role_id' => $housekeeperRole?->id,
                'role' => 'housekeeping',
                'status' => 'active',
            ]
        );

        // Seed sample tasks for dirty/cleaning rooms (Rooms 104, 105)
        $room104 = Room::where('room_number', '104')->first();
        $room105 = Room::where('room_number', '105')->first();
        $room304 = Room::where('room_number', '304')->first();

        if ($room104) {
            HousekeepingTask::firstOrCreate(
                ['room_id' => $room104->id, 'status' => 'dirty'],
                [
                    'hotel_id' => $hotel?->id,
                    'assigned_to' => $mary->id,
                    'priority' => 'high',
                    'task_type' => 'checkout_cleaning',
                    'notes' => 'Full turnover cleaning requested.',
                ]
            );
        }

        if ($room105) {
            HousekeepingTask::firstOrCreate(
                ['room_id' => $room105->id, 'status' => 'cleaning'],
                [
                    'hotel_id' => $hotel?->id,
                    'assigned_to' => $david->id,
                    'priority' => 'urgent',
                    'task_type' => 'daily_cleaning',
                    'started_at' => now()->subMinutes(20),
                    'notes' => 'Changing bed sheets and replenishing toiletries.',
                ]
            );
        }

        if ($room304) {
            MaintenanceRequest::firstOrCreate(
                ['room_id' => $room304->id, 'title' => 'Air Conditioning Thermostat Malfunction'],
                [
                    'hotel_id' => $hotel?->id,
                    'description' => 'Thermostat display blinking and cooling intermittent. Technician required.',
                    'priority' => 'high',
                    'status' => 'reported',
                    'reported_by' => $john->id,
                ]
            );
        }
    }
}
