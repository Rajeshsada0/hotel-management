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
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'tax_number' => ['nullable', 'string', 'max:50'],
            'currency' => ['required', 'string', 'max:10'],
            'currency_symbol' => ['required', 'string', 'max:10'],
            'check_in_time' => ['required', 'string'],
            'check_out_time' => ['required', 'string'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $hotel = Hotel::current() ?? Hotel::first();

        if ($hotel) {
            $hotel->update($validated);
        } else {
            Hotel::create($validated);
        }

        return back()->with('success', 'Hotel profile and settings updated successfully.');
    }
}
