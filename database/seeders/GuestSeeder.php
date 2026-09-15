<?php

namespace Database\Seeders;

use App\Models\Guest;
use Illuminate\Database\Seeder;

class GuestSeeder extends Seeder
{
    public function run(): void
    {
        $guests = [
            [
                'first_name' => 'Alexander',
                'last_name' => 'Wright',
                'gender' => 'male',
                'date_of_birth' => '1988-04-12',
                'nationality' => 'United States',
                'phone' => '+1 (305) 555-0192',
                'email' => 'alex.wright@example.com',
                'address' => '742 Evergreen Terrace, Springfield',
                'id_type' => 'Passport',
                'id_number' => 'US9823411',
                'passport_number' => 'US9823411',
                'notes' => 'Prefers high floor room away from elevator.',
            ],
            [
                'first_name' => 'Elena',
                'last_name' => 'Rostova',
                'gender' => 'female',
                'date_of_birth' => '1992-09-23',
                'nationality' => 'Canada',
                'phone' => '+1 (416) 555-0144',
                'email' => 'elena.rostova@example.com',
                'address' => '120 Bay Street, Toronto, ON',
                'id_type' => 'Passport',
                'id_number' => 'CA8472911',
                'passport_number' => 'CA8472911',
                'notes' => 'VIP corporate traveler.',
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Chen',
                'gender' => 'male',
                'date_of_birth' => '1985-11-05',
                'nationality' => 'United Kingdom',
                'phone' => '+44 20 7946 0991',
                'email' => 'david.chen@example.co.uk',
                'address' => '45 Baker St, London',
                'id_type' => 'Driving License',
                'id_number' => 'UK-CHEND788',
                'notes' => 'Requires feather-free pillows.',
            ],
            [
                'first_name' => 'Sophia',
                'last_name' => 'Martinez',
                'gender' => 'female',
                'date_of_birth' => '1995-02-18',
                'nationality' => 'Spain',
                'phone' => '+34 91 123 4567',
                'email' => 'sophia.martinez@example.es',
                'address' => 'Gran Via 28, Madrid',
                'id_type' => 'National ID',
                'id_number' => 'ES52930412B',
                'notes' => 'Anniversary celebration stay.',
            ],
        ];

        foreach ($guests as $guest) {
            Guest::firstOrCreate(['phone' => $guest['phone']], $guest);
        }
    }
}
