# Hotel Management System – Laravel Requirements

## 1. Main Modules

The system should contain these core modules:

1. **Authentication & User Management**
2. **Dashboard**
3. **Hotel / Branch Management**
4. **Room & Room Type Management**
5. **Room Availability**
6. **Reservation / Booking Management**
7. **Guest Management**
8. **Check-in / Check-out**
9. **Billing & Invoicing**
10. **Payments**
11. **Restaurant / POS**
12. **Housekeeping**
13. **Inventory Management**
14. **Staff Management**
15. **Expenses**
16. **Reports**
17. **Settings**
18. **Audit Logs**

---

# 2. User & Role Management

### User

Each user should have:

* ID
* Name
* Email
* Phone
* Username
* Password
* Role
* Status
* Profile image
* Last login

### Roles

Example roles:

| Role             | Access                     |
| ---------------- | -------------------------- |
| Super Admin      | Full system                |
| Hotel Admin      | Hotel management           |
| Manager          | Reports + operations       |
| Receptionist     | Booking/check-in/check-out |
| Accountant       | Billing/payments/reports   |
| Housekeeping     | Room cleaning              |
| Restaurant Staff | POS/orders                 |
| Storekeeper      | Inventory                  |

Use Laravel authorization/policies or a role-permission package.

---

# 3. Dashboard

Dashboard should show:

### Today's Summary

* Total rooms
* Available rooms
* Occupied rooms
* Reserved rooms
* Dirty rooms
* Clean rooms
* Check-ins today
* Check-outs today
* Today's revenue
* Pending payments

### Charts

* Revenue by day/month
* Occupancy percentage
* Booking statistics
* Room type occupancy
* Restaurant sales
* Expenses

---

# 4. Hotel / Branch Management

If the system supports multiple hotels:

### Hotel

* Hotel ID
* Hotel name
* Address
* City
* Country
* Phone
* Email
* Website
* Tax/VAT number
* Logo
* Currency
* Check-in time
* Check-out time
* Status

Example:

```text
Hotel
 ├── Rooms
 ├── Reservations
 ├── Guests
 ├── Staff
 ├── Restaurant
 └── Inventory
```

---

# 5. Room Type Management

Examples:

* Single
* Double
* Twin
* Deluxe
* Suite
* Family
* Presidential

Fields:

```text
Room Type
-----------
Name
Description
Maximum Adults
Maximum Children
Base Price
Extra Adult Price
Extra Child Price
Number of Beds
Amenities
Status
```

---

# 6. Room Management

Each room should contain:

```text
Room
----
Room Number
Room Type
Floor
Building
Price
Status
Bed Type
Capacity
Description
Amenities
Images
```

### Room Status

* Available
* Reserved
* Occupied
* Cleaning
* Dirty
* Maintenance
* Out of Service

---

# 7. Room Availability

The receptionist should be able to search:

```text
Check-in Date
Check-out Date
Adults
Children
Room Type
```

System returns:

```text
Deluxe Room
101 - Available
102 - Available

Suite
201 - Available
```

The system must prevent **double booking**.

---

# 8. Reservation / Booking

### Booking fields

```text
Booking Number
Guest
Check-in Date
Check-out Date
Room
Room Type
Adults
Children
Rate
Discount
Tax
Total
Deposit
Balance
Booking Status
Payment Status
Special Request
Notes
```

### Booking Status

* Pending
* Confirmed
* Checked In
* Checked Out
* Cancelled
* No Show

### Payment Status

* Unpaid
* Partially Paid
* Paid
* Refunded

---

# 9. Guest Management

Guest profile:

```text
Guest
-----
Guest ID
First Name
Last Name
Gender
Date of Birth
Nationality
Phone
Email
Address
ID Type
ID Number
Passport Number
Notes
```

Store previous stays:

```text
Guest
 ↓
Previous Reservations
 ↓
Previous Rooms
 ↓
Payments
 ↓
Invoices
```

---

# 10. Check-in

Receptionist selects the reservation and clicks:

**Check In**

System should:

1. Verify reservation.
2. Verify guest information.
3. Assign room.
4. Record check-in date/time.
5. Change room status to `Occupied`.
6. Generate registration record.
7. Record deposit/payment if applicable.

### Walk-in Guest

Allow:

```text
Walk-in → Guest → Room → Booking → Payment
```

without an existing reservation.

---

# 11. Check-out

At checkout:

```text
Room Charge
+ Restaurant
+ Laundry
+ Minibar
+ Other Services
+ Taxes
- Discount
- Payments
----------------
Balance
```

If balance is zero:

```text
Checkout
   ↓
Invoice
   ↓
Payment
   ↓
Room = Dirty
```

Housekeeping then changes:

```text
Dirty → Cleaning → Clean → Available
```

---

# 12. Billing & Invoice

Invoice should contain:

```text
Invoice Number
Booking Number
Guest
Room
Invoice Date

Description       Qty    Rate    Amount
----------------------------------------
Room              2      100     200
Restaurant        3       20      60
Laundry            1       10      10

Subtotal                    270
Discount                     20
Tax                          25
-------------------------------
Grand Total                 275
Paid                        200
Balance                      75
```

Invoice actions:

* View
* Print
* PDF
* Email
* Cancel
* Refund

---

# 13. Payment Management

Support:

* Cash
* Credit Card
* Debit Card
* Bank Transfer
* Mobile Payment
* Online Payment

Payment fields:

```text
Payment ID
Invoice
Booking
Guest
Amount
Payment Method
Transaction Number
Payment Date
Reference
Notes
```

---

# 14. Restaurant / POS

Restaurant module should support:

### Categories

```text
Food
Drinks
Dessert
Breakfast
Lunch
Dinner
```

### Products

```text
Product
Price
Cost
Tax
Category
Stock
Status
```

### POS

```text
Table
Waiter
Order
Items
Quantity
Discount
Tax
Total
Payment
```

Important feature:

### Charge to Room

Restaurant bill can be transferred to the guest's hotel invoice:

```text
Restaurant Order
       ↓
Charge to Room
       ↓
Room 205
       ↓
Guest Invoice
```

---

# 15. Housekeeping

Housekeeping dashboard:

| Room | Status      | Housekeeper |
| ---- | ----------- | ----------- |
| 101  | Clean       | John        |
| 102  | Dirty       | Mary        |
| 103  | Cleaning    | David       |
| 104  | Maintenance | -           |

Tasks:

* Assign cleaning
* Mark clean
* Mark dirty
* Maintenance request
* Lost & found
* Inspection

---

# 16. Inventory Management

Manage hotel stock.

Examples:

* Towels
* Bedsheets
* Soap
* Shampoo
* Food
* Drinks
* Cleaning supplies
* Office supplies

### Inventory

```text
Product
Category
SKU
Unit
Purchase Price
Selling Price
Opening Stock
Current Stock
Minimum Stock
Supplier
```

Transactions:

```text
Purchase
Stock In
Stock Out
Adjustment
Transfer
Waste
Return
```

---

# 17. Supplier Management

Supplier fields:

```text
Supplier
Company Name
Contact Person
Phone
Email
Address
Tax Number
Payment Terms
Status
```

Purchase:

```text
Supplier
Purchase Number
Date
Items
Quantity
Cost
Tax
Total
Payment
```

---

# 18. Staff Management

Staff:

```text
Employee ID
Name
Department
Position
Phone
Email
Address
Joining Date
Salary
Status
```

Departments:

* Reception
* Housekeeping
* Restaurant
* Kitchen
* Accounts
* Security
* Management

---

# 19. Expense Management

Track:

* Electricity
* Water
* Internet
* Salary
* Maintenance
* Food purchase
* Cleaning supplies
* Marketing
* Other expenses

Fields:

```text
Expense Number
Category
Amount
Date
Payment Method
Description
Attachment
Created By
```

---

# 20. Reports

Important reports:

### Reservation Reports

* Daily bookings
* Monthly bookings
* Cancelled bookings
* No-shows
* Booking source

### Occupancy Reports

```text
Total Rooms
Occupied Rooms
Available Rooms
Reserved Rooms
Maintenance Rooms
Occupancy %
```

### Financial Reports

* Daily revenue
* Monthly revenue
* Revenue by room
* Revenue by restaurant
* Payment report
* Outstanding balances
* Expenses
* Profit/Loss

### Guest Reports

* Guest list
* Guest history
* Nationality report
* Repeat guests

### Inventory Reports

* Stock report
* Stock movement
* Low stock
* Purchase report
* Supplier report

---

# 21. Booking Sources

Track where the reservation came from:

```text
Walk-in
Website
Phone
Email
Booking.com
Agoda
Expedia
Travel Agent
Corporate
Other
```

This is useful for calculating commission and booking-source performance.

---

# 22. Coupon / Discount

Support:

```text
Discount Type
--------------
Percentage
Fixed Amount
```

Example:

```text
Room price = $100
Discount = 10%
Discount amount = $10
Final = $90
```

---

# 23. Taxes

Allow configurable taxes.

Example:

