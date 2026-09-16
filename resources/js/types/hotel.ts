export type Hotel = {
    id: number;
    name: string;
    code?: string | null;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    website?: string | null;
    tax_number?: string | null;
    logo?: string | null;
    banner_image?: string | null;
    banner_color?: string | null;
    currency: string;
    currency_symbol: string;
    check_in_time: string;
    check_out_time: string;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
};

export type DashboardSummary = {
    total_rooms: number;
    available_rooms: number;
    occupied_rooms: number;
    reserved_rooms: number;
    dirty_rooms: number;
    cleaning_rooms?: number;
    clean_rooms: number;
    check_ins_today: number;
    check_outs_today: number;
    today_revenue: number;
    today_restaurant_sales?: number;
    this_month_expenses?: number;
    pending_payments: number;
    occupancy_rate: number;
};

export type RoomType = {
    id: number;
    hotel_id?: number | null;
    name: string;
    slug: string;
    description?: string | null;
    max_adults: number;
    max_children: number;
    base_price: string | number;
    extra_adult_price: string | number;
    extra_child_price: string | number;
    number_of_beds: number;
    amenities?: string[] | null;
    status: 'active' | 'inactive';
    rooms_count?: number;
    created_at?: string;
    updated_at?: string;
};

export type RoomStatus =
    | 'available'
    | 'reserved'
    | 'occupied'
    | 'cleaning'
    | 'dirty'
    | 'maintenance'
    | 'out_of_service';

export type Room = {
    id: number;
    hotel_id?: number | null;
    room_type_id: number;
    room_number: string;
    floor: string;
    building?: string | null;
    price?: string | number | null;
    status: RoomStatus;
    bed_type: string;
    capacity: number;
    description?: string | null;
    amenities?: string[] | null;
    images?: string[] | null;
    room_type?: RoomType;
    current_reservation?: Reservation | null;
    created_at?: string;
    updated_at?: string;
};

export type Guest = {
    id: number;
    first_name: string;
    last_name: string;
    full_name?: string;
    gender?: 'male' | 'female' | 'other' | null;
    date_of_birth?: string | null;
    nationality?: string | null;
    phone: string;
    email?: string | null;
    address?: string | null;
    id_type?: string | null;
    id_number?: string | null;
    passport_number?: string | null;
    notes?: string | null;
    reservations_count?: number;
    reservations?: Reservation[];
    invoices?: Invoice[];
    created_at?: string;
    updated_at?: string;
};

export type BookingStatus =
    | 'pending'
    | 'confirmed'
    | 'checked_in'
    | 'checked_out'
    | 'cancelled'
    | 'no_show';

export type PaymentStatus =
    | 'unpaid'
    | 'partially_paid'
    | 'paid'
    | 'refunded';

export type Reservation = {
    id: number;
    booking_number: string;
    hotel_id?: number | null;
    guest_id: number;
    room_type_id: number;
    room_id?: number | null;
    check_in_date: string;
    check_out_date: string;
    actual_check_in_at?: string | null;
    actual_check_out_at?: string | null;
    adults: number;
    children: number;
    total_nights: number;
    nightly_rate: string | number;
    subtotal: string | number;
    discount: string | number;
    coupon_id?: number | null;
    coupon_code?: string | null;
    tax: string | number;
    total_amount: string | number;
    paid_amount: string | number;
    balance?: number;
    booking_status: BookingStatus;
    payment_status: PaymentStatus;
    booking_source: string;
    special_request?: string | null;
    notes?: string | null;
    guest?: Guest;
    room?: Room | null;
    room_type?: RoomType;
    invoice?: Invoice | null;
    created_at?: string;
    updated_at?: string;
};

export type InvoiceItem = {
    id: number;
    invoice_id: number;
    item_type: string;
    description: string;
    quantity: string | number;
    unit_price: string | number;
    total_price: string | number;
    created_at?: string;
};

export type Payment = {
    id: number;
    payment_number: string;
    hotel_id?: number | null;
    invoice_id: number;
    reservation_id?: number | null;
    guest_id: number;
    amount: string | number;
    payment_method: string;
    transaction_number?: string | null;
    payment_date: string;
    reference?: string | null;
    notes?: string | null;
    received_by_user?: {
        name: string;
    } | null;
    created_at?: string;
};

export type Invoice = {
    id: number;
    invoice_number: string;
    hotel_id?: number | null;
    reservation_id?: number | null;
    guest_id: number;
    issue_date: string;
    due_date?: string | null;
    subtotal: string | number;
    discount: string | number;
    tax: string | number;
    total_amount: string | number;
    paid_amount: string | number;
    balance?: number;
    status: 'unpaid' | 'partially_paid' | 'paid' | 'cancelled' | 'refunded';
    notes?: string | null;
    guest?: Guest;
    hotel?: Hotel;
    reservation?: Reservation | null;
    items?: InvoiceItem[];
    payments?: Payment[];
    created_at?: string;
};

