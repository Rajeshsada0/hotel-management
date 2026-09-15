<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('restaurant_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->nullable()->constrained('hotels')->cascadeOnDelete();
            $table->string('name'); // Food, Drinks, Dessert, Breakfast, Lunch, Dinner
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('restaurant_tables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->nullable()->constrained('hotels')->cascadeOnDelete();
            $table->string('table_number'); // e.g. "T-01", "Table 5", "Bar-02"
            $table->unsignedSmallInteger('capacity')->default(4);
            $table->string('location')->default('indoor'); // indoor, terrace, bar, patio
            $table->enum('status', ['available', 'occupied', 'reserved'])->default('available')->index();
            $table->timestamps();
        });

        Schema::create('restaurant_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->nullable()->constrained('hotels')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('restaurant_categories')->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('cost', 10, 2)->default(0.00);
            $table->text('description')->nullable();
            $table->boolean('is_available')->default(true);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('restaurant_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('hotel_id')->nullable()->constrained('hotels')->cascadeOnDelete();
            $table->foreignId('table_id')->nullable()->constrained('restaurant_tables')->nullOnDelete();
            $table->foreignId('server_id')->nullable()->constrained('users')->nullOnDelete();

            // Charge to Room links (Section 14)
            $table->foreignId('reservation_id')->nullable()->constrained('reservations')->nullOnDelete();
            $table->foreignId('room_id')->nullable()->constrained('rooms')->nullOnDelete();
            $table->foreignId('guest_id')->nullable()->constrained('guests')->nullOnDelete();
            $table->foreignId('invoice_item_id')->nullable()->constrained('invoice_items')->nullOnDelete();

            $table->decimal('subtotal', 10, 2)->default(0.00);
            $table->decimal('discount', 10, 2)->default(0.00);
            $table->decimal('tax', 10, 2)->default(0.00);
            $table->decimal('total_amount', 10, 2)->default(0.00);

            $table->enum('payment_method', ['cash', 'card', 'charge_to_room', 'unpaid'])->default('unpaid');
            $table->enum('payment_status', ['unpaid', 'paid'])->default('unpaid')->index();
            $table->enum('order_status', ['pending', 'in_kitchen', 'served', 'completed', 'cancelled'])->default('completed')->index();

            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('restaurant_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('restaurant_orders')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('restaurant_products')->nullOnDelete();
            $table->string('product_name');
            $table->decimal('quantity', 10, 2)->default(1.00);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurant_order_items');
        Schema::dropIfExists('restaurant_orders');
        Schema::dropIfExists('restaurant_products');
        Schema::dropIfExists('restaurant_tables');
        Schema::dropIfExists('restaurant_categories');
    }
};
