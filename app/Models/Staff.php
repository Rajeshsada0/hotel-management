<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staff';

    protected $fillable = [
        'hotel_id',
        'user_id',
        'employee_id',
        'name',
        'department',
        'position',
        'phone',
        'email',
        'address',
        'joining_date',
        'salary',
        'status',
    ];

    protected $casts = [
        'salary' => 'decimal:2',
        'joining_date' => 'date',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public static function generateEmployeeId(): string
    {
        return 'EMP-' . str_pad((string)(static::count() + 1), 4, '0', STR_PAD_LEFT);
    }
}
