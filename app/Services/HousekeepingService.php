<?php

namespace App\Services;

use App\Models\Hotel;
use App\Models\HousekeepingTask;
use App\Models\LostAndFoundItem;
use App\Models\MaintenanceRequest;
use App\Models\Room;
use Illuminate\Support\Facades\DB;

class HousekeepingService
{
    /**
     * Assign a cleaning task to a housekeeper.
     */
    public function assignCleaning(
        int $roomId,
        ?int $housekeeperId = null,
        string $priority = 'normal',
        string $taskType = 'daily_cleaning',
        ?string $notes = null,
        ?int $userId = null
    ): HousekeepingTask {
        return DB::transaction(function () use ($roomId, $housekeeperId, $priority, $taskType, $notes, $userId) {
            $room = Room::findOrFail($roomId);
            $hotel = Hotel::current() ?? Hotel::first();

            // Find existing incomplete task or create new one
            $task = HousekeepingTask::where('room_id', $roomId)
                ->whereIn('status', ['dirty', 'cleaning'])
                ->latest()
                ->first();

            if ($task) {
                $task->update([
                    'assigned_to' => $housekeeperId ?? $task->assigned_to,
                    'priority' => $priority,
                    'task_type' => $taskType,
                    'notes' => $notes ?? $task->notes,
                ]);
            } else {
                $task = HousekeepingTask::create([
                    'hotel_id' => $hotel?->id,
                    'room_id' => $roomId,
                    'assigned_to' => $housekeeperId,
                    'status' => 'dirty',
                    'priority' => $priority,
                    'task_type' => $taskType,
                    'notes' => $notes,
                    'created_by' => $userId,
                ]);
            }

            if ($room->status !== 'cleaning') {
                $room->update(['status' => 'dirty']);
            }

            return $task->fresh(['room', 'housekeeper']);
        });
    }

    /**
     * Start cleaning process: Dirty -> Cleaning.
     */
    public function startCleaning(HousekeepingTask $task): HousekeepingTask
    {
        return DB::transaction(function () use ($task) {
            $task->startCleaning();
            return $task->fresh(['room', 'housekeeper']);
        });
    }

    /**
     * Finish cleaning: Cleaning -> Clean -> Available.
     */
    public function completeCleaning(HousekeepingTask $task): HousekeepingTask
    {
        return DB::transaction(function () use ($task) {
            $task->markClean();
            return $task->fresh(['room', 'housekeeper']);
        });
    }

    /**
     * Report maintenance issue for room or facility.
     */
    public function reportMaintenance(array $data, ?int $userId = null): MaintenanceRequest
    {
        return DB::transaction(function () use ($data, $userId) {
            $hotel = Hotel::current() ?? Hotel::first();

            $request = MaintenanceRequest::create([
                'hotel_id' => $hotel?->id,
                'room_id' => $data['room_id'] ?? null,
                'title' => $data['title'],
                'description' => $data['description'],
                'priority' => $data['priority'] ?? 'medium',
                'status' => 'reported',
                'reported_by' => $userId,
                'assigned_to' => $data['assigned_to'] ?? null,
                'cost' => $data['cost'] ?? 0.00,
                'notes' => $data['notes'] ?? null,
            ]);

            // If linked to room, mark room as maintenance
            if (!empty($data['room_id'])) {
                $room = Room::find($data['room_id']);
                $room?->update(['status' => 'maintenance']);
            }

            return $request->fresh(['room', 'reportedByUser', 'technician']);
        });
    }

    /**
     * Resolve maintenance issue and release room.
     */
    public function resolveMaintenance(MaintenanceRequest $request, ?string $notes = null): MaintenanceRequest
    {
        return DB::transaction(function () use ($request, $notes) {
            $request->resolve($notes);
            return $request->fresh(['room', 'technician']);
        });
    }

    /**
     * Log a lost & found item.
     */
    public function logLostAndFound(array $data, ?int $userId = null): LostAndFoundItem
    {
        $hotel = Hotel::current() ?? Hotel::first();

        return LostAndFoundItem::create([
            'hotel_id' => $hotel?->id,
            'room_id' => $data['room_id'] ?? null,
            'guest_id' => $data['guest_id'] ?? null,
            'item_name' => $data['item_name'],
            'category' => $data['category'] ?? 'other',
            'found_location' => $data['found_location'],
            'found_date' => $data['found_date'] ?? now()->toDateString(),
            'found_by' => $userId,
            'status' => 'stored',
            'notes' => $data['notes'] ?? null,
        ]);
    }
}
