import { router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationBell } from '@/components/notification-bell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import type { Auth, BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<{ auth?: Auth }>().props;
    const [searchQuery, setSearchQuery] = useState('');
    const getInitials = useInitials();

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.get('/front-desk', { search: searchQuery.trim() });
        }
    };

    return (
        <header className="print:hidden bg-white border-b border-border/50 flex h-14 shrink-0 items-center justify-between gap-4 px-4 md:px-5 transition-[width,height] ease-linear">
            {/* Left: Sidebar trigger + Global Search */}
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 text-slate-500 hover:text-slate-700" />

                <div className="relative hidden md:flex items-center">
                    <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                        type="search"
                        placeholder="Search anything..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className="w-60 lg:w-80 pl-9 h-9 rounded-full bg-slate-50 border-slate-200 text-sm text-slate-600 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-blue-400"
                    />
                </div>

                {breadcrumbs.length > 0 && (
                    <div className="hidden lg:flex items-center ml-1 border-l pl-4 border-border/50">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                )}
            </div>

            {/* Right: Notifications & User Avatar Dropdown */}
            <div className="flex items-center gap-3">
                <NotificationBell />

                {auth?.user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                                aria-label="User profile menu"
                            >
                                <Avatar className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-slate-200">
                                    <AvatarImage src={auth.user.avatar || auth.user.profile_image || undefined} alt={auth.user.name} />
                                    <AvatarFallback className="text-xs bg-blue-600 text-white font-semibold">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 rounded-xl shadow-lg" align="end">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
