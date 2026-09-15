<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Hotel;
use App\Models\User;

class AuditLogService
{
    /**
     * Record an audit log event.
     */
    public function log(
        string $action,
        string $module,
        ?string $description = null,
        ?int $recordId = null,
        ?array $newValues = null,
        ?array $oldValues = null,
        ?int $userId = null,
        ?int $hotelId = null
    ): AuditLog {
        $resolvedUserId = $userId ?? auth()->id();
        $userName = null;

        if ($resolvedUserId) {
            $user = User::find($resolvedUserId);
            $userName = $user?->name;
        }

        $resolvedHotelId = $hotelId ?? Hotel::current()?->id;

        $ip = request()?->ip();
        $userAgent = request()?->userAgent();

        return AuditLog::create([
            'hotel_id' => $resolvedHotelId,
            'user_id' => $resolvedUserId,
            'user_name' => $userName,
            'action' => $action,
            'module' => $module,
            'record_id' => $recordId,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ip,
            'user_agent' => $userAgent ? substr($userAgent, 0, 500) : null,
            'created_at' => now(),
        ]);
    }
}