export type HousekeepingTask = {
    id: number;
    hotel_id?: number | null;
    room_id: number;
    assigned_to?: number | null;
    status: 'dirty' | 'cleaning' | 'clean' | 'inspected';
    priority: 'normal' | 'high' | 'urgent';
    task_type: 'daily_cleaning' | 'checkout_cleaning' | 'deep_cleaning' | 'touchup';
    started_at?: string | null;
    completed_at?: string | null;
    notes?: string | null;
    room?: Room;
    housekeeper?: {
        id: number;
        name: string;
        phone?: string | null;
    } | null;
    created_at?: string;
    updated_at?: string;
};

export type MaintenanceRequest = {
    id: number;
    hotel_id?: number | null;
    room_id?: number | null;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'emergency';
    status: 'reported' | 'in_progress' | 'resolved' | 'cancelled';
    reported_by?: number | null;
    assigned_to?: number | null;
    resolved_at?: string | null;
    cost: string | number;
    notes?: string | null;
    room?: Room | null;
    reported_by_user?: {
        name: string;
    } | null;
    technician?: {
        name: string;
    } | null;
    created_at?: string;
    updated_at?: string;
};

export type LostAndFoundItem = {
    id: number;
    hotel_id?: number | null;
    room_id?: number | null;
    guest_id?: number | null;
    item_name: string;
    category: string;
    found_location: string;
    found_date: string;
    found_by?: number | null;
    status: 'stored' | 'claimed' | 'disposed' | 'donated';
    claimed_by?: string | null;
    claimed_date?: string | null;
    notes?: string | null;
    room?: Room | null;
    guest?: Guest | null;
    found_by_user?: {
        name: string;
    } | null;
    created_at?: string;
    updated_at?: string;
};

export type Service = {
    id: number;
    hotel_id?: number | null;
    category: string;
    name: string;
    code?: string | null;
    price: string | number;
    description?: string | null;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
};

export type ServiceOrder = {
    id: number;
    order_number: string;
    hotel_id?: number | null;
    reservation_id: number;
    guest_id: number;
    room_id?: number | null;
    service_id: number;
    quantity: string | number;
    unit_price: string | number;
    total_price: string | number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    charged_to_room: boolean;
    invoice_item_id?: number | null;
    ordered_at: string;
    notes?: string | null;
    service?: Service;
    guest?: Guest;
    room?: Room | null;
    reservation?: Reservation;
    created_at?: string;
    updated_at?: string;
};

export type RestaurantCategory = {
    id: number;
    hotel_id?: number | null;
    name: string;
    slug?: string | null;
    description?: string | null;
    sort_order?: number;
    status: 'active' | 'inactive';
    products?: RestaurantProduct[];
    created_at?: string;
    updated_at?: string;
};

export type RestaurantTable = {
    id: number;
    hotel_id?: number | null;
    table_number: string;
    capacity: number;
    location?: string | null;
    status: 'available' | 'occupied' | 'reserved';
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
};

export type RestaurantProduct = {
    id: number;
    hotel_id?: number | null;
    category_id: number;
    name: string;
    code?: string | null;
    price: string | number;
    cost_price?: string | number | null;
    is_available: boolean;
    image?: string | null;
    description?: string | null;
    category?: RestaurantCategory;
    created_at?: string;
    updated_at?: string;
};

export type RestaurantOrderItem = {
    id: number;
    order_id: number;
    product_id?: number | null;
    product_name: string;
    quantity: string | number;
    unit_price: string | number;
    total_price: string | number;
    notes?: string | null;
    product?: RestaurantProduct | null;
    created_at?: string;
    updated_at?: string;
};

export type RestaurantOrder = {
    id: number;
    order_number: string;
    hotel_id?: number | null;
    table_id?: number | null;
    server_id?: number | null;
    reservation_id?: number | null;
    room_id?: number | null;
    guest_id?: number | null;
    invoice_item_id?: number | null;
    subtotal: string | number;
    discount: string | number;
    tax: string | number;
    total_amount: string | number;
    payment_method: 'cash' | 'card' | 'charge_to_room' | 'unpaid';
    payment_status: 'paid' | 'unpaid' | 'refunded';
    order_status: 'pending' | 'preparing' | 'served' | 'completed' | 'cancelled';
    notes?: string | null;
    table?: RestaurantTable | null;
    server?: {
        id: number;
        name: string;
    } | null;
    reservation?: Reservation | null;
    guest?: Guest | null;
    room?: Room | null;
    items?: RestaurantOrderItem[];
    created_at?: string;
    updated_at?: string;
};

export type Supplier = {
    id: number;
    hotel_id?: number | null;
    company_name: string;
    contact_person?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    tax_number?: string | null;
    payment_terms?: string | null;
    status: 'active' | 'inactive';
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
};

