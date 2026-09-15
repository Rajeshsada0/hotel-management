<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Models\SystemNotification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * List all notifications for current hotel/user.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $hotel = Hotel::current() ?? Hotel::first();
        $this->notificationService->syncOperationalAlerts($hotel?->id);

        $notifications = SystemNotification::query()
            ->when($hotel, fn ($q) => $q->where(fn ($sub) => $sub->whereNull('hotel_id')->orWhere('hotel_id', $hotel->id)))
            ->forUser($request->user()?->id)
            ->latest()
            ->paginate(20);

        if ($request->wantsJson()) {
            return response()->json([
                'unread_count' => $this->notificationService->getUnreadCount($hotel?->id, $request->user()?->id),
                'notifications' => $notifications,
            ]);
        }

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(SystemNotification $notification): JsonResponse|RedirectResponse
    {
        $notification->markRead();

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Notification marked as read.');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllRead(Request $request): JsonResponse|RedirectResponse
    {
        $hotel = Hotel::current() ?? Hotel::first();
        $this->notificationService->markAllAsRead($hotel?->id, $request->user()?->id);

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'All notifications marked as read.');
    }
}
