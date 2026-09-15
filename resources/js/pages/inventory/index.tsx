import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Boxes,
    AlertTriangle,
    Plus,
    Truck,
    ArrowDownRight,
    ArrowUpRight,
    RefreshCw,
    Search,
    CheckCircle2,
    Clock,
    FileText,
    Building,
    SlidersHorizontal,
    PackageCheck,
    Trash2,
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
    InventoryItem,
    InventoryTransaction,
    Purchase,
    Supplier,
} from '@/types';

type InventoryProps = {
    hotel?: Hotel | null;
    items: InventoryItem[];
    lowStockCount: number;
    transactions: {
        data: InventoryTransaction[];
        links: any[];
        total: number;
    };
    suppliers: Supplier[];
    purchases: {
        data: Purchase[];
        links: any[];
        total: number;
    };
};

export default function InventoryIndex({
    hotel,
    items,
    lowStockCount,
    transactions,
    suppliers,
    purchases,
}: InventoryProps) {
    const [activeTab, setActiveTab] = useState<'items' | 'transactions' | 'purchases' | 'suppliers'>('items');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Modals
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [isStockMovementOpen, setIsStockMovementOpen] = useState(false);
    const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
    const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);

    // Selected item for quick stock movement
    const [selectedItemForMove, setSelectedItemForMove] = useState<InventoryItem | null>(null);

    // Forms
    const {
        data: itemData,
        setData: setItemData,
        post: postItem,
        reset: resetItem,
        processing: itemProcessing,
    } = useForm({
        name: '',
        sku: '',
        category: 'linens',
        unit: 'pcs',
        purchase_price: '',
        selling_price: '',
        opening_stock: '0',
        minimum_stock: '10',
        supplier_id: suppliers[0]?.id ? String(suppliers[0].id) : '',
        notes: '',
    });

    const {
        data: movementData,
        setData: setMovementData,
        post: postMovement,
        reset: resetMovement,
        processing: movementProcessing,
    } = useForm({
        inventory_item_id: items[0]?.id ? String(items[0].id) : '',
        transaction_type: 'stock_in',
        quantity: '1',
        unit_price: '',
        department: 'Housekeeping',
        reference_number: '',
        notes: '',
    });

    const {
        data: supplierData,
        setData: setSupplierData,
        post: postSupplier,
        reset: resetSupplier,
        processing: supplierProcessing,
    } = useForm({
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        tax_number: '',
        payment_terms: 'Net 30',
        notes: '',
    });

    // Purchase Order creation state
    const [poSupplierId, setPoSupplierId] = useState<string>(suppliers[0]?.id ? String(suppliers[0].id) : '');
    const [poLines, setPoLines] = useState<Array<{ inventory_item_id: number; item_name: string; quantity: number; unit_cost: number }>>([]);
    const [poDate, setPoDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [poNotes, setPoNotes] = useState<string>('');

    // Filtered Items
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.sku.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [items, selectedCategory, searchQuery]);

    const currency = hotel?.currency_symbol || '$';

    const handleCreateItem = (e: React.FormEvent) => {
        e.preventDefault();
        postItem('/inventory/items', {
            onSuccess: () => {
                setIsAddItemOpen(false);
                resetItem();
            },
        });
    };

    const handleCreateMovement = (e: React.FormEvent) => {
        e.preventDefault();
        postMovement('/inventory/transactions', {
            onSuccess: () => {
                setIsStockMovementOpen(false);
                resetMovement();
                setSelectedItemForMove(null);
            },
        });
    };

    const handleCreateSupplier = (e: React.FormEvent) => {
        e.preventDefault();
        postSupplier('/inventory/suppliers', {
            onSuccess: () => {
                setIsAddSupplierOpen(false);
                resetSupplier();
            },
        });
    };

    const handleAddPoLine = () => {
        if (items.length === 0) return;
        const first = items[0];
        setPoLines([
            ...poLines,
            {
                inventory_item_id: first.id,
                item_name: first.name,
                quantity: 10,
                unit_cost: Number(first.purchase_price),
            },
        ]);
    };

    const handlePoItemChange = (index: number, itemId: number) => {
        const found = items.find((i) => i.id === itemId);
        if (!found) return;
        const updated = [...poLines];
        updated[index].inventory_item_id = found.id;
        updated[index].item_name = found.name;
        updated[index].unit_cost = Number(found.purchase_price);
        setPoLines(updated);
    };

    const handlePoQtyChange = (index: number, qty: number) => {
        const updated = [...poLines];
        updated[index].quantity = qty;
        setPoLines(updated);
    };

    const handlePoCostChange = (index: number, cost: number) => {
        const updated = [...poLines];
        updated[index].unit_cost = cost;
        setPoLines(updated);
    };

    const handleRemovePoLine = (index: number) => {
        setPoLines(poLines.filter((_, i) => i !== index));
    };

    const handleCreatePO = (e: React.FormEvent) => {
        e.preventDefault();
        if (poLines.length === 0) return;

        router.post(
            '/inventory/purchases',
            {
                supplier_id: Number(poSupplierId),
                purchase_date: poDate,
                notes: poNotes,
                items: poLines,
            },
            {
                onSuccess: () => {
                    setIsCreatePOOpen(false);
                    setPoLines([]);
                    setPoNotes('');
                },
            }
        );
    };

    const handleReceivePO = (purchaseId: number) => {
        router.post(`/inventory/purchases/${purchaseId}/receive`);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Inventory & Supplies', href: '/inventory' }]}>
            <Head title="Inventory & Supplies" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Boxes className="h-6 w-6 text-primary" /> Inventory & Hotel Supplies
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage linens, toiletries, food & beverage stock, suppliers, purchase orders, and adjustments.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setMovementData('inventory_item_id', items[0]?.id ? String(items[0].id) : '');
                                setMovementData('quantity', '1');
                                setIsStockMovementOpen(true);
                            }}
                        >
                            <RefreshCw className="h-4 w-4 mr-1.5" /> Stock Movement
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                handleAddPoLine();
                                setIsCreatePOOpen(true);
                            }}
                        >
                            <Truck className="h-4 w-4 mr-1.5" /> New Purchase Order
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => setIsAddItemOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> New Stock Item
                        </Button>
                    </div>
                </div>

                {/* Stat Counters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Tracked Items</CardDescription>
                            <CardTitle className="text-2xl font-bold">{items.length}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-xs text-muted-foreground">Across all hotel departments</span>
                        </CardContent>
                    </Card>

                    <Card className={lowStockCount > 0 ? 'border-amber-500/50 bg-amber-500/5' : ''}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>Low Stock Alerts</CardDescription>
                                {lowStockCount > 0 && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                            </div>
                            <CardTitle className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                                {lowStockCount}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-xs text-muted-foreground">
                                {lowStockCount > 0 ? 'Urgent reordering needed' : 'All stock levels healthy'}
                            </span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Registered Suppliers</CardDescription>
                            <CardTitle className="text-2xl font-bold">{suppliers.length}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-xs text-muted-foreground">Active supply chain vendors</span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Purchase Orders</CardDescription>
                            <CardTitle className="text-2xl font-bold">{purchases.total}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-xs text-muted-foreground">PO procurement orders</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border space-x-4">
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'items'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Boxes className="h-4 w-4" /> Stock Items ({items.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'transactions'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <RefreshCw className="h-4 w-4" /> Stock Movements ({transactions.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('purchases')}
                        className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'purchases'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Truck className="h-4 w-4" /> Purchase Orders ({purchases.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('suppliers')}
                        className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'suppliers'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Building className="h-4 w-4" /> Suppliers ({suppliers.length})
                    </button>
                </div>

                {/* Tab 1: Stock Items */}
                {activeTab === 'items' && (
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by SKU or item name..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
                                {['all', 'linens', 'toiletries', 'food_beverage', 'cleaning', 'maintenance', 'office'].map((cat) => (
                                    <Button
                                        key={cat}
                                        variant={selectedCategory === cat ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedCategory(cat)}
                                        className="text-xs capitalize rounded-full"
                                    >
                                        {cat.replace(/_/g, ' ')}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Items Table */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b text-xs font-semibold uppercase text-muted-foreground bg-muted/40">
                                            <tr>
                                                <th className="p-3">SKU</th>
                                                <th className="p-3">Item Name</th>
                                                <th className="p-3">Category</th>
                                                <th className="p-3">Purchase Cost</th>
                                                <th className="p-3">Current Stock</th>
                                                <th className="p-3">Min Alert</th>
                                                <th className="p-3">Supplier</th>
                                                <th className="p-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredItems.map((item) => {
                                                const isLow = Number(item.current_stock) <= Number(item.minimum_stock);

                                                return (
                                                    <tr key={item.id} className={`hover:bg-muted/20 ${isLow ? 'bg-amber-500/5' : ''}`}>
                                                        <td className="p-3 font-mono text-xs font-semibold text-foreground">
                                                            {item.sku}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="font-medium text-foreground">{item.name}</div>
                                                            {item.notes && <div className="text-xs text-muted-foreground">{item.notes}</div>}
                                                        </td>
                                                        <td className="p-3">
                                                            <Badge variant="outline" className="capitalize text-xs">
                                                                {item.category.replace(/_/g, ' ')}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3 text-muted-foreground">
                                                            {currency}{Number(item.purchase_price).toFixed(2)} / {item.unit}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-bold ${isLow ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                                                                    {Number(item.current_stock)} {item.unit}
                                                                </span>
                                                                {isLow && (
                                                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                                                        Low Stock
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-muted-foreground text-xs">
                                                            {Number(item.minimum_stock)} {item.unit}
                                                        </td>
                                                        <td className="p-3 text-xs text-muted-foreground">
                                                            {item.supplier?.company_name || '—'}
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-xs h-7"
                                                                onClick={() => {
                                                                    setSelectedItemForMove(item);
                                                                    setMovementData('inventory_item_id', String(item.id));
                                                                    setMovementData('quantity', '1');
                                                                    setIsStockMovementOpen(true);
                                                                }}
                                                            >
                                                                Move / Adjust
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {filteredItems.length === 0 && (
                                                <tr>
                                                    <td colSpan={8} className="p-6 text-center text-muted-foreground">
                                                        No inventory items match your filter.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tab 2: Stock Movements History */}
                {activeTab === 'transactions' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Inventory Stock Log</CardTitle>
                            <CardDescription>Audited movements: Stock In, Stock Out, Waste, Adjustments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b text-xs font-semibold uppercase text-muted-foreground bg-muted/40">
                                        <tr>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Item</th>
                                            <th className="p-3">Movement Type</th>
                                            <th className="p-3">Quantity</th>
                                            <th className="p-3">Department</th>
                                            <th className="p-3">Ref / Notes</th>
                                            <th className="p-3">Logged By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {transactions.data.map((tx) => {
                                            const isIncrease = ['stock_in', 'purchase', 'return'].includes(tx.transaction_type);
                                            const isDecrease = ['stock_out', 'waste'].includes(tx.transaction_type);

                                            return (
                                                <tr key={tx.id} className="hover:bg-muted/20">
                                                    <td className="p-3 text-xs text-muted-foreground">
                                                        {tx.created_at ? new Date(tx.created_at).toLocaleString() : '—'}
                                                    </td>
                                                    <td className="p-3 font-medium text-foreground">
                                                        {tx.inventory_item?.name || 'Item'}
                                                        <span className="text-xs text-muted-foreground block font-mono">
                                                            {tx.inventory_item?.sku}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge
                                                            variant="outline"
                                                            className={`capitalize text-xs ${
                                                                isIncrease
                                                                    ? 'border-emerald-500 text-emerald-600'
                                                                    : isDecrease
                                                                    ? 'border-rose-500 text-rose-600'
                                                                    : 'border-blue-500 text-blue-600'
                                                            }`}
                                                        >
                                                            {tx.transaction_type.replace(/_/g, ' ')}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 font-semibold">
                                                        <span className={isIncrease ? 'text-emerald-600' : isDecrease ? 'text-rose-600' : ''}>
                                                            {isIncrease ? '+' : isDecrease ? '-' : ''}
                                                            {Number(tx.quantity)} {tx.inventory_item?.unit || ''}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-xs text-muted-foreground">
                                                        {tx.department || '—'}
                                                    </td>
                                                    <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">
                                                        {tx.reference_number && <span className="font-mono mr-1">[{tx.reference_number}]</span>}
                                                        {tx.notes || '—'}
                                                    </td>
                                                    <td className="p-3 text-xs text-muted-foreground">
                                                        {tx.user?.name || 'System'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {transactions.data.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                                                    No stock transactions recorded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tab 3: Purchase Orders */}
                {activeTab === 'purchases' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Procurement & Purchase Orders</CardTitle>
                                <CardDescription>Orders placed with suppliers. Mark received to automatically replenish stock.</CardDescription>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => {
                                    handleAddPoLine();
                                    setIsCreatePOOpen(true);
                                }}
                            >
                                <Plus className="h-4 w-4 mr-1" /> New Purchase Order
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b text-xs font-semibold uppercase text-muted-foreground bg-muted/40">
                                        <tr>
                                            <th className="p-3">PO Number</th>
                                            <th className="p-3">Supplier</th>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Items</th>
                                            <th className="p-3">Total Amount</th>
                                            <th className="p-3">PO Status</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {purchases.data.map((po) => (
                                            <tr key={po.id} className="hover:bg-muted/20">
                                                <td className="p-3 font-mono font-semibold text-foreground">
                                                    #{po.purchase_number}
                                                </td>
                                                <td className="p-3 font-medium text-foreground">
                                                    {po.supplier?.company_name || 'Vendor'}
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground">
                                                    {po.purchase_date}
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">
                                                    {po.items?.map((item) => `${item.quantity}x ${item.item_name}`).join(', ')}
                                                </td>
                                                <td className="p-3 font-bold text-foreground">
                                                    {currency}{Number(po.total_amount).toFixed(2)}
                                                </td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant={po.status === 'received' ? 'outline' : 'secondary'}
                                                        className={`capitalize text-xs ${
                                                            po.status === 'received' ? 'border-emerald-500 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                                        }`}
                                                    >
                                                        {po.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-right">
                                                    {po.status === 'ordered' ? (
                                                        <Button
                                                            size="sm"
                                                            className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            onClick={() => handleReceivePO(po.id)}
                                                        >
                                                            <PackageCheck className="h-3.5 w-3.5 mr-1" /> Mark Received
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-emerald-600 flex items-center justify-end gap-1">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Stocked
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {purchases.data.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                                                    No purchase orders found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tab 4: Suppliers Directory */}
                {activeTab === 'suppliers' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Hotel Suppliers & Vendors</CardTitle>
                                <CardDescription>Supply chain partners and payment terms</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setIsAddSupplierOpen(true)}>
                                <Plus className="h-4 w-4 mr-1" /> Add Supplier
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b text-xs font-semibold uppercase text-muted-foreground bg-muted/40">
                                        <tr>
                                            <th className="p-3">Company Name</th>
                                            <th className="p-3">Contact Person</th>
                                            <th className="p-3">Phone & Email</th>
                                            <th className="p-3">Address</th>
                                            <th className="p-3">Payment Terms</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {suppliers.map((sup) => (
                                            <tr key={sup.id} className="hover:bg-muted/20">
                                                <td className="p-3 font-semibold text-foreground">
                                                    {sup.company_name}
                                                    {sup.tax_number && (
                                                        <span className="text-xs text-muted-foreground block font-mono">
                                                            Tax ID: {sup.tax_number}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    {sup.contact_person || '—'}
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground">
                                                    <div>{sup.phone || '—'}</div>
                                                    <div>{sup.email || ''}</div>
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">
                                                    {sup.address || '—'}
                                                </td>
                                                <td className="p-3 text-xs font-medium">
                                                    {sup.payment_terms || 'Net 30'}
                                                </td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="capitalize border-emerald-500 text-emerald-600 text-xs"
                                                    >
                                                        {sup.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        {suppliers.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                                                    No suppliers registered yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Modal: New Stock Item */}
            <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleCreateItem}>
                        <DialogHeader>
                            <DialogTitle>Add New Stock Item</DialogTitle>
                            <DialogDescription>Register a new supply SKU in hotel inventory</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Item Name</Label>
                                    <Input
                                        required
                                        value={itemData.name}
                                        onChange={(e) => setItemData('name', e.target.value)}
                                        placeholder="e.g. Bath Towel 700 GSM"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>SKU / Code</Label>
                                    <Input
                                        required
                                        value={itemData.sku}
                                        onChange={(e) => setItemData('sku', e.target.value)}
                                        placeholder="e.g. LIN-003"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={itemData.category}
                                        onValueChange={(val) => setItemData('category', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="linens">Linens & Towels</SelectItem>
                                            <SelectItem value="toiletries">Toiletries & Amenities</SelectItem>
                                            <SelectItem value="food_beverage">Food & Beverage</SelectItem>
                                            <SelectItem value="cleaning">Cleaning Supplies</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="office">Office Supplies</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Unit of Measure</Label>
                                    <Select
                                        value={itemData.unit}
                                        onValueChange={(val) => setItemData('unit', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                                            <SelectItem value="bottle">Bottle</SelectItem>
                                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                            <SelectItem value="box">Box</SelectItem>
                                            <SelectItem value="set">Set</SelectItem>
                                            <SelectItem value="liter">Liters</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Purchase Cost ({currency})</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={itemData.purchase_price}
                                        onChange={(e) => setItemData('purchase_price', e.target.value)}
                                        placeholder="12.50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Min Stock Alert Threshold</Label>
                                    <Input
                                        type="number"
                                        required
                                        value={itemData.minimum_stock}
                                        onChange={(e) => setItemData('minimum_stock', e.target.value)}
                                        placeholder="10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Opening Stock</Label>
                                    <Input
                                        type="number"
                                        required
                                        value={itemData.opening_stock}
                                        onChange={(e) => setItemData('opening_stock', e.target.value)}
                                        placeholder="50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Supplier (Optional)</Label>
                                    <Select
                                        value={itemData.supplier_id}
                                        onValueChange={(val) => setItemData('supplier_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Vendor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map((s) => (
                                                <SelectItem key={s.id} value={String(s.id)}>
                                                    {s.company_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddItemOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={itemProcessing}>
                                Create Item
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Stock Movement */}
            <Dialog open={isStockMovementOpen} onOpenChange={setIsStockMovementOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleCreateMovement}>
                        <DialogHeader>
                            <DialogTitle>Record Stock Movement</DialogTitle>
                            <DialogDescription>
                                Track stock receipt, department issuance, wastage, or physical audit adjustment
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-3">
                            <div className="space-y-2">
                                <Label>Item</Label>
                                <Select
                                    value={movementData.inventory_item_id}
                                    onValueChange={(val) => setMovementData('inventory_item_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select stock item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {items.map((i) => (
                                            <SelectItem key={i.id} value={String(i.id)}>
                                                {i.name} ({i.sku}) — Stock: {i.current_stock} {i.unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Movement Type</Label>
                                    <Select
                                        value={movementData.transaction_type}
                                        onValueChange={(val) => setMovementData('transaction_type', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="stock_in">Stock In (Receipt)</SelectItem>
                                            <SelectItem value="stock_out">Stock Out (Dispatch)</SelectItem>
                                            <SelectItem value="waste">Waste / Damaged</SelectItem>
                                            <SelectItem value="adjustment">Count Adjustment</SelectItem>
                                            <SelectItem value="return">Return to Vendor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        required
                                        value={movementData.quantity}
                                        onChange={(e) => setMovementData('quantity', e.target.value)}
                                        placeholder="1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Issuing Department</Label>
                                    <Select
                                        value={movementData.department}
                                        onValueChange={(val) => setMovementData('department', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                                            <SelectItem value="Restaurant">Restaurant</SelectItem>
                                            <SelectItem value="Kitchen">Kitchen</SelectItem>
                                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                                            <SelectItem value="Front Desk">Front Desk</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ref / PO Number</Label>
                                    <Input
                                        value={movementData.reference_number}
                                        onChange={(e) => setMovementData('reference_number', e.target.value)}
                                        placeholder="e.g. ADJ-001"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Notes / Reason</Label>
                                <Input
                                    value={movementData.notes}
                                    onChange={(e) => setMovementData('notes', e.target.value)}
                                    placeholder="e.g. Restocking floor 2 linens closet"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsStockMovementOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={movementProcessing}>
                                Confirm Movement
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: New Purchase Order */}
            <Dialog open={isCreatePOOpen} onOpenChange={setIsCreatePOOpen}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleCreatePO}>
                        <DialogHeader>
                            <DialogTitle>Create Purchase Order (PO)</DialogTitle>
                            <DialogDescription>Place restocking order with an authorized vendor</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Vendor / Supplier</Label>
                                    <Select
                                        value={poSupplierId}
                                        onValueChange={setPoSupplierId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select vendor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map((s) => (
                                                <SelectItem key={s.id} value={String(s.id)}>
                                                    {s.company_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Order Date</Label>
                                    <Input
                                        type="date"
                                        required
                                        value={poDate}
                                        onChange={(e) => setPoDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* PO Line Items */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Order Items</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleAddPoLine}
                                        className="text-xs h-7 text-primary"
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Add Line
                                    </Button>
                                </div>

                                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                                    {poLines.map((line, idx) => (
                                        <div key={idx} className="flex items-center gap-2 border p-2 rounded-md bg-muted/20">
                                            <div className="flex-1">
                                                <Select
                                                    value={String(line.inventory_item_id)}
                                                    onValueChange={(val) => handlePoItemChange(idx, Number(val))}
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {items.map((i) => (
                                                            <SelectItem key={i.id} value={String(i.id)}>
                                                                {i.name} ({i.sku})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="w-16">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    className="h-8 text-xs text-center"
                                                    value={line.quantity}
                                                    onChange={(e) => handlePoQtyChange(idx, Number(e.target.value) || 1)}
                                                />
                                            </div>

                                            <div className="w-20">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    className="h-8 text-xs text-right"
                                                    value={line.unit_cost}
                                                    onChange={(e) => handlePoCostChange(idx, Number(e.target.value) || 0)}
                                                />
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleRemovePoLine(idx)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Notes / Delivery Instructions</Label>
                                <Input
                                    value={poNotes}
                                    onChange={(e) => setPoNotes(e.target.value)}
                                    placeholder="e.g. Deliver to loading dock B"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreatePOOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={poLines.length === 0}>
                                Create PO
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Add Supplier */}
            <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleCreateSupplier}>
                        <DialogHeader>
                            <DialogTitle>Register New Supplier</DialogTitle>
                            <DialogDescription>Add a vendor or contractor to the directory</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-3">
                            <div className="space-y-2">
                                <Label>Company Name</Label>
                                <Input
                                    required
                                    value={supplierData.company_name}
                                    onChange={(e) => setSupplierData('company_name', e.target.value)}
                                    placeholder="e.g. Metro Linen Services"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Contact Person</Label>
                                    <Input
                                        value={supplierData.contact_person}
                                        onChange={(e) => setSupplierData('contact_person', e.target.value)}
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={supplierData.phone}
                                        onChange={(e) => setSupplierData('phone', e.target.value)}
                                        placeholder="+1 555-0199"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={supplierData.email}
                                        onChange={(e) => setSupplierData('email', e.target.value)}
                                        placeholder="orders@vendor.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Payment Terms</Label>
                                    <Input
                                        value={supplierData.payment_terms}
                                        onChange={(e) => setSupplierData('payment_terms', e.target.value)}
                                        placeholder="e.g. Net 30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input
                                    value={supplierData.address}
                                    onChange={(e) => setSupplierData('address', e.target.value)}
                                    placeholder="City, State"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddSupplierOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={supplierProcessing}>
                                Add Supplier
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