export type InventoryItem = {
    id: number;
    hotel_id?: number | null;
    supplier_id?: number | null;
    category: string;
    name: string;
    sku: string;
    unit: string;
    purchase_price: string | number;
    selling_price?: string | number | null;
    opening_stock: string | number;
    current_stock: string | number;
    minimum_stock: string | number;
    status: 'active' | 'inactive';
    notes?: string | null;
    supplier?: Supplier | null;
    created_at?: string;
    updated_at?: string;
};

export type InventoryTransaction = {
    id: number;
    hotel_id?: number | null;
    inventory_item_id: number;
    user_id?: number | null;
    transaction_type: 'purchase' | 'stock_in' | 'stock_out' | 'adjustment' | 'waste' | 'return';
    quantity: string | number;
    unit_price: string | number;
    total_price: string | number;
    department?: string | null;
    reference_number?: string | null;
    notes?: string | null;
    inventory_item?: InventoryItem;
    user?: {
        id: number;
        name: string;
    } | null;
    created_at?: string;
    updated_at?: string;
};

export type PurchaseItem = {
    id: number;
    purchase_id: number;
    inventory_item_id?: number | null;
    item_name: string;
    quantity: string | number;
    unit_cost: string | number;
    total_cost: string | number;
    created_at?: string;
    updated_at?: string;
};

export type Purchase = {
    id: number;
    hotel_id?: number | null;
    supplier_id?: number | null;
    purchase_number: string;
    purchase_date: string;
    delivery_date?: string | null;
    subtotal: string | number;
    tax: string | number;
    total_amount: string | number;
    status: 'ordered' | 'received' | 'cancelled';
    payment_status: 'unpaid' | 'paid' | 'partially_paid';
    payment_method?: string | null;
    notes?: string | null;
    supplier?: Supplier | null;
    items?: PurchaseItem[];
    created_at?: string;
    updated_at?: string;
};

export type Staff = {
    id: number;
    hotel_id?: number | null;
    user_id?: number | null;
    employee_id: string;
    name: string;
    department: 'reception' | 'housekeeping' | 'restaurant' | 'kitchen' | 'accounts' | 'security' | 'management';
    position: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    joining_date: string;
    salary: string | number;
    status: 'active' | 'on_leave' | 'terminated';
    created_at?: string;
    updated_at?: string;
};

export type Expense = {
    id: number;
    hotel_id?: number | null;
    expense_number: string;
    category: string;
    amount: string | number;
    expense_date: string;
    payment_method: string;
    description?: string | null;
    staff_id?: number | null;
    staff?: Staff | null;
    created_by?: number | null;
    creator?: {
        id: number;
        name: string;
    } | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
};

export type RevenueTrendDay = {
    date: string;
    day: string;
    room_revenue: number;
    restaurant_revenue: number;
    total: number;
};

export type RoomTypeBreakdown = {
    id: number;
    name: string;
    base_price: number;
    total_rooms: number;
    occupied_rooms: number;
    occupancy_rate: number;
};

export type FinancialReport = {
    gross_revenue: number;
    room_payments: number;
    restaurant_direct_revenue: number;
    services_revenue: number;
    total_expenses: number;
    net_profit: number;
    profit_margin: number;
    expenses_by_category: Array<{
        category: string;
        total: number;
        count: number;
    }>;
    payment_methods: Array<{
        method: string;
        total: number;
        count: number;
    }>;
};

export type OccupancyReport = {
    total_rooms: number;
    days_count: number;
    total_available_room_nights: number;
    booked_nights: number;
    occupancy_rate: number;
    total_bookings: number;
    confirmed_count: number;
    checked_in_count: number;
    checked_out_count: number;
    cancelled_count: number;
    booking_sources: Array<{
        source: string;
        count: number;
    }>;
    room_types: Array<{
        id: number;
        name: string;
        base_price: number;
        rooms_count: number;
        bookings_count: number;
        total_nights: number;
        revenue: number;
    }>;
};

export type TopDishReport = {
    name: string;
    quantity: number;
    sales: number;
};

export type Coupon = {
    id: number;
    hotel_id?: number | null;
    code: string;
    name: string;
    description?: string | null;
    discount_type: 'percentage' | 'fixed';
    value: number | string;
    min_spend: number | string;
    max_discount?: number | string | null;
    valid_from?: string | null;
    valid_until?: string | null;
    usage_limit?: number | null;
    used_count: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

export type AuditLog = {
    id: number;
    hotel_id?: number | null;
    user_id?: number | null;
    user_name?: string | null;
    action: string;
    module: string;
    record_id?: number | null;
    description?: string | null;
    old_values?: Record<string, unknown> | null;
    new_values?: Record<string, unknown> | null;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at: string;
};

export type SystemNotification = {
    id: number;
    hotel_id?: number | null;
    user_id?: number | null;
    type: 'info' | 'warning' | 'danger' | 'success';
    category: string;
    title: string;
    message: string;
    link?: string | null;
    is_read: boolean;
    read_at?: string | null;
    created_at: string;
};
