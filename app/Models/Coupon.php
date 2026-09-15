<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id',
        'code',
        'name',
        'description',
        'discount_type',
        'value',
        'min_spend',
        'max_discount',
        'valid_from',
        'valid_until',
        'usage_limit',
        'used_count',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_spend' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'valid_from' => 'date',
        'valid_until' => 'date',
        'usage_limit' => 'integer',
        'used_count' => 'integer',
        'is_active' => 'boolean',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeValidForDate(Builder $query, ?string $date = null): Builder
    {
        $targetDate = $date ?? now()->toDateString();

        return $query->where(function ($q) use ($targetDate) {
            $q->whereNull('valid_from')->orWhereDate('valid_from', '<=', $targetDate);
        })->where(function ($q) use ($targetDate) {
            $q->whereNull('valid_until')->orWhereDate('valid_until', '>=', $targetDate);
        });
    }

    public function isValidForAmount(float $subtotal): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }

        $today = now()->toDateString();
        if ($this->valid_from && $this->valid_from->toDateString() > $today) {
            return false;
        }
        if ($this->valid_until && $this->valid_until->toDateString() < $today) {
            return false;
        }

        if ($this->min_spend > 0 && $subtotal < (float) $this->min_spend) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(float $subtotal): float
    {
        if (!$this->isValidForAmount($subtotal)) {
            return 0.00;
        }

        if ($this->discount_type === 'percentage') {
            $discount = round($subtotal * ((float) $this->value / 100), 2);
            if ($this->max_discount !== null && $this->max_discount > 0) {
                $discount = min($discount, (float) $this->max_discount);
            }
            return min($discount, $subtotal);
        }

        // Fixed amount discount
        return min((float) $this->value, $subtotal);
    }
}
