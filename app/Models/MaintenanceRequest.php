<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id',
        'room_id',
        'title',
        'description',
        'priority',
        'status',
        'reported_by',
        'assigned_to',
        'resolved_at',
        'cost',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
            'cost' => 'decimal:2',
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

    public function reportedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function resolve(?string $notes = null): self
    {
        $this->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'notes' => $notes ?? $this->notes,
        ]);

        if ($this->room && $this->room->status === 'maintenance') {
            $this->room->update(['status' => 'available']);
        }

        return $this;
    }
}
