<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\InventoryItem;
use App\Models\SystemNotification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected Hotel $hotel;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hotel = Hotel::create([
            'name' => 'Highland Alpine Lodge',
            'code' => 'HAL',
            'address' => '789 Mountain Rd',
            'city' => 'Aspen',
            'country' => 'United States',
            'phone' => '+1 970-555-0188',
            'email' => 'lodge@highland.com',
            'currency' => 'USD',
            'currency_symbol' => '$',
            'check_in_time' => '16:00',
            'check_out_time' => '10:00',
            'status' => 'active',
        ]);

        $this->user = User::factory()->create([
            'role' => 'manager',
        ]);
    }

    public function test_notification_service_creates_alerts_and_unread_counts(): void
    {
        $service = app(NotificationService::class);

        $alert = $service->createAlert(
            category: 'booking',
            title: 'New Booking',
            message: 'A VIP guest has booked a suite.',
            type: 'info',
            link: '/reservations',
            hotelId: $this->hotel->id
        );

        $this->assertFalse($alert->is_read);
        $this->assertEquals(1, $service->getUnreadCount($this->hotel->id));

        $recent = $service->getRecentNotifications($this->hotel->id);
        $this->assertCount(1, $recent);
        $this->assertEquals('New Booking', $recent->first()->title);
    }

    public function test_operational_sync_triggers_low_stock_notification_when_item_is_below_threshold(): void
    {
        InventoryItem::create([
            'hotel_id' => $this->hotel->id,
            'category' => 'linens',
            'name' => 'Egyptian Cotton Bath Sheet',
            'sku' => 'LIN-EGY-01',
            'unit' => 'piece',
            'purchase_price' => 12.00,
            'selling_price' => 0.00,
            'opening_stock' => 5,
            'current_stock' => 3, // At or below minimum threshold
            'minimum_stock' => 10,
            'status' => 'active',
        ]);

        $service = app(NotificationService::class);
        $service->syncOperationalAlerts($this->hotel->id);

        $this->assertDatabaseHas('system_notifications', [
            'category' => 'low_stock',
            'type' => 'warning',
        ]);
    }

    public function test_mark_read_and_mark_all_read_endpoints_update_notification_status(): void
    {
        $notif1 = SystemNotification::create([
            'hotel_id' => $this->hotel->id,
            'type' => 'info',
            'category' => 'booking',
            'title' => 'Test Notification 1',
            'message' => 'Message 1',
            'is_read' => false,
        ]);

        $notif2 = SystemNotification::create([
            'hotel_id' => $this->hotel->id,
            'type' => 'warning',
            'category' => 'low_stock',
            'title' => 'Test Notification 2',
            'message' => 'Message 2',
            'is_read' => false,
        ]);

        // Mark single read
        $resSingle = $this->actingAs($this->user)
            ->postJson(route('notifications.read', $notif1->id));

        $resSingle->assertOk();
        $this->assertTrue($notif1->fresh()->is_read);
        $this->assertFalse($notif2->fresh()->is_read);

        // Mark all read
        $resAll = $this->actingAs($this->user)
            ->postJson(route('notifications.read-all'));

        $resAll->assertOk();
        $this->assertTrue($notif2->fresh()->is_read);
    }
}
