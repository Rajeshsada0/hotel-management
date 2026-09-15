<?php

namespace Database\Seeders;

use App\Models\Hotel;
use Illuminate\Database\Seeder;

class HotelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Hotel::firstOrCreate(
            ['code' => 'GH-01'],
            [
                'name' => 'Grand Horizon Hotel & Resort',
                'address' => '100 Ocean Boulevard',
                'city' => 'Miami',
                'country' => 'United States',
                'phone' => '+1 (555) 234-5678',
                'email' => 'contact@grandhorizonhotel.com',
                'website' => 'https://grandhorizonhotel.com',
                'tax_number' => 'US-84920412',
                'currency' => 'USD',
                'currency_symbol' => '$',
                'check_in_time' => '14:00:00',
                'check_out_time' => '11:00:00',
                'status' => 'active',
            ]
        );
    }
}
