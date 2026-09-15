<?php

namespace App\Services;

use App\Models\Coupon;
use Illuminate\Validation\ValidationException;

class CouponService
{
    /**
     * Validate a coupon code against a purchase subtotal.
     *
     * @return array{valid: bool, coupon: Coupon|null, discount_amount: float, message: string}
     */
    public function validateCoupon(string $code, float $subtotal, ?int $hotelId = null): array
    {
        $code = strtoupper(trim($code));

        $query = Coupon::query()->where('code', $code);
        if ($hotelId) {
            $query->where(function ($q) use ($hotelId) {
                $q->whereNull('hotel_id')->orWhere('hotel_id', $hotelId);
            });
        }

        /** @var Coupon|null $coupon */
        $coupon = $query->first();

        if (!$coupon) {
            return [
                'valid' => false,
                'coupon' => null,
                'discount_amount' => 0.00,
                'message' => "Coupon code '{$code}' does not exist.",
            ];
        }

        if (!$coupon->is_active) {
            return [
                'valid' => false,
                'coupon' => $coupon,
                'discount_amount' => 0.00,
                'message' => 'This coupon has been deactivated.',
            ];
        }

        $today = now()->toDateString();
        if ($coupon->valid_from && $coupon->valid_from->toDateString() > $today) {
            return [
                'valid' => false,
                'coupon' => $coupon,
                'discount_amount' => 0.00,
                'message' => "Coupon will be active starting {$coupon->valid_from->format('M d, Y')}.",
            ];
        }

        if ($coupon->valid_until && $coupon->valid_until->toDateString() < $today) {
            return [
                'valid' => false,
                'coupon' => $coupon,
                'discount_amount' => 0.00,
                'message' => 'This coupon has expired.',
            ];
        }

        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            return [
                'valid' => false,
                'coupon' => $coupon,
                'discount_amount' => 0.00,
                'message' => 'Coupon usage limit has been reached.',
            ];
        }

        if ($coupon->min_spend > 0 && $subtotal < (float) $coupon->min_spend) {
            return [
                'valid' => false,
                'coupon' => $coupon,
                'discount_amount' => 0.00,
                'message' => sprintf('Minimum spend of $%.2f required (Current: $%.2f).', $coupon->min_spend, $subtotal),
            ];
        }

        $discount = $coupon->calculateDiscount($subtotal);

        return [
            'valid' => true,
            'coupon' => $coupon,
            'discount_amount' => $discount,
            'message' => sprintf('Coupon applied! Saved $%.2f (%s)', $discount, $coupon->name),
        ];
    }

    /**
     * Record coupon usage after a confirmed reservation.
     */
    public function recordUsage(Coupon $coupon): void
    {
        $coupon->increment('used_count');
    }
}
