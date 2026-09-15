<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $single = RoomType::where('slug', 'standard-single')->first();
        $double = RoomType::where('slug', 'standard-double')->first();
        $twin = RoomType::where('slug', 'deluxe-twin')->first();
        $ocean = RoomType::where('slug', 'deluxe-ocean-view')->first();
        $exec = RoomType::where('slug', 'executive-suite')->first();
        $pres = RoomType::where('slug', 'presidential-suite')->first();

        $rooms = [
            // Floor 1
            ['room_number' => '101', 'room_type_id' => $single->id, 'floor' => '1', 'bed_type' => 'Single', 'capacity' => 1, 'status' => 'available'],
            ['room_number' => '102', 'room_type_id' => $single->id, 'floor' => '1', 'bed_type' => 'Single', 'capacity' => 1, 'status' => 'available'],
            ['room_number' => '103', 'room_type_id' => $double->id, 'floor' => '1', 'bed_type' => 'Queen', 'capacity' => 2, 'status' => 'available'],
            ['room_number' => '104', 'room_type_id' => $double->id, 'floor' => '1', 'bed_type' => 'Queen', 'capacity' => 2, 'status' => 'dirty'],
            ['room_number' => '105', 'room_type_id' => $twin->id, 'floor' => '1', 'bed_type' => 'Two Twin', 'capacity' => 2, 'status' => 'cleaning'],

            // Floor 2
            ['room_number' => '201', 'room_type_id' => $double->id, 'floor' => '2', 'bed_type' => 'Queen', 'capacity' => 2, 'status' => 'available'],
            ['room_number' => '202', 'room_type_id' => $double->id, 'floor' => '2', 'bed_type' => 'Queen', 'capacity' => 2, 'status' => 'available'],
            ['room_number' => '203', 'room_type_id' => $twin->id, 'floor' => '2', 'bed_type' => 'Two Twin', 'capacity' => 2, 'status' => 'occupied'],
            ['room_number' => '204', 'room_type_id' => $ocean->id, 'floor' => '2', 'bed_type' => 'King', 'capacity' => 2, 'status' => 'occupied'],
            ['room_number' => '205', 'room_type_id' => $ocean->id, 'floor' => '2', 'bed_type' => 'King', 'capacity' => 2, 'status' => 'available'],

            // Floor 3
            ['room_number' => '301', 'room_type_id' => $ocean->id, 'floor' => '3', 'bed_type' => 'King', 'capacity' => 2, 'status' => 'available'],
            ['room_number' => '302', 'room_type_id' => $ocean->id, 'floor' => '3', 'bed_type' => 'King', 'capacity' => 2, 'status' => 'reserved'],
            ['room_number' => '303', 'room_type_id' => $exec->id, 'floor' => '3', 'bed_type' => 'King + Sofa', 'capacity' => 3, 'status' => 'available'],
            ['room_number' => '304', 'room_type_id' => $exec->id, 'floor' => '3', 'bed_type' => 'King + Sofa', 'capacity' => 3, 'status' => 'maintenance'],

            // Floor 4
            ['room_number' => '401', 'room_type_id' => $exec->id, 'floor' => '4', 'bed_type' => 'King + Sofa', 'capacity' => 3, 'status' => 'available'],
            ['room_number' => '402', 'room_type_id' => $pres->id, 'floor' => '4', 'bed_type' => 'King + Queen', 'capacity' => 4, 'status' => 'available'],
        ];

        foreach ($rooms as $roomData) {
            Room::firstOrCreate(
                ['room_number' => $roomData['room_number']],
                array_merge($roomData, ['hotel_id' => $hotel?->id])
            );
        }
    }
}
