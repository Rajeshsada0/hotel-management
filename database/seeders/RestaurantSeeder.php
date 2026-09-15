<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\RestaurantCategory;
use App\Models\RestaurantProduct;
use App\Models\RestaurantTable;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        $hotel = Hotel::current() ?? Hotel::first();
        $restaurantRole = Role::where('slug', 'restaurant_staff')->first();

        // Staff
        $server = User::firstOrCreate(
            ['email' => 'marco.waiter@hotel.com'],
            [
                'name' => 'Marco Rossi',
                'username' => 'marco_server',
                'password' => Hash::make('password'),
                'phone' => '+1 (555) 400-0001',
                'role_id' => $restaurantRole?->id,
                'role' => 'restaurant_staff',
                'status' => 'active',
            ]
        );

        // Categories (Section 14)
        $categories = [
            ['name' => 'Food', 'slug' => 'food', 'description' => 'Main courses, entrees, and grilled specials'],
            ['name' => 'Drinks', 'slug' => 'drinks', 'description' => 'Hot and cold beverages, wines, cocktails, and beers'],
            ['name' => 'Dessert', 'slug' => 'dessert', 'description' => 'Pastries, cakes, and artisanal gelato'],
            ['name' => 'Breakfast', 'slug' => 'breakfast', 'description' => 'Morning items, eggs, and pancakes'],
        ];

        $catModels = [];
        foreach ($categories as $cat) {
            $catModels[$cat['slug']] = RestaurantCategory::firstOrCreate(
                ['slug' => $cat['slug']],
                array_merge($cat, ['hotel_id' => $hotel?->id])
            );
        }

        // Tables
        $tables = [
            ['table_number' => 'Table 1', 'capacity' => 4, 'location' => 'indoor', 'status' => 'available'],
            ['table_number' => 'Table 2', 'capacity' => 2, 'location' => 'indoor', 'status' => 'available'],
            ['table_number' => 'Table 3', 'capacity' => 6, 'location' => 'indoor', 'status' => 'occupied'],
            ['table_number' => 'Table 4', 'capacity' => 4, 'location' => 'indoor', 'status' => 'available'],
            ['table_number' => 'Table 5 (Terrace)', 'capacity' => 4, 'location' => 'terrace', 'status' => 'available'],
            ['table_number' => 'Table 6 (Terrace)', 'capacity' => 2, 'location' => 'terrace', 'status' => 'available'],
            ['table_number' => 'Bar Counter 1', 'capacity' => 2, 'location' => 'bar', 'status' => 'available'],
            ['table_number' => 'Bar Counter 2', 'capacity' => 2, 'location' => 'bar', 'status' => 'available'],
        ];

        foreach ($tables as $t) {
            RestaurantTable::firstOrCreate(
                ['table_number' => $t['table_number']],
                array_merge($t, ['hotel_id' => $hotel?->id])
            );
        }

        // Menu Products
        $products = [
            // Food
            ['category_id' => $catModels['food']->id, 'name' => 'Wagyu Beef Burger', 'code' => 'FD-BURGER', 'price' => 24.00, 'cost' => 8.00, 'description' => 'Brioche bun, aged cheddar, caramelized onion, truffle aioli'],
            ['category_id' => $catModels['food']->id, 'name' => 'Prime Filet Mignon 8oz', 'code' => 'FD-STEAK', 'price' => 42.00, 'cost' => 16.00, 'description' => 'Rosemary garlic butter, grilled asparagus, potato puree'],
            ['category_id' => $catModels['food']->id, 'name' => 'Grilled Atlantic Salmon', 'code' => 'FD-SALMON', 'price' => 32.00, 'cost' => 11.00, 'description' => 'Lemon dill beurre blanc, quinoa pilaf, charred greens'],
            ['category_id' => $catModels['food']->id, 'name' => 'Truffle Tagliatelle Pasta', 'code' => 'FD-PASTA', 'price' => 28.00, 'cost' => 9.00, 'description' => 'Wild forest mushrooms, shaved parmesan, black truffle oil'],
            ['category_id' => $catModels['food']->id, 'name' => 'Classic Margherita Pizza', 'code' => 'FD-PIZZA', 'price' => 18.00, 'cost' => 4.50, 'description' => 'San Marzano tomatoes, fresh buffalo mozzarella, sweet basil'],
            ['category_id' => $catModels['food']->id, 'name' => 'Caesar Salad with Chicken', 'code' => 'FD-CAESAR', 'price' => 16.00, 'cost' => 5.00, 'description' => 'Crisp romaine, herb croutons, parmesan crisp, house dressing'],

            // Drinks
            ['category_id' => $catModels['drinks']->id, 'name' => 'Napa Valley Cabernet Sauvignon (Glass)', 'code' => 'DRK-WINE', 'price' => 16.00, 'cost' => 5.00, 'description' => 'Rich blackberry, vanilla oak, velvety finish'],
            ['category_id' => $catModels['drinks']->id, 'name' => 'Signature Island Mojito', 'code' => 'DRK-MOJITO', 'price' => 14.00, 'cost' => 3.50, 'description' => 'Aged white rum, fresh mint leaves, lime juice, club soda'],
            ['category_id' => $catModels['drinks']->id, 'name' => 'Cold Brewed Craft IPA', 'code' => 'DRK-BEER', 'price' => 8.50, 'cost' => 2.50, 'description' => 'Citrus hop aroma, crisp refreshing finish'],
            ['category_id' => $catModels['drinks']->id, 'name' => 'Double Shot Espresso', 'code' => 'DRK-ESPRESSO', 'price' => 5.00, 'cost' => 0.80, 'description' => 'Artisanal Italian roasted espresso blend'],
            ['category_id' => $catModels['drinks']->id, 'name' => 'Fresh Squeezed Orange Juice', 'code' => 'DRK-JUICE', 'price' => 7.00, 'cost' => 1.50, 'description' => '100% pure fresh Valencia oranges'],

            // Dessert
            ['category_id' => $catModels['dessert']->id, 'name' => 'Molten Chocolate Lava Cake', 'code' => 'DS-LAVA', 'price' => 14.00, 'cost' => 3.50, 'description' => 'Warm dark chocolate center, Tahitian vanilla bean ice cream'],
            ['category_id' => $catModels['dessert']->id, 'name' => 'New York Berry Cheesecake', 'code' => 'DS-CAKE', 'price' => 12.00, 'cost' => 3.00, 'description' => 'Graham cracker crust, raspberry coulis'],

            // Breakfast
            ['category_id' => $catModels['breakfast']->id, 'name' => 'Eggs Benedict with Smoked Salmon', 'code' => 'BF-BENEDICT', 'price' => 20.00, 'cost' => 6.00, 'description' => 'Poached farm eggs, English muffin, hollandaise sauce'],
            ['category_id' => $catModels['breakfast']->id, 'name' => 'Buttermilk Blueberry Pancakes', 'code' => 'BF-PANCAKES', 'price' => 15.00, 'cost' => 3.00, 'description' => 'Pure Vermont maple syrup, whipped butter'],
        ];

        foreach ($products as $p) {
            RestaurantProduct::firstOrCreate(
                ['code' => $p['code']],
                array_merge($p, ['hotel_id' => $hotel?->id, 'status' => 'active', 'is_available' => true])
            );
        }
    }
}
