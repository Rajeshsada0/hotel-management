<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FrontDeskController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\HotelServiceController;
use App\Http\Controllers\HousekeepingController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PublicBookingController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\RoomController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Public Guest Booking Engine (Section 21, 28, 30)
Route::get('book', [PublicBookingController::class, 'index'])->name('book.index');
Route::get('book/availability', [PublicBookingController::class, 'checkAvailability'])->name('book.availability');
Route::post('book/coupon', [PublicBookingController::class, 'validateCoupon'])->name('book.coupon');
Route::post('book/reserve', [PublicBookingController::class, 'reserve'])->name('book.reserve');
Route::get('book/confirmation/{bookingNumber}', [PublicBookingController::class, 'confirmation'])->name('book.confirmation');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Front Desk & Room Availability
    Route::get('front-desk', [FrontDeskController::class, 'index'])->name('front-desk.index');
    Route::get('availability', [FrontDeskController::class, 'availability'])->name('front-desk.availability');
    Route::post('front-desk/check-in/{reservation}', [FrontDeskController::class, 'checkIn'])->name('front-desk.check-in');
    Route::post('front-desk/check-out/{reservation}', [FrontDeskController::class, 'checkOut'])->name('front-desk.check-out');
    Route::post('front-desk/walk-in', [FrontDeskController::class, 'walkIn'])->name('front-desk.walk-in');

    // Rooms & Room Types
    Route::get('rooms', [RoomController::class, 'index'])->name('rooms.index');
    Route::post('rooms', [RoomController::class, 'store'])->name('rooms.store');
    Route::put('rooms/{room}', [RoomController::class, 'update'])->name('rooms.update');
    Route::patch('rooms/{room}/status', [RoomController::class, 'updateStatus'])->name('rooms.status');
    Route::post('room-types', [RoomController::class, 'storeType'])->name('room-types.store');
    Route::put('room-types/{roomType}', [RoomController::class, 'updateType'])->name('room-types.update');

    // Reservations
    Route::get('reservations', [ReservationController::class, 'index'])->name('reservations.index');
    Route::get('reservations/create', [ReservationController::class, 'create'])->name('reservations.create');
    Route::post('reservations', [ReservationController::class, 'store'])->name('reservations.store');
    Route::get('reservations/{reservation}', [ReservationController::class, 'show'])->name('reservations.show');
    Route::post('reservations/{reservation}/cancel', [ReservationController::class, 'cancel'])->name('reservations.cancel');

    // Guests
    Route::get('guests', [GuestController::class, 'index'])->name('guests.index');
    Route::post('guests', [GuestController::class, 'store'])->name('guests.store');
    Route::get('guests/{guest}', [GuestController::class, 'show'])->name('guests.show');
    Route::put('guests/{guest}', [GuestController::class, 'update'])->name('guests.update');

    // Billing & Invoices
    Route::get('invoices', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
    Route::post('invoices/{invoice}/items', [InvoiceController::class, 'addItem'])->name('invoices.items.store');
    Route::post('invoices/{invoice}/payments', [InvoiceController::class, 'recordPayment'])->name('invoices.payments.store');

    // Housekeeping & Maintenance (Section 15)
    Route::get('housekeeping', [HousekeepingController::class, 'index'])->name('housekeeping.index');
    Route::post('housekeeping/assign', [HousekeepingController::class, 'assign'])->name('housekeeping.assign');
    Route::patch('housekeeping/tasks/{task}/status', [HousekeepingController::class, 'updateStatus'])->name('housekeeping.status');
    Route::post('housekeeping/maintenance', [HousekeepingController::class, 'storeMaintenance'])->name('housekeeping.maintenance.store');
    Route::patch('housekeeping/maintenance/{maintenance}/resolve', [HousekeepingController::class, 'resolveMaintenance'])->name('housekeeping.maintenance.resolve');
    Route::post('housekeeping/lost-and-found', [HousekeepingController::class, 'storeLostAndFound'])->name('housekeeping.lost-and-found.store');
    Route::patch('housekeeping/lost-and-found/{item}/claim', [HousekeepingController::class, 'updateLostAndFound'])->name('housekeeping.lost-and-found.claim');

    // Hotel Services & Room Orders (Section 24)
    Route::get('services', [HotelServiceController::class, 'index'])->name('services.index');
    Route::post('services', [HotelServiceController::class, 'store'])->name('services.store');
    Route::post('services/order', [HotelServiceController::class, 'order'])->name('services.order');

    // Restaurant & POS (Section 14 & 28)
    Route::get('restaurant', [RestaurantController::class, 'index'])->name('restaurant.index');
    Route::post('restaurant/order', [RestaurantController::class, 'storeOrder'])->name('restaurant.order.store');
    Route::post('restaurant/orders/{order}/settle', [RestaurantController::class, 'settleOrder'])->name('restaurant.order.settle');
    Route::post('restaurant/products', [RestaurantController::class, 'storeProduct'])->name('restaurant.products.store');
    Route::post('restaurant/tables', [RestaurantController::class, 'storeTable'])->name('restaurant.tables.store');

    // Inventory & Suppliers (Section 16 & 17)
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('inventory/items', [InventoryController::class, 'storeItem'])->name('inventory.items.store');
    Route::post('inventory/transactions', [InventoryController::class, 'storeTransaction'])->name('inventory.transactions.store');
    Route::post('inventory/suppliers', [InventoryController::class, 'storeSupplier'])->name('inventory.suppliers.store');
    Route::post('inventory/purchases', [InventoryController::class, 'storePurchase'])->name('inventory.purchases.store');
    Route::post('inventory/purchases/{purchase}/receive', [InventoryController::class, 'receivePurchase'])->name('inventory.purchases.receive');

    // Expenses & Staff Management (Section 18 & 19)
    Route::get('expenses', [ExpenseController::class, 'index'])->name('expenses.index');
    Route::post('expenses', [ExpenseController::class, 'store'])->name('expenses.store');
    Route::post('expenses/staff', [ExpenseController::class, 'storeStaff'])->name('expenses.staff.store');

    // Coupons & Discounts (Section 22)
    Route::get('coupons', [CouponController::class, 'index'])->name('coupons.index');
    Route::post('coupons', [CouponController::class, 'store'])->name('coupons.store');
    Route::patch('coupons/{coupon}/toggle', [CouponController::class, 'toggle'])->name('coupons.toggle');
    Route::post('coupons/validate', [CouponController::class, 'validateCode'])->name('coupons.validate');

    // Audit Logs (Section 18 & 26)
    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    // System Notifications (Section 25)
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');

    // Reports & Analytics (Section 20)
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
});

require __DIR__.'/settings.php';
