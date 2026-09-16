import { useState, useRef, useEffect } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SystemNotification } from '@/types';

export function NotificationBell() {
    const { notifications } = usePage<{
        notifications?: {
            unread_count: number;
            recent: SystemNotification[];
        };
    }>().props;

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications?.unread_count ?? 0;
    const items = notifications?.recent ?? [];

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = () => {
        router.post('/notifications/read-all', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const markSingleRead = (id: number) => {
        router.post(`/notifications/${id}/read`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'danger':
                return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
            case 'success':
                return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
            default:
                return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative h-9 w-9 rounded-full text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-background">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border bg-popover shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/40">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-muted-foreground hover:text-primary transition flex items-center gap-1"
                            >
                                <Check className="h-3 w-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[360px] overflow-y-auto divide-y divide-border/50">
                        {items.length === 0 ? (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                No new notifications
                            </div>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`p-3.5 transition hover:bg-muted/50 flex gap-3 text-left ${
                                        !item.is_read ? 'bg-primary/5' : ''
                                    }`}
                                >
                                    <div className="mt-0.5">{getIcon(item.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                            <p className="text-xs font-semibold text-foreground truncate">
                                                {item.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground shrink-0">
                                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {item.message}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            {item.link && (
                                                <Link
                                                    href={item.link}
                                                    onClick={() => {
                                                        if (!item.is_read) markSingleRead(item.id);
                                                        setIsOpen(false);
                                                    }}
                                                    className="text-[11px] text-primary font-medium hover:underline"
                                                >
                                                    View Details →
                                                </Link>
                                            )}
                                            {!item.is_read && (
                                                <button
                                                    onClick={() => markSingleRead(item.id)}
                                                    className="text-[11px] text-muted-foreground hover:text-foreground ml-auto"
                                                >
                                                    Dismiss
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
