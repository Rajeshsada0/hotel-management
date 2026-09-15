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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->nullable()->constrained('hotels')->cascadeOnDelete();
            $table->string('category')->default('other'); // laundry, airport_pickup, spa, room_service, minibar, parking, extra_bed, breakfast, conference_room, other
            $table->string('name');
            $table->string('code')->nullable()->unique();
            $table->decimal('price', 10, 2);
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('service_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('hotel_id')->nullable()->constrained('hotels')->cascadeOnDelete();
            $table->foreignId('reservation_id')->constrained('reservations')->cascadeOnDelete();
            $table->foreignId('guest_id')->constrained('guests')->cascadeOnDelete();
            $table->foreignId('room_id')->nullable()->constrained('rooms')->nullOnDelete();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();

            $table->decimal('quantity', 10, 2)->default(1.00);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);

            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('completed');
            $table->boolean('charged_to_room')->default(true);
            $table->foreignId('invoice_item_id')->nullable()->constrained('invoice_items')->nullOnDelete();

            $table->dateTime('ordered_at');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_orders');
        Schema::dropIfExists('services');
    }
};
