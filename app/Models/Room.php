<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id',
        'room_type_id',
        'room_number',
        'floor',
        'building',
        'price',
        'status',
        'bed_type',
        'capacity',
        'description',
        'amenities',
        'images',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'amenities' => 'array',
            'images' => 'array',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Active/current reservation for this room.
     */
    public function currentReservation()
    {
        return $this->hasOne(Reservation::class)
            ->where('booking_status', 'checked_in')
            ->latestOfMany();
    }

    /**
     * Effective price: room price override or room type base price.
     */
    protected function effectivePrice(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->price ?? $this->roomType?->base_price ?? 0.00,
        );
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function isOccupied(): bool
    {
        return $this->status === 'occupied';
    }

    public function markOccupied(): self
    {
        $this->update(['status' => 'occupied']);
        return $this;
    }

    public function markDirty(): self
    {
        $this->update(['status' => 'dirty']);
        return $this;
    }

    public function markCleaning(): self
    {
        $this->update(['status' => 'cleaning']);
        return $this;
    }

    public function markClean(): self
    {
        $this->update(['status' => 'available']); // Once clean, it is ready/available
        return $this;
    }

    public function markReserved(): self
    {
        $this->update(['status' => 'reserved']);
        return $this;
    }
}
