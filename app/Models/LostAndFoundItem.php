<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LostAndFoundItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id',
        'room_id',
        'guest_id',
        'item_name',
        'category',
        'found_location',
        'found_date',
        'found_by',
        'status',
        'claimed_by',
        'claimed_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'found_date' => 'date',
            'claimed_date' => 'date',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function foundByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'found_by');
    }
}
