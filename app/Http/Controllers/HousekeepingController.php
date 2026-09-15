<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Models\HousekeepingTask;
use App\Models\LostAndFoundItem;
use App\Models\MaintenanceRequest;
use App\Models\Room;
use App\Models\User;
use App\Services\HousekeepingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HousekeepingController extends Controller
{
    public function __construct(
        protected HousekeepingService $housekeepingService
    ) {}

    /**
     * Display the Housekeeping Dashboard (Section 15).
     */
    public function index(): Response
    {
        $hotel = Hotel::current() ?? Hotel::first();

        // All rooms with active housekeeping task and housekeeper info
        $rooms = Room::with(['roomType'])
            ->orderBy('room_number')
            ->get();

        // Active cleaning tasks
        $tasks = HousekeepingTask::with(['room.roomType', 'housekeeper', 'createdByUser'])
            ->latest()
            ->get();

        // Maintenance requests
        $maintenanceRequests = MaintenanceRequest::with(['room', 'reportedByUser', 'technician'])
            ->latest()
            ->get();

        // Lost & Found items
        $lostAndFoundItems = LostAndFoundItem::with(['room', 'guest', 'foundByUser'])
            ->latest()
            ->get();

        // Housekeeper staff list
        $housekeepers = User::where(function ($q) {
            $q->where('role', 'housekeeping')
              ->orWhereHas('roleRelation', fn ($r) => $r->where('slug', 'housekeeping'));
        })->get();

        // Housekeeping summary statistics
        $stats = [
            'total_rooms' => $rooms->count(),
            'clean' => $rooms->where('status', 'available')->count(),
            'dirty' => $rooms->where('status', 'dirty')->count(),
            'cleaning' => $rooms->where('status', 'cleaning')->count(),
            'maintenance' => $rooms->where('status', 'maintenance')->count(),
        ];

        return Inertia::render('housekeeping/index', [
            'hotel' => $hotel,
            'rooms' => $rooms,
            'tasks' => $tasks,
            'maintenanceRequests' => $maintenanceRequests,
            'lostAndFoundItems' => $lostAndFoundItems,
            'housekeepers' => $housekeepers,
            'stats' => $stats,
        ]);
    }

    /**
     * Assign cleaning task to housekeeper.
     */
    public function assign(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'room_id' => ['required', 'exists:rooms,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'priority' => ['required', 'in:normal,high,urgent'],
            'task_type' => ['required', 'in:daily_cleaning,checkout_cleaning,deep_cleaning,touchup'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->housekeepingService->assignCleaning(
            roomId: (int) $validated['room_id'],
            housekeeperId: !empty($validated['assigned_to']) ? (int) $validated['assigned_to'] : null,
            priority: $validated['priority'],
            taskType: $validated['task_type'],
            notes: $validated['notes'] ?? null,
            userId: $request->user()->id
        );

        return back()->with('success', 'Cleaning task assigned successfully.');
    }

    /**
     * Update task status (Dirty -> Cleaning -> Clean -> Available).
     */
    public function updateStatus(Request $request, HousekeepingTask $task): RedirectResponse
    {
        $action = $request->input('action'); // 'start' or 'complete'

        if ($action === 'start') {
            $this->housekeepingService->startCleaning($task);
            return back()->with('success', "Cleaning started for Room {$task->room?->room_number}.");
        } elseif ($action === 'complete') {
            $this->housekeepingService->completeCleaning($task);
            return back()->with('success', "Room {$task->room?->room_number} marked clean and available.");
        }

        return back()->with('error', 'Invalid action specified.');
    }

    /**
     * Report maintenance issue.
     */
    public function storeMaintenance(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'room_id' => ['nullable', 'exists:rooms,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority' => ['required', 'in:low,medium,high,emergency'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->housekeepingService->reportMaintenance($validated, $request->user()->id);

        return back()->with('success', 'Maintenance issue reported and room placed on maintenance status.');
    }

    /**
     * Resolve maintenance issue.
     */
    public function resolveMaintenance(Request $request, MaintenanceRequest $maintenance): RedirectResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string'],
        ]);

        $this->housekeepingService->resolveMaintenance($maintenance, $validated['notes'] ?? null);

        return back()->with('success', 'Maintenance resolved and room returned to service.');
    }

    /**
     * Log Lost & Found item.
     */
    public function storeLostAndFound(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'room_id' => ['nullable', 'exists:rooms,id'],
            'guest_id' => ['nullable', 'exists:guests,id'],
            'item_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string'],
            'found_location' => ['required', 'string', 'max:255'],
            'found_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->housekeepingService->logLostAndFound($validated, $request->user()->id);

        return back()->with('success', 'Lost & found item logged successfully.');
    }

    /**
     * Mark Lost & Found item claimed.
     */
    public function updateLostAndFound(Request $request, LostAndFoundItem $item): RedirectResponse
    {
        $validated = $request->validate([
            'claimed_by' => ['required', 'string', 'max:255'],
            'claimed_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $item->update([
            'status' => 'claimed',
            'claimed_by' => $validated['claimed_by'],
            'claimed_date' => $validated['claimed_date'],
            'notes' => $validated['notes'] ?? $item->notes,
        ]);

        return back()->with('success', 'Item marked as claimed.');
    }
}
