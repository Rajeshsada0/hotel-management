import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ShieldAlert, Search, Filter, Clock, User, Globe, Eye } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PageHero } from '@/components/page-hero';
import { StatCard } from '@/components/stat-card';
import type { AuditLog, BreadcrumbItem } from '@/types';

interface Props {
    logs: {
        data: AuditLog[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
    modules: Record<string, string>;
    filters: {
        module?: string;
        action?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Audit Logs', href: '/audit-logs' },
];

export default function AuditLogsIndex({ logs, modules, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedModule, setSelectedModule] = useState(filters.module ?? '');
    const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/audit-logs', {
            search: search || undefined,
            module: selectedModule || undefined,
        }, { preserveState: true });
    };

    const getModuleColor = (mod: string) => {
        switch (mod) {
            case 'front_desk':
                return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
            case 'reservations':
                return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300';
            case 'billing':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
            case 'inventory':
                return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
            case 'housekeeping':
                return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300';
            case 'restaurant':
                return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs & Activity Stream" />

            <div className="flex flex-col gap-6 p-6">
                {/* Hero Banner */}
                <PageHero
                    badge="Security & Compliance"
                    badgeIcon={ShieldAlert}
                    title="System Audit Logs & Activity Stream"
                    description="Complete chronological audit trail of operations, front desk check-ins, payment transactions, stock changes, and operator events."
                />

                {/* KPI Stat Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        title="Total Events"
                        value={logs.total}
                        subtitle="Audited system actions"
                        icon={Clock}
                        color="blue"
                    />
                    <StatCard
                        title="Front Desk Activity"
                        value={logs.data.filter((l) => l.module === 'front_desk' || l.module === 'reservations').length}
                        subtitle="Check-ins & bookings"
                        icon={ShieldAlert}
                        color="emerald"
                    />
                    <StatCard
                        title="Financial Events"
                        value={logs.data.filter((l) => l.module === 'billing').length}
                        subtitle="Payments & folios"
                        icon={Globe}
                        color="purple"
                    />
                    <StatCard
                        title="System Operators"
                        value={new Set(logs.data.map((l) => l.user_name)).size}
                        subtitle="Unique active users"
                        icon={User}
                        color="amber"
                    />
                </div>

                {/* Filters */}
                <Card className="rounded-xl border border-border/60 shadow-sm bg-card">
                    <CardContent className="pt-5 pb-5">
                        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by description, operator name, or IP address..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 bg-muted/30"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <select
                                    value={selectedModule}
                                    onChange={(e) => setSelectedModule(e.target.value)}
                                    className="h-9 rounded-md border border-input bg-muted/30 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="">All Modules</option>
                                    {Object.entries(modules).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium">Filter Logs</Button>
                                {(filters.search || filters.module) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setSearch('');
                                            setSelectedModule('');
                                            router.get('/audit-logs');
                                        }}
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Audit Log Table */}
                <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b text-xs font-semibold uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3.5">Timestamp</th>
                                    <th className="px-6 py-3.5">Module & Action</th>
                                    <th className="px-6 py-3.5">Description</th>
                                    <th className="px-6 py-3.5">Operator</th>
                                    <th className="px-6 py-3.5">IP Address</th>
                                    <th className="px-6 py-3.5 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Clock className="h-8 w-8 text-muted-foreground/50" />
                                                <p className="font-medium">No activity records found</p>
                                                <p className="text-xs">Operational events will appear here as transactions and changes occur.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted/30 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${getModuleColor(log.module)}`}>
                                                        {modules[log.module] ?? log.module}
                                                    </span>
                                                    <span className="text-xs font-semibold font-mono text-foreground">
                                                        {log.action}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-foreground font-medium max-w-md">
                                                {log.description ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>{log.user_name ?? 'System'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                                                <div className="flex items-center gap-1">
                                                    <Globe className="h-3 w-3 text-muted-foreground" />
                                                    <span>{log.ip_address ?? '127.0.0.1'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setInspectLog(log)}
                                                    className="gap-1 h-8 text-xs"
                                                >
                                                    <Eye className="h-3.5 w-3.5" /> Inspect
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inspect Modal */}
                <Dialog open={!!inspectLog} onOpenChange={(open) => !open && setInspectLog(null)}>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-primary" />
                                Audit Event Details
                            </DialogTitle>
                            <DialogDescription>
                                Detailed breakdown of recorded event payload and system metadata.
                            </DialogDescription>
                        </DialogHeader>

                        {inspectLog && (
                            <div className="space-y-4 py-2 text-xs">
                                <div className="grid grid-cols-2 gap-2 bg-muted/40 p-3 rounded-lg">
                                    <div><span className="text-muted-foreground font-medium">Action:</span> <span className="font-semibold">{inspectLog.action}</span></div>
                                    <div><span className="text-muted-foreground font-medium">Module:</span> <span className="font-semibold">{inspectLog.module}</span></div>
                                    <div><span className="text-muted-foreground font-medium">Operator:</span> <span className="font-semibold">{inspectLog.user_name ?? 'System'}</span></div>
                                    <div><span className="text-muted-foreground font-medium">Record ID:</span> <span className="font-semibold">{inspectLog.record_id ?? 'N/A'}</span></div>
                                    <div><span className="text-muted-foreground font-medium">IP:</span> <span className="font-semibold">{inspectLog.ip_address ?? '-'}</span></div>
                                    <div><span className="text-muted-foreground font-medium">Date:</span> <span className="font-semibold">{new Date(inspectLog.created_at).toLocaleString()}</span></div>
                                </div>

                                <div>
                                    <span className="text-muted-foreground font-medium">Description:</span>
                                    <p className="font-medium text-foreground mt-0.5">{inspectLog.description}</p>
                                </div>

                                {inspectLog.new_values && (
                                    <div>
                                        <span className="text-muted-foreground font-medium">Event Payload / Changed Values:</span>
                                        <pre className="mt-1 bg-muted p-3 rounded-lg overflow-x-auto text-[11px] font-mono text-foreground max-h-48">
                                            {JSON.stringify(inspectLog.new_values, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {inspectLog.old_values && (
                                    <div>
                                        <span className="text-muted-foreground font-medium">Previous State:</span>
                                        <pre className="mt-1 bg-muted p-3 rounded-lg overflow-x-auto text-[11px] font-mono text-foreground max-h-48">
                                            {JSON.stringify(inspectLog.old_values, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
