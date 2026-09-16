import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Building2,
    BedDouble,
    CalendarRange,
    CalendarCheck,
    Users,
    Receipt,
    Sparkles,
    UtensilsCrossed,
    Boxes,
    BarChart3,
    Settings,
    LogIn,
    ShoppingBag,
    Wallet,
    Ticket,
    ShieldAlert,
    Globe,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem, Hotel } from '@/types';

export function AppSidebar() {
    const { hotel } = usePage<{ hotel?: Hotel }>().props;

    const coreNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Room Availability',
            href: '/availability',
            icon: CalendarRange,
        },
        {
            title: 'Reservations',
            href: '/reservations',
            icon: CalendarCheck,
        },
        {
            title: 'Front Desk / Check-in',
            href: '/front-desk',
            icon: LogIn,
        },
        {
            title: 'Guests',
            href: '/guests',
            icon: Users,
        },
        {
            title: 'Rooms & Types',
            href: '/rooms',
            icon: BedDouble,
        },
    ];

    const operationsNavItems: NavItem[] = [
        {
            title: 'Housekeeping & Maint.',
            href: '/housekeeping',
            icon: Sparkles,
        },
        {
            title: 'Hotel Services',
            href: '/services',
            icon: ShoppingBag,
        },
        {
            title: 'Restaurant & POS',
            href: '/restaurant',
            icon: UtensilsCrossed,
        },
        {
            title: 'Inventory',
            href: '/inventory',
            icon: Boxes,
        },
        {
            title: 'Expenses & Staff',
            href: '/expenses',
            icon: Wallet,
        },
        {
            title: 'Invoices & Billing',
            href: '/invoices',
            icon: Receipt,
        },
        {
            title: 'Reports & Analytics',
            href: '/reports',
            icon: BarChart3,
        },
        {
            title: 'Coupons & Promos',
            href: '/coupons',
            icon: Ticket,
        },
    ];

    const settingsNavItems: NavItem[] = [
        {
            title: 'Hotel Profile & Setup',
            href: '/settings/hotel',
            icon: Building2,
        },
        {
            title: 'Audit Logs',
            href: '/audit-logs',
            icon: ShieldAlert,
        },
        {
            title: 'Public Booking Site',
            href: '/book',
            icon: Globe,
        },
        {
            title: 'System Settings',
            href: '/settings/profile',
            icon: Settings,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="print:hidden border-r border-sidebar-border bg-white">
            <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent px-0">
                            <Link href={dashboard()} prefetch className="flex items-center gap-3">
                                <AppLogoIcon className="size-9 text-[#0c1e4b]" />
                                <div className="grid flex-1 text-left">
                                    <span className="truncate text-[13px] font-bold text-slate-900 leading-tight">Laravel</span>
                                    <span className="truncate text-[12px] font-semibold text-slate-700 leading-tight">
                                        {hotel?.name || 'Grand Horizon'}
                                    </span>
                                    <span className="truncate text-[11px] font-medium text-slate-400 leading-tight mt-0.5">
                                        {hotel?.code || 'GH-01'}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-1 py-2">
                <NavMain items={coreNavItems} />
                <NavMain items={operationsNavItems} label="Operations & Finance" />
                <NavMain items={settingsNavItems} label="Hotel Configuration" />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
