<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $services = [
            [
                'category' => 'laundry',
                'name' => 'Laundry & Pressing Service',
                'code' => 'SRV-LAUNDRY',
                'price' => 25.00,
                'description' => 'Same-day professional wash, press, and folding service.',
                'status' => 'active',
            ],
            [
                'category' => 'airport_pickup',
                'name' => 'Airport Private Transfer',
                'code' => 'SRV-AIRPORT',
                'price' => 65.00,
                'description' => 'Direct private executive sedan transfer to/from airport.',
                'status' => 'active',
            ],
            [
                'category' => 'spa',
                'name' => 'Relaxing Swedish Body Massage (60 min)',
                'code' => 'SRV-SPA-60',
                'price' => 120.00,
                'description' => 'Full-body aromatic massage with organic essential oils.',
                'status' => 'active',
            ],
            [
                'category' => 'breakfast',
                'name' => 'Grand International Breakfast Buffet',
                'code' => 'SRV-BREAKFAST',
                'price' => 22.00,
                'description' => 'Full hot buffet with pastries, live egg station, fresh juices and coffee.',
                'status' => 'active',
            ],
            [
                'category' => 'extra_bed',
                'name' => 'Rollaway Extra Bed & Linens',
                'code' => 'SRV-EXTRABED',
                'price' => 35.00,
                'description' => 'Single rollaway bed setup with premium linen and pillows.',
                'status' => 'active',
            ],
            [
                'category' => 'minibar',
                'name' => 'Premium Mini Bar Restock Package',
                'code' => 'SRV-MINIBAR',
                'price' => 40.00,
                'description' => 'Selection of fine wines, craft beers, sodas, and artisan snacks.',
                'status' => 'active',
            ],
            [
                'category' => 'parking',
                'name' => '24-Hour Valet Secure Parking',
                'code' => 'SRV-PARKING',
                'price' => 30.00,
                'description' => 'Underground monitored valet parking with unlimited in/out privileges.',
                'status' => 'active',
            ],
        ];

        foreach ($services as $srv) {
            Service::firstOrCreate(
                ['code' => $srv['code']],
                array_merge($srv, ['hotel_id' => $hotel?->id])
            );
        }
    }
}
