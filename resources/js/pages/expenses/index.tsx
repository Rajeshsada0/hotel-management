import { Head, Link, useForm } from '@inertiajs/react';
import {
    Wallet,
    DollarSign,
    TrendingDown,
    Plus,
    Users,
    Receipt,
    Building,
    Calendar,
    Briefcase,
    Zap,
    Droplet,
    Wifi,
    Wrench,
    Utensils,
    Sparkles,
    CreditCard,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHero } from '@/components/page-hero';
import { StatCard } from '@/components/stat-card';
import AppLayout from '@/layouts/app-layout';
import type { Expense, Hotel, Staff } from '@/types';

type ExpenseProps = {
    hotel?: Hotel | null;
    expenses: {
        data: Expense[];
        links: any[];
        total: number;
    };
    staffList: Staff[];
    summary: {
        month: string;
        total_amount: number;
        by_category: Record<string, { total: number; count: number }>;
    };
};

export default function ExpensesIndex({
    hotel,
    expenses,
    staffList,
    summary,
}: ExpenseProps) {
    const [activeTab, setActiveTab] = useState<'expenses' | 'staff'>('expenses');
    const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

    // New Expense Form
    const {
        data: expenseData,
        setData: setExpenseData,
        post: postExpense,
        reset: resetExpense,
        processing: expenseProcessing,
    } = useForm({
        category: 'electricity',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'bank_transfer',
        description: '',
        staff_id: '',
        notes: '',
    });

    // New Staff Form
    const {
        data: staffData,
        setData: setStaffData,
        post: postStaff,
        reset: resetStaff,
        processing: staffProcessing,
    } = useForm({
        name: '',
        department: 'reception',
        position: '',
        phone: '',
        email: '',
        address: '',
        joining_date: new Date().toISOString().split('T')[0],
        salary: '',
    });

    const currency = hotel?.currency_symbol || '$';

    const handleCreateExpense = (e: React.FormEvent) => {
        e.preventDefault();
        postExpense('/expenses', {
            onSuccess: () => {
                setIsCreateExpenseOpen(false);
                resetExpense();
            },
        });
    };

    const handleCreateStaff = (e: React.FormEvent) => {
        e.preventDefault();
        postStaff('/expenses/staff', {
            onSuccess: () => {
                setIsAddStaffOpen(false);
                resetStaff();
            },
        });
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'electricity':
                return <Zap className="h-4 w-4 text-amber-500" />;
            case 'water':
                return <Droplet className="h-4 w-4 text-blue-500" />;
            case 'internet':
                return <Wifi className="h-4 w-4 text-indigo-500" />;
            case 'maintenance':
                return <Wrench className="h-4 w-4 text-orange-500" />;
            case 'food_purchase':
                return <Utensils className="h-4 w-4 text-emerald-500" />;
            case 'cleaning_supplies':
                return <Sparkles className="h-4 w-4 text-teal-500" />;
            case 'salary':
                return <Users className="h-4 w-4 text-purple-500" />;
            default:
                return <Receipt className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Expenses & Staff', href: '/expenses' }]}>
            <Head title="Expense & Staff Management" />

            <div className="flex flex-col gap-6 p-6">
                {/* Hero Banner */}
                <PageHero
                    badge="Human Resources & Finance"
                    badgeIcon={Wallet}
                    title="Expense & Staff Management"
                    description="Track hotel operational expenditures, facility utilities, employee payroll, and staff directory."
                >
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/95 text-slate-800 hover:bg-white hover:text-slate-900 border-0 shadow-sm font-medium"
                        onClick={() => setIsAddStaffOpen(true)}
                    >
                        <Users className="h-4 w-4 mr-1.5 text-slate-700" /> Add Staff Member
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium"
                        onClick={() => setIsCreateExpenseOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-1.5" /> Log New Expense
                    </Button>
                </PageHero>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        title={`${summary.month} Expenses`}
                        value={`${currency}${summary.total_amount.toFixed(2)}`}
                        subtitle="Operational expenditure"
                        icon={TrendingDown}
                        color="rose"
                    />
                    <StatCard
                        title="Staff Headcount"
                        value={staffList.length}
                        subtitle="Active employees"
                        icon={Users}
                        color="blue"
                    />
                    <StatCard
                        title="Monthly Payroll"
                        value={`${currency}${staffList.reduce((sum, s) => sum + Number(s.salary), 0).toFixed(2)}`}
                        subtitle="Salary commitments"
                        icon={Briefcase}
                        color="purple"
                    />
                    <StatCard
                        title="Expense Entries"
                        value={expenses.total}
                        subtitle="Audited expense records"
                        icon={Receipt}
                        color="emerald"
                    />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border space-x-4">
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'expenses'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Receipt className="h-4 w-4" /> Operational Expenses ({expenses.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'staff'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Users className="h-4 w-4" /> Staff Directory ({staffList.length})
                    </button>
                </div>

                {/* Tab 1: Operational Expenses */}
                {activeTab === 'expenses' && (
                    <div className="space-y-6">
                        {/* Category Cards breakdown */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {Object.entries(summary.by_category).map(([cat, info]) => (
                                <Card key={cat} className="p-3 shadow-none border bg-muted/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getCategoryIcon(cat)}
                                        <span className="text-xs font-semibold uppercase text-muted-foreground truncate">
                                            {cat.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="text-base font-bold text-foreground">
                                        {currency}{Number(info.total).toFixed(2)}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{info.count} bills</span>
                                </Card>
                            ))}
                        </div>

                        {/* Expenses Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Recent Expense Records</CardTitle>
                                <CardDescription>Detailed audit trail of operational payments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b text-xs font-semibold uppercase text-muted-foreground bg-muted/40">
                                            <tr>
                                                <th className="p-3">Expense #</th>
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Category</th>
                                                <th className="p-3">Description</th>
                                                <th className="p-3">Payment Method</th>
                                                <th className="p-3">Amount</th>
                                                <th className="p-3">Logged By</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {expenses.data.map((exp) => (
                                                <tr key={exp.id} className="hover:bg-muted/20">
                                                    <td className="p-3 font-mono font-semibold text-foreground">
                                                        #{exp.expense_number}
                                                    </td>
                                                    <td className="p-3 text-xs text-muted-foreground">
                                                        {exp.expense_date}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-1.5">
                                                            {getCategoryIcon(exp.category)}
                                                            <span className="capitalize text-xs font-medium">
                                                                {exp.category.replace(/_/g, ' ')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-muted-foreground text-xs max-w-[250px] truncate">
                                                        {exp.description || '—'}
                                                        {exp.staff && (
                                                            <span className="block text-primary">Staff: {exp.staff.name}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="outline" className="capitalize text-xs">
                                                            {exp.payment_method.replace(/_/g, ' ')}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 font-bold text-rose-600 dark:text-rose-400">
                                                        {currency}{Number(exp.amount).toFixed(2)}
                                                    </td>
                                                    <td className="p-3 text-xs text-muted-foreground">
                                                        {exp.creator?.name || 'Admin'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {expenses.data.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                                                        No expenses recorded yet.
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

                {/* Tab 2: Staff Directory */}
                {activeTab === 'staff' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Hotel Employees Directory</CardTitle>
                                <CardDescription>Staff members across front desk, housekeeping, restaurant, and admin</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setIsAddStaffOpen(true)}>
                                <Plus className="h-4 w-4 mr-1" /> Add Staff Member
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b text-xs font-semibold uppercase text-muted-foreground bg-muted/40">
                                        <tr>
                                            <th className="p-3">Emp ID</th>
                                            <th className="p-3">Staff Name</th>
                                            <th className="p-3">Department</th>
                                            <th className="p-3">Position</th>
                                            <th className="p-3">Contact</th>
                                            <th className="p-3">Joining Date</th>
                                            <th className="p-3">Salary</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {staffList.map((st) => (
                                            <tr key={st.id} className="hover:bg-muted/20">
                                                <td className="p-3 font-mono text-xs font-semibold text-foreground">
                                                    {st.employee_id}
                                                </td>
                                                <td className="p-3 font-medium text-foreground">
                                                    {st.name}
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant="outline" className="capitalize text-xs">
                                                        {st.department}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-muted-foreground text-xs">
                                                    {st.position}
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground">
                                                    <div>{st.phone || '—'}</div>
                                                    <div>{st.email || ''}</div>
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground">
                                                    {st.joining_date}
                                                </td>
                                                <td className="p-3 font-semibold text-foreground">
                                                    {currency}{Number(st.salary).toFixed(2)}
                                                </td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={`capitalize text-xs ${
                                                            st.status === 'active' ? 'border-emerald-500 text-emerald-600' : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {st.status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        {staffList.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="p-6 text-center text-muted-foreground">
                                                    No staff members found.
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

            {/* Modal: Log Expense */}
            <Dialog open={isCreateExpenseOpen} onOpenChange={setIsCreateExpenseOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleCreateExpense}>
                        <DialogHeader>
                            <DialogTitle>Log Operational Expense</DialogTitle>
                            <DialogDescription>Record a utility, purchase, repair, or salary expense</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={expenseData.category}
                                        onValueChange={(val) => setExpenseData('category', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="electricity">Electricity / Power</SelectItem>
                                            <SelectItem value="water">Water & Sewage</SelectItem>
                                            <SelectItem value="internet">Internet & Wi-Fi</SelectItem>
                                            <SelectItem value="maintenance">Maintenance & Repairs</SelectItem>
                                            <SelectItem value="food_purchase">Food & Produce</SelectItem>
                                            <SelectItem value="cleaning_supplies">Cleaning Supplies</SelectItem>
                                            <SelectItem value="salary">Staff Salary</SelectItem>
                                            <SelectItem value="marketing">Marketing & Ads</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Amount ({currency})</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={expenseData.amount}
                                        onChange={(e) => setExpenseData('amount', e.target.value)}
                                        placeholder="250.00"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Expense Date</Label>
                                    <Input
                                        type="date"
                                        required
                                        value={expenseData.expense_date}
                                        onChange={(e) => setExpenseData('expense_date', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Payment Method</Label>
                                    <Select
                                        value={expenseData.payment_method}
                                        onValueChange={(val) => setExpenseData('payment_method', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="card">Credit / Debit Card</SelectItem>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="cheque">Cheque</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={expenseData.description}
                                    onChange={(e) => setExpenseData('description', e.target.value)}
                                    placeholder="e.g. Monthly Wi-Fi optical fiber bill"
                                />
                            </div>

                            {expenseData.category === 'salary' && (
                                <div className="space-y-2">
                                    <Label>Staff Member</Label>
                                    <Select
                                        value={expenseData.staff_id}
                                        onValueChange={(val) => setExpenseData('staff_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Staff" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staffList.map((s) => (
                                                <SelectItem key={s.id} value={String(s.id)}>
                                                    {s.name} ({s.position} - {s.department})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateExpenseOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={expenseProcessing}>
                                Record Expense
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Add Staff */}
            <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleCreateStaff}>
                        <DialogHeader>
                            <DialogTitle>Add Staff Member</DialogTitle>
                            <DialogDescription>Register an employee to the hotel team</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        required
                                        value={staffData.name}
                                        onChange={(e) => setStaffData('name', e.target.value)}
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Select
                                        value={staffData.department}
                                        onValueChange={(val) => setStaffData('department', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="reception">Reception / Front Desk</SelectItem>
                                            <SelectItem value="housekeeping">Housekeeping</SelectItem>
                                            <SelectItem value="restaurant">Restaurant / POS</SelectItem>
                                            <SelectItem value="kitchen">Kitchen / Culinary</SelectItem>
                                            <SelectItem value="accounts">Accounts & Finance</SelectItem>
                                            <SelectItem value="security">Security</SelectItem>
                                            <SelectItem value="management">Management</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Position Title</Label>
                                    <Input
                                        required
                                        value={staffData.position}
                                        onChange={(e) => setStaffData('position', e.target.value)}
                                        placeholder="e.g. Night Auditor"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Monthly Salary ({currency})</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={staffData.salary}
                                        onChange={(e) => setStaffData('salary', e.target.value)}
                                        placeholder="3000.00"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={staffData.phone}
                                        onChange={(e) => setStaffData('phone', e.target.value)}
                                        placeholder="+1 555-0101"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={staffData.email}
                                        onChange={(e) => setStaffData('email', e.target.value)}
                                        placeholder="staff@hotel.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Joining Date</Label>
                                <Input
                                    type="date"
                                    required
                                    value={staffData.joining_date}
                                    onChange={(e) => setStaffData('joining_date', e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddStaffOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={staffProcessing}>
                                Add Employee
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
