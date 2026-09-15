<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RestaurantTable extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id',
        'table_number',
        'capacity',
        'location',
        'status',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(RestaurantOrder::class, 'table_id');
    }

    public function activeOrder()
    {
        return $this->hasOne(RestaurantOrder::class, 'table_id')
            ->where('payment_status', 'unpaid')
            ->latestOfMany();
    }
}
