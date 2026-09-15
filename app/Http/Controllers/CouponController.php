<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Hotel;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function __construct(
        protected CouponService $couponService
    ) {}

    /**
     * Display a listing of promotional coupons.
     */
    public function index(Request $request): Response
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $coupons = Coupon::query()
            ->when($hotel, fn ($q) => $q->where(fn ($sub) => $sub->whereNull('hotel_id')->orWhere('hotel_id', $hotel->id)))
            ->when($request->search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('coupons/index', [
            'coupons' => $coupons,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created coupon in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'discount_type' => ['required', 'in:percentage,fixed'],
            'value' => ['required', 'numeric', 'min:0.01'],
            'min_spend' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
        ]);

        $validated['code'] = strtoupper(trim($validated['code']));
        $validated['hotel_id'] = $hotel?->id;
        $validated['min_spend'] = $validated['min_spend'] ?? 0.00;
        $validated['is_active'] = true;

        Coupon::create($validated);

        return back()->with('success', "Coupon '{$validated['code']}' created successfully.");
    }

    /**
     * Toggle coupon active/inactive state.
     */
    public function toggle(Coupon $coupon): RedirectResponse
    {
        $coupon->update(['is_active' => !$coupon->is_active]);

        $status = $coupon->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Coupon '{$coupon->code}' {$status}.");
    }

    /**
     * Validate a coupon code and calculate preview discount.
     */
    public function validateCode(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $hotel = Hotel::current() ?? Hotel::first();

        $result = $this->couponService->validateCoupon(
            code: $request->code,
            subtotal: (float) $request->subtotal,
            hotelId: $hotel?->id
        );

        return response()->json([
            'valid' => $result['valid'],
            'message' => $result['message'],
            'discount_amount' => $result['discount_amount'],
            'coupon' => $result['coupon'] ? [
                'id' => $result['coupon']->id,
                'code' => $result['coupon']->code,
                'name' => $result['coupon']->name,
                'discount_type' => $result['coupon']->discount_type,
                'value' => $result['coupon']->value,
            ] : null,
        ]);
    }
}
