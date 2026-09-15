import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    UtensilsCrossed,
    Plus,
    Minus,
    Trash2,
    DollarSign,
    CreditCard,
    BedDouble,
    Clock,
    Search,
    ShoppingBag,
    CheckCircle2,
    Armchair,
    Receipt,
    Coffee,
    Pizza,
    Wine,
    SlidersHorizontal,
    Printer,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type {
    Hotel,
    Reservation,
    RestaurantCategory,
    RestaurantOrder,
    RestaurantProduct,
    RestaurantTable,
} from '@/types';

type CartItem = {
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    notes?: string;
};

type RestaurantProps = {
    hotel?: Hotel | null;
    categories: RestaurantCategory[];
    tables: RestaurantTable[];
    orders: {
        data: RestaurantOrder[];
        links: any[];
        total: number;
    };
    inHouseReservations: Reservation[];
};

export default function RestaurantIndex({
    hotel,
    categories,
    tables,
    orders,
    inHouseReservations,
}: RestaurantProps) {
    const [activeTab, setActiveTab] = useState<'pos' | 'tables' | 'orders' | 'menu'>('pos');
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Cart state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<string>('none');
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [orderNotes, setOrderNotes] = useState<string>('');

    // Modals
    const [isChargeToRoomOpen, setIsChargeToRoomOpen] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState<string>(
        inHouseReservations[0]?.id ? String(inHouseReservations[0].id) : ''
    );
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [isAddTableOpen, setIsAddTableOpen] = useState(false);
    const [settleOrderTarget, setSettleOrderTarget] = useState<RestaurantOrder | null>(null);
    const [receiptOrder, setReceiptOrder] = useState<RestaurantOrder | null>(null);

    // Inertia form for order placement
    const { post: postOrder, processing: orderProcessing } = useForm();

    // New Product form
    const {
        data: productData,
        setData: setProductData,
        post: postProduct,
        reset: resetProduct,
        processing: productProcessing,
    } = useForm({
        category_id: categories[0]?.id ? String(categories[0].id) : '',
        name: '',
        code: '',
        price: '',
        cost_price: '',
        description: '',
        is_available: true,
    });

    // New Table form
    const {
        data: tableData,
        setData: setTableData,
        post: postTable,
        reset: resetTable,
        processing: tableProcessing,
    } = useForm({
        table_number: '',
        capacity: '4',
        location: 'Main Dining Room',
        notes: '',
    });

    // All products flattened or filtered
    const allProducts = useMemo(() => {
        const list: RestaurantProduct[] = [];
        categories.forEach((cat) => {
            if (cat.products) {
                cat.products.forEach((p) => list.push({ ...p, category: cat }));
            }
        });
        return list;
    }, [categories]);

    const filteredProducts = useMemo(() => {
        return allProducts.filter((product) => {
            const matchesCategory =
                selectedCategory === 'all' || product.category_id === selectedCategory;
            const matchesSearch =
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.code && product.code.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [allProducts, selectedCategory, searchQuery]);

    // Cart calculations
    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    }, [cart]);

    const tax = useMemo(() => {
        return Math.round(subtotal * 0.08 * 100) / 100; // 8% sales tax
    }, [subtotal]);

    const total = useMemo(() => {
        return Math.max(0, subtotal - discountAmount + tax);
    }, [subtotal, discountAmount, tax]);

    // Cart operations
    const addToCart = (product: RestaurantProduct) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product_id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [
                ...prev,
                {
                    product_id: product.id,
                    product_name: product.name,
                    quantity: 1,
                    unit_price: Number(product.price),
                },
            ];
        });
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.product_id === productId) {
                        const newQty = item.quantity + delta;
                        return newQty > 0 ? { ...item, quantity: newQty } : null;
                    }
                    return item;
                })
                .filter(Boolean) as CartItem[]
        );
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.product_id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setDiscountAmount(0);
        setOrderNotes('');
        setSelectedTableId('none');
    };

    // Submit Order
    const handleCheckout = (paymentMethod: 'cash' | 'card' | 'charge_to_room' | 'unpaid') => {
        if (cart.length === 0) return;

        const payload: any = {
            payment_method: paymentMethod,
            table_id: selectedTableId !== 'none' ? Number(selectedTableId) : null,
            discount: discountAmount,
            tax: tax,
            notes: orderNotes,
            items: cart.map((item) => ({
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                notes: item.notes || null,
            })),
        };

        if (paymentMethod === 'charge_to_room') {
            payload.reservation_id = Number(selectedReservationId);
        }

        router.post('/restaurant/order', payload, {
            onSuccess: () => {
                clearCart();
                setIsChargeToRoomOpen(false);
            },
        });
    };

    // Settle Order
    const handleSettle = (method: 'cash' | 'card') => {
        if (!settleOrderTarget) return;

        router.post(
            `/restaurant/orders/${settleOrderTarget.id}/settle`,
            { payment_method: method },
            {
                onSuccess: () => {
                    setSettleOrderTarget(null);
                },
            }
        );
    };

    const currency = hotel?.currency_symbol || '$';

    return (
        <AppLayout breadcrumbs={[{ title: 'Restaurant & POS', href: '/restaurant' }]}>
            <Head title="Restaurant & POS Terminal" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <UtensilsCrossed className="h-6 w-6 text-primary" /> Restaurant & POS Terminal
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Point of sale register, dining tables, kitchen orders, and guest room charge billing.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAddTableOpen(true)}
                        >
                            <Armchair className="h-4 w-4 mr-2" /> Add Table
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => setIsAddProductOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Menu Item
                        </Button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-border space-x-4">
                    <button
                        onClick={() => setActiveTab('pos')}
                        className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'pos'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <ShoppingBag className="h-4 w-4" /> POS Register
                    </button>
                    <button
                        onClick={() => setActiveTab('tables')}
                        className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'tables'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Armchair className="h-4 w-4" /> Tables Board ({tables.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'orders'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Clock className="h-4 w-4" /> Orders History ({orders.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'menu'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <SlidersHorizontal className="h-4 w-4" /> Menu Catalog ({allProducts.length})
                    </button>
                </div>

                {/* Tab 1: POS Register */}
                {activeTab === 'pos' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Catalog Section (7 Cols) */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                            {/* Search & Categories Bar */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search dish or beverage by name or code..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                <Button
                                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategory('all')}
                                    className="rounded-full text-xs"
                                >
                                    All Items
                                </Button>
                                {categories.map((category) => (
                                    <Button
                                        key={category.id}
                                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedCategory(category.id)}
                                        className="rounded-full text-xs shrink-0"
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            </div>

                            {/* Products Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {filteredProducts.map((product) => (
                                    <Card
                                        key={product.id}
                                        className="cursor-pointer hover:border-primary transition-all duration-200 shadow-sm flex flex-col justify-between"
                                        onClick={() => addToCart(product)}
                                    >
                                        <CardContent className="p-4 flex flex-col h-full justify-between gap-2">
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {product.code || 'ITEM'}
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                        {product.category?.name || 'Menu'}
                                                    </Badge>
                                                </div>
                                                <h4 className="font-semibold text-sm text-foreground line-clamp-2">
                                                    {product.name}
                                                </h4>
                                                {product.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                                                <span className="text-base font-bold text-primary">
                                                    {currency}{Number(product.price).toFixed(2)}
                                                </span>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-muted-foreground">
                                        <UtensilsCrossed className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                        <p>No menu items found matching "{searchQuery}".</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Active Cart / Ticket Section (5 Cols) */}
                        <div className="lg:col-span-5">
                            <Card className="sticky top-6 border shadow-md">
                                <CardHeader className="pb-3 border-b border-border">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Receipt className="h-5 w-5 text-primary" /> Active Ticket
                                            </CardTitle>
                                            <CardDescription>Order summary and guest checkout</CardDescription>
                                        </div>
                                        {cart.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearCart}
                                                className="text-destructive text-xs hover:bg-destructive/10"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>

                                    {/* Dining Table Selector */}
                                    <div className="mt-3 flex items-center gap-2">
                                        <Label className="text-xs text-muted-foreground shrink-0">Table / Mode:</Label>
                                        <Select
                                            value={selectedTableId}
                                            onValueChange={setSelectedTableId}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Select Table" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Takeout / Bar / Walk-in</SelectItem>
                                                {tables.map((t) => (
                                                    <SelectItem key={t.id} value={String(t.id)}>
                                                        Table {t.table_number} ({t.capacity} seats - {t.status})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 flex flex-col gap-4">
                                    {/* Cart Items List */}
                                    <div className="max-h-[300px] overflow-y-auto space-y-3 divide-y divide-border">
                                        {cart.map((item) => (
                                            <div key={item.product_id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {item.product_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {currency}{item.unit_price.toFixed(2)} each
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-6 w-6"
                                                        onClick={() => updateQuantity(item.product_id, -1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="text-xs font-semibold w-5 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-6 w-6"
                                                        onClick={() => updateQuantity(item.product_id, 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                <div className="text-right shrink-0 min-w-[60px]">
                                                    <span className="text-sm font-semibold">
                                                        {currency}{(item.quantity * item.unit_price).toFixed(2)}
                                                    </span>
                                                </div>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeFromCart(item.product_id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}

                                        {cart.length === 0 && (
                                            <div className="py-8 text-center text-muted-foreground text-sm">
                                                <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                                Your ticket is empty.
                                                <br />
                                                Click items from menu to add.
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Calculations */}
                                    {cart.length > 0 && (
                                        <div className="border-t border-border pt-3 space-y-2 text-sm">
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Subtotal</span>
                                                <span>{currency}{subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-muted-foreground">
                                                <span>Discount</span>
                                                <div className="flex items-center gap-1">
                                                    <span>- {currency}</span>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.5"
                                                        value={discountAmount || ''}
                                                        onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                                                        className="h-6 w-16 text-right text-xs p-1"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Tax (8% sales tax)</span>
                                                <span>{currency}{tax.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
                                                <span>Total Due</span>
                                                <span className="text-primary text-xl">
                                                    {currency}{total.toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Order Notes */}
                                            <div className="pt-2">
                                                <Input
                                                    placeholder="Kitchen notes (e.g. well-done, allergy)..."
                                                    value={orderNotes}
                                                    onChange={(e) => setOrderNotes(e.target.value)}
                                                    className="text-xs h-8"
                                                />
                                            </div>

                                            {/* Payment Options */}
                                            <div className="pt-3 flex flex-col gap-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button
                                                        variant="default"
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        onClick={() => handleCheckout('cash')}
                                                        disabled={orderProcessing}
                                                    >
                                                        <DollarSign className="h-4 w-4 mr-1" /> Cash
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                                        onClick={() => handleCheckout('card')}
                                                        disabled={orderProcessing}
                                                    >
                                                        <CreditCard className="h-4 w-4 mr-1" /> Card
                                                    </Button>
                                                </div>

                                                {/* Section 14 Charge to Room */}
                                                <Button
                                                    variant="secondary"
                                                    className="w-full border-primary/40 border bg-primary/10 hover:bg-primary/20 text-primary font-semibold"
                                                    onClick={() => setIsChargeToRoomOpen(true)}
                                                    disabled={orderProcessing}
                                                >
                                                    <BedDouble className="h-4 w-4 mr-2" /> Charge to Room Folio
                                                </Button>

                                                {selectedTableId !== 'none' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full text-xs text-muted-foreground"
                                                        onClick={() => handleCheckout('unpaid')}
                                                        disabled={orderProcessing}
                                                    >
                                                        Save to Table (Hold Unpaid)
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Tab 2: Tables Board */}
                {activeTab === 'tables' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {tables.map((table) => {
                                const isAvailable = table.status === 'available';
                                const isOccupied = table.status === 'occupied';

                                return (
                                    <Card
                                        key={table.id}
                                        className={`border-2 transition-all ${
                                            isAvailable
                                                ? 'border-emerald-500/40 bg-emerald-500/5'
                                                : isOccupied
                                                ? 'border-amber-500/50 bg-amber-500/5'
                                                : 'border-muted'
                                        }`}
                                    >
                                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                            <div className="flex items-center justify-between w-full">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] uppercase font-semibold ${
                                                        isAvailable
                                                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                                            : isOccupied
                                                            ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                                                            : 'border-border'
                                                    }`}
                                                >
                                                    {table.status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {table.capacity} Seats
                                                </span>
                                            </div>

                                            <Armchair className={`h-10 w-10 my-1 ${
                                                isAvailable ? 'text-emerald-500' : isOccupied ? 'text-amber-500' : 'text-muted-foreground'
                                            }`} />

                                            <h3 className="font-bold text-lg text-foreground">
                                                Table {table.table_number}
                                            </h3>

                                            <p className="text-xs text-muted-foreground">
                                                {table.location || 'Dining Floor'}
                                            </p>

                                            {isAvailable ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full text-xs mt-2"
                                                    onClick={() => {
                                                        setSelectedTableId(String(table.id));
                                                        setActiveTab('pos');
                                                    }}
                                                >
                                                    Open Order
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="w-full text-xs mt-2 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                                                    onClick={() => {
                                                        // Look up order for this table
                                                        const activeOrder = orders.data.find(
                                                            (o) => o.table_id === table.id && o.payment_status === 'unpaid'
                                                        );
                                                        if (activeOrder) {
                                                            setSettleOrderTarget(activeOrder);
                                                        } else {
                                                            setSelectedTableId(String(table.id));
                                                            setActiveTab('pos');
                                                        }
                                                    }}
                                                >
                                                    Settle / View
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tab 3: Orders History */}
                {activeTab === 'orders' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Restaurant Orders</CardTitle>
                            <CardDescription>View all completed, seated, and folio charged orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b text-xs font-semibold uppercase text-muted-foreground bg-muted/40">
                                        <tr>
                                            <th className="p-3">Order #</th>
                                            <th className="p-3">Location / Table</th>
                                            <th className="p-3">Items</th>
                                            <th className="p-3">Total Amount</th>
                                            <th className="p-3">Payment Method</th>
                                            <th className="p-3">Payment Status</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {orders.data.map((order) => (
                                            <tr key={order.id} className="hover:bg-muted/20">
                                                <td className="p-3 font-semibold text-foreground">
                                                    #{order.order_number}
                                                    <div className="text-xs text-muted-foreground font-normal">
                                                        {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    {order.table ? (
                                                        <Badge variant="outline">Table {order.table.table_number}</Badge>
                                                    ) : order.room ? (
                                                        <Badge variant="secondary">Room {order.room.room_number}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">Takeout / Counter</span>
                                                    )}
                                                </td>
                                                <td className="p-3 max-w-[200px] truncate text-muted-foreground text-xs">
                                                    {order.items?.map((item) => `${item.quantity}x ${item.product_name}`).join(', ')}
                                                </td>
                                                <td className="p-3 font-bold text-foreground">
                                                    {currency}{Number(order.total_amount).toFixed(2)}
                                                </td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant={order.payment_method === 'charge_to_room' ? 'default' : 'secondary'}
                                                        className="capitalize text-xs"
                                                    >
                                                        {order.payment_method.replace(/_/g, ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant={order.payment_status === 'paid' ? 'outline' : 'destructive'}
                                                        className={`capitalize text-xs ${
                                                            order.payment_status === 'paid' ? 'border-emerald-500 text-emerald-600' : ''
                                                        }`}
                                                    >
                                                        {order.payment_status}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs h-7"
                                                            onClick={() => setReceiptOrder(order)}
                                                        >
                                                            <Receipt className="h-3.5 w-3.5 mr-1" /> Receipt
                                                        </Button>
                                                        {order.payment_status === 'unpaid' ? (
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                className="text-xs h-7"
                                                                onClick={() => setSettleOrderTarget(order)}
                                                            >
                                                                Settle Bill
                                                            </Button>
                                                        ) : order.payment_method === 'charge_to_room' && order.reservation_id ? (
                                                            <Link
                                                                href={`/reservations/${order.reservation_id}`}
                                                                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                                            >
                                                                View Folio
                                                            </Link>
                                                        ) : (
                                                            <span className="text-xs text-emerald-600 flex items-center gap-1">
                                                                <CheckCircle2 className="h-3.5 w-3.5" /> Settled
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.data.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                                                    No restaurant orders recorded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tab 4: Menu Catalog */}
                {activeTab === 'menu' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Restaurant Menu Catalog</CardTitle>
                                <CardDescription>Manage food dishes, drinks, prices, and availability</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setIsAddProductOpen(true)}>
                                <Plus className="h-4 w-4 mr-1" /> New Item
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b text-xs font-semibold uppercase text-muted-foreground bg-muted/40">
                                        <tr>
                                            <th className="p-3">Code</th>
                                            <th className="p-3">Item Name</th>
                                            <th className="p-3">Category</th>
                                            <th className="p-3">Selling Price</th>
                                            <th className="p-3">Cost Price</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {allProducts.map((p) => (
                                            <tr key={p.id} className="hover:bg-muted/20">
                                                <td className="p-3 font-mono text-xs text-muted-foreground">
                                                    {p.code || '—'}
                                                </td>
                                                <td className="p-3 font-medium text-foreground">
                                                    {p.name}
                                                    {p.description && (
                                                        <div className="text-xs text-muted-foreground">{p.description}</div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant="outline">{p.category?.name || 'Menu'}</Badge>
                                                </td>
                                                <td className="p-3 font-semibold text-primary">
                                                    {currency}{Number(p.price).toFixed(2)}
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    {p.cost_price ? `${currency}${Number(p.cost_price).toFixed(2)}` : '—'}
                                                </td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant={p.is_available ? 'outline' : 'secondary'}
                                                        className={p.is_available ? 'border-emerald-500 text-emerald-600' : 'text-muted-foreground'}
                                                    >
                                                        {p.is_available ? 'Available' : 'Unavailable'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Modal: Charge to Room (Section 14) */}
            <Dialog open={isChargeToRoomOpen} onOpenChange={setIsChargeToRoomOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BedDouble className="h-5 w-5 text-primary" /> Charge to Guest Room Folio
                        </DialogTitle>
                        <DialogDescription>
                            Select currently checked-in guest room to post restaurant bill of{' '}
                            <span className="font-bold text-foreground">
                                {currency}{total.toFixed(2)}
                            </span>{' '}
                            directly into their hotel invoice.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {inHouseReservations.length > 0 ? (
                            <div className="space-y-2">
                                <Label>Select In-House Room & Guest</Label>
                                <Select
                                    value={selectedReservationId}
                                    onValueChange={setSelectedReservationId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {inHouseReservations.map((r) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                Room {r.room?.room_number || 'N/A'} — {r.guest?.first_name} {r.guest?.last_name} ({r.booking_number})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="p-4 rounded-md bg-amber-500/10 text-amber-600 text-sm">
                                No guests are currently checked in. Use Cash or Card payment instead.
                            </div>
                        )}

                        <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                            <div className="flex justify-between font-medium">
                                <span>Total Restaurant Charge:</span>
                                <span className="font-bold text-primary">{currency}{total.toFixed(2)}</span>
                            </div>
                            <p className="text-muted-foreground">
                                This will instantly create an itemized invoice entry on the guest folio, payable at checkout.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsChargeToRoomOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            disabled={inHouseReservations.length === 0 || orderProcessing}
                            onClick={() => handleCheckout('charge_to_room')}
                        >
                            Confirm & Charge to Folio
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Settle Bill */}
            <Dialog open={!!settleOrderTarget} onOpenChange={() => setSettleOrderTarget(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Settle Order #{settleOrderTarget?.order_number}</DialogTitle>
                        <DialogDescription>
                            Amount Due: <span className="font-bold text-foreground">{currency}{Number(settleOrderTarget?.total_amount || 0).toFixed(2)}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 py-4">
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white flex flex-col py-6 gap-1"
                            onClick={() => handleSettle('cash')}
                        >
                            <DollarSign className="h-5 w-5" />
                            <span>Cash</span>
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white flex flex-col py-6 gap-1"
                            onClick={() => handleSettle('card')}
                        >
                            <CreditCard className="h-5 w-5" />
                            <span>Card</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal: Add Menu Item */}
            <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogContent className="sm:max-w-md">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            postProduct('/restaurant/products', {
                                onSuccess: () => {
                                    setIsAddProductOpen(false);
                                    resetProduct();
                                },
                            });
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle>Add Menu Product</DialogTitle>
                            <DialogDescription>Add a new dish or drink item to the menu</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-3">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={productData.category_id}
                                    onValueChange={(val) => setProductData('category_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Dish / Item Name</Label>
                                <Input
                                    required
                                    value={productData.name}
                                    onChange={(e) => setProductData('name', e.target.value)}
                                    placeholder="e.g. Grilled Salmon"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Item Code</Label>
                                    <Input
                                        value={productData.code}
                                        onChange={(e) => setProductData('code', e.target.value)}
                                        placeholder="e.g. SLMN-01"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Selling Price ({currency})</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={productData.price}
                                        onChange={(e) => setProductData('price', e.target.value)}
                                        placeholder="18.50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={productData.description}
                                    onChange={(e) => setProductData('description', e.target.value)}
                                    placeholder="Brief ingredients or description"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddProductOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={productProcessing}>
                                Create Menu Item
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Add Dining Table */}
            <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
                <DialogContent className="sm:max-w-md">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            postTable('/restaurant/tables', {
                                onSuccess: () => {
                                    setIsAddTableOpen(false);
                                    resetTable();
                                },
                            });
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle>Add Dining Table</DialogTitle>
                            <DialogDescription>Register a new table in the restaurant floor plan</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Table Number / Code</Label>
                                    <Input
                                        required
                                        value={tableData.table_number}
                                        onChange={(e) => setTableData('table_number', e.target.value)}
                                        placeholder="e.g. T-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Seat Capacity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        required
                                        value={tableData.capacity}
                                        onChange={(e) => setTableData('capacity', e.target.value)}
                                        placeholder="4"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Location / Section</Label>
                                <Input
                                    value={tableData.location}
                                    onChange={(e) => setTableData('location', e.target.value)}
                                    placeholder="e.g. Outdoor Terrace / Main Dining"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddTableOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={tableProcessing}>
                                Add Table
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Thermal POS Receipt */}
            <Dialog open={!!receiptOrder} onOpenChange={() => setReceiptOrder(null)}>
                <DialogContent className="sm:max-w-sm p-6 print:p-0 print:border-none">
                    <DialogHeader className="print:hidden">
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-primary" /> Guest POS Receipt
                        </DialogTitle>
                        <DialogDescription>Customer dining receipt</DialogDescription>
                    </DialogHeader>

                    {receiptOrder && (
                        <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-4 border rounded-md font-mono text-xs shadow-inner">
                            {/* Receipt Header */}
                            <div className="text-center border-b pb-3 mb-3 border-dashed">
                                <h3 className="font-bold text-sm tracking-wider uppercase">{hotel?.name || 'Grand Horizon Hotel'}</h3>
                                <p className="text-[11px] text-muted-foreground">{hotel?.address || '100 Ocean Blvd'}</p>
                                <p className="text-[11px] text-muted-foreground">Tel: {hotel?.phone || '+1 555-0100'}</p>
                                {hotel?.tax_number && <p className="text-[11px] text-muted-foreground">Tax ID: {hotel.tax_number}</p>}
                            </div>

                            {/* Receipt Meta */}
                            <div className="border-b pb-2 mb-2 border-dashed space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                    <span>Order #:</span>
                                    <span className="font-bold">#{receiptOrder.order_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Date:</span>
                                    <span>{receiptOrder.created_at ? new Date(receiptOrder.created_at).toLocaleString() : ''}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Location:</span>
                                    <span>{receiptOrder.table ? `Table ${receiptOrder.table.table_number}` : (receiptOrder.room ? `Room ${receiptOrder.room.room_number}` : 'Takeout')}</span>
                                </div>
                                {receiptOrder.server && (
                                    <div className="flex justify-between">
                                        <span>Server:</span>
                                        <span>{receiptOrder.server.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Itemized List */}
                            <div className="border-b pb-2 mb-2 border-dashed">
                                <div className="grid grid-cols-12 font-bold mb-1 text-[10px] uppercase text-muted-foreground">
                                    <span className="col-span-6">Item</span>
                                    <span className="col-span-2 text-center">Qty</span>
                                    <span className="col-span-4 text-right">Price</span>
                                </div>
                                <div className="space-y-1">
                                    {receiptOrder.items?.map((item) => (
                                        <div key={item.id} className="grid grid-cols-12 text-[11px]">
                                            <span className="col-span-6 truncate font-medium">{item.product_name}</span>
                                            <span className="col-span-2 text-center">{Number(item.quantity)}</span>
                                            <span className="col-span-4 text-right">{currency}{Number(item.total_price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="space-y-1 text-[11px] border-b pb-2 mb-2 border-dashed">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{currency}{Number(receiptOrder.subtotal).toFixed(2)}</span>
                                </div>
                                {Number(receiptOrder.discount) > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Discount:</span>
                                        <span>-{currency}{Number(receiptOrder.discount).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Tax (8%):</span>
                                    <span>{currency}{Number(receiptOrder.tax).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold pt-1 border-t border-dashed">
                                    <span>TOTAL:</span>
                                    <span>{currency}{Number(receiptOrder.total_amount).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment info */}
                            <div className="text-[11px] space-y-1">
                                <div className="flex justify-between">
                                    <span>Payment Method:</span>
                                    <span className="uppercase font-semibold">{receiptOrder.payment_method.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span className="uppercase font-bold text-emerald-600">{receiptOrder.payment_status}</span>
                                </div>
                            </div>

                            <div className="text-center pt-3 text-[10px] text-muted-foreground border-t mt-3 border-dashed">
                                Thank you for dining with us!<br />
                                Have a wonderful stay.
                            </div>
                        </div>
                    )}

                    <DialogFooter className="print:hidden">
                        <Button variant="outline" onClick={() => setReceiptOrder(null)}>
                            Close
                        </Button>
                        <Button variant="default" onClick={() => window.print()}>
                            <Printer className="h-4 w-4 mr-1.5" /> Print Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
