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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->nullable()->constrained('hotels')->cascadeOnDelete();
            $table->foreignId('room_type_id')->constrained('room_types')->cascadeOnDelete();
            $table->string('room_number')->unique();
            $table->string('floor')->default('1');
            $table->string('building')->nullable();
            $table->decimal('price', 10, 2)->nullable(); // Optional room-specific price override
            $table->enum('status', [
                'available',
                'reserved',
                'occupied',
                'cleaning',
                'dirty',
                'maintenance',
                'out_of_service',
            ])->default('available')->index();
            $table->string('bed_type')->default('King');
            $table->unsignedSmallInteger('capacity')->default(2);
            $table->text('description')->nullable();
            $table->json('amenities')->nullable();
            $table->json('images')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
