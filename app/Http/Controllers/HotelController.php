<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HotelController extends Controller
{
    /**
     * Show the hotel settings page.
     */
    public function edit(): Response
    {
        $hotel = Hotel::current() ?? Hotel::first() ?? new Hotel([
            'name' => 'Grand Horizon Hotel',
            'code' => 'GH-01',
            'currency' => 'USD',
            'currency_symbol' => '$',
            'check_in_time' => '14:00',
            'check_out_time' => '11:00',
            'status' => 'active',
        ]);

        return Inertia::render('settings/hotel', [
            'hotel' => $hotel,
        ]);
    }

    /**
     * Update hotel profile and operational configuration.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'address' => ['sometimes', 'required', 'string', 'max:255'],
            'city' => ['sometimes', 'required', 'string', 'max:100'],
            'country' => ['sometimes', 'required', 'string', 'max:100'],
            'phone' => ['sometimes', 'required', 'string', 'max:50'],
            'email' => ['sometimes', 'required', 'email', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'tax_number' => ['nullable', 'string', 'max:50'],
            'currency' => ['sometimes', 'required', 'string', 'max:10'],
            'currency_symbol' => ['sometimes', 'required', 'string', 'max:10'],
            'check_in_time' => ['sometimes', 'required', 'string'],
            'check_out_time' => ['sometimes', 'required', 'string'],
            'status' => ['sometimes', 'required', 'in:active,inactive'],
            'banner_image' => ['nullable', 'string', 'max:1000'],
            'banner_color' => ['nullable', 'string', 'max:255'],
            'banner_file' => ['nullable', 'image', 'max:5120'], // 5MB max
        ]);

        if ($request->hasFile('banner_file')) {
            $path = $request->file('banner_file')->store('banners', 'public');
            $validated['banner_image'] = '/storage/' . $path;
        }
        unset($validated['banner_file']);

        $hotel = Hotel::current() ?? Hotel::first();

        if ($hotel) {
            $hotel->update($validated);
        } else {
            Hotel::create($validated);
        }

        return back()->with('success', 'Hotel profile and settings updated successfully.');
    }
}
