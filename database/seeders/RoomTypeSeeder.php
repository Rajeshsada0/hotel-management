<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

class RoomTypeSeeder extends Seeder
{
    public function run(): void
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $types = [
            [
                'name' => 'Standard Single',
                'slug' => 'standard-single',
                'description' => 'Cozy single room with high-speed Wi-Fi, workspace, and ensuite bathroom.',
                'max_adults' => 1,
                'max_children' => 0,
                'base_price' => 85.00,
                'extra_adult_price' => 0.00,
                'extra_child_price' => 0.00,
                'number_of_beds' => 1,
                'amenities' => ['Wi-Fi', 'Air Conditioning', 'Work Desk', 'Smart TV', 'Ensuite Shower'],
                'status' => 'active',
            ],
            [
                'name' => 'Standard Double',
                'slug' => 'standard-double',
                'description' => 'Comfortable double room with a queen bed, ideal for couples or business travelers.',
                'max_adults' => 2,
                'max_children' => 1,
                'base_price' => 120.00,
                'extra_adult_price' => 30.00,
                'extra_child_price' => 15.00,
                'number_of_beds' => 1,
                'amenities' => ['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Mini Fridge', 'Coffee Maker', 'Safe Box'],
                'status' => 'active',
            ],
            [
                'name' => 'Deluxe Twin',
                'slug' => 'deluxe-twin',
                'description' => 'Spacious room featuring two twin beds, balcony, and modern bathroom amenities.',
                'max_adults' => 2,
                'max_children' => 2,
                'base_price' => 150.00,
                'extra_adult_price' => 35.00,
                'extra_child_price' => 20.00,
                'number_of_beds' => 2,
                'amenities' => ['Wi-Fi', 'Balcony', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Hairdryer'],
                'status' => 'active',
            ],
            [
                'name' => 'Deluxe Ocean View',
                'slug' => 'deluxe-ocean-view',
                'description' => 'Premium room with stunning ocean vistas, plush king bed, and luxury bathtub.',
                'max_adults' => 2,
                'max_children' => 2,
                'base_price' => 220.00,
                'extra_adult_price' => 45.00,
                'extra_child_price' => 25.00,
                'number_of_beds' => 1,
                'amenities' => ['Ocean View', 'King Bed', 'Bathtub', 'Balcony', 'Espresso Machine', 'Bathrobes & Slippers'],
                'status' => 'active',
            ],
            [
                'name' => 'Executive Suite',
                'slug' => 'executive-suite',
                'description' => 'Luxury suite with separate living area, king bed, dining table, and ocean view.',
                'max_adults' => 3,
                'max_children' => 2,
                'base_price' => 340.00,
                'extra_adult_price' => 50.00,
                'extra_child_price' => 30.00,
                'number_of_beds' => 2,
                'amenities' => ['Living Room', 'Dining Area', 'Kitchenette', 'Jacuzzi', 'Ocean View', 'Butler Service'],
                'status' => 'active',
            ],
            [
                'name' => 'Presidential Suite',
                'slug' => 'presidential-suite',
                'description' => 'The ultimate luxury experience: top-floor panoramic views, private terrace, and whirlpool.',
                'max_adults' => 4,
                'max_children' => 3,
                'base_price' => 650.00,
                'extra_adult_price' => 75.00,
                'extra_child_price' => 40.00,
                'number_of_beds' => 2,
                'amenities' => ['Private Terrace', 'Panoramic View', 'Private Jacuzzi', 'Dining Room', 'VIP Lounge Access'],
                'status' => 'active',
            ],
        ];

        foreach ($types as $typeData) {
            RoomType::firstOrCreate(
                ['slug' => $typeData['slug']],
                array_merge($typeData, ['hotel_id' => $hotel?->id])
            );
        }
    }
}
