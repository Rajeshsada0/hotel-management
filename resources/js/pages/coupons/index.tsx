import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Ticket, Plus, Search, CheckCircle, XCircle, Percent, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PageHero } from '@/components/page-hero';
import { StatCard } from '@/components/stat-card';
import type { BreadcrumbItem, Coupon, Hotel } from '@/types';

interface Props {
    coupons: {
        data: Coupon[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Coupons & Promos', href: '/coupons' },
];

export default function CouponsIndex({ coupons, filters }: Props) {
    const { hotel } = usePage<{ hotel?: Hotel }>().props;
    const currency = hotel?.currency_symbol ?? '$';

    const [search, setSearch] = useState(filters.search ?? '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form state
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [value, setValue] = useState('');
    const [minSpend, setMinSpend] = useState('');
    const [maxDiscount, setMaxDiscount] = useState('');
    const [validFrom, setValidFrom] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [usageLimit, setUsageLimit] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/coupons', { search }, { preserveState: true });
    };

    const handleToggle = (coupon: Coupon) => {
        router.patch(`/coupons/${coupon.id}/toggle`, {}, { preserveScroll: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/coupons', {
            code,
            name,
            description,
            discount_type: discountType,
            value: parseFloat(value) || 0,
            min_spend: minSpend ? parseFloat(minSpend) : 0,
            max_discount: maxDiscount ? parseFloat(maxDiscount) : null,
            valid_from: validFrom || null,
            valid_until: validUntil || null,
            usage_limit: usageLimit ? parseInt(usageLimit) : null,
        }, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setCode('');
                setName('');
                setDescription('');
                setValue('');
                setMinSpend('');
                setMaxDiscount('');
                setValidFrom('');
                setValidUntil('');
                setUsageLimit('');
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Coupons & Promotional Discounts" />

            <div className="flex flex-col gap-6 p-6">
                {/* Hero Banner */}
                <PageHero
                    badge="Promotions & Marketing"
                    badgeIcon={Ticket}
                    title="Coupons & Promotional Discounts"
                    description="Create and manage percentage and fixed discount coupons for front desk and online guest reservations."
                >
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shrink-0 bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium">
                        <Plus className="h-4 w-4" />
                        Create Coupon
                    </Button>
                </PageHero>

                {/* KPI Stat Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        title="Total Coupons"
                        value={coupons.total}
                        subtitle="Registered discount codes"
                        icon={Ticket}
                        color="blue"
                    />
                    <StatCard
                        title="Active Promos"
                        value={coupons.data.filter((c) => c.is_active).length}
                        subtitle="Currently redeemable"
                        icon={CheckCircle}
                        color="emerald"
                    />
                    <StatCard
                        title="Percentage Codes"
                        value={coupons.data.filter((c) => c.discount_type === 'percentage').length}
                        subtitle="% Off rate discounts"
                        icon={Percent}
                        color="purple"
                    />
                    <StatCard
                        title="Fixed Discounts"
                        value={coupons.data.filter((c) => c.discount_type === 'fixed').length}
                        subtitle="Flat cash reduction"
                        icon={DollarSign}
                        color="amber"
                    />
                </div>

                {/* Filter and search */}
                <Card className="rounded-xl border border-border/60 shadow-sm bg-card">
                    <CardContent className="pt-5 pb-5">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by coupon code or campaign name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 bg-muted/30"
                                />
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium">Filter</Button>
                                {filters.search && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setSearch('');
                                            router.get('/coupons');
                                        }}
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Coupons Table */}
                <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b text-xs font-semibold uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3.5">Code</th>
                                    <th className="px-6 py-3.5">Discount</th>
                                    <th className="px-6 py-3.5">Restrictions</th>
                                    <th className="px-6 py-3.5">Validity</th>
                                    <th className="px-6 py-3.5">Usage</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {coupons.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Ticket className="h-8 w-8 text-muted-foreground/50" />
                                                <p className="font-medium">No coupons found</p>
                                                <p className="text-xs">Create your first promo code to attract more bookings.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    coupons.data.map((coupon) => (
                                        <tr key={coupon.id} className="hover:bg-muted/30 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                                        {coupon.code}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-foreground font-medium mt-1">
                                                    {coupon.name}
                                                </div>
                                                {coupon.description && (
                                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                                        {coupon.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                                    {coupon.discount_type === 'percentage' ? (
                                                        <>
                                                            <Percent className="h-4 w-4 text-emerald-600" />
                                                            <span>{coupon.value}% OFF</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DollarSign className="h-4 w-4 text-emerald-600" />
                                                            <span>{currency}{Number(coupon.value).toFixed(2)} OFF</span>
                                                        </>
                                                    )}
                                                </div>
                                                {coupon.max_discount && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Max: {currency}{Number(coupon.max_discount).toFixed(2)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-muted-foreground">
                                                {Number(coupon.min_spend) > 0 ? (
                                                    <span>Min spend: {currency}{Number(coupon.min_spend).toFixed(2)}</span>
                                                ) : (
                                                    <span>No min spend</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-muted-foreground">
                                                {coupon.valid_from || coupon.valid_until ? (
                                                    <div className="space-y-0.5">
                                                        {coupon.valid_from && <div>From: {coupon.valid_from}</div>}
                                                        {coupon.valid_until && <div>Until: {coupon.valid_until}</div>}
                                                    </div>
                                                ) : (
                                                    <span>Always valid</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                <span className="font-semibold text-foreground">{coupon.used_count}</span>
                                                <span className="text-muted-foreground">
                                                    {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' / ∞'} uses
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {coupon.is_active ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                        <CheckCircle className="h-3 w-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                                        <XCircle className="h-3 w-3" /> Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggle(coupon)}
                                                >
                                                    {coupon.is_active ? 'Deactivate' : 'Activate'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Coupon Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-primary" />
                                Create Promotional Coupon
                            </DialogTitle>
                            <DialogDescription>
                                Set up a promo code that guests and staff can apply for instant reservation discounts.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="code">Coupon Code *</Label>
                                    <Input
                                        id="code"
                                        placeholder="e.g. SUMMER25"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        required
                                        className="font-mono uppercase font-bold"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="discountType">Discount Type *</Label>
                                    <select
                                        id="discountType"
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ({currency})</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="name">Campaign Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Summer Season Special"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="value">
                                        Discount Value * {discountType === 'percentage' ? '(%)' : `(${currency})`}
                                    </Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder={discountType === 'percentage' ? '15' : '50'}
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="minSpend">Minimum Spend ({currency})</Label>
                                    <Input
                                        id="minSpend"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={minSpend}
                                        onChange={(e) => setMinSpend(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="maxDiscount">
                                        Max Discount ({currency}) {discountType === 'fixed' && '(N/A)'}
                                    </Label>
                                    <Input
                                        id="maxDiscount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="No cap"
                                        disabled={discountType === 'fixed'}
                                        value={maxDiscount}
                                        onChange={(e) => setMaxDiscount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="validFrom">Valid From</Label>
                                    <Input
                                        id="validFrom"
                                        type="date"
                                        value={validFrom}
                                        onChange={(e) => setValidFrom(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="validUntil">Valid Until</Label>
                                    <Input
                                        id="validUntil"
                                        type="date"
                                        value={validUntil}
                                        onChange={(e) => setValidUntil(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="usageLimit">Usage Limit (Max Redeems)</Label>
                                <Input
                                    id="usageLimit"
                                    type="number"
                                    min="1"
                                    placeholder="Unlimited if left empty"
                                    value={usageLimit}
                                    onChange={(e) => setUsageLimit(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Notes / Description</Label>
                                <Input
                                    id="description"
                                    placeholder="Optional description of promotional terms"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <DialogFooter className="pt-3">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Coupon'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