```text
Room Charge       $100
Tax 10%            $10
-----------------------
Total             $110
```

Tax should be configurable rather than hard-coded.

---

# 24. Hotel Services

Additional services:

* Laundry
* Airport pickup
* Spa
* Room service
* Minibar
* Parking
* Extra bed
* Breakfast
* Conference room

These services can be added to the guest invoice.

---

# 25. Notifications

System notifications:

### Guest

* Booking confirmation
* Booking cancellation
* Payment receipt
* Check-in reminder
* Check-out reminder

### Staff

* New booking
* New housekeeping task
* Maintenance request
* Low inventory
* Pending payment

Channels:

* Email
* SMS
* WhatsApp (optional)

---

# 26. Database Structure

A basic Laravel database could contain:

```text
users
roles
permissions

hotels
floors
room_types
rooms
room_amenities

guests
guest_documents

reservations
reservation_rooms

check_ins
check_outs

invoices
invoice_items
payments
payment_methods

services
service_orders
service_order_items

restaurant_categories
restaurant_products
restaurant_tables
restaurant_orders
restaurant_order_items

housekeeping_tasks
maintenance_requests

suppliers
inventory_categories
inventory_products
inventory_transactions
purchases
purchase_items

employees
departments

expense_categories
expenses

taxes
discounts

notifications
audit_logs

settings
```

---

# 27. Laravel Technology Requirements

Recommended stack:

```text
Backend:
Laravel 12+

Database:
MySQL 8+

Frontend:
Blade + Livewire
or
Vue.js

CSS:
Tailwind CSS

Authentication:
Laravel Breeze / Fortify

API:
Laravel Sanctum

Queue:
Redis

Cache:
Redis

Storage:
Laravel Filesystem

PDF:
DomPDF / Browsershot

Reports:
Laravel + Chart.js
```

For a typical hotel system, **Laravel + Livewire + Alpine.js + Tailwind + MySQL** is a good choice if you want to keep the application mostly inside Laravel without building a separate SPA.

---

# 28. Important Business Rules

These rules are particularly important.

### No Double Booking

A room cannot be booked if another reservation overlaps:

```text
Existing:
10 Sep → 15 Sep

New booking:
12 Sep → 14 Sep

❌ Not allowed
```

But:

```text
Existing:
10 Sep → 15 Sep

New booking:
15 Sep → 18 Sep

✅ Allowed
```

### Room Status

```text
Available
    ↓
Reserved
    ↓
Occupied
    ↓
Dirty
    ↓
Cleaning
    ↓
Clean
    ↓
Available
```

### Payment

```text
Invoice
   ↓
Total Amount
   ↓
Payments
   ↓
Balance
```

The system should not allow checkout when there is an unpaid balance unless the hotel allows credit checkout.

---

# 29. Suggested Laravel Architecture

I recommend structuring the application like this:

```text
app/
├── Models/
│   ├── Hotel.php
│   ├── Room.php
│   ├── RoomType.php
│   ├── Guest.php
│   ├── Reservation.php
│   ├── Invoice.php
│   ├── Payment.php
│   ├── Employee.php
│   └── ...
│
├── Services/
│   ├── ReservationService.php
│   ├── CheckInService.php
│   ├── CheckOutService.php
│   ├── InvoiceService.php
│   ├── PaymentService.php
│   ├── RoomService.php
│   └── ...
│
├── Http/
│   ├── Controllers/
│   └── Requests/
│
└── Policies/
```

This is better than putting all hotel logic directly inside controllers.

---

# 30. Development Phases

I would build it in this order:

### Phase 1 — Foundation

* Authentication
* Users
* Roles & permissions
* Hotel settings
* Dashboard

### Phase 2 — Hotel Operations

* Room types
* Rooms
* Guests
* Reservations
* Availability
* Check-in
* Check-out

### Phase 3 — Finance

* Invoices
* Payments
* Taxes
* Discounts
* Expenses
* Financial reports

### Phase 4 — Operations

* Housekeeping
* Maintenance
* Hotel services

### Phase 5 — Restaurant

* Restaurant
* Tables
* POS
* Kitchen orders
* Charge to room

### Phase 6 — Inventory

* Products
* Suppliers
* Purchases
* Stock
* Stock adjustments

### Phase 7 — Advanced

* Online booking
* Payment gateway
* Email/SMS
* OTA integrations
* Multi-hotel
* Mobile/API
* Advanced reports

**For an MVP, I recommend starting with Rooms → Guests → Reservations → Check-in → Check-out → Invoice → Payment.** Once that workflow is stable, add Restaurant, Housekeeping, and Inventory.
