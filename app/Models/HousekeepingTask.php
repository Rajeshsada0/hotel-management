<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HousekeepingTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id',
        'room_id',
        'assigned_to',
        'status',
        'priority',
        'task_type',
        'started_at',
        'completed_at',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function housekeeper(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Advance status: dirty -> cleaning -> clean -> inspected
     */
    public function startCleaning(): self
    {
        $this->update([
            'status' => 'cleaning',
            'started_at' => now(),
        ]);
        $this->room?->update(['status' => 'cleaning']);

        return $this;
    }

    public function markClean(): self
    {
        $this->update([
            'status' => 'clean',
            'completed_at' => now(),
        ]);
        $this->room?->update(['status' => 'available']);

        return $this;
    }

    public function markInspected(): self
    {
        $this->update(['status' => 'inspected']);
        $this->room?->update(['status' => 'available']);

        return $this;
    }
}
