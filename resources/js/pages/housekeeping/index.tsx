import { Head, useForm, router } from '@inertiajs/react';
import {
    Sparkles,
    Brush,
    CheckCircle2,
    AlertTriangle,
    Plus,
    Wrench,
    Package,
    Clock,
    UserCheck,
    Check,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHero } from '@/components/page-hero';
import { StatCard } from '@/components/stat-card';
import AppLayout from '@/layouts/app-layout';
import type {
    Hotel,
    HousekeepingTask,
    LostAndFoundItem,
    MaintenanceRequest,
    Room,
    User,
} from '@/types';

type HousekeepingProps = {
    hotel?: Hotel | null;
    rooms: Room[];
    tasks: HousekeepingTask[];
    maintenanceRequests: MaintenanceRequest[];
    lostAndFoundItems: LostAndFoundItem[];
    housekeepers: User[];
    stats: {
        total_rooms: number;
        clean: number;
        dirty: number;
        cleaning: number;
        maintenance: number;
    };
};

export default function HousekeepingIndex({
    hotel,
    rooms,
    tasks,
    maintenanceRequests,
    lostAndFoundItems,
    housekeepers,
    stats,
}: HousekeepingProps) {
    const [tab, setTab] = useState<'board' | 'maintenance' | 'lost_found'>('board');
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
    const [isLostFoundOpen, setIsLostFoundOpen] = useState(false);

    // Assign Cleaning Form
    const { data: assignData, setData: setAssignData, post: postAssign, reset: resetAssign, processing: assignProcessing } = useForm({
        room_id: rooms[0]?.id ? String(rooms[0].id) : '',
        assigned_to: housekeepers[0]?.id ? String(housekeepers[0].id) : '',
        priority: 'normal',
        task_type: 'daily_cleaning',
        notes: '',
    });

    // Maintenance Form
    const { data: maintData, setData: setMaintData, post: postMaint, reset: resetMaint, processing: maintProcessing } = useForm({
        room_id: '',
        title: '',
        description: '',
        priority: 'medium',
        assigned_to: '',
        cost: '0.00',
        notes: '',
    });

    // Lost & Found Form
    const { data: lfData, setData: setLfData, post: postLf, reset: resetLf, processing: lfProcessing } = useForm({
        room_id: '',
        item_name: '',
        category: 'electronics',
        found_location: '',
        found_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleAssignSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postAssign('/housekeeping/assign', {
            onSuccess: () => {
                setIsAssignOpen(false);
                resetAssign();
            },
        });
    };

    const handleMaintSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postMaint('/housekeeping/maintenance', {
            onSuccess: () => {
                setIsMaintenanceOpen(false);
                resetMaint();
            },
        });
    };

    const handleLfSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postLf('/housekeeping/lost-and-found', {
            onSuccess: () => {
                setIsLostFoundOpen(false);
                resetLf();
            },
        });
    };

    const handleTaskAction = (task: HousekeepingTask, action: 'start' | 'complete') => {
        router.patch(`/housekeeping/tasks/${task.id}/status`, { action }, { preserveScroll: true });
    };

    const handleResolveMaintenance = (req: MaintenanceRequest) => {
        if (confirm(`Mark maintenance issue "${req.title}" as resolved and release room?`)) {
            router.patch(`/housekeeping/maintenance/${req.id}/resolve`, {}, { preserveScroll: true });
        }
    };

    const handleClaimItem = (item: LostAndFoundItem) => {
        const claimedBy = prompt('Enter guest name who claimed this item:');
        if (claimedBy) {
            router.patch(
                `/housekeeping/lost-and-found/${item.id}/claim`,
                {
                    claimed_by: claimedBy,
                    claimed_date: new Date().toISOString().split('T')[0],
                },
                { preserveScroll: true }
            );
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Housekeeping', href: '/housekeeping' }]}>
            <Head title="Housekeeping & Maintenance" />

            <div className="flex flex-col gap-6 p-6">
                {/* Hero Banner */}
                <PageHero
                    badge="Housekeeping & Facility"
                    badgeIcon={Sparkles}
                    title="Housekeeping & Maintenance"
                    description="Real-time room cleanliness lifecycle tracking: Dirty → Cleaning → Inspected → Available."
                >
                    <div className="flex items-center gap-2">
                        {/* Assign Cleaner Modal */}
                        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium">
                                    <Brush className="mr-2 h-4 w-4" /> Assign Cleaning
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Assign Housekeeping Task</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAssignSubmit} className="space-y-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="room_id">Select Room</Label>
                                        <Select value={assignData.room_id} onValueChange={(val) => setAssignData('room_id', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select room" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {rooms.map((r) => (
                                                    <SelectItem key={r.id} value={String(r.id)}>
                                                        Room {r.room_number} ({r.status})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="assigned_to">Assign Housekeeper</Label>
                                        <Select value={assignData.assigned_to} onValueChange={(val) => setAssignData('assigned_to', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select staff" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {housekeepers.map((h) => (
                                                    <SelectItem key={h.id} value={String(h.id)}>
                                                        {h.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select value={assignData.priority} onValueChange={(val) => setAssignData('priority', val)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="urgent">Urgent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="task_type">Cleaning Type</Label>
                                            <Select value={assignData.task_type} onValueChange={(val) => setAssignData('task_type', val)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="daily_cleaning">Daily Cleaning</SelectItem>
                                                    <SelectItem value="checkout_cleaning">Checkout Turnover</SelectItem>
                                                    <SelectItem value="deep_cleaning">Deep Cleaning</SelectItem>
                                                    <SelectItem value="touchup">Touch Up</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="notes">Notes / Special Instructions</Label>
                                        <Input
                                            id="notes"
                                            value={assignData.notes}
                                            onChange={(e) => setAssignData('notes', e.target.value)}
                                            placeholder="e.g. Change duvet cover, extra towels"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={assignProcessing}>
                                            Assign Task
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Report Maintenance Modal */}
                        <Dialog open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-white/95 text-slate-800 hover:bg-white hover:text-slate-900 border-0 shadow-sm font-medium">
                                    <Wrench className="mr-2 h-4 w-4 text-slate-700" /> Report Issue
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Report Maintenance Issue</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleMaintSubmit} className="space-y-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="maint_room_id">Room (Optional)</Label>
                                        <Select value={maintData.room_id} onValueChange={(val) => setMaintData('room_id', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select room or leave blank" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">General / Facility Issue</SelectItem>
                                                {rooms.map((r) => (
                                                    <SelectItem key={r.id} value={String(r.id)}>
                                                        Room {r.room_number}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="title">Issue Title</Label>
                                        <Input
                                            id="title"
                                            value={maintData.title}
                                            onChange={(e) => setMaintData('title', e.target.value)}
                                            required
                                            placeholder="e.g. Leaking bathroom faucet"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select value={maintData.priority} onValueChange={(val) => setMaintData('priority', val)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="emergency">Emergency</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            value={maintData.description}
                                            onChange={(e) => setMaintData('description', e.target.value)}
                                            required
                                            placeholder="Details of the malfunction..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setIsMaintenanceOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={maintProcessing}>
                                            Submit Issue
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </PageHero>

                {/* Status Counter Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        title="Clean & Ready"
                        value={stats.clean}
                        subtitle="Available for check-in"
                        icon={CheckCircle2}
                        color="emerald"
                    />
                    <StatCard
                        title="Dirty Rooms"
                        value={stats.dirty}
                        subtitle="Awaiting turnover"
                        icon={AlertTriangle}
                        color="rose"
                    />
                    <StatCard
                        title="Cleaning In-Progress"
                        value={stats.cleaning}
                        subtitle="Turnover underway"
                        icon={Brush}
                        color="purple"
                    />
                    <StatCard
                        title="Maintenance"
                        value={stats.maintenance}
                        subtitle="Tickets / under repair"
                        icon={Wrench}
                        color="amber"
                    />
                </div>

                {/* Tabs */}
                <div className="flex rounded-lg border bg-muted p-1 text-sm w-fit">
                    <button
                        onClick={() => setTab('board')}
                        className={`rounded-md px-3 py-1 font-medium transition-all ${
                            tab === 'board' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                        }`}
                    >
                        Cleaning Board ({tasks.length})
                    </button>
                    <button
                        onClick={() => setTab('maintenance')}
                        className={`rounded-md px-3 py-1 font-medium transition-all ${
                            tab === 'maintenance' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                        }`}
                    >
                        Maintenance Requests ({maintenanceRequests.length})
                    </button>
                    <button
                        onClick={() => setTab('lost_found')}
                        className={`rounded-md px-3 py-1 font-medium transition-all ${
                            tab === 'lost_found' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                        }`}
                    >
                        Lost & Found ({lostAndFoundItems.length})
                    </button>
                </div>

                {/* Tab 1: Cleaning Board (Section 15 Table) */}
                {tab === 'board' && (
                    <div className="overflow-x-auto rounded-lg border bg-card">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                <tr>
                                    <th className="p-3">Room</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Housekeeper</th>
                                    <th className="p-3">Priority</th>
                                    <th className="p-3">Task Type</th>
                                    <th className="p-3">Notes</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                            All rooms are clean and in order. No pending housekeeping tasks!
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-muted/30">
                                            <td className="p-3 font-bold text-base text-foreground">
                                                #{task.room?.room_number}
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">{task.room?.room_type?.name}</td>
                                            <td className="p-3">
                                                <Badge
                                                    variant="outline"
                                                    className={`capitalize font-medium ${
                                                        task.status === 'clean'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                            : task.status === 'cleaning'
                                                            ? 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300'
                                                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                                    }`}
                                                >
                                                    {task.status}
                                                </Badge>
                                            </td>
                                            <td className="p-3 font-medium text-foreground">
                                                {task.housekeeper ? task.housekeeper.name : <span className="text-muted-foreground italic">Unassigned</span>}
                                            </td>
                                            <td className="p-3">
                                                <Badge
                                                    variant="secondary"
                                                    className={`uppercase text-[10px] ${
                                                        task.priority === 'urgent' ? 'bg-rose-100 text-rose-800' : ''
                                                    }`}
                                                >
                                                    {task.priority}
                                                </Badge>
                                            </td>
                                            <td className="p-3 capitalize text-xs text-muted-foreground">
                                                {task.task_type.replace('_', ' ')}
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground max-w-xs line-clamp-1">
                                                {task.notes || '-'}
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    {task.status === 'dirty' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-violet-600 border-violet-200"
                                                            onClick={() => handleTaskAction(task, 'start')}
                                                        >
                                                            <Brush className="mr-1.5 h-3.5 w-3.5" /> Start Cleaning
                                                        </Button>
                                                    )}
                                                    {task.status === 'cleaning' && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            onClick={() => handleTaskAction(task, 'complete')}
                                                        >
                                                            <Check className="mr-1.5 h-3.5 w-3.5" /> Mark Clean
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 2: Maintenance Requests */}
                {tab === 'maintenance' && (
                    <div className="overflow-x-auto rounded-lg border bg-card">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                <tr>
                                    <th className="p-3">Issue Title</th>
                                    <th className="p-3">Room</th>
                                    <th className="p-3">Priority</th>
                                    <th className="p-3">Reported By</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {maintenanceRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            No maintenance issues reported.
                                        </td>
                                    </tr>
                                ) : (
                                    maintenanceRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-muted/30">
                                            <td className="p-3">
                                                <div className="font-semibold text-foreground">{req.title}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">{req.description}</div>
                                            </td>
                                            <td className="p-3 font-bold">
                                                {req.room ? `Room ${req.room.room_number}` : 'Facility / Common'}
                                            </td>
                                            <td className="p-3">
                                                <Badge
                                                    variant="secondary"
                                                    className={`uppercase text-[10px] ${
                                                        req.priority === 'emergency'
                                                            ? 'bg-rose-100 text-rose-800'
                                                            : req.priority === 'high'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : ''
                                                    }`}
                                                >
                                                    {req.priority}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">{req.reported_by_user?.name || '-'}</td>
                                            <td className="p-3">
                                                <Badge
                                                    variant="outline"
                                                    className={`capitalize font-medium ${
                                                        req.status === 'resolved'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                            : 'bg-orange-50 text-orange-700 border-orange-300'
                                                    }`}
                                                >
                                                    {req.status.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">
                                                {new Date(req.created_at || '').toLocaleDateString()}
                                            </td>
                                            <td className="p-3 text-right">
                                                {req.status !== 'resolved' && (
                                                    <Button size="sm" onClick={() => handleResolveMaintenance(req)}>
                                                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Resolve
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 3: Lost & Found */}
                {tab === 'lost_found' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Dialog open={isLostFoundOpen} onOpenChange={setIsLostFoundOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <Package className="mr-2 h-4 w-4" /> Log Found Item
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Log Lost & Found Item</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleLfSubmit} className="space-y-4 pt-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="item_name">Item Description</Label>
                                            <Input
                                                id="item_name"
                                                value={lfData.item_name}
                                                onChange={(e) => setLfData('item_name', e.target.value)}
                                                required
                                                placeholder="e.g. Silver iPad in leather case"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="category">Category</Label>
                                                <Select value={lfData.category} onValueChange={(val) => setLfData('category', val)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="electronics">Electronics</SelectItem>
                                                        <SelectItem value="jewelry">Jewelry / Watches</SelectItem>
                                                        <SelectItem value="clothing">Clothing</SelectItem>
                                                        <SelectItem value="documents">Documents / ID</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="room_id">Found in Room</Label>
                                                <Select value={lfData.room_id} onValueChange={(val) => setLfData('room_id', val)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Room or Area" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {rooms.map((r) => (
                                                            <SelectItem key={r.id} value={String(r.id)}>
                                                                Room {r.room_number}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="found_location">Specific Location</Label>
                                            <Input
                                                id="found_location"
                                                value={lfData.found_location}
                                                onChange={(e) => setLfData('found_location', e.target.value)}
                                                required
                                                placeholder="e.g. Nightstand top drawer"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2">
                                            <Button type="button" variant="outline" onClick={() => setIsLostFoundOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={lfProcessing}>
                                                Log Item
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="overflow-x-auto rounded-lg border bg-card">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                    <tr>
                                        <th className="p-3">Item Description</th>
                                        <th className="p-3">Category</th>
                                        <th className="p-3">Found Location</th>
                                        <th className="p-3">Date Found</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {lostAndFoundItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                No lost & found items recorded.
                                            </td>
                                        </tr>
                                    ) : (
                                        lostAndFoundItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/30">
                                                <td className="p-3 font-semibold text-foreground">{item.item_name}</td>
                                                <td className="p-3 capitalize text-xs text-muted-foreground">{item.category}</td>
                                                <td className="p-3 text-xs">
                                                    {item.found_location} {item.room ? `(Room ${item.room.room_number})` : ''}
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground">{item.found_date}</td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={`capitalize font-medium ${
                                                            item.status === 'claimed'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                                : 'bg-amber-50 text-amber-700 border-amber-300'
                                                        }`}
                                                    >
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-right">
                                                    {item.status === 'stored' && (
                                                        <Button size="sm" variant="outline" onClick={() => handleClaimItem(item)}>
                                                            Claim Item
                                                        </Button>
                                                    )}
                                                    {item.status === 'claimed' && (
                                                        <span className="text-xs text-muted-foreground">Claimed by {item.claimed_by}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
