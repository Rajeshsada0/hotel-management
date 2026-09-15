<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * Display system activity audit logs.
     */
    public function index(Request $request): Response
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $logs = AuditLog::query()
            ->when($hotel, fn ($q) => $q->where(fn ($sub) => $sub->whereNull('hotel_id')->orWhere('hotel_id', $hotel->id)))
            ->when($request->module, fn ($q, $m) => $q->where('module', $m))
            ->when($request->action, fn ($q, $a) => $q->where('action', $a))
            ->when($request->search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('description', 'like', "%{$search}%")
                        ->orWhere('user_name', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%");
                });
            })
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();

        $modules = [
            'front_desk' => 'Front Desk',
            'reservations' => 'Reservations',
            'billing' => 'Billing & Payments',
            'inventory' => 'Inventory',
            'housekeeping' => 'Housekeeping',
            'restaurant' => 'Restaurant & POS',
            'services' => 'Hotel Services',
            'system' => 'System Settings',
        ];

        return Inertia::render('audit-logs/index', [
            'logs' => $logs,
            'modules' => $modules,
            'filters' => $request->only(['module', 'action', 'search']),
        ]);
    }
}
