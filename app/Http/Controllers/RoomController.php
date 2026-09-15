<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    /**
     * Display listing of rooms and room types.
     */
    public function index(Request $request): Response
    {
        $status = $request->input('status');
        $floor = $request->input('floor');
        $roomTypeId = $request->input('room_type_id');

        $rooms = Room::with(['roomType'])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($floor, fn ($q) => $q->where('floor', $floor))
            ->when($roomTypeId, fn ($q) => $q->where('room_type_id', $roomTypeId))
            ->orderBy('room_number')
            ->get();

        $roomTypes = RoomType::withCount('rooms')
            ->orderBy('name')
            ->get();

        $floors = Room::select('floor')->distinct()->orderBy('floor')->pluck('floor');

        return Inertia::render('rooms/index', [
            'rooms' => $rooms,
            'roomTypes' => $roomTypes,
            'floors' => $floors,
            'filters' => [
                'status' => $status,
                'floor' => $floor,
                'room_type_id' => $roomTypeId,
            ],
        ]);
    }

    /**
     * Store a new room.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'room_number' => ['required', 'string', 'max:20', 'unique:rooms,room_number'],
            'room_type_id' => ['required', 'exists:room_types,id'],
            'floor' => ['required', 'string', 'max:10'],
            'building' => ['nullable', 'string', 'max:50'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'bed_type' => ['required', 'string', 'max:50'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:available,reserved,occupied,cleaning,dirty,maintenance,out_of_service'],
            'description' => ['nullable', 'string'],
        ]);

        $hotel = Hotel::current() ?? Hotel::first();
        Room::create(array_merge($validated, ['hotel_id' => $hotel?->id]));

        return back()->with('success', "Room {$validated['room_number']} created successfully.");
    }

    /**
     * Update room details.
     */
    public function update(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'room_number' => ['required', 'string', 'max:20', 'unique:rooms,room_number,' . $room->id],
            'room_type_id' => ['required', 'exists:room_types,id'],
            'floor' => ['required', 'string', 'max:10'],
            'building' => ['nullable', 'string', 'max:50'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'bed_type' => ['required', 'string', 'max:50'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:available,reserved,occupied,cleaning,dirty,maintenance,out_of_service'],
            'description' => ['nullable', 'string'],
        ]);

        $room->update($validated);

        return back()->with('success', "Room {$room->room_number} updated successfully.");
    }

    /**
     * Quick update room status (e.g. from housekeeping board or front desk).
     */
    public function updateStatus(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:available,reserved,occupied,cleaning,dirty,maintenance,out_of_service'],
        ]);

        $room->update(['status' => $validated['status']]);

        return back()->with('success', "Room {$room->room_number} status changed to {$validated['status']}.");
    }

    /**
     * Store a new room type.
     */
    public function storeType(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'max_adults' => ['required', 'integer', 'min:1'],
            'max_children' => ['required', 'integer', 'min:0'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'extra_adult_price' => ['nullable', 'numeric', 'min:0'],
            'extra_child_price' => ['nullable', 'numeric', 'min:0'],
            'number_of_beds' => ['required', 'integer', 'min:1'],
            'amenities' => ['nullable', 'array'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $slug = Str::slug($validated['name']);
        $count = RoomType::where('slug', 'like', "{$slug}%")->count();
        if ($count > 0) {
            $slug .= '-' . ($count + 1);
        }

        $hotel = Hotel::current() ?? Hotel::first();

        RoomType::create(array_merge($validated, [
            'slug' => $slug,
            'hotel_id' => $hotel?->id,
        ]));

        return back()->with('success', "Room type '{$validated['name']}' created successfully.");
    }

    /**
     * Update a room type.
     */
    public function updateType(Request $request, RoomType $roomType): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'max_adults' => ['required', 'integer', 'min:1'],
            'max_children' => ['required', 'integer', 'min:0'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'extra_adult_price' => ['nullable', 'numeric', 'min:0'],
            'extra_child_price' => ['nullable', 'numeric', 'min:0'],
            'number_of_beds' => ['required', 'integer', 'min:1'],
            'amenities' => ['nullable', 'array'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $roomType->update($validated);

        return back()->with('success', "Room type '{$roomType->name}' updated successfully.");
    }
}
