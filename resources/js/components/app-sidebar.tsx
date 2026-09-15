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
        <Sidebar collapsible="icon" variant="inset" className="print:hidden">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{hotel?.name || 'Hotel Management'}</span>
                                    <span className="truncate text-xs text-muted-foreground">{hotel?.code || 'Main Branch'}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={coreNavItems} label="Front Desk & Rooms" />
                <NavMain items={operationsNavItems} label="Operations & Finance" />
                <NavMain items={settingsNavItems} label="Hotel Configuration" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
