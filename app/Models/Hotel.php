<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hotel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'address',
        'city',
        'country',
        'phone',
        'email',
        'website',
        'tax_number',
        'logo',
        'banner_image',
        'banner_color',
        'currency',
        'currency_symbol',
        'check_in_time',
        'check_out_time',
        'status',
    ];

    /**
     * Get default active hotel.
     */
    public static function current(): ?self
    {
        return static::where('status', 'active')->first();
    }
}
