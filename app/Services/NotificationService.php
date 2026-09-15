<?php

namespace App\Services;

use App\Models\Hotel;
use App\Models\InventoryItem;
use App\Models\MaintenanceRequest;
use App\Models\Reservation;
use App\Models\SystemNotification;
use Illuminate\Database\Eloquent\Collection;

class NotificationService
{
    /**
     * Create a new system notification.
     */
    public function createAlert(
        string $category,
        string $title,
        string $message,
        string $type = 'info',
        ?string $link = null,
        ?int $userId = null,
        ?int $hotelId = null
    ): SystemNotification {
        $resolvedHotelId = $hotelId ?? Hotel::current()?->id;

        return SystemNotification::create([
            'hotel_id' => $resolvedHotelId,
            'user_id' => $userId,
            'type' => $type,
            'category' => $category,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'is_read' => false,
        ]);
    }

    /**
     * Get count of unread notifications.
     */
    public function getUnreadCount(?int $hotelId = null, ?int $userId = null): int
    {
        $resolvedHotelId = $hotelId ?? Hotel::current()?->id;

        return SystemNotification::query()
            ->when($resolvedHotelId, fn ($q) => $q->where(fn ($sub) => $sub->whereNull('hotel_id')->orWhere('hotel_id', $resolvedHotelId)))
            ->forUser($userId)
            ->unread()
            ->count();
    }

    /**
     * Get list of recent notifications.
     */
    public function getRecentNotifications(?int $hotelId = null, ?int $userId = null, int $limit = 10): Collection
    {
        $resolvedHotelId = $hotelId ?? Hotel::current()?->id;

        return SystemNotification::query()
            ->when($resolvedHotelId, fn ($q) => $q->where(fn ($sub) => $sub->whereNull('hotel_id')->orWhere('hotel_id', $resolvedHotelId)))
            ->forUser($userId)
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Scan and sync operational alerts (low inventory, emergency maintenance, today's arrivals).
     */
    public function syncOperationalAlerts(?int $hotelId = null): void
    {
        $resolvedHotelId = $hotelId ?? Hotel::current()?->id;

        // 1. Low stock items check
        $lowStockItems = InventoryItem::query()
            ->when($resolvedHotelId, fn ($q) => $q->where('hotel_id', $resolvedHotelId))
            ->whereColumn('current_stock', '<=', 'minimum_stock')
            ->get();

        foreach ($lowStockItems as $item) {
            $alreadyNotified = SystemNotification::query()
                ->where('category', 'low_stock')
                ->where('message', 'like', "%{$item->name}%")
                ->where('created_at', '>=', now()->subHours(12))
                ->exists();

            if (!$alreadyNotified) {
                $this->createAlert(
                    category: 'low_stock',
                    title: 'Low Inventory Alert',
                    message: "Stock for '{$item->name}' is {$item->current_stock} {$item->unit} (Minimum threshold: {$item->minimum_stock} {$item->unit}).",
                    type: 'warning',
                    link: '/inventory',
                    hotelId: $resolvedHotelId
                );
            }
        }

        // 2. Open maintenance requests check
        $openMaintenance = MaintenanceRequest::query()
            ->when($resolvedHotelId, fn ($q) => $q->where('hotel_id', $resolvedHotelId))
            ->where('status', 'pending')
            ->where('created_at', '>=', now()->subHours(6))
            ->with('room')
            ->get();

        foreach ($openMaintenance as $req) {
            $roomNum = $req->room?->room_number ?? 'Unknown';
            $alreadyNotified = SystemNotification::query()
                ->where('category', 'maintenance')
                ->where('message', 'like', "%Room {$roomNum}%")
                ->where('created_at', '>=', now()->subHours(6))
                ->exists();

            if (!$alreadyNotified) {
                $this->createAlert(
                    category: 'maintenance',
                    title: 'Pending Maintenance Request',
                    message: "Maintenance pending for Room {$roomNum}: {$req->issue_description}",
                    type: 'danger',
                    link: '/housekeeping',
                    hotelId: $resolvedHotelId
                );
            }
        }
    }

    /**
     * Mark single notification as read.
     */
    public function markAsRead(int $id): bool
    {
        $notif = SystemNotification::find($id);
        if ($notif) {
            $notif->markRead();
            return true;
        }
        return false;
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(?int $hotelId = null, ?int $userId = null): void
    {
        $resolvedHotelId = $hotelId ?? Hotel::current()?->id;

        SystemNotification::query()
            ->when($resolvedHotelId, fn ($q) => $q->where(fn ($sub) => $sub->whereNull('hotel_id')->orWhere('hotel_id', $resolvedHotelId)))
            ->forUser($userId)
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }
}
